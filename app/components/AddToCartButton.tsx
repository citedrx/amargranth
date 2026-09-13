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
            disabled={disabled ?? fetcher.state !== 'idle'}
            className={className}
          >
            {typeof children === 'function' ? children(fetcher) : children}
          </button>
        </>
      )}
    </CartForm>
  );
}
