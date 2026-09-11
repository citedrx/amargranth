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

export function organizationJsonLd({logoUrl}: {logoUrl: string}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    logo: logoUrl,
    email: siteConfig.contactEmail,
    sameAs: [siteConfig.social.facebook, siteConfig.social.instagram],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
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
