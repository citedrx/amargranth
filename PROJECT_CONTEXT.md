# Amar Granth — Hydrogen Storefront: Project Context

This file is a handoff brief for continuing this project in Claude Code. Read this in full before making changes — it captures business context, decisions already made, and exactly what's done vs. not done in this codebase.

## Business context

**Amar Granth** (amargranth.com) is a children's illustrated mythology and heritage book publisher, run by ASM. ASM also runs a second, unrelated brand called **White Kailash** (Indian Khadi/handwoven textiles) on a separate Shopify store — do not confuse the two or mix their data.

- Target audience: millennial parents, ages 26–40, India-based, English + some Hindi
- Brand tone: emotional, story-driven, rooted in Indian heritage — not clinical or purely transactional
- Currency: INR. Timezone: IST.

## Migration history (why this project exists)

The old site (amargranth.com) was built on **Wix Classic Editor**. It's being migrated to a **Shopify + Hydrogen** stack for full code control. Migration work already completed by a prior Claude session (in claude.ai, not Claude Code):

1. **New Shopify store created**: "Amar Granth", domain `fd3ruf-f7.myshopify.com`, Basic plan, India/INR/IST, contact `contact@amargranth.com`. This is a **separate store** from White Kailash's Shopify store — don't mix them up.
2. **Catalog migrated**: 7 products, all currently in **DRAFT** status (intentionally not published — see "Go-live plan" below), with real inventory tracking, images, and SEO metadata copied over from Wix.
3. **6 collections created** to mirror the old site's "shop by collection" structure.
4. **66 blog posts migrated** into a Shopify blog (handle `blog`, title "Amar Granth Stories"), each recreated with the **exact same slug** as the old Wix post for SEO continuity.
5. **73 URL redirects created** in Shopify (66 blog + 7 product), mapping old Wix URLs to new Shopify URLs. These are already live in Shopify's redirect system and will activate automatically once the domain switches over — no further action needed on these.
6. **Domain (amargranth.com) is intentionally still pointed at the old Wix site.** Do not attempt to change DNS or go live until explicitly told the storefront is ready. This was a specific instruction from ASM to avoid any downtime or broken state on the live site.

**Not yet migrated** (out of scope for this codebase, flagging for awareness): static pages like About/Contact/FAQ from the old Wix site — these weren't accessible via API and will need manual content rebuild at some point.

## Shopify store reference data

**Store domain:** `fd3ruf-f7.myshopify.com`
**Blog:** handle `blog`, GID `gid://shopify/Blog/106927456511`

### Products (all currently DRAFT status)

| Title | Handle | Price | Stock |
|---|---|---|---|
| Shiva's Tears: A Children's Guide to the Rudraksha | `shivas-tears-a-childrens-guide-to-the-rudraksha` | ₹345 | 616 |
| The Chronicles of Lord Parashurama [Hardcover] | `the-chronicles-of-lord-parashurama-hardcover` | ₹495 (was ₹595) | 100 |
| A Children's Guide to the Rivers of Bharat [Paperback] | `a-childrens-guide-to-the-rivers-of-bharat-paperback` | ₹495 (was ₹595) | 50 |
| A Children's Guide to the 12 Shiva Jyotirlings [Hindi] [Paperback] | `a-childrens-guide-to-the-12-shiva-jyotirlings-hindi-paperback` | ₹295 (was ₹395) | 100 |
| 12 Jyotirlings + 51 Shaktipeeths Book Set [Hardcover] (the "Combo Set") | `12-jyotirlings-51-shaktipeeths-book-set-hardcover` | ₹845 (was ₹1,190) | 30 |
| A Children's Guide to the 51 Shaktipeeths [Hardcover] | `a-childrens-guide-to-the-51-shaktipeeths-hardcover` | ₹495 (was ₹595) | 200 |
| A Children's Guide to the 12 Shiva Jyotirlings [Best Seller] [Hard Cover] | `a-childrens-guide-to-the-12-shiva-jyotirlings-best-seller-hard-cover` | ₹495 (was ₹595) | 30 |

### Collections

12 Jyotirlingas · 51 Shaktipeeths · Rivers of Bharat · Combo Set · Rudraksha Guide · Parashurama

### Key business rule: ownership equivalence

**Combo Set buyers own both the 12 Jyotirlingas AND 51 Shaktipeeths content.** Anywhere the storefront does personalization, upsells, "you already own this" logic, or recommendations, a customer who owns the Combo Set must never be shown/recommended the standalone Jyotirlingas or Shaktipeeths titles as if they don't own them. They remain valid targets for Rivers of Bharat, Parashurama, and the Rudraksha Guide (titles they don't already own). This rule came directly from ASM and matters for any personalization work.

## Design system: "Storybook Studio"

This is an established, ASM-approved direction — do not deviate from the palette or typography without checking in. It's a soft, minimalist, kid-friendly aesthetic (chosen over two rejected alternatives: a warm "Modern Temple" direction and a dark "Editorial Heritage" direction).

**Colors** (already implemented as Tailwind v4 `@theme` tokens in `app/styles/tailwind.css`):
| Token | Hex | Use |
|---|---|---|
| `--color-base` | `#FEFCF7` | Page background (warm off-white, not pure white) |
| `--color-ink` | `#2B2B28` | Primary text |
| `--color-ink-soft` | `#5F5E5A` | Secondary/muted text |
| `--color-accent` | `#D9761F` | Primary CTA color ("Burnt Saffron") — the only color used for clickable/actionable things. Replaced the original soft-blue (`#3E7CA6`) in September 2026 per ASM, who wanted to leverage the saffron/orange from their old Wix site's theme, refined for the premium direction. |
| `--color-accent-hover` | `#B8611A` | Accent hover state |
| `--color-amber` | `#E8B23D` | Decorative only (motif icons) — never used for CTAs or links. Refreshed to a richer gold alongside the saffron accent change. |
| `--color-border` | `#ECE7DB` | Card/input borders |
| `--color-tint-sand` / `-powder` / `-sage` / `-blush` | `#F3E6D8` / `#E4EEF6` / `#EAF1E4` / `#F6E6EC` | Pastel backgrounds for collection tiles/cards, cycled per item |

**Typography — superseded by `DESIGN_SYSTEM.md`, September 2026 (current, authoritative):**
- ASM uploaded a comprehensive `DESIGN_SYSTEM.md` doc (243 lines) that is now **the authoritative design/layout spec** for this project. Where it conflicts with anything written elsewhere (including earlier entries in this file's own history), the doc wins unless ASM says otherwise in chat.
- Typography per the doc: **`Instrument Serif`** (display/headings, italic on the hero) + **`Inter`** (body/UI), loaded via a single Google Fonts `@import` at the very top of `tailwind.css` (must precede `@import 'tailwindcss'` — Tailwind's import expands into `@layer` rules, and CSS requires all `@import`s to come before any other statement, `@layer` included, or the browser silently drops them). This is the **4th** pairing this project has been through in one week: `Fraunces`+`Nunito Sans` (original) → `Libre Caslon Text`+`Work Sans` ("premium," rejected) → briefly reverted to `Fraunces`+`Nunito Sans` ("playful") → a native-system-font `clamp()` spec (briefly implemented) → **Instrument Serif + Inter**, per the design doc. Don't change this again without an explicit new request or doc update.
- Type scale is now **discrete steps** (mobile value + a `@media (min-width: 1024px)` desktop override), not fluid `clamp()` — tokens: `--text-display` (34px→56px, hero headline only, applied via the `.text-display` class, italic), `--text-h1` (28px→40px), `--text-h2` (22px→28px), `--text-h3` (18px→20px, also used for h4), `--text-body-lg` (16px→18px), `--text-body` (15px→16px, body default), `--text-small` (13px→14px), `--text-micro` (12px, same both breakpoints). `h1`/`h2`/`h3`/`h4` get their font-family, size, line-height, and weight from global element rules in `tailwind.css` — as before, this means any heading's `className` should stay free of explicit `text-*` size classes (higher specificity would silently override the global rule).
- Body line-height 1.6.
- Logo wordmark (Header + Footer brand name): `font-display text-[1.25rem] font-extrabold tracking-[-0.02em]`.
- Nav links/labels: `text-small font-semibold`.

**Layout principles established for this brand:**
- Flat navigation: logo + max ~4 links, no nested menus
- One accent color does all the "clickability" signaling (burnt saffron); amber is decorative-only (small motif icons like 🪔🪷🪶, never full-bleed patterns)
- Pastel-tinted tiles/cards instead of busy photography backgrounds — keeps things feeling calm and minimal
- Short, punchy copy over long paragraphs (this is a kids' brand — keep microcopy light and warm, not corporate)
- Rounded corners throughout (`--radius-card: 1rem`, `--radius-pill: 999px` for buttons/inputs)

## Current codebase state

Scaffolded with `npm create @shopify/hydrogen@latest` (TypeScript, Tailwind v4, React Router 7 / Hydrogen). Standard skeleton routes are all present and untouched except where noted below.

### Done
Every route and shared component is now built and styled in the Storybook Studio theme:
- `app/routes/_index.tsx` — homepage, rebuilt again to follow `DESIGN_SYSTEM.md`'s section order, merged with ASM's explicit instruction to keep a Blog section too ("merge both — use this doc's sections but keep a Blog section"): **Hero** (real Combo Set product image/price/link, `.text-display` italic headline), **Shop by collection** (first 6 collections, pastel tiles), **Featured products** (first 8 products, real `tags`-based "Bestseller" badge — only shown where a product is genuinely tagged `bestseller`, per the doc's "never fabricate urgency/scarcity" rule), **From the blog** (3 most recent articles), **Brand story** (short ~80-word version of the Amar Granth mission, links to `/about` for the full story — real copy, not invented), **Email signup**. `ArticleItem` was extracted from `blogs.$blogHandle._index.tsx` into a shared `app/components/ArticleItem.tsx`. Brand name displays properly cased ("Amar Granth") in Header/Footer.
  - **Reviews section is intentionally NOT built.** `DESIGN_SYSTEM.md` calls for a reviews section with real customer names/locations and explicitly says never to fabricate content; no real reviews exist yet. Add it once ASM supplies actual customer quotes.
  - **PDP / PLP / Cart / blog-listing / blog-article pages have NOT yet been re-passed against `DESIGN_SYSTEM.md`'s per-page specs** (its sections on product page, collection/listing page, cart, and blog layout) — only the foundation tokens, Header/Footer chrome, and homepage got this treatment so far. They still reflect the prior (system-font/Libre Caslon-era) styling pass, which used the same underlying design tokens so they aren't broken, just not verified against the newer doc's more detailed per-page rules.
- `app/components/Header.tsx` / `Footer.tsx` — flat nav header, now **sticky with a shrink-on-scroll effect** (padding tightens past an 80px scroll threshold) and a 1024px (`lg:`) breakpoint for the desktop nav/mobile-menu split (previously 768px/`md:`); cart count badge restyled as an accent-filled pill. Footer includes a brand blurb, a Collections link (added to the live Shopify footer menu via Admin API alongside About/Contact/FAQ/policy links), and copyright, with the doc's `space-8` (64px) vertical padding.
- `app/routes/products.$handle.tsx` + `ProductImage`/`ProductPrice`/`ProductForm`/`AddToCartButton` — pastel image tile, price + real `seo.description` hook, pill variant chips, styled "What's inside" from the real migrated description.
- `app/routes/collections._index.tsx`, `collections.$handle.tsx`, `collections.all.tsx` + `ProductItem` — pastel tile grids matching the homepage.
- `app/routes/blogs._index.tsx`, `blogs.$blogHandle._index.tsx`, `blogs.$blogHandle.$articleHandle.tsx` — article grid + single-post styling over the 66 already-migrated posts.
- Cart drawer/aside (`Aside.tsx`, `CartMain.tsx`, `CartLineItem.tsx`, `CartSummary.tsx`) and the standalone `/cart` page.
- **Static pages** `about.tsx`, `contact.tsx`, `faq.tsx` — real, ASM-confirmed content (not placeholders): free shipping across India (24–48hr dispatch), damaged-book returns via email within 24hrs, all major payment methods, age 3+/read-along positioning. `contact@amarshivmedia.com` is the only contact channel listed in-app (no phone/address exist yet) — this was changed from `contact@amargranth.com` per ASM's explicit request. Note: Shopify's own `shop.email`/`contactEmail` field has no Admin GraphQL mutation (confirmed — no `shopUpdate` mutation exists at all in the schema), so that field must still be changed manually in Admin → Settings → General if it hasn't been already.
- **All 7 products are ACTIVE** in Shopify (flipped from DRAFT on ASM's confirmation — see business context above, this was previously intentionally held back).
- **Typography**: swapped from the original Fraunces + Nunito Sans to **Libre Caslon Text + Work Sans** per ASM's explicit request (Fraunces read as "too curvy" for the premium-but-kid-friendly direction they want). Tokens live in `app/styles/tailwind.css` (`--font-display`, `--font-sans`) — nothing else should need touching if this changes again.
- **Meta Pixel** (`app/components/MetaPixel.tsx`, wired into `root.tsx`): storefront-side tracking (PageView, ViewContent, Search, AddToCart, InitiateCheckout) using pixel ID `620588632962566`, stored as `PUBLIC_META_PIXEL_ID` in `.env` (not committed). CSP in `entry.server.tsx` extended to allow `connect.facebook.net`/`www.facebook.com` alongside Hydrogen's defaults. **Purchase/checkout-completion tracking is NOT covered by this** — that requires ASM connecting Shopify's own Facebook & Instagram sales channel in Admin with their Meta Business account (self-serve, needs their login, can't be done via API).
- **Google Analytics 4** (`app/components/GoogleAnalytics.tsx`, wired into `root.tsx`): same pattern as the Meta Pixel — page_view, view_item, search, add_to_cart, begin_checkout — using measurement ID `G-EV1STZNVGV`, stored as `PUBLIC_GA4_MEASUREMENT_ID` in `.env` (not committed). CSP extended for `googletagmanager.com`/`google-analytics.com`. Same purchase-tracking caveat as Meta: needs ASM connecting Shopify's "Google & YouTube" sales channel in Admin.
- **Payments**: ASM has an existing, live Razorpay merchant account (already used on the Wix site) and has started adding it in Shopify Admin → Settings → Payments (saw "Cards Onsite by Razorpay" as one listing — likely one of several per-payment-method Razorpay entries in Shopify's India marketplace; UPI/netbanking may be separate listings to add too). No Hydrogen code involved — this is entirely Shopify Admin configuration using the same Razorpay Key ID/Secret already in use on Wix. Not yet confirmed working end-to-end (would need a test order to verify via the Admin API's order/transaction gateway field, or ASM confirming the "Active" status in Admin).
- Mobile responsiveness pass — most pages were already mobile-first; fixed touch-target sizing (cart stepper, close buttons, header icons) and text-wrap issues (FAQ accordion).
- Verified throughout: `npx tsc --noEmit`, `eslint`, and `npm run build` all pass clean.

### Explicitly NOT done yet
1. **Razorpay** — in progress, see note above. Needs ASM to finish adding all relevant Razorpay payment-method listings in Admin and confirm they're active.
2. **Facebook & Instagram sales channel** and **Google & YouTube sales channel** — needs ASM to connect both in Shopify Admin (their Meta Business account and Google account respectively) to get Purchase-event tracking for both pixels (see notes above).
3. **Meta Conversions API (CAPI)** — optional, more reliable server-side tracking. Not set up; would need a CAPI access token from Meta Events Manager if ASM wants it.
4. **Real browser/device verification** — nothing has been visually confirmed rendering correctly in an actual browser yet. This sandbox's network egress blocks every Shopify host (including the public `mock.shop` demo), so `npm run dev` cannot reach the live store from here. ASM has been deploying and screenshotting via GitHub Codespaces (real internet access) instead — two real bugs (a horizontal-scroll clipping issue, a misaligned Search nav item) were found and fixed this way. The latest `DESIGN_SYSTEM.md` homepage rebuild has NOT yet been screenshotted/verified live — needs a fresh Codespaces deploy + screenshot.
5. **`DESIGN_SYSTEM.md` page-level specs beyond the homepage/header/footer** — the doc has detailed sections for the product page (PDP), collection/listing pages (PLP), cart, and blog listing/article pages that haven't been implemented yet (only the foundation tokens + homepage + header/footer got the full pass). Also not yet done: the doc's finer-grained spacing-scale audit, contrast/accessibility checklist, and a customer-reviews section (blocked on ASM supplying real quotes — see above).
6. **DNS / go-live** — see below. Still blocked pending explicit ASM sign-off and the real-browser check above.

### Notes / gotchas for whoever picks this up
- Do **not** touch DNS or suggest connecting the `amargranth.com` domain to this Shopify store until ASM has explicitly signed off in this exact conversation — this was asked about directly and deliberately held back pending readiness (products were DRAFT and FAQ was placeholder at the time; both are now fixed, but the explicit go-ahead and a real browser check are still outstanding).
- Product descriptions contain time-sensitive promo copy migrated from Wix (e.g. "Ganpati Festive Sale... Valid till 30th September 2026") — worth knowing it's baked into the description HTML, not something this codebase added.
- Full redirect map (66 blog + 7 product) is already live in Shopify's URL redirect system — nothing needed there, it'll just work once the domain is repointed.
