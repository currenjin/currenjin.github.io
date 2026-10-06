"""Repository entry-point contracts, independent of built HTML."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class RepositoryLayoutTest(unittest.TestCase):
    def test_one_test_tree_and_one_tool_tree(self):
        for obsolete in ['test', 'tool', '_scripts', '_articles', '_chapters']:
            self.assertFalse((ROOT / obsolete).exists(), obsolete)
        for canonical in ['tests/js', 'tests/browser', 'scripts/generation', 'scripts/maintenance', 'scripts/hooks', '_post/books']:
            self.assertTrue((ROOT / canonical).is_dir(), canonical)

    def test_npm_executes_all_javascript_unit_tests(self):
        package = json.loads((ROOT / 'package.json').read_text())
        self.assertEqual('node --test tests/js/*.test.cjs', package['scripts']['test'])
        self.assertEqual('node scripts/generation/generate-data.js', package['scripts']['generate:wiki'])

    def test_internal_consumers_use_canonical_generation_entry(self):
        for name in ['start.sh', 'scripts/hooks/pre-commit']:
            source = (ROOT / name).read_text()
            self.assertIn('scripts/generation/generate-data.js', source)
            self.assertNotIn('./generateData.js', source)
        source = (ROOT / 'scripts/hooks/pre-commit').read_text()
        self.assertIn('scripts/maintenance/save-images.sh', source)

    def test_sync_workflow_trigger_and_command_use_same_existing_script(self):
        workflow = (ROOT / '.github/workflows/sync-medium-posts.yml').read_text()
        canonical = 'scripts/generation/sync-medium-posts.js'
        self.assertIn('"' + canonical + '"', workflow)
        self.assertIn('run: node ' + canonical, workflow)
        self.assertTrue((ROOT / canonical).is_file())
        self.assertNotIn('"scripts/sync-medium-posts.js"', workflow)

    def test_post_collection_is_unique_and_tools_are_excluded(self):
        config = (ROOT / '_config.yml').read_text()
        self.assertIn('    post:', config)
        self.assertNotIn('    articles:', config)
        self.assertNotIn('    chapters:', config)
        self.assertIn('  - scripts', config)
        self.assertIn('  - tests', config)


if __name__ == '__main__':
    unittest.main()
