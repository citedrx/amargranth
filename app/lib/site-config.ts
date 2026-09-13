/**
 * Single source of truth for site-wide content, navigation, and business
 * rules — DESIGN_SYSTEM.md Section 0.3. Design tokens (colors, spacing,
 * type) live separately in app/styles/tailwind.css (Section 0.1).
 *
 * A few values here deliberately differ from the doc's own illustrative
 * example, because the example conflicts with real, already-verified data:
 * - blogCategories tags are singular ("jyotirlinga", "shaktipeeth") to match
 *   the real tags on the 66 migrated Shopify articles (verified via the
 *   Admin API) — the doc's example used plural forms that don't exist on
 *   any real article and would silently return zero results.
 * - navigation.footer.shop hrefs use the real collection handle
 *   "12-jyotirlingas" (unchanged on purpose, to avoid breaking existing
 *   links/redirects) — the doc's example used "12-jyotirlings", which
 *   404s against the real store.
 * - contactEmail is contact@amarshivmedia.com, not contact@amargranth.com —
 *   ASM explicitly requested this exact change earlier in the project.
 *
 * Header/footer navigation here is used as a FALLBACK only — the live
 * Shopify-managed menu (editable in Admin, no code deploy needed) is
 * always tried first in Header.tsx/Footer.tsx. This still satisfies the
 * "not retyped in components" rule: previously each component defined its
 * own separate hardcoded fallback object: now there's one.
 */

export const siteConfig = {
  name: 'Amar Granth',
  description:
    'Illustrated storybooks on the 12 Jyotirlings, 51 Shaktipeeths, Rivers of Bharat and more — bringing Indian mythology and heritage to young readers.',
  contactEmail: 'contact@amarshivmedia.com',

  navigation: {
    header: [
      {label: 'Home', href: '/'},
      {label: 'Catalog', href: '/collections'},
      {label: 'Blogs', href: '/blogs'},
      // No "Search" entry — deliberately removed, see Section 9 / features.search below.
    ],
    footer: {
      shop: [{label: 'Collections', href: '/collections'}],
      support: [
        {label: 'About', href: '/about'},
        {label: 'Contact', href: '/contact'},
        {label: 'FAQ', href: '/faq'},
      ],
    },
  },

  social: {
    facebook: 'https://www.facebook.com/p/Amar-Granth-100090905684315/',
    instagram: 'https://www.instagram.com/amargranthofficial/',
  },

  features: {
    search: false, // deliberately disabled — see Section 9
  },

  // Blog category taxonomy — drives both the blog-listing filter pills
  // (Section 7.5) and the homepage "Stories from Amar Granth" category rows
  // (Section 7.1, step 7). Tags are the real ones already on the 66
  // migrated articles (verified via the Admin API) — add/rename a category
  // here and it updates everywhere it's used, once.
  blogCategories: [
    {label: '12 Jyotirlings', tag: 'jyotirlinga'},
    {label: '51 Shaktipeeths', tag: 'shaktipeeth'},
    {label: 'Rivers of Bharat', tag: 'rivers'},
    {label: 'Rishis & Sages', tag: 'rishis'},
    {label: 'Temples', tag: 'temples'},
    {label: 'Rudraksha', tag: 'rudraksha'},
  ],

  // Bundle relationships — drives the combo-upsell callout (Section 7.3,
  // step 10) AND the ownership-equivalence rule (PROJECT_CONTEXT.md): a
  // customer who owns the comboHandle product owns everything listed in
  // includesHandles too, and should never be shown those standalone titles
  // as if they don't already own them. Real product handles, verified via
  // the Admin API.
  bundles: [
    {
      comboHandle: '12-jyotirlings-51-shaktipeeths-book-set-hardcover',
      includesHandles: [
        'a-childrens-guide-to-the-12-shiva-jyotirlings-best-seller-hard-cover',
        'a-childrens-guide-to-the-51-shaktipeeths-hardcover',
      ],
    },
  ],

  trust: {
    shipping: 'Free shipping across India · 24–48hr dispatch',
    returns: 'Damaged on arrival? Email us within 24hrs for a replacement',
  },

  // Pins these two products to fixed positions in the catalog — ASM's
  // explicit request (Sept 2026) — regardless of whatever algorithmic sort
  // (best-selling, title A-Z) would otherwise place them. Applied to the
  // homepage's Featured Products and the "All books" listing's default
  // view only; never overrides a shopper's explicit sort choice (price,
  // newest) on that listing. See sortCatalogProducts below.
  catalogOrder: {
    pinFirst: '12-jyotirlings-51-shaktipeeths-book-set-hardcover', // Combo Set
    pinLast:
      'a-childrens-guide-to-the-12-shiva-jyotirlings-hindi-paperback', // Hindi edition
  },

  // Date-gated promotional banners (PDP, Section 7.3 step 2) are NOT driven
  // from this array in this codebase — they're driven by real Shopify
  // metafields (custom.promo_label/promo_discount/promo_end_date on each
  // Product), editable in Admin without a code deploy at all, which is an
  // even more direct fit for Section 0.3's own stated goal ("anything that
  // could need updating without a full code review belongs in one place")
  // than a TypeScript array would be. See products.$handle.tsx's
  // loadCriticalData/promoActive and PROJECT_CONTEXT.md for the real,
  // currently-populated "Ganpati Festive Sale" data. This field is kept
  // for schema completeness per the doc, but intentionally stays empty.
  promotions: [] as Array<{
    id: string;
    label: string;
    discountText: string;
    startDate: string;
    endDate: string;
    appliesToHandles: string[];
  }>,
} as const;

export type SiteConfig = typeof siteConfig;

/** Moves catalogOrder.pinFirst to the front and pinLast to the end,
 * preserving the relative order of everything else. */
export function sortCatalogProducts<T extends {handle: string}>(
  products: T[],
): T[] {
  const {pinFirst, pinLast} = siteConfig.catalogOrder;
  const first = products.find((p) => p.handle === pinFirst);
  const last = products.find((p) => p.handle === pinLast);
  const rest = products.filter(
    (p) => p.handle !== pinFirst && p.handle !== pinLast,
  );
  return [...(first ? [first] : []), ...rest, ...(last ? [last] : [])];
}
