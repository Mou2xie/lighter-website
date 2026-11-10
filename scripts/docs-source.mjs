import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
// Documentation is owned by this project and always built from its local source.
export const docsRoot = path.join(projectRoot, 'doc');

export function assertDocsSource() {
  for (const entry of ['index.md', 'en/index.md']) {
    if (!existsSync(path.join(docsRoot, entry))) {
      throw new Error(`未找到文档：${path.join(docsRoot, entry)}。官网需要同时提供中英文文档。`);
    }
  }
}

// Markdown HTML is cached by Astro. Include render dependencies so changing
// URL rules or diagram rendering also invalidates entries with unchanged text.
export function getDocsRenderDigest(root = projectRoot) {
  const hash = createHash('sha256');
  for (const file of [
    'astro.config.mjs', 'package-lock.json', 'scripts/remark-docs.mjs',
    'src/lib/doc-links.mjs', 'src/lib/i18n.mjs',
  ]) {
    hash.update(file).update('\0').update(readFileSync(path.join(root, file))).update('\0');
  }
  return hash.digest('hex');
}
