import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomepageArticleFragment} from 'storefrontapi.generated';

const TINT_CLASSES = [
  'bg-tint-sand',
  'bg-tint-powder',
  'bg-tint-sage',
  'bg-tint-blush',
];

type ArticleItemData = HomepageArticleFragment;

export function ArticleItem({
  article,
  loading,
  index = 0,
}: {
  article: ArticleItemData;
  loading?: HTMLImageElement['loading'];
  index?: number;
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  return (
    <Link
      className="card block"
      key={article.id}
      to={`/blogs/${article.blog.handle}/${article.handle}`}
    >
      <div
        className={`${TINT_CLASSES[index % TINT_CLASSES.length]} aspect-[3/2] flex items-center justify-center`}
      >
        {article.image ? (
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-60" role="img" aria-label="scroll">
            📜
          </span>
        )}
      </div>
      <div className="p-4 md:p-6">
        <h3 className="text-ink mb-1 line-clamp-2 min-h-[2.6em]">
          {article.title}
        </h3>
        <p className="text-ink-soft text-small">{publishedAt}</p>
      </div>
    </Link>
  );
}
