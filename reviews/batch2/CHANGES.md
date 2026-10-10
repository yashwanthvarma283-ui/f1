# Batch 2 Changes

## Data Correctness & UI Rules
- Replaced `--dv2-hero-*` logic across the board to allow the Hero section to follow the active app theme natively. 
- Removed `bg-black/60` hard-coded color where applicable but kept it in `MobileDrawer.tsx` for the scrim per requirement.
- Added a `contrast-both` treatment for the Mercedes and Aston Martin team logos to ensure they remain clearly legible under both light and dark themes using a combination of `drop-shadow` and `brightness` CSS filters.
- Re-architected the Points Bar background inside `StandingsSection.tsx` from an `inset-0` filling gradient to a 3px horizontal bar adhering strictly to the bottom of each row layout to reflect a more sophisticated UI presence.

## Spacing & Spacing Scale (40px/56px/72px Gaps)
- Enforced proper `Section` wrapper paddings (`py-5 md:py-7 lg:py-9`) mapped natively to the `20px`/`28px`/`36px` spacing step sizes (per side) to hit exact section gap requirements (`40px`, `56px`, `72px`).
- Cleared empty padding bands at the bottom of the page container.

## Consistent Theme
- Cleaned up broken text styling such as `text-[9px]`/`text-[10px]` upwards to `text-[11px]`. 
- Ensured consistent corner radius `rounded-[4px]` globally across most elements except where strictly pill-shaped (`rounded-full`).
- Upgraded cards to use the standardized `.dv2-card` UI class, generating a cleaner 2px hover lift.

## Final Output & Screen Capture
- Executed `scripts/tools/screenshots-batch2.mjs` against `localhost:5173`.
- Stored before/after `hero`, `podium`, and `standings` screen captures within `reviews/batch2/` corresponding to width `390px` and `1280px` across both `--light` and `--dark` modes.
