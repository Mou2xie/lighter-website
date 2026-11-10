import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { assertDocsSource, docsRoot, projectRoot } from '../scripts/docs-source.mjs';

test('documentation is owned by the website project', () => {
  assert.equal(docsRoot, path.join(projectRoot, 'doc'));
  assert.doesNotThrow(() => assertDocsSource());
});

test('render dependency changes invalidate cached documentation', async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { getDocsRenderDigest } = await import('../scripts/docs-source.mjs');
  const fixture = await mkdtemp(path.join(tmpdir(), 'lighter-docs-cache-'));
  try {
    for (const name of ['astro.config.mjs', 'package-lock.json', 'scripts/remark-docs.mjs', 'src/lib/doc-links.mjs', 'src/lib/i18n.mjs']) {
      const file = path.join(fixture, name);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, `original ${name}`);
    }
    const original = getDocsRenderDigest(fixture);
    assert.equal(getDocsRenderDigest(fixture), original);
    await writeFile(path.join(fixture, 'src/lib/doc-links.mjs'), 'updated URL rules');
    const updatedLinks = getDocsRenderDigest(fixture);
    assert.notEqual(updatedLinks, original);
    await writeFile(path.join(fixture, 'package-lock.json'), 'updated renderer dependency');
    assert.notEqual(getDocsRenderDigest(fixture), updatedLinks);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
