# Pav Dental: completion checklist

Tested on 4 Nov 2026 from `main` @ `63011f7`. This lists **what is left**. Steps and settings for the
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
- [ ] **Run the new backend test for `?scope=upcoming`** (`npx jest patient-upcoming-appointments`). It couldn't run
  in the test environment, so the route change is typechecked but hasn't been run. The Home fixes above don't depend
  on it: they were checked in the app against a backend without this change.
- [x] **A treatment plan could book the wrong treatment.** It now books only on an exact name match, otherwise the patient
  chooses from the catalogue. Fixed on 4 Nov.
- [x] **Appointment times followed the phone's time zone.** Home, Bookings, the appointment page and check-in now show UK
  time, labelled "UK time" on the page and at check-in. Checked in a browser set to Dhaka. Fixed on 4 Nov.
- [ ] **The API accepts a booking with no health-data consent.** A patient with zero consent records booked and
  paid; the consent screen showed "Pending". The app's onboarding asks for consent, but the server doesn't
  enforce it. Check with the DPO whether it should. **[Ran]**

## 2. Decisions needed from the owner

- [ ] **1. Reschedule:** what happens to the deposit, and is there a late-reschedule rule?
- [x] **2. Production domain:** `pavdental.com` (owner, 4 Nov). The example settings now match.
- [ ] **3. On-demand video:** a queue, or are booked slots enough for v1?
- [ ] **4. Stuck van shifts:** only the operator can end a shift, and shifts never time out, so a forgotten shift
  blocks the van. Auto-end, a staff button, or both? **[Code]**
- [x] **5. Dashboard template pages:** delete (owner, 4 Nov). Done, see section 6.
- [ ] **6. Website booking form:** a callback request, or a real app appointment? Staff currently see two lists.
- [ ] **7. Website Google sign-in:** keep it (needs Firebase settings) or remove it?
- [x] **8. `neo-financial-ios/`:** remove (owner, 4 Nov). Done, see section 9.
- [ ] **9. Where the service is:** the seed data is London, the website says Bradford. A van coverage check on the
  Bradford practice's own postcode (BD3 9TY) returned "not covered" with the seed data. **[Ran]**

## 3. Testing still to do

**Blocked in this test, should be run next:**

- [ ] **Backend `jest` in full.** Only 12 of 74 suites (172 of 563 tests) could pass here. The rest need Postgres,
  Redis and local ports, which this test environment blocks, so the failures say nothing about the code. **Last
  recorded full pass: 511/511 on 31 Oct.**
- [ ] **Backend e2e suite** (`npm test`). Last recorded pass: 34/34 on 31 Oct.
- [ ] **Migration drift check, seed and `prisma migrate deploy`** on a clean database.
- [ ] **Dashboard `next build`.** It hung here for 7+ minutes with both Turbopack and webpack, which may be this
  test environment. Confirm it passes in CI or on a normal machine.
- [ ] **CI on the release commit, CodeQL, Docker image build, `expo-doctor`.** None could be run or read here
  (`gh` couldn't connect).
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
- [ ] Investigate the flaky `audit-chain-concurrency` test (about 1 full run in 4, recorded 31 Oct) **[Docs]**

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
- [x] Replaced the hand-written JWT code with `jose`. Algorithm pinned, signatures compared safely, forged tokens refused.
  **Everyone signed in to the dashboard or shop has to sign in again** after this deploys. Done on 4 Nov.
- [x] `users/page.tsx` now queries the database directly and checks the staff session. Done on 4 Nov.
- [ ] Optional: draw van service areas on a map instead of pasting GeoJSON.
- [ ] Reduce the dashboard lint budget over time (now 152 errors, 207 warnings). **[Ran]**

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
