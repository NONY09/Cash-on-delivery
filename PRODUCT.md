# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Static HTML, CSS and JavaScript chosen for this first frontend structure. Repository NONY09/Cash-on-delivery, branch main, connected by the user to Netlify. No installation or build required. Framework choice remains open for the backend stage.

## Users
Brazilian shoppers browsing on mobile and desktop, with no account required to browse.

## Product Purpose
A curated affiliate storefront for products paid for upon delivery. Make the buying mechanism clear, direct each chosen kit to its exact external offer, and provide accessible human support.

## Operating Context
Updates must go to NONY09/Cash-on-delivery on main, which the user states is connected to Netlify for automatic publishing. Deployment success must be verified separately. Supabase Auth and private account profiles are integrated with the connected Free project vsmhkanwhbkkashdjtho. Public registration is paused in both UI and database until SMTP, allowed redirect URLs, CAPTCHA and merchant identity are configured. Resina Extreme, Joelheira de Compressão and Pente Alisador Portátil affiliate offers are supplied and verified; the checkout is external to the catalog. WhatsApp: +55 81 99688-1704.

## Capabilities and Constraints
Catalog, search, circular photo category filters, product detail, full-width multi-product catalog in batches of 12, individual product pages and direct offer checkout without a cart, FAQ conversation, WhatsApp and account UI. Authentication is implemented; email delivery is pending configuration and SMS is disabled pending an approved provider. No internal order submission, live coverage, or inventory. Only real supplied products are shown. The user approved the name Chega. The live storefront URL is https://cchega.netlify.app/. The home banner rotates between the brand/payment mechanism and the featured supplied product.

## Evidence on Hand
Resina Extreme product material: two supplier photos and a 51-second application video, producer Ares comércio e Distribuição ltda, 500 ml label, and warranty of 7 days informed by the user. Six supplied Logzz affiliate URLs were checked in the actual checkout: quantities 1–6 and prices 99.99 / 124.99 / 147.00 / 197.00 / 180.00 / 210.00 BRL. No live stock, coverage or verified customer reviews supplied. Never invent these. Native swipe gallery, thumbnails and click-to-expand video; video loads only after expansion.

Joelheira de Compressão: producer Alexsander Noronha, two supplied images, a generated illustrative main image clearly labeled, no supplied video or customer reviews. Five exact kits (1/2/3/4/6) were checked in the provided checkout links at BRL 109.90 / 129.90 / 259.80 / 258.90 / 389.70. Supplier dimensions are attributed. Describe construction, fit and measures; do not reproduce unsupported medical/performance claims. Account work, SMS and CAPTCHA are deferred by the user while focusing on storefront products.

Pente Alisador Portátil: two original supplied images, retained without generative editing. Three exact kits (1/2/4) were checked at BRL 129.99 / 199.99 / 359.99. No producer, warranty period, temperature, battery or charging specifications supplied: do not invent them. Colors shown are not a stock guarantee. Category highlights derive from real product categories and filter by touch or keyboard; include Todos and horizontal scrolling as the catalog grows.

## Product Principles
- Payment on delivery is the buying mechanism, not a guarantee against fraud.
- Public browsing without sign-in.
- Show only the quantities configured for the selected offer.
- Passwords go directly to Supabase Auth; never store them in profiles or log credentials. Collect no CPF or address here because checkout already collects order data.
- Human support must remain reachable without covering purchase controls.

## Current purchase flow
No cart. Catalog card → choose a kit on that product page → exact affiliate URL in Logzz. Products are ordered separately. Desktop catalog: 3 columns; tablet: 2; mobile: 1. Generous row gaps, stacked card information and explicit kit action. Categories derive from supplied products; search handles accents; show more adds 12 cards.

## Account and budget constraints
Name, email, password and optional Brazilian phone. Required explicit account-purpose permission, independent default-off email/WhatsApp marketing preferences, editable profile, export and password-confirmed deletion. Authorize only the user ID and active confirmed Auth session; never editable metadata. Server-side signup gate and initial cap of 5000 profiles. Assets and products stay on Netlify, no Realtime, no public user lists, one row per profile, no own order copies. Plan quotas and SMTP/SMS delivery must not be described as guaranteed free at every scale.
