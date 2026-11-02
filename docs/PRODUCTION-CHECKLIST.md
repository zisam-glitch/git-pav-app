# Production checklist: the app (backend, mobile, staff dashboard)

Written 1 Nov 2026 from the code on this branch. Everything here needs an
account, a credential or a decision only the owner has. The website isn't
covered (on hold), except the two pages the app's emails link to (step 7).

Tick each section in order. Each one says how to check it worked.

---

## 0. Decide first

| Decision | Why it blocks | Where it's used |
|---|---|---|
| **Production domain:** `pavdental.com` or `pavdental.co.uk` | Deep links, email links, API URL and CORS all name it. The code mostly says `pavdental.com` (`app.json`, `eas.json`, `website/public/.well-known`), but `pavdental/.env.example` says `api.pavdental.co.uk` | Steps 2, 5, 6, 7 |
| **Clinician sign-off** on: tooth numbering (1–32 US system vs FDI/Palmer), prescribing only from the video room, the "Book a video triage" wording, emergency triage on the phone only | Clinical wording and behaviour are drafts until a clinician reviews them (`AGENTS.md`) | App screens |
| **Legal/DPO sign-off:** DPIA, privacy notice (`docs/compliance/`), whether recall reminders count as *marketing* consent | Patients' consent text and records depend on it | Consent screen |
| Reschedule rules, on-demand video, stuck van shifts | Features waiting on you (see `COMPLETION-PLAN.md`, decisions 9–11) | Not launch-blocking if left out |

---

## 1. Accounts to create

| Service | What it's for | Notes |
|---|---|---|
| Stripe (live mode; test mode first) | Deposits, saved cards, van holds | Live keys only in production; the server refuses test or mock keys there |
| Postmark | Sign-in codes, verification and password emails, staff invites | Verify the sending domain (SPF, DKIM) |
| Twilio | SMS sign-in and phone-change codes | A UK sender number |
| Daily.co | Video consults | Private rooms are created per appointment |
| AWS S3 (or an S3-compatible store via `S3_ENDPOINT`) | Patient documents, prescription PDFs, triage photos | A private bucket in the UK/EU |
| Sentry | Error tracking for backend, app and dashboard | Events are scrubbed of health data in code |
| Expo (EAS) | App builds, store submission, push notifications | Needed for `eas init` |
| Google Cloud (Maps Platform) | The live van map in the app, and road routes and drive times | Billing must be on; set a budget alert |
| Apple Developer + Google Play | Store listings, push credentials, deep links | Apple Team ID is needed in step 6 |

---

## 2. Backend settings

Put these in the host's secret store (Render, or whichever host). Never in the repo.

| Setting | Value |
|---|---|
| `NODE_ENV` | `production` (or `staging` for the test environment) |
| `DATABASE_URL` | Postgres 16+ with PostGIS. Run `CREATE EXTENSION IF NOT EXISTS postgis;` once |
| `REDIS_URL` | Redis 7 (`rediss://` with TLS) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AUDIT_IP_HMAC_SECRET`, `ENCRYPTION_KEY` | Each a different random value, 32+ characters: `openssl rand -hex 32`. **Store `ENCRYPTION_KEY` safely: losing it loses every encrypted note and gate code** |
| `KMS_KEY_ID` | A label for the key version, e.g. `pav-clinical-2026-11` |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` | `sk_live_…` and `pk_live_…` (`sk_test_`/`pk_test_` for staging) |
| `STRIPE_WEBHOOK_SECRET` | From the webhook in step 4 (`whsec_…`) |
| `ALLOWED_ORIGINS` | The https origins of browser callers, e.g. the dashboard; the app itself sends no Origin |
| `APP_URL` | `https://<domain>`. Email links go to `APP_URL/verify-email` and `APP_URL/reset-password` |
| `POSTMARK_SERVER_TOKEN`, `FROM_EMAIL` | From Postmark; `FROM_EMAIL` on the verified domain |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE` | From Twilio |
| `DAILY_API_KEY` | From Daily |
| `S3_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (+ `S3_ENDPOINT` if not AWS) | A key limited to that bucket |
| `PRESCRIPTION_SIGNING_KEY` | An Ed25519 key, base64 PKCS#8 DER. Generate once, keep it safe: `node -e "console.log(require('crypto').generateKeyPairSync('ed25519').privateKey.export({format:'der',type:'pkcs8'}).toString('base64'))"` |
| `PRACTICE_NAME`, `PRACTICE_ADDRESS`, `PRACTICE_PHONE` | Printed on prescriptions and messages |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT` | From Sentry |
| `TRUST_PROXY` | Hops in front of the server (usually `1`) so rate limits see real client IPs |
| `GOOGLE_ROUTES_API_KEY` | Optional. A key restricted to the **Routes API** (and the server's IPs if fixed): road routes on the patient's map and traffic-aware van ETAs. Without it the map draws a straight dashed line and ETAs use a distance estimate. `GOOGLE_MAP_API` is accepted too |
| `RETENTION_ENFORCE` | `false` until the DPO approves; then `true` deletes van location history older than 30 days |
| **Never set** `ALLOW_DEV_DEFAULTS` | The server refuses to start with it in staging or production |

**Check it:** save the settings to a file only you can read, then from `backend/`:

```bash
npm run check:deploy -- production path/to/production.env
```

It reports anything the server would refuse to start with, any missing production service, an
unusable prescription key and http origins. It never prints a value. Delete the file afterwards.

---

## 3. Database and first deploy

1. Deploy the backend Docker image (`backend/Dockerfile`).
2. Release command: `npx prisma migrate deploy`. **The test environment is behind:** its
   status page says 37 migrations are applied, and the branch has 41.
3. **Don't run the seed against production.** Even its "reference" scope creates *sample*
   London clinics ("Pav Dental Canary Wharf"…), a van and London service areas, which would
   show patients clinics that don't exist. Set up the real clinics, services, opening hours,
   clinicians, vans and service areas from the dashboard instead (step 8).
4. Create the first admin, from a machine with the production settings, in `backend/`:
   ```bash
   npm run create:admin -- you@yourpractice.example
   ```
   This emails a link to set the password (valid 72 hours). It refuses once any admin exists:
   add everyone else from the dashboard.

**Check it:** `GET /healthz` returns `"database":"ok","redis":"ok"`.

---

## 4. Stripe

1. Webhook endpoint: `https://<api-domain>/api/payments/webhook`, with these events:
   `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`,
   `payment_intent.canceled`, `payment_intent.payment_failed`, `charge.refunded`,
   `charge.dispute.created`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
2. Apple Pay: register the merchant ID `merchant.com.pavdental.app` in Apple Developer, and add
   the Apple Pay certificate in Stripe. (The app's Stripe setup asked for a different
   merchant ID until 1 Nov; fixed.)
3. Google Pay: enable it in the Stripe dashboard.

**Check it (test mode first):** book a clinic visit in a preview build with a test card. The
appointment shows as confirmed in the app and under App Appointments in the dashboard.

---

## 5. Mobile app (EAS)

1. In `pavdental/`: `npx eas init`. This writes the project ID to `app.json`, which push
   notifications need. Until then, no device can register for push.
2. Push credentials: upload an APNs key (Apple) and FCM credentials (`google-services.json`
   from Firebase) with `eas credentials`.
3. Build-time settings per profile, with `eas env:create` (not in `eas.json`):
   `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_` for preview, `pk_live_` for production),
   `EXPO_PUBLIC_SENTRY_DSN`. The API URL is in `eas.json`: preview uses
   `https://pavdental-api.onrender.com`, production `https://api.pavdental.com`. Change it if
   the domain decision says otherwise.
4. Never set `EXPO_PUBLIC_DEMO_LOGIN` or `EXPO_PUBLIC_ENABLE_ROLE_SWITCHER` on a release profile.
   A test now fails if either is set in `eas.json`.
5. Build: `eas build --profile preview` for testers, `--profile production` for the stores.

**Check it, on a real iPhone and a real Android phone:**
- [ ] Sign up, verify your email from the link, finish onboarding
- [ ] Book and pay a clinic deposit with a test card (Apple Pay / Google Pay too)
- [ ] Book a video consult; the call opens in the in-app window with camera and microphone
- [ ] Request a van inside a service area; the operator accepts on another phone
- [ ] A reminder push notification arrives
- [ ] Sign out removes push (no more notifications on that phone)

---

## 5a. The live van map (Google Maps)

1. In Google Cloud, enable **Maps SDK for Android**, **Maps SDK for iOS** and **Routes API**.
2. Create three keys, each restricted:
   - Android: "Android apps", package `com.pavdental.app` + your signing SHA-1s (EAS keystore
     and Play App Signing); API: Maps SDK for Android.
   - iOS: "iOS apps", bundle ID `com.pavdental.app`; API: Maps SDK for iOS.
   - Server: API: Routes API only (step 2, `GOOGLE_ROUTES_API_KEY`).
3. Add the app keys to EAS (`--visibility sensitive`, for preview and production):
   `GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY`. `pavdental/app.config.js` passes
   them to the maps plugin at build time. A Maps key in a mobile app is always readable from
   the app itself, so the restrictions are what protect it.
4. Set a budget alert in Google Cloud Billing.

Without the keys: iPhones show Apple Maps, Android shows the status panel, and the line is
straight. **Check it:** on a preview build, request a van; once the operator is driving,
the van moves on the map along the road route.

## 6. Deep links (email links that open the app)

The files are served by the website from `website/public/.well-known/`:

1. `apple-app-site-association`: replace `APPLE_TEAM_ID` with your 10-character Team ID
   (Apple Developer → Membership).
2. `assetlinks.json`: replace the fingerprint with your **release** signing key's SHA-256
   (`eas credentials` → Android → keystore). The one there now is very likely a debug key.
3. If the domain isn't `pavdental.com`, update `associatedDomains` and `intentFilters` in
   `pavdental/app.json` to match.

**Check it:** tap a password-reset email link on a phone with the app installed: it opens the
app's reset screen, not the browser.

---

## 7. Pages the app's emails link to (launch blocker)

Verification, password-reset and **staff invitation** emails link to
`APP_URL/verify-email` and `APP_URL/reset-password`. With the app installed and step 6 done,
they open the app. **Without the app, they land on the website, which has no such pages.**
That means a new clinician or operator added from the dashboard, **and the first admin
from `create:admin`**, can't set a password unless they've installed the app first. Workaround
until the pages exist: open the link on a phone with the app installed. Two small website pages fix this. They need the backend
calls `/api/auth/verify-email/confirm` and `/api/auth/password-reset/confirm`, and the website
origin in `ALLOWED_ORIGINS`. Not built yet, because website work is on hold.

---

## 8. Staff dashboard

| Setting | Value |
|---|---|
| `PAV_API_URL` | The backend's https URL |
| `ADMIN_JWT_SECRET` | A long random value (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | The dashboard's own URL |
| `DATABASE_URL` | The dashboard's own Postgres (website shop, blog, forms data) |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | From Sentry |
| Leave blank | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SALT`: only a fallback when `PAV_API_URL` is blank |

Staff sign in with their app account (role admin) and a security code by email or SMS, so
Postmark or Twilio must work first.

**Check it:** sign in, open **Vans & Service Areas**, add the real service areas (draw them at
geojson.io and paste) and assign each van's operator. Until then, no patient can request a van.

---

## 9. Before go-live

- [ ] CI green on the release commit (backend, mobile, dashboard, Docker build)
- [ ] `npm run check:deploy -- production …` reports no problems
- [ ] Staging walked through with the phone checks in step 5
- [ ] Backups and restore tested (`docs/deploy/backup-and-restore-runbook.md`; check it
      against the real host)
- [ ] Penetration test (`docs/security/penetration-test-scope.md`)
- [ ] Stripe switched to live keys only after all of the above
