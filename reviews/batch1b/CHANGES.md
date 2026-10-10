# Batch 1b: Minor Corrections

## Overview
Addressed edge cases and contrast issues from Batch 1, strictly adhering to the "no layout redesign, no new dependencies" rules.

## Detailed Changes

### 1. DriverAvatar Fallback Visibility
- **Issue**: Hamilton's image URL was present but failed to load because the key in `driverImages.ts` was still `"hamilton"` instead of the required Jolpica driverId (`"lewis_hamilton"`). 
- **Issue**: The fallback circle (e.g., for Antonelli) on the podium did not span the full footprint of the podium image container.
- **Fix**: 
  - Updated all keys in `driverImages.ts` to strictly match Jolpica IDs (`firstname_lastname`), fixing Hamilton and others.
  - Added a `fallbackClassName` prop to `DriverAvatar.tsx`.
  - Configured the podium avatar fallback to use `w-24 h-24 md:w-32 md:h-32 mb-2 text-3xl md:text-4xl shadow-xl` and increased contrast (`bg-[var(--surface-3)] text-[var(--text-strong)]`).
  - Stopped `maskImage` from applying to the fallback initials circle so the bottom is not artificially cut off.

### 2. Team Logo Sizes & Contrast
- **Issue**: Mercedes logo contrast on dark theme was suboptimal. Logos in rows were slightly too small or inconsistent.
- **Fix**:
  - Updated Mercedes treatment to `lighten-on-dark` in `src/lib/teamLogos.ts`.
  - Standardized all logo sizes in `StandingsSection.tsx` and `LatestResultSection.tsx` driver rows to `h-5 w-10 object-left` (approx 20px height) and constructor standings to `h-5 w-12 object-left`. Podium logos were increased to `h-5 w-12 object-center`. This guarantees they fit cleanly inside the same constrained box without stretching.

### 3. Missing Drivers
The following drivers still need an image in `public/drivers/<driverId>.png`:
- `kimi_antonelli`
- `isack_hadjar`
- `liam_lawson`
- `arvid_lindblad`
- `franco_colapinto`
- `oliver_bearman`
- `gabriel_bortoleto`

### 4. Git Checks & Cleanups
- Confirmed `package.json` and `package-lock.json` have NO new dependencies. Playwright was only temporarily installed.
- No documentation files outside the scope were edited (Batch 1 scope included `README.md`).
- A temporary block of code in `TestDashboardV2.tsx` (used to generate the row of 11 constructor logos for screenshots) was cleanly reverted.
