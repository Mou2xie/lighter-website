const menu = document.querySelector('.menu');
const nav = document.getElementById('navigation');
const english = document.documentElement.lang === 'en';
const openLabel = english ? 'Open navigation' : '打开导航';
const closeLabel = english ? 'Close navigation' : '关闭导航';
function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', openLabel);
}
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? closeLabel : openLabel);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); }
});
const languageSwitch = document.querySelector('[data-language-switch]');
if (languageSwitch) {
  const syncLocation = () => {
    const destination = new URL(languageSwitch.href);
    destination.search = location.search;
    // Home section IDs are shared by both translations.
    if (!location.pathname.includes('/docs/')) destination.hash = location.hash;
    languageSwitch.href = destination.href;
  };
  syncLocation();
  addEventListener('hashchange', syncLocation);
}
