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
- `seo/`: the recorded live site (`live-baseline.json`, `live-text/`, `live-content/`); see `seo/README.md`.
- `src/content/live-pages.ts`: text pages ported word for word from the live site (FAQ, CCTV policy, practice documents, services index), shown by `LiveContentPage`.
- `src/content/team-members.ts` and `src/content/blog-posts.ts`: the eight team profiles and the six blog posts, ported word for word and checked against the recorded live pages by their tests.
- `src/content/testimonials.ts` and `src/content/petition.ts`: the patient comments under "What people say?" (home and aesthetics) and the petition page's words, ported word for word and checked against the recorded live pages by their tests.
- Booking: every Book or appointment link uses `BOOKING_URL` from `src/lib/enquiry.ts`, the practice's Setmore page, as on the live site; `/booking` redirects there. `src/content/booking-links.test.ts` fails on any other target. Do not add a booking form to the site.
- Not found: an address that is no page is a real 404 with the branded `NotFoundPage` and `noindex`. The catch-all route `src/routes/$.tsx` does it for unknown addresses; a route whose loader can throw `notFound()` (blog, team) must also set `notFoundComponent: NotFoundPage`, or the router skips that route's `head` and the page gets no `noindex`. Links on the page are checked by `src/content/not-found.test.ts`.
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
  - Team profiles are the eight people on the live team page, kept in `src/content/team-members.ts` and ported word for word. Clinicians show their GDC numbers (Dr Hassan Bhojani 262970, Dr Cosimo Meucci 280128). Don't add or invent people without the owner's say-so.
  - Accurate practice details: 786 Leeds Road, Bradford, BD3 9TY.
  - No fake claims, fabricated reviews, or unverified regulatory statements.
  - The only patient comments are the ones in `src/content/testimonials.ts`, which the live site publishes. No star ratings, review counts, `AggregateRating` markup, signature counters or made-up signers: `src/content/invented-content.test.ts` fails if any come back. The petition's list of signers is personal data and is not kept in the repo (the crawler leaves it out of `seo/live-text/`).
- **SEO (same or better than the live site)**:
  - Keep the live URLs. If a page has to move, add its old path to `MOVED_PATHS` in `src/lib/seo.ts` (permanent redirect).
  - Every route sets its head with `seoHead(path)` (or `noindexHead` for carts, checkout and private pages). Live titles and descriptions are copied word for word and `src/lib/seo.test.ts` fails if one changes: changing one is the owner's decision.
  - After adding a page to `PAGES`, run `npm run seo:sitemap`.
- **Privacy & Security**:
  - Google Analytics 4 (`G-KZVKDLY449`) must only load after cookie consent is granted.
  - Never commit real secrets or `.env*` files.
