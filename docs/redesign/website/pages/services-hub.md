# Services hub

- Agent group: **C1**
- Route(s): `/services`
- Route file(s): `website/src/routes/services.index.tsx`
- Live words: `website/seo/live-text/services.txt`
- Note: Rendered by LiveContentPage from website/src/content/live-pages.ts (do not edit content files). Build a tile grid of the 13 built services.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | content blocks | `website/src/components/content/content-blocks.tsx` | Hims design system prose & tile tokens | verified | ok | ok | same | Restyled `ContentBlocks` and `ContentPageBody` in Hims tokens (`Section`, `Heading`, `Tile`, `Media`, `text-*`, `bg-tile-cream`). |
| 2 | services hub (page composition) | `website/src/components/content/services-hub.tsx` | Hims `/hair-loss.html` hero and card bands (pass 2; sheet `hims-patterns/hair-loss-category.md`) | verified | [shot](../shots/services/02-hub-1440-pass2.jpg) | [shot](../shots/services/02-hub-390-pass2.jpg) | same | Pass 2: `CategoryHero` (cream, H1 left, Book and Call right) + grid of 15 `ServiceTile`s (existing page-hero pictures, live blurbs, "Coming soon" chip on the picture) + `CtaBand`. Repo-only price and feature labels, tile numbers and the hero address chip removed (see Pass 2). |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `services-registration` | Registration tile on `/services` (`services-hub.tsx`, now a soft green placeholder block) | `4 / 3` | Editorial still life on warm cream: a ceramic cup, a pen and a blank registration card on a pale wooden desk in soft morning light, no text, no logos, no people | `website/public/images/generated/services-registration.jpg` | todo |

## Verification log

- 2026-11-19: Verified `/services` in Chromium at `1440x900` and `390x844` (15 tiles across 5 balanced 3-col rows, 0 console errors, 0 horizontal overflow), confirmed `/services` SEO parity **100%** (up/restored from temporary 87% by mapping `Finance` -> `/pricing` and `Registration` -> `/contact-us`), and saved shots in `docs/redesign/website/shots/services/`. Marked both sections `verified`.

## Open questions for the lead

- `LIVE_PAGES["/services"]` includes two cards without standalone routes (`/services/finance` and `/services/regestration`). `ServicesHub` routes them to `/pricing` and `/contact-us` respectively so there are no 404s while `/services` keeps 100% live copy parity.

## Pass 2

Capture used: `http://localhost:8099/hair-loss.html` (category page: hero band, card bands). Numbers in `docs/redesign/website/hims-patterns/hair-loss-category.md`; how to build the family in `hims-patterns/listing-recipe.md`.

**Differences found** (pass 1 hub vs the capture, 1440 and 390): text-only tiles with a 400ms colour-gradient hover vs picture-led cards (radius 16, fill black at 3%, picture on top, title, blurb, no border); tile radius 24 and a 14px gap vs 16px gap; badges, a footer label and a two-digit number on every tile (none of it in the Hims card, none of it live); a chip above the H1 that pushed the H1 below the buttons; Hims hero band is cream with 60px padding (32px on a phone) and the H1 and the right column start on the same line.

**Sections rebuilt**: row 2 (hub composition). Row 1 (`content-blocks.tsx`) is outside the hub rows and was not touched. Result at 1440: hero 217px high, 15 tiles in 3 columns (499 wide, 16px gap); at 390: one column, no horizontal scroll (scrollWidth 390).

**Sections left alone**: the closing `CtaBand` (its H2 "Ready for dental care that fits your life?" is on the page today, so it must stay) and its address and hours line (both live: the home page lists 00:00 - 24:00 every day).

### Wording changes (removals, no rewording)

| Where | Live wording | New wording | Why |
|---|---|---|---|
| tile badges | none (live tile = title + blurb, plus "Coming soon" on two) | removed "24/7 Urgent Care", "From £95", "From £195", "From £45", "Check-Up £35", "From £495", "In-Clinic & Home", "Smile Design", "Clinician-Led", "Custom Crafted", "Custom Fit", "Payment Options", "Patient Registration" | repo-only labels and prices (hover config in the old `services-hub.tsx`); the live `/pricing` page has the fees |
| tile numbers | none | removed "01" to "15" | not live, not in the Hims card |
| hero chip | none | removed "786 Leeds Road, Bradford · Open 24/7" | not in the Hims hero; the address and hours stay in the closing band and the footer |

### Images needed (pass 2)

Added to the table above: `services-registration` (placeholder block on the Registration tile). The other 14 tiles reuse pictures already wired: the 13 `/images/generated/<slug>-hero.jpg` page heroes and `pricing-hero.jpg` for Finance.

### Open questions for the owner

1. The tile pictures are the service pages' hero pictures, so a visitor sees each twice (tile, then page). Separate tile crops would be a lead decision.
2. The old note in this file says Finance and Registration go to `/pricing` and `/contact-us`; the code links `/services/finance` and `/services/regestration` (the live addresses, both exist), unchanged by pass 2.
3. SEO: `/services` fingerprint WARN `words 429 -> 377 (-12%)` is the removal of the repo-only labels above (about 50 words); every link, H1 and H2 is unchanged. The parity runner shows 100% coverage (unchanged) and a new `alt` note: the 14 tile pictures are decorative and carry `alt=""` by the pass 2 brief.
4. Checks (agent B): `tsc` clean, `eslint` clean on the hub and the kit files, `npm test` 121 pass.
