const english = document.documentElement.lang === 'en';
import { copyText } from './clipboard';

const toggle = document.querySelector<HTMLButtonElement>('#docs-menu');
const sidebar = document.querySelector<HTMLElement>('#docs-sidebar');
toggle?.addEventListener('click', () => {
  const open = sidebar?.classList.toggle('open') || false;
  toggle.setAttribute('aria-expanded', String(open));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar?.classList.contains('open')) {
    sidebar.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
  }
});

document.querySelectorAll<HTMLPreElement>('.doc-content pre').forEach(pre => {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';
  pre.before(wrapper);
  wrapper.append(pre);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = english ? 'Copy' : '复制';
  button.setAttribute('aria-label', english ? 'Copy code' : '复制代码');
  button.addEventListener('click', () => copyText(pre.querySelector('code')?.textContent || ''));
  wrapper.append(button);
  pre.tabIndex = 0;
});

interface SearchEntry { title: string; href: string; section: string; text: string }
const search = document.querySelector<HTMLInputElement>('#docs-search');
const results = document.querySelector<HTMLUListElement>('#search-results');
const status = document.querySelector<HTMLParagraphElement>('#search-status');
const groups = document.querySelector<HTMLElement>('.sidebar-groups');
let searchIndex: Promise<SearchEntry[]> | undefined;
let revision = 0;

function loadIndex() {
  if (!searchIndex) {
    searchIndex = fetch(english ? '/docs/search.json' : '/zh/docs/search.json').then(response => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json() as Promise<SearchEntry[]>;
    }).catch(error => { searchIndex = undefined; throw error; });
  }
  return searchIndex;
}

search?.addEventListener('focus', () => { loadIndex().catch(() => {}); }, { once: true });
search?.addEventListener('input', async () => {
  if (!results || !status || !groups) return;
  const request = ++revision;
  const query = search.value.trim().toLocaleLowerCase();
  results.replaceChildren();
  results.hidden = !query;
  groups.hidden = Boolean(query);
  status.textContent = '';
  if (!query) return;
  status.textContent = english ? 'Searching…' : '搜索中…';
  try {
    const index = await loadIndex();
    if (request !== revision) return;
    const tokens = query.split(/\s+/);
    const matches = index.filter(entry => tokens.every(token => `${entry.title} ${entry.text}`.toLocaleLowerCase().includes(token)))
      .sort((a, b) => Number(b.title.toLocaleLowerCase().includes(query)) - Number(a.title.toLocaleLowerCase().includes(query)));
    status.textContent = matches.length ? (english ? `${matches.length} matching documents` : `${matches.length} 篇相关文档`) : (english ? 'No matching documents.' : '没有找到相关内容。');
    for (const entry of matches.slice(0, 8)) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.href;
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const section = document.createElement('small');
      section.textContent = entry.section;
      const excerpt = document.createElement('p');
      const position = Math.max(0, entry.text.toLocaleLowerCase().indexOf(tokens[0]) - 15);
      excerpt.textContent = (position ? '…' : '') + entry.text.slice(position, position + 65) + '…';
      link.append(title, section, excerpt);
      li.append(link);
      results.append(li);
    }
  } catch {
    if (request !== revision) return;
    status.textContent = english ? 'Search is unavailable. Please use the documentation navigation.' : '搜索暂不可用，请使用文档目录。';
    groups.hidden = false;
  }
});

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.docs-toc a')];
  const visible = new Set<string>();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    }
    const active = links.find(link => visible.has(decodeURIComponent(link.hash.slice(1))));
    if (active) {
      links.forEach(link => link.removeAttribute('aria-current'));
      active.setAttribute('aria-current', 'location');
    }
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('.doc-content h2, .doc-content h3').forEach(heading => observer.observe(heading));
}
