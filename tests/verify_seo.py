"""Validate built SEO against an independent source-frontmatter inventory.
Usage: python3 tests/verify_seo.py _site (requires PyYAML).
No Jekyll default dates, git timestamps, or reading end_date are used.
"""
import datetime as dt
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import quote, unquote, urlsplit
import xml.etree.ElementTree as ET
import yaml

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://currenjin.github.io'
INDEXES = {'/', '/wiki/index/', '/posts/', '/reviews/', '/graph/', '/tag/'}


def source(path):
    text = path.read_text()
    match = re.match(r'\A---\s*\n(.*?)\n---\s*(?:\n|$)', text, re.S)
    return yaml.safe_load(match[1]) or {} if match else {}


def stamp(value):
    if isinstance(value, dt.datetime):
        return value.isoformat()
    if isinstance(value, dt.date):
        return value.isoformat()
    if not isinstance(value, str):
        return None
    value = value.strip()
    value = re.sub(r'^(\d{4})-(\d{1,2})-(\d{1,2})(?= |T|$)', lambda m: f'{m[1]}-{int(m[2]):02d}-{int(m[3]):02d}', value)
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z| ?[+-]\d{2}:?\d{2}))?', value):
        return None
    try:
        return dt.datetime.fromisoformat(value.replace('Z', '+00:00')).isoformat() if len(value) > 10 else dt.date.fromisoformat(value).isoformat()
    except ValueError:
        return None


def public(data, now):
    if data.get('public') is False or data.get('published') is False or data.get('draft') is True:
        return False
    for field in ['date', 'updated']:
        value = stamp(data.get(field))
        if value:
            date = dt.datetime.fromisoformat(value)
            if date.tzinfo is None:
                date = date.replace(tzinfo=dt.timezone.utc)
            if date > now:
                return False
    return True


def inventory():
    now = dt.datetime.now(dt.timezone.utc)
    expected, excluded, counts = {}, set(), {}
    books = yaml.safe_load((ROOT / '_data/post_books.yml').read_text()) or []
    for collection, prefix in [('wiki', '/wiki/'), ('reviews', '/reviews/'), ('articles', '/posts/'), ('chapters', '/posts/chapters/')]:
        count = 0
        for path in (ROOT / ('_' + collection)).rglob('*.md'):
            data = source(path)
            relative = path.relative_to(ROOT / ('_' + collection)).with_suffix('').as_posix()
            url = data.get('permalink', prefix + relative + '/')
            allowed = public(data, now)
            if collection in ['articles', 'chapters']:
                allowed = allowed and data.get('public') is True and stamp(data.get('date')) is not None
                date, updated = stamp(data.get('date')), stamp(data.get('updated', data.get('date')))
                allowed = allowed and updated is not None and updated >= date
            if collection == 'chapters':
                allowed = allowed and any(book.get('public') is True and book.get('id') == data.get('book') and any(entry.get('id') == data.get('chapter_id') and entry.get('state') == 'published' for entry in book.get('chapters', [])) for book in books)
            if not allowed:
                excluded.add(url)
                continue
            if data.get('sitemap') is False or data.get('noindex') is True or data.get('canonical_url', url) != url:
                continue
            expected[url] = (stamp(data.get('updated')) or stamp(data.get('date')), data)
            count += 1
        counts[collection] = count
    for path in ROOT.iterdir():
        if path.suffix not in ['.md', '.html']:
            continue
        data = source(path)
        url = data.get('permalink', '/' if path.name == 'index.html' else '/' + path.stem + '/')
        if url in INDEXES and public(data, now) and data.get('noindex') is not True and data.get('sitemap') is not False:
            expected[url] = (stamp(data.get('updated')) or stamp(data.get('date')), data)
    return expected, excluded, counts


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical, self.meta, self.title = [], {}, ''
        self.in_head = self.in_title = False
        self.canonical_total = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head': self.in_head = True
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical_total += 1
            if self.in_head: self.canonical.append(attrs.get('href'))
        if self.in_head and tag == 'meta':
            key = attrs.get('name', attrs.get('property'))
            self.meta.setdefault(key, []).append(attrs.get('content', ''))
        if tag == 'title' and self.in_head: self.in_title = True
    def handle_endtag(self, tag):
        if tag == 'head': self.in_head = False
        if tag == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data


def output(site, path):
    return site / unquote(path).lstrip('/') / 'index.html'


def verify(site):
    expected, excluded, counts = inventory()
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    entries = ET.parse(site / 'sitemap.xml').findall('s:url', ns)
    urls = [entry.findtext('s:loc', namespaces=ns) for entry in entries]
    wanted = {ORIGIN + quote(path, safe='/%') for path in expected}
    assert len(urls) == len(set(urls)), 'Duplicate sitemap URLs'
    assert set(urls) == wanted, f'Missing: {wanted - set(urls)}; extra: {set(urls) - wanted}'
    lastmods = 0
    for entry, url in zip(entries, urls):
        parsed = urlsplit(url)
        assert parsed.scheme == 'https' and parsed.netloc == 'currenjin.github.io'
        assert not parsed.fragment and not parsed.query
        assert url.isascii() and not re.search(r'%(?![0-9A-Fa-f]{2})', url)
        path = unquote(parsed.path)
        assert output(site, path).is_file(), f'Missing generated canonical: {path}'
        actual_date = entry.findtext('s:lastmod', namespaces=ns)
        date, data = expected[path]
        assert actual_date == date, f'Unjustified lastmod: {path}: {actual_date} != {date}'
        lastmods += actual_date is not None
        head = Head(); head.feed(output(site, path).read_text())
        assert head.canonical == [url] and head.canonical_total == 1, f'Canonical: {path}: {head.canonical}'
        assert head.title.strip(), f'Empty title: {path}'
        for key in ['description', 'og:description', 'twitter:description', 'og:title', 'twitter:title', 'og:url', 'og:image', 'twitter:image']:
            assert len(head.meta.get(key, [])) == 1 and head.meta[key][0].strip(), f'Missing/duplicate {key}: {path}'
        assert head.meta['description'] == head.meta['og:description'] == head.meta['twitter:description']
        assert head.meta['og:title'] == head.meta['twitter:title'] == [head.title]
        assert head.meta['og:url'] == [url]
        assert not any('noindex' in value for value in head.meta.get('robots', []))
    for path in excluded:
        assert not output(site, path).exists(), f'Private/draft/future file leaked: {path}'
    search = json.loads((site / 'search-index.json').read_text())
    search_urls = {unquote(entry['url']) for entry in search}
    assert not {unquote(path) for path in excluded}.intersection(search_urls), 'Withdrawn record in search'
    for path, (_, data) in expected.items():
        if path not in INDEXES:
            assert unquote(path) in search_urls, f'Public document absent from search: {path}'
    for utility in ['/books/', '/wiki/', '/search/', '/recent/', '/404/', '/posts/#what-am-i']:
        assert ORIGIN + utility not in urls
    redirect = Head(); redirect.feed(output(site, '/books/').read_text())
    assert redirect.canonical == [ORIGIN + '/reviews/'] and redirect.canonical_total == 1
    home = Head(); home.feed(output(site, '/').read_text())
    config = yaml.safe_load((ROOT / '_config.yml').read_text())
    if not expected['/'][1].get('summary') and not expected['/'][1].get('seo_description'):
        assert [value.strip() for value in home.meta['description']] == [config['description'].strip()], 'Home branding changed'
    print(f'SEO PASS: {len(urls)} unique canonical URLs; {lastmods} explicit lastmod; {len(excluded)} excluded source documents; {len(search)} search entries; collection counts={counts}')


if __name__ == '__main__':
    verify(Path(sys.argv[1] if len(sys.argv) > 1 else '_site').resolve())
