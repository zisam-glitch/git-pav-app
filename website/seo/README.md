# SEO baseline for www.pavdental.com

The live site at www.pavdental.com is a separate Create React App build. `website/` replaces it only once a preview matches this record: SEO stays the same or better (decisions log, 18 Nov 2026).

| File | What it holds |
|---|---|
| `live-baseline.json` | Every live page, rendered in a browser on 18 Nov 2026: status, title, description, canonical, robots, Open Graph and Twitter tags, structured data, headings, links, images, word count and a text hash. Also how the host answers (redirects, unknown pages), robots.txt and the sitemap. |
| `live-text/` | The visible text of each page, to port word for word. The petition page's list of signers (names and dates) is left out: it is personal data, and the crawler drops it (`redactSigners`). |
| `live-seed-paths.json` | Where the crawl starts: the paths in the live app's router. The crawl follows links to find the rest (blog posts, team profiles). |
| `live-files.json` | The 39 documents and team photos copied from the live site into `website/public/` at the same paths, each with its size, checksum and type, and the 5 documents the live page links to that the live server does not have (`missingOnLive`). `src/content/live-files.test.ts` checks the files against it. |
| `live-content/` | The structure of a page ported so far (headings, paragraphs, lists, links, images, including FAQ answers hidden in collapsed accordions), captured with `--content-dir`. `src/content/live-pages.ts` holds the ported text. |
| `parity-exceptions.json` | The differences from the live site that the owner has approved, with the reason: a redirect (`/gdpr`), a page not built yet (`/services/finance`, `/services/regestration`), and a lower sentence minimum for the legal pages that keep the repo's reviewed text. |
| `parity-ratchet.json` | Each page's coverage of the live page's own sentences, as last recorded. The parity check fails if a page falls behind it. |

## Checking a build against it

`scripts/seo-parity.mjs` fetches every recorded URL from a running copy of the new site and reads the server-rendered HTML the way a search engine does. CI runs it on every website PR, against the built site. To run it yourself, in `website/`:

```
npm run build
npm run preview -- --host 127.0.0.1 --port 4173      # in a second terminal
npm run seo:parity -- --base http://127.0.0.1:4173
```

For each page it compares the status, title, description, canonical and robots tags, H1 and H2 headings, structured data types, internal links, image alt text, and how many of the live page's own sentences are on the new page (text on 10 or more live pages, such as the header and footer, is left out of that count).

- A **failure** stops the run: a missing page, a changed title, description or canonical, a second title or description tag, a page kept out of search results, or a header or footer link that the live site has on 85% of its pages and the page lacks (links to approved missing or redirected pages excepted). Only the owner can approve one, in `parity-exceptions.json`.
- A **note** is a gap to close before the switch: missing words, headings, links, alt text, or an H1 count other than one.
- The **ratchet** (`parity-ratchet.json`) stops a page from getting worse while the rest are ported. After porting a page, run with `--update-ratchet` and commit the file.
- **Before the switch**, run with `--min-sentences 0.95`: every page must have at least 95% of the live page's own sentences, except where an exception sets its own minimum.

Other options: `--only /a,/b` for some pages, `--out report.json` for the full report with the missing sentences, `--wait-seconds N` to wait for the server to start.

## What the live site does today

- 47 pages. Titles and descriptions are set by JavaScript (react-helmet); the raw HTML has neither, so crawlers that do not run JavaScript see no title.
- 36 pages have a title and a description. 11 have neither: the 6 blog posts, `/faq`, `/practice-policy`, `/services/mouthguards`, `/services/root-canal` and `/shop`.
- No page has a canonical tag, Open Graph tags or a robots meta tag. 29 pages have no H1. 105 of 342 images have no alt text.
- Every page carries the same `Dentist` structured data. The sitemap lists 2 URLs (`/`, `/about`).
- `pavdental.com` and `http://` redirect to `https://www.pavdental.com` (308). Unknown paths return 200, and `/about/` and `/about` both return 200.

## Refreshing it

Run where Chrome can start (it cannot inside a restricted sandbox):

```
SEO_BROWSER_CHANNEL=chrome npm run seo:snapshot -- --base https://www.pavdental.com \
  --seeds seo/live-seed-paths.json --out seo/live-baseline.json --text-dir seo/live-text --crawl
```

Add `--content-dir seo/live-content` to also save each page's structure for porting. Analytics and ad beacons are blocked during a crawl, so it is not counted as visits. Don't edit these files by hand; re-run the snapshot.
