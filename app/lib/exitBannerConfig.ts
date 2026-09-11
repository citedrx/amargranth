/**
 * Single control point for what triggers the exit-intent offer banner
 * (ExitIntentBanner.tsx, EXTRA10 code). Flip these booleans to change
 * which real-world signal(s) show it — no other file needs touching.
 *
 * All three share the same underlying "visitor looks like they're about
 * to leave" detection (desktop mouseleave-to-top; mobile fast-scroll-up
 * or idle, see ExitIntentBanner.tsx) — they only differ in which extra
 * condition must also be true for that signal to actually show the
 * banner. Any combination can be enabled at once; the banner fires on
 * whichever enabled condition is met first, and still shows at most once
 * per day per visitor regardless of which condition triggered it.
 *
 * - exitIntent: no extra condition — fires on the signal alone.
 * - abandonedCart: fires only when the visitor has items in their cart
 *   that they have not checked out.
 * - abandonedCheckout: fires only when the visitor started Shopify's
 *   hosted checkout (clicked "Checkout" or "Buy now") and returned to
 *   the storefront without completing it (cart still has items). Relies
 *   on markCheckoutStarted() being called at those two click sites
 *   (CartSummary.tsx, ProductForm.tsx) — see below.
 */
export const exitBannerConfig = {
  triggers: {
    exitIntent: true,
    abandonedCart: false,
    abandonedCheckout: false,
  },
};

const CHECKOUT_STARTED_KEY = 'ag_checkout_started_at';
const CHECKOUT_STARTED_TTL_MS = 30 * 60 * 1000;

/**
 * Call right before navigating to Shopify's hosted checkout (Checkout /
 * Buy now click), so a later page load on the storefront can tell
 * "came back from checkout without completing" apart from an ordinary
 * first visit. Only meaningful while triggers.abandonedCheckout is on.
 */
export function markCheckoutStarted() {
  try {
    window.sessionStorage.setItem(CHECKOUT_STARTED_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode, blocked) — abandonedCheckout
    // just won't fire for this visitor; exitIntent/abandonedCart still can.
  }
}

export function hasStartedCheckoutRecently(): boolean {
  try {
    const startedAt = window.sessionStorage.getItem(CHECKOUT_STARTED_KEY);
    if (!startedAt) return false;
    return Date.now() - Number(startedAt) < CHECKOUT_STARTED_TTL_MS;
  } catch {
    return false;
  }
}
