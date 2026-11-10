import path from 'node:path';
import { localizePath } from './i18n.mjs';

export function docHref(id, locale = 'en') {
  if (id.startsWith('en/')) { locale = 'en'; id = id.slice(3); }
  const slug = id.replace(/\.md$/i, '').replace(/(^|\/)index$/i, '$1').replace(/\/$/, '');
  return localizePath(slug ? `/docs/${slug}/` : '/docs/', locale);
}

export function resolveDocLink(target, sourceId) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(target)) return target;
  const locale = sourceId.startsWith('en/') ? 'en' : 'zh';
  if (locale === 'en') sourceId = sourceId.slice(3);
  const [, pathname, suffix = ''] = target.match(/^([^?#]*)(.*)$/);
  if (!pathname) return target;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourceId), decodeURI(pathname)));
  if (resolved === '..' || resolved.startsWith('../')) return target;
  if (/\.md$/i.test(resolved)) return docHref(resolved, locale) + suffix;
  return localizePath(`/docs/${resolved}`, locale) + suffix;
}
