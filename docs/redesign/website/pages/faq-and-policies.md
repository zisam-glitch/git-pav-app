# FAQ and policy pages

- Agent group: **C1**
- Route(s): `/faq`, `/practice-policy`, `/cctv-policy`, `/privacy-policy`, `/terms-and-condition`, `/cookie-policy`, `/complaints-policy`
- Route file(s): `website/src/routes/faq.tsx`, `website/src/routes/practice-policy.tsx`, `website/src/routes/cctv-policy.tsx`, `website/src/routes/privacy-policy.tsx`, `website/src/routes/terms-and-condition.tsx`, `website/src/routes/cookie-policy.tsx`, `website/src/routes/complaints-policy.tsx`
- Live words: `website/seo/live-text/faq.txt`, `website/seo/live-text/practice-policy.txt`, `website/seo/live-text/cctv-policy.txt`, `website/seo/live-text/privacy-policy.txt`, `website/seo/live-text/terms-and-condition.txt`, `website/seo/live-text/cookie-policy.txt`, `website/seo/live-text/complaints-policy.txt`
- Note: Legal text is reviewed: restyle the layout only, never the words.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | content blocks | `website/src/components/content/content-blocks.tsx` | Hims design system prose, table & tile tokens | verified | [shot](../shots/policies/1440-privacy.png) | ok | same | Replaced legacy brown hex colours and `font-display`/`max-w-3xl` with Hims tokens (`Section`, `Heading`, `Tile`, `Media`, `wrap-prose`, `bg-tile-cream`, `text-terracotta`). Preserved `ContentBlock` type export for `team-profile.tsx`. |
| 2 | live content page (page composition) | `website/src/components/content/live-content-page.tsx` | Hims `FaqList` + `ContentPageBody` + `CtaBand` | verified | [shot](../shots/faq/1440-faq.png) | ok | same | `/faq` renders two-column sticky header + Hims `FaqList` (all 5 Q&As verbatim in HTML) + `CtaBand`; `/cctv-policy` and `/practice-policy` render via `ContentPageBody`. Inline legal routes (`privacy-policy`, `terms-and-condition`, `cookie-policy`, `complaints-policy`) restyled with `ContentPageBody` and Hims borders/typography, zero wording changes. |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|

## Verification log

- 2026-11-19: Verified `/faq` and all 6 policy routes (`/privacy-policy`, `/complaints-policy`, `/practice-policy`, `/cctv-policy`, `/terms-and-condition`, `/cookie-policy`) in Chromium at `1440x900` and `390x844` (HTTP 200, single H1, FAQ accordion toggle verified, 0 legacy brown/amber classes, 0 horizontal overflow), confirmed `/faq` and `/cctv-policy` at 100% SEO parity (0 failures across all 7 routes), and saved shots in `docs/redesign/website/shots/{faq,policies}/`. Marked both rows `verified`.

## Open questions for the lead

- Adding the visible `<h2>Your questions, answered</h2>` heading on `/faq` keeps heading hierarchy strictly `h1 -> h2 -> h3` (since `FaqList` renders `<h3>` buttons); confirm if preferred over a hidden heading.
