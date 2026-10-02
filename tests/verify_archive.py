"""Verify real generated output and approved source fidelity (no dependencies)."""
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SITE = Path(sys.argv[1])
manifest = json.loads((ROOT / 'tests/fixtures/approved-imports.json').read_text())
index = json.loads((SITE / 'search-index.json').read_text())
posts = [p for p in index if p['type'] == 'post']
assert len(posts) >= len(manifest), posts
home = (SITE / 'index.html').read_text()
post_index = (SITE / 'posts/index.html').read_text()
# Authored books can be added later; only the unapproved demonstration is forbidden.
assert '코드를 만들고 확인하는 일' not in home + post_index
assert 'Lifecycle fixture' not in home + post_index
for i, entry in enumerate(manifest):
    source = (ROOT / entry['path']).read_text()
    body = re.split(r'^---\s*$', source, maxsplit=2, flags=re.M)[2].strip() + '\n'
    assert body == entry['markdown_body'], entry['path']
    if 'source_html' in entry:
        assert hashlib.sha256(entry['source_html'].encode()).hexdigest() == entry['source_html_sha256']
        assert hashlib.sha256(body.encode()).hexdigest() == entry['markdown_sha256']
    assert hashlib.sha256(entry['source_body'].encode()).hexdigest() == entry['body_sha256']
    slug = Path(entry['path']).stem
    url = '/posts/' + slug + '/'
    assert any(p['url'] == url and p['title'] == entry['title'] for p in posts)
    html = (SITE / url.strip('/') / 'index.html').read_text()
    assert entry['source_url'].replace('&', '&amp;') in html
    assert entry['date'].replace('-', '.') in html
    assert 'Liquid Exception' not in html
    assert '{{' not in html and '{%' not in html
    assert 'data-search-open' in html and 'Post 목록' in html
    assert url in home and url in post_index
for folder in ['tests','docs','.ouroboros','scripts','tool','vendor','_articles','_chapters']:
    assert not (SITE / folder).exists(), folder
header = re.search(r'<nav class="site-nav".*?</nav>', home, re.S).group()
positions = [header.index(s) for s in ['data-search-open','/wiki/index/','/posts/','/reviews/','theme-toggle']]
assert positions == sorted(positions)
wiki_index = (SITE / 'wiki/index/index.html').read_text()
review_index = (SITE / 'reviews/index.html').read_text()
assert '<p class="eyebrow">review</p>' in review_index
assert '<p class="eyebrow">wiki</p>' in wiki_index
assert '<h1>사유하고 남기다</h1>' in post_index
for html in [wiki_index, post_index]:
    count = re.search(r'<output class="archive-index-count"[^>]*>(\d+)/(\d+)</output>', html)
    assert count and count[1] == count[2]
    if html == wiki_index:
        assert int(count[1]) == html.count('data-catalog-item')
    else:
        assert int(count[1]) == len([p for p in posts if not p['url'].startswith('/posts/#')])
    assert 'data-review-filters' not in html
filters = re.findall(r'data-filter="([^"]+)"', home)
assert filters[:4] == ['all', 'wiki', 'post', 'review']
print(json.dumps({'result':'PASS','approved_articles':5,'public_books':len([p for p in posts if p['url'].startswith('/posts/#')]),'source_body_fidelity':True,'header_order':['search','wiki','post','review','theme'],'excluded_authoring_artifacts':True}, ensure_ascii=False, indent=2))
