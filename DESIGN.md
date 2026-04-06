# Design System: xAI

## 1. Visual Theme & Atmosphere

xAI's website is a masterclass in dark-first, monospace-driven brutalist minimalism -- a design system that feels like it was built by engineers who understand that restraint is the ultimate form of sophistication. The entire experience is anchored to an almost-black background (`#1f2228`) with pure white text (`#ffffff`), creating a high-contrast, terminal-inspired aesthetic that signals deep technical credibility. There are no gradients, no decorative illustrations, no color accents competing for attention. This is a site that communicates through absence.

The typographic system is split between two carefully chosen typefaces. `GeistMono` (Vercel's monospace font) handles display-level headlines at an extraordinary 320px with weight 300, and also serves as the button typeface in uppercase with tracked-out letter-spacing (1.4px). `universalSans` handles all body and secondary heading text with a clean, geometric sans-serif voice. The monospace-as-display-font choice is the defining aesthetic decision -- it positions xAI not as a consumer product but as infrastructure, as something built by people who live in terminals.

The spacing system operates on an 8px base grid with values concentrated at the small end (4px, 8px, 24px, 48px), reflecting a dense, information-focused layout philosophy. Border radius is minimal -- the site barely rounds anything, maintaining sharp, architectural edges. There are no decorative shadows, no gradients, no layered elevation. Depth is communicated purely through contrast and whitespace.

**Key Characteristics:**
- Pure dark theme: `#1f2228` background with `#ffffff` text -- no gray middle ground
- GeistMono at extreme display sizes (320px, weight 300) -- monospace as luxury
- Uppercase monospace buttons with 1.4px letter-spacing -- technical, commanding
- universalSans for body text at 16px/1.5 and headings at 30px/1.2 -- clean contrast
- Zero decorative elements: no shadows, no gradients, no colored accents
- 8px spacing grid with a sparse, deliberate scale
- Heroicons SVG icon system -- minimal, functional
- Tailwind CSS with arbitrary values -- utility-first engineering approach

## 2. Color Palette & Roles

### Primary
- **Pure White** (`#ffffff`): The singular text color, link color, and all foreground elements. In xAI's system, white is not a background -- it is the voice.
- **Dark Background** (`#1f2228`): The canvas. A warm near-black with a subtle blue undertone (not pure black, not neutral gray). This specific hue prevents the harsh eye strain of `#000000` while maintaining deep darkness.

### Interactive
- **White Default** (`#ffffff`): Link and interactive element color in default state.
- **White Muted** (`rgba(255, 255, 255, 0.5)`): Hover state for links -- a deliberate dimming rather than brightening, which is unusual and distinctive.
- **White Subtle** (`rgba(255, 255, 255, 0.2)`): Borders, dividers, and subtle surface treatments.
- **Ring Blue** (`rgb(59, 130, 246) / 0.5`): Tailwind's default focus ring color (`--tw-ring-color`), used for keyboard accessibility focus states.

### Surface & Borders
- **Surface Elevated** (`rgba(255, 255, 255, 0.05)`): Subtle card backgrounds and hover surfaces -- barely visible lift.
- **Surface Hover** (`rgba(255, 255, 255, 0.08)`): Slightly more visible hover state for interactive containers.
- **Border Default** (`rgba(255, 255, 255, 0.1)`): Standard border for cards, dividers, and containers.
- **Border Strong** (`rgba(255, 255, 255, 0.2)`): Emphasized borders for active states and button outlines.

### Functional
- **Text Primary** (`#ffffff`): All headings, body text, labels.
- **Text Secondary** (`rgba(255, 255, 255, 0.7)`): Descriptions, captions, supporting text.
- **Text Tertiary** (`rgba(255, 255, 255, 0.5)`): Muted labels, placeholder text, timestamps.
- **Text Quaternary** (`rgba(255, 255, 255, 0.3)`): Disabled text, very subtle annotations.

## 3. Typography Rules

### Font Family
- **Display / Buttons**: `GeistMono`, with fallback: `ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Liberation Mono, DejaVu Sans Mono, Courier New`
- **Body / Headings**: `universalSans`, with fallback: `universalSans Fallback`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Transform | Notes |
|------|------|------|--------|-------------|----------------|-----------|-------|
| Display Hero | GeistMono | 320px (20rem) | 300 | 1.50 | normal | none | Extreme scale, monospace luxury |
| Section Heading | universalSans | 30px (1.88rem) | 400 | 1.20 (tight) | normal | none | Clean sans-serif contrast |
| Body | universalSans | 16px (1rem) | 400 | 1.50 | normal | none | Standard reading text |
| Button | GeistMono | 14px (0.88rem) | 400 | 1.43 | 1.4px | uppercase | Tracked monospace, commanding |
| Label / Caption | universalSans | 14px (0.88rem) | 400 | 1.50 | normal | none | Supporting text |
| Small / Meta | universalSans | 12px (0.75rem) | 400 | 1.50 | normal | none | Timestamps, footnotes |

### Principles
- **Monospace as display**: GeistMono at 320px is not a gimmick -- it is the brand statement. The fixed-width characters at extreme scale create a rhythmic, architectural quality that no proportional font can achieve.
- **Light weight at scale**: Weight 300 for the 320px headline prevents the monospace from feeling heavy or brutish at extreme sizes. It reads as precise, not overwhelming.
- **Uppercase buttons**: All button text is uppercase GeistMono with 1.4px letter-spacing. This creates a distinctly technical, almost command-line aesthetic for interactive elements.
- **Sans-serif for reading**: universalSans at 16px/1.5 provides excellent readability for body content, creating a clean contrast against the monospace display elements.
- **Two-font clarity**: The system uses exactly two typefaces with clear roles -- monospace for impact and interaction, sans-serif for information and reading. No overlap, no ambiguity.

## 4. Component Stylings

### Buttons

**Primary (White on Dark)**
- Background: `#ffffff`
- Text: `#1f2228`
- Padding: 12px 24px
- Radius: 0px (sharp corners)
- Font: GeistMono 14px weight 400, uppercase, letter-spacing 1.4px
- Hover: `rgba(255, 255, 255, 0.9)` background
- Use: Primary CTA ("TRY GROK", "GET STARTED")

**Ghost / Outlined**
- Background: transparent
- Text: `#ffffff`
- Padding: 12px 24px
- Radius: 0px
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Font: GeistMono 14px weight 400, uppercase, letter-spacing 1.4px
- Hover: `rgba(255, 255, 255, 0.05)` background
- Use: Secondary actions ("LEARN MORE", "VIEW API")

**Text Link**
- Background: none
- Text: `#ffffff`
- Font: universalSans 16px weight 400
- Hover: `rgba(255, 255, 255, 0.5)` -- dims on hover
- Use: Inline links, navigation items

### Cards & Containers
- Background: `rgba(255, 255, 255, 0.03)` or transparent
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Radius: 0px (sharp) or 4px (subtle)
- Shadow: none -- xAI does not use box shadows
- Hover: border shifts to `rgba(255, 255, 255, 0.2)`

### Navigation
- Dark background matching page (`#1f2228`)
- Brand logotype: white text, left-aligned
- Links: universalSans 14px weight 400, `#ffffff` text
- Hover: `rgba(255, 255, 255, 0.5)` text color
- CTA: white primary button, right-aligned
- Mobile: hamburger toggle

### Badges / Tags
**Monospace Tag**
- Background: transparent
- Text: `#ffffff`
- Padding: 4px 8px
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Radius: 0px
- Font: GeistMono 12px uppercase, letter-spacing 1px

### Inputs & Forms
- Background: transparent or `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Radius: 0px
- Focus: ring with `rgb(59, 130, 246) / 0.5`
- Text: `#ffffff`
- Placeholder: `rgba(255, 255, 255, 0.3)`
- Label: `rgba(255, 255, 255, 0.7)`, universalSans 14px

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 8px, 24px, 48px
- The scale is deliberately sparse -- xAI avoids granular spacing distinctions, preferring large jumps that create clear visual hierarchy through whitespace alone

### Grid & Container
- Max content width: approximately 1200px
- Hero: full-viewport height with massive centered monospace headline
- Feature sections: simple vertical stacking with generous section padding (48px-96px)
- Two-column layouts for feature descriptions at desktop
- Full-width dark sections maintain the single dark background throughout

### Whitespace Philosophy
- **Extreme generosity**: xAI uses vast amounts of whitespace. The 320px headline with 48px+ surrounding padding creates a sense of emptiness that is itself a design statement -- the content is so important it needs room to breathe.
- **Vertical rhythm over horizontal density**: Content stacks vertically with large gaps between sections rather than packing horizontally. This creates a scroll-driven experience that feels deliberate and cinematic.
- **No visual noise**: The absence of decorative elements, borders between sections, and color variety means whitespace is the primary structural tool.

### Breakpoints
- 2000px, 1536px, 1280px, 1024px, 1000px, 768px, 640px
- Tailwind responsive modifiers drive breakpoint behavior

### Border Radius Scale
- Sharp (0px): Primary treatment for buttons, cards, inputs -- the default
- Subtle (4px): Occasional softening on secondary containers
- The near-zero radius philosophy is core to the brand's brutalist identity

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, body content |
| Surface (Level 1) | `rgba(255,255,255,0.03)` background | Subtle card surfaces |
| Bordered (Level 2) | `1px solid rgba(255,255,255,0.1)` border | Cards, containers, dividers |
| Active (Level 3) | `1px solid rgba(255,255,255,0.2)` border | Hover states, active elements |
| Focus (Accessibility) | `ring` with `rgb(59,130,246)/0.5` | Keyboard focus indicator |

**Elevation Philosophy**: xAI rejects the conventional shadow-based elevation system entirely. There are no box-shadows anywhere on the site. Instead, depth is communicated through three mechanisms: (1) opacity-based borders that brighten on interaction, creating a sense of elements "activating" rather than lifting; (2) extremely subtle background opacity shifts (`0.03` to `0.08`) that create barely-perceptible surface differentiation; and (3) the massive scale contrast between the 320px display type and 16px body text, which creates typographic depth. This is elevation through contrast and opacity, not through simulated light and shadow.

## 7. Do's and Don'ts

### Do
- Use `#1f2228` as the universal background -- never pure black `#000000`
- Use GeistMono for all display headlines and button text -- monospace IS the brand
- Apply uppercase + 1.4px letter-spacing to all button labels
- Use weight 300 for the massive display headline (320px)
- Keep borders at `rgba(255, 255, 255, 0.1)` -- barely visible, not absent
- Dim interactive elements on hover to `rgba(255, 255, 255, 0.5)` -- the reverse of convention
- Maintain sharp corners (0px radius) as the default -- brutalist precision
- Use universalSans for all body and reading text at 16px/1.5

### Don't
- Don't use box-shadows -- xAI has zero shadow elevation
- Don't introduce color accents beyond white and the dark background -- the monochromatic palette is sacred
- Don't use large border-radius (8px+, pill shapes) -- the sharp edge is intentional
- Don't use bold weights (600-700) for headlines -- weight 300-400 only
- Don't brighten elements on hover -- xAI dims to `0.5` opacity instead
- Don't add decorative gradients, illustrations, or color blocks
- Don't use proportional fonts for buttons -- GeistMono uppercase is mandatory
- Don't use colored status indicators unless absolutely necessary -- keep everything in the white/dark spectrum

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, hero headline scales dramatically down |
| Small Tablet | 640-768px | Slight increase in padding |
| Tablet | 768-1024px | Two-column layouts begin, heading sizes increase |
| Desktop | 1024-1280px | Full layout, generous whitespace |
| Large | 1280-1536px | Wider containers, more breathing room |
| Extra Large | 1536-2000px | Maximum content width, centered |
| Ultra | >2000px | Content stays centered, extreme margins |

### Touch Targets
- Buttons use 12px 24px padding for comfortable touch
- Navigation links spaced with 24px gaps
- Minimum tap target: 44px height
- Mobile: full-width buttons for easy thumb reach

### Collapsing Strategy
- Hero: 320px monospace headline scales down dramatically (to ~48px-64px on mobile)
- Navigation: horizontal links collapse to hamburger menu
- Feature sections: two-column to single-column stacking
- Section padding: 96px -> 48px -> 24px across breakpoints
- Massive display type is the first thing to resize -- it must remain impactful but not overflow

### Image Behavior
- Minimal imagery -- the site relies on typography and whitespace
- Any product screenshots maintain sharp corners
- Full-width media scales proportionally with viewport

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Dark (`#1f2228`)
- Text Primary: White (`#ffffff`)
- Text Secondary: White 70% (`rgba(255, 255, 255, 0.7)`)
- Text Muted: White 50% (`rgba(255, 255, 255, 0.5)`)
- Text Disabled: White 30% (`rgba(255, 255, 255, 0.3)`)
- Border Default: White 10% (`rgba(255, 255, 255, 0.1)`)
- Border Strong: White 20% (`rgba(255, 255, 255, 0.2)`)
- Surface Subtle: White 3% (`rgba(255, 255, 255, 0.03)`)
- Surface Hover: White 8% (`rgba(255, 255, 255, 0.08)`)
- Focus Ring: Blue (`rgb(59, 130, 246)` at 50% opacity)
- Button Primary BG: White (`#ffffff`), text Dark (`#1f2228`)

### Example Component Prompts
- "Create a hero section on #1f2228 background. Headline in GeistMono at 72px weight 300, color #ffffff, centered. Subtitle in universalSans 18px weight 400, rgba(255,255,255,0.7), max-width 600px centered. Two buttons: primary (white bg, #1f2228 text, 0px radius, GeistMono 14px uppercase, 1.4px letter-spacing, 12px 24px padding) and ghost (transparent bg, 1px solid rgba(255,255,255,0.2), white text, same font treatment)."
- "Design a card: transparent or rgba(255,255,255,0.03) background, 1px solid rgba(255,255,255,0.1) border, 0px radius, 24px padding. No shadow. Title in universalSans 22px weight 400, #ffffff. Body in universalSans 16px weight 400, rgba(255,255,255,0.7), line-height 1.5. Hover: border changes to rgba(255,255,255,0.2)."
- "Build navigation: #1f2228 background, full-width. Brand text left (GeistMono 14px uppercase). Links in universalSans 14px #ffffff with hover to rgba(255,255,255,0.5). White primary button right-aligned (GeistMono 14px uppercase, 1.4px letter-spacing)."
- "Create a form: dark background #1f2228. Label in universalSans 14px rgba(255,255,255,0.7). Input with transparent bg, 1px solid rgba(255,255,255,0.2) border, 0px radius, white text 16px universalSans. Focus: blue ring rgb(59,130,246)/0.5. Placeholder: rgba(255,255,255,0.3)."
- "Design a monospace tag/badge: transparent bg, 1px solid rgba(255,255,255,0.2), 0px radius, GeistMono 12px uppercase, 1px letter-spacing, white text, 4px 8px padding."

### Iteration Guide
1. Always start with `#1f2228` background -- never use pure black or gray backgrounds
2. GeistMono for display and buttons, universalSans for everything else -- never mix these roles
3. All buttons must be GeistMono uppercase with 1.4px letter-spacing -- this is non-negotiable
4. No shadows, ever -- depth comes from border opacity and background opacity only
5. Borders are always white with low opacity (0.1 default, 0.2 for emphasis)
6. Hover behavior dims to 0.5 opacity rather than brightening -- the reverse of most systems
7. Sharp corners (0px) by default -- only use 4px for specific secondary containers
8. Body text at 16px universalSans with 1.5 line-height for comfortable reading
9. Generous section padding (48px-96px) -- let content breathe in the darkness
10. The monochromatic white-on-dark palette is absolute -- resist adding color unless critical for function
# Design System: Mintlify

## 1. Visual Theme & Atmosphere

Mintlify's website is a study in documentation-as-product design — a white, airy, information-rich surface that treats clarity as its highest aesthetic value. The page opens with a luminous white (`#ffffff`) background, near-black (`#0d0d0d`) text, and a signature green brand accent (`#18E299`) that signals freshness and intelligence without dominating the palette. The overall mood is calm, confident, and engineered for legibility — a design system that whispers "we care about your developer experience" in every pixel.

The Inter font family carries the entire typographic load. At display sizes (40–64px), it uses tight negative letter-spacing (-0.8px to -1.28px) and semibold weight (600), creating headlines that feel focused and compressed like well-written documentation headers. Body text at 16–18px with 150% line-height provides generous reading comfort. Geist Mono appears exclusively for code and technical labels — uppercase, tracked-out, small — the voice of the terminal inside the marketing page.

What distinguishes Mintlify from other documentation platforms is its atmospheric gradient hero. A soft, cloud-like green-to-white gradient wash behind the hero content creates a sense of ethereal intelligence — documentation that floats above the noise. Below the hero, the page settles into a disciplined alternation of white sections separated by subtle 5% opacity borders. Cards use generous padding (24px+) with large radii (16px–24px) and whisper-thin borders, creating containers that feel open rather than boxed.

**Key Characteristics:**
- Inter with tight negative tracking at display sizes (-0.8px to -1.28px) — compressed yet readable
- Geist Mono for code labels: uppercase, 12px, tracked-out, the terminal voice
- Brand green (`#18E299`) used sparingly — CTAs, hover states, focus rings, and accent touches
- Atmospheric gradient hero with cloud-like green-white wash
- Ultra-round corners: 16px for containers, 24px for featured cards, full-round (9999px) for buttons and pills
- Subtle 5% opacity borders (`rgba(0,0,0,0.05)`) creating barely-there separation
- 8px base spacing system with generous section padding (48px–96px)
- Clean white canvas — no gray backgrounds, no color sections, depth through borders and whitespace alone

## 2. Color Palette & Roles

### Primary
- **Near Black** (`#0d0d0d`): Primary text, headings, dark surfaces. Not pure black — the micro-softness improves reading comfort.
- **Pure White** (`#ffffff`): Page background, card surfaces, input backgrounds.
- **Brand Green** (`#18E299`): The signature accent — CTAs, links on hover, focus rings, brand identity.

### Secondary Accents
- **Brand Green Light** (`#d4fae8`): Tinted green surface for badges, hover states, subtle backgrounds.
- **Brand Green Deep** (`#0fa76e`): Darker green for text on light-green badges, hover states on brand elements.
- **Warm Amber** (`#c37d0d`): Warning states, caution badges — `--twoslash-warn-bg`.
- **Soft Blue** (`#3772cf`): Tag backgrounds, informational annotations — `--twoslash-tag-bg`.
- **Error Red** (`#d45656`): Error states, destructive actions — `--twoslash-error-bg`.

### Neutral Scale
- **Gray 900** (`#0d0d0d`): Primary heading text, nav links.
- **Gray 700** (`#333333`): Secondary text, descriptions, body copy.
- **Gray 500** (`#666666`): Tertiary text, muted labels.
- **Gray 400** (`#888888`): Placeholder text, disabled states, code annotations.
- **Gray 200** (`#e5e5e5`): Borders, dividers, card outlines.
- **Gray 100** (`#f5f5f5`): Subtle surface backgrounds, hover states.
- **Gray 50** (`#fafafa`): Near-white surface tint.

### Interactive
- **Link Default** (`#0d0d0d`): Links match text color, relying on underline/context.
- **Link Hover** (`#18E299`): Brand green on hover — `var(--color-brand)`.
- **Focus Ring** (`#18E299`): Brand green focus outline for inputs and interactive elements.

### Surface & Overlay
- **Card Background** (`#ffffff`): White cards on white background, separated by borders.
- **Border Subtle** (`rgba(0,0,0,0.05)`): 5% black opacity borders — the primary separation mechanism.
- **Border Medium** (`rgba(0,0,0,0.08)`): Slightly stronger borders for interactive elements.
- **Input Border Focus** (`var(--color-brand)`): Green ring on focused inputs.

### Shadows & Depth
- **Card Shadow** (`rgba(0,0,0,0.03) 0px 2px 4px`): Barely-there ambient shadow for subtle lift.
- **Button Shadow** (`rgba(0,0,0,0.06) 0px 1px 2px`): Micro-shadow for button depth.
- **No heavy shadows**: Mintlify relies on borders, not shadows, for depth.

## 3. Typography Rules

### Font Family
- **Primary**: `Inter`, with fallback: `Inter Fallback, system-ui, -apple-system, sans-serif`
- **Monospace**: `Geist Mono`, with fallback: `Geist Mono Fallback, ui-monospace, SFMono-Regular, monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Inter | 64px (4.00rem) | 600 | 1.15 (tight) | -1.28px | Maximum impact, hero headlines |
| Section Heading | Inter | 40px (2.50rem) | 600 | 1.10 (tight) | -0.8px | Feature section titles |
| Sub-heading | Inter | 24px (1.50rem) | 500 | 1.30 (tight) | -0.24px | Card headings, sub-sections |
| Card Title | Inter | 20px (1.25rem) | 600 | 1.30 (tight) | -0.2px | Feature card titles |
| Card Title Light | Inter | 20px (1.25rem) | 500 | 1.30 (tight) | -0.2px | Secondary card headings |
| Body Large | Inter | 18px (1.13rem) | 400 | 1.50 | normal | Hero descriptions, introductions |
| Body | Inter | 16px (1.00rem) | 400 | 1.50 | normal | Standard reading text |
| Body Medium | Inter | 16px (1.00rem) | 500 | 1.50 | normal | Navigation, emphasized text |
| Button | Inter | 15px (0.94rem) | 500 | 1.50 | normal | Button labels |
| Link | Inter | 14px (0.88rem) | 500 | 1.50 | normal | Navigation links, small CTAs |
| Caption | Inter | 14px (0.88rem) | 400–500 | 1.50–1.71 | normal | Metadata, descriptions |
| Label Uppercase | Inter | 13px (0.81rem) | 500 | 1.50 | 0.65px | `text-transform: uppercase`, section labels |
| Small | Inter | 13px (0.81rem) | 400–500 | 1.50 | -0.26px | Small body text |
| Mono Code | Geist Mono | 12px (0.75rem) | 500 | 1.50 | 0.6px | `text-transform: uppercase`, technical labels |
| Mono Badge | Geist Mono | 12px (0.75rem) | 600 | 1.50 | 0.6px | `text-transform: uppercase`, status badges |
| Mono Micro | Geist Mono | 10px (0.63rem) | 500 | 1.50 | normal | `text-transform: uppercase`, tiny labels |

### Principles
- **Tight tracking at display sizes**: Inter at 40–64px uses -0.8px to -1.28px letter-spacing. This compression creates headlines that feel deliberate and space-efficient — documentation headings, not billboard copy.
- **Relaxed reading at body sizes**: 16–18px body text uses normal tracking with 150% line-height, creating generous reading lanes. Documentation demands comfort.
- **Two-font system**: Inter for all human-readable content, Geist Mono exclusively for technical/code contexts. The boundary is strict — no mixing.
- **Uppercase as hierarchy signal**: Section labels and technical tags use uppercase + positive tracking (0.6px–0.65px) as a clear visual delimiter between content types.
- **Three weights**: 400 (body/reading), 500 (UI/navigation/emphasis), 600 (headings/titles). No bold (700) in the system.

## 4. Component Stylings

### Buttons

**Primary Brand (Full-round)**
- Background: `#0d0d0d` (near-black)
- Text: `#ffffff`
- Padding: 8px 24px
- Radius: 9999px (full pill)
- Font: Inter 15px weight 500
- Shadow: `rgba(0,0,0,0.06) 0px 1px 2px`
- Hover: opacity 0.9
- Use: Primary CTA ("Get Started", "Start Building")

**Secondary / Ghost (Full-round)**
- Background: `#ffffff`
- Text: `#0d0d0d`
- Padding: 4.5px 12px
- Radius: 9999px (full pill)
- Border: `1px solid rgba(0,0,0,0.08)`
- Font: Inter 15px weight 500
- Hover: opacity 0.9
- Use: Secondary actions ("Request Demo", "View Docs")

**Transparent / Nav Button**
- Background: transparent
- Text: `#0d0d0d`
- Padding: 5px 6px
- Radius: 8px
- Border: none or `1px solid rgba(0,0,0,0.05)`
- Use: Navigation items, icon buttons

**Brand Accent Button**
- Background: `#18E299`
- Text: `#0d0d0d`
- Padding: 8px 24px
- Radius: 9999px
- Use: Special promotional CTAs

### Cards & Containers

**Standard Card**
- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.05)`
- Radius: 16px
- Padding: 24px
- Shadow: `rgba(0,0,0,0.03) 0px 2px 4px`
- Hover: subtle border darkening to `rgba(0,0,0,0.08)`

**Featured Card**
- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.05)`
- Radius: 24px
- Padding: 32px
- Inner content areas may have their own 16px radius containers

**Logo/Trust Card**
- Background: `#fafafa` or `#ffffff`
- Border: `1px solid rgba(0,0,0,0.05)`
- Radius: 16px
- Centered logo/icon with consistent sizing

### Inputs & Forms

**Email Input**
- Background: transparent or `#ffffff`
- Text: `#0d0d0d`
- Padding: 0px 12px (height controlled by line-height)
- Border: `1px solid rgba(0,0,0,0.08)`
- Radius: 9999px (full pill, matching buttons)
- Focus: `1px solid var(--color-brand)` + `outline: 1px solid var(--color-brand)`
- Placeholder: `#888888`

### Navigation
- Clean horizontal nav on white, sticky with backdrop blur
- Brand logotype left-aligned
- Links: Inter 14–15px weight 500, `#0d0d0d` text
- Hover: color shifts to brand green `var(--color-brand)`
- CTA: dark pill button right-aligned ("Get Started")
- Mobile: hamburger menu collapse at 768px

### Image Treatment
- Product screenshots with subtle 1px borders
- Rounded containers: 16px–24px radius
- Atmospheric gradient backgrounds behind hero images
- Cloud/sky imagery with soft green tinting

### Distinctive Components

**Atmospheric Hero**
- Full-width gradient wash: soft green-to-white cloud-like gradient
- Centered headline with tight tracking
- Subtitle in muted gray
- Dual CTA buttons (dark primary + ghost secondary)
- The gradient creates a sense of elevation and intelligence

**Trust Bar / Logo Grid**
- "Loved by your favorite companies" section
- Company logos in muted grayscale
- Grid or horizontal layout with consistent sizing
- Subtle border separation between logos

**Feature Cards with Icons**
- Icon or illustration at top
- Title at 20px weight 600
- Description at 14–16px in gray
- Consistent padding and border treatment
- Grid layout: 2–3 columns on desktop

**CTA Footer Section**
- Dark or gradient background
- Large headline: "Make documentation your winning advantage"
- Email input with pill styling
- Brand green accent on CTAs

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, 4px, 5px, 6px, 7px, 8px, 10px, 12px, 16px, 24px, 32px, 48px, 64px
- Section padding: 48px–96px vertical
- Card padding: 24px–32px
- Component gaps: 8px–16px

### Grid & Container
- Max content width: approximately 1200px
- Hero: centered single-column with generous top padding (96px+)
- Feature sections: 2–3 column CSS Grid for cards
- Full-width sections with contained content
- Consistent horizontal padding: 24px (mobile) to 32px (desktop)

### Whitespace Philosophy
- **Documentation-grade breathing room**: Every element has generous surrounding whitespace. Mintlify sells documentation, so the marketing page itself demonstrates reading comfort.
- **Sections as chapters**: Each feature section is a self-contained unit with 48px–96px vertical padding, creating clear "chapter breaks."
- **Content density is low**: Unlike developer tools that pack the page, Mintlify uses 1–2 key messages per section with supporting imagery.

### Border Radius Scale
- Small (4px): Inline code, small tags, tooltips
- Medium (8px): Nav buttons, transparent buttons, small containers
- Standard (16px): Cards, content containers, image wrappers
- Large (24px): Featured cards, hero containers, section panels
- Full Pill (9999px): Buttons, inputs, badges, pills — the signature shape

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, text blocks |
| Subtle Border (Level 1) | `1px solid rgba(0,0,0,0.05)` | Standard card borders, dividers |
| Medium Border (Level 1b) | `1px solid rgba(0,0,0,0.08)` | Interactive elements, input borders |
| Ambient Shadow (Level 2) | `rgba(0,0,0,0.03) 0px 2px 4px` | Cards with subtle lift |
| Button Shadow (Level 2b) | `rgba(0,0,0,0.06) 0px 1px 2px` | Button micro-depth |
| Focus Ring (Accessibility) | `1px solid #18E299` outline | Focused inputs, active interactive elements |

**Shadow Philosophy**: Mintlify barely uses shadows. The depth system is almost entirely border-driven — ultra-subtle 5% opacity borders create separation without visual weight. When shadows appear, they're atmospheric whispers (`0.03 opacity, 2px blur, 4px spread`) that add the barest sense of lift. This restraint keeps the page feeling flat and paper-like — appropriate for a documentation company whose product is about clarity and readability.

### Decorative Depth
- Hero gradient: atmospheric green-white cloud gradient behind hero content
- No background color alternation — white on white throughout
- Depth comes from border opacity variation (5% → 8%) and whitespace

## 7. Dark Mode

### Color Inversions
- **Background**: `#0d0d0d` (near-black)
- **Text Primary**: `#ededed` (near-white)
- **Text Secondary**: `#a0a0a0` (muted gray)
- **Brand Green**: `#18E299` (unchanged — the green works on both backgrounds)
- **Border**: `rgba(255,255,255,0.08)` (white at 8% opacity)
- **Card Background**: `#141414` (slightly lighter than page)
- **Shadow**: `rgba(0,0,0,0.4) 0px 2px 4px` (stronger shadow for contrast)

### Key Adjustments
- Buttons invert: white background dark text becomes dark background light text
- Badge backgrounds shift to deeper tones with lighter text
- Focus ring remains brand green
- Hero gradient shifts to dark-tinted green atmospheric wash

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Single column, stacked layout, hamburger nav |
| Tablet | 768–1024px | Two-column grids begin, expanded padding |
| Desktop | >1024px | Full layout, 3-column grids, maximum content width |

### Touch Targets
- Buttons with full-pill shape have comfortable 8px+ vertical padding
- Navigation links spaced with adequate 16px+ gaps
- Mobile menu provides full-width tap targets

### Collapsing Strategy
- Hero: 64px → 40px headline, maintains tight tracking proportionally
- Navigation: horizontal links + CTA → hamburger menu at 768px
- Feature cards: 3-column → 2-column → single column stacked
- Section spacing: 96px → 48px on mobile
- Footer: multi-column → stacked single column
- Trust bar: grid → horizontal scroll or stacked

### Image Behavior
- Product screenshots maintain aspect ratio with responsive containers
- Hero gradient simplifies on mobile
- Full-width sections maintain edge-to-edge treatment

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Near Black (`#0d0d0d`)
- Background: Pure White (`#ffffff`)
- Heading text: Near Black (`#0d0d0d`)
- Body text: Gray 700 (`#333333`)
- Border: `rgba(0,0,0,0.05)` (5% opacity)
- Brand accent: Green (`#18E299`)
- Link hover: Brand Green (`#18E299`)
- Focus ring: Brand Green (`#18E299`)

### Example Component Prompts
- "Create a hero section on white background with atmospheric green-white gradient wash. Headline at 64px Inter weight 600, line-height 1.15, letter-spacing -1.28px, color #0d0d0d. Subtitle at 18px Inter weight 400, line-height 1.50, color #666666. Dark pill CTA (#0d0d0d, 9999px radius, 8px 24px padding) and ghost pill button (white, 1px solid rgba(0,0,0,0.08), 9999px radius)."
- "Design a card: white background, 1px solid rgba(0,0,0,0.05) border, 16px radius, 24px padding, shadow rgba(0,0,0,0.03) 0px 2px 4px. Title at 20px Inter weight 600, letter-spacing -0.2px. Body at 14px weight 400, #666666."
- "Build a pill badge: #d4fae8 background, #0fa76e text, 9999px radius, 4px 12px padding, 13px Inter weight 500, uppercase."
- "Create navigation: white sticky header with backdrop-filter blur(12px). Inter 15px weight 500 for links, #0d0d0d text. Dark pill CTA 'Get Started' right-aligned, 9999px radius. Bottom border: 1px solid rgba(0,0,0,0.05)."
- "Design a trust section showing company logos in muted gray. Grid layout with 16px radius containers, 1px border at 5% opacity. Label above: 'Loved by your favorite companies' at 13px Inter weight 500, uppercase, tracking 0.65px."

### Iteration Guide
1. Always use full-pill radius (9999px) for buttons and inputs — this is Mintlify's signature shape
2. Keep borders at 5% opacity (`rgba(0,0,0,0.05)`) — stronger borders break the airy feeling
3. Letter-spacing scales with font size: -1.28px at 64px, -0.8px at 40px, -0.24px at 24px, normal at 16px
4. Three weights only: 400 (read), 500 (interact), 600 (announce)
5. Brand green (`#18E299`) is used sparingly — CTAs and hover states only, never for decorative fills
6. Geist Mono uppercase for technical labels, Inter for everything else
7. Section padding is generous: 64px–96px on desktop, 48px on mobile
8. No gray background sections — white throughout, separation through borders and whitespace
