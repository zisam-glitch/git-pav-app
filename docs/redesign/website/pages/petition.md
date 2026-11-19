# Petition

- Agent group: **P1**
- Route(s): `/petition`
- Route file(s): `website/src/routes/petition.tsx`
- Live words: `website/seo/live-text/petition.txt`
- Note: The signers list is personal data and is not kept in the repo.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | petition contact | `website/src/components/petition/petition-contact.tsx` | Hims lead-capture card (`wrap-max`, `bg-cream`, white `p-[60px]` card, shared fields) | verified | [shot](../shots/petition/1440-contact.png) | ok | same | Uses `PETITION.contact` verbatim + `BookButton` + `CallButton` + `useEnquiry("Petition")` |
| 2 | petition form bar | `website/src/components/petition/petition-form-bar.tsx` | Hims dark brown feature band (`Section theme="brown"`, `bg-white/7`, shared `Input`, `Button variant="gold"`) | verified | [shot](../shots/petition/1440-form.png) | ok | same | Preserves `api.forms.submitPetition`, required UK resident checkbox, and `PETITION.form` strings verbatim |
| 3 | petition hero | `website/src/components/petition/petition-hero.tsx` | Hims split hero (`Section theme="white"`, `SplitFeature`, `Heading size="hero"`, `Media` 4/3) + cream `Tile` pair | verified | [shot](../shots/petition/1440-hero.png) | [shot](../shots/petition/390-hero.png) | same | All `PETITION` hero copy, buttons, and 2 cards verbatim; `<Media>` slot `petition-hero` |
| 4 | petition media | `website/src/components/petition/petition-media.tsx` | Hims light rounded video frame (`max-w-[960px]`, `aspect-video`, `rounded-xl`) | verified | [shot](../shots/petition/1440-media.png) | ok | same | Lazy YouTube embed (`youtube-nocookie.com`) on play click; `PETITION.video.heading` verbatim |
| 5 | petition page (page composition) | `website/src/components/petition/petition-page.tsx` | Hims section rhythm (`white` -> `brown` -> `white` -> `cream` lead-capture) | verified | ok | ok | same | Exact live page order; no signer names or counters |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `petition-hero` | `petition/petition-hero.tsx` | `4 / 3` | Warm sunlit editorial photograph of a welcoming modern dental clinic exterior and street-level entrance in northern England, warm cream stone and soft daylight, calm community atmosphere, no text or people | `website/public/images/generated/petition-hero.jpg` | done |

## Verification log

- 2026-11-19: Verified `/petition` in Chromium at `1440x900` and `390x844` (YouTube thumbnail, petition sign bar, and contact card verified; 0 console errors, 0 horizontal overflow), confirmed SEO parity 88% (0 failures), and saved shots in `docs/redesign/website/shots/petition/`. Marked all 5 sections `verified`.

## Open questions for the lead

1. No invented or repo-only claims found on `/petition`; all copy is strictly backed by `website/src/content/petition.ts` and verified by `petition.test.ts`.
