#!/usr/bin/env python3
"""
PitWall F1 Fan Hub - Premium Presentation Generator
Creates a visually stunning PowerPoint presentation with F1-inspired design.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import nsmap
from pptx.oxml import parse_xml
import math

# Create presentation with 16:9 aspect ratio
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# F1 Color Palette
F1_RED = RGBColor(225, 6, 0)           # Primary F1 Red
DARK_BG = RGBColor(15, 15, 20)          # Deep dark background
CARD_BG = RGBColor(25, 25, 35)          # Card/box background
WHITE = RGBColor(255, 255, 255)
OFF_WHITE = RGBColor(240, 240, 245)
GRAY = RGBColor(148, 163, 184)
LIGHT_GRAY = RGBColor(203, 213, 225)
DARK_GRAY = RGBColor(71, 85, 105)

# Team Colors
MCLAREN_ORANGE = RGBColor(255, 128, 0)
MERCEDES_CYAN = RGBColor(0, 210, 190)
FERRARI_RED = RGBColor(237, 28, 36)
RED_BULL_BLUE = RGBColor(30, 65, 255)
ASTON_GREEN = RGBColor(0, 111, 98)
ALPINE_BLUE = RGBColor(0, 144, 255)

# Sector Colors (FIA Standard)
SECTOR_PURPLE = RGBColor(160, 32, 240)
SECTOR_YELLOW = RGBColor(255, 215, 0)
SECTOR_GREEN = RGBColor(0, 200, 80)

def add_gradient_background(slide, color1, color2):
    """Add a subtle gradient background effect using shapes."""
    # Main background
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color1
    bg.line.fill.background()

    # Subtle accent shape (diagonal gradient effect)
    accent = slide.shapes.add_shape(
        MSO_SHAPE.RIGHT_TRIANGLE,
        Inches(8), Inches(0),
        Inches(5.333), Inches(7.5)
    )
    accent.fill.solid()
    accent.fill.fore_color.rgb = color2
    accent.fill.fore_color.brightness = 0.05
    accent.line.fill.background()

def add_racing_stripe(slide, y_position, color, width=Inches(0.08)):
    """Add an animated-looking racing stripe."""
    stripe = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        0, y_position,
        prs.slide_width, width
    )
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = color
    stripe.line.fill.background()

    # Add glow effect shape
    glow = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        0, y_position - Inches(0.02),
        prs.slide_width, width + Inches(0.04)
    )
    glow.fill.solid()
    glow.fill.fore_color.rgb = color
    glow.fill.fore_color.brightness = 0.3
    glow.line.fill.background()

def add_corner_accent(slide, color):
    """Add corner racing stripe accent."""
    # Top-left corner accent
    corner1 = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        0, 0,
        Inches(0.5), Inches(0.08)
    )
    corner1.fill.solid()
    corner1.fill.fore_color.rgb = color
    corner1.line.fill.background()

    corner2 = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        0, 0,
        Inches(0.08), Inches(0.5)
    )
    corner2.fill.solid()
    corner2.fill.fore_color.rgb = color
    corner2.line.fill.background()

    # Bottom-right corner accent
    corner3 = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(12.833), Inches(7.42),
        Inches(0.5), Inches(0.08)
    )
    corner3.fill.solid()
    corner3.fill.fore_color.rgb = color
    corner3.line.fill.background()

    corner4 = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(13.253), Inches(7.0),
        Inches(0.08), Inches(0.5)
    )
    corner4.fill.solid()
    corner4.fill.fore_color.rgb = color
    corner4.line.fill.background()

def add_card(slide, left, top, width, height, color=CARD_BG, border_color=None):
    """Add a card/container with optional border accent."""
    # Shadow effect
    shadow = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        left + Inches(0.05), top + Inches(0.05),
        width, height
    )
    shadow.fill.solid()
    shadow.fill.fore_color.rgb = RGBColor(0, 0, 0)
    shadow.fill.fore_color.brightness = -0.5
    shadow.line.fill.background()

    # Main card
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        left, top, width, height
    )
    card.fill.solid()
    card.fill.fore_color.rgb = color
    card.line.fill.background()

    # Border accent line
    if border_color:
        border = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            left, top,
            Inches(0.05), height
        )
        border.fill.solid()
        border.fill.fore_color.rgb = border_color
        border.line.fill.background()

    return card

def add_icon_bullet(slide, left, top, icon_text, color):
    """Add a styled bullet point with icon."""
    # Icon circle
    circle = slide.shapes.add_shape(
        MSO_SHAPE.OVAL,
        left, top,
        Inches(0.25), Inches(0.25)
    )
    circle.fill.solid()
    circle.fill.fore_color.rgb = color
    circle.line.fill.background()

    # Icon text
    tf = circle.text_frame
    tf.paragraphs[0].text = icon_text
    tf.paragraphs[0].font.size = Pt(12)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = WHITE
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    tf.word_wrap = False

# ============================================================================
# SLIDE 1: TITLE SLIDE
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])

# Background with gradient effect
add_gradient_background(slide, DARK_BG, RGBColor(25, 20, 30))

# Large racing stripe
add_racing_stripe(slide, Inches(2.8), F1_RED, Inches(0.15))

# Top corner accents
corner1 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(2), Inches(0.06))
corner1.fill.solid()
corner1.fill.fore_color.rgb = F1_RED
corner1.line.fill.background()

corner2 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(0.06), Inches(2))
corner2.fill.solid()
corner2.fill.fore_color.rgb = F1_RED
corner2.line.fill.background()

# Main title
title_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.5), Inches(1.3))
tf = title_box.text_frame
tf.paragraphs[0].text = "PITWALL"
tf.paragraphs[0].font.size = Pt(96)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE
tf.paragraphs[0].font.name = "Arial Black"
tf.paragraphs[0].alignment = PP_ALIGN.LEFT

# F1 Badge
badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.85), Inches(2.2), Inches(0.45))
badge.fill.solid()
badge.fill.fore_color.rgb = F1_RED
badge.line.fill.background()
tf = badge.text_frame
tf.paragraphs[0].text = "F1 FAN HUB"
tf.paragraphs[0].font.size = Pt(18)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE
tf.paragraphs[0].alignment = PP_ALIGN.CENTER

# Subtitle
sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(3.6), Inches(10), Inches(0.8))
tf = sub_box.text_frame
tf.paragraphs[0].text = "Personal F1 Telemetry Command Center"
tf.paragraphs[0].font.size = Pt(32)
tf.paragraphs[0].font.color.rgb = LIGHT_GRAY
tf.paragraphs[0].font.name = "Arial"

p = tf.add_paragraph()
p.text = "with Live Race Replay Engine"
p.font.size = Pt(28)
p.font.color.rgb = GRAY
p.font.name = "Arial"

# Feature highlights at bottom
features = [
    ("REPLAY ENGINE", MERCEDES_CYAN),
    ("LIVE TELEMETRY", MCLAREN_ORANGE),
    ("TYRE ANALYTICS", FERRARI_RED)
]

for i, (text, color) in enumerate(features):
    x = Inches(0.8 + i * 3.5)

    # Feature box
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.8), Inches(3.2), Inches(0.5))
    box.fill.solid()
    box.fill.fore_color.rgb = RGBColor(30, 30, 40)
    box.line.color.rgb = color
    box.line.width = Pt(2)

    tf = box.text_frame
    tf.paragraphs[0].text = text
    tf.paragraphs[0].font.size = Pt(14)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

# Version tag
version_box = slide.shapes.add_textbox(Inches(10.5), Inches(6.9), Inches(2.5), Inches(0.4))
tf = version_box.text_frame
tf.paragraphs[0].text = "React 19  |  TypeScript  |  2024"
tf.paragraphs[0].font.size = Pt(12)
tf.paragraphs[0].font.color.rgb = DARK_GRAY
tf.paragraphs[0].alignment = PP_ALIGN.RIGHT

# ============================================================================
# SLIDE 2: PROJECT OVERVIEW
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 20, 28))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

# Title
title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "PROJECT OVERVIEW"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE
tf.paragraphs[0].font.name = "Arial Black"

# Main content card
add_card(slide, Inches(0.5), Inches(1.5), Inches(12.333), Inches(5.5), border_color=F1_RED)

# Content
content_box = slide.shapes.add_textbox(Inches(1), Inches(1.8), Inches(11.5), Inches(5))
tf = content_box.text_frame
tf.word_wrap = True

points = [
    ("Comprehensive F1 Fan Command Center", "Web application for live telemetry, race replay, and analytics"),
    ("Live Session Countdown", "Real-time timer with weekend timetable and next race hero"),
    ("Interactive Race Replay Engine", "20 cars animated on GPS track with timing tower"),
    ("Deep Telemetry Analysis", "Bayesian tyre degradation, sector breakdowns, lap evolution"),
    ("Multi-Source Data Pipeline", "OpenF1, Jolpica Ergast, FastF1 with intelligent fallbacks"),
    ("Modern Tech Stack", "React 19, TypeScript, Tailwind CSS 4, TanStack Query 5"),
    ("Dual Theme System", "Race Night / Race Day with View Transitions API")
]

for i, (title, desc) in enumerate(points):
    if i > 0:
        p = tf.add_paragraph()
        p.text = ""
        p.space_before = Pt(16)

    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {title}"
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(16)

    p2 = tf.add_paragraph()
    p2.text = f"   {desc}"
    p2.font.size = Pt(16)
    p2.font.color.rgb = LIGHT_GRAY
    p2.space_before = Pt(4)

# ============================================================================
# SLIDE 3: TECH STACK (TWO COLUMNS)
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 22, 28))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

# Title
title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "TECHNOLOGY STACK"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Left column - Frontend
add_card(slide, Inches(0.4), Inches(1.5), Inches(6), Inches(5.5), border_color=MCLAREN_ORANGE)

left_title = slide.shapes.add_textbox(Inches(0.7), Inches(1.7), Inches(5.5), Inches(0.6))
tf = left_title.text_frame
tf.paragraphs[0].text = "FRONTEND"
tf.paragraphs[0].font.size = Pt(26)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = MCLAREN_ORANGE

left_content = slide.shapes.add_textbox(Inches(0.7), Inches(2.4), Inches(5.5), Inches(4.5))
tf = left_content.text_frame
tf.word_wrap = True

frontend_tech = [
    ("React 19.2.8", "Latest concurrent features"),
    ("TypeScript 6.0", "Strict mode enabled"),
    ("Tailwind CSS 4.3", "Semantic design tokens"),
    ("Motion 14.0", "GPU-accelerated animations"),
    ("TanStack Query 5", "24h cache persistence"),
    ("React Router 7", "Lazy-loaded routes"),
    ("Lucide React", "Icon library"),
    ("Vite 8.3", "Lightning-fast builds")
]

for i, (name, desc) in enumerate(frontend_tech):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"• {name}"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(10)

    p2 = tf.add_paragraph()
    p2.text = f"  {desc}"
    p2.font.size = Pt(14)
    p2.font.color.rgb = GRAY

# Right column - Data & APIs
add_card(slide, Inches(6.933), Inches(1.5), Inches(6), Inches(5.5), border_color=MERCEDES_CYAN)

right_title = slide.shapes.add_textbox(Inches(7.233), Inches(1.7), Inches(5.5), Inches(0.6))
tf = right_title.text_frame
tf.paragraphs[0].text = "DATA & APIs"
tf.paragraphs[0].font.size = Pt(26)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = MERCEDES_CYAN

right_content = slide.shapes.add_textbox(Inches(7.233), Inches(2.4), Inches(5.5), Inches(4.5))
tf = right_content.text_frame
tf.word_wrap = True

data_tech = [
    ("OpenF1 API", "Live telemetry stream"),
    ("Jolpica Ergast", "Historical archives"),
    ("FastF1", "GPS circuit geometry"),
    ("Static JSON", "Pre-extracted datasets"),
    ("React Context", "Global state management"),
    ("localStorage", "Persistent cache"),
    ("Bayesian Models", "Tyre degradation"),
    ("Type-Safe", "Full TypeScript coverage")
]

for i, (name, desc) in enumerate(data_tech):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"• {name}"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(10)

    p2 = tf.add_paragraph()
    p2.text = f"  {desc}"
    p2.font.size = Pt(14)
    p2.font.color.rgb = GRAY

# ============================================================================
# SLIDE 4: ARCHITECTURE
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(22, 20, 28))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "APPLICATION ARCHITECTURE"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Architecture layers
layers = [
    ("PRESENTATION LAYER", ["Pages (Route Components)", "Features (Domain Modules)", "UI Components (Reusable)"], F1_RED),
    ("STATE LAYER", ["TanStack Query Cache", "React Context (Theme, TZ)", "localStorage Persistence"], MCLAREN_ORANGE),
    ("DATA LAYER", ["Static Data Client", "OpenF1 Client", "Jolpica Client"], MERCEDES_CYAN),
    ("DOMAIN LAYER", ["Session Service", "Circuit Geometry", "Team Registry"], ASTON_GREEN)
]

for i, (layer_name, items, color) in enumerate(layers):
    y = Inches(1.6 + i * 1.45)

    # Layer card
    card = add_card(slide, Inches(0.5), y, Inches(12.333), Inches(1.35), border_color=color)

    # Layer title
    title = slide.shapes.add_textbox(Inches(0.8), y + Inches(0.15), Inches(3), Inches(0.4))
    tf = title.text_frame
    tf.paragraphs[0].text = layer_name
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color

    # Items
    items_box = slide.shapes.add_textbox(Inches(4.5), y + Inches(0.2), Inches(8), Inches(1))
    tf = items_box.text_frame
    for j, item in enumerate(items):
        p = tf.add_paragraph() if j > 0 else tf.paragraphs[0]
        p.text = f"→ {item}"
        p.font.size = Pt(16)
        p.font.color.rgb = WHITE

# ============================================================================
# SLIDE 5: KEY FEATURES - LIVE HUB
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 22, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "KEY FEATURES: LIVE RACE HUB"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Feature cards in grid
features = [
    ("Session Countdown", "Real-time timer with millisecond precision", F1_RED),
    ("Weekend Timetable", "All sessions with timezone conversion", MCLAREN_ORANGE),
    ("Next Race Hero", "Circuit SVG outline with key stats", MERCEDES_CYAN),
    ("Season Calendar", "Round selector with status indicators", FERRARI_RED),
    ("Championship", "Driver & Constructor standings snapshot", RED_BULL_BLUE),
    ("Quick Lookup", "Command palette driver search", ASTON_GREEN)
]

for i, (name, desc, color) in enumerate(features):
    col = i % 3
    row = i // 3
    x = Inches(0.4 + col * 4.3)
    y = Inches(1.5 + row * 2.9)

    # Card
    card = add_card(slide, x, y, Inches(4.0), Inches(2.6), border_color=color)

    # Feature name
    name_box = slide.shapes.add_textbox(x + Inches(0.3), y + Inches(0.3), Inches(3.5), Inches(0.6))
    tf = name_box.text_frame
    tf.paragraphs[0].text = name
    tf.paragraphs[0].font.size = Pt(20)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color

    # Description
    desc_box = slide.shapes.add_textbox(x + Inches(0.3), y + Inches(1.0), Inches(3.5), Inches(1.3))
    tf = desc_box.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].text = desc
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 6: KEY FEATURES - RACE REPLAY
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(18, 20, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "KEY FEATURES: RACE REPLAY ENGINE"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Main feature highlight
add_card(slide, Inches(0.4), Inches(1.5), Inches(8), Inches(5.5), border_color=MERCEDES_CYAN)

main_title = slide.shapes.add_textbox(Inches(0.7), Inches(1.8), Inches(7.5), Inches(0.6))
tf = main_title.text_frame
tf.paragraphs[0].text = "INTERACTIVE 2D REPLAY"
tf.paragraphs[0].font.size = Pt(28)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = MERCEDES_CYAN

main_content = slide.shapes.add_textbox(Inches(0.7), Inches(2.5), Inches(7.5), Inches(4.3))
tf = main_content.text_frame
tf.word_wrap = True

replay_features = [
    "20 cars animated on authentic GPS track geometry",
    "Real-time positions with timing tower sidebar",
    "Variable playback: 0.1x to 256x speed",
    "Camera modes: Track / Car / Battle follow",
    "DRS zones & sector markers visualized",
    "Weather conditions per lap",
    "Safety car & flag status indicators",
    "Fullscreen theater mode",
    "Keyboard shortcuts for all controls"
]

for i, feature in enumerate(replay_features):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {feature}"
    p.font.size = Pt(18)
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(10)

# Side stats
stats = [
    ("60 FPS", "Animation"),
    ("35+", "Circuits"),
    ("256x", "Max Speed"),
    ("20", "Cars")
]

for i, (value, label) in enumerate(stats):
    y = Inches(1.5 + i * 1.35)

    stat_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.8), y, Inches(4.0), Inches(1.2))
    stat_card.fill.solid()
    stat_card.fill.fore_color.rgb = CARD_BG
    stat_card.line.color.rgb = F1_RED
    stat_card.line.width = Pt(2)

    val_box = slide.shapes.add_textbox(Inches(9.0), y + Inches(0.15), Inches(2.0), Inches(0.6))
    tf = val_box.text_frame
    tf.paragraphs[0].text = value
    tf.paragraphs[0].font.size = Pt(32)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = F1_RED

    label_box = slide.shapes.add_textbox(Inches(11.0), y + Inches(0.25), Inches(1.7), Inches(0.5))
    tf = label_box.text_frame
    tf.paragraphs[0].text = label
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 7: DATA SOURCES
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 18, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "DATA SOURCES & PIPELINE"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Data source cards
sources = [
    ("OpenF1 API", "Live Session Status, Car Telemetry, Team Radio, Race Control Messages", F1_RED, "LIVE"),
    ("Jolpica Ergast", "Race Schedules, Results, Standings, Historical Archives", MCLAREN_ORANGE, "HISTORICAL"),
    ("FastF1", "GPS Circuit Geometry, Racing Lines, DRS Zones, Corner Data", MERCEDES_CYAN, "TELEMETRY"),
    ("Static JSON", "Pre-extracted Laps, Positions, Stints, Weather, Pit Stops", ASTON_GREEN, "ARCHIVE")
]

for i, (name, desc, color, tag) in enumerate(sources):
    y = Inches(1.5 + i * 1.45)

    # Card
    card = add_card(slide, Inches(0.5), y, Inches(12.333), Inches(1.3), border_color=color)

    # Tag
    tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.0), y + Inches(0.2), Inches(1.6), Inches(0.35))
    tag_box.fill.solid()
    tag_box.fill.fore_color.rgb = color
    tag_box.line.fill.background()
    tf = tag_box.text_frame
    tf.paragraphs[0].text = tag
    tf.paragraphs[0].font.size = Pt(10)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = WHITE
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Name
    name_box = slide.shapes.add_textbox(Inches(0.8), y + Inches(0.25), Inches(4), Inches(0.5))
    tf = name_box.text_frame
    tf.paragraphs[0].text = name
    tf.paragraphs[0].font.size = Pt(22)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color

    # Description
    desc_box = slide.shapes.add_textbox(Inches(4.5), y + Inches(0.25), Inches(6.3), Inches(0.8))
    tf = desc_box.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].text = desc
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# Fallback chain note
note_box = slide.shapes.add_textbox(Inches(0.5), Inches(6.5), Inches(12), Inches(0.5))
tf = note_box.text_frame
tf.paragraphs[0].text = "→ Intelligent fallback chain: Static → Jolpica → Mock service"
tf.paragraphs[0].font.size = Pt(16)
tf.paragraphs[0].font.color.rgb = GRAY
tf.paragraphs[0].font.italic = True

# ============================================================================
# SLIDE 8: CIRCUIT GEOMETRY
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(18, 20, 24))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "CIRCUIT GEOMETRY ENGINE"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Main content
add_card(slide, Inches(0.4), Inches(1.5), Inches(7.5), Inches(5.5), border_color=MERCEDES_CYAN)

content_box = slide.shapes.add_textbox(Inches(0.7), Inches(1.8), Inches(7.0), Inches(5.0))
tf = content_box.text_frame
tf.word_wrap = True

geometry_features = [
    "Real GPS coordinates from FastF1",
    "SVG-based rendering with boundaries",
    "Racing line calculation via normal offsets",
    "DRS zone highlighting with glow effects",
    "Turn/corner markers with sector colors",
    "Checkered start/finish line positioning",
    "35+ historic and current F1 circuits",
    "Fallback path generation for missing data"
]

for i, feature in enumerate(geometry_features):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {feature}"
    p.font.size = Pt(18)
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(14)

# Sector legend
legend_title = slide.shapes.add_textbox(Inches(8.5), Inches(1.8), Inches(4.0), Inches(0.5))
tf = legend_title.text_frame
tf.paragraphs[0].text = "SECTOR COLORS"
tf.paragraphs[0].font.size = Pt(18)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

sectors = [
    ("Sector 1", SECTOR_PURPLE),
    ("Sector 2", SECTOR_YELLOW),
    ("Sector 3", SECTOR_GREEN)
]

for i, (name, color) in enumerate(sectors):
    y = Inches(2.5 + i * 0.7)

    # Color box
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), y, Inches(0.5), Inches(0.5))
    box.fill.solid()
    box.fill.fore_color.rgb = color
    box.line.fill.background()

    # Label
    label = slide.shapes.add_textbox(Inches(9.2), y + Inches(0.1), Inches(2), Inches(0.4))
    tf = label.text_frame
    tf.paragraphs[0].text = name
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = WHITE

# Stats
stat_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(5.0), Inches(4.2), Inches(1.8))
stat_box.fill.solid()
stat_box.fill.fore_color.rgb = CARD_BG
stat_box.line.color.rgb = F1_RED
stat_box.line.width = Pt(2)

stat_text = slide.shapes.add_textbox(Inches(8.7), Inches(5.2), Inches(4.0), Inches(1.5))
tf = stat_text.text_frame
tf.paragraphs[0].text = "35+"
tf.paragraphs[0].font.size = Pt(48)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = F1_RED

p = tf.add_paragraph()
p.text = "Circuits Supported"
p.font.size = Pt(18)
p.font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 9: UI/UX DESIGN
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 18, 24))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "UI/UX DESIGN PHILOSOPHY"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Visual Design column
add_card(slide, Inches(0.4), Inches(1.5), Inches(6), Inches(5.5), border_color=F1_RED)

vis_title = slide.shapes.add_textbox(Inches(0.7), Inches(1.7), Inches(5.5), Inches(0.5))
tf = vis_title.text_frame
tf.paragraphs[0].text = "VISUAL DESIGN"
tf.paragraphs[0].font.size = Pt(24)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = F1_RED

vis_content = slide.shapes.add_textbox(Inches(0.7), Inches(2.3), Inches(5.5), Inches(4.5))
tf = vis_content.text_frame
tf.word_wrap = True

visual_items = [
    "F1-inspired dark theme default",
    "Barlow Condensed & Titillium Web fonts",
    "FIA-standard sector colors",
    "Team livery accents throughout",
    "WCAG AA accessibility compliant",
    "View Transitions API animations",
    "Smooth circular reveal effects"
]

for i, item in enumerate(visual_items):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {item}"
    p.font.size = Pt(17)
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(12)

# UX column
add_card(slide, Inches(6.933), Inches(1.5), Inches(6), Inches(5.5), border_color=MERCEDES_CYAN)

ux_title = slide.shapes.add_textbox(Inches(7.233), Inches(1.7), Inches(5.5), Inches(0.5))
tf = ux_title.text_frame
tf.paragraphs[0].text = "USER EXPERIENCE"
tf.paragraphs[0].font.size = Pt(24)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = MERCEDES_CYAN

ux_content = slide.shapes.add_textbox(Inches(7.233), Inches(2.3), Inches(5.5), Inches(4.5))
tf = ux_content.text_frame
tf.word_wrap = True

ux_items = [
    "Keyboard shortcuts for all controls",
    "Command palette (Cmd+K) navigation",
    "Timezone-aware session times",
    "Mobile-responsive layout",
    "Loading skeletons matching UI",
    "Reduced motion support",
    "Persistent user preferences"
]

for i, item in enumerate(ux_items):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {item}"
    p.font.size = Pt(17)
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(12)

# ============================================================================
# SLIDE 10: TELEMETRY ANALYTICS
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(18, 20, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "TELEMETRY & ANALYTICS"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Main feature cards
features = [
    ("LIVE TELEMETRY", [
        "Driver speed, throttle, brake traces",
        "Gear & RPM real-time display",
        "25 Hz telemetry stream viewer",
        "Track position map (real & schematic)"
    ], F1_RED),
    ("F1 INSIGHTS MODAL", [
        "Sector times breakdown table",
        "Tyre strategy visualization",
        "Race control message feed",
        "Lap & gap evolution charts"
    ], MCLAREN_ORANGE),
    ("BAYESIAN TYRE MODEL", [
        "State-space degradation prediction",
        "Compound-specific profiles",
        "Optimal pit window estimation",
        "Projected pace drop-off curves"
    ], MERCEDES_CYAN)
]

for i, (name, items, color) in enumerate(features):
    y = Inches(1.5 + i * 1.95)

    # Card
    card = add_card(slide, Inches(0.5), y, Inches(12.333), Inches(1.8), border_color=color)

    # Title
    title = slide.shapes.add_textbox(Inches(0.8), y + Inches(0.15), Inches(3.5), Inches(0.5))
    tf = title.text_frame
    tf.paragraphs[0].text = name
    tf.paragraphs[0].font.size = Pt(20)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color

    # Items in row
    for j, item in enumerate(items):
        x = Inches(0.8 + j * 3.0)
        item_box = slide.shapes.add_textbox(x, y + Inches(0.7), Inches(2.9), Inches(1.0))
        tf = item_box.text_frame
        tf.word_wrap = True
        tf.paragraphs[0].text = f"→ {item}"
        tf.paragraphs[0].font.size = Pt(14)
        tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 11: PROJECT STRUCTURE
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 18, 24))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "PROJECT STRUCTURE"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Directory cards
dirs = [
    ("/src/api", "API clients, hooks, static data loader", F1_RED),
    ("/src/components", "Reusable UI: Layout, Buttons, Dialogs", MCLAREN_ORANGE),
    ("/src/context", "React Context: Theme, Timezone", MERCEDES_CYAN),
    ("/src/features", "Feature modules: race, hero, standings", ASTON_GREEN),
    ("/src/lib", "Utilities: circuits, teams, flags, storage", FERRARI_RED),
    ("/src/pages", "Route-level page components", RED_BULL_BLUE),
    ("/src/types", "TypeScript interface definitions", ALPINE_BLUE),
    ("/data", "Pre-extracted JSON datasets", RGBColor(150, 100, 200))
]

for i, (path, desc, color) in enumerate(dirs):
    col = i % 2
    row = i // 2
    x = Inches(0.4 + col * 6.5)
    y = Inches(1.5 + row * 1.4)

    # Card
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(6.2), Inches(1.2))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = color
    card.line.width = Pt(2)

    # Path
    path_box = slide.shapes.add_textbox(x + Inches(0.2), y + Inches(0.2), Inches(5.8), Inches(0.4))
    tf = path_box.text_frame
    tf.paragraphs[0].text = path
    tf.paragraphs[0].font.size = Pt(18)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color
    tf.paragraphs[0].font.name = "Consolas"

    # Description
    desc_box = slide.shapes.add_textbox(x + Inches(0.2), y + Inches(0.65), Inches(5.8), Inches(0.4))
    tf = desc_box.text_frame
    tf.paragraphs[0].text = desc
    tf.paragraphs[0].font.size = Pt(14)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 12: CODE QUALITY
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(18, 20, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "CODE QUALITY & PATTERNS"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Architecture patterns
add_card(slide, Inches(0.4), Inches(1.5), Inches(6), Inches(5.5), border_color=F1_RED)

arch_title = slide.shapes.add_textbox(Inches(0.7), Inches(1.7), Inches(5.5), Inches(0.5))
tf = arch_title.text_frame
tf.paragraphs[0].text = "ARCHITECTURE PATTERNS"
tf.paragraphs[0].font.size = Pt(22)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = F1_RED

patterns = [
    "Single Responsibility Principle (SRP)",
    "Interface Segregation Principle (ISP)",
    "Open/Closed Principle (OCP)",
    "Custom React hooks for data fetching",
    "Compound component pattern for UI",
    "Context + Hook pattern for state",
    "Error boundary pattern for resilience"
]

arch_content = slide.shapes.add_textbox(Inches(0.7), Inches(2.3), Inches(5.5), Inches(4.5))
tf = arch_content.text_frame
tf.word_wrap = True

for i, pattern in enumerate(patterns):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {pattern}"
    p.font.size = Pt(16)
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(10)

# Best practices
add_card(slide, Inches(6.933), Inches(1.5), Inches(6), Inches(5.5), border_color=MERCEDES_CYAN)

best_title = slide.shapes.add_textbox(Inches(7.233), Inches(1.7), Inches(5.5), Inches(0.5))
tf = best_title.text_frame
tf.paragraphs[0].text = "BEST PRACTICES"
tf.paragraphs[0].font.size = Pt(22)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = MERCEDES_CYAN

practices = [
    "TypeScript strict mode enabled",
    "Oxlint for fast linting",
    "Proper error handling (try/catch)",
    "AbortController for timeouts",
    "localStorage JSON serialization",
    "Accessibility-first design",
    "Semantic HTML structure"
]

best_content = slide.shapes.add_textbox(Inches(7.233), Inches(2.3), Inches(5.5), Inches(4.5))
tf = best_content.text_frame
tf.word_wrap = True

for i, practice in enumerate(practices):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {practice}"
    p.font.size = Pt(16)
    p.font.color.rgb = WHITE
    p.space_before = Pt(0) if i == 0 else Pt(10)

# ============================================================================
# SLIDE 13: PERFORMANCE
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 18, 24))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "PERFORMANCE OPTIMIZATIONS"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Performance metrics cards
metrics = [
    ("24h", "Cache Persistence"),
    ("60", "FPS Animation"),
    ("0", "API Calls (cached)"),
    ("~50", "KB Bundle (gzip)")
]

for i, (value, label) in enumerate(metrics):
    x = Inches(0.4 + i * 3.3)

    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(3.0), Inches(1.4))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = F1_RED
    card.line.width = Pt(2)

    val_box = slide.shapes.add_textbox(x + Inches(0.2), Inches(1.65), Inches(2.6), Inches(0.6))
    tf = val_box.text_frame
    tf.paragraphs[0].text = value
    tf.paragraphs[0].font.size = Pt(40)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = F1_RED
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    label_box = slide.shapes.add_textbox(x + Inches(0.2), Inches(2.3), Inches(2.6), Inches(0.4))
    tf = label_box.text_frame
    tf.paragraphs[0].text = label
    tf.paragraphs[0].font.size = Pt(14)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

# Optimization strategies
add_card(slide, Inches(0.4), Inches(3.2), Inches(12.5), Inches(3.8), border_color=MERCEDES_CYAN)

opt_content = slide.shapes.add_textbox(Inches(0.7), Inches(3.5), Inches(12.0), Inches(3.4))
tf = opt_content.text_frame
tf.word_wrap = True

optimizations = [
    ("TanStack Query", "24-hour cache persistence with localStorage for offline support"),
    ("Lazy Loading", "React.lazy + Suspense for route-level code splitting"),
    ("Memoization", "useMemo & useCallback for expensive computations"),
    ("requestAnimationFrame", "Smooth 60fps race animations"),
    ("SVG Caching", "Single geometry object per circuit"),
    ("Vite", "Lightning-fast HMR and optimized production builds")
]

for i, (name, desc) in enumerate(optimizations):
    p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
    p.text = f"→ {name}: "
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = MERCEDES_CYAN
    p.space_before = Pt(0) if i == 0 else Pt(12)

    run = p.add_run()
    run.text = desc
    run.font.bold = False
    run.font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 14: FUTURE ENHANCEMENTS
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(18, 22, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "FUTURE ENHANCEMENTS"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Future features grid
futures = [
    ("WebSocket Streaming", "Real-time live telemetry connection", F1_RED),
    ("ML Pit Prediction", "Machine learning pit stop model", MCLAREN_ORANGE),
    ("Historical Comparison", "Year-over-year race analysis", MERCEDES_CYAN),
    ("Push Notifications", "Session start reminders", ASTON_GREEN),
    ("Progressive Web App", "Mobile installation support", FERRARI_RED),
    ("Social Sharing", "Share insights & screenshots", RED_BULL_BLUE),
    ("Multi-language", "International fan support", ALPINE_BLUE),
    ("Head-to-Head", "Driver comparison overlay", RGBColor(150, 100, 200))
]

for i, (name, desc, color) in enumerate(futures):
    col = i % 2
    row = i // 2
    x = Inches(0.4 + col * 6.5)
    y = Inches(1.5 + row * 1.45)

    # Card
    card = add_card(slide, x, y, Inches(6.2), Inches(1.3), border_color=color)

    # Name
    name_box = slide.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), Inches(5.7), Inches(0.5))
    tf = name_box.text_frame
    tf.paragraphs[0].text = name
    tf.paragraphs[0].font.size = Pt(20)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color

    # Description
    desc_box = slide.shapes.add_textbox(x + Inches(0.3), y + Inches(0.7), Inches(5.7), Inches(0.4))
    tf = desc_box.text_frame
    tf.paragraphs[0].text = desc
    tf.paragraphs[0].font.size = Pt(14)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 15: TECHNICAL HIGHLIGHTS
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_background(slide, DARK_BG, RGBColor(20, 20, 26))
add_racing_stripe(slide, Inches(0), F1_RED, Inches(0.06))
add_corner_accent(slide, F1_RED)

title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(12), Inches(0.8))
tf = title_box.text_frame
tf.paragraphs[0].text = "TECHNICAL HIGHLIGHTS"
tf.paragraphs[0].font.size = Pt(44)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE

# Highlight cards
highlights = [
    ("View Transitions API", "Circular reveal animation from click coordinates for seamless theme switching", F1_RED),
    ("Bayesian Tyre Model", "State-space calculations with compound-specific degradation profiles", MCLAREN_ORANGE),
    ("GPS Track Geometry", "35+ circuits with authentic FastF1 racing lines and DRS zones", MERCEDES_CYAN),
    ("Intelligent Fallbacks", "Multi-source data pipeline with graceful degradation", ASTON_GREEN)
]

for i, (name, desc, color) in enumerate(highlights):
    y = Inches(1.5 + i * 1.45)

    # Card
    card = add_card(slide, Inches(0.5), y, Inches(12.333), Inches(1.3), border_color=color)

    # Number badge
    badge = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.8), y + Inches(0.35), Inches(0.6), Inches(0.6))
    badge.fill.solid()
    badge.fill.fore_color.rgb = color
    badge.line.fill.background()
    tf = badge.text_frame
    tf.paragraphs[0].text = str(i + 1)
    tf.paragraphs[0].font.size = Pt(24)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = WHITE
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Name
    name_box = slide.shapes.add_textbox(Inches(1.7), y + Inches(0.25), Inches(4), Inches(0.5))
    tf = name_box.text_frame
    tf.paragraphs[0].text = name
    tf.paragraphs[0].font.size = Pt(22)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = color

    # Description
    desc_box = slide.shapes.add_textbox(Inches(1.7), y + Inches(0.75), Inches(10.5), Inches(0.5))
    tf = desc_box.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].text = desc
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = LIGHT_GRAY

# ============================================================================
# SLIDE 16: THANK YOU
# ============================================================================
slide = prs.slides.add_slide(prs.slide_layouts[6])

# Background
add_gradient_background(slide, DARK_BG, RGBColor(25, 20, 30))

# Large racing stripe
add_racing_stripe(slide, Inches(3.2), F1_RED, Inches(0.12))

# Bottom racing stripe
stripe_bottom = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.38), prs.slide_width, Inches(0.12))
stripe_bottom.fill.solid()
stripe_bottom.fill.fore_color.rgb = F1_RED
stripe_bottom.line.fill.background()

# Thank you text
title_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.8), Inches(12.333), Inches(1.5))
tf = title_box.text_frame
tf.paragraphs[0].text = "THANK YOU"
tf.paragraphs[0].font.size = Pt(80)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = WHITE
tf.paragraphs[0].font.name = "Arial Black"
tf.paragraphs[0].alignment = PP_ALIGN.CENTER

# Subtitle
sub_box = slide.shapes.add_textbox(Inches(0.5), Inches(4.0), Inches(12.333), Inches(0.8))
tf = sub_box.text_frame
tf.paragraphs[0].text = "Questions & Discussion"
tf.paragraphs[0].font.size = Pt(32)
tf.paragraphs[0].font.color.rgb = LIGHT_GRAY
tf.paragraphs[0].alignment = PP_ALIGN.CENTER

# Project info
info_box = slide.shapes.add_textbox(Inches(0.5), Inches(5.5), Inches(12.333), Inches(0.8))
tf = info_box.text_frame
tf.paragraphs[0].text = "PitWall F1 Fan Hub"
tf.paragraphs[0].font.size = Pt(24)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = F1_RED
tf.paragraphs[0].alignment = PP_ALIGN.CENTER

p = tf.add_paragraph()
p.text = "React 19  |  TypeScript  |  Tailwind CSS 4  |  2024"
p.font.size = Pt(16)
p.font.color.rgb = GRAY
p.alignment = PP_ALIGN.CENTER

# Corner accents
add_corner_accent(slide, F1_RED)

# ============================================================================
# SAVE PRESENTATION
# ============================================================================
output_path = "F:\\F1\\PitWall_Premium_Presentation.pptx"
prs.save(output_path)
print(f"[SUCCESS] Presentation saved to: {output_path}")
print(f"[INFO] Total slides: {len(prs.slides)}")
