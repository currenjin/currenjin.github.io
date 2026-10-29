#!/usr/bin/env python3
"""Measure frame-to-frame note motion; synthetic traces isolate placement, real mouse checks switching."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import math
import re
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--site', required=True)
parser.add_argument('--evidence', required=True)
args = parser.parse_args()
out = Path(args.evidence)
out.mkdir(parents=True, exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass
server = ThreadingHTTPServer(('127.0.0.1',0), partial(Quiet,directory=args.site))
Thread(target=server.serve_forever,daemon=True).start()
results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome',headless=True)
        page = browser.new_page(viewport={'width':1060,'height':1000},reduced_motion='no-preference')
        page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='networkidle')
        for ident in ['song','socrates']:
            page.keyboard.press('Escape')
            page.mouse.move(5,5)
            trigger = page.locator(f'[data-home-note="{ident}"]')
            box = trigger.evaluate('e=>e.closest("p").getBoundingClientRect().toJSON()')
            page.mouse.move(box['left']+35,box['top']+10)
            page.wait_for_timeout(650)
            trace = page.evaluate('''async ident => {
              const trigger=document.querySelector(`[data-home-note="${ident}"]`), p=trigger.closest('p');
              const r=p.getBoundingClientRect(), panel=document.getElementById(`home-note-${ident}`), trace=[];
              for(let i=0;i<=48;i++) {
                const x=r.left+35+(r.width-70)*i/48, y=r.top+10;
                p.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:x,clientY:y}));
                await new Promise(requestAnimationFrame);
                const b=panel.getBoundingClientRect();
                trace.push({x,y,left:b.left,top:b.top,width:b.width,height:b.height,visible:getComputedStyle(document.querySelector('.home-note-leader')).display!=='none',path:document.querySelector('.home-note-leader path').getAttribute('d')});
              }
              return trace;
            }''',ident)
            worst = max(({'jump':((b['left']-a['left'])**2+(b['top']-a['top'])**2)**.5,'cursor_step':b['x']-a['x'],'before':a,'after':b} for a,b in zip(trace,trace[1:])),key=lambda x:x['jump'])
            rects = trigger.evaluate('e=>[...e.getClientRects()].map(r=>r.toJSON())')
            results.append({'note':ident,'worst':worst,'trace':trace,'rects':rects})
        page.keyboard.press('Escape')
        page.mouse.move(5,5)
        first = page.locator('[data-home-note="song"]').evaluate('e=>e.closest("p").getBoundingClientRect().toJSON()')
        second = page.locator('[data-home-note="socrates"]').evaluate('e=>e.closest("p").getBoundingClientRect().toJSON()')
        page.mouse.move(first['left']+45,first['top']+10)
        page.wait_for_timeout(220)
        page.mouse.move(second['left']+45,second['top']+10)
        page.wait_for_timeout(80)
        assert page.locator('#home-note-song').is_visible(), 'incidental crossing must not switch immediately'
        page.wait_for_timeout(260)
        assert page.locator('#home-note-socrates').is_visible(), 'intentional switching still feels delayed'
        browser.close()
finally:
    server.shutdown()
    server.server_close()
(out/'motion.json').write_text(json.dumps(results,indent=2))
print(json.dumps([{'note':r['note'],'max_jump':r['worst']['jump'],'cursor_step':r['worst']['cursor_step']} for r in results]))
assert all(r['worst']['jump'] < 30 for r in results), 'small pointer steps caused a visible panel teleport'
for result in results:
    visible = [s for s in result['trace'] if s['visible']]
    assert len(visible) >= len(result['trace'])*.85, 'smoothing hides the connector instead of maintaining it'
    print(json.dumps({'note':result['note'],'visible_line_frames':len(visible),'total_frames':len(result['trace'])}))
    for state in visible:
        ax,ay,bx,by = map(float,re.findall(r'-?\d+(?:\.\d+)?',state['path']))
        def on_edge(x,y,r):
            return r['left']-.2<=x<=r['right']+.2 and r['top']-.2<=y<=r['bottom']+.2 and min(abs(x-r['left']),abs(x-r['right']),abs(y-r['top']),abs(y-r['bottom']))<.2
        assert any(on_edge(ax,ay,r) for r in result['rects']), 'line detached from its annotated phrase'
        box={'left':state['left'],'top':state['top'],'right':state['left']+state['width'],'bottom':state['top']+state['height']}
        assert on_edge(bx,by,box), 'line detached from the rendered moving panel'
