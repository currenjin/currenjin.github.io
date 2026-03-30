#!/usr/bin/env python3
"""Fetch book cover URLs from Aladin and update books.yml.

Searches by title + author last name for better accuracy.
"""

import re
import time
import urllib.parse

import requests
import yaml
from bs4 import BeautifulSoup

BOOKS_YML = "_data/books.yml"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9",
}
SEARCH_URL = "https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord={}"
PLACEHOLDER = "aladin.co.kr/img/"


def author_last(author: str) -> str:
    """저자 성 추출."""
    name = author.split(",")[0].strip()
    parts = name.split()
    if not parts:
        return ""
    # 영어 이름: 성이 보통 마지막
    if re.search(r"[a-zA-Z]", name):
        return parts[-1]
    # 한국/일본/중국: 첫 글자(들)
    return parts[0]


def find_cover_in_html(html: str) -> str | None:
    soup = BeautifulSoup(html, "html.parser")
    for img in soup.select("img[src*='image.aladin.co.kr']"):
        src = img.get("src", "")
        if PLACEHOLDER in src:
            continue
        if "cover" in src:
            return re.sub(r"cover\d+", "cover500", src)
    return None


def fetch_cover_url(title: str, author: str) -> str | None:
    # 1차: 제목 + 저자 성으로 검색
    last = author_last(author)
    for query in [f"{title} {last}".strip(), title]:
        encoded = urllib.parse.quote(query)
        url = SEARCH_URL.format(encoded)
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            resp.raise_for_status()
        except Exception as e:
            print(f"  [ERROR] {e}")
            continue

        cover = find_cover_in_html(resp.text)
        if cover:
            return cover
        time.sleep(0.2)

    return None


def main():
    with open(BOOKS_YML, encoding="utf-8") as f:
        books = yaml.safe_load(f)

    updated = 0
    failed = []

    for book in books:
        title = book.get("title", "")
        author = book.get("author", "")

        print(f"검색 중: {title}")
        cover_url = fetch_cover_url(title, author)

        if cover_url:
            book["cover_url"] = cover_url
            print(f"  ✓ {cover_url}")
            updated += 1
        else:
            book.pop("cover_url", None)
            print(f"  ✗ 못 찾음")
            failed.append(title)

        time.sleep(0.3)

    with open(BOOKS_YML, "w", encoding="utf-8") as f:
        yaml.dump(books, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"\n완료: {updated}권 업데이트")
    if failed:
        print(f"실패 ({len(failed)}권): {', '.join(failed)}")


if __name__ == "__main__":
    main()
