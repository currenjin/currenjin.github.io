#!/usr/bin/env python3
"""Verify public output plus a clean, withdrawn disposable fixture.

Run after a normal Jekyll build: python3 tests/idempotency_publication.py _site
Uses the current bundle, plugins, and Wiki generator; never edits the checkout.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from typing import Any, Dict
from verify_idempotency_textbook import verify

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('site', type=Path)
    parser.add_argument('--evidence', type=Path)
    args = parser.parse_args()
    env = os.environ.copy()
    env['JEKYLL_ENV'] = 'production'
    env['NODE_PATH'] = str(ROOT / 'node_modules')
    with tempfile.TemporaryDirectory(prefix='idempotency-publication-') as directory:
        temp = Path(directory)
        fixture = temp / 'source'
        shutil.copytree(ROOT, fixture, ignore=shutil.ignore_patterns(
            '.git', '_site', '.jekyll-cache', 'node_modules', 'vendor', '__pycache__'))
        doc = fixture / '_wiki/idempotency.md'
        original = doc.read_text()
        assert 'public: true' in original
        doc.write_text(original.replace('public: true', 'public: false', 1))
        # Withdrawal includes regenerating static metadata, not only hiding HTML.
        shutil.rmtree(fixture / 'data')
        subprocess.run(['node', str(ROOT / 'scripts/generation/generate-data.js')], cwd=fixture, env=env, check=True)
        private = temp / 'private-site'
        subprocess.run(['bundle', 'exec', 'jekyll', 'build', '--destination', str(private)], cwd=fixture, env=env, check=True, stdout=subprocess.PIPE)
        site = args.site.resolve()
        sources = ROOT / 'docs/idempotency-textbook/sources.json'
        result: Dict[str, Any] = verify(ROOT / '_wiki/idempotency.md', site, private, sources)
        # Negative fixtures prove the assertions reject broken content/boundaries.
        rejected = []
        source_mutations = {
            'missing-toc': original.replace('* TOC\n{:toc}', ''),
            'missing-chapter': original.replace('<a id="chapter-4"></a>', ''),
            'missing-worked-step': original.replace('3. **재고가 충분할 때만 차감한다.**', '**재고가 충분할 때만 차감한다.**'),
            'missing-teaching-fragment': original.replace('```python', '```text', 1),
            'unapproved-private-source': original.replace('public: true', 'public: false', 1),
        }
        for name, text in source_mutations.items():
            doc.write_text(text)
            try:
                verify(doc, site, private, sources)
            except AssertionError:
                rejected.append(name)
            else:
                raise AssertionError('negative fixture accepted: ' + name)
        doc.write_text(original)
        rendered = temp / 'mutated-site'
        shutil.copytree(site, rendered)
        htmlpath = rendered / 'wiki/idempotency/index.html'
        good = htmlpath.read_text()
        mutations = {
            'broken-fragment': good.replace('href="#chapter-7"', 'href="#missing-chapter"', 1),
            'different-rendered-code': good.replace('reserve-v1', 'reserve-broken'),
            'repository-image': good.replace('https://github.com/user-attachments/assets/', '/resource/'),

        }
        import re
        mutations['wrong-footnote-number'] = re.sub(r'(href="#fn:[^"]+"[^>]*>)\d+(</a>)', r'\g<1>99\2', good, count=1)
        for name, html in mutations.items():
            assert html != good, 'mutation not applied: ' + name
            htmlpath.write_text(html)
            try:
                verify(ROOT / '_wiki/idempotency.md', rendered, private, sources)
            except (AssertionError, IndexError):
                rejected.append(name)
            else:
                raise AssertionError('negative fixture accepted: ' + name)
        htmlpath.write_text(good)
        leaked = private / 'wiki/idempotency/index.html'
        leaked.parent.mkdir(parents=True, exist_ok=True)
        leaked.write_text(good)
        try:
            verify(ROOT / '_wiki/idempotency.md', site, private, sources)
        except AssertionError:
            rejected.append('private-html-leak')
        else:
            raise AssertionError('private leak accepted')
        result['rejected_negative_fixtures'] = rejected
    if args.evidence:
        args.evidence.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
