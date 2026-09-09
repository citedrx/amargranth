import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  HomepageProductItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

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
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | HomepageProductItemFragment;
  loading?: 'eager' | 'lazy';
  index?: number;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="card block p-4 md:p-6"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div
        className={`${TINT_CLASSES[index % TINT_CLASSES.length]} rounded-[0.625rem] aspect-square mb-3 overflow-hidden flex items-center justify-center`}
      >
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
      <h3 className="text-ink mb-1 line-clamp-2">{product.title}</h3>
      <div className="flex items-baseline gap-2">
        <Money
          data={product.priceRange.minVariantPrice}
          className="text-accent text-body font-medium"
        />
        {product.compareAtPriceRange &&
        Number(product.compareAtPriceRange.minVariantPrice.amount) >
          Number(product.priceRange.minVariantPrice.amount) ? (
          <s>
            <Money
              data={product.compareAtPriceRange.minVariantPrice}
              className="text-ink-soft text-small"
            />
          </s>
        ) : null}
      </div>
    </Link>
  );
}
