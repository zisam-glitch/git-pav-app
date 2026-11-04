# Design system (Phase 2, Wise baseline)

Tokens live in `pavdental/src/theme`, components in `pavdental/src/components`. Token **names are unchanged**,
so every screen already picks up the new values; Phase 3 reworks the screens that draw their own controls.
Sources: the Wise screens listed at the top of `reference-map.md`.

## Colour

| Token | Value | Use |
|---|---|---|
| `background` | `#FFFFFF` | Screen canvas (Wise is white) |
| `systemBackground` | `#F2F4EF` | Cards and grouped surfaces |
| `sheet` (new) | `#FFFFFF` | Bottom sheets and modals |
| `accent` (new) / `onAccent` | `#9FE870` / `#163300` | Primary button, selected chip (Wise bright green, forest text) |
| `accentSubtle` (new) | `#E2F6D5` | Secondary pill ("Add money") |
| `ink` / `onInk` | `#163300` / `#FFFFFF` | Icons, links, dark surfaces (Wise forest green) |
| `inkSubtle` | `#E8EBE6` | Neutral fill: icon buttons, chips, disabled |
| `label` / `secondaryLabel` / `tertiaryLabel` | `#0E0F0C` / `#454745` / `#5F615F` | Text |
| `separator` / `inputUnderline` | `#E2E4DF` / `#868685` | Dividers / field border |
| `success`, `warning`, `danger`, `info` | `#2F5711`, `#5C4A00`, `#A8200D`, `#163300` | Status text, each with a `…Subtle` fill |

Light only, as before (`app.json` sets `userInterfaceStyle: light`). Every text pair passes WCAG AA; see
`src/__tests__/accessibility.test.ts` and `src/__tests__/design-system.test.ts`.

## Type (SF Pro standing in for Wise Sans)

`largeTitle` 30/800 tight · `title` 22/700 · `headline` 16/600 (row titles, buttons) · `body` 16 ·
`subhead` 15 grey · `footnote` 14 grey · `caption` 13 · `overline` 14/500 grey (sentence-case section labels) ·
`micro` 11/600. Dynamic Type stays on.

## Shape and spacing

Radii: fields 10, panels 12, cards 16, sheets 24, buttons/chips/avatars/icon buttons pill. Gutter 16 (Wise).
Sizes: button 52, small pill 36 (+hit slop to 44), icon button 44, list icon 48, field 52, row 72.
Flat: no shadows except floating toasts and sheets.

## Components

| Component | Wise treatment |
|---|---|
| `Button` | Pill. Primary bright green / forest text; secondary light green; destructive light red; ghost text; disabled neutral grey |
| `Input` | Bold label above; white field, 1pt grey border, 2pt forest on focus, red on error |
| `ListRow` | No fill (works on canvas or card); semibold title, grey subtitle, dark chevron |
| `IconTile` | 48pt white circle with hairline border, dark outline icon |
| `IconButton` | 44pt grey circle, forest icon (back, close) |
| `Card` | Neutral surface, 16pt corners; `dark` = forest, `accent` = light green |
| `ChipPill` | Neutral pill; selected = bright green |
| `Badge` | Status pill |
| `SectionHeader` | Grey label; action is an underlined forest link ("Change", "See all") |
| `ConfirmSheet` | White, sized to its content, buttons above the home indicator (fixes the cut-off button) |
| `Sheet` (new) | Wise page sheet: round close, large title, scrolling content, sticky footer |
| `Toast`, `EmptyState`, `ErrorState`, skeletons | Token-based; restyled through the palette |

Not applicable: Wise's amount input. Pav Dental has no amount entry (deposits are fixed by the service).
