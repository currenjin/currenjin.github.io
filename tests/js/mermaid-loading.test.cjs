const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/mermaid-init.js', 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));

test('Wiki invalidates the cached initializer when switching to conditional loading', () => {
  const layout = fs.readFileSync('_layouts/wiki.html', 'utf8');
  assert.match(layout, /mermaid-init\.js\?v=20261029-opt-1/);
  assert.doesNotMatch(layout, /<script[^>]+src="https:\/\/cdn\.jsdelivr\.net\/npm\/mermaid/);
});

function harness({ fence = false, manual = false, ready = 'complete', mermaid } = {}) {
  const events = {}, scripts = [], blocks = [];
  const element = text => ({ textContent: text, style: {}, dataset: {}, removeAttribute(name) { if (name === 'data-processed') delete this.processed; } });
  const code = element('graph TD; A-->B');
  const pre = { parentNode: { replaceChild(el) { blocks.push(el); fences.length = 0; } } };
  code.parentElement = pre;
  const fences = fence ? [code] : [];
  if (manual) blocks.push(element('sequenceDiagram\nA->>B: hello'));
  const document = {
    readyState: ready, documentElement: {},
    head: { appendChild(el) { scripts.push(el); } },
    createElement(tag) { return element(''); },
    querySelectorAll(selector) { return selector.startsWith('pre >') ? fences : blocks; },
    addEventListener(name, callback) { (events[name] ||= []).push(callback); }
  };
  const window = { mermaid };
  const run = () => vm.runInNewContext(source, { document, window, Promise, getComputedStyle: () => ({ getPropertyValue: () => ink }), console });
  let ink = '#292723';
  run();
  return { scripts, blocks, window, run, event(name) { for (const fn of events[name] || []) fn(); }, setInk(value) { ink = value; } };
}

test('pages without rendered diagrams never request Mermaid, including theme changes', async () => {
  const h = harness(); h.event('themechange'); await tick(); assert.equal(h.scripts.length, 0);
});

test('fences load the same CDN once through a shared promise and wait for DOM readiness', async () => {
  const calls = [];
  const h = harness({ fence: true, ready: 'loading' });
  assert.equal(h.scripts.length, 0);
  h.event('DOMContentLoaded'); h.event('themechange'); h.run(); h.event('DOMContentLoaded'); await tick();
  assert.equal(h.scripts.length, 1);
  assert.equal(h.scripts[0].src, 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js');
  h.window.mermaid = { initialize(config) { calls.push(config); }, async run() {} };
  h.scripts[0].onload(); await tick(); await tick();
  assert.ok(calls.length > 0);
  assert.equal(calls.at(-1).theme, 'base');
  assert.equal(calls.at(-1).startOnLoad, false);
  assert.equal(calls.at(-1).securityLevel, 'loose');
  assert.equal(calls.at(-1).themeVariables.primaryTextColor, '#292723');
  assert.equal(h.blocks[0].dataset.mermaidSrc, 'graph TD; A-->B');
});

test('theme changes during render are serialized and restore source only after the active run', async () => {
  const releases = [], inputs = [], colors = []; let active = 0, maximum = 0;
  let h;
  const mermaid = { initialize(config) { colors.push(config.themeVariables.primaryTextColor); }, run() {
    active++; maximum = Math.max(maximum, active); inputs.push(h.blocks[0].textContent);
    h.blocks[0].textContent = 'render in progress';
    return new Promise(resolve => releases.push(() => { active--; h.blocks[0].textContent = '<svg>done</svg>'; resolve(); }));
  } };
  h = harness({ manual: true, ready: 'loading', mermaid }); h.event('DOMContentLoaded'); await tick();
  h.setInk('#eeeeee'); h.event('themechange'); h.event('themechange'); await tick();
  assert.equal(h.blocks[0].textContent, 'render in progress');
  assert.equal(maximum, 1);
  releases.shift()(); await tick(); await tick();
  assert.equal(inputs.length, 2);
  assert.equal(inputs[1], 'sequenceDiagram\nA->>B: hello');
  assert.equal(colors.at(-1), '#eeeeee');
  releases.shift()(); await tick(); assert.equal(maximum, 1);
});

test('CDN failure leaves the original source readable without an unhandled rejection', async () => {
  const h = harness({ fence: true }); await tick();
  assert.equal(h.scripts.length, 1);
  h.scripts[0].onerror(new Error('offline')); await tick();
  assert.equal(h.blocks[0].textContent, 'graph TD; A-->B');
});

test('render failure restores source and a later theme change can render again', async () => {
  let fail = true, h, calls = 0;
  h = harness({ manual: true, ready: 'loading', mermaid: {
    initialize() {}, async run() { calls++; h.blocks[0].textContent = 'broken SVG'; if (fail) throw new Error('parse failed'); h.blocks[0].textContent = '<svg>ok</svg>'; }
  } });
  h.event('DOMContentLoaded'); await tick(); await tick();
  assert.equal(h.blocks[0].textContent, 'sequenceDiagram\nA->>B: hello');
  assert.equal(h.blocks[0].style.whiteSpace, 'pre-wrap');
  fail = false; h.event('themechange'); await tick(); await tick();
  assert.equal(calls, 2); assert.equal(h.blocks[0].textContent, '<svg>ok</svg>');
});
