# Pav Dental: completion checklist

Tested on 4 Nov 2026 from `main` @ `63011f7`; updated 5 Nov from `main` @ `032c5ac` with what CI has since verified and the
fixes made since. This lists **what is left**. Steps and settings for the
owner's items are in [`../PRODUCTION-CHECKLIST.md`](../PRODUCTION-CHECKLIST.md), and the release gates
are in [`../release/release-checklist.md`](../release/release-checklist.md).

**Where things stand:** the code is healthy and the main patient journeys work on mock providers, but the
app is not ready for real patients. Nothing has been tested on a real phone or with real providers, legal
and clinical sign-off is outstanding, and there is no production environment. Five patient-screen bugs found in
this test have been fixed (section 1), along with the other code and docs items marked done below. What remains
needs the owner, outside parties, real phones or a full test environment.

How each open item is known:

- **[Ran]** seen failing or missing by running it on 4 Nov.
- **[Code]** confirmed by reading the code on 4 Nov.
- **[Docs]** taken from the existing docs and not re-checked.

---

## 1. Bugs to fix first (found in this test)

- [x] **Home showed a cancelled visit as "Your next visit" with a green "Confirmed" badge.** Fixed on 4 Nov.
- [x] **Home showed the furthest visit as "next", not the soonest.** Fixed on 4 Nov.
- [x] **Past visits showed "Completed" even if nobody completed them.** They now say "Past" unless the server
  records "Completed" or "Missed". Fixed on 4 Nov.
- [x] **"Deposit paid" showed "—" even when a deposit was paid.** It now shows the amount paid. Fixed on 4 Nov.
- [x] **The Reschedule button was a dead end.** Removed until decision 1 in section 2 is made and the backend can
  move a booking. Fixed on 4 Nov.
- [x] **Ran the new backend test for `?scope=upcoming`** (`patient-upcoming-appointments`). It passed in CI on PR #8,
  5 Nov.
- [x] **A treatment plan could book the wrong treatment.** It now books only on an exact name match, otherwise the patient
  chooses from the catalogue. Fixed on 4 Nov.
- [x] **Appointment times followed the phone's time zone.** Home, Bookings, the appointment page and check-in now show UK
  time, labelled "UK time" on the page and at check-in. Checked in a browser set to Dhaka. Fixed on 4 Nov.
- [ ] **The API accepts a booking with no health-data consent.** A patient with zero consent records booked and
  paid; the consent screen showed "Pending". The app's onboarding asks for consent, but the server doesn't
  enforce it. Check with the DPO whether it should. **[Ran]**

## 2. Decisions needed from the owner

- [ ] **1. Reschedule:** owner decided (5 Nov): free with 48 hours' notice or more, and the deposit stays with the booking;
  inside 48 hours the patient cancels and rebooks, with the usual cancellation terms. **Backend done**
  (`POST /api/booking/appointments/:id/reschedule`, clinic and video visits only; van visits are timed by dispatch and
  can't be moved). **The app screen is still to do**: the Reschedule button stays removed until it exists.
- [x] **2. Production domain:** `pavdental.com` (owner, 4 Nov). The example settings now match.
- [ ] **3. On-demand video:** a queue, or are booked slots enough for v1?
- [x] **4. Stuck van shifts:** owner chose a staff button (5 Nov). The Van Shifts screen now has an **End shift** button for
  any live shift, with the same rules as the operator ending their own. Stops already accepted or in progress block it
  until staff cancel or complete those visits; waiting requests are expired and their deposit holds released. Recorded in
  the audit log. **Auto-ending a shift after silence was not built**; add it later if forgotten shifts keep happening.
- [x] **5. Dashboard template pages:** delete (owner, 4 Nov). Done, see section 6.
- [ ] **6. Website booking form:** a callback request, or a real app appointment? Staff currently see two lists.
- [ ] **7. Website Google sign-in:** keep it (needs Firebase settings) or remove it?
- [x] **8. `neo-financial-ios/`:** remove (owner, 4 Nov). Done, see section 9.
- [ ] **9. Where the service is:** the seed data is London, the website says Bradford. A van coverage check on the
  Bradford practice's own postcode (BD3 9TY) returned "not covered" with the seed data. **[Ran]**

## 3. Testing still to do

**Blocked in this test, should be run next:**

- [x] **Backend `jest` in full.** Passes in CI on `main` after PRs #18 to #21 (5 Nov): 597 tests. Also run locally on
  fresh PostGIS 16 and Redis 7 databases, five of six runs fully clean; the sixth hit slow-local-database hook timeouts
  only (see section 10).
- [x] **Backend e2e suite** (`npm test`). Runs in the same CI job as the jest run and passes with it (`main`, 5 Nov).
- [x] **Migration drift check, seed and `prisma migrate deploy`** on a clean database. CI runs all three on every PR
  and passes; I also ran `migrate deploy` and the seed on a fresh database before each local run.
- [x] **Dashboard `next build`.** It hung in the sandbox, but the dashboard job, which includes the build, passed in CI
  on PR #8, 5 Nov.
- [x] **CI, CodeQL, Docker image build, `expo-doctor`.** All pass on `main` as of PR #21 (5 Nov): backend, dashboard,
  mobile (including `expo-doctor`, 21 of 21 after PR #19), website, Docker build and CodeQL. This is not a release
  commit: there isn't one yet.
- [ ] **Clinician screens and journey** (schedule, notes, chart, plans, prescribing). Staff sign-in needs a security
  code from `npm run dev:login-code`, which couldn't reach the database from here.
- [ ] **Van operator screens and journey** (same reason).
- [ ] **Dashboard staff screens**: bookings, app appointments, rota, hours, team, vans, inbox, patients, erasure,
  audit log (same reason; last checked in a browser on 1 Nov).

**Needs real phones (the web build can't test these):**

- [ ] Sign up, verify email from the link, onboarding, on iPhone and Android
- [ ] Pay a deposit with a Stripe test card, Apple Pay and Google Pay
- [ ] Real video call in the in-app window, with camera and microphone
- [ ] Van request with an operator on a second phone, background location, live map and road route
- [ ] Reminder push arrives; sign-out stops push
- [ ] Biometric lock, including the cancelled state (couldn't be reached on the simulator)
- [ ] Screenshot blocking on records screens
- [ ] Offline notes in airplane mode, then sync
- [ ] Email links open the app rather than the browser
- [ ] Run the 9 Maestro flows in `pavdental/maestro/flows/` on an EAS build (they aren't run in CI)

**Not started:**

- [ ] VoiceOver and TalkBack pass (`docs/completion/screen-reader-checklist.md`)
- [ ] Layout at 320 pt and with large text
- [ ] Load test: p95 under 500 ms reads and under 1 s booking confirm, at 50 requests a second
- [ ] External penetration test (`docs/security/penetration-test-scope.md`), with Critical and High findings fixed
- [ ] Restore drill, timed, with the audit chain verified afterwards
- [ ] 7-day soak on the production stack with synthetic data
- [ ] Rehearse an API rollback once
- [x] **The `audit-chain-concurrency` failure is gone** (about 1 full run in 4, recorded 31 Oct; failed on PR #8 and kept
  `main` red until PR #14 on 5 Nov). The cause was a test, not the audit code: `patient-upcoming-appointments` deleted the
  users it had made API calls as, and `audit_logs.actor_id` is `ON DELETE SET NULL`, so that cleared the actor on rows
  already hashed into the chain. Traced to two consecutive `GET /api/booking/appointments` rows with no actor. CI on
  `main` has been green on that test since PR #14. The earlier suspect (metadata with `undefined` or `Date` values hashed
  before Postgres changed it) was a separate, real fix. **Rows written that way before it stay flagged:** check any
  `Integrity check failed` report on a real database with this in mind.

## 4. Environments and owner setup

Full steps are in [`../PRODUCTION-CHECKLIST.md`](../PRODUCTION-CHECKLIST.md).

**Test environment:**

- [ ] **Fix the test API: it is down.** `pavdental-api.onrender.com/healthz` returned 503 with `database: error` on
  every check on 4 Nov (Redis is fine). A paused free-tier database is one possible cause, not confirmed. **[Ran]**
- [ ] Bring the test database up to date: the status doc says 37 migrations applied; the repo has 41. **[Docs]**
- [x] Updated `docs/deploy/test-deployment-status.md`, which said "Live (Healthy)". Done on 4 Nov.

**Accounts and settings:**

- [ ] Stripe: test mode first, webhook with the 6 events, Apple Pay merchant `merchant.com.pavdental.app`, Google Pay
- [ ] Postmark, with a verified sending domain (staff can't sign in without email or SMS)
- [ ] Twilio, with a UK sender number
- [ ] Daily.co
- [ ] Private S3 bucket in the UK or EU, with versioning on
- [ ] Sentry for backend, app and dashboard
- [ ] Google Cloud: Maps SDKs and Routes API, 3 restricted keys, budget alert
- [ ] Apple Developer and Google Play accounts
- [ ] Production Postgres with PostGIS and point-in-time recovery, plus Redis with TLS, kept separate from staging
- [ ] All backend secrets set; `npm run check:deploy -- production <file>` reports no problems
- [ ] `ENCRYPTION_KEY` and the prescription signing key stored safely
- [ ] First admin created with `npm run create:admin`
- [ ] Real clinics, services, hours, clinicians, vans and service areas entered in the dashboard. **Don't seed
  production:** the seed creates sample London clinics.
- [ ] Dentist profiles added and published (the website team page says "being updated" with none; the local API
  returned an empty list). **[Ran]**

**Mobile build:**

- [ ] Run `npx eas init`. **There is no EAS project ID in `app.json` or `app.config.js`**, so no device can register
  for push. `10-reaudit-findings.md` says it's configured, which is wrong. **[Code]**
- [ ] Add `google-services.json` (missing) and an APNs key. **[Code]**
- [ ] Set the EAS build variables: Stripe publishable key, Sentry DSN, Google Maps keys.
- [ ] Decide on over-the-air fixes: `expo-updates` isn't installed, so the only app rollback is a new store build. **[Code]**

**Deep links and domains:**

- [ ] Replace `APPLE_TEAM_ID` in `website/public/.well-known/apple-app-site-association`. **[Code]**
- [ ] Replace the fingerprint in `assetlinks.json` with the release key's (the current one looks like a debug key). **[Code]**
- [ ] **Deploy this repo's website to the live domain.** `www.pavdental.com` serves a different, older build: both
  `.well-known` files come back as HTML, so deep links can't verify, and `/verify-email` returned only that site's
  page, so emailed links wouldn't work there yet. **[Ran]**
- [ ] Set up DNS for `api.pavdental.com` and `staging.pavdental.com`, which `eas.json` and `app.json` point to. Neither
  answered from here, though this test environment may be the cause, so check them directly. **[Ran]**
- [ ] Set `APP_URL`, `VITE_APP_API_URL` and `ALLOWED_ORIGINS` so the email pages can reach the backend.

**Store release:**

- [ ] Listings, privacy labels and Google's Data safety form (draft in `docs/release/store-listing.md`)
- [ ] Reviewer account with synthetic data
- [ ] Build approved by Apple and Google

## 5. Legal and clinical sign-off

Nobody can complete these in code. Clinical wording stays a draft until a clinician reviews it.

- [ ] Clinician review: triage, prescribing, chart and advice wording
- [ ] Clinician decision: tooth numbering (US 1–32, FDI or Palmer)
- [ ] Clinician decision: should prescribing stay reachable only from the video room? Clinic and van visits have no
  prescription screen.
- [ ] Clinician decision: emergency triage runs only on the phone. Should it use the server's escalation logic? If not,
  delete `/api/triage/check` and `/api/triage/emergency-info`, which the app never calls. **[Code]**
- [ ] Clinician review: the "Book a video triage" wording
- [ ] Medical device question for triage
- [ ] DPIA signed (`docs/compliance/dpia-draft.md`)
- [ ] Privacy notice legally reviewed and published
- [ ] Terms reviewed: booking, deposits, cancellation, complaints
- [ ] Data processing agreements accepted with every provider (`docs/compliance/dpa-tracker.md`)
- [ ] ICO registration and fee
- [ ] CQC registration covers clinic, van and remote consults
- [ ] Are recall reminders "marketing" under PECR/GDPR? They're recorded as marketing consent today.
- [ ] DPO approves retention, then set `RETENTION_ENFORCE=true`
- [ ] **Check the "NHS partners" claim on the website's mobile dentistry page**, which also says "Coming Soon". Remove
  it if there's no partnership to back it up. **[Ran]** `website/src/components/mobile-dentistry/`

## 6. Staff dashboard

- [x] **Removed the fake sign-up** from the staff login, including the public `auth/v2` pages. Fixed on 4 Nov.
- [x] **Removed the "Continue with Google" button**, which did nothing. Fixed on 4 Nov.
- [x] Deleted the template demo pages, plus `/mail` and `/chat`. Links to them now go to `/dashboard`. Done on 4 Nov.
- [x] Added `inventory` to the sidebar. Done on 4 Nov.
- [x] Added an overview home page using `GET /api/admin/overview`. `/dashboard` used to redirect to the template page with
  fake revenue figures. The page and its error state were checked; it hasn't yet been seen with real figures, which
  needs a staff sign-in. Done on 4 Nov.
- [x] **The home page now leads with "Needs attention"** (PR #18, 5 Nov): today's visits and how many are still to come,
  messages waiting for staff, erasure requests and how many are past their month, failed card payments in the last 7
  days, van deposits that failed to release, and vans out. Counts only, each linking to its screen. Not seen in a browser.
- [x] **New staff screens for app data (DB-05, PRs #15 to #17, 5 Nov), all read-only and none seen in a browser yet:**
  - **Prescriptions register:** who issued each, when, whether signed and sent. Leaves out medication, dosage, patient and
    the signed content.
  - **Consent & Access:** consent records, and when patients generated subject access bundles. Leaves out IP addresses,
    metadata, file keys and bundle contents.
  - **Van shifts:** who is out, when each van last reported in, open requests, and an End shift button for one left running.
    Leaves out where vans are and who the requests are from.
  - Whether staff should see more (medication, bundle contents, van positions) is the owner's decision.
- [x] **Deleted `/dashboard/patient-monitoring`** (made-up patient vitals from the template, reachable by URL), on the owner's OK, 5 Nov.
- [x] Replaced the hand-written JWT code with `jose`. Algorithm pinned, signatures compared safely, forged tokens refused.
  **Everyone signed in to the dashboard or shop has to sign in again** after this deploys. Done on 4 Nov.
- [x] `users/page.tsx` now queries the database directly and checks the staff session. Done on 4 Nov.
- [ ] Optional: draw van service areas on a map instead of pasting GeoJSON.
- [ ] Reduce the dashboard lint budget over time (now 135 errors, 144 warnings).

## 7. Website and shop (on hold until the app is done)

The owner confirmed the hold on 4 Nov. Real email will also need a paid provider, which is the owner's call.

- [ ] **Send real email.** `admin-dashboard/src/lib/email.ts` only logs to the console, so there's no shopper
  verification, password reset, form alert or order confirmation. **[Code]**
- [ ] **Finish shopper password reset:** the emailed `/auth/v1/verify` and `/auth/v1/reset` links return 404, and there's
  no reset-confirm endpoint. **[Ran]**
- [ ] Add a signed-in state, sign-out, and an account page with order history. No such pages or sign-out exist. **[Code]**
- [ ] Move the shopper token out of `localStorage` into an httpOnly cookie. **[Code]** `website/src/lib/api.ts:9`
- [ ] Set `VITE_FIREBASE_*` or remove Google sign-in (decision 7). **[Code]**
- [x] **Fixed the default local setup:** the website now points at the dashboard's port, 3001. Done on 4 Nov.
- [ ] Test the shop end to end: cart, Stripe Checkout, webhook, order status, refund from the dashboard.
- [ ] Add CI deploys for the website and dashboard.

## 8. Going live safely

- [ ] Protect `main`: pull requests and passing checks required
- [ ] Render deploys only after CI passes (today it deploys every push) **[Docs]**
- [ ] Migrations run automatically before new code (today they're manual) **[Docs]**
- [ ] Uptime alert on `/readyz` that reaches a person **[Docs]**
- [ ] Job-lag and webhook-failure alerts **[Docs]**
- [ ] App and dashboard source maps readable in Sentry
- [ ] Finish the incident runbook: a draft is in [`../deploy/incident-runbook.md`](../deploy/incident-runbook.md); the owner
  must fill in names, contacts and patient wording.
- [ ] Confirm the practice can take bookings by phone when the app is down
- [ ] First two weeks: daily check of Sentry, failed payments and reminder lag
- [ ] GitHub secret scanning on
- [ ] Switch Stripe to live keys, **last**, after everything above

## 9. Housekeeping (doesn't block launch)

- [x] Removed `neo-financial-ios/` from the current files. It remains in git history, so the clone stays large and the
  copyright question isn't fully closed unless history is rewritten, which would need your go-ahead. Done on 4 Nov.
- [x] Corrected the stale docs: `10-reaudit-findings.md`, `release-checklist.md`, `test-deployment-status.md`. Done on 4 Nov.
- [x] Added `tsx` to `pavdental/package.json`. Done on 4 Nov.
- [x] `docs/LOCAL-DEV.md` now covers the website and the port map. Done on 4 Nov.
- [ ] Drop the `MfaVerification` table, which is written but never read (needs a migration). **[Docs]**
- [ ] Reduce the lint budgets over time: backend 577 warnings, mobile 215.
- [ ] Upgrade to Node 24 by Apr 2027, and Prisma 7 to clear the allowlisted `deepmerge-ts` advisory. **[Docs]**
- [ ] Add a native Daily video SDK after launch, if the in-app browser window proves limiting.

## 10. Test reliability (found and fixed on 5 Nov)

Backend tests share one database and run in parallel, so tests that touch rows they don't own fail now and then. Each of
these kept `main` or a PR red at some point, and each is fixed:

- [x] **`audit-chain-concurrency`:** a test deleted users whose audit rows it had written (PR #14).
- [x] **`messaging-routing`:** clinician GDC numbers invented at random from overlapping ranges, so two tests sometimes
  drew the same number; `backend/test/unique-gdc.ts` now hands them out per jest worker (PR #20).
- [x] **`booking-races`:** counted every live appointment its clinician had, including other suites' "any dentist"
  bookings at a neighbouring time (PR #20).
- [x] **`van-races` and `webhook-completeness` cleanup:** `sar-export` borrowed the first van and shift in the database
  and filed a request against another suite's shift (PR #21).
- [x] **`admin-attention`:** compared readings of global counts; now retries its "not counted" checks (PR #21).
- [x] **`expo-doctor` in CI:** Expo published new patch versions of 8 SDK 57 packages, which failed every PR until they
  were updated (PR #19). This will happen again with each new patch release, so run `npx expo install --fix` when it does.

**Still seen, not fixed:** on a slow local database (an `amd64` image on an ARM Mac) some suites hit the 5-second hook
timeout (`payment-integrity`, `video-rooms`, `health-data-protection`). CI has never shown this. If it starts to, raise
the hook timeout in those suites' `beforeAll`.

---

## What passed on 4 Nov

**Automated checks** (CI uses Node 22; lint and the dependency audit ran on Node 26, as noted for other cells):

| App | Typecheck | Tests | Lint | Dependency audit | Build |
|---|---|---|---|---|---|
| Backend | ✅ 0 errors | ⚠️ 172/563, needs a database (section 3) | ✅ within budget | ✅ 1 allowlisted | Not run |
| Mobile | ✅ 0 errors | ✅ all 34 test scripts, content guard ✅ | ✅ within budget | ✅ 2 allowlisted | Not run |
| Dashboard | ✅ 0 errors | ✅ 55/55 | ✅ within budget | Not finished | ⚠️ hung (section 3) |
| Website | ✅ no errors (Node 26) | ✅ 9/9 (Node 26) | Not run | ✅ 1 allowlisted | ✅ (Node 26) |

The mobile test scripts were run one by one with a different launcher, because `tsx` needs a local socket this test
environment blocks. No test file was changed.

**Run against a live local backend, using seeded test accounts and mock payments:**

- [x] Patient sign-in, and a wrong password is refused
- [x] Staff sign-in asks for a security code
- [x] A patient can't open admin, audit or operator endpoints (403), and no token gets 401
- [x] Hold a slot → create appointment → unpaid confirm refused (402) → pay deposit → confirmed
- [x] Cancel with refund: 0% at about 20 hours' notice, 100% at 5+ days
- [x] Van coverage check: covered in London, not covered outside the seeded areas
- [x] Rewards, referrals, consents, dependants, plans, chart, documents and notification settings endpoints respond

**Opened in the app (Expo web, phone-sized, no console errors):** welcome, sign-in, home, bookings, appointment detail,
records, plans, chart, prescriptions, documents, insights, profile, consent, rewards, payment methods, treatment
catalog, van coverage.

**Website and dashboard, in a browser:** all 33 website pages return 200, unknown pages return 404, the email-link pages
load, and the shop shows products once the dashboard API is connected. The dashboard login renders, staff pages redirect
to login when signed out, and the admin API refuses signed-out requests (401).

**Limits of this test:** the backend was already running on this machine and wasn't started for this test, so its code
may not exactly match this commit. The bugs in section 1 that come from code were also confirmed in this commit's source.
Expo web is not a real phone: no native payments, maps, camera, push or biometrics. Five cancelled test bookings on the
seeded patient remain in the local database.
