#!/usr/bin/env python3
"""Fetch book cover URLs from Aladin and update books.yml."""

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


def fetch_cover_url(title: str, author: str) -> str | None:
    query = urllib.parse.quote(title)
    url = SEARCH_URL.format(query)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"  [ERROR] 요청 실패: {e}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # 검색 결과의 첫 번째 책 표지 이미지 찾기
    # 알라딘 검색 결과: .ss_book_list li 내부 img
    for img in soup.select(".ss_book_list img, .ss_list img, img[src*='image.aladin.co.kr']"):
        src = img.get("src", "")
        if "image.aladin.co.kr" in src and "cover" in src:
            # cover200 → cover500 으로 교체해 고해상도 사용
            src = src.replace("cover200", "cover500").replace("cover150", "cover500")
            return src

    return None


def main():
    with open(BOOKS_YML, encoding="utf-8") as f:
        books = yaml.safe_load(f)

    updated = 0
    skipped = 0

    for book in books:
        title = book.get("title", "")
        author = book.get("author", "")

        # 이미 cover_url 있으면 스킵
        if book.get("cover_url"):
            skipped += 1
            continue

        print(f"검색 중: {title}")
        cover_url = fetch_cover_url(title, author)

        if cover_url:
            book["cover_url"] = cover_url
            print(f"  ✓ {cover_url}")
            updated += 1
        else:
            print(f"  ✗ 못 찾음")

        time.sleep(0.5)  # 서버 부하 방지

    with open(BOOKS_YML, "w", encoding="utf-8") as f:
        yaml.dump(books, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print(f"\n완료: {updated}권 업데이트, {skipped}권 스킵")


if __name__ == "__main__":
    main()
