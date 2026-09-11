import {useLoaderData, Link} from 'react-router';
import collectionFallbackImg from '~/assets/illustration-collection-fallback.png';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {canonicalLink} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Shop by Collection | Amar Granth'},
    canonicalLink('/collections'),
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="bg-base px-5 md:px-12 lg:px-16 py-6 md:py-10 max-w-[1280px] mx-auto">
      <nav aria-label="Breadcrumb" className="text-small text-ink-soft mb-4">
        <Link to="/" className="hover:text-ink transition-colors">
          Home
        </Link>{' '}
        / <span className="text-ink">Collections</span>
      </nav>
      <h1 className="text-ink mb-8">Shop by collection</h1>
      <PaginatedResourceSection<CollectionFragment>
        connection={collections}
        resourcesClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
      >
        {({node: collection, index}) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

const TINT_CLASSES = [
  'bg-tint-sand',
  'bg-tint-powder',
  'bg-tint-sage',
  'bg-tint-blush',
];

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      className="card block text-center"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div
        className={`${TINT_CLASSES[index % TINT_CLASSES.length]} aspect-square flex items-center justify-center`}
      >
        {collection?.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={collectionFallbackImg}
            alt="Illustrated Hindu temple skyline by the river at dusk"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <p className="font-semibold text-small text-ink p-4 md:p-6">
        {collection.title}
      </p>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
