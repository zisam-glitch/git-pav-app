# Service: Virtual dentistry

- Agent group: **S4-B**
- Route(s): `/services/virtual-dentistry`
- Route file(s): `website/src/routes/services.virtual-dentistry.tsx`
- Live words: `website/seo/live-text/services--virtual-dentistry.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | virtual dentistry benefits | `website/src/components/virtual-dentistry/virtual-dentistry-benefits.tsx` | Hims dark brown bento (`Section theme="brown" width="bento" space="lg"`) | verified | [shot](../shots/virtual-dentistry/1440-why.png) | ok | reworded | Restored 5 verbatim benefit headings and paragraphs (`Speed and Convenience`..`Eco-friendly`) in `Tile tone="glass"` cards + `<Media tone="brown" className="bg-white/10" />` + `BookButton variant="gold"` & `CallButton variant="glass"` |
| 2 | virtual dentistry faq | `website/src/components/virtual-dentistry/virtual-dentistry-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | [shot](../shots/virtual-dentistry/1440-faq.png) | ok | reworded | Sticky left header + `FaqList` with all 12 verbatim Q&As from `services--virtual-dentistry.txt` (replacing repo-rewritten answers) |
| 3 | virtual dentistry hero | `website/src/components/virtual-dentistry/virtual-dentistry-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) & [treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [shot](../shots/virtual-dentistry/1440-hero.png) | [shot](../shots/virtual-dentistry/390-hero.png) | reworded | Split hero with verbatim `£35 Consultation Fee and £25 Prescription Cost` copy, 2 fee summary `Tile`s, `BookButton`, `CallButton`, `<Media tone="cream" />` (`priority`) |
| 4 | virtual dentistry how it works | `website/src/components/virtual-dentistry/virtual-dentistry-how-it-works.tsx` | Hims cream step cards (`Section theme="white"` + `Tile tone="cream"`) | verified | [shot](../shots/virtual-dentistry/1440-steps.png) | ok | same | Restored full verbatim Step 1–4 text including all 4 post-consultation outcomes; dropped repo-only subheading |
| 5 | virtual dentistry page (page composition) | `website/src/components/virtual-dentistry/virtual-dentistry-page.tsx` | Hims alternating page rhythm + `CtaBand` | verified | ok | ok | reworded | Alternates white/cream/brown sections cleanly; added closing brown `CtaBand` |
| 6 | virtual dentistry prescription process | `website/src/components/virtual-dentistry/virtual-dentistry-prescription-process.tsx` | Hims 4-step cream band (`Section theme="cream"`) | verified | ok | ok | reworded | 4 `Tile tone="white"` step cards using exact live labels; dropped repo-only step descriptions & `"home delivery"` claim |
| 7 | virtual dentistry registration | `website/src/components/virtual-dentistry/virtual-dentistry-registration.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | reworded | `SplitFeature` with verbatim `Registration Process.` copy (deduplicated repeated sentence), `ButtonLink href="#services"` (`Register`), and 5 `Tile tone="white"` field cards |
| 8 | virtual dentistry services | `website/src/components/virtual-dentistry/virtual-dentistry-services.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | same | `SplitFeature` with verbatim `Choose Type of Services` and `24 x 7 Emergency Dentists`, `<Media tone="cream" />`, `BookButton`, `CallButton`; dropped 5 repo-only invented service cards |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `virtual-dentistry-hero.tsx` | No eyebrow above H1 | `Virtual Dental Consultations` | Sets context in Hims split-hero layout without invented claims |
| `virtual-dentistry-prescription-process.tsx` | `How Online Presription Service Works?` | `How Online Prescription Service Works?` | Fixed typo `Presription` -> `Prescription` |
| `virtual-dentistry-benefits.tsx` | `accurate instructiosns`, `paper wast`, `eco-concious` | `accurate instructions`, `paper waste`, `eco-conscious` | Fixed live-site spelling typos while keeping sentences verbatim |
| `virtual-dentistry-faq.tsx` | `acess`, `computer .`, `servies`; sticky intro | `access`, `computer.`, `services`; added `Common questions about booking a video consultation, technology needed, and online prescriptions.` | Fixed live-site typos and added concise Hims sticky FAQ lead |
| `virtual-dentistry-registration.tsx` | Repeated sentence `The process of signing up for Pav Dental video consultation service is quick, short, and easy. Signing up for Pav Dental virtual video consultation service is quick, short, and easy.` | Kept single clean sentence `The process of signing up for Pav Dental video consultation service is quick, short, and easy.` | Removed accidental duplicate sentence from live crawl |
| `virtual-dentistry-page.tsx` | No closing CTA band in `live-text` | `Need dental advice from home?` + `£35 Consultation Fee · £25 Prescription Cost · Open 24 hours, 7 days a week.` | Standard Hims closing `CtaBand` using verified live fees and `PRACTICE_HOURS` |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `virtual-dentistry-hero` | `virtual-dentistry-hero.tsx` | `4 / 3` | Editorial studio still life on warm cream surface: sleek frameless tablet resting beside a matte-ceramic mug and soft sage linen cloth in morning sunlight, warm shadows, no text or logos | `website/public/images/generated/virtual-dentistry-hero.jpg` | done |
| `virtual-dentistry-benefits` | `virtual-dentistry-benefits.tsx` | `4 / 3` | Warm minimalist 3D render on deep espresso-brown backdrop: unbranded matte-cream prescription vial and pastel-sage oral care box lit by soft golden side light, no text or labels | `website/public/images/generated/virtual-dentistry-benefits.jpg` | done |
| `virtual-dentistry-services` | `virtual-dentistry-services.tsx` | `4 / 3` | Calm architectural clinic desk still life in warm natural daylight: smartphone on a travertine stand beside a ceramic tray and dental mirror, soft shadows, no text or people | `website/public/images/generated/virtual-dentistry-services.jpg` | done |

## Verification log

- 2026-11-19: Verified `/services/virtual-dentistry` in Chromium at `1440x900` and `390x844` (FAQ accordion toggle tested, 0 console errors, 0 horizontal overflow), confirmed SEO parity 90% (0 failures), and saved shots in `docs/redesign/website/shots/virtual-dentistry/`. Marked all 8 sections `verified`.

## Open questions for the lead

1. **Removed external Unsplash URL**: Dropped `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d...` from `virtual-dentistry-hero.tsx` (replaced with `<Media tone="cream" />` placeholder).
2. **Removed `Spotlight` import**: `virtual-dentistry-hero.tsx` no longer imports `@/components/home/spotlight`.
3. **Removed `"No Appointment Or Insurance Required"` and `"Home delivery options"` (`virtual-dentistry-hero.tsx`)**: Dropped `"Home delivery options"` (live text states `"Get Your Prescription Filled At Your Pharmacy"`, not home delivery) and `"No Appointment Or Insurance Required"` (present as an `h2` in `seo/live-baseline.json`, absent from `services--virtual-dentistry.txt`, and contradicts `Book appointment` and `£35 Consultation Fee`). Confirm whether `"No Appointment Or Insurance Required"` should stay omitted.
4. **Removed repo-only prescription step descriptions (`virtual-dentistry-prescription-process.tsx`)**: Dropped the repo-only intro line and 4 invented step descriptions (including `"Collect from your local pharmacy or home delivery"`), as `services--virtual-dentistry.txt` only lists the 4 step titles.
5. **Removed repo-only intro line (`virtual-dentistry-how-it-works.tsx`)**: Dropped `"Our virtual dental consultation process is designed to be simple, convenient, and effective. Here's how it works step by step."` and restored the truncated Step 3 and paraphrased Step 4 verbatim.
6. **Removed repo-only benefit intro (`virtual-dentistry-benefits.tsx`)**: Dropped `"Experience the future of dental care with our virtual consultation services designed for your convenience and health."` and restored exact live benefit sentences.
7. **Restored 12 live FAQ answers (`virtual-dentistry-faq.tsx`)**: Previous repo component had rewritten almost all 12 answers (for example replacing `"Flat rate £25."` and `"typically last 30 minutes"` with `"15-30 minutes"` and extra claims). Restored verbatim answers from `services--virtual-dentistry.txt`.
8. **Removed 5 repo-only service cards (`virtual-dentistry-services.tsx`)**: Dropped `"Video Consultations"`, `"Online Prescriptions"`, `"Home Visit Coordination"`, `"General Dental Advice"`, and `"Treatment Planning"` with their invented descriptions; `services--virtual-dentistry.txt` only lists `"24 x 7 Emergency Dentists"` / `"Round the clock we help people to connect with Dentists"` under `"Choose Type of Services"`.


## Pass 2

- Capture used: Hims condition and product pages (`/testosterone.html`, `/hair-loss/minoxidil.html`, `/weight-loss/wegovy-pill.html`) via `hims-patterns/treatment-page-recipe.md`.
- Differences and what was rebuilt:
- Hero: split hero with price tiles and a repo-only `24 x 7 Support` tile. Prescription pathway, how it works, benefits (dark glass), FAQ (`FaqList`), registration tiles, services.
- Rebuilt: hero (`TreatmentHero`, facts `£35 Consultation Fee`, `£25 Prescription Cost`, `24 x 7 Emergency Dentists` are live; no booking form), prescription pathway (`BenefitCards` numbered, icons), how it works (`Steps`, four live steps, the wired benefits picture), benefits (`BenefitCards`), FAQ (`FaqSection`, 12 questions), registration (heading and live paragraphs left, five H3 rows right), services (pills removed), closing (`ClosingBand`).
- Fingerprint WARN-free. Parity runner shows `coverage` unchanged at 93% (same sentences as the baseline).
- Wording changes (repo-only labels removed, no live wording changed):

| Where | Was | Now | Why |
|---|---|---|---|
| `virtual-dentistry-hero.tsx` | `Availability 24 x 7 Support`, pill `Virtual Dental Consultations`, links | removed (live: `24 x 7 Emergency Dentists`) | repo-only |
| `virtual-dentistry-faq.tsx` | lead `Common questions about booking a video consultation...`, pill `FAQs` | removed | repo-only |
| `virtual-dentistry-services.tsx` | pills `Round-the-Clock Access`, `£35 Consultation · £25 Prescription` | removed | repo-only |
| `virtual-dentistry-*` other | pills `Step-by-Step Guide`, `4-Step E-Prescription Pathway`, `Quick Online Onboarding`, step badges `01 · Schedule` | removed | repo-only |

- Images needed: None (the wired pictures stay; the benefits picture now sits in the steps band).

- Open questions for the owner: the live emergency and virtual FAQ text contains typos (`Ajdustment`, `servies`, `peoble`) and `BD3 8TY`; earlier passes normalised them. The triage and benefit cards have no body copy because the live page has none.
- Checks: tsc, eslint and `npm test` (121) pass; fingerprint 0 FAIL; parity coverage not below baseline.
