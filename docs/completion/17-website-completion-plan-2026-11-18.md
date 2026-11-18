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
| [#209](https://github.com/zisam-glitch/git-pav-app/pull/209) | The six blog posts, with their links and tables | Merged |
| [#211](https://github.com/zisam-glitch/git-pav-app/pull/211) | The live site's documents and team photos | Merged |

**Live URLs covered: 45 of 47** (31 after #206, plus the 8 team profiles and the 6 blog posts). Still to do: `/services/finance` and `/services/regestration`, both waiting for the owner.

## 2. Rules for all remaining work

1. **The live site stays untouched** until the switch in Phase E.
2. **Same URLs.** If a page ever has to move, its old path goes in `MOVED_PATHS` in `website/src/lib/seo.ts`, which sends a permanent (301) redirect.
3. **Same titles and descriptions**, copied word for word in `website/src/lib/seo.ts`. `seo.test.ts` fails if one drifts from the live site, so changing one is the owner's decision. The 11 live pages that had none get new ones written from their own heading and text.
4. **Same words.** The live site is the source of truth for content. Pages are ported word for word from `website/seo/live-content/`, fixing only clear typos (each listed in its PR), and anything `website/` invented is removed. Two exceptions so far:
   - The legal pages (privacy, terms, cookies, complaints) keep the repo's reviewed text, which lists the real data processors (D-24, LG-02).
   - `/gdpr` is not ported. The live page is another practice's template ("Parish Dental", another jurisdiction's law).
5. **Every page renders its tags and text on the server**, with a canonical URL on www. The cart, checkout, order and account pages are noindex.
6. **Skipped for now (app parts):** app links in `/.well-known`, `/reset-password`, `/verify-email`, app booking for mobile and virtual dentistry, and team data from the app backend.
7. **One concern per PR.** Each passes `npm run typecheck`, `npm run lint -- --max-warnings=62`, `npm test` and the build in `website/`, and merges on green CI.

## 3. Remaining work

### Phase A: every live URL exists (2 to go)

| Step | Work | Done when | Needs |
|---|---|---|---|
| A1 Files (done) | The live site's documents and the 8 team photos are copied into `website/public/` at the same paths: 31 documents (7 policies, 17 consent forms, 7 posters) and 8 photos, 12.8 MB in all, checked against checksums in `website/seo/live-files.json`. The live Practice Policy page also links to 5 documents that the live server never had (it answers with its own web page, so those links are dead there): the *Was Not Brought* implementation guide, the consent forms for *Permission to book appointment*, *Photograph usage for teaching* and *Rad exposure on pregnancy*, and the *Hand Hygiene* poster. They are left off the new page until the practice supplies the files. | All 39 files return 200 on a preview; no link on `/practice-policy` is dead | — |
| A2 Team (done) | `/team` lists the 8 people on the live site, and `/team/<slug>` shows each profile with the live title, description, bio and photo. The data is static, not from the app backend. Update the team rule in `website/AGENTS.md`. | 8 profile URLs return 200 with live titles | — |
| A3 Blog (done) | The 6 live posts at `/blog/<slug>`, with their full text, links and tables, listed on `/blog`. The demo articles and their `MedicalScholarlyArticle` markup are replaced with `BlogPosting`. The cover images stay on the live site's Contentful account. | 6 post URLs return 200 with titles | — |
| A4 Finance | `/services/finance`. The live page promotes credit (0% APR, "7.9% APR representative"), but its calculator shows 9.9% APR. | Page live, or a decision recorded | Owner, with V12: the practice is not FCA-authorised to advertise finance (D-05) |
| A5 Registration | `/services/regestration`. The live page collects NHS number, ethnicity and medical and dental history through a third-party form service. | Page live, or a decision recorded | Owner: recommended is an information page (register by phone or in the clinic), with no health questionnaire on the website |

### Phase B: same words, nothing invented

| Step | Work | Done when |
|---|---|---|
| B1 Remove invented content (done) | **Removed:** Dr M. Hussain everywhere. Every invented testimonial (home "Verified patient", aesthetics, emergency, dentures): the home and aesthetics sections now show the live site's own comments, word for word (4 and 3). The petition's 2,418-of-5,000 counter, 32 made-up signers, "BBC/ITV" broadcast and statistics: the page now has the live text, the live YouTube video, and a sign form (name, email, postcode, UK-resident tick) that only says "signed" when the dashboard saved it. The shop's default 4.9 stars and 120 reviews, star rows, rating sorts, `AggregateRating`, the unused static product list and the "SMILE10" hints. The pricing page's "4.9/5.0 (1,200+ Reviews)". The whitening hero, awards ("ISO Certified", "Vegan Formula", "4.9 Rating"), evidence, doctor video and contact sections. The extraction consent video and doctor photo. The petition's signer names are also left out of `seo/live-text/` (personal data). **Left for B2 and C2**, because they go with a page rewrite or need the owner: NHS band prices (oral hygiene, general dentistry, root canal), whitening prices and sections not yet rebuilt (strips £25 here, £65 live), invented finance terms and "Most Popular" badges in pricing tables, GDC/CQC and "15+ years" statements, "within 24 hours" promises in form thank-you messages, and the shop's delivery, returns and guarantee wording (C2). | `src/content/invented-content.test.ts` finds none of the removed items in `website/src` |
| B2 Port the live copy | Home, about, pricing, petition, vacancies, contact and the 13 service pages, two or three pages per PR. The text comes from `seo/live-content/<page>.json` and keeps the new design. | The parity check (D1) finds at least 95% of each live page's sentences on the new page, and the differences are listed |
| B3 Booking (done) | Every "Book" or appointment link (45 links in 36 files, the header's included) goes to Setmore (`BOOKING_URL` = pavdental.setmore.com in `src/lib/enquiry.ts`), as on the live site. `/booking` redirects there (302), and the request form it showed is deleted along with its API call. Two live pages use another Setmore address, and they get it when they are ported in B2: `/services/cosmetic` (`/pav`) and a card on `/services/virtual-dentistry` (`booking.setmore.com/scheduleappointment/...`). | `src/content/booking-links.test.ts` finds no booking link that points anywhere else |
| B4 Not-found page (done) | An address that is no page answers a real 404 and shows a branded page: the header and footer, the pages people most likely want, the Book button and the emergency phone number. The live site answers these with its home page and a 200 (a "soft 404"). The catch-all route `src/routes/$.tsx` throws `notFound()`, and a route that can 404 (blog and team pages) sets its own `notFoundComponent`, because the router skips a child route's head when only the root has one: before this, a blog or team address that did not exist had no `noindex`. | `src/content/not-found.test.ts` checks that every link on the page is a real page; on a preview, 6 unknown addresses return 404 with one title and `noindex` |
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
| D1 Parity check (done) | `website/scripts/seo-parity.mjs` reads the server-rendered HTML of every URL in `seo/live-baseline.json` from a running build and compares status, title, description, canonical, robots, H1 and H2, structured data, internal links, image alt text and how many of the live page's own sentences are present. It fails on a missing page or a changed title, description or canonical, and (the ratchet) on a page that falls behind its recorded coverage. It runs in CI on website PRs. **First run:** 0 failures (every title, description and canonical matches); the live pages' own sentences are 59% present on average, and 13 of 44 pages are at 95% or more (the blog, FAQ, CCTV policy, services index and the team pages). The gap is B2's backlog: the service pages are at 0 to 57%, home 46%, about 16%, pricing 30%, contact 33%. Every page also lacks about 10 internal links that the live footer carries (`/cctv-policy`, `/gdpr`, `/practice-policy`, `/services` and more), one live H2 and one alt text: the footer and header come first in B2. | Zero failures, and every page at 95% or more except the ones in `parity-exceptions.json` (`--min-sentences 0.95`) |
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
| 1 | Copy the live documents and team photos into the website | Done: the owner said yes on 18 Nov (see A1) |
| 2 | Finance page: publish the live credit wording? | Check with V12 first (D-05); hold the page until then |
| 3 | Registration page: keep the online medical-history form? | No: an information page instead, since health data stays out of website forms |
| 4 | `/gdpr` redirects to the privacy policy | Keep |
| 5 | Legal pages keep the repo's reviewed text | Keep |
| 6 | The CCTV policy charges £10 to see your own footage | Remove the fee (free under UK GDPR since 2018), after a legal check |
| 7 | The live `/contact-us` description is the GDPR page's text | Fix it: the only intended change to a live description |
| 8 | When to switch the domain, and who holds Vercel and Search Console access | Decide at Phase E |
| 9 | The live Practice Policy page links to 5 documents that were never on the server (see A1) | Send the files and they will be added back, or confirm they can stay off |
| 10 | The live petition page lists 34 signers by name and date. The new page does not show them, because the names are personal data and the dashboard has no public list | Keep the list off, or import the names with each signer's consent and add a public list endpoint |
| 11 | The live home page shows a small photo beside each of its 4 comments (`/images/testimonials/1.jpg` to `4.jpg`). The new page shows the comments without photos | Copy the 4 photos if they are the commenters' own, with their permission; otherwise leave them off |
| 12 | The live petition form emails the practice for each signature and sends the signer a thank-you. The dashboard only stores a signature | Add the practice alert (a small dashboard change, like #203) |

## 5. Risks

| Risk | What protects against it |
|---|---|
| Rankings move because the words changed | Port word for word; the parity check; four weeks of watching; rollback by moving the domain back |
| A live URL is missing after the switch | The parity check fails on any URL that does not return 200 |
| Enquiries go unread | Postmark alerts (#203); settings checked at the switch |
| Analytics drops after the switch | Expected (consent); judge by Search Console |
| Invented or wrong content goes live | `invented-content.test.ts` (B1) and the live-page tests for ported text; owner review in D4 |
| Blog cover images vanish | They are hosted on the live site's Contentful account, not in the repo. If that account is closed they disappear; copy them locally in a later step if the owner wants that |

## 6. Tools

- Record the live site: `SEO_BROWSER_CHANNEL=chrome npm run seo:snapshot -- --base https://www.pavdental.com --seeds seo/live-seed-paths.json --out seo/live-baseline.json --text-dir seo/live-text --content-dir seo/live-content --crawl` (in `website/`; Chrome cannot start inside a restricted sandbox).
- Rebuild the sitemap after adding a page: `npm run seo:sitemap`.
- Parity check: arrives with D1.
