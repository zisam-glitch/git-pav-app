# Plan: first TestFlight build

Written 6 Nov 2026. Goal: a **closed beta** (staff and friendly testers, synthetic data only, Stripe test mode) that
installs from TestFlight and runs the core journeys without crashing. This is not the public launch; the legal and
clinical gates in `docs/completion/11-completion-checklist.md` section 5 still apply to that.

Rule for the whole plan: do not move to the next phase until the exit check of the current one passes.

## Phase 0: Decisions and accounts (owner, about 1 day, in parallel with Phase 1)

Needs the owner; nothing here is code.

- [ ] Apple Developer account active; App Store Connect app record created for `com.pavdental.app`.
- [ ] Expo account; run `npx eas init` in `pavdental/` (the project ID is not set). Commit the resulting config.
- [ ] APNs key created and uploaded to EAS (`eas credentials`).
- [ ] Choose the staging host. Today's test API (`pavdental-api.onrender.com`) was returning 503 and is 4 migrations behind.
- [ ] Decide the beta tester list (internal testers need no Apple review; external need Beta App Review).
- [ ] Confirm the practice phone in `pavdental/src/config/practice.ts` (`0800 1938 786` is the built-in default) is a real
  number, or set `EXPO_PUBLIC_PRACTICE_PHONE`.

**Exit check:** `eas whoami` works, `eas project:info` shows a project ID, App Store Connect shows the app.

## Phase 1: Working staging backend (about 2 to 3 days)

- [ ] Postgres 16 with PostGIS, Redis 7, backend deployed from current `main`. Run `prisma migrate deploy`, not the seed on
  anything that will hold real data. For this beta database the seed is fine (synthetic Bradford clinic).
- [ ] `npm run check:deploy -- staging <env file>` reports no problems.
- [ ] Stripe **test** keys, webhook registered with the 6 events, Apple Pay merchant `merchant.com.pavdental.app`.
- [ ] Postmark with a verified sending domain, Twilio with a UK sender (staff cannot sign in without email or SMS).
- [ ] Daily.co key, a private S3 bucket (UK or EU), Sentry projects for backend and app.
- [ ] Create the first admin (`npm run create:admin`). Enter staging clinics, services, hours, one clinician, one van and
  service areas through the dashboard.
- [ ] DNS for the staging API with TLS. `eas.json`'s `preview` profile must point at it (today it points at the Render URL).

**Exit check:** `/readyz` returns 200 with database and Redis ok; a curl sign-up, email verification, hold, pay (test card)
and confirm all succeed against staging.

## Phase 2: Bug sweep before any build (about 2 to 3 days)

Everything here can be done without a phone. Run each app's checks first to get a clean baseline
(`npx tsc --noEmit` and `npm run test:all` in `pavdental/`; `npx tsc --noEmit`, `npx jest`, `npm test` in `backend/`).
Note: this worktree has no `node_modules` and the npm cache here is root-owned, so run `sudo chown -R 501:20 ~/.npm` and
`npm ci` once before the checks.

Known problems to fix or consciously accept, in order of risk:

1. **Booking without health-data consent is accepted by the API** (checklist section 1). Ask the DPO; if yes, block
   booking confirm with a clear message and add a backend test.
2. **Build config can silently fall back to localhost.** `src/config/api.ts` defaults to `http://localhost:3000` when
   `EXPO_PUBLIC_API_URL` is missing. Make a non-development build fail loudly instead, with a test.
3. **Email links won't open the app yet** (live site serves an older build, the `apple-app-site-association` file still has the
   placeholder team ID). The manual verification-code path exists in `verify-email.tsx`; keep it working and tell testers
   to use it. Fix the team ID once Phase 0 gives it to you.
4. **Push registration needs the EAS project ID**, which `notification-hooks.ts` reads from
   `EXPO_PUBLIC_EAS_PROJECT_ID`. Make sure the value is set for every build profile, and that failure to register does not
   block sign-in.
5. **Stray logging in app code:** `react-query-persistence.ts:97` uses `console.log`; the others are `console.warn` for Expo
   Go. Confirm none can print personal or health data (health data in logs is a high-severity bug).
6. **Loading, empty and error states.** Walk every patient screen with the backend stopped, slow, and returning 401, 403,
   404 and 500. Each must show a message and a retry, never a blank screen.
7. **Dev-only switches stay off.** The role switcher is gated on `__DEV__` and the demo login on an env flag; add a build
   test that fails if `EXPO_PUBLIC_DEMO_LOGIN` or `EXPO_PUBLIC_ENABLE_ROLE_SWITCHER` is set in any `eas.json` profile.
8. **Date and time:** appointment times are shown in UK time; re-check around the clocks-change dates and at midnight.
9. **Double taps and retries:** pay, confirm, cancel and reschedule buttons must disable while in flight; the backend
   already has booking-race tests, so extend the app side.
10. **Reschedule** was added on 5 Nov and has never run on a phone. Treat it as untested.

Also run `expo-doctor` and `npx expo install --fix` if it complains (Expo publishes patch versions often).

**Exit check:** all four apps' checks green locally and in CI; items 1, 2, 4 and 7 fixed or explicitly deferred in writing.

## Phase 3: Internal build on real phones (about 2 days)

Build the `preview` profile for internal distribution first (installs without TestFlight, fastest feedback).

- [ ] Set EAS variables for the profile: `EXPO_PUBLIC_API_URL` (staging), `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test),
  `EXPO_PUBLIC_SENTRY_DSN`, Google Maps iOS key (optional for the first build; iPhone falls back to Apple Maps).
- [ ] `eas build -p ios --profile preview`, install on at least two iPhones (one older, one small screen) and one Android.
- [ ] Walk the real-phone list from the checklist, in this order, logging each failure as an issue:
  1. Sign up, verify email by code, onboarding, consent.
  2. Book a clinic visit, pay the deposit with a Stripe test card, then with Apple Pay.
  3. Cancel (check the refund tier), then reschedule with more than 48 hours' notice and with less.
  4. Push reminder arrives; sign out stops push.
  5. Biometric lock including cancelling the prompt; background and return.
  6. Video call with camera and microphone (clinician on the dashboard or a second phone).
  7. Van request with an operator on a second phone, background location, live map.
  8. Offline notes in airplane mode, then sync.
  9. Screenshot blocking on records screens.
- [ ] Also test: poor network, killing the app mid-payment, sign-in on two phones, wrong-password lockout, large text, 320 pt
  wide screen, dark mode (the app is forced light).
- [ ] Run the 9 Maestro flows in `pavdental/maestro/flows/` on the build.
- [ ] Staff side: clinician schedule, notes and prescribing; operator shift; dashboard bookings, rota, vans. None of this has
  been run since 1 Nov because staff sign-in needs the security code.

**Exit check:** every item above passes, or is a written, accepted known issue. No crash in Sentry during the pass.

## Phase 4: TestFlight (about 1 day, plus Apple wait)

- [ ] Bump version if needed; `eas build -p ios --profile production` pointed at staging for the beta (add a separate
  `beta` profile with the staging URL rather than editing `production`, so a beta build can never be mistaken for a release).
- [ ] `eas submit -p ios`, wait for processing, answer the export compliance question (the app uses standard HTTPS only).
- [ ] Test information for Apple: a reviewer account with synthetic data, plain-English notes on the van and video features,
  a contact email. Complete the App Privacy answers from `docs/release/store-listing.md`.
- [ ] Internal testers first (up to 100, no review), then external with Beta App Review.
- [ ] Add a visible "beta, test payments only" notice on the welcome screen or in the beta description so nobody enters real
  card details.

**Exit check:** a tester who has never seen the app installs it from TestFlight and completes sign-up to a paid booking
unaided.

## Phase 5: Running the beta (2 weeks)

- [ ] Daily look at Sentry, failed payments, reminder lag and the dashboard "Needs attention" page.
- [ ] A one-page feedback form for testers; triage into: crash, wrong money or time, confusing, cosmetic.
- [ ] Fix criticals within a day. No over-the-air updates exist (`expo-updates` is not installed), so each fix is a new
  build; batch non-critical fixes.
- [ ] Meanwhile start the long-lead items that do not depend on the beta: clinician review of wording, DPIA, privacy notice,
  external pen test, load test.

## Out of scope for the beta

Public App Store release, live Stripe keys, real patient data, the website shop, over-the-air updates, Android store
release.

## Risks to watch

- Staging uses mock-free providers for the first time; expect integration surprises (Stripe webhook, Daily, Twilio sender).
- Apple may question background location and the "always" permission for the van mode; the permission strings are written,
  but the review notes should say it is for operators only.
- Beta App Review can reject on a broken reviewer login, so test that account on the actual TestFlight build.
