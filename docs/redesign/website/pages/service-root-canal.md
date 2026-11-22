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
| 2 | root canal contact | `website/src/components/root-canal/root-canal-contact.tsx` | Hims lead-capture card (`home/contact-form.tsx`) | verified | ok | ok | same | Restyled with Hims `Input`, `Textarea`, `Label`; preserves `useEnquiry("Root canal")`, `PRACTICE_*`, `BookButton`. Pass 2: phone, email and address rows are 44px tall |
| 3 | root canal faq | `website/src/components/root-canal/root-canal-faq.tsx` | `/testosterone.html` FAQ block ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `FaqSection` + `InfoAccordion` (native `<details>`, H3 questions, answers in the server HTML); all 10 verbatim Q&As; "Patient Guidance" pill removed (repo-only) |
| 4 | root canal hero | `website/src/components/root-canal/root-canal-hero.tsx` | `/testosterone.html` hero ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `TreatmentHero`: H1 + lead left, three fact rows cut from live sentences and two pills right, picture band below; eyebrow pill, two tiles and the ghost Call button removed (repo-only or duplicated in the header) |
| 5 | root canal how | `website/src/components/root-canal/root-canal-how.tsx` | `/testosterone.html` "built for you" steps card ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `Steps` (light gradient card, numbered list, picture with the clinic video player kept); dark brown band and glass tiles removed; step titles stay H3 |
| 6 | root canal page (page composition) | `website/src/components/root-canal/root-canal-page.tsx` | `/testosterone.html` closing band ([sheet](../hims-patterns/testosterone.md)) | verified | ok | ok | same | Pass 2: `CtaBand` replaced by `ClosingBand` (dark band, highlighted second line); H2 and text unchanged |
| 7 | root canal pricing | `website/src/components/root-canal/root-canal-pricing.tsx` | [Mobbin treatment pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | ok | ok | same | Uses promoted `PricingTiles` with all 3 live tiers (`£195`, `£295`, `£395`) and verbatim descriptions. Pass 2: the three repo-only "Best for" lines removed |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `root-canal-faq.tsx` | `Frequently Asked Questions` | `Frequently Asked` + accent `Questions` | Matches Hims two-tone `Heading` pattern while keeping the live words |
| `root-canal-contact.tsx` | `Get In Touch` | `Get In` + accent `Touch` | Matches Hims two-tone `Heading` pattern |
| `root-canal-page.tsx` | (closing CTA added) | `Ready to book your root canal care?` + `786 Leeds Road, Bradford, BD3 9TY · Basic (£195), Intermediate (£295), and Advanced (£395) root canal treatments.` | Standard closing `CtaBand` grounded strictly in live tiers and clinic address |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `root-canal-hero` | `root-canal-hero.tsx` | `4 / 3` | Minimalist editorial photograph of a serene modern dental suite in warm natural sunlight with cream stone, brushed steel dental mirror, and soft shadows | `website/public/images/generated/root-canal-hero.jpg` | done |
| `root-canal-how` | `root-canal-how.tsx` | `16 / 9` | Atmospheric editorial photograph of a calm modern dental room in warm amber architectural lighting ready for endodontic care, soft shadows, no text or logos | `website/public/images/generated/root-canal-how.jpg` | done |

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

## Pass 2

- **Captures used:** `/testosterone.html` (condition landing page) for every section, `/hair-loss/minoxidil.html` and `/weight-loss/wegovy-pill.html` for the accordion and FAQ rows. Sheets: [testosterone](../hims-patterns/testosterone.md), [minoxidil-pdp](../hims-patterns/minoxidil-pdp.md), [wegovy-pill-pdp](../hims-patterns/wegovy-pill-pdp.md). Recipe for the other service pages: [treatment-page-recipe](../hims-patterns/treatment-page-recipe.md).
- **Differences found:** hero was a split hero with an eyebrow pill, two tiles, three buttons (Hims: H1 left, fact rows and two pills right, picture band under it); "How" was a dark brown band with glass tiles (Hims: light rounded card, numbered list, picture); FAQ used `FaqList` (28px questions, circle toggles; Hims: 15.67px/500 rows 64px tall with a chevron); closing used the rounded `CtaBand` (Hims: full-width dark band with a highlighted headline).
- **Rebuilt:** hero (`TreatmentHero`), how (`Steps`), FAQ (`FaqSection`), closing (`ClosingBand`). Pricing lost its "Best for" lines. **Left alone:** consent (`ConsentPanel` matches), contact card (only the links made 44px tall).
- **Wording changes (live wording, new wording, why):**

| Where | Live wording | New wording | Why |
|---|---|---|---|
| hero fact rows | `Basic Root Canal (£195)`, `Intermediate Root Canal (£295)`, `Advanced Root Canal (£395)`; FAQ `Most root canals take 45–90 minutes depending on ...`; FAQ `Local anesthesia ensures comfort during the procedure.` | `Basic £195, Intermediate £295, Advanced £395`; `Most root canals take 45–90 minutes`; `Local anesthesia ensures comfort during the procedure` | Hims shows three short fact rows; each is a fragment of a live sentence |
| hero links | (in-page links, no live words) | `Our Root Canal Prices`, `Informed Consent for Root Canal Treatment` | dropped the repo-added `(£195 – £395)` |
| closing band | `Ready to book your root canal care?` (repo H2, kept for identical SEO) | same words, second half in the highlight box | Hims highlighter headline |

- **Removed as repo-only (not on the live page):** pill `Endodontic & Restorative Care`, hero tile `Local anaesthesia comfort to save your natural tooth`, pill `Step-by-Step Clinical Walkthrough`, pill `Patient Guidance`, three `Best for: ...` lines in the price tiles.
- **Images needed (optional, none blocks the page):** the hero is one wide band because only one picture is wired; Hims shows a strip of 3 to 4 tiles. Add `root-canal-strip-2` (4 / 3: steel dental mirror and explorer on warm cream linen, soft window light, still life, no text, no people) and `root-canal-strip-3` (4 / 3: calm treatment room corner, cream chair, pale wood shelf, warm natural light, no people), then pass three `tiles` to `TreatmentHero`. Files: `website/public/images/generated/root-canal-strip-2.jpg`, `root-canal-strip-3.jpg`.
- **Open questions for the owner:** (1) the closing H2 `Ready to book your root canal care?` and its line are repo copy kept so the SEO fingerprint stays identical; delete both if you prefer only live words. (2) The three step titles and texts under "How the Root canal treatment is done." are repo paraphrases of the live FAQ answer `What happens during the root canal procedure?`; kept because the H3 titles are part of today's SEO. (3) The consent items were ported by pass 1 from the general dentistry page.
- **Not done:** H1 uses `text-hero` (40 to 57px); Hims condition H1 is 32 to 57px (token request `text-display-s`). The video player and poster are unchanged.
- **Checks (browser, localhost:8180):** fingerprint compare 0 FAIL 0 WARN (words 993 to 948); parity run 100% (was 100%), 0 failures. No horizontal scroll at 390px.
