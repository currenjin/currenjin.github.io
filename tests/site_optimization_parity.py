"""Verify the complete output changes only at the approved optimization boundaries.

python3 tests/site_optimization_parity.py BASELINE SITE
"""
import json
from pathlib import Path
import re
import sys


def normalize_html(text):
    for script in [
        '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>',
    ]:
        text = text.replace(script, '')
    text = re.sub(r'/js/home-cosmos(?:\.bundle)?\.js\?v=[^"\s]+', '/js/HOME-SCENE', text)
    text = re.sub(r'/js/reviews\.js\?v=[^"\s]+', '/js/REVIEWS', text)
    text = re.sub(r'/js/mermaid-init\.js(?:\?v=[^"\s]+)?', '/js/MERMAID-INIT', text)
    return text


def main(baseline, candidate):
    inventory = lambda root: {str(p.relative_to(root)): p for p in root.rglob('*') if p.is_file()}
    old, new = inventory(baseline), inventory(candidate)
    assert new.keys() - old.keys() == {'js/home-cosmos.bundle.js'}, sorted(new.keys() - old.keys())
    assert not old.keys() - new.keys(), sorted(old.keys() - new.keys())
    allowed_assets = {'js/reviews.js', 'js/mermaid-init.js', 'start.sh'}
    changed = []
    html_count = 0
    for relative, path in old.items():
        before, after = path.read_bytes(), new[relative].read_bytes()
        if relative.endswith('.html'):
            html_count += 1
        if before == after:
            continue
        changed.append(relative)
        if relative in allowed_assets:
            continue
        if relative.endswith('.html'):
            assert normalize_html(before.decode()) == normalize_html(after.decode()), relative
        elif relative == 'feed.xml':
            # Only channel timestamps are build-time values; item dates remain exact.
            normalize = lambda text: re.sub(r'<(pubDate|lastBuildDate)>[^<]+</\1>', '<BUILD-TIME/>', text, count=2)
            assert normalize(before.decode()) == normalize(after.decode()), relative
        else:
            raise AssertionError('Unexpected changed output: ' + relative)
    for private in ['docs', 'tests', 'scripts', 'AGENTS.md', 'node_modules', '.agents', 'package.json', 'package-lock.json']:
        assert not (candidate / private).exists(), private
    result = {'result': 'PASS', 'baseline_files': len(old), 'candidate_files': len(new),
              'html_pages': html_count, 'changed_output_files': len(changed),
              'only_new_asset': 'js/home-cosmos.bundle.js',
              'content_and_css_and_legacy_assets_preserved': True}
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main(*(Path(arg).resolve() for arg in sys.argv[1:3]))
