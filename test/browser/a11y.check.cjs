// 빌드된 사이트를 실제 브라우저로 열어 키보드·라우트 회귀를 확인하는 실행형 점검.
// `npm test` 에는 포함되지 않는다(브라우저와 빌드 산출물이 필요).
//
//   cd _site && python3 -m http.server 4000 --bind 127.0.0.1 &
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node test/browser/a11y.check.cjs http://127.0.0.1:4000
const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core')

const base = (process.argv[2] || 'http://127.0.0.1:4000').replace(/\/$/, '')
const checks = []
const check = (name, fn) => checks.push([name, fn])
const active = page => page.evaluate(() => {
  const el = document.activeElement
  return { id: el.id, tag: el.tagName, inDialog: !!el.closest('.search-dialog'), text: (el.textContent || '').trim().slice(0, 40) }
})

check('/wiki/ forwards to the wiki index without breaking /wiki/index/', async page => {
  await page.goto(`${base}/wiki/?q=1#top`)
  await page.waitForURL(/\/wiki\/index\/\?q=1#top$/)
  assert.ok(await page.locator('[data-catalog]').count(), 'wiki index catalog rendered')
  const direct = await page.goto(`${base}/wiki/index/`)
  assert.equal(direct.status(), 200)
})

check('search dialog traps Tab/Shift+Tab, closes on Escape and restores focus', async page => {
  await page.goto(`${base}/reviews/`)
  const trigger = page.locator('[data-search-open]')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('.global-search-result')
  assert.equal(await page.evaluate(() => document.activeElement.matches('[data-global-search]')), true)
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab')
    assert.equal((await active(page)).inDialog, true, `Tab #${i + 1} escaped the dialog`)
  }
  await page.locator('[data-global-search]').focus()
  await page.keyboard.press('Shift+Tab')
  assert.equal(await page.evaluate(() => document.activeElement.matches('[data-search-close]')), true, 'Shift+Tab from input goes to close button')
  await page.keyboard.press('Shift+Tab')
  assert.equal((await active(page)).inDialog, true, 'Shift+Tab from first control wraps to the last')
  assert.equal(await page.evaluate(() => document.querySelector('main').inert), true, 'background is inert while open')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.search-overlay').isHidden(), true)
  assert.equal(await page.evaluate(() => document.activeElement.matches('[data-search-open]')), true, 'focus returns to trigger')
  assert.equal(await page.evaluate(() => document.querySelector('main').inert), false, 'background restored')
})

check('Cmd/Ctrl+K toggles the dialog and still searches', async page => {
  await page.goto(`${base}/wiki/index/`)
  await page.keyboard.press('ControlOrMeta+k')
  await page.waitForSelector('.global-search-result')
  await page.keyboard.type('spring')
  const count = await page.locator('.global-search-result').count()
  assert.ok(count > 0, 'search returns results')
  await page.keyboard.press('ControlOrMeta+k')
  assert.equal(await page.locator('.search-overlay').isHidden(), true)
})

check('with no focusable controls, Tab parks on the dialog', async page => {
  await page.goto(`${base}/reviews/`)
  await page.keyboard.press('ControlOrMeta+k')
  await page.evaluate(() => document.querySelectorAll('.search-dialog button, .search-dialog input, .search-dialog a').forEach(el => { el.hidden = true }))
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('search-dialog')), true)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.search-overlay').isHidden(), true)
})

check('graph: keyboard reaches the record list, selects a node and follows a connection', async page => {
  await page.goto(`${base}/graph/`)
  await page.waitForSelector('#graph-index:not([hidden])')
  await page.locator('#graph-canvas').focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'graph-index-search')
  await page.keyboard.type('tdd')
  const items = page.locator('.graph-index-item')
  assert.ok(await items.count() > 0, 'filter leaves matches')
  await page.keyboard.press('ArrowDown')
  const picked = await page.evaluate(() => document.activeElement.querySelector('strong').textContent)
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'ni-title')
  assert.equal(await page.locator('#ni-title').textContent(), picked)
  assert.ok((await page.locator('#ni-link').getAttribute('href')).startsWith('/'), 'open link points at the record')
  const next = page.locator('#ni-links-list button').first()
  if (await next.count()) {
    const nextTitle = await next.evaluate(el => el.firstChild.textContent)
    await next.focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.locator('#ni-title').textContent(), nextTitle)
  }
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#node-info').isHidden(), true)
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('graph-index-item')), true, 'focus returns to the list item')
})

check('graph: selection panel never covers zoom or filter controls on narrow screens', async page => {
  for (const width of [390, 720]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(`${base}/graph/`)
    await page.waitForSelector('#graph-index:not([hidden])')
    await page.locator('#graph-canvas').focus()
    await page.keyboard.press('Enter')
    // 연결이 많은 기록을 골라 패널이 가장 길어지는 경우를 본다.
    await page.keyboard.type('tidy')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await page.waitForSelector('#node-info:not([hidden])')
    assert.ok(await page.locator('#ni-links-list button').count() > 0, `${width}px: panel shows connections`)
    const layout = await page.evaluate(() => {
      const rect = sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom } }
      const zoom = [...document.querySelectorAll('#zoom-btns button')].map(button => {
        const r = button.getBoundingClientRect()
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return button === hit || button.contains(hit)
      })
      return { info: rect('#node-info'), zoom: rect('#zoom-btns'), toggle: rect('#panel-toggle'), graph: rect('.knowledge-graph'), zoomOnTop: zoom }
    })
    const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    assert.equal(overlaps(layout.info, layout.zoom), false, `${width}px: #node-info overlaps #zoom-btns ${JSON.stringify(layout)}`)
    assert.equal(overlaps(layout.info, layout.toggle), false, `${width}px: #node-info overlaps #panel-toggle`)
    assert.ok(layout.info.top >= layout.graph.top && layout.info.bottom <= layout.graph.bottom, `${width}px: #node-info escapes the graph`)
    assert.deepEqual(layout.zoomOnTop, [true, true, true], `${width}px: a zoom button is covered`)
    // 패널 안 마지막 연결 버튼까지 키보드로 닿고 보이는지.
    const last = page.locator('#ni-links-list button').last()
    await last.focus()
    assert.equal(await last.isVisible(), true)
    await page.keyboard.press('Escape')
  }
})

const pickFromIndex = async (page, query) => {
  await page.locator('#graph-canvas').focus()
  await page.keyboard.press('Enter')
  await page.keyboard.type(query)
  await page.keyboard.press('ArrowDown')
  const id = await page.evaluate(() => document.activeElement.dataset.nodeId)
  await page.keyboard.press('Enter')
  await page.waitForSelector('#node-info:not([hidden])')
  return id
}

/** Scroll `selector` into view and report whether its centre hit-tests to itself. */
const hitsItself = (page, selector) => page.evaluate(sel => {
  return [...document.querySelectorAll(sel)].map(el => {
    el.scrollIntoView({ block: 'nearest' })
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { sel, text: (el.textContent || '').trim().slice(0, 20), ok: el === hit || el.contains(hit) }
  })
}, selector)

check('graph: settings panel and selection panel both stay usable when open together', async page => {
  for (const width of [390, 720]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto(`${base}/graph/`)
    await page.waitForSelector('#graph-index:not([hidden])')
    if (await page.locator('#panel-toggle').isVisible()) await page.click('#panel-toggle')
    assert.equal(await page.locator('#graph-panel').isVisible(), true, `${width}px: settings panel open`)
    await pickFromIndex(page, 'tidy')
    assert.ok(await page.locator('#ni-links-list button').count() >= 6, `${width}px: long connection list`)
    await page.locator('.knowledge-graph').scrollIntoViewIfNeeded()
    const rects = await page.evaluate(() => Object.fromEntries(['#graph-panel', '#node-info', '#zoom-btns'].map(sel => {
      const r = document.querySelector(sel).getBoundingClientRect()
      return [sel, { left: r.left, right: r.right, top: r.top, bottom: r.bottom }]
    })))
    const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    assert.equal(overlaps(rects['#graph-panel'], rects['#node-info']), false, `${width}px: panels overlap ${JSON.stringify(rects)}`)
    assert.equal(overlaps(rects['#node-info'], rects['#zoom-btns']), false, `${width}px: selection panel covers zoom`)
    const hits = [
      ...await hitsItself(page, '#graph-panel button'),
      ...await hitsItself(page, '#node-info button, #node-info a'),
      ...await hitsItself(page, '#zoom-btns button'),
    ]
    const covered = hits.filter(h => !h.ok)
    assert.deepEqual(covered, [], `${width}px: covered controls ${JSON.stringify(covered)}`)
  }
})

check('graph: closing the panel after a graph rebuild returns focus to the same list item', async page => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${base}/graph/`)
  await page.waitForSelector('#graph-index:not([hidden])')
  await page.locator('#graph-canvas').focus()
  await page.keyboard.press('Enter')
  await page.keyboard.type('tidy')
  await page.keyboard.press('ArrowDown')
  await page.evaluate(() => document.activeElement.setAttribute('data-original', ''))
  const id = await page.evaluate(() => document.activeElement.dataset.nodeId)
  await page.keyboard.press('Enter')
  await page.waitForSelector('#node-info:not([hidden])')
  for (const control of ['#btn-weight', '#btn-wr']) {
    await page.locator(control).focus()
    await page.keyboard.press('Enter')
  }
  assert.equal(await page.locator('[data-original]').count(), 0, 'list was re-rendered by the rebuild')
  await page.locator('#ni-close').focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.locator('#node-info').isHidden(), true)
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('graph-index-item') && document.activeElement.dataset.nodeId), id)
  // Escape 경로도 같은 규칙을 따른다.
  await page.keyboard.press('Enter')
  await page.locator('#btn-weight').focus()
  await page.keyboard.press('Enter')
  await page.locator('#ni-title').focus()
  await page.keyboard.press('Escape')
  assert.equal(await page.evaluate(() => document.activeElement.dataset.nodeId), id)
})

check('graph embed: keyboard path opens an overlay index without breaking the full-bleed layout', async page => {
  await page.setViewportSize({ width: 480, height: 700 })
  await page.goto(`${base}/graph/?embed=1`)
  await page.waitForSelector('#graph-index:not([hidden])', { state: 'attached' })
  const noScroll = () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight && document.documentElement.scrollWidth <= window.innerWidth)
  assert.equal(await page.locator('#graph-index').isVisible(), false, 'index is not in the embed flow')
  assert.equal(await noScroll(), true, 'embed stays full-bleed while closed')
  await page.locator('#graph-canvas').focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'graph-index-search')
  assert.equal(await page.locator('#graph-index-search').isVisible(), true, 'search field is really visible')
  assert.equal(await noScroll(), true, 'overlay does not add page scroll')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('#graph-index').isVisible(), false, 'Escape closes the overlay')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'graph-canvas')
  await page.keyboard.press('Enter')
  await page.keyboard.type('tdd')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.waitForSelector('#node-info:not([hidden])')
  assert.equal(await page.locator('#graph-index').isVisible(), false, 'selection closes the overlay to reveal the panel')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'ni-title')
  const covered = (await hitsItself(page, '#node-info button, #node-info a')).filter(h => !h.ok)
  assert.deepEqual(covered, [], `embed: covered controls ${JSON.stringify(covered)}`)
  await page.keyboard.press('Escape')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'graph-canvas', 'focus falls back to the canvas')
  assert.equal(await noScroll(), true)
})

check('graph skip link opens the list', async page => {
  await page.goto(`${base}/graph/`)
  await page.waitForSelector('#graph-index:not([hidden])')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement.textContent), '기록 목록으로 이동')
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.id), 'graph-index-search')
})

check('graph header matches the shared header at every breakpoint', async page => {
  const metrics = () => page.evaluate(() => {
    const head = document.querySelector('.site-head,.graph-site-head')
    const nav = head.querySelector('nav')
    return [getComputedStyle(head).padding, getComputedStyle(nav).gap, getComputedStyle(nav.querySelector('a')).fontSize, getComputedStyle(head.querySelector('a')).fontSize].join(' ')
  })
  for (const width of [390, 720, 740, 760, 800]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${base}/reviews/`)
    const shared = await metrics()
    await page.goto(`${base}/graph/`)
    assert.equal(await metrics(), shared, `header drift at ${width}px`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, `horizontal overflow at ${width}px`)
  }
})

;(async () => {
  const browser = await chromium.launch()
  let failed = 0
  for (const [name, fn] of checks) {
    const page = await browser.newPage()
    try {
      await fn(page)
      console.log(`ok   ${name}`)
    } catch (error) {
      failed += 1
      console.log(`FAIL ${name}\n     ${error.message.split('\n').join('\n     ')}`)
    }
    await page.close()
  }
  await browser.close()
  process.exit(failed ? 1 : 0)
})()
