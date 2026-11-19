# Service: Whitening

- Agent group: **S3**
- Route(s): `/services/whitening`
- Route file(s): `website/src/routes/services.whitening.tsx`
- Live words: `website/seo/live-text/services--whitening.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | whitening comparison | `website/src/components/whitening/whitening-comparison.tsx` | Hims treatment pricing/info card ([Mobbin](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb)) | verified | [shot](../shots/whitening/1440-comparison.png) | ok | same | Desktop table + mobile stacked cards comparing the 3 live ranges (£65, £295, £495) |
| 2 | whitening faq | `website/src/components/whitening/whitening-faq.tsx` | Hims FAQ accordion ([Mobbin](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb)) | verified | [shot](../shots/whitening/1440-faq.png) | ok | same | Replaced invented FAQs with the 10 distinct verbatim live Q&As |
| 3 | whitening page (page composition) | `website/src/components/whitening/whitening-page.tsx` | Hims split hero ([Mobbin](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90), [Mobbin](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97)) | verified | [shot](../shots/whitening/1440-hero.png) | [shot](../shots/whitening/390-hero.png) | same | Added Hims split hero, Informed Consent for Tooth Whitening panel, and Get In Touch CtaBand |
| 4 | whitening products | `website/src/components/whitening/whitening-products.tsx` | Hims treatment details ([Mobbin](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97)) | verified | ok | ok | same | Rebuilt with Award Winning Whitening heading and 3 live products (£65, £295, £495) verbatim |
| 5 | whitening visualizer | `website/src/components/whitening/whitening-visualizer.tsx` | Hims cream tile & pill controls | verified | [shot](../shots/whitening/1440-visualizer.png) | ok | reworded | Kept interactive VITA shade fan deck; removed invented £99 UV kit & shade-lift promises |

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
