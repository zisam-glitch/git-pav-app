# Agent brief: redesign your pages in the Hims style

You are one of several agents redesigning `website/` (the Pav Dental public site, TanStack Start + Tailwind v4) in the style of Hims, page by page, section by section. The lead agent assigned you a **group** and a list of **pages**. Each page has a tracking file `docs/redesign/website/pages/<slug>.md` listing its sections. Your job: for every section on your pages, find the closest Hims reference, rebuild the section in that style with Pav Dental's own words, look at it next to the reference, fix the differences, and record it.

The owner's words, so you hold the intent: use Hims exactly how they apply it (same colours, fonts, font sizes, transitions, widths); the pages' content and data stay Pav Dental's, taken from the live site; ever so slightly changed wording is fine but the meaning must be the same; take screenshots of the reference and of ours, verify both, fix anything that is not right.

## 1. Read first, in this order

1. `docs/redesign/website/hims-design-system.md`: tokens, type scale, recipes, mapping, rules. **This is the contract.**
2. `website/AGENTS.md` (repo rules for the website) and the root `AGENTS.md`.
3. Your page files in `docs/redesign/website/pages/`.
4. The kit: `website/src/components/hims/*` (Section, Heading, ButtonLink/BookButton/CallButton, Tile/TileLink, Carousel, TrustStrip, FaqList, CtaBand, SplitFeature, Stat, Media) and `website/src/components/ui/button.tsx`. Import with `import { Section, Heading, ... } from "@/components/hims";`.
5. The live words for your pages: `website/seo/live-text/<page>.txt` (what is on www.pavdental.com today).

## 2. What is already running (do not start, stop or change servers)

| URL | What |
|---|---|
| `http://localhost:8180/<route>` | our site, hot reload. Edit files and the page updates |
| `http://localhost:8099/index.html` | the saved Hims homepage with its real CSS (no scripts, so script-loaded images are blank) |

If a server seems down, tell the lead in your report; do not start another.

### Browser protocol (several agents share one browser pane)

- Your first browser action: `mcp__Claude_Browser__tabs_create` and keep the returned `tabId`. Pass that `tabId` on **every** browser call. Never use, navigate or close the tabs `seed` and `tab-1`, or any other agent's tab.
- Set the size per tab with `resize_window` (`tabId`): desktop `1440x900`, phone `390x844`. At the end close your tab with `tabs_close`.
- A screenshot shows only about 800x500 pixels at a time: use `computer` `screenshot` (with `scale`) then `zoom` on a region for detail. To bring a section into view run `javascript_tool` with `document.querySelector(...).scrollIntoView()` or `window.scrollTo(0, y)`. Use `get_page_text` or `read_page` to check words instead of screenshots when you can.
- To measure Hims, run the snippets in section 2 of the design system doc in a tab opened on the capture.

### Mobbin protocol (shared credits: be economical)

- Load the tools once: `ToolSearch` with `select:mcp__ea6c82e2-00d5-46b7-b86f-ad2857da6a21__search_sections,mcp__ea6c82e2-00d5-46b7-b86f-ad2857da6a21__search_screens`. Invoke the `mobbin:search` skill once before your first search and follow its query rules (one section or screen per query, at most three constraints, no style words, no brand words from our side).
- Hims pages: `search_screens` with `platform: "web"`, `mode: "standard"`, `limit` 6 or less, and "Hims" in the query (it filters to Hims), for example "Hims treatment page with how it works steps". Similar looking sections from any site: `search_sections`, `limit` 6 or less.
- Always pass `task_intent: "Redesign a dental practice website in the visual style of Hims (men's telehealth), matching sections page by page."` and `output_destination: "code"`.
- **At most 10 Mobbin calls for your whole group.** Reuse results across sections. Look at the returned images, note the `mobbin_url` of each screen you use in the tracking row. Take structure, proportions, type and spacing from a reference, never its words, products or imagery.
- If a call is refused (credits), stop searching and use the Hims capture and the design doc only.

## 3. Files

**You may edit:** the component files listed in your page files, new files you add in the same component folders (name them `<page>-*.tsx`), the route files of your pages (imports and composition only: never `head`, `seoHead` or `loader`), and your own page tracking files.

**You may not edit (ask the lead in your report):** `website/src/styles.css`, `website/src/components/hims/*`, `website/src/components/ui/*` (except files assigned to you in your page file), `website/src/components/home/{header,footer,cookie-consent,scroll-progress}.tsx`, `website/src/routes/__root.tsx`, `website/src/content/*`, `website/src/lib/*`, `website/seo/*`, any `*.test.*`, `website/public/fonts/*`, `package.json`, `.claude/*`, other agents' files, `docs/redesign/website/tracking.md` and `build-tracking.mjs` (the lead regenerates the rollup).

**Shared things other pages still import:** `home/spotlight.tsx` and `home/reveal.tsx` (do not delete or change their exports; stop using them in your own sections), `ScrollProgress`, `Header`, `Footer`. Do not delete any file: list files that became unused in your report.

## 4. The loop for each section

1. Read the section component and find its words on the live page (`live-text`). Know what it says and what it does (forms, tabs, sliders, toggles must keep working).
2. Pick the reference: the matching section of the Hims homepage capture or the mapping table in the design doc, then one or two Mobbin screens. Write the references into the tracking row (Reference column) as short text and `mobbin_url` links.
3. Rebuild it with the kit and the tokens. Keep the component's export name and props so the page and route keep compiling.
4. Look: screenshot at 1440 and at 390, look at the reference again, and list concrete differences (type size and weight, spacing, radius, colour, alignment, density, image ratio, hover state). Measure from the capture when unsure. Fix and look again. **Up to three rounds per section.**
5. Save the evidence: each screenshot you take is stored by the tool as a file, and its path is printed in the result (`[Image: source: /Users/.../tool-results/mcp-Claude_Browser-blob-....jpg]`). For the **final** look at each section copy that file into the repo with `mkdir -p docs/redesign/website/shots/<page-slug> && cp "<path from the result>" docs/redesign/website/shots/<page-slug>/<NN>-<section>-1440.jpg` (and `-390.jpg` for the phone view; `NN` is the row number in your table). Take the screenshot with the section filling the view (scroll it in first) so the file shows that section. Do not copy Mobbin or Hims reference images into the repo (they belong to others): cite the `mobbin_url` instead.
6. Update the tracking row now (Status `verified`; in the 1440 and 390 columns a link relative to your page file such as `[ok](../shots/<page-slug>/03-hero-1440.jpg)`; Copy `same` or `reworded`; Notes). A section you could not finish is `blocked` with a note.

Work top to bottom in page order. Do the hero of each page first: it sets the look for the rest of the page.

## 5. Content comes from the live site (owner's rule)

The owner: "the content and data should come from the live pavdental.com site". The current components were written before the copy was ported and contain things the live site never said.

- **Live wins.** For each live heading and paragraph of your page (`live-text`), make sure it appears in the redesigned page, **verbatim in body copy** (this also protects the SEO parity score, which measures live-sentence coverage). Where the current component says the same thing in other words, use the live wording.
- **Repo-only facts come out.** Any price, number, statistic, percentage, certification, award, guarantee, comparison, "most popular", or clinical or regulatory claim in the current components that the live page does not show: do not carry it into the redesigned page. Record the exact text and its file under "Open questions for the lead" so the owner can verify it and put it back. If a price is on the live page, use the live price exactly.
- **Repo-only features stay.** Calculators, simulators, forms, tabs, toggles and sliders are features: keep them working, restyled, with the factual text limited to what the live site supports (flag anything else the same way).
- **Skip, never invent.** If the live page has no content for a Hims pattern section (for example a process band), leave that section out. Never write new copy to fill a layout.
- **Ever so slightly reworded is allowed** for headings, button labels and one-line leads, to suit the Hims layout. Keep it short, keep the meaning. Add a row to "Wording changes" in the page file for each change (live wording, new wording, why). Never reword legal text, clinical consent text, GDC numbers, hours or addresses.
- **Leave alone and report:** finance wording (0%, APR, interest-free), "Most Popular", "15+ years" (owner decisions; the lead handles them). Never add ratings, review counts, awards, patient numbers or people.

## 6. Code rules

- Use the tokens and the type classes (`text-hero`, `text-h2`, `text-h2-md`, `text-h3`, `text-h3-md`, `text-h4`, `text-lead`, `text-body`, `text-label`, `text-small`, `text-caption`). No `tracking-*`, no raw hex colours (use `bg-cream`, `bg-brown`, `text-fg`, ...), no `italic`, no `backdrop-blur`, no serif, no gradient text, no `animate-element` entrance blur.
- Widths: `Section` with `width`, or the `wrap`, `wrap-inner`, `wrap-bento`, `wrap-prose` classes. Not `max-w-6xl`.
- Every Book or appointment link is a `BookButton` (or `<a href={BOOKING_URL}>`). Phone numbers come from `PRACTICE_PHONE`/`PRACTICE_PHONE_HREF` (the emergency page may show the live emergency number it already shows).
- No `<Star`, no ratings, no review counts (a test fails on them). No new dependencies. No external image URLs. Local pictures live under `/images/` and `/media/`.
- One `<h1>` per page (the hero). Headings in order. Alt text on every image (empty for decoration). Keyboard reachable, visible focus, labels on every field.
- Images: use `<Media alt="..." ratio="4 / 3" tone="cream" />` until the lead has the picture. Add each wanted picture to "Images needed" in the page file: slot id (`<page>-<name>`), where it is used, aspect ratio, and a prompt for an image generator. Prompts describe atmospheric Hims-style pictures: warm natural light, soft shadows, cream or tinted backgrounds, 3D-render product shots or editorial photography of dental tools, products, clinic interiors, hands and smiles; no text, no logos, no real or named people, no staff, no patient results, no before-and-after. Final file name will be `website/public/images/generated/<slot>.jpg`.
- Format every file you touch: `cd website && npx --no-install prettier --write <files>`.
- Checks before you report (run from `website/`): `npx --no-install tsc --noEmit` (other agents are editing too: ignore errors in files you do not own; if one appears in a file you did not touch, wait a minute and run it again), `npx --no-install eslint <your files>` (no new warnings: the repo is at its warning cap), and `npm test` (all 119 pass).

## 7. Do not

- Commit, push, branch, stash, reset or check out files with git. The lead commits.
- Run `npm install` or change `package.json`.
- Start or stop servers, or edit `.claude/launch.json`.
- Edit outside your files (section 3). If you need a change in a shared file, work around it with a page-local component and describe the need in your report.
- Delete files.

## 8. Final report (under 350 words)

For each page: sections verified / built / blocked, wording changes (count), images needed (count). Then: deviations from the design system and why; requests for shared files (kit gaps, token gaps); patterns you built page-locally that two or more pages will want (so the lead can promote them); files that became unused; invented or unverified content you found; results of tsc, eslint and tests. Be specific and honest: a section marked `verified` means you compared it with the reference at both sizes and fixed the differences.
