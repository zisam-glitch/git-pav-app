# Service: Dentures

- Agent group: **S2**
- Route(s): `/services/dentures`
- Route file(s): `website/src/routes/services.dentures.tsx`
- Live words: `website/seo/live-text/services--dentures.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | dentures contact | `website/src/components/dentures/dentures-contact.tsx` | Hims capture (lead-capture panel) · [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/dentures/1440-contact.png) | ok | same | Restyled with `Section theme="cream"`, `Heading`, shared `Input`/`Select`/`Textarea`/`Label`/`Button` pills, `CallButton`, and `useEnquiry("Dentures")` |
| 2 | dentures faq | `website/src/components/dentures/dentures-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | [shot](../shots/dentures/1440-faq.png) | ok | same | Uses `FaqList` with sticky `Heading` + `BookButton`; restored all 10 live FAQs verbatim |
| 3 | dentures hero | `website/src/components/dentures/dentures-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/dentures/1440-hero.png) | [shot](../shots/dentures/390-hero.png) | reworded | `SplitFeature` with `text-hero` `<h1>`, live lead, `BookButton` + `ButtonLink` (`#contact`), and `<Media ratio="4 / 3" tone="cream" priority />` placeholder |
| 4 | dentures page (page composition) | `website/src/components/dentures/dentures-page.tsx` | Hims capture (`CtaBand`, alternating `white`/`cream`/`brown` bands) | verified | [shot](../shots/dentures/1440-cta.png) | ok | same | Composes all 6 sections + closing `CtaBand` (`theme="brown"`) with alternating bands |
| 5 | dentures pricing | `website/src/components/dentures/dentures-pricing.tsx` | [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [shot](../shots/dentures/1440-pricing.png) | ok | same | Uses promoted `PricingTiles` (`@/components/hims`) with the 3 live denture prices (`£495`, `£795`, `£1195`), `Qualifications` line, and consultation footer |
| 6 | dentures showcase | `website/src/components/dentures/dentures-showcase.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · Hims brown band | verified | [shot](../shots/dentures/1440-showcase.png) | ok | same | `Section theme="brown"` + `SplitFeature` with `<Media ratio="4 / 3" tone="brown" className="bg-white/10" />` placeholder and glass `Tile` cards for live options |
| 7 | dentures solutions | `website/src/components/dentures/dentures-solutions.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/dentures/1440-solutions.png) | ok | same | 4-col `Tile` grid (`tone="white"`) on `cream` for the 4 live solutions + `Affordable Denture Options` callout block |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `dentures-hero.tsx` | `Customized Dentures for a Confident Smile :` | `Customized Dentures for a Confident Smile` | Removed stray trailing colon in hero `<h1>` while preserving the exact headline wording |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `dentures-hero` | `dentures-hero.tsx` | `4 / 3` | Editorial Hims-style studio still life on warm cream: matte-cream ceramic tray holding a sculpted prosthetic dental arch model in soft morning sunlight, gentle shadows, no text or logos | `website/public/images/generated/dentures-hero.jpg` | done |
| `dentures-showcase` | `dentures-showcase.tsx` | `4 / 3` | Atmospheric Hims-style product macro on warm dark walnut surface: precision acrylic and flexible dental prosthetic models in soft directional warm studio lighting, no text or logos | `website/public/images/generated/dentures-showcase.jpg` | done |

## Verification log

- 2026-11-19: Verified all 7 sections in Chromium at `1440x900` and `390x844` (0 broken images, 0 horizontal overflow), added shared `ui/select.tsx` + `select::picker-icon` normalization and visible `bg-white/10` showcase placeholder, and confirmed `/services/dentures` SEO parity 87% (up from 3%, 0 failures). Marked all sections `verified`.

## Open questions for the lead

1. **Repo-only claims, prices, and subtitles dropped from redesigned sections** (not present in `website/seo/live-text/services--dentures.txt`):
   - `dentures-hero.tsx`: `"Bespoke prosthetic dentistry"` eyebrow, `"Precision-crafted full and partial dentures that restore function, facial contours, and your quality of life. NHS and private options available."`, `"Explore options"`, `"View prices"`, and 3 bullet claims (`"On-site laboratory"`, `"Same-day repairs"`, `"NHS Band 3 available"`), plus external Unsplash photo.
   - `dentures-solutions.tsx`: Repo-only solution titles (`"Full Acrylic Dentures"`, `"Cobalt Chrome Dentures"`, `"Same-Day Repairs & Relining"`), invented subtitles/descriptions/key benefits, and `"Every mouth has unique ridge contours and gum tissue. Our clinical dental technicians fabricate bespoke prosthetics using multi-stage impressions for optimal retention and lifelike appearance."`.
   - `dentures-pricing.tsx`: Repo-only price tables and prices not on the live dentures page (`Acrylic Partial Denture (1–3 teeth) from £350`, `Full Upper or Lower Acrylic Denture from £550`, `Complete Set (Upper & Lower Dentures) from £950`, `Flexible Valplast® Metal-Free Partial from £595`, `Cobalt Chrome Cast Metal Precision Denture from £795`, `Implant-Retained Snap-On Overdenture from £1,800`, `Same-Day Emergency Denture Repair / Fracture Fix from £80`, `Denture Soft Reline (Per Arch) from £120`, `Denture Hard Reline (Per Arch) from £150`), plus `"NHS Band 3 (£319.10) options available for eligible patients."` and `"*All new dentures include adjustment visits and 12-month structural warranty. NHS Band 3 patients: £319.10 contribution required."`. Note also the live page itself lists `Cobalt Chromium Denture – £1195` in the price bullets and `Cobalt chromium dentures are £1095` inside its FAQ answer — both are preserved verbatim pending owner review.
   - `dentures-showcase.tsx`: Repo-only copy (`"Dentures Craftsmanship"`, `"See how modern materials and precision engineering produce lightweight, comfortable, and lifelike prosthetics."`, `"Flexible Valplast® Resin Adaptation"`, `"3D Bite Alignment & Occlusal Setup"`, and external Unsplash images).
   - `dentures-faq.tsx`: All 10 previous Q&As diverged from `services--dentures.txt` (including claims about `"5 to 8 years"`, `"within 1 to 3 hours"`, `"NHS Band 3 dentures (£319.10)"`, and `"mobile dental units"`); replaced with the 10 verbatim live FAQs.
   - `dentures-contact.tsx`: Repo-only subtitle `"Have questions about our dentures or need a consultation? Contact our prosthetics team below."` replaced with live `"Ready to take control of your dental health? Contact us to book your appointment today!"`, and unverified `<select>` items replaced with live denture options/prices.
2. **Generated images pending quota reset:** `dentures-hero.jpg` and `dentures-showcase.jpg` were not generated due to `429 RESOURCE_EXHAUSTED`; `<Media>` renders clean Hims-tinted placeholders without `src` until generated.

## Pass 2

- Capture used: `/testosterone.html` (condition page) with `treatment-page-recipe.md`; worked examples `/services/root-canal`, `/services/whitening`.
- Differences found: pass 1 hero was a split feature with price tiles and an eyebrow; solutions, showcase and pricing carried repo-only eyebrows and "best for" lines; FAQ used the pass 1 `FaqList` (circle +/-); the page ended in a `CtaBand` panel.
- Rebuilt: hero (`TreatmentHero`, two wired pictures as a strip), solutions (`SectionHeader` + new kit `TitleCards`, H3s kept), showcase (brown band, `KeyLineList`), pricing (`PricingTiles`, live descriptions only), FAQ (`FaqSection`, 10 live questions), contact wrapper (rounded cream panel), closing (`ClosingBand`, H2 "Book your free consultation today" unchanged).
- Wording changes (3): hero fact rows cut from live sentences (prices line, "We Are The Dentists That Come To You.", "Free consultation with GDC-registered dentists"); link "Our Denture Prices (£495 – £1195)" became "Our Denture Prices"; pricing descriptions use the live en dash.
- Removed (repo-only, not on the live page): eyebrows "Tailored Restorations", "Prosthetic Craftsmanship", "Patient Guidance"; tiers "Standard Tier", "Popular Choice", "Precision Metal Framework"; three "best for" lines; hero tiles "Custom Fit / Digital scanning & clinic or home-visit fittings"; showcase detail lines for the two options. The fingerprint WARN (words 839 to 742, -12%) is exactly this text.
- Images needed: none new (wired pictures moved into the hero strip, same alt strings).
- Open questions: the live page shows Cobalt Chromium at £1195 in the price list and £1095 in the FAQ; both kept verbatim, owner to confirm.
