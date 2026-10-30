const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = p => fs.readFileSync(path.join(__dirname, '../..', p), 'utf8');

test('Home, log archive and search use only the publication-safe activity view', () => {
  const home = read('index.html');
  assert.match(home, /plus: site\.activity_log\.size/);
  assert.match(home, /data-filter="log"/);
  assert.match(home, /for activity in site\.activity_log/);
  assert.match(home, /include activity-log-row\.html/);
  for (const file of ['index.html', 'log.html', 'search-index.json']) {
    const source = read(file);
    assert.match(source, /site\.activity_log/);
    assert.doesNotMatch(source, /site\.data\.activity_log/);
  }
  assert.doesNotMatch(read('graph-data.json'), /activity_log/);
  assert.match(read('_includes/site-header.html'), /page\.url == '\/log\/'/);
  const row = read('_includes/activity-log-row.html');
  assert.match(row, /data-kind="log"/);
  assert.match(row, /if activity\.project_url/);
  assert.match(row, /activity\.summary \| escape/);
  assert.match(row, /<a class="entry-link" href="\{\{ activity\.project_url \| escape \}\}">/);
  assert.ok(row.indexOf('<a class="entry-link"') < row.indexOf('<time'), 'Link wraps date, title and summary');
  assert.ok(row.indexOf('</a>') > row.indexOf('activity.summary | escape'), 'Summary is part of the clickable row');
  assert.match(read('css/main.css'), /\.entry\[data-kind="log"\] > \.entry-link\s*\{[^}]*display:grid/, 'A linked log keeps a focusable layout box');
});

test('activity labels are regular weight unless explicitly marked as achievements', () => {
  const css = read('css/main.css');
  assert.match(css, /\.entry\[data-kind="log"\] \.activity-result\s*\{[^}]*font:400 /);
  assert.match(css, /\.entry\[data-kind="log"\] \.activity-result--achievement\s*\{[^}]*font-weight:600/);
});

test('partial activity periods sort after precise records in their period without invented days', () => {
  const rows = ['2018', '2018-01', '2018-01-01', '2018-07', '2020-02', ''].map(date => ({dataset:{date}}));
  const ledger = {children:[...rows], appendChild(row) {this.children=this.children.filter(r=>r!==row).concat(row)}};
  const source=read('js/ledger.js');
  vm.runInNewContext(source.slice(source.indexOf('  const ledger='), source.indexOf('  const reviewGrid=')), {document:{querySelector:()=>ledger}});
  assert.deepEqual(ledger.children.map(r=>r.dataset.date), ['2020-02','2018-07','2018-01-01','2018-01','2018','']);
});

test('search sorts partial periods without publishing invented dates', async () => {
  const source=read('js/ledger.js');
  const loader=source.slice(source.indexOf('  const load='),source.indexOf('  // 모달 동안'));
  const input=['2018','2018-01','2018-01-01','2018-07'].map(updated=>({updated}));
  const actual=await vm.runInNewContext(`(async()=>{let records=[],loaded=false; ${loader} await load(); return records.map(r=>r.updated);})()`, {fetch:async()=>({ok:true,json:async()=>input})});
  assert.deepEqual(Array.from(actual),['2018-07','2018-01-01','2018-01','2018']);
});

test('existing mixed ledger sorts log rows and filters with accurate counts', () => {
  const rows = [
    { dataset: { kind: 'wiki', date: '2026-10-17' } },
    { dataset: { kind: 'log', date: '2026-10-18' } },
    { dataset: { kind: 'post', date: '2026-10-19' } },
  ];
  const ledger = { children: [...rows], appendChild(row) { this.children = this.children.filter(r => r !== row).concat(row); } };
  const source = read('js/ledger.js');
  vm.runInNewContext(source.slice(source.indexOf('  const ledger='), source.indexOf('  const reviewGrid=')), {
    document: { querySelector: () => ledger },
  });
  assert.deepEqual(ledger.children.map(r => r.dataset.kind), ['post', 'log', 'wiki']);
  const count = {}, empty = { dataset: {} };
  const buttons = ['all', 'wiki', 'post', 'review', 'log'].map(kind => ({
    dataset: { filter: kind }, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(name, fn) { this[name] = fn; },
  }));
  const scope = {
    classList: { contains: () => false },
    querySelectorAll: () => ledger.children,
    querySelector: sel => sel === '[data-result-count]' ? count : empty,
  };
  const group = { closest: () => scope, querySelectorAll: () => buttons };
  const start = source.indexOf("  document.querySelectorAll('[data-filter-group]')");
  const end = source.indexOf("  document.querySelectorAll('[data-preview-toggle]')");
  vm.runInNewContext(source.slice(start, end), { document: { querySelectorAll: () => [group] } });
  assert.equal(count.textContent, '3 / 3');
  buttons.find(b => b.dataset.filter === 'log').click();
  assert.deepEqual(rows.map(r => r.hidden), [true, false, true]);
  assert.equal(count.textContent, '1 / 3');
  assert.equal(buttons.at(-1).attrs['aria-pressed'], 'true');
  buttons[0].click();
  assert.ok(rows.every(r => !r.hidden));
});
