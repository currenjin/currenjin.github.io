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
