import type { APIRoute } from 'astro';
import { getDocs } from '../lib/docs';
import { localizePath } from '../lib/i18n.mjs';
import { absoluteUrl } from '../lib/seo.mjs';

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Homepage plus every documentation page, in both languages. Error pages and
// the legacy /en/ redirect stubs are intentionally excluded.
export const GET: APIRoute = async () => {
  const docs = await getDocs('en');
  const paths = ['/', ...docs.map(doc => doc.href)];
  const entries = paths.flatMap(path => {
    const en = absoluteUrl(localizePath(path, 'en'));
    const zh = absoluteUrl(localizePath(path, 'zh'));
    return [en, zh].map(loc => [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}" />`,
      `    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(zh)}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(en)}" />`,
      '  </url>',
    ].join('\n'));
  });
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
