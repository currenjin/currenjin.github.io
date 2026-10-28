"""Exercise local Home changes on the real live origin without publishing.

python3 tests/home_cosmos_no_flash.py https://currenjin.github.io EVIDENCE
Only Home's masthead, CSS URL, stylesheet and entry module are intercepted.
All other HTML, dependencies and assets come from the live site.
"""
import argparse
import json
import os
# A deliberately pending ES module also delays document.fonts.ready.
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY'] = '1'
from pathlib import Path
import re
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def blank_scene(page):
    assert page.locator('.cosmic-masthead img:visible').count() == 0, 'old static shape visible'
    assert not page.locator('.cosmic-canvas').is_visible(), 'unrendered canvas visible'
    assert page.locator('.cosmic-type').is_visible()
    assert page.locator('.personal-intro p').count() == 3
    assert page.locator('.cosmic-masthead').get_attribute('data-cosmic-ready') is None
    assert page.evaluate("() => { const c=document.querySelector('canvas'); c.focus(); return document.activeElement !== c; }"), 'dead canvas accepts keyboard focus'
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')


def overlay(route):
    path = urlsplit(route.request.url).path
    if path == '/':
        response = route.fetch()
        html = response.text()
        source = (ROOT / 'index.html').read_text()
        masthead = re.search(r'<section class="cosmic-masthead"[\s\S]*?</section>', source).group()
        masthead = re.sub(r"{{\s*'([^']+)'\s*\|\s*relative_url\s*}}", r'\1', masthead)
        html, count = re.subn(r'<section class="cosmic-masthead"[\s\S]*?</section>', lambda _: masthead, html)
        assert count == 1, 'live Home masthead missing'
        head = (ROOT / '_includes/head.html').read_text()
        css_url = re.search(r'/css/home-cosmos.css\?v=[^\s\'\"}]+', head).group()
        html = re.sub(r'/css/home-cosmos.css\?v=[^\s\"\']+', css_url, html)
        route.fulfill(response=response, body=html)
    elif path in ['/css/home-cosmos.css', '/js/home-cosmos.js']:
        route.fulfill(path=str(ROOT / path.lstrip('/')), content_type='text/css' if path.endswith('.css') else 'text/javascript')
    else:
        route.continue_()


def verify(origin, evidence):
    evidence.mkdir(parents=True, exist_ok=True)
    receipts = {'origin': origin, 'local_overlay': ['Home masthead', 'Home CSS URL', 'css/home-cosmos.css', 'js/home-cosmos.js'], 'cases': []}
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for width, height, label in [(1440, 1100, 'desktop'), (390, 844, 'mobile')]:
            for scenario in ['pending', 'no-js', 'module-fail', 'webgl-fail']:
                context = browser.new_context(viewport={'width': width, 'height': height}, java_script_enabled=scenario != 'no-js')
                page = context.new_page()
                context.route('**/*', overlay)
                if scenario == 'webgl-fail':
                    page.add_init_script("HTMLCanvasElement.prototype.getContext = () => null")
                pending = []
                if scenario == 'pending':
                    page.route('**/js/home-cosmos.js*', lambda route: pending.append(route))
                elif scenario == 'module-fail':
                    page.route('**/js/home-cosmos.js*', lambda route: route.abort())
                page.goto(origin, wait_until='commit')
                page.locator('.cosmic-type').wait_for(state='visible')
                page.wait_for_function("[...document.styleSheets].some(s=>s.href?.includes('home-cosmos.css'))")
                page.wait_for_timeout(500)
                if scenario == 'pending':
                    assert len(pending) == 1, 'ES module was not held'
                if scenario == 'webgl-fail':
                    page.wait_for_function('window.cosmicState?.error && !cosmicState.webgl')
                page.screenshot(path=str(evidence / f'{label}-{scenario}-blank.png'))
                blank_scene(page)
                result = {'viewport': label, 'scenario': scenario, 'blank': True, 'canvas_not_focusable': True}
                if scenario == 'pending':
                    pending[0].fulfill(path=str(ROOT / 'js/home-cosmos.js'), content_type='text/javascript')
                    page.wait_for_function('window.cosmicState?.webgl && cosmicState.frames > 3')
                    assert page.locator('canvas').is_visible()
                    assert page.locator('.cosmic-masthead img:visible').count() == 0
                    page.locator('canvas').focus()
                    page.keyboard.press('Enter')
                    assert page.locator('canvas').get_attribute('aria-pressed') == 'true'
                    page.keyboard.press('Escape')
                    assert page.locator('canvas').get_attribute('aria-pressed') == 'false'
                    page.screenshot(path=str(evidence / f'{label}-actual-3d.png'))
                    result['actual_3d_frames'] = page.evaluate('cosmicState.frames')
                    result['keyboard_after_ready'] = True
                    page.evaluate("window.loss=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');loss.loseContext()")
                    page.wait_for_function('!cosmicState.webgl')
                    blank_scene(page)
                    result['context_loss_blank'] = True
                    page.evaluate('loss.restoreContext()')
                    page.wait_for_function('cosmicState.webgl && document.querySelector(".cosmic-masthead").dataset.cosmicReady === "true"')
                    result['context_restored'] = True
                receipts['cases'].append(result)
                context.close()
        browser.close()
    (evidence / 'live-origin-receipts.json').write_text(json.dumps(receipts, indent=2))
    print(json.dumps(receipts, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('origin')
    parser.add_argument('evidence', type=Path)
    args = parser.parse_args()
    verify(args.origin, args.evidence)
