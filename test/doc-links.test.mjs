import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docHref, resolveDocLink } from '../src/lib/doc-links.mjs';

test('index files map to canonical static directory routes', () => {
  assert.equal(docHref('index'), '/docs/');
  assert.equal(docHref('providers/index.md'), '/docs/providers/');
  assert.equal(docHref('reference/agent'), '/docs/reference/agent/');
  assert.equal(docHref('index', 'zh'), '/zh/docs/');
  assert.equal(docHref('reference/agent', 'zh'), '/zh/docs/reference/agent/');
});

test('relative Markdown links retain directory context, queries, and anchors', () => {
  assert.equal(resolveDocLink('../reference/agent.md#run', 'guides/tools.md'), '/zh/docs/reference/agent/#run');
  assert.equal(resolveDocLink('custom.md?source=guide#接口', 'providers/index.md'), '/zh/docs/providers/custom/?source=guide#接口');
  assert.equal(resolveDocLink('../index.md', 'guides/tools.md'), '/zh/docs/');
  assert.equal(resolveDocLink('./llms-full.txt', 'index.md'), '/zh/docs/llms-full.txt');
});

test('external URLs, anchor links, and absolute paths are preserved', () => {
  for (const url of ['https://pi.dev/', '//example.com/a.md', 'mailto:test@example.com', '#工具', '/llms.txt']) {
    assert.equal(resolveDocLink(url, 'guides/tools.md'), url);
  }
});

test('links outside the document source directory are not silently rewritten', () => {
  assert.equal(resolveDocLink('../../README.md', 'guides/tools.md'), '../../README.md');
});

test('English document links retain their locale, queries, and anchors', () => {
  assert.equal(docHref('en/index'), '/docs/');
  assert.equal(docHref('en/providers/index.md'), '/docs/providers/');
  assert.equal(docHref('reference/agent', 'en'), '/docs/reference/agent/');
  assert.equal(resolveDocLink('../reference/agent.md#run', 'en/guides/tools.md'), '/docs/reference/agent/#run');
  assert.equal(resolveDocLink('custom.md?source=guide#interface', 'en/providers/index.md'), '/docs/providers/custom/?source=guide#interface');
  assert.equal(resolveDocLink('../index.md', 'en/guides/tools.md'), '/docs/');
  assert.equal(resolveDocLink('llms-full.txt', 'en/index.md'), '/docs/llms-full.txt');
  assert.equal(resolveDocLink('../../README.md', 'en/guides/tools.md'), '../../README.md');
});
