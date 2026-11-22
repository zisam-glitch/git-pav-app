# Recipe: people and corporate pages (about, team, profiles, vacancies, petition)

Written by agent C1 on pass 2, 22 Nov 2026. Sheets behind it: `clinical-excellence.md` (about, leaders) and `benefits.md` (lists, stacked flow). The saved clinical-excellence capture is an empty shell (script-drawn page), so its sheet comes from the saved page script: read that sheet's first paragraph before you measure anything.

## Section order for a Pav page of this kind

1. **Centred hero** (about): display headline with the key phrase in terracotta on its own line, the live lead, Book now + Call, one wide picture (16 / 9) under it. Directories (team) use `Heading size="hero"` centred, lead, buttons, then the grid.
2. **Stacked flow** (`StackedFlow`): heading + lead left, list right. Use it for steps (`NumberedList`), profile sections (`CheckList`, `NumberedList`) and, still to build, the open roles (`RowCard`).
3. **Dark statement** (`Statement theme="brown" sheet`): the one big emotional passage of the page (about: "A Legacy Fulfilled"). Put labelled commitments under it in `Commitments`.
4. **Open book** (`OpenBook sheet`): picture to the edge on one side, text on the other (about: the future of dentistry with `KeyLineList`).
5. **People**: `PersonCapsule` in a `LeaderCarousel` (preview on about) or a 2 / 4-column grid (team, peers on a profile).
6. **Closing band**: `CtaBand` with the live "Get In Touch" line (brown) or "Ready to book" (navy). Already matches Hims: leave it.

## Which kit component carries which content

| Content | Component (all in `website/src/components/hims/`) |
|---|---|
| One-sentence abilities, three at most | `key-line-list.tsx` (gradient bar, not gradient text) |
| Numbered steps, labelled | `numbered-list.tsx` (`size="md"`; `"text"` for one-sentence items) |
| Short facts or lists of items | `check-list.tsx` (another agent's file) |
| Two labelled cards | `commitments.tsx` |
| A person | `person-capsule.tsx` (name is an h2 on `/team`, an h3 elsewhere) |
| A list row with an action (roles) | `row-card.tsx` |
| Section heading with a button | `section-header.tsx` (another agent's file) |

## Traps hit

- **Display type**: our `text-display` starts at 50px; Hims DISPLAY_M starts at 40px. Import `DISPLAY_M` and `BODY_L` from `hims/type-styles.ts` and apply them as `style` (a constants file, so the react-refresh lint rule stays quiet); `Heading` cannot take a style, so write the `h1` yourself.
- **SEO baseline**: the fingerprint compares H2, H3, links, external links and every image alt text as a multiset. Keep each alt string and count (the three about pictures, the eight portraits, the four peers on a profile). In-page `#anchors` resolve to `/` and never count. Never touch the Person JSON-LD script in `team-profile.tsx`.
- **Live labels with a colon** ("Dream :", "Executing :") must stay verbatim, colon included, or the parity coverage drops.
- **Sheets**: `-mt-6 rounded-t-xl` hides 24px of the band above, so that band needs its normal bottom padding.
- **Shadows** on capsules need `pb-14` in any `overflow-x-auto` row, or they are clipped.
- **Tests**: a plain `<a>` whose text has book, booking or appointment must use `href={BOOKING_URL}`; use `BookButton`.
- **Browser tab**: the viewport resets between turns (call `resize_window` again); `scrollTo` is smooth, use `{ behavior: "instant" }` before a screenshot.
- **Pass 1 notes were wrong in places**: `vacancies-list.tsx` still shows the repo-only tags, department and contract chips ("50% Private Split", "Home Office Sponsor" and more) although its tracking file says they were removed. Check the code, not the note.
- Pictures that are wired (about hero, legacy, future; vacancies hero, sponsorship; petition hero) stay wired; their alt text is part of the SEO fingerprint.
