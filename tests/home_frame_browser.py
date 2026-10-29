#!/usr/bin/env python3
"""Check Home's bounded horizontal frame without changing vertical or mobile layout."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright

ap=argparse.ArgumentParser()
t=ap.add_mutually_exclusive_group(required=True)
t.add_argument('--site');t.add_argument('--url')
ap.add_argument('--evidence',required=True)
a=ap.parse_args()
out=Path(a.evidence);out.mkdir(parents=True,exist_ok=True)
server=None
if a.site:
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,format,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=a.site))
    Thread(target=server.serve_forever,daemon=True).start()
    a.url=f'http://127.0.0.1:{server.server_port}/'
results=[]
try:
    with sync_playwright() as p:
        b=p.chromium.launch(channel='chrome',headless=True)
        for w,h,theme in [(2560,1440,'light'),(2560,1440,'dark'),(1440,1000,'light'),(1060,1000,'light'),(390,844,'light'),(390,844,'dark')]:
            c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
            c.add_init_script(f'localStorage.setItem("theme","{theme}")')
            page=c.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(a.url,wait_until='networkidle');page.evaluate('document.fonts.ready')
            page.mouse.move(8,8)
            s=page.evaluate('''()=>{const r=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {hero:r('.home-opening'),intro:r('.personal-intro'),art:r('.cosmic-masthead'),ledger:r('.home-ledger'),overflow:document.documentElement.scrollWidth-innerWidth}}''')
            assert s['overflow']==0,s
            if w>1000:
                assert abs(s['hero']['width']-min(w-52,1320))<1,s
                assert abs(s['hero']['left']+s['hero']['right']-w)<1,s
                assert abs(s['art']['left']-s['intro']['right']-64)<1,s
                assert s['ledger']['left']==26, {'message':'catalogue must retain its original left edge',**s}
                assert s['intro']['width']<=640 and s['intro']['top']==s['art']['top']==140,s
            else:
                assert abs(s['intro']['top']-s['art']['bottom']-32)<1,s
                assert s['intro']['left']==s['art']['left']==17,s
            page.locator('.cosmic-masthead[data-cosmic-ready="true"]').wait_for(timeout=15000)
            if w in [2560,390]:page.screenshot(path=str(out/f'{w}-{theme}.png'))
            if w>1000:
                for ident in ['song','cosmos']:
                    page.locator(f'[data-home-note="{ident}"]').click()
                    panel=page.locator(f'#home-note-{ident}');panel.wait_for(state='visible')
                    box=panel.bounding_box()
                    assert box['x']>=s['intro']['right']+20 and box['x']+box['width']<=w,box
                    page.keyboard.press('Escape');assert not panel.is_visible()
            assert not errors,errors
            results.append({'width':w,'theme':theme,'geometry':s,'errors':errors})
            c.close()
        b.close()
finally:
    if server:server.shutdown();server.server_close()
(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps([{'width':r['width'],'theme':r['theme'],'frame_width':r['geometry']['hero']['width'],'overflow':r['geometry']['overflow']} for r in results],indent=2))
