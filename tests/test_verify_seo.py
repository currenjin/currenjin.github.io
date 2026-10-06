"""Verifier regressions: URL encoding must not hide public or withdrawn records."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import quote

import verify_seo as seo


class VerifierTests(unittest.TestCase):
    def test_stamp_normalizes_offsets_for_python38_fixture_runtime(self):
        for value in ['2020-01-01 00:00:00 +0900', '2020-01-01T00:00:00+0900',
                      '2020-01-01 00:00:00 +09:00']:
            self.assertEqual(seo.stamp(value), '2020-01-01T00:00:00+09:00')

    def verify_fixture(self, public_path='/reviews/한글/', search_path=None,
                       excluded=(), extra_search=(), branding='Original branding'):
        with tempfile.TemporaryDirectory(prefix='seo-verifier-') as tmp:
            root = Path(tmp)
            site = root / 'site'
            site.mkdir()
            (root / '_config.yml').write_text('description: "Original branding\\n"\n')
            expected = {'/': (None, {}), public_path: (None, {})}
            for path in expected:
                url = seo.ORIGIN + quote(path, safe='/%')
                description = branding if path == '/' else 'Public description'
                html = ('<head><title>Title</title>'
                        f'<link rel="canonical" href="{url}">')
                for key in ['description', 'og:description', 'twitter:description',
                            'og:title', 'twitter:title', 'og:url', 'og:image', 'twitter:image']:
                    value = (description if 'description' in key else 'Title' if 'title' in key
                             else url if key == 'og:url' else seo.ORIGIN + '/image.png')
                    html += f'<meta name="{key}" content="{value}">'
                target = seo.output(site, path)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(html + '</head>')
            redirect = seo.output(site, '/books/')
            redirect.parent.mkdir(parents=True)
            redirect.write_text(f'<head><link rel="canonical" href="{seo.ORIGIN}/reviews/"></head>')
            (site / 'sitemap.xml').write_text(
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
                ''.join(f'<url><loc>{seo.ORIGIN}{quote(path, safe="/%")}</loc></url>' for path in expected) +
                '</urlset>')
            (site / 'search-index.json').write_text(json.dumps(
                [{'url': search_path or public_path}] + [{'url': path} for path in extra_search]))
            with patch.object(seo, 'ROOT', root), patch.object(seo, 'inventory', return_value=(expected, set(excluded), {})), contextlib.redirect_stdout(io.StringIO()):
                seo.verify(site)

    def test_post_inventory_preserves_routes_and_book_publication_boundary(self):
        with tempfile.TemporaryDirectory(prefix='seo-post-inventory-') as tmp:
            root = Path(tmp)
            (root / '_data').mkdir()
            (root / '_data/post_books.yml').write_text('''
- id: registered
  public: true
  chapters:
    - {id: good, state: published}
    - {id: planned, state: planned}
- id: private
  public: false
  chapters:
    - {id: good, state: published}
''')
            records = {
                'article': {}, 'custom': {'permalink': '/kept/'},
                'books/registered/good': {'book': 'registered', 'chapter_id': 'good'},
                'books/registered/planned': {'book': 'registered', 'chapter_id': 'planned'},
                'books/private/good': {'book': 'private', 'chapter_id': 'good'},
                'books/orphan': {},
                'metadata-orphan': {'book': 'unknown', 'chapter_id': 'good'},
                'secret': {'public': False}, 'invalid': {'updated': '2019-01-01'},
            }
            for slug, override in records.items():
                path = root / '_post' / (slug + '.md')
                path.parent.mkdir(parents=True, exist_ok=True)
                data = {'title': slug, 'public': True, 'date': '2020-01-01', 'updated': '2020-01-02', **override}
                path.write_text('---\n' + seo.yaml.safe_dump(data) + '---\nBody\n')
            with patch.object(seo, 'ROOT', root):
                expected, excluded, counts = seo.inventory()
            self.assertEqual(set(expected), {'/posts/article/', '/kept/', '/posts/chapters/registered/good/'})
            self.assertEqual(counts['post'], 3)
            self.assertEqual(excluded, {'/posts/chapters/registered/planned/', '/posts/chapters/private/good/',
                                       '/posts/chapters/orphan/', '/posts/metadata-orphan/', '/posts/secret/', '/posts/invalid/'})

    def test_encoded_search_matches_raw_source(self):
        self.verify_fixture(search_path='/reviews/%ED%95%9C%EA%B8%80/')

    def test_raw_search_matches_raw_source(self):
        self.verify_fixture(search_path='/reviews/한글/')

    def test_encoded_excluded_search_is_rejected(self):
        with self.assertRaisesRegex(AssertionError, 'Withdrawn record in search'):
            self.verify_fixture(excluded=['/reviews/비공개/'],
                                extra_search=[quote('/reviews/비공개/')])

    def test_encoded_exclusion_matches_raw_search(self):
        with self.assertRaisesRegex(AssertionError, 'Withdrawn record in search'):
            self.verify_fixture(excluded=[quote('/reviews/비공개/')],
                                extra_search=['/reviews/비공개/'])

    def test_home_outer_whitespace_is_not_branding(self):
        self.verify_fixture(branding='  Original branding\n')

    def test_meaningful_home_branding_change_is_rejected(self):
        with self.assertRaisesRegex(AssertionError, 'Home branding changed'):
            self.verify_fixture(branding='Changed branding')


if __name__ == '__main__':
    unittest.main(verbosity=2)
