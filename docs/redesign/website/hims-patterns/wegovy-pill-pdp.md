# Pattern sheet: `/weight-loss/wegovy-pill.html` (Hims product detail page)

Measured at 1440x900 and 390x844. Numbers and structure only. The gallery and purchase panel are the shop agent's; this sheet covers the content sections. Companion: [minoxidil-pdp.md](minoxidil-pdp.md). Recipe: [treatment-page-recipe.md](treatment-page-recipe.md).

## Sections in order (y at 1440)

| # | Section | y, size | Background, padding | Kit |
|---|---|---|---|---|
| 1 | Product hero (rail 389 wide: badge, H1, two bullets, black pill, safety link, four accordion rows) | y57, 863 | white, rail padding-top 57 | `treatment-hero`, `info-accordion` |
| 2 | "Power in a pill" four benefit cards + header action | y920, 840 | white, 60/0 | `benefit-cards` |
| 3 | "Complete support in one membership" list | y1770, 1330 | white, 60/0, radius 24 | `included-list` |
| 4 | Full-bleed picture band with overlaid copy | y3077, 783 | #f9f4ec, image 1440x783 | `closing-band` / own band |
| 5 | Treatment comparison cards (5 cards in a scroller) | y3836, 948 | white, 80/0 | `comparison-table` |
| 6 | "Look after your future health": heading, black pill, three picture cards | y4783, 1101 | white, 60/0 | `benefit-cards variant="plain"` |
| 7 | Dose steps: copy left, picture + four accordion rows right | y5894, 1050 | white, 60/0, radius 24 | `steps` / `info-accordion` |
| 8 | FAQ with a "View all FAQs" link | y6954, 965 | white, 60/0, radius 24 | `faq-section` |

At 390: side padding 22, section padding 32/0, headings 28/460 (line 31.5).

## Anatomy

**Hero rail (x1003, 389).** Badge pill (radius 46, 5.5/8, 12.83/500, #ffc671 with text #61474c). H1 44.7/418. Two bullets, `ul` padding-left 20, 18.5/400/23 at 50% black. Black pill 389x48; ghost link 389x48 (16px at 65% black, "Important safety information"). Accordion: four rows 64 tall (65 pitch), label 15.67/500, 21px icon.

**Benefit cards (y920).** Header: h4 44.7/418 left, action column 446 wide right (black pill 173x48). Cards 438x534 on a 15px gap (the fourth runs past the edge, the row scrolls): fill #f0e5d2, radius 16, padding 25, gap 20; figure 388x388 radius 10; title 22.2/500; text 15.67/400/20 at 50% black. 390px: cards 314 wide (peeking, gap 12), padding 20, gap 16, figure 274, title 18/500, text 14/400/18; the action becomes a full-width pill under the row. Footnote "See source" 12.83/490 at 37% black.

**Membership list (y1770).** Column 768 wide: picture 768x279 radius 16, heading 44.7/418, lead 18.5/400 at 50% black, list 692 wide: rows 692x84, 3% black fill, radius 24, padding 30, gap 30, text 18.5/500, 24px icon right, 20px between rows. Footnotes 12.83.

**Picture band (y3077).** Full-bleed picture 1440x783. Copy column 672 wide centred: top block (padding 60) headline 52.8/410 in white; bottom block (padding 60) text 15.67/400 in white, a white pill 129x48 and an outline pill 132x48 (1px 34% white border, white text), gap 10.

**Comparison cards (y3836).** Copy row: heading 37.5/436 (753 wide) left, description 15.67/400 at 61% black (499 wide) right, footnote 12.83 below; padding 19/16, gap 16. Scroller padding 0/48, cards 282x468, 8px gap: picture slot 282x188 radius 16 on a 4% fill; name 18.5/480; then slots (padding 0/16, gap 16): label 11/494 at 61% black over a value 18.5/480 in an accent (#e0bc84). Round arrows 60x60 (87% black) at the left and right edges. Disclaimer 12.83 with "Read more".

**Three picture cards (y4959).** Cards 665x733 on a 15px gap, radius 16, padding 25: picture 615x683 radius 16, no text.

**Dose steps (y5954).** Two columns 616 + 112 + 616. Left: h4 44.7/418 with the second line in an accent (#cf9358), lead 18.5/400 at 50% black, black pill 120x48. Right: picture 616x417, then four `<details>` rows 86 tall (padding 18, two-line labels) and a short note.

## Pav mapping and gaps

Benefit cards -> `benefit-cards` (treatment benefits, with pictures); membership list -> `included-list` (what the visit includes); comparison -> `comparison-table` (table on a desktop, cards on a phone); dose steps -> `steps`. Skip (never invent): percentages, prices per month, clinical trial claims, "FDA-approved", partner offers, source footnotes. Gaps: sideways-scrolling card row (we stack on a desktop and scroll on a phone), full-bleed picture band (no Pav picture yet), 60px round carousel arrows.
