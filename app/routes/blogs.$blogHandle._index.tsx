import {Link, useLoaderData, useNavigate} from 'react-router';
import articleFallbackImg from '~/assets/illustration-article-fallback.png';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {BlogArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {BLOG_CATEGORIES, categoryLabelForTags, isValidCategoryTag} from '~/lib/blogCategories';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.blog.title ?? 'Stories'} | Amar Granth`}];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const url = new URL(request.url);
  const tagParam = url.searchParams.get('tag');
  const activeTag = isValidCategoryTag(tagParam) ? tagParam : null;

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        query: activeTag ? `tag:${activeTag}` : undefined,
        ...paginationVariables,
      },
    }),
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog, activeTag};
}

export default function Blog() {
  const {blog, activeTag} = useLoaderData<typeof loader>();
  const {articles} = blog;
  const navigate = useNavigate();

  return (
    <div className="bg-base px-5 md:px-12 lg:px-16 py-6 md:py-10 max-w-[1280px] mx-auto">
      <nav aria-label="Breadcrumb" className="text-small text-ink-soft mb-4">
        <Link to="/" className="hover:text-ink transition-colors">
          Home
        </Link>{' '}
        / <span className="text-ink">Stories</span>
      </nav>

      <h1 className="text-ink mb-2">Stories &amp; Heritage</h1>
      <p className="text-ink-soft text-body max-w-2xl mb-6">
        Mythology, heritage, and history behind every book we publish.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-5 px-5 md:mx-0 md:px-0">
        <CategoryPill
          label="All"
          active={!activeTag}
          onClick={() => void navigate(`/blogs/${blog.handle}`)}
        />
        {BLOG_CATEGORIES.map((category) => (
          <CategoryPill
            key={category.tag}
            label={category.label}
            active={activeTag === category.tag}
            onClick={() =>
              void navigate(`/blogs/${blog.handle}?tag=${category.tag}`)
            }
          />
        ))}
      </div>

      {articles.nodes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-soft text-body mb-4">
            No stories in this category yet.
          </p>
          <Link
            to={`/blogs/${blog.handle}`}
            className="text-accent hover:text-accent-hover font-semibold text-body"
          >
            View all posts
          </Link>
        </div>
      ) : (
        <PaginatedResourceSection<BlogArticleItemFragment>
          connection={articles}
          resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {({node: article, index}) => (
            <BlogArticleCard
              article={article}
              key={article.id}
              index={index}
              loading={index < 3 ? 'eager' : 'lazy'}
            />
          )}
        </PaginatedResourceSection>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-pill px-4 py-2 text-small font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'border border-border text-ink-soft hover:border-accent hover:text-accent'
      }`}
    >
      {label}
    </button>
  );
}

const TINT_CLASSES = ['bg-tint-sand', 'bg-tint-powder', 'bg-tint-sage', 'bg-tint-blush'];

function BlogArticleCard({
  article,
  loading,
  index = 0,
}: {
  article: BlogArticleItemFragment;
  loading?: HTMLImageElement['loading'];
  index?: number;
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  const categoryLabel = categoryLabelForTags(article.tags);

  return (
    <Link
      className="card block"
      to={`/blogs/${article.blog.handle}/${article.handle}`}
    >
      <div
        className={`${TINT_CLASSES[index % TINT_CLASSES.length]} aspect-video relative flex items-center justify-center`}
      >
        {categoryLabel ? (
          <span className="absolute top-3 left-3 bg-white/90 text-ink text-micro font-semibold uppercase tracking-wide px-2 py-1 rounded-pill">
            {categoryLabel}
          </span>
        ) : null}
        {article.image ? (
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="16/9"
            data={article.image}
            loading={loading}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={articleFallbackImg}
            alt="Illustrated Hindu temple skyline by the river at dusk"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4 md:p-6">
        <h3 className="text-ink mb-1 line-clamp-2 min-h-[2.6em]">
          {article.title}
        </h3>
        <p className="text-ink-soft text-small line-clamp-2 mb-1">
          {article.excerpt}
        </p>
        <p className="text-ink-soft text-micro">{publishedAt}</p>
      </div>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $query: String
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        query: $query,
        sortKey: PUBLISHED_AT,
        reverse: true
      ) {
        nodes {
          ...BlogArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment BlogArticleItem on Article {
    handle
    id
    tags
    excerpt: content(truncateAt: 140)
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
