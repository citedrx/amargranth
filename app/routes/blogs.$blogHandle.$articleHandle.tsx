import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image, Money} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  BLOG_CATEGORIES,
  categoryLabelForTags,
  productHandleForTags,
} from '~/lib/blogCategories';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.article.title ?? ''} | Amar Granth`},
    {name: 'description', content: data?.article.seo?.description},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;
  const {storefront} = context;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;
  const tags = article.tags ?? [];
  const matchedCategory = BLOG_CATEGORIES.find((c) =>
    tags.map((t) => t.toLowerCase()).includes(c.tag),
  );
  const crossLinkHandle = productHandleForTags(tags);

  const [relatedResult, crossLinkResult] = await Promise.all([
    matchedCategory
      ? storefront.query(RELATED_ARTICLES_QUERY, {
          variables: {
            blogHandle,
            query: `tag:${matchedCategory.tag}`,
            first: 4,
          },
        })
      : Promise.resolve(null),
    crossLinkHandle
      ? storefront.query(CROSS_LINK_PRODUCT_QUERY, {
          variables: {handle: crossLinkHandle},
        })
      : Promise.resolve(null),
  ]);

  const relatedArticles = (relatedResult?.blog?.articles.nodes ?? [])
    .filter((a) => a.handle !== articleHandle)
    .slice(0, 3);

  return {
    article,
    blogHandle,
    relatedArticles,
    crossLinkProduct: crossLinkResult?.product ?? null,
  };
}

export default function Article() {
  const {article, blogHandle, relatedArticles, crossLinkProduct} =
    useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  const categoryLabel = categoryLabelForTags(article.tags ?? []);

  return (
    <div className="bg-base">
      {image ? (
        <div className="bg-tint-sand aspect-video max-w-[1280px] mx-auto overflow-hidden md:rounded-card md:mt-6">
          <Image data={image} aspectRatio="16/9" sizes="100vw" loading="eager" className="w-full h-full object-cover" />
        </div>
      ) : null}

      <div className="px-5 md:px-12 lg:px-16 py-6 md:py-8 max-w-[640px] mx-auto">
        <Link
          to={`/blogs/${blogHandle}`}
          className="text-small text-ink-soft hover:text-ink transition-colors"
        >
          ← Back to stories
        </Link>

        <div className="mt-4 mb-6">
          {categoryLabel ? (
            <span className="inline-block bg-tint-sand text-ink text-micro font-semibold uppercase tracking-wide px-2 py-1 rounded-pill mb-3">
              {categoryLabel}
            </span>
          ) : null}
          <h1 className="text-ink mb-2">{title}</h1>
          <p className="text-ink-soft text-small">
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {author?.name ? <> &middot; {author.name}</> : null}
          </p>
        </div>

        <div
          dangerouslySetInnerHTML={{__html: contentHtml}}
          className="text-ink text-body-lg leading-relaxed [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1 [&_a]:text-accent [&_a]:underline [&_img]:rounded-card [&_img]:my-6"
        />

        {crossLinkProduct ? (
          <Link
            to={`/products/${crossLinkProduct.handle}`}
            className="group mt-10 flex items-center gap-4 bg-tint-sand rounded-card p-4 hover:scale-[1.01] transition-transform"
          >
            {crossLinkProduct.featuredImage ? (
              <div className="w-16 h-16 rounded-[0.5rem] overflow-hidden shrink-0 bg-white">
                <Image
                  data={crossLinkProduct.featuredImage}
                  aspectRatio="1/1"
                  sizes="64px"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-micro text-ink-soft uppercase tracking-wide mb-1">
                Related book
              </p>
              <p className="text-h3 text-ink mb-1 line-clamp-1">
                {crossLinkProduct.title}
              </p>
              <Money
                data={crossLinkProduct.priceRange.minVariantPrice}
                className="text-accent text-body font-semibold"
              />
            </div>
            <span className="shrink-0 bg-accent group-hover:bg-accent-hover group-active:bg-accent-active text-white font-semibold text-small px-5 h-11 rounded-pill transition-colors flex items-center">
              Shop this book
            </span>
          </Link>
        ) : null}
      </div>

      {relatedArticles.length > 0 ? (
        <div className="px-5 md:px-12 lg:px-16 py-10 max-w-[1280px] mx-auto border-t border-border mt-6">
          <h2 className="text-ink mb-6">More stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                to={`/blogs/${blogHandle}/${related.handle}`}
                className="card block"
              >
                <div className="bg-tint-sand aspect-video flex items-center justify-center">
                  {related.image ? (
                    <Image
                      alt={related.image.altText || related.title}
                      aspectRatio="16/9"
                      data={related.image}
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl opacity-60" role="img" aria-label="scroll">
                      📜
                    </span>
                  )}
                </div>
                <h3 className="text-ink line-clamp-2 p-4 md:p-6">{related.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        tags
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;

const RELATED_ARTICLES_QUERY = `#graphql
  query RelatedArticles(
    $blogHandle: String!
    $query: String
    $first: Int
    $language: LanguageCode
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      articles(first: $first, query: $query, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          image {
            id
            altText
            url
            width
            height
          }
        }
      }
    }
  }
` as const;

const CROSS_LINK_PRODUCT_QUERY = `#graphql
  query CrossLinkProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
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
          amount
          currencyCode
        }
      }
    }
  }
` as const;
