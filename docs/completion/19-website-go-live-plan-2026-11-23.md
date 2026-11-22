# Website go-live plan (23 Nov 2026)

**Goal.** Move www.pavdental.com from the live Create React App site to `website/`, with SEO the same or better, every live page and form checked, and the owner's decisions recorded. This extends [`17-website-completion-plan-2026-11-18.md`](17-website-completion-plan-2026-11-18.md); it does not replace it. Decisions are in [`04-decisions.md`](04-decisions.md).

## 1. Where things stand

**Repo (`website/`), from the 18 Nov plan and the code:**

| Area | State |
|---|---|
| A. Every live URL exists | 45 of 47 done. `/services/finance` and `/services/regestration` wait for the owner (decisions 2 and 3). |
| B1. Invented content removed | Done (fake reviews, counters, rating stars, petition signers, "Dr M. Hussain"). Prices, awards and some claims still need owner sign-off (see §4). |
| B2. Port the live copy word for word | **Not done.** Last parity run: home 46%, about 16%, pricing 30%, contact 33%, service pages 0 to 57%. Blog, FAQ, CCTV, services index and team pages are at or above 95%. |
| B2a. Header and footer links | Done. |
| B3. Booking goes to Setmore | Done. Two live pages use other Setmore addresses; they change when ported in B2. |
| B4. Real 404 page | Done. |
| B5. Better than live (one H1, alt text, OG image) | Not done. |
| C. Shop with checkout | Not started, and the owner has not decided whether it launches (see §4, decision S1). |
| D1. Parity check | Built and in CI. Passes with zero failures; the 95% gate is not yet met. |
| D2 to D4. Speed, accessibility, owner review | Not started. |
| E. Switch and watch | Not started. |

**Live site, checked today (23 Nov) in the built-in browser:**

- Reachable. The home page shows the same sections as the baseline: facial aesthetics, accessible smiles (Complete Dental Check-Up £35), emergency dentist (£45 consultation, £90 out of hours), phone 0800 1938 786.
- **`/shop` is "Our Online Shop is Coming Soon!"** with category filters and no products or checkout. The 18 Nov baseline recorded a shop with products and random star ratings. Either the live site changed or the baseline described a page that is not public. Phase C is a launch decision, not just build work.
- `/nope-page-check` shows the branded "404 Page Not Found" text. The 18 Nov baseline says unknown paths return **200** (a soft 404). That must be checked with the HTTP status, not the page text.
- Page titles read back empty through the browser's `document.title`, so titles could not be confirmed this way. Use the snapshot tool (§3, step 2) for titles.

**Could not check today:**

- Direct HTTP checks (status codes, redirects, sitemap, robots.txt, headers) from Bash. The sandbox blocks `www.pavdental.com`. Run them from a normal terminal (commands in §3).
- The `website/` checks. `node_modules` is not installed in this worktree, so typecheck, lint, tests, build and the parity run have not been run here.

## 2. Rules (unchanged from 18 Nov)

1. The live site stays as it is until the switch (Phase E).
2. Same URLs. A moved page gets a 301 via `MOVED_PATHS` in `website/src/lib/seo.ts`.
3. Same titles and descriptions, word for word (`seo.test.ts`). Changing one is the owner's decision.
4. Same words. Port from `website/seo/live-content/`. Fix only clear typos, and list each one in its PR.
5. Every page renders its tags and text on the server. Cart, checkout, order and account pages are `noindex`.
6. App parts are out of scope for now (`/.well-known`, `/reset-password`, `/verify-email`, app booking, team data from the app backend).
7. One concern per PR. Each passes `npm run typecheck`, `npm run lint -- --max-warnings=62`, `npm test` and `npm run build` in `website/`, and merges on green CI.

## 3. Steps

### Step 1: Make the build run here (½ day)

- `cd website && npm ci`, then `npm run verify` and `npm run build`. Record any failures before changing anything.
- Confirm `.env.example` covers every variable the build needs. Do not commit `.env*`.

### Step 2: Re-record the live site and diff it against 18 Nov (½ day)

Run from a terminal outside the sandbox, in `website/`:

```bash
SEO_BROWSER_CHANNEL=chrome npm run seo:snapshot -- --base https://www.pavdental.com --seeds seo/live-seed-paths.json --out seo/live-baseline.new.json --text-dir seo/live-text.new --content-dir seo/live-content --crawl
```

Then compare the new file with `seo/live-baseline.json`: every path's status, title, description, canonical and text hash. Every change is either the live site moving on (tell the owner) or a snapshot quirk. Do not overwrite the baseline until the diff is reviewed.

Also run these from a normal terminal (the status codes must be checked here, not in the browser):

```bash
curl -sI https://pavdental.com/ | head -3          # expect 308 to https://www.pavdental.com/
curl -sI http://www.pavdental.com/ | head -3       # expect 308 to https://
curl -s -o /dev/null -w "%{http_code}\n" https://www.pavdental.com/nope-page-check   # 200 or 404?
curl -s -o /dev/null -w "%{http_code}\n" https://www.pavdental.com/about/           # 200 on live
curl -s https://www.pavdental.com/sitemap.xml | head -c 300
curl -s https://www.pavdental.com/robots.txt
```

### Step 3: Run the parity check on a preview build (1 day)

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173      # second terminal
npm run seo:parity -- --base http://127.0.0.1:4173 --out parity-report.json
```

Record the baseline numbers. The target for the switch is `--min-sentences 0.95`, with no failures.

### Step 4: Port the copy, two or three pages per PR (B2, about 3 to 4 weeks)

Order, by the size of the gap:

1. Home (46%) and the header/footer already in place.
2. About (16%), contact (33%), pricing (30%).
3. Service pages: aesthetics, cosmetic, custom grillz, dentures, emergency dental, general dentistry, oral hygiene, root canal, tooth extraction, virtual dentistry, whitening, mobile dentistry, mouthguards (0 to 57%).
4. Petition and vacancies.
5. Run `--update-ratchet` after each page and commit `parity-ratchet.json`.

For each page: confirm the text against `seo/live-content/<page>.json`, the H1 and H2 structure, internal links and alt text. Fix the gaps the parity run lists in the same PR.

### Step 5: Better than live (B5, one PR)

- One H1 per page (29 live pages have none).
- Alt text on the 105 live images that have none.
- Open Graph image on the main pages.

### Step 6: Forms and data flow (one PR, test on a preview)

Use only `@example.test` addresses and synthetic names. Check:

- Contact, enquiry and petition forms: each sends, shows success only when the save succeeded, and the practice gets the alert email (Postmark, #203). The petition alert is not built yet (decision 12).
- Form validation: required fields, bad email, bad postcode, and the UK-resident tick on the petition.
- No personal data in logs, error messages or the URL query string.
- Setmore booking links land on the right Setmore page for each service (`booking-links.test.ts`).

### Step 7: Cookies, analytics and privacy (one PR)

- GA4 (`G-KZVKDLY449`) does not load before consent. Test in a fresh private window: no GA request before "accept", a request after it.
- Cookie banner: decline is as easy as accept. Check the wording with the owner.
- Privacy policy, cookie policy, terms and complaints pages keep the repo's reviewed text (decision 5). Check the links in the footer work.
- CCTV policy: the £10 fee to see your own footage is removed (decision 6), after a legal check.

### Step 8: Speed, mobile and accessibility (D2 and D3, one PR each)

- Mobile Lighthouse on the home page and three service pages, compared with the live site. The 3D hero stays lazy-loaded. No page slower than live.
- Check at 390 px wide (phone) and 1280 px wide: no horizontal scroll, the 16 px side gutter, the Book button always reachable.
- Keyboard: every link, button and the mobile menu reachable and visible focus.
- Contrast and form labels on the main pages.

### Step 9: Content review (D4, owner)

Send the owner a preview link with a list of the items in §4 that need a decision. The owner signs off on clinical wording, prices, GDC numbers, team details and the awards line.

### Step 10: Shop with checkout (Phase C, required; owner decided 23 Nov)

- **Blocker:** the owner confirms the product list and prices (C1). Load them into the dashboard catalogue; no random star ratings.
- Delivery and returns pages for distance selling (C2), reviewed by a lawyer before the switch.
- Test the full path on a preview: add to cart, checkout, order page, confirmation email. Stripe stays in test mode, with test cards only. Cart, checkout and order pages stay `noindex`.
- Live Stripe keys and the live webhook are added by the owner at the switch (C3). Do not put live keys in the repo or in chat.
- Payment capture and refunds: confirm with the owner before changing how they work (AGENTS.md).

### Step 11: Final checks before the switch

- `npm run verify` green on `main`.
- `npm run seo:parity -- --base <preview URL> --min-sentences 0.95` passes.
- Sitemap: remove `/services/finance` and `/services/regestration` until those pages exist (decision 14), then `npm run seo:sitemap`.
- Owner signed off on §4, including the product list (C1) and shop terms (C2).

### Step 12: Switch (Phase E)

1. Search Console: add DNS verification first.
2. Vercel `pavdental-website` project: `VITE_API_BASE_URL`, `VITE_GA4_ID`. Dashboard: `WEBSITE_ORIGIN=https://www.pavdental.com`, `POSTMARK_SERVER_TOKEN`, `CLINIC_NOTIFICATION_EMAIL`, `DASHBOARD_URL`, Stripe live keys (only if S1 is yes).
3. Run the parity check against the production deployment's own URL. It must pass.
4. Move `www.pavdental.com` and `pavdental.com` to the `pavdental-website` project. Keep the old project for 30 days.
5. After the switch, from a normal terminal:
   - apex and `http://` redirect to `https://www` (308);
   - `/sitemap.xml` and `/robots.txt` are served;
   - an unknown path returns **404** (not 200);
   - `/booking` redirects to Setmore;
   - a test enquiry arrives by email.
6. Watch for four weeks: Search Console coverage, 404s and top queries against the baseline. Judge SEO by Search Console, not Analytics (cookie consent drops Analytics numbers).

**Rollback:** move the domain back to the old project.

## 4. Decisions needed from the owner

| # | Question | Recommendation |
|---|---|---|
| S1 | **Does the shop launch with checkout, or stay "Coming Soon" like the live site?** | **Decided 23 Nov: launch with checkout.** Phase C (Step 10) is required before the switch. |
| 2 | Finance page: publish the live credit wording? | Hold until V12 / D-05 is checked (the practice may not be FCA-authorised to advertise finance). |
| 3 | Registration page: keep the online medical-history form? | No. Use an information page; health data stays out of website forms. |
| 6 | CCTV policy: remove the £10 fee to see your own footage? | Remove it (free under UK GDPR), after a legal check. |
| 7 | `/contact-us` description is the GDPR page's text on live | Fix it; it is the only intended change to a live description. |
| 8 | When to switch, and who holds Vercel and Search Console access | Decide at Step 12. |
| 9 | Five documents the live Practice Policy links to were never on the server | Send the files, or confirm they stay off. |
| 10 | Petition signers: live lists 34 names | Keep the list off the new page. |
| 11 | Patient photos beside the 4 comments on the home page | Leave off unless the commenters agreed to them. |
| 12 | Petition: practice alert email and thank-you to signers | Add the practice alert (a small dashboard change, like #203). |
| 13 | Live footer credits the web agency | Leave out unless the contract needs it. |
| 14 | Sitemap lists two pages that return 404 until built | Leave out until built. |
| P1 | Prices and "Most Popular" badges in pricing tables; NHS band prices; "15+ years" and GDC/CQC statements; "within 24 hours" in form thank-you messages | Owner confirms each in writing, or it is removed. |
| P2 | Awards and claims: "ISO Certified", "Vegan Formula", "4.9 Rating" (removed in B1, check they stay removed) | Do not reinstate without evidence. |

## 5. Risks

| Risk | Protection |
|---|---|
| Live site changed since 18 Nov and the baseline is stale | Step 2 diff before any port |
| A URL is missing after the switch | Parity check fails on any non-200 |
| Unknown paths return 200 on live (soft 404), and the new site returns 404 | Recorded as an intended change; tell the owner before the switch; check the Search Console impact after |
| Words change and rankings move | Word-for-word port; parity gate; four-week watch; rollback |
| Enquiries go unread | Postmark alerts; check settings at Step 12 |
| Invented or unverified claims go live | `invented-content.test.ts`; owner review (Step 9) |
| Personal data in logs or forms | Synthetic data only; check Step 6 |
| Blog cover images disappear | Hosted on the live site's Contentful account; copy locally if the owner wants |

## 6. Done means

- Every step in §3 is done or has a recorded owner decision.
- `npm run verify` and `npm run build` pass on `main`.
- Parity at `--min-sentences 0.95` passes on the production deployment.
- Every §4 decision is recorded in `04-decisions.md`.
