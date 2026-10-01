// Run after the Docker build and static server: NODE_PATH=<playwright modules> node test/sticky-header.browser.cjs
// BASE_URL may point at Pages; CHROME_PATH overrides the local Chrome executable.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:4000';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    for (const width of [1440, 1100, 390]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => localStorage.setItem('theme', theme), theme);
      const page = await context.newPage();
      for (const path of ['/', '/wiki/', '/wiki/unit-test/', '/reviews/', '/graph/']) {
        const response = await page.goto(base + path, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, path);
        await page.locator('.site-head, .graph-site-head').waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        await page.evaluate(() => window.scrollTo(0, 600));
        await page.waitForTimeout(150);
        const metrics = await page.evaluate(() => {
          const head = document.querySelector('.site-head, .graph-site-head');
          const style = getComputedStyle(head), rect = head.getBoundingClientRect();
          const rule = getComputedStyle(head, '::after');
          return { top: rect.top, height: rect.height, scroll: scrollY, overflow: document.documentElement.scrollWidth - innerWidth,
            position: style.position, background: style.backgroundColor, paper: getComputedStyle(document.body).backgroundColor,
            shadow: style.boxShadow, padding: style.padding, rule: rule.borderBottomWidth };
        });
        assert(metrics.scroll > 0, `${path}: page did not scroll`);
        assert.equal(metrics.top, 0, `${path}: sticky top`);
        assert.equal(metrics.height, width > 760 ? 88 : 80, `${path}: unchanged height`);
        assert.equal(metrics.padding, width > 760 ? '22px 26px' : '18px 17px');
        assert.equal(metrics.overflow, 0, `${path}: horizontal overflow`);
        assert.equal(metrics.position, 'sticky');
        assert.equal(metrics.background, metrics.paper);
        assert.equal(metrics.shadow, 'none');
        assert.equal(metrics.rule, '1px');
        let anchor = null;
        if (path === '/wiki/unit-test/') {
          if (width <= 760) await page.locator('.wiki-toc-toggle').click();
          const link = page.locator('#markdown-toc a').nth(2);
          const href = await link.getAttribute('href');
          await link.click();
          await page.waitForTimeout(150);
          anchor = await page.evaluate(href => document.getElementById(decodeURIComponent(href.slice(1))).getBoundingClientRect().top, href);
          assert(anchor >= metrics.height, `TOC heading hidden: ${anchor}`);
          if (width === 1440) assert.equal(await page.locator('#markdown-toc').evaluate(el => getComputedStyle(el).top), '96px');
          // Direct fragment navigation must honor the same offset.
          await page.goto(base + path + href, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(200);
          assert(await page.evaluate(href => document.getElementById(decodeURIComponent(href.slice(1))).getBoundingClientRect().top >= document.querySelector('.site-head').getBoundingClientRect().bottom, href));
        }
        if (path !== '/graph/') {
          await page.locator('.search-trigger').click();
          await page.locator('[role="dialog"]').waitFor({ state: 'visible' });
          assert(await page.evaluate(() => {
            const overlay = document.querySelector('.search-overlay');
            return Number(getComputedStyle(overlay).zIndex) > Number(getComputedStyle(document.querySelector('.site-head')).zIndex)
              && overlay.contains(document.elementFromPoint(innerWidth / 2, 30));
          }), 'Search must paint above the header');
          await page.keyboard.press('Escape');
          await page.evaluate(() => window.scrollTo(0, 600));
          assert.equal(await page.locator('.site-head').evaluate(el => el.getBoundingClientRect().top), 0);
        }
        console.log(JSON.stringify({ base, width, theme, path, ...metrics, anchor, search: path !== '/graph/' ? 'above header' : 'standalone (no global search)' }));
      }
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
