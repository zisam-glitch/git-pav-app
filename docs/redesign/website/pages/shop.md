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
| 1 | cart drawer | `website/src/components/shop/cart-drawer.tsx` | Hims 547px right drawer (`bg-black/44` curtain, `ease-smooth`, Escape/focus) | verified | [shot](../shots/shop/1440-drawer.png) | ok | reworded | Rebuilt 547px Hims drawer (`bg-white`, `md:rounded-l-xl`, `shadow-card`), removed `backdrop-blur-xs` and `alert()`, uses `Input`/`Button`/`ButtonLink`/`ShopMedia`, wired `onClearCart` |
| 2 | cart page (page composition) | `website/src/components/shop/cart-page.tsx` | Hims split layout + `Tile` panels (`cream` / `sage` / `white`) | verified | [shot](../shots/shop/1440-cart.png) | ok | reworded | Rebuilt with `Section`, `Heading`, `Tile`, `Input`, `Button`, `ButtonLink`, `ShopMedia`; kept cart sync, quantity +/-/remove, clear bag, shipping progress, and promo code flow (populated state awaits `:3001` API) |
| 3 | checkout page (page composition) | `website/src/components/shop/checkout-page.tsx` | Hims form cards (`Input`, `Label`, `Tile`, `Button`) | verified | [shot](../shots/shop/1440-checkout.png) | ok | reworded | Preserved every field, label, validation, shipping radio selection, promo code, and Stripe checkout session submit; empty-bag guard verified in browser (full checkout form awaits `:3001` API product) |
| 4 | order confirmation | `website/src/components/shop/order-confirmation.tsx` | Hims `Section` (`width="prose"`) + `Tile` confirmation panels | verified | ok | ok | same | Preserved loading, not-found, awaiting-payment polling, `clearCart` on paid status, and receipt breakdown using `Tile`, `Heading`, `ButtonLink`, and `ShopMedia` |
| 5 | product detail | `website/src/components/shop/product-detail.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · [Mobbin product details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | ok | ok | same | Rebuilt with `Section`, `Heading`, `Tile`, `ShopMedia`, variant pills, quantity stepper, JSON-LD (no ratings), and complementary products grid; not-found fallback verified |
| 6 | product modal | `website/src/components/shop/product-modal.tsx` | Hims modal card (`bg-black/44` overlay, `rounded-xl`) | verified | ok | ok | same | Removed `backdrop-blur-xs` and raw hex; added Escape key close, `role="dialog"`, Hims `Button`/`Tile`/`ShopMedia` (currently unused by `shop-page.tsx`) |
| 7 | shop catalog | `website/src/components/shop/shop-catalog.tsx` | [Mobbin product & pricing cards](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) | verified | [shot](../shots/shop/1440-catalog.png) | ok | same | Rebuilt on `Section theme="white"` with category pills (desktop), `Select` for category (mobile) and sort, `Input` search, and 3-col grid of `ProductRevealCard` (`0` stars) |
| 8 | shop guarantee | `website/src/components/shop/shop-guarantee.tsx` | Hims `FaqList` + sticky left header on `Section theme="sand"` | verified | ok | ok | same | Replaced custom accordion with shared `FaqList`, `Heading`, and `ButtonLink`; kept 4 shop FAQs (flagged clinical/shipping/returns claims for owner sign-off) |
| 9 | shop hero | `website/src/components/shop/shop-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) · [Mobbin product details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/shop/1440-hero.png) | [shot](../shots/shop/390-hero.png) | reworded | Rebuilt as `SplitFeature` on `Section theme="cream"` with `Heading`, `ButtonLink`, and `4 / 3` `<Media>` placeholder (`shop-hero`); dropped unverified `"100% satisfaction guarantee"` bullet |
| 10 | shop page (page composition) | `website/src/components/shop/shop-page.tsx` | Hims alternating sections (`cream` / `white` / `sand`) + floating bag pill | verified | ok | ok | same | Composes `ShopHero`, `ShopCatalog`, `ShopGuarantee`, `CartDrawer`, and Hims black pill bag trigger; removed Unsplash fallback |
| 11 | product reveal card | `website/src/components/ui/product-reveal-card.tsx` | [Mobbin product & pricing cards](https://mobbin.com/screens/fceeec4f-4a84-4d2c-800b-aa43b48a07bb) · Hims cream product tile with `+` button | verified | ok | ok | same | Rebuilt as `bg-tile-cream` Hims tile with `t-lift`, `t-zoom`, `ShopMedia`, price (`tabular-nums`), and round `+`/`Check` button; removed `backdrop-blur-xl` and dark blur overlay |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `shop-hero.tsx` | `100% satisfaction guarantee`, `Free UK delivery` (previous repo bullets) | `Bradford clinic dispatch`, `UK tracked delivery` | Removed unverified unconditional guarantee and free-delivery claim from hero bullets until owner confirms |
| `cart-drawer.tsx` | `256-bit SSL encrypted checkout · 30-day returns` | `Encrypted checkout · Bradford clinic dispatch` | Removed unverified `256-bit SSL` and `30-day returns` wording in favour of factual checkout note |
| `cart-page.tsx` | `30-day returns and free advice from registered dentists.` | `Dispatched from our registered dental clinic in Bradford.` | Removed unverified return-period and free-advice claims |
| `checkout-page.tsx` | `256-Bit SSL Encrypted Payment` / `Authorized clinical dispenser. 30-day money back guarantee.` | `Secure Checkout` / `Payments are processed securely via Stripe.` | Removed unverified SSL-bit/dispenser/guarantee claims while keeping Stripe security note |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `shop-hero` | `shop-hero.tsx` | `4 / 3` | Editorial studio still life on warm cream stone: minimalist matte-cream and soft-sage oral care bottles, ceramic cup, and bamboo toothbrush in warm natural morning light with soft shadows, no text or logos | `website/public/images/generated/shop-hero.jpg` | done |

## Verification log

- 2026-11-19: Verified `/shop`, `/category/whitening`, `/shop/test-product`, `/cart`, `/checkout`, and `547px` `CartDrawer` in Chromium at `1440x900` and `390x844` (search/sort `<Select>`, 0 star ratings, 0 horizontal overflow, single H1 per settled route; populated product/checkout submission awaits running `:3001` backend), confirmed `/shop` SEO parity (0 failures), and saved shots in `docs/redesign/website/shots/shop/`. Marked all 11 rows `verified`.

## Open questions for the lead

1. **Live `shop.txt` vs active e-commerce store**:
   - `website/seo/live-text/shop.txt` still contains the old live placeholder (`"Our Online Shop is Coming Soon!"`, `$` price ranges, and `"4 Stars & Up"` rating filters), while the repo implements the full API-backed store, cart, and Stripe checkout. Confirm whether any `"Coming Soon"` copy is ever needed or if the active store replaces it completely.
2. **Shop hero and FAQ claims (`shop-hero.tsx`, `shop-guarantee.tsx`, `product-detail.tsx`)**:
   - Previous repo `shop-hero.tsx` listed `"Free UK delivery"` and `"100% satisfaction guarantee"`. Removed `"100% satisfaction guarantee"` from hero; kept `FREE_SHIPPING_THRESHOLD = 40` (`Free UK Delivery over £40` / `£3.99` standard) in `cart-drawer.tsx`, `cart-page.tsx`, `checkout-page.tsx`, and `product-detail.tsx`. Confirm threshold and delivery fee match `api.shipping.list()`.
   - `shop-guarantee.tsx` contains 4 repo-only FAQs claiming PAP+ whitening chemistry, 3-minute at-home impression kits with prepaid tracked return boxes, same-day Royal Mail 24/48 Tracked dispatch before 2 PM Mon–Fri, free UK tracked delivery over £40, Clinic Click & Collect at 786 Leeds Road, and a 30-day money-back guarantee on unopened devices. Kept these 4 FAQs so `#guarantee` works; clinician/owner should verify each claim.
3. **Shared `cart-store.ts` Unsplash fallback**:
   - `website/src/lib/cart-store.ts` line 109 (unowned shared file) still injects `https://images.unsplash.com/photo-1556228720-195a672e8a03?...` when adding a product without an image. Created `ShopMedia` in `components/shop/shop-media.tsx` to render `<Media>` placeholders whenever that URL appears, and recommend removing the Unsplash URL from `cart-store.ts` in the shared cleanup pass.
4. **Unused component**:
   - `website/src/components/shop/product-modal.tsx` was redesigned to Hims tokens (no `backdrop-blur`), though `shop-page.tsx` and `category.$slug.tsx` navigate to `/shop/$productSlug` rather than opening the modal.
