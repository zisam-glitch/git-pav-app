# Incident runbook (draft)

**Draft, written 4 Nov 2026 from the code.** The owner must fill in every `TO FILL` before go-live and check
the steps on the real host. It assumes the stack in [`../PRODUCTION-CHECKLIST.md`](../PRODUCTION-CHECKLIST.md),
which doesn't exist yet.

## Who is called

| Role | Person | Contact | When |
|---|---|---|---|
| First responder | TO FILL | TO FILL | Any alert |
| Technical backup | TO FILL | TO FILL | No answer in 15 minutes |
| Practice manager | TO FILL | TO FILL | Patients affected, bookings by phone |
| Data Protection Officer | TO FILL | TO FILL | Any possible personal data breach |
| Clinical lead | TO FILL | TO FILL | Any risk to patient care |

## 1. First 15 minutes

1. Say who is leading and note the time. Keep a written timeline.
2. Check `GET /readyz` on the API. It reports `database` and `redis` separately; `/livez` only says the process is up.
3. Check Sentry for new errors, and the host's status and deploy pages. Did a deploy just happen?
4. Decide how bad it is:
   - **Critical:** a possible data breach, wrong clinical data shown, wrong payments, or the app unusable.
   - **High:** a core journey is broken (booking, payment, video, van) with no workaround.
   - **Low:** anything else.
5. For Critical or High, tell the practice manager so staff can take bookings by phone.

**Keep health data out of incident notes, tickets and chat.** Refer to appointment or request IDs, never patients' details.

## 2. Common failures

| Symptom | Check first | What to do |
|---|---|---|
| `/readyz` says `database: error` | Database host status, connection limit | Restore the connection. If data is damaged, follow the [restore runbook](backup-and-restore-runbook.md) |
| `/readyz` says `redis: error` | Redis host status, credentials | Restore Redis. Rate limits, sign-in codes and locks depend on it |
| Errors started right after a deploy | Deploy log, Sentry release | Roll back (section 3) |
| Payments confirmed in Stripe but not in the app | Stripe webhook delivery log, `STRIPE_WEBHOOK_SECRET` | Fix the webhook, then resend the failed events from Stripe |
| Sign-in codes not arriving | Postmark and Twilio status | Fix the provider. Staff can't sign in to the dashboard without codes |
| Reminders late or missing | API logs for `[BACKGROUND JOBS]` | Restart the API. Reminders stuck in `sending` are retried after a 15-minute lease |
| Video calls fail | Daily status, `DAILY_API_KEY` | Fix the provider. Offer patients a phone call or a new slot |

## 3. Rolling back

- **API:** redeploy the previous release on the host. Migrations are expand-only (`docs/completion/migrations.md`), so
  the previous version should still run on the newer schema. Never roll a migration back by hand. Not yet rehearsed.
- **Dashboard:** promote the previous deployment on the host.
- **Mobile app:** `expo-updates` isn't installed, so the only fix is a new store build. Expect review delays, and if
  needed turn off the affected feature on the server.

## 4. A possible personal data breach

1. Tell the DPO immediately, whatever the time.
2. Stop the leak, and keep logs and evidence.
3. The DPO decides whether to report. UK GDPR gives **72 hours** from becoming aware to notify the ICO when a report is
   required. Telling patients is the DPO's decision too.

## 5. Telling patients and closing

- Approved wording and channel: TO FILL (needs practice and legal review).
- Once fixed, confirm `/readyz` and test one booking with synthetic data.
- Write up within 5 working days: timeline, cause, what will change. Keep it free of patient data.
