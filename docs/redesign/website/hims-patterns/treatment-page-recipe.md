# Recipe: a Pav treatment (service detail) page in the Hims style

Built in pass 2 from the captures `/testosterone.html` (condition page) and `/hair-loss/minoxidil.html` + `/weight-loss/wegovy-pill.html` (product pages). Worked examples: `/services/root-canal` (plain explanatory page) and `/services/whitening` (price tiers, comparison, a feature). Numbers: [testosterone.md](testosterone.md), [minoxidil-pdp.md](minoxidil-pdp.md), [wegovy-pill-pdp.md](wegovy-pill-pdp.md). Import the new kit files **by direct path** (`@/components/hims/steps`): `hims/index.ts` is not edited yet. Every component has its props and the measured Hims values in its JSDoc header.

## Section order (follow the live page's order; skip a section the live page has no content for)

| # | Live content | Kit component | Notes |
|---|---|---|---|
| 1 | H1, lead, "Make an Appointment", "Contact us" | `TreatmentHero` (`treatment-hero`) | `facts` = up to 3 rows cut from live sentences (prices, durations); `tiles` = the wired pictures (1 tile = wide band); one H1 (`title` + `accent`) |
| 2 | "How X is done", steps, a video | `Steps` (`steps`) | `media` slot takes a picture or the page's own video player; step titles are H3 |
| 3a | Price tiers of one treatment (Basic / Intermediate / Advanced) | `PricingTiles` (existing) | live descriptions verbatim, no invented "best for" lines |
| 3b | Several products or ranges with prices and a paragraph each | `OptionTiles` (`option-tiles`) + text rows | tiles link to `#id` of the detail rows; tags become badges; titles in tiles are not headings |
| 4 | "Good care helps to ..." lists, "what is included" | `IncludedList` (`included-list`) | or `BenefitCards` (`benefit-cards`) when each point has a picture and a paragraph |
| 5 | Side-by-side facts of options | `ComparisonTable` (`comparison-table`) | table from `md` up, cards on a phone; both stay in the HTML |
| 6 | Informed consent | `ConsentPanel` (existing) | heading and items verbatim |
| 7 | After-care notes, "Meet / How it works / Ingredients" blocks | `InfoAccordion` (`info-accordion`) | native `<details>`: words stay in the server HTML |
| 8 | FAQ | `FaqSection` (`faq-section`) | heading left, rows right; each question is an H3 |
| 9 | "Get In Touch" form | page-local `<page>-contact.tsx` | copy `root-canal-contact.tsx` (hooks `useEnquiry("<Service>")`, ids `xx-name`...); the live pages all end with this form |
| 10 | A closing call to action that is an H2 today | `ClosingBand` (`closing-band`) | highlight phrase = second half of the existing H2; do not add a new one |

Header rows with a button on the right: `SectionHeader` (`section-header`) is used inside every section component above.

## Traps (each one cost time)

- **SEO**: H2 words and order, H3 lists (the fingerprint compares H3 too), link hrefs, image `alt` strings and word count must survive. Keep FAQ questions, step titles, price names and consent items as H3. Keep alt strings exactly when a picture moves.
- **Live wins**: eyebrow pills, "best for" lines, ratings and ranges that the live page never said come out (list them in the page file's Pass 2). A fact row is a fragment of a live sentence ("Most root canals take 45-90 minutes"), never new copy.
- **Hidden text**: never swap `InfoAccordion` for a state accordion that unmounts closed answers.
- **Forms**: if the live page ends with a form, keep the form (whitening had lost it in pass 1).
- **Phone**: hero actions stack full width; links under them need `min-h-11`; contact links too (44px targets). `BenefitCards` with four items needs `columns={4}` or the fourth wraps.
- **H1 size**: Hims condition and product H1 is 32px at 390 growing to 57px at about 1650 (our `text-hero` is 40 to 57). Token request `text-display-s` (see Open questions in the report); until it exists the hero uses `text-hero`.
- **FAQ look**: Hims rows are 64px with a 15.67px/500 label and a 21px chevron, no circle; the kit `FaqList` (circle +/- at `text-h4`) is a pass 1 design and is not like Hims.
- **Browser**: `navigate` drops the viewport emulation (call `resize_window` after it), scroll with `behavior: "instant"`, and a screenshot shows the state one action earlier (wait 1s, shoot twice). Pass `tabId` inside `browser_batch` items too.
- **Images**: use `Media` placeholders and add "Images needed" rows; the hero strip wants 3 or 4 tiles to look like Hims (one tile is a wide band).
