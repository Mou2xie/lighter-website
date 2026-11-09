import { getCollection } from 'astro:content';
import { docHref } from './doc-links.mjs';

const sections = [
  { key: 'getting-started', title: '开始使用', ids: ['index', 'getting-started/quickstart', 'getting-started/concepts'] },
  { key: 'guides', title: '使用指南', ids: ['guides/configuration', 'guides/tools', 'guides/conversations', 'guides/streaming', 'guides/hooks', 'guides/errors'] },
  { key: 'providers', title: '模型接入', ids: ['providers/index', 'providers/custom'] },
  { key: 'advanced', title: '进阶用法', ids: ['advanced/model', 'advanced/limits'] },
  { key: 'reference', title: 'API 参考', ids: ['reference/agent', 'reference/model-and-providers', 'reference/messages', 'reference/tools', 'reference/hooks', 'reference/errors'] },
];
const order = sections.flatMap(section => section.ids);
const labels: Record<string, string> = {
  index: '简介', 'getting-started/quickstart': '快速开始', 'getting-started/concepts': '核心概念',
  'guides/configuration': '配置 Agent', 'guides/tools': '添加工具', 'guides/conversations': '对话历史',
  'guides/streaming': '流式输出', 'guides/hooks': '生命周期钩子', 'guides/errors': '错误处理',
  'providers/index': '内置 Provider', 'providers/custom': '自定义 Provider',
  'advanced/model': '直接调用 Model', 'advanced/limits': '运行边界',
};

export function plainText(markdown: string) {
  return markdown.replace(/^```[^\n]*$/gm, '').replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '').replace(/[#*`>|]/g, '').replace(/\s+/g, ' ').trim();
}

export async function getDocs() {
  const entries = await getCollection('docs');
  return entries.map(entry => {
    const body = entry.body || '';
    const title = body.match(/^#\s+(.+)$/m)?.[1] || entry.id;
    const description = plainText(body.split(/\r?\n/).find(line => line.trim() && !line.startsWith('#')) || title);
    const section = sections.find(group => group.ids.includes(entry.id) || entry.id.startsWith(`${group.key}/`));
    return { entry, id: entry.id, title, label: labels[entry.id] || title.replace(/ API$/, ''),
      description, href: docHref(entry.id), section: section?.title || '其他文档', body };
  }).sort((a, b) => {
    const rank = (id: string) => order.includes(id) ? order.indexOf(id) : order.length;
    return rank(a.id) - rank(b.id) || a.id.localeCompare(b.id);
  });
}

export function groupDocs(docs: Awaited<ReturnType<typeof getDocs>>) {
  const groups = new Map<string, typeof docs>();
  for (const doc of docs) {
    if (!groups.has(doc.section)) groups.set(doc.section, []);
    groups.get(doc.section)!.push(doc);
  }
  return [...groups].map(([title, pages]) => ({ title, pages }));
}
