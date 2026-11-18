# Pav Dental Website — Impeccable Redesign Plan

**Revision 2, reviewed 18 Nov 2026** against `main` at `cc5dc78` (#217). Revision 1 is in git history; §9 lists what changed. This plan follows the owner's rules in [17-website-completion-plan](17-website-completion-plan-2026-11-18.md) (same words, same URLs, same titles, owner decisions) and the Impeccable new-work flow. [PRODUCT.md](../../PRODUCT.md) was corrected in the same change.

## 0. Verdict

- **Keep:** the brand base (`#925a27`, `#cf9448`); the code-first build path for Persuade pages; the Persuade and Read split for most pages; the parity gate; the Setmore booking rule; GA4 loaded only after consent.
- **Change:** the parity target (44 active pages, not 46); 404 handling (a catch-all route, not `/404`); the skill path; the service count (13 built, 2 blocked); the shop modes; the gold accent rules; one text token that fails WCAG (`--color-subtle`) and one border token too faint to mark a control (`--color-border`).
- **Add:** the owner's own style directives (`website/DESIGN_MEMORY.md`), which revision 1 omitted; the Impeccable steps that make a redesign checkable (direction contract, owner approval of the direction, finish review, `design.json`); the legal and content blockers; the sequencing with the copy-porting plan; the out-of-scope routes; the test and lint gaps.
- **Not yet:** page redesign. Finance wording, the registration form, the CCTV fee and the two unbuilt links are owner or legal decisions (§6). Shared-system work (tokens, buttons, header, footer) can start now.

## 1. What was checked

| Check | Result |
|---|---|
| Fetch `origin` and compare with `main` | `origin/main` = `cc5dc78`; branch at the same commit; no local changes |
| `npm ci --ignore-scripts` in `website/` (npm cache in `$TMPDIR`) | 454 packages installed |
| `npm run typecheck` | exit 0 |
| `npm test` | 119 tests, 119 pass, 0 fail. 15 of the 18 test files are in the script. `scripts/browser-smoke-verdict.test.mjs`, `scripts/preview.test.mjs` and `scripts/with-app-env.test.mjs` are not run |
| `npm run lint -- --max-warnings=62` | exit 0; 62 warnings, 0 errors. The cap is reached, so one more warning fails the check |
| `npm run build` | exit 0; no warnings in the log |
| `npm run seo:parity` | **Not run in this review.** The sandbox refused to bind the preview port (EPERM). Last recorded run (doc 17, D1): 0 failures, 59% average sentence coverage, 44 pages measured |
| Impeccable `context` loader | Ran. No DESIGN.md; `buildPath` = code; the loader reports `WORLD_DISCOVERY_REQUIRED` (a new or replacement world goes through new-work first) |
| Computed contrast of the colour tokens | Python WCAG 2.x formula; script in Appendix B |

The parity check must be run on a machine that can bind a local port:

```bash
cd website && npm ci && npm run build
```

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Run that in a second terminal and leave it running, then:

```bash
npm run seo:parity -- --base http://127.0.0.1:4173
```

## 2. Decision review: is each choice right?

KEEP = the evidence supports it. CHANGE = the evidence points to a different answer. OPEN = the owner has to decide; the evidence is listed.

| # | Choice in revision 1 | Evidence | Verdict |
|---|---|---|---|
| 1 | Brand base `#925a27` and `#cf9448` (binding) | PRODUCT.md, Brand Commitments. `website/src/styles.css:59-61` defines `--color-primary` and `--color-gold` with these values; `website/DESIGN_MEMORY.md:23-24` lists them. Literal hex appears in 106 files under `website/src`. Computed: `#925a27` on white 5.65:1 and white on `#925a27` 5.65:1 (pass); `#cf9448` on white 2.63:1 and white on `#cf9448` 2.63:1 (fail); `#1a1a1a` on `#cf9448` 6.62:1 (pass) | **KEEP** the base. **CHANGE** the rules: gold never carries text on white or white text; dark ink sits on gold; focus rings and text links use `#925a27`. Move the 106 literal files to tokens in batches |
| 2 | "Full redesign" of the visual world | Revision 1 calls it a full redesign. PRODUCT.md brand commitments refer to "the redesigned visual world". No entry in `docs/completion/04-decisions.md` records a redesign (a search for "redesign" in `docs/completion/` finds only this plan) | **OPEN** (§6-7): confirm the owner asked for it and record it in the decision log |
| 3 | Code-first build path | `.impeccable/config.json` sets `buildPath: code` (added in #217). The skill takes the recorded default for Persuade; Operate and Read are code-led regardless (new-work.md, mode-operate.md). init.md Step 5 allows only the owner's answer to be written. No question or answer is recorded in the repo. PRODUCT.md also repeated the value as a brand commitment, which init.md does not allow | **KEEP** for Persuade. **OPEN**: record who answered and when. **CHANGE** PRODUCT.md (done: the duplicate line is removed) |
| 4 | Persuade for marketing, service, pricing, team, contact, about, petition and shop pages; Read for blog, FAQ and policy pages | mode-persuade.md: "the visitor decides and acts". mode-operate.md: "the visitor completes a task". mode-read.md: "the visitor came to understand something". Cart, checkout and order are task surfaces. Team is Persuade in §1 but Read in Phase 4. The live baseline has `/shop` only; the other shop routes are new | **CHANGE**: shop listing and product pages are Persuade; cart, checkout and order are Operate; team is Persuade (one mode, not two). Blog, FAQ and policies stay Read (KEEP). Service pages stay Persuade, with Read sections for FAQ, consent and post-op text |
| 5 | Two equal visitor actions: 24/7 phone and Setmore Book Now | PRODUCT.md "Dual-priority". No owner decision in `04-decisions.md` (a search for "dual", "equal" and "emergency" finds none). The phone number appears on 46 of 47 live pages (`seo/live-text/`). mode-persuade.md asks the opening to expose "a visible primary action" | **OPEN** (§6-6). Recommended: both visible on every page; one primary action per page, phone on emergency pages and Book on routine pages |
| 6 | Booking only through `BOOKING_URL` (Setmore) | `website/src/lib/enquiry.ts` (`BOOKING_URL` = pavdental.setmore.com); `booking-links.test.ts`; `/booking` redirects; website/AGENTS.md: "Do not add a booking form to the site" | **KEEP** |
| 7 | Parity: "47 URLs, 46/46 active" | `seo/parity-exceptions.json` has 7 entries: `/gdpr` (redirect), `/services/finance` and `/services/regestration` (not built), and four legal pages with a lower sentence minimum. 47 − 3 = **44 active**. Doc 17 D1 measures 44 pages | **CHANGE** to "44 active pages; 3 approved exceptions; one H1 and alt text on every image on all 44" |
| 8 | "/404" as a route in the shop flow | There is no `404` route. `website/src/routes/$.tsx` throws `notFound()` for any unknown address and renders `NotFoundPage` with `noindex` (website/AGENTS.md line 23) | **CHANGE** the wording to "the catch-all `src/routes/$.tsx` and `NotFoundPage`" |
| 9 | Counters on the home page | `website/src/components/home/counters.tsx:4-7` shows 2 / 5 / 25+ / 500+ with the labels "Clinicians", "Team members", "Years of care", "Happy patients". The live home (`seo/live-text/home.txt:93-100`) shows the same four figures under "2 Doctors / Dentist", "5 Staffs", "25+ Years of experience", "500+ Happy Patients". The live team has 8 profiles, so "5 Staffs" conflicts with the live team page | **KEEP** only with the live labels, word for word (doc 17 rule 4). **OPEN** the staff figure (§6-5) |
| 10 | Home testimonials | `src/content/testimonials.ts` is ported from the live site (website/AGENTS.md line 20). `invented-content.test.ts` passes | **KEEP** |
| 11 | 3D hero kept lazy-loaded | `components/home/hero-canvas.tsx` lazy-loads `hero-scene` and checks `prefersReducedMotion`. Doc 17 D2: "The 3D hero stays lazy-loaded" | **KEEP**, with a performance budget (§7) |
| 12 | "All 15 service pages" | 13 service pages are routes (`src/routes/services.*.tsx`). `/services/finance` and `/services/regestration` are not built (exceptions; doc 17 A4 and A5). The services index links to both (`src/content/live-pages.ts:324-331`), and `public/sitemap.xml` lists both (lines 27 and 32) | **CHANGE** to "13 built, 2 blocked". Fix the links and the sitemap before the switch (Phase 0) |
| 13 | Shop flow (Phase 4) | Routes exist: `shop`, `shop_.$productSlug`, `category.$slug`, `cart`, `checkout`, `order.$id`. `reset-password` and `verify-email` also exist but are "app parts, skipped" (doc 17 rule 6). Revision 1 did not decide either | **CHANGE**: scope stated explicitly (§4.4) |
| 14 | Header and footer redesign | website/AGENTS.md lines 21 and 23: the footer keeps a plain link to every page; the header's Services menu opens on click, so its links are not in the HTML that search engines read. `site-links.test.ts` passes | **KEEP**, with the constraint that every link stays in the server HTML |
| 15 | Tokens: "shades and tints" | `styles.css:53-64` defines the tokens. Computed: `--color-subtle` `#9a8674` on white 3.48:1 (fails for body text; used as `text-subtle` in 4 files). `--color-border` (18% primary over white) 1.29:1 (fails where it is the only cue for a control; used as `border-border` in 22 files). Body `#2a1c12` 16.49:1, muted `#6b5848` 6.74:1 and button text 5.56:1 pass | **CHANGE**: fix `--color-subtle` and `--color-border` in the first system PR |
| 16 | Owner style rules (not mentioned in revision 1) | `website/DESIGN_MEMORY.md`: no glass or backdrop blur, no italics, no `tracking-*`, no `rounded-2xl` or `rounded-3xl`, `max-w-6xl` sections, header and footer on every page, upright serif titles with a sans body. Current code: backdrop-blur on 22 lines, italic on 6, `tracking-*` on 75, `rounded-2xl`/`rounded-3xl` on 81 | **CHANGE**: pin them in the surface briefs (§4.2) |
| 17 | Command path `.agents/skills/impeccable/scripts/impeccable` | `.agents/skills/impeccable` is not in the repo. The skill runtime runs `.claude/skills/impeccable/scripts/impeccable` from the main checkout. The cached engine (0.1.24) contains `concept-seed`, `surface-brief` and `build-phase` | **CHANGE** the path |
| 18 | Phase 5: DESIGN.md through the "document flow" | new-work.md §5 and §7: a new world writes DESIGN.md at finish through the documenter. document.md: a new world needs DESIGN.md **and** `.impeccable/design.json`, not prose alone | **CHANGE**: documenter and sidecar |
| 19 | Checks: `npm run verify && npm run build`, `seo:parity` | The scripts exist. `verify` runs typecheck, lint (≤62) and test. `npm test` skips 3 of 18 test files. Lint is at the cap. The parity check needs a running build | **KEEP** the commands. **ADD** the 3 skipped tests (Phase 0c) and keep lint from rising |
| 20 | PRODUCT.md "Compliance boundaries": "`/services/finance` carries no unverified APR/credit-broking claims" | Not true at this review: 0% or APR wording is on 11 files (§4.1-1). `04-decisions.md` contradicts itself: D-05 (line 66) says remove the 0% wording; the table at line 124 says use the live wording and check with V12 | **CHANGE** PRODUCT.md (done). **OPEN** §6-1 |
| 21 | PRODUCT.md Principle 1 ("within the first viewport") | init.md: product principles hold no visual recipes | **CHANGE** (done) |

## 3. Impeccable steps revision 1 did not follow

These come from new-work.md and init.md. The plan now includes each one.

1. **Decide what is already true.** DESIGN.md does not exist. This review records the incumbent system (§2 rows 1, 15, 16; §4). Classification: a redesign that replaces the look and keeps product truth and the owner's directives.
2. **Ask what changes the work.** The owner questions are in §6, asked in rounds of at most three.
3. **Concept-seed per surface type, not per site.** Persuade (home, about, pricing, contact, petition, vacancies, services, team), Read (blog, FAQ, policies), Operate (cart, checkout, order). The mode comes from the surface.
4. **Owner approves the direction on the decision page** before any page code is written (`WORLD_DISCOVERY_REQUIRED`).
5. **Surface briefs with the six-block direction contract** (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH), one per route group. The contract is never copied into shipped code, HTML comments, JSON-LD or data attributes.
6. **Code-led contract**: each Persuade surface names its FIRST VIEWPORT and one signature interaction, because the finish review checks behaviour, not only screenshots.
7. **Read `reference/craft-floor.md` before the first UI edit.**
8. **Detector once at finish**: `impeccable detect --json` on the changed files (web).
9. **Finish review** by `impeccable-finish-reviewer` in a fresh context, with one of the four dispositions: ship, fix, rebuild or recapture.
10. **Documenter** writes `DESIGN.md` and `.impeccable/design.json`. If a DESIGN.md already exists, the owner chooses refresh, overwrite or merge first.

## 4. Facts the redesign must respect

### 4.1 Blockers (owner or legal)

1. **Finance wording on 11 files.** 0%, APR and interest-free wording appears in: `components/contact/contact-section.tsx:45`, `components/cosmetic/cosmetic-faq.tsx`, `components/cosmetic/cosmetic-financing.tsx`, `components/cosmetic/cosmetic-hero.tsx`, `components/pricing/pricing-hero.tsx`, `components/pricing/special-announcement.tsx`, `components/root-canal/root-canal-pricing.tsx:69,189`, `components/tooth-extraction/extraction-book.tsx`, `components/tooth-extraction/extraction-pricing.tsx`, `content/live-pages.ts:325` and `lib/seo.ts:132`. Some of it is live copy, which the owner confirmed as real. D-05 says the practice is not FCA-authorised to advertise finance and says to remove the 0% wording (`04-decisions.md:66`). The table at `:124` says to use the live wording and check it with V12. The log contradicts itself, so the owner must settle it (§6-1).
2. **Finance credit notice.** The live finance page names "1 Rose Hill Avenue, Blackburn BB1 1YF", company no. 244415 and "Mars Purifierp" (`seo/live-text/services--finance.txt:324`). D-02 says these do not match Pav Dental and must be corrected with V12 before launch.
3. **Unbuilt pages are still linked.** `/services/finance` and `/services/regestration` are not routes. The services index links to both (`src/content/live-pages.ts:324-331`), and `public/sitemap.xml` lists both (lines 27 and 32). A visitor who clicks either lands on the 404 page.
4. **Registration form.** The live page collects NHS number, ethnicity, and medical and dental history through a third-party form (`services--regestration.txt:14`; doc 17 A5). Recommended: an information page only (§6-3).
5. **CCTV fee.** The live CCTV policy charges £10 to see your own footage (doc 17, decision 6). Recommended: remove after a legal check (§6-4).
6. **Staff figure.** The live home says "5 Staffs" (`home.txt:95-96`); the live team has 8 profiles. The owner must confirm the right figure (§6-5).
7. **Repo-only claims.** "Most Popular" appears in 7 files and "15+ years" in 2 (`components/cosmetic/cosmetic-benefits.tsx`, `components/tooth-extraction/extraction-book.tsx`). Neither phrase is in the live copy. The owner's rule removes repo-only claims unless the owner verifies them.

### 4.2 Owner style directives (pinned)

From `website/DESIGN_MEMORY.md`, which states the owner's core directives:

- **No glass.** No `.glass`, `.glass-dark` or `backdrop-blur-*`. Today: 22 lines use `backdrop-blur`.
- **No italics** on headings or body text. Today: 6 lines.
- **No `tracking-*` utilities.** Today: 75 lines.
- **Corners:** `rounded-md`, `rounded-lg` or `rounded-xl` only. Today: 81 lines use `rounded-2xl` or `rounded-3xl`.
- **Sections:** `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`. Today: 113 files use `max-w-6xl`, so this largely holds.
- **Type:** upright serif for editorial titles (`font-display font-bold`) and sans-serif for body copy.
- **Layout:** the global `<Header />` and `<Footer />` on every page; accessible labels and visible focus and hover states.
- **Palette** (`DESIGN_MEMORY.md:23-32`): primary `#925a27`, gold `#cf9448`, espresso `#2a1c12`, canvas `#fffdf9`, cream `#faf6f0`, borders `#e2d4c0` and `#e8ddd0`.

The Impeccable calibration pushes away from serif display type and italic accents. These are the owner's pins, so the new direction keeps them unless the owner changes them in writing (the brief wins).

### 4.3 Contrast and accessibility (computed in this review)

- **Passes:** body text `#2a1c12` on white 16.49:1; muted text `#6b5848` on white 6.74:1; button text `#fffdf8` on `#925a27` 5.56:1; danger `#b42318` on white 6.57:1; focus ring `#925a27` on white 5.65:1.
- **Fails:** `--color-subtle` `#9a8674` on white is 3.48:1. Body-size text needs 4.5:1. Used as `text-subtle` in 4 files.
- **Fails:** `--color-border` on white is 1.29:1. WCAG 1.4.11 needs 3:1 where a border is the only cue for an input or button. Used as `border-border` in 22 files.
- **Fails:** gold `#cf9448` as text or as a focus ring on white is 2.63:1. Dark ink `#1a1a1a` on gold passes at 6.62:1.
- **Moving content:** `marquee` appears in 3 files. WCAG 2.2.2 needs a pause control for content that moves for more than five seconds.
- **Reduced motion:** checked in 3 files (`prefersReducedMotion`).
- **Typeface:** `You_Sans` is declared in `styles.css` with 6 woff2 files in `public/`. The repo has no licence note for it (a search of `docs/` and `website/public` found none). Confirm the licence and whether the face is a brand asset before any type change (§6-9).
- **Consent:** GA4 loads only when the stored consent is `accepted` (`website/src/lib/analytics.ts`, `shouldLoadAnalytics`). The word "consent" appears in 13 files under `website/src`, so the banner's code path needs a check during the redesign. The redesign restyles the banner and keeps its behaviour.

### 4.4 Scope and inventory

- **Live baseline: 47 pages** (`seo/live-baseline.json`): 8 team profiles, 6 blog posts, and `/shop` as the only shop page.
- **Not live, so no parity baseline and not among the 47:** `/cart`, `/checkout`, `/order/$id`, `/category/$slug`, `/shop/$productSlug`. Also `/booking` (a redirect to Setmore), and `/reset-password` and `/verify-email` (app parts, skipped under doc 17 rule 6).
- **Redirect:** `/gdpr` goes to `/privacy-policy` (`src/lib/seo.ts:373`). Not a design surface.
- **Legal pages** keep the repo's reviewed text (`parity-exceptions.json`). Restyle their layout only.
- **Built service pages:** 13, plus the hub.

## 5. Revised plan

Rules for every phase: one concern per PR (website/AGENTS.md; doc 17 rule 7); CI runs the parity check on website PRs; copy is ported before a page is restyled (doc 17 B2 is the source of the words).

### Phase 0: clear the blockers (no visual change)

- **0a.** Remove `/services/finance` and `/services/regestration` from `public/sitemap.xml` and from the generator until the pages exist.
- **0b.** Take the two links out of the services index, or hold them behind a decision (§6-3).
- **0c.** Wire `scripts/browser-smoke-verdict.test.mjs`, `scripts/preview.test.mjs` and `scripts/with-app-env.test.mjs` into `npm test`. If one fails, fix the code or the test. Never delete a test (root AGENTS.md).
- **0d.** Remove "Most Popular" and "15+ years" unless the owner verifies them. Add a test that fails on both, since `invented-content.test.ts` does not cover them.
- **0e.** Record the owner's decisions in `docs/completion/04-decisions.md`, resolving the D-05 contradiction.
- **0f.** Record a baseline Lighthouse run (mobile, home and three service pages) so the speed gate in Phase 4 has a number to beat.

### Phase 1: direction (no code)

- Ask the §6 questions in rounds of at most three.
- Run concept-seed once for each surface type: Persuade, Read and Operate (§3, step 3).
- The owner chooses the direction on the decision page. No page code is written before that.
- Write one surface brief per route group under `.impeccable/surfaces/`, each with the six-block direction contract.
- Write the §4.2 directives and the §2 row 1 palette rules into the briefs as pins.

### Phase 2: shared system (first code PRs)

- **Tokens:** fix `--color-subtle` and `--color-border` (§4.3). Set the gold-accent rules. Move the 106 files that hard-code `#925a27` or `#cf9448` to tokens, in batches.
- **Shared components first:** the phone and Book buttons, cards, inputs (borders at 3:1), focus rings, header, footer, consent banner, and `NotFoundPage`.
- **Header and footer:** every link stays in the server HTML. A mobile drawer may hide links visually but keeps them in the DOM.
- **Gate:** typecheck, test, lint (count does not rise), build, and the contrast script (Appendix B) passes for every token pair used for text.

### Phase 3: pages (copy first; restyle a page only after its copy reaches the parity target)

- **Batch 1, Persuade:** `/`, `/about`, `/pricing`, `/contact-us`, `/petition`, `/vacancies`.
- **Batch 2, Persuade services:** `/services` and the 13 built service pages, in four PRs of three or four pages.
- **Batch 3, team and blog:** `/team` and its 8 profiles (Persuade); `/blog` and its 6 posts (Read).
- **Batch 4, Read:** `/faq`, `/practice-policy`, `/cctv-policy`, `/privacy-policy`, `/terms-and-condition`, `/cookie-policy`, `/complaints-policy`.
- **Batch 5, shop (new pages, no parity baseline):** `/shop` and product pages (Persuade); `/cart`, `/checkout`, `/order/$id` (Operate). Start only after the owner decides shop terms (doc 17 C2) and the product list (doc 17 C1).
- **Every page PR:** screenshots at 390, 1280, 1440 and 1600 wide; keyboard pass; reduced-motion check; forms tested for labels, error messages and the "saved" message, which appears only after the server saves.

### Phase 4: finish

- `impeccable detect --json` once on the changed files.
- `impeccable-finish-reviewer` in a fresh context, with the direction contract, screenshots and the quality bar. Two review rounds at most, then the owner decides.
- `impeccable-documenter` writes `DESIGN.md` at the root and `.impeccable/design.json`.
- Local parity: `npm run build`, `npm run preview`, then `npm run seo:parity -- --base <url> --min-sentences 0.95`. Target: all 44 active pages at 95% or more, with the three approved exceptions unchanged.
- Owner review (doc 17 D4): clinical wording, prices and team details.

### Phase E: switch

Doc 17, Phase E, unchanged.

## 6. Owner decisions

Ask before the matching work starts. Each row names the evidence.

| # | Decision | Options | Recommendation | Evidence |
|---|---|---|---|---|
| 1 | Finance wording (0%, APR, 7.9%) | (a) remove everywhere until V12 and the FCA position are settled; (b) keep the live wording with V12 approval | (a), the conservative choice. D-05 itself says to remove the 0% wording | `04-decisions.md:66` and `:124`; the 11 files in §4.1-1 |
| 2 | Finance credit notice (registered office, company number, trading name) | correct with V12 before launch; keep as is | correct before launch | D-02 (`04-decisions.md:63`); `services--finance.txt:324` |
| 3 | Registration page | information page only; keep the online health form | information page only | doc 17 A5; `services--regestration.txt:14` |
| 4 | £10 fee for CCTV footage | remove; keep | remove, after a legal check | doc 17 decision 6 |
| 5 | Staff figure on the home page | 5; 8; other | confirm the fact before the counters ship | `home.txt:95-96`; the 8 live team profiles |
| 6 | Phone and Book prominence | equal, with no primary; one primary action per page | one primary per page; both visible on every page | PRODUCT.md (no decision-log entry); mode-persuade.md |
| 7 | Redesign request | confirm it; or refinement only | confirm and record in `04-decisions.md` | §2 row 2 |
| 8 | Owner style directives | keep as binding; change in writing | keep | §4.2 |
| 9 | Typeface `You_Sans` | keep; replace | confirm the licence first | `styles.css` font-face declarations; no licence note in the repo |
| 10 | Footer credit to the web agency | leave out; keep | leave out unless the contract requires it | doc 17 decision 13 |
| 11 | Testimonial photos (4) | copy with permission; leave off | leave off unless permission is confirmed | doc 17 decision 11 |
| 12 | Petition: practice alert and signer list | add the alert; keep the list private | add the alert (like #203); keep the list private | doc 17 decisions 10 and 12 |
| 13 | Accessibility standard | WCAG 2.2 AA; other | WCAG 2.2 AA (PRODUCT.md proposes it) | `docs/redesign/design-system.md` (the app claims AA) |
| 14 | Shop star ratings | none; keep the live random stars | none | owner's memory: the live stars come from `Math.floor(2*Math.random())+4` |
| 15 | `reset-password` and `verify-email` | out of scope now; in scope | out of scope (doc 17 rule 6) | doc 17 rule 6; not live pages |

## 7. Acceptance criteria

**Every PR**

- `cd website && npm run typecheck && npm test && npm run lint -- --max-warnings=62 && npm run build` passes, and the lint count does not rise.
- No new matches for `backdrop-blur`, `tracking-`, `rounded-2xl`, `rounded-3xl` or `italic` (outside quoted text).
- No new 0%, APR or interest-free wording outside the decided pages.
- Gold `#cf9448` is not used for text.

**Accessibility**

- Body and small text at 4.5:1 or more. Large text, control borders and focus rings at 3:1 or more.
- Every control reachable by keyboard, with a visible focus ring.
- Moving content has a pause control. `prefers-reduced-motion` is respected.
- Every form control has a visible label. Errors appear next to the field. "Saved" appears only after the server saves.

**SEO and copy**

- Title, description and canonical unchanged. One H1. Alt text on every image.
- Sentence coverage not below `seo/parity-ratchet.json`. Run `--update-ratchet` only when a page improves.
- Every header and footer link is in the server HTML (`site-links.test.ts`).

**Layout and speed**

- No horizontal scroll at 390 wide. Checked at 390, 1280, 1440 and 1600.
- Mobile Lighthouse for the home page and three service pages is no slower than the baseline recorded in Phase 0f.

**Finish**

- Finish review disposition `ship`. Documenter outputs present. Owner review (doc 17 D4) done.

## 8. Risks

| Risk | What protects against it |
|---|---|
| Pages redesigned before their copy is ported, so the work is done twice | Copy first, per batch (§5, Phase 3) |
| Finance wording ships without the owner or V12 decision | §6-1 and §6-2 before any shop or pricing PR |
| Lint is at the cap, so any new warning blocks CI | Keep the count; reduce it in shared components first |
| Owner directives drift back in quietly | The grep checks in Appendix C on every PR |
| Tests miss unverified claims: `invented-content.test.ts` does not catch finance wording, "Most Popular" or "15+ years" | Phase 0d adds the check |
| Parity was not run in this review | The owner runs it locally (§1); CI runs it on website PRs |
| Speed regression on mobile | Phase 0f baseline, then the Phase 4 gate |

## 9. Changes from revision 1

1. Parity target: "46/46 active" becomes "44 active, 3 approved exceptions".
2. "/404" becomes the catch-all route `src/routes/$.tsx` and `NotFoundPage`.
3. The command path becomes `.claude/skills/impeccable/scripts/impeccable`.
4. "15 service pages" becomes 13 built and 2 blocked, with the link and sitemap problems called out.
5. Shop modes split into Persuade (listing) and Operate (cart, checkout, order). The team mode is resolved as Persuade.
6. The counters stay only with the live labels, and the staff figure goes to the owner.
7. Added: the owner's style directives, the contrast rules, the accessibility standard, the two failing tokens.
8. Added: the Impeccable steps (§3), including the direction contract, owner approval of the direction, the finish review, `design.json` and the detector.
9. Added: blockers (§4.1), out-of-scope routes (§4.4), sequencing with doc 17 (§5), test and lint gaps (Phase 0c, Phase 2).
10. Phases now have gates and acceptance criteria (§5, §7).

## Appendix A: commands run in this review

- `git fetch origin`; `git rev-list --left-right --count HEAD...origin/main` gave `0 0`.
- `npm ci --ignore-scripts`, `npm run typecheck`, `npm test`, `npm run lint -- --max-warnings=62`, `npm run build`: results in §1.
- `npm run seo:parity`: not run (EPERM on the preview port).
- Inventory from `seo/live-baseline.json`: 47 pages; team profiles 8; blog posts 6; shop pages `/shop` only; `/gdpr`, `/services/finance`, `/services/regestration` present.

## Appendix B: contrast script

```python
def lum(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])

def contrast(a, b):
    hi, lo = sorted([lum(a), lum(b)], reverse=True)
    return (hi + 0.05) / (lo + 0.05)

print(round(contrast('#9a8674', '#ffffff'), 2))  # 3.48: fails body text
print(round(contrast('#cf9448', '#ffffff'), 2))  # 2.63: fails text and control boundaries
print(round(contrast('#1a1a1a', '#cf9448'), 2))  # 6.62: passes
```

## Appendix C: owner-directive checks

Run these from the repository root. Each should return no lines once the redesign is done.

```bash
grep -rln "backdrop-blur" website/src
```

```bash
grep -rn "tracking-" website/src
```

```bash
grep -rln -E "rounded-(2|3)xl" website/src
```

```bash
grep -rn -E "italic" website/src | grep -v "not-italic"
```

```bash
grep -rlE "0% ?(APR|interest|finance|Finance)|0%.{0,12}finance" website/src
```
