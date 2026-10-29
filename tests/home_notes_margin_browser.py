#!/usr/bin/env python3
"""Verify stationary Home margin notes and leaders that never cross prose."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
target=parser.add_mutually_exclusive_group(required=True)
target.add_argument('--site')
target.add_argument('--url')
parser.add_argument('--evidence',required=True)
args=parser.parse_args()
out=Path(args.evidence)
out.mkdir(parents=True,exist_ok=True)
server=None
if args.site:
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,format,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=args.site))
    Thread(target=server.serve_forever,daemon=True).start()
    args.url=f'http://127.0.0.1:{server.server_port}/'
CHECK='''() => {
 const intro=document.querySelector('.personal-intro'), panel=document.querySelector('.home-note:not([hidden])');
 const box=panel.getBoundingClientRect(), col=intro.getBoundingClientRect();
 const svg=document.querySelector('.home-note-leader'), path=svg.querySelector('path'), rects=[];
 const walk=document.createTreeWalker(intro,NodeFilter.SHOW_TEXT);
 while(walk.nextNode()) if(walk.currentNode.textContent.trim()) {
   const range=document.createRange(); range.selectNodeContents(walk.currentNode);
   rects.push(...[...range.getClientRects()].map(r=>r.toJSON()));
 }
 const hits=[];
 if(getComputedStyle(svg).display!=='none') for(let t=0;t<=path.getTotalLength();t+=1) {
   const p=path.getPointAtLength(t);
   if(rects.some(r=>p.x>r.left+.1&&p.x<r.right-.1&&p.y>r.top+.1&&p.y<r.bottom-.1)) hits.push({x:p.x,y:p.y});
 }
 return {box:box.toJSON(),column:col.toJSON(),d:path.getAttribute('d'),hits,
   lineVisible:getComputedStyle(svg).display!=='none',animations:panel.getAnimations({subtree:true}).filter(a=>a.playState==='running').length};
}'''
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        for width,height in [(1440,1000),(1060,1000),(1001,844),(390,844)]:
            for theme in ['light','dark']:
                context=browser.new_context(viewport={'width':width,'height':height},has_touch=width<=1000)
                context.add_init_script(f'localStorage.setItem("theme","{theme}")')
                page=context.new_page()
                errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.goto(args.url,wait_until='networkidle')
                page.evaluate('document.fonts.ready')
                assert page.locator('.personal-intro > p').count()==3
                assert page.locator('.home-inspiration-links a').all_text_contents()==['Phi Institute of Design','Apple','pgLang','John Grib']
                assert page.locator('.home-inspiration').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')==13
                for ident in ['song','cosmos']:
                    trigger=page.locator(f'[data-home-note="{ident}"]')
                    panel=page.locator(f'#home-note-{ident}')
                    if width>1000:
                        r=trigger.evaluate('e=>e.getClientRects()[0].toJSON()')
                        page.mouse.move(r['left']+r['width']/2,r['top']+r['height']/2)
                        panel.wait_for(state='visible')
                        page.wait_for_timeout(60)
                        state=page.evaluate(CHECK)
                        assert state['box']['right']<=state['column']['left']-20,state
                        assert state['box']['left']>=0 and state['box']['bottom']<=height,state
                        assert state['lineVisible'] and not state['hits'],state
                        assert state['animations']==0
                        points=trigger.evaluate('''e=>{const p=e.closest('p'),r=p.getBoundingClientRect(),all=[...p.querySelectorAll('[data-home-note]')],found=[];
                         const d=(a,x,y)=>Math.max(a.left-x,0,x-a.right)**2+Math.max(a.top-y,0,y-a.bottom)**2;
                         for(let x=r.left+8;x<r.right-8;x+=24)for(let y=r.top+8;y<r.bottom-8;y+=24){
                          const best=all.map(a=>({a,d:Math.min(...[...a.getClientRects()].map(t=>d(t,x,y)))})).sort((a,b)=>a.d-b.d)[0];
                          if(best.a===e)found.push([x,y]);
                         }return [found[0],found.at(-1)]}''')
                        for point in points:
                            page.mouse.move(*point)
                            page.wait_for_timeout(230)
                            after=page.evaluate(CHECK)
                            assert after['box']==state['box'] and after['d']==state['d'],'cursor moved stationary note or leader'
                        page.mouse.move(state['box']['x']+20,state['box']['y']+40)

                        page.mouse.move(8,8)
                        page.wait_for_timeout(230)
                        assert panel.is_visible()
                        page.evaluate('window.scrollBy({top:20,behavior:"instant"})')
                        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
                        scrolled=page.evaluate(CHECK)
                        assert not scrolled['hits'],scrolled
                        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
                        page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
                    else:
                        trigger.tap()
                        panel.wait_for(state='visible')
                        assert not page.locator('.home-note-leader').is_visible()
                        assert trigger.bounding_box()['y']+trigger.bounding_box()['height']<panel.bounding_box()['y']
                    assert panel.locator('a').first.is_visible()
                    page.screenshot(path=str(out/f'{width}-{theme}-{ident}.png'))
                    page.keyboard.press('Escape')
                    assert not panel.is_visible()
                    assert trigger.evaluate('e=>e===document.activeElement')
                    page.locator('.site-head').click(position={'x':2,'y':2})
                assert page.evaluate('document.documentElement.scrollWidth-innerWidth')==0
                assert not errors,errors
                results.append({'width':width,'theme':theme,'notes':['song','cosmos'],'static':True,'prose_intersections':0})
                context.close()
        browser.close()
finally:
    if server:server.shutdown();server.server_close()
(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
