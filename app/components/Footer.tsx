import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Logo} from '~/components/Logo';
import {siteConfig} from '~/lib/site-config';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: siteConfig.social.facebook,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <path
          d="M14.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.55-1.5H17.5V4.3c-.26-.03-1.16-.11-2.2-.11-2.18 0-3.68 1.33-3.68 3.77V10.5H9v3h2.62V21h2.88Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: siteConfig.social.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
];

function SocialLinks() {
  return (
    <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className="flex items-center justify-center w-9 h-9 rounded-pill border border-border text-ink-soft hover:border-accent hover:text-accent transition-colors"
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
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
          <footer className="bg-tint-sand mt-24">
            <div className="px-5 md:px-12 lg:px-16 py-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2.5 justify-center md:justify-start mb-2">
                  <Logo className="w-8 h-8 shrink-0" />
                  <p className="font-heading text-[1.25rem] font-extrabold text-ink tracking-[-0.02em]">
                    {header.shop.name}
                  </p>
                </div>
                <p className="text-ink-soft text-body max-w-xs">
                  Illustrated storybooks bringing Indian mythology and
                  heritage to young readers.
                </p>
                <SocialLinks />
              </div>
              {footer?.menu && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
            </div>
            <div className="border-t border-border px-5 md:px-12 lg:px-16 py-5 max-w-7xl mx-auto text-center md:text-left">
              <p className="text-ink-soft text-micro">
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
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-small"
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

// Fallback only — the live Shopify-managed footer menu is tried first (see
// FooterMenu above). The plain page links here come from
// siteConfig.navigation.footer (DESIGN_SYSTEM.md Section 0.3) rather than a
// second hardcoded copy; the SHOP_POLICY entries stay literal since they
// carry real Shopify resource GIDs, not content a non-dev would edit.
const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    ...[
      ...siteConfig.navigation.footer.shop,
      ...siteConfig.navigation.footer.support,
    ].map((link, index) => ({
      id: `fallback-footer-${index}`,
      resourceId: null,
      tags: [],
      title: link.label,
      type: 'HTTP',
      url: link.href,
      items: [],
    })),
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
