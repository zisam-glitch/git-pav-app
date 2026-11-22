> **Status on 22 Nov 2026 (read this first): everything below is the pass 1 handoff and is stale.** Pass 1 was finished and merged (#219). Pass 2, a rebuild against twelve more real Hims pages, is on branch `claude/pull-latest-version-c95b98`: every page has been rebuilt and committed (22 Nov), 36 pictures were regenerated in Google Flow, and the full-site SEO check shows 0 failures. Still open: Flow pictures for the lower-priority slots (list in the git log and in the image agent's notes: showcase, about-legacy/future, whitening product, blog, home tiles), a phone-width review of every page, the owner's review, then a PR. To continue read [AGENT-BRIEF-PASS2.md](AGENT-BRIEF-PASS2.md) (agent contract, including "Decisions after wave 1"), the `## Pass 2` section at the end of each file in [pages/](pages/) (what is done and what is left per page), [hims-patterns/](hims-patterns/) (pattern sheets and recipes) and `tools/setup-captures.sh` plus `tools/seo-fingerprint.mjs` (every saved Hims page on :8099 and the SEO before and after check). The pass 1 constraints below (sandbox, Mobbin, content rule, fonts, lint) still hold.

# Handoff: Hims-style redesign of `website/` (state on 18 Nov 2026, 23:00 Dhaka)

Read this first in a fresh session. It is short on purpose: the long working session that produced it was too big to continue cheaply.

## What the owner asked for

Redesign every page of `website/` in the style of Hims (hims.com), exactly as Hims applies it (colours, fonts, font sizes, transitions, widths), using their saved code (`~/Downloads/www.hims.com.zip`) as the measuring source. Pav Dental's words and data stay, taken from the live site (reword ever so slightly, same meaning). Use Mobbin to find similar sections, redesign, take screenshots of the reference and of ours, compare, fix; check the live site for data; use several sub agents; track every page and section in `tracking.md`; generate Hims-like pictures with Google Flow.

## Done and committed on this branch

- [hims-design-system.md](hims-design-system.md): measured tokens, type scale, component recipes, Hims-to-Pav mapping, rules. [hims-measurements.txt](hims-measurements.txt): raw CSS statistics from the Hims capture.
- `website/src/styles.css`: Hims tokens (colours, fluid type classes `text-hero`, `text-h2`, ..., radii, motion, widths). Fonts: CareSans (from the zip) in `public/fonts/caresans/`, Figtree (open licence) fallback in `public/fonts/figtree/`.
- Shared kit `website/src/components/hims/*` (Section, Heading, ButtonLink/BookButton/CallButton, Tile/TileLink, Carousel, TrustStrip, FaqList, CtaBand, SplitFeature, Stat, Media); `ui/button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx` restyled; `lib/utils.ts` teaches tailwind-merge the new type names (without it `text-label text-white` silently drops the size). A living style guide for the kit is in [tools/kit-preview.example.tsx](tools/kit-preview.example.tsx) (copy to `website/src/routes/kit-preview.tsx`, view `/kit-preview`, delete again).
- Tracking system: `pages/*.md` (25 pages, 172 sections, all `todo`), `node docs/redesign/website/build-tracking.mjs` writes `tracking.md`. Agent contract: [AGENT-BRIEF.md](AGENT-BRIEF.md). Group assignments: [AGENT-ASSIGNMENTS.md](AGENT-ASSIGNMENTS.md).
- `website/DESIGN_MEMORY.md` updated: old pins superseded by the Hims direction.

## Not done

**Every page.** Nine sub agents were launched and cut off by the account rate limit before saving any work, so all 172 sections are still `todo`. No images generated. Google Flow: a local project exists and a sign-in window was opened; the owner must sign in personally and confirm membership and credits before anything is generated (credit spend needs their explicit approval).

## Constraints found (do not rediscover)

- **Budget:** plan is Pro; the weekly allowance was 95% used on 18 Nov (resets Sat 22 Nov 02:00 UTC), extra usage off. Nine parallel agents cost far more than that. Run 2 to 3 agents at a time, shell and home first.
- **Sandbox:** Bash cannot reach localhost, cannot start Chrome or Playwright, cannot bind ports. Use the preview tool (`.claude/launch.json`) and the in-app browser (`mcp__Claude_Browser__*`). Each in-app screenshot is saved to a file whose path the tool prints: `cp` it into `docs/redesign/website/shots/<page>/` for the tracking doc. Never copy Mobbin or Hims images into the repo.
- **SEO parity gate:** cannot run `npm run seo:parity` from the shell. Use the in-browser copy: `tools/setup-browser-tools.sh` builds it; it reproduces the recorded ratchet exactly (`/` 46%, `/about` 16%, `/blog` 100%). CI runs the real one.
- **Mobbin:** the working tools are `mcp__ea6c82e2-...__search_screens|search_sections|search_flows` (a connector); the `plugin:mobbin` server needs auth and is not needed. Invoke the `mobbin:search` skill first. Hims screens: `search_screens` with `platform: "web"`, `mode: "standard"` and "Hims" in the query.
- **Content rule (owner):** live wins. Every live sentence stays verbatim in body copy (the ratchet measures live-sentence coverage; rewording drops it); repo-only prices, stats, awards, claims come out and are listed as open questions; features (forms, tabs, calculators) stay. Leave finance wording (0%, APR), "Most Popular", "15+ years" and report them. One finding: the live home page shows hours Monday to Sunday 00:00 to 24:00, the repo contact page shows 08:00 to 22:00. Live wins.
- **Fonts:** CareSans belongs to Hims; its licence almost certainly does not cover this site. One-line switch to Figtree is in `styles.css` (`--font-sans`). The earlier branch `website/impeccable-refresh` (7 unmerged commits, an earlier Hims-style attempt without the real CSS, also ships CareSans) is separate and untouched.
- **Accessibility departures from raw Hims values:** accent `clay` darkened 5%, form borders .5 alpha, `subtle` text #6e6e6e (see the design doc).
- **Lint** is at its cap (`npm run lint -- --max-warnings=62`): new files must add no warnings (do not export non-components from component files). Prettier: 100 columns, double quotes.

## How to resume

1. `docs/redesign/website/tools/setup-browser-tools.sh <new-empty-scratch-dir>` (needs `website/node_modules`: `npm --prefix website ci --ignore-scripts`), then preview_start `website-dev` (8180) and `hims-static` (8099).
2. Launch agents from [AGENT-ASSIGNMENTS.md](AGENT-ASSIGNMENTS.md): first F1 (shell) and A1 (home), review their screenshots against the Hims capture, then S1 to S4, P1, C1, SH in small batches. Tell each to read AGENT-BRIEF.md and the design doc first.
3. After agents: run `node docs/redesign/website/build-tracking.mjs`; `cd website && npx tsc --noEmit && npm test && npm run lint -- --max-warnings=62 && npm run build`; the in-browser parity runner for all pages (no page below its ratchet); remove `kit-preview`; check `git grep -n -E "backdrop-blur|italic|tracking-|font-serif|max-w-6xl" website/src` shrinks to zero in redesigned files.
4. Images: collect the "Images needed" tables from `pages/*.md`, make a style test of about 8 first (Hims look: warm natural light, soft shadows, cream or tinted backgrounds, 3D product renders, no text, no logos, no staff or patient likenesses), get the owner's approval, then generate with Google Flow into `website/public/images/generated/<slot>.jpg`.
5. Do not merge to main until the owner has seen the pages. Open one PR per page batch if the owner wants small reviews (repo rule: one concern per PR).
