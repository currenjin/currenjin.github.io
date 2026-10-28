#!/usr/bin/env python3
"""Exercise Home notes against a real Jekyll destination in Chrome."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4197')
parser.add_argument('--evidence', required=True)
args = parser.parse_args()
out = Path(args.evidence)
out.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    for width, height in [(1440, 1000), (390, 844)]:
        for theme in ['light', 'dark']:
            context = browser.new_context(viewport={'width': width, 'height': height}, has_touch=width < 1000)
            context.add_init_script(f"localStorage.setItem('theme', '{theme}'); window.noteShifts=[]; new PerformanceObserver(l=>l.getEntries().forEach(e=>{{if(!e.hadRecentInput) noteShifts.push(e.value)}})).observe({{type:'layout-shift', buffered:true}})")
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(args.url, wait_until='networkidle')
            page.wait_for_selector('[role="button"][data-home-note]')
            page.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            initial = page.locator('.personal-intro').bounding_box()
            ledger = page.locator('.ledger-head').bounding_box()
            shifts = page.evaluate('noteShifts')
            assert sum(shifts) == 0, shifts
            for ident in ['hackathon', 'song', 'camus']:
                trigger = page.locator(f'[data-home-note="{ident}"]')
                panel = page.locator(f'#home-note-{ident}')
                if width > 1000:
                    # Deliberately use the paragraph edge, not the marked text.
                    point = trigger.evaluate('''el => {
                      const paragraph = el.closest('p').getBoundingClientRect();
                      const candidates = [...el.closest('p').querySelectorAll('[data-home-note]')];
                      const d = (r,x,y) => Math.max(r.left-x,0,x-r.right)**2 + Math.max(r.top-y,0,y-r.bottom)**2;
                      let best = null;
                      for(let x=paragraph.left+4;x<paragraph.right-4;x+=12) for(let y=paragraph.top+4;y<paragraph.bottom-4;y+=12) {
                        const scores=candidates.map(item=>({item,score:Math.min(...[...item.getClientRects()].map(r=>d(r,x,y)))})).sort((a,b)=>a.score-b.score);
                        if(scores[0].item===el && (!best || scores[0].score>best.score)) best={x,y,score:scores[0].score};
                      }
                      return best;
                    }''')
                    assert point['score'] > 400, point
                    page.mouse.move(point['x'], point['y'])
                    panel.wait_for(state='visible')
                    box = panel.bounding_box()
                    col = page.locator('.personal-intro').bounding_box()
                    assert box['x'] + box['width'] <= col['x'] - 10
                    assert page.locator('.home-note-leader').is_visible()
                    assert page.locator('.home-note-leader path').get_attribute('d')
                    assert page.locator('.personal-intro').bounding_box() == initial
                    assert page.locator('.ledger-head').bounding_box() == ledger
                    # Move through the gutter into image/text and remain stable beyond the close delay.
                    page.mouse.move(col['x'] - 20, point['y'])
                    page.mouse.move(box['x'] + box['width'] - 5, box['y'] + 60)
                    page.wait_for_timeout(850)
                    assert panel.is_visible(), {'id': ident, 'box': box, 'point': point, 'active': page.locator('[aria-expanded="true"][data-home-note]').all_text_contents()}
                else:
                    trigger.tap()
                    panel.wait_for(state='visible')
                    rect = trigger.bounding_box()
                    box = panel.bounding_box()
                    assert rect['y'] >= 0 and rect['y'] + rect['height'] < box['y']
                    assert box['y'] + box['height'] <= height
                    assert not page.locator('.home-note-leader').is_visible()
                assert panel.locator('a').first.is_visible()
                if ident == 'hackathon':
                    image = panel.locator('img')
                    image.evaluate('(img)=>img.decode()')
                    assert image.evaluate('img=>[img.naturalWidth,img.naturalHeight]') == [746, 436]
                    assert panel.locator('a').get_attribute('href') == 'https://github.com/currenjin/2026-10-daytona-hack-sprint'
                page.screenshot(path=str(out / f'{width}-{theme}-{ident}.png'))
                page.keyboard.press('Escape')
                assert not panel.is_visible()
                assert trigger.evaluate('el=>el===document.activeElement')
                # Outside pointer dismisses a keyboard-opened note.
                page.keyboard.press('Tab')
                trigger.focus()
                assert panel.is_visible()
                page.locator('.site-head').click(position={'x': 2, 'y': 2})
                assert not panel.is_visible()
            # Switch directly between the first paragraph's two references.
            if width > 1000:
                for ident in ['hackathon', 'song', 'hackathon', 'song']:
                    trigger = page.locator(f'[data-home-note="{ident}"]')
                    rect = trigger.evaluate('el=>el.getClientRects()[0].toJSON()')
                    page.mouse.move(rect['left'] + 3, rect['top'] + rect['height'] / 2)
                    page.locator(f'#home-note-{ident}').wait_for(state='visible')
                    assert page.locator(f'#home-note-{ident}').is_visible(), {'switch': ident, 'active': page.locator('[aria-expanded="true"][data-home-note]').all_text_contents(), 'rect': rect}
                    assert page.locator('.home-note:visible').count() == 1
                # A wrapped inline phrase's union rectangle gives a different answer here.
                point = page.locator('.personal-intro p').first.evaluate('''el=>{
                  const ts=[...el.querySelectorAll('[data-home-note]')];
                  const d=(r,x,y)=>Math.max(r.left-x,0,x-r.right)**2+Math.max(r.top-y,0,y-r.bottom)**2;
                  const p=el.getBoundingClientRect();
                  for(let x=p.left+2;x<p.right;x+=8) for(let y=p.top+2;y<p.bottom;y+=8){
                    const fragment=ts.map(t=>Math.min(...[...t.getClientRects()].map(r=>d(r,x,y))));
                    const union=ts.map(t=>d(t.getBoundingClientRect(),x,y));
                    const f=fragment.indexOf(Math.min(...fragment)),u=union.indexOf(Math.min(...union));
                    if(f!==u && fragment[f]+100<fragment[1-f]) return {x,y,id:ts[f].dataset.homeNote};
                  }
                }''')
                assert point, 'Need a genuine wrapped-fragment/union disagreement'
                page.mouse.move(point['x'], point['y'])
                page.locator(f'#home-note-{point["id"]}').wait_for(state='visible')
                assert page.locator(f'#home-note-{point["id"]}').is_visible()
                page.keyboard.press('Escape')
            else:
                page.locator('[data-home-note="camus"]').tap()
                panel = page.locator('#home-note-camus')
                panel.evaluate("el=>el.style.fontSize='30px'")
                assert panel.evaluate('el=>el.scrollHeight>el.clientHeight')
                panel.locator('a').focus()
                panel.locator('a').scroll_into_view_if_needed()
                assert panel.locator('a').is_visible()
                assert page.evaluate('document.activeElement.textContent') == '카뮈의 철학 더 읽기'
                page.keyboard.press('Escape')
            assert page.evaluate('document.documentElement.scrollWidth-innerWidth') == 0
            # Real keyboard activation enters the note; Tab reaches the source link.
            page.locator('[data-home-note="song"]').focus()
            page.keyboard.press('Enter')
            assert page.locator('#home-note-song .home-note-close').evaluate('el=>el===document.activeElement')
            page.keyboard.press('Tab')
            assert page.locator('#home-note-song a').first.evaluate('el=>el===document.activeElement')
            page.keyboard.press('Escape')
            assert not errors, errors
            results.append({'width': width, 'theme': theme, 'layout_shift': sum(shifts), 'errors': errors, 'notes': 3})
            context.close()
    context = browser.new_context(java_script_enabled=False, reduced_motion='reduce', viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.goto(args.url)
    assert page.locator('a[data-home-note]').count() == 3
    for ident in ['hackathon', 'song', 'camus']:
        page.locator(f'[data-home-note="{ident}"]').click()
        assert page.locator(f'#home-note-{ident}').is_visible()
        assert page.url.endswith(f'#home-note-{ident}')
    page.screenshot(path=str(out / '390-no-js.png'))
    results.append({'no_js': 'all three anchor targets and source links accessible'})
    browser.close()
(out / 'browser-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(json.dumps(results, ensure_ascii=False, indent=2))
