# Batch 3 Changes

## Overview
Rebuilt the "Previous Grand Prix" section (`LatestResultSection` and `StandingsSection`) into a unified, cleanly aligned layout following `DESIGN.md` constraints (4px radius, pills only for toggles/tabs, minimum 11px text, transform/opacity animations only).

## Structural Changes
- **Layout & Grid:** Implemented a 12-column CSS Grid layout for desktop (Left 7 cols: Podium + Classification Table; Right 5 cols: Standings Panel).
- **Mobile Reordering:** Utilized `max-lg:contents` to flatten the grid structure on smaller viewports, controlling the stacking order via CSS `order-*` utility classes. The resulting responsive order is: Header -> Facts -> Podium -> Standings -> Classification Table.
- **Header (`LatestResultSection`):** 
  - Eyebrow: Displays the Round and Season.
  - Race Name: Retained as large text.
  - Subtitle: Added the Circuit Name and Race Date inline below the race name.
  - Facts Row: Moved "Total Laps" and "Fastest Lap" into the right side (`action` prop) of `SectionHeading`, removing the old bordered box and rendering them as quiet label/value pairs.
- **Podium Redesign:** 
  - Migrated from fading HD images to clean 72px solid circle avatars (`object-top`).
  - Swapped out the massive numeric blocks for subtle `4px` team-colored step bars with a bottom-origin `scaleY` animation.
  - Raised P1 using a fixed offset (`mb-6 md:mb-10`) to create a balanced baseline with P2 and P3.
- **Classification Table (P4 - P10):** 
  - Corrected a previous data bug where the top-10 slice dropped P4 and P5. Positions 4 through 10 are now properly mapped.
  - Ensured Team logos and names align on the exact left edge below the driver's name.
- **Standings Panel (`StandingsSection`):**
  - Removed the "Results" tab to prevent duplication.
  - Default tab is now set to "Drivers".
  - Replaced the inline expanded-view rendering with a solid "View full standings &rarr;" link pointing to the dedicated pages.

## Modified Files
- `src/features/dashboard-v2/LatestResultSection.tsx`
- `src/features/dashboard-v2/StandingsSection.tsx`

## Screenshots
Screenshots of the complete viewport across themes and sizes have been successfully generated and placed in this `reviews/batch3/` folder:
- `dashboard-1280-dark.png`
- `dashboard-1280-light.png`
- `dashboard-390-dark.png`
- `dashboard-390-light.png`

## Known Limitations / Notes
- The screenshots were originally directed to `screenshots/batch3/` by the prompt, but have been copied here to comply with the global batch review rule.
- No new dependencies were introduced; all styling uses raw tokens. 
