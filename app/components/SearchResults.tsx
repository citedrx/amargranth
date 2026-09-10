import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-ink mb-3">Stories</h2>
      <ul className="flex flex-col divide-y divide-border border-t border-border">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <li key={article.id}>
              <Link
                prefetch="intent"
                to={articleUrl}
                className="block py-3 text-body font-semibold text-ink hover:text-accent transition-colors"
              >
                {article.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-ink mb-3">Pages</h2>
      <ul className="flex flex-col divide-y divide-border border-t border-border">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <li key={page.id}>
              <Link
                prefetch="intent"
                to={pageUrl}
                className="block py-3 text-body font-semibold text-ink hover:text-accent transition-colors"
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-ink mb-3">Books</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <li key={product.id}>
                <Link
                  prefetch="intent"
                  to={productUrl}
                  className="flex items-center gap-4 py-3"
                >
                  <div className="bg-tint-sand rounded-card overflow-hidden shrink-0 w-16 h-16">
                    {image ? (
                      <Image
                        data={image}
                        alt={product.title}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-body text-ink line-clamp-1">
                      {product.title}
                    </p>
                    {price ? (
                      <Money
                        data={price}
                        className="text-accent text-small font-semibold"
                      />
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          });

          return (
            <div>
              <div className="flex justify-center mb-3">
                <PreviousLink className="text-small font-semibold text-accent hover:text-accent-hover transition-colors">
                  {isLoading ? 'Loading…' : '↑ Load previous'}
                </PreviousLink>
              </div>
              <ul className="flex flex-col divide-y divide-border border-t border-border">
                {ItemsMarkup}
              </ul>
              <div className="flex justify-center mt-6">
                <NextLink className="rounded-pill border border-border px-6 py-2.5 text-small font-semibold text-ink hover:border-accent hover:text-accent transition-colors">
                  {isLoading ? 'Loading…' : 'Load more ↓'}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="text-ink-soft text-body py-10 text-center border-t border-border">
      No results — try a different search.
    </p>
  );
}
