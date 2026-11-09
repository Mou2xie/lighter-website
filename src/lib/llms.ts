import { getDocs } from './docs';
import { resolveDocLink } from './doc-links.mjs';

export async function llmsResponse(full = false) {
  const docs = await getDocs();
  const title = '# Lighter\n\n> 轻量的 TypeScript AI Agent 框架。当前为 Alpha 版本。\n';
  const text = full
    ? title + docs.map(doc => `\n---\n\n来源：${doc.href}\n\n${doc.body.replace(/\]\(([^)]+)\)/g, (_, target) => `](${resolveDocLink(target, `${doc.id}.md`)})`)}`).join('\n')
    : title + '\n从快速开始入手，再按任务查阅指南和 API。\n\n' + docs.map(doc => `- [${doc.title}](${doc.href}): ${doc.description}`).join('\n') + '\n\n[完整文档](/llms-full.txt)\n';
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
