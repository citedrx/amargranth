import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {
  HomepageProductItemFragment,
  RecentArticlesQuery,
} from 'storefrontapi.generated';
import {MockShopNotice} from '~/components/MockShopNotice';
import {ProductItem} from '~/components/ProductItem';
import {ArticleItem} from '~/components/ArticleItem';

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
  const [{products}] = await Promise.all([
    context.storefront.query(CATALOG_PRODUCTS_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
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

const MOTIF_ICONS = ['🪔', '🪷', '🪶'];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-base">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero />
      <MotifDivider />
      <OurBooks products={data.products} />
      <FromTheBlog articles={data.recentArticles} />
      <MissionAndVision />
    </div>
  );
}

function Hero() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center gap-10 px-6 md:px-16 py-16 md:py-24 max-w-7xl mx-auto">
      <div className="flex-1">
        <p className="text-accent font-semibold text-base tracking-wide mb-3">
          Stories of Shiva, Shakti &amp; Indian Culture
        </p>
        <h1 className="font-display text-4xl md:text-6xl leading-tight text-ink mb-6">
          Stories that carry heritage into your child&rsquo;s hands
        </h1>
        <p className="text-ink-soft text-lg md:text-xl mb-9 max-w-md">
          India&rsquo;s illustrated storybooks on the 12 Jyotirlingas, 51
          Shaktipeeths, sacred rivers, and more — made for curious young
          minds.
        </p>
        <Link
          to="/collections"
          className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold text-base px-8 py-3.5 rounded-pill transition-colors"
        >
          Shop the collection
        </Link>
      </div>
      <div className="flex-1 w-full">
        <div className="bg-tint-sage rounded-card aspect-[4/3] flex items-center justify-center">
          <span className="text-8xl" role="img" aria-label="storybook">
            📖
          </span>
        </div>
      </div>
    </section>
  );
}

function MotifDivider() {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {MOTIF_ICONS.map((icon, i) => (
        <span key={i} className="text-amber text-2xl opacity-80">
          {icon}
        </span>
      ))}
    </div>
  );
}

function OurBooks({products}: {products: HomepageProductItemFragment[]}) {
  if (!products?.length) return null;
  return (
    <section className="px-6 md:px-16 py-12 md:py-16 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-2xl md:text-4xl text-ink">
          Our Books
        </h2>
        <Link
          to="/collections/all"
          className="text-accent hover:text-accent-hover font-semibold text-sm md:text-base whitespace-nowrap"
        >
          Shop all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
        {products.map((product, i) => (
          <ProductItem
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

function FromTheBlog({
  articles,
}: {
  articles: Promise<RecentArticlesQuery | null>;
}) {
  return (
    <section className="px-6 md:px-16 py-12 md:py-16 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-2xl md:text-4xl text-ink">
          From the Blog
        </h2>
        <Link
          to="/blogs/blog"
          className="text-accent hover:text-accent-hover font-semibold text-sm md:text-base whitespace-nowrap"
        >
          Read more stories →
        </Link>
      </div>
      <Suspense
        fallback={<div className="text-ink-soft text-base">Loading…</div>}
      >
        <Await resolve={articles}>
          {(response) => {
            const nodes = response?.blog?.articles?.nodes;
            if (!nodes?.length) return null;
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
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

function MissionAndVision() {
  return (
    <section className="bg-tint-sand">
      <div className="px-6 md:px-16 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <p className="text-accent font-semibold text-base tracking-wide mb-3">
          The Amar Granth Mission
        </p>
        <h2 className="font-display text-2xl md:text-4xl text-ink mb-8">
          Heritage, told with heart
        </h2>
        <div className="grid md:grid-cols-2 gap-10 text-left">
          <div>
            <h3 className="font-display text-xl text-ink mb-3">
              Our mission
            </h3>
            <p className="text-ink-soft text-lg leading-relaxed">
              Amar Granth exists to preserve and pass on Hindu mythology
              and Indian heritage — the stories of gods and goddesses,
              their adventures, and what they still have to teach us
              today. Every temple carries its own story and spiritual
              significance; every region of India, its own traditions.
              We bring these stories to children through beautifully
              illustrated books, so heritage feels alive, not distant.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink mb-3">
              Our vision
            </h3>
            <p className="text-ink-soft text-lg leading-relaxed">
              A future where every Indian child grows up knowing the
              stories of their gods, their temples, and their land — not
              as distant history, but as living heritage they carry with
              pride, wherever in the world they call home.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const CATALOG_PRODUCTS_QUERY = `#graphql
  fragment HomepageProductItem on Product {
    id
    title
    handle
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
  }
  query CatalogProducts($country: CountryCode, $language: LanguageCode)
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
