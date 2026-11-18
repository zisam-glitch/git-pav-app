# Service: Root canal

- Agent group: **S2-A**
- Route(s): `/services/root-canal`
- Route file(s): `website/src/routes/services.root-canal.tsx`
- Live words: `website/seo/live-text/services--root-canal.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | root canal consent | `website/src/components/root-canal/root-canal-consent.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/root-canal/1440-consent.png) | ok | same | Uses promoted `ConsentPanel` (`@/components/hims`) with verbatim heading and root canal consent items; removed Unsplash URL |
| 2 | root canal contact | `website/src/components/root-canal/root-canal-contact.tsx` | Hims lead-capture card (`home/contact-form.tsx`) | verified | ok | ok | same | Restyled with Hims `Input`, `Textarea`, `Label`; preserves `useEnquiry("Root canal")`, `PRACTICE_PHONE`, `PRACTICE_HOURS`, `PRACTICE_EMAIL`, `BookButton` |
| 3 | root canal faq | `website/src/components/root-canal/root-canal-faq.tsx` | [Mobbin FAQ accordion](https://mobbin.com/sites/sections/2c994fe8-510e-4cda-a1d8-95fa7ffc9cbb) | verified | [shot](../shots/root-canal/1440-faq.png) | ok | same | Uses `FaqList` (`@/components/hims`) with all 10 verbatim Q&As from `services--root-canal.txt` |
| 4 | root canal hero | `website/src/components/root-canal/root-canal-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) & [treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/root-canal/1440-hero.png) | [shot](../shots/root-canal/390-hero.png) | same | Verbatim H1 `Pav Dental Advanced Root Canal Care` and live lead; `<Media priority />` placeholder (`src` omitted pending image quota) |
| 5 | root canal how | `website/src/components/root-canal/root-canal-how.tsx` | Hims dark brown bento (`Section` + `Media` video player) | verified | [shot](../shots/root-canal/1440-how.png) | ok | same | Verbatim `How the Root canal treatment is done.`; keeps `/media/clinic-reel.mp4` player and replaced `/media/hero-clinic.jpg` with `<Media tone="brown" />` placeholder pending image quota |
| 6 | root canal page (page composition) | `website/src/components/root-canal/root-canal-page.tsx` | Hims alternating light/dark rhythm + `CtaBand` | verified | [shot](../shots/root-canal/1440-cta.png) | ok | reworded | Restored `RootCanalContact` (which was imported but omitted from JSX) and added closing `CtaBand` |
| 7 | root canal pricing | `website/src/components/root-canal/root-canal-pricing.tsx` | [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [shot](../shots/root-canal/1440-pricing.png) | ok | same | Uses promoted `PricingTiles` (`@/components/hims`) with all 3 live tiers (`£195`, `£295`, `£395`) and verbatim descriptions |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `root-canal-faq.tsx` | `Frequently Asked Questions` | `Frequently Asked` + accent `Questions` | Matches Hims two-tone `Heading` pattern while keeping the live words |
| `root-canal-contact.tsx` | `Get In Touch` | `Get In` + accent `Touch` | Matches Hims two-tone `Heading` pattern |
| `root-canal-page.tsx` | (closing CTA added) | `Ready to book your root canal care?` + `786 Leeds Road, Bradford, BD3 9TY · Basic (£195), Intermediate (£295), and Advanced (£395) root canal treatments.` | Standard closing `CtaBand` grounded strictly in live tiers and clinic address |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `root-canal-hero` | `root-canal-hero.tsx` | `4 / 3` | Minimalist editorial photograph of a serene modern dental suite in warm natural sunlight with cream stone, brushed steel dental mirror, and soft shadows | `website/public/images/generated/root-canal-hero.jpg` | needed |
| `root-canal-how` | `root-canal-how.tsx` | `16 / 9` | Atmospheric editorial photograph of a calm modern dental room in warm amber architectural lighting ready for endodontic care, soft shadows, no text or logos | `website/public/images/generated/root-canal-how.jpg` | needed |

## Verification log

- 2026-11-19: Verified all 7 sections in Chromium at `1440x900` and `390x844` (0 console errors, 0 horizontal overflow, FAQ accordion & video walkthrough toggles tested), replaced `/media/hero-clinic.jpg` thumbnail in `root-canal-how.tsx` with `<Media tone="brown" />` placeholder, and confirmed `/services/root-canal` SEO parity 100% (up from 11%, 0 failures). Marked all sections `verified`.

## Open questions for the lead

1. **Removed repo-only stats, claims, and price mismatches**:
   - `root-canal-hero.tsx`: removed `Microscope-enhanced endodontics`, `from £195` in H1, `3D digital imaging, and flexible rotary systems`, `95%+ tooth preservation`, `100% pain-free promise`, `Same-day emergency access`, and `spotlight.tsx` import.
   - `root-canal-how.tsx`: removed repo-only `STAGES` array / claims (`WaveOne Gold`, `Ultrasonic Irrigation`, `Hermetic Bioseal`, `endodontic specialists`, `as gentle and routine as having a regular filling`) and external Unsplash image URL.
   - `root-canal-pricing.tsx`: fixed mismatched prices (`Intermediate £275` -> `£295`, `Advanced £375` -> `£395`), removed `"Most Common"` badge, removed repo-only `NHS Band 2 and Band 3`, `0% APR finance available on treatments over £250`, `Operating microscope guidance`, and `Electronic apex locator tracking`.
   - `root-canal-consent.tsx`: `services--root-canal.txt` only captured the heading `Informed Consent for Root Canal Treatment` (no consent items in the text crawl); wired `ConsentPanel` with the practice's verbatim root canal consent items from `general-dentistry-root-canal-consent.tsx` and removed external Unsplash URL.
   - `root-canal-faq.tsx`: replaced 9 rewritten repo FAQs (including `over 95%` success rate) with all 10 verbatim Q&As from `services--root-canal.txt`.
   - `root-canal-contact.tsx`: removed unverified `"Our endodontic clinical coordinator will review your symptoms and call you promptly"` and `"specialist endodontic team"`.
