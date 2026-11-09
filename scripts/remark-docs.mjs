import path from 'node:path';
import { createHash } from 'node:crypto';
import { renderMermaidSVG } from 'beautiful-mermaid';
import { docsRoot } from './docs-source.mjs';
import { resolveDocLink } from '../src/lib/doc-links.mjs';

export default function remarkDocs() {
  return (tree, file) => {
    const sourceId = path.relative(docsRoot, String(file.path)).split(path.sep).join('/');
    if (sourceId.startsWith('../')) return;
    if (tree.children[0]?.type === 'heading' && tree.children[0].depth === 1) tree.children.shift();
    // The site supplies consistent previous/next navigation for all documents.
    const last = tree.children.at(-1);
    if (last?.type === 'paragraph' && last.children.some(node => node.type === 'link') &&
        last.children.every(node => node.type === 'link' || node.type === 'text') &&
        last.children.some(node => /[←→]/.test(JSON.stringify(node)))) tree.children.pop();

    function walk(node) {
      if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
        node.url = resolveDocLink(node.url, sourceId);
      }
      if (node.type === 'code' && node.lang === 'mermaid') {
        let svg = renderMermaidSVG(node.value, {
          bg: '#20201d', fg: '#f1eee7', accent: '#f59e0b',
          border: '#57554b', muted: '#b0ada3', surface: '#292923',
          font: 'system-ui, sans-serif', padding: 24,
        });
        // Mermaid marker IDs must be unique if a page contains multiple diagrams.
        const prefix = createHash('sha256').update(sourceId + node.value).digest('hex').slice(0, 10);
        svg = svg.replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
          .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
        node.type = 'html';
        node.value = `<figure class="doc-diagram" tabindex="0" aria-label="流程图，可横向滚动">${svg}</figure>`;
        delete node.lang;
      }
      for (const child of node.children || []) walk(child);
    }
    walk(tree);
  };
}
