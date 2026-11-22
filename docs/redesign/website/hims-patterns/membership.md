# Pattern sheet: membership / plans page

Capture: `http://localhost:8099/weight-loss/membership.html`, measured at 1440x900. Page height 7306. Numbers and structure only. This page sells one plan (no plan comparison): it is a hero, then alternating media and text bands, a FAQ and a full-bleed closing panel. Plan comparison for three tiers is on `labs.md` (comparison table).

## Sections in order (1440)

| # | Band | y | h | Background | Padding | Notes |
|---|---|---|---|---|---|---|
| 0 | Hero | 57 | 1079 | warm gold-brown photo gradient, white text | 93 top | headline row, then a 4-tile media bento |
| 1 | How it works | 1112 | 843 | white | 0 | 2 columns 720 + 720: media left, numbered list right |
| 2 | Everything included | 1955 | 1330 | white | 60 / 60 | one centred 768 column: picture, heading, lead, row list, button |
| 3 | Care plan | 3296 | 953 | white | 60 / 60 | media left 616, content right 616, gap 112 |
| 4 | Community | 4258 | 907 | white | 60 / 60 | content left, media right (mirrored) |
| 5 | Perks | 5176 | 941 | white | 60 / 60 | content left, media right, two buttons |
| 6 | FAQ | 6117 | 283 | white | 60 / 84 | heading display-s + accordion |
| 7 | Closing panel | 6376 | 810 | black with full-bleed picture | 60 / 60 | centred white statement, white pill |

## Anatomy

**Hero (band 0)**: flex column, padding 93 / 0, the headline row is 1344 wide (x48), a flex row with gap 64.
- Left (910): eyebrow 22.17 / 473 / 25.7 white at .85; headline 75 / 410 / 75 / -0.75px, white, two lines.
- Right (370): lead 26.67 / 463 / 30.2 / -0.03px white, 4 lines; then a white pill CTA 64px high, padding 0 / 28, radius 100, label 22.17 / 473 / 64 in dark ink (`rgb(49,54,48)`).
- Bento below: wrapper 1384 wide, padding 150 / 20 / 0; inner `inline-grid`, gap 8, four tiles with radius 60: 398 x 534, 533 x 534, then two stacked 398 x 263 (tile fill `rgb(243,237,227)`).

**Split band (bands 1, 3, 4, 5)**: grid, two columns. Bands 3 to 5: 616 + 616, gap 112, the media is a picture of 616 x 787 to 833 with radius 16, the text column is vertically centred. Band 1: columns 720 + 720, media is full height with its inner corners rounded 48 (0 48 48 0), the text column has padding 60 / 0 and a 632 wide inner column at x764.
- Chip above the heading: inline-flex, padding 5.5 / 8, radius 46, fill gold `#ffc671`, label 12.83 / 500 / 12.83 in `rgb(97,71,76)`.
- Heading "heading-l": 37.5 / 436 / 40 / -0.21px. Lead 18.5 / 400 / 23.15 / 0.4px at .5 alpha.
- Clear gaps between stacked parts: chip to heading 10, heading to lead 15, lead to list 25, list to buttons 26.
- Buttons: 48px pills as in `hair-loss-category.md`; disclaimer 12.83 / 490 at .37 alpha below.

**Numbered list**: `ul` grid, row gap 20. Item: an 18px circle (fill gold `#ffc671`, number 11 / 700 / 16.5 ink) at the left, a 28px text offset, then label 15.67 / 500 / 18.8 at .81 alpha and a 15.67 / 400 / 20 body at .5 alpha under it (4px between). Item height 43 with one body line.

**Icon list**: as `hair-loss-category.md` (18px circle + check, gap 20, text 15.67 / 400 / 20).

**Row list ("block-like")**: `ul` flex column, gap 20, 692 wide inside the 768 column. Row: radius 24, fill rgba(0,0,0,.03), padding 30, height 84, label 18.5 / 500 / 23.15 at .81 alpha, a 24px icon at the right edge.

**FAQ**: heading display-s (52.83 / 410 / 52.83) left, accordion right (rows as in `biomarkers.md`).

**Closing panel**: section flex column, padding 60 / 0, gap 20, picture fills 1440 x 810 behind. Two display-s lines (52.83 / 410, white, 672 wide, centred) with the button between them and the lower line: pill white fill, ink label, 260 x 48.

## Pav mapping

| Hims part | Pav content | Kit file |
|---|---|---|
| Hero headline + lead + white pill | `/pricing` H1, live finance sentence, Book now (no photo bento: the existing hero picture stays) | `hims/category-hero.tsx` or `hims/split-feature.tsx` |
| Plan content (list of what is included) | The three plan lists (BRONZE, SILVER, GOLD): each live line verbatim | `hims/plan-card.tsx`, `hims/check-list.tsx` |
| Numbered how-it-works list | Not on the live pricing page: skip | not built; `hims/steps.tsx` (another agent's) is a different pattern (card with steps beside a picture); the numbers above are the plain numbered list |
| Row list | Not used (plan features use the check list) | none |
| Closing panel | `CtaBand` (Book now, Call) | `hims/cta-band.tsx` (existing) |
| Chip | Eyebrow above a heading | `hims/chip.tsx` |
