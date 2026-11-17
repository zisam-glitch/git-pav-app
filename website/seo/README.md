# SEO baseline for www.pavdental.com

The live site at www.pavdental.com is a separate Create React App build. `website/` replaces it only once a preview matches this record: SEO stays the same or better (decisions log, 18 Nov 2026).

| File | What it holds |
|---|---|
| `live-baseline.json` | Every live page, rendered in a browser on 18 Nov 2026: status, title, description, canonical, robots, Open Graph and Twitter tags, structured data, headings, links, images, word count and a text hash. Also how the host answers (redirects, unknown pages), robots.txt and the sitemap. |
| `live-text/` | The visible text of each page, to port word for word. |
| `live-seed-paths.json` | Where the crawl starts: the paths in the live app's router. The crawl follows links to find the rest (blog posts, team profiles). |

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

Analytics and ad beacons are blocked during a crawl, so it is not counted as visits. Don't edit these files by hand; re-run the snapshot.
