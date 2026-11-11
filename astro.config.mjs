import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkDocs from './scripts/remark-docs.mjs';
import { assertDocsSource } from './scripts/docs-source.mjs';
import { SITE } from './src/lib/seo.mjs';

assertDocsSource();

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDocs],
    }),
    shikiConfig: { theme: 'vesper', wrap: false },
  },
});
