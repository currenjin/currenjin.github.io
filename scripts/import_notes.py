#!/usr/bin/env python3
"""Import book notes from Notion markdown export into _books/*.md files."""

import os
import re
import unicodedata
import yaml

EXPORT_DIR = os.path.expanduser(
    "~/Downloads/ExportBlock-75f33ab7-19ae-4426-8a08-d4d53d41e0c8-Part-1/독서"
)
BOOKS_YML = "_data/books.yml"
BOOKS_DIR = "_books"

METADATA_KEYS = {"Status", "End Date", "작가", "Type"}


def nfc(s):
    return unicodedata.normalize("NFC", s)


def parse_export_file(path):
    """Parse export markdown → returns (metadata dict, main_content, comment_content)."""
    with open(path, encoding="utf-8") as f:
        text = f.read()

    lines = text.splitlines()

    # Skip H1 title line
    start = 0
    if lines and lines[0].startswith("# "):
        start = 1

    # Skip blank lines after title
    while start < len(lines) and not lines[start].strip():
        start += 1

    # Skip metadata lines (Key: Value)
    meta = {}
    while start < len(lines):
        line = lines[start]
        if not line.strip():
            start += 1
            continue
        match = re.match(r"^([^:]+):\s*(.*)$", line)
        if match and match.group(1) in METADATA_KEYS:
            meta[match.group(1)] = match.group(2).strip()
            start += 1
        else:
            break

    # Remaining lines = content
    content_lines = lines[start:]

    # Remove leading blank lines
    while content_lines and not content_lines[0].strip():
        content_lines.pop(0)

    # Split into main content and comments
    # Look for toggle block "이 외의 생각" or second "---" separator
    main_lines = []
    comment_lines = []
    in_comment = False
    dash_count = 0

    i = 0
    while i < len(content_lines):
        line = content_lines[i]

        # Detect comment toggle
        if "이 외의 생각" in line or "이 외의 생각 또는 기록" in line:
            in_comment = True
            i += 1
            # Skip leading blank line in toggle
            while i < len(content_lines) and not content_lines[i].strip():
                i += 1
            continue

        # Detect second --- separator
        if line.strip() == "---":
            dash_count += 1
            if dash_count >= 2:
                in_comment = True
                i += 1
                continue
            else:
                main_lines.append(line)
                i += 1
                continue

        # De-indent toggle content (4-space or tab indent from Notion)
        if in_comment:
            stripped = re.sub(r"^    ", "", line)
            comment_lines.append(stripped)
        else:
            main_lines.append(line)
        i += 1

    # Clean up trailing blank lines
    while main_lines and not main_lines[-1].strip():
        main_lines.pop()
    while comment_lines and not comment_lines[-1].strip():
        comment_lines.pop()

    return meta, "\n".join(main_lines), "\n".join(comment_lines)


def build_frontmatter(book):
    """Build Jekyll frontmatter from books.yml entry."""
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


def main():
    # Load books.yml
    with open(BOOKS_YML, encoding="utf-8") as f:
        books = yaml.safe_load(f)

    # Index books by title (NFC normalized)
    books_by_title = {nfc(b["title"]): b for b in books}

    # List export files
    export_files = os.listdir(EXPORT_DIR)

    updated = 0
    skipped = 0

    for filename in sorted(export_files):
        if not filename.endswith(".md"):
            continue
        nfc_filename = nfc(filename)

        # Extract title from filename (remove UUID suffix)
        title_part = re.sub(r"\s+[0-9a-f]{32}\.md$", "", nfc_filename)

        # Match against books.yml
        book = books_by_title.get(title_part)
        if not book:
            # Try fuzzy: remove spaces, special chars
            def normalize_title(s):
                return re.sub(r"[\s\W]", "", s).lower()
            norm_title = normalize_title(title_part)
            for bt, bv in books_by_title.items():
                if normalize_title(bt) == norm_title:
                    book = bv
                    break
        if not book:
            print(f"[SKIP] 매칭 없음: {title_part}")
            skipped += 1
            continue

        path = os.path.join(EXPORT_DIR, filename)
        meta, main_content, comment_content = parse_export_file(path)

        # Skip if no actual content
        if not main_content.strip() and not comment_content.strip():
            skipped += 1
            continue

        # Build content
        body_parts = []
        if main_content.strip():
            body_parts.append(main_content.strip())
        if comment_content.strip():
            body_parts.append("\n### 코멘트\n")
            body_parts.append(comment_content.strip())

        body = "\n\n".join(body_parts)

        # Write file
        slug = book.get("slug", "")
        if not slug:
            print(f"[SKIP] slug 없음: {book['title']}")
            skipped += 1
            continue

        out_path = os.path.join(BOOKS_DIR, f"{slug}.md")
        frontmatter = build_frontmatter(book)
        content = f"{frontmatter}\n\n{body}\n"

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"[OK] {book['title']} → {out_path}")

        # Mark has_notes = true in books.yml
        book["has_notes"] = True
        updated += 1

    # Save updated books.yml
    with open(BOOKS_YML, "w", encoding="utf-8") as f:
        yaml.dump(books, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"\n완료: {updated}권 업데이트, {skipped}권 스킵")


if __name__ == "__main__":
    main()
