# Batch 1: Dashboard Data Correctness, Images, and Credits

## Overview
This batch focused exclusively on fixing data correctness issues, displaying correct driver photos and team logos with proper theme support, and updating data source credits. No structural redesigns or new dependencies (other than a temporary Playwright installation for screenshots) were introduced.

## Detailed Changes

### 1. Driver Photos by Jolpica ID
- **Issue**: Lookups previously used car numbers (e.g., #1 or #3), which led to incorrect driver photos showing, while missing drivers failed silently.
- **Fix**: 
  - Refactored `src/lib/driverImages.ts` to map images using Jolpica driver IDs (e.g., `max_verstappen`).
  - Added a `getDriverImage(driverId)` function to check local fallbacks (`/drivers/{driverId}.png`).
  - Created `<DriverAvatar>` component (`src/features/dashboard-v2/DriverAvatar.tsx`) to elegantly display the image with proper attributes (`loading="lazy"`, `decoding="async"`), and fall back to themed initials if an image fails to load or is missing.
  - Implemented this component in `LatestResultSection.tsx`.
- **Missing Photos**: Currently missing headshots for rookies/reserve drivers: Kimi Antonelli, Isack Hadjar, Liam Lawson, Arvid Lindblad, Franco Colapinto, Oliver Bearman, Gabriel Bortoleto.

### 2. Team Logo Mapping and Theme Treatments
- **Issue**: Several team logos were incorrectly mapped (e.g., Haas to Cadillac) or invisible depending on the active theme (e.g., black Cadillac logo invisible on dark mode, white Racing Bulls logo invisible on light mode).
- **Fix**:
  - Updated `src/lib/teamLogos.ts` to include a `treatment` metadata field alongside the `src` mapping.
  - Created `<TeamLogo>` component (`src/features/dashboard-v2/TeamLogo.tsx`) that reads the treatment (e.g., `lighten-on-dark`, `darken-on-light`) and applies CSS filters automatically based on the active theme.
  - Added Haas (`HaasClean.png`) and Cadillac logos.
  - Replaced manual `<img>` tags with `<TeamLogo>` in `LatestResultSection.tsx` and `StandingsSection.tsx`.
  - Added unit test `src/lib/teamLogos.test.ts` to assert every 2026 constructor has a defined mapping.

### 3. Countdown Label Logic
- **Issue**: The countdown label checked time until the next *session*, not the *race* itself, and didn't auto-update without a page refresh.
- **Fix**:
  - Extracted time calculation into a new `useNow` hook (`src/hooks/useNow.ts`) that ticks every 60 seconds.
  - Updated `DashboardHero.tsx` to compute days from the RACE session specifically, accurately displaying "Race day", "1 day to go", or "N days to go".

### 4. Logo File Cleanups
- **Issue**: Unused logo files cluttered the public directory, and some had fake transparency checkerboards (Audi) or noisy backgrounds (Mercedes).
- **Fix**:
  - Moved unused logos to `design-reference/_unused-logos/`.
  - Ran a background removal script (`scripts/tools/bg_remove.py`) to generate `MercedesClean.png` and `HaasClean.png`.

### 5. Data Sources & Credits Update
- **Fix**:
  - Expanded the Data Sources column in `Footer.tsx` to include `Jolpica-F1`, `OpenF1`, `FastF1`, and `F1 Race Replay by IAmTomShaw`.
  - Updated `README.md` to feature these credits, warning users to check the license for F1 Race Replay before copying code.
  - Removed all banned marketing words from the repository documentation.

## Screenshots
Screenshots of the UI differences in both Light and Dark modes at desktop (`1280px`) and mobile (`390px`) breakpoints are available in this directory:
- `podium_*`
- `standings_*`
- `footer_*`
