#!/usr/bin/env python3
"""Regenerate the margin-ledger preview lists from the repository collections."""
from __future__ import annotations

import datetime as dt
import hashlib
import html
import json
import re
from pathlib import Path

import yaml

PREVIEW = Path(__file__).resolve().parent
ROOT = PREVIEW.parents[1]
ASSET_VERSION = 19
LOCAL_WIKI = {p.stem for p in (PREVIEW / "wiki").glob("*.html") if p.name != "index.html"}
LOCAL_REVIEWS = {p.stem for p in (PREVIEW / "reviews").glob("*.html") if p.name != "index.html"}
TYPE_LABELS = {
    "book": "book",
    "music": "music",
    "movie": "movie",
    "animation": "animation",
    "other": "other",
    "game": "game",
    "exhibition": "exhibition",
}


def frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    return yaml.safe_load(parts[1]) or {}


def as_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (list, tuple)):
        return ", ".join(str(item) for item in value)
    return str(value)


def iso_date(value) -> str:
    if not value:
        return ""
    if isinstance(value, (dt.datetime, dt.date)):
        return value.isoformat()[:10]
    raw = str(value).strip()
    match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})", raw)
    if not match:
        return ""
    year, month, day = map(int, match.groups())
    return f"{year:04d}-{month:02d}-{day:02d}"


def display_date(value: str) -> str:
    return value[2:] if value else "—"


def datetime_attr(value: str) -> str:
    return f' datetime="{value}"' if value else ""


def tags_of(value) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def rating(value) -> str:
    if value in (None, ""):
        return "unrated"
    try:
        return f"{float(value):.1f}/5.0"
    except (TypeError, ValueError):
        return "unrated"


def esc(value) -> str:
    return html.escape(as_text(value), quote=True)


def attrs_search(*values) -> str:
    return esc(" ".join(as_text(value) for value in values if value not in (None, "")))


def load_wiki() -> list[dict]:
    items = []
    for path in sorted((ROOT / "_wiki").glob("*.md")):
        data = frontmatter(path)
        if data.get("layout") == "wikiindex" or data.get("public") is not True:
            continue
        slug = path.stem
        items.append({
            "kind": "wiki",
            "slug": slug,
            "title": as_text(data.get("title") or slug),
            "summary": as_text(data.get("summary")),
            "tags": tags_of(data.get("tags")),
            "date": iso_date(data.get("updated") or data.get("date")),
            "local": slug in LOCAL_WIKI,
        })
    return sorted(items, key=lambda item: (item["date"], item["title"].casefold()), reverse=True)


def load_reviews() -> list[dict]:
    items = []
    for path in sorted((ROOT / "_reviews").glob("*.md")):
        data = frontmatter(path)
        slug = path.stem
        items.append({
            "kind": "review",
            "slug": slug,
            "title": as_text(data.get("title") or slug),
            "author": as_text(data.get("author")),
            "type": as_text(data.get("type") or "other").lower(),
            "genre": as_text(data.get("genre")),
            "status": as_text(data.get("status")),
            "cover": as_text(data.get("cover_url")),
            "rating": rating(data.get("rating")),
            "date": iso_date(data.get("end_date") or data.get("start_date")),
            "local": slug in LOCAL_REVIEWS,
        })
    return sorted(items, key=lambda item: (item["date"], item["title"].casefold()), reverse=True)


def load_medium() -> list[dict]:
    data = json.loads((ROOT / "_data" / "medium.json").read_text(encoding="utf-8"))
    return [{
        "kind": "post",
        "title": as_text(item.get("title")),
        "summary": as_text(item.get("summary")),
        "date": iso_date(item.get("updated") or item.get("published_at")),
        "url": as_text(item.get("url")),
        "source": as_text(item.get("source") or "Medium").lower(),
    } for item in data]


def doc_head(title: str, prefix: str = "") -> str:
    return (f'<!doctype html><html lang="ko"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="robots" content="noindex,nofollow"><title>{esc(title)} — currenjin</title>'
            f'<link rel="stylesheet" href="{prefix}assets/style.css?v={ASSET_VERSION}">'
            f'<script defer src="{prefix}assets/site.js?v={ASSET_VERSION}"></script></head>')


def nav(prefix: str, current: str = "") -> str:
    def link(href: str, label: str, key: str) -> str:
        current_attr = ' aria-current="page"' if current == key else ""
        return f'<a href="{href}"{current_attr}>{label}</a>'
    return (f'<body><a class="skip" href="#main">본문으로 이동</a><header class="site-head">'
            f'<a class="wordmark" href="{prefix}index.html">currenjin</a>'
            f'<nav class="site-nav" aria-label="아카이브 탐색">'
            f'{link(prefix + "wiki/index.html", "wiki", "wiki")}'
            f'{link(prefix + "reviews/index.html", "reviews", "reviews")}'
            f'{link(prefix + "graph/index.html", "graph", "graph")}'
            f'</nav></header>')


def linked_title(item: dict, href: str, css: str, inner: str) -> str:
    if item.get("local"):
        return f'<a class="{css}" href="{href}">{inner}</a>'
    return f'<span class="{css}">{inner}</span>'


def home_review(item: dict) -> str:
    meta = " · ".join(part for part in [item["author"], item["type"], item["rating"]] if part)
    inner = f'{esc(item["title"])}<small>{esc(meta)}</small>'
    title = linked_title(item, f'reviews/{esc(item["slug"])}.html', 'entry-title', inner)
    cover_id = "cover-" + hashlib.sha1(item["slug"].encode("utf-8")).hexdigest()[:12]
    cover = ""
    toggle = ""
    if item["cover"]:
        toggle = (f'<button class="cover-toggle" type="button" data-cover-toggle '
                  f'aria-expanded="false" aria-controls="{cover_id}">표지 보기 +</button>')
        read_link = f'<a href="reviews/{esc(item["slug"])}.html">기록 읽기</a>' if item["local"] else ""
        cover = (f'<div class="media-body" id="{cover_id}" hidden><img loading="lazy" '
                 f'src="{esc(item["cover"])}" alt="{esc(item["title"])} 표지">'
                 f'<div class="media-copy"><p class="rating">{esc(item["rating"])}</p>{read_link}</div></div>')
    return (f'<article class="entry home-review" data-filter-item data-kind="review" '
            f'data-search="{attrs_search(item["title"], item["author"], item["genre"], item["type"], item["rating"])}" '
            f'data-review-cover data-preview-toggle><div class="entry-summary">'
            f'<time class="date"{datetime_attr(item["date"])}>'
            f'{display_date(item["date"])}</time><span class="kind">review</span>'
            f'<span class="review-line">{title}{toggle}</span></div>{cover}</article>')


def home_wiki(item: dict) -> str:
    small = f'<small>{esc(item["summary"])}</small>' if item["summary"] else ""
    title = linked_title(item, f'wiki/{esc(item["slug"])}.html', 'entry-title', esc(item["title"]) + small)
    return (f'<article class="entry" data-filter-item data-kind="wiki" '
            f'data-search="{attrs_search(item["title"], item["summary"], item["tags"])}">'
            f'<time class="date" datetime="{item["date"]}">{display_date(item["date"])}</time>'
            f'<span class="kind">wiki</span>{title}</article>')


def home_medium(item: dict) -> str:
    return (f'<article class="entry" data-filter-item data-kind="post" '
            f'data-search="{attrs_search(item["title"], item["summary"], item["source"])}">'
            f'<time class="date" datetime="{item["date"]}">{display_date(item["date"])}</time>'
            f'<span class="kind">{esc(item["source"])}</span>'
            f'<a class="entry-title" href="{esc(item["url"])}" rel="noreferrer">{esc(item["title"])}</a></article>')


def build_home(wiki: list[dict], reviews: list[dict], medium: list[dict]) -> str:
    all_items = sorted(wiki + reviews + medium, key=lambda item: (item["date"], item["title"].casefold()), reverse=True)
    rows = []
    for item in all_items:
        rows.append(home_wiki(item) if item["kind"] == "wiki" else home_review(item) if item["kind"] == "review" else home_medium(item))
    return "\n".join([
        doc_head("public archives"), nav(""), '<main id="main" class="home">',
        '<section class="intro" aria-labelledby="intro-title"><p id="intro-title">고쳐 쓰고, 보고 듣고, 바깥에 남긴 공개 기록.</p><p class="note">현재 공개된 각 아카이브의 전체 데이터를 한 장부에서 봅니다.</p></section>',
        '<div class="ledger-head"><span>date</span><span>archive</span><div class="filters" data-filter-group aria-label="기록 필터"><button class="filter" data-filter="all" aria-pressed="true">all</button><button class="filter" data-filter="wiki" aria-pressed="false">wiki</button><button class="filter" data-filter="review" aria-pressed="false">review</button><button class="filter" data-filter="post" aria-pressed="false">post</button></div></div>',
        f'<p class="result-count ledger-count" data-result-count aria-live="polite"></p><section class="ledger" aria-label="공개 기록 전체 {len(all_items)}개">',
        *rows, '<p class="empty" data-empty>일치하는 기록이 없습니다.</p></section></main></body></html>'
    ])


def build_wiki(wiki: list[dict]) -> str:
    rows = []
    for item in wiki:
        title_inner = esc(item["title"]) + (f'<small>{esc(item["summary"])}</small>' if item["summary"] else "")
        title = linked_title(item, f'{esc(item["slug"])}.html', 'catalog-title', title_inner)
        tags = " · ".join(esc(tag) for tag in item["tags"])
        rows.append(f'<article class="catalog-row" id="{esc(item["slug"])}" data-filter-item '
                    f'data-kind="{esc(" ".join(item["tags"]))}" data-search="{attrs_search(item["title"], item["summary"], item["tags"])}">'
                    f'<time class="date" datetime="{item["date"]}">{display_date(item["date"])}</time>{title}'
                    f'<div class="tags">{tags}</div></article>')
    filters = ["architecture", "devops", "engineering", "database", "ai"]
    buttons = ''.join(f'<button class="filter" data-filter="{tag}" aria-pressed="false">{tag}</button>' for tag in filters)
    return "\n".join([
        doc_head("wiki", "../"), nav("../", "wiki"), '<main id="main">',
        f'<header class="page-intro"><p class="eyebrow">wiki / {len(wiki)} documents</p><h1>고쳐 쓰는 문서들</h1><p class="summary">기술과 소프트웨어 설계에 관해 연결하며 축적한 공개 위키 전체. 최근 수정 순서로 놓고, 태그는 문서 사이의 관계를 드러냅니다.</p></header>',
        f'<section aria-label="위키 찾기"><div class="tools"><div class="search-field"><label for="wiki-search">문서 검색 · ⌘K</label><input id="wiki-search" type="search" data-search placeholder="제목, 요약, 태그" autocomplete="off"></div><span class="result-count" data-result-count aria-live="polite"></span></div><div class="filters" data-filter-group aria-label="태그 필터"><button class="filter" data-filter="all" aria-pressed="true">all</button>{buttons}</div></section>',
        '<section class="catalog" aria-label="위키 문서" style="margin-top:46px">', *rows,
        '<p class="empty" data-empty>일치하는 문서가 없습니다.</p></section></main></body></html>'
    ])


def build_reviews(reviews: list[dict]) -> str:
    rows = []
    for item in reviews:
        meta = " · ".join(part for part in [item["author"], item["genre"], item["rating"]] if part)
        common = (f'id="{esc(item["slug"])}" data-filter-item data-kind="{esc(item["type"])}" '
                  f'data-search="{attrs_search(item["title"], item["author"], item["genre"], item["type"], item["rating"], item["status"])}"')
        date = f'<time class="date"{datetime_attr(item["date"])}>{display_date(item["date"])}</time>'
        kind = f'<span class="kind">{esc(TYPE_LABELS.get(item["type"], item["type"]))}</span>'
        title = f'<span class="entry-title">{esc(item["title"])}<small>{esc(meta)}</small></span>'
        if item["cover"]:
            read_link = f'<a href="{esc(item["slug"])}.html">기록 읽기</a>' if item["local"] else ""
            cover = (f'<div class="media-body"><img loading="lazy" src="{esc(item["cover"])}" alt="{esc(item["title"])} 표지">'
                     f'<div class="media-copy"><p class="rating">{esc(item["rating"])}</p>{read_link}</div></div>')
            rows.append(f'<details class="entry" {common} data-review-cover open><summary>{date}{kind}{title}</summary>{cover}</details>')
        else:
            rows.append(f'<article class="entry" {common}>{date}{kind}{title}</article>')
    kinds = [kind for kind in TYPE_LABELS if any(item["type"] == kind for item in reviews)]
    buttons = ''.join(f'<button class="filter" data-filter="{kind}" aria-pressed="false">{TYPE_LABELS[kind]}</button>' for kind in kinds)
    return "\n".join([
        doc_head("reviews", "../"), nav("../", "reviews"), '<main id="main">',
        f'<header class="page-intro"><p class="eyebrow">reviews / {len(reviews)} records</p><h1>보고 들은 것들</h1><p class="summary">책, 음악, 영화와 그 밖의 경험에 남긴 전체 기록. 표지는 기본으로 열어 두고 날짜 없는 기록도 빠뜨리지 않습니다.</p></header>',
        f'<section aria-label="리뷰 찾기"><div class="tools"><div class="search-field"><label for="review-search">리뷰 검색 · ⌘K</label><input id="review-search" type="search" data-search placeholder="제목, 저자, 장르" autocomplete="off"></div><span class="result-count" data-result-count aria-live="polite"></span><button class="text-button" type="button" data-disclosure-control aria-pressed="true">표지 모두 접기</button></div><div class="filters" data-filter-group aria-label="매체 필터"><button class="filter" data-filter="all" aria-pressed="true">all</button>{buttons}</div></section>',
        '<section class="ledger" aria-label="리뷰 목록" style="margin-top:46px">', *rows,
        '<p class="empty" data-empty>일치하는 리뷰가 없습니다.</p></section></main></body></html>'
    ])


def strip_auxiliary_ui() -> None:
    for path in PREVIEW.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        text = re.sub(r'<footer class="end">.*?</footer>', '', text, flags=re.S)
        text = re.sub(r'<aside class="margin-note">.*?</aside>', '', text, flags=re.S)
        text = re.sub(r'<p class="side-note">.*?</p>', '', text, flags=re.S)
        text = re.sub(r'(assets/(?:style\.css|site\.js))(?:\?v=\d+)?', rf'\1?v={ASSET_VERSION}', text)
        path.write_text(text, encoding="utf-8")


def main() -> None:
    wiki = load_wiki()
    reviews = load_reviews()
    medium = load_medium()
    (PREVIEW / "index.html").write_text(build_home(wiki, reviews, medium), encoding="utf-8")
    (PREVIEW / "wiki" / "index.html").write_text(build_wiki(wiki), encoding="utf-8")
    (PREVIEW / "reviews" / "index.html").write_text(build_reviews(reviews), encoding="utf-8")
    strip_auxiliary_ui()
    print(f"home={len(wiki) + len(reviews) + len(medium)} wiki={len(wiki)} reviews={len(reviews)} posts={len(medium)}")


if __name__ == "__main__":
    main()
