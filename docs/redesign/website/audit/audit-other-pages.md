# Audit: about, pricing, shop, team, blog and other pages (prefix O-)

Method: live site at localhost:8180, 1440 and 390 wide, image list with fetched size and decoded dimensions (lazy images do not load in the background pane, so every `src` was fetched directly), computed type sizes, section backgrounds, full-height screenshots. Hims rules from `docs/redesign/website/hims-design-system.md` and `hims-patterns/`.
Not covered: a filled cart and the real checkout form (cart and checkout only showed the empty state), hover states, the saved Hims captures were not re-opened (rules taken from the pattern sheets). The contact map iframe did not paint in the pane, so that one needs a check in a real browser.

Sitewide facts seen on every page (belong to the shell, listed once here): the header "Book now" pill is 91 x 34, cart and menu buttons 36 x 36 at 390 (under 44); the cookie card covers about a third of the first 390 screen; no page scrolls sideways at 390; the cart drawer curtain (`fixed inset-0 z-[70]`) is in the DOM twice on /category/toothbrushes.

## /about

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-001 | P1 | /about "The Future of Dentistry" (open book) | The picture is a small beige case on a table, not dental and not about an app, hub or van. Alt text claims "Pav Dental App alongside our Bradford Hub and Mobile clinic". | `images/generated/about-future.jpg` 1376x768, 376 KB; screenshot | Open book band with a relevant photo (clinical-excellence.md) | Replace with a picture of the van or app on a phone beside a dental room | needs pictures |
| O-002 | P2 | /about hero picture | Empty consultation-style room with vases and a bench, no chair or dental cue. Reads as spa or lounge. | `about-hero.jpg` 1200x896, 115 KB, rendered 1344x756 (upscaled, soft) | Hims hero picture is a clear subject | Use a real clinic or dental-chair photo, at least 1600 wide | needs pictures |
| O-003 | P2 | /about "A Legacy Fulfilled" picture | Dental chair room is fine but the file is 724 KB, rendered 1344x756 from 1200x896 (cropped, upscaled). | `about-legacy.jpg` 724 KB | Pictures under 160 KB | Recompress to about 150 KB, regenerate at 1600 wide | S |
| O-004 | P2 | /about team carousel | Square source photos (560 to 1796 px, B and W) cropped to 212 x 318 capsules; 785 KB and 540 KB files for a 212 px slot. Photos have different backgrounds and tone (white wall, window, dark), so the row looks uneven. | `team/7.jpg` 785 KB, `team/3.jpg` 540 KB, `team/8.jpg` 259 KB | Hims people capsules share one lighting and a flat backdrop | Resize to 640 wide, about 60 KB each; normalise contrast and add a common grey backdrop (CSS grayscale and contrast filter) | M |
| O-005 | P2 | /about page title | The document title is the home page title ("24/7 Emergency & Private Dental Clinic in Bradford ..."), not an about title. | tab title on /about | Own title per page | Give about its own title and description | S |
| O-006 | P2 | /about closing "Get In Touch" band | Brown card inside a white section, then a white strip (about 80 px) before the black rounded footer: the owner-reported seam. | `wrap section-y` 5264+457, footer starts 5721 | Closing band sits flush above the footer | Drop the transparent `wrap section-y` padding below the band, or make the footer top overlap the band's section colour | S |
| O-007 | P3 | /about type | H1 and "A Legacy Fulfilled" are 82 px (display); the page H1 scale is 40 to 57 px. | computed 82 px | `text-hero` 57 max | Use `text-hero` for H1, keep display only for the statement | S |
| O-008 | P3 | /about "The Dream and The Team" | Cream band with a left heading and four numbered steps: plain text only, no picture, then two stacked text bands in brown ("Executing", "Inspiration"). Long text wall in brown (1077 px). | sections 1542+552 and 2431+1278 | Stacked flow plus commitments (people-recipe.md) | Fine structurally; shorten the brown statement or add a picture | M |

Summary: structure follows the people recipe. The two weak spots are the future picture (wrong subject) and heavy team photos.

## /pricing

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-009 | P1 | /pricing hero picture | A paper pad on a wooden table. Not dental, not about payment. | `pricing-hero.jpg`, 644x483 box | Membership hero uses a relevant picture | Replace with a payment-plan style picture (card reader, smile, dental room) | needs pictures |
| O-010 | P2 | /pricing plan cards | Bronze, silver and gold cards use grey-white boxes with tick lists; plan card prices read "£9.47 / month", the middle card has a black pill and a lifted shadow. The first Bronze bullet reads "AI health scan". Cards in the screenshot are cream on a white page with little contrast. | screenshot at 1440; headings H3 28 px uppercase | `plan-card.tsx`, membership.md (rounded-xl cards, chip on the popular one) | Check the card radius, shadow and height against membership.md; confirm the "AI health scan" claim exists on the live site | M |
| O-011 | P2 | /pricing "Treatment Fee Schedule" | 13 groups, about 4,700 px of two-column rows; filter pills wrap over three rows. Looks like an invented long list page. | section 1640+4726 | Hims uses short comparison tables or tiles, not 5,000 px lists | Collapse each group into an accordion row or show 4 groups with "Show all"; keep one filter row | M |
| O-012 | P2 | /pricing insurance tiles | Six plain white pills with names only, no logos; the band is cream next to a white section so it looks like an empty strip. | section 6367+402 | Tiles with logos | Use logos or fold into a single sentence | S |
| O-013 | P3 | /pricing type | "Special Announcement from Pav Dental" H2 57 px with a one-sentence body, then a bold card list. | H2 57 | h2-md 48 for ordinary sections | Use `text-h2-md` | S |
| O-014 | P3 | /pricing mobile | Page is 11,499 px tall at 390; the fee list is the cause. | `scrollHeight` 11499 | n/a | Same fix as O-011 | M |

Summary: correct sections, wrong hero picture, and an overlong fee list.

## /shop

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-015 | P1 | /shop product tiles | Ten products show only 8 distinct pictures, all unrelated service or stock pictures, none shows the product. The mouthwash shows a ceramic dish, floss shows a stone slab, "Whitening Top-Up Syringes (Pack of 4)" shows a dental chair room, enamel toothpaste reuses the hero (bottles on a stone). | `shop-hero.jpg` used 3 times, `oral-hygiene-hero.jpg` 2, `oral-hygiene-showcase.jpg` 2, `dentures-hero.jpg` 2, `whitening-strips.jpg` 2; `whitening-home-in-office.jpg` is a chair room | Product cards show the product on a clean tinted backdrop | Generate one clear product shot per item (white or cream backdrop, 4:3), one file per product | needs pictures |
| O-016 | P1 | /shop category tiles | "Teeth Whitening" tile shows an electric toothbrush and a cup (the toothbrush picture is also the first product), "Toothpaste" reuses the hero bottles, "Denture Care" is a decorative ceramic dish. Subject contradicts caption. | `whitening-strips.jpg` alt "Teeth Whitening" actually shows a toothbrush; tile 276x207 | Category tiles with a picture of that category | New pictures for the four category tiles | needs pictures |
| O-017 | P2 | /shop hero | Hero picture duplicates the Toothpaste tile and the toothpaste product (`shop-hero.jpg`, three times on one page). | image list | Distinct picture per block | Use a different hero (clinic shelf of products) | needs pictures |
| O-018 | P2 | /shop product grid | 10 products in a 3-column grid leave one tile alone on the last row. | grid screenshot | Rows fill evenly | Show 9 or 12, or use a 2-up last row | S |
| O-019 | P2 | /shop product cards | Pill labels (category, "Clinician Pick") sit over the picture in tiny type; title, price, text, then two buttons; text blocks and button rows are not equal height so the Add buttons sit at different heights across a row. | screenshot at 1440 | `product-card.tsx` pattern | Equalise card height with flex and push buttons to the bottom | S |
| O-020 | P2 | /shop mobile | Four category tiles stack full width (about 240 px tall each, 1,000 px before the products); product cards are one column. | 390 screenshot | Hims uses a carousel for category cards on a phone | Make the category row a snap carousel (1.15 cards) on phone | M |
| O-021 | P3 | /shop closing sections | Brown delivery band and FAQ band back to back; the FAQ has four items with 16 px question text, small. | FAQ H3 16 px | Accordion 18 to 20 px | Raise question size to `text-h4` | S |

Summary: the shop looks like a design but every picture is a placeholder substitute. Highest-value fix is real product pictures.

## /shop/acoustic-sonic-toothbrush

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-022 | P1 | PDP gallery thumbnails | Thumbnails 2 and 3 are the bottles still life (`shop-hero.jpg`) and the floss slab (`oral-hygiene-showcase.jpg`), alt text says "Acoustic Sonic Toothbrush view 2 and 3". They contradict the product. | 60x60 thumbs; srcs | Gallery shows four views of the same product | Provide real extra views or remove the thumbnails | needs pictures |
| O-023 | P2 | PDP "Complementary Oral Care" | Related cards reuse the same off-subject pictures (floss slab, strips, chair room). | image list | Related product scroller | Same fix as O-015 | needs pictures |
| O-024 | P2 | PDP below the fold | Only spec rows and related products follow the panel: no how-to-use band, no reviews, no FAQ, no closing band. Page is 2,500 px. | sections 93+2410 | minoxidil-pdp.md: results, how to apply, related, FAQ | Add a how-to-use band and a short FAQ | M |
| O-025 | P3 | PDP side panel | "Directions" and "Delivery" accordions are 16 px headings and the whole panel is tight; "Clinical Highlights" accordion open by default pushes Add to bag high. | screenshot | shop-pdp-notes.md side rail | Check sizes against that sheet | S |
| O-026 | P3 | PDP breadcrumb and spec section | Spec rows band is cream on white with 33 px heading; acceptable but the key labels column is very narrow. | screenshot | n/a | Widen label column | S |

Summary: right layout, wrong pictures in the gallery.

## /category/toothbrushes

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-027 | P2 | Category list | Only two product cards fill a 3-column grid, so the page is a short cream block with a large empty right third, then the footer. Hero H1 only, no picture or lead. | sections 93+237, 330+811; two cards 437 px wide | category-hero with picture, then tiles, then closing band | Add the category hero, lead and a closing band | M |
| O-028 | P3 | Category two cream sections | Hero and list are both cream with no divider, the page looks like one long empty box. | both `bg-cream` | Alternate white and cream | Make the list white | S |
| O-029 | P3 | Duplicate drawer curtain | The cart drawer curtain element is in the DOM twice on this page. | two `fixed inset-0 z-[70]` nodes | n/a | Render the drawer once in the layout | S |

## /team

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-030 | P2 | Team grid photos | Black and white originals look good as a set in the capsule, but tonal range and backdrops differ (Aboo and Uwais bright wall, Haris and Sayed dark); some faces are cut low (Waleed). Files up to 785 KB for a 264 px capsule. | `team/7.jpg` 785 KB 1796x1796; `team/3.jpg` 540 KB | people-recipe.md capsule | Resize to 640, tune crop position per person, consistent contrast | M |
| O-031 | P2 | Team closing band | Navy "Ready to book" card sits in a transparent `wrap section-y` with a white gap above the black footer: the navy / white / black seam. Band is navy while the about page uses brown. | band 1847+145, footer 2136 | Closing band flush to the footer | See O-006 | S |
| O-032 | P3 | Team hero | The directory has no subhead picture and no group labels (clinicians vs staff), 8 capsules in two rows. | h2 28 px names | people grid | Add "Clinical team" and "Practice team" subheads | S |

## /team/dr-hassan-bhojani and /team/aboo-bhojani

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-033 | P2 | Hassan "Early Employment Experience" | Cricket scoreboard assistant, receptionist, retail assistant in cooked meats, seasonal retail: four weak CV rows that add 700 px and look unprofessional. | H3 list @3510 | Profile shows qualifications and scope only | Cut the section (needs owner approval) | needs owner |
| O-034 | P2 | Hassan navy quote band | A navy band holds a long religious-style quotation "Inspired by Imam ...", not a Hims component and not on the live site as far as the repo shows. | band 4647+458 `bg-navy` | No quote band on Hims profiles | Remove or confirm with owner it is live content | needs owner |
| O-035 | P2 | Profile layout | Photo 360 x 540 (668 px square source, softened), black and white, rounded capsule beside the bio: fine. The "Practices & institutions" list is a two-column tick list of 20 short items, hard to scan. | screenshot | Stacked flow CheckList | Group into employers and training | S |
| O-036 | P3 | Aboo profile | Page is short (about 3,600 px), but still gets the navy band and peers carousel; "Aboo's" lead paragraph is 100 words. | page heights | n/a | Trim the lead | S |
| O-037 | P3 | Profile peers row | Peers carousel repeats the B and W capsules at 212 x 318, same files as on /team (see O-030). | image list | n/a | Same fix as O-030 | S |

## /vacancies

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-038 | P1 | Hero picture | Cream living room with vases and a bench: no dental or work cue. | `vacancies-hero.jpg` rendered 1344x756 from 1200x896 | people-recipe.md hero | Use a team-at-work picture | needs pictures |
| O-039 | P2 | Sponsorship band picture | Chair room, 724 KB, shown at 644 x 483 (box looks darker and is cropped). | `vacancies-sponsorship.jpg` 724 KB | Under 160 KB | Recompress | S |
| O-040 | P2 | Open positions list | Seven role cards stacked in a narrow right column (about 280 px each, 1,500 px), long grey paragraphs, two buttons per role; "Foreign Visa and Sponsorship" is listed as a job card and again as its own band. | H3 @1533 to 3179 and H2 @3703 | Row cards (RowCard), people-recipe.md | Use `RowCard` rows with a single "Apply" button; drop the duplicate sponsorship card | M |
| O-041 | P3 | H1 size | 82 px, over the 57 px hero size. | computed | text-hero | `text-hero` | S |

## /petition

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-042 | P2 | Hero picture | A wood-clad building exterior, not dental or Bradford-specific. | `petition-hero.jpg` | n/a | Use a street or clinic exterior photo of Pav Dental | needs pictures |
| O-043 | P2 | Video poster | Thumbnail loaded from img.youtube.com (third-party request before consent), contains a TV news caption. | `https://img.youtube.com/vi/fISWYcAMjEw/maxresdefault.jpg` | n/a | Host a local poster; load YouTube only after click | S |
| O-044 | P2 | Sign block | "Sign the Petition" appears three times (card, band H2, form), with the form in a brown band and a second cream form lower ("Get In Touch"): two forms on one page. | H2 @770 and @1081 | One primary form | Remove the contact form or the duplicate heading | S |
| O-045 | P3 | Page type | H1 57 and many 28 px cards: acceptable. Cards "Sign" and "Share" are links with chevrons only. | screenshot | n/a | none | S |

## /blog, /blog/all and the article

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-046 | P2 | /blog repeated articles | Nine articles fill about 19 card slots: Latest, Condition Guides and Urgent Care repeat the same four to six posts; the lead article appears in 3 places. | image list: `tooth-extraction-bradford.jpg` 4 times, `video-call-assessment.jpg` 4 | blog.png: each category row shows distinct posts | Show 3 distinct posts per row or drop the category rows until there are more posts | S |
| O-047 | P2 | /blog type | H1 87 px and section H2 62 px; both over the scale (hero 57, h2 57). Page-wide grey `bg-black/[0.03]`. | computed | blog.png | Use `text-hero`; make page background white or cream | S |
| O-048 | P2 | /blog featured hero | Lead article with a 610x381 picture and a 4-article list of 96 px thumbs beside it: not the Hims blog hero. | screenshot | blog.png: one large featured card plus rows | Decide whether to keep; thumbs are small | M |
| O-049 | P2 | Blog cards pictures | "Beat the Dental Squad" cover is a tall 1200x1800 poster with its own text, cropped to a 348 x 218 strip so the text is cut. Card pictures are fine otherwise (checked). | `beat-the-dental-squad...jpg` 413 KB | n/a | Crop or replace the card cover | S |
| O-050 | P3 | /blog/all | Clean 3-column grid; 12 posts but pagination is 3 numbered pages with 9 per page, last page empty-looking? (only two pages of content). Category pills row spills past the viewport. | pills row, 3 pages | blog-all.png | Check the page count | S |
| O-051 | P2 | Article layout | Article column is 650 px at x about 440, a left contents rail at x about 100, and nothing on the right: the text block sits off-centre with a 300 px empty right margin at 1440. A red promo bar and a chip row also sit above the article. | article `mt-8 min-w-0` 650 wide; screenshot | blog-article-how-long-minoxidil.png: centred 736 prose column | Centre the prose in `wrap-prose` (736), keep contents rail left or remove | M |
| O-052 | P3 | Article body | Body text 16 px with 20 px line height (1.25), 210 px wide table cells in the comparison table; comfortable but tight. | computed `p` 16/20 | text-body 1.275 | Raise line height to 1.6 for long copy | S |
| O-053 | P3 | Article author photo | Author avatar is `team/2.jpg` (668 px) at 56 px; "Related Articles" use 180 x 116 thumbs. | image list | n/a | fine, but resize file | S |

## /faq

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-054 | P2 | FAQ answer text | First answer is an open accordion with a 150-word single paragraph at body size; 5 questions only. | screenshot | faq accordion | Break into short paragraphs; add more questions | S |
| O-055 | P3 | FAQ category cards | Three white cards on a sand band under the accordion, no pictures; the filter pills at top show counts (4, 3, 5 etc.) but only 5 questions exist. | screenshot | n/a | Remove the pills or the cards | S |
| O-056 | P2 | FAQ page seam | Cream, white and sand bands plus white `wrap` gap above the footer. | sections 93, 568, 1619, 2032 | n/a | Same as O-006 | S |

## /contact-us

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-057 | P1 | Map block | The Google map iframe rendered as an empty grey box in the pane (may be sandbox); if it fails for patients it is a blank 540 px area. | iframe in section 1636+820, no paint | n/a | Verify in a real browser; add a static map image fallback and a Directions link | S |
| O-058 | P2 | Contact sections | Four bands: white form, cream clinic, sand map, then a closing band; cream and sand sit next to each other and the "Visit our clinic" cards (3) have small 28 px text with icon circles. Opening hours card is "00:00 – 24:00" as a 28 px heading. | headings @1400 | n/a | Merge clinic and map into one band; write "Open 24 hours" | S |
| O-059 | P3 | Form | Form field radius and heights match the 14 px rule; the "Send message" button is full width, others pill 48. | screenshot | forms | none | S |

## Policy pages (/privacy-policy, /terms-and-condition, /cookie-policy, /complaints-policy, /practice-policy, /cctv-policy)

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-060 | P2 | All six: layout | Cream hero with H1 57 px, a "On this page" and "Related policies" sticky side card, plus a data-table and callout on cookie policy: an invented policy layout (Hims legal pages are one plain prose column). Content column starts at x 48 with a 672 px width and only the text on the right. | `p` left 48, width 672; cookie screenshot | `wrap-prose` 736 column | Remove the side cards or keep only "On this page"; centre the prose column | M |
| O-061 | P3 | Policy pages body | Body text 19 px for paragraphs and 33 px H2s: large for legal text. | computed `p` 19 px | text-body 16 px | Use 16 px body | S |
| O-062 | P3 | /practice-policy | Page is a list of documents (Policies, Consent Forms, Posters) with a 343 px cream hero then a 1,900 px list. No problem except the title "Pav Dental Documents" differs from the footer link "Practice Policy". | H1 text vs link | n/a | Rename H1 to match the link | S |
| O-063 | P3 | Titles | Policy `<title>` texts are marketing style ("Your Data, Your Trust ..."). | tab titles | n/a | Plain titles | S |

## /cart and /checkout

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| O-064 | P2 | Empty states | Empty states differ in wording: "Your Shopping Bag is Empty" (cart) and "Your Bag is Empty" (checkout), and the empty cart page is a tiny block with a lot of white above the footer (content minimum height tied to viewport). | headings 48 px | Hims empty bag is a drawer | Use the same words; keep the page short | S |
| O-065 | P3 | Not tested | Filled cart and checkout form were not reachable without adding to the bag; check separately. | n/a | n/a | n/a | S |

## Counts by severity

- P1: 9 (O-001, O-009, O-015, O-016, O-022, O-038, O-057 and two of the shop pair counted once each above) - exact: O-001, O-009, O-015, O-016, O-022, O-038, O-057 = 7.
- P2: 36
- P3: 22

(7 + 36 + 22 = 65 rows; O-065 is a note.)

## Five worst problems

1. Shop product, category and gallery pictures are reused off-subject stock (O-015, O-016, O-022, O-023): ten products, eight pictures, none shows the product.
2. About "future" picture, pricing hero and vacancies hero are not dental (O-001, O-009, O-038).
3. Blog article is off-centre with a 300 px empty right side and the blog uses the same few posts in three rows (O-051, O-046).
4. Closing band, white strip, black footer seam on about, team, faq, contact and profiles (O-006, O-031, O-056).
5. Team and profile photos are 540 to 785 KB for 212 to 360 px slots and vary in lighting; Hassan's profile has odd content (O-004, O-030, O-033, O-034).

## Fixes that can be done together

- Product pictures: O-015, O-016, O-017, O-022, O-023 (one image batch plus `product-card` data).
- Heavy photos: O-003, O-004, O-030, O-037, O-039 (resize and recompress, one script).
- Closing band seam: O-006, O-031, O-056 (one component `cta-band` / wrapper padding).
- Hero pictures: O-001, O-002, O-009, O-038, O-042, O-017 (one picture batch).
- Type scale: O-007, O-013, O-041, O-047, O-061 (swap to `text-hero`, `text-h2-md`, body 16).
- Page titles: O-005, O-063.
- Owner content decisions: O-033, O-034, O-011.
- Duplicate content: O-046, O-040, O-044.
- Mobile: O-020 (category carousel), header tap targets (sitewide shell).
