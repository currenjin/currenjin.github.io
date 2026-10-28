"""Production Home acceptance checks. Requires Python Playwright and BeautifulSoup.

python3 tests/home_cosmos_browser.py SITE BASELINE EVIDENCE
"""
import argparse
from collections import Counter
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import threading
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright


@contextmanager
def serve(directory):
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(directory)))
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()


def verify_static(site, baseline):
    home = BeautifulSoup((site / 'index.html').read_text(), 'html.parser')
    old = BeautifulSoup((baseline / 'index.html').read_text(), 'html.parser')
    identities = lambda soup: Counter(str(row) for row in soup.select('[data-filter-item]'))
    assert identities(home) == identities(old), 'canonical catalogue identity/content changed'
    assert str(home.select_one('.site-head')) == str(old.select_one('.site-head'))
    assert not home.select('.intro-note, .intro-popover, .note-leader')
    assert home.select_one('.cosmic-fallback')
    assert 'noindex' not in str(home)
    assert not re.search(r'compare-left|study-label|localhost|/Users/|phi-home|미리보기', str(home))
    checked = 0
    for path in baseline.rglob('*.html'):
        rel = path.relative_to(baseline)
        if str(rel) == 'index.html':
            continue
        candidate = site / rel
        assert candidate.exists(), str(rel)
        before, after = path.read_text(), candidate.read_text()
        # The only authorized non-Home template difference is favicon identity.
        strip_icons = lambda text: re.sub(r'^.*<link[^>]+rel="(?:icon|apple-touch-icon|manifest)"[^>]*>[ \t]*\r?\n', '', text, flags=re.M)
        assert strip_icons(before) == strip_icons(after), 'non-Home parity: ' + str(rel)
        assert 'home-cosmos.js' not in after and 'home-cosmos.css' not in after
        checked += 1
    for relative in ['css/main.css', 'css/disclosure.css', 'js/ledger.js', 'js/theme.js', 'js/disclosure.js']:
        if (baseline / relative).exists():
            assert (baseline / relative).read_bytes() == (site / relative).read_bytes(), relative
    for name in ['tests', 'scripts', 'docs', 'AGENTS.md', 'study.js', 'study.css', 'compare-left.html']:
        assert not (site / name).exists(), name
    return {'catalogue_entries': sum(identities(home).values()), 'non_home_pages_identical_except_icons': checked}


def verify_browser(site, baseline, evidence):
    receipts: dict = verify_static(site, baseline)
    with serve(site) as origin, sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        errors = []
        for width, height, label in [(1440, 1100, 'desktop'), (390, 844, 'mobile')]:
            for theme in ['light', 'dark']:
                context = browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1, has_touch=width < 1000)
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.add_init_script("localStorage.setItem('theme', '" + theme + "')")
                page.goto(origin, wait_until='networkidle')
                page.wait_for_function('window.cosmicState?.webgl && window.cosmicState.frames > 3')
                first = page.evaluate('cosmicState.frames')
                page.wait_for_timeout(250)
                assert page.evaluate('cosmicState.frames') > first
                first_pixels = page.locator('canvas').screenshot()
                page.wait_for_timeout(180)
                assert page.locator('canvas').screenshot() != first_pixels, 'WebGL frames did not change rendered pixels'
                layout = page.evaluate('''() => {
                    const box = s => { const r=document.querySelector(s).getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
                    return {cosmos:box('.cosmic-masthead'),intro:box('.personal-intro'),type:box('.cosmic-type'),canvas:box('canvas'),ledger:box('.ledger-head'),overflow:document.documentElement.scrollWidth > innerWidth};
                }''')
                assert not layout['overflow'], layout
                assert layout['ledger']['y'] >= layout['intro']['bottom'], layout
                if width > 1000:
                    assert layout['cosmos']['right'] < layout['intro']['x'], layout
                else:
                    assert layout['intro']['y'] >= layout['cosmos']['bottom'], layout
                assert layout['type']['y'] >= layout['canvas']['bottom'] - 65, layout
                page.screenshot(path=str(evidence / (label + '-' + theme + '.png')), full_page=False)
                page.locator('.home-opening').screenshot(path=str(evidence / (label + '-' + theme + '-intro.png')))
                page.evaluate('scrollTo({top:0,behavior:"instant"})')
                page.locator('canvas').focus()
                page.keyboard.press('Enter')
                assert page.locator('canvas').get_attribute('aria-pressed') == 'true'
                page.keyboard.press('Escape')
                assert page.locator('canvas').get_attribute('aria-pressed') == 'false'
                page.locator('canvas').tap(force=True) if width < 1000 else page.locator('canvas').click()
                assert page.locator('canvas').get_attribute('aria-pressed') == 'true'
                page.evaluate("scrollTo(0, document.querySelector('.ledger-head').getBoundingClientRect().top + scrollY)")
                page.wait_for_function("document.querySelector('.cosmic-masthead').getBoundingClientRect().bottom < -40")
                page.wait_for_timeout(200)
                stopped = page.evaluate('cosmicState.frames')
                page.wait_for_timeout(250)
                assert page.evaluate('cosmicState.frames') == stopped, 'offscreen animation did not pause'
                page.locator('[data-filter="wiki"]').click()
                assert page.locator('[data-filter="wiki"]').get_attribute('aria-pressed') == 'true'
                assert page.locator('[data-filter-item]:visible:not([data-kind="wiki"])').count() == 0
                page.locator('[data-filter="all"]').click()
                page.keyboard.press('Meta+k')
                assert page.locator('[role="dialog"]:visible').count() == 1
                page.keyboard.press('Escape')
                page.evaluate('scrollTo(0,0)')
                page.wait_for_function('(n) => cosmicState.frames > n', arg=stopped)
                page.wait_for_function('scrollY < 1')
                page.wait_for_timeout(200)
                page.emulate_media(reduced_motion='reduce')
                page.wait_for_timeout(200)
                frozen = page.evaluate('cosmicState.frames')
                page.wait_for_timeout(250)
                assert page.evaluate('cosmicState.frames') == frozen
                assert page.evaluate('cosmicState.reducedMotion')
                receipts[label + '-' + theme] = {'running_frames': first, 'offscreen_paused_at': stopped, 'reduced_motion_paused_at': frozen, 'layout': layout}
                context.close()
        context = browser.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        page = context.new_page()
        page.goto(origin)
        assert page.locator('.cosmic-fallback').is_visible()
        assert not page.locator('.cosmic-canvas').is_visible(), 'unavailable scene must not expose a dead control'
        assert page.locator('.personal-intro p').count() == 3
        page.screenshot(path=str(evidence / 'mobile-no-js-fallback.png'))
        context.close()
        context = browser.new_context(viewport={'width': 1440, 'height': 1100})
        page = context.new_page()
        page.route('**/vendor/three.module.js', lambda route: route.abort())
        page.goto(origin)
        assert page.locator('.cosmic-fallback').is_visible()
        page.screenshot(path=str(evidence / 'desktop-module-fallback.png'))
        context.close()
        context = browser.new_context(viewport={'width': 1440, 'height': 1100})
        page = context.new_page()
        page.goto(origin)
        page.wait_for_function('window.cosmicState?.webgl && cosmicState.frames > 3')
        page.evaluate("window.loss = document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context'); loss.loseContext()")
        page.wait_for_function('!cosmicState.webgl')
        assert page.locator('.cosmic-fallback').is_visible()
        stopped = page.evaluate('cosmicState.frames')
        page.wait_for_timeout(200)
        assert page.evaluate('cosmicState.frames') == stopped
        page.evaluate('loss.restoreContext()')
        page.wait_for_function('cosmicState.webgl && cosmicState.frames > ' + str(stopped))
        receipts['context_loss_restored'] = True
        context.close()
        # Initial reduced motion still renders a usable, non-animating WebGL scene.
        context = browser.new_context(reduced_motion='reduce', viewport={'width': 1440, 'height': 1100})
        page = context.new_page()
        page.goto(origin)
        page.wait_for_function('window.cosmicState?.webgl && cosmicState.frames > 0')
        page.wait_for_timeout(200)
        frozen = page.evaluate('cosmicState.frames')
        page.wait_for_timeout(250)
        assert page.evaluate('cosmicState.frames') == frozen
        page.locator('canvas').focus()
        page.keyboard.press('Space')
        assert page.locator('canvas').get_attribute('aria-pressed') == 'true'
        assert page.evaluate('cosmicState.frames') > frozen
        page.screenshot(path=str(evidence / 'desktop-reduced-motion.png'))
        receipts['initial_reduced_motion_static_frames'] = frozen
        context.close()
        # Exercise the real visibilitychange handler in a browser; headless tabs
        # stay visible, so only the visibility-state input is simulated here.
        context = browser.new_context(viewport={'width': 1440, 'height': 1100})
        page = context.new_page()
        page.goto(origin)
        page.wait_for_function('window.cosmicState?.webgl && cosmicState.frames > 3')
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
        stopped = page.evaluate('cosmicState.frames')
        page.wait_for_timeout(200)
        assert page.evaluate('cosmicState.frames') == stopped
        page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
        page.wait_for_function('(n) => cosmicState.frames > n', arg=stopped)
        receipts['simulated_visibility_event_pause_resume'] = True
        # Narrow and breakpoint widths exercise the longer approved copy.
        for width in [320, 760, 1000, 1001, 1280, 1920]:
            page.set_viewport_size({'width': width, 'height': 1100})
            page.wait_for_timeout(80)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            assert page.evaluate("document.querySelector('.ledger-head').getBoundingClientRect().top >= document.querySelector('.personal-intro').getBoundingClientRect().bottom"), width
        receipts['additional_no_overflow_widths'] = [320, 760, 1000, 1001, 1280, 1920]
        context.close()
        # Compare real article typography and ordinary footnote navigation.
        article_styles = []
        with serve(baseline) as baseline_origin:
            for source in [baseline_origin, origin]:
                context = browser.new_context(viewport={'width': 1440, 'height': 1000})
                page = context.new_page()
                page.goto(source + '/wiki/idempotency/', wait_until='networkidle')
                article_styles.append(page.evaluate('''() => Object.fromEntries(['.article-head','.prose p','a.footnote','.site-head'].map(selector => {
                    const element=document.querySelector(selector);if(!element)throw new Error('Missing parity target: '+selector);
                    const style=getComputedStyle(element);return [selector,Object.fromEntries(['fontFamily','fontSize','lineHeight','color','width','padding','margin'].map(key=>[key,style[key]]))];
                }))'''))
                first_footnote = page.locator('a.footnote').first
                href = first_footnote.get_attribute('href')
                first_footnote.click()
                page.wait_for_function('(hash) => location.hash === hash', arg=href)
                assert page.locator('[id="' + href[1:] + '"]').count() == 1
                if source == origin:
                    page.evaluate('scrollTo({top:0,behavior:"instant"})')
                    page.screenshot(path=str(evidence / 'article-parity-light.png'))
                context.close()
        assert article_styles[0] == article_styles[1]
        receipts['article_browser_typography_footnote_parity'] = True
        assert not errors, errors
        receipts['uncaught_page_errors'] = errors
        browser.close()
        unsupported = p.chromium.launch(headless=True, args=['--disable-webgl'])
        page = unsupported.new_page(viewport={'width': 1440, 'height': 1100})
        page.goto(origin)
        page.wait_for_function('window.cosmicState?.error && !cosmicState.webgl')
        assert page.locator('.cosmic-fallback').is_visible()
        assert not page.locator('.cosmic-canvas').is_visible()
        page.screenshot(path=str(evidence / 'desktop-webgl-unavailable.png'))
        receipts['webgl_disabled_fallback'] = True
        unsupported.close()
    (evidence / 'receipts.json').write_text(json.dumps(receipts, ensure_ascii=False, indent=2))
    print(json.dumps(receipts, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('site', type=Path)
    parser.add_argument('baseline', type=Path)
    parser.add_argument('evidence', type=Path)
    args = parser.parse_args()
    args.evidence.mkdir(parents=True, exist_ok=True)
    verify_browser(args.site, args.baseline, args.evidence)
