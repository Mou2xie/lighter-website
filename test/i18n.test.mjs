import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localeFromPath, localizePath } from '../src/lib/i18n.mjs';

test('English is the default and only the full zh segment selects Chinese', () => {
  assert.equal(localeFromPath('/'), 'en');
  assert.equal(localeFromPath('/docs/'), 'en');
  assert.equal(localeFromPath('/zh/'), 'zh');
  assert.equal(localeFromPath('/zh/docs/'), 'zh');
  assert.equal(localeFromPath('/zhong/'), 'en');
  assert.equal(localeFromPath('/en/docs/'), 'en');
});

test('switching language preserves the article, query, and shared anchor', () => {
  for (const route of ['/', '/docs/', '/docs/providers/', '/docs/reference/agent/?from=nav#run', '/#quickstart', '/llms.txt']) {
    const chinese = localizePath(route, 'zh');
    assert.equal(chinese, '/zh' + route);
    assert.equal(localizePath(chinese, 'en'), route);
    assert.equal(localizePath(chinese, 'zh'), chinese);
  }
  assert.equal(localizePath('/404.html', 'zh'), '/zh/404/');
  assert.equal(localizePath('/zh/404/', 'en'), '/404.html');
});

test('legacy English addresses resolve to the unprefixed English page', () => {
  assert.equal(localizePath('/en/', 'en'), '/');
  assert.equal(localizePath('/en/docs/getting-started/quickstart/?from=old#run', 'en'), '/docs/getting-started/quickstart/?from=old#run');
  assert.equal(localizePath('/en/docs/providers/', 'zh'), '/zh/docs/providers/');
  assert.equal(localizePath('/en/404/', 'en'), '/404.html');
});
