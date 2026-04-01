# Ben Alek Conner — Style Guide

## Brand Identity

**Tagline:** Director. Consultant. Creative.
**Positioning:** A filmmaker and creative strategist who builds things — films, brands, systems. Available for select projects.
**Personality:** Cinematic, thoughtful, unhurried. Not corporate. Not hustle-culture. The vibe is "auteur who also understands business."

---

## Signature Visual Element

**Cinematic framing and film grain.** Every BAC touchpoint should feel like a frame from an indie film. Widescreen aspect ratios, letterboxing, film grain overlays, and a colour palette that feels graded rather than designed.

- **Letterboxed sections:** Key hero sections should have black bars top/bottom (like a 2.39:1 aspect ratio) to create cinematic tension
- **Film grain overlay:** Subtle animated grain texture across backgrounds (lighter than NB's noise — more organic, less digital)
- **Video backgrounds:** Where possible, use slow-motion footage or cinemagraphs instead of static images
- **Storyboard/sketch elements:** Hand-drawn annotations, arrows, or frame marks as decorative elements
- **Aspect ratio awareness:** Images should feel like they were pulled from a film — shallow depth of field, warm grading, wide shots

**Never:** Corporate stock photos. Blue/white "tech startup" aesthetics. Busy, cluttered layouts. Infographics.

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Black (primary bg) | `#0a0a0a` | Page backgrounds |
| Surface | `#141414` | Cards, containers |
| Surface Hover | `#1a1a1a` | Hover states |
| Border | `#222222` | Dividers, card borders |
| Gold (primary accent) | `#d4a853` | Accents, CTAs, emphasis, links |
| Gold Glow | `rgba(212,168,83,0.15)` | Background highlights |
| Foreground | `#f5f5f5` | Headings, primary text |
| Muted | `#999999` | Body text, secondary info |

**Rules:**
- Dark backgrounds only, but warmer than NB. BAC's black is `#0a0a0a` (slightly warmer) vs NB's `#0D0D0D`.
- Gold is the ONLY accent colour. No secondary colour. This creates a monochromatic, filmic feel.
- Body text is mid-grey (`#999`) not the warm-muted of PP or the transparent-white of NB. It should feel like subtitles on a dark screen.
- Avoid pure white text — `#f5f5f5` has just enough warmth.

---

## Typography

| Role | Font | Weight | Size | Style |
|------|------|--------|------|-------|
| Display / H1 | Barlow Condensed | 900 (Black) | 36-52px | Uppercase, tight leading |
| H2 | Barlow Condensed | 700 (Bold) | 24-32px | Uppercase |
| Body | Plus Jakarta Sans | 300 (Light) | 15-16px | Sentence case, line-height 1.7 |
| Labels / Tags | Barlow Condensed | 600-700 | 11px | Uppercase, letter-spacing 0.15-0.2em |
| Accent text | Plus Jakarta Sans | 400 | 14px | Sentence case, gold colour |

**Key difference from NB:** Same fonts, but BAC uses them with more restraint. NB is aggressive and data-forward. BAC is measured and cinematic. The type should feel like film credits, not a tech dashboard.

**Rules:**
- H1 headings use a `<span>` for the gold-coloured word — always the most important word
- Body text is slightly larger than NB (15-16px vs 14-15px) — more readable, less dense
- Never use code/monospace fonts — that's NB's terminal aesthetic

---

## Spacing & Layout

- **Container max-width:** 1000px (intimate, not wide)
- **Page padding:** 48px horizontal (desktop), 24px (mobile)
- **Section padding:** 60-80px vertical (tighter than NB/PP — cinematic pacing)
- **Card padding:** 36-40px
- **Card border-radius:** 16px
- **Grid gap:** 80px (major layouts)

**Layout principles:**
- Two-column grids for content pages (copy + form)
- Centered single-column for focused pages (consultation landing page)
- Full-width cinematic breaks between sections (widescreen images, letterboxed)
- Navigation is minimal: logo left, role description right. No complex nav menus on landing pages.

---

## Imagery

- **Film stills aesthetic.** All photos should look like they could be a frame from a film — wide shots, shallow DOF, natural/warm lighting
- **Behind-the-scenes.** On-set photos, camera rigs, editing suites, storyboards. Show the craft.
- **Street photography.** Ben's personal photo work can be used as atmospheric/background imagery
- **No headshots as hero images.** BAC is not Power Portraits. Use environmental/contextual images of Ben working, not posed headshots.
- **Colour grading:** Warm shadows, slightly lifted blacks, desaturated but not grey. Think A24 film palette.

---

## Motion & Interaction

| Element | Behavior |
|---------|----------|
| Film grain | Animated SVG noise, opacity 0.02-0.04, subtle and organic |
| Letterbox bars | CSS pseudo-elements, fixed position, 40-60px height |
| Image reveals | Slow fade (0.6s) with very subtle zoom (1.01 → 1.0) |
| Text reveals | Fade in from bottom, staggered, 0.3-0.4s |
| Scroll feel | Smooth, cinematic pacing — no jarring jumps |
| Video bg | If used: muted, looped, slightly slowed (0.8x playback rate), desaturated |

**No custom cursor.** No data animations. No terminal effects. Those are NB's elements. BAC is quiet and cinematic.

---

## Voice & Tone

**We sound like:** A director talking about their craft. Thoughtful, direct, confident but not loud. First person singular — this is a personal brand.

**I say:** "Let's talk about your project." / "I take on a limited number of projects each year."
**I don't say:** "We offer world-class solutions." / "Let's synergise." / "Hustling 24/7."

**Copy rules:**
- First person singular ("I" not "we" — this is a personal brand, not an agency)
- Short paragraphs, contemplative pace. Not punchy like NB.
- References to filmmaking, storytelling, and craft are natural — don't force them
- Scarcity is genuine: "I take limited projects" is true, not a marketing trick
- No exclamation marks. The work speaks for itself.

---

## Component Patterns

**CTA Buttons:**
- Text style: Barlow Condensed, uppercase, gold colour, no background
- Hover: gold background fills, text goes dark
- Subtle, refined — not shouty

**Form Cards:**
- Dark surface (`#141414`) with `#222222` border
- Heading: Barlow Condensed with gold `<span>` on key word
- Muted subtitle below
- Clean, minimal form fields

**Navigation (landing pages):**
- Logo left: "Ben Alek `<span>Conner</span>`" in Barlow Condensed
- Role right: "Director &middot; Consultant" in muted uppercase Montserrat
- No hamburger menu on landing pages — keep it clean

**Badges:**
- Gold glow background (`rgba(212,168,83,0.15)`)
- Gold text, uppercase, wide letter-spacing
- Pill shape (border-radius: 100px)

---

## Do's and Don'ts

**Do:**
- Use cinematic aspect ratios and letterboxing
- Use film grain overlay (subtle, organic)
- Write in first person ("I" not "we")
- Use gold as the only accent colour
- Let video and imagery lead, with text supporting
- Make everything feel like a film — slow, intentional, considered

**Don't:**
- Use the NB noise texture (NB's is digital/synthetic, BAC's grain should be filmic)
- Use the NB custom cursor
- Use magenta, teal, or any colour besides gold
- Use corporate stock photography
- Use dense, data-heavy layouts — that's NB's territory
- Rush the pacing — BAC pages should breathe
