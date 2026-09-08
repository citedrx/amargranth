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
| `--color-accent` | `#3E7CA6` | Primary CTA color (soft sky blue) — the only color used for clickable/actionable things |
| `--color-accent-hover` | `#336A8F` | Accent hover state |
| `--color-amber` | `#D9A441` | Decorative only (motif icons) — never used for CTAs or links |
| `--color-border` | `#ECE7DB` | Card/input borders |
| `--color-tint-sand` / `-powder` / `-sage` / `-blush` | `#F3E6D8` / `#E4EEF6` / `#EAF1E4` / `#F6E6EC` | Pastel backgrounds for collection tiles/cards, cycled per item |

**Typography:**
- Display/headings: `Libre Caslon Text` (classic serif) — loaded via Google Fonts `@import` in `tailwind.css`, applied via `--font-display` / `.font-display` / `h1,h2,h3`. Replaced the original `Fraunces` in September 2026 per ASM: Fraunces read as "too curvy" for the premium-but-kid-friendly direction they wanted.
- Body/UI: `Work Sans` — applied via `--font-sans`, set as default on `body`. Replaced the original `Nunito Sans` in the same pass.

**Layout principles established for this brand:**
- Flat navigation: logo + max ~4 links, no nested menus
- One accent color does all the "clickability" signaling (blue); amber is decorative-only (small motif icons like 🪔🪷🪶, never full-bleed patterns)
- Pastel-tinted tiles/cards instead of busy photography backgrounds — keeps things feeling calm and minimal
- Short, punchy copy over long paragraphs (this is a kids' brand — keep microcopy light and warm, not corporate)
- Rounded corners throughout (`--radius-card: 1rem`, `--radius-pill: 999px` for buttons/inputs)

## Current codebase state

Scaffolded with `npm create @shopify/hydrogen@latest` (TypeScript, Tailwind v4, React Router 7 / Hydrogen). Standard skeleton routes are all present and untouched except where noted below.

### Done
- `app/styles/tailwind.css` — full Storybook Studio theme tokens + Google Fonts import (see above)
- `app/routes/_index.tsx` — homepage **fully rebuilt** from the default skeleton: hero section, motif divider, "Shop by collection" grid (live data from Storefront API, cycles through the 4 pastel tints), bestseller/recommended products spotlight, brand story section, static review quotes, email signup bar. Uses inline TS types for the collections query rather than generated types (see note below).
- `app/components/Header.tsx` — restyled to a flat, minimal nav matching the brand (logo left, links center, account/search/cart right). Logic (menu fetching, cart badge, mobile toggle) untouched, only className/styling changed.
- Verified: `npx tsc --noEmit` passes clean, `npm run build` succeeds.

### Explicitly NOT done yet (next priorities, roughly in this order)
1. **Link the project to the real store** — run `npx shopify hydrogen link` (needs interactive browser login, hasn't been done — this environment couldn't complete OAuth). This populates `PUBLIC_STOREFRONT_API_TOKEN` in `.env`. `PUBLIC_STORE_DOMAIN` is already set correctly to `fd3ruf-f7.myshopify.com`.
2. **Run codegen** (`npm run codegen`) once linked — the homepage currently uses a hand-written inline type (`FeaturedCollectionNode`) instead of a generated Storefront API type for the collections query, specifically because codegen requires a live store connection this environment didn't have. Once linked, consider swapping to a proper generated type for consistency with the rest of the codebase.
3. **Product detail page** (`app/routes/products.$handle.tsx` or similar) — needs Storybook Studio styling. Per earlier design spec: one large product image on a pastel/neutral background (not white seamless product shots), price + one-line emotional hook above the fold, "what's inside" as 3–4 short bullets not a wall of text, ownership badge logic for Combo Set buyers (see business rule above) if/when customer accounts + purchase history are wired up.
4. **Collection listing page** — needs styling to match homepage tile treatment.
5. **Blog listing + individual post pages** — needs styling. Remember all 66 posts already exist in Shopify with matching slugs; this is purely a front-end templating task, no content work needed.
6. **Cart drawer/aside** — currently default Hydrogen styling, needs brand treatment.
7. **Footer** — not touched yet.
8. **Static pages** (About, Contact, etc.) — content doesn't exist yet anywhere (wasn't migrated from Wix, see above). Will need actual copy written before this can be built, not just styling.

### Notes / gotchas for whoever picks this up
- Products are **DRAFT** in Shopify — they won't appear in Storefront API queries by default until published, or you'll need to query them with the right status/access. Don't be surprised if product/collection queries return empty until ASM decides to flip them live — check with them before publishing anything, since the whole point of the DRAFT status was to avoid a half-finished site going public.
- Do **not** touch DNS or suggest connecting the `amargranth.com` domain to this Shopify store until the storefront is genuinely feature-complete and ASM has explicitly signed off. This was a repeated, explicit instruction across the migration project.
- Full redirect map (66 blog + 7 product) is already live in Shopify's URL redirect system — nothing needed there, it'll just work once the domain is repointed.
