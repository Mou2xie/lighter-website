import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { docsRoot, projectRoot } from './docs-source.mjs';
import { docHref } from '../src/lib/doc-links.mjs';
import { localeFromPath, localizePath } from '../src/lib/i18n.mjs';

const dist = path.join(projectRoot, 'dist');
async function filesAt(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    files.push(...(entry.isDirectory() ? await filesAt(file) : [file]));
  }
  return files;
}
const files = await filesAt(dist);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const documents = (await filesAt(docsRoot)).filter(file => file.endsWith('.md'));
const cache = new Map();
async function htmlAt(file) {
  if (!cache.has(file)) cache.set(file, await readFile(file, 'utf8'));
  return cache.get(file);
}
async function outputFile(url) {
  const requested = path.join(dist, decodeURIComponent(url.pathname));
  try {
    const info = await stat(requested);
    return info.isDirectory() ? path.join(requested, 'index.html') : requested;
  } catch {
    return requested;
  }
}
const failures = [];
let links = 0;
for (const file of htmlFiles) {
  const html = await htmlAt(file);
  const route = '/' + path.relative(dist, file).split(path.sep).join('/').replace(/index\.html$/, '');
  const current = new URL(route, 'https://lighter.invalid');
  const locale = localeFromPath(route);
  const redirect = html.match(/data-redirect="([^"]+)"/)?.[1];
  if (redirect) {
    assert.ok(route.startsWith('/en/'), `Unexpected redirect: ${route}`);
    assert.equal(redirect, localizePath(route, 'en'), `Wrong legacy English redirect: ${route}`);
    await stat(await outputFile(new URL(redirect, current)));
  } else {
    assert.ok(html.includes(`lang="${locale === 'en' ? 'en' : 'zh-CN'}"`), `Wrong page language: ${route}`);
    const languageSwitch = html.match(/<a\b[^>]*data-language-switch[^>]*>/)?.[0];
    assert.ok(languageSwitch, `Missing language switch: ${route}`);
    const switchHref = languageSwitch.match(/href="([^"]+)"/)?.[1];
    assert.equal(switchHref, localizePath(route, locale === 'en' ? 'zh' : 'en'), `Wrong counterpart: ${route}`);
    if (locale === 'en') {
      assert.ok(!/[\u4e00-\u9fff]/.test(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || ''), `Untranslated title: ${route}`);
    }
    for (const anchor of html.matchAll(/<a\b[^>]*>/g)) {
      if (anchor[0].includes('data-language-switch')) continue;
      const href = anchor[0].match(/href="([^"]+)"/)?.[1];
      if (!href?.startsWith('/') || href.startsWith('//') || href.startsWith('/assets/')) continue;
      assert.equal(href, localizePath(href, locale), `Link leaves its locale or uses a legacy address: ${route} → ${href}`);
    }
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${route}`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, redirect ? 0 : 1, `Expected one h1: ${route}`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(?:data:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const url = new URL(href, current);
    if (url.origin !== current.origin) continue;
    links++;
    const target = await outputFile(url);
    try {
      await stat(target);
      if (url.hash && target.endsWith('.html')) {
        const content = await htmlAt(target);
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(content.includes(`id="${id}"`), `Missing anchor ${url.hash}`);
      }
    } catch (error) { failures.push(`${route} → ${href}: ${error.message}`); }
  }
}
for (const file of documents) {
  const id = path.relative(docsRoot, file).split(path.sep).join('/');
  await stat(await outputFile(new URL(docHref(id, id.startsWith('en/') ? 'en' : 'zh'), 'https://lighter.invalid')));
}
const chineseIds = documents.map(file => path.relative(docsRoot, file).split(path.sep).join('/')).filter(id => !id.startsWith('en/')).sort();
const englishIds = documents.map(file => path.relative(docsRoot, file).split(path.sep).join('/')).filter(id => id.startsWith('en/')).map(id => id.slice(3)).sort();
assert.deepEqual(englishIds, chineseIds, 'Every document must have an English translation');
for (const prefix of ['', 'zh/']) {
  const search = JSON.parse(await readFile(path.join(dist, prefix, 'docs/search.json'), 'utf8'));
  assert.equal(search.length, chineseIds.length, 'Every document must be searchable in its own language');
  assert.ok(search.every(entry => entry.href.startsWith('/' + prefix + 'docs/')), 'Search results must stay in their locale');
  if (!prefix) assert.ok(search.every(entry => !/[\u4e00-\u9fff]/.test(entry.text)), 'English search must contain translated content');
  assert.ok((await readFile(path.join(dist, prefix, 'docs/getting-started/concepts/index.html'), 'utf8')).includes('class="doc-diagram"'), 'Mermaid must render at build time in both languages');
  const indexText = await readFile(path.join(dist, prefix, 'llms.txt'), 'utf8');
  const fullText = await readFile(path.join(dist, prefix, 'llms-full.txt'), 'utf8');
  assert.ok(indexText.includes('/' + prefix + 'docs/getting-started/quickstart/'), 'AI index must link to its own locale');
  assert.ok(fullText.includes('/' + prefix + 'docs/guides/tools/'), 'Full AI documentation must link to its own locale');
  if (!prefix) assert.ok(!/[\u4e00-\u9fff]/.test(fullText), 'Full English AI documentation must be translated');
}
assert.ok(!files.some(file => /\/(?:server|functions)\//.test(file)), 'Output must not contain a server');
assert.deepEqual(failures, [], 'Broken links in static output');
console.log(`Verified ${documents.length} documents, ${htmlFiles.length} HTML pages, ${links} internal links, search index, and static diagram.`);
