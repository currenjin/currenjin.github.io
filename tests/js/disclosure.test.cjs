const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
test('shared disclosure styles are restricted to authored prose', () => {
  const css=read('css/disclosure.css').replace(/\/\*[\s\S]*?\*\//g,'');
  for(const rule of css.matchAll(/([^{}]+)\{/g)) assert.ok(rule[1].trim().startsWith('.prose details'),rule[1]);
  assert.match(css,/content:"▸"/); assert.match(css,/content:"▾"/);
  assert.match(css,/cursor:pointer/); assert.match(css,/:focus-visible/);
  assert.doesNotMatch(css,/data-book|data-cover|wiki-toc|graph|ai-disclosure/);
});
test('graph and navigation retain their original disclosure markers',()=>{
  assert.doesNotMatch(read('_layouts/graph.html'),/css\/disclosure\.css/);
  assert.match(read('_layouts/graph.html'),/summary::after \{ content: "\+"/);
  assert.match(read('css/main.css'),/\.wiki-toc-toggle::after \{ content:"\+"/);
});
test('content summaries stay authored and native, without Kafka-specific patches',()=>{
  assert.match(read('_includes/head.html'),/css\/disclosure\.css/);
  assert.match(read('_wiki/kafka.md'),/<summary>해설<\/summary>/);
  assert.doesNotMatch(read('_wiki/kafka.md'),/answer-disclosure|answer-show/);
});
