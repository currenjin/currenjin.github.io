const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('every layout loads one shared disclosure stylesheet, including standalone graph', () => {
  for (const file of ['_includes/head.html', '_layouts/graph.html']) {
    assert.match(read(file), /css\/disclosure\.css/);
  }
});

test('disclosure affordances cover native and custom controls without theme or search buttons', () => {
  const css = read('css/disclosure.css');
  for (const selector of ['details > summary', '[data-book-title-toggle]', '[data-book-toc-toggle]', '[data-cover-toggle]', '.wiki-toc-toggle', '#panel-toggle', '#panel-collapse']) {
    assert.ok(css.includes(selector), selector);
  }
  assert.match(css, /content:\s*"▸"/);
  assert.match(css, /content:\s*"▾"/);
  assert.match(css, /cursor:\s*pointer/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /:hover/);
  assert.doesNotMatch(css, /theme-toggle|search-trigger|kafka|answer-disclosure/);
});

test('prose disclosures retain authored summaries and native no-JS state', () => {
  const kafka = read('_wiki/kafka.md');
  assert.doesNotMatch(kafka, /answer-disclosure|answer-show|answer-hide/);
  assert.match(kafka, /<summary>해설<\/summary>/);
  assert.match(kafka, /<summary>주장별 Kafka 4\.3 원문<\/summary>/);
  assert.match(read('css/disclosure.css'), /\.prose details > summary/);
});
