import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {useEffect, useRef, useState} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  Image,
  Money,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import type {
  ProductVariantFragment,
  RelatedProductItemFragment,
} from 'storefrontapi.generated';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? ''} | Amar Granth`},
    {
      name: 'description',
      content: data?.product.seo.description ?? data?.product.description,
    },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}, {products: allProducts}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(RELATED_PRODUCTS_QUERY),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    relatedProducts: allProducts.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}

/**
 * Combo Set buyers already own the standalone Jyotirlingas and Shaktipeeths
 * titles' content — never recommend those as "related" alongside it. Driven
 * entirely by real product tags (owns-jyotirlingas / owns-shaktipeeths on the
 * Combo Set, Jyotirlingas / Shaktipeeths on the standalone titles), not a
 * hardcoded product list.
 */
function getRelatedProducts(
  current: {id: string; tags: readonly string[]},
  all: RelatedProductItemFragment[],
) {
  const ownedCategories = current.tags
    .filter((t) => t.toLowerCase().startsWith('owns-'))
    .map((t) => t.toLowerCase().replace('owns-', ''));

  return all
    .filter((p) => p.id !== current.id)
    .filter(
      (p) => !p.tags?.some((t) => ownedCategories.includes(t.toLowerCase())),
    )
    .slice(0, 4);
}

function useScrolledPastEl(ref: React.RefObject<HTMLElement | null>) {
  const [scrolledPast, setScrolledPast] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      {rootMargin: '0px'},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return scrolledPast;
}

export default function Product() {
  const {product, relatedProducts} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, seo, tags} = product;
  const galleryImages = [
    selectedVariant?.image,
    ...product.images.nodes.filter((img) => img.id !== selectedVariant?.image?.id),
  ].filter((img): img is NonNullable<typeof img> => Boolean(img));

  const ctaRef = useRef<HTMLDivElement>(null);
  const showStickyBar = useScrolledPastEl(ctaRef);
  const {open} = useAside();

  const related = getRelatedProducts({id: product.id, tags}, relatedProducts);

  return (
    <div className="bg-base">
      <div className="px-5 md:px-12 lg:px-16 py-6 md:py-10 max-w-[1280px] mx-auto">
        <nav aria-label="Breadcrumb" className="text-small text-ink-soft mb-5">
          <Link to="/" className="hover:text-ink transition-colors">
            Home
          </Link>{' '}
          /{' '}
          <Link to="/collections/all" className="hover:text-ink transition-colors">
            All books
          </Link>{' '}
          / <span className="text-ink">{title}</span>
        </nav>

        <div className="grid lg:grid-cols-[58%_1fr] gap-8 lg:gap-12">
          <ProductGallery images={galleryImages} title={title} />

          <div>
            <h1 className="text-ink mb-2">{title}</h1>
            {seo.description ? (
              <p className="text-body-lg text-ink-soft mb-5">
                {seo.description}
              </p>
            ) : null}
            <div className="mb-6">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>

            <div ref={ctaRef}>
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
              />
            </div>

            <ul className="flex flex-col gap-1.5 mt-5 text-small text-ink-soft">
              <li>🚚 Free shipping across India · 24–48hr dispatch</li>
              <li>↩ Damaged on arrival? Email us within 24hrs for a replacement</li>
            </ul>

            {descriptionHtml ? (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-ink mb-3">What&rsquo;s inside</h2>
                <div
                  className="text-ink-soft text-body leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p]:mb-3 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </div>
            ) : null}

            <details className="mt-6 pt-6 border-t border-border group">
              <summary className="cursor-pointer text-h3 text-ink list-none flex items-center justify-between">
                Shipping &amp; returns
                <span className="text-ink-soft group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="text-body text-ink-soft mt-3 space-y-2">
                <p>
                  Free shipping across India, with 24–48hr dispatch on every
                  order.
                </p>
                <p>
                  If your book arrives damaged, email{' '}
                  <a
                    href="mailto:contact@amarshivmedia.com"
                    className="text-accent hover:text-accent-hover underline"
                  >
                    contact@amarshivmedia.com
                  </a>{' '}
                  within 24 hours and we&rsquo;ll sort out a replacement.
                </p>
              </div>
            </details>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-16 md:mt-20 pt-10 border-t border-border">
            <h2 className="text-ink mb-6">You might also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {related.map((p, index) => (
                <RelatedProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Sticky mobile add-to-cart bar, once the primary CTA scrolls out of view */}
      <div
        className={`fixed bottom-0 inset-x-0 z-20 lg:hidden bg-base border-t border-border px-5 py-3 flex items-center justify-between gap-4 transition-transform duration-200 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
          size="small"
        />
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
          className="shrink-0 bg-accent hover:bg-accent-hover active:bg-accent-active disabled:bg-border disabled:text-ink-soft disabled:cursor-not-allowed text-white font-semibold text-small px-6 h-11 rounded-pill transition-colors"
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function ProductGallery({
  images,
  title,
}: {
  images: NonNullable<ProductVariantFragment['image']>[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <div className="bg-tint-sand rounded-card aspect-square flex items-center justify-center overflow-hidden">
        {active ? (
          <Image
            alt={active.altText || title}
            aspectRatio="1/1"
            data={active}
            key={active.id}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl opacity-60" role="img" aria-label="book">
            📖
          </span>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3 mt-4">
          {images.slice(0, 4).map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${title}`}
              aria-pressed={index === activeIndex}
              className={`w-16 h-16 rounded-[0.5rem] overflow-hidden bg-tint-sand shrink-0 ring-2 transition-colors ${
                index === activeIndex ? 'ring-accent' : 'ring-transparent'
              }`}
            >
              <Image
                alt={img.altText || `${title} thumbnail ${index + 1}`}
                aspectRatio="1/1"
                data={img}
                sizes="64px"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const TINT_CLASSES = ['bg-tint-sand', 'bg-tint-powder', 'bg-tint-sage', 'bg-tint-blush'];

function RelatedProductCard({
  product,
  index,
}: {
  product: RelatedProductItemFragment;
  index: number;
}) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className="card block p-4 md:p-6"
      prefetch="intent"
    >
      <div
        className={`${TINT_CLASSES[index % TINT_CLASSES.length]} rounded-[0.625rem] aspect-square mb-3 overflow-hidden flex items-center justify-center`}
      >
        {product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl opacity-60" role="img" aria-label="book">
            📗
          </span>
        )}
      </div>
      <h3 className="text-ink mb-1 line-clamp-2">{product.title}</h3>
      <Money
        data={product.priceRange.minVariantPrice}
        className="text-accent text-body font-semibold"
      />
    </Link>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    tags
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 6) {
      nodes {
        __typename
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RELATED_PRODUCTS_QUERY = `#graphql
  fragment RelatedProductItem on Product {
    id
    title
    handle
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query RelatedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 20) {
      nodes {
        ...RelatedProductItem
      }
    }
  }
` as const;
