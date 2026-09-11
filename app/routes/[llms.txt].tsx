import type {Route} from './+types/[llms.txt]';
import {siteConfig} from '~/lib/site-config';

/**
 * llms.txt — a plain-language site summary for AI answer engines/crawlers
 * (an emerging convention alongside robots.txt/sitemap.xml). Content here
 * mirrors real, already-established facts from about.tsx/faq.tsx/
 * site-config.ts rather than inventing new claims. Deliberately omits
 * prices — those live in Shopify and can change without a code deploy, so
 * hardcoding them here would go stale silently.
 */
export function loader({request}: Route.LoaderArgs) {
  const {origin} = new URL(request.url);
  const body = llmsTxtData({origin});

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

function llmsTxtData({origin}: {origin: string}) {
  const categoryLines = siteConfig.blogCategories
    .map((c) => `- ${c.label}`)
    .join('\n');

  return `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is a children's illustrated book publisher bringing Hindu mythology and Indian heritage to young readers (recommended ages 3+, also enjoyed as a parent-child read-along). Books are illustrated, researched, and written to make ancient stories feel alive for the next generation. Ships across India, INR pricing.

## Catalog

Illustrated storybooks covering:
${categoryLines}

Full catalog: ${origin}/collections/all
Individual collections: ${origin}/collections

## Shipping & returns

- Free shipping across India, no minimum order
- Orders dispatched within 24-48 hours
- Books arriving damaged can be reported within 24 hours of delivery for a replacement

## Stories

${siteConfig.name} also publishes long-form articles on Indian mythology and heritage:
${origin}/blogs/blog

## Contact

${siteConfig.contactEmail}
${origin}/contact

## Key pages

- Home: ${origin}/
- About: ${origin}/about
- FAQ: ${origin}/faq
- Contact: ${origin}/contact
`;
}
