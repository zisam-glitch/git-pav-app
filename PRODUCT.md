# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Urgent & emergency dental patients** in Bradford and surrounding West Yorkshire areas (including out-of-hours, weekends, and bank holidays) needing same-day pain relief, extractions, or urgent assessment.
- **Routine, cosmetic & facial aesthetics patients** seeking check-ups, hygiene, whitening, dentures, root canal care, custom grillz/mouthguards, or aesthetic treatments.
- **Care-home & home-bound patients / families** exploring mobile dentistry and virtual video consultations.
- **Prospective dental clinicians & nurses** browsing practice vacancies and sponsorship roles.

## Product Purpose

`www.pavdental.com` is the public marketing, clinical information, patient-enquiry, and online shop website for Pav Dental (786 Leeds Road, Bradford, BD3 9TY). Success means visitors immediately understand available treatments, transparent pricing, and 24/7 emergency access, and can either call `0800 1938 786` or book via Setmore with zero friction—while preserving 100% search-engine parity with the live site.

## Positioning

24-hour, 7-day-a-week private & emergency dental clinic in Bradford combining round-the-clock urgent care, transparent fee tables, and a legacy of accessible community dentistry founded in honour of the late Dr. Pavan Bhogal.

## Operating Context

- **Two visitor actions:** 24/7 emergency phone (`0800 1938 786`) and online booking (`BOOKING_URL` -> `https://pavdental.setmore.com`). Both are on the live site. Whether they get equal prominence is an open owner decision (redesign plan, §6 item 6). Presentation belongs in the surface briefs, not here.
- **Enquiry & petition forms** submit to the staff back-office (`admin-dashboard`), which alerts the practice via Postmark.
- **Clinic details:** 786 Leeds Road, Bradford, BD3 9TY · `0800 1938 786` · WhatsApp `+44 7311 871456` · `hello@pavdental.com`.

## Capabilities and Constraints

- **SEO parity lock:** The 47 live URLs keep their titles, meta descriptions (`website/src/lib/seo.ts`), canonicals on `https://www.pavdental.com`, and `Dentist` JSON-LD. Three are approved exceptions in `website/seo/parity-exceptions.json`: `/gdpr` redirects, and `/services/finance` and `/services/regestration` are not built. The other 44 keep a single `<h1>` and non-empty `alt` text on every image (`npm run seo:parity` against a running build; `seo.test.ts`).
- **Copy truth:** Live-site copy is ported word for word from `website/seo/live-text/` and `website/seo/live-content/`. No fabricated testimonials, star ratings, review counts, signature counters, or invented clinicians (`invented-content.test.ts`). The live shop's star ratings are random and are not ported.
- **Booking links:** Every booking CTA uses `BOOKING_URL` (`booking-links.test.ts`). The site does not add a booking form.
- **Finance wording (blocked):** No 0% or APR finance wording is added or ported until the owner and V12 decide (`docs/completion/04-decisions.md`, D-02 and D-05). At the 18 Nov 2026 review, such wording was still on 11 files. This is an open legal item, not a settled boundary.
- **Registration page (recommended, not decided):** `/services/regestration` is recommended as an information-only page with no online health-history form. The owner has not decided yet.
- **Consent:** GA4 loads only after cookie consent is accepted (`website/src/lib/analytics.ts`).

## Brand Commitments

- **Brand colors (binding):** `#925a27` and `#cf9448`, expanded with cohesive shades and tints across the redesigned visual world. The contrast rules for the gold accent are in the redesign plan.
- **Owner style directives (binding until the owner changes them in writing):** `website/DESIGN_MEMORY.md`. No glass or backdrop blur, no italic text, no `tracking-*` utilities, corners limited to `rounded-md`, `rounded-lg` and `rounded-xl`, `max-w-6xl` content sections, and the header and footer on every page.
- **Name & heritage:** Pav Dental, GDC-registered clinicians (Dr Hassan Bhojani 262970, Dr Cosimo Meucci 280128), and the 8 live team profiles.

## Evidence on Hand

- 47-page live SEO & copy baseline in `website/seo/live-baseline.json` and `website/seo/live-text/`.
- 39 verified live documents and team photos in `website/public/` (listed in `website/seo/live-files.json`).
- Real patient testimonials in `website/src/content/testimonials.ts` and 6 ported blog posts in `website/src/content/blog-posts.ts`.
- Not evidence, and not to be ported: the live shop's star ratings (random), and the home page's "5 Staffs" figure, which conflicts with the 8 live team profiles until the owner confirms it.

## Product Principles

1. **Urgent visitors reach help fast:** a patient in dental pain can reach `0800 1938 786` or book online without searching.
2. **Truthful clinical authority:** Only verified copy, real team profiles, real GDC numbers, and real patient comments appear on the site.
3. **Zero SEO regression:** Every visual upgrade preserves exact URLs, titles, descriptions, headings, structured data, and ported copy.
4. **Accessible everywhere:** Full keyboard focus, semantic landmarks, labelled controls, and comfortable mobile/desktop legibility.

## Accessibility & Inclusion

- **Proposed standard: WCAG 2.2 Level AA** for every public page. Owner to confirm. The app's design system already states AA for its text pairs (`docs/redesign/design-system.md`).
- Moving content, such as the home marquee if it is kept, has a pause control, and motion respects `prefers-reduced-motion`.
- Every form control has a visible label, and each error is shown next to its field.
