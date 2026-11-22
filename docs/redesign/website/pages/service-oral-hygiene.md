# Service: Oral hygiene

- Agent group: **S1-B**
- Route(s): `/services/oral-hygiene`
- Route file(s): `website/src/routes/services.oral-hygiene.tsx`
- Live words: `website/seo/live-text/services--oral-hygiene.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | oral hygiene consent | `website/src/components/oral-hygiene/oral-hygiene-consent.tsx` | Hims dark brown bento (`Section theme="brown" width="bento"`) | verified | [ok](../shots/oral-hygiene/01-consent-1440.png) | ok | same | Preserved `CONSENT_ITEMS` and intro word-for-word, added live `Oral Hygiene and Gum Care Advice` + Part 1–3 interactive tabs + `oral-hygiene-showcase.jpg` poster |
| 2 | oral hygiene faq | `website/src/components/oral-hygiene/oral-hygiene-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | ok | ok | same | Replaced 8 repo-only FAQs with all 6 verbatim Q&As from `services--oral-hygiene.txt` using `FaqList` |
| 3 | oral hygiene hero | `website/src/components/oral-hygiene/oral-hygiene-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) & [treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [ok](../shots/oral-hygiene/03-hero-1440.png) | [ok](../shots/oral-hygiene/03-hero-390.png) | same | Verbatim H1 `Pav Dental Oral Hygiene Care` and both live paragraphs; `BookButton`, `ButtonLink`, `CallButton`; wired `/images/generated/oral-hygiene-hero.jpg` (`priority`) |
| 4 | oral hygiene importance | `website/src/components/oral-hygiene/oral-hygiene-importance.tsx` | Hims cream numbered tiles (`Section theme="cream"`) | verified | ok | ok | same | Verbatim heading, `Good hygiene care helps to:` + 6 items + closing heart/diabetes/pregnancy risk paragraph |
| 5 | oral hygiene page (page composition) | `website/src/components/oral-hygiene/oral-hygiene-page.tsx` | Hims alternating page rhythm + `ContactForm` + `CtaBand` | verified | ok | ok | same | Alternates white/cream/brown bands; added shared `ContactForm` and closing `CtaBand` |
| 6 | oral hygiene pricing | `website/src/components/oral-hygiene/oral-hygiene-pricing.tsx` | [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [ok](../shots/oral-hygiene/06-pricing-1440.png) | ok | same | Uses promoted `PricingTiles` (`@/components/hims`) with exact live tiers (£45, £65, £75) |
| 7 | oral hygiene showcase | `website/src/components/oral-hygiene/oral-hygiene-showcase.tsx` | [Mobbin split treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [ok](../shots/oral-hygiene/07-showcase-1440.png) | ok | reworded | Restyled with `SplitFeature` + `<Media src="/images/generated/oral-hygiene-showcase.jpg" />` + interactive `/media/clinic-reel.mp4` player |
| 8 | oral hygiene who needs | `website/src/components/oral-hygiene/oral-hygiene-who-needs.tsx` | Hims symptom grid (`Tile tone="cream"`) + `sage` note | verified | ok | ok | same | Verbatim heading, intro, 7 live symptom items, and dental-work closing line |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `oral-hygiene-showcase.tsx` | No dedicated showcase copy in `live-text` | `Hygiene Treatment in Action` with short descriptions aligned to live Scale & Polish and Gum Care wording | Restyled interactive `/media/clinic-reel.mp4` showcase without unverified repo claims |
| `oral-hygiene-faq.tsx` | `Frequently Asked Question` | `Frequently Asked` + accent `Question`, plus lead `Common questions about hygiene visits, comfort, pregnancy care, and keeping your mouth fresh.` | Matches Hims two-tone heading and sticky FAQ intro layout |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `oral-hygiene-hero` | `oral-hygiene-hero.tsx` | `4 / 3` | 3D studio render on sage-cream: matte-white ultrasonic hygiene wand beside smooth cream ceramic rinse cup and eucalyptus sprig | `website/public/images/generated/oral-hygiene-hero.jpg` | done |
| `oral-hygiene-showcase` | `oral-hygiene-showcase.tsx` & `oral-hygiene-consent.tsx` | `4 / 3` | Studio still life on travertine stone slab: unbranded matte-cream tube, pastel-sage interdental brush case, and linen cloth | `website/public/images/generated/oral-hygiene-showcase.jpg` | done |

## Verification log

- 2026-11-19 (browser + promotion): Verified `/services/oral-hygiene` at `1440x900` and `390x844` (0 horizontal overflow; consent Part 2 tab verified; `oral-hygiene-showcase.jpg` wired to consent video poster; promoted `PricingTiles` to `components/hims/`). SEO parity **100%** (up from 16%, 0 failures). All 8 sections `verified`.
- 2026-11-19: Rebuilt all 8 oral hygiene sections and `services.oral-hygiene.tsx` with the Hims kit (`Section`, `Heading`, `BookButton`, `CallButton`, `ButtonLink`, `Tile`, `FaqList`, `SplitFeature`, `CtaBand`, `Media`). Live-text coverage measured against `http://localhost:8180/services/oral-hygiene`: 62/63 units (98%, only missing footer `copyright 2026. design by`). Remaining `status` is `built` pending browser screenshot pass at 1440 and 390 and completion of generated images.

## Open questions for the lead

1. **Removed repo-only pricing tiers & claims (`oral-hygiene-pricing.tsx`)**: Old component listed `Scale & Polish From £45` (`Most Popular`, `NHS Available`), `Routine Hygiene From £55` (`NHS Available`), `Gum Treatment From £75` (`Specialist Care`), and footer note `NHS Band 1 prices apply for eligible patients. Private options available for enhanced treatments and specialist care. Written quotes provided at clinical assessment.` Live `services--oral-hygiene.txt` instead lists `Basic – Polish Only (£45)`, `Intermediate – Scale Only (£65)`, and `Advanced – Scale & Polish (£75)` with no `Most Popular` or NHS Band 1 claim. Replaced with live tiers; confirm if NHS Band 1 note is clinically accurate and wanted back.
2. **Removed repo-only clinical descriptions & FAQs**: Removed invented per-item descriptions in `oral-hygiene-importance.tsx` and `oral-hygiene-who-needs.tsx`, and replaced 8 repo-only FAQs in `oral-hygiene-faq.tsx` (e.g. fissure sealants for adults, `30-45 minutes`, `45-60 minutes`, `60-90 minutes`, oral cancer screening) with the 6 verbatim FAQs from `services--oral-hygiene.txt`.
3. **Consent video poster image (`oral-hygiene-consent.tsx`)**: Added `oral-hygiene-consent` slot (`16 / 9`) as `<Media tone="brown" />` placeholder after removing Unsplash URL.
4. **Stopped importing `spotlight.tsx`**: `oral-hygiene-hero.tsx` no longer imports `home/spotlight.tsx`.

## Pass 2

- **Capture used:** `/testosterone.html` and the PDP bands, per [treatment-page-recipe](../hims-patterns/treatment-page-recipe.md).
- **Differences found:** split hero with an eyebrow pill and three buttons; tile grids with counters and pills; a brown consent band; a showcase with per-demo tiles; `FaqList` with a repo-only lead.
- **Rebuilt:** hero (`TreatmentHero`, facts are the three live tier names with prices); importance and who-needs (`oral-hygiene-point-list.tsx`, the Hims `IncludedList` look with each row as H3 so the point headings stay); showcase (`Steps` with the picture and video toggle); consent (`ConsentPanel` words verbatim, plus a separate video section titled with the live "Oral Hygiene and Gum Care Advice", tabs and player kept); FAQ (`FaqSection`); closing (`ClosingBand`, same H2 words). Pricing (`PricingTiles`) and the contact form left alone.
- **Wording changes:** none.
- **Removed (repo-only):** eyebrow pills "Preventative Hygiene Care", "Clinical Prevention", "Whole-Body Health", "When to Visit", "Restorative Care", "Gentle Clinical Care", "Patient Guidance"; FAQ lead "Common questions about hygiene visits, comfort, pregnancy care, and keeping your mouth fresh." The "Hygiene Treatment in Action" section (two demo descriptions) is not on the live page; kept as harmless wording, flag for the owner.
- **Images needed:** none new.
