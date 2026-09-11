import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import logoUrl from '~/assets/logo.svg';
import favicon32 from '~/assets/favicon-32.png';
import favicon192 from '~/assets/favicon-192.png';
import appleTouchIcon from '~/assets/apple-touch-icon.png';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {organizationJsonLd, websiteJsonLd} from '~/lib/seo';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {JsonLd} from './components/JsonLd';
import {MetaPixelBaseScript, MetaPixelEvents} from './components/MetaPixel';
import {
  GoogleAnalyticsBaseScript,
  GoogleAnalyticsEvents,
} from './components/GoogleAnalytics';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    // Real sun-mark favicon (the same asset used in Header/Footer), not the
    // generic Hydrogen-skeleton icon this was shipping with before. PNGs at
    // two sizes since browsers/search engines don't reliably support SVG
    // favicons, plus the iOS home-screen icon size.
    {rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32},
    {rel: 'icon', type: 'image/png', sizes: '192x192', href: favicon192},
    {rel: 'apple-touch-icon', sizes: '180x180', href: appleTouchIcon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    metaPixelId: env.PUBLIC_META_PIXEL_ID,
    ga4MeasurementId: env.PUBLIC_GA4_MEASUREMENT_ID,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
        <JsonLd data={organizationJsonLd({logoUrl})} />
        <JsonLd data={websiteJsonLd()} />
        <MetaPixelBaseScript pixelId={data?.metaPixelId} />
        <GoogleAnalyticsBaseScript measurementId={data?.ga4MeasurementId} />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <MetaPixelEvents pixelId={data.metaPixelId} />
      <GoogleAnalyticsEvents measurementId={data.ga4MeasurementId} />
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

function ErrorContent({errorStatus}: {errorStatus: number}) {
  const isNotFound = errorStatus === 404;

  return (
    <div className="bg-base min-h-[60vh] flex items-center">
      <div className="px-5 md:px-12 lg:px-16 py-16 max-w-[640px] mx-auto text-center">
        <p className="text-accent font-semibold text-small tracking-wide mb-3">
          {errorStatus}
        </p>
        <h1 className="text-ink mb-4">
          {isNotFound ? 'We couldn&rsquo;t find that page' : 'Something went wrong'}
        </h1>
        <p className="text-ink-soft text-body-lg mb-8">
          {isNotFound
            ? 'The page you&rsquo;re looking for may have moved or no longer exists.'
            : 'Please try again in a moment, or head back to browse our storybooks.'}
        </p>
        <a
          href="/"
          className="inline-block bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold text-body px-8 py-3.5 rounded-pill no-underline hover:no-underline transition-colors"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<RootLoader>('root');
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
  }

  // If the root loader itself succeeded (the error came from a child route),
  // keep the header/footer so there's still a way to navigate away instead
  // of stranding the visitor on a bare page.
  if (data) {
    return (
      <PageLayout {...data}>
        <ErrorContent errorStatus={errorStatus} />
      </PageLayout>
    );
  }

  return <ErrorContent errorStatus={errorStatus} />;
}
