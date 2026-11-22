# Pattern sheet: `/testosterone.html` (Hims condition landing page)

Measured at 1440x900 and 390x844 on the saved capture. Numbers and structure only (no Hims words or pictures). Font sizes are px at 1440 unless stated. "Kit" = the file in `website/src/components/hims/` that implements it. Recipe: [treatment-page-recipe.md](treatment-page-recipe.md).

## Fluid H1 and headings (read at 600, 768, 1024, 1440, 1728)

- H1 and big headings ("display-s"): 32 (390), 36.2 (600), 40.3 (768), 44.5 (1024), 52.8 (1440), 57 (1728); weight 450 at the small end down to 410 at the large end; line height 1; tracking -0.01em. About `32 + 25 * (vw - 390) / 1260`, capped at 57. Kit `text-hero` is 40 to 57: token request `text-display-s`.
- FAQ heading ("heading-l"): 27.5 (600), 30 (768), 32.5 (1024), 37.5 (1440), 40 (1728). Comparison heading: 32 / 36 / 36 / 48 (steps, not a slope).
- Body 16.5 to 19 (lead 18.5 at 1440), label 14.3 to 16 (15.67 at 1440), legal 12.83.

## Sections in order (y at 1440)

| # | Section | y, size | Background, padding | Kit |
|---|---|---|---|---|
| 1 | Hero | y112, 1440x968 | #f8f4ef, 80px top | `treatment-hero` |
| 2 | Product bento "treatments through the brand" | y1056, 1440x1229 | white, 86px top; tiles #0a2633 | `option-tiles` |
| 3 | Section heading "built for you" | y2285, 215 tall | white, 86px top | `section-header` (align center) |
| 4 | Three steps in a sticky card | y2500, track 3600 tall | card 1325x900, radius 46.7 | `steps` (static list) |
| 5 | "A range of options" comparison table | y6283, 994 tall | white, 80/16 | `comparison-table` |
| 6 | "Everything beyond your medication" list | y7277, 1665 tall | white panel, 60px, bottom radius 24 | `included-list` |
| 7 | FAQ | y8952, 835 tall | white panel, 60px, radius 24, 10px below | `faq-section` |
| 8 | "Could it be low T?" closing band | y9787, 742 tall | #0a2633, 111/28 | `closing-band` |

Between panels Hims shows a light grey canvas (panels are white with 24px corners and 10px gaps); our pages stay white.

## Anatomy

**Hero.** 112 + 80 = text row at y192. H1 at x16, 637 wide, 106 tall (two lines). Right column x1000, 424 wide, gap 24: value props `ul` (gap 4; each `li` 48 tall, padding 4/0, gap 16: 40px round picture + text 16/480, line 19.2, 81% black) then buttons (gap 8): primary 128x48 pill (#1b3745, text #f0df8b, 15.67/485), secondary 169x48 pill (transparent, 1px 19% black border). 80px below: a marquee strip y504, 496 tall: tiles 373x496, radius 24, 8px gap, 3 of 30 are videos; pause button 44x44 round (35% teal) bottom right. 390px: H1 32/450, rows then buttons stacked full width (48 tall, gap 8).

**Bento.** Heading 52.8/410 centred, accent `em` #405c6b. Grid gap 5: big tile 758x779, four 250x387. Tile #0a2633, radius 28.2 (24 at 390), padding 16.5/18.5; badges row (padding-bottom 16, gap 8): pill 4/10, radius 100, 12.83/490; "New" #f0df8b on #1b3745, others 14% white on 94% white. Title 37.5/436 (big) or 22.2/473 (small), 94% white; subtitle 12.83/400 71% white; picture below; full-tile button with a 38px round arrow (14% white) bottom right; a 59x58 round badge on one tile. Legal paragraphs under the grid: 12.83/400, 66% black, 976 wide, centred. 390px: big tile full width (378x378), small tiles two across (187x298), gap 4, title 25 / 18.

**Steps card.** Card x58, 1325x900, radius 46.7, soft top-to-bottom gradient (grey-blue to butter). Copy panel padding 46.7/110.4; list 442 wide; rows gap 9.7, padding 4.8/0, a thin vertical rule at the left, text 31.2/452 (first word heavier); inactive rows fade; picture 773x807 on the right (several stacked, crossfaded on scroll). Disclaimers below: 12.83/400, 732 wide.

**Comparison table.** Inner 631 wide (two products): intro padding 18.5, gap 18.5: heading 48/450 (line 57) with accent, lead 22.2/400 at 61% black. Table: header row 158 tall (corner cell + 210px product cells, padding 13.7): 84px thumbnail, "New" pill (34x23, #f0df8b, 11/500), name 15.67/485. Body rows 44 to 78 tall; every other row tinted #f8f4ef with a 6px-radius label cell (padding 13.7/18.5); labels 12.83/490, values 12.83/400 at 61% black. Legal block padding 74/18.5 with an expandable "... Show more" disclaimer.

**List.** 768 wide column. Heading 52.8/410 centred (accent #6d8d9e); picture 768x513 radius 16; list 445 wide, gap 20; row 445x84, fill 3% black, radius 24, padding 30, gap 30; text 18.5/500 at 81% black; 24px icon at the right. Footnote 12.83 at 37% black.

**FAQ.** Two columns 616 + 112 gap + 616 (inside 1344). Heading 37.5/436 left. Right: native `<details>` rows 64 tall, 65 pitch (1px divider), `summary` padding 18/0, gap 20, label 15.67/500 at 81% black, icon 21x21 (two 10.5x2 bars at 88% black; reads as a chevron). Closed answers are not in the capture. 390px: stacked, panel padding 32.

**Closing band.** Two columns gap 120: picture column 521x520 (picture plus four glass bubbles 134x134, radius 38, 10% white fill, 1px 8% white border, label 18.5/480) and a 500px copy column, gap 28: headline 52.8/410, line one #eef1ea, line two inside a highlighter box (#fdecac, radius 8, padding 0/8/4, text #1d3f52); lead 18.5/400 at 66% white with one phrase in #f4e29d; pill CTA #f4e29d, 212x56, radius 100, padding 0/28, 15.67/485 black; disclaimer 12.83 at 66% white plus a "Read more" toggle.

## Pav mapping and gaps

Hero value props -> three live fragments; bento -> product ranges; steps -> "How ... is done"; comparison -> whitening ranges; list -> "good care helps to"; FAQ -> `FaqSection`; band -> an existing closing H2. Not mapped (no live content, never invent): marquee videos, symptom checker, legal footnotes, "New" badges, FDA badge. Gaps: the scroll-driven step reveal (we list all steps), the picture marquee (we use a static strip), the 46.7px card radius (we use 32px), blue-to-butter card gradient (we use sage).
