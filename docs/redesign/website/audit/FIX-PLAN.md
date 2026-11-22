# Fix plan from the full design audit (23 Nov 2026)

Sources: `audit-shell-home.md` (H-, 23 rows), `audit-services.md` (S-, about 95 rows), `audit-other-pages.md` (O-, 65 rows). About 183 findings: P1 about 28, P2 about 100, P3 about 50. Most share a handful of causes, so the work is grouped by cause, not by page.

Coverage gaps in the audit itself (do these in phase 5): hover states, the open mobile menu, filled cart and checkout, the contact map, 390 px views of most service pages, and lower sections of ten service pages that were measured but not looked at.

## Decisions recorded (23 Nov 2026)

- **D1 Team photos:** keep black and white as a deliberate style. Make all photos match in contrast and crop; compress.
- **D2 Shop pictures:** generate one Hims-style product picture per product (illustrative: the owner confirms they resemble the real items).
- **D3 General dentistry:** the stacked blocks ARE on the live page (`seo/live-text/services--general-dentistry.txt` has the root canal, filling and consent blocks). Keep the words; fix the length by layout (tabs or accordions per treatment), not by removal.
- **D4 Repo-only text:** remove all of it ("Award-Winning", "NHS partners", the team quote band, early retail jobs on Dr Hassan's profile) and list what was removed.
- **D5 Font:** the owner will license CareSans. Until the licence and font files are supplied, stay on Figtree. The CareSans files now in `public/fonts/caresans/` came from the Hims zip and are not licensed for this site.
- **D6 Policy pages:** need legal review before launch (no change from us).

## Phase 0. Owner decisions (block some later work) [answered, see above]

| # | Decision | Blocks |
|---|---|---|
| D1 | Team photos are black and white originals. Supply colour photos, or keep black and white as a deliberate style | team capsules, profiles (O-004, O-030) |
| D2 | Shop products: supply real product photos, or approve generated product pictures (10 products share 8 off-subject pictures) | shop, product, category (O-015, O-016, O-017, O-022, O-023) |
| D3 | General dentistry page stacks root canal, extraction and filling price and consent blocks (11,089 px). Which are on the live page? | S-031, S-092 |
| D4 | Repo-only claims still shown ("Award-Winning", "NHS partners", team quotes, early retail jobs on Dr Hassan's profile) | S-123, S-141, S-152, O-033, O-034, O-011 |
| D5 | Fonts: keep Figtree (licensed, wider than CareSans) or license CareSans | all type tuning |
| D6 | Policy pages hold repo text: legal review | policies |

## Phase 1. Shared shell and kit (no new pictures; touches every page)

1. **Footer seam** (H-001, H-002, H-014, H-022, O-006, O-031, O-056): remove the white gap between a closing band and the footer, and the white slivers at the footer corners. One change in `footer.tsx` and `CtaBand`. Effort S.
2. **Header**: add the desktop navigation (H-019); raise tap targets to 44 px (H-020, H-023, S-008, S-071, S-073, S-144) with `min-h-11` in the shared button and pill classes. Effort M.
3. **Type scale**: swap off-scale headings to `text-hero`, `text-h2-md`, body 16 px (H-011, H-012, H-015, O-007, O-013, O-041, O-047, O-061). Effort M.
4. **Cookie card** is too large (448 x 187): shrink to the Hims banner size. Effort S.
5. **Page titles** (O-005, O-063). Effort S.
6. **Kit swaps** (S-061, S-162 `TreatmentHero`; S-006, S-052, S-083, S-093, S-163 `ClosingBand`; S-033, S-042, S-053 `InfoAccordion`). Effort M.

## Phase 2. Pictures (one batch workflow, Gemini Images page)

Method from `home-image-prompts.md`: a shared style block, one dental subject per picture, the aspect ratio set on the page, crop and compress to 160 KB or less, alt text rewritten with each picture.

1. **14 service heroes** (1344 x 504) and **hub tile crops** (600 px) from the same set (S-001, S-010 to S-150, S-160). They replace spa and jewellery pictures. Fix captions that contradict the picture (whitening strips, outreach vehicle, e-prescription).
2. **Home**: finish the three tiles already generated (whitening, general, mobile), swap the tile markup to the new pictures, replace the Aesthetics and Mobile dentistry pictures (H-003, H-004, H-005, H-006, H-008, H-009).
3. **Shop products**: one picture per product (after D2) (O-015, O-016, O-017, O-022, O-023).
4. **Page heroes that are not dental**: about "future", pricing, vacancies (O-001, O-009, O-038, O-042).
5. **Registration tile** is empty (S-002).
6. **Compress** heavy files with one script: team photos 540 to 785 KB, other pictures 500 to 740 KB, tile PNGs over 160 KB (H-007, H-016, H-017, H-018, S-003, S-013, S-112, S-113, S-164, O-003, O-004, O-030, O-037, O-039). Remove duplicated hidden copies.
7. **Stop reusing** the same file across pages (S-161).

## Phase 3. Layout and structure

1. **Services hub** restructure into Hims category tiles with distinct pictures (S-005, S-006).
2. **General dentistry**: remove or collapse stacked blocks (after D3) (S-031).
3. **Home**: the "dark emergency band" is white, make it a real dark band like Hims (H-010); remove repeated emergency content and the duplicated headings (H-011, H-012, H-015).
4. **Blog**: centre the article column (O-051); stop repeating the same posts in three rows (O-046, O-040, O-044).
5. **Category carousel on mobile** (O-020).
6. **Aesthetics and dentures** sections flagged in S-050 to S-092 as invented layouts: rebuild to the treatment recipe.

## Phase 4. Content (after the owner decisions)

Remove or reword repo-only claims (D4), apply the live-site check pass against www.pavdental.com for S-031, S-092, S-123, S-141, S-152, S-166, and the Dr Hassan profile.

## Phase 5. Verify

- Re-run the audit on every changed page at 1440 and 390, including hover states, the open mobile menu, filled cart and checkout, the contact map.
- SEO: rebuild the "before" fingerprint baseline from commit a8698b0, then run fingerprint and parity on all 55 pages; type check, tests, lint.
- Picture weight and alt text pass.

## Order of work

Phase 0 decisions can run in parallel with phase 1. Phase 1 first (fast, visible on every page). Phase 2 next, in one sitting per group so styles match. Phase 3 after the new pictures are in. Phases 4 and 5 last.

## Phase 1 results (23 Nov 2026)

Done and pushed: footer seam (24 px strip, no 80 px gap, no corner slivers; measured on /, /faq, /pricing), footer intro text smaller, header controls 44 px tall on phones, cookie card shorter on phones.

Checked and not changed, with the reason:
- **H-019 desktop navigation:** the live Hims home header is logo, login and menu only, like ours. No change.
- **O-047 blog headings:** measured on the saved Hims blog: index and all-articles H1 87 px, article H1 62 px. Ours already match. Audit row was wrong.
- **O-005, O-063, H-011, H-015 page titles and heading wording:** changing them breaks the "SEO stays 100% the same" rule (titles, meta and H1/H2 words are fixed). Not changed.
- **O-061 policy text:** body is already 16 px (`text-body`); the 19 px measured is the subtitle. No change.
- **H-012 home H2 sizes:** the 57 px and 48 px steps are the design system's two H2 tiers (main and secondary), so they are intended. No change.
- **O-007 / O-041 about and vacancies H1 82 px:** uses the display-m style; not yet compared with a Hims about page measurement. Left for phase 3.

Still open from phase 1: the shared kit swaps (TreatmentHero, ClosingBand, InfoAccordion). These are tied to the picture and layout work, so they move into phases 2 and 3.
