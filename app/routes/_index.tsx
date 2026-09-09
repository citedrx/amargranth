import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  HomepageProductItemFragment,
  RecentArticlesQuery,
} from 'storefrontapi.generated';
import {MockShopNotice} from '~/components/MockShopNotice';
import {ArticleItem} from '~/components/ArticleItem';

const COMBO_SET_HANDLE = '12-jyotirlings-51-shaktipeeths-book-set-hardcover';

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
  const [{collections}, {products}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTIONS_QUERY),
    context.storefront.query(FEATURED_PRODUCTS_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    collections: collections.nodes,
    products: products.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recentArticles = context.storefront
    .query(RECENT_ARTICLES_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recentArticles,
  };
}

const TINT_CLASSES = [
  'bg-tint-sand',
  'bg-tint-powder',
  'bg-tint-sage',
  'bg-tint-blush',
];

/** Uniform vertical rhythm between homepage sections (see DESIGN_SYSTEM.md
 * Section 6): 48px mobile, 64px tablet, 96px desktop — applied as top
 * margin so adjacent sections don't double up. */
const SECTION_GAP = 'mt-12 md:mt-16 lg:mt-24';

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const comboSet = data.products.find((p) => p.handle === COMBO_SET_HANDLE);
  return (
    <div className="bg-base">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero comboSet={comboSet} />
      <ShopByCollection collections={data.collections} />
      <FeaturedProducts products={data.products} />
      <FromTheBlog articles={data.recentArticles} />
      <BrandStory />
      <EmailSignup />
    </div>
  );
}

function Hero({comboSet}: {comboSet?: HomepageProductItemFragment}) {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center gap-10 px-5 md:px-12 lg:px-16 py-16 lg:py-24 max-w-7xl mx-auto">
      <div className="flex-1">
        <p className="text-accent font-semibold text-small tracking-wide mb-3">
          Stories of Shiva, Shakti &amp; Indian Culture
        </p>
        <h1 className="text-display text-ink mb-4">
          Stories that carry heritage into your child&rsquo;s hands
        </h1>
        <p className="text-ink-soft text-body-lg mb-8 max-w-md">
          India&rsquo;s illustrated storybooks on the 12 Jyotirlingas, 51
          Shaktipeeths, sacred rivers, and more — made for curious young
          minds.
        </p>
        <Link
          to="/collections"
          className="inline-block bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-body px-8 py-3.5 rounded-pill transition-colors"
        >
          Shop the collection
        </Link>
      </div>
      <div className="flex-1 w-full">
        {comboSet ? (
          <Link
            to={`/products/${comboSet.handle}`}
            className="group block bg-tint-sage rounded-card overflow-hidden"
          >
            <div className="aspect-[4/3] flex items-center justify-center overflow-hidden">
              {comboSet.featuredImage ? (
                <Image
                  data={comboSet.featuredImage}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <span className="text-8xl" role="img" aria-label="storybook">
                  📖
                </span>
              )}
            </div>
            <div className="px-5 py-4 bg-white/70 flex items-center justify-between gap-3">
              <div>
                <p className="text-accent font-semibold text-small mb-0.5">
                  The Combo Set
                </p>
                <p className="text-ink font-semibold text-body line-clamp-1">
                  {comboSet.title}
                </p>
              </div>
              <Money
                data={comboSet.priceRange.minVariantPrice}
                className="text-accent font-extrabold text-h3 whitespace-nowrap"
              />
            </div>
          </Link>
        ) : (
          <div className="bg-tint-sage rounded-card aspect-[4/3] flex items-center justify-center">
            <span className="text-8xl" role="img" aria-label="storybook">
              📖
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function ShopByCollection({
  collections,
}: {
  collections: FeaturedCollectionFragment[];
}) {
  if (!collections?.length) return null;
  return (
    <section className={`px-5 md:px-12 lg:px-16 ${SECTION_GAP} max-w-7xl mx-auto`}>
      <h2 className="text-ink mb-6">Shop by collection</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {collections.slice(0, 6).map((collection, i) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="card block text-center p-4 md:p-6"
          >
            <div
              className={`${TINT_CLASSES[i % TINT_CLASSES.length]} rounded-[0.625rem] aspect-square mb-3 overflow-hidden flex items-center justify-center`}
            >
              {collection.image ? (
                <Image
                  data={collection.image}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl opacity-60">🕉️</span>
              )}
            </div>
            <p className="font-semibold text-body text-ink">
              {collection.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts({
  products,
}: {
  products: HomepageProductItemFragment[];
}) {
  if (!products?.length) return null;
  return (
    <section className={`px-5 md:px-12 lg:px-16 ${SECTION_GAP} max-w-7xl mx-auto`}>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-ink">Loved by families across India</h2>
        <Link
          to="/collections/all"
          className="text-accent hover:text-accent-hover font-semibold text-small whitespace-nowrap"
        >
          Shop all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.slice(0, 8).map((product, i) => (
          <FeaturedProductCard
            key={product.id}
            product={product}
            index={i}
            loading={i < 4 ? 'eager' : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function FeaturedProductCard({
  product,
  index,
  loading,
}: {
  product: HomepageProductItemFragment;
  index: number;
  loading?: 'eager' | 'lazy';
}) {
  const isBestseller = product.tags?.includes('bestseller');
  return (
    <Link to={`/products/${product.handle}`} className="card block p-4 md:p-6">
      <div
        className={`relative ${TINT_CLASSES[index % TINT_CLASSES.length]} rounded-[0.625rem] aspect-square mb-3 overflow-hidden flex items-center justify-center`}
      >
        {isBestseller && (
          <span className="absolute top-3 left-3 bg-accent text-white text-micro font-semibold uppercase tracking-wide px-2 py-1 rounded-pill">
            Bestseller
          </span>
        )}
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            sizes="(min-width: 768px) 25vw, 50vw"
            loading={loading}
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

function FromTheBlog({
  articles,
}: {
  articles: Promise<RecentArticlesQuery | null>;
}) {
  return (
    <section className={`px-5 md:px-12 lg:px-16 ${SECTION_GAP} max-w-7xl mx-auto`}>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-ink">From the Blog</h2>
        <Link
          to="/blogs/blog"
          className="text-accent hover:text-accent-hover font-semibold text-small whitespace-nowrap"
        >
          Read more stories →
        </Link>
      </div>
      <Suspense
        fallback={<div className="text-ink-soft text-body">Loading…</div>}
      >
        <Await resolve={articles}>
          {(response) => {
            const nodes = response?.blog?.articles?.nodes;
            if (!nodes?.length) return null;
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {nodes.map((article, i) => (
                  <ArticleItem
                    key={article.id}
                    article={article}
                    index={i}
                    loading={i < 3 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

function BrandStory() {
  return (
    <section
      className={`px-5 md:px-12 lg:px-16 ${SECTION_GAP} max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center`}
    >
      <div className="bg-tint-powder rounded-card aspect-[4/3] flex items-center justify-center order-2 md:order-1">
        <span className="text-6xl" role="img" aria-label="lotus">
          🪷
        </span>
      </div>
      <div className="order-1 md:order-2">
        <h2 className="text-ink mb-4">Our story</h2>
        <p className="text-ink-soft text-body-lg leading-relaxed mb-5">
          Amar Granth exists to preserve and pass on Hindu mythology and
          Indian heritage — bringing the stories of gods, temples, and
          traditions to children through beautifully illustrated books.
        </p>
        <Link
          to="/about"
          className="text-accent hover:text-accent-hover font-semibold text-body"
        >
          Read our full story →
        </Link>
      </div>
    </section>
  );
}

function EmailSignup() {
  return (
    <section className={`bg-tint-sand ${SECTION_GAP}`}>
      <div className="px-5 md:px-12 lg:px-16 py-8 lg:py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h2 className="text-ink mb-1">Join our storytelling circle</h2>
          <p className="text-ink-soft text-body">
            New titles and heritage stories — straight to your inbox.
          </p>
        </div>
        <form className="flex w-full md:w-auto gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            className="flex-1 md:w-64 px-4 py-3 rounded-pill border border-border bg-white text-body focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-body px-6 py-3 rounded-pill transition-colors whitespace-nowrap"
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
    collections(first: 6, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const FEATURED_PRODUCTS_QUERY = `#graphql
  fragment HomepageProductItem on Product {
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
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query FeaturedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: TITLE) {
      nodes {
        ...HomepageProductItem
      }
    }
  }
` as const;

const RECENT_ARTICLES_QUERY = `#graphql
  fragment HomepageArticle on Article {
    id
    handle
    title
    publishedAt
    image {
      id
      altText
      url
      width
      height
    }
    blog {
      handle
    }
  }
  query RecentArticles($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    blog(handle: "blog") {
      articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
  }
` as const;
