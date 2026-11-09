import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
// Documentation is owned by this project and always built from its local source.
export const docsRoot = path.join(projectRoot, 'doc');

export function assertDocsSource() {
  if (!existsSync(path.join(docsRoot, 'index.md'))) {
    throw new Error(`未找到文档：${docsRoot}/index.md。官网文档必须保存在本项目的 doc/ 目录。`);
  }
}
