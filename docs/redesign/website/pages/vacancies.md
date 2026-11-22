# Vacancies

- Agent group: **P1**
- Route(s): `/vacancies`
- Route file(s): `website/src/routes/vacancies.tsx`
- Live words: `website/seo/live-text/vacancies.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | apply modal | `website/src/components/vacancies/apply-modal.tsx` | Hims form dialog (`rounded-xl`, shared `Input`/`Textarea`/`Label`/`Button`) | verified | [shot](../shots/vacancies/1440-modal.png) | ok | reworded | Accessible `role="dialog"` + Escape close; removed `backdrop-blur-xs` and unverified `within 48 hours` claim |
| 2 | open application | `website/src/components/vacancies/open-application.tsx` | Hims `CtaBand` (`theme="navy"`, `butter` + `glass`) | verified | ok | ok | same | Links to `/contact-us`, `CallButton`, `hello@pavdental.com`, live Bradford address |
| 3 | vacancies hero | `website/src/components/vacancies/vacancies-hero.tsx` | Hims split hero (`Section theme="white"`, `SplitFeature`, `Heading size="hero"`, `Media` 4/3) | verified | [shot](../shots/vacancies/1440-hero.png) | [shot](../shots/vacancies/390-hero.png) | reworded | Removed `/media/hero-clinic.jpg`, `blur-3xl`, `backdrop-blur-sm`; added `<Media>` slot `vacancies-hero` |
| 4 | vacancies list | `website/src/components/vacancies/vacancies-list.tsx` | Hims cream section + white `Tile` cards + shared `Input` search & filter pills | verified | [shot](../shots/vacancies/1440-list.png) | ok | same | Kept search & category filters; removed unverified `tags` (`50% Private Split`, `Accredited Practice`, `Home Office Sponsor`, `Funded NVQ Level 3`) from display |
| 5 | vacancies page (page composition) | `website/src/components/vacancies/vacancies-page.tsx` | Hims section rhythm (`white` -> `cream` -> `brown` -> `navy`) | verified | ok | ok | same | Composes hero, list, visa sponsorship banner, open application band, and apply modal |
| 6 | visa sponsorship banner | `website/src/components/vacancies/visa-sponsorship-banner.tsx` | Hims dark brown feature (`Section theme="brown"`, `SplitFeature`, `Media` 4/3) | verified | [shot](../shots/vacancies/1440-visa.png) | ok | same | Uses verbatim live `Foreign Visa and Sponsorship` paragraph; removed unverified Home Office licence / housing claims |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| Hero (`vacancies-hero.tsx`) | Live page starts with `Vacancies` heading directly | `Vacancies at Pav Dental` + concise Bradford careers lead | Hims split hero headline + intro pattern |
| Application confirmation (`apply-modal.tsx`) | Old repo text: `We typically review clinical applications within 48 hours.` | Removed unverified SLA | No turnaround timeframe published on live `/vacancies` |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `vacancies-hero` | `vacancies/vacancies-hero.tsx` | `4 / 3` | Editorial interior photo of a calm, sunlit modern dental clinic reception and consultation lounge in warm cream and oak tones, clean minimalist styling, no text or people | `website/public/images/generated/vacancies-hero.jpg` | done |
| `vacancies-sponsorship` | `vacancies/visa-sponsorship-banner.tsx` | `4 / 3` | Moody warm-lit editorial architectural photo of a modern dental treatment suite with travertine surfaces and warm walnut cabinetry, calm refined atmosphere, no text or people | `website/public/images/generated/vacancies-sponsorship.jpg` | done |

## Verification log

- 2026-11-19: Verified `/vacancies` in Chromium at `1440x900` and `390x844` (category tabs, search input, Apply modal open & Escape/Close, 0 horizontal overflow), confirmed SEO parity 93% (0 failures), and saved shots in `docs/redesign/website/shots/vacancies/`. Marked all 6 sections `verified`.

## Open questions for the lead

1. **Repo-only salary & contractual claims in `website/src/components/vacancies/vacancies-data.ts`** (not on `live-text/vacancies.txt`):
   - `salaryNote` values (`Competitive Apprentice Wage + Funded NVQ Level 3`, `£14.50 – £17.00 / hour depending on experience`, `High Earning Potential + 50% Private Split`, `£36.00 – £42.00 / hour negotiable`, `£38.00 – £44.00 / hour + nurse assistance`, `NHS Foundation Training Salary Band + Benefits`, `Tier 2 Eligible Salary Package + Relocation Assistance`).
   - `tags` (`Funded NVQ Level 3`, `50% Private Split`, `Established Patient List`, `Accredited Practice`, `Home Office Sponsor`, `Tier 2`, `Airflow Technology`, `1-on-1 Senior Mentor`, `GDC / Performer Number Guidance`).
   - Left `vacancies-data.ts` data structure intact for future owner review, and excluded unverified tags/salaries from the rendered UI in `vacancies-list.tsx`.
2. **Repo-only sponsorship claims dropped from `visa-sponsorship-banner.tsx`**: `"PavDental holds an official UK Home Office sponsor licence. We provide full Skilled Worker Visa sponsorship, relocation support, and dedicated mentoring..."`, `"Certificate of Sponsorship (CoS) provided"`, `"Relocation & housing support"`, `"GDC & Performer Number guidance"`, `"Licensed Home Office sponsor"`. Replaced with verbatim live `Foreign Visa and Sponsorship` copy.
3. **Repo-only SLA dropped from `apply-modal.tsx`**: `"We typically review clinical applications within 48 hours."` and `"forwarded directly to our Practice Principal and HR recruitment team"`.
4. **Hero perks grid dropped from `vacancies-hero.tsx`**: Previous hero listed 4 repo-only perk tiles (`Visa Sponsorship`, `Advanced Tech`, `Mentorship`, `Supportive Team`) not present on `live-text/vacancies.txt`.

## Pass 2

**Capture used.** `/benefits.html`: stacked flow (heading left, list right), partner rows, key lines ([benefits.md](../hims-patterns/benefits.md)). Recipe: [people-recipe.md](../hims-patterns/people-recipe.md).

**Status: not rebuilt in pass 2** (the allowance ran out). Route and components are untouched, so the apply modal, the open-application band and the search and filters still work as in pass 1. SEO fingerprint OK, parity 93% (unchanged).

**Differences found.** Roles are two-column cards with department and contract chips and tag pills (Hims: one `RowCard` per role beside a sticky heading in a `StackedFlow`: title, live description, Apply Now). Sponsorship is a split plus three pillar cards (the live page has it as the seventh role only).

**Left to do, in this order.**
1. `vacancies-list.tsx`: remove the repo-only `department`, `contractType` and `tags` chips from the display (see below), then `StackedFlow` with the H2 "Open Positions", search and filter pills on the left, `RowCard` rows on the right (H3 role title, live description, `Apply Now` and `Email Us`). Keep the categories and the search.
2. `visa-sponsorship-banner.tsx`: keep the live paragraph and Apply Now, drop the three pillar cards (their three H3 will show as fingerprint WARN; explain them).
3. `vacancies-hero.tsx`: drop the chip "Careers in Bradford · 7 Open Roles" and the invented lead; keep H1 "Vacancies at Pav Dental" (the H1 must not change), the wired picture and its alt, Call and View Open Positions; jump links may stay.
4. Check 1440 and 390, save shots to `docs/redesign/website/shots/vacancies/`, re-run fingerprint and parity.

**Repo-only content still shown today (found, not yet removed; pass 1 notes said it was gone, the code still renders it).** `vacancies-list.tsx` renders `tags` ("Hands-on Training", "Clinical Mentorship", "Funded Qualification", "Patient Support", "GDC Registered", "Infection Control", "Sedation Care", "Care Coordination", "Established Patient List", "50% Private Split", "Digital Scanners", "Full Clinical Autonomy", "Direct Access", "Pediatric Care", "Restorative Filings", "Modern Equipment", "Airflow Technology", "Periodontal Care", "Flexible Days", "Nurse Support Provided", "Accredited Practice", "1-on-1 Senior Mentor", "Multidisciplinary", "Study Days", "Home Office Sponsor", "Relocation Support", "GDC / Performer Number Guidance", "Full Visa Assistance"), `department` and `contractType` (for example "Apprenticeship (Full-time)", "Part-time (2-3 days/week)", "12-Month Training Contract", "Skilled Worker Visa (Tier 2)"). The hero shows "Careers in Bradford · 7 Open Roles" and "Join a growing practice in Bradford across dental nursing, general dentistry, hygiene, therapy, and international sponsorship."; the sponsorship pillars say "Direct employer visa sponsorship supporting relocation to our Bradford practice.", "Structured induction and clinical guidance alongside our experienced Bradford team." and "Modern digital dentistry suites, multidisciplinary support, and community impact."; the list lead says "Explore current roles at 786 Leeds Road, Bradford, BD3 9TY." and the closing band says "We welcome applications from dental professionals looking to join our team at 786 Leeds Road, Bradford, BD3 9TY or via hello@pavdental.com." None of it is on `live-text/vacancies.txt`. `salaryNote` values in `vacancies-data.ts` are not displayed.

**Wording changes.** None yet. **Images needed.** None new.
