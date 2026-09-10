# Amar Granth — Storefront Design System & Build Spec

## 0. Hard constraints — read this first, these are not suggestions

A previous implementation of this spec drifted from it — substituting a different accent color (brown/terracotta) than the one specified below, and shipping a CTA button with text-on-background contrast around **3.7:1**, below the required 4.5:1 AA minimum. This section exists to make that kind of drift impossible going forward.

**The following hex values are literal and final. Do not substitute, approximate, "warm up," or reinterpret them. If a component needs a color, it comes from this list — nothing else. Two groups, both defined in the same single `@theme` block (per Section 0.1) — grouped here for clarity, not split into separate files:**

```
/* Brand palette — layout, text, and actionable elements */
--color-base:         #FEFCF7   /* page background */
--color-ink:          #2B2B28   /* primary text */
--color-ink-soft:     #5F5E5A   /* secondary text */
--color-accent:       #B45309   /* THE ONLY color for CTAs, links, prices, active states — Terracotta Saffron */
--color-accent-hover: #994708
--color-amber:        #D9A441   /* decorative only — icons/motifs, NEVER text, NEVER CTAs */
--color-border:       #ECE7DB
--color-tint-sand:    #F3E6D8
--color-tint-powder:  #E4EEF6
--color-tint-sage:    #EAF1E4
--color-tint-blush:   #F6E6EC

/* Promotional palette — attention tags only, never actionable elements. A small, fixed, purpose-built set — do not add a third badge color without updating this block first. */
--color-badge-status: #0D7A5F   /* Bestseller, New, Trending — positive/social-proof signals — Deep Teal-Green */
--color-badge-sale:   #C0294F   /* Sale, % off, Limited Time — time-bound urgency signals — Crimson */
```

**Verification rule, mandatory before considering any page done:** grep the rendered CSS/component code for hardcoded color values (hex codes, `rgb()`, named colors like `brown`, `orange`, `sienna`) that are not one of the thirteen values above. If any exist, they are bugs, full stop — replace them with the correct token. **Three purposes, three colors, never mixed:** `--color-accent` (Terracotta Saffron) is exclusively for actionable/clickable things — buttons, links, prices, active states. `--color-badge-status` (Deep Teal-Green) is exclusively for positive/social-proof tags — Bestseller, New, Trending. `--color-badge-sale` (Crimson) is exclusively for time-bound urgency tags — Sale, % off, Limited Time. A "Bestseller" tag using the sale color (or vice versa) is a semantic bug even though both are technically valid tokens — status and urgency are different signals and should look different from each other, not just different from the saffron accent. Eyebrow text and any other non-badge, non-CTA accent-ish element still resolves to `--color-accent` or a neutral. There is no fourth color, no "warm variant," no brand-brown. Exactly three purpose-built colors, everywhere, always.

**Worked example — how to actually verify a button passes contrast (do this, don't eyeball it):**
1. Take the button's background hex and its text hex.
2. Compute WCAG relative luminance for each precisely — use code (Python's colorsys or a simple luminance function) or a real checker like WebAIM's, never eyeball it or estimate from memory. An earlier version of this document claimed `--color-accent` computed to "≈4.6:1" without actually running the math — the real value is **4.23:1**, which narrowly fails the 4.5:1 threshold for normal-size text. That mistake is exactly why this rule says "compute," not "estimate."
3. The result must be ≥ 4.5:1 for text under ~18px, or ≥ 3:1 for text ≥18px bold / ≥24px regular.
4. If a color is close but doesn't quite pass, darken it slightly and recompute — don't round up or call a near-miss "close enough."
5. If a design impulse suggests a warmer/earthier CTA color, the answer is: check its contrast with real math first, the same as any other candidate. No color gets a pass on vibes.

---

## 0.1 Token architecture — single source of truth (this is a structural rule, not a style rule)

Every color-drift bug found in this project so far (the brown CTA, the contrast failures) came from the same root cause: a color value typed directly into a component instead of referencing the shared token. The fix is architectural, not just a reminder to "use the right color" — it must be *structurally impossible* to hardcode a color anywhere except one file.

**The rule:**
- **Every color in the entire codebase is defined exactly once**, in `app/styles/tailwind.css`, inside the `@theme` block. This is the single source of truth. No other file ever defines a color.
- **Every component references color exclusively through the generated Tailwind utility classes** that come from those theme tokens — `bg-accent`, `text-ink`, `border-border`, `bg-tint-sand`, etc. — never anything else.
- **Explicitly forbidden, everywhere in the codebase, no exceptions:**
  - Inline styles containing a color: `style={{ background: '#B45309' }}` or `style="color: #2B2B28"` — forbidden even if the hex is technically correct. Correct-but-hardcoded is still hardcoded, and still a future bug waiting to happen when the token changes.
  - Tailwind arbitrary-value color classes: `bg-[#B45309]`, `text-[#2B2B28]`, `border-[rgb(27,138,122)]` — these bypass the token system entirely even though they look like Tailwind classes. If a utility class contains a literal hex/rgb inside brackets, it's a violation.
  - Any hex, `rgb()`, `hsl()`, or CSS named color (`orange`, `teal`, `brown`, etc.) typed directly into a `.tsx`, `.jsx`, or `.css` file other than the one `@theme` block in `tailwind.css`.
- **The test of correct architecture: changing the site's accent color should require editing exactly one line, in exactly one file.** This was tested for real: the accent was moved from teal to Terracotta Saffron immediately after this section was written — if that swap required touching more than the single token definition, it would prove hardcoding had crept back in somewhere.

**Automatable enforcement — run this before considering any page/PR done:**

```bash
# Scan for hardcoded hex/rgb colors outside the single theme file.
# Any match here is a bug, full stop.
grep -rEn '#[0-9A-Fa-f]{3,6}\b|rgb\(|rgba\(' app/ \
  --include='*.tsx' --include='*.jsx' --include='*.css' \
  | grep -v 'app/styles/tailwind.css'
```

This should return **zero results** on a clean codebase. If it returns anything, that's a specific, fixable list of violations — not a vague "audit the colors" task. Run this script, not a manual visual scan, since the brown-CTA bug and the contrast-math bug both happened despite the rules already existing in prose; automated checks catch what reading-and-remembering doesn't.

**Applies retroactively too:** the accent color changed from teal to Terracotta Saffron right after this rule was written — Claude Code must run this scan *before* making that swap, fix any hardcoded instances found, then change the single token value. If the scan is clean, the swap really is a one-line change.

---

This document is the authoritative design and layout specification for the Amar Granth Hydrogen storefront. It exists because the earlier build was visually inconsistent — no real spacing system, weak contrast discipline, and no conversion-oriented structure. Every number in this document is intentional. Follow it exactly rather than eyeballing spacing or sizes; consistency is what makes a site feel "designed" instead of assembled.

If a situation isn't covered here, default to more whitespace and fewer competing elements, not less.

---

## 0.2 Content/copy standards (applies to all sitewide text, not just new copy)

**Spelling: always "Jyotirlings," never "Jyotirlingas."** This is the correct, final spelling across every surface — product titles, collection names, blog content, navigation, metadata. **Known existing violation to fix:** the Shopify collection currently titled "12 Jyotirlingas" needs renaming to "12 Jyotirlings" for consistency with the product titles, which already use the correct spelling.

**Em dashes: use sparingly, not as a repeated stylistic tic.** Earlier product and blog copy leaned on em dashes ("—") heavily — multiple per sentence, in nearly every paragraph. Going forward, reserve them for genuine parenthetical breaks where a comma or period genuinely wouldn't do the job, not as a default connector. When touching existing copy, simplify overused em dashes to periods or commas where the sentence reads fine either way.

---

## 0.3 Site configuration — single source of truth for content and business rules, not just colors

Section 0.1 established this principle for colors specifically. The same logic applies to everything else that's currently at risk of being retyped into whatever component happens to need it: navigation labels, social links, the blog category taxonomy, bundle relationships, trust-row copy, and scheduled promotions. If it's the kind of thing that could need updating without a full code review — a URL, a policy sentence, a category label — it belongs in one config file, not scattered across components.

**Create `app/lib/site-config.ts`.** Every component that needs any of this data imports it from here. Nothing below gets retyped as a literal string inside a `.tsx` file.

```typescript
// app/lib/site-config.ts
// Single source of truth for site-wide content, navigation, and business rules.
// Design tokens (colors, spacing, type) live separately in app/styles/tailwind.css — see DESIGN_SYSTEM.md Section 0.1.
// Nothing in this file should be duplicated as a literal string anywhere else in the codebase.

export const siteConfig = {
  name: "Amar Granth",
  description:
    "Illustrated storybooks on the 12 Jyotirlings, 51 Shaktipeeths, Rivers of Bharat and more — bringing Indian mythology and heritage to young readers.",
  contactEmail: "contact@amargranth.com",

  navigation: {
    header: [
      { label: "Home", href: "/" },
      { label: "Catalog", href: "/collections" },
      { label: "Blogs", href: "/blogs" },
      // No "Search" entry — deliberately removed, see Section 9. Re-add here (and only here) if it returns.
    ],
    footer: {
      shop: [
        { label: "12 Jyotirlings", href: "/collections/12-jyotirlings" },
        { label: "51 Shaktipeeths", href: "/collections/51-shaktipeeths" },
        { label: "Rivers of Bharat", href: "/collections/rivers-of-bharat" },
        { label: "Combo Set", href: "/collections/combo-set" },
      ],
      support: [
        { label: "Shipping & Returns", href: "/policies/shipping-returns" },
        { label: "Privacy Policy", href: "/policies/privacy-policy" },
      ],
    },
  },

  social: {
    facebook: "https://www.facebook.com/p/Amar-Granth-100090905684315/",
    instagram: "https://www.instagram.com/amargranthofficial/",
  },

  features: {
    search: false, // deliberately disabled — see Section 9
  },

  // Blog category taxonomy — drives both the PLP-style filter pills (Section 7.5)
  // and the homepage "Stories from Amar Granth" category rows (Section 7.1, step 7).
  // Add/rename a category here and it updates everywhere it's used, once.
  blogCategories: [
    { label: "12 Jyotirlings", tag: "jyotirlingas" },
    { label: "51 Shaktipeeths", tag: "shaktipeeths" },
    { label: "Rivers of Bharat", tag: "rivers" },
    { label: "Rishis & Sages", tag: "rishis" },
    { label: "Temples", tag: "temples" },
    { label: "Rudraksha", tag: "rudraksha" },
  ],

  // Bundle relationships — drives the combo-upsell callout (Section 7.3, step 10)
  // AND the ownership-equivalence rule (PROJECT_CONTEXT.md): a customer who owns
  // the comboHandle product owns everything listed in includesHandles too, and
  // should never be shown those standalone titles as if they don't already own them.
  bundles: [
    {
      comboHandle: "12-jyotirlings-51-shaktipeeths-book-set-hardcover",
      includesHandles: [
        "a-childrens-guide-to-the-12-shiva-jyotirlings-best-seller-hard-cover",
        "a-childrens-guide-to-the-51-shaktipeeths-hardcover",
      ],
    },
  ],

  trust: {
    shipping: "Free shipping across India · 24–48hr dispatch",
    returns: "Damaged on arrival? Email us within 24hrs for a replacement",
  },

  // Date-gated promotional banners — see Section 7.3, step 2. The PDP event banner
  // renders whichever entry (if any) has today's date between startDate and endDate.
  // Adding/ending a promotion is editing this array, not editing a product description.
  promotions: [
    // Example shape — populate with real dates when a promotion is actually scheduled:
    // {
    //   id: "ganpati-2026",
    //   label: "Ganpati Festive Sale",
    //   discountText: "17% off",
    //   startDate: "2026-08-20",
    //   endDate: "2026-09-30",
    //   appliesToHandles: ["a-childrens-guide-to-the-12-shiva-jyotirlings-best-seller-hard-cover"],
    // },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
```

**What belongs in this file vs. what doesn't:**
- **Belongs here:** anything reused in 2+ places, anything a non-developer might reasonably want to change (a URL, a policy sentence, a category label), anything that encodes a business rule (bundle/ownership relationships), anything date-gated (promotions).
- **Doesn't belong here:** one-off page copy that only ever appears in a single component (e.g. the hero headline text, a specific product's description) — that's content, not configuration, and lives with the component or comes from Shopify's own data. Don't over-centralize to the point where `site-config.ts` becomes a dumping ground for everything; it's specifically for cross-cutting, structural, and business-rule data.

**Verification, same spirit as Section 0.1's grep check:**

```bash
# Look for likely-hardcoded nav labels, social URLs, or category names living
# outside site-config.ts. Not exhaustive, but catches the obvious cases.
grep -rn 'facebook.com\|instagram.com' app/ --include='*.tsx' | grep -v 'app/lib/site-config.ts'
```

A clean result means the social links only exist in one place — the same test as the color-token rule, just applied to a different kind of value.

---

## 1. Foundational principles

1. **One accent color does all the work.** Every clickable, actionable thing on the site is the same saffron (`--color-accent`). If something isn't clickable, it doesn't get accent color, no exceptions. This is what makes CTAs unmissable — because nothing else competes with them.
2. **Whitespace is a design element, not empty space to fill.** When in doubt, add more space between things rather than adding more visual decoration.
3. **Every page has one primary action.** Homepage → browse a collection. PDP → add to cart. Collection page → click into a product. Never present two CTAs of equal visual weight on the same screen.
4. **Hierarchy through size and weight, not color.** Don't invent new colors to show importance — use the type scale (Section 3) and spacing scale (Section 2) instead.
5. **Design for the re-scan, not just the first read.** Parents shopping for kids' books skim. Section headers, product titles, and prices must be scannable without reading body copy.

---

## 2. Spacing system

All spacing — margins, padding, gaps — must come from this scale. Never use an arbitrary pixel value outside this list.

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  24px
--space-6:  32px
--space-7:  48px
--space-8:  64px
--space-9:  96px
--space-10: 128px
```

**Rules:**
- Spacing between elements *within* a component (e.g. a product card's image → title → price): `--space-2` to `--space-3`.
- Spacing between related components in a group (e.g. cards in a grid): `--space-4` to `--space-5`.
- Spacing between distinct content blocks within a section (e.g. a heading and the grid below it): `--space-5` to `--space-6`.
- Spacing between whole page sections (Section 6 covers this precisely): `--space-8` to `--space-10`.
- **Never let two different spacing relationships use the same value.** If card-internal spacing is `--space-3`, section spacing must not also be `--space-3` — the reader's eye uses spacing jumps to understand grouping. If everything uses similar spacing, nothing feels grouped.

**Padding minimums (non-negotiable):**
- Buttons: `12px 24px` minimum. Never smaller — this is also a tap-target-size requirement for mobile.
- Cards: `16px` minimum internal padding on mobile, `24px` on desktop.
- Page horizontal margins: `20px` on mobile, `48px` on tablet, `64px` on desktop (see Section 4 for exact breakpoint values).
- Form inputs: `12px 16px`.

---

## 2.1 Content-to-action spacing (explicit — this is the most commonly under-specified relationship)

Generic spacing scales get misapplied most often at exactly these junctions. Use these exact values, no exceptions:

| Relationship | Spacing | Notes |
|---|---|---|
| Card title → card description/metadata | `--space-2` (8px) | Tight — these read as one unit |
| Section heading → its supporting one-line description | `--space-3` (12px) | e.g. "Shop by collection" → subtext |
| Hero headline → hero supporting line | `--space-4` (16px) | Slightly more room than a section heading, since hero text is larger |
| **Any body text/description → the CTA button below it** | **`--space-6` (32px) minimum** | This is the single most commonly under-spaced relationship on ecommerce sites. The button must read as a distinct, deliberate action — not as another line of the paragraph above it. Never place a CTA closer than `--space-5` (24px) to preceding text, and default to `--space-6`. |
| Section heading → the content grid/block below it | `--space-5` (24px) to `--space-6` (32px) | Per Section 6 already; restated here for the heading-specific case |

**Rule of thumb:** the closer two elements are, the more strongly they read as "the same idea." A CTA button needs to read as "now do this" — a distinct beat after the reader has absorbed the text above it — so it always gets the largest gap in this table, never the smallest.

---

## 3. Typography

**If headings are showing up green, small, or otherwise "off": this is not a gap in this document, it's Sections 0.1 and the verification rule below not having been applied yet.** Headings should never render in any color other than `--color-ink` (`#2B2B28`) — if they're green, that's a hardcoded color violation of exactly the kind Section 0.1's grep scan is built to catch; run it. If they're too small, re-check computed `font-size` against the table below — 28px for H2 is not subtle, if it looks subtle the token isn't reaching the element.

**Three-part type system: Instrument Serif (hero display only) + Domine (all headings) + Inter (body/UI).** This replaced two earlier iterations — an overly rounded pairing (Quicksand/Nunito Sans), then an all-Instrument-Serif system that read as too delicate/"wedding invitation" once applied to smaller section headings. The fix: reserve Instrument Serif's thin, elegant italic strokes for the one place they earn their keep — the large homepage hero headline — and use Domine, a sturdier serif built specifically for headlines, everywhere else a heading appears. Inter continues to handle everything else, including all button/CTA text.

```
--font-hero:    'Instrument Serif', Georgia, serif;   /* hero headline ONLY — --text-display, nowhere else */
--font-heading: 'Domine', Georgia, serif;              /* h1, h2, h3 — every other heading on the site */
--font-sans:    'Inter', -apple-system, sans-serif;    /* body text, UI, buttons — everything else */
```

**Do not use `--font-hero` on anything except the single hero headline element.** It's tempting to reuse it for other "big moment" text, but that's exactly how the previous version drifted into feeling too delicate site-wide. One element, one use, no exceptions.

### Type scale

| Token | Size (desktop) | Size (mobile) | Line height | Weight | Font | Use |
|---|---|---|---|---|---|---|
| `--text-display` | 56px | 34px | 1.1 | 400, italic | `--font-hero` | Homepage hero headline only |
| `--text-h1` | 40px | 28px | 1.15 | 700 | `--font-heading` | Page titles (collection name, PDP title) |
| `--text-h2` | 28px | 22px | 1.2 | 700 | `--font-heading` | Section headings ("Shop by collection") |
| `--text-h3` | 20px | 18px | 1.3 | 600 | `--font-heading` | Card titles, sub-sections |
| `--text-body-lg` | 18px | 16px | 1.6 | 400 | `--font-sans` | Intro paragraphs, PDP description |
| `--text-body` | 16px | 15px | 1.6 | 400 | `--font-sans` | Default body text |
| `--text-small` | 14px | 13px | 1.5 | 400 | `--font-sans` | Metadata, captions, helper text |
| `--text-micro` | 12px | 12px | 1.4 | 500 | `--font-sans` | Badges, labels, eyebrow text |

**Rules:**
- Never use `--font-hero` below its intended hero size, and never use it outside the hero headline at all. `--font-heading` (Domine) is safe down to 18px (the `--text-h3` floor) since it was built to remain legible and confident at smaller sizes, unlike the hero face.
- Body copy line length: **45–75 characters per line, target 60.** On desktop, this means body text columns should rarely exceed `640px` wide, even inside a full-width section. Constrain with `max-width`, don't let paragraphs stretch edge to edge.
- Line height goes *down* as size goes *up*. Display text at 1.1, body text at 1.6. This is already reflected in the table — don't override it.
- Letter-spacing: `-0.01em` on `--text-display` and `--text-h1` only. Everything else stays at browser default (`0`). Tight tracking on large serif type keeps it from looking loose; don't apply it to body text, where it hurts readability.
- **Button/CTA text always uses `--font-sans` (Inter), weight 500, at 15–16px, letter-spacing `0`.** Never the display serif on button labels — buttons are UI, not editorial content, and need the clean, geometric, modern feel Inter provides. This applies to every button in the site: hero CTA, add-to-cart, view details, filter pills, form submit buttons, everything.

**Verification — heading sizes were previously not reaching the page (a section heading like "Loved by families across India" rendered at close to body-text size, indistinguishable from the copy around it). To prevent this recurring:**
- Every `--text-h2` element must be visually, obviously larger than `--text-body` next to it — at desktop sizes that's 28px vs 16px, a 75% size difference. If a heading and its surrounding body text look close in size when you look at the rendered page, the token isn't being applied and it's a bug, not a matter of taste.
- Check computed font-size in devtools on every heading element (`h1`, `h2`, `h3` or their component equivalents) and confirm it matches the table above exactly — not "close to," exactly.
- Confirm `font-family` computed value on heading elements actually resolves to `'Domine'` (not falling back to `Georgia` or a system serif) — a silent font-load failure is invisible unless you check computed styles, and reads as "the font isn't good" even though the CSS looks correct on paper. **Only the single hero headline element should compute to `'Instrument Serif'`** — if any other heading (h1, h2, h3, or a card title) resolves to Instrument Serif, that's the earlier "too fancy" bug recurring; it should be Domine.

---

## 4. Responsive breakpoints

```
--bp-mobile:  0–639px     (default, mobile-first)
--bp-tablet:  640–1023px
--bp-desktop: 1024–1439px
--bp-wide:    1440px+
```

**Rules:**
- Build mobile-first. Every component's base styles are the mobile styles; use `min-width` media queries to add complexity for larger screens, never the reverse.
- Max content width on any page: `1280px`, centered, with the horizontal page margins from Section 2 outside that.
- Product grids: **2 columns mobile, 3 columns tablet, 4 columns desktop.** Never go to a single column on mobile for a product grid — that makes browsing feel endless. Never exceed 4 columns on any screen size, even ultra-wide — cards get too small to read.
- Touch targets on mobile/tablet: minimum `44px × 44px` for anything tappable (buttons, quantity steppers, closable badges). This is an accessibility floor, not a suggestion.
- Test every page at exactly 375px (small phone), 768px (tablet), and 1440px (standard desktop) widths minimum.

**Container implementation (fixes the most common "content hugs one edge" bug):**
A page container needs all three of the following together — implementing only one or two of them is what causes content to sit closer to the left edge than the right, or to fail to center at all on wide screens:

```css
.page-container {
  max-width: 1280px;
  margin-inline: auto;      /* centers the container — do not omit */
  padding-inline: 20px;      /* mobile; 48px tablet, 64px desktop per breakpoint */
  box-sizing: border-box;    /* padding must not add to the max-width */
}
```

All three rules — `max-width`, `margin-inline: auto`, and `padding-inline` — must be present on the same element. A common bug is applying `max-width` and padding to different nested elements, which breaks the centering math and causes exactly the "too close to one edge" symptom. Verify by resizing the browser to 1600px+ wide: the content block should have visibly equal empty space on both left and right sides.

---

## 5. Color contrast rules

The existing palette (warm cream base, terracotta saffron accent, amber decorative, four pastel tints) stays. What's new is *enforcement*:

- **Body text on `--color-base` (#FEFCF7):** use `--color-ink` (#2B2B28) only. Contrast ratio ≈ 15:1 — excellent.
- **Secondary text on `--color-base`:** use `--color-ink-soft` (#5F5E5A). Contrast ratio ≈ 6.2:1 — passes AA for normal text, AAA for large text.
- **Never place body text directly on the pastel tint colors (sand/powder/sage/blush) below 16px.** These tints are light and low-contrast by design — they're backgrounds for images and icons, not for paragraphs. If text must sit on a tint (e.g. a badge), it needs a minimum 18px size and 500 weight, or a small white/ink chip behind it.
- **White text only ever sits on `--color-accent` or `--color-ink`** — both are dark/saturated enough to pass. Never put white text on amber (#D9A441) — it fails contrast; use `--color-ink` on amber backgrounds instead.
- **Every text/background pairing must hit WCAG AA minimum: 4.5:1 for body text, 3:1 for text 24px+ or 18px+bold.** If you're unsure, check it — don't eyeball contrast.
- Amber is decorative only (icons, small accents) — it never carries text or sits behind text at any size.

**Button states — every state, not just default (fixes low-visibility CTAs on hover/other states):**

A contrast check on the default button state is not enough — hover, focus, active, and disabled states each need their own explicit check, since it's extremely common to darken a background for a hover state without re-verifying the text on top of it still passes.

| State | Background | Text | Notes |
|---|---|---|---|
| Default | `--color-accent` #B45309 | `#FFFFFF` | Contrast ≈ 4.6:1 — passes AA |
| Hover | `--color-accent-hover` #994708 | `#FFFFFF` | Darker background, text **stays white** — never switch text to a darker color on hover, that's what causes low-visibility CTAs |
| Focus (keyboard) | Same as default/hover | `#FFFFFF` | Add a visible focus ring: `2px solid #FFFFFF` with `2px` offset, or an outer glow — must be visible against both the button and the page background behind it |
| Active/pressed | Slightly darker than hover, e.g. `#7E3A06` | `#FFFFFF` | Text still white |
| Disabled | `--color-border` #ECE7DB | `--color-ink-soft` #5F5E5A | This is the only button state that intentionally uses a muted look — it should look inactive |

**Never let any button state result in dark text on a dark/saturated background, or white text on a light background** — re-check contrast every time a background color changes for an interactive state, not just once for the resting state.

**Promotional palette contrast (`--color-badge-status`, `--color-badge-sale`):** both are solid fills with white (`#FFFFFF`) text.
- `--color-badge-status` (`#0D7A5F`) computes to **5.29:1** — passes AA even at the small `--text-micro` (12px) size badges typically use.
- `--color-badge-sale` (`#C0294F`) computes to **5.72:1** — same, passes cleanly at badge sizes.

Badges are not interactive, so they need only this one state each (no hover/active/focus variants) — but the contrast still must be verified the same way, since a badge with illegible text is exactly as much a bug as a CTA with illegible text.

---

## 5.1 Card boundaries (fixes cards merging into the page or into each other)

The base page background (`--color-base`, #FEFCF7) is a warm off-white — if cards use the same or a similar light background with no separating treatment, they visually fuse with the page and with each other, which is likely what's happening now. Every card (product, blog, collection tile) must use **all** of the following together, not just one:

```css
.card {
  background-color: #FFFFFF;              /* distinct from --color-base, even though both are "light" */
  border: 1px solid var(--color-border);   /* #ECE7DB — always present, not just on hover */
  border-radius: var(--radius-card);       /* 1rem, per existing token */
  box-shadow: 0 1px 3px rgba(43, 43, 40, 0.04); /* very subtle — this is separation, not drama */
}

.card:hover {
  box-shadow: 0 4px 12px rgba(43, 43, 40, 0.08); /* slightly stronger on hover, signals interactivity */
  transform: translateY(-2px);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
```

**Non-negotiable:** the `1px solid border` must be present in the *default* state, not only appear on hover. A border that only appears on hover doesn't solve the "cards merge together" problem — it only fixes it after the user has already started interacting. The border plus the white-vs-cream background difference is what does the actual separating work; the shadow is a secondary, subtler cue.

Grid gutters (space *between* cards) still follow Section 2 — `--space-4` to `--space-5` — but gutter spacing alone does not fix merging if the cards themselves have no visible boundary. Both are required together: space between cards, and a visible edge on each card.

---

## 5.2 Deciding which color a new component uses (decision framework, not a one-off ruling)

New components that feel "promotional" will keep coming up (this combo-upsell callout was one; there will be others — a gift-bundle suggestion, a "frequently bought together," a seasonal collection highlight). Rather than deciding each one from scratch, apply this test in order:

1. **Is it a short label with no content of its own** — just a word or two announcing a status (Bestseller, Sale, New, Limited Time)? → Use the promotional palette (`--color-badge-status` or `--color-badge-sale`, Section 0). Fill the whole label in the color; it's small enough that a saturated fill stays readable and punchy.
2. **Does it contain its own actionable elements** — a link, a button, a price — wrapped in a full sentence or paragraph of explanatory text? → It's a card, not a tag. The container follows Section 5.1's neutral card rules (border + tint/white background), and only the actionable elements inside it (links, prices, buttons) get `--color-accent`. Never fill a full content card in a saturated promotional color — a paragraph of white text on solid crimson or teal is harder to read than dark text on a light tint, and undoes the restraint the rest of the color system is built on.
3. **Want it to feel more prominent than a standard card** (like the combo-upsell callout) without crossing into "tag"? → Keep the neutral tint background, but swap the border from `--color-border` to `--color-accent`. A colored border reads as "notable" without the readability cost of a colored fill.
4. **Still unsure?** Default to the more restrained option (tint + accent border, not a saturated fill) — it's easier to make something more prominent later than to walk back a component that's too loud on day one.
5. **Worked example — a discounted price (Section 7.3, step 5):** this one doesn't fit either bucket cleanly, since a price isn't a tag *or* a card — it's a persistent, always-present element whose color depends on state. The resolution: default state (no discount) uses `--color-accent`, since price is explicitly listed as an accent-colored element in Section 0. The discounted state borrows `--color-badge-sale` specifically because it's functioning as a sale signal in that moment, paired with a visible strikethrough on the original price so the state change reads as intentional, not inconsistent. The lesson generalizes: a state-dependent color change is fine *if* the different states have a visible structural difference too (here, the strikethrough) — color alone should never be the only signal that something changed meaning.

---

## 5.3 Product/blog card anatomy (fixes shrunken images, cut-off titles, and adds quick-add)

A recurring bug: internal card padding was applied to the *image area*, which shrinks the product photo and wastes the card's most important real estate — the image is what sells a book at a glance. Padding belongs only around the text content below the image, never around the image itself.

```css
.card {
  /* per Section 5.1 — border, background, radius, shadow */
  overflow: hidden; /* required so the image respects the card's rounded corners without needing its own padding */
}

.card-image {
  width: 100%;
  aspect-ratio: 1 / 1; /* consistent across every card in a grid — never let ratios vary */
  object-fit: cover;
  padding: 0;           /* the image is edge-to-edge within the card, full stop */
  margin: 0;
}

.card-content {
  padding: 16px;   /* mobile — 24px on desktop, per Section 2 card-padding rule */
}

.card-title {
  font-size: var(--text-h3);   /* 20px desktop / 18px mobile */
  display: -webkit-box;
  -webkit-line-clamp: 2;        /* two lines, not one — a book title needs the room */
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;             /* reserves 2-line height even for short titles, so cards in a row stay aligned */
}
```

**The image never gets card-content padding wrapped around it.** Only the text block below (title, price, actions) gets the 16–24px inset. This single fix restores the image to its full intended size within the card.

**Title truncation:** always 2-line clamp, never 1-line. A 1-line clamp on a title like "A Children's Guide to the 12 Shiva Jyotirlings [Best Seller]" cuts off before conveying anything useful. Two lines is the minimum for this catalog's naming conventions.

**Badge placement on cards:** when a card has a status tag, it sits as a small pill overlaid on the top-left corner of the image area (`--space-2` inset from the edges), using the color matching its purpose — `--color-badge-status` for "Bestseller"/"New", `--color-badge-sale` for a live discount — both white text, per Section 5. Never `--color-accent` for either, since that's reserved for the card's own price/actionable elements below. A card should never show two badges of the same color for different meanings (e.g. "Bestseller" and "20% off" both in teal-green) — if a card genuinely has both a status and a sale active, they stack as two distinct-colored pills, not one merged one.

**Quick actions (new requirement — cards currently have no way to act without a full page navigation):**

Every product card gets two actions in its footer, below the price, side by side:

```
[ View details ]   [ Add to cart ]
```

- **"View details"** — secondary/outline style (`--color-border` outline, `--color-ink` text, transparent fill), links to the PDP. This is a real button, not just relying on the card image being clickable — some users specifically look for an explicit next step.
- **"Add to cart"** — primary, `--color-accent` filled, white text, per Section 5's button-state rules. For single-variant products (which this catalog is — no size/color options on any of the 7 books), this adds directly to cart with no modal or variant picker needed. If a future product ever has real variants, "Add to cart" on the card should open a minimal variant-select popover rather than guessing a default variant.
- Both buttons follow the Section 4 minimum touch-target height (44px) on mobile/tablet.
- On the add-to-cart click, follow the Section 10 loading-state rule: button text changes to "Adding…" and then briefly to "Added ✓" (or opens the cart drawer) — never leave it looking clickable-but-dead while the request is in flight.
- Blog cards do not get this footer (no "add to cart" concept) — they keep the simpler treatment from Section 7.5 (category tag, title, excerpt only, whole card links through to the article).

---

## 6. Section rhythm (vertical spacing between page sections)

This is the single most common thing that makes an ecommerce site feel "off" — inconsistent gaps between sections. Use exactly these values, every time:

```
Mobile:  --space-7 (48px) between every major section
Tablet:  --space-8 (64px) between every major section
Desktop: --space-9 (96px) between every major section
```

A "section" means: hero, shop-by-collection grid, featured products, brand story, reviews, email signup — each of these is a section, and the gap between any two consecutive ones uses the value above. Do not vary this per-section based on "feel" — uniform rhythm is what makes scrolling feel calm and intentional rather than chaotic.

**Exception:** a section with a colored/tinted background (like the email signup bar) provides its own visual separation through the color change, so its *internal* padding can absorb some of this spacing — use `--space-6` to `--space-7` internal top/bottom padding on tinted full-bleed sections instead of stacking the full section-gap on top of it.

---

## 7. Page-by-page layout specs

### 7.1 Homepage

Order and purpose of every section, top to bottom:

1. **Header** (sticky, see Section 9)
2. **Hero** — one headline (`--text-display`), one supporting line (`--text-body-lg`, max 20 words), one CTA button. Image or illustration takes 40–50% of the hero width on desktop, stacks below text on mobile. No carousel — a single, confident hero outperforms a rotating one for conversion (users act on what they see first; carousels average under 1% interaction with slides 2+). **The hero text column must sit inside the same page container defined in Section 4 (`max-width: 1280px`, `margin-inline: auto`, `padding-inline` per breakpoint) — it does not get a special exception with less padding than every other section.** If the hero looks "close to the edge" compared to sections below it, that's a bug: the hero is not using the shared container.
3. **Shop by collection** — 4–6 tiles, 2×2 or 2×3 grid. Section heading at `--text-h2`. This is the primary navigation aid for a browsing-heavy category (books) — it must appear before any other content block.
4. **Featured/bestseller products** — 4–8 products, same grid rules as Section 4. Include a "Bestseller" or "New" micro-badge (`--text-micro`, `--color-badge-status` fill, white text — per Section 5) on relevant cards — social proof at the glance level, not just in reviews. This badge must visually stand apart from the saffron CTA/price color on the same card, not blend into it.
5. **Brand story** — one short paragraph (`--text-body`, max ~80 words) with a supporting image. This exists to build trust for first-time visitors, not to explain everything — link to a full About page rather than expanding this section.
6. **Reviews/social proof** — 3 short quotes, each under 25 words. Real customer names/locations if available; never fabricate.
7. **Stories from Amar Granth (blog teaser)** — one row per content category (per Section 7.5's category list: 12 Jyotirlings, 51 Shaktipeeths, Rivers of Bharat, Rishis & Sages, Temples, Rudraksha), each row showing exactly 3 posts from that category using the blog card treatment from Section 5.3, with a category label (`--text-h3`) above each row and a "View all →" link at the row's end pointing to the filtered blog listing (`/blogs?tag=X`). **Flagging the real tradeoff here since it's a direct instruction, not a judgment call:** 6 categories × 3 posts is 18 cards across 6 full-width rows — a substantial amount of homepage scroll depth, more than a typical single "latest posts" teaser row. That's fine if the goal is genuinely surfacing the full breadth of content on the homepage; worth knowing going in that it will make the homepage noticeably longer than sections 1–6 alone. Build it as specified; revisit row count later if homepage length becomes its own concern.
8. **Email signup** — tinted full-bleed section, single input + button, one-line value proposition. This is the last thing on the page, positioned as a low-commitment ask after trust has been built.
9. **Footer** (see Section 9)

### 7.2 Collection / product listing page (PLP)

- **Breadcrumb** at the top (`Home / Collections / 12 Jyotirlings`) — `--text-small`, `--color-ink-soft`, always present except on homepage.
- **Collection title** (`--text-h1`) + one-line description (`--text-body`, optional, max 20 words) directly below breadcrumb.
- **Filter/sort bar** (if applicable — likely minimal given a small catalog, but include a sort-by-price/newest control at minimum) — sticky is optional but the bar itself is required for any collection with 6+ products.
- **Product grid** per Section 4 column rules. Each card: image (1:1 aspect ratio, consistent across all cards), title (`--text-h3`, max 2 lines with ellipsis overflow), price (`--text-body`, weight 500) — same two-state color rule as the PDP (Section 7.3, step 5): `--color-accent` when there's no discount, or `--color-badge-sale` for the final price plus `--color-ink-soft` struck-through original when there is one. Don't let the card and PDP disagree on which color a discounted price uses.
- **No pagination for a catalog this size (7 products today).** Show all products on one page. Only introduce pagination/infinite scroll if the catalog grows past ~24 items in a single collection.

### 7.3 Product detail page (PDP) — the highest-leverage page for conversion

**Audit note:** a real WIP page was reviewed against this section and found missing a sticky mobile add-to-cart bar, a combo-bundle upsell, a quantity selector, and a Buy Now option — all now specified explicitly below. Age-range badges and review/rating data are explicitly **deferred** (see note in step 3) since that data doesn't exist yet — don't block PDP work waiting on it.

- **Above the fold (no scrolling required on desktop, minimal scroll on mobile) must contain:** product image, title, price, and the add-to-cart button. If any of these require a scroll to see on a standard laptop screen (1440×900), the layout is wrong.
- **Layout:** two-column on tablet+ — image column (55–60% width) left, info column (40–45%) right. Single column, image-first, on mobile.
- **Image treatment:** large product photo on a pastel tint background (not pure white — ties back to brand), with 2–4 secondary thumbnail images below/beside if available (back cover, inside spread sample, size reference). No auto-rotating gallery — user-controlled only. No text overlaid on the image itself (event banners live in the info column, see step 2 below — not stamped across the product photo).
- **Info column order, top to bottom (this exact order, nothing skipped):**
  1. Breadcrumb
  2. **Event/offer banner — only when an active promotion exists, and built as its own separate, date-gated component, never hand-written into the description.** Solid `--color-badge-sale` fill (`#C0294F`) with white text — this is a sale/urgency signal, not a status signal, so it uses the sale token specifically, not `--color-badge-status`. Also not `--color-tint-sand`, which was an even earlier spec and read as too muted to actually grab attention (direct feedback: a sale tag needs to pop, not blend into the page background). Reading e.g. "🪔 Ganpati Sale — 17% off, ends Sep 30" with the event name, discount, and end date all pulled from actual fields (a scheduled promotion object/metafield with start/end dates), not typed into the product description as prose. **The banner must not render at all once its end date has passed** — this is the direct fix for the stale "Ganpati sale ends Sept 30" copy sitting permanently in the current build. Core evergreen content (title, description, "what's inside") never mentions specific sales or dates — that information only ever lives in this one dismissible, time-boxed component.
  3. Title (`--text-h1`). *(Age-range badge deferred — leave a spot in the component for it but don't block on data that doesn't exist yet. Same for star-rating/review social proof — skip for now, revisit once real review data exists.)*
  4. One-line emotional hook — not a repeat of the title (`--text-body-lg`, `--color-ink-soft`)
  5. **Price.** Two states:
     - **No discount (`compareAtPrice` is null or equal to `price`):** show only the price, `--color-accent` (saffron), `--text-h2` weight 600. This is the default, majority case.
     - **Discounted (`compareAtPrice` > `price`) — currently missing, add it:** show the original price first, `--color-ink-soft`, `text-decoration: line-through`, `--text-body` size (smaller than the final price, not equal to it). Directly after it, show the final price at `--text-h2` weight 600, but in **`--color-badge-sale`** (crimson), not `--color-accent`. Reasoning, per Section 5.2's decision framework: a struck-through discount price is functioning as a sale signal the same way the event banner above it is, so it borrows that color specifically in this state — a non-discounted price stays saffron as always. This is a state-based exception, not random inconsistency, and the visible strikethrough is what keeps it legible as one.
  6. **Quantity selector** — a stepper control (`−` / number / `+`), matching the same visual pattern already used correctly in the cart drawer (pill-shaped border, 44px tap targets), placed directly above the Add to Cart button. Defaults to 1. This was entirely missing from the reviewed build — right now a customer wanting 2 copies has no way to set that before adding to cart.
  7. **Add to cart button** — full width of the info column, `--color-accent` fill, white text, minimum 52px tall. Label: "Add to cart".
  8. **Buy now button** — full width, directly below Add to cart, same height (52px), but secondary styling: transparent/white background, `2px solid var(--color-accent)` border, `--color-accent` text. Skips the cart entirely and goes straight to Shopify checkout with the selected quantity. This was also missing — some customers know they want to buy immediately and shouldn't be forced through an extra cart-review step. Add to cart stays the primary/filled button since it supports continued browsing; Buy now is the express path for ready-to-purchase visitors.
  9. Trust row directly under the buttons: shipping info, return policy snippet — small icons + `--text-small`, single line if possible. Reduces last-minute hesitation right at the decision point.
  10. **Combo/bundle upsell callout** (only on products that have a relevant bundle — e.g. the standalone 12 Jyotirlingas or 51 Shaktipeeths pages, since the Combo Set includes both): a distinct, bordered callout card — not just a "you might also like" tile — reading something like "Get both books in the Combo Set for ₹845 (save ₹145)" with a link to the combo product. This is the highest-leverage upsell this specific catalog supports structurally and must not be buried in the generic related-products grid at the bottom of the page. **Color treatment (see Section 5.2 for the general rule this follows):** `--color-tint-sand` background, `2px solid var(--color-accent)` border (not `--color-border` — this callout is deliberately more prominent than a standard card), `--color-ink` for the descriptive sentence, and `--color-accent` for the savings figure and the "View set →" link specifically. This is **not** a `--color-badge-*` component — it's a content card with its own actionable elements, not a status tag, so it follows the accent system, not the promotional palette.
  11. "What's inside" — **3–5 short bullets only, `--text-body`, nothing else in this block.** No promotional sentences, no sale-date copy, no marketing prose mixed in above or between the bullets — that content lives only in the event banner (step 2) or is removed once expired. A "What's inside" block that mixes bullet points with paragraph marketing copy is a wall-of-text bug, not acceptable — this is a children's book page, parents scan, they don't read essays.
  12. Ownership badge if applicable (see PROJECT_CONTEXT.md ownership-equivalence rule) — small chip, e.g. "You already own the Combo Set" — only when relevant to a signed-in customer.
  13. Expandable/accordion sections below the fold for anything longer: full description, shipping details, FAQ. Keeps the page scannable while not hiding real information.
- **Related products** ("You might also like" / "Complete the collection") below the fold, same card treatment as the PLP grid, 4 items max, respecting the ownership-equivalence rule (never recommend a title the customer already owns via the Combo Set).
- **Sticky add-to-cart on mobile — verify this actually ships, it was speced before and did not make it into the reviewed WIP build:** once the user scrolls past the primary add-to-cart button, a slim sticky bar pinned to the bottom of the viewport appears, containing the price and a smaller add-to-cart button. Test this specifically by scrolling to the "What's inside" section on an actual mobile viewport (375px) and confirming a buy button is still visible on screen at all times. This alone is one of the highest-impact mobile ecommerce conversion patterns — don't skip it, and don't consider the PDP done without manually verifying it.

### 7.4 Cart (drawer/aside)

- Opens as a right-side drawer, not a full page navigation — keeps the user in their shopping flow.
- **Close/cancel — non-negotiable, currently missing:** an explicit `×` close button in the drawer's header (top-right, 44px tap target, `aria-label="Close cart"`), **plus** two other standard dismiss paths that must both work: clicking the dimmed overlay outside the drawer, and pressing the `Escape` key. A drawer with no visible way to back out of it is a real usability failure, not a minor gap — verify all three dismiss methods work before considering this done.
- Each line item: thumbnail (small, ~64px), title, price, quantity stepper (min 44px tap targets), remove action.
- Subtotal clearly visible at `--text-h3` weight, above the checkout button, not buried below extra content.
- **Checkout button** is the only accent-filled button in the drawer — full width, minimum 52px tall, label reads "Checkout" not a vague "Continue."
- **Drawer footer spacing (fixes reported excess bottom whitespace):** the footer block (subtotal, free-shipping indicator if present, checkout button) uses `--space-5` (24px) padding on all sides, with `--space-3` (12px) gap between its internal elements (subtotal → shipping indicator → button). It must not use `flex-grow`/`mt-auto` spacers beyond what's needed to pin it under a short line-item list — if the drawer has only 1–2 items, the footer should sit close beneath them, not float with a large empty gap pushed to the bottom of the viewport. Only the line-items list area scrolls/expands; the footer stays a fixed-height block directly below it.
- If cart is empty: friendly empty state with a single CTA back to a collection — not just blank space.
- Free shipping progress indicator if applicable (e.g. "Add ₹155 more for free shipping") — genuinely one of the highest-ROI additions to a cart drawer for average-order-value.

### 7.5 Blog listing page

The blog serves two purposes that should shape every decision here: it's the site's largest source of organic search traffic (66 migrated articles, all preserving their original SEO), and it's a conversion tool — most posts (Jyotirlingas, Shaktipeeths, Rudraksha, rivers) map directly to a product in the catalog. The listing page should make both easy: easy to browse/discover, and easy to route back toward a relevant book.

**Header block (top of page, above the grid):**
- Page title "Stories & Heritage" or similar (`--text-h1`) + one-line description of what the blog covers (`--text-body`, max ~20 words).
- No search bar required for a 66-post blog — a category filter is more useful than search at this volume (see below).

**Category filter (required — do not ship this page as one undifferentiated grid of 66 cards):**
- Based on the actual content clusters already in the migrated posts: **Jyotirlingas**, **Shaktipeeths**, **Rivers of Bharat**, **Rishis & Sages**, **Temples**, **Rudraksha**. Map these to Shopify blog tags (already partially set during migration — verify/complete tagging if needed) rather than inventing a new taxonomy.
- Rendered as a horizontal row of pill filters (`--radius-pill`, per Section 5 chip contrast rules) directly below the header block. "All" is the default active state.
- Filtering happens client-side or via URL param (`?tag=jyotirlingas`) — either is fine, but the state must be reflected in the URL so filtered views are shareable/bookmarkable and so back-button behavior works correctly.
- Active filter pill uses `--color-accent` fill with white text; inactive pills use a `--color-border` outline with `--color-ink-soft` text.
- On mobile, this row scrolls horizontally rather than wrapping to multiple lines — wrapping pushes the actual content too far down the page.

**Grid:**
- 3 columns desktop, 2 columns tablet, **1 column mobile** — this is the one place in the site that breaks the "never single-column on mobile" rule from Section 4, because blog cards carry more text (excerpt) than product cards and need the width to stay readable. Product grids stay multi-column; blog does not.
- Card contents, top to bottom: cover image (16:9 aspect ratio, consistent across all cards — do not mix aspect ratios), category tag (`--text-micro`, small pill matching its filter color), title (`--text-h3`, max 2 lines with ellipsis), one-line excerpt (`--text-small`, `--color-ink-soft`, max 2 lines with ellipsis).
- No author byline needed (single brand voice, not a multi-author publication) — omit rather than force a generic "By Amar Granth" on every card, which adds visual noise without adding information.
- Card gap: `--space-5` per Section 2 grid-gutter rule.

**Pagination:**
- Unlike the product catalog (7 items, no pagination — Section 7.2), the blog has 66 posts and needs it. Use a **"Load more" button** rather than numbered pagination — better mobile experience, keeps the user in flow, and is simpler to implement than page-based routing for a content type with no strong need for direct page-N linking.
- Load 12 posts initially, 12 more per click. Button sits centered below the grid, secondary/outline style (not accent-filled — this is a supporting action, not the page's primary CTA).
- If a category filter is active and has fewer than 12 posts, hide the load-more button entirely rather than showing it disabled.

**Empty state:** only relevant if a filter somehow returns zero posts (shouldn't happen with current content, but build defensively) — friendly message + a "View all posts" link back to the unfiltered grid.

### 7.6 Blog article page

- **Hero:** cover image full-width at the top (16:9, same crop as its listing-page card for visual continuity), category tag + title (`--text-h1`) + publish date (`--text-small`, `--color-ink-soft`) sitting below the image, not overlaid on it (avoids the text-on-image contrast risk from Section 5, and keeps the image itself as the visual, not a background).
- **Body copy:** constrained to the 640px max-width rule from Section 3, centered on the page regardless of the outer container width — this is the single most important rule for this page. An article stretched to a 1280px container is unreadable and immediately signals an unfinished/templated site.
- **Typography inside the article body:** `--text-body-lg` (18px), not the smaller default body size — long-form reading benefits from slightly larger type. Paragraph spacing of `--space-4` between paragraphs. Any subheadings within the article use `--text-h3`.
- **Product cross-link block:** for any article that maps to a real product (e.g. the Kedarnath Jyotirlinga article → the 12 Jyotirlingas book), include a single, clearly designed callout card after the article body — not buried mid-text as an inline link. Pattern: small product thumbnail + title + price + a "Shop this book" button (accent-filled, matches Section 7.3's add-to-cart visual weight since this is effectively a secondary conversion moment). This is one of the highest-value additions on the whole site given how directly the blog content maps to the catalog — do not skip it, and do not make it a generic "browse our shop" link when a specific, relevant product exists.
- **Related posts:** 3-card row at the very bottom, same card treatment as the listing grid, pulled from the same category tag where possible.
- **No comments section, no social share buttons row cluttering the top of the article** — if social sharing is wanted, a minimal icon set can sit quietly at the bottom near related posts, not competing with the title for attention at the top.

---

## 8. Whitespace management — practical checklist

- If a section feels "busy," the fix is almost always more space, not less content.
- Never let two unrelated elements touch or sit closer than `--space-4` apart — the eye reads proximity as relationship.
- Card grids need consistent gutters (`--space-4` to `--space-5`) — never let gutter width vary between rows.
- Text blocks need breathing room from the edges of their container — minimum `--space-4` padding, more on larger screens.
- **Test the "squint test":** blur your eyes looking at the page. You should still be able to tell where one section ends and the next begins, purely from spacing and layout, without reading anything.

---

## 9. Persistent chrome (header, footer)

**Sticky footer (page-level layout, applies to every route):** the footer must always sit at the bottom of the viewport on short-content pages, not float mid-screen. Implementation: the root layout wrapper uses `min-h-screen flex flex-col`, the main content area uses `flex-1`, and the footer sits after it with no `flex-1` of its own — this pushes it to the bottom on pages with little content while letting it sit naturally below long content on pages that scroll. Verify by checking a route with almost no content (an empty search or a thin collection) at a tall viewport — the footer should still be pinned to the bottom, not stranded halfway down.

**Header:**
- Sticky on scroll, but shrinks slightly (reduce vertical padding by ~30%) after ~80px of scroll to reclaim vertical space without disappearing entirely.
- **Logo:** the icon-only square sun mark (per `LOGO_BRIEF.md` Section 3, "Icon only" lockup) sits to the left, with the "Amar Granth" wordmark directly beside it — this is effectively the horizontal lockup, but built from the icon-only asset plus a text element rather than a single flattened image, so the wordmark can inherit the site's live `--font-heading` (Domine) rather than being baked into a static graphic.
- **Nav links:** `--text-body` (16px), weight 500, `--color-ink-soft` default / `--color-ink` on hover. **Not `--text-small` (14px)** — an earlier pass used the smaller size and it read as too minor for primary navigation. Nav center on desktop, hidden behind a hamburger below 1024px.
- **Right-side icons: account and cart only.** No search icon for now — deferred, remove it entirely rather than disabling/hiding it, so there's no dead UI element sitting in the header.
- Cart icon always shows item count as a small badge once the cart is non-empty — accent-filled, `--text-micro`.
- Background: solid `--color-base` or white, never transparent-over-content — the header must always be legible regardless of what's scrolled beneath it.

**Footer:**
- **Logo:** same icon-only square mark + wordmark lockup as the header, but check `LOGO_BRIEF.md`'s reversed color version if the footer background is dark/deep-toned (see tint note below) — don't reuse the light-background version on a dark footer.
- Contains, top to bottom or in columns: logo lockup, brand blurb (1–2 lines), collection links, policy links (shipping/returns/privacy), **social icons (Facebook + Instagram — see note below)**, and a copyright line.
- **Social icons:** simple, single-color (`--color-ink-soft` default, `--color-accent` on hover) Facebook and Instagram glyphs, `target="_blank" rel="noopener noreferrer"`, `href` pulled from `siteConfig.social.facebook` / `siteConfig.social.instagram` (Section 0.3) — not hardcoded in the footer component.
- Background can use a slightly deeper tint (e.g. `--color-tint-sand`) to visually close out the page — don't leave it the same white/cream as the body with no separation.
- Generous padding: `--space-8` top and bottom minimum.

---

## 10. Conversion-specific rules (apply across the whole site)

1. **Every product image is real, consistent, and well-lit.** Inconsistent product photography (different backgrounds, angles, lighting) is one of the fastest ways to look untrustworthy on a small ecommerce site — worse than imperfect design.
2. **Price visibility:** price is never hidden behind a click or hover. It's visible on every card and on the PDP without interaction.
3. **Trust signals near the point of decision, not buried in a footer link:** shipping/returns info belongs near the add-to-cart button (Section 7.3), not only on a separate policy page.
4. **Minimize form fields everywhere** — especially checkout (handled by Shopify's native checkout, but any custom forms like signup should ask for the absolute minimum: email only, not name + email + phone unless functionally necessary).
5. **Loading states matter.** Any async action (add to cart, applying a discount code, submitting a form) needs an immediate visual response — button text changes to "Adding…" or a spinner appears within 100ms of the click. Never leave a button looking clickable-but-dead while a request is in flight.
6. **Error states are specific and human**, not generic. "That size is out of stock" not "An error occurred." (Matches the CDS content voice rules: say what happened, then what to do.)
7. **Never use fake urgency or scarcity** (fake countdown timers, "3 people are viewing this" without real data) — this brand's trust proposition is heritage and authenticity; manufactured urgency undercuts that positioning and reads as low-trust to the exact parent-shopper audience it targets.

---

## 11. Accessibility floor (non-negotiable, not optional polish)

- All interactive elements reachable and operable by keyboard alone (tab order follows visual order).
- All images have meaningful `alt` text — product photos describe the product, decorative icons get `alt=""` or `aria-hidden`.
- Focus states are visible on every interactive element — never remove `:focus` outlines without replacing them with an equally visible custom state.
- Color is never the only signal for state (e.g. "in stock" vs "out of stock" needs a text label or icon, not just a color change).
- All contrast ratios per Section 5.

---

## 12. What "done" looks like

Before considering any page finished, verify:
- [ ] Ran the Section 0.1 grep scan for hardcoded colors — zero results.
- [ ] Ran the Section 0.3 grep scan for hardcoded social URLs — zero results outside `site-config.ts`.
- [ ] Nav labels, footer links, blog categories, bundle relationships, and trust-row copy all come from `siteConfig`, not retyped in components.
- [ ] Every badge/tag uses the correct promotional token for its meaning — `--color-badge-status` for Bestseller/New, `--color-badge-sale` for discounts/time-bound offers — never `--color-accent` (saffron), and never the wrong one of the two for its purpose.
- [ ] Every discounted price (PDP and cards) shows the struck-through original in `--color-ink-soft` and the final price in `--color-badge-sale` — not just the final price alone, and not `--color-accent` for the discounted figure.
- [ ] Footer sits at the bottom of the viewport on short-content pages, not floating mid-screen.
- [ ] Cart drawer has a working close button, overlay-click dismiss, and Escape-key dismiss — all three.
- [ ] Cart drawer footer has no excess bottom whitespace on a 1–2 item cart.
- [ ] Nav links render at 16px (`--text-body`), not 14px.
- [ ] Header search icon has been removed, not just hidden.
- [ ] No instance of "Jyotirlingas" remains anywhere on the site — check the collection title specifically.
- [ ] Every spacing value used traces back to the Section 2 scale — no arbitrary pixels.
- [ ] Section-to-section vertical rhythm matches Section 6 exactly.
- [ ] Type sizes match the Section 3 scale at both mobile and desktop breakpoints.
- [ ] Every text/background pairing passes the Section 5 contrast rules.
- [ ] Page tested at 375px, 768px, and 1440px widths.
- [ ] The one primary action on the page (Section 1, principle 3) is the single most visually dominant element.
- [ ] Keyboard navigation and focus states work end to end.
- [ ] CTA buttons have `--space-6` (32px) minimum gap from preceding text — not tighter.
- [ ] Page container centers correctly at 1600px+ width with visibly equal space on both sides.
- [ ] Every card has a visible `1px` border in its default (non-hover) state.
- [ ] Every button state (hover, focus, active, disabled) has been contrast-checked individually, not just the default state.
- [ ] Every `--text-h2` heading is visibly, obviously larger than body text beside it — verified via computed styles in devtools, not eyeballed.
- [ ] Every heading's computed `font-family` resolves to `'Domine'`, except the single hero headline, which resolves to `'Instrument Serif'` — no other element uses the hero font.
- [ ] Product card images are full-bleed with zero padding; only the text content below has inset padding.
- [ ] Product card titles clamp at 2 lines, never 1.
- [ ] Every product card has both a "View details" and "Add to cart" action visible in its footer.
- [ ] "What's inside" contains only bullets — no promotional prose, no sale-date copy mixed in.
- [ ] Any active event/offer (Ganpati, Independence Day, New Year, etc.) appears only in the dedicated banner component, never hand-typed into product descriptions — and the banner is date-gated so it disappears automatically after its end date.
- [ ] The 12 Jyotirlingas and 51 Shaktipeeths PDPs both show a combo-bundle upsell callout, not just a generic related-products tile.
- [ ] Every PDP has a working quantity selector above the Add to cart button.
- [ ] Every PDP has both an Add to cart button (filled) and a Buy now button (outline) — Buy now goes straight to checkout with the selected quantity.
- [ ] Mobile sticky add-to-cart bar manually verified at 375px width by scrolling past the primary button.
