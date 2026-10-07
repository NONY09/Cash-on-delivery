---
name: Chega
description: Warm everyday commerce with clear editorial type and a coral purchase accent.
colors:
  ink: "#29201e"
  muted: "#6c5a54"
  paper: "#fffdf9"
  cream: "#f6f0e7"
  coral: "#bf432c"
  coral-hover: "#a53622"
  peach: "#f3d4c6"
  line: "#dfd3c8"
  white: "white"
typography:
  display:
    fontFamily: "'Chega Display', sans-serif"
    fontSize: "clamp(60px,6.5vw,88px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Chega Display', sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-.03em"
  title:
    fontFamily: "'Chega Sans', sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "'Chega Sans', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Chega Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  tag: "6px"
  small: "8px"
  control: "10px"
  slip: "12px"
  chat: "14px"
  image: "16px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section-mobile: "56px"
  section-medium: "72px"
  section-large: "88px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  button-primary-hover:
    backgroundColor: "{colors.coral-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.cream}"
  category-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  search:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "3px 8px 3px 16px"
  product-image:
    backgroundColor: "{colors.peach}"
    rounded: "{rounded.image}"
  payment-note:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "17px"
---

# Design System: Chega

## Overview

**Creative North Star: "Warm everyday commerce"**

Bright paper surfaces, warm neutrals and clear editorial type make browsing feel approachable. Coral marks purchase actions and selected details; practical information stays readable and direct. Chega is a provisional identity.

**Key Characteristics:**
- Warm paper and cream surfaces.
- Bold display type paired with a plain sans-serif body.
- Flat content with lifted support and overlay surfaces.
- Gently curved controls and larger image corners.

## Colors

The palette combines warm neutrals with a coral action accent. Frontmatter contains the normative values, using the source CSS names.

### Primary

Coral marks primary actions, headline emphasis, focus outlines and selected offers. Coral hover darkens primary actions. Peach provides image backing and text selection.

### Neutral

Ink anchors headings and selected category controls. Muted carries body copy and secondary information. Paper is the default canvas; cream distinguishes supporting sections. Line separates controls and content. White is used on coral buttons and badges.

## Typography

Chega Display and Chega Sans are self-hosted font families, with sans-serif fallbacks. Display type carries major headings; body type handles product titles, navigation, controls and explanatory copy. Prices and cart counts use tabular numerals.

The frontmatter records the default hero, section heading, product title, body and small-label roles. These are roles, not one universal heading size: product headings use (43px), account headings (62px) and legal headings (48px) on desktop. The hero overrides to (76px) below the intermediate breakpoint, (66px) on mobile and (59px) on narrow screens. Section headings become (32px) on mobile. Body copy stays comfortably spaced; FAQ and legal text use longer line heights and bounded measures.

## Layout

The centered container is capped at (1200px), with desktop edges of (32px) and mobile edges of (20px). Two-column layouts organize hero, product, help and account content; catalog uses an asymmetric split. Product grids use auto-fit columns with a minimum of (250px), constrained to the available width.

At (1050px) and below, gaps tighten, header action labels hide and offers wrap. At (760px) and below, principal layouts become one column, the search occupies its own header row, supporting navigation text hides and the footer becomes two columns. At (360px) and below, footer and offer choices become one column. At (1450px) and above, the hero widens its gap and its actions align horizontally.

Spacing combines compact control gaps with section padding. Catalog and help use the large section spacing on desktop and the mobile section spacing at the mobile breakpoint. Other sections retain their own source-specific rhythm. Page composition and the first-viewport contract live in `.impeccable/surfaces/store.md`.

## Elevation & Depth

Content is flat at rest, separated by paper, cream and fine warm borders. Shadows distinguish the delivery slip, floating support, toast, chat panel and modal cart. The cart adds a dark translucent backdrop; it has square edges rather than card rounding. Exact shadows and motion are recorded in the sidecar.

## Shapes

Controls share gently curved corners; tags and small overlays are tighter, images more generous. Circular cart counts and numbered steps stand apart from rectangular controls. Product imagery clips to its frame. Fine borders define categories, offer choices, forms and dividers without boxing every content block.

## Components

- **Buttons:** bold body type, a minimum height of (52px), coral primary and outlined secondary variants. Primary hover darkens; secondary hover gains cream. Disabled actions use muted warm fills. Text actions remain plain and underline on hover.
- **Inputs:** cream search enclosure with an unboxed field; account fields and offer selects use paper surfaces and line borders. Account fields have a minimum height of (48px). The prototype's disabled account presentation does not imply live authentication.
- **Navigation:** plain body links, an oversized display wordmark and compact account/cart actions. Mobile search moves below the wordmark and actions. Link hover underlines rather than adding decorative motion.
- **Categories and tags:** categories use bordered controls; the active category switches to ink with paper text. Informational image tags use compact paper-backed rectangles.
- **Product cards:** rounded image frame above an unboxed title-and-price row. Detail links sit over the image. Keep prices aligned with tabular numerals and preserve visible demo status.
- **Offer choices:** bordered radio labels; checked choices gain coral borders and a pale warm fill. Selection uses the actual configured offers.
- **Support and overlays:** a cream payment note, native FAQ disclosures, a right-hand cart drawer and a floating nonmodal FAQ panel. Contextual support remains available when the floater is hidden.

All interactive elements share a coral focus outline of (3px), offset by (4px). Button state transitions use (0.18s); FAQ and toast transitions use (0.2s). The cart count bumps over (0.32s) when an offer is added. Reduced-motion preference removes animations, transitions and smooth scrolling.

## Do's and Don'ts

### Do:
- Do use coral for actions, selection and keyboard focus.
- Do keep content flat and use depth for lifted support and overlays.
- Do use display type for major headings and body type for controls and product titles.
- Do preserve visible demo labels and readable contextual support.
- Do honor reduced motion and keep the shared focus treatment.

### Don't:
- Don't add shadows to ordinary content cards.
- Don't turn every supporting label into coral emphasis.
- Don't treat the storefront's opening composition as a rule for every screen.
- Don't imply live authentication, inventory or checkout through visual status.
