# Pav Dental Website — Impeccable Redesign Plan

## 1. Confirmed Foundation (`PRODUCT.md` + `.impeccable/config.json`)
- **Mode:** `Persuade` on marketing, service, pricing, team, contact, about, petition, and shop pages; `Read` on blog posts, FAQ, and policy/document pages.
- **Visual Direction:** Full redesign with a new `DESIGN.md` anchored on the brand's **`#925a27`** and **`#cf9448`** palette (expanded with cohesive warm/neutral shades, tints, and high-contrast ink/surface tokens).
- **Build Path:** **Code-first** (`"buildPath": "code"`), verified visually with desktop + mobile screenshots and `seo:parity`.
- **Action Hierarchy:** Dual-priority — **24/7 Emergency Phone (`0800 1938 786`)** and **Setmore `Book Now`** equally prominent.
- **Non-Negotiable Guardrails:** Keep 100% SEO parity (`seo.test.ts`, `seo:parity`), all ported live copy, `BOOKING_URL` (`booking-links.test.ts`), zero invented claims (`invented-content.test.ts`), single `<h1>` per page, and `alt` text on every image.

---

## 2. Execution Phases

### Phase 1: Visual World & Design System Foundation
1. Run `.agents/skills/impeccable/scripts/impeccable concept-seed --scope direction --mode persuade` to derive and lock the replacement visual world around `#925a27` and `#cf9448`, and record the direction contract via `impeccable surface-brief`.
2. Read `reference/craft-floor.md` before any UI edit.
3. Rebuild core design tokens in `website/src/styles.css` (shades & tints of `#925a27` and `#cf9448`, surface hierarchy, typography scale, spacing, radii, and focus rings).
4. Redesign shared layout & UI primitives:
   - `Header` (`website/src/components/home/header.tsx`) — crisp navigation, visible `0800 1938 786` + `Book Now` actions, mobile drawer.
   - `Footer` (`website/src/components/home/footer.tsx`) — structured link columns, clinic address/hours, emergency contact, policy links.
   - Shared `Button`, `Card`, form inputs, and `NotFoundPage`.

### Phase 2: Core Persuade Pages (6 Pages)
- `/` (Home — hero, marquee, practice ethos, services overview, testimonials, counters, contact form)
- `/about` (Dr. Pav legacy story, roadmap, Future of Dentistry, team showcase)
- `/pricing` (hero, 13-category fee tables, Price Match Promise)
- `/contact-us` (hero + form, clinic details/WhatsApp, FAQ, map)
- `/vacancies` (hero, filterable roles, open application)
- `/petition` (campaign copy, signature form, video, contact)

### Phase 3: Services Hub & All 15 Service Pages (16 Pages, Parallel Subagents)
- **Batch A:** `/services`, `/services/emergency-dental`, `/services/aesthetics`, `/services/cosmetic`, `/services/whitening`, `/services/general-dentistry`, `/services/oral-hygiene`, `/services/root-canal`.
- **Batch B:** `/services/tooth-extraction`, `/services/dentures`, `/services/custom-grillz`, `/services/mouthguards`, `/services/mobile-dentistry`, `/services/virtual-dentistry`, `/services/finance`, `/services/regestration`.
- Unify hero rhythm, treatment/pricing tables, consent/post-op sections, FAQ accordions, and dual CTAs (`0800 1938 786` + `Book Now`).

### Phase 4: Read, Team, Shop & Policy Surfaces (25+ Pages, Parallel Subagents)
- **Team & Blog:** `/team` + 8 profiles, `/blog` + 6 articles (editorial `Read` typography & measure).
- **Policies & FAQ:** `/faq`, `/practice-policy`, `/cctv-policy`, `/privacy-policy`, `/terms-and-condition`, `/cookie-policy`, `/complaints-policy`.
- **Shop Flow:** `/shop`, `/category/$slug`, `/shop/$productSlug`, `/cart`, `/checkout`, `/order/$id`, plus `/404`.

### Phase 5: Finish Review, `DESIGN.md` & Full Parity Verification
1. Generate `DESIGN.md` from the built system (`impeccable` `document` flow).
2. Run `cd website && npm run verify && npm run build`.
3. Run full 47-URL `npm run seo:parity` (0 hard failures, 46/46 active `H1: 1`, `Missing Alt: 0`).
4. Capture desktop + mobile screenshots of the redesigned pages and update the visual report.
