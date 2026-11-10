export function localeFromPath(pathname) {
  return /^\/zh(?:\/|$)/.test(pathname) ? 'zh' : 'en';
}

export function localizePath(path, locale) {
  const url = new URL(path, 'https://lighter.invalid');
  let pathname = url.pathname.replace(/^\/(?:en|zh)(?=\/|$)/, '') || '/';
  if (pathname === '/404.html' || pathname === '/404/') {
    pathname = locale === 'zh' ? '/zh/404/' : '/404.html';
  } else if (locale === 'zh') {
    pathname = '/zh' + pathname;
  }
  return pathname + url.search + url.hash;
}

export function translate(locale, chinese, english) {
  return locale === 'en' ? english : chinese;
}
