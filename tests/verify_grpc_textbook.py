#!/usr/bin/env python3
"""Rendered gRPC textbook integrity and preservation checks, not semantic verification.

Usage: python3 tests/verify_grpc_textbook.py [_site] [git-ref]
The git ref (default HEAD) is the baseline whose code blocks, figures, anchors,
external links, questions and front matter must survive an edit.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import subprocess
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
        if tag == "img" and "grpc-textbook" in a.get("src", ""):
            self.images.append(a["src"])
        if tag == "details":
            self.details += 1

site = Path(sys.argv[1] if len(sys.argv) > 1 else "_site")
ref = sys.argv[2] if len(sys.argv) > 2 else "HEAD"
html = (site / "wiki/grpc/index.html").read_text()
p = Page()
p.feed(html)
errors = []

if "markdown-toc" not in p.ids:
    errors.append("Missing rendered table of contents")
for n in range(1, 16):
    if not re.search(r'id="markdown-toc-[^"]*"[^>]*>\s*' + str(n) + r'장\.', html):
        errors.append(f"Missing TOC entry for chapter {n}")
for target in ["chapter-" + str(n) for n in range(1, 16)] + ["glossary"]:
    if target not in p.ids:
        errors.append("Missing anchor: " + target)
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
    else:
        ET.parse(file)

source = Path("_wiki/grpc.md").read_text()
base = subprocess.run(["git", "show", f"{ref}:_wiki/grpc.md"], capture_output=True,
                      text=True, check=True).stdout
chapters = re.findall(r"^## (\d+)장\.", source, re.M)
if chapters != [str(n) for n in range(1, 16)]:
    errors.append("Expected sequential chapter headings 1–15")
for part in source.split('<a id="chapter-')[1:]:
    if "공식 원문:" not in part:
        errors.append("Chapter without 공식 원문 line: " + part.split('"', 1)[0])

def front(text):
    return text.split("---", 2)[1]
def keep(pattern, label, flags=re.S):
    old, new = Counter(re.findall(pattern, base, flags)), Counter(re.findall(pattern, source, flags))
    lost = old - new
    if lost:
        errors.append(f"Lost {label}: " + "; ".join(x[:60] for x in lost))
keep(r"```.*?```", "code block")
keep(r"!\[[^\]]*\]\([^)]+\)", "figure")
keep(r'<a id="[^"]+"></a>', "anchor")
keep(r"\]\((https?://[^)]+)\)", "external link")
keep(r"\]\((/wiki/[^)]+)\)", "wiki link")
keep(r"^### 확인 질문.*$", "question", re.M)
for key in ["layout", "title", "date", "tags", "toc", "public", "parent", "latex", "ai:", "level: generated", "reviewed: true"]:
    if key in front(base) and key not in front(source):
        errors.append("Lost front matter: " + key)
if p.details < base.count("<details"):
    errors.append("Expandable explanations decreased")
for forbidden in ["docs/grpc-verification.md", "docs/grpc-wiki-update-verification.md", "tests"]:
    if (site / forbidden).exists():
        errors.append("Published authoring artifact: " + forbidden)

print(json.dumps({"result": "FAIL" if errors else "PASS", "baseline": ref,
                  "chapter_count": len(chapters), "internal_links": len(p.links),
                  "images": len(p.images), "details": p.details, "errors": errors},
                 ensure_ascii=False, indent=2))
sys.exit(bool(errors))
