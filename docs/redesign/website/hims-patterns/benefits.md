# Pattern sheet: benefits (perks list and partner rows)

Capture: `http://localhost:8099/benefits.html`, measured at 1440x900 on 22 Nov 2026 (section outline, element snippets). Numbers and structure only, no Hims words or pictures pass into the repo. Pictures are blank in the capture, so image frames are measured as empty boxes. Page height 5020 at 1440. Every band is an `article` full width; content sits 48px in from each side (a 1344 column). The page is built from a handful of CMS blocks (overlaid hero, stacked flow, key line, open book, numbered list, accordion), which is why these blocks are reusable.

## Sections in order (1440)

| # | Band | y | h | Background | Padding (top / bottom) | Notes |
|---|---|---|---|---|---|---|
| 0 | Overlaid hero | 112 | 619 | `article` rgba(0,0,0,.03) behind a full-bleed picture | 60 / 60 | text column 672 wide at x48, itself 60px down; scrim comes from the picture |
| 1 | Stacked flow: heading + list | 707 | 1377 | white | 84 / 60 | grid 616 + 616, gap 112; heading and one paragraph left, ten partner rows right |
| 2 | Partner cards | 2084 | 296 | white | 60 / 60 | 3 columns of 438 (gap 30 across, 15 down) holding picture cards, plus a legal line |
| 3 | Key line list | 2390 | 680 | white, top radius 24 | 60 / 60 | grid 670 + 535; heading left, three key lines right; overlaps the band above by 24 (margin-top 10, shadow of the sheet) |
| 4 | Open book | 3046 | 843 | cream `#faf8f2` | 0 / 0 | grid 720 + 720; picture fills the left leaf edge to edge; right leaf pad 60 / 44, heading + numbered list; margin-top -24 |
| 5 | Stacked flow: heading + FAQ | 3865 | 250 | white, top radius 24 | 60 / 60 | grid 616 + 616, gap 112; margin-top -24 |
| 6 | Overlaid closing banner | 4091 | 810 | rgba(0,0,0,.33) scrim over a full-bleed picture | 84 / 60 | centred 672 column at x384, display heading + two pills; margin-top -24 |

Bands never use a divider line. Sheets overlap by 24px: the next band has `margin-top: -24px` and a 24px top radius, so each one looks laid over the last.

## Anatomy

**Type used** (fluid; phone to desktop, measured at 1440): heading-xl 44.67 / 418 / 45.6 / -0.387px, ink .81 (white on a picture); heading-l 37.5 / 436 / 40 / -0.21px; display-s 52.83 / 410 / 52.83 / -0.53px; item title 31.17 / 500 / 34.4 / -0.09px; offer title 26.67 / 500 / 30.2; body-m 18.5 / 400 / 23.2 / +0.4px (ink .5 on light, white on a picture); body-s 15.67 / 400 / 20 / +0.35px, ink .5; label-m 15.67 / 500 / 18.8; chip 12.83 / 500; legal 12.83 / 490 at .37 alpha. A key phrase inside a heading is an `em` painted with a terracotta-to-peach gradient (we use solid `terracotta`: no gradient text).

**Overlaid hero (band 0, 6)**: picture 1440 x 619 (810 for the closing banner), text left over it. H1 = two lines (each its own `h1`, 46 tall, 15px apart), paragraph 69px below, then two pills: white fill with ink label, and a translucent one. Pills 48px tall inside 56px boxes (4px margin).

**Partner row (band 1, right)**: `ul` flex column, rows 87 tall, 20px apart. Row = `li` fill rgba(0,0,0,.03), padding 30, radius 24, flex between, text 18.5 / 600 on the left, logo 48 x 27 on the right.

**Partner card (band 2)**: `article` 438 x 481, fill rgba(0,0,0,.03), radius 16, padding 25, flex column gap 20. Picture 388 x 218 radius 10; chip (inline-flex, padding 5.5 / 8, radius 46, fill `#ad6657`, white 12.83 / 500) over a title 26.67 / 500; text 15.67 / 400 .5 alpha; full-width black pill 388 x 48.

**Key line (band 3, right)**: `article` flex, gap 20, 25px below each. Bullet = a 20px-wide span holding a vertical bar: 8px wide, full height of the row, radius 10, gradient `linear-gradient(221.78deg, #9e4952 28%, #b76d57 54%, #dc926e 80%)`. Interior: title 31.17 / 500, 25px gap, text 15.67 / .5 alpha. Rows 129 to 150 tall.

**Numbered list (band 4, right)**: `ul` grid, row gap 20. Item = grid, 18px number badge + 10px gap + text column (gap 4). Badge 18 x 18 circle, fill `#ad6657`, white 11 / 700. Title label-m 15.67 / 500 ink .81, text 15.67 / 400 .5 alpha.

**Accordion (band 5, right)**: `details`, `summary` 64 tall (padding 18 / 0, flex, gap 20), question 15.67 / 500, 21px plus icon at the far right; rows touch (no gap), hairline between.

**Open book (band 4)**: two leaves of 720 under one cream band; the left leaf is the picture at full leaf height (843), the right leaf is vertically centred text with a 44px left margin.

**Hover and motion**: buttons colour-change 0.2s ease-in-out; rows and cards are static (no lift); the accordion plus rotates. No scroll-linked motion on this page.

## Pav mapping

| Hims block | Pav content | Kit file |
|---|---|---|
| Stacked flow (heading left, list right) | Vacancies: heading and filters left, the open roles right | `hims/stacked-flow.tsx` |
| Partner row | One open role: title, live description, Apply Now | `hims/row-card.tsx` |
| Key line list | About: the three things the Pav Dental App lets you do | `hims/key-line-list.tsx` |
| Numbered list | About: the four steps of the dream (Dream, Partnership, Shared Value, Roadmap) | `hims/numbered-list.tsx` |
| Open book | About: the future of dentistry (picture left, text right); Vacancies: foreign visa and sponsorship | `hims/open-book.tsx` |
| Overlaid hero, partner cards | Skip: Pav has no partners and no hero photo dark enough for white text | none |
| Accordion | Not on the people pages (live pages have no questions) | `hims/faq.tsx` (existing) |
| Closing banner | Closing band: Book now and Call | `hims/cta-band.tsx` (existing) |
