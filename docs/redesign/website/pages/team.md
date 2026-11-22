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
| 1 | team grid | `website/src/components/team/team-grid.tsx` | Hims clinical-excellence leader capsules (hims-patterns/clinical-excellence.md), homepage trust cards | built | [shot](../shots/team/1440-grid.png) | [shot](../shots/team/390-grid.png) | same | Live `Dentists & Staff` H1 + lead; all 8 `TEAM_MEMBERS` in live order with real portraits, roles, GDC numbers + closing `CtaBand` Pass 2: rebuilt with PersonCapsule; 1440 checked, 390 not yet. |
| 2 | team photo | `website/src/components/team/team-photo.tsx` | Hims portrait frame with `PHOTO_PENDING` fallback | verified | ok | ok | same | Kept real team portrait loading & fallback untouched; formatted |
| 3 | team profile | `website/src/components/team/team-profile.tsx` | Hims benefits stacked flow and key lines (hims-patterns/benefits.md), clinical-excellence capsule | built | [shot](../shots/team/1440-profile.png) | ok | same | Preserved JSON-LD, GDC numbers, `withContactLinks`, and verbatim `member.summary`/`blocks`; restyled in Hims tokens Pass 2: rebuilt (capsule hero, stacked-flow sections, quote band, capsule peers); 1440 checked, 390 not yet. |

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

## Pass 2

**Capture used.** The executive capsule slider of the Hims clinical-excellence page (script-derived values, see [clinical-excellence.md](../hims-patterns/clinical-excellence.md); the capture itself is empty) and the stacked-flow and key-line bands of `/benefits.html` ([benefits.md](../hims-patterns/benefits.md)). Recipe: [people-recipe.md](../hims-patterns/people-recipe.md).

**Differences found.** Pass 1 used cream trust cards with chips and a "View full profile" row, a dark governance band and, on profiles, a governance band plus peer cards. Hims shows people as tall capsule portraits with name and role under them.

**Rebuilt (done).** `team-grid.tsx`: centred H1, live lead, Book and Call, eight `PersonCapsule` (names stay H2, live photos, GDC pills, 2 columns on a phone and 4 on a desktop), the "Verify on the GDC Register" link kept, navy `CtaBand` kept. `team-profile.tsx`: capsule hero, role and `GDC: number` pills, live summary, facts as a definition list, profile sections in `StackedFlow` (`CheckList`, `NumberedList` for qualifications), the quote on a navy band, four peers as capsules, brown `CtaBand`. Left alone: `team-photo.tsx`, the Person JSON-LD script, `withContactLinks`, all live text.

**Not done.** 390px check and the saved screenshots (`docs/redesign/website/shots/team/`); that is why rows 1 and 3 are `built`, not `verified`.

**Wording changes.**

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `/team` hero | none | eyebrow "Bradford · Clinical & Care Team" removed | invented label |
| Card | none | "View full profile" row removed (the whole card is the link) | Hims capsule has no row |
| Profile | `GDC: 262970` | shown once, as `GDC: 262970` (was twice, once with "UK Registered") | live format |

**Removed repo-only content (owner to verify; every word is here so it can be put back).**
- `/team` (`team-grid.tsx`): H2 "Every appointment backed by regulated clinical standards"; lead "From routine check-ups and emergency pain relief to dental implants and practice compliance, every member of our Bradford team works to strict UK regulatory standards."; H3 "GDC-Registered Clinicians" (Clinical dentistry led by Principal Dentist & Registered Manager Dr Hassan Bhojani (GDC: 262970) and Implant Dentist Dr Cosimo Meucci (GDC: 280128).), H3 "Dedicated Compliance & Engineering" (Supported in-house by Compliance Manager Raheela Shafiq, Practice Manager Waleed Javed, and Director & Dental Engineer Aboo Bhojani.), H3 "24/7 Patient Support in Bradford" (Our nursing, clinical support, and patient care team operates from 786 Leeds Road, Bradford, BD3 9TY around the clock.); button "View Practice Policies" (`/practice-policy`, still linked from the footer).
- Every profile (`team-profile.tsx`): label "Pav Dental Clinical Governance", H2 "Regulated Bradford care across every appointment", text "Our clinicians and practice support staff operate from 786 Leeds Road, Bradford, BD3 9TY under CQC-aligned governance, cross-infection protocols, and transparent written treatment planning.", tiles "24/7 Practice Access: Emergency and routine care available 00:00 – 24:00, seven days a week." and "Written Treatment Plans: Every patient receives clear clinical options and itemised fees before treatment."
- SEO consequence: the fingerprint shows 9 WARN (these H2 and H3 headings and a lower word count on `/team` and the eight profiles), 0 FAIL; parity coverage is unchanged (`/team` 100%, profiles 98 to 100%). Restoring the headings clears the WARNs; the lead decides.

**Images needed.** None.
