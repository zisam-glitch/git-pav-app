# Pattern sheet: category page (list of treatments)

Capture: `http://localhost:8099/hair-loss.html`, measured at 1440x900 and 390x844. Numbers and structure only. Page height 5466 at 1440. Every band is an `article` full width; content sits 48px in from each side at 1440 (a 1344 column) and 22px in at 390 (346 column). Pictures are blank in the capture (script-loaded), so image tiles are measured as empty frames.

## Sections in order (1440)

| # | Band | y | h | Background | Padding (top / bottom) | Notes |
|---|---|---|---|---|---|---|
| 0 | Hero | 57 | 407 | cream `#faf8f2` | 60 / 60 (phone 32 / 32) | 2 columns 616 + 616, gap 112; H1 left, list + buttons right |
| 1 | Treatment tile row | 464 | 728 | cream | 60 / 84 | one horizontal scroller, 8 cards |
| 2 | Proof cards | 1168 | 1023 | white | 60 / 60 | section heading + 7 cards (results and quotes: Pav skips) |
| 3 | Feature cards | 2191 | 759 | white | 60 / 60 | heading + 4 cards |
| 4 | Mechanism cards | 2950 | 801 | white | 60 / 60 | heading + 3 cards |
| 5 | Product cards | 3750 | 905 | white | 60 / 60 | heading + scroller of 10 product cards |
| 6 | Steps | 4655 | 236 | white | 60 / 60 | heading left, pill button right, 4 text columns |
| 7 | FAQ | 4901 | 445 | white | 60 / 60 | heading left (616), hairline accordion right |

Bands never use a section divider line: rhythm is the 60px padding alone (two bands = 120px). Phone bands: 32px padding, headings 28/460/31.5, card scrollers show one 314px card plus a 10px peek (gap 12). The treatment tile row on a phone shows 157x209 cards (gap 12, about 2.3 visible).

## Anatomy

**Hero (band 0)**: H1 52.83px / 410 / line-height 1 / -0.528px (about -0.01em), ink at .81 alpha; phone 32 / 450 / 35.2. Right column, top aligned with the H1 (both at y60): icon list, then two pill buttons, then a short note and a 12.83px disclaimer.
- Icon list: `ul` grid, row gap 20. Item = grid, 18px icon + 10px gap + text 15.67 / 400 / 20 at .5 alpha. Icon = 18px circle filled `#8a3a34` (our `rust`) with a white check.
- Buttons: 48px high pill, padding 8 / 24, 1px transparent border, label 16 / 400 / 24. Primary = black fill, white label. Secondary = fill rgba(255,255,255,.01), 1px border rgba(0,0,0,.19), label ink .89. Gap 10 between. Transition 0.2s ease-in-out on border, colour, background, shadow.
- Note under the buttons: 15.67 / 400 / 20 at .5 alpha; disclaimer 12.83 / 490 / 15.65 at .37 alpha.

**Section heading ("heading-xl")**: 44.67 / 418 / 45.6 / -0.387px (phone 28 / 460 / 31.5), one line, width up to 893. A key phrase inside is an `em` in `#8a3a34` (no italics). Heading sits 60px above the cards in the same band; the pill button, when there is one, is right aligned in the header row (flex-col, 5px top padding).

**Treatment tile (band 1)**: `article` 438 x 584 (ratio 3:4), radius 16, padding 25, picture only, gap 15 between cards; the row is a grid with `grid-auto-flow: column`, `overflow-x: auto`, 33px gutter columns before and after, 3.1 cards visible at 1440. Phone 157 x 209.

**Rounded text card (bands 2 to 4)**: `article` flex column, radius 16, fill rgba(0,0,0,.03) (about #f7f7f7 on white), padding 25 (proof cards 30 / 23), child gap 20 (proof cards 40). Order: title (26.67 / 500 / 30.2 / -0.03px, accent words in `#8a3a34`), picture 388 x 194 radius 16, body 15.67 / 400 / 20 at .5 alpha. Heights 523 (4-up) and 494 (3-up) at 438 wide; phone 314 wide, 412 / 371 tall.

**Product card (band 5)**: `article` flex column, no fill, no radius, gap 20, 438 x 574.
- Picture frame `figure` 438 x 246 (16:9), radius 16, fill rgba(0,0,0,.03); two chips overlaid at 20px from the top left (see below).
- Title 26.67 / 500 / 30.2 / -0.03px, up to 2 lines (60px).
- Price line 15.67 / 600 / 20 at .5 alpha; description 15.67 / 400 / 20, 3 lines.
- Button stack, gap 10: row of two 48px pills (primary 214 wide + secondary 216 wide, gap 8), then a ghost text link (16 / 400 at .65 alpha, 48px high, centred).
- Chip: inline-flex, padding 5.5 / 8, radius 46, label 12.83 / 500 / 12.83 (line-height 1): fills `#8a3a34` with white text, or white with ink .89 text.

**Steps (band 6)**: header = grid, heading left (893) and a black pill right. Below, 4 columns of 325 (gap 30 across, 15 down): title 26.67 / 500, body 15.67 / 400 / 20 at .5 alpha, gap 20. No cards, no numbers drawn in HTML.

**FAQ (band 7)**: heading xl in the left 616; accordion in the right column: same rows as `biomarkers.md` (summary 64px, 1px hairline rgba(0,0,0,.12)).

## Pav mapping

| Hims part | Pav content | Kit file |
|---|---|---|
| Hero, H1 + list + buttons | Page H1, live lead, Book now + Call, short facts | `hims/category-hero.tsx`, `hims/check-list.tsx` |
| Treatment tile row | Services hub: the 15 service tiles (live blurbs, existing pictures) in a grid | `hims/service-tile.tsx` |
| Rounded text card | Service or plan card | `hims/service-tile.tsx`, `hims/plan-card.tsx` |
| Product card | Shop product tile | `hims/product-card.tsx` (used by `ui/product-reveal-card.tsx`) |
| Chip | Coming soon, product badge, eyebrow | `hims/chip.tsx` |
| FAQ | Shop questions (live FAQ accordion) | `hims/faq.tsx` (existing) |
| Proof cards (results, quotes) | Skip: Pav has no results or reviews to show | none |
