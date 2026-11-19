# Pav Dental website: Hims design system

The owner's direction (18 Nov 2026): redesign every page of `website/` in the style of Hims (hims.com), exactly as Hims applies it: **same colours, font, type sizes, transitions, widths and section patterns**. The words, prices, people and pages stay Pav Dental's, taken from the live site (www.pavdental.com). This file is the contract. It replaces the older owner style pins in `website/DESIGN_MEMORY.md` (no glass, no tracking, no `rounded-2xl`, `max-w-6xl`, serif titles) wherever they conflict. Everything else in `website/AGENTS.md` still applies.

Every number below was measured on a saved copy of the Hims homepage (the owner's `www.hims.com.zip`), not guessed. If you need a value this file does not have, **measure it on the capture** (section 2) and write it into the "Measured later" list at the bottom.

## 1. Sources of truth

| What | Where |
|---|---|
| Hims homepage, rendered with its real CSS (scripts removed, so images that are loaded by script are blank) | `http://localhost:8099/index.html` (static server, already running) |
| Hims screens and sections for every other page type | Mobbin: `search_screens` (platform `web`, name "Hims" in the query to filter) and `search_sections` |
| Our site (dev server, hot reload) | `http://localhost:8180/<route>` |
| Live Pav Dental words, recorded | `website/seo/live-text/<page>.txt` and `website/seo/live-content/<page>.json` |

If the servers are not running, ask the lead agent (do not start your own on another port).

## 2. How to measure the Hims capture

Open `http://localhost:8099/index.html` in **your own browser tab**, set the viewport with `resize_window` (1440x900 desktop, 390x844 phone), then run JavaScript with `javascript_tool`. Useful snippets:

```js
// Every distinct text style on the page, biggest first: family|size|weight|lineHeight|letterSpacing|colour
(() => { const m = new Map(); for (const el of document.body.querySelectorAll('*')) { let own = ''; for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent; own = own.trim(); if (own.length < 2) continue; const r = el.getBoundingClientRect(); if (!r.width) continue; const cs = getComputedStyle(el); const k = [cs.fontSize, cs.fontWeight, cs.lineHeight, cs.letterSpacing, cs.color].join('|'); const e = m.get(k) || { n: 0, tag: el.tagName.toLowerCase(), ex: own.slice(0, 28) }; e.n++; m.set(k, e); } return [...m].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])).slice(0, 50).map(([k, v]) => `${v.tag} x${v.n} ${k} "${v.ex}"`).join('\n'); })()

// Section outline with offsets, sizes and backgrounds
(() => { const root = document.querySelector('[class*="electric-wind-style__Container"]'); const out = []; const walk = (el, d) => { if (d > 3) return; for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.height < 120 || r.width < 300) continue; const cs = getComputedStyle(c); out.push('  '.repeat(d) + c.tagName.toLowerCase() + '.' + String(c.className).split(' ')[0].replace(/-sc-.*/, '').slice(0, 44) + ` [y${Math.round(r.top + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}] bg=${cs.backgroundColor} pad=${cs.paddingTop}/${cs.paddingLeft}`); walk(c, d + 1); } }; walk(root, 0); return out.join('\n'); })()

// One element: computed style summary
(el => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)} bg=${cs.backgroundColor} color=${cs.color} font=${cs.fontSize}/${cs.fontWeight}/${cs.lineHeight} ls=${cs.letterSpacing} radius=${cs.borderTopLeftRadius} pad=${cs.padding} border=${cs.border} shadow=${cs.boxShadow} transition=${cs.transition}`; })(document.querySelector('YOUR-SELECTOR'))
```

Homepage sections in order (y offsets at 1440): top banner and header, hero with two featured tiles (y200), weight-loss bento on dark brown (y540), sexual-health on deep blue with a product carousel and a bento (y3500), testosterone panel (y5700), labs bento (y9100), "best care by the best in medicine" trust carousel (y11100), newsletter lead capture (y11900), footer (y12540).

## 3. Tokens (all live in `website/src/styles.css`)

### Colour

| Token (class) | Value | Use |
|---|---|---|
| `bg-white` | #ffffff | page |
| `bg-cream` / `bg-tile-cream` | #faf8f2 / gradient 167deg #f4f1e6 to #faf8f2 | tiles, alternate band |
| `bg-sand` | #f2ede5 | alternate band |
| `bg-sage` / `bg-tile-sage` | #e4eee6 / gradient to #f2f9f4 | second tile tint |
| `bg-brown` | #453421 | dark feature section (Hims weight-loss). Text white; accent `gold` #ffc671; CTA hover `gold-hover` #c99547 |
| `bg-navy` | #1c3e56 | dark feature section (Hims sexual health). Text white; accent `butter` #ecd880; text on butter `teal-ink` #1b3745; button `sky` #5c8cb5 |
| `bg-navy-deep` | #0b2029 | darkest tile |
| `bg-black` | #000 | footer, black pill buttons |
| `text-fg` | #1f1f1f (Hims rgba(0,0,0,.88)) | body text |
| `text-muted` | #595959 (.65) | secondary text |
| `text-subtle` | #6e6e6e | tertiary text (5.1:1 on white) |
| `text-terracotta` #8a4242, `text-clay` #b9805b, `text-copper` #96644a, `text-rust` #8a3a34 | | accent words in headlines on light sections |
| `bg-lime` | #e4ff8b | announcement strip |
| `border-border` / `border-border-strong` | rgba(0,0,0,.12) / rgba(0,0,0,.5) | dividers / form controls |

Accent colours are for **large type only** (24px and up, 3:1). Never use `clay`, `copper`, `gold` or `sky` for body-size text on a light background. Dark ink (`text-fg`) on gold, butter and lime. On dark sections body text is `text-white/80`.

Two deliberate departures from the raw Hims values, both for the owner's WCAG 2.2 AA rule: `clay` is Hims #c48a66 darkened 5% (3.3:1 on white instead of 2.9:1); form-field borders are rgba(0,0,0,.5) instead of Hims' .19 (3.9:1 instead of 1.7:1).

### Font

`CareSans` (variable, weight 400 to 700), the file from the Hims capture, in `public/fonts/caresans/`. One sans for everything: Hims uses its serif (IvarSoft) only to draw its logo, so **no serif anywhere**. `Figtree` (open licence) sits behind it for glyphs CareSans lacks (check marks, stars: use SVG icons instead) and is the one-line fallback: put `"Figtree"` first in `--font-sans` if the CareSans licence is ever a problem (also use heading tracking -0.02em then). Licence note for the owner: CareSans belongs to Hims; a licence for hims.com almost certainly does not cover this site.

### Type scale

Sizes are fluid (the Hims formula: the small size at a 360px screen growing to the large size at 1392px). Use the class, never raw `text-4xl`.

| Class | Size (phone to desktop) | Weight | Line height | Tracking | Hims use |
|---|---|---|---|---|---|
| `text-display` | 50 to 82px | 410 | 1 | -0.01em | big figures ("273 lbs"), stat numerals, closing statement |
| `text-hero` | 40 to 57px | 420 | 1 | -0.01em | page H1, section heading in a dark feature |
| `text-h2` | 32 to 57px | 450 | 1.04 | -0.01em | big section heading |
| `text-h2-md` | 32 to 48px | 430 | 1.1 | -0.01em | standard section heading |
| `text-h3` | 25 to 43px | 400 | 1 | -0.01em | "Total care. Totally different." |
| `text-h3-md` | 22 to 33px | 460 | 1.1 | -0.004em | sub-heading, big card statement |
| `text-h4` | 20 to 28px | 470 | 1.15 | 0 | card and tile titles |
| `text-lead` | 18 to 19px | 400 | 1.245 | 0.0216em | intro paragraph |
| `text-body` | 16px | 400 | 1.275 | 0.0225em | body copy |
| `text-label` | 16px | 500 | 1.2 | 0.0025em | button and field labels |
| `text-small` | 14px | 400 | 1.29 | 0.023em | captions, card detail |
| `text-caption` | 13px | 400 | 1.3 | 0.0235em | disclaimers |
| `text-nav` | 16px | 400 | 1.5 | -0.011em | footer and menu links |
| `text-nav-lg` | 18 to 20px | 400 | 1.2 | -0.0088em | menu rows |

Headline pattern: **line one in ink (white on dark), line two (or one key phrase) in an accent colour**, no italics, no uppercase, sentence case. `<Heading size="hero" accent="starts here" tone="terracotta">Your best</Heading>`.

### Radius, shadow, motion, width

| Thing | Value |
|---|---|
| Pill (buttons, chips, round icon buttons) | `rounded-pill` 48px |
| Tile, card, panel, image frame | `rounded-xl` 24px |
| Small card (trust item) | `rounded-lg` 20px, bento 16px (`rounded-md`), form field 14px |
| Header bar top corners | 17px (`rounded-header`) |
| Header shadow / card shadow | `shadow-nav` 0 2px 16px rgba(0,0,0,.05) / `shadow-card` 0 4px 8px rgba(0,0,0,.08) |
| Colour changes | 0.3s ease (`t-colors`) |
| Tile hover | `t-lift`: scale 1.02, white, shadow 0 8px 30px rgba(0,0,0,.12), 0.2s ease-in-out. Image zoom inside a tile: `t-zoom` scale 1.03 |
| Fades | opacity 200ms linear; panels slide 300ms `ease-smooth` cubic-bezier(.29,.36,.04,.99); curtain `ease-curtain` (.72,0,.45,1); bounce `ease-bounce` |
| Widths | `wrap` 1392 (default content), `wrap-inner` 1328, `wrap-bento` 1132, `wrap-prose` 736, `wrap-max` 1728 full bleed. Side padding 16px phone, 24px from 768px |
| Section rhythm | `section-y` 40px phone, 80px desktop. Dark feature sections 56/120 (`space="lg"`) |
| Spacing units | multiples of 4px (Hims `--unit-uNNN`); 24px (1.5rem) is the standard gap |

## 4. Component recipes (measured)

**Buttons** (`Button`, `ButtonLink`, `BookButton`, `CallButton`): pill, 48px tall, 24px side padding, 2px transparent border, label `text-label`. Variants by the section they sit on: `default` black on light; `light` white on dark or on a photo; `outline` white with a hairline on light; `glass` translucent white (rgba 255,255,255,.07, 1px border .17) on dark; `gold` on brown; `butter` on navy; `sky` on navy. Small header pill 34px. Round icon button 42px. Big CTA 69px with 96px radius (`size="lg"`). Hover is a colour change over 0.3s, never a lift. A page has one primary button; Book now and Call are both always reachable.

**Tile** (`Tile`, `TileLink`): 24px radius, 16 to 18px padding, cream gradient. Title `text-h4` with one accent word, small chevron top right, short line `text-small text-muted`, image under it. On brown or navy sections the tile is `glass`: rgba(255,255,255,.07). Bento panels use 40px padding (44/24 for a quote).

**Carousel** (`Carousel`): snap-scroll, shows 1.15 / 2.3 / 3.4 cards (phone / tablet / desktop), 16px gap, round 42px arrows underneath.

**Header** (shell agent): top announcement strip 44px (16px text, optional small pill button); fixed white bar 49px high with rounded top corners and `shadow-nav`; logo left (70x24); right: small pill 34px and a 42px round menu button. The menu opens a right-hand drawer 547px wide (full width on a phone) over a dark curtain rgba(0,0,0,.44), sliding 300ms `ease-smooth`; rows `text-nav-lg` with arrows, small spaced-out section labels, then "top treatments" cards. Every link stays in the server HTML.

**Footer**: black, 24px top radius, 60px padding (24px phone). Left a "Connect" panel (rgba(255,255,255,.11), 24px radius, 430px wide) holding the sign-up/app message and social links. Right link columns with a 14px/500 heading and 16px links (`text-nav`, white .9). Big closing statement in `text-h3`. A giant wordmark across the bottom edge. Legal row small and 66% white.

**Hero**: two columns on desktop (headline, lead, pill buttons, small disclaimer; media right), stacked on a phone. Often a row of category tiles directly under it. Dark hero variant: full-bleed photo or colour with white text.

**Dark feature section**: `Section theme="brown"` or `"navy"`, `space="lg"`; big `text-hero` heading with an accent phrase, glass tiles/cards, gold or butter pill. One per page at most two.

**Quote card**: glass or gradient tile, 44px/24px padding, large `text-h3-md` quote with the key phrase in white and the rest at 50% white, small attribution, round arrows.

**Trust carousel** ("The best care by the best in medicine"): centred `text-h2` heading, 300px-wide cards (20px radius, soft gradient, photo, name 18.6px/500, role).

**Form field**: floating-label feel, 14px radius, 2px border, focus turns black, `text-label` text; submit is a full-width black pill 44 to 48px. Shared `Input`, `Textarea`, `Label` are already restyled.

**FAQ** (`FaqList`): cream rounded rows with a plus that rotates to a cross.

**Marquee strip** (`TrustStrip`): cream rounded bar, icon + phrase items, each phrase in a different accent colour, with a pause button.

## 5. Mapping Hims patterns to Pav pages

| Pav need | Hims pattern to use |
|---|---|
| Page opener (every page) | Hero: H1 with accent phrase + lead + pill buttons + media; service pages add a tile row of related services |
| List of treatments or services | Category `TileLink` grid or `Carousel` of product cards |
| Process: how it works, steps | Numbered bento on cream, or the Hims "Test, Treat, Optimise" three-step band |
| Prices | Cream tiles with the price in `text-h3` and a pill button; fee tables in `bg-white` rounded panels with 1px hairline rows |
| Reassurance, credentials (GDC numbers, same-day, 24/7) | `TrustStrip` plus a `Stat` row; doctors in the trust carousel |
| Patient comments (only the live ones) | Quote card on navy |
| Key promise, offer, emergency | Dark feature section on brown |
| FAQ | `FaqList` |
| Long text (consent, policies) | Prose: `wrap-prose`, `text-body`, headings `text-h3-md`, white page |
| Closing action | `CtaBand` (Book now and Call) |
| Forms | Lead-capture card: 24px radius panel, 60px padding, shared field styles |
| Product (shop) | Cream product tile with image, name, price and a round "+" button; product page like a Hims product page; cart as the 547px drawer |
| Blog | "Popular reads" cards: image, title, read time; article in prose |

## 6. Rules

- **Content truth.** Words, prices, GDC numbers, hours, addresses, patient comments and pages come from `website/seo/live-text/` and the repo's content files. Never invent people, claims, ratings, review counts, awards, before-and-after results or regulatory statements. Do not touch finance wording (0%, APR, interest-free), "Most Popular" or "15+ years" decisions: leave existing words as they are and report them. Generated pictures must be atmospheric (clinic, tools, products, hands, smiles), never a named person, a real staff member or a patient result.
- **Wording.** Keep the live meaning and every live sentence in body copy. You may tighten headings, button labels and one-line leads ever so slightly to fit the Hims layout (shorter, same meaning). Record each change in the page's tracking file (live wording, new wording).
- **Links.** Every Book or appointment link uses `BOOKING_URL` (use `BookButton`). Phone from `PRACTICE_PHONE`. Header, footer and sitemap links come from `src/content/site-links.ts`.
- **Accessibility (WCAG 2.2 AA).** 4.5:1 body, 3:1 large text, controls and focus rings. Every control reachable by keyboard with a visible focus ring. Moving content has a pause button and respects `prefers-reduced-motion`. One H1 per page, headings in order, alt text on every image (empty for decoration). No horizontal scroll at 390px.
- **Performance.** Images with `width`/`height` or an aspect ratio, `loading="lazy"` below the fold, `priority` for the first image only. No new dependencies.
- **Motion.** Only the Hims timings above. No blur-in entrance animation, no tilt, no spotlight, no glass blur, no gradient text.
- **Placeholders.** Until a picture exists use `<Media alt="..." tone="cream" ratio="4 / 3" />` (a soft tinted block of the final shape) and add the picture to the page's "Images needed" table.

## Measured later

(Agents: add rows here: element, value, where measured.)
