import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsRoot } from '../scripts/docs-source.mjs';

const docs = defineCollection({
  loader: glob({
    base: docsRoot,
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
});

export const collections = { docs };
