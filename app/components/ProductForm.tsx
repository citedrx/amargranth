import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {markCheckoutStarted} from '~/lib/exitBannerConfig';

export function ProductForm({
  productOptions,
  selectedVariant,
  quantity,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  quantity: number;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="flex flex-col gap-5">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name}>
            <h5 className="text-small font-semibold text-ink mb-2">
              {option.name}
            </h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const optionClassName = `rounded-pill border px-6 min-h-11 flex items-center text-small font-medium transition-colors ${
                  selected
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-white text-ink hover:border-accent'
                } ${available ? '' : 'opacity-40'}`;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className={optionClassName}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={optionClassName}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      <div className="flex flex-col gap-3">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
          className="w-full bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-border disabled:text-ink-soft disabled:cursor-not-allowed text-white font-semibold text-body h-[52px] rounded-pill transition-colors"
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          redirectTo="checkout"
          onClick={() => markCheckoutStarted()}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
          className="w-full bg-transparent border-2 border-accent hover:bg-tint-sage active:bg-tint-sand disabled:border-border disabled:text-ink-soft disabled:cursor-not-allowed text-accent font-semibold text-body h-[52px] rounded-pill transition-colors"
        >
          {(fetcher) =>
            fetcher.state !== 'idle' ? 'Redirecting to checkout…' : 'Buy now'
          }
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
