# Pav Dental monorepo: rules for agents

This repo holds four separate apps. Work out which one a task belongs to
before you open a file, and stay inside that folder unless the task really
spans two (for example a new backend endpoint and the dashboard screen that
uses it). Each folder has its own `package.json`, lockfile, checks and
deploy. There is no root package and no shared install.

| Folder | What it is | Stack | Checks to run |
|---|---|---|---|
| `backend/` | The app's API and the only owner of patient and clinical data | Express, Prisma, Postgres (PostGIS), Redis, Stripe, Daily | `npx tsc --noEmit`, `npx jest`, `npm test` (e2e). See `.github/workflows/ci.yml` for the env it needs |
| `pavdental/` | The patient, clinician and van mobile app | Expo (React Native), Expo Router | `npx tsc --noEmit`, `npm run test:all` |
| `website/` | The public marketing site and shop (www) | TanStack Start, Vite | `npm run typecheck`, `npm test` |
| `admin-dashboard/` | The staff back office for the website **and** the app | Next.js 16, shadcn/ui | `npm test`, `npm run build` |

Other top-level files: `docs/completion/` (plan, decisions log, migration
rules), `docker-compose.yml` (local Postgres and Redis for
the backend). Read the folder's own `AGENTS.md` (where there is one) for its
local conventions; it wins over this file for that folder.

## Which folder for which task

- **Booking, appointments, rota, clinic hours, payments, prescriptions,
  video, vans, patients' records:** `backend/`, plus `pavdental/` for app
  screens and `admin-dashboard/` for staff screens.
- **Staff screens for app data:** `admin-dashboard/` only. They call the
  backend's `/api/admin/*` endpoints through `src/lib/pav-api.server.ts`,
  signed in as the staff member. Never give the dashboard its own copy of
  app data or a direct connection to the backend's database.
- **Website pages, shop, blog, newsletter, contact forms:** `website/`, plus
  `admin-dashboard/` for managing them (that data lives in the dashboard's
  own database).
- **Database schema for the app:** `backend/prisma/` only, following
  `docs/completion/migrations.md`.

## Ground rules (all folders)

- Health data: no real patient data in fixtures, seeds, logs, screenshots,
  tickets or commits. Use synthetic data (`@example.test` emails). Treat any
  personal or health data reaching a log or error report as a high-severity
  bug.
- Stripe is test mode only. Never commit real keys or secrets; `.env*` files
  are ignored except `.env.example`.
- Keep every suite green. Never weaken, skip or delete a test to make it pass.
- Ask the owner before: destructive or irreversible migrations, changing how
  payments are captured or refunded, deleting a feature, adding a paid
  third-party service, or anything needing a legal or clinical decision.
  Clinical wording is a draft until a clinician reviews it.
- Keep change sets small and reviewable, one concern per pull request.
- Don't move files between apps or add a root workspace without asking.
