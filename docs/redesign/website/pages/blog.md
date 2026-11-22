# Blog and posts

- Agent group: **C1**
- Route(s): `/blog`, `/blog/$slug`
- Route file(s): `website/src/routes/blog.tsx`, `website/src/routes/blog_.$slug.tsx`
- Live words: `website/seo/live-text/blog.txt`, `website/seo/live-text/blog--*.txt`
- Note: Six real posts in website/src/content/blog-posts.ts.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | blog index | `website/src/components/blog/blog-index.tsx` | Hims "Popular reads" card grid (`Tile` + `Media`) | verified | [shot](../shots/blog/1440-index.png) | [shot](../shots/blog/390-index.png) | same | Cream hero + 3-column Hims `bg-tile-cream` cards with `t-lift`, `t-zoom`, and `<Media>` placeholders (replacing external Contentful URLs until local generated covers are supplied). |
| 2 | blog post page (page composition) | `website/src/components/blog/blog-post-page.tsx` | Hims prose article + sticky `Tile` sidebar + `CtaBand` | verified | [shot](../shots/blog/1440-post.png) | ok | same | Cream article header (`Back to Blog`, `Heading size="hero"`, byline), `wrap` 2-column prose (`46rem`) + sticky `Recent Posts` cream `Tile`, Previous/Next tile links, and closing `CtaBand`. |
| 3 | newsletter cta | `website/src/components/blog/newsletter-cta.tsx` | Hims lead-capture card (`Input` + `Button`) | verified | [shot](../shots/blog/1440-newsletter.png) | ok | same | Restyled on `Section theme="cream"` with white `rounded-xl` card, Hims `Heading`, `Input`, `Button`, accessible `<Label>`, and `Tile tone="sage"` confirmation state. |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `blog-video-consultation` | `/blog` card 1 (video consultation) | `16 / 10` | Warm natural-light editorial photograph of a clean modern UK home desk with a smartphone resting on a ceramic stand beside a cup of herbal tea, soft linen and cream tones, shallow depth of field, no text, no logos, no identifiable faces | `website/public/images/generated/blog-video-consultation.jpg` | done |
| `blog-tooth-extraction` | `/blog` card 2 (tooth extraction) | `16 / 10` | Minimalist 3D-render editorial still life of brushed stainless dental mirror and precision instruments arranged neatly on a warm cream stone tray, soft diffused studio sunlight and gentle shadows, no text, no logos | `website/public/images/generated/blog-tooth-extraction.jpg` | done |
| `blog-emergency-bradford` | `/blog` card 3 (24-hour emergency Bradford) | `16 / 10` | Atmospheric evening architectural interior of a calm modern dental reception desk glowing softly with warm amber light against deep navy-slate walls, serene welcoming mood, no text, no people | `website/public/images/generated/blog-emergency-bradford.jpg` | done |
| `blog-botox-vs-fillers` | `/blog` card 4 (facial aesthetics) | `16 / 10` | Editorial still life of frosted glass apothecary serum vials and smooth travertine stone blocks on a warm sand background, soft morning window light and crisp shadows, clean Hims-style product composition, no text, no logos | `website/public/images/generated/blog-botox-vs-fillers.jpg` | done |
| `blog-single-tooth-whitening` | `/blog` card 5 (single-tooth whitening) | `16 / 10` | Clean studio close-up of a ceramic dental shade guide and matte white whitening gel applicator resting on a pale sage-tinted linen surface, warm natural sunlight, soft shadows, no text, no logos | `website/public/images/generated/blog-single-tooth-whitening.jpg` | done |
| `blog-emergency-leeds` | `/blog` card 6 (24-hour emergency Leeds) | `16 / 10` | Calm sunlit dental treatment chair and warm wood cabinetry in a boutique Yorkshire clinic room, soft cream and sage palette, crisp architectural lines, no text, no people | `website/public/images/generated/blog-emergency-leeds.jpg` | done |

## Verification log

- 2026-11-19: Verified `/blog` and `/blog/$slug` in Chromium at `1440x900` and `390x844` (6-card 3-col index, newsletter CTA, prose article with sticky `Recent Posts`, 0 console errors, 0 horizontal overflow), confirmed SEO parity 100% (`/blog`) and 92%–94% across all 6 post routes (0 failures), and saved shots in `docs/redesign/website/shots/blog/`. Marked all 3 sections `verified`.

## Open questions for the lead

- `BLOG_POSTS` in `website/src/content/blog-posts.ts` references external `https://images.ctfassets.net/...` URLs (enforced by `blog-posts.test.ts`). `BlogIndex` currently renders `<Media>` placeholders for non-local URLs and logs the 6 cover slots above; once local assets are created under `website/public/images/generated/`, either map them in `blog-index.tsx` or update `blog-posts.ts` and `blog-posts.test.ts` together.

## Pass 2

- Captures used: `/blog.html`, `/blog/all.html`, `/blog/how-long-before-minoxidil-starts-working.html`.
- Differences found: index content width (ours 1328 wide, Hims 1092 at x174, card pitch 372); article column 602 vs 650; author avatar 44 vs 55. Section order, type sizes (87 / 62 / 29px headings), cards, pagination and table of contents already matched.
- Rebuilt: index container width, article column width, avatar size. Raw hex colours replaced with `bg-rust` and `from-clay to-rust`.
- Removed repo-only text: "Reviewed by Dr Hassan Bhojani, BDS (GDC: 262970)" and its link, "Updated" line, the `4 Sources` accordion (NHS England, GDC, NICE, BDA citations), the "Editorial Standards" box, the "24/7 urgent triage" sentence, the two Related Conditions summary paragraphs, prices in the footer lists ("(£35)", "(From £95)", "(£195–£395)"), the index badges ("£35", "24/7", "Rx", "32 Colours"), and the "model portrayal" image disclaimer (index and all-articles).
- Wording changes: none.
- Images needed: none new.
- Open questions: the owner may want a real "Reviewed by" row back if the live posts get one; the prices above are not on the live blog.
