import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readStatic = (name) => readFile(new URL(`../docs/${name}`, import.meta.url), 'utf8');

test('static markup contains the approved Formspree lead fields and no visible unit rate', async () => {
  const html = await readStatic('index.html');
  for (const snippet of [
    "formId: 'mvkgprzy'",
    'action="https://formspree.io/f/mvkgprzy"',
    'method="POST"',
    'id="lead-form"',
    'name="name"',
    'name="email"',
    'type="email"',
    'autocomplete="email"',
    'data-fs-error="email"',
    'name="phone"',
    'name="zipcode"',
    'name="square_footage"',
    'name="size_selection"',
    'name="finish"',
    'name="estimate_total"',
    'name="_subject"',
    'data-fs-success',
    'data-fs-error',
    'data-fs-submit-btn',
    'integrity="sha384-9fQrvHz7unHjhv7e+pJqhvNxPV4tYHHsSn3PxBIEyPTGY8Q/PAKM1sfhL+zTYmhc"',
  ]) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(html, /\$5|per square foot/i);
});

test('Formspree lead requests do not load retired bot-verification assets', async () => {
  const [html, app] = await Promise.all([readStatic('index.html'), readStatic('app.js')]);
  for (const source of [html, app]) {
    assert.doesNotMatch(source, /recaptcha|g-recaptcha-response/i);
  }
  assert.doesNotMatch(app, /stopImmediatePropagation\(\)/);
  assert.match(app, /syncLeadFields\(\);/);
});

test('wizard source declares every approved finish and garage path', async () => {
  const app = await readStatic('app.js');
  for (const label of [
    'Orbit', 'Cabin Fever', 'Wombat', 'Domino', 'Outback', 'Creekbed',
    'Carbon', 'Shist', 'Nightfall', 'Shoreline', 'Solid-color polyaspartic',
    'I know my square footage', 'Help me estimate it', '4+ cars / commercial',
  ]) {
    assert.match(app, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('styles include the required responsive and reduced-motion safeguards', async () => {
  const css = await readStatic('styles.css');
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /:focus-visible/);
});

test('Nginx preserves inherited document mappings while assigning JavaScript to MJS modules', async () => {
  const nginx = await readFile(new URL('../nginx.conf', import.meta.url), 'utf8');
  assert.doesNotMatch(nginx, /^\s*types\s*\{/m);
  assert.match(nginx, /location ~ \\.mjs\$ \{/);
  assert.match(nginx, /default_type application\/javascript;/);
});

test('visual shell uses local Titan branding, finished-floor imagery, and rounded surfaces', async () => {
  const [html, css] = await Promise.all([readStatic('index.html'), readStatic('styles.css')]);
  assert.match(html, /class="brand-logo" src="\.\/images\/titan-logo-transparent\.png" alt="Titan Garage Floors DFW"/);
  assert.doesNotMatch(html, /header-mark/);
  assert.match(css, /\.brand-logo \{[^}]*object-fit: contain;/);
  assert.match(css, /\.\/images\/finished-floor-1\.avif/);
  assert.match(css, /border-radius: 28px;/);
  assert.match(css, /\.step-panel h1:focus \{ outline: none; \}/);
  // Brightness, contrast, focus, and responsive geometry are exercised in
  // ui_regression.py rather than pinning the retired dark-theme CSS literals.
  for (const image of ['titan-logo-transparent.png', 'finished-floor-1.avif', 'finished-floor-2.avif', 'finished-floor-3.avif']) {
    const asset = await readFile(new URL(`../docs/images/${image}`, import.meta.url));
    assert.ok(asset.byteLength > 1_000, `${image} should be a local image asset`);
  }
});
