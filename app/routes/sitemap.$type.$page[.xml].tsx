import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    // Leftover Hydrogen-skeleton demo locales (US/CA/FR) — this is a
    // single-market, English-only India storefront with no locale-prefixed
    // routes at all, so every real sitemap entry was carrying 3 fake
    // hreflang alternate URLs (e.g. /EN-US/products/<handle>) that 404.
    // Empty locales means no alternate <xhtml:link> tags get emitted.
    locales: [],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
