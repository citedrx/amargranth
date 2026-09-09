import {redirect, Link, useLoaderData, useNavigate, useSearchParams} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics} from '@shopify/hydrogen';
import type {
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.collection.title ?? ''} | Amar Granth`}];
};

const SORT_OPTIONS: Record<
  string,
  {sortKey: ProductCollectionSortKeys; reverse: boolean}
> = {
  featured: {sortKey: 'COLLECTION_DEFAULT', reverse: false},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
  newest: {sortKey: 'CREATED', reverse: true},
};

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const sort = SORT_OPTIONS[url.searchParams.get('sort') ?? 'featured']
    ? (url.searchParams.get('sort') ?? 'featured')
    : 'featured';
  const {sortKey, reverse} = SORT_OPTIONS[sort];

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, first: 24, sortKey, reverse},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection, sort};
}

export default function Collection() {
  const {collection, sort} = useLoaderData<typeof loader>();
  const products = collection.products.nodes;

  return (
    <div className="bg-base px-5 md:px-12 lg:px-16 py-6 md:py-10 max-w-[1280px] mx-auto">
      <nav aria-label="Breadcrumb" className="text-small text-ink-soft mb-4">
        <Link to="/" className="hover:text-ink transition-colors">
          Home
        </Link>{' '}
        /{' '}
        <Link to="/collections" className="hover:text-ink transition-colors">
          Collections
        </Link>{' '}
        / <span className="text-ink">{collection.title}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-ink mb-1">{collection.title}</h1>
          {collection.description ? (
            <p className="text-ink-soft text-body max-w-2xl">
              {collection.description}
            </p>
          ) : null}
        </div>
        {products.length >= 4 ? <SortControl currentSort={sort} /> : null}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
              loading={index < 8 ? 'eager' : undefined}
            />
          ))}
        </div>
      ) : (
        <p className="text-ink-soft text-body">
          No books in this collection yet.
        </p>
      )}

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function SortControl({currentSort}: {currentSort: string}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <label className="text-small text-ink-soft flex items-center gap-2">
      Sort by
      <select
        value={currentSort}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          params.set('sort', e.target.value);
          void navigate(`?${params.toString()}`, {preventScrollReset: true});
        }}
        className="rounded-pill border border-border bg-white px-4 py-2 text-small text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </label>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          ...ProductItem
        }
      }
    }
  }
` as const;
