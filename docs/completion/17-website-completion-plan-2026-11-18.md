# Website completion plan (18 Nov 2026)

**Goal.** Finish `website/` and move www.pavdental.com to it, with SEO "100% the same if not better". The app parts of the website wait until later. The owner's decisions behind this plan are in [`04-decisions.md`](04-decisions.md), under "Owner decisions, 18 Nov 2026 (website)".

**Starting point.** The live site is a separate Create React App build, not `website/`. It sets its titles with JavaScript, has 47 pages, and lists 2 of them in its sitemap. Everything it shows search engines is recorded in [`website/seo/`](../../website/seo/README.md).

## 1. Where things stand

| PR | What it does | State |
|---|---|---|
| [#205](https://github.com/zisam-glitch/git-pav-app/pull/205) | Allowlists the picomatch advisory, which failed CI on every PR | Merged |
| [#201](https://github.com/zisam-glitch/git-pav-app/pull/201) | Records the live site: titles, descriptions, text and links of all 47 pages | Merged |
| [#203](https://github.com/zisam-glitch/git-pav-app/pull/203) | The dashboard emails the practice when a website form comes in | Merged |
| [#202](https://github.com/zisam-glitch/git-pav-app/pull/202) | Live URLs, live titles and descriptions, canonicals, sitemap, robots.txt, redirects | Merged |
| [#204](https://github.com/zisam-glitch/git-pav-app/pull/204) | Every website form sends; real phone, email and hours beside them | Merged |
| [#206](https://github.com/zisam-glitch/git-pav-app/pull/206) | FAQ, CCTV policy, practice documents and services pages; `/gdpr` redirects | Merged |
| [#208](https://github.com/zisam-glitch/git-pav-app/pull/208) | The team page and the eight profile pages | Merged |
| [#209](https://github.com/zisam-glitch/git-pav-app/pull/209) | The six blog posts, with their links and tables | Open; merges on green CI |

**Live URLs covered: 45 of 47** once #209 lands (31 after #206, plus the 8 team profiles and the 6 blog posts). Still to do: `/services/finance` and `/services/regestration`, both waiting for the owner.

## 2. Rules for all remaining work

1. **The live site stays untouched** until the switch in Phase E.
2. **Same URLs.** If a page ever has to move, its old path goes in `MOVED_PATHS` in `website/src/lib/seo.ts`, which sends a permanent (301) redirect.
3. **Same titles and descriptions**, copied word for word in `website/src/lib/seo.ts`. `seo.test.ts` fails if one drifts from the live site, so changing one is the owner's decision. The 11 live pages that had none get new ones written from their own heading and text.
4. **Same words.** The live site is the source of truth for content. Pages are ported word for word from `website/seo/live-content/`, fixing only clear typos (each listed in its PR), and anything `website/` invented is removed. Two exceptions so far:
   - The legal pages (privacy, terms, cookies, complaints) keep the repo's reviewed text, which lists the real data processors (D-24, LG-02).
   - `/gdpr` is not ported. The live page is another practice's template ("Parish Dental", another jurisdiction's law).
5. **Every page renders its tags and text on the server**, with a canonical URL on www. The cart, checkout, order and account pages are noindex.
6. **Skipped for now (app parts):** app links in `/.well-known`, `/reset-password`, `/verify-email`, app booking for mobile and virtual dentistry, and team data from the app backend.
7. **One concern per PR.** Each passes `npm run typecheck`, `npm run lint -- --max-warnings=80`, `npm test` and the build in `website/`, and merges on green CI.

## 3. Remaining work

### Phase A: every live URL exists (16 to go)

| Step | Work | Done when | Needs |
|---|---|---|---|
| A1 Files | Copy the 36 documents (10.7 MB) the live site serves under `/policies`, `/forms` and `/posters`, and the 8 team photos (2.1 MB, `/images/team/1.jpg` to `8.jpg`), into `website/public/` at the same paths. The links on `/practice-policy` and the team photos then work; until then the pages show a placeholder photo and the document links return 404. | All 44 return 200 on a preview | Owner's OK to download them (12.8 MB in all) |
| A2 Team (done) | `/team` lists the 8 people on the live site, and `/team/<slug>` shows each profile with the live title, description, bio and photo. The data is static, not from the app backend. Update the team rule in `website/AGENTS.md`. | 8 profile URLs return 200 with live titles | — |
| A3 Blog (done) | The 6 live posts at `/blog/<slug>`, with their full text, links and tables, listed on `/blog`. The demo articles and their `MedicalScholarlyArticle` markup are replaced with `BlogPosting`. The cover images stay on the live site's Contentful account. | 6 post URLs return 200 with titles | — |
| A4 Finance | `/services/finance`. The live page promotes credit (0% APR, "7.9% APR representative"), but its calculator shows 9.9% APR. | Page live, or a decision recorded | Owner, with V12: the practice is not FCA-authorised to advertise finance (D-05) |
| A5 Registration | `/services/regestration`. The live page collects NHS number, ethnicity and medical and dental history through a third-party form service. | Page live, or a decision recorded | Owner: recommended is an information page (register by phone or in the clinic), with no health questionnaire on the website |

### Phase B: same words, nothing invented

| Step | Work | Done when |
|---|---|---|
| B1 Remove invented content | Dr M. Hussain (whitening hero, video and data; aesthetics testimonials). Whitening badges "ISO Certified", "Vegan Formula", "4.9 Rating", "GDC Certified". Testimonials: home "Verified patient", dentures, aesthetics. The shop's default 4.9 stars and 120 reviews, and the `AggregateRating` built from them. NHS band prices (oral hygiene, general dentistry, root canal). Whitening prices that differ from live (strips £25 here, £65 live). | A test finds none of these in `website/src` |
| B2 Port the live copy | Home, about, pricing, petition, vacancies, contact and the 13 service pages, two or three pages per PR. The text comes from `seo/live-content/<page>.json` and keeps the new design. | The parity check (D1) finds at least 95% of each live page's sentences on the new page, and the differences are listed |
| B3 Booking | Every "Book" button goes to Setmore (pavdental.setmore.com), as on the live site. `/booking` redirects there. | No button points at the old request form |
| B4 Not-found page | A branded page with the header, footer and useful links, still returning 404. | Unknown URLs show it with status 404 |
| B5 Better than live | One H1 on every page (29 live pages have none), alt text on images (105 live images have none), Open Graph image per page where useful. | The parity report shows no page worse than live |

### Phase C: shop with real checkout

| Step | Work | Needs |
|---|---|---|
| C1 Products | Load the live shop's products and prices into the dashboard catalogue, without the live site's random star ratings. | Product list confirmed by the owner |
| C2 Shop terms | Delivery and returns pages for online sales (distance selling). | Legal review |
| C3 Live payments | Stripe stays in test mode until the switch; then the owner adds the live keys and webhook to the dashboard. | Owner, at the switch |

### Phase D: prove it before the switch

| Step | Work | Done when |
|---|---|---|
| D1 Parity check | `website/scripts/seo-parity.mjs` renders every URL in `seo/live-baseline.json` on a target (a local build or Vercel preview) and compares status, title, description, canonical, robots, H1, structured data, live sentences present, internal links and image alt text. It writes a report and fails on a missing URL or a changed title or description. It runs in CI on website PRs. | Zero failures; every difference is on the approved list |
| D2 Speed | Mobile Lighthouse on the home and three service pages, compared with the live site. The 3D hero stays lazy-loaded. | No page slower than live |
| D3 Accessibility | Form labels, contrast and keyboard focus on the main pages. | Checked and fixed |
| D4 Owner review | Clinical wording, prices and team details on a preview. | Owner signs off |

### Phase E: switch and watch

1. **Search Console:** add DNS verification first, so changing the analytics tag cannot lose the verification.
2. **Settings:** on the `pavdental-website` Vercel project, `VITE_API_BASE_URL` (the dashboard) and `VITE_GA4_ID`. On the dashboard: `WEBSITE_ORIGIN=https://www.pavdental.com`, `POSTMARK_SERVER_TOKEN`, `CLINIC_NOTIFICATION_EMAIL`, `DASHBOARD_URL`, and the Stripe live keys.
3. **Final check:** run the parity check against the production deployment's own URL; it must pass.
4. **Switch:** move `www.pavdental.com` and `pavdental.com` to the `pavdental-website` project. Keep the old project for 30 days; rolling back means moving the domain back.
5. **After the switch:** check that apex and `http://` redirect to `https://www` (308, as today), the sitemap and robots.txt are served, unknown URLs return 404, forms send email, and checkout works.
6. **Watch for four weeks:** submit the sitemap in Search Console, then watch coverage, 404s and top queries against the baseline. Judge SEO by Search Console, not Analytics: Analytics only counts visitors who accept cookies, so its numbers will drop.

### Phase F: later (app parts, skipped for now)

App links (Apple Team ID in the `apple-app-site-association` file, and the Android key), `/reset-password` and `/verify-email` for app accounts, team data from the app backend, and booking for mobile and virtual dentistry through the app.

## 4. Decisions needed from the owner

| # | Question | Recommendation |
|---|---|---|
| 1 | Copy the 36 live documents and the 8 team photos (12.8 MB) into the website? | Yes, so the download links and photos keep working |
| 2 | Finance page: publish the live credit wording? | Check with V12 first (D-05); hold the page until then |
| 3 | Registration page: keep the online medical-history form? | No: an information page instead, since health data stays out of website forms |
| 4 | `/gdpr` redirects to the privacy policy | Keep |
| 5 | Legal pages keep the repo's reviewed text | Keep |
| 6 | The CCTV policy charges £10 to see your own footage | Remove the fee (free under UK GDPR since 2018), after a legal check |
| 7 | The live `/contact-us` description is the GDPR page's text | Fix it: the only intended change to a live description |
| 8 | When to switch the domain, and who holds Vercel and Search Console access | Decide at Phase E |

## 5. Risks

| Risk | What protects against it |
|---|---|
| Rankings move because the words changed | Port word for word; the parity check; four weeks of watching; rollback by moving the domain back |
| A live URL is missing after the switch | The parity check fails on any URL that does not return 200 |
| Enquiries go unread | Postmark alerts (#203); settings checked at the switch |
| Analytics drops after the switch | Expected (consent); judge by Search Console |
| Invented or wrong content goes live | Phase B1 test; owner review in D4 |
| Blog cover images vanish | They are hosted on the live site's Contentful account, not in the repo. If that account is closed they disappear; copy them locally in a later step if the owner wants that |

## 6. Tools

- Record the live site: `SEO_BROWSER_CHANNEL=chrome npm run seo:snapshot -- --base https://www.pavdental.com --seeds seo/live-seed-paths.json --out seo/live-baseline.json --text-dir seo/live-text --content-dir seo/live-content --crawl` (in `website/`; Chrome cannot start inside a restricted sandbox).
- Rebuild the sitemap after adding a page: `npm run seo:sitemap`.
- Parity check: arrives with D1.
