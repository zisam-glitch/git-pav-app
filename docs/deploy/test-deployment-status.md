# Pav Dental: Test Deployment Status

Current status and endpoints of the live test deployment running on free-tier cloud infrastructure, per [`free-test-setup.md`](./free-test-setup.md).

> [!WARNING]
> This environment is strictly for **synthetic and fake data only**. Never enter real patient health or personal data. Free-tier hosts sleep after periods of inactivity and background jobs catch up when awakened.

---

## 1. Live Infrastructure & Endpoints

| Component | Provider & Tier | Region | Resource ID | Status | Live URL / Endpoint |
|---|---|---|---|---|---|
| **Backend API** | Render (Free Web Service, Docker) | `frankfurt` | `srv-dbdvgarncjis73dl7jig` (deploy: `dep-dbdvhnvavr4c739imb1g`) | **Down on 4 Nov: `/healthz` returns 503, `database: error`** | [https://pavdental-api.onrender.com](https://pavdental-api.onrender.com/health) |
| **Admin Dashboard** | Vercel (Hobby, Next.js 16) | Global Edge | `prj_tMvj5TnRlgfT2omPZmmKSeu8gS41` | **Live (Production)** | [https://pavdental-admin.vercel.app](https://pavdental-admin.vercel.app) |
| **App Database** | Supabase (Postgres 17 + PostGIS) | `eu-west-2` (London) | `wcyrylagoulmtcqpzfem` (`pavdental-app-test`) | **Live (Active)** | Pooler: `aws-0-eu-west-2.pooler.supabase.com:6543` |
| **Dashboard Database** | Supabase (Postgres 17) | `eu-west-2` (London) | `gtbvlqdurhwnrzjlikav` (`pavdental-dashboard-test`) | **Live (Active)** | Pooler: `aws-0-eu-west-2.pooler.supabase.com:6543` |
| **Redis** | Upstash (Serverless Redis) | `eu-west-1` (Ireland) | `72e6eda4-49d8-4af6-a18f-76fc26ee00e3` (`pavdental-test`) | **Live (Active)** | `present-redbird-109711.upstash.io:6379` (TLS) |
| **Payments** | Stripe (Test Mode) | Global | `acct_1UE8NQDyO85IDEtt` (Growriva sandbox) | **Active** | Webhook: `we_1UTsd0DyO85IDEttlQzzzdku` |

---

## 2. Health & Verification Summary

All components were smoke-tested and verified functional:

### Backend API (`/health`)
```bash
curl -s https://pavdental-api.onrender.com/health
```
```json
{
  "status": "ok",
  "service": "pavdental-backend-api",
  "timestamp": "2026-10-25T16:04:25.231Z",
  "checks": {
    "database": "ok",
    "redis": "ok"
  },
  "requestId": "979b9524-ad22-465a-8f13-3b7ef04aefb5"
}
```

### Authentication Test
`POST /api/auth/login` verified against deployed database and Redis session cache using synthetic seed patient:
```bash
curl -s -X POST https://pavdental-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@pavdental.com", "password": "<SEED_DEMO_PASSWORD>"}'
```
- Returned HTTP 200 with signed JWT access token, refresh token, and patient identity `Alexander Wright`.

### Database Schema Status
- **App Database (`wcyrylagoulmtcqpzfem`)**:
  - `postgis` (v3.3.7) and `btree_gist` (v1.7) extensions active.
  - All **37 Prisma migrations** applied (`20260918200550_initial_schema` through `20261025140000_cs05_schema_defaults`).
  - Baseline seed (`npm run prisma:seed`) and default practice hours (`npm run hours:defaults`) populated.
  - Zero schema drift against `schema.prisma`.
- **Dashboard Database (`gtbvlqdurhwnrzjlikav`)**:
  - All **11 SQL migrations** applied (`001_initial_schema.sql` through `010_add_variant_to_order_items.sql`, plus `002_drop_patients_table.sql` per Decision #26).
  - Redundant `patients` table dropped; patient directory proxied directly to backend API via `pavApi`.
  - 24 tables active for shop, blog, newsletter, pricing, inventory, and forms.

### Stripe Webhook Integration
- Registered webhook endpoint: `we_1UTsd0DyO85IDEttlQzzzdku`
- Webhook destination: `https://pavdental-api.onrender.com/api/payments/webhook`
- Enabled events:
  - `payment_intent.succeeded`
  - `payment_intent.amount_capturable_updated`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
  - `charge.refunded`
  - `charge.dispute.created`
- Webhook signing secret (`whsec_...`) active in Render environment.

---

## 3. Client Apps Connection Setup

### Mobile App (`pavdental/`)
In `pavdental/.env` (git-ignored):
```bash
EXPO_PUBLIC_API_URL=https://pavdental-api.onrender.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51UE8NQDyO85IDEttSandBoxTestKey2026
```
Start the mobile development server:
```bash
cd pavdental
npx expo start
```

### Web Admin Dashboard (`admin-dashboard/`)
Live at [https://pavdental-admin.vercel.app](https://pavdental-admin.vercel.app) with environment variables:
- `PAV_API_URL`: `https://pavdental-api.onrender.com`
- `DATABASE_URL`: Transaction pooler on Supabase Project 2 (`gtbvlqdurhwnrzjlikav`)
- `WEBSITE_ORIGIN`: `http://localhost:8080` (or production marketing domain)

### Marketing Website (`website/`)
In `website/.env`:
```bash
VITE_API_BASE_URL=https://pavdental-admin.vercel.app
```

---

## 4. Synthetic Demo Accounts

All seeded accounts use the `SEED_DEMO_PASSWORD` chosen when the database was seeded (see [free-test-setup.md](free-test-setup.md), step 2). It is kept outside the repo, because this API is public. The data is synthetic only.

| Role | Email | Description |
|---|---|---|
| **Patient** | `patient@pavdental.com` | Demo patient with medical history, treatment plans, and document vault |
| **Clinician** | `doctor@pavdental.com` | Lead dentist with assigned appointments and rota |
| **Van Operator** | `van@pavdental.com` | Operator with mobile van assignment and service polygons |
| **Admin** | `admin@pavdental.com` | Staff administrator for practice settings and rota |

---

## 5. Automated MCP Infrastructure

The test deployment is managed through the following connected MCP servers:
- **Render MCP**: `https://mcp.render.com/mcp` (Web services, environment variables, deploy triggers, logs)
- **Upstash MCP**: `https://mcp.upstash.com/mcp` (Redis database provisioning and metrics)
- **Supabase MCP**: Database migrations, SQL queries, and extensions
- **Vercel MCP / CLI**: Next.js deployments and environment variable management
- **Stripe MCP**: Payment intents, customer management, and webhook configurations
