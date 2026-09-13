import {Await} from 'react-router';
import {Suspense} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {ExitIntentBanner} from '~/components/ExitIntentBanner';
import {AnnouncementBar} from '~/components/AnnouncementBar';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  promoLabel: string | null;
  promoEndDate: string | null;
  promoActive: boolean;
  promoDaysLeft: number | null;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  promoLabel,
  promoEndDate,
  promoActive,
  promoDaysLeft,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      <ExitIntentBanner cart={cart} />
      <div className="min-h-screen flex flex-col">
        {/* AnnouncementBar + Header share one sticky wrapper so they scroll
            together as a single unit — Header itself is no longer sticky on
            its own (see Header.tsx). */}
        <div className="sticky top-0 z-20">
          {promoActive && promoLabel && promoEndDate ? (
            <AnnouncementBar
              label={promoLabel}
              endDate={promoEndDate}
              daysLeft={promoDaysLeft}
            />
          ) : null}
          {header && (
            <Header
              header={header}
              cart={cart}
              isLoggedIn={isLoggedIn}
              publicStoreDomain={publicStoreDomain}
            />
          )}
        </div>
        <main className="flex-1">{children}</main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </div>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Cart">
      <Suspense fallback={<p className="px-5 py-4 text-ink-soft text-sm">Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="Menu">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
