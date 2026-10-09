# PitWall F1 - Figma Design Specifications
## Complete Component Library & Design System

**Created:** 2026-10-09  
**For:** Premium F1 Telemetry Dashboard  
**Figma File Structure:** Desktop (1440px) → Tablet (768px) → Mobile (375px)

---

## 📐 Canvas Setup

### Artboard Sizes
```
Desktop:  1440 × 900px (primary)
Tablet:   768 × 1024px
Mobile:   375 × 812px
```

### Grid System
```
Desktop Grid:
- Columns: 12
- Gutter: 24px
- Margin: 48px (left/right)
- Max content width: 1344px

Tablet Grid:
- Columns: 8
- Gutter: 20px
- Margin: 32px

Mobile Grid:
- Columns: 4
- Gutter: 16px
- Margin: 24px
```

---

## 🎨 Color Palette (Create Color Styles)

### Primary Colors
```
Deep Carbon (Background)
HEX: #0A0D14
RGB: 10, 13, 20
HSL: 225°, 33%, 6%
Usage: Main background, darkest surfaces

Racing Red (Accent)
HEX: #E10600
RGB: 225, 6, 0
HSL: 2°, 100%, 44%
Usage: Live states, CTAs, critical alerts
Effects: Add outer glow (0px, 20px, 40% opacity) for hover states

Timing Purple (Fastest)
HEX: #B138DD
RGB: 177, 56, 221
HSL: 284°, 70%, 54%
Usage: Pole position, fastest laps, premium accents

Warning Yellow (Caution)
HEX: #FFD60A
RGB: 255, 214, 10
HSL: 50°, 100%, 52%
Usage: Caution flags, warnings, highlights
```

### Neutral Colors
```
Circuit Silver (Primary Text)
HEX: #F8F9FA
RGB: 248, 249, 250
HSL: 210°, 17%, 98%
Usage: Headings, primary content

Muted Steel (Secondary Text)
HEX: #B4B4C4
RGB: 180, 180, 196
HSL: 240°, 13%, 74%
Usage: Labels, metadata, secondary info

Dark Panel (Card Background)
HEX: #15151E
RGB: 21, 21, 30
HSL: 240°, 18%, 10%
Usage: Card surfaces, elevated panels

Grid Lines (Borders)
HEX: #2A2D3A
RGB: 42, 45, 58
HSL: 229°, 16%, 20%
Usage: Dividers, borders, subtle separators
```

### Team Colors (For Reference)
```
Red Bull:       #1E41FF
Ferrari:        #DC0000
Mercedes:       #00D2BE
McLaren:        #FF8700
Alpine:         #0090FF
Aston Martin:   #006F62
Williams:       #005AFF
AlphaTauri:     #2B4562
Alfa Romeo:     #900000
Haas:           #FFFFFF
```

---

## 📝 Typography System (Create Text Styles)

### Font Families
```
Display/Headings: Inter (Black 900 weight)
Alternative: System-UI, -apple-system, BlinkMacSystemFont

Body: Inter (Regular 400, Medium 500, Semibold 600)

Monospace: "SF Mono", "Consolas", "Monaco", monospace
Usage: Timing data, driver codes, telemetry numbers
```

### Type Scale (Create Text Styles)

#### Display Styles
```
Hero Display
Font: Inter Black 900
Size: 96px (6rem)
Line Height: 90% (86.4px)
Letter Spacing: -4% (-3.84px)
Color: #F8F9FA
Usage: Main hero headlines (MONACO, GRAND PRIX)

Large Display
Font: Inter Black 900
Size: 72px
Line Height: 90%
Letter Spacing: -3%
Color: #F8F9FA
Usage: Section headers

Medium Display
Font: Inter Black 900
Size: 48px
Line Height: 95%
Letter Spacing: -2%
Color: #F8F9FA
Usage: Card titles, subsection headers
```

#### Countdown Numbers
```
Countdown Large
Font: Inter Black 900
Size: 72px
Line Height: 100%
Letter Spacing: -3%
Color: #F8F9FA
Feature: Tabular numerals (enable in OpenType features)
Usage: Days/hours countdown

Countdown Small
Font: Inter Black 900
Size: 60px
Line Height: 100%
Letter Spacing: -2%
Color: #F8F9FA
Feature: Tabular numerals
Usage: Minutes/seconds countdown
```

#### Data Styles
```
Points Large
Font: Inter Black 900
Size: 36px
Line Height: 100%
Color: Team color variable
Feature: Tabular numerals
Usage: Championship points display

Driver Code
Font: SF Mono Bold
Size: 14px
Line Height: 120%
Letter Spacing: 2%
Color: #F8F9FA
Text Transform: UPPERCASE
Usage: Driver abbreviations (VER, HAM, LEC)

Label Small
Font: SF Mono Regular
Size: 10px
Line Height: 140%
Letter Spacing: 8%
Color: #B4B4C4
Text Transform: UPPERCASE
Usage: Metadata labels (PTS, DAYS, SEC)
```

#### Body Styles
```
Body Large
Font: Inter Medium 500
Size: 18px
Line Height: 160% (28.8px)
Color: #F8F9FA
Usage: Intro paragraphs, important content

Body Regular
Font: Inter Regular 400
Size: 16px
Line Height: 160% (25.6px)
Color: #F8F9FA
Usage: Standard body text

Body Small
Font: Inter Regular 400
Size: 14px
Line Height: 150% (21px)
Color: #B4B4C4
Usage: Captions, secondary info

Caption
Font: Inter Medium 500
Size: 12px
Line Height: 140% (16.8px)
Color: #B4B4C4
Usage: Timestamps, metadata
```

---

## 🔲 Spacing System (Create Spacing Variables)

```
Space 1:   4px    (Tight element spacing)
Space 2:   8px    (Icon gaps, small padding)
Space 3:   12px   (Small component padding)
Space 4:   16px   (Standard gap between elements)
Space 5:   24px   (Card padding, medium gaps)
Space 6:   32px   (Large gaps, section spacing)
Space 7:   48px   (Section padding vertical)
Space 8:   64px   (Large section spacing)
Space 9:   96px   (Hero section padding)
Space 10:  128px  (Major section breaks)
```

---

## 🎭 Effects & Shadows (Create Effect Styles)

### Elevation Shadows
```
Shadow Small
Type: Drop Shadow
X: 0, Y: 1, Blur: 2
Color: #000000, Opacity: 5%
Usage: Subtle card lift

Shadow Medium
Type: Drop Shadow
X: 0, Y: 4, Blur: 12
Color: #000000, Opacity: 10%
Usage: Default card elevation

Shadow Large
Type: Drop Shadow
X: 0, Y: 10, Blur: 24
Color: #000000, Opacity: 12%
Usage: Modal, popover elevation

Shadow Hover
Multiple shadows:
1. X: 0, Y: 12, Blur: 32, Color: #000000, Opacity: 15%
2. X: 0, Y: 0, Blur: 20, Color: #E10600, Opacity: 40%
Usage: Hover state on interactive cards
```

### Glow Effects
```
Racing Red Glow
Type: Drop Shadow
X: 0, Y: 0, Blur: 20
Color: #E10600, Opacity: 40%
Usage: Live indicators, hover states

Timing Purple Glow
Type: Drop Shadow
X: 0, Y: 0, Blur: 16
Color: #B138DD, Opacity: 30%
Usage: Pole position indicators
```

### Background Patterns
```
Grid Pattern (Subtle)
Create a 64×64px square
Add 1px stroke in #F8F9FA at 3% opacity
Horizontal line at 0px
Vertical line at 0px
Set as pattern fill
Usage: Hero background overlay

Speed Lines (Diagonal)
Create a 100×100px rectangle
Add diagonal lines:
- Line 1: From (0, 20) to (100, 10), Stroke: #F8F9FA, 0.5px, 4% opacity
- Line 2: From (0, 50) to (100, 40), Stroke: #F8F9FA, 0.5px, 4% opacity
- Line 3: From (0, 80) to (100, 70), Stroke: #F8F9FA, 0.5px, 4% opacity
Set as pattern fill
Usage: Hero section background texture
```

---

## 📦 Component Specifications

### 1. Live Timing Tower Component

**Frame Dimensions:** 400px × 480px

#### Structure
```
Container
├─ Header Bar (400×48px, #E10600)
│  ├─ Live Indicator (8×8px circle, #FFFFFF, pulse animation)
│  ├─ Label ("LIVE TIMING", 12px, SF Mono Bold, #FFFFFF)
│  └─ Clock Icon (16×16px, #FFFFFF)
├─ Accent Bar (4×432px, #E10600, left edge)
└─ Driver Rows (5 rows)
   └─ Row (400×86px, #15151E)
      ├─ Position Badge (40×40px, team color)
      │  └─ Number (14px, Inter Black, team contrast color)
      ├─ Driver Info (flex-1)
      │  ├─ Driver Code (14px, SF Mono Bold, #F8F9FA)
      │  └─ Last Name (12px, Inter Regular, #B4B4C4)
      ├─ Points (36px, Inter Black, #F8F9FA, tabular)
      └─ Status Dot (12×12px, conditional)
```

#### Spacing
```
Header: Padding 12px horizontal, 16px vertical
Row: Padding 16px all sides
Gap between elements: 12px
Row divider: 1px stroke, #2A2D3A
```

#### States
```
Default: 
- Background: #15151E
- Border: None

Hover:
- Background: #1A1D28
- Transition: 150ms ease

Active (Current leader):
- Purple status dot (12×12px, #B138DD)
- Subtle purple glow (0px 0px 12px #B138DD at 30%)
```

---

### 2. Countdown Timer Component

**Frame Dimensions:** 560px × 120px

#### Structure (4 Units in Row)
```
Container (Auto Layout Horizontal, Gap: 16px)
├─ Days Unit (132px × 120px)
│  ├─ Number (72px, Inter Black, #F8F9FA, tabular)
│  └─ Label ("DAYS", 10px, SF Mono, #B4B4C4, UPPERCASE)
├─ Hours Unit (132px × 120px)
├─ Minutes Unit (132px × 120px)
└─ Seconds Unit (132px × 120px)
```

#### Unit Specifications
```
Number:
- Font: Inter Black 900
- Size: 72px
- Line Height: 100%
- Letter Spacing: -3%
- Alignment: Center
- Feature: Tabular nums

Label:
- Font: SF Mono Regular
- Size: 10px
- Letter Spacing: 8%
- Margin Top: 4px
- Alignment: Center
- Color: #B4B4C4
```

#### Animation Notes (for developer reference)
```
When < 24 hours remaining:
- Add subtle pulse effect (scale 1.0 → 1.02 → 1.0, duration: 2s, infinite)
- Racing red glow on numbers (#E10600, 20px blur, 40% opacity)
```

---

### 3. Driver Standings Card Component

**Frame Dimensions:** 800px × 80px

#### Structure
```
Container (Auto Layout Horizontal, #15151E)
├─ Accent Bar (4px width, team color, absolute left)
├─ Progress Bar (100% width, team color at 10% opacity, absolute, height: 80px)
│  └─ Width: Calculated (driver points / leader points × 100%)
├─ Position Number (40px square, team color background)
│  └─ Text (24px, Inter Black, team contrast color)
├─ Driver Info (Flex-1, padding 16px)
│  ├─ Row 1 (Auto Layout Horizontal, gap: 8px)
│  │  ├─ Flag (20×14px, rounded 2px)
│  │  └─ Name ("Lewis HAMILTON", 16px, Inter Semibold)
│  └─ Row 2
│     └─ Team ("Mercedes", 14px, Inter Regular, #B4B4C4)
└─ Points Column (Right aligned, padding 16px)
   ├─ Points Value (36px, Inter Black, team color, tabular)
   └─ Label ("POINTS", 10px, SF Mono, #B4B4C4)
```

#### Spacing
```
Overall padding: 16px vertical, 16px horizontal (after accent bar)
Gap between position and info: 16px
Gap between info and points: auto (pushes right)
```

#### States
```
Default:
- Background: #15151E
- Accent bar: 4px, team color
- Shadow: None

Hover:
- Background: #1A1D28
- Transform: translateY(-4px)
- Shadow: 0px 12px 32px rgba(0,0,0,0.15), team color glow
- Transition: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

#### Animation Timing (for developer)
```
Staggered entrance:
- Delay: position × 80ms (P1: 0ms, P2: 80ms, P3: 160ms, etc.)
- Initial: opacity 0, y: 40px
- Animate to: opacity 1, y: 0
- Duration: 400ms, ease: cubic-bezier(0.22, 1, 0.36, 1)

Progress bar animation:
- Initial: scaleX 0
- Animate to: scaleX (calculated width)
- Delay: position × 80ms + 200ms
- Duration: 800ms, ease: cubic-bezier(0.22, 1, 0.36, 1)
```

---

### 4. Constructor Standings Card (Compact)

**Frame Dimensions:** 480px × 96px

#### Structure
```
Container (Auto Layout Horizontal, #15151E, border-left: 2px team color)
├─ Content (Flex-1, padding 16px)
│  ├─ Row (Auto Layout Horizontal, gap: 12px)
│  │  ├─ Position (24px, Inter Black, #B4B4C4)
│  │  └─ Info
│  │     ├─ Name (16px, Inter Semibold, #F8F9FA)
│  │     └─ Points ("687 points", 12px, Inter Regular, #B4B4C4)
└─ Badge (48×48px)
   └─ Circle (40×40px, team color at 20%, border: 2px team color)
      └─ Inner dot (12×12px, team color)
```

#### Spacing
```
Container padding: 16px all sides
Gap between elements: 12px
Badge margin: 0 (right edge)
```

#### States
```
Default:
- Background: #15151E
- Border-left: 2px team color

Hover:
- Background: #1A1D28
- Scale: 1.02
- Transition: 200ms ease
```

---

### 5. Circuit Stat Tile

**Frame Dimensions:** 320px × 80px

#### Structure
```
Container (Auto Layout Horizontal, gap: 16px, padding: 20px)
├─ Icon (20×20px, #FFD60A)
└─ Content (Auto Layout Vertical, gap: 4px)
   ├─ Label (14px, Inter Regular, #B4B4C4)
   └─ Value (24px, Inter Black, #F8F9FA, tight tracking)
```

#### Icon Options
- Flag (circuit length)
- Zap (race distance)
- Timer (lap record)
- MapPin (location)

---

### 6. Status Badge Component

**Frame Dimensions:** Auto × 28px

#### Structure
```
Container (Auto Layout Horizontal, gap: 8px, padding: 6px 12px)
├─ Background: #E10600 at 10%
├─ Border: 1px #E10600 at 30%
├─ Indicator Dot (8×8px, #E10600, pulse animation)
└─ Label ("NEXT RACE", 12px, SF Mono Bold, #E10600, UPPERCASE, letter-spacing: 4%)
```

#### Variants
```
Live (Red):
- Background: #E10600 at 10%
- Border: #E10600 at 30%
- Text: #E10600
- Dot: Pulse animation

Fastest (Purple):
- Background: #B138DD at 10%
- Border: #B138DD at 30%
- Text: #B138DD
- Dot: Static

Warning (Yellow):
- Background: #FFD60A at 10%
- Border: #FFD60A at 30%
- Text: #FFD60A
- Dot: Blink animation
```

---

### 7. Primary Button Component

**Frame Dimensions:** Auto × 56px

#### Structure
```
Container (Auto Layout Horizontal, gap: 8px, padding: 16px 32px)
├─ Background: #E10600
├─ Clip Path: Polygon (see below)
├─ Text ("VIEW SCHEDULE", 14px, Inter Bold, #FFFFFF, letter-spacing: 4%)
└─ Icon (16×16px, #FFFFFF, Zap or Arrow Right)
```

#### Geometry (Diagonal Corner)
```
Create with vector network:
- Top-left: (0, 0)
- Top-right: (width - 12, 0)
- Bottom-right: (width, height)
- Bottom-left: (0, height)

Result: Diagonal cut on top-right corner (12px)
```

#### States
```
Default:
- Background: #E10600
- Shadow: 0px 4px 12px rgba(225, 6, 0, 0.3)

Hover:
- Scale: 1.02
- Shadow: 0px 6px 16px rgba(225, 6, 0, 0.4)
- Add shine effect (linear gradient overlay, white at 20%, sweep animation)

Active:
- Scale: 0.98
- Shadow: 0px 2px 8px rgba(225, 6, 0, 0.2)
```

---

### 8. Hero Section Layout

**Frame Dimensions:** 1440px × 800px

#### Structure
```
Container (#0A0D14 background)
├─ Background Layer
│  ├─ Grid Pattern (64×64px, #F8F9FA at 3%)
│  └─ Speed Lines (100×100px diagonal pattern, #F8F9FA at 4%)
├─ Content Grid (1344px max-width, 48px side margins)
│  └─ 12-column grid, 24px gutters
│     ├─ Left Column (Span 7) - Hero Content
│     │  ├─ Status Badge (top, 32px from top)
│     │  ├─ Race Name (96px, 24px below badge)
│     │  ├─ Location Info (24px below name)
│     │  ├─ Countdown Timer (32px below location)
│     │  └─ CTA Button (32px below countdown)
│     └─ Right Column (Span 5) - Timing Tower
│        └─ Live Timing Tower component (aligned top with badge)
└─ Bottom Border (2px, #E10600, full width)
```

#### Responsive Breakpoints
```
Desktop (1440px+):
- 7-5 column split
- Hero text: 96px
- Countdown: 72px numbers

Tablet (768px-1439px):
- Stack vertically
- Hero text: 72px
- Countdown: 60px numbers
- Timing tower: Full width below hero

Mobile (375px-767px):
- Single column
- Hero text: 48px
- Countdown: 48px numbers
- Timing tower: Full width, compact height
```

---

### 9. Standings Section Layout

**Frame Dimensions:** 1440px × auto

#### Structure
```
Container (padding: 80px vertical, #0A0D14)
├─ Section Header (24px below top)
│  ├─ Icon (Trophy, 20×20px, #FFD60A)
│  └─ Title ("CHAMPIONSHIP STANDINGS", 36px, Inter Black)
├─ Grid (48px below header, 24px gap)
│  ├─ Left Column (Span 7) - Driver Standings
│  │  └─ Stack of Driver Cards (12px vertical gap)
│  └─ Right Column (Span 5) - Constructor Standings
│     ├─ Label ("CONSTRUCTORS", 12px, SF Mono, #B4B4C4, 16px below)
│     └─ Stack of Constructor Cards (16px vertical gap)
```

---

### 10. Circuit Info Section

**Frame Dimensions:** 1440px × 240px

#### Structure
```
Container (#15151E background, full-width)
├─ Content Grid (1344px max-width, 48px margins)
│  └─ 3-column grid (equal width, 32px gap)
│     ├─ Circuit Length Tile
│     ├─ Race Distance Tile
│     └─ Lap Record Tile
```

---

## 🎬 Animation Guidelines (For Developer Handoff)

### Timing Functions
```
Smooth Out: cubic-bezier(0.22, 1, 0.36, 1)
Usage: Most animations, reveals, slides

Balanced: cubic-bezier(0.65, 0, 0.35, 1)
Usage: Hover states, toggles

Spring: cubic-bezier(0.34, 1.56, 0.64, 1)
Usage: Playful hover effects (not overused)

Expo Out: cubic-bezier(0.16, 1, 0.3, 1)
Usage: Dramatic hero entrances
```

### Duration Scale
```
Instant:  100ms  (State changes)
Fast:     150ms  (Hover transitions)
Base:     250ms  (Standard transitions)
Slow:     400ms  (Card reveals)
Hero:     600ms  (Hero elements)
Dramatic: 800ms  (Progress bars, major animations)
```

### Motion Principles
1. **One Signature Moment**: Hero load sequence is the primary animation
2. **Stagger Carefully**: 80-100ms delays between sequential items
3. **Reduce Motion**: All animations should have reduced-motion alternatives
4. **Performance**: Transform and opacity only (no layout thrashing)

---

## 📱 Responsive Guidelines

### Breakpoint Strategy
```
Mobile First Approach:
1. Design mobile (375px) as baseline
2. Scale up to tablet (768px)
3. Enhance for desktop (1440px)

Key Changes:
- Typography scales (clamp function in CSS)
- Columns collapse: 12 → 8 → 4
- Spacing reduces proportionally
- Components stack vertically on mobile
```

### Component Adaptations
```
Timing Tower:
- Desktop: 400px fixed width, 5 rows
- Tablet: 100% width, 5 rows
- Mobile: 100% width, 3 rows only (top 3)

Countdown:
- Desktop: 4 units horizontal
- Tablet: 4 units horizontal (smaller)
- Mobile: 2×2 grid

Hero Text:
- Desktop: 96px
- Tablet: clamp(48px, 8vw, 72px)
- Mobile: clamp(32px, 10vw, 48px)
```

---

## ✅ Design Checklist

### Before Handing Off to Development
- [ ] All color styles created and named
- [ ] All text styles created with proper OpenType features
- [ ] All effect styles (shadows, glows) created
- [ ] Components have variants (default, hover, active)
- [ ] Auto Layout used for all flexible components
- [ ] Constraints set for responsive behavior
- [ ] All measurements use 4px base unit
- [ ] Accessibility contrast checked (WCAG AA)
- [ ] Developer annotations added for animations
- [ ] Export settings configured (SVG for icons, PNG @2x for images)

### File Organization
```
Figma File Structure:
├─ 📄 Cover Page (Project overview)
├─ 🎨 Design System
│  ├─ Colors
│  ├─ Typography
│  ├─ Spacing
│  └─ Effects
├─ 🧩 Components
│  ├─ Buttons
│  ├─ Cards
│  ├─ Badges
│  └─ Data Displays
├─ 🖥️ Desktop Screens
│  ├─ Hero Section
│  ├─ Standings Section
│  └─ Circuit Info Section
├─ 📱 Tablet Screens
└─ 📱 Mobile Screens
```

---

## 🚀 Export Settings

### For Development Handoff
```
SVG Icons:
- Format: SVG
- Suffix: @svg
- Settings: Outline stroke, include "id" attribute

Raster Images:
- Format: PNG
- Scale: @2x, @3x
- Settings: Constrain proportions

CSS Export:
- Use Figma-to-CSS plugin
- Export color variables
- Export typography styles
- Export spacing tokens
```

---

## 📝 Notes for Developer

### Critical Details
1. **Tabular Numerals**: All countdown and points numbers MUST use tabular (monospace) number rendering
2. **Team Colors**: Store as CSS variables, not hardcoded
3. **Border Radius**: Most elements use 0px (sharp), only badges/pills use 4-8px
4. **Accent Bars**: Always 4px width, team color, positioned left edge
5. **Shadows**: Only appear on hover states, not default
6. **Typography**: Letter-spacing in Figma shows as %, convert to px or em in CSS

### Performance Targets
- 60fps animations (use transform/opacity only)
- Lazy load images below fold
- Preload hero fonts
- CSS Grid for layouts (not floats or positioning)

---

**Questions?** Reference the live prototype at: `http://localhost:5174/test/dashboard`

**Ready to build?** All measurements are production-ready. Use this as your single source of truth for implementation.
