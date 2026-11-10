import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import remarkDocs from '../scripts/remark-docs.mjs';
import { docsRoot } from '../scripts/docs-source.mjs';

test('identical Mermaid diagrams on one page receive distinct marker IDs', () => {
  const diagram = { type: 'code', lang: 'mermaid', value: 'flowchart LR\n A[Input] --> B[Output]' };
  const tree = { type: 'root', children: [structuredClone(diagram), structuredClone(diagram)] };
  remarkDocs()(tree, { path: path.join(docsRoot, 'en/getting-started/concepts.md') });
  const ids = tree.children.map(node => [...node.value.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
  assert.ok(ids.every(group => group.length > 0));
  assert.equal(new Set(ids.flat()).size, ids.flat().length);
  assert.ok(tree.children.every(node => node.type === 'html' && node.value.includes('Flowchart, horizontally scrollable')));
});
