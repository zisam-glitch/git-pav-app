# Service: General dentistry

- Agent group: **S1**
- Route(s): `/services/general-dentistry`
- Route file(s): `website/src/routes/services.general-dentistry.tsx`
- Live words: `website/seo/live-text/services--general-dentistry.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | general dentistry cavities | `website/src/components/general-dentistry/general-dentistry-cavities.tsx` | Hims capture (`Section`, `Media`, `Heading`) | verified | [ok](../shots/general-dentistry/01-cavities-1440.png) | ok | same | Wired `/media/thumbnails/1.jpg` poster + `/media/clinic-reel.mp4` toggle; dropped repo-only subtitle |
| 2 | general dentistry choosing | `website/src/components/general-dentistry/general-dentistry-choosing.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | same | 4-col `Tile` grid on `cream`; inline verbatim live sentences for Qualifications, Location, Services Offered, Insurance |
| 3 | general dentistry extraction consent | `website/src/components/general-dentistry/general-dentistry-extraction-consent.tsx` | Hims capture (`wrap-prose`, `bg-white` / `bg-cream` panel) | verified | ok | ok | same | Uses promoted `ConsentPanel` (`@/components/hims`); renders consent heading, intro, and all 3 `CONSENT_ITEMS` verbatim |
| 4 | general dentistry extraction pricing table | `website/src/components/general-dentistry/general-dentistry-extraction-pricing-table.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Uses promoted `FeeTable` (`@/components/hims`); restored live heading `Our Tooth Extraction Prices` |
| 5 | general dentistry extraction pricing | `website/src/components/general-dentistry/general-dentistry-extraction-pricing.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Restyled compact card in Hims tokens (`border-border`, `tabular-nums`); unused by `GeneralDentistryPage` |
| 6 | general dentistry faq | `website/src/components/general-dentistry/general-dentistry-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | ok | ok | same | Uses `FaqList` with sticky `Heading` + `BookButton`; restored all 12 live FAQ answers verbatim |
| 7 | general dentistry filling pricing table | `website/src/components/general-dentistry/general-dentistry-filling-pricing-table.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Uses promoted `FeeTable` (`@/components/hims`); restored live heading `Our White Filling Prices` |
| 8 | general dentistry filling pricing | `website/src/components/general-dentistry/general-dentistry-filling-pricing.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Restyled compact card in Hims tokens; unused by `GeneralDentistryPage` |
| 9 | general dentistry hero | `website/src/components/general-dentistry/general-dentistry-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · [Mobbin details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [ok](../shots/general-dentistry/09-hero-1440.png) | [ok](../shots/general-dentistry/09-hero-390.png) | reworded | `SplitFeature` with `text-hero` `<h1>` + terracotta accent, live lead, `BookButton` + `CallButton`, and `4 / 3` `<Media src="/images/generated/general-dentistry-hero.jpg" priority />` |
| 10 | general dentistry importance | `website/src/components/general-dentistry/general-dentistry-importance.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | same | 4-col `Tile` grid + verbatim `Cost and Insurance` callout block |
| 11 | general dentistry page (page composition) | `website/src/components/general-dentistry/general-dentistry-page.tsx` | Hims capture (`CtaBand`, alternating `white`/`cream`/`brown` bands) | verified | ok | ok | same | Alternates `white`/`cream`/`brown` sections and closes with `CtaBand` (`Get In Touch`) |
| 12 | general dentistry pricing | `website/src/components/general-dentistry/general-dentistry-pricing.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Restyled with `Section`, `Heading`, `BookButton`; currently unused by `GeneralDentistryPage` |
| 13 | general dentistry root canal consent | `website/src/components/general-dentistry/general-dentistry-root-canal-consent.tsx` | Hims capture (`wrap-prose`, `bg-white` / `bg-cream` panel) | verified | ok | ok | same | Uses promoted `ConsentPanel` (`@/components/hims`); renders consent heading, intro, and all 3 `CONSENT_ITEMS` verbatim |
| 14 | general dentistry root canal pricing table | `website/src/components/general-dentistry/general-dentistry-root-canal-pricing-table.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [ok](../shots/general-dentistry/14-root-canal-prices-1440.png) | ok | same | Uses promoted `FeeTable` (`@/components/hims`); restored live heading `Our Root Canal Prices` |
| 15 | general dentistry root canal pricing | `website/src/components/general-dentistry/general-dentistry-root-canal-pricing.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Restyled compact card in Hims tokens; unused by `GeneralDentistryPage` |
| 16 | general dentistry services | `website/src/components/general-dentistry/general-dentistry-services.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | same | 3-col `Tile` grid (`tone="white"`) on `cream`; all 6 live service descriptions verbatim |
| 17 | general dentistry showcase | `website/src/components/general-dentistry/general-dentistry-showcase.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · Hims brown band | verified | ok | ok | same | `Section theme="brown" space="lg"` + `SplitFeature` with `<Media src="/images/generated/general-dentistry-showcase.jpg" ratio="4 / 3" tone="brown" />` and the 5 live `Procedures` links |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `general-dentistry-hero.tsx` | `General Dentistry: Your of Gateway to Lifelong Oral Health` | `General Dentistry: Your Gateway to Lifelong Oral Health` | Removed stray typo `of` from the live H1 while preserving the exact headline meaning |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `general-dentistry-hero` | `general-dentistry-hero.tsx` | `4 / 3` | Editorial studio still life on warm cream: matte-cream ceramic tray holding brushed stainless dental mirror and explorer in morning sunlight | `website/public/images/generated/general-dentistry-hero.jpg` | done |
| `general-dentistry-showcase` | `general-dentistry-showcase.tsx` | `4 / 3` | Calm sunlit modern dental treatment room with sculpted cream dental chair, pale travertine counter, walnut cabinetry | `website/public/images/generated/general-dentistry-showcase.jpg` | done |

## Verification log

- 2026-11-19: Browser verified `/services/general-dentistry` at `1440x900` and `390x844` (0 horizontal overflow; FAQ toggle verified). Added `/media/thumbnails/1.jpg` to `general-dentistry-cavities.tsx`, promoted `FeeTable` + `ConsentPanel` to `components/hims/`, and aligned `importance`/`choosing`/`FeeTable` copy for 80%+ SEO parity (up from 57%, 0 failures). All 17 sections marked `verified`.
- 2026-11-18: Redesigned all 17 general-dentistry components plus two local reusable helpers (`general-dentistry-fee-panel.tsx`, `general-dentistry-consent-panel.tsx`) in the Hims design system, restored verbatim live copy from `services--general-dentistry.txt` across pricing headings, FAQs, consent blocks, choosing factors, procedures, and Cost & Insurance, and removed all legacy classes (`max-w-6xl`, `font-display`, raw hex colours, `spotlight`, external image URLs). Browser visual verification pending (`built`).

## Open questions for the lead

1. **Repo-only claims, badges, and subtitles dropped from redesigned sections** (not present in `website/seo/live-text/services--general-dentistry.txt`):
   - `general-dentistry-hero.tsx`: `"Comprehensive dental care"` eyebrow and 3 pill bullets (`"Preventative care"`, `"Family dentistry"`, `"Comprehensive treatments"`).
   - `general-dentistry-cavities.tsx`: `"Understanding the cavity formation process helps you take better care of your teeth and prevent decay before it starts."`
   - `general-dentistry-root-canal-pricing-table.tsx`: `"Most Popular"` badge on Intermediate Root Canal, `"Includes"` bullet matrix, `"Save your natural tooth with expert root canal therapy. From simple front teeth to complex molars, we provide specialized care for every case."`, and footer claim `"Root canal complexity determined by tooth type and root canal system. X-ray and examination required for accurate pricing. Crown restoration not included."`
   - `general-dentistry-extraction-pricing-table.tsx`: `"Most Popular"` badge on Intermediate Extraction, `"Includes"` bullet matrix, `"Safe and professional tooth removal services. From simple extractions to complex surgical procedures, we ensure patient comfort and care."`, and footer claim `"Extraction complexity determined by X-ray and clinical examination. Local anesthesia provided for all procedures. Aftercare instructions included."`
   - `general-dentistry-filling-pricing-table.tsx`: `"Most Popular"` badge on Intermediate Composite, `"Includes"` bullet matrix, `"Natural-looking composite fillings with transparent pricing. From basic repairs to advanced restorations, we offer options for every need."`, and footer claim `"All composite fillings use tooth-colored materials for natural aesthetics. Treatment complexity determined by clinical assessment. Written quotes provided before treatment."`
   - `general-dentistry-pricing.tsx`: `"*All prices include consultation and follow-up care. NHS options available for eligible patients."`
   - `general-dentistry-services.tsx`: `"Comprehensive dental care services designed to maintain and improve your oral health for the entire family."`
   - `general-dentistry-importance.tsx`: `"General dentistry forms the foundation of good oral health, providing essential care that prevents problems before they start and ensures your smile stays healthy for life."`
   - `general-dentistry-choosing.tsx`: `"Finding the right dentist is important for your long-term oral health. Consider these key factors when making your choice."` plus extra phrases `"from current patients"`, `"and more consistent"`, and `"and offers flexible payment options"`.
   - `general-dentistry-showcase.tsx`: `"Procedures in Action"`, `"Experience the precision and care that goes into our general dentistry procedures."`, `"Root Canal Treatment Procedure"`, `"White Filling Procedure"`, `"Endodontic Treatment"`, `"Restorative Care"`.
   - `general-dentistry-faq.tsx`: 11 of 12 FAQ answers previously diverged from `services--general-dentistry.txt` (including a repo-only claim about `"lead aprons"` in the X-rays answer); all 12 have been restored verbatim to the live text.
2. **Unused components (kept on disk per no-delete rule):** `general-dentistry-pricing.tsx` (and the 3 summary card components it imports: `general-dentistry-root-canal-pricing.tsx`, `general-dentistry-filling-pricing.tsx`, `general-dentistry-extraction-pricing.tsx`) are not imported by `general-dentistry-page.tsx`.
3. **Consent blocks:** `CONSENT_ITEMS` (`Treatment Understanding`, `Risks and Benefits`, `Voluntary Participation`) in `general-dentistry-root-canal-consent.tsx` and `general-dentistry-extraction-consent.tsx` were preserved word-for-word untouched (note: in the previous codebase they were defined at the top of those files and never rendered because an external video placeholder sat there instead).
4. **Local reusable patterns for possible promotion to `components/hims/`:**
   - `GeneralDentistryFeePanel` (`general-dentistry-fee-panel.tsx`): white `rounded-xl` price-list panel with `divide-y divide-border`, `tabular-nums` right-aligned prices, and `BookButton`.
   - `GeneralDentistryConsentPanel` (`general-dentistry-consent-panel.tsx`): `wrap-prose` / `rounded-xl` clinical consent callout list with icon badges and `divide-y divide-border`.

## Pass 2

- **Capture used:** `/testosterone.html` (condition page) and the PDP bands (`/weight-loss/wegovy-pill.html`) per [treatment-page-recipe](../hims-patterns/treatment-page-recipe.md).
- **Differences found:** split hero with eyebrow pill; navy video band; three price tables as one divided panel; tile grids with 01/02 counters and eyebrow pills; cream `FaqList`; CtaBand with no form (live ends with the Get In Touch form).
- **Rebuilt:** hero (`TreatmentHero`, facts are live tier names with prices), cavities video (rounded card, button restyled), the three price tables (`general-dentistry-tier-cards.tsx`: sand cards, H3 keeps "Basic Root Canal (£195)"), services (`BenefitCards`), importance and choosing (`IncludedList`, rows keep the live "1. Early Diagnosis: ..." sentences), FAQ (`FaqSection`), closing (`general-dentistry-contact.tsx`, the live form). Consent blocks untouched (`ConsentPanel`, words verbatim). Showcase kept (dark band) minus its pill and counters. Section order kept as before (extraction before filling), SEO.
- **Wording changes:** none.
- **Removed (repo-only, not on the live page):** eyebrow pills "Preventative & Restorative Care", "Patient Education", "Clinical Treatments", "Preventative Approach", "Choosing Your Clinic", "Explore Treatments", "Patient Guidance". The closing CtaBand H2 is now the live "Get In Touch" form heading.
- **Images needed:** none new.
- **Open questions:** live shows filling prices before extraction prices; the page keeps the pre-pass-2 order. Unused files: `general-dentistry-fee-panel.tsx` and the four older pricing summaries.
