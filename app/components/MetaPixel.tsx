import {useEffect, useRef} from 'react';
import {AnalyticsEvent, useAnalytics, useNonce} from '@shopify/hydrogen';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {queue?: unknown[]};
  }
}

/**
 * Loads the Meta Pixel base script and fires the initial PageView.
 * Render once in the document <head>.
 */
export function MetaPixelBaseScript({pixelId}: {pixelId?: string}) {
  const nonce = useNonce();

  if (!pixelId) return null;

  return (
    <>
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          alt=""
          style={{display: 'none'}}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/**
 * Subscribes to Hydrogen's Analytics events and forwards them to the Meta
 * Pixel as standard events. Must render inside <Analytics.Provider>.
 * The very first PAGE_VIEWED callback is skipped since MetaPixelBaseScript
 * already fires the initial PageView from the document <head>.
 */
export function MetaPixelEvents({pixelId}: {pixelId?: string}) {
  const {subscribe} = useAnalytics();
  const isFirstPageView = useRef(true);

  useEffect(() => {
    if (!pixelId) return;

    subscribe(AnalyticsEvent.PAGE_VIEWED, () => {
      if (isFirstPageView.current) {
        isFirstPageView.current = false;
        return;
      }
      window.fbq?.('track', 'PageView');
    });

    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (payload) => {
      const product = payload.products?.[0];
      if (!product) return;
      window.fbq?.('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.title,
        content_type: 'product',
        value: Number(product.price) || undefined,
        currency: 'INR',
      });
    });

    subscribe(AnalyticsEvent.SEARCH_VIEWED, (payload) => {
      window.fbq?.('track', 'Search', {
        search_string: payload.searchTerm,
      });
    });

    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, (payload) => {
      const line = payload.currentLine;
      const product = line?.merchandise?.product;
      if (!line || !product) return;
      window.fbq?.('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.title,
        content_type: 'product',
        value: Number(line.cost?.totalAmount?.amount) || undefined,
        currency: line.cost?.totalAmount?.currencyCode || 'INR',
      });
    });
  }, [subscribe, pixelId]);

  return null;
}
