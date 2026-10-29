"""Compare real baseline/candidate sites without changing content or CSS.

python3 tests/site_optimization_browser.py BASELINE SITE EVIDENCE
Requires Python Playwright and installed Chromium.
"""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import base64
import json
from pathlib import Path
import sys
import threading
from playwright.sync_api import sync_playwright


@contextmanager
def serve(directory):
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(directory)))
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()


def context(browser, width, theme, motion='reduce'):
    ctx = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion=motion)
    ctx.add_init_script("localStorage.setItem('theme', %s)" % json.dumps(theme))
    ctx.route('**/googletagmanager.com/**', lambda route: route.abort())
    ctx.route('https://www.googletagmanager.com/**', lambda route: route.abort())
    ctx.route('https://utteranc.es/**', lambda route: route.abort())
    return ctx


def scroll_pose(page, progress):
    page.bring_to_front()
    page.evaluate('''progress => {
      const stage=document.querySelector('[data-review-stage]');
      const inner=document.querySelector('[data-review-stage-inner]');
      const head=document.querySelector('.site-head').getBoundingClientRect().height;
      const strip=document.querySelector('[data-review-strip]').getBoundingClientRect().height;
      const top=stage.getBoundingClientRect().top+scrollY;
      window.scrollTo({top:top-head-strip+(stage.offsetHeight-inner.offsetHeight)*progress,behavior:'instant'});
    }''', progress)
    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    page.wait_for_timeout(100)
    return page.locator('.review-scene-cover').evaluate_all(
        "nodes=>nodes.map(n=>({offset:n.dataset.offset,transform:n.style.transform,opacity:n.style.opacity}))")


def pixel_difference(browser, images):
    page = browser.new_page()
    try:
        return page.evaluate('''async sources => {
          const arrays=await Promise.all(sources.map(src=>new Promise(resolve=>{
            const image=new Image();image.onload=()=>{
              const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
              const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
              resolve({width:image.width,height:image.height,pixels:ctx.getImageData(0,0,image.width,image.height).data});
            };image.src=src;
          })));
          const [a,b]=arrays;let changed=0,maxDelta=0;
          if(a.width!==b.width||a.height!==b.height)throw Error('Image dimensions changed');
          for(let i=0;i<a.pixels.length;i+=4){let different=false;
            for(let channel=0;channel<4;channel++){
              const delta=Math.abs(a.pixels[i+channel]-b.pixels[i+channel]);
              maxDelta=Math.max(maxDelta,delta);different ||= delta>0;
            }if(different)changed++;
          }return {changedPixels:changed,maxDelta,totalPixels:a.width*a.height};
        }''', ['data:image/png;base64,' + base64.b64encode(image).decode() for image in images])
    finally:
        page.close()


def main(baseline, site, evidence):
    evidence.mkdir(parents=True, exist_ok=True)
    results = []
    errors = []
    with serve(baseline) as old, serve(site) as new, sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        try:
            for width in [1440, 390]:
                for theme in ['light', 'dark']:
                    contexts = [context(browser, width, theme) for _ in range(2)]
                    pages = [ctx.new_page() for ctx in contexts]
                    requests = []
                    pages[1].on('request', lambda req: requests.append(req.url))
                    for label, page, origin in zip(['baseline', 'candidate'], pages, [old, new]):
                        page.on('pageerror', lambda err: errors.append(str(err)))
                        assert page.goto(origin + '/', wait_until='load').status == 200
                        page.wait_for_function('window.cosmicState?.webgl && cosmicState.frames > 0')
                        page.wait_for_timeout(100)
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                        page.screenshot(path=str(evidence / ('home-%s-%s-%s.png' % (label, width, theme))))
                    images = [(evidence / ('home-%s-%s-%s.png' % (label, width, theme))).read_bytes()
                              for label in ['baseline', 'candidate']]
                    pixels = pixel_difference(browser, images)
                    # Permit only one-level antialiasing noise in at most 0.01% of pixels.
                    assert pixels['maxDelta'] <= 1 and pixels['changedPixels'] <= pixels['totalPixels'] * .0001, pixels
                    assert any('/js/home-cosmos.bundle.js' in url for url in requests)
                    assert not any('/js/vendor/three.' in url for url in requests)
                    assert pages[0].locator('main').inner_text() == pages[1].locator('main').inner_text()
                    results.append({'check': 'home-pixel-parity', 'width': width, 'theme': theme, 'pixels': pixels, 'passed': True})
                    for page, origin in zip(pages, [old, new]):
                        page.emulate_media(reduced_motion='no-preference')
                        page.goto(origin + '/reviews/', wait_until='load')
                        page.wait_for_selector('.review-gallery-ready')
                    for progress in [-2, 0, .5, 1, 3, .25]:
                        poses = [scroll_pose(page, progress) for page in pages]
                        if poses[0] != poses[1]:
                            metrics = [page.evaluate('''() => {
                              const s=document.querySelector('[data-review-stage]'),i=document.querySelector('[data-review-stage-inner]');
                              return {scrollY,hidden:document.hidden,stageHeight:s.offsetHeight,innerHeight:i.offsetHeight,stageTop:s.getBoundingClientRect().top,
                                head:document.querySelector('.site-head').getBoundingClientRect().height,
                                strip:document.querySelector('[data-review-strip]').getBoundingClientRect().height};
                            }''') for page in pages]
                            raise AssertionError({'width': width, 'theme': theme, 'progress': progress, 'poses': poses, 'metrics': metrics})
                    for page in pages:
                        page.evaluate('window.scrollTo(0,0)')
                        page.locator('[data-review-selectors] button').nth(2).focus()
                        page.keyboard.press('Enter')
                        assert page.locator('[data-review-selectors] button').nth(2).get_attribute('aria-pressed') == 'true'
                        assert page.locator('[data-review-selectors] button').nth(2).evaluate('n=>n===document.activeElement')
                        page.locator('[data-review-search]').fill('없는-작품-검색-검증')
                        assert page.locator('[data-review-stage]').is_hidden()
                        page.locator('[data-review-search]').fill('')
                        assert page.locator('[data-review-stage]').is_visible()
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                    results.append({'check': 'review-pose-selection-filter-parity', 'width': width, 'theme': theme, 'passed': True})
                    for ctx in contexts:
                        ctx.close()

            ctx = context(browser, 1440, 'light', 'no-preference')
            page = ctx.new_page()
            page.on('pageerror', lambda err: errors.append(str(err)))
            page.goto(new + '/', wait_until='load')
            page.wait_for_function('window.cosmicState?.webgl && cosmicState.frames > 3')
            canvas = page.locator('.cosmic-canvas')
            canvas.focus()
            page.keyboard.press('Enter')
            assert canvas.get_attribute('aria-pressed') == 'true'
            page.keyboard.press('Space')
            assert canvas.get_attribute('aria-pressed') == 'false'
            page.evaluate('window.scrollTo(0,document.body.scrollHeight)')
            page.wait_for_timeout(200)
            stopped = page.evaluate('cosmicState.frames')
            page.wait_for_timeout(150)
            assert page.evaluate('cosmicState.frames') == stopped
            page.evaluate('window.scrollTo(0,0)')
            page.wait_for_function('(n)=>cosmicState.frames>n', arg=stopped)
            page.evaluate("window.lossExtension=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');lossExtension.loseContext()")
            page.wait_for_function('!cosmicState.webgl')
            page.wait_for_timeout(150)
            page.evaluate('lossExtension.restoreContext()')
            page.wait_for_function('cosmicState.webgl')
            page.wait_for_function("document.querySelector('.cosmic-masthead').dataset.cosmicReady==='true'")
            results.append({'check': 'home-motion-keyboard-suspension-context-restoration', 'passed': True})
            ctx.close()

            ctx = context(browser, 1440, 'light')
            page = ctx.new_page()
            page.on('pageerror', lambda err: errors.append(str(err)))
            requests = []
            page.on('request', lambda req: requests.append(req.url))
            page.goto(new + '/wiki/kafka/', wait_until='load')
            assert page.locator('#parent-list').inner_text() == ''
            assert any('/js/parent.js' in url for url in requests), 'existing breadcrumb behavior stays in scope'
            assert not any('mermaid@' in url for url in requests)
            results.append({'check': 'wiki-unused-mermaid-and-unchanged-breadcrumbs', 'passed': True})
            page.goto(new + '/wiki/terraform/', wait_until='load')
            page.wait_for_function('''() => {
              const blocks=[...document.querySelectorAll('.mermaid')];
              return blocks.length>0 && blocks.every(b=>b.querySelector('svg'));
            }''', timeout=30000)
            count = page.locator('.mermaid').count()
            for _ in range(2):
                page.locator('[data-theme-toggle]').click()
                page.wait_for_timeout(150)
                page.wait_for_function('''() => [...document.querySelectorAll('.mermaid')].every(b=>b.querySelector('svg'))''')
            assert 'Syntax error in text' not in page.locator('body').inner_text()
            assert sum('mermaid@10/dist/mermaid.min.js' in url for url in requests) == 1
            results.append({'check': 'mermaid-render-and-theme-switch', 'diagrams': count, 'passed': True})
            ctx.close()
            assert not errors, errors
        finally:
            browser.close()
    (evidence / 'browser-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main(*(Path(arg).resolve() for arg in sys.argv[1:4]))
