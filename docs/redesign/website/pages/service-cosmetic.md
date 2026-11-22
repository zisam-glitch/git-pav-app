# Service: Cosmetic

- Agent group: **S3**
- Route(s): `/services/cosmetic`
- Route file(s): `website/src/routes/services.cosmetic.tsx`
- Live words: `website/seo/live-text/services--cosmetic.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | cosmetic about | `website/src/components/cosmetic/cosmetic-about.tsx` | Hims SplitFeature on cream; https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90 | verified | ok | ok | same | Replaced Unsplash/video and invented 3-step copy with live "What is Cosmetic Dentistry?" copy + Media slot |
| 2 | cosmetic benefits | `website/src/components/cosmetic/cosmetic-benefits.tsx` | Hims cream tile grid | verified | ok | ok | same | Restored all 5 verbatim live benefits in numbered white tiles |
| 3 | cosmetic contact | `website/src/components/cosmetic/cosmetic-contact.tsx` | Hims lead-capture card | verified | [shot](../shots/cosmetic/1440-contact.png) | ok | same | Uses `@/components/ui/select`, `useEnquiry`, `BOOKING_URL`, `PRACTICE_PHONE`; wired into `cosmetic-page.tsx` |
| 4 | cosmetic faq | `website/src/components/cosmetic/cosmetic-faq.tsx` | Hims FaqList; https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb | verified | [shot](../shots/cosmetic/1440-faq.png) | ok | reworded | Restored all 12 live Q&As verbatim inside `FaqList` |
| 5 | cosmetic financing | `website/src/components/cosmetic/cosmetic-financing.tsx` | Hims cream panel + numbered tiles | verified | [shot](../shots/cosmetic/1440-financing.png) | ok | same | Replaced invented price/APR table with live "Costs and Financing" + "How to Choose a General Dentist" |
| 6 | cosmetic hero | `website/src/components/cosmetic/cosmetic-hero.tsx` | Hims treatment split hero; https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97 | verified | [shot](../shots/cosmetic/1440-hero.png) | [shot](../shots/cosmetic/390-hero.png) | reworded | Preserved live H1 + lead verbatim; `BookButton` + `CallButton` + Media placeholder |
| 7 | cosmetic page (page composition) | `website/src/components/cosmetic/cosmetic-page.tsx` | Hims service page rhythm + `CtaBand` | verified | ok | ok | same | Alternates `white` / `cream` / `brown`; includes `CosmeticContact` and closing `CtaBand` |
| 8 | cosmetic procedures | `website/src/components/cosmetic/cosmetic-procedures.tsx` | Hims `Carousel` of `Tile` cards; https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb | verified | [shot](../shots/cosmetic/1440-procedures.png) | ok | same | All 5 live procedures (Tooth Contouring, Teeth Whitening, Porcelain Veneers, Dental Implants, Dental Bonding) |
| 9 | cosmetic showcase | `website/src/components/cosmetic/cosmetic-showcase.tsx` | Hims dark `brown` `SplitFeature` + glass list | verified | ok | ok | same | Uses `tone="brown" className="bg-white/10"` placeholder + live Procedures links |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `cosmetic-hero.tsx` | `Appointment` button alongside `Book Now` | `Popular Procedures` (anchor `#procedures`) + `Call 0800 1938 786` alongside `Book Now` | Avoids duplicate Setmore CTAs side by side while keeping `BookButton` and `CallButton` reachable |
| `cosmetic-faq.tsx` | `Frequently Asked Question` | `Frequently Asked Questions` | Matches plural grammar and `GeneralDentistryFaq` heading style |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `cosmetic-hero` | `website/src/components/cosmetic/cosmetic-hero.tsx` | `4 / 3` | Editorial studio photograph of a porcelain tooth shade guide, stainless dental mirror, and warm ceramic tray on a soft cream stone surface in warm natural morning light with gentle shadows, Hims-style clinical calm, no text, no logos, no people | `website/public/images/generated/cosmetic-hero.jpg` | done |
| `cosmetic-about` | `website/src/components/cosmetic/cosmetic-about.tsx` | `4 / 3` | Minimalist sunlit private cosmetic dental consultation room with warm oak cabinetry, linen upholstery, and soft natural daylight, calm editorial photography, no text, no logos, no people | `website/public/images/generated/cosmetic-about.jpg` | done |
| `cosmetic-showcase` | `website/src/components/cosmetic/cosmetic-showcase.tsx` | `4 / 3` | Close-up studio 3D-style product composition of translucent porcelain dental models and precision instruments on a deep espresso-brown surface with warm golden rim light, no text, no logos, no people | `website/public/images/generated/cosmetic-showcase.jpg` | done |

## Verification log

- 2026-11-19: Verified all 9 sections in Chromium at `1440x900` and `390x844` (0 console errors, 0 broken images, 0 horizontal overflow, single H1, FAQ accordion and `<Select>` verified), confirmed `/services/cosmetic` SEO parity 100% (0 failures), and saved shots in `docs/redesign/website/shots/cosmetic/`. Marked all sections `verified`.

## Open questions for the lead

1. **Repo-only unverified claims removed from `cosmetic-hero.tsx`**: "GDC registered specialists" (regulated GDC title not on live page), "0% APR finance available", "Digital 3D smile preview", "Bespoke porcelain & composite makeovers", Unsplash URL (`photo-1629909615184-74f495363b67`), and `/media/hero-smile.jpg`.
2. **Repo-only unverified claims removed from `cosmetic-about.tsx`**: "Digital 3D Smile Scan", "Trial Smile Simulation", "Precision Ceramic Bonding" step descriptions, Unsplash URL (`photo-1606811841689-23dfddce3e95`), and `/media/clinic-reel.mp4` video player.
3. **Repo-only unverified claims removed from `cosmetic-procedures.tsx`**: Procedure tags ("Most Requested", "Permanent Solution", "Same Day Result"), treatment durations ("2 Visits", "3–6 Months", "1 Single Visit"), lifespan claims ("15–20+ Years", "Lifetime Durability", "5–8 Years"), and bullet claims ("Zero enamel removal required", "Restores 100% bite function", "Stain-resistant porcelain", etc.).
4. **Repo-only unverified claims removed from `cosmetic-benefits.tsx`**: "multi-layer feldspathic and E.max ceramics", "15+ years" durability claim.
5. **Repo-only unverified claims removed from `cosmetic-financing.tsx`**: All fabricated pricing and monthly APR figures (`Composite Bonding From £150 / From £35/mo (0% APR)`, `Porcelain Veneers From £595 / From £59/mo (0% APR)`, `Dental Implants From £1,850 / From £115/mo (0% APR)`), `"Most Popular"` badge, `"12 to 24 months"`, `"No deposit required on qualifying plans"`, `"15–20+ year expected lifespan"`, `"Lifetime implant guarantee"`, `"3D CBCT radiological scan"`, `"Master ceramist layering"`, `"FCA regulation"`. Confirm with owner if any verified cosmetic prices should be added later.
6. **Repo-only unverified claims removed from `cosmetic-showcase.tsx`**: "Precision Ceramic Layering & Micro-Prep (0.3mm enamel beveling)", "3D Digital Smile Simulation & Trial", Unsplash thumbnails, and `/media/clinic-reel.mp4`.
7. **Repo-only unverified claims removed from `cosmetic-faq.tsx`**: Replaced 10 repo-invented FAQs (citing £150, £595, £35/mo, 15–20+ years, NHS Band 3, 12–24 months) with the 12 verbatim live FAQs from `services--cosmetic.txt`.
8. **Repo-only unverified claim removed from `cosmetic-contact.tsx`**: "receive a tailored consultation plan within 24 hours".

## Pass 2

- Capture used: `/testosterone.html` plus `treatment-page-recipe.md`.
- Differences found: split hero with eyebrow, carousel cards with per-card book buttons, white tile grids, a two-panel finance block, pass 1 FAQ list.
- Rebuilt: hero (`TreatmentHero`, three wired pictures as a strip), about (`StackedFlow`), procedures (`BenefitCards`, five H3s, whitening link kept), benefits (`TitleCards`, titles keep their "1." numbers), costs and financing (`StackedFlow`, `NumberedList` for the four checklist points under the H3), procedures links (brown band rows), FAQ (`FaqSection`, 12 questions), contact wrapper, closing (`ClosingBand`).
- Wording changes (1): hero fact rows are live procedure names ("Teeth Whitening", "Porcelain Veneers", "Dental Implants"). Finance wording left exactly as live.
- Removed (repo-only): eyebrows "Cosmetic Dentistry", "Smile Aesthetics", "Treatment Options", "Fees & Flexible Plans", "Patient Checklist", "Treatment Guides", "Enquire", "FAQs".
- Images needed: none new.
- Open questions: none.
