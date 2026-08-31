---
name: InnerCare Design System
colors:
  surface: '#f4faff'
  surface-dim: '#c0dfee'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#d9f2ff'
  surface-container-high: '#ceedfd'
  surface-container-highest: '#c9e7f7'
  on-surface: '#001f2a'
  on-surface-variant: '#424750'
  inverse-surface: '#163440'
  inverse-on-surface: '#e0f4ff'
  outline: '#727781'
  outline-variant: '#c2c6d2'
  surface-tint: '#2260a1'
  primary: '#003c6f'
  on-primary: '#ffffff'
  primary-container: '#0b5394'
  on-primary-container: '#a2c8ff'
  inverse-primary: '#a4c9ff'
  secondary: '#4f6169'
  on-secondary: '#ffffff'
  secondary-container: '#d2e6ef'
  on-secondary-container: '#55676f'
  tertiary: '#003e63'
  on-tertiary: '#ffffff'
  tertiary-container: '#005687'
  on-tertiary-container: '#93cbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#d2e6ef'
  secondary-fixed-dim: '#b6cad2'
  on-secondary-fixed: '#0b1e24'
  on-secondary-fixed-variant: '#374951'
  tertiary-fixed: '#cee5ff'
  tertiary-fixed-dim: '#96ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004a75'
  background: '#f4faff'
  on-background: '#001f2a'
  surface-variant: '#c9e7f7'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is engineered for the intersection of clinical excellence and high-end technological innovation. The brand personality is rooted in **Reliability, Precision, and Sophistication**, targeting healthcare professionals, hospital administrators, and medical engineers who demand clarity and absolute trust.

The visual style follows a **Premium Editorial** approach. It leverages generous whitespace and a rigorous grid to signal high-end quality, moving away from cluttered "software-as-a-service" aesthetics toward a more curated, authoritative presence. The interface utilizes a light color mode to maintain a sterile, clean clinical feel, while sharp typography ensures that technical data remains the focal point without visual distraction.

## Colors

The palette is anchored by the primary **Corporate Blue (#0B5394)**, a deep, authoritative tone that evokes medical stability and institutional trust. 

- **Primary:** Used for brand representation, primary actions, and high-level structural elements.
- **Secondary (Light Blue Accents):** Utilized for subtle backgrounds, highlight states, and informational callouts to soften the interface and reduce visual fatigue.
- **Tertiary:** A functional blue used for interactive links and secondary utility buttons.
- **Neutral Grays:** A refined scale of cool grays provides structure for borders, secondary text, and technical metadata.
- **Backgrounds:** Pure white (#FFFFFF) is the primary canvas to maximize the "clinical" feel, with light gray surfaces (#F8FAFC) used to differentiate content sections.

## Typography

Typography is used as a tool for precision. **Hanken Grotesk** provides a sharp, contemporary edge for headlines, giving the brand a modern engineering feel. **Source Sans 3** is used for body copy to ensure maximum legibility for long-form technical specifications and clinical documentation.

For technical data displays, use the `data-mono` setting which enables tabular numbers to ensure that numeric values align perfectly in tables and specification lists. Headlines should utilize tighter letter spacing as they scale up to maintain a high-end editorial appearance.

## Layout & Spacing

The layout philosophy follows a **fixed-grid system** on desktop to ensure content maintains its premium editorial structure, transitioning to a fluid model for mobile devices. 

- **Desktop (1440px+):** 12-column grid, 1280px max-width container, 24px gutters.
- **Tablet (768px - 1024px):** 8-column fluid grid, 24px margins.
- **Mobile (Up to 767px):** 4-column fluid grid, 16px margins.

Vertical rhythm is strictly maintained using multiples of 8px. Large sections of content are separated by `section` (80px) spacing to prevent the "cramped" feel often found in medical software, signaling high-end brand positioning through the luxury of space.

## Elevation & Depth

To maintain a high-trust clinical feel, depth is achieved through **low-contrast outlines and ambient shadows**. 

- **Surface 0 (Background):** Pure white, no elevation.
- **Surface 1 (Cards/Inputs):** Subtle 1px border (#E2E8F0) with an extremely diffused, low-opacity shadow (4% opacity, 8px blur, 4px offset). This creates a sense of "resting" on the page rather than floating.
- **Surface 2 (Dropdowns/Modals):** High-diffusion shadows (12% opacity, 24px blur) to signal temporary interaction layers.

Avoid heavy shadows or dark overlays. The goal is to feel light, airy, and translucent, similar to a high-end laboratory environment.

## Shapes

The design system utilizes **Rounded (Level 2)** shapes to strike a balance between professional precision and modern accessibility. 

- **Base Radius (8px):** Applied to standard buttons, input fields, and small UI components.
- **Large Radius (16px):** Applied to product cards and container modules to soften the overall visual footprint.
- **Extra Large Radius (24px):** Used for marketing hero elements or featured editorial content.

This curvature is consistent across all elements, ensuring that even technical data tables feel integrated into the modern brand aesthetic.

## Components

### Navigation Bar
The header is 80px tall with a white background and a subtle bottom border (#E2E8F0). The logo is left-aligned, followed by a high-contrast navigation menu using `label-md` typography. A primary CTA button ("Contact Sales") is right-aligned in Corporate Blue.

### Medical Product Cards
Cards feature a 1:1 aspect ratio product image at the top, followed by 24px of padding. Product titles use `headline-sm`. A technical "Quick Specs" section within the card uses `body-sm` with a light blue background (#E1F5FE) to separate it from the description.

### Technical Specification Tables
Tables are designed for high-density data without visual noise. Headers are `label-md` with a light gray background (#F8FAFC). Row dividers are 1px light gray. Cells use `data-mono` for numeric alignment. Hover states on rows use a subtle primary blue tint (2% opacity).

### Professional Contact Forms
Inputs use a height of 48px, 8px corner radius, and a 1px border. Focus states transition the border to Corporate Blue (#0B5394) with a soft glow. Labels sit above the field in `label-md` weight.

### Footer
The footer uses a deep neutral surface or the primary blue for a strong anchor. It features a 4-column layout: Company Info, Product Categories, Regulatory/Compliance links, and Contact Details. Typography in the footer is reduced to `body-sm` to maintain hierarchy.

### Additional Components
- **Status Badges:** Small chips used for "In Stock," "FDA Approved," or "New Technology" using high-saturation status colors with 10% opacity backgrounds.
- **Data Callouts:** Large numeric displays for performance metrics using `display-lg` typography to highlight key technical advantages.