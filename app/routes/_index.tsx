import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  RecommendedProductsQuery,
  FeaturedCollectionFragment,
} from 'storefrontapi.generated';
import {MockShopNotice} from '~/components/MockShopNotice';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Amar Granth | Timeless Gifts of Indian Heritage'},
    {
      name: 'description',
      content:
        'Illustrated storybooks on the 12 Jyotirlingas, 51 Shaktipeeths, Rivers of Bharat and more — bringing Indian mythology and heritage to young readers.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTIONS_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    collections: collections.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

const MOTIF_ICONS = ['🪔', '🪷', '🪶'];

const TINT_CLASSES = [
  'bg-tint-sand',
  'bg-tint-powder',
  'bg-tint-sage',
  'bg-tint-blush',
];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-base">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero />
      <MotifDivider />
      <ShopByCollection collections={data.collections} />
      <BestsellerSpotlight products={data.recommendedProducts} />
      <BrandStory />
      <Reviews />
      <SignupBar />
    </div>
  );
}

function Hero() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center gap-10 px-6 md:px-16 py-14 md:py-20 max-w-7xl mx-auto">
      <div className="flex-1">
        <p className="text-accent font-semibold text-sm tracking-wide mb-3">
          Timeless Gifts from Amar Granth
        </p>
        <h1 className="font-display text-3xl md:text-5xl leading-tight text-ink mb-5">
          Stories that carry heritage into your child&rsquo;s hands
        </h1>
        <p className="text-ink-soft text-base md:text-lg mb-8 max-w-md">
          Illustrated books on the 12 Jyotirlingas, 51 Shaktipeeths, sacred
          rivers, and more — made for curious young minds.
        </p>
        <Link
          to="/collections"
          className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold text-sm px-7 py-3 rounded-pill transition-colors"
        >
          Shop the collection
        </Link>
      </div>
      <div className="flex-1 w-full">
        <div className="bg-tint-sage rounded-card aspect-[4/3] flex items-center justify-center">
          <span className="text-7xl" role="img" aria-label="storybook">
            📖
          </span>
        </div>
      </div>
    </section>
  );
}

function MotifDivider() {
  return (
    <div className="flex items-center justify-center gap-6 py-3">
      {MOTIF_ICONS.map((icon, i) => (
        <span key={i} className="text-amber text-lg opacity-80">
          {icon}
        </span>
      ))}
    </div>
  );
}

function ShopByCollection({
  collections,
}: {
  collections: FeaturedCollectionFragment[];
}) {
  if (!collections?.length) return null;
  return (
    <section className="px-6 md:px-16 py-10 md:py-14 max-w-7xl mx-auto">
      <h2 className="font-display text-xl md:text-2xl text-ink mb-6">
        Shop by collection
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
        {collections.map((collection, i) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="group text-center"
          >
            <div
              className={`${TINT_CLASSES[i % TINT_CLASSES.length]} rounded-card aspect-square mb-3 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02]`}
            >
              {collection.image ? (
                <Image
                  data={collection.image}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl opacity-60">🕉️</span>
              )}
            </div>
            <p className="font-semibold text-sm text-ink">
              {collection.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BestsellerSpotlight({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="px-6 md:px-16 py-10 md:py-14 max-w-7xl mx-auto">
      <h2 className="font-display text-xl md:text-2xl text-ink mb-6">
        Loved by families across India
      </h2>
      <Suspense
        fallback={<div className="text-ink-soft text-sm">Loading…</div>}
      >
        <Await resolve={products}>
          {(response) => (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {response?.products.nodes.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.handle}`}
                  className="group"
                >
                  <div className="bg-tint-sand rounded-card aspect-square mb-3 overflow-hidden flex items-center justify-center">
                    {product.featuredImage ? (
                      <Image
                        data={product.featuredImage}
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <span className="text-4xl opacity-60">📗</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-ink mb-1 line-clamp-2">
                    {product.title}
                  </p>
                  <Money
                    data={product.priceRange.minVariantPrice}
                    className="text-accent text-sm font-semibold"
                  />
                </Link>
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="px-6 md:px-16 py-14 md:py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
      <div className="bg-tint-powder rounded-card aspect-[4/3] flex items-center justify-center order-2 md:order-1">
        <span className="text-6xl" role="img" aria-label="lotus">
          🪷
        </span>
      </div>
      <div className="order-1 md:order-2">
        <h2 className="font-display text-xl md:text-2xl text-ink mb-4">
          Our story
        </h2>
        <p className="text-ink-soft leading-relaxed">
          Amar Granth was born from a simple idea: that Indian mythology and
          heritage deserve the same beautiful, thoughtful storytelling that
          children find in any great picture book. Every title is
          illustrated, researched, and written to make ancient stories feel
          alive for the next generation — without losing what makes them
          sacred.
        </p>
      </div>
    </section>
  );
}

function Reviews() {
  const quotes = [
    {
      text: '"My kids ask for this book every night. The illustrations are stunning."',
      by: 'Priya, Mumbai',
    },
    {
      text: '"Finally, a way to teach my daughter about our culture that she actually loves."',
      by: 'Rohan, Bengaluru',
    },
    {
      text: '"Beautifully made and printed. Worth every rupee."',
      by: 'Anjali, Delhi',
    },
  ];
  return (
    <section className="px-6 md:px-16 py-10 md:py-14 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-card p-6"
          >
            <p className="text-ink text-sm leading-relaxed mb-3">{q.text}</p>
            <p className="text-ink-soft text-xs font-semibold">— {q.by}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignupBar() {
  return (
    <section className="bg-tint-sand">
      <div className="px-6 md:px-16 py-10 md:py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h2 className="font-display text-lg md:text-xl text-ink mb-1">
            Join our storytelling circle
          </h2>
          <p className="text-ink-soft text-sm">
            New titles, offers, and heritage stories — straight to your
            inbox.
          </p>
        </div>
        <form className="flex w-full md:w-auto gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            className="flex-1 md:w-64 px-4 py-2.5 rounded-pill border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white font-semibold text-sm px-6 py-2.5 rounded-pill transition-colors whitespace-nowrap"
          >
            Sign up
          </button>
        </form>
      </div>
    </section>
  );
}

const FEATURED_COLLECTIONS_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
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
  query FeaturedCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
