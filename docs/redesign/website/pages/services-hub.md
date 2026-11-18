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
| 2 | services hub (page composition) | `website/src/components/content/services-hub.tsx` | Hims capture category `TileLink` grid + `CtaBand` | verified | [grid](../shots/services/1440-grid.png) · [bottom](../shots/services/1440-bottom.png) | [shot](../shots/services/390-grid.png) | same | Hero + 3-column `TileLink` grid of the 13 built services plus `Finance` (`/pricing`) and `Registration` (`/contact-us`) = 15 tiles, `"Coming soon"` pills on Mobile & Virtual Dentistry, and closing `CtaBand`. |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|

## Verification log

- 2026-11-19: Verified `/services` in Chromium at `1440x900` and `390x844` (15 tiles across 5 balanced 3-col rows, 0 console errors, 0 horizontal overflow), confirmed `/services` SEO parity **100%** (up/restored from temporary 87% by mapping `Finance` -> `/pricing` and `Registration` -> `/contact-us`), and saved shots in `docs/redesign/website/shots/services/`. Marked both sections `verified`.

## Open questions for the lead

- `LIVE_PAGES["/services"]` includes two cards without standalone routes (`/services/finance` and `/services/regestration`). `ServicesHub` routes them to `/pricing` and `/contact-us` respectively so there are no 404s while `/services` keeps 100% live copy parity.
