import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  HomepageProductItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {ProductCardActions} from '~/components/ProductCardActions';

const TINT_CLASSES = [
  'bg-tint-sand',
  'bg-tint-powder',
  'bg-tint-sage',
  'bg-tint-blush',
];

export function ProductItem({
  product,
  loading,
  index = 0,
  badge,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | HomepageProductItemFragment;
  loading?: 'eager' | 'lazy';
  index?: number;
  /** Status micro-badge (e.g. "Bestseller") — always --color-badge-status,
   * never the accent color, per DESIGN_SYSTEM.md Section 5.3. */
  badge?: string;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const variant = product.variants?.nodes?.[0];
  return (
    <div className="card" key={product.id}>
      <Link prefetch="intent" to={variantUrl} className="block">
        <div
          className={`relative ${TINT_CLASSES[index % TINT_CLASSES.length]} aspect-square flex items-center justify-center`}
        >
          {badge ? (
            <span className="absolute top-3 left-3 bg-badge-status text-white text-micro font-semibold uppercase tracking-wide px-2 py-1 rounded-pill">
              {badge}
            </span>
          ) : null}
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl opacity-60" role="img" aria-label="book">
              📗
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 md:p-6">
        <Link prefetch="intent" to={variantUrl}>
          <h3 className="text-ink mb-1 line-clamp-2 min-h-[2.6em]">
            {product.title}
          </h3>
        </Link>
        {(() => {
          const isDiscounted =
            product.compareAtPriceRange &&
            Number(product.compareAtPriceRange.minVariantPrice.amount) >
              Number(product.priceRange.minVariantPrice.amount);
          return (
            <div className="flex items-baseline gap-2">
              <Money
                data={product.priceRange.minVariantPrice}
                className={`text-body font-medium ${isDiscounted ? 'text-badge-sale' : 'text-accent'}`}
              />
              {isDiscounted ? (
                <s>
                  <Money
                    data={product.compareAtPriceRange!.minVariantPrice}
                    className="text-ink-soft text-small"
                  />
                </s>
              ) : null}
            </div>
          );
        })()}
        <ProductCardActions
          variantUrl={variantUrl}
          variantId={variant?.id}
          availableForSale={variant?.availableForSale}
        />
      </div>
    </div>
  );
}
