# Shop: catalogue, product, category, cart, checkout, order

- Agent group: **SH**
- Route(s): `/shop`, `/shop/$productSlug`, `/category/$slug`, `/cart`, `/checkout`, `/order/$id`
- Route file(s): `website/src/routes/shop.tsx`, `website/src/routes/shop_.$productSlug.tsx`, `website/src/routes/category.$slug.tsx`, `website/src/routes/cart.tsx`, `website/src/routes/checkout.tsx`, `website/src/routes/order.$id.tsx`
- Live words: `website/seo/live-text/shop.txt`
- Note: Only /shop is on the live site. No star ratings (invented-content test). Cart and checkout are task pages: keep every field, label and step working.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | cart drawer | `website/src/components/shop/cart-drawer.tsx` | — | todo | | | | |
| 2 | cart page (page composition) | `website/src/components/shop/cart-page.tsx` | — | todo | | | | |
| 3 | checkout page (page composition) | `website/src/components/shop/checkout-page.tsx` | — | todo | | | | |
| 4 | order confirmation | `website/src/components/shop/order-confirmation.tsx` | — | todo | | | | |
| 5 | product detail | `website/src/components/shop/product-detail.tsx` | — | todo | | | | |
| 6 | product modal | `website/src/components/shop/product-modal.tsx` | — | todo | | | | |
| 7 | shop catalog | `website/src/components/shop/shop-catalog.tsx` | — | todo | | | | |
| 8 | shop guarantee | `website/src/components/shop/shop-guarantee.tsx` | — | todo | | | | |
| 9 | shop hero | `website/src/components/shop/shop-hero.tsx` | — | todo | | | | |
| 10 | shop page (page composition) | `website/src/components/shop/shop-page.tsx` | — | todo | | | | |
| 11 | product reveal card | `website/src/components/ui/product-reveal-card.tsx` | — | todo | | | | |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|

## Verification log

(Newest first: date, section, reference compared, what differed, what you changed, result.)

## Open questions for the lead

