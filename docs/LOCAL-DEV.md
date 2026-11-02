# Running the app locally (backend + mobile)

Verified on 31 Oct 2026 on Linux with Node 22, Postgres 16 + PostGIS 3.4 and
Redis 7. The website and admin dashboard are not covered here yet.

## 1. Postgres (with PostGIS) and Redis

Either use Docker:

```bash
docker compose up -d postgres redis
```

or native packages (for example `postgresql-16-postgis-3` and `redis-server`), then
create the role and database that `backend/.env.example` expects:

```bash
sudo -u postgres psql -c "CREATE ROLE pavdental LOGIN SUPERUSER PASSWORD 'pavdental_secure_dev_password';" -c "CREATE DATABASE pavdental_db OWNER pavdental;"
```

## 2. Backend

```bash
cd backend
npm ci
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

- **Run `npx prisma generate` after every install.** Without it, `tsc` reports
  about 140 errors and the server won't start.
- `.env.example` works as it is. Provider keys still set to their template values
  (`replace_with…`, `…replace_me`) run in local mode:
  - **Stripe:** mock mode. Deposits are confirmed without a card.
  - **Email and SMS:** nothing is sent. The log shows `(no provider, not sent)`.
  - **Video:** the call screen says video isn't set up yet. Put a real Daily key in
    `DAILY_API_KEY` to test calls.

  The startup log lists which providers are in local mode.
- Check it's up: `curl localhost:3000/healthz` should show `database` and `redis` as `ok`.

### Seeded accounts

The password for all of them is `Password123!` (local only; the seed refuses to
use it anywhere else).

| Role | Email |
|---|---|
| Patient | `patient@pavdental.com` |
| Clinician | `doctor@pavdental.com` |
| Van operator | `van@pavdental.com` |
| Admin | `admin@pavdental.com` |

Staff accounts (clinician, operator, admin) are always asked for a sign-in code.
There's no email or SMS locally, so after entering the password, run:

```bash
npm run dev:login-code -- doctor@pavdental.com
```

New accounts are sent an email verification code, and locally that email
isn't sent either. To get past the app's "Verify your email" screen, run:

```bash
npm run dev:verify-email-code -- someone@example.test
```

It prints a code to type in, and a `pavdental://verify-email?token=…` link.

## 3. Mobile app

```bash
cd pavdental
npm ci
cp .env.example .env
npx expo start
```

- **Which `EXPO_PUBLIC_API_URL` to use:**
  - `http://localhost:3000` for the iOS simulator or web
  - `http://10.0.2.2:3000` for the Android emulator
  - your computer's LAN IP for a real phone
- **Payments and the in-app video window need a development build.** They use
  native modules, so they don't run in Expo Go:
  ```bash
  npx expo run:ios
  ```
  or
  ```bash
  npx expo run:android
  ```
- **Google Maps on the phone:** put `GOOGLE_MAP_API=<key>` in `pavdental/.env`
  (git-ignored) before the first native build. The van tracking map then uses
  Google; without it, iPhone builds show Apple Maps. Re-run
  `npx expo prebuild -p ios` after adding or changing the key.
- **Sentry:** `.env.example` sets `SENTRY_DISABLE_AUTO_UPLOAD=true`. Without it,
  every local native build fails at the source-map upload step.
- **iOS simulator without an Apple signing certificate.** The app's
  entitlements (Apple Pay, associated domains) make `expo run:ios` ask for a
  certificate even for the simulator. Build with ad hoc signing instead, then
  run Metro with `npx expo start`:
  ```bash
  SENTRY_DISABLE_AUTO_UPLOAD=true xcodebuild -workspace ios/PavDental.xcworkspace -scheme PavDental -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17' -derivedDataPath ios/build CODE_SIGN_IDENTITY=- CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= PROVISIONING_PROFILE_SPECIFIER= build
  ```
  ```bash
  xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/PavDental.app
  ```
  Don't turn signing off altogether (`CODE_SIGNING_ALLOWED=NO`): the app then
  has no Keychain access, and sign-in and push setup fail.

## 4. Staff dashboard (the app's back office)

The dashboard signs staff in with their app account and calls the backend's
`/api/admin/*` endpoints. Run it on port 3001 so it doesn't clash with the
backend:

```bash
cd admin-dashboard
npm ci
```

Create `admin-dashboard/.env.local` (git ignores it) with:

```
PAV_API_URL="http://localhost:3000"
ADMIN_JWT_SECRET="any-long-random-string-for-local-use"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

```bash
npx next dev -p 3001
```

Sign in at http://localhost:3001/auth/v1/login as `admin@pavdental.com`, then
get the security code with `npm run dev:login-code -- admin@pavdental.com` in
`backend/`. The website screens (shop, blog, forms) use the dashboard's own
database, which is an embedded one locally when `DATABASE_URL` is blank.

`next dev` rewrites `admin-dashboard/AGENTS.md`; don't commit that change.

## 5. Checks

Backend. The suites need the database and Redis, and **no dev server running**:
its background jobs write to the same database and make some tests flaky.

```bash
cd backend
npx tsc --noEmit
npm run lint
npx jest
NODE_OPTIONS="--import ./test/stubs/external-fetch.mjs" DAILY_API_KEY=stub npm test
```

Mobile:

```bash
cd pavdental
npx tsc --noEmit
npm run test:all
```

If `NODE_OPTIONS` is still set from the backend's e2e command, the mobile tests
fail with `ERR_MODULE_NOT_FOUND`. Unset it first.
