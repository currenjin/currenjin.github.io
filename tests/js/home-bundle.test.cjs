const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const builder = path.join(root, 'scripts/generation/build-home.js');
const run = args => spawnSync(process.execPath, [builder, ...args], {cwd: root, encoding: 'utf8'});

test('Home scene bundle is reproducible from the unchanged scene and vendored Three.js', () => {
  const result = run(['--check']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const bundle = fs.readFileSync(path.join(root, 'js/home-cosmos.bundle.js'), 'utf8');
  const originalBytes = ['js/home-cosmos.js', 'js/vendor/three.module.js', 'js/vendor/three.core.js']
    .reduce((sum, name) => sum + fs.statSync(path.join(root, name)).size, 0);
  assert.ok(Buffer.byteLength(bundle) < originalBytes / 2, 'bundle must materially reduce parsed source bytes');
  assert.doesNotMatch(bundle, /from\s*["']\.\/vendor\//, 'scene bundle needs no vendor import waterfall');
  assert.match(bundle, /Copyright 2010-2025 Three\.js Authors/);
  assert.match(bundle, /SPDX-License-Identifier: MIT/);
  for (const contract of ['webglcontextlost', 'webglcontextrestored', 'prefers-reduced-motion', 'cosmicReady']) {
    assert.ok(bundle.includes(contract), contract);
  }
});

test('bundle generation supports a disposable output without modifying the tracked asset', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'home-bundle-'));
  try {
    const before = fs.readFileSync(path.join(root, 'js/home-cosmos.js'));
    const output = path.join(directory, 'scene.js');
    const result = run(['--output', output]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.deepEqual(fs.readFileSync(output), fs.readFileSync(path.join(root, 'js/home-cosmos.bundle.js')));
    assert.deepEqual(fs.readFileSync(path.join(root, 'js/home-cosmos.js')), before);
  } finally { fs.rmSync(directory, {recursive: true, force: true}); }
});

test('Home loads the optimized scene while retaining original public source URLs', () => {
  const head = fs.readFileSync(path.join(root, '_includes/head.html'), 'utf8');
  assert.match(head, /type="module"[^>]+src="[^"\n]*\/js\/home-cosmos\.bundle\.js/);
  assert.ok(fs.existsSync(path.join(root, 'js/home-cosmos.js')));
  assert.ok(fs.existsSync(path.join(root, 'js/vendor/three.module.js')));
  assert.ok(fs.existsSync(path.join(root, 'js/vendor/three.core.js')));
});
