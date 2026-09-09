import type {Route} from './+types/collections.all';
import {Link, useLoaderData, useNavigate, useSearchParams} from 'react-router';
import type {ProductSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {ProductItem} from '~/components/ProductItem';

export const meta: Route.MetaFunction = () => {
  return [{title: 'All Books | Amar Granth'}];
};

const SORT_OPTIONS: Record<
  string,
  {sortKey: ProductSortKeys; reverse: boolean}
> = {
  featured: {sortKey: 'BEST_SELLING', reverse: false},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
  newest: {sortKey: 'CREATED_AT', reverse: true},
};

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const sort = SORT_OPTIONS[url.searchParams.get('sort') ?? 'featured']
    ? (url.searchParams.get('sort') ?? 'featured')
    : 'featured';
  const {sortKey, reverse} = SORT_OPTIONS[sort];

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {first: 24, sortKey, reverse},
    }),
  ]);
  return {products, sort};
}

export default function Collection() {
  const {products, sort} = useLoaderData<typeof loader>();
  const nodes = products.nodes;

  return (
    <div className="bg-base px-5 md:px-12 lg:px-16 py-6 md:py-10 max-w-[1280px] mx-auto">
      <nav aria-label="Breadcrumb" className="text-small text-ink-soft mb-4">
        <Link to="/" className="hover:text-ink transition-colors">
          Home
        </Link>{' '}
        / <span className="text-ink">All books</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <h1 className="text-ink">All books</h1>
        <SortControl currentSort={sort} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {nodes.map((product, index) => (
          <ProductItem
            key={product.id}
            product={product}
            index={index}
            loading={index < 8 ? 'eager' : undefined}
          />
        ))}
      </div>
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

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
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
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionItem
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

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...CollectionItem
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
