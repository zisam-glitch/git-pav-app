# Design Memory & User Preferences

> **Direction changed on 18 Nov 2026.** The owner asked for the whole site to follow Hims (hims.com) exactly as Hims applies it: same colours, font, type sizes, transitions and widths, with Pav Dental's own words and data from the live site. The contract is [docs/redesign/website/hims-design-system.md](../docs/redesign/website/hims-design-system.md); progress is in [docs/redesign/website/tracking.md](../docs/redesign/website/tracking.md). Where this file and that contract disagree, the contract wins. What still stands from the list below is marked **kept**.

## Still binding (kept)

- **No glass or backdrop blur.** Solid surfaces only.
- **No italics.**
- **Clinical rigour and transparency.** Concrete, verifiable statements; nothing the live site does not say.
- **The global `<Header />` and `<Footer />` on every page**, with accessible labels and visible focus and hover states.

## Superseded by the Hims direction

| Old pin | Now |
|---|---|
| No `tracking-*` classes | The Hims type classes (`text-hero`, `text-h2`, ...) carry the measured tracking. Do not add `tracking-*` on top |
| Upright serif titles (`font-display font-bold`) with a sans body | One sans, CareSans, everywhere. No serif |
| `rounded-md`, `rounded-lg`, `rounded-xl` only | Hims radii: 24px tiles (`rounded-xl`), 48px pills (`rounded-pill`), 16 to 20px small cards, 14px form fields |
| Sections `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` | Hims widths: `wrap` 1392, `wrap-inner` 1328, `wrap-bento` 1132, `wrap-prose` 736, `wrap-max` 1728 |
| Palette: primary `#925a27`, gold `#cf9448`, espresso `#2a1c12`, canvas `#fffdf9`, cream `#faf6f0` | Hims palette in `src/styles.css`: white page, cream `#faf8f2` tiles, brown `#453421` and navy `#1c3e56` feature sections, gold `#ffc671`, butter `#ecd880`, black pills |

## Licence note for the owner

CareSans (the Hims typeface, file taken from the owner's capture) is licensed to Hims. A licence for hims.com almost certainly does not cover this site. Figtree (SIL OFL) is already in `public/fonts/figtree/` as the licence-safe stand-in: put `"Figtree"` first in `--font-sans` in `src/styles.css` to switch (and set heading tracking to -0.02em).
