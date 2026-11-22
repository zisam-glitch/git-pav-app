# Design audit brief (read only: do not change code)

Goal: find every visual and structural problem on the Pav Dental site (`website/`) compared with the real Hims site, so a plan can fix all of them. You only look and write; you change no code, run no git, start no servers.

## What counts as a problem (check every item on every page, at 1440 and 390 px wide)

1. **Invented layout**: a section or component that Hims has no equivalent of (Hims uses: category card rows, tall rounded colour bands with a photo, product/treatment cards, plan cards, numbered steps, FAQ accordions, review rows, closing band, big footer). Name what Hims would use instead.
2. **Wrong or irrelevant pictures**: anything not clearly dental (spa, jewellery, generic interiors, wrong subject for its heading), pictures repeated on one page, pictures too soft or too small for their box, a picture whose subject contradicts its caption.
3. **Missing or empty pictures**: blank cream or grey boxes, broken images, lazy images that never load, empty brown/dark boxes, placeholders.
4. **Seams and gaps**: strips of a different colour between sections, white gaps, overlapping rounded corners, sections that touch or float wrongly (example reported by the owner: the footer shows a dark navy band, then a white gap, then a black rounded card overlapping it).
5. **Type mismatch**: heading sizes, weights and spacing different from the Hims scale (`docs/redesign/website/hims-design-system.md`), text too small, bad line length, text overflowing or clipped, widows.
6. **Spacing and alignment**: inconsistent section padding, content not on the 24 px gutter / 1392 px width, things off-centre, cards of unequal height.
7. **Colour mismatch**: colours outside the Hims palette, low contrast, banding, bad dark-on-dark.
8. **Components that do not match Hims**: buttons, pills, cards, accordions, carousels, forms, tables whose shape, radius, hover or size differ.
9. **Mobile (390 px)**: sideways scroll, overlap, tap targets under 44 px, stacked order wrong, hidden content.
10. **Content problems**: repeated blocks, text that is placeholder or repo-only (claims the live site lacks), headings that do not match their content.
11. **Accessibility and performance basics**: missing alt text, empty links, pictures over 160 KB, no width/height.

## How to work

- Reference images (view with Read). Library root: `/private/tmp/claude-501/-Users-hhello-Documents-projects-git-pav-app--claude-worktrees-pull-latest-version-c95b98/095e3b3f-dbb6-49ef-9f06-fb1a4cfb0650/scratchpad/capture-library`
  - Our pages before the latest changes: `04-pav-current-site-full/<page>.jpg` (full-page shots, reduced scale).
  - Real Hims: `01-hims-live-urlbox-fullpage/<page>.png` (large; view the page you need), `01-hims-live-site-full/<page>/*.jpg` (zoomed-out frames), `02-mobbin-hims/pull-*/` (JPG screens), `03-hims-saved-zips/`.
- Live checks with the Browser tools (`mcp__Claude_Browser__*`): our site at `http://localhost:8180/<route>`, saved Hims at `http://localhost:8099/<page>.html` (pictures blank there). First action `tabs_create`; pass `tabId` on every action in `browser_batch` (max 25 actions); resize with `resize_window` (reset to desktop at the end); close your tabs. Servers are already running: if a page does not open, retry once, then say so in the report.
- Prefer `javascript_tool` measurements (getComputedStyle, getBoundingClientRect, image `naturalWidth`, `complete`) to screenshots. Use full-page tall screenshots (`resize_window` 1440 x 5200, then `computer` screenshot at scale 0.4) to see whole pages.
- Test pictures: list every `<img>` on the page with `src`, rendered size, `naturalWidth`, `complete`, `alt`, and look at the ones that look wrong.

## Output: one markdown file per agent, written as you go

Write to the path your task gives you. One table per page, then a short page summary. Columns exactly:

| ID | Severity | Page / section | What is wrong | Evidence | Hims reference | Fix | Effort |

- **ID**: your prefix + number (for example `S-014`).
- **Severity**: `P1` breaks the page or looks plainly wrong, `P2` clearly off from Hims, `P3` polish.
- **Evidence**: a measurement or a file name (for example `04-pav-current-site-full/services-dentures.jpg`, "second tile naturalWidth 0").
- **Fix**: one concrete change in plain words, naming the component file if you know it.
- **Effort**: S (under 30 min), M (a few hours), L (a day or more), or `needs pictures` / `needs owner`.

End the file with: counts by severity, the five worst problems, and a list of fixes that can be done together (same component or same cause). Do not pad: every row must be a real problem you saw. If you run low on budget, stop and report what you covered and what you did not.

Final chat report under 200 words: the file path, counts by severity, pages covered and not covered.
