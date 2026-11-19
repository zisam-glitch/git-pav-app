# Service: Emergency dental

- Agent group: **S2-A**
- Route(s): `/services/emergency-dental`
- Route file(s): `website/src/routes/services.emergency-dental.tsx`
- Live words: `website/seo/live-text/services--emergency-dental.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | emergency banner | `website/src/components/emergency-dental/emergency-banner.tsx` | Hims `CtaBand` (`theme="brown"`) | verified | [shot](../shots/emergency-dental/1440-cta.png) | ok | same | Uses `CtaBand` with `CallButton` (`gold`, primary) and `BookButton` (`glass`); keeps verbatim `Say Goodbye TO Your Dental Pain!` and `Book An Emergency Dental Appointment With US TODAY!` |
| 2 | emergency contact form | `website/src/components/emergency-dental/emergency-contact-form.tsx` | Hims lead-capture card (`home/contact-form.tsx`) | verified | ok | ok | reworded | Restyled with Hims `Input`, `Textarea`, `Label`; keeps `api.forms.submitContact`, `CallButton` primary, and `BookButton` |
| 3 | emergency contact strip | `website/src/components/emergency-dental/emergency-contact-strip.tsx` | Hims 3-column cream `Tile` strip | verified | ok | ok | same | Uses `Section` + 3 `Tile` cards (`Address`, `Phone` via `PRACTICE_PHONE`, `Email` via `PRACTICE_EMAIL`) |
| 4 | emergency faq | `website/src/components/emergency-dental/emergency-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | [shot](../shots/emergency-dental/1440-faq.png) | ok | same | Uses `FaqList` (`@/components/hims`) with all 15 verbatim Q&As from `services--emergency-dental.txt`; Call is primary CTA |
| 5 | emergency hero | `website/src/components/emergency-dental/emergency-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) & [treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/emergency-dental/1440-hero.png) | [shot](../shots/emergency-dental/390-hero.png) | same | Verbatim H1 `Emergency Dentist`, Bradford 24/7 lead, `£45 consultation`, `£90* out-of-hours consultation`, `CallButton` primary (`PRACTICE_PHONE`), `Media` wired to `/images/generated/home-emergency-night.jpg` (`priority`) |
| 6 | emergency page (page composition) | `website/src/components/emergency-dental/emergency-page.tsx` | Hims alternating bands + `TestimonialsSection` | verified | ok | ok | same | Composes all 7 sections plus `TestimonialsSection` (`HOME_TESTIMONIALS`, matching live page's `What people say?` section) |
| 7 | emergency pricing | `website/src/components/emergency-dental/emergency-pricing.tsx` | [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [shot](../shots/emergency-dental/1440-pricing.png) | ok | same | Verbatim `£45` / `£90` consultation cards and all 9 live emergency treatment prices in a Hims hairline fee panel |
| 8 | emergency services | `website/src/components/emergency-dental/emergency-services.tsx` | Hims 4-column `Tile` grid | verified | [shot](../shots/emergency-dental/1440-triage.png) | ok | reworded | Uses the 8 live triage conditions (`Toothache` through `Painful Gums`) in `Tile` cards with `CallButton` |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `emergency-services.tsx` | `Denture Ajdustment` | `Denture Adjustment` | Fixed live typo while preserving meaning |
| `emergency-contact-form.tsx` | `Send us a message` | `Send us` + accent `a message`, plus short lead explaining call/message options | Matches Hims two-tone `Heading` and lead-capture layout |
| `emergency-contact-strip.tsx` | `HUB – 786 Leeds Road, Bradford, BD3 8TY` | `HUB – 786 Leeds Road, Bradford, BD3 9TY` | Matches canonical practice postcode `BD3 9TY` used in footer and `AGENTS.md` |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `emergency-dental-hero` | `emergency-hero.tsx` | `4 / 3` | Editorial photograph of a calm modern emergency dental treatment room at dusk with warm ambient lighting, cream cabinetry, and brushed steel instruments | `website/public/images/generated/emergency-dental-hero.jpg` | done |

## Verification log

- 2026-11-19: Verified all 8 sections in Chromium at `1440x900` and `390x844` (0 broken images, 0 horizontal overflow, FAQ accordion tested), confirmed `/services/emergency-dental` SEO parity 88% (up from 5%, 0 failures), and saved shots under `docs/redesign/website/shots/emergency-dental/`. Marked all sections `verified`.

## Open questions for the lead

1. **Removed repo-only stats, prices, and claims**:
   - `emergency-hero.tsx`: removed `24/7 Immediate Response`, `NHS & Private emergency slots`, `Immediate triage with our on-call clinician`, `Severe swelling or trauma? Call right away so we can prepare a surgical suite`, hardcoded `07311 871456` primary CTA (live hero uses `Call us Now` / `0800 1938 786`), and external Unsplash URL.
   - `emergency-pricing.tsx`: replaced mismatched repo prices (`from £50`, `Antibiotic Dispensing from £35`, `Pain Relief Dressing from £60`, `Simple Tooth Extraction from £75`, `Emergency Abscess Drainage from £90`, `Emergency Root Canal Extirpation from £180`) and repo-only claims (`NHS Bands 1 & 2 available`, `< 30 Mins From arrival to triage`, `Dedicated On-Call Surgical Team`, external Unsplash photo) with the exact live `£45` / `£90` consultation rates and all 9 verbatim treatment prices (`Tooth Extraction – from £95` through `Re-fixing a tooth loosened by trauma – £195`).
   - `emergency-services.tsx`: replaced repo-only triage descriptions and tags (`Time Critical (60m)`, `Coagulation Care`, `Surgical Relief`, etc.) with the 8 live items from `services--emergency-dental.txt`.
   - `emergency-faq.tsx`: replaced 11 rewritten repo FAQs (including `over 95% of cases`, `from £50`, `NHS Band 1 £26.80`, `within 60 minutes`, `conscious sedation`, `07311 871456`) with all 15 verbatim Q&As from `services--emergency-dental.txt`.
   - `emergency-contact-form.tsx`: removed unverified `"call you within 15 minutes"` response-time promise.
2. **Live text notes**: `services--emergency-dental.txt` contains a postcode typo (`BD3 8TY` in the contact strip vs `BD3 9TY` in the footer) and `Denture Ajdustment`; both were normalised cleanly while keeping the live meaning.
