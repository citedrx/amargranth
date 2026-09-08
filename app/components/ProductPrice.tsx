import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div aria-label="Price" className="flex items-baseline gap-3" role="group">
      {compareAtPrice ? (
        <>
          {price ? (
            <Money
              as="span"
              data={price}
              className="text-2xl md:text-3xl font-semibold text-accent"
            />
          ) : null}
          <s>
            <Money
              as="span"
              data={compareAtPrice}
              className="text-base text-ink-soft"
            />
          </s>
        </>
      ) : price ? (
        <Money
          as="span"
          data={price}
          className="text-2xl md:text-3xl font-semibold text-accent"
        />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
