# Pav Dental: independent audit and completion plan

Date: 31 Oct 2026 · Commit audited: `main` @ `a59bd50` (271 commits)

This plan was built from the code, not from the existing docs in `docs/`. Where a
doc made a claim, I checked it against the code; several were stale (see R3).

## Progress

| Date | Item | Status |
|---|---|---|
| 31 Oct | Baseline on a local Postgres+PostGIS and Redis: backend Jest 511/511, e2e 34/34, mobile `test:all` green | ✅ |
| 31 Oct | M2: video calls open in an in-app browser window | ✅ (still needs a test call on real phones) |
| 31 Oct | B1: template keys in `.env.example` run in local mode instead of calling Stripe, Postmark, Twilio or Daily with junk keys. **Also found:** the template `ENCRYPTION_KEY` crashed the backend on startup; fixed the same way | ✅ |
| 31 Oct | M1: clinic booking confirms with mock Stripe, and asks the server to confirm after a real payment | ✅ (checked against a running backend: hold → appointment → deposit → `confirmed`) |
| 31 Oct | B5: `prisma generate` step written up in `docs/LOCAL-DEV.md`, not automated: a `postinstall` would break the Dockerfile, which runs `npm ci` before copying the schema | ✅ |
| 31 Oct | `docs/LOCAL-DEV.md` for backend + mobile (new, written from the verified steps) | ✅ |
| 31 Oct | **J5 van request.** Found: no van request from the app could pass validation. The app sent the coverage *sector name* ("WC - West Central London") as the postcode, in a read-only field with a made-up "SW1A 1AA" fallback. Fixed: GPS checks now look up the nearest real postcode, the patient can edit it, and invented city, postcode and van-name defaults are gone. The whole journey (shift → coverage → request → accept → en route → on site → in treatment → completed → shift end) checked against a running backend | ✅ |
| 31 Oct | e2e suite left its van shift open (its stop cleanup skipped phases and ignored the errors), which blocked the seeded operator. It now ends the shift | ✅ |
| 31 Oct | **J4 video consult.** Found: every "video consult" button opened the triage with no appointment, so the patient answered everything and was then told the consult couldn't be found. Also, every service was booked as a clinic visit (including the video-only triage), and the server accepted it. Fixed: those buttons now book the video service (catalog `?channel=video`; video skips the clinic step), the confirmation screen and the appointment page open the triage for the booked appointment, and the server refuses a channel the service doesn't offer. The whole journey (book → deposit → triage → waiting → clinician queue → admit → room tokens → end → summary) checked against a running backend | ✅ |
| 31 Oct | Removed claims the app can't back up: a fake "Add to calendar" button, a "confirmation email" the server never sends, "4.2 miles away / same-day slots", "often within 15 minutes", a "notify me" option that did nothing, and invented fallback names ("Dental Checkup", "Pav Dental Central Practice", "Pav Dental Clinic", "Pav Dental Van #1") | ✅ |
| 31 Oct | **J10 clinician day.** Checked against a running backend: today's schedule, the patient record (profile, chart, plans), notes saved and read back, prescription issued with a signed PDF link, complete and no-show. Fixed: once a consult was under way (`in_progress`, e.g. after letting a video patient in), the schedule hid its buttons, so the clinician couldn't get back to the room or the record. Removed the invented "Verified Patient" and "Dental Consultation" fallbacks | ✅ |
| 31 Oct | **J6 records.** Clinician saves the chart (the app's exact request) → patient sees it, history recorded; clinician creates a plan → patient signs it (`accepted`) | ✅ |
| 31 Oct | **J1 sign-up and onboarding.** register → verify email → profile, address, medical history → consents, checked with the app's exact requests. Locally there was no way past "Verify your email" (no email is sent): added `npm run dev:verify-email-code` | ✅ |
| 31 Oct | **J3 cancel.** 100% refund with 129 h notice, 50% with 33 h, slot freed both times. Reschedule still doesn't work (decision 9) | ✅ (reschedule ⚠️) |
| 31 Oct | **J7 messages.** Patient → practice and → care team; both reach the staff and clinician inboxes; staff reply reaches the patient; mark read | ✅ |
| 31 Oct | **J8 / J9 account.** Dependants (after the parent's date of birth is set), rewards, referrals, data export (SAR), account deletion (password checked, erasure request opened, sign-in blocked). Fixed: saving a card in local mock mode handed Stripe a fake secret, and the app said "Card Added" even when Stripe returned no card. Added the missing way to log a brushing session (the insights chart had nothing to fill it) | ✅ (saved cards need Stripe test keys to check for real) |
| 1 Nov | **Phase 2: van service areas and operators.** New dashboard page *Vans & Service Areas*: each van's areas (preview, remove, add by pasting GeoJSON from e.g. geojson.io), every operator currently on the van (end assignment), assign an operator (shown with email; assigning ends their other van). Backend: area shape now required and checked (closed ring, valid coordinates, no self-crossing via PostGIS); the made-up central-London box used when no shape was sent is gone; new endpoints to remove an area, list operators, end an assignment; vans list returns shapes and all current operators. Checked in a browser against a running backend | ✅ (drawing on a map instead of pasting GeoJSON would need a map library and tile provider: follow-up) |
| 1 Nov | Staff screens for the app checked in a browser: app appointments, opening hours, rota, team, dentist profiles, inbox (reply sent), patients, referral vouchers, erasure requests (erase completed), audit log. All load with no errors | ✅ |
| 1 Nov | **Patient directory** showed "System Administrator" as the address of patients without a profile, and a Date of Birth column that was always empty. Now labelled by account type, the column is "Area" (town, postcode), the empty column is gone, and patients can be found by name | ✅ |
| 1 Nov | **Phase 4: phone change.** Found: a code sent to one number could mark a *different* number as verified (codes weren't tied to the number). Codes are now bound to the number they were sent to. The app's personal-info screen sends a code when the number changes and only saves it once the code is entered. Added `npm run dev:phone-code` for local use | ✅ |
| 1 Nov | **Phase 4: consent history.** The consent screen lists every consent given and withdrawn. The invented "v1" and "Recorded" shown for consents never given are gone | ✅ |
| 1 Nov | **Phase 4: two-step sign-in for patients.** The backend could turn it on but not off. Added `POST /api/auth/mfa/disable` (password and a fresh code; staff refused) and a card on the security screen | ✅ |
| 1 Nov | **Phase 5: CI checks.** Ran every CI step locally. Fixed: mobile lint (fetch stub + new `any`s; budget lowered to 217), six new `node-forge` advisories (pinned 1.4.2), a `systeminformation` advisory in the dashboard (pinned 5.33.19); `decode-uri-component` allowlisted with a reason. No migration drift. Backend lint budget lowered to 577. Not runnable here: the Docker build and Expo Doctor's two online checks | ✅ |
| 1 Nov | **Phase 5: Apple Pay.** The app asked Stripe for merchant ID `merchant.com.pavdental`, while the iOS entitlement grants `merchant.com.pavdental.app`, so Apple Pay would fail. Fixed and covered by the build-config test, which also now refuses the demo login and role switcher on release profiles | ✅ |
| 1 Nov | **Phase 5: launch tooling.** `npm run check:deploy -- production <env file>` checks a deployment's settings without starting the server (startup rules, production services, usable prescription key, https origins; never prints values). `npm run create:admin -- <email>` creates the first admin with an emailed set-password link | ✅ |
| 1 Nov | **Phase 5: `docs/PRODUCTION-CHECKLIST.md`.** Every owner action for the backend, app and dashboard, in order, each with a way to check it. Found while writing it: the seed's "reference" data is sample London clinics and van coverage, so production must not be seeded; and email links (verification, reset, **staff and first-admin invites**) need website pages that don't exist yet, unless the app is installed | ✅ (website pages ⚠️ launch blocker) |
| 2 Nov | **Live van map (Uber-style).** Real map on the patient's tracking screen (Google Maps with a build key, Apple Maps on iPhone otherwise): the van moving once it's coming, the road route from Google Routes (server-side, cached), traffic-aware ETAs. The old drawn van that showed before anyone accepted is gone | ✅ (needs keys and a new build to see on a phone) |
| 2 Nov | **Website pages for email links:** `/verify-email` and `/reset-password` (also staff invitations), calling the backend directly. Checked in a browser: verify, set a password then sign in, reused link refused, token removed from the address bar. Closes the launch blocker | ✅ |
| 3 Nov | **Live van map on the iOS simulator** with Google Maps and Google Routes, every step of the van journey screenshotted (coverage → access → review → finding → accepted → driving with road route → arrived → treating → complete; out of area). Found and fixed: patients had no way to start a van visit (every van service also offers clinic, and clinic always won; the post-video button skipped choosing a service), so Home now has a *Dental van* tile into the catalog filtered to van services; the phone map zoomed to a single building when the van was close (now capped at street level, as on the web); the out-of-area screen claimed a "15-mile radius", that M1 1AE "sits just outside" it and fortnightly route planning; local iOS builds failed at Sentry's upload step; an empty `GOOGLE_ROUTES_API_KEY=` turned Google routing off. The startup log now names the routing provider | ✅ |
| 3 Nov | Local `npx jest`: `encryption-keys` fails with a `.env` copied from the template (its fixture assumes the default dev `ENCRYPTION_KEY`); passes with `ENCRYPTION_KEY` unset, as in CI | ⚠️ |
| 31 Oct | Flaky backend test: `audit-chain-concurrency` fails about once in four full parallel runs and passes on rerun. Queued as a separate investigation | ⚠️ |
| 31 Oct | Emergency modal button "Start 15-min video triage now" changed to "Book a video triage". **Clinical wording: needs clinician review** | ⚠️ review |

## How this was verified

| Check | Result |
|---|---|
| Clean `npm ci` of all four apps | ✅ all installed |
| `tsc --noEmit` mobile (`pavdental/`) | ✅ 0 errors |
| `tsc --noEmit` website | ✅ 0 errors |
| `tsc --noEmit` admin dashboard | ✅ 0 errors |
| `tsc --noEmit` backend | ⚠️ 144 errors, all from the Prisma client not yet being generated (`prisma generate` was not run), not code bugs |
| Every API call in the mobile app, website and dashboard matched against the server routes by a script | ✅ the mobile app has no calls to missing endpoints; every website `/api/v1/*` call exists in the dashboard |
| Jest, e2e, `next build`, `vite build`, starting the apps | ❌ **not run**: this session's sandbox blocked running the repo's own code. Phase 0 starts here. |

So the findings below come from reading code and from the scripted cross-check. Nothing
here has been tested at runtime yet.

---

## 1. What the system actually is

```
 Mobile app (Expo, pavdental/) ──► Backend API (Express, backend/, :3000)
   patient / clinician / van          ├─ Postgres + PostGIS (Prisma, 47 models, 41 migrations)
   operator roles                     ├─ Redis (rate limits, OTP, locks)
                                      ├─ Stripe (deposits, saved cards, van holds)
                                      ├─ Daily (video), Postmark (email), Twilio (SMS)
                                      ├─ Expo Push, S3 (documents), postcodes.io
                                      └─ 8 background jobs (Postgres advisory-lock leader)
                                             ▲
 Admin dashboard (Next 16, admin-dashboard/) │ /api/admin/* through an allowlisted proxy,
   ├─ staff screens for app data ────────────┘ signed in with the staff member's app account
   └─ /api/v1/* = the website's backend: shop, cart, Stripe Checkout, blog, pricing,
      forms, newsletter, shopper accounts → its own Postgres (PGlite in dev)
             ▲
 Website (TanStack Start, website/) ─────────┘ marketing pages, shop, forms
   team page → dashboard /api/v1/dentists → backend /api/services/dentists
```

| Part | Size | Health |
|---|---|---|
| `backend/` | ~37k lines, 27 routers, 168 endpoints, ~60 Jest files plus an e2e suite | **Strong.** Mature domain logic: booking holds, deposits, refunds, PHI encryption, audit hash-chain, erasure/SAR, van dispatch and ETA. The gaps are config and orphan endpoints. |
| `pavdental/` | ~37k lines, ~95 screens in 5 route groups | **Good.** Fully wired to the backend; one blocking bug (M1); native setup still pending |
| `admin-dashboard/` | ~52k lines | **Mixed.** About 15 real Pav screens sit beside about 20 leftover template demo pages; website email isn't sent |
| `website/` | ~35k lines, 36 routes | **Mixed.** Marketing and shop are wired; auth is half built; app-builder scaffolding left in |
| `neo-financial-ios/` | 2,900 PNGs (90% of the repo's files) | Not code: screenshots of a third-party banking app, used as design reference |
| `.agents/skills/` | 623 files | Agent skill packs, not product code |

---

## 2. Findings

Severity: 🔴 blocks a core journey · 🟠 feature incomplete · 🟡 hygiene or hardening

### Backend

- 🔴 **B1 – Placeholder secrets switch on real API calls.** If you copy
  `backend/.env.example` to `.env`, you get values like `sk_test_replace_with…`,
  `pm_server_token_replace_me`, `replace_with_daily_api_key` and `AC_replace…`.
  `config/env.ts` flags these as placeholders when deployed, but the services use their own, weaker checks:
  - Stripe only switches to mock if the key starts with `sk_test_mock` (`env.ts:329`)
  - Postmark only skips sending if the token starts with `mock` (`communication-service.ts:41`)
  - Daily only skips if the key is exactly `daily_dev_placeholder` (`routes/video.ts:20,107`)

  The result: a fresh local setup sends real requests with junk keys, and payments,
  email codes, SMS codes and video all fail. Fix: one shared `isPlaceholder()` used everywhere.
- 🟠 **B2 – Endpoints that no client calls:**
  - `POST /patients/:id/phone/request|verify` (phone verification)
  - `POST /triage/check`, `GET /triage/emergency-info`
  - `GET /consents/history`, `POST /consents/data-deletion-request`
  - `POST /financing/apply` (the app only links out to a finance page)
  - `POST /auth/mfa/request|verify|verify-session` (step-up MFA)
  - `PATCH /booking/appointments/:id/confirm` (see M1)
  - `DELETE /notifications/tokens/:token`
  - `GET /van/queue` and `GET /van/requests/incoming` (superseded by `/van/shift/current`)
  - the `/api/audit/*` writer and reader

  Each one needs a decision: build the screen, or delete the endpoint.
- 🟠 **B3 – Admin endpoints with no staff screen:** van service-area polygons
  (`POST /admin/vans/:id/polygons`), van↔operator assignments
  (`POST /admin/vans/:id/assignments`) and `GET /admin/overview`. In a real
  environment van coverage can only be set by the seed script, so van booking can't be run for real.
- 🟠 **B4 – Staff can't sign in without email/SMS.** Login always asks
  clinicians and admins for a one-time code (`routes/auth.ts:188`). With no
  Postmark or Twilio set up, the code only appears in the log (or through `npm run dev:login-code`).
  Fine for dev, but it blocks any shared test environment.
- 🟡 **B5 –** A fresh checkout must run `prisma generate` before `tsc` passes. Add a `postinstall`
  script, or document it.

### Mobile app (`pavdental/`)

- 🔴 **M1 – Clinic booking can't complete with mock Stripe.**
  `booking/summary.tsx:126-172` passes the mock `pi_mock_…_secret_mock` secret to
  `initPaymentSheet`, ignores the `isMock: true` flag the server returns
  (`payments.ts:68`), and never calls `PATCH /appointments/:id/confirm`. The van
  flow already handles this (`van/confirm.tsx:52`). Fix it the same way: when `isMock`, confirm
  on the server and go to `confirmed`. With real Stripe test keys, confirmation depends on the
  webhook, so local dev also needs `stripe listen --forward-to`.
- 🟠 **M2 – The video call opens in the phone's browser** (`video/call.tsx:58`, `Linking.openURL`),
  not in the app. It works, but the patient leaves the app. Decide: keep this for v1, or add the Daily RN SDK
  (needs a dev build).
  **Decided 31 Oct:** use an in-app browser window (`expo-web-browser`) for v1, now done
  (`src/features/video/open-call.ts`). Still to do: a test call on real iPhone and Android
  phones. Revisit the native Daily SDK after launch.
- 🟠 **M3 – Push notifications can't work yet:** the EAS `projectId` is empty
  (`notification-hooks.ts:218`), there's no Android `google-services.json` (FCM) and no APNs key.
- 🟠 **M4 – Deep links won't verify:** `website/public/.well-known/apple-app-site-association`
  still has `APPLE_TEAM_ID` in it. `assetlinks.json` very likely has a debug signing
  fingerprint, not the release one. The website also has no fallback `/reset-password` or
  `/verify-email` page for users without the app.
- 🟠 **M5 – Missing screens for B2:** phone verification, consent history,
  in-app finance application.
- 🟠 **M6 – The emergency triage modal runs entirely on the phone**; the backend's triage
  escalation (`lib/triage-escalation.ts`) is never called. Wiring it in needs a clinical decision.
- 🟡 **M7 – Config drift:** the production API URL is `api.pavdental.co.uk` in `.env.example`
  but `api.pavdental.com` in `eas.json`. Stripe needs a dev build (Expo Go can't take payments).

### Admin dashboard (`admin-dashboard/`)

- 🟠 **A1 – About 20 template demo pages are still reachable by URL** (not in the sidebar),
  showing fake data or "coming soon": `academy, analytics, calendar, chat, coming-soon,
  crm, default, ecommerce, file-manager, finance, infrastructure, invoice, kanban,
  logistics, productivity, profile, roles, tasks, (legacy)/*`, plus `src/app/(main)/mail`
  and `/chat`. `inventory` is real (it has an API) but isn't in the sidebar.
- 🔴 **A2 – No email is sent.** `src/lib/email.ts` only `console.log`s.
  `RESEND_API_KEY` and `CLINIC_NOTIFICATION_EMAIL` are in `.env.example` but nothing reads them. So:
  - no shopper verification or reset emails
  - no clinic alert for contact, booking, vacancy or petition forms
  - no order confirmations
- 🔴 **A3 – Shopper password reset is half built.** There's `reset-request` but no
  reset-confirm endpoint, and the emailed links (`/auth/v1/verify`, `/auth/v1/reset`)
  go to pages that don't exist.
- 🔴 **A4 – Local ports clash.** The backend uses `PORT=3000`, Next dev defaults to 3000, and the website's
  `VITE_API_BASE_URL` defaults to `http://localhost:3000` (meaning the dashboard).
  `users/page.tsx:10` falls back to `localhost:3000`. As shipped, the three can't run side by side.
- 🟡 **A5 –** `users/page.tsx` calls its own API over HTTP during server render; query the DB directly instead.
- 🟡 **A6 –** The hand-rolled JWT (`lib/auth/jwt.ts`) compares signatures in non-constant time, doesn't
  check `alg`, and `JSON.parse` can throw. Swap to `jose`.
- 🟠 **A7 – Two separate booking systems.** Website "bookings" live in the dashboard's DB;
  app appointments live in the backend. Staff see two lists. Product decision:
  either label website bookings as callback requests, or push them into backend booking.

### Website (`website/`)

- 🟠 **W1 – App-builder scaffolding left in:** better-auth + PGlite (`src/lib/auth/*`,
  `src/lib/db.ts`, `migrations/auth`), `lib/multiplayer` (P2P), `lib/app-data`,
  `<PreviewHostBridge/>` in `__root.tsx`, the `/__grok/*` PWA manifest, and the preview scripts. The
  real login is a separate token flow to the dashboard, so there are two auth systems.
- 🟠 **W2 – The header always shows "Sign In".** There's no signed-in state, sign-out, or account and
  order history page.
- 🟠 **W3 –** Google sign-in needs `VITE_FIREBASE_*`, which isn't in `.env.example`.
- 🟡 **W4 –** The shopper token is kept in `localStorage`. Move it to an httpOnly cookie; the
  dashboard's `userMiddleware` already reads a `user_token` cookie.

### Repo

- 🟡 **R1 –** `neo-financial-ios/` (2.9k screenshots of a third-party app) and `.screenshots/`
  should move out of the repo, for copyright reasons and clone size.
- 🟡 **R2 –** Four apps with no single "run everything" guide.
- 🟡 **R3 – Docs are stale.** `docs/deploy/test-deployment-status.md` says 37 migrations
  are applied to the test DB; the repo has 41, so the test environment is behind `main`.

---

## 3. Plan

> **Priority (owner, 31 Oct):** finish the app first: backend, mobile and the
> dashboard's app staff screens. Website and shop work (Phase 3, plus A2, A3, A6
> and the shop parts of A4) is on hold until the app is done.

Each phase ends with something you can demo. Keep to one concern per PR, as `AGENTS.md` asks.

### Phase 0: Ground truth and a working local stack (1–2 days)

1. Run every suite and record a baseline:
   - backend: PostGIS + Redis, `prisma generate`, `migrate deploy`, seed, `jest`, `npm test` e2e
   - `pavdental`: `npm run test:all`
   - website: `npm test` and `npm run build`
   - dashboard: `npm test` and `npm run build`
2. **A4**: fix the port map: backend `3000`, dashboard `3001`, website `8080`, Expo `8081`.
   Update every `.env.example`, the CORS lists and the fallbacks.
3. **B1**: add one shared placeholder check, so any `replace_*` value means mock or not-sent in dev.
4. **B5**: add `postinstall: prisma generate`.
5. Write `docs/LOCAL-DEV.md` (new, from scratch): how to start all four apps and which seeded logins to use.
6. Smoke-test each app in a browser or simulator and record what really works.

**Done when:** all four apps run together locally and all suites are green or have a ticket.

### Phase 1: Core patient journeys work end to end (1–2 weeks)

Fix M1 first, then prove each journey with a backend e2e test plus a Maestro flow:

| # | Journey | Main pieces |
|---|---|---|
| J1 | Sign up → verify email → onboarding (profile, address, history, consents) | auth, onboarding |
| J2 | Clinic booking with deposit (mock **and** Stripe test + `stripe listen`) | **M1**, payments webhook |
| J3 | Cancel, cancel with refund, late-cancel policy | cancellations |
| J4 | Video consult: intake → photos → waiting → clinician admits → call → summary | video, clinician queue |
| J5 | Van request: coverage check → deposit hold → operator accepts → live ETA → complete or capture | van, operator app |
| J6 | Records: odontogram, sign/decline treatment plan, prescription PDF link | patients, prescriptions |
| J7 | Messages: patient ↔ staff inbox (dashboard) | messages |
| J8 | Rewards, referrals, dependants, saved cards | rewards, referrals |
| J9 | Account deletion and data export (SAR) → dashboard erasure queue | erasure |
| J10 | Clinician day: schedule → notes → complete or no-show; operator shift → route → check-in | clinician and operator groups |

**Done when:** all ten pass locally on mock providers, and J2 and J5 also pass on Stripe test.

### Phase 2: The staff dashboard is complete and honest (1 week)

1. **A1**: remove the template demo pages (owner sign-off needed, since this deletes features) and add `inventory` to the sidebar.
2. **B3**: add a van coverage editor (polygon draw or import) and an operator assignment screen.
3. Add an overview home page using `GET /api/admin/overview`, in place of the redirect to `bookings`.
4. **A5, A6**: tidy the users page and replace the JWT code.
5. **A7**: decide how website bookings and app appointments relate, then build that.

### Phase 3: Website and shop complete (1 week)

1. **A2**: add a Resend email service: shopper verification and reset, clinic alerts for every form, order confirmation.
2. **A3**: add a reset-confirm endpoint, plus `/verify-email` and `/reset-password` pages on the website (these
   also act as the fallback pages for **M4**).
3. **W2**: signed-in header, sign-out, and an account page with order history.
4. **W1**: remove better-auth/PGlite/multiplayer/preview scaffolding; keep the one real auth system.
5. **W3**: either configure Firebase Google sign-in or remove the button. **W4**: move the token to an httpOnly cookie.
6. Shop end to end: cart → Stripe Checkout → webhook → order status → refund from the dashboard.

### Phase 4: Orphan backend features (decide, then 3–5 days)

For each B2 endpoint, either build the screen (M5: phone verification, consent history,
finance application) or delete the endpoint and its tests. **M6** (server triage) and
**M2** (in-app video) are owner/clinical decisions.

### Phase 5: Production readiness (1–2 weeks, partly outside the code)

1. Real providers in staging: Stripe test, Postmark, Twilio, Daily, S3, Sentry. `validateDeployedConfig`
   must pass with no gaps.
2. Mobile: `eas init` (projectId), FCM and APNs credentials (**M3**), real AASA Team ID and release
   SHA-256 (**M4**), a single production API domain (**M7**), dev and preview builds on real devices.
3. Bring the test environment up to all 41 migrations (**R3**); add CI deploys for the website and dashboard.
4. Security pass: dashboard proxy allowlist, rate limits, PHI-in-logs tests, a dependency audit.
5. Legal and clinical sign-off: DPIA, privacy notice, clinical wording (drafts exist in `docs/compliance`).
6. **R1**: clean the repo.

---

## 4. Decisions needed from the owner

1. Delete the dashboard template pages (A1)?
2. Website booking form: a callback request, or a real app appointment (A7)?
3. In-app video (Daily SDK) or the browser link for v1 (M2)?
4. Server-side triage escalation in the app (M6), which is a clinical call?
5. For each orphan endpoint in B2: build it or delete it?
6. Keep Google sign-in on the website (W3)?
7. Which is the canonical production domain: `pavdental.com` or `pavdental.co.uk` (M7)?
8. Move `neo-financial-ios/` out of the repo (R1)?
9. **Reschedule (new, J3).** The "Reschedule" button on an appointment doesn't work: it opens the slot
   picker, which ignores it, and the backend has no reschedule endpoint. What happens to the deposit
   on a reschedule, and is there a late-reschedule rule? This touches how payments are handled, so it needs your call.
10. **Video "now" (new, J4).** The emergency modal used to promise a video triage "now", but video
    consults are booked slots (the earliest is at least an hour away, within the rota). Is an on-demand
    queue wanted, or are booked slots enough for v1?
11. **Stuck van shifts (new, B6).** If an operator forgets to end a shift, nobody else can start one
    on that van: shifts don't time out and there's no admin control to end one. Should stale
    shifts end automatically after a set time with no location updates, should staff get an end-shift
    button, or both?

### Phase 4: unused endpoints (decided 1 Nov)

| Endpoint | Outcome |
|---|---|
| `GET /api/van/queue`, `GET /api/van/requests/incoming` | **Deleted** (replaced by `/api/van/shift/current`) |
| `DELETE /api/notifications/tokens/:token` | **Deleted** (sign-out removes the token; push off is a saved preference) |
| `POST /api/audit/log` + the app's `audit-logger.ts` | **Deleted** (the server audits every request) |
| `POST /api/auth/mfa/verify-session` + `middleware/mfa.ts` | **Deleted** (no route used a step-up check). The login still writes `MfaVerification` rows that nothing reads; dropping the table needs a migration, so left for now |
| `POST /api/consents/data-deletion-request` | **Deleted** (patients ask for erasure with "Delete account") |
| `POST /api/triage/check`, `GET /api/triage/emergency-info` | Waiting: clinical decision |
| `POST /api/financing/apply` | Kept: deliberately retired, returns 410 with the finance page link |
| `GET/POST /api/audit/integrity\|retention\|failures`, `GET /api/audit/logs` | Kept: admin operations tools |

- **Consent wording (legal):** "Recall & preventive reminders", which are checkup reminders, is recorded as *marketing*
  consent. Check whether recall reminders are really marketing under PECR/GDPR.

### Other new findings (not yet fixed)

- **Treatment plan → booking** (`records/plans/[id].tsx`) matches the plan to a service by fuzzy
  name, then falls back to "any restorative service", then to the first service. A plan can book the
  wrong treatment. It should use the plan item's `serviceId`, or send the patient to the catalog.
- **"Deposit paid"** on the appointment page shows the service's deposit amount, not what was paid
  (`depositPaidPence`).
- **Tooth numbering.** The chart numbers teeth 1–32 (US Universal system). UK dentists usually use
  FDI (11–48) or Palmer notation. Clinical decision.
- **Prescribing is only reachable from the video consult room.** A clinician seeing a patient in the clinic
  or van has no prescription screen. Is that intended?
- **Seed data is in London** (Canary Wharf clinic, London van sectors). The practice address in the
  website docs is Bradford. Check which is right before any shared test environment.
