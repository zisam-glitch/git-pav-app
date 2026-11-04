# Pav Dental: production-readiness checklist and release gates

Rewritten on 26 Oct 2026 from the audit in [`../completion/07-architecture-audit.md`](../completion/07-architecture-audit.md). The previous version listed environment variables that don't exist, promised an "EAS Update rollback" the app can't do, and marked items passed without evidence; it is replaced, not amended.

**Scope.** The mobile app (`pavdental/`), the API (`backend/`) and the staff dashboard screens for app data (`admin-dashboard/`). The website is de-scoped except for the legal pages the app links to.

**Status values.** **Verified** (evidence linked, re-checked on the date given) · **Failed** (checked and not met) · **Not tested** · **Blocked** (waiting on something named) · **N/A**.

A passing build is not readiness. Every row needs its evidence before the gate it belongs to can open.

---

## 1. Release gates

Release to real patients needs **every gate open**. A gate can only be waived by the owner (hisham) in writing, recorded in [`../completion/04-decisions.md`](../completion/04-decisions.md) with the risk accepted, who accepted it and an expiry date. Gates G1, G2 and G7 cannot be waived for a Critical security issue, an unresolved data-loss risk or a broken essential journey.

| Gate | Opens when | Status (26 Oct) |
|---|---|---|
| **G1 Code health** | CI green on the release commit: typecheck, lint, jest, e2e, migration drift, dependency gate, CodeQL, expo-doctor | Verified locally on `aa0133b` (except expo-doctor and CodeQL, CI-only); re-check on the release commit |
| **G2 No open Critical/High security findings** | Pen test done (QA-08), its Critical/High fixed and retested; no unreviewed high/critical advisories | Blocked: pen test not booked |
| **G3 Essential journeys work on real devices** | Section 2 rows Verified on an EAS build, iOS and Android | Not tested |
| **G4 Data safety** | Production PITR on; restore drill done within the last 90 days and within RTO; bucket versioning on | Blocked: no production stack (OPS-01) |
| **G5 Operable** | Errors from API, app and dashboard reach Sentry with readable stacks; uptime alert on `/readyz` reaches a person; job-lag alert; incident runbook | Failed: Sentry optional, no source maps, no uptime check |
| **G6 Safe release path** | Branch protection; Render deploys only after CI; pre-deploy migrations; rollback rehearsed once | Failed: Render deploys every push; manual migrations |
| **G7 Legal and clinical** | Privacy notice and terms reviewed and published; DPAs accepted; DPIA signed; ICO fee paid; CQC scope confirmed; clinical sign-off of triage, prescribing and patient-facing clinical wording; D-18 advice | Blocked: legal and clinical review (LG-01..08) |
| **G8 Production soak** | Production stack running 7 days with synthetic data; reminders, hold expiry and push receipts observed working overnight; load test met targets | Blocked: G4 |
| **G9 Store approval** | Apple and Google listings, privacy labels, Data safety form and reviewer account complete; builds approved | Blocked: C-01, C-02 (owner provides at production time) |

---

## 2. Core user journeys

| # | Journey | Status | Evidence | Next action |
|---|---|---|---|---|
| J1 | Sign up (16+), verify email, sign in, biometric unlock | Not tested on device | API: `auth-integration.test.ts`, `session-security.test.ts` pass | Maestro flow (QA-02) on an EAS preview build |
| J2 | Book clinic appointment, pay deposit (Stripe test card, Apple Pay, Google Pay), get confirmation and reminder | Not tested on device | API: `booking-confirm.test.ts`, `booking-races.test.ts`, e2e flows pass | QA-02; reminders observed in G8 |
| J3 | Cancel or reschedule with the right refund | Not tested on device | `appointment-cancel.test.ts`, `late-deposit.test.ts` | QA-02 |
| J4 | Van request: coverage, deposit, operator accept, live ETA, completion | Not tested on device | `van-*.test.ts`, e2e | Device run with background location (D-21) |
| J5 | Video consult: intake photos, room, call opens in browser | Not tested on device | `video-*.test.ts` | Device run (camera permission, Daily link) |
| J6 | Records: treatment plans, prescriptions PDF, documents, messages | Not tested on device | `prescription-pdf.test.ts`, `messaging-routing.test.ts` | Device run; screenshot blocking on records |
| J7 | Clinician day: schedule, notes, odontogram, treatment plan, prescription | Not tested on device | `clinician-*.test.ts` | Device run with a clinician account (MFA) |
| J8 | Operator shift incl. offline notes and sync | Not tested on device | app offline queue tests in `test:all` | Device run in airplane mode |
| J9 | Staff: rota, services, clinics, vans, dentist profiles, inbox, erasure queue in the dashboard | Not tested end to end | dashboard tests (29) | Staff walkthrough on staging |

## 3. Authentication, authorisation and account lifecycle

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| Passwords hashed with argon2; login rate limited | Verified 26 Oct | `rate-limits.test.ts`, `auth-integration.test.ts` | — |
| Tokens: pinned algorithm, issuer/audience, 15 min access, refresh rotation | Verified 26 Oct | `lib/jwt.ts`, `session-security.test.ts` | — |
| MFA for clinicians, admins and operators | Verified 26 Oct | `staff-mfa.test.ts` | — |
| Patients can only reach their own and their dependants' records; clinicians only with a care relationship | Verified 26 Oct (API) | `clinician-access.test.ts`, `dependants.test.ts`, `health-data-protection.test.ts` | Pen test (G2) |
| In-app account deletion (Apple 5.1.1(v)) and data access request | Verified (API) / Not tested (device) | `erasure.test.ts`, `sar-export.test.ts` | MF-08 on device |
| Password reset and email verification deep links open the app | Not tested | — | MF-06 after domains (RB-05) |
| Seeded demo password rotated; real staff accounts replace `@pavdental.com` seeds | Blocked | `cs48/rotate-demo-password.md` | DB-07, OPS-06 |

## 4. Data integrity, migrations, backup and recovery

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| Schema and migrations agree | Verified 26 Oct | CI drift check run locally, exit 0 | — |
| Migrations are expand-only per release | Verified (process) | `docs/completion/migrations.md` | Enforce in review |
| Migrations run automatically before new code | Failed | Manual from a laptop | OPS-10 |
| No double booking or double charge under races | Verified 26 Oct | `booking-races.test.ts`, `van-races.test.ts`, `payment-integrity.test.ts` | — |
| Reminders survive a restart mid-dispatch | Verified 26 Oct (with fix) | `reminders-and-push.test.ts` lease cases | — |
| Point-in-time recovery on production DB | Blocked | — | OPS-01 |
| Restore drill (timed, audit chain verified after) | Not tested | runbook rewritten for Supabase PITR in PR #114; drill waits on production stack (OPS-01) | OPS-05 |
| Bucket encryption and versioning | Not tested | — | OPS-01 |
| Retention enforced after legal sign-off | Blocked | `RETENTION_ENFORCE=false` | BE-20 after LG-07 |

## 5. Security testing and dependencies

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| No unreviewed high/critical advisories | Verified 26 Oct | audit gate: backend 2 allow-listed, app 2 allow-listed, dashboard 0 | zod 4 (BE-12) |
| Static analysis | Verified in CI config | `.github/workflows/codeql.yml` | Check results on the release commit |
| Secrets not in git | Verified (spot check) | `.gitignore` covers `.env*`, `google-service-account.json` | Enable GitHub secret scanning (owner) |
| Supported runtime | Verified 26 Oct (with fix) | Node 22 in Dockerfile and CI (ADR-0004) | Node 24 by Apr 2027 (OPS-09) |
| External penetration test (OWASP API Top 10, MASVS-L1) | Not tested | scope in `docs/security/penetration-test-scope.md` | QA-08 |

## 6. Tests

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| Backend unit/integration | Verified 26 Oct | 63 suites, 485 tests pass | — |
| Backend end-to-end | Verified 26 Oct | 34/34. Background jobs use leases since 5 Nov, with a test on a one-connection pool (`job-concurrency.test.ts`) | — |
| App typecheck, lint, content and routing tests | Verified 26 Oct | `npm run test:all` | — |
| Dashboard typecheck, lint budget, tests | Verified 26 Oct | 29 tests pass | — |
| Device end-to-end (Maestro) | Not tested | — | QA-02 |
| Load test (targets in ADR-0003) | Not tested | — | BE-19 |

## 7. Performance, accessibility and responsive layout

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| p95 < 500 ms reads, < 1 s booking confirm at 50 rps | Not tested | — | BE-19 |
| Screens usable at 320 pt and with large text | Not tested since the 26 Oct changes | screenshots in project files (older) | UX-01 |
| VoiceOver and TalkBack pass of core journeys | Not tested | `docs/completion/screen-reader-checklist.md` | QA-09 |

## 8. Monitoring, logging and alerting

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| Logs contain no personal or health data | Verified 26 Oct (API) | `log-hygiene.test.ts`, `error-tracking.test.ts` | — |
| API errors in Sentry | Verified (code side) | `config-env.test.ts` asserts `SENTRY_DSN` is required in production; production boot fails closed without it | Production DSN secret (C-08) |
| App crashes in Sentry with source maps | Verified (code side) | `@sentry/react-native/expo` in `app.json` and `getSentryExpoConfig` in `metro.config.js`; `build-config.test.ts` verified | Production DSN & auth token secrets (C-08) |
| Dashboard server errors logged | Verified 26 Oct (with fix) | `removeConsole` keeps `error`/`warn` | — |
| Uptime alert on `/readyz` | Failed | none | OPS-04 |
| Job-lag and webhook-failure alerts | Failed | none | OPS-04 |

## 9. CI/CD, environments and rollback

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| `main` protected; PRs and checks required | Failed | 4 unreviewed commits on 26 Oct | Owner: GitHub settings (ADR-0006) |
| Deploy only after CI passes | Failed | Render deploys every push | Owner: Render setting |
| Separate production and staging projects and secrets | Blocked | only staging exists | OPS-01 |
| App build profiles point at real hosts | Verified 26 Oct (with fix) | preview → test API, production → `api.pavdental.com` (D-09) | DNS (C-11) |
| API rollback | Not tested | Render "redeploy previous" | Rehearse once on staging |
| App rollback | Failed | no `expo-updates` | ADR-0005 / RB-20 |

## 10. Privacy, legal and third parties

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| Privacy notice reviewed, lists every processor | Partially done | copy updated in website/src/routes/privacy.tsx and dpa-tracker.md listing all 12 processors; unexecuted DPA claims removed; formal legal review (LG-01) pending | LG-01 |
| Terms (booking, deposits, cancellation, complaints) | Not tested | draft pages live, not reviewed | LG-08 |
| DPIA signed | Blocked | `docs/compliance/dpia-draft.md` | LG-03 |
| ICO registration | Blocked | — | LG-04 |
| CQC registration covers clinic, van and remote consults | Blocked | V-05 "not sure" | LG-05 |
| Clinical sign-off (triage, prescribing, odontogram, advice wording) | Blocked | V-01 | LG-07 |
| Medical device question for triage | Blocked | D-18 | LG-06 |
| No finance promotion, no NHS claims, no invented features | Verified 26 Oct | content guard passes, including the new insurance wording | Keep the guard in CI |

## 11. Support, incident response and post-launch

| Requirement | Status | Evidence | Next action |
|---|---|---|---|
| Incident runbook (who is called, how to roll back, how to tell patients) | Not tested | none | OPS-08 |
| Practice can take bookings by phone when the app is down | Not tested | — | Owner confirms process |
| Post-launch watch: daily check of Sentry, failed payments, reminder lag for the first 2 weeks | Not tested | — | OPS-08 |
| Store reviewer account with synthetic data | Blocked | RB-11 | after OPS-01 |

---

## 12. Residual risks (known and accepted for now)

| Risk | Why it is acceptable now | Revisit |
|---|---|---|
| Single API instance | Load is small; RTO 4 h; patients can phone | After launch, with job leadership (BE-23) |
| zod 3 advisory (allow-listed) | Bodies capped at 2 MB | BE-12 |
| API (Frankfurt) and DB (London) in different regions | Owner choice (#19); latency to be measured | BE-19 |
| Video calls open in the browser | D-01 | MF-01 |
