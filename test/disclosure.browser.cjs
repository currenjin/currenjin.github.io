/* Run against a built site: NODE_PATH=<temporary deps> node test/disclosure.browser.cjs
   No browser packages or evidence are written into the published tree. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.DISCLOSURE_BASE_URL || 'http://127.0.0.1:4176';
const out = process.env.DISCLOSURE_EVIDENCE || '/tmp/site-disclosure-evidence';
fs.mkdirSync(out, { recursive:true });
const results = [];
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    for (const width of [1440,390]) for (const theme of ['light','dark']) {
      const context = await browser.newContext({viewport:{width,height:900},colorScheme:theme==='light'?'dark':'light'});
      await context.addInitScript(theme => localStorage.setItem('theme',theme), theme);
      const page = await context.newPage();
      // External analytics/comment/cover availability is not a local UI dependency.
      await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin || route.request().url().startsWith('https://unpkg.com/force-graph@') ? route.continue() : route.abort());
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      const goto=async url=>{ await page.goto(base+url); await page.waitForLoadState('domcontentloaded'); assert.equal(await page.locator('html').getAttribute('data-theme'),theme); };
      const overflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'document overflow');
      const preservedLayout=async selectors=>{
        const measure=()=>page.evaluate(selectors=>selectors.map(selector=>{
          const el=document.querySelector(selector), s=getComputedStyle(el);
          return {selector,display:s.display,grid:s.gridTemplateColumns,font:s.font,gap:s.gap,width:el.getBoundingClientRect().width};
        }),selectors);
        const enhanced=await measure();
        await page.locator('link[href*="/css/disclosure.css"]').evaluate(el=>el.sheet.disabled=true);
        const baseline=await measure();
        await page.locator('link[href*="/css/disclosure.css"]').evaluate(el=>el.sheet.disabled=false);
        assert.deepEqual(enhanced,baseline,'existing custom layout preserved');
        results.push({width,theme,name:'layout parity',selectors});
      };
      const indicator=async(control,state,pseudo='::before')=>assert.equal(await control.evaluate((el,p)=>getComputedStyle(el,p).content,pseudo),JSON.stringify(state?'▾':'▸'));
      const state=async control=>control.evaluate(el=>el.tagName==='SUMMARY'?el.parentElement.open:el.getAttribute('aria-expanded')==='true');
      const check=async(control,name,pseudo='::before')=>{
        const initial=await state(control); const label=await control.textContent();
        await control.scrollIntoViewIfNeeded();
        assert.equal(await control.evaluate(el=>getComputedStyle(el).cursor),'pointer');
        await indicator(control,initial,pseudo);
        const normal=await control.evaluate(el=>getComputedStyle(el).backgroundColor);
        await control.hover();
        assert.notEqual(await control.evaluate(el=>getComputedStyle(el).backgroundColor),normal,'token hover');
        const box=await control.boundingBox();
        // Click the far edge of the header, not its text or chevron.
        await control.click({position:{x:box.width-3,y:box.height/2}});
        assert.equal(await state(control),!initial,name+' pointer open/close');
        await indicator(control,!initial,pseudo);
        await page.keyboard.press('Tab'); await control.focus();
        assert.equal(await control.evaluate(el=>el.matches(':focus-visible')),true);
        assert.equal(await control.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
        await control.press('Enter');
        assert.equal(await state(control),initial,name+' Enter');
        await control.press('Space');
        assert.equal(await state(control),!initial,name+' Space');
        await indicator(control,!initial,pseudo);
        await overflow();
        results.push({width,theme,name,initial,pointer:true,enter:true,space:true,focus:true,hover:true,label});
      };
      for (const slug of ['kafka','knou']) {
        await goto('/wiki/'+slug+'/');
        const control=page.locator('.prose details > summary').first();
        await check(control,slug+' prose');
        const prose=page.locator('.prose');
        assert.equal(await control.evaluate(el=>getComputedStyle(el).display),'block');
        assert.ok(Math.abs((await control.boundingBox()).width-(await prose.boundingBox()).width)<2);
        await page.screenshot({path:`${out}/${slug}-${width}-${theme}.png`});
        if(slug==='kafka') {
          await check(page.locator('.prose details > summary').last(),'source-title');
          await check(page.locator('.ai-disclosure > summary').first(),'AI');
          if(width<760) { await check(page.locator('.wiki-toc-toggle'),'mobile Wiki TOC','::after'); }
        }
      }
      await goto('/');
      await preservedLayout(['.home-ledger','.home-post-book .entry-summary','.home-post-book .review-line']);
      for(const selector of ['[data-theme-toggle]','.search-trigger']) {
        assert.equal(await page.locator(selector).evaluate(el=>getComputedStyle(el,'::before').content),'none');
      }
      const title=page.locator('[data-book-title-toggle]').first();
      assert.equal(await state(title),false,'Home all starts closed');
      await check(title,'Home series title');
      const secondary=page.locator('[data-book-toc-toggle]').first();
      assert.equal(await state(title),await state(secondary));
      await check(secondary,'Home list control');
      assert.equal(await state(title),await state(secondary));
      await page.screenshot({path:`${out}/home-${width}-${theme}.png`});
      await page.locator('[data-filter="post"]').click();
      assert.equal(await state(title),true,'Post filter opens Home books');
      await page.locator('[data-filter="all"]').click();
      assert.equal(await state(title),false,'All filter closes Home books');
      await check(page.locator('[data-cover-toggle]').first(),'Home cover');
      await goto('/posts/');
      await preservedLayout(['.catalog','.catalog-row','.archive-topic > summary']);
      await check(page.locator('.archive-topic > summary').first(),'Post catalog');
      assert.equal(await page.locator('.archive-topic > summary').first().evaluate(el=>getComputedStyle(el).display),'flex');
      await page.screenshot({path:`${out}/post-catalog-${width}-${theme}.png`});
      await goto('/posts/stars-unseen/');
      // Published Posts currently have no native details/TOC. DOM-only fixture
      // verifies their actual layout/styles and shared TOC script without new content.
      await page.locator('.prose').evaluate(el=>{
        el.insertAdjacentHTML('afterbegin','<details><summary>Post 본문 검증</summary><p>테스트 전용</p></details><ul id="markdown-toc"><li><a href="#fixture">검증 목차</a></li></ul><h2 id="fixture">검증</h2>');
      });
      await page.addScriptTag({url:base+'/js/toc-highlight.js'});
      await check(page.locator('.prose details > summary'),'Post DOM-only prose');
      if(width<760) await check(page.locator('.wiki-toc-toggle'),'Post DOM-only mobile TOC','::after');
      await goto('/graph/');
      await page.locator('#graph-index').waitFor({state:'visible'});
      await check(page.locator('#graph-index > summary'),'graph native');
      await page.screenshot({path:`${out}/graph-${width}-${theme}.png`});
      if(width<720) {
        const open=page.locator('#panel-toggle'), close=page.locator('#panel-collapse');
        await indicator(open,false);
        await open.click(); await indicator(close,true);
        await close.click();
        await page.keyboard.press('Tab'); await open.focus();
        assert.equal(await open.evaluate(el=>el.matches(':focus-visible')),true);
        await open.press('Enter'); await close.focus(); await close.press('Space');
        assert.equal(await open.getAttribute('aria-expanded'),'false');
        results.push({width,theme,name:'graph settings',pointer:true,enter:true,space:true,focus:true});
      }
      await overflow();
      assert.deepEqual(errors,[]);
      await context.close();
    }
    // Native fallback still works without JavaScript on both prose and catalog.
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
    const page=await context.newPage();
    for(const url of ['/wiki/kafka/','/wiki/knou/','/posts/']) {
      await page.goto(base+url); const summary=page.locator(url==='/posts/'?'.archive-topic > summary':'.prose details > summary').first();
      await summary.click(); assert.equal(await summary.evaluate(el=>el.parentElement.open),true);
      await summary.press('Enter'); assert.equal(await summary.evaluate(el=>el.parentElement.open),false);
      results.push({name:'no-JS '+url,native:true});
    }
    await context.close();
    fs.writeFileSync(out+'/results.json',JSON.stringify({result:'PASS',checks:results.length,results},null,2));
    console.log(JSON.stringify({result:'PASS',checks:results.length,evidence:out},null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
