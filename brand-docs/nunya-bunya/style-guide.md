# Nunya Bunya — Style Guide

## Brand Identity

**Tagline:** Making your competitors wish you didn't exist.
**Positioning:** AI-powered digital marketing agency for small businesses who are tired of guessing.
**Personality:** Bold, technical, irreverent. We're the hacker friend who also knows business.

---

## Signature Visual Element

**Animated data and terminal aesthetics.** Every NB touchpoint should feel like stepping into a control room. We are a data-driven agency — our visuals should make that obvious without saying it.

- Hero elements should feature animated counters, live-drawing graph lines, pulsing data points
- Code/terminal-style formatting for stats and proof points (monospace, blinking cursor)
- Noise texture overlay on all dark backgrounds (grain = authenticity)
- Custom cursor (teal dot + trailing ring) on all NB web pages

**Never:** Stock photos of people shaking hands. Generic "team meeting" imagery. Flat, static layouts.

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Teal (primary) | `#00E5CC` | CTAs, links, accents, active states, data highlights |
| Teal Glow | `rgba(0,229,204,0.15)` | Backgrounds, hover states, subtle emphasis |
| Magenta (secondary) | `#FF4DDD` | Urgency, alerts, secondary CTAs, hover transitions |
| Magenta Glow | `rgba(255,77,221,0.15)` | Warning backgrounds, highlight accents |
| Chartreuse (accent) | `#7FFF00` | Sparingly — success states, positive metrics |
| Dark (primary bg) | `#0D0D0D` | Page backgrounds |
| Dark 2 | `#141414` | Cards, surfaces |
| Dark 3 | `#1A1A1A` | Elevated surfaces, inputs |
| White | `#FFFFFF` | Headings, primary text |
| Muted | `rgba(255,255,255,0.45)` | Body text, secondary info |
| Subtle | `rgba(255,255,255,0.07)` | Borders, dividers |

**Rules:**
- Dark backgrounds ONLY. NB never appears on white/light backgrounds.
- Teal is the hero color. Use it for anything you want the user to do.
- Magenta is the tension color. Use it for urgency, scarcity, or contrast.
- Never use both teal and magenta at equal weight in the same section. One leads, one accents.

---

## Typography

| Role | Font | Weight | Size | Style |
|------|------|--------|------|-------|
| Display / H1 | Barlow Condensed | 900 (Black) | 36-52px | Uppercase, tight leading (1.05) |
| H2 | Barlow Condensed | 800 (ExtraBold) | 24-32px | Uppercase |
| H3 / Labels | Barlow Condensed | 700 (Bold) | 14-18px | Uppercase, letter-spacing 0.06em |
| Body | Plus Jakarta Sans | 300 (Light) | 14-16px | Sentence case, line-height 1.6-1.7 |
| Accent / Tags | Barlow Condensed | 700 | 11px | Uppercase, letter-spacing 0.15-0.2em |
| Code / Data | System monospace | 400 | 13-14px | For stats, terminal effects |

**Rules:**
- Headings are ALWAYS uppercase. No exceptions.
- Body text is ALWAYS light weight (300). Dense, heavy body text feels wrong for NB.
- Letter-spacing on headings should be tight. Letter-spacing on labels should be wide.
- Never use more than 2 font families on a single page.

---

## Spacing & Layout

- **Container max-width:** 1100px
- **Page padding:** 48px horizontal (desktop), 20px (mobile)
- **Section padding:** 80-120px vertical
- **Card padding:** 24-40px
- **Card border-radius:** 12-20px
- **Grid gap:** 24px (cards), 60-80px (major layout splits)

**Layout principles:**
- Asymmetric grids preferred over centered single-column
- Two-column layouts: copy left, form/visual right
- Generous whitespace — let the dark background breathe
- Mobile: single column, maintain vertical rhythm

---

## Motion & Interaction

| Element | Behavior |
|---------|----------|
| Custom cursor | Teal dot follows mouse instantly, ring follows with 0.12 ease lag |
| Cursor hover | Dot scales 2.5x + turns magenta on links/buttons |
| Page transitions | `fadeIn` animation: opacity 0→1, translateY 4-8px, 0.3s ease |
| Scroll reveals | Elements fade in as they enter viewport (staggered 60-80ms) |
| Hover states | Cards: translateY(-2px) + border-color teal. Buttons: background shift |
| Orbs | Radial gradient circles (teal + magenta, low opacity) floating in hero sections |
| Noise overlay | `body::before` with SVG fractalNoise, opacity 0.03, fixed position |

---

## Imagery

- **NO stock photos** of people in offices, handshakes, or "diverse teams smiling"
- Prefer: abstract data visualizations, terminal screenshots, dark UI mockups
- If using photos: dark, moody, high-contrast. Shot at night or in dim environments.
- All images should have a slight opacity reduction (0.8-0.9) to blend with the dark theme
- Hero images should never compete with the heading — they're atmospheric, not informational

---

## Voice & Tone

**We sound like:** A sharp friend who happens to be really good at marketing. Direct, confident, slightly irreverent. We don't hedge.

**We say:** "We'll show you exactly what's broken." / "Your competitors are already doing this."
**We don't say:** "We leverage synergies to drive outcomes." / "Our holistic approach..."

**Copy rules:**
- Short sentences. Punch, don't ramble.
- Lead with the result, not the process.
- Use "you" more than "we."
- Numbers are more persuasive than adjectives. "47 leads in 30 days" > "amazing results."
- Never use "no fluff" — say what you actually mean instead.

---

## Component Patterns

**CTA Buttons:**
- Primary: teal background, dark text, uppercase Barlow Condensed, 10-24px padding
- Secondary: transparent, teal border, teal text
- Hover: primary shifts to magenta, secondary gets teal background glow

**Form Cards:**
- Dark glass effect: `rgba(255,255,255,0.03)` background, `rgba(255,255,255,0.08)` border
- Rounded corners (20px)
- Centered heading (uppercase), muted subtitle, form below

**Badges/Tags:**
- Pill shape (border-radius: 100px)
- 1px border with color at 30% opacity
- Text: 11px uppercase, wide letter-spacing

**Navigation:**
- Fixed top, blurred dark background
- Logo left (icon + NUNYA BUNYA with teal span)
- Links right: uppercase, muted by default, white on hover
- CTA button: teal background, rightmost position

---

## Do's and Don'ts

**Do:**
- Use the noise texture on every page
- Include the custom cursor on every NB web page
- Animate data — counters, graphs, progress bars
- Use terminal/code aesthetic for proof points
- Make the form card feel like a premium interface, not a generic form

**Don't:**
- Use white backgrounds. Ever.
- Use rounded, friendly, bubbly design elements (that's not NB)
- Use generic stock photography
- Center everything — asymmetry creates tension and interest
- Write long paragraphs of body copy — break it up
