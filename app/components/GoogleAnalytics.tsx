import {useEffect} from 'react';
import {AnalyticsEvent, useAnalytics, useNonce} from '@shopify/hydrogen';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads gtag.js and configures the GA4 property. Automatic page_view is
 * disabled (send_page_view: false) — GoogleAnalyticsEvents fires page_view
 * explicitly for every navigation, including the first, via Hydrogen's
 * PAGE_VIEWED analytics event.
 * Render once in the document <head>.
 */
export function GoogleAnalyticsBaseScript({
  measurementId,
}: {
  measurementId?: string;
}) {
  const nonce = useNonce();

  if (!measurementId) return null;

  return (
    <>
      <script
        async
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}', {send_page_view: false});`,
        }}
      />
    </>
  );
}

/**
 * Subscribes to Hydrogen's Analytics events and forwards them to GA4 as
 * standard ecommerce events. Must render inside <Analytics.Provider>.
 */
export function GoogleAnalyticsEvents({
  measurementId,
}: {
  measurementId?: string;
}) {
  const {subscribe} = useAnalytics();

  useEffect(() => {
    if (!measurementId) return;

    subscribe(AnalyticsEvent.PAGE_VIEWED, (payload) => {
      window.gtag?.('event', 'page_view', {
        page_location: payload.url,
      });
    });

    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (payload) => {
      const product = payload.products?.[0];
      if (!product) return;
      window.gtag?.('event', 'view_item', {
        currency: 'INR',
        value: Number(product.price) || undefined,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            price: Number(product.price) || undefined,
            quantity: product.quantity,
          },
        ],
      });
    });

    subscribe(AnalyticsEvent.SEARCH_VIEWED, (payload) => {
      window.gtag?.('event', 'search', {
        search_term: payload.searchTerm,
      });
    });

    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, (payload) => {
      const line = payload.currentLine;
      const product = line?.merchandise?.product;
      if (!line || !product) return;
      window.gtag?.('event', 'add_to_cart', {
        currency: line.cost?.totalAmount?.currencyCode || 'INR',
        value: Number(line.cost?.totalAmount?.amount) || undefined,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            quantity: line.quantity,
          },
        ],
      });
    });
  }, [subscribe, measurementId]);

  return null;
}
