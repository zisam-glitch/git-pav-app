# Pav Dental Website: rules for agents

This folder contains the public-facing marketing website and online shop for Pav Dental (`www.pavdental.com`).

## Architecture & Stack

- **Framework**: TanStack Start (React 19) with TanStack Router for file-based routing (`src/routes/`).
- **Bundler & Server**: Vite 6 + Nitro (`preset: "vercel"`, output in `.vercel/output/`).
- **Styling**: Tailwind CSS v4 with Lucide React icons.
- **State & Data**: TanStack Query (`@tanstack/react-query`).
- **Deployment**: Vercel (`pavdental-website` project under `project-kaizen1`).

## Directory Structure

- `src/routes/`: File-based routes at the live site's URLs (`/`, `/about`, `/services/whitening` and the other `/services/*` pages, `/contact-us`, `/blog`, `/privacy-policy`, `/terms-and-condition`, `/shop`, etc.).
- `src/lib/seo.ts`: every page's title, description and head tags, the practice's structured data, and the permanent redirects.
- `seo/`: the recorded live site (`live-baseline.json`, `live-text/`); see `seo/README.md`.
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
- **SEO (same or better than the live site)**:
  - Keep the live URLs. If a page has to move, add its old path to `MOVED_PATHS` in `src/lib/seo.ts` (permanent redirect).
  - Every route sets its head with `seoHead(path)` (or `noindexHead` for carts, checkout and private pages). Live titles and descriptions are copied word for word and `src/lib/seo.test.ts` fails if one changes: changing one is the owner's decision.
  - After adding a page to `PAGES`, run `npm run seo:sitemap`.
- **Privacy & Security**:
  - Google Analytics 4 (`G-KZVKDLY449`) must only load after cookie consent is granted.
  - Never commit real secrets or `.env*` files.
