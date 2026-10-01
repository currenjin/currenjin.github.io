"""Real Jekyll publication lifecycle in a disposable copy; never adds public samples."""
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def chapter(title, public=True, extra=''):
    return f'---\ntitle: {title}\nbook: lifecycle\nchapter_id: {title}\npublic: {str(public).lower()}\ndate: 2026-01-01\nupdated: 2026-01-02\n{extra}---\n\nFixture body {title}.\n'
with tempfile.TemporaryDirectory(prefix='archive-lifecycle-') as tmp:
    root = Path(tmp) / 'source'
    shutil.copytree(ROOT, root, ignore=shutil.ignore_patterns('.git', '.ouroboros', '_site', 'vendor', 'node_modules', '__pycache__'))
    chapters = root / '_chapters/lifecycle'
    chapters.mkdir(parents=True)
    for title in ['first', 'last', 'secret', 'future', 'draft', 'unpublished', 'orphan']:
        text = chapter(title, title != 'secret', 'draft: true\n' if title == 'draft' else 'published: false\n' if title == 'unpublished' else '')
        if title == 'future':
            text = text.replace('2026-01-01', '2099-01-01').replace('2026-01-02', '2099-01-02')
        (chapters / (title + '.md')).write_text(text)
    book = [{'id':'lifecycle','title':'Lifecycle fixture','intro':'Fixture only','public':True,'chapters':[{'id':'first','state':'published'}, {'id':'plan','state':'planned','title':'Planned fixture'}, {'id':'secret','state':'published'}, {'id':'future','state':'published'}, {'id':'draft','state':'published'}, {'id':'unpublished','state':'published'}, {'id':'last','state':'published'}]}]
    metadata = root / '_data/post_books.yml'
    metadata.write_text(json.dumps(book))
    command = ['docker','run','--rm','-v',f'{root}:/srv/jekyll','jekyll/jekyll:4','jekyll','build','--destination','/srv/jekyll/_site']
    def build():
        shutil.rmtree(root / '_site', ignore_errors=True)
        result = subprocess.run(command, capture_output=True, text=True, timeout=100)
        assert result.returncode == 0, result.stdout + result.stderr
        return root / '_site'
    site = build()
    index = json.loads((site / 'search-index.json').read_text())
    assert sum('lifecycle' in x['url'] for x in index) == 3
    for title in ['secret','future','draft','unpublished','orphan']:
        assert not (site / f'posts/chapters/lifecycle/{title}/index.html').exists()
        assert all(title not in x['url'] for x in index)
    first = (site / 'posts/chapters/lifecycle/first/index.html').read_text()
    last = (site / 'posts/chapters/lifecycle/last/index.html').read_text()
    assert '책 전체 목차' in first and '집필 예정' in first
    assert '다음 장 · last' in first and '이전 장 · first' in last
    assert 'book-toc-lifecycle' in (site / 'index.html').read_text()
    assert 'Lifecycle fixture' in (site / 'posts/index.html').read_text()
    # Complete withdrawal: a public chapter cannot escape a private book.
    book[0]['public'] = False
    metadata.write_text(json.dumps(book))
    site = build()
    assert 'Lifecycle fixture' not in (site / 'posts/index.html').read_text()
    assert not (site / 'posts/chapters/lifecycle').exists()
    assert all('lifecycle' not in x['url'] for x in json.loads((site / 'search-index.json').read_text()))
    print('PASS real-build lifecycle: publication, planned TOC, draft/orphan exclusion, chapter navigation, search, complete withdrawal')
