#!/usr/bin/env python3
"""Source-level contracts for the four Kafka integration figures, not semantic QA."""
from pathlib import Path
import re
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.w3.org/2000/svg}'
FIGURES = [
    'fig-14-connect-runtime.svg',
    'fig-14-connect-record-path.svg',
    'fig-15-snapshot-streaming.svg',
    'fig-16-outbox-boundaries.svg',
]


def luminance(color):
    rgb = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    rgb = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return sum(a * b for a, b in zip(rgb, (0.2126, 0.7152, 0.0722)))


def contrast(a, b):
    low, high = sorted((luminance(a), luminance(b)))
    return (high + 0.05) / (low + 0.05)


class IntegrationDiagrams(unittest.TestCase):
    def test_each_figure_is_embedded_once_near_its_chapter(self):
        source = (ROOT / '_wiki/kafka.md').read_text()
        for name in FIGURES:
            with self.subTest(figure=name):
                self.assertEqual(source.count('/assets/images/kafka-textbook/' + name), 1)
                position = source.index('/assets/images/kafka-textbook/' + name)
                chapter = re.findall(r'^## (\d+)장\.', source[:position], re.M)[-1]
                self.assertEqual(chapter, name.split('-')[1])

    def test_svg_accessibility_rendering_and_publication_safety(self):
        for name in FIGURES:
            with self.subTest(figure=name):
                svg = ET.parse(ROOT / 'assets/images/kafka-textbook' / name).getroot()
                self.assertEqual(svg.get('role'), 'img')
                elements = list(svg.iter())
                ids = [e.get('id') for e in elements if e.get('id')]
                self.assertEqual(len(ids), len(set(ids)))
                for ref in svg.get('aria-labelledby', '').split():
                    self.assertIn(ref, ids)
                self.assertEqual(len(svg.get('aria-labelledby', '').split()), 2)
                for tag in ('title', 'desc'):
                    node = svg.find(NS + tag)
                    assert node is not None
                    self.assertTrue(node.text)
                self.assertTrue(svg.findall('.//' + NS + 'path'))
                self.assertLessEqual(float(svg.get('width', '0')), 420)
                self.assertFalse(any(e.tag in [NS + 'script', NS + 'image', NS + 'foreignObject'] for e in elements))
                for e in elements:
                    self.assertFalse(any('href' in key for key in e.attrib))
                    if e.tag == NS + 'text':
                        self.assertGreaterEqual(float(e.get('font-size', '0')), 12)
                background = svg.find(NS + 'rect')
                assert background is not None
                self.assertEqual(background.get('fill'), '#fbfaf6')

    def test_current_opaque_palette_contrast(self):
        # Both node fill and artboard are opaque; no alpha compositing is needed.
        for fill in ('#fbfaf6', '#ffffff'):
            self.assertGreaterEqual(contrast('#26262b', fill), 4.5)
            self.assertGreaterEqual(contrast('#555b6b', fill), 3)

    def test_diagram_skill_is_shared_not_provider_specific(self):
        shared = ROOT / '.agents/skills/diagram/SKILL.md'
        self.assertIn('name: diagram', shared.read_text())
        self.assertIn('.agents/skills/diagram/SKILL.md', (ROOT / 'AGENTS.md').read_text())
        self.assertFalse((ROOT / '.claude/skills/diagram/SKILL.md').exists())


if __name__ == '__main__':
    unittest.main()
