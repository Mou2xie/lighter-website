// Single source of truth for the production origin. Used by astro.config.mjs
// (`site`), the shared layout (canonical, hreflang, Open Graph) and the
// robots.txt / sitemap.xml endpoints.
export const SITE = 'https://www.lighteragent.dev';

export function absoluteUrl(path) {
  return new URL(path, SITE).href;
}
