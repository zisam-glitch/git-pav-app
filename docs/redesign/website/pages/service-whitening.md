# Service: Whitening

- Agent group: **S3**
- Route(s): `/services/whitening`
- Route file(s): `website/src/routes/services.whitening.tsx`
- Live words: `website/seo/live-text/services--whitening.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | whitening comparison | `website/src/components/whitening/whitening-comparison.tsx` | `/testosterone.html` comparison table ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `ComparisonTable` (tinted rows, table from `md` up, cards with H3 names on a phone); same 3 live ranges (£65, £295, £495); `Transparent Pricing (£65 – £495)` pill removed (repo-only); Book buttons are 48px |
| 2 | whitening faq | `website/src/components/whitening/whitening-faq.tsx` | `/testosterone.html` FAQ block ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `FaqSection` + `InfoAccordion` (native `<details>`, H3 questions); same 10 Q&As; `FAQs` pill removed (repo-only) |
| 3 | whitening page (page composition) | `website/src/components/whitening/whitening-page.tsx` | `/testosterone.html` page flow ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: composition only (hero, products, visualizer, comparison, consent, FAQ, contact). The pass 1 `CtaBand` (words only) is replaced by the live Get In Touch form |
| 4 | whitening products | `website/src/components/whitening/whitening-products.tsx` | `/testosterone.html` product bento ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `OptionTiles` (dark tiles: live tags as badges, name, live price, picture) + text rows with the live paragraph and the `Appointment` button; `Dentist-Formulated Ranges` pill removed (repo-only) |
| 5 | whitening visualizer | `website/src/components/whitening/whitening-visualizer.tsx` | Hims cream tile & pill controls (feature, no Hims equivalent) | verified | ok | ok | reworded | Unchanged in pass 2 (feature kept as it was; prettier reformatted the file) |
| 6 | whitening hero | `website/src/components/whitening/whitening-hero.tsx` | `/testosterone.html` hero ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | New in pass 2: `TreatmentHero` with the live lead, three fact rows (live range names and prices) and one wide picture band; the old eyebrow pill, `Home Kits` and `Home & In-Office` short labels and the ghost Call button are gone |
| 7 | whitening contact | `website/src/components/whitening/whitening-contact.tsx` | Hims lead-capture card (copy of `root-canal-contact.tsx`) | verified | ok | ok | same | New in pass 2: restores the live Get In Touch form (`useEnquiry("Whitening")`); pass 1 had replaced it with a button panel |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `whitening-visualizer.tsx` / `whitening-data.ts` | (Interactive shade-guide feature without direct live-text copy) | Short neutral shade descriptions mapping starting tones to the 3 live whitening ranges (£65, £295, £495) | Preserves the interactive shade visualizer while removing unverified day timelines and shade-lift promises |
| `whitening-page.tsx` (`ConsentPanel`) | `Informed Consent for Tooth Whitening` (heading only in live-text) | Summarizes the live-page suitability, sensitivity, gum-contact, and temporary white-spot guidance verbatim from `services--whitening.txt` | Fills the informed-consent callout strictly from published live copy |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `whitening-hero` | `whitening-page.tsx` (Hero) | `4 / 3` | Editorial studio shot of minimalist ceramic dental whitening care vessels, sleek white tray case, and warm morning sunlight casting soft shadows across a cream stone surface, calm Hims aesthetic, no text, no logos, no people | `website/public/images/generated/whitening-hero.jpg` | done |
| `whitening-strips` | `whitening-products.tsx` (Whitening Strips - £65) | `4 / 3` | Minimalist studio product photography of matte cream whitening strip sachets and fresh mint leaf detail on warm alabaster stone with soft natural light and gentle shadows, Hims aesthetic, no text, no logos | `website/public/images/generated/whitening-strips.jpg` | done |
| `whitening-home-kit` | `whitening-products.tsx` (Home Teeth Whitening - £295) | `4 / 3` | Dedicated studio render of sleek clinical whitening syringes, custom clear tray case, and pre-polishing paste bottle arranged neatly on warm cream travertine in soft directional sunlight, Hims aesthetic, no text, no logos | `website/public/images/generated/whitening-home-kit.jpg` | done |
| `whitening-home-in-office` | `whitening-products.tsx` (Home & In Office Whitening - £495) | `4 / 3` | Clean architectural dental treatment room still life with brushed metal instruments, frosted glass whitening care bottle, and warm linen accents in soft diffused daylight, Hims aesthetic, no text, no logos, no people | `website/public/images/generated/whitening-home-in-office.jpg` | done |

## Verification log

- 2026-11-19: Verified all 5 sections in Chromium at `1440x900` and `390x844` (interactive VITA shade selector, FAQ accordion, and responsive comparison cards tested; 0 broken images, 0 horizontal overflow), confirmed `/services/whitening` SEO parity 100% (0 failures), and saved shots in `docs/redesign/website/shots/whitening/`. Marked all sections `verified`.

## Open questions for the lead

- Removed repo-only invented whitening prices and products from `whitening-data.ts`, `whitening-comparison.tsx`, `whitening-visualizer.tsx`, and `whitening-faq.tsx`: `"Whitening Strips £25"`, `"Home UV LED Accelerator System £99"`, `"Custom Home Whitening Suite £295"`, `"Dentist Choice"` badge, and `"Daily Essential" / "Dentist Gold Standard" / "Fastest Results"` tags. Live text (`services--whitening.txt`) publishes `"Whitening Strips - £65"`, `"Home Teeth Whitening - £295"`, and `"Home & In Office Whitening - £495"`.
- Removed repo-only unverified clinical/lab claims not present in `services--whitening.txt`: `"Up to 5/7/8-10 Shades"`, `"expected lift of N shades"`, `"6–10 shades whiter on the standard clinical VITA shade guide"`, `"12–24 months"`, `"non-peroxide enamel-safe buffers and organic coconut oil"`, `"465nm wavelength"`, `"32-LED medical-grade mouth tray"`, `"16-minute auto-timer"`, `"USB-C wireless case"`, `"3x PAP+ active gel pens"`, `"3D intraoral impressions"`, `"16% carbamide peroxide gel"`, `"ACP hydroxyapatite serum"`, `"14 days (30 mins daily)"`, `"2–3 weeks (1 hr daily or overnight)"`, `"7 days (16 mins daily)"`, and Day 3 / Day 7 shade timelines in `VITA_SHADES`.
- Removed 3 external Cloudinary image URLs (`res.cloudinary.com/db1i46uiv/...`) from `whitening-data.ts`.
- Note on live copy: `services--whitening.txt` contains the heading `"Award Winning Whitening"` and paragraph `"Experience our award-winning whitening treatments for a brilliantly radiant smile. Discover the difference of our acclaimed whitening services today."` (kept verbatim for SEO parity; owner may confirm whether an award citation is needed) and under `"Why can't I buy teeth whitening gel online?"` the live text repeats the strip-positioning paragraph (preserved verbatim).

## Pass 2

- **Captures used:** `/testosterone.html` (hero, product bento, comparison table, FAQ), `/weight-loss/wegovy-pill.html` (comparison cards, benefit cards), `/hair-loss/minoxidil.html` (information accordions). Sheets: [testosterone](../hims-patterns/testosterone.md), [minoxidil-pdp](../hims-patterns/minoxidil-pdp.md), [wegovy-pill-pdp](../hims-patterns/wegovy-pill-pdp.md). Recipe: [treatment-page-recipe](../hims-patterns/treatment-page-recipe.md).
- **Differences found:** split hero with eyebrow pill and price tiles (Hims: H1 left, fact rows and pills right, picture band); product rows with a picture each, big tag pills and a price chip (Hims: dark option tiles with badges, name, price, picture); table with a plain header (Hims: tinted rows, pill and price in the header); FAQ rows at 28px with circle toggles (Hims: 15.67px/500 rows, chevron); **the live Get In Touch form was missing** (replaced by a button panel in pass 1).
- **Rebuilt:** hero (`whitening-hero.tsx`), products (`OptionTiles` + text rows), comparison (`ComparisonTable`), FAQ (`FaqSection`), contact form (`whitening-contact.tsx`, restored). **Left alone:** shade visualizer (feature), consent (`ConsentPanel`).
- **Wording changes (live wording, new wording, why):**

| Where | Live wording | New wording | Why |
|---|---|---|---|
| hero fact rows | `Whitening Strips - £65`, `Home Teeth Whitening - £295`, `Home & In Office Whitening - £495` | same | none: live headings shown as the three key facts |
| hero links | (in-page links, no live words) | `Compare treatments`, `Informed Consent for Tooth Whitening` | dropped the repo-added `(£65 – £495)` |
| product tiles | tags `Professional Whitening Strips`, `Dissolving Whitening Strips`, `Day Whitening Kits`, `Night Whitening Kits`, `BEAM In-Office Whitening Gel` | same words as badges | Hims badge row |

- **Removed as repo-only:** pills `Professional Teeth Whitening`, `Dentist-Formulated Ranges`, `Transparent Pricing (£65 – £495)`, `FAQs`; hero labels `Home Kits` and `Home & In-Office`.
- **Images needed (optional):** the hero is one wide band (`whitening-hero.jpg`); Hims shows 3 to 4 tiles. Add `whitening-strip-2` (4 / 3: two ceramic trays and a sealed sachet on warm cream stone, soft side light, no text, no people) and `whitening-strip-3` (4 / 3: glass bottle and a folded linen towel on a pale shelf, warm morning light, no text, no people) and pass three `tiles`. Files: `website/public/images/generated/whitening-strip-2.jpg`, `whitening-strip-3.jpg`.
- **Open questions for the owner:** (1) `Award Winning Whitening` and the live line about `acclaimed whitening services` are live words; confirm an award can be cited. (2) The shade visualizer names, descriptions and `Interactive VITA 8-Shade Guide` label are repo-only feature copy (pass 1 list). (3) The comparison rows are derived from the live paragraphs; the column labels `On-the-Go Maintenance`, `Dentist-Crafted Trays`, `Dual-Action Hybrid` are repo wording. (4) The FAQ repeats some live questions (the live page repeats them too).
- **Not done:** H1 uses `text-hero` (token request `text-display-s`); visualizer not restyled.
- **Checks (browser, localhost:8180):** fingerprint compare 0 FAIL 0 WARN (words 1561 to 1586); parity run 100% (was 100%), 0 failures. No horizontal scroll at 390px.
