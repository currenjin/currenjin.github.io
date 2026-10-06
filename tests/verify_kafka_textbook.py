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
p.feed(page.read_text())
errors = []
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
for target in ["chapter-" + str(n) for n in range(1,13)] + ["connect", "cdc", "outbox"]:
    if target not in p.ids:
        errors.append("Missing chapter: " + target)
source = Path("_wiki/kafka.md").read_text()
if len(re.findall(r"^## \d+장\.", source, re.M)) != 15:
    errors.append("Expected 15 chapters")
if p.details < 15:
    errors.append("Expected expandable explanations")
print(json.dumps({"result": "FAIL" if errors else "PASS", "chapter_count": 15,
                  "internal_links": len(p.links), "images": len(p.images),
                  "details": p.details, "errors": errors}, ensure_ascii=False, indent=2))
sys.exit(bool(errors))
