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

- **Dual-priority visitor actions:** 24/7 emergency phone (`0800 1938 786`) and online booking (`BOOKING_URL` -> `https://pavdental.setmore.com`) are equally prominent across marketing and service pages.
- **Enquiry & petition forms** submit to the staff back-office (`admin-dashboard`), which alerts the practice via Postmark.
- **Clinic details:** 786 Leeds Road, Bradford, BD3 9TY · `0800 1938 786` · WhatsApp `+44 7311 871456` · `hello@pavdental.com`.

## Capabilities and Constraints

- **SEO parity lock:** All 47 live URLs, titles, meta descriptions (`website/src/lib/seo.ts`), canonicals on `https://www.pavdental.com`, `Dentist` JSON-LD, single `<h1>` per page, and non-empty `alt` text on every image must remain intact (`npm run seo:parity`, `seo.test.ts`).
- **Copy truth:** Live-site copy ported in `website/src/` (`seo/live-text/`) is preserved; no fabricated testimonials, star ratings, review counts, or invented clinicians (`invented-content.test.ts`).
- **Booking links:** Every booking CTA uses `BOOKING_URL` (`booking-links.test.ts`).
- **Compliance boundaries:** `/services/finance` carries no unverified APR/credit-broking claims pending FCA/V12 sign-off; `/services/regestration` is information-only with no online health-history form; GA4 loads only after cookie consent.

## Brand Commitments

- **Brand colors (binding):** `#925a27` and `#cf9448`, expanded with cohesive shades and tints across the redesigned visual world.
- **Build path:** `code` (code-first, audited visually against the rendered build).
- **Name & heritage:** Pav Dental, GDC-registered clinicians (Dr Hassan Bhojani 262970, Dr Cosimo Meucci 280128), and the 8 live team profiles.

## Evidence on Hand

- 47-page live SEO & copy baseline in `website/seo/live-baseline.json` and `website/seo/live-text/`.
- 39 verified live documents and team photos in `website/public/`.
- Real patient testimonials in `website/src/content/testimonials.ts` and 6 ported blog posts in `website/src/content/blog-posts.ts`.

## Product Principles

1. **Immediate clarity under urgency:** A patient in dental pain finds `0800 1938 786` and `Book Now` within the first viewport without hunting.
2. **Truthful clinical authority:** Only verified copy, real team profiles, real GDC numbers, and real patient comments appear on the site.
3. **Zero SEO regression:** Every visual upgrade preserves exact URLs, titles, descriptions, headings, structured data, and ported copy.
4. **Accessible everywhere:** Full keyboard focus, semantic landmarks, labelled controls, and comfortable mobile/desktop legibility.
