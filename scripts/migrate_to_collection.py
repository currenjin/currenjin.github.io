#!/usr/bin/env python3
"""Migrate books from _data/books.yml to individual _books/*.md files."""

import os
import re
import yaml

BOOKS_YML = "_data/books.yml"
BOOKS_DIR = "_books"


def read_existing_content(path):
    """Read existing .md file and return (frontmatter_dict, body)."""
    with open(path, encoding="utf-8") as f:
        text = f.read()

    # Split frontmatter
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                fm = yaml.safe_load(parts[1]) or {}
            except Exception:
                fm = {}
            body = parts[2].strip()
            return fm, body
    return {}, text.strip()


def build_frontmatter(book):
    lines = ["---"]
    lines.append(f'layout   : book')
    lines.append(f'title    : "{book["title"]}"')
    lines.append(f'author   : "{book.get("author", "")}"')
    lines.append(f'type     : "{book.get("type", "")}"')
    lines.append(f'status   : {book.get("status", "want")}')
    if book.get("end_date"):
        lines.append(f'end_date : "{book["end_date"]}"')
    if book.get("cover_url"):
        lines.append(f'cover_url: "{book["cover_url"]}"')
    lines.append("---")
    return "\n".join(lines)


def main():
    with open(BOOKS_YML, encoding="utf-8") as f:
        books = yaml.safe_load(f)

    created = 0
    updated = 0

    for book in books:
        slug = book.get("slug", "")
        if not slug:
            print(f"[SKIP] slug 없음: {book.get('title', '?')}")
            continue

        path = os.path.join(BOOKS_DIR, f"{slug}.md")
        frontmatter = build_frontmatter(book)

        if os.path.exists(path):
            _, body = read_existing_content(path)
            content = f"{frontmatter}\n\n{body}\n" if body else f"{frontmatter}\n"
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[UPDATE] {book['title']}")
            updated += 1
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(f"{frontmatter}\n")
            print(f"[CREATE] {book['title']}")
            created += 1

    print(f"\n완료: {created}개 생성, {updated}개 업데이트")


if __name__ == "__main__":
    main()
