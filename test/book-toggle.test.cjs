const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const root = path.join(__dirname, '..')
const read = p => fs.readFileSync(path.join(root, p), 'utf8')

test('home series title is an accessible disclosure, not a navigation link', () => {
  const home = read('index.html')
  assert.match(home, /<button class="entry-title"[^>]*data-book-title-toggle[^>]*aria-controls="book-toc-/)
  assert.doesNotMatch(home, /<a class="entry-title" href="{{ book.url/)
  assert.match(home, /<a class="entry-link" href="{{ post.url/)
})

test('title and list controls toggle the same panel without replacing the title', () => {
  const control = text => ({
    textContent: text, attrs: { 'aria-expanded': 'true' }, listeners: {},
    setAttribute(k, v) { this.attrs[k] = v },
    getAttribute(k) { return this.attrs[k] },
    addEventListener(k, fn) { this.listeners[k] = fn },
    click() { this.listeners.click?.() },
  })
  const title = control("'나'는 무엇인가. SERIES")
  const label = title.textContent
  const list = control('목록 닫기 −')
  const panel = { hidden: false }
  const entry = {
    querySelector: sel => sel === '.book-toc-panel' ? panel : sel === '[data-book-title-toggle]' ? title : list,
    querySelectorAll: () => [title, list],
  }
  // Execute the actual disclosure initialization, isolated from unrelated search UI.
  const source = read('js/ledger.js').split("  const ledger=document.querySelector")[0] + '})();'
  vm.runInNewContext(source, { document: { querySelectorAll: () => [entry] } })
  title.click()
  assert.equal(panel.hidden, true)
  assert.equal(title.attrs['aria-expanded'], 'false')
  assert.equal(list.attrs['aria-expanded'], 'false')
  assert.equal(list.textContent, '목록 보기 +')
  assert.equal(title.textContent, label)
  title.click()
  assert.equal(panel.hidden, false)
  list.click()
  assert.equal(panel.hidden, true)
  assert.equal(title.attrs['aria-expanded'], 'false')
  assert.equal(title.textContent, label)
})
