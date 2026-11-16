# Pav Dental

Monorepo for the Pav Dental platform. Each app has its own `package.json`, lockfile, environment, and test suite (there is no root workspace).

## Apps

| Folder | Description | Stack | Local Port |
|---|---|---|---|
| `backend/` | Core API and sole owner of patient & clinical data | Express, Prisma, Postgres (PostGIS), Redis, Stripe, Daily | `3000` |
| `pavdental/` | Patient, clinician, and van mobile app | Expo (React Native), Expo Router | `8081` |
| `website/` | Public marketing site and shop (`www`) | TanStack Start, Vite | `8080` |
| `admin-dashboard/` | Staff back office for the website and app | Next.js 16, shadcn/ui | `3001` |

## Local Setup

Full instructions (including seeded dev accounts and mobile build notes) are in [`docs/LOCAL-DEV.md`](docs/LOCAL-DEV.md).

1. **Start Postgres (PostGIS) and Redis:**
   ```bash
   docker compose up -d postgres redis
   ```
2. **Backend (`backend/`):**
   ```bash
   cd backend
   npm ci
   cp .env.example .env
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed
   npm run dev
   ```
3. **Mobile app (`pavdental/`):**
   ```bash
   cd pavdental
   npm ci
   cp .env.example .env
   npx expo start
   ```
4. **Staff dashboard (`admin-dashboard/`):**
   ```bash
   cd admin-dashboard
   npm ci
   # Create .env.local per docs/LOCAL-DEV.md
   npx next dev -p 3001
   ```
5. **Website (`website/`):**
   ```bash
   cd website
   npm ci
   cp .env.example .env
   npm run dev
   ```

## Verification

Run the single `verify` script in each frontend/mobile app:

```bash
cd pavdental && npm run verify         # typecheck + lint + test:all
cd admin-dashboard && npm run verify   # typecheck + lint:ci + test
cd website && npm run verify           # typecheck + lint + test
```

For `backend/` (requires Postgres & Redis running, and no dev server running):

```bash
cd backend
npx tsc --noEmit
npm run lint
npx jest
NODE_OPTIONS="--import ./test/stubs/external-fetch.mjs" DAILY_API_KEY=stub npm test
```

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full CI pipeline (including bundle budget, `expo-doctor`, migration drift, and production builds).

## Documentation & Agent Rules

- [`docs/README.md`](docs/README.md) — Index of architecture, runbooks, compliance, and planning docs
- [`AGENTS.md`](AGENTS.md) — Repository rules and folder boundaries
