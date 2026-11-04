# Pav Dental Website: rules for agents

This folder contains the public-facing marketing website and online shop for Pav Dental (`www.pavdental.com`).

## Architecture & Stack

- **Framework**: TanStack Start (React 19) with TanStack Router for file-based routing (`src/routes/`).
- **Bundler & Server**: Vite 6 + Nitro (`preset: "vercel"`, output in `.vercel/output/`).
- **Styling**: Tailwind CSS v4 with Lucide React icons.
- **State & Data**: TanStack Query (`@tanstack/react-query`).
- **Deployment**: Vercel (`pavdental-website` project under `project-kaizen1`).

## Directory Structure

- `src/routes/`: File-based routes (`/`, `/about`, `/contact`, `/pricing`, `/team`, `/shop`, `/privacy`, `/terms`, etc.).
- `src/components/`: Reusable UI components grouped by feature (`home/`, `about/`, `shop/`, `team/`, etc.).
- `src/lib/`: Utilities, analytics, the account-link helpers (`app-account.ts`), query provider.
- `public/`: Static assets (favicons, images, logos).
- `scripts/`: Build environment and validation scripts.

## Rules & Verification

- **Checks to run**:
  - `npm run typecheck` (`tsc --noEmit`)
  - `npm test` (unit and integration tests)
  - `npm run build` (production build generating `.vercel/output`)
- **No Fabricated Data**:
  - Only real clinical team profiles (Dr. Hassan Bhojani GDC 262970, Dr. Cosimo Meucci GDC 280128).
  - Accurate practice details: 786 Leeds Road, Bradford, BD3 9TY.
  - No fake claims, fabricated reviews, or unverified regulatory statements.
- **Privacy & Security**:
  - Google Analytics 4 (`G-KZVKDLY449`) must only load after cookie consent is granted.
  - Never commit real secrets or `.env*` files.
