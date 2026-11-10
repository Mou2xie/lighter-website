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

const englishSections: Record<string, string> = {
  'getting-started': 'Getting started', guides: 'Guides', providers: 'Providers',
  advanced: 'Advanced', reference: 'API reference',
};
const englishLabels: Record<string, string> = {
  index: 'Introduction', 'getting-started/quickstart': 'Quickstart', 'getting-started/concepts': 'Core concepts',
  'guides/configuration': 'Configure an agent', 'guides/tools': 'Add tools', 'guides/conversations': 'Conversation history',
  'guides/streaming': 'Streaming', 'guides/hooks': 'Lifecycle hooks', 'guides/errors': 'Error handling',
  'providers/index': 'Built-in providers', 'providers/custom': 'Custom providers',
  'advanced/model': 'Use Model directly', 'advanced/limits': 'Runtime limits',
};

export function plainText(markdown: string) {
  return markdown.replace(/^```[^\n]*$/gm, '').replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '').replace(/[#*`>|]/g, '').replace(/\s+/g, ' ').trim();
}

export async function getDocs(locale: 'zh' | 'en' = 'en') {
  const entries = await getCollection('docs');
  return entries.filter(entry => entry.id.startsWith('en/') === (locale === 'en')).map(entry => {
    const id = locale === 'en' ? entry.id.slice(3) : entry.id;
    const body = entry.body || '';
    const title = body.match(/^#\s+(.+)$/m)?.[1] || entry.id;
    const description = plainText(body.split(/\r?\n/).find(line => line.trim() && !line.startsWith('#')) || title);
    const section = sections.find(group => group.ids.includes(id) || id.startsWith(`${group.key}/`));
    return { entry, id, locale, title, label: (locale === 'en' ? englishLabels : labels)[id] || title.replace(/ API$/, ''),
      description, href: docHref(id, locale), section: section ? (locale === 'en' ? englishSections[section.key] : section.title) : (locale === 'en' ? 'Other' : '其他文档'), body };
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

export async function getDocPaths(locale: 'zh' | 'en') {
  const docs = await getDocs(locale);
  const base = docHref('index', locale);
  return docs.map((doc, index) => ({
    params: { slug: doc.href.slice(base.length).replace(/\/$/, '') || undefined },
    props: { doc, docs, previous: docs[index - 1], next: docs[index + 1] },
  }));
}

export async function docsSearchResponse(locale: 'zh' | 'en') {
  const docs = await getDocs(locale);
  return new Response(JSON.stringify(docs.map(({ title, href, section, body }) => ({
    title, href, section, text: plainText(body),
  }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
