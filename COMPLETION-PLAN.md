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
