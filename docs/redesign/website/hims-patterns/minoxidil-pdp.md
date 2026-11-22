# Pattern sheet: `/hair-loss/minoxidil.html` (Hims product detail page)

Measured at 1440x900 and 390x844. Numbers and structure only. The gallery, purchase panel and option selector belong to the shop agent (B); this sheet covers the content sections. Companion: [wegovy-pill-pdp.md](wegovy-pill-pdp.md). Recipe: [treatment-page-recipe.md](treatment-page-recipe.md).

## Sections in order (y at 1440, all white, side padding 48 inside a 1344 content width)

| # | Section | y, size | Padding | Kit |
|---|---|---|---|---|
| 1 | Product hero (gallery 889x803 + side rail 389 wide) | y57, 1217 tall | rail padding-top 57 | `treatment-hero` for a service; the shop builds the PDP |
| 2 | Customer quotes | y1274, 912 tall | 60/0 | not used (Pav has no reviews: skip) |
| 3 | Three-column feature (heading, picture, copy) | y2185, 528 tall | 60/0 | `split-feature` + text |
| 4 | "How to apply" three picture cards | y2723, 774 tall, radius 24 | 60/0 | `benefit-cards variant="plain"` or `steps` |
| 5 | "Explore more" product cards | y3497, 1056 tall | 60/0 | `tile` / `benefit-cards` |
| 6 | FAQ (two columns) | y4553, 900 tall | 60/0 | `faq-section` |
| 7 | "Want more info" article cards | y5453, 1107 tall | 60/0 | blog agent's cards |

Section padding is 60px top and bottom at 1440, 32px at 390 (side padding 22). Section headings sit in a header row (1344 wide, gap 5) 46 tall; cards start 55px below.

## Side rail (x1003, 389 wide) below the purchase panel

- Badge: pill radius 46, padding 5.5/8, 12.83/500, rust #8a3a34 with white text. H1 52.8/410 (81% black). Lead 18.5/400 at 50% black.
- Purchase panel (shop agent): selector labels 189x109, radius 16, padding 18, 1px border (12% / 19% black), 3% fill when selected; dropdown 76 tall, radius 16, padding 20; black pill 389x48.
- "Hair loss, handled" block: strong 18.5/600 and a sentence 18.5/400, both 50% black, then an outline pill 389x48 (1px 19% black border, 16px text).
- Information accordion (`info-accordion`): four `<details>` rows 64 tall, 65 pitch; `summary` padding 18/0, gap 20, label 15.67/500 (81% black), icon 21x21 at the right. Row names: what the product is, how it works, ingredients, shipping restrictions. Open bodies are not in the capture.

## Anatomy

**Feature split (y2185).** Three 373px columns with 112 gap, vertically centred: heading (44.7/418, 91 tall, 81% black), picture 373x373 radius 16, copy article (gap 20): sub-headings 22.2/500, paragraphs 15.67/400/20 at 50% black, then a CTA row (gap 8): black pills 154x48 and 211x48.

**How to apply (y2723).** Header h4 44.7/418. Three cards 438x554 on a 15px gap (inside a 1344 row): figure 438x438 radius 16, title 22.2/500 (25.7 line), text 15.67/400/20 at 50% black, gap 20. No fill, no numbers. 390px: cards peek (about 80% wide), 28/460 heading.

**Product cards (y3497).** Header h5 37.5/436. Five cards 438x731, gap 20 inside: badge row (pills radius 46, 5.5/8, 12.83/500: rust with white text, 12% black with dark text, white), figure 438x246 radius 16 on a 3% fill, title 22.2/500 (26.7/500 on the featured card), price line (strong 15.67/600 at 50% black), text 15.67/400 at 50% black, CTA stack at the bottom: two outline pills (214 and 216 wide, 1px 19% black border), then a ghost link 438x48 ("Important safety information", 16px at 65% black). Disclaimer under the row: 15.67/600 at 81% black.

**FAQ (y4553).** Two columns 616 + 112 + 616. Left heading h5 37.5/436 ("Frequently asked questions about X"). Right: 12 `<details>` rows as above.

**Article cards (y5453).** Two cards 665x886 on a 15px gap, radius 16, padding 25: a full-bleed picture, title 26.7/500 in white over it at the bottom (gap 20), a white pill 615x48 "Learn more" (text 89% black).

## Pav mapping and gaps

Rail accordion -> `info-accordion` (what it is, how it works, what is included, safety); "How to apply" -> `steps` (one list) or `benefit-cards variant="plain"` (a picture per step); product cards -> related services (`tile-link`, existing). Skip (no live content): reviews, prices per month, "Rx" and "FDA-approved" badges, "Add to cart", disclaimers about the drug. The accordion icon is a chevron in our build; Hims draws two bars.
