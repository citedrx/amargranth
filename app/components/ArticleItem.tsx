import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';

const TINT_CLASSES = [
  'bg-tint-sand',
  'bg-tint-powder',
  'bg-tint-sage',
  'bg-tint-blush',
];

type ArticleItemData = Pick<
  ArticleItemFragment,
  'id' | 'handle' | 'title' | 'publishedAt' | 'image' | 'blog'
>;

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
      className="group"
      key={article.id}
      to={`/blogs/${article.blog.handle}/${article.handle}`}
    >
      <div
        className={`${TINT_CLASSES[index % TINT_CLASSES.length]} rounded-card aspect-[3/2] mb-4 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.01]`}
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
      <h3 className="font-display text-ink mb-1">{article.title}</h3>
      <p className="text-ink-soft text-[0.92rem]">{publishedAt}</p>
    </Link>
  );
}
