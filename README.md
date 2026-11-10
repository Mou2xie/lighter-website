# Lighter Website

[![npm version](https://img.shields.io/npm/v/%40yong_xie%2Flighter)](https://www.npmjs.com/package/@yong_xie/lighter)

Website: [https://www.lighteragent.dev/](https://www.lighteragent.dev/)

The official Lighter website, built with Astro as a fully static site. It includes a bilingual homepage and technical documentation maintained in this repository's `doc/` directory. Deploy the generated `dist/` directory to any compatible static host; no Node.js server, database, or runtime API is required.

## Local Development

Requires Node.js 22.22.0 or later.

```sh
npm ci
npm run dev
```

Use the development URL printed in the terminal. The default is `http://127.0.0.1:4321/`.

## Maintaining Documentation

`doc/` is the single source of truth for technical documentation, migrated from the Lighter framework repository. Edit, add, and commit documentation here. There is no need to keep duplicate files in the framework repository or check it out to build the website.

Chinese documentation lives in `doc/`, with English translations in `doc/en/`. Both languages use matching relative file paths. Documents use Markdown and do not require frontmatter. Rebuild after editing source files; Markdown changes sync automatically during local development. Categories and the default reading order are defined in `src/lib/docs.ts`, and routes are generated automatically for new documents. Changes to link conversion, language routing, or diagram rendering rules invalidate the documentation cache on the next build.

The build generates `llms.txt` and `llms-full.txt` directly from Markdown. These files do not need manual editing or duplicate source content. This workflow replaces the previous standalone documentation generation scripts.

Do not include API keys in website files. Environment variables shown in code blocks are tutorial examples only.

## Validation and Build

```sh
npm run verify
```

This runs Astro and TypeScript checks, tests documentation link conversion, language routing, source ownership, cache invalidation, and diagram IDs, then builds the static site and validates internal links, anchors, translation coverage, language-switch destinations, search indexes, and generated documentation files.

```sh
npm run build
npm run preview
```

The `dev` and `preview` commands are for local preview. Deploy `dist/` to a static host that supports directory indexes (`/docs/` resolves to `/docs/index.html`). Configure `404.html` as the fallback for missing pages. No SPA fallback is needed.

## Project Structure

```text
doc/                Technical documentation source (Chinese)
  en/               Matching English translations
src/
  components/       Shared homepage, documentation, header, and footer components
  layouts/          Base page layout
  pages/            Homepages, documentation routes, 404 pages, and static indexes
  styles/           Brand styles and documentation typography
  scripts/          Browser interactions: navigation, copying, and local search
  lib/              Documentation navigation, localization, links, and indexes
scripts/            Documentation build plugins and static output validation
public/assets/      Lighter SVG brand assets
test/               Documentation, localization, and build source tests
```

## Features

- Each Markdown document becomes an HTML page at build time. Relative `.md` links are converted to internal routes.
- Syntax highlighting, table-of-contents entries, and Mermaid flowcharts are generated at build time.
- Documentation search runs in the browser using the current language's static index (`/docs/search.json` or `/zh/docs/search.json`). Search queries are not sent to a server.
- A **Copy page** button to the right of each document title copies the current article's rendered text, including code, to the clipboard. It excludes the page title, navigation, footer, and code-copy button labels. The Chinese label is **复制页面**.
- Individual code blocks have their own copy buttons. Both page and code copying show localized success or manual-copy feedback and use a fallback when the Clipboard API is unavailable or fails.
- `/llms.txt`, `/llms-full.txt`, and their `/docs/` aliases are generated as static text files.
- The site uses no server adapter, server-side rendering, server actions, or database.

## Bilingual Pages

- English is the default: the homepage is at `/` and documentation is under `/docs/`. The Chinese homepage is at `/zh/`, with documentation under `/zh/docs/`. Legacy `/en/` page URLs redirect to their English equivalents without a language prefix.
- The language switch at the right end of the header links to the current page's translation and preserves homepage section anchors.
- Both languages share homepage and documentation components to keep styles, animations, and features consistent.
- Search indexes, code examples, copy feedback, 404 pages, and `llms.txt` / `llms-full.txt` are localized for each language.
- Keep Chinese documents and their translations in `doc/en/` in sync. Every new document must have both language versions. `npm run verify` checks coverage, internal links, and language-switch destinations.
