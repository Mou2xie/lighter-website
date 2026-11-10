import { getDocs } from './docs';
import { resolveDocLink } from './doc-links.mjs';
import { localizePath, translate } from './i18n.mjs';

export async function llmsResponse(full = false, locale: 'zh' | 'en' = 'en') {
  const docs = await getDocs(locale);
  const t = (zh: string, en: string) => translate(locale, zh, en);
  const title = '# Lighter\n\n> ' + t('轻量的 TypeScript AI Agent 框架。当前为 Alpha 版本。', 'A lightweight TypeScript AI agent framework. Currently in alpha.') + '\n';
  const text = full
    ? title + docs.map(doc => `\n---\n\n${t('来源：', 'Source: ')}${doc.href}\n\n${doc.body.replace(/\]\(([^)]+)\)/g, (_, target) => `](${resolveDocLink(target, `${doc.entry.id}.md`)})`)}`).join('\n')
    : title + '\n' + t('从快速开始入手，再按任务查阅指南和 API。', 'Start with the quickstart, then explore the guides and API reference.') + '\n\n' + docs.map(doc => `- [${doc.title}](${doc.href}): ${doc.description}`).join('\n') + `\n\n[${t('完整文档', 'Full documentation')}](${localizePath('/llms-full.txt', locale)})\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
