# Recipe: listing and shop pages (hub, pricing, catalogue, product, category)

Written by agent B, pass 2. Built and checked so far: the `/services` hub. The rest of the family has its kit parts built and its patterns measured, but the pages are not rebuilt yet (see "State" at the end and the `## Pass 2` sections of `pages/pricing.md` and `pages/shop.md`). Sheets: `hair-loss-category.md`, `membership.md`, `labs.md`, `biomarkers.md`, `shop-pdp-notes.md`.

## Section order for a Pav page of this kind

| Page | Order | Kit parts |
|---|---|---|
| Hub or category (list of pages) | cream hero (H1 left, buttons right) - grid of picture tiles (3 across from 1024px, 2 from 768px, 16px gap) - closing `CtaBand` | `category-hero.tsx`, `service-tile.tsx`, `chip.tsx`, `cta-band.tsx` |
| Pricing | hero with picture - plan cards (3 across) - fee schedule (per category: heading left, hairline price rows right) - insurance tiles - dark announcement band | `plan-card.tsx`, `check-list.tsx`, `price-list.tsx`, `tile.tsx` |
| Shop catalogue | split hero (chip, H1, lead, tick list, buttons, picture) - category tiles - filter row (pills, search, sort) - product cards 3 across - delivery band - FAQ | `chip.tsx`, `check-list.tsx`, `service-tile.tsx`, `product-card.tsx`, `faq.tsx` |
| Product page | gallery left (889 wide), side rail right (389): chip, H1, price, option cards, quantity, black Add to bag pill, details accordion - spec rows - related products scroller | `product-gallery.tsx`, `choice-cards.tsx`, `info-accordion.tsx`, `carousel.tsx`, `product-card.tsx` |
| Category (shop) | `CategoryHero` with the category name as H1 - the product grid of the catalogue - back link to the shop | `category-hero.tsx`, `product-card.tsx` |

Band rhythm of the Hims category and product pages: 60px top and bottom (32px on a phone), content 1344 wide at 1440, two-column bands with a 112px gap, no divider lines. Use `Section space="none"` with `py-8 md:py-[60px]` (token request: band padding 32 / 60).

## Choosing a kit part

- Picture-led link to a page: `ServiceTile` (radius 16, fill black at 3%, picture on top, title, blurb). The chip sits on the picture. Titles are spans, not headings.
- A buyable thing: `ProductCard` (picture frame with chips, `h3` title, price line, description, two pills). The caller supplies the links and buttons, so the cart logic stays in the page.
- A tier with a list of perks: `PlanCard` (the plan name is an `h3`; `featured` lifts one card). Perks go through `CheckList`; `included: false` adds a screen-reader note.
- Many short priced rows: `PriceList` (a `dl`, hairlines). For long lists of facts that open and close use `InfoAccordion` (another agent's, native `details`, H3 labels).
- A choice between variants: `ChoiceCards` (radio group). It is controlled: pass `value` and `onChange`.

## Traps

- **Headings are measured.** The fingerprint compares every H2 and H3 text. Keep each existing H2, and keep card and accordion titles as H3 (`FaqList` and `InfoAccordion` already do). Do not make tile titles H3 under an H1 with no H2 (skips a level): tiles use spans.
- **Words drop when you remove repo-only labels.** On `/services` removing the price and feature badges, tile numbers and the address chip took the page from 429 to 377 words (-12%, a WARN by design). Say so in the report; do not put the labels back.
- **Decorative pictures and the parity runner.** `alt=""` is right for a tile picture, but the runner adds an `alt` note. A `Media` with no picture renders `role="img"` with an empty name: for a placeholder inside a link use an `aria-hidden` block of the right ratio instead.
- **Reuse wired pictures.** Every service has `/images/generated/<slug>-hero.jpg` (1200x896, or 1376x768 for whitening, cosmetic, aesthetics, custom grillz, mobile). Finance reuses `pricing-hero.jpg`. Registration has none (Images needed: `services-registration`).
- **Hover zoom.** `t-zoom` only works on a direct child of the `group`. When a chip sits over the picture, zoom an inner span with `motion-safe:group-hover:scale-[1.03]` instead.
- **`Media` rounds to 24px.** Pass `className="rounded-md"` (16px) inside Hims category cards.
- **Lint.** `react-refresh/only-export-components` warns on a file that exports a helper beside a component: kit files export components and types only.
- **The category page has no products on the server.** `routes/category.$slug.tsx` lists API products only, so `/category/*` is just a heading in dev. Fall back to `getCatalogProductsByCategory(slug)` from `shop-catalog-data.ts` the way `ShopPage` falls back to `SHOP_CATALOG_PRODUCTS`.
- **Banned words in source.** `invented-content.test.ts` scans comments too: never write the words for star ratings or review counts anywhere in `src/`.
- **Browser.** `navigate` and a reload reset the viewport emulation: call `resize_window` again after every navigation. A `computer` call inside `browser_batch` needs its own `tabId` or it acts on another agent's tab. The fingerprint compare must run from a tab on `http://localhost:8180`.

## State when this was written

Built and in use: `category-hero`, `chip`, `service-tile` (hub). Built, compiling, not used by a page yet: `check-list`, `plan-card`, `price-list`, `product-card`, `choice-cards`, `product-gallery`. Next agent: rebuild `/pricing`, then the catalogue and `ProductRevealCard`, then the product page and the category route, in the order in the Pass 2 sections.
