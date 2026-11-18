# Site shell: header, footer, cookie banner, 404

- Agent group: **F1**
- Route(s): `every page`
- Route file(s): `website/src/routes/__root.tsx`
- Live words: n/a
- Note: Links come from website/src/content/site-links.ts. reset-password and verify-email are app pages: restyle only through shared tokens.

Status: `todo` not started, `built` redesigned but not yet compared, `verified` compared with the reference at 1440 and 390 and the gaps fixed, `blocked` see notes. Keep the table header and the row format: `docs/redesign/website/build-tracking.mjs` reads it. In the 1440 and 390 columns put `ok` once checked, or a relative link to a saved screenshot. In the Copy column put `same` or `reworded` (and list it below).

## Sections

| # | Section | File | Reference (Hims capture / Mobbin links) | Status | 1440 | 390 | Copy | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | header | `website/src/components/home/header.tsx` | Hims capture header + [Mobbin header](https://mobbin.com/sites/sections/9ade11e2-61a0-4e63-a2c8-a093c9bd3ac0) | verified | [ok](../shots/shell/01-header-1440.png) | [ok](../shots/shell/01-header-390.png) | same | 44px `bg-lime` strip (`24/7 dental care in Bradford` + `PRACTICE_PHONE` pill) + sticky 49px `rounded-t-header` bar + `BookButton size="sm"` + 42px menu button + 547px `inert` right drawer ([drawer 1440](../shots/shell/01-drawer-1440.png), [drawer 390](../shots/shell/01-drawer-390.png)) with all `NAV_LINKS` & `SERVICE_PAGES` in SSR HTML, focus trap & Escape. |
| 2 | footer | `website/src/components/home/footer.tsx` | Hims capture footer + [Mobbin footer 1](https://mobbin.com/sites/sections/c04c5d1d-2267-48ba-a767-8668014e7ed0) + [Mobbin footer 2](https://mobbin.com/sites/sections/572867f5-c7e0-47e1-bb03-8668014e7ed0) | verified | [ok](../shots/shell/02-footer-1440.png) | [ok](../shots/shell/02-footer-390.png) | same | `bg-black text-white rounded-t-xl`, `FOOTER.about` in `text-h3`, 430px `bg-white/11` Connect panel (`PRACTICE_HOURS`, address, email, phones, `SOCIAL_LINKS`), 3 link columns (`FOOTER.quickLinks`, `SERVICE_PAGES`, `FOOTER.policyLinks`), legal row `text-white/66`, giant bottom wordmark `text-white/17`. |
| 3 | cookie consent | `website/src/components/home/cookie-consent.tsx` | Hims card/pill tokens | verified | [ok](../shots/shell/03-cookie-1440.png) | [ok](../shots/shell/03-cookie-390.png) | same | Restyled to `rounded-xl shadow-card bg-white` (`p-4 md:p-5`) + `bg-cream` icon badge + Hims `sm` pill buttons; GA consent logic untouched; dismisses cleanly on Decline/Accept. |
| 4 | scroll progress | `website/src/components/home/scroll-progress.tsx` | Hims capture (none) | verified | ok | ok | same | Returns `null` with exported `ScrollProgress` signature preserved. |
| 5 | not found page (page composition) | `website/src/components/not-found/not-found-page.tsx` | Hims `Section`, `Heading`, `BookButton`, `CallButton`, `bg-tile-cream` | verified | [ok](../shots/shell/05-not-found-1440.png) | ok | same | Returns HTTP 404; white band with `Heading` (`terracotta` accent), `BookButton` + `CallButton`, 8-tile `NOT_FOUND.links` grid, cream emergency callout with `PRACTICE_PHONE`. |
| 6 | account link layout | `website/src/components/account/account-link-layout.tsx` | Hims `bg-cream`, `rounded-xl`, `rounded-pill` | verified | ok | ok | same | Restyled to `bg-cream`, `wrap-prose`, `rounded-xl border-border shadow-card`, `text-h3-md`, and `rounded-pill bg-black` `OpenAppLink`. |

## Wording changes

| Where | Live wording | New wording | Why |
|---|---|---|---|

## Images needed (Google Flow)

| Slot | Used in | Aspect | Prompt | File to create | Status |
|---|---|---|---|---|---|

## Verification log

- 2026-11-19: Compared header, drawer (Escape + focus trap), footer, cookie consent, and `/nonexistent-page-404` (HTTP 404) at `1440x900` and `390x844` against `http://localhost:8099/index.html` and Mobbin references. Tightened mobile cookie consent padding (`p-4 md:p-5`). Verified zero page-level horizontal overflow at 390px and clean dismissal of cookie banner.

## Open questions for the lead

1. **Header logo mark**: Replaced the external `res.cloudinary.com` logo PNGs in `header.tsx` and `footer.tsx` (per the no-external-image-URL rule) with a CareSans typographic `Pav Dental` wordmark in `header.tsx` and the bottom SVG wordmark in `footer.tsx`. Confirm whether a dedicated SVG wordmark asset should replace the text mark later.
2. **Unconverted routes with fixed-header top spacers**: Made the 49px header bar `sticky top-0` (after the 44px flow-positioned lime announcement strip) so it never overlaps pages without top padding. Unconverted pages that still have `pt-20`/`pt-24` spacers (`about.tsx`, `pricing.tsx`, `contact-us.tsx`, etc.) will have extra top whitespace until those route groups update them.
3. **Browser visual pass**: No browser tools are available in this subagent session; all 6 sections are marked `built` pending the lead agent's 1440/390 screenshot comparison against `http://localhost:8099/index.html`.
