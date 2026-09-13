/**
 * Hydrogen's built-in PRODUCT_ADD_TO_CART analytics event fires whenever a
 * cart line's quantity increases, regardless of what caused it — so the
 * cart drawer's own quantity stepper ("+" button, a LinesUpdate mutation)
 * fires the exact same event as a genuine "Add to Cart"/"Buy Now"/quick-add
 * click. Every stepper nudge was silently counted as a real AddToCart
 * conversion by both the Meta Pixel and GA4, inflating those counts well
 * past Shopify's own (which only reflects genuine adds).
 *
 * AddToCartButton is the only place in this codebase that ever submits a
 * LinesAdd mutation, so it marks each merchandise line's intent here
 * *before* submitting. MetaPixel.tsx/GoogleAnalytics.tsx each consume their
 * own independent counter when Hydrogen's diff-based event fires, and only
 * forward it to their pixel if it was actually marked — a stepper-driven
 * increase was never marked, so it's silently dropped.
 *
 * Two independent per-consumer counters (rather than one shared one) so
 * Meta consuming its mark doesn't also suppress GA4's, and vice versa.
 */

type Consumer = 'meta' | 'ga4';

const pendingByConsumer: Record<Consumer, Map<string, number>> = {
  meta: new Map(),
  ga4: new Map(),
};

export function markGenuineAddToCart(merchandiseId: string) {
  for (const pending of Object.values(pendingByConsumer)) {
    pending.set(merchandiseId, (pending.get(merchandiseId) ?? 0) + 1);
  }
}

export function consumeGenuineAddToCart(
  consumer: Consumer,
  merchandiseId: string,
): boolean {
  const pending = pendingByConsumer[consumer];
  const count = pending.get(merchandiseId) ?? 0;
  if (count <= 0) return false;
  if (count === 1) {
    pending.delete(merchandiseId);
  } else {
    pending.set(merchandiseId, count - 1);
  }
  return true;
}
