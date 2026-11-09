import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docHref, resolveDocLink } from '../src/lib/doc-links.mjs';

test('index files map to canonical static directory routes', () => {
  assert.equal(docHref('index'), '/docs/');
  assert.equal(docHref('providers/index.md'), '/docs/providers/');
  assert.equal(docHref('reference/agent'), '/docs/reference/agent/');
});

test('relative Markdown links retain directory context, queries, and anchors', () => {
  assert.equal(resolveDocLink('../reference/agent.md#run', 'guides/tools.md'), '/docs/reference/agent/#run');
  assert.equal(resolveDocLink('custom.md?source=guide#接口', 'providers/index.md'), '/docs/providers/custom/?source=guide#接口');
  assert.equal(resolveDocLink('../index.md', 'guides/tools.md'), '/docs/');
  assert.equal(resolveDocLink('./llms-full.txt', 'index.md'), '/docs/llms-full.txt');
});

test('external URLs, anchor links, and absolute paths are preserved', () => {
  for (const url of ['https://pi.dev/', '//example.com/a.md', 'mailto:test@example.com', '#工具', '/llms.txt']) {
    assert.equal(resolveDocLink(url, 'guides/tools.md'), url);
  }
});

test('links outside the document source directory are not silently rewritten', () => {
  assert.equal(resolveDocLink('../../README.md', 'guides/tools.md'), '../../README.md');
});
