const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const css = fs.readFileSync(path.join(root, 'css/main.css'), 'utf8')

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...css.matchAll(new RegExp(escaped + '\\s*\\{([^}]+)\\}', 'g'))]
  assert.ok(matches.length, `missing selector: ${selector}`)
  return matches.map(m => m[1]).join(';')
}

test('approved reading descriptions and review copy use the preview sizes', () => {
  for (const [selector, size] of [['.entry small',14],['.catalog-summary',14],['.global-search-copy small',14],['.review-archive-meta',13],['.review-archive-note',14]]) {
    assert.match(rule(selector), new RegExp(`(?:font-size:\\s*${size}px|font:\\s*${size}px/)`), selector)
  }
})

test('tables keep the approved 16px size at desktop and mobile', () => {
  const declarations = rule('.prose table')
  assert.match(declarations, /(?:font-size:\s*16px|font:\s*16px\/)/)
  assert.doesNotMatch(declarations, /(?:font-size:\s*(?:13|14)px|font:\s*(?:13|14)px\/)/)
})

test('current table-of-contents and series rows use their own selection surface', () => {
  assert.match(rule('.wiki-article #markdown-toc a.active-toc'), /background:var\(--reading-selection-bg\)/)
  assert.match(rule('.reading-series-chapters a[aria-current="page"]'), /background:var\(--reading-selection-bg\)/)
  assert.match(css, /--reading-selection-bg:\s*#eee8df/)
  const dark = css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)[1]
  assert.match(dark, /--reading-selection-bg:\s*#14110f/)
})

test('review cards use the readable excerpt filter instead of deleting paragraph boundaries', () => {
  const card = fs.readFileSync(path.join(root, '_includes/review-card.html'), 'utf8')
  assert.match(card, /r\.content\s*\|\s*readable_excerpt:\s*145/)
  assert.doesNotMatch(card, /strip_html\s*\|\s*strip_newlines/)
})

test('image enhancement is shared, deferred and preserves percentage-width figures', () => {
  const head = fs.readFileSync(path.join(root, '_includes/head.html'), 'utf8')
  assert.match(head, /<script defer src="[^"\n]*content-images\.js/)
  assert.match(rule('.prose a.diagram-image'), /width:100%/)
  assert.doesNotMatch(rule('.prose a.diagram-image'), /fit-content/)
})
