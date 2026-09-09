import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {AddToCartButton} from '~/components/AddToCartButton';

/**
 * "View details" + "Add to cart" footer required on every product card
 * (DESIGN_SYSTEM.md Section 5.2). Catalog is single-variant throughout, so
 * this adds the product's first variant directly with no picker.
 *
 * Stacked in a column rather than the doc's literal "side by side" —
 * deliberate deviation, since side-by-side squeezed both buttons/labels
 * at the narrow card widths this catalog's grid actually uses. A flex-col
 * container's children stretch to full width by default (align-items:
 * stretch), so both the Link and the AddToCartButton's inner button fill
 * the row on their own without needing flex-1 tricks.
 */
export function ProductCardActions({
  variantUrl,
  variantId,
  availableForSale,
}: {
  variantUrl: string;
  variantId?: string;
  availableForSale?: boolean;
}) {
  const {open} = useAside();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  return (
    <div className="flex flex-col gap-2 mt-3">
      <Link
        to={variantUrl}
        className="w-full flex items-center justify-center h-11 rounded-pill border border-border text-ink text-small font-semibold hover:border-accent hover:text-accent transition-colors"
      >
        View details
      </Link>
      <AddToCartButton
        disabled={!variantId || availableForSale === false}
        onClick={() => {
          setJustAdded(true);
          open('cart');
        }}
        lines={variantId ? [{merchandiseId: variantId, quantity: 1}] : []}
        className="w-full flex items-center justify-center h-11 rounded-pill bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-border disabled:text-ink-soft disabled:cursor-not-allowed text-white text-small font-semibold transition-colors"
      >
        {(fetcher) => {
          if (fetcher.state !== 'idle') return 'Adding…';
          if (justAdded) return 'Added ✓';
          return availableForSale === false ? 'Sold out' : 'Add to cart';
        }}
      </AddToCartButton>
    </div>
  );
}
