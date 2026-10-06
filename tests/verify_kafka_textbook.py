#!/usr/bin/env python3
"""Rendered Kafka textbook integrity checks, not semantic verification."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import unquote

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.images = [], [], []
        self.details = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "a" and a.get("href", "").startswith("#"):
            self.links.append(unquote(a["href"][1:]))
        if tag == "img" and "kafka-textbook" in a.get("src", ""):
            self.images.append(a["src"])
        if tag == "details":
            self.details += 1

site = Path(sys.argv[1] if len(sys.argv) > 1 else "_site")
page = site / "wiki/kafka/index.html"
p = Page()
html = page.read_text()
p.feed(html)
errors = []
toc = "markdown-toc" in p.ids
if not toc:
    errors.append("Missing rendered table of contents")
for n in range(0, 16):
    if f'id="markdown-toc-' not in html or not re.search(r'id="markdown-toc-[^\"]*"[^>]*>\s*' + str(n) + r'장\.', html):
        errors.append(f"Missing TOC entry for chapter {n}")
for target in p.links:
    if target and target not in p.ids:
        errors.append("Missing fragment: " + target)
for key, count in Counter(p.ids).items():
    if count > 1:
        errors.append("Duplicate id: " + key)
for src in p.images:
    file = site / src.lstrip("/")
    if not file.is_file():
        errors.append("Missing image: " + src)
    elif file.suffix == ".svg":
        ET.parse(file)
for target in ["chapter-" + str(n) for n in range(0,13)] + ["connect", "cdc", "outbox"]:
    if target not in p.ids:
        errors.append("Missing chapter: " + target)
source = Path("_wiki/kafka.md").read_text()
chapters = re.findall(r"^## (\d+)장\.", source, re.M)
if chapters != [str(n) for n in range(16)]:
    errors.append("Expected foundation chapter 0 followed by unchanged chapters 1–15")
for target in ["foundation-planes", "foundation-pipeline", "foundation-log",
               "foundation-memory", "foundation-io", "foundation-guarantees"]:
    if target not in p.ids:
        errors.append("Missing foundation section: " + target)
for name in ["fig-00-data-path.svg", "fig-00-memory-io.svg"]:
    if not any(src.endswith(name) for src in p.images):
        errors.append("Missing foundation figure: " + name)
if p.details < 15:
    errors.append("Expected expandable explanations")
print(json.dumps({"result": "FAIL" if errors else "PASS", "chapter_count": len(chapters),
                  "internal_links": len(p.links), "images": len(p.images),
                  "details": p.details, "errors": errors}, ensure_ascii=False, indent=2))
sys.exit(bool(errors))
