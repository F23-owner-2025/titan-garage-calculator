import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

for (const name of ['index.html', 'privacy.html', 'app.js', 'styles.css']) {
  test(`${name} keeps local URLs under the GitHub Pages project path`, async () => {
    const source = await readFile(new URL(`../docs/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /(?:src|href)=["']\/(?!\/)|url\(["']?\/(?!\/)/);
  });
}

test('lead source preserves the project path without query parameters', async () => {
  const app = await readFile(new URL('../docs/app.js', import.meta.url), 'utf8');
  assert.match(app, /submittedFrom: new URL\('\.', window\.location\.href\)\.href/);
});
