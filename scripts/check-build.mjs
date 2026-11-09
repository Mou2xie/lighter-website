import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { docsRoot, projectRoot } from './docs-source.mjs';
import { docHref } from '../src/lib/doc-links.mjs';

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
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${route}`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `Expected one h1: ${route}`);
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
  await stat(await outputFile(new URL(docHref(id), 'https://lighter.invalid')));
}
const search = JSON.parse(await readFile(path.join(dist, 'docs/search.json'), 'utf8'));
assert.equal(search.length, documents.length, 'Every document must be searchable');
assert.ok((await readFile(path.join(dist, 'docs/getting-started/concepts/index.html'), 'utf8')).includes('class="doc-diagram"'), 'Mermaid must render at build time');
assert.ok(!files.some(file => /\/(?:server|functions)\//.test(file)), 'Output must not contain a server');
assert.deepEqual(failures, [], 'Broken links in static output');
console.log(`Verified ${documents.length} documents, ${htmlFiles.length} HTML pages, ${links} internal links, search index, and static diagram.`);
