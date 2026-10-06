// Build and serve _site first. NODE_PATH=<temporary Playwright modules> node test/toc-highlight.browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4068';
const evidence = process.env.EVIDENCE_DIR;

async function metrics(page, selector = '#markdown-toc a.active-toc') {
  return page.evaluate(selector => {
    const toc = document.querySelector('#markdown-toc'), link = toc.querySelector(selector.replace('#markdown-toc ', ''));
    const rect = toc.getBoundingClientRect(), label = getComputedStyle(toc, '::before');
    const labelHeight = label.position === 'sticky' ? parseFloat(label.height) + parseFloat(label.paddingTop) + parseFloat(label.paddingBottom) : 0;
    const entry = link?.getBoundingClientRect();
    return { hidden: toc.hidden, scroll: toc.scrollTop, page: scrollY, overflow: toc.scrollHeight > toc.clientHeight,
      top: rect.top + toc.clientTop + labelHeight, bottom: rect.top + toc.clientTop + toc.clientHeight,
      entryTop: entry?.top, entryBottom: entry?.bottom, active: link?.id };
  }, selector);
}
function visible(m) {
  assert(m.entryTop >= m.top - 1, JSON.stringify(m));
  assert(m.entryBottom <= m.bottom + 1, JSON.stringify(m));
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const results = [];
  try {
    for (const width of [1440, 1100, 390]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
      const page = await context.newPage();
      assert.equal((await page.goto(base + '/wiki/grafana-loki-tempo/', { waitUntil: 'networkidle' })).status(), 200);
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
      const links = await page.locator('#markdown-toc a').evaluateAll(links => links.map(a => ({ id: a.id, href: a.getAttribute('href') })));
      assert(links.length > 15, 'Use a genuinely long article TOC');
      if (width <= 760) {
        assert.equal(await page.locator('#markdown-toc').evaluate(t => t.hidden), true);
        await page.evaluate(() => window.scrollTo(0, 1000)); await page.waitForTimeout(80);
        assert.equal((await metrics(page)).hidden, true);
        assert.equal((await metrics(page)).scroll, 0);
        await page.locator('.wiki-toc-toggle').click();
        assert.equal(await page.locator('.wiki-toc-toggle').getAttribute('aria-expanded'), 'true');
      }
      for (const index of [Math.floor(links.length / 2), Math.floor(links.length * 0.8), 2]) {
        const intended = await page.evaluate(href => {
          const h = document.getElementById(decodeURIComponent(href.slice(1)));
          const y = scrollY + h.getBoundingClientRect().top - 30;
          window.scrollTo(0, y); return scrollY;
        }, links[index].href);
        await page.waitForFunction(id => document.querySelector('#markdown-toc .active-toc')?.id === id, links[index].id, { timeout: 3000 });
        const m = await metrics(page);
        assert.equal(m.active, links[index].id, JSON.stringify({ width, theme, index, m }));
        assert(Math.abs(m.page - intended) < 1, `TOC changed document scroll: ${JSON.stringify(m)}`);
        visible(m);
        results.push({ width, theme, action: `body-scroll-${index}`, ...m });
      }
      // Native focus with preventScroll isolates our handler from browser ancestor scrolling.
      for (const index of [links.length - 1, 0]) {
        const before = await page.evaluate(() => scrollY);
        await page.locator('#markdown-toc a').nth(index).evaluate(a => a.focus({ preventScroll: true }));
        const m = await metrics(page, '#markdown-toc a:focus'); visible(m); assert.equal(m.page, before);
        results.push({ width, theme, action: `focus-${index}`, ...m });
      }
      if (width === 1440) {
        const before = await page.evaluate(() => scrollY);
        for (let i = 0; i < links.length - 1; i++) await page.keyboard.press('Tab');
        const m = await metrics(page, '#markdown-toc a:focus'); visible(m); assert.equal(m.page, before);
        results.push({ width, theme, action: 'keyboard-tab-long-toc', ...m });
      }
      if (evidence) await page.locator('#markdown-toc').screenshot({ path: path.join(evidence, `toc-${width}-${theme}.png`) });
      if (width <= 760) {
        await page.locator('.wiki-toc-toggle').click();
        assert.equal(await page.locator('#markdown-toc').evaluate(t => t.hidden), true);
        await page.evaluate(() => window.scrollTo(0, 2000)); await page.waitForTimeout(80);
        assert.equal(await page.locator('.wiki-toc-toggle').getAttribute('aria-expanded'), 'false');
      }
      await context.close();
    }
    // Published Post articles currently have no authored TOC. Verify no auto-generation,
    // then compatibility with a DOM-only fixture rather than publish a new article.
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    // Discover an actual published Post via its index instead of assuming a slug.
    await page.goto(base + '/posts/', { waitUntil: 'networkidle' });
    const actualPost = await page.locator('a[href^="/posts/"]').evaluateAll(as => as.map(a => a.getAttribute('href')).find(h => h !== '/posts/'));
    assert(actualPost, 'Published Post required');
    assert.equal((await page.goto(base + actualPost, { waitUntil: 'networkidle' })).status(), 200);
    assert.equal(await page.locator('#markdown-toc, .wiki-toc-toggle').count(), 0);
    await page.evaluate(() => {
      const prose = document.querySelector('.wiki-article .prose, .post-content');
      const toc = document.createElement('ul'); toc.id = 'markdown-toc';
      for (let i = 0; i < 50; i++) {
        const li = document.createElement('li'), a = document.createElement('a');
        a.id = `markdown-toc-fixture-${i}`; a.href = `#fixture-${i}`; a.textContent = `DOM-only Post section ${i}`; li.append(a); toc.append(li);
        const h = document.createElement('h2'); h.id = `fixture-${i}`; h.textContent = `Section ${i}`; prose.append(h);
      }
      prose.prepend(toc);
    });
    await page.addScriptTag({ url: base + '/js/toc-highlight.js?v=3' });
    const before = await page.evaluate(() => scrollY);
    await page.locator('#markdown-toc a').last().evaluate(a => a.focus({ preventScroll: true }));
    const m = await metrics(page, '#markdown-toc a:focus'); visible(m); assert.equal(m.page, before);
    results.push({ action: 'Post DOM-only fixture focus', path: actualPost, ...m });
    console.log(JSON.stringify(results, null, 2));
    if (evidence) fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
