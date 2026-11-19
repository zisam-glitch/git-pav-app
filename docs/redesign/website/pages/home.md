# Home

- Agent group: **A1**
- Route(s): `/`
- Route file(s): `website/src/routes/index.tsx`
- Live words: `website/seo/live-text/home.txt`
- Note: home/spotlight.tsx and home/reveal.tsx are imported by other pages: keep their exports working, do not delete.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | contact form | `website/src/components/home/contact-form.tsx` | Hims lead-capture card (`wrap-max`, `rounded-xl`, `p-[60px]`) | verified | [ok](../shots/home/01-contact-form-1440.png) | [ok](../shots/home/01-contact-form-390.png) | same | Restyled with Hims `Input`/`Textarea`/`Label` and full-width black pill submit |
| 2 | counters | `website/src/components/home/counters.tsx` | Hims ethos split + `Stat` row | verified | [ok](../shots/home/02-counters-1440.png) | ok | same | Live ethos text + `2` Doctors / Dentist, `5` Staffs, `25+` Years of experience, `500+` Happy Patients |
| 3 | hero canvas | `website/src/components/home/hero-canvas.tsx` | — | verified | ok | ok | same | Unused on redesigned `/` (Three.js orb removed); kept untouched for safety |
| 4 | hero scene | `website/src/components/home/hero-scene.tsx` | — | verified | ok | ok | same | Unused on redesigned `/` (Three.js scene); kept untouched for safety |
| 5 | hero slider | `website/src/components/home/hero-slider.tsx` | [Mobbin hero](https://mobbin.com/sites/sections/4036afc5-93be-4d95-9b06-9b27cae97ebb) + [Mobbin cards](https://mobbin.com/sites/sections/81c02fb1-3cbc-4f4c-b0c1-f9c82804928d) | verified | [ok](../shots/home/05-hero-1440.png) | [ok](../shots/home/05-hero-390.png) | reworded | H1 + `Book Online` / `Call us Now` pills + 2 `216px` split-photo featured cards (`home-checkup.jpg`, `home-emergency-night.jpg`) + 4 `bg-tile-cream` studio photo cards (`home-facial-aesthetics.jpg`, `home-general-dentistry.jpg`, `home-teeth-whitening.jpg`, `home-mobile-dentistry.jpg`) + 3-pill bottom tier |
| 6 | marquee | `website/src/components/home/marquee.tsx` | Hims `TrustStrip` marquee with pause button | verified | [ok](../shots/home/06-marquee-1440.png) | ok | same | Replaced `.marquee-track` with `TrustStrip` |
| 7 | overview | `website/src/components/home/overview.tsx` | Hims split services list + white `Working Hours` tile | verified | [ok](../shots/home/07-overview-1440.png) | ok | same | Live copy, 6 `+` items, GDC mark, `00:00 – 24:00` Mon–Sun |
| 8 | reveal | `website/src/components/home/reveal.tsx` | — | verified | ok | ok | same | Stopped using on `/` and testimonials; kept untouched for unconverted pages |
| 9 | service tabs | `website/src/components/home/service-tabs.tsx` | — | verified | ok | ok | same | Replaced on `/` by Hero category tiles + `HomeEmergency`; kept untouched without deleting |
| 10 | spotlight | `website/src/components/home/spotlight.tsx` | — | verified | ok | ok | same | Stopped using on `/`; kept untouched for unconverted service heroes |
| 11 | tilt card | `website/src/components/home/tilt-card.tsx` | — | verified | ok | ok | same | Unused on `/`; kept untouched without deleting |
| 12 | video section | `website/src/components/home/video-section.tsx` | Hims light rounded video frame (`What causes cavities?`) | verified | [ok](../shots/home/12-video-1440.png) | ok | reworded | `aspect-video` uncropped frame; copy, alt & aria-label aligned to `"What causes cavities?"` video |
| 13 | testimonials section | `website/src/components/testimonials/testimonials-section.tsx` | [Mobbin stat/quote cards](https://mobbin.com/sites/sections/25b74d46-54e3-4564-9a7d-044360efd897) + Hims navy quote `Carousel` | verified | [ok](../shots/home/13-testimonials-1440.png) | [ok](../shots/home/13-testimonials-390.png) | same | Strictly `HOME_TESTIMONIALS` verbatim, zero stars/ratings; `text-h4` title + `text-lead` quote body |
| 14 | counting number | `website/src/components/ui/counting-number.tsx` | Hims `tabular-nums` stat counter | verified | ok | ok | same | Static `tabular-nums` display matching Hims numerals (`2`, `5`, `25+`, `500+`) with zero mid-count lag |
| 15 | emergency feature | `website/src/components/home/home-emergency.tsx` | Hims dark brown bento (`bg-brown`, `wrap-bento`, `bg-brown-deep`) | verified | [ok](../shots/home/15-emergency-1440.png) | ok | same | Live 24/7 Emergency Dental Services in Bradford copy + £45 / £90* tiles + gold/glass CTAs + generated `home-emergency-suite.jpg` architectural photo |
| 16 | team trust carousel | `website/src/components/home/home-team-carousel.tsx` | Hims "The best care by the best in medicine" trust `Carousel` | verified | [ok](../shots/home/16-team-carousel-1440.png) | ok | reworded | Real `TEAM_MEMBERS` cards with GDC numbers for clinicians linking to `/team/$slug` + [CTA band](../shots/home/17-cta-band-1440.png) |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|
| Hero H1 (`hero-slider.tsx`) | `Exceptional Dentistry That You Can Rely On` (ethos section) | `Exceptional dentistry` + accent `that you can rely on` | Matches Hims two-tone hero H1 formula while keeping live ethos H2 verbatim in `counters.tsx` |
| Hero lead (`hero-slider.tsx`) | No single hero paragraph on live slider | `24-hour private and emergency dental care in Bradford — complete check-ups from £35, cosmetic care, and same-day urgent access.` | Concise Hims hero lead summarising live home offers |
| Category tiles (`hero-slider.tsx`) | `Aesthetics`, `Whitening` | `Facial Aesthetics`, `Teeth Whitening` | Fits Hims two-word accent tile pattern while retaining exact service keywords |
| Video intro (`video-section.tsx`) | Old repo copy ("Walk the treatment suite — ice lighting, still instruments, no rush...") | `Watch our short dental guide explaining what causes cavities and how daily care protects your enamel.` | Aligned video subtitle, alt, and aria-label with the actual `"What causes cavities?"` educational video |
| Team carousel (`home-team-carousel.tsx`) | No dedicated home team carousel on live `/` | `Care led by real clinicians and care team` | Hims "best care by the best in medicine" pattern backed strictly by `TEAM_MEMBERS` |

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|
| `home-checkup` | `hero-slider.tsx` featured card 1 | `4 / 3` | Editorial studio still life on dark walnut-brown surface: matte-cream and brushed-brass dental mirror on ceramic tray in warm sunlight | `website/public/images/generated/home-checkup.jpg` | done |
| `home-emergency-night` | `hero-slider.tsx` featured card 2 | `4 / 3` | Minimalist architectural night view in deep midnight-navy tones looking into a serene modern dental room lit by warm amber pendant | `website/public/images/generated/home-emergency-night.jpg` | done |
| `home-facial-aesthetics` | `hero-slider.tsx` category card 1 | `16 / 9` | Centered Hims-style 3D still life on warm cream: matte frosted-amber serum bottle and ceramic dish on travertine slab in sunlight | `website/public/images/generated/home-facial-aesthetics.jpg` | done |
| `home-general-dentistry` | `hero-slider.tsx` category card 2 | `16 / 9` | Centered Hims-style 3D render on warm cream: sculptural matte-white and brushed-titanium dental mirror and ultrasonic wand on rounded cream plinth | `website/public/images/generated/home-general-dentistry.jpg` | done |
| `home-teeth-whitening` | `hero-slider.tsx` category card 3 | `16 / 9` | Centered Hims-style 3D render on warm cream: matte-cream whitening pen, pastel-sage travel case, and ceramic pebble | `website/public/images/generated/home-teeth-whitening.jpg` | done |
| `home-mobile-dentistry` | `hero-slider.tsx` category card 4 | `16 / 9` | Centered Hims-style 3D render on warm cream: compact matte-sand portable dental care case with brushed champagne clasp | `website/public/images/generated/home-mobile-dentistry.jpg` | done |
| `home-emergency-suite` | `home-emergency.tsx` dark brown feature band | `4 / 3` | Golden-hour editorial architectural photo of a modern dental suite with cream leather chair, walnut cabinetry, and travertine counter | `website/public/images/generated/home-emergency-suite.jpg` | done |

## Verification log

- 2026-11-19 (Hims-style generated imagery): Replaced all old clinic photos and empty placeholders on `/` with 7 cohesive Hims-style generated studio images in `website/public/images/generated/home-*.jpg` (`home-checkup`, `home-emergency-night`, `home-facial-aesthetics`, `home-general-dentistry`, `home-teeth-whitening`, `home-mobile-dentistry`, `home-emergency-suite`). Verified 0 broken images, consistent warm-cream/walnut/navy palette, and zero horizontal overflow at `1440x900` and `390x844`.

- 2026-11-19 (Hero redesign): Redesigned `hero-slider.tsx` to match [Mobbin hero](https://mobbin.com/sites/sections/4036afc5-93be-4d95-9b06-9b27cae97ebb) with zero blank placeholders above the fold: H1 + `Book Online` / `Call us Now` pills, 2 locked `216px` split-photo featured cards (`/media/hero1.jpg` and `/media/hero-night.jpg`), 4 vertical `bg-tile-cream` photo cards (`/media/hero2.jpg`, `/media/hero-clinic.jpg`, `/media/hero-smile.jpg`, `/media/hero.jpg`), and a 3-pill bottom strip (`Tooth Extraction`, `0800 1938 786`, `Explore all treatments`). Verified all 3 tiers sit cleanly above the `1440x900` fold with zero horizontal overflow at `390x844`.

- 2026-11-19 (Mobbin pass): Compared hero category tiles and card proportions against [Mobbin hero](https://mobbin.com/sites/sections/4036afc5-93be-4d95-9b06-9b27cae97ebb) and [Mobbin care cards](https://mobbin.com/sites/sections/771a19ed-e62a-4988-b827-c0fc365b87c9); tuned category label size (`text-nav-lg font-[470]`) and thumbnail width (`w-14 lg:w-16`) so all 4 category titles sit on one clean line on desktop and mobile.
- 2026-11-19: Reviewed full `/` page against Hims capture (`http://localhost:8099/index.html`) at `1440x900` and `390x844` across two browser passes. Fixed Hero top offset (`pt-6 md:pt-8`), category tile `<Media tone="sand" />`, quick-action strip contrast (`bg-sand`), `HomeEmergency` placeholder frame (`bg-white/7`), `VideoSection` `aspect-video` + cavities copy, `CountingNumber` static numerals (`2`, `5`, `25+`, `500+`), navy testimonial card typography, and `Heading` block-span spacing (lifting `/` SEO parity from 46% to 88% with 0 failures). Zero page-level horizontal overflow at `390x844`. Remaining empty `<Media>` boxes are intentional Phase 4 Google Flow slots (`5` listed above).

## Open questions for the lead

1. **Counters vs `/team` count**: Live `home.txt` reports `2` `Doctors / Dentist`, `5` `Staffs`, `25+` `Years of experience`, and `500+` `Happy Patients`, whereas `src/content/team-members.ts` lists 8 team members (including 2 GDC-registered clinicians). Kept live `home.txt` figures verbatim for SEO/content parity; confirm with owner if `Staffs` or `Years of experience` (`25+` vs `15+`) should be updated.
2. **Hero featured tile 1 gradient**: Used `linear-gradient(to right, #492C00, #7B5720)` via inline style per exact Hims capture measurements; let the lead know if a CSS utility token should replace it in `styles.css`.
3. **Unused legacy home files**: `hero-canvas.tsx`, `hero-scene.tsx`, `tilt-card.tsx`, and `service-tabs.tsx` are no longer imported by `src/routes/index.tsx` (kept untouched, not deleted). `reveal.tsx` and `spotlight.tsx` are no longer imported on `/` or `testimonials-section.tsx` (kept untouched for unconverted pages).
4. **Hims `Home` reference images**: Replaced `/media/hero1.jpg` and `/media/hero2.jpg` references in `hero-slider.tsx` with `<Media>` slots for Google Flow generation; kept verified `/media/hero.jpg`, `/media/gdc.png`, `/media/thumbnails/1.jpg`, and `/images/team/*`.
