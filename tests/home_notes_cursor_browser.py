#!/usr/bin/env python3
"""Exercise actual served Home assets in Chrome; no production server changes.

--site starts an ephemeral loopback server for a fresh Jekyll build. --overlay
is an explicit baseline-only asset substitution, never the default.
"""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
target = parser.add_mutually_exclusive_group(required=True)
target.add_argument('--url')
target.add_argument('--site')
parser.add_argument('--js', default=str(ROOT / 'js/home-notes.js'))
parser.add_argument('--overlay', action='store_true')
parser.add_argument('--evidence', required=True)
args = parser.parse_args()
out = Path(args.evidence)
out.mkdir(parents=True, exist_ok=True)
server = None
if not args.url:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=args.site))
    Thread(target=server.serve_forever, daemon=True).start()
    args.url = f'http://127.0.0.1:{server.server_port}/'

STATE = '''() => {
 const path=document.querySelector('.home-note-leader path');
 const panel=document.querySelector('.home-note:not([hidden])');
 const trigger=document.querySelector('[data-home-note][aria-expanded="true"]');
 const start=path.getPointAtLength(0), end=path.getPointAtLength(path.getTotalLength());
 return {d:path.getAttribute('d'),box:panel.getBoundingClientRect().toJSON(),
   mode:panel.dataset.placement,rects:[...trigger.getClientRects()].map(r=>r.toJSON()),
   paragraph:trigger.closest('p').getBoundingClientRect().toJSON(),
   references:[...document.querySelectorAll('[data-home-note]')].flatMap(e=>[...e.getClientRects()].map(r=>r.toJSON())),
   start:{x:start.x,y:start.y},end:{x:end.x,y:end.y}};
}'''

def settle(page):
    # Await real rendering opportunities rather than assume a 60Hz machine.
    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    page.wait_for_timeout(20)


def points(trigger):
    return trigger.evaluate('''el=>{const r=el.closest('p').getBoundingClientRect();
      return [[r.left+35,r.top+10],[r.left+95,r.top+10]]}''')


def on_edge(rect, point):
    return (rect['left']-.1 <= point['x'] <= rect['right']+.1
            and rect['top']-.1 <= point['y'] <= rect['bottom']+.1
            and min(abs(point['x']-rect['left']), abs(point['x']-rect['right']),
                    abs(point['y']-rect['top']), abs(point['y']-rect['bottom'])) < .1)


def geometry(state, pointer, width, height):
    s, e, box = state['start'], state['end'], state['box']
    dx, dy = e['x']-s['x'], e['y']-s['y']
    px, py = pointer[0]-s['x'], pointer[1]-s['y']
    length = (dx*dx+dy*dy)**0.5
    cross_distance = abs(dx*py-dy*px)/max(length, .001)
    t = (px*dx+py*dy)/max(length*length, .001)
    failures = []
    if not re.fullmatch(r'M [-\d.e+]+ [-\d.e+]+ L [-\d.e+]+ [-\d.e+]+', state['d']):
        failures.append('not one straight M…L segment')

    if not any(on_edge(r, s) for r in state['rects']):
        failures.append('source detached from annotation rectangle edge')
    if not on_edge(box, e):
        failures.append('endpoint detached from panel border')
    if not (box['left'] >= 11.9 and box['top'] >= 11.9 and box['right'] <= width-11.9 and box['bottom'] <= height-11.9):
        failures.append('panel outside viewport')
    para = state['paragraph']
    overlap = max(0, min(box['right'],para['right'])-max(box['left'],para['left'])) * max(0, min(box['bottom'],para['bottom'])-max(box['top'],para['top']))
    for rect in state['references']:
        covered = max(0,min(box['right'],rect['right'])-max(box['left'],rect['left'])) * max(0,min(box['bottom'],rect['bottom'])-max(box['top'],rect['top']))
        if covered > 1:
            failures.append(f'panel blocks an annotation: {covered}')
    return {'pointer':pointer,'perpendicular_px':cross_distance,'segment_t':t,'overlap_px2':overlap,'failures':failures,'state':state}


results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        for width in [1440, 1060, 390]:
            for theme in ['light', 'dark']:
                height = 1000 if width > 1000 else 844
                context = browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce', has_touch=width < 1000)
                context.add_init_script(f"localStorage.setItem('theme','{theme}')")
                context.add_init_script("document.addEventListener('pointermove',e=>{window.__notePointer=[e.clientX,e.clientY]},true)")
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                if args.overlay:
                    page.route('**/js/home-notes.js*', lambda r: r.fulfill(path=args.js, content_type='text/javascript'))
                    page.route('**/css/home-notes.css*', lambda r: r.fulfill(path=str(ROOT / 'css/home-notes.css'), content_type='text/css'))
                page.goto(args.url, wait_until='networkidle')
                page.wait_for_selector('[data-home-note][role="button"]')
                page.evaluate(f"document.documentElement.dataset.theme='{theme}'")
                ids = page.locator('[data-home-note]').evaluate_all('els=>els.map(el=>el.dataset.homeNote)')
                assert ids == ['song', 'socrates'], ids
                assert page.locator('.personal-intro > p').count() == 3
                for ident in ids:
                    trigger = page.locator(f'[data-home-note="{ident}"]')
                    panel = page.locator(f'#home-note-{ident}')
                    if width > 1000:
                        a, b = points(trigger)
                        receipts = []
                        for label, pointer in [('a', a), ('b', b)]:
                            page.mouse.move(*pointer)
                            panel.wait_for(state='visible')
                            settle(page)
                            state = page.evaluate(STATE)
                            actual_pointer = page.evaluate('window.__notePointer')
                            assert max(abs(a-b) for a,b in zip(pointer, actual_pointer)) < .1
                            receipts.append(geometry(state, actual_pointer, width, height))
                            page.screenshot(path=str(out / f'{width}-{theme}-{ident}-{label}.png'))
                        first, second = [r['state'] for r in receipts]
                        failures = [f for r in receipts for f in r['failures']]
                        if first['box'] == second['box']:
                            failures.append('panel did not move with the cursor')
                        (out / f'{width}-{theme}-{ident}.json').write_text(json.dumps(receipts, indent=2))
                        assert not failures, failures
                        # A 2px event must track, not recenter the popup in a 50px jump.
                        nearby = [b[0]+2,b[1]+1]
                        page.mouse.move(*nearby)
                        settle(page)
                        close = page.evaluate(STATE)
                        assert not geometry(close, nearby, width, height)['failures']
                        movement = ((close['box']['x']-second['box']['x'])**2+(close['box']['y']-second['box']['y'])**2)**.5
                        (out / f'{width}-{theme}-{ident}-nearby.json').write_text(json.dumps({'before':second,'after':close,'movement_px':movement}, indent=2))
                        assert .1 < movement < 50, movement
                        # Real-mouse integration complements the denser, full-paragraph
                        # per-frame sweep in home_notes_motion_browser.py.
                        page.keyboard.press('Escape')
                        page.locator('.site-head').click(position={'x':2,'y':2})
                        page.mouse.move(*a)
                        settle(page)
                        previous = page.evaluate(STATE)
                        trajectory = []
                        for step in range(1,13):
                            pointer = [a[0]+step*10,a[1]]
                            page.mouse.move(*pointer)
                            settle(page)
                            current = page.evaluate(STATE)
                            receipt = geometry(current, page.evaluate('window.__notePointer'), width, height)
                            travel = ((current['box']['x']-previous['box']['x'])**2+(current['box']['y']-previous['box']['y'])**2)**.5
                            trajectory.append({'pointer':pointer,'travel_px':travel,'receipt':receipt})
                            (out / f'{width}-{theme}-{ident}-trajectory.json').write_text(json.dumps(trajectory,indent=2))
                            assert not receipt['failures'], receipt
                            assert travel < 50, {'message':'small pointer event recentered popup','travel':travel,'before':previous,'after':current}
                            previous = current
                        page.evaluate('''pointer=>{
                          window.__notePathWrites=0;
                          const path=document.querySelector('.home-note-leader path');
                          window.__notePathObserver?.disconnect();
                          window.__notePathObserver=new MutationObserver(records=>window.__notePathWrites+=records.length);
                          window.__notePathObserver.observe(path,{attributes:true,attributeFilter:['d']});
                          const p=document.querySelector('[data-home-note][aria-expanded="true"]').closest('p');
                          for(let i=0;i<20;i++) p.dispatchEvent(new PointerEvent('pointermove',{
                            bubbles:true,pointerType:'mouse',clientX:pointer[0],clientY:pointer[1]}));
                        }''', pointer)
                        settle(page)
                        assert page.evaluate('window.__notePathWrites') == 1, {'message':'pointer burst was not rAF-coalesced','writes':page.evaluate('window.__notePathWrites'),'width':width,'theme':theme,'note':ident}
                        frozen = page.evaluate(STATE)
                        page.mouse.move(8,8)
                        page.wait_for_timeout(650)
                        assert page.evaluate(STATE) == frozen, 'mouseleave closed or moved note'
                        box = panel.bounding_box()
                        page.mouse.move(box['x']+10,box['y']+45)
                        page.mouse.move(*a)
                        settle(page)
                        assert page.evaluate(STATE) == frozen, 'panel transfer did not freeze'
                        # Environmental layout changes still reattach to live
                        # annotation fragments; pinning only stops pointer chase.
                        page.evaluate("window.scrollBy({top:20,behavior:'instant'})")
                        settle(page)
                        scrolled = page.evaluate(STATE)
                        assert any(on_edge(r, scrolled['start']) for r in scrolled['rects'])
                        assert scrolled['start'] != frozen['start'], 'scroll retained stale source coordinates'
                        page.set_viewport_size({'width':width+30,'height':height})
                        settle(page)
                        resized = page.evaluate(STATE)
                        assert any(on_edge(r, resized['start']) for r in resized['rects'])
                        assert resized['box']['right'] <= width+30-12
                        page.set_viewport_size({'width':width,'height':height})
                        page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                        settle(page)
                    else:
                        trigger.tap()
                        panel.wait_for(state='visible')
                        assert not page.locator('.home-note-leader').is_visible()
                        assert trigger.bounding_box()['y']+trigger.bounding_box()['height'] < panel.bounding_box()['y']
                        # Scroll source links into the sheet viewport; overscroll stays contained.
                        panel.locator('a').last.evaluate('el=>el.scrollIntoView({block:"nearest"})')
                        assert panel.locator('a').last.is_visible()
                        assert panel.evaluate('el=>getComputedStyle(el).overscrollBehaviorY') == 'contain'
                        page.screenshot(path=str(out / f'{width}-{theme}-{ident}.png'))
                    page.keyboard.press('Escape')
                    assert not panel.is_visible()
                    assert trigger.evaluate('el=>el===document.activeElement')
                    page.locator('.site-head').click(position={'x':2,'y':2})
                    trigger.focus()
                    panel.wait_for(state='visible')
                    if width > 1000:
                        settle(page)
                        keyboard = page.evaluate(STATE)
                        assert keyboard['box']['left'] >= 12 and keyboard['box']['right'] <= width-12
                        page.mouse.move(*points(trigger)[1])
                        page.wait_for_timeout(650)
                        assert page.evaluate(STATE) == keyboard, 'keyboard pin moved'
                    page.keyboard.press('Enter')
                    assert panel.locator('.home-note-close').evaluate('el=>el===document.activeElement')
                    page.keyboard.press('Escape')
                    # Explicit trigger click pins even after the focus handler opens it.
                    trigger.click()
                    assert panel.is_visible()
                    assert panel.locator('.home-note-close').evaluate('el=>el===document.activeElement')
                    page.locator('.site-head').click(position={'x':2,'y':2})
                    assert not panel.is_visible()
                    if width > 1000:
                        # Pointer-adjacent placement stays usable at viewport edges.
                        edge = trigger.evaluate('''el=>{const p=el.closest('p').getBoundingClientRect(),r=el.getClientRects()[0];
                          return [p.right-1,(r.top+r.bottom)/2]}''')
                        page.mouse.move(*edge)
                        panel.wait_for(state='visible')
                        settle(page)
                        edge_state = page.evaluate(STATE)
                        assert edge_state['mode'] == 'cursor-follow', edge_state
                        assert page.locator('.home-note-leader').is_visible()
                        assert not geometry(edge_state,edge,width,height)['failures']
                        assert edge_state['box']['left'] >= 12 and edge_state['box']['right'] <= width-12
                        assert edge_state['box']['top'] >= 12 and edge_state['box']['bottom'] <= height-12
                        (out / f'{width}-{theme}-{ident}-edge.json').write_text(json.dumps({'pointer':page.evaluate('window.__notePointer'),'state':edge_state,'line_hidden':False}, indent=2))
                        page.screenshot(path=str(out / f'{width}-{theme}-{ident}-edge.png'))
                        page.keyboard.press('Escape')
                        page.locator('.site-head').click(position={'x':2,'y':2})
                if width > 1000:
                    # Brief transit is ignored; deliberate hover switches without a half-second pause.
                    song = page.locator('[data-home-note="song"]')
                    socrates = page.locator('[data-home-note="socrates"]')
                    page.mouse.move(*points(song)[0])
                    page.locator('#home-note-song').wait_for(state='visible')
                    page.mouse.move(*points(socrates)[0])
                    page.wait_for_timeout(80)
                    assert page.locator('#home-note-song').is_visible(), 'incidental transit switched the note'
                    page.locator('#home-note-socrates').wait_for(state='visible', timeout=2000)
                    switched = page.evaluate(STATE)
                    assert not geometry(switched, page.evaluate('window.__notePointer'), width, height)['failures']
                    page.wait_for_timeout(300)
                    assert page.evaluate(STATE) == switched, 'autonomous geometry motion'
                    page.keyboard.press('Escape')
                assert not errors, errors
                results.append({'width':width,'theme':theme,'notes':ids,'passed':True})
                context.close()
        browser.close()
finally:
    if server:
        server.shutdown()
(out / 'results.json').write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
