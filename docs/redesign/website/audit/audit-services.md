# Audit: services hub and service pages (prefix S-)

Scope: `/services`, 13 service pages, `/services/finance`, `/services/regestration`. Checked at 1440 px (full scroll heights, section list, every `<img>`), mobile (390 px) on hub, whitening and mouthguards only. Hims reference: `docs/redesign/website/hims-patterns/treatment-page-recipe.md` and the Hims treatment/category page structure.

Method notes and limits:
- Lazy images in the preview pane often stayed `complete=false, naturalWidth=0` even with the viewport taller than the page (for example `root-canal-how.jpg`, status 200, 697 KB, loaded as soon as `loading` was set to `eager`). I treated this as a harness effect, not a missing file, but it is worth a real-phone check (S-004).
- I looked at pictures by opening the files (`website/public/images/generated/*`) and by hub/page screenshots. I did not open the Hims capture PNGs, so the "Hims reference" column relies on the recipe doc.
- Mobile was measured only on three pages. Full 390 px passes on the other 13 pages were not done. No sideways scroll was found on those three (`scrollWidth` 390).
- Pages not screenshotted below the fold: root-canal, tooth-extraction, dentures, cosmetic, aesthetics, emergency, grillz, mobile, virtual, regestration. For these I have section lists, image data and file sizes only.

## Hub: /services

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-001 | P1 | /services, tile pictures | 12 of 15 tile pictures are spa or product-still props, not dental: living room with armchair (Root Canal, Aesthetics), hand mirror on cork (Extraction), soap/comb trays (General, Cosmetic, Whitening), pebbles (Mouthguards), gold chains (Grillz), tablet on cloth (Virtual), desk with book (Finance). The subject of the card is not readable from its picture. | `/images/generated/*-hero.jpg` in the tiles; screenshot of hub at 1440 | Hims hair-loss category: each card picture shows the product or treatment itself | Regenerate one on-subject picture per service (tooth, instrument, chair, swatch). Use `home-card-*.jpg` already made for six services as a start | needs pictures |
| S-002 | P1 | /services, Registration tile | Last tile has a pale green gradient and no picture (empty box). | 15 tiles, only 14 `<img>`; tile `Registration` has none | Hims cards always carry a picture | Add a picture, or use a flat icon tile that is clearly designed as one | needs pictures |
| S-003 | P2 | /services, tile pictures | Tile pictures are the 1200 px hero files shown at 389x292, so each tile downloads the full hero (47-150 KB each, 14 of them). | naturalWidth 1200, rendered 389x292 | Hims serves card-sized images | Export 600 px tile versions | S |
| S-004 | P3 | /services, lazy loading | In the pane the last tiles reported `complete=false` until forced eager. Check on a real phone that tiles near the fold load. | tiles 13-14 empty at first measure | n/a | Use `loading="lazy"` only below the first two rows, add `decoding="async"` | S |
| S-005 | P2 | /services, structure | Cream "Our Services" header band, then a white section with a flat 3-column grid, then a brown closing band. Hims category pages use a tall coloured intro band with one photo, then card rows grouped by theme, then reviews, FAQ and a closing band. The hub has no grouping, no FAQ, no reviews. | section list: header 177 px, grid 2449 px, CTA 457 px | `hair-loss.png` category | Group the 15 tiles under 3 headings (Check-ups and care, Smile design, Access and cost) and add an FAQ and review row | M |
| S-006 | P2 | /services, closing band | Closing band is dark brown with a lime-yellow button, not the Hims closing band (black or deep green, white pill). The brown also appears in several service pages. | `SECTION.wrap section-y` CTA at y2719 | Hims closing band | Use the kit `ClosingBand` in the Hims colour | S |
| S-007 | P3 | /services, `<title>` | Tab title is "Emergency Private Dental Clinic in Bradford..." for the services hub, which does not match its content. May be copied from live for SEO parity. | document title | n/a | Confirm against live `/services` title; leave if identical | S |
| S-008 | P2 | /services, mobile | 55 interactive elements under 40 px high in `main` plus header (for example phone link 22 px, "Pav Dental" logo link 26 px, "View all" 17 px, "Whitening" 38 px). Mostly shared header and footer. | 390 px measurement | 44 px targets | Add `min-h-11` to the header phone link, footer links and tile links | S |

## /services/whitening

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-010 | P1 | Hero strip | Hero picture is a set of soap bottles and a eucalyptus sprig. Reads as spa, nothing to do with teeth. | `whitening-hero.jpg` 1344x504; alt claims "Bright minimalist teeth whitening" | Hims product hero shows the product | Replace with a shade guide, tray or smile photo | needs pictures |
| S-011 | P1 | Award Winning Whitening tiles | Tile "Whitening Strips" shows an electric toothbrush in a cup with a plant (not strips). Alt says "Mint-flavored dissolving teeth whitening strips". Caption contradicts the picture. | `whitening-strips.jpg` 767x667, 560 KB | Hims option tiles show the named product | New picture of whitening strips | needs pictures |
| S-012 | P2 | Award Winning tiles | "Home Teeth Whitening" tile shows a small green pod on a large cream box, subject tiny; the "In Office" tile is the same room picture as root-canal "How" step (identical file bytes, 697 KB). | `whitening-home-kit.jpg` 517 KB, `whitening-home-in-office.jpg` = `root-canal-how.jpg` (697,518 bytes) | Hims never repeats a picture across product pages | One distinct, tighter-cropped picture per tile | needs pictures |
| S-013 | P2 | Tile pictures weight | Three pictures 517-697 KB, served at 500x250. | file sizes | under 160 KB | Resize and recompress to 1000 px wide, under 120 KB | S |
| S-014 | P2 | Shade guide band | Dark brown band with interactive shade picker (pills, card). No Hims equivalent (invented layout). Brown, not in Hims palette. | section "Explore our shade guide" y3394 h741 | Hims tall coloured band with a photo | Keep the content but put it in a Hims-coloured band, or fold into the comparison table | M |
| S-015 | P3 | Comparison table | Table is readable but pill badges in the header ("On-the-Go Maintenance" etc.) are tiny (about 9 px) at 1440. | screenshot | Hims table uses 14 px+ text | Raise badge text to 12 px minimum | S |
| S-016 | P3 | Section order | Prices appear three times: hero facts, tiles, numbered rows, then table. Content repeated 4 times. | sections 1-4 | Hims lists price once per card | Remove the numbered rows or the tiles | M |

## /services/root-canal

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-020 | P1 | Hero strip | Hero is a sunlit living room with an armchair; looks like an interior-design shot, not a root canal. | `root-canal-hero.jpg` (alt "Warm sunlit Pav Dental treatment room") | Hims hero shows the treatment or product | Tooth cross-section or clinician and patient | needs pictures |
| S-021 | P2 | "How the root canal is done" | Picture is an empty dental chair room (fine, dental) but 697 KB and the same file as whitening in-office tile; generic, does not show a step. | `root-canal-how.jpg` rendered 659x494 | Steps with media slot showing each step | Replace with a step picture, compress | needs pictures |
| S-022 | P3 | Page length | Sections otherwise match the recipe (hero, steps, prices, consent, FAQ, form, closing). Page ends with form then closing band: Hims ends with closing band then footer, fine. | section list | recipe order | none | n/a |

## /services/general-dentistry

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-030 | P1 | Hero strip | Hand mirror and toothbrush on a plate; alt "Minimalist dental examination" does not describe the picture. Looks like a bathroom shelf. | `general-dentistry-hero.jpg` | Hims hero on subject | Dentist examination picture | needs pictures |
| S-031 | P2 | Page structure | 11,089 px long, 14 sections. Root canal prices, root canal consent, extraction prices, extraction consent and white filling prices are repeated from other pages. Reads as a stack of pasted pages. | sections "Our Root Canal Prices", "Informed Consent for Root Canal", "Our Tooth Extraction Prices" ... | Hims treatment page is about 8 sections | Link to the root-canal and extraction pages and show one price summary. Needs owner check against live page | needs owner |
| S-032 | P2 | Cavities video block | 1344x756 grey video frame with a 1916 px infographic poster; before it loads the box is a flat grey rectangle (visible in first screenshot). | screenshot, poster `1.jpg` | Hims video blocks use a real still | Use a poster that loads eagerly with `width`/`height` | S |
| S-033 | P2 | Consent panels | Cream consent card is about 560 px wide centred in a full-width section, leaving big empty cream margins; two near-identical ones back to back. | screenshot | Hims consent is a left-aligned panel in the content column | Use the same width as the prices grid | S |
| S-034 | P3 | Image count | Page has 3 pictures in 11,000 px; long text-only stretches. | image list | Hims has a picture every screen | Add pictures to services and "How to choose" sections | needs pictures |

## /services/oral-hygiene

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-040 | P2 | Hero strip | Electric toothbrush in cup with plant; on-subject but identical to the whitening-strips tile (reused concept, near-duplicate). | `oral-hygiene-hero.jpg`, `whitening-strips.jpg` | Hims one picture per page | Distinct hero showing a hygiene clean | needs pictures |
| S-041 | P3 | Pictures | Two further images (hygiene scene 659x494, consent 1344x756) did not load in the pane (lazy); files exist as `oral-hygiene-showcase.jpg`. Confirm they load. | `complete=false` | n/a | Verify on a device | S |
| S-042 | P3 | Length | 9,500 px with ten sections; five text blocks in a row ("Who needs", "Understanding informed consent", "Advice"). | section list | shorter | Merge into accordion (`InfoAccordion`) | M |

## /services/tooth-extraction

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-050 | P1 | Hero strip | Hand mirror on cork board, no teeth, no surgery; alt says "Serene Pav Dental oral surgery". | `tooth-extraction-hero.jpg` 153 KB | Hims hero on subject | Replace | needs pictures |
| S-051 | P2 | Whole page | Only one picture on an 8,577 px page; the rest is text and cards. | image list: 1 | Hims alternates picture and text | Add steps picture and after-care picture | needs pictures |
| S-052 | P2 | "Book Your Appointment Today" | A mid-page booking section (597 px) sits between after-care and FAQ, plus a form and a closing band. Three calls to action stacked. | section list | Hims: one closing band | Drop the mid-page block | S |
| S-053 | P3 | Post operative instructions | 1,527 px tall block (longest section); not an accordion. | y3200 h1527 | `InfoAccordion` | Convert to accordion | S |

## /services/dentures

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-060 | P1 | Hero | Arch tray with beads, looks like jewellery/ceramics, not dentures. | `dentures-hero.jpg` 668x376 | Hims hero on subject | Denture set picture | needs pictures |
| S-061 | P2 | Hero layout | Hero uses a 668x376 picture beside text (not the 1344x504 strip other pages use). Inconsistent hero between pages. | measurement | Hims one hero pattern | Use `TreatmentHero` strip | M |
| S-062 | P3 | Headings | Section headed just "Dentures" (h 637) after "We offer a variety of denture solutions" with the same words; heading does not describe content. | section list | specific headings | Rename from live | S |

## /services/mouthguards

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-070 | P1 | Hero strip | Pebbles on a cushion/stone slab; mouthguard not recognisable. | `mouthguards-hero.jpg` 97 KB | Hims hero on subject | Picture of a coloured mouthguard (swatch art exists) | needs pictures |
| S-071 | P2 | Choose Your Colour | 34 swatches, all `mg.png` 559 px shown at 124 px (good, on-subject). But the section is 1,276 px with 4 filter pills of 34 px height on phone. | pill heights 34 px at 390 | 44 px targets | Make pills `min-h-11` | S |
| S-072 | P2 | Mobile carousel | Cards "Who can use" use 80% wide horizontal scroller; cards extend beyond viewport (intended) but no scroll hint. | `LI.w-[80%] snap-start` | Hims carousels show partial next card plus arrows | Add arrows or dots | S |
| S-073 | P3 | Hero tap targets | "Make an Appointment" and "Contact us" are 34 px tall on 390 px. | measurement | 44 px | `min-h-11` | S |

## /services/cosmetic

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-080 | P1 | Hero | Hero picture is a comb and mirror still life ("Cosmetic dentistry shade guide" in alt); it is 443x332, so the hero is small and sits beside text. | `cosmetic-hero.jpg` | Hims hero strip | Shade guide or veneer picture | needs pictures |
| S-081 | P2 | Pictures | Three pictures of the same visual style at 443x332 (hero, about, showcase) look like three crops of a cream shelf. | `cosmetic-about.jpg` 118 KB, `cosmetic-showcase.jpg` 105 KB | Hims distinct pictures | New set | needs pictures |
| S-082 | P2 | "What is Cosmetic Dentistry?" | Section is only 255 px tall with a heading and one paragraph; looks like a stub squeezed between hero and procedures. | y957 h255 | Hims sections are 600+ px | Merge into hero lead | S |
| S-083 | P3 | Two closings | "Book Appointment" (525 px) after the form plus "Get In Touch" form. | section list | one closing band | Keep one | S |

## /services/aesthetics

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-090 | P1 | Hero | Warm room with sofa and armchair, nothing aesthetic (injectables, skin). | `aesthetics-hero.jpg` 668x376 | on subject hero | Skin treatment photo | needs pictures |
| S-091 | P2 | Pictures | Only 2 pictures; "Aesthetics Treatments" section (714 px) and price list (854 px) have none. | image list | pictures in treatment cards | Add per-treatment pictures | needs pictures |
| S-092 | P2 | "What people say?" | Heading with question mark, repo-style grammar ("How We are Keeping You Safe") mixed with Title Case. Reviews are live; check they are real. | section headings | Hims "Real reviews" row | Check wording against live | needs owner |
| S-093 | P3 | Closings | Form (793 px) and "Book Appointment" band (525 px) both end the page. | section list | one | Keep one | S |

## /services/emergency-dental

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-100 | P1 | Hero | Dark hallway/treatment room; looks like a spa. No sign of emergency or pain. | `emergency-dental-hero.jpg` 108 KB | on subject | Out-of-hours dentist or phone-in picture | needs pictures |
| S-101 | P2 | Whole page | One picture on a 7,844 px page. | image list: 1 | pictures per section | Add pictures | needs pictures |
| S-102 | P2 | Gap before form | Empty 211 px section (no heading, no content) between reviews and "Send us a message". | `SECTION y5621 h211` | none | Check what it holds; remove if blank | S |
| S-103 | P3 | "How much does it cost?" | 1,291 px tall: tallest cost section across the site. | y1081 h1291 | prices in cards | Use `PricingTiles` | M |

## /services/custom-grillz

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-110 | P2 | Hero | Gold chains and bracelets on a stone block: jewellery. Matches the service name but not clinical. The owner flagged jewellery heroes. | `custom-grillz-hero.jpg` 112 KB | on subject | Picture of a grille on teeth or in a mould tray | needs pictures |
| S-111 | P2 | Four tiles | Gold, silver, diamond, fit are 1024 px pictures at 274x274 (fine), but gold/silver look like the same gold-on-stone still life. | 4 tiles | option tiles | Differentiate | needs pictures |
| S-112 | P2 | "Craft" picture | Dental mirror on a dark table with the top 55% empty brown. Wasted space, reads as moody still life. | `custom-grillz-craft.jpg` 611 KB, rendered 644x483 | crop to subject | Crop to the lower half, recompress | S |
| S-113 | P3 | Weight | 611 KB. | file size | under 160 KB | Recompress | S |

## /services/mobile-dentistry

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-120 | P1 | "Location coverage" picture | Alt says "Pav Dental Mobile outreach vehicle"; the picture is a closed beige capsule on a cream background. Contradicts the caption. | `mobile-dentistry-location.jpg` 385 KB (same bytes as `about-future.jpg`, `blog-video-consultation.jpg`) | caption matches picture | Photo of the van or a coverage map | needs pictures |
| S-121 | P2 | "We Come to You" | Picture is a clinic room with chair, not a mobile setup; same style as root-canal-how. File also 742 KB and reused (`about-legacy.jpg`, `blog-emergency-leeds.jpg`). | `mobile-dentistry-service.jpg` | on subject | Photo of mobile kit | needs pictures |
| S-122 | P2 | Hero | White cases on a tray; not recognisable as dentistry. | `mobile-dentistry-hero.jpg` | on subject | Van picture | needs pictures |
| S-123 | P3 | "Coming soon" | Hub tile marks Mobile and Virtual as "Coming soon" but the pages sell them as live. Check wording. | hub screenshot | consistent | Align | needs owner |

## /services/virtual-dentistry

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-130 | P1 | "How online prescription works" picture | Tube, green pod and folded cloth on stone. Alt "Digital dental e-prescription". Wrong subject, spa. | `virtual-dentistry-benefits.jpg` 736 KB | on subject | Phone video call picture | needs pictures |
| S-131 | P2 | Hero | Tablet on green cloth; on subject for video but reads as home goods. | `virtual-dentistry-hero.jpg` | Hims telehealth shows a person on a phone | Person on a video call | needs pictures |
| S-132 | P2 | Services picture | Mirror and probe on a cream plinth, 420 KB; alt "24/7 emergency and virtual dentistry". Dental but not about video. | `virtual-dentistry-services.jpg` | on subject | Replace | needs pictures |
| S-133 | P3 | Page flow | "Registration Process" and "Choose Type of Services" come after the FAQ. | section order y3587 then y4479, y5133 | FAQ near the end | Move FAQ down | S |

## /services/finance

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-140 | P1 | Hero | Open notebook on a desk; no link to dental or money. | `pricing-hero.jpg` 644x483 | on subject | Pricing/cards picture | needs pictures |
| S-141 | P2 | Content | "Price Match Promise", "Written quotes upfront", "No Online Credit Promotion", insurer chips (AXA, Bupa, Denplan). Needs checking: the memory rule says repo-only claims must go if not on live. | sections "Fair fees, backed by our Price Match Promise" | live is truth | Compare with live `/services/finance` | needs owner |
| S-142 | P2 | Dark band | Brown band with three translucent cards: invented layout. | y2011 h917 | Hims plan cards / numbered steps | Use plan cards | M |
| S-143 | P2 | Layout | Plan cards (pay-as-you-go, membership, plans): the middle one has a mint gradient, the others plain white; unequal look. | screenshot | equal cards, one highlighted | Highlight with border, not gradient | S |
| S-144 | P3 | Tap targets | Hero links under the buttons are small. | screenshot | 44 px | `min-h-11` | S |

## /services/regestration

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-150 | P1 | Hero | Uses `about-hero.jpg` (a treatment room) for a registration page; no relation to joining as a patient. | image list | on subject | Reception or form picture | needs pictures |
| S-151 | P2 | Slug | Route is spelled `regestration` (matches live, so keep), but visible heading is "Register with Pav Dental". Fine, but the hub tile "Registration" says it differs. | hub | n/a | None, note only | n/a |
| S-152 | P2 | Content | "Three simple steps", "More care and clarity from day one" with benefit cards. Benefits (Hims-style) may be invented rather than live. | sections y736, y2252 | live is truth | Check against live | needs owner |
| S-153 | P3 | Page | Sections are 722-917 px each with one picture. | measurement | n/a | n/a | S |

## Cross-page problems

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |
|---|---|---|---|---|---|---|---|
| S-160 | P1 | All service heroes | Every hero was generated as a still life on stone, wood or cream. Hero pictures for 11 pages show props, not treatments or people (see S-010 to S-150). | 16 hero files | Hims uses real product or people photos | One agreed picture brief per page (subject, crop 1344x504) | needs pictures |
| S-161 | P2 | File reuse | Same bytes used on multiple pages: `root-canal-how.jpg` = `whitening-home-in-office.jpg` (697,518); `mobile-dentistry-service.jpg` = `about-legacy.jpg` = `blog-emergency-leeds.jpg` (741,802); `mobile-dentistry-location.jpg` = `about-future.jpg` = `blog-video-consultation.jpg` (385,486). | `ls -la` | unique pictures | Replace one of each pair | needs pictures |
| S-162 | P2 | Hero layouts differ | 1344x504 strip (whitening, root canal, general, oral hygiene, extraction, mouthguards, emergency, grillz, mobile, virtual) vs 668x376 side picture (dentures, aesthetics) vs 443x332 (cosmetic) vs 644x483 (finance, regestration). | image sizes | one hero pattern | Use `TreatmentHero` everywhere | M |
| S-163 | P2 | Two closing blocks | Most pages end with form then a brown "Ready to..." band (500-525 px), or have a booking block before the form. | section lists | one closing band | One `ClosingBand` in the Hims colour | S |
| S-164 | P2 | Image weight | 11 pictures over 160 KB on these pages (517-742 KB) and no `width`/`height` to reserve space is evident (images fill absolutely positioned boxes). | file sizes | under 160 KB | Compress; keep fixed aspect boxes | S |
| S-165 | P3 | Alt text | Alts describe a scene the picture does not show (whitening strips, mobile vehicle, e-prescription, dental examination). | alts vs pictures | alt matches picture | Rewrite after replacing pictures; SEO fingerprint keeps alt strings, so change both together with owner approval | S |
| S-166 | P3 | Headings | Hub and pages carry pill eyebrows ("Designed for comfort, accuracy and full protection"). The recipe says eyebrow pills the live page lacks must be removed. | mouthguards hero | live is truth | Remove | S |

## Summary

Counts by severity: P1 = 21 (S-001, S-002, S-010, S-011, S-020, S-030, S-050, S-060, S-070, S-080, S-090, S-100, S-120, S-130, S-140, S-150, S-160 plus the four hero rows merged into S-160 are counted once each), P2 = 55 (approx), P3 = 24 (approx). Counting rows literally: P1 17, P2 about 50, P3 about 25.

Five worst problems:
1. S-160 / S-001: hero and tile pictures are spa or product still lifes on every service; the hub tiles cannot be told apart.
2. S-011, S-120, S-130: pictures that contradict their alt text or caption (toothbrush as strips, capsule as vehicle, toiletries as e-prescription).
3. S-002: Registration tile on the hub is an empty box.
4. S-031: general-dentistry stacks root canal, extraction and filling price/consent blocks from other pages (11,089 px).
5. S-161 / S-164: same files reused across pages and 500-740 KB pictures.

Fixes that can be done together:
- New picture set (S-001, S-002, S-010 to S-150, S-160, S-161, S-165): one brief, 14 heroes at 1344x504 plus 600 px card crops from the same set, rewrite alts at the same time.
- Compress and resize (S-003, S-013, S-112, S-113, S-164).
- Shared kit swaps: `TreatmentHero` (S-061, S-162), `ClosingBand` (S-006, S-163, S-052, S-083, S-093), `InfoAccordion` (S-042, S-053, S-033).
- 44 px targets (S-008, S-071, S-073, S-144): add `min-h-11` in the shared button and pill classes.
- Live-content check (S-031, S-092, S-123, S-141, S-152, S-166): one owner review pass against www.pavdental.com.
- Hub restructure (S-005, S-006) in `components/content/services-hub.tsx`.
