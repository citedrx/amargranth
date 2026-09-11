import {Await, useLoaderData, Link} from 'react-router';
import ourStoryImg from '~/assets/illustration-our-story.png';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  HomepageProductItemFragment,
  RecentArticlesByCategoryQuery,
} from 'storefrontapi.generated';
import {MockShopNotice} from '~/components/MockShopNotice';
import {ArticleItem} from '~/components/ArticleItem';
import {ProductItem} from '~/components/ProductItem';
import {BLOG_CATEGORIES} from '~/lib/blogCategories';

const COMBO_SET_HANDLE = '12-jyotirlings-51-shaktipeeths-book-set-hardcover';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Amar Granth | Timeless Gifts of Indian Heritage'},
    {
      name: 'description',
      content:
        'Illustrated storybooks on the 12 Jyotirlings, 51 Shaktipeeths, Rivers of Bharat and more — bringing Indian mythology and heritage to young readers.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const {products} = await context.storefront.query(FEATURED_PRODUCTS_QUERY);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    products: products.nodes,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const articlesByCategory = context.storefront
    .query(RECENT_ARTICLES_BY_CATEGORY_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    articlesByCategory,
  };
}

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
      <FeaturedProducts products={data.products} />
      <FromTheBlog articlesByCategory={data.articlesByCategory} />
      <BrandStory />
      <EmailSignup />
    </div>
  );
}

function Hero({comboSet}: {comboSet?: HomepageProductItemFragment}) {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center gap-10 px-5 md:px-12 lg:px-16 pt-16 lg:pt-24 max-w-7xl mx-auto">
      <div className="flex-1">
        <p className="text-accent font-semibold text-body tracking-wide mb-3">
          Stories of Shiva, Shakti &amp; Indian Culture
        </p>
        <h1 className="text-display text-ink mb-4">
          Stories that carry heritage into your child&rsquo;s hands
        </h1>
        <p className="text-ink-soft text-body-lg mb-8 max-w-md">
          India&rsquo;s illustrated storybooks on the 12 Jyotirlings, 51
          Shaktipeeths, sacred rivers, and more — made for curious young
          minds.
        </p>
        <Link
          to="/collections/all"
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
            <div className="aspect-square flex items-center justify-center overflow-hidden">
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
          <div className="bg-tint-sage rounded-card aspect-square flex items-center justify-center">
            <span className="text-8xl" role="img" aria-label="storybook">
              📖
            </span>
          </div>
        )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <ProductItem
            key={product.id}
            product={product}
            index={i}
            loading={i < 4 ? 'eager' : undefined}
            badge={product.tags?.includes('bestseller') ? 'Bestseller' : undefined}
          />
        ))}
        <SeeAllCard />
      </div>
    </section>
  );
}

/**
 * Rounds the featured-products grid out to an even card count (this
 * catalog only has 7 real products — an odd count leaves a lone dangling
 * card in the last row of the mobile 2-column grid, with a large empty gap
 * beside it) while also giving mobile shoppers a clear next step after
 * browsing the featured set.
 */
function SeeAllCard() {
  return (
    <Link to="/collections/all" className="card flex flex-col">
      <div className="bg-tint-sand aspect-square flex items-center justify-center">
        <span className="text-4xl" role="img" aria-label="books">
          📚
        </span>
      </div>
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-center items-center text-center">
        <p className="text-ink font-semibold text-body mb-1">
          See all books
        </p>
        <p className="text-accent text-small font-semibold">
          Shop the full collection →
        </p>
      </div>
    </Link>
  );
}

function FromTheBlog({
  articlesByCategory,
}: {
  articlesByCategory: Promise<RecentArticlesByCategoryQuery | null>;
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
        <Await resolve={articlesByCategory}>
          {(response) => {
            if (!response) return null;
            return (
              <div className="flex flex-col gap-10">
                {BLOG_CATEGORIES.map((category) => {
                  const nodes = response[category.tag]?.articles?.nodes;
                  if (!nodes?.length) return null;
                  return (
                    <div key={category.tag}>
                      <div className="flex items-end justify-between mb-4">
                        <h3 className="text-ink">{category.label}</h3>
                        <Link
                          to={`/blogs/blog?tag=${category.tag}`}
                          className="text-accent hover:text-accent-hover font-semibold text-small whitespace-nowrap"
                        >
                          View all →
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {nodes.map((article, i) => (
                          <ArticleItem
                            key={article.id}
                            article={article}
                            index={i}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
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
      <div className="bg-tint-powder rounded-card aspect-[4/3] overflow-hidden order-2 md:order-1">
        <img
          src={ourStoryImg}
          alt="An open storybook with illustrated Hindu temple towers rising from its pages"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="order-1 md:order-2">
        <h2 className="text-ink mb-4">Our story</h2>
        <p className="text-ink-soft text-body-lg leading-relaxed mb-4">
          Amar Granth exists to preserve and pass on Hindu mythology and
          Indian heritage — bringing the stories of gods, temples, and
          traditions to children through beautifully illustrated books.
        </p>
        <p className="text-ink-soft leading-relaxed mb-4">
          For millions of parents raising children away from the temples,
          rivers, and stories they grew up with, passing on that heritage
          can feel like a puzzle with missing pieces. We wanted to make it
          easier — and more beautiful.
        </p>
        <p className="text-ink-soft leading-relaxed mb-5">
          Every Amar Granth title is illustrated, researched, and written to
          make ancient stories feel alive for the next generation — without
          losing what makes them sacred.
        </p>
        <Link
          to="/about"
          className="text-accent hover:text-accent-hover font-semibold text-body"
        >
          More about us →
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
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

const RECENT_ARTICLES_BY_CATEGORY_QUERY = `#graphql
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
  query RecentArticlesByCategory($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    jyotirlinga: blog(handle: "blog") {
      articles(first: 3, query: "tag:jyotirlinga", sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
    shaktipeeth: blog(handle: "blog") {
      articles(first: 3, query: "tag:shaktipeeth", sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
    rivers: blog(handle: "blog") {
      articles(first: 3, query: "tag:rivers", sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
    rishis: blog(handle: "blog") {
      articles(first: 3, query: "tag:rishis", sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
    temples: blog(handle: "blog") {
      articles(first: 3, query: "tag:temples", sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
    rudraksha: blog(handle: "blog") {
      articles(first: 3, query: "tag:rudraksha", sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...HomepageArticle
        }
      }
    }
  }
` as const;
