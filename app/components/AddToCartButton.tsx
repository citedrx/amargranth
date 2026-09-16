import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {markGenuineAddToCart} from '~/lib/analyticsIntent';

export function AddToCartButton({
  analytics,
  children,
  className,
  disabled,
  lines,
  onClick,
  redirectTo,
}: {
  analytics?: unknown;
  children:
    | React.ReactNode
    | ((fetcher: FetcherWithComponents<any>) => React.ReactNode);
  className?: string;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  /** When set, the cart action redirects here after the mutation completes.
   * Pass the literal 'checkout' to skip the cart and go straight to Shopify
   * checkout with the real cart's checkoutUrl. */
  redirectTo?: string;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          {redirectTo ? (
            <input name="redirectTo" type="hidden" value={redirectTo} />
          ) : null}
          <button
            type="submit"
            onClick={() => {
              // This is the one place in the codebase that ever submits a
              // LinesAdd mutation, so this is the one place that can mark a
              // quantity increase as a genuine add — see analyticsIntent.ts
              // for why that distinction matters.
              for (const line of lines) {
                if (line.merchandiseId) {
                  markGenuineAddToCart(line.merchandiseId);
                }
              }
              onClick?.();
            }}
            // `||`, not `??` — every call site always passes an explicit
            // boolean `disabled` (never null/undefined), so `??` never
            // actually fell through to the fetcher-busy check. That left
            // the button clickable while its own LinesAdd submission was
            // still in flight: a fast double-click/double-tap re-fired
            // this onClick (re-marking the add and, on Buy Now,
            // duplicating the InitiateCheckout/begin_checkout calls below)
            // and could submit the mutation a second time, genuinely
            // adding the line twice — not just an analytics miscount.
            disabled={disabled || fetcher.state !== 'idle'}
            className={className}
          >
            {typeof children === 'function' ? children(fetcher) : children}
          </button>
        </>
      )}
    </CartForm>
  );
}
