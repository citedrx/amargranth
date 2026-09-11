import {useNonce} from '@shopify/hydrogen';

/**
 * Renders a <script type="application/ld+json"> block. Needs the same CSP
 * nonce as MetaPixel.tsx/GoogleAnalytics.tsx's inline scripts — the
 * Content-Security-Policy's script-src governs every <script> tag
 * regardless of type, JSON-LD included.
 */
export function JsonLd({data}: {data: object}) {
  const nonce = useNonce();
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}
