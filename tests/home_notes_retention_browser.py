#!/usr/bin/env python3
"""Check stable note reading against a served site or a local JS overlay."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='https://currenjin.github.io/')
parser.add_argument('--local-js', action='store_true')
args = parser.parse_args()
source = Path(__file__).resolve().parents[1] / 'js/home-notes.js'


def point(page, ident):
    return page.locator(f'[data-home-note="{ident}"]').evaluate('el=>{const r=el.getClientRects()[0];return [r.left+4,r.top+r.height/2]}')


with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    if args.local_js:
        page.route('**/js/home-notes.js*', lambda route: route.fulfill(path=str(source), content_type='text/javascript'))
    page.goto(args.url, wait_until='networkidle')
    page.wait_for_selector('[data-home-note][role="button"]')
    song = page.locator('#home-note-song')
    cosmos = page.locator('#home-note-cosmos')
    page.mouse.move(*point(page, 'song'))
    song.wait_for(state='visible')
    page.mouse.move(8, 8)
    page.wait_for_timeout(1100)
    assert song.is_visible(), 'reading note vanished when pointer left the paragraph'
    box = song.bounding_box()
    page.mouse.move(box['x'] + box['width'] / 2, box['y'] + 50)
    page.mouse.move(*point(page, 'cosmos'))
    page.wait_for_timeout(850)
    assert song.is_visible() and not cosmos.is_visible(), 'a note being read changed during pointer transit'
    page.locator('[data-home-note="cosmos"]').click()
    assert cosmos.is_visible() and not song.is_visible(), 'explicit selection must switch a pinned note'
    page.keyboard.press('Escape')
    assert not cosmos.is_visible()
    page.mouse.move(8, 8)
    page.mouse.move(*point(page, 'song'))
    song.wait_for(state='visible')
    page.mouse.move(*point(page, 'cosmos'))
    page.wait_for_timeout(80)
    assert song.is_visible() and not cosmos.is_visible(), 'briefly crossing another reference changed the note'
    page.wait_for_timeout(260)
    assert cosmos.is_visible(), 'deliberately dwelling on another paragraph must still discover its note'
    page.mouse.move(8, 8)
    page.wait_for_timeout(1000)
    assert cosmos.is_visible(), 'newly selected note must also remain open'
    page.locator('.site-head').click(position={'x': 2, 'y': 2})
    assert not cosmos.is_visible(), 'outside click must dismiss'
    print(json.dumps({'pointer_leave_keeps_note': True, 'panel_reading_pins_note': True, 'explicit_switch': True, 'brief_transit_ignored': True, 'intentional_hover_switch': True, 'escape_and_outside_dismiss': True, 'local_js_overlay': args.local_js}))
    browser.close()
