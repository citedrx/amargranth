import {Link, useLoaderData} from 'react-router';
import productFallbackImg from '~/assets/illustration-product-fallback.png';
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
import {ProductCardActions} from '~/components/ProductCardActions';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {siteConfig} from '~/lib/site-config';
import {breadcrumbJsonLd, canonicalLink, productJsonLd} from '~/lib/seo';
import {JsonLd} from '~/components/JsonLd';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title ?? ''} | Amar Granth`},
    {
      name: 'description',
      content: data?.product.seo.description ?? data?.product.description,
    },
    canonicalLink(`/products/${data?.product.handle}`),
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

  const promoEndDate = product.promoEndDate?.value;
  const promoActive = Boolean(
    promoEndDate && new Date(promoEndDate) >= new Date(),
  );

  return {
    product,
    relatedProducts: allProducts.nodes,
    promoActive,
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
 * Combo Set buyers already own the standalone titles listed in its bundle's
 * includesHandles — never recommend those as "related" alongside it. Driven
 * by siteConfig.bundles (DESIGN_SYSTEM.md Section 0.3's single source of
 * truth for this business rule), not tags or a list duplicated here.
 */
function getRelatedProducts(
  current: {id: string; handle: string},
  all: RelatedProductItemFragment[],
) {
  const ownedHandles = new Set(
    siteConfig.bundles
      .filter((b) => b.comboHandle === current.handle)
      .flatMap((b) => b.includesHandles),
  );

  return all
    .filter((p) => p.id !== current.id)
    .filter((p) => !ownedHandles.has(p.handle))
    .slice(0, 4);
}

/**
 * Combo/bundle upsell callout — only on a product listed in a bundle's
 * includesHandles (siteConfig.bundles), and only when the math genuinely
 * favors the combo (this product's price + the other included title's price
 * costs more than the Combo Set's real price). A different-format edition
 * not listed in includesHandles (e.g. the Hindi paperback, which isn't part
 * of the real bundle) simply never matches and the callout stays hidden.
 */
function getComboUpsell(
  current: {id: string; handle: string; price: number},
  all: RelatedProductItemFragment[],
) {
  const bundle = siteConfig.bundles.find((b) =>
    b.includesHandles.includes(current.handle),
  );
  if (!bundle) return null;

  const comboProduct = all.find((p) => p.handle === bundle.comboHandle);
  if (!comboProduct) return null;

  const counterparts = all.filter(
    (p) =>
      p.id !== current.id &&
      bundle.includesHandles.includes(p.handle),
  );
  if (counterparts.length === 0) return null;

  const comboPrice = Number(comboProduct.priceRange.minVariantPrice.amount);
  // A bundle could in principle include more than one other title — only
  // the pairing that genuinely saves money is worth surfacing.
  const bestSavings = Math.max(
    ...counterparts.map(
      (c) => current.price + Number(c.priceRange.minVariantPrice.amount) - comboPrice,
    ),
  );
  if (bestSavings <= 0) return null;

  return {
    comboProduct,
    savings: bestSavings,
    currencyCode: comboProduct.priceRange.minVariantPrice.currencyCode,
  };
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

function parseBullets(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((b) => typeof b === 'string') : [];
  } catch {
    return [];
  }
}

export default function Product() {
  const {product, relatedProducts, promoActive} = useLoaderData<typeof loader>();

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

  const {title, seo, handle} = product;
  const galleryImages = [
    selectedVariant?.image,
    ...product.images.nodes.filter((img) => img.id !== selectedVariant?.image?.id),
  ].filter((img): img is NonNullable<typeof img> => Boolean(img));

  const ctaRef = useRef<HTMLDivElement>(null);
  const showStickyBar = useScrolledPastEl(ctaRef);
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);

  const related = getRelatedProducts(
    {id: product.id, handle},
    relatedProducts,
  );
  const comboUpsell = getComboUpsell(
    {
      id: product.id,
      handle,
      price: Number(selectedVariant?.price?.amount ?? 0),
    },
    relatedProducts,
  );
  const bullets = parseBullets(product.whatsInsideBullets?.value);

  return (
    <div className="bg-base">
      <JsonLd
        data={productJsonLd({
          product,
          variant: selectedVariant,
          path: `/products/${handle}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', path: '/'},
          {name: 'All books', path: '/collections/all'},
          {name: title, path: `/products/${handle}`},
        ])}
      />
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
            {promoActive && product.promoLabel?.value ? (
              <div className="inline-flex items-center gap-2 bg-badge-sale text-white text-small font-semibold rounded-pill px-4 py-2 mb-4">
                🪔 {product.promoLabel.value}
                {product.promoDiscount?.value
                  ? ` — ${product.promoDiscount.value}`
                  : ''}
                {product.promoEndDate?.value
                  ? `, ends ${new Date(
                      product.promoEndDate.value,
                    ).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}`
                  : ''}
              </div>
            ) : null}

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
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                quantity={quantity}
              />
            </div>

            <ul className="flex flex-col gap-1.5 mt-5 text-small text-ink-soft">
              <li>🚚 {siteConfig.trust.shipping}</li>
              <li>↩ {siteConfig.trust.returns}</li>
            </ul>

            {comboUpsell ? (
              <Link
                to={`/products/${comboUpsell.comboProduct.handle}`}
                className="mt-6 flex items-center justify-between gap-3 rounded-card border-2 border-accent bg-tint-sand px-5 py-4 hover:bg-tint-powder transition-colors"
              >
                <span className="text-small text-ink">
                  Get both books in the{' '}
                  <span className="font-semibold">
                    {comboUpsell.comboProduct.title}
                  </span>{' '}
                  and save{' '}
                  <span className="font-semibold text-accent">
                    <Money
                      data={{
                        amount: String(comboUpsell.savings),
                        currencyCode: comboUpsell.currencyCode,
                      }}
                    />
                  </span>
                </span>
                <span className="text-accent font-semibold text-small shrink-0">
                  View set →
                </span>
              </Link>
            ) : null}

            {bullets.length > 0 ? (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-ink mb-3">What&rsquo;s inside</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-ink-soft text-body">
                  {bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
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
        className={`fixed bottom-0 inset-x-0 z-20 lg:hidden bg-base border-t border-border px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-4 transition-transform duration-200 ${
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
                    quantity,
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
              quantity,
            },
          ],
        }}
      />
    </div>
  );
}

function QuantitySelector({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="mb-4">
      <span className="block text-small font-semibold text-ink mb-2">
        Quantity
      </span>
      <div className="flex items-center border border-border rounded-pill w-fit">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className="w-11 h-11 flex items-center justify-center text-ink-soft hover:text-ink disabled:opacity-30 transition-colors"
        >
          <span>&#8722;</span>
        </button>
        <span className="text-body font-semibold text-ink w-8 text-center">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => onChange(quantity + 1)}
          className="w-11 h-11 flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
        >
          <span>&#43;</span>
        </button>
      </div>
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
          <img
            src={productFallbackImg}
            alt="Illustrated Hindu temple book cover artwork"
            className="w-full h-full object-cover"
          />
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
  const variantUrl = `/products/${product.handle}`;
  const variant = product.variants?.nodes?.[0];
  return (
    <div className="card">
      <Link to={variantUrl} className="block" prefetch="intent">
        <div
          className={`${TINT_CLASSES[index % TINT_CLASSES.length]} aspect-square flex items-center justify-center`}
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
            <img
              src={productFallbackImg}
              alt="Illustrated Hindu temple book cover artwork"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </Link>
      <div className="p-4 md:p-6">
        <Link to={variantUrl} prefetch="intent">
          <h3 className="text-ink mb-1 line-clamp-2 min-h-[2.6em]">
            {product.title}
          </h3>
        </Link>
        <Money
          data={product.priceRange.minVariantPrice}
          className="text-accent text-body font-semibold"
        />
        <ProductCardActions
          variantUrl={variantUrl}
          variantId={variant?.id}
          availableForSale={variant?.availableForSale}
        />
      </div>
    </div>
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
    promoLabel: metafield(namespace: "custom", key: "promo_label") {
      value
    }
    promoDiscount: metafield(namespace: "custom", key: "promo_discount") {
      value
    }
    promoEndDate: metafield(namespace: "custom", key: "promo_end_date") {
      value
    }
    whatsInsideBullets: metafield(namespace: "custom", key: "whats_inside_bullets") {
      value
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
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
