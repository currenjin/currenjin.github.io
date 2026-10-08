// Build and serve _site first. NODE_PATH=<temporary Playwright modules> node tests/browser/toc-highlight.browser.cjs
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
    for (const articlePath of ['/wiki/grafana-loki-tempo/', '/posts/chapters/baccalaureate/humanities-volume/'])
    for (const width of [1440, 1100, 390]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
      const page = await context.newPage();
      assert.equal((await page.goto(base + articlePath, { waitUntil: 'networkidle' })).status(), 200);
      const articleKind = articlePath.startsWith('/wiki/') ? 'wiki' : 'post';
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (articleKind === 'post') {
        const summary = page.locator('.reading-series summary');
        assert.equal(await page.locator('.reading-series details').evaluate(d => d.open), false);
        assert(await page.evaluate(() => {
          const series = document.querySelector('.reading-series').getBoundingClientRect();
          const article = document.querySelector('.article-layout').getBoundingClientRect();
          return Math.abs(series.left - article.left) < 1 && Math.abs(series.right - article.right) < 1;
        }), 'Series must align with reading column, not run behind the desktop TOC');
        assert(await summary.innerText().then(t => t.includes('바칼로레아') && t.includes('현재 장')));
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('.reading-series details').evaluate(d => d.open), true);
        assert.equal(await page.locator('.reading-series-chapters a').count(), 9);
        assert.equal(await page.locator('.reading-series [aria-current="page"]').count(), 1);
        await page.keyboard.press('Space');
        assert.equal(await page.locator('.reading-series details').evaluate(d => d.open), false);
        assert.equal(await page.locator('.reading-chapter-nav a[rel="prev"],.reading-chapter-nav a[rel="next"]').count(), 2);
        if (evidence) await page.screenshot({ path: path.join(evidence, `series-${width}-${theme}.png`) });
      } else {
        assert.equal(await page.locator('.reading-series,.reading-chapter-nav').count(), 0);
      }
      results.push({ articleKind, width, theme, action: 'series-or-standalone-keyboard-overflow', passed: true });
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
      // Only target headings that can reach the activation threshold: short
      // question-only chapters may hit the page's maximum scroll first.
      const reachable = await page.evaluate(links => links.map((link, index) => ({
        index, y: scrollY + document.getElementById(decodeURIComponent(link.href.slice(1))).getBoundingClientRect().top - 30
      })).filter(h => h.y <= document.documentElement.scrollHeight - innerHeight).map(h => h.index), links);
      assert(reachable.length > 3, 'Need reachable body headings');
      for (const index of [reachable[Math.floor(reachable.length / 2)], reachable[Math.floor(reachable.length * 0.8)], reachable[2]]) {
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
        results.push({ articleKind, width, theme, action: `body-scroll-${index}`, ...m });
      }
      // Native focus with preventScroll isolates our handler from browser ancestor scrolling.
      for (const index of [links.length - 1, 0]) {
        const before = await page.evaluate(() => scrollY);
        await page.locator('#markdown-toc a').nth(index).evaluate(a => a.focus({ preventScroll: true }));
        const m = await metrics(page, '#markdown-toc a:focus'); visible(m); assert.equal(m.page, before);
        results.push({ articleKind, width, theme, action: `focus-${index}`, ...m });
      }
      if (width === 1440) {
        const before = await page.evaluate(() => scrollY);
        for (let i = 0; i < links.length - 1; i++) await page.keyboard.press('Tab');
        const m = await metrics(page, '#markdown-toc a:focus'); visible(m); assert.equal(m.page, before);
        results.push({ articleKind, width, theme, action: 'keyboard-tab-long-toc', ...m });
      }
      if (evidence) await page.locator('#markdown-toc').screenshot({ path: path.join(evidence, `toc-${articleKind}-${width}-${theme}.png`) });
      if (width <= 760) {
        await page.locator('.wiki-toc-toggle').click();
        assert.equal(await page.locator('#markdown-toc').evaluate(t => t.hidden), true);
        await page.evaluate(() => window.scrollTo(0, 2000)); await page.waitForTimeout(80);
        assert.equal(await page.locator('.wiki-toc-toggle').getAttribute('aria-expanded'), 'false');
      }
      await context.close();
    }
    // Real standalone Post has no series widget; headings may now have a TOC.
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(base + '/posts/', { waitUntil: 'networkidle' });
    const actualPost = await page.locator('a[href^="/posts/"]').evaluateAll(as => as.map(a => a.getAttribute('href')).find(h => h !== '/posts/' && !h.includes('#') && !h.includes('/chapters/')));
    assert(actualPost, 'Published standalone Post required');
    assert.equal((await page.goto(base + actualPost, { waitUntil: 'networkidle' })).status(), 200);
    assert.equal(await page.locator('.reading-series,.reading-chapter-nav,a[rel="prev"],a[rel="next"]').count(), 0);
    results.push({ action: 'standalone Post has no series navigation', path: actualPost, passed: true });
    console.log(JSON.stringify(results, null, 2));
    if (evidence) fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
