"""Portable private-skill reference without publishing its body."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]

class ConsumerReferences(unittest.TestCase):
    def test_diagram_delegates_and_links_setup(self):
        text = (ROOT / '.agents/skills/diagram/SKILL.md').read_text()
        self.assertIn('~/.agents/skills/diagram/SKILL.md', text)
        self.assertIn('../../agent-kit.md', text)
        self.assertNotIn('/Users/', text)

    def test_setup_records_private_access_requirement(self):
        guide = ROOT / '.agents/agent-kit.md'
        self.assertTrue(guide.is_file())
        text = guide.read_text()
        self.assertIn('currenjin/agent-kit', text)
        self.assertIn('private', text)
        self.assertIn('CONSUMERS.md', text)
        self.assertNotIn('/Users/', text)

    def test_local_publication_contract_is_preserved(self):
        text = (ROOT / '.agents/skills/diagram/SKILL.md').read_text()
        for expected in ['GitHub Issue', 'Jekyll', '실제 렌더된 문서', 'SHA-256', '라이트·다크']:
            self.assertIn(expected, text)
        config = (ROOT / '_config.yml').read_text()
        self.assertIn('  - .agents', config)

if __name__ == '__main__':
    unittest.main()
