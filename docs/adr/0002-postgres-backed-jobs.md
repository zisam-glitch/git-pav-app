# ADR-0002: Background work runs in the API process, using Postgres tables as queues

## Status
Accepted. The lease on claimed reminders (BE-22) is added in the fixes PR of 26 Oct 2026. Job leadership for more than one instance (BE-23) is Proposed and only needed before scaling out.

## Context
The app depends on time-driven work: appointment reminders, slot-hold expiry, van request expiry and deposit release, the retention sweep, Expo push receipt checks and rewards/referral catch-up (`backend/src/lib/background-jobs.ts`). Today these run on `setInterval` inside every API process. Reminder dispatch claims rows with `UPDATE ... WHERE id IN (SELECT ... FOR UPDATE SKIP LOCKED)`, setting `status='sending'`, but nothing moved a stuck `sending` row back, so a crash or deploy between the claim and the final update lost that reminder for good (AUD-05).

## Decision
1. Keep Postgres tables (`scheduled_notifications`, `push_tickets`, van requests) as the job queues and keep the workers in the API process. No separate broker.
2. Every claim gets a lease: claimed rows record `claimed_at`, and a claim older than 15 minutes (`NOTIFICATION_CLAIM_LEASE_MS`) goes back to `pending` before the next claim. Delivery is at-least-once; a rare duplicate reminder is preferable to a missed one.
3. Run exactly one always-on API instance in v1 (ADR-0003). Each job run takes a row in `job_leases` so only one instance runs it at a time (BE-23). Updated 5 Nov 2026: this replaces `pg_try_advisory_xact_lock`, which kept a connection in a transaction for the whole job and could starve a small pool.

## Alternatives considered
- **Redis queue (BullMQ)**: good tooling and retries, but Redis becomes a source of truth for clinical reminders and needs persistence guarantees from Upstash; another moving part to monitor.
- **Managed queue (SQS, Cloud Tasks)**: durable and scalable, but a new processor (DPA), new credentials and a new failure boundary for a load of a few hundred jobs a day.
- **Separate worker service on Render**: isolates jobs from web traffic, but doubles instances and cost; reconsider if jobs ever slow down requests.
- **Platform cron (Render cron jobs)**: fine for the daily retention sweep, too coarse for minute-level reminder dispatch.

## Consequences
- Positive: jobs and the data they act on commit in one transaction; one system to back up and restore; tested with the existing suites.
- Negative: jobs only run while the web process is up, so the API must be always-on (no free tier in production); a heavy job competes with requests for the same connection pool.
- Neutral: alert on job lag (oldest `pending` row past due) as part of OPS-04.

## References
- PostgreSQL row locking, https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE
- `docs/completion/07-architecture-audit.md` AUD-05, AUD-13
