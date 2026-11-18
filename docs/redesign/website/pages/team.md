# Team and team profiles

- Agent group: **P1**
- Route(s): `/team`, `/team/$slug`
- Route file(s): `website/src/routes/team.tsx`, `website/src/routes/team_.$slug.tsx`
- Live words: `website/seo/live-text/team.txt`, `website/seo/live-text/team--*.txt`
- Note: Eight real people (website/src/content/team-members.ts). GDC numbers stay.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | team grid | `website/src/components/team/team-grid.tsx` | Hims trust cards grid (`bg-tile-cream`, `rounded-xl`, `t-lift`) + `CtaBand` | verified | [shot](../shots/team/1440-grid.png) | [shot](../shots/team/390-grid.png) | same | Live `Dentists & Staff` H1 + lead; all 8 `TEAM_MEMBERS` in live order with real portraits, roles, GDC numbers + closing `CtaBand` |
| 2 | team photo | `website/src/components/team/team-photo.tsx` | Hims portrait frame with `PHOTO_PENDING` fallback | verified | ok | ok | same | Kept real team portrait loading & fallback untouched; formatted |
| 3 | team profile | `website/src/components/team/team-profile.tsx` | Hims split bio opener (`Section theme="cream"`) + prose body (`width="prose"`) + `CtaBand` | verified | [shot](../shots/team/1440-profile.png) | ok | same | Preserved JSON-LD, GDC numbers, `withContactLinks`, and verbatim `member.summary`/`blocks`; restyled in Hims tokens |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `/team` & `/team/$slug` closing `CtaBand` | No closing CTA band on live `/team` | `Ready to book with our team?` / `Care led by our Bradford team` | Matches Hims closing `CtaBand` pattern with live address and 24-hour details |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|

## Verification log

- 2026-11-19: Verified `/team` and `/team/dr-hassan-bhojani` in Chromium at `1440x900` and `390x844` (all 8 real clinician portraits loaded cleanly, GDC numbers preserved, 0 horizontal overflow), confirmed SEO parity 100% (`/team`) and 98% (`/team/dr-hassan-bhojani`), and saved shots in `docs/redesign/website/shots/team/`. Marked all 3 sections `verified`.

## Open questions for the lead

1. **Profile blocks rendered in `team-profile.tsx`**: Replaced `<ContentBlocks blocks={member.blocks} />` in `team-profile.tsx` with a local Hims-styled renderer (`ProfileBlock`) for `heading`, `paragraph`, `list`, and `quote` (the only block kinds in `team-members.ts`) so `/team/$slug` avoids legacy `#2a1c12` / `#925a27` colours from `components/content/content-blocks.tsx` (owned by C1). Once C1 restyles `content-blocks.tsx`, `TeamProfile` can optionally switch back to `<ContentBlocks />`.
