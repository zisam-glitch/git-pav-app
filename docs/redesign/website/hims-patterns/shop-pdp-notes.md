# Pattern sheet: product page, gallery and purchase panel

Captures: `http://localhost:8099/hair-loss/minoxidil.html` (full purchase panel with options) and `/weight-loss/wegovy-pill.html` (panel with a bullet list and no options), measured at 1440x900 and 390x844 (minoxidil). Numbers and structure only. The content bands below the hero (results, how to apply, related products, FAQ) are another agent's sheets (`minoxidil-pdp.md`, `wegovy-pill-pdp.md`); this sheet is the gallery, the purchase panel, the options and the add-to-cart parts.

## Hero layout (1440)

`article.product-hero` y57, padding 0 / 60, `grid` 1344 wide at x48, gap 5: gallery column 889 (x48 to 937), a 66px gutter, side rail column 389 (x1003 to 1392). Hero height 863 (wegovy) to 1157 (minoxidil, with options). The side rail is not sticky in the capture. Phone: gallery 346 x 310, side rail below with 4px gap, 22px side margins.

## Gallery

- Frame: `ul` flex, `overflow-x: scroll` (position set by script), gap 18, slides `li` 889 x 803 (ratio 1.107), radius 16; four slides (three pictures and a video).
- Thumbnails: `aside` over the bottom of the frame, centred, 28px from the bottom (y715 in 803), four round buttons 60 x 60 with gap 16, image radius 50%, shadow `0 4px 10px rgba(0,0,0,.2)`; the active thumb has a 64px ring (SVG circle) around it.
- Phone: the thumbnails become dots: a pill 68 x 20, radius 10, fill rgba(0,0,0,.33), padding 6, dots 8 x 8 with gap 8 (active white, others rgba(255,255,255,.17)), 28px from the bottom.

## Side rail (minoxidil, top to bottom, 1440)

| Part | y (from hero top) | Size and style |
|---|---|---|
| top padding | 0 to 57 | 57 (phone 24) |
| Chip | 57 | 24 high, padding 5.5 / 8, radius 46, fill `#8a3a34` (or gold with ink for a neutral chip), 12.83 / 500 |
| H1 | 93 | 52.83 / 410 / 52.83 / -0.528px (phone 32 / 450 / 35.2); the shorter product name uses 44.67 / 418 / 45.6 |
| Lead | 214 | 18.5 / 400 / 23.15 / 0.4px at .5 alpha, 4 lines (phone 16 / 400 / 20.4) |
| Purchase block | 326 | flex column, gap 20, padding-bottom 20 (phone gap 16) |
| Add to cart | 635 | full width 389 x 48 black pill, label 16 / 400 / 24 white |
| Short bold line | 702 | 18.5 / 600 at .5 alpha |
| Fine print | 740 | 18.5 text with `sup` references (12.83 / 400 at .37 for legal) |
| Secondary pill | 793 | full width outline pill 48 high |
| Accordion | 849 | 4 rows, each 64 + 1px hairline (see `biomarkers.md`) |

The wegovy panel has no options: chip (gold fill, ink text `rgb(97,71,76)`), H1 (44.67), a bullet list (`ul` with 20px left padding, items 18.5 / 400 / 23.15 at .5 alpha, 15px between), a full-width black pill, a ghost pill ("important information", label at .65 alpha) and the accordion.

## Options and plan selector

- Group label: `h3` 15.67 / 485.5 / 18.83 / 0.04px, ink .81. Gap label to controls 10 (phone 8).
- **Choice cards** (radio group): `label` cards in a flex row, gap 12; each 189 x 109 at 389 wide (two across), radius 16, padding 18, child gap 8, 1px border. Selected: fill rgba(0,0,0,.03), border rgba(0,0,0,.12), a 24px indicator at the top right with a filled black disc. Not selected: fill white, border rgba(0,0,0,.19), a 24px ring (1px rgba(0,0,0,.19)). Text: title 15.67 / 485.5 / 18.83 ink .81; detail 12.83 / 490.75 / 15.65 at .37 alpha (5px between). The input is visually hidden (1 x 1).
- **Plan dropdown**: group = label + caption (12.83 / 400 / 16.74 at .65 alpha, 5px under the label) + toggle button 389 x 76, radius 16, padding 20, border 1px rgba(0,0,0,.19), fill white, gap 20: label 15.67 / 485.5 on the left, price 15.67 / 600 right, chevron 21 x 21 at the far right.

## Pav mapping

| Hims part | Pav content | Kit file |
|---|---|---|
| Gallery | Product pictures (one or more) with alt text | `hims/product-gallery.tsx` (built, not yet used) |
| Chip, H1, lead | Category chip, product name, short description | `hims/chip.tsx`, `ui` heading classes |
| Choice cards | Product variants (size, flavour, pack) with price and stock note | `hims/choice-cards.tsx` (built, not yet used by `product-detail.tsx`) |
| Add to cart pill | Existing cart logic (`onAddToCart`) with quantity stepper | `ui/button.tsx` |
| Accordion | Clinical highlights, directions, UK delivery and returns | `hims/info-accordion.tsx` (another agent's file; its labels are H3, so the page's H3 list survives) |
| Related product scroller | "Complementary" products | `hims/carousel.tsx` + `hims/product-card.tsx` (built, not yet used) |
| Dropdown plan selector | Not used (no subscriptions in the Pav shop) | none |

Traps: the capture shows ratings, review counts, prices and results in the bands below; Pav shows none of them (a test fails on stars). Keep the product title as the one `h1`; the accordion row labels are `h3` (the page's current H3 list must survive).
