# Service: Mobile dentistry

- Agent group: **S4-B**
- Route(s): `/services/mobile-dentistry`
- Route file(s): `website/src/routes/services.mobile-dentistry.tsx`
- Live words: `website/seo/live-text/services--mobile-dentistry.txt`

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | mobile dentistry benefits | `website/src/components/mobile-dentistry/mobile-dentistry-benefits.tsx` | Hims cream numbered tiles (`Section theme="cream"`) | verified | ok | ok | same | Restored all 8 verbatim live benefit titles from `services--mobile-dentistry.txt`; dropped repo-only invented descriptions |
| 2 | mobile dentistry contact | `website/src/components/mobile-dentistry/mobile-dentistry-contact.tsx` | Hims lead-capture card (`rounded-xl bg-cream` + `bg-white` form) | verified | [shot](../shots/mobile-dentistry/1440-contact.png) | ok | same | Restyled with shared `Input`, `Label`, `Textarea`, `Button`, `lg:` split columns so placeholders never truncate, and `useEnquiry("Mobile dentistry")` |
| 3 | mobile dentistry hero | `website/src/components/mobile-dentistry/mobile-dentistry-hero.tsx` | [Mobbin split hero](https://mobbin.com/sites/sections/16099344-b64f-488f-b102-4723982d0e90) & [treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/mobile-dentistry/1440-hero.png) | [shot](../shots/mobile-dentistry/390-hero.png) | reworded | Split hero with `Coming Soon`, verbatim H1 & both live paragraphs, `BookButton`, `ButtonLink`, `CallButton`; temporarily reusing `/images/generated/home-mobile-dentistry.jpg` (`priority`) |
| 4 | mobile dentistry location | `website/src/components/mobile-dentistry/mobile-dentistry-location.tsx` | [Mobbin treatment details](https://mobbin.com/screens/dc314ee4-e77b-4226-a64e-fdd7e7ec3a97) | verified | [shot](../shots/mobile-dentistry/1440-location.png) | ok | reworded | `SplitFeature` with verbatim `Location` copy, `<Media tone="cream" />` placeholder, `BookButton` & `ButtonLink`; dropped 3 repo-only location cards |
| 5 | mobile dentistry page (page composition) | `website/src/components/mobile-dentistry/mobile-dentistry-page.tsx` | Hims alternating page rhythm + `CtaBand` | verified | ok | ok | reworded | Alternates white/cream/brown bands; renders `MobileDentistryContact` (previously omitted) and closing brown `CtaBand` |
| 6 | mobile dentistry service | `website/src/components/mobile-dentistry/mobile-dentistry-service.tsx` | Hims dark brown feature band (`Section theme="brown" width="bento" space="lg"`) | verified | ok | ok | same | `SplitFeature` with `We Come to You` verbatim copy, `BookButton variant="gold"`, `CallButton variant="glass"`, and `<Media tone="brown" className="bg-white/10" />` placeholder |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| `mobile-dentistry-hero.tsx` | `Delivered to Your Doorstep :` | `Delivered to Your Doorstep.` | Replaced trailing space-colon with period for Hims split-hero punctuation |
| `mobile-dentistry-location.tsx` | `Location` | `Location` + accent `coverage` | Fits Hims two-tone `Heading` style while keeping `Location` first |
| `mobile-dentistry-page.tsx` | No closing CTA band in `live-text` | `Ready to arrange a mobile visit?` + `786 Leeds Road, Bradford, BD3 9TY · Pav Dental Mobile visits patients across the UK.` | Standard Hims closing `CtaBand` using only verified practice address and live location sentence |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `mobile-dentistry-hero` | `mobile-dentistry-hero.tsx` | `4 / 3` | Editorial product photography on warm cream stone: compact matte-white portable dental handpiece case and ceramic rinse cup in soft morning sunlight, gentle shadows, no text or logos | `website/public/images/generated/mobile-dentistry-hero.jpg` | needed |
| `mobile-dentistry-service` | `mobile-dentistry-service.tsx` | `4 / 3` | Warm architectural interior photography of a calm modern mobile dental treatment suite with cream upholstery, brushed brass instrument tray, and natural daylight through frosted glass, no people or text | `website/public/images/generated/mobile-dentistry-service.jpg` | needed |
| `mobile-dentistry-location` | `mobile-dentistry-location.tsx` | `4 / 3` | Minimalist studio still life on pale sand background: clean matte-white mobile medical care kit beside a folded linen towel in warm diffused light, soft shadows, no text or logos | `website/public/images/generated/mobile-dentistry-location.jpg` | needed |

## Verification log

- 2026-11-19: Verified `/services/mobile-dentistry` in Chromium at `1440x900` and `390x844` (hero image loaded cleanly, updated `#contact` `lg:` form layout verified full-width without placeholder truncation, 0 horizontal overflow), confirmed SEO parity 94% (0 failures), and saved shots in `docs/redesign/website/shots/mobile-dentistry/`. Marked all 6 sections `verified`.

## Open questions for the lead

1. **Removed external Unsplash URLs**: Dropped `https://images.unsplash.com/photo-1588776864544-9b2a4a7d2a4c...` from `mobile-dentistry-hero.tsx` (temporarily reusing `/images/generated/home-mobile-dentistry.jpg`) and `https://images.unsplash.com/photo-1629909615184-74f495363b67...` from `mobile-dentistry-service.tsx` (replaced with `<Media tone="brown" className="bg-white/10" />`).
2. **Removed `Spotlight` import**: `mobile-dentistry-hero.tsx` no longer imports `@/components/home/spotlight`.
3. **Removed repo-only hero bullets (`mobile-dentistry-hero.tsx`)**: Dropped `"Home visits"`, `"Care home services"`, `"Full dental services"` (only `"NHS partners"` appeared in `services--mobile-dentistry.txt`, inside the benefits list).
4. **Removed repo-only benefit descriptions (`mobile-dentistry-benefits.tsx`)**: Dropped the 8 invented per-item descriptions (e.g. `"Proven track record with many happy patients across the UK."`) and restored exact live titles (`"Make your home oral-health CQC-compliant"`, `"The very latest mobile dental equipment"`). Note: `"Hundreds of satisfied patients"` is kept verbatim as it appears in `services--mobile-dentistry.txt` line 19.
5. **Removed repo-only service copy & floating badge (`mobile-dentistry-service.tsx`)**: Dropped `"Our state-of-the-art mobile dental unit brings comprehensive dental services directly to your doorstep."` and the overlay badge `"Mobile Surgery"` / `"Fully equipped for comprehensive dental care"`.
6. **Removed repo-only location cards (`mobile-dentistry-location.tsx`)**: Dropped `"UK-Wide Service"`, `"Easy Booking"`, and `"Contact Us"` cards with their invented descriptions, keeping only the live `Location` heading and `"Pav Dental Mobile visits patients across the UK. Your Smile with Convenient Dental Care Right at Your Doorstep."`.
7. **Wired `MobileDentistryContact` into `MobileDentistryPage`**: The existing `mobile-dentistry-page.tsx` imported `MobileDentistryContact` without rendering it, leaving the hero `#contact` link broken and omitting the live `Get In Touch` form. Rendered it above the closing `CtaBand`.
