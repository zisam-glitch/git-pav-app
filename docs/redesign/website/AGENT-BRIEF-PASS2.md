# Agent brief, pass 2: match the real Hims pages

Read [AGENT-BRIEF.md](AGENT-BRIEF.md) (the pass 1 contract) first, then this file, then [hims-design-system.md](hims-design-system.md). Where this file and the pass 1 brief differ, **this file wins**.

## Why a second pass

Pass 1 (merged to `main`, #219) redesigned all 25 pages from the saved Hims **homepage** and Mobbin screens. The owner has now saved twelve more real Hims pages and asked, again, for the whole site to be rebuilt so that **every component is like Hims**, with **content only from the live site**, **pictures from Google Flow** and **SEO exactly unchanged**. So your job is fidelity: bring each of your pages up to the real Hims page of the same type, section by section. Do not rework what already matches; do rebuild what does not.

## The references: every saved Hims page is served on :8099

Scripts are stripped from the saved pages, so layout and the real Hims CSS render but **pictures are blank** (ignore that, never try to fix it).

| Hims page type | URL on :8099 |
|---|---|
| Home | `/index.html` |
| Category (list of treatments) | `/hair-loss.html` |
| Condition landing page | `/testosterone.html` |
| Product detail page (PDP) | `/hair-loss/minoxidil.html`, `/weight-loss/wegovy-pill.html` |
| Membership / plans | `/weight-loss/membership.html` |
| Labs category | `/labs.html` |
| Biomarker tiles | `/labs/biomarkers.html` |
| About / clinical excellence | `/about/clinical-excellence.html` |
| Benefits | `/benefits.html` |
| Blog index, all articles, article | `/blog.html`, `/blog/all.html`, `/blog/how-long-before-minoxidil-starts-working.html` |

Take structure, proportions, type, spacing, colour and behaviour. **Never** take Hims' words, pictures, logos, ratings, review counts, prices, results or clinician names, and never copy a Hims image or screenshot into the repo.

Section outline of any capture (run in a tab opened on it; the homepage snippet in the design doc only fits the homepage):

```js
(() => { const root = document.querySelector('main') || document.body; const out = []; const walk = (el, d) => { if (d > 3) return; for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.height < 100 || r.width < 300) continue; const cs = getComputedStyle(c); out.push('  '.repeat(d) + c.tagName.toLowerCase() + '.' + String(c.className).split(' ')[0].slice(0, 40) + ` [y${Math.round(r.top + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}] bg=${cs.backgroundColor} pad=${cs.paddingTop}/${cs.paddingLeft}`); walk(c, d + 1); } }; walk(root, 0); return out.join('\n'); })()
```

The "every distinct text style" and "one element" snippets in the design doc work on every capture.

## For each of your pages

1. Open our page (`http://localhost:8180/<route>`) and the matching Hims page in two tabs of your own. At 1440x900 and 390x844 list the differences: section order, component anatomy, widths, type sizes and weights, spacing, radii, colours, hover and motion, density, image ratios. Where the live Pav page has the content for a Hims section, follow Hims' order and anatomy. Where it does not, **skip the section; never write copy to fill a layout**.
2. Rebuild only the sections that differ materially. Keep export names and props so routes keep compiling. Keep features working (forms, tabs, calculators, sliders, toggles).
3. Measure when unsure; do not guess a value you can read from the capture.
4. Mobile matters as much as desktop: no horizontal scroll at 390px, touch targets 44px+.

## SEO must stay 100% the same (hard rules)

The owner's words: "all the SEO should retain 100% the same". The site's title, description, canonical, structured data, headings, links and text are measured against the recorded live site and against a saved copy of the site as it is today.

- **Never edit** a route's `head`, `seoHead`, `noindexHead` or `loader`, `src/lib/seo.ts`, anything about structured data, `website/seo/*`, `src/content/*` or any test.
- **H1**: the same words, exactly one per page. **H2**: every H2 the page has now stays, same words, same order (you may restyle it). New headings (card titles, step titles) are fine as H3 or lower, but never an extra H1 and never a heading that skips a level.
- **All words render on the server.** Content that a script mounts later (a `useEffect`, a lazy or client-only component, a carousel that renders slides after hydration, an accordion that unmounts closed answers, a drawer that is not in the HTML) is invisible to a crawler. Keep every live sentence in the server HTML; hide closed things with CSS or `inert`, never by not rendering them. Every live sentence stays **verbatim** in body copy.
- **Links**: every internal link the page has now stays (header, footer and in-page). Images keep their alt text; decorative images get `alt=""`; every picture has `width`/`height` or an aspect-ratio box.
- **Check before you report** (both from a tab of your own that is on `http://localhost:8180/...`; use `localhost`, never `127.0.0.1`, because the saved baseline lives in that origin's localStorage):
  ```js
  const f = await import('http://localhost:8099/parity/fingerprint.js');
  await f.compare({ only: ['/your', '/routes'] })          // against the site as it was before pass 2
  const r = await import('http://localhost:8099/parity/runner.js');
  await r.run({ only: ['/your', '/routes'] })              // against the recorded live site
  ```
  **Never call `f.save(...)`**: it would overwrite the baseline every agent compares against (only the lead saves it). `FAIL` lines in the fingerprint output are never acceptable: fix them. Each `WARN` (a heading, link, alt text or a tenth of the words went missing) must be fixed or explained in your report. The parity runner's coverage for your pages must not fall below the saved baseline in `/private/tmp/claude-501/-Users-hhello-Documents-projects-git-pav-app--claude-worktrees-pull-latest-version-c95b98/095e3b3f-dbb6-49ef-9f06-fb1a4cfb0650/scratchpad/parity-before.txt` (read it for your pages' lines).
- Hims pages carry ratings, review counts, results, prices and clinician names. Pav never invents any of those: skip the section.

## Kit rules (changed from pass 1)

- You **may add new files** in `website/src/components/hims/` for a Hims pattern the kit lacks. Run `ls website/src/components/hims` right before you create one (other agents add files at the same time), use a kebab-case name that describes the pattern (`steps.tsx`, `plan-card.tsx`), one pattern per file, a JSDoc header with the props and the Hims reference (capture and what you measured). **Import new kit files by direct path** (`@/components/hims/steps`). Do not edit `hims/index.ts`, existing kit files, `styles.css`, `ui/*`, the header, footer or `__root.tsx` (the lead owns them): build a wrapper in your own file and list the request in your report.
- A missing token: use a Tailwind arbitrary value with a comment `/* token-request: <what> */` and list it in your report; the lead promotes it.
- **Pattern sheets**: for each capture you measure write `docs/redesign/website/hims-patterns/<capture-name>.md` (at most 120 lines, create the folder if it is missing): sections in order with y, size, background and padding; the anatomy of each component with measured values (type, spacing, radius, colour, hover, motion); which Pav content maps to which section; which kit file implements it. Numbers and structure only: no Hims words, no images. Agents in the next wave read these instead of measuring again. Do not edit another agent's sheet.
- A **recipe** for your page family if you are the first to build it: `docs/redesign/website/hims-patterns/<family>-recipe.md`, 40 to 80 lines: section order for a Pav page of that kind, which kit component carries which kind of content, the traps you hit.

## Images

Do not generate, download or fetch any picture. Pictures already wired stay wired. For a new picture use `<Media alt="..." ratio="4 / 3" tone="cream" />` and add a row to "Images needed" in your page file (slot id `<page>-<name>`, where it is used, aspect ratio, a prompt for Google Flow: Hims look, warm natural light, soft shadows, cream or tinted background, 3D-render product or editorial still life of dental tools, products, a clinic interior, hands or a smile, no text, no logos, no real or named people, no staff, no patient results, no before and after). The lead generates the pictures in Google Flow and wires them.

## Tracking

Keep the `tracking.md` rows true: re-verify a row you changed and set its Reference column to the capture you used. At the end of each of your page files add a section `## Pass 2` with: the capture used, differences found, sections rebuilt, wording changes (live wording, new wording, why), images needed, open questions for the owner. Do not run `build-tracking.mjs` (the lead does).

## Decisions after wave 1 (these win over the sections above)

- **Repo-only headings and text.** A heading or paragraph that the current page has but the live page does not (check `website/seo/live-text/<page>.txt`) is repo-only. If it makes a claim (regulatory, clinical, awards, numbers, guarantees, "24/7 support", a price the live page lacks) it comes out, and the fingerprint will WARN about it: list each one in your report. If it is harmless wording (a call-to-action heading, a step title that paraphrases a live answer) keep it so SEO stays identical. A heading that is on the live page always stays.
- **Pictures that are the only content of a link** (service tiles, product cards) need real alt text naming the subject, not `alt=""`; only purely decorative pictures get an empty alt. Wave 1's hub tiles use `alt=""` and add a parity alt note: fix it when you touch them.
- **Browser.** Pass `tabId` on every action inside `browser_batch` (an action without it ran on another agent's tab twice). Emulated viewport sizes reset after each `navigate`: set them again. `/about/clinical-excellence.html` is an empty shell (the real page draws itself with a script that is stripped here): read `hims-patterns/clinical-excellence.md` instead.
- **Kit.** Wave 1 added about 29 files to `components/hims/`: read their JSDoc headers and the `hims-patterns/*-recipe.md` files before building anything similar, and reuse them. The lead exports them from `index.ts` and promotes the token requests (`text-display-s`, `text-display-m`, `text-lead-l`, band padding, card shadows).
- **Left by wave 1:** `/about` beyond its hero, `/vacancies`, `/petition`, `/pricing`, `/shop`, the product page and `/category/$slug` (it renders API products only; fall back to `getCatalogProductsByCategory(slug)`), and the other twelve service pages (follow `treatment-page-recipe.md`).

## Pacing (the owner's plan has a limited allowance)

Save as you go: the tree must compile after each section, because a run can be cut off without warning. At most two look-and-fix rounds per section. Prefer measurements (`javascript_tool`, `get_page_text`) to screenshots; screenshots at `scale: 0.5` and then `zoom` on a region. Do not read whole large files when `grep -n` finds the part you need. If you run low on budget, stop and report what is done and what is left.

## Browser etiquette

Your first browser action is `tabs_create`; keep its `tabId` and pass it on every browser call. Never touch the tabs `seed` and `tab-1` or another agent's tab. `resize_window` per tab. Close your tabs at the end. Use `http://localhost:8180/...` for our site and `http://localhost:8099/...` for the captures.

## Checks and "do not" (unchanged from pass 1, restated)

From `website/`: `npx --no-install tsc --noEmit` (it passes today; ignore an error in a file you do not own and try again in a minute, other agents are editing), `npx --no-install eslint <your files>` (no new warnings), `npm test` (all 121 pass), `npx --no-install prettier --write <your files>`. Never commit, push, branch, stash, reset or check out with git (the lead commits). No `npm install`, no `npm run build`, no starting or stopping servers, no `.claude/*` edits, no deleting files (list files that became unused). Content rules from pass 1 section 5 still apply in full (live wins, repo-only claims out and listed, finance wording and "Most Popular" left alone and reported).

## Final report (under 350 words)

Per page: differences found, sections rebuilt, sections left alone and why, wording changes (count), images needed (count). Then: the result of the fingerprint compare and the parity run for your pages (paste the summary lines and every WARN); kit files you added (name, one line); requests for shared files and tokens; files that became unused; invented or unverified content you found; tsc, eslint and test results.
