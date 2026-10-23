#!/usr/bin/env python3
"""Source, actual rendered HTML, and private publication-boundary checks.

The canonical article is public; private_site must be a clean ordinary build of
a disposable source copy with this article set private. No source writes here.
"""
import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.headings = []
        self.details = 0
        self.toc_links = []
        self.in_toc = 0
        self.heading = None
        self.pre = None
        self.codes = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'ul':
            if self.in_toc or a.get('id') == 'markdown-toc':
                self.in_toc += 1
        if tag == 'a':
            self.links.append(a.get('href', ''))
            if self.in_toc:
                self.toc_links.append(a.get('href', ''))
        if tag == 'h2':
            self.heading = [a.get('id'), '']
        if tag == 'details':
            self.details += 1
        if tag == 'pre':
            self.pre = ''

    def handle_endtag(self, tag):
        if tag == 'ul' and self.in_toc:
            self.in_toc -= 1
        if tag == 'h2' and self.heading is not None:
            self.headings.append(self.heading)
            self.heading = None
        if tag == 'pre' and self.pre is not None:
            self.codes.append(self.pre)
            self.pre = None

    def handle_data(self, data):
        if self.heading is not None:
            self.heading[1] += data
        if self.pre is not None:
            self.pre += data


def verify(source, preview, private_site, sources):
    text = source.read_text()
    assert text.startswith('---\n'), 'frontmatter missing'
    assert re.search(r'^public: true$', text, re.M), 'approved manuscript must be public'
    for field in ['layout: wiki', "parent: '[[index]]'", 'toc: true', 'latex: false']:
        assert field in text, field
    assert '* TOC\n{:toc}' in text, 'authored TOC marker missing'
    assert not re.search(r'^\s*\d+\|', text, re.M), 'reader line prefixes leaked'
    chapters = re.findall(r'^## (\d+)장\.', text, re.M)
    assert chapters == [str(i) for i in range(1, 9)], chapters
    assert re.findall(r'<a id="chapter-(\d+)"></a>', text) == chapters
    blocks = re.findall(r'^```python\n(.*?)^```', text, re.M | re.S)
    assert len(blocks) == 5 and text.count('```') == 10, 'four teaching fragments and one executable block required'
    marker = text.index('<!-- executable: idempotency_demo.py -->')
    for heading in ['### 입력 비교가 재실행을 막는 위치', '### 차감 조건과 결과 저장을 연결한다', '### 오류를 받았을 때 커밋 여부를 나눈다']:
        assert text.index(heading) < marker, 'principle explanation must precede full code'
    assert text.index('### 전체 실행 코드') < marker < text.index('### 실패 지점을 바꿔 관찰하기')
    chapter4 = text.split('<a id="chapter-4"></a>')[1].split('<a id="chapter-5"></a>')[0]
    for step in range(1, 7):
        assert re.search(r'^' + str(step) + r'\. \*\*', chapter4, re.M), 'normal state step missing'
    assert chapter4.index('1. **') < chapter4.index('![같은 DB'), 'diagram must not replace worked steps'
    for heading in ['### 세 테이블은 무엇을 기억하는가', '### 같은 요청을 다시 받으면 어디서 갈라지는가', '### 최초 처리 중 실패하면 무엇이 남는가']:
        assert heading in chapter4
    assert text.index('### HTTP 메서드와 제품의 결과 저장 정책을 구분한다') > text.index('<a id="chapter-8"></a>')
    code = re.search(r'<!-- executable: idempotency_demo.py -->\n```python\n(.*?)\n```', text, re.S)
    assert code, 'canonical example missing'
    compile(code[1], 'idempotency_demo.py', 'exec')
    defs = re.findall(r'^\[\^([^]]+)\]:', text, re.M)
    refs = re.findall(r'\[\^([^]]+)\](?!:)', text)
    assert set(defs) == set(refs), 'undefined/unused footnotes'
    assert len(defs) == len(set(defs)), 'duplicate footnotes'
    source_records = json.loads(sources.read_text())
    assert set(defs) == {r['id'] for r in source_records}, 'source inventory mismatch'
    assert all(r['status'] == 200 and r['reviewed_sections'] for r in source_records)
    urls = re.findall(r'<(https://[^>]+)>', text)
    assert set(urlsplit(u)._replace(fragment='').geturl() for u in urls) == {r['url'] for r in source_records}
    for match in re.finditer(r'\]\(#([^)]*)\)', text):
        assert 'id="' + match[1] + '"' in text, 'missing source anchor ' + match[1]

    html_path = preview / 'wiki/idempotency/index.html'
    html = html_path.read_text()
    page = Page()
    page.feed(html)
    duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
    assert not duplicates, duplicates
    assert page.ids.count('markdown-toc') == 1
    assert page.details >= 1, 'answer disclosure did not render'
    rendered_chapters = [(key, title) for key, title in page.headings if re.match(r'\d+장\.', title)]
    assert len(rendered_chapters) == 8, rendered_chapters
    assert [title.split('장.', 1)[0] for _, title in rendered_chapters] == chapters
    assert all('#' + key in page.toc_links for key, _ in rendered_chapters), 'chapter missing from TOC'
    assert any(block.strip() == code[1].strip() for block in page.codes), 'rendered code differs from executed code'
    diagram = json.loads((source.parent.parent / 'docs/idempotency-textbook/diagram.json').read_text())
    images = re.findall(r'<img\b[^>]*src="([^"]+)"', html)
    assert images == [diagram['url']], 'diagram missing or unexpected image'
    assert diagram['url'].startswith('https://github.com/user-attachments/assets/')
    footnote_ids = re.findall(r'<li id="fn:([^"]+)"', html)
    numbered_refs = re.findall(r'href="#fn:([^"]+)"[^>]*>(\d+)</a>', html)
    assert len(footnote_ids) == len(defs) and numbered_refs
    for name, number in numbered_refs:
        assert footnote_ids[int(number)-1] == name, 'wrong displayed footnote number'
    metadata = json.loads((preview / 'data/metadata/idempotency.json').read_text())
    assert metadata['parent'] == 'index', 'wrong parent metadata type or target'
    assert metadata['title'] == '멱등성' and metadata['url'] == '/wiki/idempotency'
    for output in ['index.html', 'wiki/index/index.html', 'search-index.json', 'graph-data.json', 'sitemap.xml']:
        assert '/wiki/idempotency' in (preview / output).read_text(), 'public entry missing: ' + output
    assert '[멱등성](/wiki/idempotency/)' in (source.parent / 'distributed-transaction.md').read_text()
    assert 'href="/wiki/idempotency/"' in (preview / 'wiki/distributed-transaction/index.html').read_text()
    assert 'reading-series' not in html and 'reading-chapter-nav' not in html, 'unapproved series UI'
    assert '<link rel="canonical" href="https://currenjin.github.io/wiki/idempotency/"' in html
    assert not re.search(r'/(?:Users|home)/[^\s<]+', html), 'personal path leaked'
    for link in page.links:
        parsed = urlsplit(link)
        if not parsed.scheme and not parsed.netloc and not parsed.path and parsed.fragment:
            assert unquote(parsed.fragment) in page.ids, 'broken fragment: ' + link
        elif not parsed.scheme and not parsed.netloc and parsed.path.startswith('/'):
            target = preview / unquote(parsed.path.lstrip('/'))
            if target.is_dir() or parsed.path.endswith('/'):
                target = target / 'index.html'
            elif not target.exists() and not target.suffix:
                target = target / 'index.html'
            assert target.exists(), 'broken local path: ' + link
    for directory in [preview, private_site]:
        for excluded in ['docs', 'tests', '.agents', 'AGENTS.md']:
            assert not (directory / excluded).exists(), 'authoring artifact published: ' + excluded
    assert not (private_site / 'wiki/idempotency/index.html').exists(), 'private manuscript emitted'
    assert not (private_site / 'data/metadata/idempotency.json').exists(), 'private metadata emitted'
    for name in ['index.html', 'wiki/index/index.html', 'search-index.json', 'graph-data.json', 'sitemap.xml']:
        output = (private_site / name).read_text()
        assert '/wiki/idempotency' not in output, 'private route leaked into ' + name
    return dict(result='PASS', chapters=len(chapters), source_documents=len(defs),
                local_links=len([link for link in page.links if link.startswith(('/', '#'))]),
                unique_ids=len(page.ids), exact_rendered_code=True, private_boundary=True,
                manuscript_sha256=hashlib.sha256(text.encode()).hexdigest())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('preview', type=Path)
    parser.add_argument('private_site', type=Path)
    parser.add_argument('--source', type=Path, default=ROOT / '_wiki/idempotency.md')
    parser.add_argument('--sources', type=Path, default=ROOT / 'docs/idempotency-textbook/sources.json')
    args = parser.parse_args()
    print(json.dumps(verify(args.source, args.preview, args.private_site, args.sources), ensure_ascii=False, indent=2))
