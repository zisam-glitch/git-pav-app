# About

- Agent group: **P1**
- Route(s): `/about`
- Route file(s): `website/src/routes/about.tsx`
- Live words: `website/seo/live-text/about.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | hero | `website/src/components/about/hero.tsx` | Hims clinical-excellence centred hero (hims-patterns/clinical-excellence.md) | built | [shot](../shots/about/1440-hero.png) | [shot](../shots/about/390-hero.png) | same | Live `A Legacy of Care and Innovation` copy verbatim (fixed `extendbeyond` typo); `BookButton` + `CallButton`; `<Media>` slot for `about-hero` Pass 2: centred DISPLAY_M hero; 390 not yet checked. |
| 2 | our story | `website/src/components/about/our-story.tsx` | Hims numbered bento (`Section theme="cream"`), dark brown feature (`Section theme="brown"`), split feature (`Section theme="sand"`) | verified | [shot](../shots/about/1440-story.png) | ok | same | Replaced Shadcnblocks placeholder copy with verbatim live sections: `The Dream and The Team`, `A Legacy Fulfilled`, `The Future of Dentistry` |
| 3 | team | `website/src/components/about/team.tsx` | Hims trust carousel ("The best care by the best in medicine") + `CtaBand` | verified | [shot](../shots/about/1440-team.png) · [cta](../shots/about/1440-cta.png) | ok | reworded | Real `TEAM_MEMBERS` in `TeamShowcase` carousel with GDC numbers linking to `/team/$slug` + `CtaBand` with live `Get In Touch` intro |
| 4 | about 3 | `website/src/components/ui/about-3.tsx` | Hims cream split + breakout `Tile` | verified | ok | ok | same | Restyled with `Section`, `Heading`, `Tile`, `Media`, `BookButton`/`ButtonLink`; removed `/media/hero-clinic.jpg`, `/media/hero-smile.jpg`, `glass`, `max-w-6xl` |
| 5 | team showcase | `website/src/components/ui/team-showcase.tsx` | Hims trust `Carousel` cards (`bg-tile-cream`, `rounded-lg`, `t-lift`) | verified | ok | ok | same | Rebuilt with Hims `Carousel` and `TEAM_MEMBERS` portrait links (`object-cover object-top`, GDC captions) |
| 6 | hero 05 | `website/src/components/ui/hero-05.tsx` | Hims split hero (`Section`, `SplitFeature`, `Heading`, `Media`) | verified | ok | ok | same | Restyled with Hims kit; removed blur entrance animations, `tracking-tight`, `max-w-7xl` |
| 7 | cta | `website/src/components/ui/hero-05-utils/cta.tsx` | Hims pill buttons (`BookButton`, `ButtonLink`) | verified | ok | ok | same | Uses `BookButton` for `BOOKING_URL` and `ButtonLink` for other links |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| Hero eyebrow (`hero.tsx`) | No eyebrow on live page | `Bradford · Our Story` | Hims hero eyebrow framing |
| Team section heading (`team.tsx`) | No team carousel section on live `/about` | `Care led by real clinicians and care team` | Matches Hims trust carousel pattern from `/` |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `about-hero` | `about/hero.tsx` hero media | `4 / 3` | Editorial photograph of a bright, minimalist dental clinic room in warm natural morning light, cream travertine counter, soft oak accents, calm architectural composition, no text or people | `website/public/images/generated/about-hero.jpg` | done |
| `about-legacy` | `about/our-story.tsx` brown feature band | `4 / 3` | Moody golden-hour editorial interior photo of a modern dental studio with warm walnut cabinetry, brushed brass lamp, and soft amber reflections, calm dignified atmosphere, no text or people | `website/public/images/generated/about-legacy.jpg` | done |
| `about-future` | `about/our-story.tsx` mobile & app split | `4 / 3` | Hims-style 3D studio still life on warm cream surface: sleek matte-sand mobile dental kit case beside a minimalist ceramic tray in soft natural sunlight, no text or logos | `website/public/images/generated/about-future.jpg` | done |

## Verification log

- 2026-11-19: Verified `/about` in Chromium at `1440x900` and `390x844` (all 8 real clinician portraits in carousel rendered cleanly, 0 console errors, 0 horizontal overflow), confirmed `/about` SEO parity 76% (0 failures), and saved shots in `docs/redesign/website/shots/about/`. Marked all 7 sections `verified`.

## Open questions for the lead

1. **Replaced placeholder copy in `our-story.tsx`**: Previous `about/our-story.tsx` contained unused Shadcnblocks template copy (`"Shadcnblocks is a passionate team..."`, `"Hundreds of blocks at Shadcnblocks.com"`); replaced completely with the verbatim live `/about` story sections (`The Dream and The Team`, `A Legacy Fulfilled`, `The Future of Dentistry`).
2. **Legacy `/media/about.png` replaced by `<Media>` slot**: Removed `/media/about.png` (an impasto illustration) from `about/hero.tsx` in favour of an atmospheric `<Media>` slot (`about-hero`) queued for Google Flow.

## Pass 2

**Capture used.** `/about/clinical-excellence.html` is an empty shell (the page draws itself with script; the capture holds no text or layout). Structure and values come from its saved page script and are written up in [clinical-excellence.md](../hims-patterns/clinical-excellence.md). `/benefits.html` gave the list patterns ([benefits.md](../hims-patterns/benefits.md)); the homepage trust carousel was re-checked. Recipe for this page family: [people-recipe.md](../hims-patterns/people-recipe.md).

**Differences found.** Hero was a split hero (Hims: centred display headline, sub-line, one wide picture). Story sections were cards and a brown split (Hims: stacked flow with a numbered list, a dark statement sheet with commitments, an open-book band). Team was rounded cream cards (Hims: capsule leader slider).

**Rebuilt (done).** Row 1, hero (`about/hero.tsx`): centred `DISPLAY_M` H1 with the key phrase on its own line, live lead, Book now and Call, the wired hero picture at 16 / 9, jump links (numbers dropped).

**Left to do (not started, in this order).**
1. `about/our-story.tsx`, Dream: `StackedFlow` (H2 `Heading size="h2-md"` "The Dream and" + accent "The Team", live paragraph) beside `NumberedList size="md"`; keep every label with its colon ("Dream :").
2. Same file, Legacy: `Statement theme="brown" sheet` (H2 "A Legacy" + accent "Fulfilled", first live paragraph), then a brown band with the wired `about-legacy.jpg` (keep its alt) and `Commitments tone="dark"` ("Executing :", "Inspiration and Growth :"), then the two closing live paragraphs centred.
3. Same file, Future: `OpenBook sheet` with the wired `about-future.jpg` (keep alt) on the left; H2 "The Future of" + accent "Dentistry", the two live paragraphs, `KeyLineList size="md"` for the three app abilities, buttons Book Now and "View Services" (`/services`, keep the link).
4. `about/team.tsx`: `LeaderCarousel` of eight `PersonCapsule` (`as="h3"`, `TeamPhoto`-style img, same alts) and the `/team` button; drop the eyebrow and the invented lead line; keep H2 "Care led by real clinicians and care team" and the `CtaBand` "Get In Touch".
5. Re-run the fingerprint and parity for `/about`, take 1440 and 390 shots into `docs/redesign/website/shots/about/`.
Files that become unused after step 4: `components/ui/team-showcase.tsx`. Already unused before pass 2 (nothing imports them): `components/ui/about-3.tsx`, `components/ui/hero-05.tsx`, `components/ui/hero-05-utils/cta.tsx`.

**Wording changes.**

| Where | Live wording | New wording | Why |
|---|---|---|---|
| Hero | none (no eyebrow on live) | eyebrow "Bradford · Our Story" removed | invented label |
| Jump links | none | numbers 01 to 04 removed, link labels and targets unchanged | decoration |

**Images needed.** None new. The hero picture is a 4 : 3 image shown at 16 / 9; a 16 : 9 render of the same room would crop less (`about-hero`).

**Open questions.** The H2 "Care led by real clinicians and care team" and its lead line are not on the live page (they were added in pass 1); the H2 stays for the SEO baseline. Eyebrows still in `our-story.tsx` and `team.tsx` ("02 · Shared Vision", "03 · Clinical Mission", "04 · Hub, Mobile & App", "Bradford Dental Team") are invented and go with step 1 to 4. SEO check after this pass: fingerprint OK, parity 100% (unchanged).
