import path from 'node:path';

export function docHref(id) {
  const slug = id.replace(/\.md$/i, '').replace(/(^|\/)index$/i, '$1').replace(/\/$/, '');
  return slug ? `/docs/${slug}/` : '/docs/';
}

export function resolveDocLink(target, sourceId) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(target)) return target;
  const [, pathname, suffix = ''] = target.match(/^([^?#]*)(.*)$/);
  if (!pathname) return target;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourceId), decodeURI(pathname)));
  if (resolved === '..' || resolved.startsWith('../')) return target;
  if (/\.md$/i.test(resolved)) return docHref(resolved) + suffix;
  return `/docs/${resolved}` + suffix;
}
