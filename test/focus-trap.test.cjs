const test = require('node:test')
const assert = require('node:assert/strict')
const { wrapTarget, handleTab } = require('../js/focus-trap.js')

const a = { id: 'a' }
const b = { id: 'b' }
const c = { id: 'c' }

test('Tab on the last control wraps to the first; inside the list the browser moves focus', () => {
  assert.equal(wrapTarget([a, b, c], c, false), a)
  assert.equal(wrapTarget([a, b, c], a, false), null)
  assert.equal(wrapTarget([a, b, c], b, false), null)
})

test('Shift+Tab on the first control wraps to the last', () => {
  assert.equal(wrapTarget([a, b, c], a, true), c)
  assert.equal(wrapTarget([a, b, c], c, true), null)
})

test('focus sitting on the container itself enters at the matching end', () => {
  const container = { id: 'dialog' }
  assert.equal(wrapTarget([a, b, c], container, false), a)
  assert.equal(wrapTarget([a, b, c], container, true), c)
})

test('a single control keeps focus in both directions', () => {
  assert.equal(wrapTarget([a], a, false), a)
  assert.equal(wrapTarget([a], a, true), a)
})

test('with nothing focusable, Tab is swallowed and focus parks on the fallback', () => {
  let prevented = false
  let focused = null
  const container = { querySelectorAll: () => [] }
  const fallback = { focus () { focused = this } }
  const handled = handleTab(container, { key: 'Tab', target: fallback, preventDefault () { prevented = true } }, fallback)
  assert.equal(handled, true)
  assert.equal(prevented, true)
  assert.equal(focused, fallback)
})

test('non-Tab keys are left alone', () => {
  const container = { querySelectorAll: () => { throw new Error('should not query') } }
  assert.equal(handleTab(container, { key: 'Enter' }), false)
})

test('the search dialog loads the trap before ledger.js and wires it to the dialog', () => {
  const fs = require('node:fs')
  const path = require('node:path')
  const root = path.join(__dirname, '..')
  const head = fs.readFileSync(path.join(root, '_includes/head.html'), 'utf8')
  const ledger = fs.readFileSync(path.join(root, 'js/ledger.js'), 'utf8')
  assert.ok(head.indexOf('/js/focus-trap.js') !== -1, 'head.html must load focus-trap.js')
  assert.ok(head.indexOf('/js/focus-trap.js') < head.indexOf('/js/ledger.js'), 'focus-trap.js must load before ledger.js')
  assert.match(ledger, /FocusTrap\.handleTab\(dialog,e,dialog\)/)
})
