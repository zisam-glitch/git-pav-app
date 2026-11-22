# Service: Tooth extraction

- Agent group: **S1-B**
- Route(s): `/services/tooth-extraction`
- Route file(s): `website/src/routes/services.tooth-extraction.tsx`
- Live words: `website/seo/live-text/services--tooth-extraction.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | extraction book | `website/src/components/tooth-extraction/extraction-book.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [ok](../shots/tooth-extraction/01-book-1440.png) | ok | same | Verbatim `Book Your Appointment Today`, paragraph, and all 4 `Why Choose PavDental?` bullets; uses `PRACTICE_PHONE` and `PRACTICE_HOURS` |
| 2 | extraction faq | `website/src/components/tooth-extraction/extraction-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | [ok](../shots/tooth-extraction/02-faq-1440.png) | ok | same | Replaced 8 rewritten FAQs with all 10 verbatim Q&As from `services--tooth-extraction.txt` using `FaqList` |
| 3 | extraction guarantee | `website/src/components/tooth-extraction/extraction-guarantee.tsx` | Hims dark brown bento (`Section theme="brown" width="bento"`) | verified | ok | ok | same | Verbatim `Guaranteed Tooth Extraction Same Day Treatment` heading and both live paragraphs |
| 4 | extraction hero | `website/src/components/tooth-extraction/extraction-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) & [treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [ok](../shots/tooth-extraction/04-hero-1440.png) | [ok](../shots/tooth-extraction/04-hero-390.png) | same | Verbatim H1 `Pav Dental: Same day Tooth Extraction` and live lead; wired `/images/generated/tooth-extraction-hero.jpg` (`priority`) |
| 5 | extraction page (page composition) | `website/src/components/tooth-extraction/extraction-page.tsx` | Hims alternating page rhythm + `ContactForm` + `CtaBand` | verified | ok | ok | same | Alternates white/brown/white/cream/white/cream/brown bands; added shared `ContactForm` and closing `CtaBand` |
| 6 | extraction postop | `website/src/components/tooth-extraction/extraction-postop.tsx` | Hims cream checklist tiles + navy complication alert (`Tile tone="navy"`) | verified | [ok](../shots/tooth-extraction/06-postop-1440.png) | ok | same | Verbatim `Post Operative Instructions`, `Reminder:`, all 10 care sections, and `Watch for Complications:` alert with interactive filter tabs |
| 7 | extraction pricing | `website/src/components/tooth-extraction/extraction-pricing.tsx` | [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [ok](../shots/tooth-extraction/07-pricing-1440.png) | ok | same | Uses promoted `PricingTiles` (`@/components/hims`) with all 4 live tiers (£95–£295) + `Informed Consent for Tooth Extraction` callout |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `extraction-guarantee.tsx` | Two paragraphs under `Guaranteed Tooth Extraction Same Day Treatment` | Added short card eyebrow/subheadings `Immediate Relief`, `SAME-DAY CARE` / `Alleviating your pain promptly`, `ONGOING GUIDANCE` / `Post-extraction support` above verbatim paragraphs | Structure the two live paragraphs cleanly into Hims dark-brown glass tiles |
| `extraction-pricing.tsx` | Standalone heading `Informed Consent for Tooth Extraction` | Kept exact heading with concise one-line explanation: `Your clinician will talk through your procedure, alternatives, and aftercare before any treatment begins.` | Explain the live consent heading without inventing regulatory text |
| `extraction-faq.tsx` | `Frequently Asked Question` | `Frequently Asked` + accent `Question`, plus lead `Common questions about preparation, local anaesthetic, recovery, and tooth replacement options.` | Matches Hims two-tone heading and sticky FAQ intro layout |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `tooth-extraction-hero` | `extraction-hero.tsx` | `4 / 3` | Minimalist studio render on warm sand: precision brushed-titanium oral surgery mirror and care instruments on matte cream mat | `website/public/images/generated/tooth-extraction-hero.jpg` | done |

## Verification log

- 2026-11-19 (browser + promotion): Verified `/services/tooth-extraction` at `1440x900` and `390x844` (0 horizontal overflow; post-op tabs and FAQ verified; promoted `PricingTiles` to `components/hims/`). SEO parity **100%** (up from 3%, 0 failures). All 7 sections `verified`.
- 2026-11-19: Rebuilt all 7 tooth extraction sections and `services.tooth-extraction.tsx` with the Hims kit (`Section`, `Heading`, `BookButton`, `CallButton`, `ButtonLink`, `Tile`, `FaqList`, `CtaBand`, `Media`). Live-text coverage measured against `http://localhost:8180/services/tooth-extraction`: 76/77 units (99%, only missing footer `copyright 2026. design by`). Remaining `status` is `built` pending browser screenshot pass at 1440 and 390 and completion of generated hero image.

## Open questions for the lead

1. **Removed repo-only stats, prices, and claims (`extraction-hero.tsx`, `extraction-pricing.tsx`, `extraction-guarantee.tsx`, `extraction-book.tsx`)**:
   - `extraction-hero.tsx`: removed `£75` starting price and `12,000+ extractions`.
   - `extraction-pricing.tsx`: removed mismatched prices `Simple £75` / `Surgical £195` (`Most Popular`), `NHS Band 2: £23.80` / `NHS Band 2: £73.50`, `Panoramic X-ray (OPG)`, `IV sedation available`, and `0% APR finance on treatments over £250`. Replaced with the 4 live tiers (`Simple £95`, `Intermediate £145`, `Advanced £195`, `Surgical £295`).
   - `extraction-guarantee.tsx`: removed `Pain-Free Promise`, `call in the morning and be seen the same afternoon`, `24-hour direct line to our clinical team`, `No waiting lists`, `Local anaesthetic or sedation for anxious patients`, `Digital X-ray assessment before every extraction`, and `Antibiotic and pain relief prescription included`.
   - `extraction-book.tsx`: removed `15+ years experience`, `30-day follow-up included`, `0% finance on treatments over £250`, and wrong opening hours (`Mon–Sat 8:00am – 7:00pm · Sun 10:00am – 4:00pm` replaced with `PRACTICE_HOURS`).
2. **Removed repo-only post-op timing & red-flag variations (`extraction-postop.tsx`)**: Old component stated `20 mins on / 20 mins off` ice pack, `Wait at least 2 hours before eating`, `30–45 minutes` gauze, `after 72 hours`, `Numbness or tingling`, and `visit A&E`. Replaced with verbatim live instructions (`10 minutes on, then 10 minutes off`, `30-60 minutes`, `48 hours` smoking, `24 hours` rest/no rinsing, `Watch for Complications:`).
3. **Removed repo-only FAQs (`extraction-faq.tsx`)**: Replaced rewritten FAQs (including `6 hours` IV sedation fast, `3 months` implant wait, `NHS Band 2 £73.50`) with the 10 verbatim FAQs from `services--tooth-extraction.txt`.
4. **Stopped importing `spotlight.tsx`**: `extraction-hero.tsx` no longer imports `home/spotlight.tsx`.
5. **Reusable patterns built locally**: `extraction-postop.tsx` uses a filterable instruction-card grid + dark navy alert tile (`PostOpChecklist` pattern), and `oral-hygiene-pricing.tsx` / `extraction-pricing.tsx` use a multi-column `Tile` pricing grid (`PricingTiles` pattern) that could be promoted to `components/hims/` after S1.

## Pass 2

- **Capture used:** `/testosterone.html` and the PDP bands, per [treatment-page-recipe](../hims-patterns/treatment-page-recipe.md).
- **Differences found:** split hero with two repo-only fact tiles and three buttons; brown guarantee band with eyebrows and counters; pricing footer with invented consent paraphrase; post-op cards with counters and category badges; `FaqList`.
- **Rebuilt:** hero (`TreatmentHero`, fact rows are fragments of live sentences); guarantee (eyebrows and counters out); pricing (`PricingTiles` and a separate `ConsentPanel`); post-op (Hims card, filter tabs kept); book block (counters out); FAQ (`FaqSection`); closing (`ClosingBand`, same H2 words). Contact form left alone.
- **Wording changes:** none. Consent items now use the practice's own extraction consent words from `general-dentistry-extraction-consent.tsx` (verbatim); the old page had a paraphrase ("Your clinician explains ...") that is gone. "Informed Consent for Tooth Extraction" is now an H2 (live has it as H2; before it was an H3, so the fingerprint WARNs).
- **Removed (repo-only):** pills "Urgent & Surgical Care", "Immediate Relief", "SAME-DAY CARE", "ONGOING GUIDANCE", "Clinical Transparency", "Aftercare & Healing Guide", "Same-Day Appointments", "Patient Guidance"; fact tiles "Same-Day Relief" and "Local anaesthetic comfort & comprehensive aftercare"; FAQ lead; "Book Consultation" button.
- **Images needed:** none new.
