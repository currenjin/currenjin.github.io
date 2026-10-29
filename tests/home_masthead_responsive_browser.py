#!/usr/bin/env python3
"""Check that Home's wordmark remains in its own layout box at responsive widths."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
target = parser.add_mutually_exclusive_group(required=True)
target.add_argument('--site')
target.add_argument('--url')
parser.add_argument('--evidence', required=True)
args = parser.parse_args()
out = Path(args.evidence)
out.mkdir(parents=True, exist_ok=True)
server = None
if args.site:
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=args.site))
    Thread(target=server.serve_forever, daemon=True).start()
    args.url = f'http://127.0.0.1:{server.server_port}/'
results = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        for width, height in [(320,568),(390,844),(510,844),(511,844),(600,844),(760,844),(761,844),(820,844),(1000,844),(1001,844),(1280,720),(1440,900),(1920,1080),(844,390)]:
            context = browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce')
            page = context.new_page()
            page.goto(args.url, wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            state = page.evaluate('''() => {
              const r=s=>document.querySelector(s).getBoundingClientRect().toJSON();
              return {art:r('.cosmic-masthead'),name:r('.cosmic-type'),intro:r('.personal-intro'),
                font:parseFloat(getComputedStyle(document.querySelector('.cosmic-type')).fontSize),
                overflow:document.documentElement.scrollWidth-innerWidth};
            }''')
            if width in [390,510,600,760,820,1000,1440,844]:
                page.screenshot(path=str(out / f'{width}x{height}.png'))
            assert state['overflow'] == 0, {'width':width, **state}
            assert state['name']['bottom'] <= state['art']['bottom'] + 1, {'message':'wordmark escapes its reserved layout box','width':width, **state}
            if width <= 1000:
                gap = state['intro']['top'] - state['name']['bottom']
                assert gap >= 24, {'message':'wordmark invades introduction','width':width,'gap':gap, **state}
                assert state['font'] <= 150.1
                state['name_intro_gap'] = gap
            results.append({'width':width,'height':height,**state})
            context.close()
        browser.close()
finally:
    if server:
        server.shutdown()
(out / 'results.json').write_text(json.dumps(results, indent=2))
print(json.dumps([{'width':r['width'],'height':r['height'],'gap':r.get('name_intro_gap'),'overflow':r['overflow']} for r in results], indent=2))
