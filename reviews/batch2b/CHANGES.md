# Batch 2b Changes

## Verification and Cleanup
- Ran rigorous search for banned terms and tokens (`rounded-lg`, `text-[9px]`, `text-[10px]`, `animate-pulse`, `text-white`, `--dv2-hero`) across all target files. Fixed all issues except for `text-white` in `primitives.tsx` and `TimezoneControl.tsx` which are required for contrast against the `bg-[var(--accent)]` (F1-red).
- Confirmed the `index.html` title and meta description no longer contain "Live" or "Telemetry" (updated to "F1 Dashboard" and "Formula 1 Dashboard").
- Confirmed `DESIGN.md` rules correctly updated (banned pills outside toggles/tabs).
- The Haas logo renders correctly in standings/result rows.
- The Mobile Drawer properly displays the timezone chip.

## Spacing Measurements
Verified spacing distances using a Playwright script targeting distances between consecutive section headings/bottoms:
- Section gaps are precisely following the scale defined by `py-5 md:py-7 lg:py-9` wrapper logic.
- Validated gaps: 40px (Mobile 390px), 56px (Tablet 768px), 72px (Desktop 1024px+).

## Polish Pass Details
- **Hero**: Simplified the `CircuitOutline` into an `outline-only` variant. Rendered as a faint (max 8% opacity) backdrop spanning the full bounds without breaking the theme colors. Time format correctly respects the timezone context (e.g., 24h default vs 12h toggle).
- **Standings (Points Bar)**: Ensured points bar is strictly `2px` high on a `1px` high track, correctly inset by `left-4 right-4` across both themes.
- **Header**: Ensured proper alignment and theme switching on the F1 logo and timezone selector.
- **Footer**: Verified there's no empty band above the footer and spacing fits the global scale.
- **All Sections**: Replaced all remaining instances of `rounded-lg` with `rounded` (4px radius per `DESIGN.md`) except allowed tab/toggles. Removed all instances of `animate-pulse` favoring `shimmer`. Updated all `text-[10px]/[9px]` to `text-[11px]` or `text-xs`.

## Tests & Types
- All files passed `tsc` type checking and `oxlint` linting.
- `npx vitest run src` successfully executed with 14 passing tests.
