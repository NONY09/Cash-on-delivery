---
name: Chega
description: Festive everyday commerce with forest green, bright red, gold and warm paper.
colors:
  ink: "#29201e"
  muted: "#6c5a54"
  paper: "#fffbf5"
  cream: "#f8efdf"
  coral: "#c63825"
  coral-hover: "#a82b1b"
  peach: "#ffe1cc"
  line: "#dfd3c8"
  forest: "#154b40"
  forest-deep: "#103c33"
  gold: "#f6cb73"
  on-forest: "#fff5df"
  muted-forest: "#dce8da"
  rose: "#f6e2d8"
  bordeaux: "#8c2437"
  bordeaux-hover: "#6f1929"
  muted-rose: "#6b4f4d"
  white: "white"
typography:
  display:
    fontFamily: "'Chega Display', sans-serif"
    fontSize: "clamp(54px,6vw,80px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-.03em"
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
    backgroundColor: "{colors.cream}"
    textColor: "{colors.coral}"
    rounded: "50%"
    padding: "4px"
  search:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "3px 8px 3px 16px"
  product-image:
    backgroundColor: "{colors.peach}"
    rounded: "{rounded.image}"
  campaign-resina-button:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.forest-deep}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  campaign-beauty-button:
    backgroundColor: "{colors.bordeaux}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  campaign-movement-button:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  payment-note:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "17px"
---

# Design System: Chega

## Overview

**Creative North Star: "A warm, festive everyday store"**

Ronaldo approved a stronger store-wide palette and a Christmas campaign on 7 October 2026. Warm paper and clear editorial type retain Chega’s identity. Forest green anchors the announcement strip, service line, prices and footer; bright red marks purchase actions and selected categories. Campaign surfaces add forest and gold, rose and bordeaux, or cream and green according to the product. Product facts and checkout behavior are preserved.

The season is expressed through product photography, warm materials and transparent evergreen decoration. Light changes gently within reserved header and footer space; the visitor can pause it and reduced-motion preference keeps it static. The homepage composition is documented in the store surface brief.

**Key Characteristics:**
- Warm paper and cream surfaces.
- Bold display type paired with a plain sans-serif body.
- Flat content with lifted support and overlay surfaces.
- Gently curved controls and larger image corners.

## Colors

The palette combines warm neutrals with forest green, bright red and product-specific gold or bordeaux accents. Frontmatter contains the normative values. Base names follow CSS custom properties; rose, bordeaux, bordeaux-hover and muted-rose name the literal beauty-campaign colors in styles.css.

### Primary

Coral marks primary actions, headline emphasis, focus outlines and selected offers. Coral hover darkens primary actions. Peach provides image backing and text selection.

### Secondary

Forest and forest-deep anchor service and seasonal surfaces. On-forest and muted-forest keep text legible on these dark surfaces; gold highlights the Resina headline, price and campaign action. Rose backs the Pente campaign, with bordeaux for its headline, price and action, bordeaux-hover for its hover state and muted-rose for supporting text. Cream and forest pair on the Joelheira campaign.

### Neutral

Ink anchors headings and category labels; coral identifies the selected category. Muted carries body copy and secondary information. Paper is the default canvas; cream distinguishes supporting sections. Line separates controls and content. White is used on coral buttons and badges.

## Typography

Chega Display and Chega Sans are self-hosted font families, with sans-serif fallbacks. Display type carries major headings; body type handles product titles, navigation, controls and explanatory copy. Prices use tabular numerals.

The frontmatter records the Resina campaign display, section heading, product title, body and small-label roles. These are roles, not one universal heading size: product headings use (43px), account headings (62px) and legal headings (48px) on desktop. Pente campaign display uses clamp(44px,4.8vw,62px), and Joelheira uses clamp(40px,4.3vw,54px). At (900px) and below, campaign titles are (48px) for Resina and (42px) for the others; at (760px) and below they are (38px)/(32px), then (34px)/(29px) at (360px). Section headings become (32px) on mobile. Body copy stays comfortably spaced; FAQ and legal text use longer line heights and bounded measures.

## Layout

The centered container is capped at (1200px), with desktop edges of (32px) and mobile edges of (20px). Two-column layouts organize campaigns, product, help and account content; catalog spans the full container. Product grids use three equal columns on desktop, two at (1050px) and below, and one at (760px) and below. Desktop gaps are (32px) between columns and (44px) between rows. Card content stacks title, summary, price and kit action to avoid narrow side-by-side text.

At (1050px) and below, gaps tighten, header action labels hide and offers wrap. At (760px) and below, principal layouts become one column, the search occupies its own header row, supporting navigation text hides and the footer becomes two columns. At (360px) and below, footer and offer choices become one column. The campaign uses a (43%)/(57%) copy/image grid on desktop and stacks image above text at (900px) and below. Its controls occupy two rows at (420px) and below, with the indicators centered on the second row. Image and copy sizing remain independent; campaign images are contained squares.

Spacing combines compact control gaps with section padding. Catalog and help use the large section spacing on desktop and the mobile section spacing at the mobile breakpoint. Other sections retain their own source-specific rhythm. Page composition and the first-viewport contract live in `.impeccable/surfaces/store.md`.

## Elevation & Depth

Content is flat at rest, separated by paper, cream and fine warm borders. Shadows distinguish floating support and the chat panel. Product images and campaign photography carry their own photographed depth. Exact shadows and motion are recorded in the sidecar.

## Shapes

Controls share gently curved corners; tags and small overlays are tighter, images more generous. Numbered steps stand apart from rectangular controls. Product imagery clips to its frame. Fine borders define categories, offer choices, forms and dividers without boxing every content block.

## Components

- **Buttons:** bold body type, a minimum height of (52px), coral primary and outlined secondary variants. Primary hover darkens; secondary hover gains cream. Disabled actions use muted warm fills. Text actions remain plain and underline on hover.
- **Inputs:** cream search enclosure with an unboxed field; account fields and offer selects use paper surfaces and line borders. Account fields have a minimum height of (48px). The prototype's disabled account presentation does not imply live authentication.
- **Navigation:** plain body links, an oversized display wordmark and compact account access. Mobile search moves below the wordmark and actions. Link hover underlines rather than adding decorative motion.
- **Categories and tags:** circular photo highlights use 94px circles and 112px label columns on desktop, 80px circles and 96px columns on mobile. A coral ring and bold coral label identify the selected category; aria-pressed exposes selection. Native horizontal scrolling keeps future categories spaced and reachable. Frames have fixed equal width and height, nonshrinking flex sizing and overflow clipping; absolutely positioned contained images cannot expand grid tracks or overlap labels, including the tall Resina photo. Todos uses the existing bag icon. Informational image tags use compact paper-backed rectangles.
- **Product cards:** square rectangular image frames with gently rounded corners and fully contained original imagery, above stacked category, title, summary, price and kit action. Forest labels and prices remain distinct from the coral outlined kit action. Image-origin explanations remain visible. Keep prices aligned with tabular numerals and preserve illustrative-image labels.
- **Offer choices:** bordered radio labels; checked choices gain coral borders and a pale warm fill. Selection uses the actual configured offers.
- **Support and overlays:** a cream payment note, native FAQ disclosures, direct per-kit order links and a floating nonmodal FAQ panel. Contextual support remains available when the floater is hidden.

Interactive elements share a coral focus outline of (3px), offset by (4px); Resina campaign, seasonal toggle and footer use gold against forest surfaces. Button state transitions use (0.18s); FAQ transitions use (0.2s). Reduced-motion preference removes animations, transitions and smooth scrolling.

### Homepage banners and seasonal decoration

Three native scroll-snap slides lead with the actual products: Resina Extreme on forest and gold, Pente Alisador Portátil on rose and bordeaux, and Joelheira de Compressão on cream and green. Two new square editorial campaign photos preserve the supplied products; the Joelheira reuses its existing illustrative main image. Every slide names the product, derives its minimum price from configured offers and links to its exact product route. Campaign labels remain visible and all headings, prices and CTAs are accessible HTML. There is no before/after, invented discount or delivery-before-Christmas claim.

The desktop frame has 16px outer corners, a minimum height of 520px and 43/57 copy/image columns. Campaign photography remains fully contained in a square, capped at 520px. At 900px and below, the image precedes copy; the image cap becomes 360px, then 300px at 760px. Controls remain outside the slides: arrows, count, indicators and pause; indicators move to their own centered row at 420px and below. Native swipe, keyboard arrows, inactive-slide inert/aria-hidden, visibility/focus/hover pauses, reduced motion and route cleanup remain in banner.js. The automatic interval is 6.5 seconds; manual navigation stops it until the visitor resumes.

A transparent evergreen garland decorates the header and footer, hidden from assistive technology and unable to intercept input. Header space is reserved at 104px, 90px at 1050px, 64px at 760px and 58px at 360px; footer space is reserved by its top padding. The brightness animation lasts 5.5 seconds, alternates gently and is paused by default. seasonal.js enables it only for a visible scene in a visible tab without manual pause or reduced-motion preference. The shared “Pausar efeitos” control toggles decoration independently of banner rotation; reduced motion displays “Efeitos estáticos”. Without IntersectionObserver, decoration stays static. No preference persistence or backend call is added.

The five new WebPs total 241,958 bytes: two 1000×1000 campaign photos, their 600×600 mobile variants and the 1100×367 transparent garland. Prompts and origins are recorded in assets/campanhas/SOURCE.md. Documentation is based on source and asset inspection; no browser captures or visual approval are claimed.

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

