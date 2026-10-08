"""Real Jekyll scratch fixtures: no demonstration series in tracked Wiki data."""
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def run(root):
    if os.environ.get('READING_NAV_NATIVE_BUILD') == '1':
        subprocess.run(['bundle', 'exec', 'jekyll', 'build'], cwd=root,
                       env={**os.environ, 'JEKYLL_ENV': 'production'}, check=True,
                       stdout=subprocess.DEVNULL)
        return
    subprocess.run(['docker', 'run', '--rm', '-v', f'{root}:/srv/jekyll', '-v',
                    'baccalaureate-gems:/usr/local/bundle', '-w', '/srv/jekyll', 'ruby:3.1',
                    'sh', '-c', 'JEKYLL_ENV=production bundle exec jekyll build'], check=True,
                   stdout=subprocess.DEVNULL)

def source(name, public='true', series='fixture'):
    return f'''---
layout: wiki
title: {name}
date: 2026-09-01
updated: 2026-09-02
public: {public}
toc: true
latex: false
parent: "[[index]]"
summary: Scratch fixture
{('series: ' + series) if series else ''}
---
* TOC
{{:toc}}

## Original heading {{#stable-original}}

Question untouched.
'''

with tempfile.TemporaryDirectory(prefix='reading-navigation-') as temp:
    root = Path(temp) / 'repo'
    shutil.copytree(ROOT, root, ignore=shutil.ignore_patterns('.git', '_site', '.jekyll-cache', 'node_modules', '__pycache__'))
    names = ['fixture-first', 'fixture-secret', 'fixture-last', 'fixture-orphan', 'fixture-string', 'fixture-standalone']
    for name in names:
        public = 'false' if name.endswith('secret') else ('"true"' if name.endswith('string') else 'true')
        (root / '_wiki' / (name + '.md')).write_text(source(name, public, '' if name.endswith('standalone') else 'fixture'))
    metadata = '''- id: fixture
  title: Scratch series
  public: true
  chapters:
    - id: fixture-first
      state: published
    - id: fixture-secret
      state: published
    - id: fixture-string
      state: published
    - id: fixture-plan
      state: planned
      title: Never expose this planned Wiki title
    - id: fixture-last
      state: published
'''
    (root / '_data/wiki_series.yml').write_text(metadata)
    run(root)
    site = root / '_site'
    subprocess.run(['python3', str(root / 'tests/verify_seo.py'), str(site)], check=True)
    first = (site / 'wiki/fixture-first/index.html').read_text()
    last = (site / 'wiki/fixture-last/index.html').read_text()
    assert '<details>' in first and '<details open' not in first
    assert 'reading-series-current' in first and 'Scratch series' in first
    assert 'href="/wiki/fixture-first/" aria-current="page"' in first
    assert 'rel="next" href="/wiki/fixture-last/"' in first
    assert 'rel="prev" href="/wiki/fixture-first/"' in last
    assert 'rel="prev"' not in first and 'rel="next"' not in last
    assert 'id="stable-original"' in first and 'Question untouched.' in first
    assert first.count('id="markdown-toc"') == 1
    standalone = (site / 'wiki/fixture-standalone/index.html').read_text()
    assert 'class="reading-series ' not in standalone and 'reading-chapter-nav' not in standalone
    for name in ['fixture-secret', 'fixture-string', 'fixture-orphan']:
        assert not (site / 'wiki' / name).exists(), name
        for path in ['search-index.json', 'sitemap.xml']:
            assert f'/wiki/{name}/' not in (site / path).read_text(), (name, path)
    assert 'Never expose this planned Wiki title' not in first + last
    # Clean destination checks withdrawal, not a stale output artifact.
    (root / '_data/wiki_series.yml').write_text(metadata.replace('public: true', 'public: false'))
    shutil.rmtree(site)
    run(root)
    subprocess.run(['python3', str(root / 'tests/verify_seo.py'), str(site)], check=True)
    assert not (site / 'wiki/fixture-first').exists()
    assert not (site / 'wiki/fixture-last').exists()
    assert (site / 'wiki/fixture-standalone/index.html').exists()
print('PASS: scratch Wiki rendered series, order, current, anchors, standalone, private/string/orphan/planned exclusion and withdrawal')
