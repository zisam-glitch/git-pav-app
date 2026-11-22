# Pattern sheet: biomarker tiles (list of items per topic)

Capture: `http://localhost:8099/labs/biomarkers.html`, measured at 1440x900. Page height 12291, 17 bands. Numbers and structure only. The pattern that matters is **a topic band**: a text column on the left and a hairline accordion list of items on the right. It repeats eleven times (one per body system). The same row pattern is the details list on the product page and the FAQ.

## Sections in order (1440)

| # | Band | y | h | Notes |
|---|---|---|---|---|
| 0 | Hero | 101 | 876 | centred display-s heading (672), full-bleed picture |
| 1 | Fine print | 977 | 167 | centred 12.83px text |
| 2 | Panel intro | 1154 | 347 | header grid (heading xl left 781, lead right 558 at x834) then a row of jump chips |
| 3 to 13 | Topic bands | 1501 to 9242 | 494 to 1160 | 60 / 60 padding, white; see below |
| 14, 15 | Two-up statements | 9252, 10302 | 1049 | display-s heading left (893), text column right (616) |
| 16 | Closing panel | 11361 | 810 | picture + centred display-s |

All bands are white with 60 / 60 padding (bands 3 to 13 have no divider between them).

## Anatomy

**Panel intro header (band 2)**: `header` grid, columns 781 + 558 (gap 5), padding-top 60. Left: heading xl 44.67 / 418 / 45.6 / -0.387px. Right: lead 18.5 / 400 / 23.15 / 0.4px at .5 alpha (5px top padding). Under it a section `grid` with gap 15 of "cards" 179 x 74: each holds a 179 x 56 pill link (jump to a topic).

**Topic band (bands 3 to 13)**: grid, two columns 616 + 616, gap 112, at x48.
- Left column, top to bottom: a banner picture 616 x 133 (decorative), heading-l 37.5 / 436 / 40 / -0.21px, lead 18.5 / 400 / 23.15 at .5 alpha (up to 3 lines), a row of two pills (black "primary", outline "secondary") 48 high, gaps 25.
- Right column: the accordion, 616 wide, one row per item.

**Accordion row** (`details`):
- Summary: flex, padding 18 / 0, gap 20, height 64 with a one-line label. Label 15.67 / 500 / 18.8 / 0.04px, ink .81. Right-aligned 21 x 21 icon.
- Icon: a chevron made of two bars 10.5 x 2 in rgba(0,0,0,.88) (`::before` and `::after`, one rotated about +40 degrees and the other about -40, meeting in the middle, so it reads as a "v"); `transition: transform .3s cubic-bezier(.86,.86,.07,1)`. The open state is script-driven and is not visible in the capture (our version flips the chevron 180 degrees).
- Divider: a 1px element after every row with `border-bottom: 1px solid rgba(0,0,0,.12)` (our `border-border`). No border on the `details` itself, no fill, no radius.
- Open content: padding 0 / 0 / 20, text 15.67 / 400 / 20 / 0.35px at .5 alpha, followed by a plain link at the same size.
- Closed content is still in the HTML (the content block is collapsed to 1px, not removed).

**Two-up statement (bands 14, 15)**: grid 893 (display-s 52.83 / 410 heading) and 616 (heading-l, lead, button), gap as the topic band.

Phone: not measured on this page; use `hair-loss-category.md` for phone band padding (32) and type (headings 28 / 460, body 16 / 400 / 20.4).

## Pav mapping

| Hims part | Pav content | Kit file |
|---|---|---|
| Topic band (left text, right rows) | One treatment-fee category: category name left, price rows right (label left, price right, hairlines) | `hims/price-list.tsx` (built); `pricing/fee-table.tsx` does not use it yet (see `pages/pricing.md`, Pass 2) |
| Accordion rows | Product details (highlights, directions, delivery) on the product page | `hims/info-accordion.tsx` (another agent's file; same rows, chevron, H3 labels) |
| Jump chips row | Fee category filter pills (kept as working tabs) | `ui/button.tsx` (existing pills) |
| Banner picture 616 x 133 | Not used (no picture) | none |
| Two-up statements, closing panel | Price-match statement band, `CtaBand` | `hims/cta-band.tsx` (existing) |
