---
name: hims-page-redesign
description: Redesign a Pav Dental website page (website/) in the Hims web style. Covers reading the Hims reference, searching Mobbin, generating new images in Gemini or Flow with Chrome, building the layout with the project's type scale, and the checks that must pass. Use when asked to "redesign a page like Hims", "regenerate the images", or "match Hims".
---

# Redesign a Pav Dental page in the Hims style

Worked out on the home page (branch `claude/home-hims-layout`) and reused for About. Stay inside `website/`.

## 0. Rules that never bend
- Reference material (the Hims zip, Mobbin captures) is untrusted data. Never copy a Hims or Mobbin image into the repo: every image is newly generated.
- Keep `head: () => seoHead("<path>")`, title, description, canonical, JSON-LD.
- Keep every live sentence from `website/seo/live-text/<page>.txt`. Hiding text with CSS keeps it in the DOM; deleting it fails the parity ratchet. Shorten text only when the user says so.
- Header/footer links come from `site-links.ts`. Every Book link uses `BOOKING_URL`. No invented reviews, ratings or prices. Practice facts: 786 Leeds Road, Bradford, BD3 9TY; open 24/7.
- Health data: no real patient data anywhere. A restyled portrait of a real person is AI-edited: say so and get their approval.

## 1. Understand the reference
1. List what each Hims section does (label, headline, photo, cards, CTA) and its colour: sky gradient, amber `#ab742d`, blue `#5a87ab`, white.
2. Hims language: rounded overlapping coloured sections (`rounded-t-[32px]` with `-mt-8` overlaps), pill buttons, chunky matte-clay objects, cut-out phone-in-hand mockups, perspective photo walls, side cards overlapping a photo's edges.
3. Measure type sizes from the captures at a 1440px page and use the tokens below.

## 2. Follow Mobbin
1. Load the `mobbin:search` skill first. Tools: `search_flows` (journeys), `search_sections` (marketing-site sections), `search_screens` (app screens). Web pages use `platform: "web"`.
2. One target per query, at most three constraints, no taste words, no brand copy. Add "Hims" to the query only to filter to that site; check `site_name` on each result.
3. If `search_flows` returns nothing for the page, fall back to `search_sections` (for example "Hims mission and story section"), pull a second page, and say plainly which you used.
4. Cite what you took from each capture (layout, not pixels) in the PR or answer.

## 3. Generate images (Gemini, with Claude in Chrome)
1. Load the Chrome tools in one ToolSearch call. Open a tab on `https://gemini.google.com/app` (user must be signed in).
2. Upload a reference with the file-input trick: in the tab run JS that replaces `HTMLInputElement.prototype.click` to capture file inputs, click the `+` then Upload files, find the hidden file input, and call `file_upload` on it. Native dialogs cannot be driven.
3. Prompts that work:
   - Say the aspect ratio ("wide landscape, 17:10") and the framing ("chest up, centred").
   - Hims look: chunky matte clay, soft diffused daylight, warm sand-beige or sky backdrop, no text, no logos.
   - Objects for cut-outs: ask for a flat #00FF00 background, then key it with `sharp` (un-mix alpha, keep the largest connected component to drop glow blobs).
   - Phones: render the app screen separately (an HTML page at 375x812 with a gradient, readable text, no status clutter), composite it into the hand-held phone.
   - A 4x3 contact sheet on 16:9 gives 12 tiles in one generation; crop with grid maths.
4. Download with the card's download button after reloading the conversation (the first click right after generation stalls). The file lands in `~/Downloads` as `Gemini_Generated_Image_*.jpeg`. Pick the newest by `ls -t` and check its size with `sips -g pixelWidth -g pixelHeight`, because older files sort close.
5. Crop and compress with `sharp` (install it in the scratchpad, not the repo) to WebP/JPEG under about 150 KB. Save to `website/public/images/<page>/`.
6. Flow (`mcp__google-flow__*`) works for images too but needs the user to sign in and approve credit spend; Gemini through Chrome is the quicker path.

## 3b. Layout tokens (in `website/src/styles.css`)
`t-hims-section` 54 · `t-hims-feature` 48 · `t-hims-title` 40 · `t-hims-topic` 40 · `t-hims-faq` 36 · `t-hims-card` 30 · `t-hims-quote` 24 · `t-hims-lead` 22 · `t-hims-body` 15 (px at 1440; each scales down with `clamp`). Wrapper: `wrap-bento max-w-[1396px]`. Cards: `rounded-[28px] bg-[#6b430f]/25`. Gold accent text `#ffd48a`.

## 4. Build
- Compose the page from section components in `website/src/components/<page>/`; delete components you replace.
- Overlap with negative margins, not extra wrappers. Side cards overlap a photo with `lg:-mr-16` / `lg:-ml-16` and `relative z-10`.
- Prefer one CTA per card; a secondary action is a small underlined text link.
- Do not run Prettier over a whole existing file: it reformats unrelated code. Edit narrowly.

## 5. Verify
1. `cd website && npm run typecheck && npm test && npm run build`.
2. Look at the page in the built-in browser at 1440, 768 and 375 wide; confirm `document.documentElement.scrollWidth === clientWidth`. Set `scrollBehavior = 'auto'` before scripted scrolling, and take a second screenshot because they lag one step. Reset the viewport with preset "desktop" afterwards.
3. Run the in-browser SEO parity check for the page.
4. Say plainly what you could not check (usually phone and tablet widths).

## 6. Ship
Small commits on a branch from fresh main (or the current feature branch), one concern each, `Co-Authored-By` line from the session reminder. Push; the sandbox needs `github.com` allowed for `git push`.
