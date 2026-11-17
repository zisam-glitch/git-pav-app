# Free test setup

> [!NOTE]
> For the active endpoints, service IDs, and current live health of the deployed test environment, see [Test Deployment Status](./test-deployment-status.md).

A test copy of Pav Dental running on free tiers, for trying things out with **fake data only**. Never put real patient details into it. It isn't fit for real patients: the free hosts sleep, have no backups worth relying on, and the encryption key lives in an environment variable rather than AWS KMS.

| Piece | Free service | Used by |
|---|---|---|
| App database (Postgres + PostGIS) | Supabase, project 1 | `backend/` |
| Dashboard database (Postgres) | Supabase, project 2 | `admin-dashboard/` |
| Redis | Upstash | `backend/` |
| API | Render web service (Docker) | `backend/` |
| Staff back office | Vercel | `admin-dashboard/` |
| Payments | Stripe test mode | `backend/`, app |
| Staff sign-in codes by email | Postmark developer tier | `backend/` |

Free-tier limits change, so check each provider's current limits when you sign up. Nothing here needs a card except where a provider asks for one to verify you.

You'll need about 30 to 45 minutes. Work through the steps in order: each one produces a value a later step needs. Keep the values in a password manager, not in a file in the repo.

## 1. Secrets you generate yourself

Generate four random secrets on your own machine, one per line:

```bash
for name in JWT_ACCESS_SECRET JWT_REFRESH_SECRET AUDIT_IP_HMAC_SECRET ENCRYPTION_KEY; do
  echo "$name=$(openssl rand -hex 32)"
done
```

Each must be at least 32 characters; the API refuses to start with anything weaker. Also generate one for the dashboard: `ADMIN_JWT_SECRET=$(openssl rand -hex 32)`.

Treat `ENCRYPTION_KEY` with care: if it's lost, encrypted gate codes and door notes can't be read again. `KMS_KEY_ID` can be left unset.

## 2. App database: Supabase project 1

1. Create a Supabase project (pick the London region if offered). Note the database password you choose.
2. In **Database → Extensions**, enable **postgis**. (The migrations also run `CREATE EXTENSION IF NOT EXISTS postgis` and `btree_gist`, but enabling it in the dashboard first avoids permission surprises.)
3. In **Project Settings → Database → Connection string**, copy two URIs:
   - **Direct connection** (port 5432). Use this for migrations and the seed, from your machine.
   - **Transaction pooler** (port 6543). Use this for the running API. Add `?pgbouncer=true&connection_limit=1` to the end. If the URI already has a `?`, use `&` instead.
4. From `backend/` on your machine, with the **direct** URI:

   ```bash
   npm ci
   DATABASE_URL="<direct URI>" npx prisma migrate deploy
   ALLOW_SEED=demo SEED_DEMO_PASSWORD="<a unique password>" DATABASE_URL="<direct URI>" npm run prisma:seed
   DATABASE_URL="<direct URI>" npm run hours:defaults
   ```

   The seed creates demo accounts (`patient@`, `doctor@`, `van@`, `admin@pavdental.com`) with synthetic records, all with `SEED_DEMO_PASSWORD`. Keep that password in a password manager and never write it in the repo: the API is public. The seed refuses a database that isn't on this machine unless `ALLOW_SEED=demo` is set, and it won't use the local default password there. To add only clinics, services and the van (no accounts, records or bookings), run `ALLOW_SEED=reference DATABASE_URL="<direct URI>" npm run prisma:seed:reference` instead; that needs no password.
5. Staff sign in with a security code sent by email (step 6), so the admin and clinician accounts need inboxes you can read. In Supabase's **Table editor → users**, change `admin@pavdental.com` and `doctor@pavdental.com` to addresses you control. Plus-addressing works, for example `you+pavadmin@gmail.com`.

## 3. Redis: Upstash

1. Create a Redis database (pick the region nearest your Render region).
2. Copy the **TLS** connection URL (`rediss://default:<password>@<host>:6379`). That's `REDIS_URL`.

The free tier limits commands per day. The API's background jobs poll every minute, which fits comfortably, but don't load-test against it.

## 4. Payments: Stripe test mode

1. In the Stripe dashboard, make sure **Test mode** is on.
2. From **Developers → API keys**, copy the `sk_test_…` secret key and the `pk_test_…` publishable key.
3. The webhook secret comes after the API is up (step 5.4).

Stripe test cards such as `4242 4242 4242 4242` never move real money.

## 5. API: Render

1. Create a **Web Service** from this GitHub repository and choose **Docker**:
   - Root directory: `backend`
   - Dockerfile path: `./Dockerfile`
   - Instance type: Free
   - Health check path: `/health`
2. Add these environment variables:

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `staging` |
   | `DATABASE_URL` | Supabase **pooler** URI from step 2.3 |
   | `REDIS_URL` | Upstash URL from step 3 |
   | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AUDIT_IP_HMAC_SECRET`, `ENCRYPTION_KEY` | from step 1 |
   | `STRIPE_SECRET_KEY` | `sk_test_…` |
   | `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` |
   | `STRIPE_WEBHOOK_SECRET` | a placeholder `whsec_placeholder` for the first deploy; replace in step 5.4 |
   | `POSTMARK_SERVER_TOKEN`, `FROM_EMAIL` | from step 6 |
   | `DAILY_API_KEY` | `stub` until video is set up |

   `NODE_ENV=staging` makes the API insist on real secrets and real Stripe **test** keys, and refuse mock ones.
3. Deploy. When it's live, `https://<service>.onrender.com/health` should answer.
4. In Stripe, **Developers → Webhooks → Add endpoint**: URL `https://<service>.onrender.com/api/payments/webhook`, events `payment_intent.succeeded`, `payment_intent.amount_capturable_updated`, `payment_intent.payment_failed` and `payment_intent.canceled`. Copy the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` on Render and redeploy.

Things to know about the free instance:
- It sleeps after a period without traffic, so the first request after a pause takes a while.
- While it sleeps, the background jobs (expiring holds and van requests, reminders, the retention sweep) don't run. They catch up when it wakes.
- Uploaded files (triage photos, signed plans) go to the container's disk and are lost on each redeploy. That's acceptable for a test copy; real storage is a production task.

## 6. Staff sign-in codes: Postmark

1. Create a Postmark account and a server. Copy its **Server API token**. That's `POSTMARK_SERVER_TOKEN`.
2. Add a **sender signature** for an address you can confirm, and use it as `FROM_EMAIL`.
3. Until Postmark approves the account, it only delivers to addresses on the same domain as the sender signature. Use the same domain for the staff inboxes from step 2.5, or request approval.

Without Postmark, clinicians and admins can't sign in on the test copy: their login stops at "we couldn't send your code" (502). Patients aren't affected.

## 7. Dashboard: Supabase project 2 + Vercel

The dashboard keeps the website's shop, blog and form data in its own database.

1. Create a second Supabase project. Copy its **Transaction pooler** URI.
2. In its **SQL editor**, run the files in `admin-dashboard/src/lib/db/migrations/` in number order (`001_…` to `008_…`).
3. On Vercel, import this repository with **Root directory** `admin-dashboard` (framework Next.js).
4. Environment variables:

   | Name | Value |
   |---|---|
   | `PAV_API_URL` | `https://<service>.onrender.com` |
   | `ADMIN_JWT_SECRET` | from step 1 |
   | `DATABASE_URL` | Supabase project 2 pooler URI |
   | `WEBSITE_ORIGIN` | your website URL, or `http://localhost:8080` for now |

   Leave Postmark, Cloudinary and Sentry empty; those features just stay off.
5. Deploy, then sign in with the admin account from step 2.5. The code arrives by email.

## 8. The app against the test API

In `pavdental/.env` (not committed):

```bash
EXPO_PUBLIC_API_URL=https://<service>.onrender.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
```

Then run `npx expo start` as usual and sign in with `patient@pavdental.com`.

## The website

The website (`website/`) can stay on your machine for now, with `VITE_API_BASE_URL` pointing at the dashboard. Hosting it is a separate step once the shop flow is being tested.

## When this becomes production

Production needs things this setup leaves out on purpose: AWS KMS for the encryption key (CS-13 part 2), real object storage, paid always-on hosting so background jobs never pause, backups, Sentry, live Stripe keys, and a DPIA sign-off. None of the free services above should hold real patient data.
