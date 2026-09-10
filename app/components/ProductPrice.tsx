import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'large',
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  size?: 'large' | 'small';
}) {
  const isDiscounted = Boolean(
    compareAtPrice && price && compareAtPrice.amount !== price.amount,
  );
  const priceColor = isDiscounted ? 'text-badge-sale' : 'text-accent';
  const priceClassName =
    size === 'large'
      ? `text-h2 font-semibold ${priceColor}`
      : `text-body font-semibold ${priceColor}`;
  const compareClassName = size === 'large' ? 'text-body' : 'text-small';

  return (
    <div aria-label="Price" className="flex items-baseline gap-3" role="group">
      {compareAtPrice ? (
        <>
          {price ? (
            <Money as="span" data={price} className={priceClassName} />
          ) : null}
          <s>
            <Money
              as="span"
              data={compareAtPrice}
              className={`${compareClassName} text-ink-soft`}
            />
          </s>
        </>
      ) : price ? (
        <Money as="span" data={price} className={priceClassName} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
