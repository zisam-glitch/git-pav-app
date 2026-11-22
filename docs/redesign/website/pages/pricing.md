# Pricing

- Agent group: **S4**
- Route(s): `/pricing`
- Route file(s): `website/src/routes/pricing.tsx`
- Live words: `website/seo/live-text/pricing.txt`
- Note: Finance and 0% wording is an owner decision: leave existing words, report them.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | fee table | `website/src/components/pricing/fee-table.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) · Hims white rounded panels with 1px hairline rows | verified | [shot](../shots/pricing/1440-fees.png) | ok | same | Restored all 13 live fee categories and exact prices from `pricing.txt`; kept `api.pricing.get()`, search input, and added category filter tabs |
| 2 | insurance providers | `website/src/components/pricing/insurance-providers.tsx` | Hims cream `Tile` grid on white (`Section`) | verified | ok | ok | same | Kept `We Accept All Insurance Providers` and 6 provider tiles in Hims tokens; dropped unverified `Direct claim processing...` subtitle |
| 3 | pricing cards | `website/src/components/pricing/pricing-cards.tsx` | [Mobbin pricing card](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) · Hims cream/sage `Tile` grid | verified | [shot](../shots/pricing/1440-plans.png) | ok | same | BRONZE (£9.47), SILVER (£15.85), GOLD (£19.24) with Monthly/Annual switch, `api.pricing.get()` query, and `BookButton` |
| 4 | pricing footer | `website/src/components/pricing/pricing-footer.tsx` | — | verified | ok | ok | same | Unused by `routes/pricing.tsx` (superseded by shared `Footer`); cleaned external Cloudinary URL and banned classes, delegates to `Footer` |
| 5 | pricing hero | `website/src/components/pricing/pricing-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · [Mobbin details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/pricing/1440-hero.png) | [shot](../shots/pricing/390-hero.png) | same | `SplitFeature` with H1 `You don't have to Pay for it all at once.`, live 0% finance lead from `pricing.txt`, `BookButton`, `CallButton`, and `4 / 3` `<Media>` placeholder (`pricing-hero`) |
| 6 | special announcement | `website/src/components/pricing/special-announcement.tsx` | Hims dark `brown` feature section + glass `Tile` cards | verified | [shot](../shots/pricing/1440-announcement.png) | ok | same | Restored live `Special Announcement from Pav Dental`, `Our Price Match Promise`, and `Choose Pav Dental for:` copy verbatim; kept `api.announcements.list()` banner |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `fee-table.tsx` section heading | `Pav Dental Plans` (repeated above fee schedule) | Eyebrow `Pav Dental Plans` + heading `Treatment Fee Schedule` | Keeps the live string `Pav Dental Plans` while distinguishing the fee schedule from the membership plans section above |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `pricing-hero` | `pricing-hero.tsx` | `4 / 3` | Editorial studio still life on warm cream: sunlit dental consultation desk with matte-cream treatment folder, ceramic cup, and warm soft shadows, no text or logos | `website/public/images/generated/pricing-hero.jpg` | done |

## Verification log

- 2026-11-19: Verified `/pricing` in Chromium at `1440x900` and `390x844` (Monthly/Annual toggle, category tabs, fee search, 0 horizontal overflow), confirmed `/pricing` SEO parity 95% (0 failures), and saved shots in `docs/redesign/website/shots/pricing/`. Marked all 6 sections `verified`.

## Open questions for the lead

1. **Finance and 0% wording (owner decision)**:
   - Live `pricing.txt` (preserved verbatim in `pricing-hero.tsx`): `"With our 0% interest dental finance, treatments from £99 can be started today and paid over convenient monthly instalments."` (Previous repo `pricing-hero.tsx` had reworded this without `from £99`: `"We offer 0% interest dental finance options that allow you to spread the cost of treatment with affordable monthly payments."`)
   - Previous repo `special-announcement.tsx` contained repo-only finance/credit/concession claims not present in `pricing.txt`: `"0% APR Representative"`, `"0% Finance Options"`, `"Spread the cost over 6, 10, or 12 months with 0% interest and £0 deposit across all eligible treatments"`, `"Instant decision in-clinic or online"`, `"Soft credit check with no score impact"`, `"Available from £250"`, `"NHS & Private Care"`, `"NHS care for exempt patients"`, `"Family registration discounts"`, `"Senior (65+) & student concessions"`, `"Same-Day Appointments"`, `"GDC Registered Bradford"`. These were removed when restoring the live `Special Announcement from Pav Dental` and `Our Price Match Promise` copy from `pricing.txt`. Confirm with the owner whether any credit/APR or concession wording should be added back.
2. **Membership billing toggle (`pricing-cards.tsx`)**:
   - Kept the working Monthly / Annual switch (`Annual (Save 20%)`, yearly prices `£7.58`, `£12.68`, `£15.39`, and `SILVER` `popular: true` flag from `api.pricing.get()`), though `pricing.txt` only lists monthly prices (`£9.47`, `£15.85`, `£19.24`). Note `pricing.txt` also has `"3x hygiene visits per yer"` and `"Dedicated Whatsapp Number,"` verbatim.
3. **Fee schedule discrepancies (`fee-table.tsx` vs `pricing.txt`)**:
   - The previous `CATEGORIES` fallback in `fee-table.tsx` differed substantially from `pricing.txt` across categories and prices:
     - *Examination*: repo had Routine £35, New Patient £45, Small Digital X-Ray £10, OPG £45, Emergency Consultation £45 vs live Off Peak (Pre-Booked) £35, Peak Hours (Same Day) £55, After Hours (18:00 / 20:00) £150, Late Night (After 23:00) £200, Sunday (All Day + Night) £200.
     - *Hygiene*: repo had Scale & Polish £45, Airflow £65, Periodontal Deep Clean £75 vs live Basic (Polish only) £45, Intermediate (Scale only) £65, Advanced (Scale and Polish with/without Topical Anesthesia) £75.
     - *Fillings*: repo had White Fillings £75/£95/£125 vs live Fillings / Bonding Basic £95, Intermediate £145, Advanced £195.
     - *Root Canal*: repo had £250/£325/£425 + Emergency Pain Relief £65 vs live Simple £195, Intermediate £295, Advanced £395, Surgical £495.
     - *Extractions*: repo had £75/£135/£175 + Socket Preservation £95 + Out of Hours £145 vs live Simple £95, Intermediate £145, Advanced £195, Surgical £295, Treatment of Dry Socket £35.
     - *Crowns & Bridges*: repo had £350/£450/£495/£350/£45 vs live Crown & Bridge Metal crown £395, Porcelain Crown/ Veneer £495, Precious Metal (Gold) £695, Inlay/ Onlay Composite £295, crown/ bridge recementation £60.
     - *Dentures*: repo had £450/£750/£650/£65 vs live Acrylic £495, Valplast (flexible) £795, Chrome £1195.
     - *Prevention*: missing from repo; restored from live (`X-Ray per film Free`, `Fissure Sealants per tooth £10`, `Fluoride Varnish Application £5`).
     - *Teeth Whitening*: repo had £195/£350/£450/pack of 2 £45/Internal Bleaching £95 vs live Home £295, In Office £295, Combined £495, Top Up Single £45, Pack of 4 £95, Whitening Strips (14 day) £65.
     - *Other Items & Aesthetics*: replaced repo's unverified Dental Implants (`From £1,500`), Orthodontics (`From £1,200`), Special Services (`Mobile Dentistry Call-out £95`, `Virtual Consultation Free`), Emergency Services (`£45/£75/£95`), and different Facial Aesthetics fees with live `Other Items` (Bite Guard £145, Sports Guard £145, antibiotic prescription £25, Clear aligners £1995), `Aesthetics Dermal Fillers` (£100–£450), `Aesthetics Botox` (1–4 AREAS £180–£400), and `Other Aesthetics` (PROFHILO FIRST DOSE £249, SOSUM BOOSTER £160, GRILLZ Available on request).
   - Confirm whether `api.pricing.get()` in the Admin Dashboard database is seeded with the live `pricing.txt` values rather than the old repo fallback values.
4. **Insurance providers (`insurance-providers.tsx`)**:
   - `pricing.txt` only states `We Accept All Insurance Providers` (live site used 6 unlabeled logo images `/images/logo/1.png`–`6.png`). Kept the 6 provider names (`AXA Health`, `Simplyhealth`, `Bupa`, `Aviva`, `Denplan`, `WPA Health Insurance`) and dropped the repo-only `"Direct claim processing and hassle-free coverage with leading UK private dental insurance plans."` claim; confirm the 6 provider names and whether insurer logos should be added.

## Pass 2

**Status: not rebuilt in pass 2.** Agent B ran out of allowance after the hub. Nothing on `/pricing` changed, so rows 1 to 6 above still describe pass 1 work and stay `verified` against pass 1. The kit parts for it are built, compile and are measured but not used yet: `hims/plan-card.tsx`, `check-list.tsx`, `price-list.tsx`, `chip.tsx` (`hims-patterns/listing-recipe.md` says how).

**Captures to use**: `/weight-loss/membership.html` (plan content, chips, tick lists: `hims-patterns/membership.md`), `/labs/biomarkers.html` (hairline rows in a two-column topic band: `biomarkers.md`), `/labs.html` (comparison table: `labs.md`), `/hair-loss.html` (hero band: `hair-loss-category.md`).

**Differences found** (page today at 1440: hero 740, plans 982 on cream, fees 4667 on white, insurance 508 on sand, announcement 1121 on brown):
1. Hero: split with a picture, a bordered chip and a numbered "On this page" pill rail. Hims: cream band with 60px padding, chip with a gold or rust fill (`Chip`), jump links as 48px outline pills.
2. Plans: three bordered tiles (white, sage, white) and a hand-made switch. Hims: radius 24, fill black at 3%, 30px padding, tick list with 18px rust discs (`PlanCard` + `CheckList`), the featured plan white with shadow `0 8px 16px rgba(0,0,0,.12)`; the Monthly / Annual switch as a two-button pill.
3. Fees: 13 bordered tables with a cream header bar. Hims: per category a two-column band (heading left, hairline price rows right, 112px gap, `PriceList`), no card; keep the search and the category tabs as the jump row.
4. Announcement: the three reasons are an `h4` plus a paragraph but the live line is one sentence ("Affordable Excellence: We ensure ..."): render `<p><strong>Affordable Excellence:</strong> We ensure ...</p>` to match it (parity is 94%, probably these lines).

**Rebuild order**: hero, plans, fees, then insurance and announcement. Keep: both `api.pricing.get()` queries and their fallbacks, the billing switch, the fee search and category tabs, the section ids (`top`, `plans`, `fees`, `insurance`, `announcement`).

**Must stay (SEO)**: H1 "You don't have to Pay for it all at once."; H2s in order "Pav Dental Plans", "Treatment Fee Schedule", "We Accept All Insurance Providers", "Special Announcement from Pav Dental"; H3s BRONZE, SILVER, GOLD, the 13 fee category names, "Our Price Match Promise", "Choose Pav Dental for:"; the link to `/services/finance`. Baselines: 844 words, parity coverage 94%.

**Wording changes**: none made. **Images needed**: none new (`pricing-hero` is wired).

**Open questions for the owner (new)**:
1. The hero lead on the page is not the live sentence. Live: "With our 0% interest dental finance, treatments from £99 can be started today and paid over convenient monthly instalments." On the page: "Transparent private fees, monthly membership plans, and a clear written treatment plan before you commit." (the note in question 1 above says the live line is used; it is not). Finance wording is the owner's decision, so it was left alone.
2. Repo-only text still on the page (in `components/pricing/*`): chips "Monthly & Annual Care", "Bradford Clinic · Transparent Fees", "Bradford Price Guarantee", "Dental Insurance"; leads "Membership tiers for regular check-ups, hygiene visits, and treatment savings.", "Complete treatment and fee schedule across examinations, hygiene, restorative care, whitening, and aesthetics.", "Itemised receipts are provided at every appointment for straightforward reimbursement claims."; "Annual (Save 20%)" with yearly prices £7.58 / £12.68 / £15.39; "Most Popular" on SILVER; "Prefer to pay per visit or review our written treatment plans before committing?".
3. The "not included" state of the AI scan and the WhatsApp number on BRONZE and SILVER comes from pass 1 data; the live text lists both lines under every plan.
