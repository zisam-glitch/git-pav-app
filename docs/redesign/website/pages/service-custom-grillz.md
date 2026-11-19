# Service: Custom grillz

- Agent group: **S3**
- Route(s): `/services/custom-grillz`
- Route file(s): `website/src/routes/services.custom-grillz.tsx`
- Live words: `website/seo/live-text/services--custom-grillz.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | grillz contact | `website/src/components/custom-grillz/grillz-contact.tsx` | Hims lead-capture card (capture y11900) | verified | [shot](../shots/custom-grillz/1440-contact.png) | ok | same | Rebuilt with Hims rounded cream card, shared Input/Textarea/Label/Select, and `useEnquiry("Custom grillz")` |
| 2 | grillz faq | `website/src/components/custom-grillz/grillz-faq.tsx` | Hims FAQ accordion ([Mobbin](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb)) | verified | ok | ok | same | Omitted from page (returns null): live page has no FAQ section; repo-only FAQs logged below |
| 3 | grillz hero | `website/src/components/custom-grillz/grillz-hero.tsx` | Hims split hero ([Mobbin](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90), [Mobbin](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97)) | verified | [shot](../shots/custom-grillz/1440-hero.png) | [shot](../shots/custom-grillz/390-hero.png) | same | Split hero with live copy verbatim; removed Unsplash URL, Spotlight, and kenburns |
| 4 | grillz page (page composition) | `website/src/components/custom-grillz/grillz-page.tsx` | Hims service page flow | verified | ok | ok | same | Composes Hero, Styles, Process, Guarantee/Delivery, Contact, and navy CtaBand |
| 5 | grillz pricing | `website/src/components/custom-grillz/grillz-pricing.tsx` | Hims dark brown feature band (capture y540) | verified | [shot](../shots/custom-grillz/1440-pricing.png) | ok | same | Removed invented price tables (£95–£780); rebuilt around live One Year Guarantee & Worldwide Delivery |
| 6 | grillz process | `website/src/components/custom-grillz/grillz-process.tsx` | Hims numbered cream tiles | verified | ok | ok | same | Rebuilt as 4 numbered cream tiles for live "Why Choose Pav Dental Grillz?" points |
| 7 | grillz styles | `website/src/components/custom-grillz/grillz-styles.tsx` | Hims treatment details ([Mobbin](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb)) | verified | [shot](../shots/custom-grillz/1440-styles.png) | ok | same | Replaced invented style specs with live Gold, Silver, Diamond, and Perfect Fit tiles verbatim |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `grillz-process.tsx` | `Worldwide Reach:No matter your location...` (missing space after colon on live scrape) | Rendered as card title `Worldwide Reach` + body `No matter your location, our grillz are just a scan away.` (same for the other 3 items) | Clean title/description layout in Hims numbered tiles while preserving every live word verbatim |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `custom-grillz-hero` | `grillz-hero.tsx` (Hero) | `4 / 3` | Luxury editorial still life of polished gold and diamond-accented dental grillz resting on warm cream travertine stone with soft natural daylight and crisp studio shadows, Hims aesthetic, no text, no logos, no people | `website/public/images/generated/custom-grillz-hero.jpg` | done |
| `custom-grillz-craft` | `grillz-pricing.tsx` (One Year Guarantee dark brown feature) | `4 / 3` | Close-up editorial product composition of an open bespoke jewelry presentation box lined in dark espresso suede holding a custom gold grill piece under warm directional light, Hims aesthetic, no text, no logos, no people | `website/public/images/generated/custom-grillz-craft.jpg` | done |

## Verification log

- 2026-11-19: Verified all 7 rows in Chromium at `1440x900` and `390x844` (both `<Select>` controls verified, 0 console errors, 0 horizontal overflow), confirmed `/services/custom-grillz` SEO parity 89% (0 failures), and saved shots in `docs/redesign/website/shots/custom-grillz/`. Marked all rows `verified`.

## Open questions for the lead

- Removed external Unsplash URL (`images.unsplash.com/photo-1598256989800-fe5f95da9787`) and repo-only hero claims (`"Dentist-fitted dental jewelry"`, `"Custom grillz for a luxurious smile"`, `"100% solid gold"`, `"Dentist fitted"`, `"VVS diamonds"`) from `grillz-hero.tsx`.
- Removed repo-only grillz styles and unverified specifications from `grillz-styles.tsx`: `"Classic Solid Gold Caps"`, `"Open Face / Window Cuts"`, `"Diamond Pave / Fully Iced-Out"`, `"Canine / Vampire Fangs"`, `"Deep Perm-Look Cuts"`, `"Diamond Dust & Textured Finishes"`, `"10k, 14k, and 18k"`, `"VVS1/VVS2 natural diamonds in honeycomb micro-prong settings"`, `"Micro-laser stippling, Florentine engraving"`.
- Removed all repo-only prices and guarantees from `grillz-pricing.tsx` (none appear in `services--custom-grillz.txt`): `"Single Tooth Cap (10k Solid Gold) from £95"`, `"14k from £145"`, `"18k from £195"`, `"Open Face / Window Cut Cap from £120"`, `"Extended Canine / Vampire Fang from £110"`, `"Diamond Dust / Stippled Finish from £130"`, `"Iced-Out VVS Diamond Pave Cap from £450"`, `"Full 6-Tooth Set (Top or Bottom, 10k) from £520"`, `"Full 6-Tooth Set (Top or Bottom, 14k) from £780"`, `"free in-clinic impression, luxury storage box, and tight snap-fit guarantee"`, `"UK Assay certified gold"`. Please confirm if the owner wants any verified pricing published on `/services/custom-grillz`.
- Omitted `grillz-faq.tsx` output (`return null`): `services--custom-grillz.txt` contains zero FAQ items, and the 9 previous FAQs made unverified claims (`"10k, 14k, and 18k gold"`, `"7 to 10 working days"`, `"express 3 to 5-day priority rush service"`, `"VVS1–VVS2 clarity, F/G color, F/G round brilliant cut diamonds"`, `"online mold kit"` comparison).
- Removed `"14k Yellow Gold (Most Popular)"`, specific karat labels (`10k`/`14k`/`18k`), and placeholder `"Marcus Vance"` from `grillz-contact.tsx`, replacing select options with live metal/gem options (`Gold Grillz`, `Silver Grillz`, `Diamond Grillz`, `Tooth Gems`, `Yellow/White/Rose Gold`).
