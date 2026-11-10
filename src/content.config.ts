import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsRoot, getDocsRenderDigest } from '../scripts/docs-source.mjs';

const markdownLoader = glob({
  base: docsRoot,
  pattern: '**/*.md',
  generateId: ({ entry }) => entry.replace(/\.md$/, ''),
});

const docs = defineCollection({
  loader: {
    ...markdownLoader,
    async load(context) {
      const rendering = getDocsRenderDigest();
      await markdownLoader.load({
        ...context,
        generateDigest: content => context.generateDigest({ content, rendering }),
      });
    },
  },
});

export const collections = { docs };
