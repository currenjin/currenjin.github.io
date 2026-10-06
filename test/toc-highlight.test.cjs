const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/toc-highlight.js'), 'utf8');

function fixture({ mobile = false, sticky = true, overflow = true, initial = 0 } = {}) {
  const events = {}, tocEvents = {}, windowEvents = {};
  const toggle = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }, addEventListener(k, fn) { this[k] = fn; } };
  let current = initial;
  const links = [0, 1, 2].map(i => ({
    id: `markdown-toc-h${i}`, classList: { add() {}, remove() {} },
    getBoundingClientRect() { const top = 140 + i * 200 - toc.scrollTop; return { top, bottom: top + 40 }; },
    closest() { return this; }
  }));
  const toc = {
    hidden: false, scrollTop: 0, clientTop: 1, clientHeight: 300, scrollHeight: overflow ? 700 : 300,
    before() {}, contains: link => links.includes(link), getClientRects: () => toc.hidden ? [] : [{}],
    getBoundingClientRect: () => ({ top: 100, bottom: 402 }),
    querySelectorAll: () => links, addEventListener: (k, fn) => { tocEvents[k] = fn; }
  };
  const headings = links.map((_, i) => ({ id: `h${i}`, getBoundingClientRect: () => ({ top: (i - current) * 100 + 30 }) }));
  const query = { matches: mobile, addEventListener() {} };
  vm.runInNewContext(source, {
    document: { querySelector: s => s === '#markdown-toc' ? toc : { querySelectorAll: () => headings }, querySelectorAll: () => links, createElement: () => toggle, addEventListener: (k, fn) => { events[k] = fn; } },
    window: { matchMedia: () => query, addEventListener: (k, fn) => { windowEvents[k] = fn; }, getComputedStyle: () => ({ position: sticky ? 'sticky' : 'static', height: '18px', lineHeight: '18px', paddingTop: '4px', paddingBottom: '12px' }) }
  });
  return { toc, links, toggle, scroll(i) { current = i; events.scroll(); }, focus(i) { tocEvents.focusin?.({ target: links[i] }); }, resize() { windowEvents.resize?.(); } };
}

test('active entry below viewport reveals inside TOC only', () => {
  const f = fixture(); f.scroll(2); assert.equal(f.toc.scrollTop, 179);
});
test('entry above viewport clears sticky TOC label while scrolling back', () => {
  const f = fixture(); f.scroll(2); f.scroll(0); assert.equal(f.toc.scrollTop, 5);
});
test('already visible active entry does not move TOC', () => {
  const f = fixture(); f.scroll(1); assert.equal(f.toc.scrollTop, 0);
});
test('collapsed mobile stays hidden and does not scroll; opening reveals active entry', () => {
  const f = fixture({ mobile: true, sticky: false }); f.scroll(2);
  assert.equal(f.toc.hidden, true); assert.equal(f.toc.scrollTop, 0);
  f.toggle.click(); assert.equal(f.toc.hidden, false); assert.equal(f.toc.scrollTop, 179);
});
test('keyboard focus reveals entry below and above sticky label', () => {
  const f = fixture(); f.focus(2); assert.equal(f.toc.scrollTop, 179);
  f.focus(0); assert.equal(f.toc.scrollTop, 5);
});
test('initial active entry is revealed without waiting for document scroll', () => {
  const f = fixture({ initial: 2 }); assert.equal(f.toc.scrollTop, 179);
});
test('resize reveals current entry without toggling disclosure', () => {
  const f = fixture(); f.scroll(2); f.toc.scrollTop = 0; f.resize(); assert.equal(f.toc.scrollTop, 179);
});
test('non-overflowing TOC does not move', () => {
  const f = fixture({ overflow: false }); f.scroll(2); f.focus(2); assert.equal(f.toc.scrollTop, 0);
});
test('implementation never scrolls document or uses ancestor-scrolling API', () => {
  assert.doesNotMatch(source, /scrollIntoView|window\.scroll|document\.(?:body|documentElement)\.scroll/);
});
