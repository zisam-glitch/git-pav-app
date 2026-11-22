# Service: Mouthguards

- Agent group: **S2**
- Route(s): `/services/mouthguards`
- Route file(s): `website/src/routes/services.mouthguards.tsx`
- Live words: `website/seo/live-text/services--mouthguards.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | mouthguards colour | `website/src/components/mouthguards/mouthguards-colour.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/mouthguards/1440-colour.png) | ok | same | Interactive 32-colour swatch grid (`/media/mg.png`) + finish selector in Hims `Tile` and `Button` pills; calibrated blue/cyan/purple `hue-rotate` filters |
| 2 | mouthguards hero | `website/src/components/mouthguards/mouthguards-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/mouthguards/1440-hero.png) | [shot](../shots/mouthguards/390-hero.png) | same | `SplitFeature` with `text-hero` `<h1>`, verbatim live subtitle/body, `BookButton` + `ButtonLink` (`#contact`), and `<Media ratio="4 / 3" tone="cream" priority />` placeholder |
| 3 | mouthguards ordering | `website/src/components/mouthguards/mouthguards-ordering.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) · [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [shot](../shots/mouthguards/1440-order.png) | ok | same | Interactive pathway selector (`Visit Our Clinic` / `Order From Home`) over 2-col `Tile` step cards with all 4+4 live steps verbatim |
| 4 | mouthguards page (page composition) | `website/src/components/mouthguards/mouthguards-page.tsx` | Hims capture (`CtaBand`, `ContactForm`, alternating `white`/`cream`/`brown` bands) | verified | [shot](../shots/mouthguards/1440-contact.png) · [cta](../shots/mouthguards/1440-cta.png) | ok | same | Composes all 6 sections + shared `ContactForm` (`Get In Touch` live copy) + closing `CtaBand` (`theme="brown"`) |
| 5 | mouthguards personalisation | `website/src/components/mouthguards/mouthguards-personalisation.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/mouthguards/1440-personalisation.png) | ok | same | Interactive personalisation builder (`Name`, `Initials`, `Team Name`, `Number`, `Custom Logo`) with `Button` pills, shared `Input`/`Label`, and live preview tile |
| 6 | mouthguards users | `website/src/components/mouthguards/mouthguards-users.tsx` | Hims capture (`Carousel` + `Tile`) | verified | [shot](../shots/mouthguards/1440-who.png) | ok | same | `Carousel` of 7 `Tile tone="white"` cards on `cream` with exact live headings and descriptions |
| 7 | mouthguards why choose | `website/src/components/mouthguards/mouthguards-why-choose.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | same | Numbered `Tile tone="cream"` grid for the 7 verbatim live benefits |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `mouthguards-hero` | `mouthguards-hero.tsx` | `4 / 3` | Editorial Hims-style product still life on warm cream: matte custom sports mouthguard and minimalist travel case on travertine surface in soft natural sunlight, gentle shadows, no text or logos | `website/public/images/generated/mouthguards-hero.jpg` | done |

## Verification log

- 2026-11-19: Verified all 7 sections in Chromium at `1440x900` and `390x844` (interactive order pathway toggle, 32-colour picker, and custom personalisation inputs tested; 0 horizontal overflow), calibrated blue/cyan/purple `hue-rotate` angles in `mouthguards-colour.tsx`, and confirmed `/services/mouthguards` SEO parity 100% (up from 87%, 0 failures). Marked all sections `verified`.

## Open questions for the lead

1. **Repo-only claims, descriptions, and external image dropped from redesigned sections** (not present in `website/seo/live-text/services--mouthguards.txt`):
   - `mouthguards-hero.tsx`: `"Custom Protection"` eyebrow, 4 pill bullets (`"Digital scan options"`, `"Home mould kits"`, `"Custom colours"`, `"Personalisation available"`), and external Unsplash image URL.
   - `mouthguards-ordering.tsx`: Repo-only intro `"Every mouthguard is custom-made just for you. Follow the clinic trail or the home route — both lead to the same perfect fit."` and paraphrased step labels (`"Digital scan"`, `"Manufacturing"`, `"Delivery"`, `"Mould kit sent"`, `"Take impression"`, `"Return kit"`, `"Receive guard"`) replaced with the verbatim live steps.
   - `mouthguards-why-choose.tsx`: Repo-only descriptions under all 7 benefit headings (e.g., `"Local expertise you can trust with years of experience in custom mouthguards."`, `"We work with NHS to provide accessible dental protection for eligible patients."`) — live text contains only the 7 headings.
   - `mouthguards-colour.tsx`: Repo-only sentence `"Select your favorite colour or contact us for custom colour matching."` replaced with live `"You can choose from a variety of colour options, including single colour, two colour combinations, mixed colours, or glitter and special finishes for a more unique look."`.
   - `mouthguards-personalisation.tsx`: Repo-only descriptions (`"Add your name for easy identification"`, `"Personalize with your initials"`, `"Show your team pride"`, `"Add your player number"`, `"Add your team or club logo"`).
   - `mouthguards-users.tsx`: Repo-only subtitle `"Our custom mouthguards are designed for everyone - from professional athletes to children needing everyday protection."`.
2. **Generated image pending quota reset:** `mouthguards-hero.jpg` was not generated due to `429 RESOURCE_EXHAUSTED`; `<Media>` renders a clean Hims-tinted placeholder without `src` until generated.

## Pass 2

- Capture used: `/testosterone.html` and `/hair-loss/minoxidil.html` ("How to apply" band) via `treatment-page-recipe.md`.
- Differences found: split hero with invented fact tiles ("32 Colour Swatches"), eyebrow pills on every section, tile grids with per-card book buttons, a clinic or home toggle that only highlighted a card.
- Rebuilt: hero (`TreatmentHero`), ordering (two soft step cards with `NumberedList`; the toggle is gone because both pathways are always shown), why choose (brown band, new `TitleCards` dark), colour and personalisation (still working, headers via `SectionHeader`, eyebrows removed), who can use (`BenefitCards`, icons, seven H3s), closing (`ClosingBand`). The shared `ContactForm` (H2 "Get In Touch") is untouched.
- Wording changes (2): hero badge is the live line "Designed for comfort, accuracy and full protection"; fact rows are live fragments ("Digital or mould kit options", "Choose Your Colour", "Fast turnaround").
- Removed (repo-only): eyebrows "Athletic & Everyday Oral Protection", "32-Colour Custom Configurator", "Two Ordering Pathways", "Clinical Fit & Protection", "Bespoke Markings", "Tailored for Every Discipline", "Custom Inscription"; badges "In-Clinic Digital Scan", "Postal Impression Kit"; the "32 Colour Swatches" fact.
- Images needed: none new.
- Open questions: "NHS partners" is live wording and kept; owner to confirm it is still true.
