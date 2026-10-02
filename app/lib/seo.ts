import {siteConfig} from '~/lib/site-config';

/**
 * SEO/AEO helpers added in the pre-launch audit (Sept 2026) — see
 * PROJECT_CONTEXT.md. Canonical hrefs are deliberately relative
 * ("/products/foo", not "https://amargranth.com/products/foo") — that
 * matches the one canonical tag that already existed on the PDP before
 * this pass, and a relative canonical resolves against whichever origin
 * actually serves the page, so it needs zero code changes at the
 * amargranth.com domain cutover.
 */

export function canonicalLink(pathname: string) {
  return {rel: 'canonical', href: pathname} as const;
}

/**
 * Open Graph + Twitter Card tags, added in a later audit pass after the
 * original SEO/AEO pass shipped with none at all — a real gap for a
 * Meta-ads-driven, India/WhatsApp-heavy storefront, since link previews on
 * Facebook/Instagram/WhatsApp/Twitter all read these, not the plain
 * <title>/meta-description search engines use. `image` must be an absolute
 * URL (relative URLs don't render in these previews) — callers pass a real
 * product/article image already fetched for the page, never a fabricated
 * placeholder. `type` follows Open Graph's own vocabulary ('website',
 * 'product', 'article').
 */
export function socialMetaTags({
  title,
  description,
  path,
  image,
  type = 'website',
}: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: 'website' | 'product' | 'article';
}) {
  const tags = [
    {property: 'og:type', content: type},
    {property: 'og:site_name', content: siteConfig.name},
    {property: 'og:title', content: title},
    {property: 'og:url', content: path},
    {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
    {name: 'twitter:title', content: title},
  ];
  if (description) {
    tags.push(
      {property: 'og:description', content: description},
      {name: 'twitter:description', content: description},
    );
  }
  if (image) {
    tags.push({property: 'og:image', content: image});
    tags.push({name: 'twitter:image', content: image});
  }
  return tags;
}

export function organizationJsonLd({
  logoUrl,
  url,
}: {
  logoUrl: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url,
    logo: logoUrl,
    email: siteConfig.contactEmail,
    sameAs: [siteConfig.social.facebook, siteConfig.social.instagram],
  };
}

export function websiteJsonLd({url}: {url: string}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url,
  };
}

/**
 * FAQPage structured data — a real AEO/rich-result win for pages built
 * entirely from Q&A content. Built directly from the same FAQ_SECTIONS
 * array faq.tsx renders on the page, so it can never drift from or
 * fabricate beyond what a visitor actually sees.
 */
export function faqPageJsonLd(
  sections: Array<{items: Array<{question: string; answer: string}>}>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sections.flatMap((section) =>
      section.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    ),
  };
}

export function breadcrumbJsonLd(items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path,
    })),
  };
}

export function productJsonLd({
  product,
  variant,
  path,
}: {
  product: {
    title: string;
    description: string;
    vendor: string;
    images: {nodes: Array<{url: string}>};
  };
  variant: {
    sku?: string | null;
    price: {amount: string; currencyCode: string};
    availableForSale: boolean;
  };
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((img) => img.url),
    sku: variant.sku || undefined,
    brand: {'@type': 'Brand', name: product.vendor || siteConfig.name},
    offers: {
      '@type': 'Offer',
      url: path,
      priceCurrency: variant.price.currencyCode,
      price: variant.price.amount,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function articleJsonLd({
  article,
  path,
}: {
  article: {
    title: string;
    seo?: {description?: string | null} | null;
    image?: {url: string} | null;
    publishedAt: string;
    author?: {name?: string | null} | null;
  };
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.seo?.description || undefined,
    image: article.image?.url ? [article.image.url] : undefined,
    datePublished: article.publishedAt,
    author: article.author?.name
      ? {'@type': 'Person', name: article.author.name}
      : {'@type': 'Organization', name: siteConfig.name},
    publisher: {'@type': 'Organization', name: siteConfig.name},
    mainEntityOfPage: path,
  };
}
