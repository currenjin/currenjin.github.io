"""The real-build integration copies plumbing, not the production corpus."""
import ast
from pathlib import Path
import runpy
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'tests/reading_navigation_integration.py'


class ReadingNavigationFixtureTest(unittest.TestCase):
    def load(self):
        tree = ast.parse(SCRIPT.read_text())
        self.assertTrue(any(isinstance(node, ast.FunctionDef) and node.name == 'prepare_fixture'
                            for node in tree.body), 'integration must expose a minimal fixture builder')
        with patch('subprocess.run', side_effect=AssertionError('import must not run a build')):
            return runpy.run_path(str(SCRIPT), run_name='fixture_test')

    def test_fixture_copies_real_production_plumbing_but_no_corpus_or_tools(self):
        module = self.load()
        with tempfile.TemporaryDirectory(prefix='reading-fixture-test-') as temp:
            root = Path(temp) / 'repo'
            module['prepare_fixture'](root)
            for name in ['_config.yml', 'Gemfile', 'Gemfile.lock', 'index.html', 'books.md',
                         'search-index.json', 'sitemap.xml', 'tests/verify_seo.py']:
                self.assertEqual((ROOT / name).read_bytes(), (root / name).read_bytes(), name)
            for directory in ['_plugins', '_layouts', '_includes']:
                source = {p.relative_to(ROOT) for p in (ROOT / directory).rglob('*') if p.is_file()}
                copied = {p.relative_to(root) for p in (root / directory).rglob('*') if p.is_file()}
                self.assertEqual(source, copied)
                for name in source:
                    self.assertEqual((ROOT / name).read_bytes(), (root / name).read_bytes(), str(name))
            for directory in ['_wiki', '_reviews', '_post']:
                self.assertTrue((root / directory).is_dir())
                self.assertEqual([], list((root / directory).iterdir()))
            for name in ['node_modules', '.git', '.agents', 'docs', 'resource', 'js', 'css', '_site']:
                self.assertFalse((root / name).exists(), name)
            self.assertEqual('[]', (root / '_data/post_books.yml').read_text().strip())
            self.assertEqual('[]', (root / '_data/activity_log.yml').read_text().strip())
            self.assertEqual(['verify_seo.py'], sorted(p.name for p in (root / 'tests').iterdir()))

    def test_native_run_remains_real_production_jekyll(self):
        module = self.load()
        with patch.dict('os.environ', {'READING_NAV_NATIVE_BUILD': '1'}), patch('subprocess.run') as run:
            module['run'](Path('/fixture'))
        args, kwargs = run.call_args
        self.assertEqual(['bundle', 'exec', 'jekyll', 'build'], args[0])
        self.assertEqual('production', kwargs['env']['JEKYLL_ENV'])
        self.assertEqual(str(ROOT / 'Gemfile'), kwargs['env'].get('BUNDLE_GEMFILE'),
                         'scratch cwd must reuse the installed production bundle configuration')
        self.assertTrue(kwargs['check'])


if __name__ == '__main__':
    unittest.main()
