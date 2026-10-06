const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.DISCLOSURE_BASE_URL||'http://127.0.0.1:4187';
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 let checks=0;
 try {
 for(const width of [1440,390]) for(const theme of ['light','dark']) {
  const c=await b.newContext({viewport:{width,height:900}});
  await c.addInitScript(t=>localStorage.setItem('theme',t),theme);
  const p=await c.newPage();
  await p.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  for(const slug of ['kafka','knou','grpc']) {
   await p.goto(base+'/wiki/'+slug+'/',{waitUntil:'domcontentloaded'});
   const s=p.locator('.prose details > summary').first();
   if(await s.count()===0) continue;
   assert.equal(await s.evaluate(e=>getComputedStyle(e).cursor),'pointer');
   assert.equal(await s.evaluate(e=>getComputedStyle(e,'::before').content),'"▸"');
   const box=await s.boundingBox(); await s.click({position:{x:box.width-3,y:box.height/2}});
   assert.equal(await s.evaluate(e=>e.parentNode.open),true);
   assert.equal(await s.evaluate(e=>getComputedStyle(e,'::after').content),'" 접기"');
   await p.keyboard.press('Tab'); await s.focus();
   assert.equal(await s.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
   await s.press('Enter'); assert.equal(await s.evaluate(e=>e.parentNode.open),false);
   await s.press('Space'); assert.equal(await s.evaluate(e=>e.parentNode.open),true);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)); checks++;
  }
  // Disabling the content stylesheet must make NO visual changes to site UI.
  for(const [url,sel] of [['/','[data-book-title-toggle], [data-book-toc-toggle], [data-cover-toggle]'],['/posts/','.archive-topic > summary'],['/wiki/kafka/','.wiki-toc-toggle, .ai-disclosure > summary']]) {
   await p.goto(base+url,{waitUntil:'domcontentloaded'});
   const snapshot=()=>p.locator(sel).evaluateAll(es=>es.map(e=>({css:getComputedStyle(e).cssText,before:getComputedStyle(e,'::before').content,after:getComputedStyle(e,'::after').content,cursor:getComputedStyle(e).cursor,bg:getComputedStyle(e).backgroundColor,display:getComputedStyle(e).display,padding:getComputedStyle(e).padding,border:getComputedStyle(e).border,rect:{w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}})));
   const a=await snapshot();
   await p.locator('link[href*="css/disclosure.css"]').evaluate(e=>e.sheet.disabled=true);
   assert.deepEqual(await snapshot(),a,'content CSS cannot affect '+url); checks++;
  }
  await p.goto(base+'/graph/',{waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('link[href*="css/disclosure.css"]').count(),0);checks++;
  await c.close();
 }
 console.log(JSON.stringify({result:'PASS',checks,contentOnly:true}));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
