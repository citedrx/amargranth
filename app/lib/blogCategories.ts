/**
 * Blog category taxonomy, driven by the real tags already applied to the
 * 66 migrated articles during the Wix -> Shopify migration (verified via
 * the Admin API, not invented) — matches DESIGN_SYSTEM.md section 7.5.
 */
export const BLOG_CATEGORIES = [
  {label: 'Jyotirlingas', tag: 'jyotirlinga'},
  {label: 'Shaktipeeths', tag: 'shaktipeeth'},
  {label: 'Rivers of Bharat', tag: 'rivers'},
  {label: 'Rishis & Sages', tag: 'rishis'},
  {label: 'Temples', tag: 'temples'},
  {label: 'Rudraksha', tag: 'rudraksha'},
] as const;

export type BlogCategoryTag = (typeof BLOG_CATEGORIES)[number]['tag'];

export function isValidCategoryTag(tag: string | null): tag is BlogCategoryTag {
  return BLOG_CATEGORIES.some((c) => c.tag === tag);
}

export function categoryLabelForTags(tags: readonly string[]): string | null {
  const lower = tags.map((t) => t.toLowerCase());
  const match = BLOG_CATEGORIES.find((c) => lower.includes(c.tag));
  return match?.label ?? null;
}

/**
 * Maps a blog category to the one real product it maps most directly to,
 * for the PDP-style "Shop this book" cross-link on article pages. Only
 * categories with a clear single-product match are included — Rishis &
 * Sages and Temples don't map to one specific title, so they're
 * intentionally omitted rather than forced.
 */
export const CATEGORY_PRODUCT_HANDLE: Partial<Record<BlogCategoryTag, string>> = {
  jyotirlinga: 'a-childrens-guide-to-the-12-shiva-jyotirlings-best-seller-hard-cover',
  shaktipeeth: 'a-childrens-guide-to-the-51-shaktipeeths-hardcover',
  rivers: 'a-childrens-guide-to-the-rivers-of-bharat-paperback',
  rudraksha: 'shivas-tears-a-childrens-guide-to-the-rudraksha',
};

export function productHandleForTags(tags: readonly string[]): string | null {
  const lower = tags.map((t) => t.toLowerCase());
  for (const category of BLOG_CATEGORIES) {
    if (lower.includes(category.tag) && CATEGORY_PRODUCT_HANDLE[category.tag]) {
      return CATEGORY_PRODUCT_HANDLE[category.tag]!;
    }
  }
  return null;
}
