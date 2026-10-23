const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = process.env.IDEMPOTENCY_BASE_URL;
const output = process.env.IDEMPOTENCY_EVIDENCE_DIR;
const site = process.env.IDEMPOTENCY_SITE_DIR;
assert(base && output && site, 'Set explicit local base URL, evidence directory and rendered site directory');
assert.equal(new URL(base).hostname, '127.0.0.1', 'local preview only');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const response = await fetch(base + '/wiki/idempotency/');
  assert.equal(response.status, 200);
  const served = Buffer.from(await response.arrayBuffer());
  const built = fs.readFileSync(path.join(site, 'wiki/idempotency/index.html'));
  assert.ok(served.equals(built), 'server is not serving this exact build');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const results = [];
  try {
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(t => localStorage.setItem('theme', t), theme);
        const page = await context.newPage();
        const errors = [];
        const failedLocal = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
          if (new URL(response.url()).origin === new URL(base).origin && response.status() >= 400)
            failedLocal.push({url: response.url(), status: response.status()});
        });
        await page.route('**/*', route => {
          if (new URL(route.request().url()).origin === new URL(base).origin) return route.continue();
          if (route.request().resourceType() === 'image' &&
              (route.request().url().startsWith('https://github.com/user-attachments/assets/') ||
               new URL(route.request().url()).hostname.endsWith('.amazonaws.com'))) return route.continue();
          return route.abort();
        });
        await page.goto(base + '/wiki/idempotency/', { waitUntil: 'networkidle' });
        assert.equal(await page.locator('article h2').filter({hasText: /^[1-8]장\./}).count(), 8);
        assert.equal(await page.locator('#markdown-toc').count(), 1);
        await page.locator('#parent-list a').waitFor();
        assert.equal(await page.locator('#parent-list a').last().getAttribute('href'), '/wiki/index');
        assert.match(await page.locator('#parent-list').innerText(), /상위 문서/);
        if (width === 390) {
          const toggle = page.locator('.wiki-toc-toggle');
          assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
          await toggle.click();
          assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        }
        const chapterLink = page.locator('#markdown-toc a').filter({hasText: /^4장\./}).first();
        await chapterLink.click();
        assert.ok(decodeURIComponent(new URL(page.url()).hash).includes('4장'));
        if (width === 390) await page.locator('.wiki-toc-toggle').click();
        await page.evaluate(() => scrollTo(0, 0));
        const overflow = await page.evaluate(() => ({width: innerWidth, scroll: document.documentElement.scrollWidth}));
        assert.ok(overflow.scroll <= overflow.width + 1, JSON.stringify(overflow));
        const actualTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        assert.equal(actualTheme, theme);
        await page.screenshot({path: path.join(output, `${width}-${theme}-top.png`)});
        await page.locator('#chapter-4').scrollIntoViewIfNeeded();
        const diagram = page.locator('article img');
        assert.equal(await diagram.count(), 1);
        await diagram.scrollIntoViewIfNeeded();
        await diagram.evaluate(async image => {
          await image.decode();
          if (!image.complete || image.naturalWidth !== 400) throw new Error('diagram decode failed');
          const box = image.getBoundingClientRect();
          if (box.left < 0 || box.right > innerWidth + 1) throw new Error('diagram overflow');
        });
        await page.screenshot({path: path.join(output, `${width}-${theme}-mechanism.png`)});
        await page.locator('article pre').first().scrollIntoViewIfNeeded();
        const codeScroll = await page.locator('article pre').first().evaluate(pre => {
          for (let element = pre; element && element !== document.body; element = element.parentElement) {
            if (element.scrollWidth > element.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(element).overflowX)) {
              element.scrollLeft = element.scrollWidth;
              const result = {scrollable: element.scrollLeft > 0, element: element.tagName};
              element.scrollLeft = 0;
              return result;
            }
          }
          return {scrollable: false};
        });
        if (width === 390) assert.ok(codeScroll.scrollable, 'mobile code must be horizontally accessible');
        await page.screenshot({path: path.join(output, `${width}-${theme}-code.png`)});
        const summary = page.locator('article details > summary').first();
        await summary.scrollIntoViewIfNeeded();
        await summary.click();
        assert.equal(await summary.evaluate(e => e.parentElement.open), true);
        await summary.focus();
        await summary.press('Enter');
        assert.equal(await summary.evaluate(e => e.parentElement.open), false);
        await summary.press('Space');
        assert.equal(await summary.evaluate(e => e.parentElement.open), true);
        const after = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
        assert.ok(after);
        assert.deepEqual(failedLocal, [], 'idempotency page requests must all succeed');
        await page.goto(base + '/wiki/distributed-transaction/', {waitUntil: 'networkidle'});
        const backlink = page.locator('article a[href="/wiki/idempotency/"]');
        assert.equal(await backlink.count(), 1);
        const relatedPageNetworkFailures = failedLocal.splice(0);
        await backlink.click();
        await page.waitForURL('**/wiki/idempotency/');
        assert.deepEqual(failedLocal, []);
        results.push({width, theme, actualTheme, chapters: 8, overflow: false,
          disclosurePointerEnterSpace: true, codeScroll, pageErrors: errors,
          metadataParent: true, tocNavigation: true, backlink: true,
          diagramDecoded: true, failedLocal, relatedPageNetworkFailures,
          unrelatedExternalRequestsBlocked: true});
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  const report = {result: 'PASS', servedSHA256: crypto.createHash('sha256').update(served).digest('hex'),
    browser: 'installed Google Chrome; isolated Playwright contexts', cases: results};
  fs.writeFileSync(path.join(output, 'browser-result.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
