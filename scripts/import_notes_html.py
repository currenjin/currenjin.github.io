#!/usr/bin/env python3
"""Import book notes from Notion HTML export, correctly separating comments from content."""

import os
import re
import unicodedata
import yaml
from bs4 import BeautifulSoup, NavigableString

EXPORT_DIR = os.path.expanduser(
    "~/Downloads/ExportBlock-a0315e10-be87-42de-981d-a62f01eb715e-Part-1/독서"
)
BOOKS_YML = "_data/books.yml"
BOOKS_DIR = "_books"


def nfc(s):
    return unicodedata.normalize("NFC", s)


def html_to_markdown(element):
    """Convert an HTML element to markdown text."""
    if element is None:
        return ""

    result = []
    for child in element.children:
        if isinstance(child, NavigableString):
            result.append(str(child))
        elif child.name == "br":
            result.append("\n")
        elif child.name in ("strong", "b"):
            inner = html_to_markdown(child).strip()
            if inner:
                result.append(f"**{inner}**")
        elif child.name in ("em", "i"):
            inner = html_to_markdown(child).strip()
            if inner:
                result.append(f"*{inner}*")
        elif child.name == "mark":
            inner = html_to_markdown(child)
            result.append(inner)
        elif child.name == "del":
            inner = html_to_markdown(child).strip()
            if inner:
                result.append(f"~~{inner}~~")
        elif child.name == "code":
            inner = html_to_markdown(child)
            result.append(f"`{inner}`")
        elif child.name == "a":
            inner = html_to_markdown(child)
            href = child.get("href", "")
            result.append(f"[{inner}]({href})")
        else:
            result.append(html_to_markdown(child))

    return "".join(result)


def block_to_markdown(block):
    """Convert a page block element to markdown."""
    if block is None:
        return ""

    tag = block.name
    if not tag:
        return ""

    text = html_to_markdown(block)

    if tag == "h1":
        return f"# {text.strip()}"
    elif tag == "h2":
        return f"## {text.strip()}"
    elif tag == "h3":
        return f"### {text.strip()}"
    elif tag == "p":
        stripped = text.strip()
        return stripped if stripped else ""
    elif tag == "hr":
        return "---"
    elif tag in ("ul", "ol"):
        items = []
        for li in block.find_all("li", recursive=False):
            li_text = html_to_markdown(li).strip()
            if li_text:
                items.append(f"- {li_text}")
        return "\n".join(items)
    elif tag == "blockquote":
        return f"> {text.strip()}"
    else:
        return text.strip()


def extract_page_body(soup):
    """Extract main content from page-body div."""
    body = soup.find("div", class_="page-body")
    if not body:
        return ""

    lines = []
    for child in body.children:
        if isinstance(child, NavigableString):
            continue
        # Each block is wrapped in display:contents div
        if child.name == "div":
            for block in child.children:
                if isinstance(block, NavigableString):
                    continue
                md = block_to_markdown(block)
                lines.append(md)
        else:
            md = block_to_markdown(child)
            lines.append(md)

    # Join and clean up excessive blank lines
    text = "\n\n".join(l for l in lines if l is not None)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_comments(soup):
    """Extract comments from <details> section."""
    details = soup.find("details")
    if not details:
        return ""

    comment_blocks = []
    for li in details.find_all("li"):
        # Get comment content div (second div in li)
        divs = li.find_all("div", recursive=False)
        if len(divs) < 2:
            continue
        content_div = divs[1]
        text = html_to_markdown(content_div).strip()
        if text:
            # Clean up excessive line breaks
            text = re.sub(r"\n{3,}", "\n\n", text)
            comment_blocks.append(text)

    return "\n\n---\n\n".join(comment_blocks)


def parse_html_file(path):
    """Parse HTML file → returns (main_content, comment_content)."""
    with open(path, encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    main_content = extract_page_body(soup)
    comment_content = extract_comments(soup)

    return main_content, comment_content


def build_frontmatter(book):
    lines = ["---"]
    lines.append(f'layout   : book')
    lines.append(f'title    : "{book["title"]}"')
    lines.append(f'author   : "{book.get("author", "")}"')
    lines.append(f'type     : "{book.get("type", "")}"')
    lines.append(f'status   : {book.get("status", "want")}')
    if book.get("end_date"):
        lines.append(f'end_date : "{book["end_date"]}"')
    lines.append("---")
    return "\n".join(lines)


def normalize_title(s):
    return re.sub(r"[\s\W]", "", s).lower()


def main():
    with open(BOOKS_YML, encoding="utf-8") as f:
        books = yaml.safe_load(f)

    books_by_title = {nfc(b["title"]): b for b in books}

    export_files = os.listdir(EXPORT_DIR)
    updated = 0
    skipped = 0

    for filename in sorted(export_files):
        if not filename.endswith(".html"):
            continue
        nfc_filename = nfc(filename)
        title_part = re.sub(r"\s+[0-9a-f]{32}\.html$", "", nfc_filename)

        # Match book
        book = books_by_title.get(title_part)
        if not book:
            norm = normalize_title(title_part)
            for bt, bv in books_by_title.items():
                if normalize_title(bt) == norm:
                    book = bv
                    break
        if not book:
            print(f"[SKIP] 매칭 없음: {title_part}")
            skipped += 1
            continue

        path = os.path.join(EXPORT_DIR, filename)
        main_content, comment_content = parse_html_file(path)

        if not main_content.strip() and not comment_content.strip():
            skipped += 1
            continue

        # Build body
        body_parts = []
        if main_content.strip():
            body_parts.append(main_content.strip())
        if comment_content.strip():
            body_parts.append("\n### 코멘트\n")
            body_parts.append(comment_content.strip())

        body = "\n\n".join(body_parts)

        slug = book.get("slug", "")
        if not slug:
            skipped += 1
            continue

        out_path = os.path.join(BOOKS_DIR, f"{slug}.md")
        content = f"{build_frontmatter(book)}\n\n{body}\n"

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(content)

        book["has_notes"] = True
        print(f"[OK] {book['title']}")
        updated += 1

    with open(BOOKS_YML, "w", encoding="utf-8") as f:
        yaml.dump(books, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"\n완료: {updated}권, 스킵: {skipped}권")


if __name__ == "__main__":
    main()
