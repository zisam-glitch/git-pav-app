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
| `vacancies-hero` | `vacancies/vacancies-hero.tsx` | `4 / 3` | Editorial interior photo of a calm, sunlit modern dental clinic reception and consultation lounge in warm cream and oak tones, clean minimalist styling, no text or people | `website/public/images/generated/vacancies-hero.jpg` | needed |
| `vacancies-sponsorship` | `vacancies/visa-sponsorship-banner.tsx` | `4 / 3` | Moody warm-lit editorial architectural photo of a modern dental treatment suite with travertine surfaces and warm walnut cabinetry, calm refined atmosphere, no text or people | `website/public/images/generated/vacancies-sponsorship.jpg` | needed |

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
