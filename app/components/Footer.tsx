import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-tint-sand mt-20">
            <div className="px-6 md:px-16 py-10 md:py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="font-display text-[1.25rem] font-extrabold text-ink tracking-[-0.02em] mb-2">
                  {header.shop.name}
                </p>
                <p className="text-ink-soft text-sm max-w-xs">
                  Illustrated storybooks bringing Indian mythology and
                  heritage to young readers.
                </p>
              </div>
              {footer?.menu && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
            </div>
            <div className="border-t border-border px-6 md:px-16 py-5 max-w-7xl mx-auto text-center md:text-left">
              <p className="text-ink-soft text-xs">
                &copy; {new Date().getFullYear()} {header.shop.name}. All
                rights reserved.
              </p>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
      role="navigation"
    >
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a
            href={url}
            key={item.id}
            rel="noopener noreferrer"
            target="_blank"
            className="font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            className="font-semibold text-ink-soft hover:text-ink transition-colors"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'about-page',
      resourceId: null,
      tags: [],
      title: 'About',
      type: 'HTTP',
      url: '/about',
      items: [],
    },
    {
      id: 'contact-page',
      resourceId: null,
      tags: [],
      title: 'Contact',
      type: 'HTTP',
      url: '/contact',
      items: [],
    },
    {
      id: 'faq-page',
      resourceId: null,
      tags: [],
      title: 'FAQ',
      type: 'HTTP',
      url: '/faq',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
