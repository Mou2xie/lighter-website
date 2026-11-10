# Lighter 官网

使用 Astro 构建的纯静态官网。保留已确认的首页风格，技术文档统一保存在本项目的 `doc/` 目录。部署时只需托管 `dist/`，不需要 Node 服务、数据库或运行时 API。

## 本地开发

需要 Node.js 22.22.0 或更高版本。

```sh
npm ci
npm run dev
```

开发地址以终端输出为准，默认是 `http://127.0.0.1:4321/`。

## 文档维护

`doc/` 是技术文档的唯一内容来源，已从 Lighter 框架项目迁入。以后直接在本项目修改、增加和提交文档，不在框架项目保留副本，也不需要检出框架仓库才能构建官网。

文档使用 Markdown，不要求添加 frontmatter。修改原文后重新构建；开发模式下 Markdown 更新会自动同步。分类和默认阅读顺序位于 `src/lib/docs.ts`，新文档会自动生成路由。

`llms.txt` 和 `llms-full.txt` 由官网构建流程从 Markdown 自动生成，无需手动编辑或保存重复内容。旧文档的独立生成脚本已由这套流程替代。

不要将 API key 写入官网文件；代码块里的环境变量仅是教程示例。

## 检查与构建

```sh
npm run verify
```

这会检查 Astro / TypeScript、测试文档链接转换、生成静态页面，并检查全部站内链接、锚点、文档覆盖率和搜索索引。

```sh
npm run build
npm run preview
```

`dev` 和 `preview` 仅用于本地预览。发布目录是 `dist/`，使用支持目录索引（`/docs/` 对应 `/docs/index.html`）的任意静态托管服务即可。将 `404.html` 配置为缺失页面，无需 SPA 回退。

## 项目结构

```text
doc/                技术文档的唯一源文件
src/
  components/       共享导航与页脚
  layouts/          页面基础布局
  pages/            首页、文档路由、404、静态索引
  styles/           品牌样式与文档排版
  scripts/          浏览器交互：导航、复制、站内搜索
  lib/              文档导航、链接转换与索引生成
scripts/            文档构建插件、静态产物检查
public/assets/      Lighter 原有 SVG 品牌素材
test/               文档链接与构建源测试
```

## 静态功能

- 每篇 Markdown 在构建时生成 HTML；相对 `.md` 链接转换为站内路由。
- 代码高亮、页内目录和 Mermaid 流程图均在构建时生成。
- 文档搜索仅在浏览器中读取构建好的 `/docs/search.json`，不发送搜索词。
- `/llms.txt`、`/llms-full.txt` 及其 `/docs/` 别名均为构建生成的文本文件。
- 网站不安装服务端适配器，不使用 SSR、服务端 actions 或数据库。
