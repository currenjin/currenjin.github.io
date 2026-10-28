#!/usr/bin/env python3
"""Real Chrome cursor connector regression; overlay current assets on a built Home.

No production server configuration is changed. --site serves an existing build on
an ephemeral loopback port; --url can target the live site. By default, markup and
assets are tested as served. --overlay explicitly substitutes local sources for
baseline regression checks only.
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
parser.add_argument('--overlay', action='store_true', help='Explicit local source overlay for baseline regression only')
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
 return {d:path.getAttribute('d'),box:panel?.getBoundingClientRect().toJSON()};
}'''
# Sample the real SVG path against browser-rendered text ranges, not source regex.
CLEAR = '''() => {
 const path=document.querySelector('.home-note-leader path');
 const walker=document.createTreeWalker(document.querySelector('.personal-intro'),NodeFilter.SHOW_TEXT);
 const rects=[]; let node;
 while(node=walker.nextNode()) {
   if(!node.textContent.trim()) continue;
   const range=document.createRange();range.selectNodeContents(node);
   rects.push(...[...range.getClientRects()].filter(r=>r.width>0&&r.height>0));
 }
 const hits=[];
 for(let i=0;i<=path.getTotalLength();i+=0.5) {
   const p=path.getPointAtLength(i);
   if(rects.some(r=>p.x>r.left-.5&&p.x<r.right+.5&&p.y>r.top-.5&&p.y<r.bottom+.5)) hits.push({x:p.x,y:p.y});
 }
 return hits.slice(0,5);
}'''

def settle(page):
    page.wait_for_timeout(70)


def points(page, trigger):
    return trigger.evaluate('''el=>{const r=el.closest('p').getBoundingClientRect();
      return [[r.left+35,r.top+10],[r.right-35,r.top+10],[r.left+90,r.bottom-10]]}''')


def clear(page):
    hits = page.evaluate(CLEAR)
    assert not hits, f'connector intersects rendered text: {hits}'


results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        for width in [1440, 1060, 390]:
            for theme in ['light', 'dark']:
                context = browser.new_context(viewport={'width': width, 'height': 1000 if width > 1000 else 844}, reduced_motion='reduce', has_touch=width < 1000)
                context.add_init_script(f"localStorage.setItem('theme','{theme}')")
                page = context.new_page()
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                if args.overlay:
                    page.route('**/js/home-notes.js*', lambda r: r.fulfill(path=args.js, content_type='text/javascript'))
                    page.route('**/css/home-notes.css*', lambda r: r.fulfill(path=str(ROOT / 'css/home-notes.css'), content_type='text/css'))
                    for asset in ['css/main.css', 'css/home-cosmos.css']:
                        page.route('**/' + asset + '*', lambda r, request, asset=asset: r.fulfill(path=str(ROOT / asset), content_type='text/css'))
                    # Use the built page/layout, retaining current source prose and IDs.
                    def home(route):
                        response = route.fetch()
                        html = response.text()
                        source = (ROOT / 'index.html').read_text()
                        for pattern in [r'<section class="personal-intro"[\s\S]*?</section>', r'<aside class="home-notes"[\s\S]*?</aside>']:
                            fragment = re.search(pattern, source)
                            assert fragment, pattern
                            if re.search(pattern, html):
                                html = re.sub(pattern, lambda _: fragment.group(), html)
                            else:
                                html = html.replace('</main>', fragment.group() + '</main>')
                        # Older art-study previews predate the production class names.
                        # Only normalize those hooks; do not substitute illustration media.
                        html = html.replace('class="study-masthead"', 'class="study-masthead cosmic-masthead"').replace('class="study-type"', 'class="study-type cosmic-type"')
                        if '/css/home-cosmos.css' not in html:
                            html = html.replace('</head>', '<link rel="stylesheet" href="/css/home-cosmos.css"></head>')
                        if '/js/home-notes.js' not in html:
                            html = html.replace('</head>', '<link rel="stylesheet" href="/css/home-notes.css"><script defer src="/js/home-notes.js"></script></head>')
                        route.fulfill(response=response, body=html)
                    page.route(re.compile(re.escape(args.url.rstrip('/')) + r'/?$'), home)
                page.goto(args.url, wait_until='networkidle')
                page.wait_for_selector('[data-home-note][role="button"]')
                page.evaluate(f"document.documentElement.dataset.theme='{theme}'")
                ids = page.locator('[data-home-note]').evaluate_all('els=>els.map(el=>el.dataset.homeNote)')
                for ident in ids:
                    trigger = page.locator(f'[data-home-note="{ident}"]')
                    panel = page.locator(f'#home-note-{ident}')
                    if width > 1000:
                        a, b, c = points(page, trigger)
                        page.mouse.move(*a)
                        panel.wait_for(state='visible')
                        settle(page)
                        first = page.evaluate(STATE)
                        if width == 1440 and theme == 'light' and ident == ids[0]:
                            page.screenshot(path=str(out / 'cursor-point-a.png'))
                        page.mouse.move(*b)
                        settle(page)
                        second = page.evaluate(STATE)
                        if width == 1440 and theme == 'light' and ident == ids[0]:
                            page.screenshot(path=str(out / 'cursor-point-b.png'))
                            (out / 'cursor-states.json').write_text(json.dumps({'a': first, 'b': second}, indent=2))
                        assert first['d'] != second['d'], f'SVG origin did not follow two cursor positions in active paragraph: {first}, {second}, points={a,b}, errors={errors}'
                        assert first['box'] == second['box'], 'popup chased cursor'
                        clear(page)
                        page.mouse.move(*c)
                        settle(page)
                        clear(page)
                        frozen = page.evaluate(STATE)
                        page.mouse.move(8, 8)
                        page.wait_for_timeout(600)
                        assert page.evaluate(STATE) == frozen, 'connector moved after leaving active paragraph'
                        box = panel.bounding_box()
                        page.mouse.move(box['x'] + 10, box['y'] + 45)
                        page.mouse.move(*a)
                        settle(page)
                        assert page.evaluate(STATE) == frozen, 'panel pin did not freeze cursor origin'
                        page.screenshot(path=str(out / f'{width}-{theme}-{ident}.png'))
                        before_scroll = page.evaluate('scrollY')
                        page.evaluate("document.documentElement.style.scrollBehavior='auto'; window.scrollBy({top:40,behavior:'instant'})")
                        page.wait_for_function('(old)=>document.querySelector(".home-note-leader path").getAttribute("d")!==old', arg=frozen['d'])
                        settle(page)
                        assert page.evaluate(STATE)['d'] != frozen['d'], f'scroll did not recalculate connector: width={width}, id={ident}, scroll={before_scroll,page.evaluate("scrollY")}, frozen={frozen}, now={page.evaluate(STATE)}'
                        clear(page)
                        before_resize = page.evaluate(STATE)['d']
                        page.set_viewport_size({'width': width + 30, 'height': 1000})
                        page.wait_for_function('(old)=>document.querySelector(".home-note-leader path").getAttribute("d")!==old', arg=before_resize)
                        settle(page)
                        clear(page)
                        page.set_viewport_size({'width': width, 'height': 1000})
                        page.evaluate('window.scrollTo(0,0)')
                        settle(page)
                    else:
                        trigger.tap()
                        panel.wait_for(state='visible')
                        assert not page.locator('.home-note-leader').is_visible()
                        assert panel.locator('a').first.is_visible()
                        page.screenshot(path=str(out / f'{width}-{theme}-{ident}.png'))
                    page.keyboard.press('Escape')
                    # Restore-focus guard must not accidentally reopen the note.
                    assert not panel.is_visible()
                    page.locator('.site-head').click(position={'x': 2, 'y': 2})
                    trigger.focus()
                    panel.wait_for(state='visible')
                    if width > 1000:
                        settle(page)
                        clear(page)
                        keyboard = page.evaluate(STATE)
                        fallback = trigger.evaluate('''el=>{
                          const fragment=[...el.getClientRects()].reduce((a,b)=>a.left<b.left?a:b);
                          const point=document.querySelector('.home-note-leader path').getPointAtLength(0);
                          return {expected:fragment.left,x:point.x,y:point.y,bottom:fragment.bottom};
                        }''')
                        assert abs(fallback['x'] - fallback['expected']) < 1 and fallback['y'] > fallback['bottom'], fallback
                        page.mouse.move(*points(page, trigger)[1])
                        page.wait_for_timeout(600)
                        assert page.evaluate(STATE) == keyboard, 'keyboard-pinned origin moved autonomously'
                    page.keyboard.press('Enter')
                    assert panel.locator('.home-note-close').evaluate('el=>el===document.activeElement')
                    page.keyboard.press('Escape')
                assert not errors, errors
                results.append({'width': width, 'theme': theme, 'notes': ids, 'reduced_motion': True, 'passed': True})
                context.close()
        browser.close()
finally:
    if server:
        server.shutdown()
(out / 'results.json').write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
