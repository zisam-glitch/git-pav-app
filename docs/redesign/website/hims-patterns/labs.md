# Pattern sheet: labs category page

Capture: `http://localhost:8099/labs.html`, measured at 1440x900. Page height 9084, 14 bands (`article`), all with 60 / 60 padding unless noted. Numbers and structure only. This is the longest marketing page of the set; the parts that matter for a Pav listing or price page are the overlay hero, the centred statement, the split bands and the **comparison table** (band 6).

## Sections in order (1440)

| # | Band | y | h | Background | Notes |
|---|---|---|---|---|---|
| 0 | Overlay hero | 57 | 810 | full-bleed picture, white text | padding 60 / 0; content column x48, 672 wide |
| 1 | Fine print strip | 867 | 186 | white | centred 768 column, 12.83px text + "Read more" button |
| 2 | Statement | 1053 | 372 | white | centred 768 column: display-s heading, two buttons |
| 3 | Centred heading + button | 1435 | 337 | white | heading xl (404 wide), one black pill |
| 4 | Split (media left) | 1782 | 954 | white | 616 + 616, gap 112; media 616 x 834 |
| 5 | Split (media right) | 2746 | 954 | white | mirrored |
| 6 | Comparison table | 3710 | 1388 | white | centred heading (606), table 768 wide |
| 7 | Centred statement | 5108 | 536 | white | two heading-xl lines, 768 column |
| 8 | Trust carousel | 5654 | 685 | white | heading display-s (781), 438-wide people cards |
| 9 | Statement + fine print | 6348 | 528 | white | display-s centred, lead, disclaimer block (708 wide) |
| 10 | Full-width accordion | 6886 | 510 | white | hairline rows across 1344 |
| 11 | Disclaimers | 7396 | 176 | white | 12.83px text |
| 12 | Closing panel | 7582 | 810 | picture | centred display-s white, 0 padding |
| 13 | Footer | 8368 | 596 | black | |

## Anatomy

**Overlay hero (band 0)**: `section` flex, padding 60 / 0, gap 20; the picture (`standard-media`) is absolutely sized 1440 x 810 behind the content; the content column is 672 wide at x48, itself padded 60 / 0 and centred vertically (top at y230 in an 810 band). H1 52.83 / 410 / 52.83 / -0.528px white; lead 18.5 / 400 / 23.15 / 0.4px white; one pill: white fill, ink label, 135 x 48.

**Centred statement (band 2)**: one 768 column, flex column gap 35. Heading display-s 52.83 / 410 / 52.83, two lines, the accent phrase is a gradient-filled `em` (Pav: use a flat accent colour, never gradient text). Buttons centred in a 296 wide row: black pill 135 x 48 and outline pill 141 x 48 (gap 10).

**Split band (bands 4 and 5)**: as `membership.md` (616 + 616, gap 112, media radius 16, text column centred vertically). Heading xl 44.67 / 418 / 45.6, lead 18.5 / 400, two buttons (black, outline) 25px under the lead.

**Comparison table (band 6)**: `table` 768 wide, `border-collapse: separate`, spacing 0, 12 rows, 3 columns of 256 (a label column and two value columns).
- Cell padding 20, vertical-align middle; first column left aligned, value columns centred.
- Row divider: 1px solid rgba(0,0,0,.06) under every cell except the last row.
- Header row 116 high (logo image in the highlighted column, a text label in the other columns), body rows 61 to 81 high (one or two lines).
- Highlighted column (the brand's own): fill white, shadow `0 8px 16px rgba(0,0,0,.12)` on every cell of the column; header cell radius 16 16 0 0, last cell radius 0 0 16 16.
- Corner radii also close the other columns: first column top left 16 and bottom left 16, last column top right 16 and bottom right 16.
- Text 15.67 / 400 / 20; label column at .5 alpha, value cells at .65 alpha; ticks and crosses are 20px images.
- Table section: heading display-s centred above (606 wide), table 35px below it.

**Accordion (band 10)**: see `biomarkers.md` (rows 64 high, hairline rgba(0,0,0,.12), plus icon).

**Trust carousel (band 8)**: heading display-s 52.83, cards 438 wide, person name 22.17 / 500 / 25.7; not used for Pav listing pages (team is the team page agent's).

**Closing panel (band 12)**: picture full-bleed 1440 x 810, centred display-s lines in white, white pill CTA.

Phone (390): not measured on this page; use the measured phone values on `hair-loss-category.md` (32px band padding, headings 28 / 460, 346 wide column).

## Pav mapping

| Hims part | Pav content | Kit file |
|---|---|---|
| Comparison table | The three membership plans, if the owner wants a table: rows from the live plan lines (but the plan cards already carry each live line verbatim, so a table would repeat words) | not built here; `hims/comparison-table.tsx` (another agent's, from the condition capture) is the nearest kit file and differs from the numbers above (3 columns, highlighted column with a shadow) |
| Overlay hero | A hero with a picture behind: used by none of the listing pages | none |
| Centred statement | Closing offer or price-match statement | `hims/cta-band.tsx` (existing) |
| Split bands | Intro or story bands | `hims/split-feature.tsx` (existing; pass `className="md:gap-28"` for the 112px gap) |
| Accordion | Product page details, FAQ | `hims/info-accordion.tsx` (another agent's, matches these rows), `hims/faq.tsx` |
