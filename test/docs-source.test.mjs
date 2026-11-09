import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { assertDocsSource, docsRoot, projectRoot } from '../scripts/docs-source.mjs';

test('documentation is owned by the website project', () => {
  assert.equal(docsRoot, path.join(projectRoot, 'doc'));
  assert.doesNotThrow(() => assertDocsSource());
});
