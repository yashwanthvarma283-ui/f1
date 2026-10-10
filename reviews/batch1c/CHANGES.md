# Batch 1c Changes

## Details
- Fixed the Hamilton driver ID issue by retrieving real `driverId` fields from the Jolpica API and fully rewriting `driverImages.ts` using exactly those IDs (e.g. `antonelli`, `russell`, `hamilton`, `leclerc`, `norris`, `max_verstappen`, `piastri`, `hadjar`, `lawson`, `gasly`, `arvid_lindblad`, `colapinto`, `bearman`, `bortoleto`, `hulkenberg`, `ocon`, `alonso`, `sainz`, `albon`, `tsunoda`, `stroll`, `bottas`, `perez`).
- Added a `missingPhotos` array to `driverImages.ts` and introduced a `console.warn` for missing photos in development, satisfying the requirement to track and warn about drivers without images.
- Implemented a unit test `driverImages.test.ts` to assert every driver in the standings has an image or is explicitly logged as missing.
- Refactored `DriverAvatar` to use the 3-letter driver `code` (e.g., HAM, ANT) instead of initials as fallback text, increasing legibility and consistency.
- Corrected row alignments in `LatestResultSection` and `StandingsSection`: The team name now perfectly aligns to the same left edge as the driver name above it by nesting the elements inside a unified CSS grid row with a 20px fixed logo box and 8px gap. 
- Processed the `Mercedes.png` logo via a rewritten `bg_remove.py` script applying an alpha threshold + 1px Gaussian blur to successfully eliminate the opaque background.
- Resolved Audi's missing logo by explicitly mapping it to `AudiNew.png` with `none` treatment in `teamLogos.ts` and writing a unit test `teamLogos.test.ts` to verify every team has a logo mapping.
- Added `lighten-on-dark` treatment to Aston Martin's logo for enhanced legibility.
- Removed the temporary layout changes related to taking screenshots.

## Limitations
- Some driver photos are still missing (`antonelli`, `hadjar`, `lawson`, `arvid_lindblad`, `colapinto`, `bearman`, `bortoleto`) and require manual `.png` files dropped into `/public/drivers/`.
