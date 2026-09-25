const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const theme = require('../js/theme.js')

const root = path.join(__dirname, '..')
const read = p => fs.readFileSync(path.join(root, p), 'utf8')

const MAIN_CSS = read('css/main.css')
const GRAPH_LAYOUT = read('_layouts/graph.html')
const GRAPH_DOCK = read('_includes/graph-dock.html')
const BOOT = read('_includes/theme-boot.html')

/* ── helpers ──────────────────────────────────────────────── */

/** Pull `--name: value;` pairs out of the rule whose selector is `selector`. */
function tokenBlock (css, selector) {
  const start = css.indexOf(selector + ' {')
  assert.notEqual(start, -1, `selector not found: ${selector}`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  const body = css.slice(open + 1, close)
  const tokens = {}
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.replace(/\/\*[\s\S]*?\*\//g, '').trim()
  }
  return tokens
}

/** Strip every `:root`/`[data-theme]` rule so only consuming declarations remain. */
function withoutTokenBlocks (css) {
  return css.replace(/:root(\[data-theme="dark"\])?\s*\{[\s\S]*?\n\s*\}/g, '')
}

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/

const srgb = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
function luminance (hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
}
function contrast (a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const LIGHT = tokenBlock(MAIN_CSS, ':root')
const DARK = tokenBlock(MAIN_CSS, ':root[data-theme="dark"]')

/* ── 1. resolution: stored choice wins, system is the fallback ─ */

test('an explicit stored choice overrides the system preference', () => {
  assert.equal(theme.resolveTheme('dark', false), 'dark')
  assert.equal(theme.resolveTheme('light', true), 'light')
})

test('with no stored choice the system preference decides', () => {
  assert.equal(theme.resolveTheme(null, true), 'dark')
  assert.equal(theme.resolveTheme(null, false), 'light')
})

test('junk in storage falls back to the system preference rather than sticking', () => {
  for (const junk of ['', 'DARK', 'sepia', '0', undefined]) {
    assert.equal(theme.resolveTheme(junk, true), 'dark')
    assert.equal(theme.resolveTheme(junk, false), 'light')
  }
})

test('toggling alternates and always lands on a real theme', () => {
  assert.equal(theme.nextTheme('light'), 'dark')
  assert.equal(theme.nextTheme('dark'), 'light')
  assert.equal(theme.nextTheme(theme.nextTheme('light')), 'light')
  // An unset/damaged attribute must still produce a usable flip.
  assert.ok(theme.isTheme(theme.nextTheme(undefined)))
})

/* ── 2. the inline FOUC guard agrees with the module ───────── */

/** Run the inline boot script from theme-boot.html against a fake document. */
function runBoot ({ stored, prefersDark }) {
  const source = BOOT.match(/<script>([\s\S]*?)<\/script>/)[1]
  const element = { attributes: {}, style: {}, setAttribute (k, v) { this.attributes[k] = v } }
  const context = {
    localStorage: { getItem: () => stored },
    document: { documentElement: element },
    window: { matchMedia: query => ({ matches: query.includes('dark') && prefersDark }) },
  }
  vm.runInNewContext(source, context)
  return element
}

test('the inline boot guard resolves exactly like js/theme.js', () => {
  for (const stored of [null, 'light', 'dark', 'sepia']) {
    for (const prefersDark of [true, false]) {
      const element = runBoot({ stored, prefersDark })
      const expected = theme.resolveTheme(stored, prefersDark)
      assert.equal(element.attributes['data-theme'], expected, `stored=${stored} prefersDark=${prefersDark}`)
      // color-scheme must be set inline too, or the UA paints a white canvas first.
      assert.equal(element.style.colorScheme, expected)
    }
  }
})

test('the boot guard still picks a theme when storage throws', () => {
  const source = BOOT.match(/<script>([\s\S]*?)<\/script>/)[1]
  const element = { attributes: {}, style: {}, setAttribute (k, v) { this.attributes[k] = v } }
  vm.runInNewContext(source, {
    localStorage: { getItem () { throw new Error('blocked') } },
    document: { documentElement: element },
    window: {},
  })
  assert.equal(element.attributes['data-theme'], 'light')
})

test('theme-color meta values match the --paper token of each theme', () => {
  assert.equal(theme.THEME_COLOR.light, LIGHT['--paper'])
  assert.equal(theme.THEME_COLOR.dark, DARK['--paper'])
  for (const file of ['_includes/head.html', '_layouts/graph.html']) {
    const meta = read(file).match(/<meta name="theme-color" content="([^"]+)">/)
    assert.ok(meta, `${file} has no theme-color meta`)
    assert.equal(meta[1], LIGHT['--paper'], `${file} theme-color must start on the light ground`)
  }
})

/* ── 3. theme coverage: no colour escapes the token layer ──── */

test('no production stylesheet hard-codes a colour outside its token block', () => {
  const sources = {
    'css/main.css': MAIN_CSS,
    '_layouts/graph.html': GRAPH_LAYOUT,
    '_includes/graph-dock.html': GRAPH_DOCK,
  }
  for (const [name, css] of Object.entries(sources)) {
    const offenders = withoutTokenBlocks(css)
      .split('\n')
      .map((line, i) => [i + 1, line])
      // theme-color meta carries a literal by spec; it is asserted above instead.
      .filter(([, line]) => RAW_COLOR.test(line) && !line.includes('name="theme-color"'))
    assert.deepEqual(offenders, [], `${name} has hard-coded colours:\n${offenders.map(([n, l]) => `  ${n}: ${l.trim()}`).join('\n')}`)
  }
})

test('every themeable token in :root is re-declared for dark', () => {
  // Deliberately shared across themes: metrics, type stacks, and the syntax
  // palette (code sits on a dark ground in both themes).
  const shared = name => name.startsWith('--syn-') ||
    ['--measure', '--reading', '--sans', '--serif'].includes(name)

  const missing = Object.keys(LIGHT).filter(name => !shared(name) && !(name in DARK))
  assert.deepEqual(missing, [], `tokens with no dark value: ${missing.join(', ')}`)

  const stale = Object.keys(DARK).filter(name => !(name in LIGHT))
  assert.deepEqual(stale, [], `dark-only tokens with no light default: ${stale.join(', ')}`)

  for (const name of Object.keys(DARK)) {
    assert.notEqual(DARK[name], LIGHT[name], `${name} is identical in both themes — drop the override or change it`)
  }
})

test('both themes declare color-scheme so UA chrome follows', () => {
  assert.match(MAIN_CSS, /:root \{\s*\n\s*color-scheme: light;/)
  assert.match(MAIN_CSS, /:root\[data-theme="dark"\] \{\s*\n\s*color-scheme: dark;/)
})

test('the graph page mirrors the shared palette in its own --g-* tokens', () => {
  const gLight = tokenBlock(GRAPH_LAYOUT, ':root')
  const gDark = tokenBlock(GRAPH_LAYOUT, ':root[data-theme="dark"]')
  // /graph/ has its own <head> and does not load main.css, so the two copies
  // must be kept in step by hand — this is the check that catches drift.
  const mirrored = { '--g-paper': '--paper', '--g-surface': '--surface', '--g-ink': '--ink', '--g-muted': '--muted', '--g-faint': '--faint', '--g-line': '--line', '--g-focus': '--focus', '--g-wiki': '--accent' }
  for (const [g, shared] of Object.entries(mirrored)) {
    assert.equal(gLight[g], LIGHT[shared], `light ${g} drifted from ${shared}`)
    assert.equal(gDark[g], DARK[shared], `dark ${g} drifted from ${shared}`)
  }
  for (const name of Object.keys(gLight)) {
    if (name === '--g-serif' || name === '--g-sans') continue
    assert.ok(name in gDark, `${name} has no dark value`)
  }
})

test('the canvas reads its colours from the --g-* tokens the layout declares', () => {
  const graphJs = read('js/graph.js')
  const declared = new Set(Object.keys(tokenBlock(GRAPH_LAYOUT, ':root')))
  const used = [...graphJs.matchAll(/"(--g-[\w-]+)"/g)].map(m => m[1])
  assert.ok(used.length >= 12, 'graph.js should map every canvas colour to a token')
  for (const name of used) {
    assert.ok(declared.has(name), `js/graph.js reads ${name}, which _layouts/graph.html never declares`)
  }
})

/* ── 4. contrast: neither theme regresses on legibility ────── */

const AA = 4.5
const AAA = 7

test('body and prose text clear WCAG AAA on both grounds', () => {
  for (const [label, t] of [['light', LIGHT], ['dark', DARK]]) {
    for (const name of ['--ink', '--prose-ink', '--soft']) {
      const ratio = contrast(t[name], t['--paper'])
      assert.ok(ratio >= AAA, `${label} ${name} on --paper is ${ratio.toFixed(2)}:1, below ${AAA}:1`)
    }
  }
})

test('meta text and links clear WCAG AA on page and raised surfaces', () => {
  for (const [label, t] of [['light', LIGHT], ['dark', DARK]]) {
    for (const ground of ['--paper', '--surface']) {
      for (const name of ['--muted', '--accent']) {
        const ratio = contrast(t[name], t[ground])
        assert.ok(ratio >= AA, `${label} ${name} on ${ground} is ${ratio.toFixed(2)}:1, below ${AA}:1`)
      }
    }
  }
})

test('the focus ring clears the 3:1 non-text minimum', () => {
  for (const [label, t] of [['light', LIGHT], ['dark', DARK]]) {
    for (const ground of ['--paper', '--surface']) {
      const ratio = contrast(t['--focus'], t[ground])
      assert.ok(ratio >= 3, `${label} --focus on ${ground} is ${ratio.toFixed(2)}:1, below 3:1`)
    }
  }
})

test('code text stays legible on the code ground in both themes', () => {
  for (const [label, t] of [['light', LIGHT], ['dark', DARK]]) {
    const ratio = contrast(t['--code-ink'], t['--code-bg'])
    assert.ok(ratio >= AAA, `${label} --code-ink on --code-bg is ${ratio.toFixed(2)}:1`)
  }
})

test('syntax colours stay readable on either theme code ground', () => {
  const syntax = Object.entries(LIGHT).filter(([name]) => name.startsWith('--syn-'))
  for (const ground of [LIGHT['--code-bg'], DARK['--code-bg']]) {
    for (const [name, value] of syntax) {
      const ratio = contrast(value, ground)
      assert.ok(ratio >= 4, `${name} on ${ground} is ${ratio.toFixed(2)}:1`)
    }
  }
})

test('no theme regresses against the palette it replaced', () => {
  // The previous Newsprint palette, kept as the floor the new one must beat.
  const before = { '--ink': 15.41, '--muted': 4.65, '--accent': 5.16, '--faint': 2.54 }
  for (const [name, baseline] of Object.entries(before)) {
    for (const [label, t] of [['light', LIGHT], ['dark', DARK]]) {
      const ratio = contrast(t[name], t['--paper'])
      // --ink was already far past AAA; allow the approved palette's small dip
      // there, but hold the line everywhere else.
      const floor = name === '--ink' ? AAA : baseline
      assert.ok(ratio >= floor, `${label} ${name} is ${ratio.toFixed(2)}:1, under the ${floor} floor (was ${baseline})`)
    }
  }
})

/* ── 5. mount(): persistence and state sync end to end ─────── */

/** The smallest DOM mount() actually touches: a toggle button and a root. */
function fakeDom ({ stored = null, prefersDark = false } = {}) {
  const store = { value: stored }
  const listeners = {}
  const mark = { tagName: 'SPAN', attrs: { 'data-theme-toggle-mark': '' }, textContent: '' }
  const button = {
    tagName: 'BUTTON',
    attrs: { 'data-theme-toggle': '' },
    setAttribute (k, v) { this.attrs[k] = v },
    getAttribute (k) { return this.attrs[k] },
    querySelector: sel => (sel === '[data-theme-toggle-mark]' ? mark : null),
    closest (sel) { return sel === '[data-theme-toggle]' ? this : null },
  }
  mark.closest = sel => button.closest(sel)
  const meta = { attrs: {}, setAttribute (k, v) { this.attrs[k] = v } }
  const documentElement = {
    style: {},
    attrs: {},
    setAttribute (k, v) { this.attrs[k] = v },
    getAttribute (k) { return this.attrs[k] },
  }
  const doc = {
    documentElement,
    querySelectorAll: sel => (sel === '[data-theme-toggle]' ? [button] : []),
    querySelector: sel => (sel === 'meta[name="theme-color"]' ? meta : null),
    addEventListener (type, fn) { (listeners[type] = listeners[type] || []).push(fn) },
    dispatchEvent (event) { (listeners[event.type] || []).forEach(fn => fn(event)) },
  }
  const mediaListeners = []
  const win = {
    localStorage: {
      getItem: () => store.value,
      setItem: (_, v) => { store.value = v },
    },
    matchMedia: query => ({
      matches: query.includes('dark') && prefersDark,
      addEventListener: (_, fn) => mediaListeners.push(fn),
    }),
  }
  return {
    doc,
    win,
    button,
    mark,
    meta,
    store,
    root: documentElement,
    click: target => (listeners.click || []).forEach(fn => fn({ target: target || button })),
    systemChange: matches => mediaListeners.forEach(fn => fn({ matches })),
  }
}

test('mount paints the resolved theme and labels the control', () => {
  const dom = fakeDom({ prefersDark: true })
  theme.mount(dom.doc, dom.win)

  assert.equal(dom.root.getAttribute('data-theme'), 'dark')
  assert.equal(dom.root.style.colorScheme, 'dark')
  assert.equal(dom.button.getAttribute('aria-pressed'), 'true')
  assert.equal(dom.meta.attrs.content, DARK['--paper'])
  // Following the system is not an explicit choice, so nothing is persisted.
  assert.equal(dom.store.value, null)
})

test('clicking the toggle flips the theme, its state, and persists the choice', () => {
  const dom = fakeDom({ prefersDark: false })
  theme.mount(dom.doc, dom.win)
  assert.equal(dom.button.getAttribute('aria-pressed'), 'false')
  assert.equal(dom.mark.textContent, '○')

  dom.click()
  assert.equal(dom.root.getAttribute('data-theme'), 'dark')
  assert.equal(dom.root.style.colorScheme, 'dark')
  assert.equal(dom.button.getAttribute('aria-pressed'), 'true')
  assert.equal(dom.mark.textContent, '●')
  assert.equal(dom.meta.attrs.content, DARK['--paper'])
  assert.equal(dom.store.value, 'dark')

  dom.click()
  assert.equal(dom.root.getAttribute('data-theme'), 'light')
  assert.equal(dom.button.getAttribute('aria-pressed'), 'false')
  assert.equal(dom.store.value, 'light')
})

test('a click on the mark inside the button still toggles', () => {
  const dom = fakeDom()
  theme.mount(dom.doc, dom.win)
  dom.click(dom.mark)
  assert.equal(dom.root.getAttribute('data-theme'), 'dark')
})

test('the system preference is followed until the user chooses, then ignored', () => {
  const dom = fakeDom({ prefersDark: false })
  theme.mount(dom.doc, dom.win)

  dom.systemChange(true)
  assert.equal(dom.root.getAttribute('data-theme'), 'dark', 'no stored choice yet — follow the system')

  dom.click() // user picks light explicitly
  assert.equal(dom.store.value, 'light')

  dom.systemChange(true)
  assert.equal(dom.root.getAttribute('data-theme'), 'light', 'an explicit choice must survive a system change')
})

test('a stored choice beats the system preference at mount', () => {
  const dom = fakeDom({ stored: 'light', prefersDark: true })
  theme.mount(dom.doc, dom.win)
  assert.equal(dom.root.getAttribute('data-theme'), 'light')
})

test('mount notifies canvas and diagram listeners of the new theme', () => {
  const dom = fakeDom()
  const seen = []
  dom.doc.addEventListener(theme.EVENT, event => seen.push(event.detail.theme))
  theme.mount(dom.doc, dom.win)
  dom.click()
  assert.deepEqual(seen, ['light', 'dark'])
})

test('toggling still works when localStorage is unavailable', () => {
  const dom = fakeDom()
  dom.win.localStorage = null
  theme.mount(dom.doc, dom.win)
  dom.click()
  assert.equal(dom.root.getAttribute('data-theme'), 'dark')
})
