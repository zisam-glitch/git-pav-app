# Pattern sheet: clinical excellence (about / corporate page)

**Read this first: the saved capture is empty.** `http://localhost:8099/about/clinical-excellence.html` is a 4.7 KB shell: its `<main>` holds one empty `div`, because the page draws itself with script and the scripts were stripped (checked 22 Nov 2026: no heading, no text, no image). It cannot be measured in the browser. The numbers below come from reading the saved page script (`_marketing/_next/static/chunks/app/about/clinical-excellence/page-*.js`, read as text, never run), whose styled-components carry the real CSS, and from the type table in the shared chunk (`9825-*.js`, module 99757). Anything not in those files is marked "unknown". Numbers and structure only; the page's words and pictures are not recorded here.

## Hims type variants (px, phone at 360 to desktop at 1392; fluid between)

DISPLAY_XL 64-171, DISPLAY_L 50-119, **DISPLAY_M 40-82**, DISPLAY_S 32-57, DISPLAY_XS 25-40; HEADING_XL 28-48, HEADING_L 25-40, HEADING_M 22-33, HEADING_S 20-28, HEADING_XS 18-23; LABEL_XL 18-23, LABEL_L 16-19, LABEL_M 14-16, LABEL_S 12-13, LABEL_XS 11; BODY_XL 20-28, BODY_L 18-23, BODY_M 16-19, BODY_S 14-16, BODY_XS 12-13. Weight: label 500, body 400, display 410, heading about 485 when bold. Our `text-display` is 50-82 (phone size differs from DISPLAY_M's 40), so the kit uses `text-[clamp(40px,calc(40px+42*(100vw-360px)/1032),82px)]` (token-request: `text-display-m`).

## Sections in order

Unit tokens read as px (U040 = 40, U018 = 18). Content column is 8 of 12 grid columns from the medium breakpoint up, full width on a phone. "Sheet" = the band overlaps the previous one by the section radius (`margin-top: calc(var(--border-radius) * -1)`) and has that radius on its top corners (24px on the benefits capture; the theme value is unknown here).

| # | Band | Background | Padding (top / bottom) | Notes |
|---|---|---|---|---|
| 0 | Fullscreen hero | white; fixed behind the next bands | height `clamp(547px, 100svh, 1400px)`; content offset 160 (16vh from medium) | centred DISPLAY_M title (margin-top 50, second line in a block span, accent colour), HEADING_M sub-line, then a 2:1 animated visual (max-width 100vh); text appears with opacity + 12px rise over 700ms |
| 1 | Statement | dark primary (brown on the home page), sheet, box-shadow 0 0 50px (secondary at .3) | 64 / 56 (100 / 74 from medium) | centred DISPLAY_M title in grey with the accent phrase in white, BODY_L paragraph 1rem below, title max-width 90% |
| 2 | Commitments | dark primary | 0 / 120 (150 from medium); inner 56 / 56 (74) | LABEL_XL label (max 136), a tilted letter icon with a blurred brown pill link (radius 47, padding 12 12 12 24), a 200 x 90 signature image and BODY_S caption; bands bracketed by white dot rows |
| 3 | Leaders | white, sheet, top radius | 80 / 0 | title max 560 + BODY_M max 400 + a stat box; then a dark rounded panel (below) |
| 4 | Advisory board | white | dot row 40 / 40 (64 / 64) | title max 380 (540), dark gradient panel with text, animation, closing line |
| 5 | Provider network | white | same | title max 280 (540), lighter gradient panel with a 2-column stat grid and value rows |
| 6 | Research | white | same | title + BODY_M (max 450), then a stack of link cards (below) |
| 7 | Closing statement | white | 0 / 103 (190) | same Statement as band 1 with black title and accent in the page ink |

Between bands 3 to 7 a "segue" row: 15 dots, 2px, circle, margin 40 (64) above and below, each dot scales 3 to 1 and fades in 15ms after the previous one.

## Anatomy

**Statement title**: DISPLAY_M, centred, line-height 1, letter-spacing about -0.01em; colour `--statement--title-color` (grey `NL500`), accent spans turn to the primary text colour (white on dark) after the reveal (opacity 0 to 1 and translateY 30px over the reveal duration, colour 170ms linear after it). The paragraph is BODY_L (18-23px), same colours, translateY 12px, delayed by half the duration.

**Leaders panel** (inside band 3): rounded 56px, dark, padding 40 0, gap 40, margin-top 28. Photo slider (keen-slider, loop, snap, origin centre): 4 slides per view at desktop with 28px gap, 3.25 at medium (gap 16), 2 on a phone. Slide = capsule: max-width 212, `aspect-ratio: 2 / 3`, radius 120px, shadow `0 30px 30px rgba(0,0,0,.16)`, photo cover and centred on a pale neutral, opacity transition 220ms. Name slider below (one per view, max-width 340, fades out at the edges with a horizontal mask 5% / 20% / 80% / 95%): name HEADING_L, title LABEL_XS (grey), then a pill link (glass: translucent, 12px padding). Photos and names move together.

**Stat box**: padding 25 36, radius 20, very light grey fill, gap 8; figure HEADING_XL, label LABEL_XS. **Stat grid**: 2 columns, gap 5, max-width 461; cell radius 20, dark fill, centred, padding 20, gap 6, figure HEADING_L, caption LABEL_M; from the third cell on a cell spans both columns. **Value row**: flex, space-between, padding 20, white, radius 20, title LABEL_XL (max 156) and a 24px icon.

**Link card (research)**: `li` white, radius 24 (36 from medium), shadow `0 0 20px` (very light grey), margin-bottom 20. Link inside: flex, padding 16 (24); picture 95 x 70 radius 16 (190 x 140, radius 24); text margin-left 16 (24 each side): title HEADING_S, line BODY_S (grey, 5px below); pill button right (full width and 20px down on a phone). Hover from medium up with a mouse: shadow `0 20px 30px` (light grey), `translateY(-6px)`, 220ms (hover timing function from the theme).

**Accordion** (leaders panel): header + content, panel padding 32 20 24, fill very light grey, radius 20.

## Pav mapping

| Hims band | Pav content (live words only) | Kit file |
|---|---|---|
| 0 Hero | `/about` H1 and lead, Book now + Call, the existing hero picture below | `hims/statement.tsx` (centred title) + `hims/media.tsx` |
| 1 Statement | "A Legacy Fulfilled": the late founder's vision, Dr Hassan's vow, the quotation and closing words | `hims/statement.tsx` |
| 2 Commitments | The two commitments (Executing, Inspiration and Growth) as glass rows | `hims/commitments.tsx` |
| 3 Leaders | The eight team members (names, roles, GDC numbers, live photos) linking to `/team/$slug` | `hims/leader-carousel.tsx`, `hims/person-capsule.tsx` |
| 4 to 6 | Skip: no advisory board, network figures or research links on the live site | none |
| 7 Closing | "Get In Touch" band with Book now, Contact us, Call | `hims/cta-band.tsx` (existing) |
