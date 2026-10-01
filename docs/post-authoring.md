# Post 저작·출판 안내

Post는 저자가 쓴 책과 독립 글을 위한 공간이다. 작품 감상은 Review, 지식 레퍼런스는 Wiki에 그대로 둔다. 현재 공개 콘텐츠는 승인된 기존 독립 글 5편이며 `_data/post_books.yml`은 빈 목록이다. 아래 예시는 문서에만 있으며 공개 책을 생성하지 않는다.

## 독립 글

`_articles/<slug>.md`에 다음 프론트매터와 Markdown 본문을 작성한다.

```yaml
---
layout: post
title: 글 제목
date: 2026-09-30 09:00:00 +0900
updated: 2026-09-30 09:00:00 +0900
public: false
---
```

초안은 `public: false`로 유지한다. 검토 후 `public: true`로 바꾼다. `public`은 YAML 불리언이어야 한다(문자열 `"true"`는 공개되지 않는다). `published: false` 또는 `draft: true`도 공개를 막는다. `date`와 `updated`가 빌드 시각보다 미래이거나 `updated < date`이면 출력·Home·Post·검색에서 모두 제외한다. 날짜가 없거나 잘못되어도 공개되지 않는다. 원문 이관 글은 `source_name`, `source_url`, `source_date`로 출처와 원래 날짜를 보존한다.

## 책과 장

1. `_data/post_books.yml`에 책을 추가한다. `id`는 영문 소문자·숫자·하이픈만 사용하고 중복 없이 고정한다. `title`과 `intro`를 작성한다.
2. `chapters`의 순서가 공개 목차 및 이전/다음 장 순서다. 장의 `id` 역시 책 안에서 중복되면 안 된다.
3. `_chapters/<book-id>/<chapter-id>.md`에 본문을 작성한다. 프론트매터는 독립 글과 같고 `book`과 `chapter_id`를 추가한다.

```yaml
# _data/post_books.yml (실제 데이터에는 승인 후 추가)
- id: my-authored-book
  title: 직접 쓴 책 제목
  intro: 이 책이 다루는 질문
  public: false
  chapters:
    - id: opening
      state: published
    - id: next-question
      title: 다음 질문
      state: planned
```

```yaml
# _chapters/my-authored-book/opening.md
---
layout: post
title: 첫 번째 질문
book: my-authored-book
chapter_id: opening
date: 2026-09-30 09:00:00 +0900
updated: 2026-09-30 09:00:00 +0900
public: false
---
```

책의 `public: true`, 목차 항목의 `state: published`, 장 문서의 `public: true` 및 날짜 검증을 모두 통과해야 공개된다. 책에 공개 장이 하나도 없으면 책 자체가 보이지 않는다. 책에 등록되지 않은 장도 출력되지 않는다. `state: planned`는 실제 링크 없이 제목과 ‘집필 예정’만 표시하며, 해당 제목도 공개 동의된 내용이어야 한다. 비공개 초안 제목을 예정 목차에 적지 않는다. 공개 책을 비공개로 바꾸면 소속 장도 모두 사라진다.

Home의 all에서는 목차가 접히고 post 필터에서는 펼쳐진다. 목차 버튼으로 별도 열고 닫을 수 있다. `/posts/`에서는 목차가 항상 보인다. 장 상세에는 전체 책 목차와 공개 장만을 잇는 이전/다음 링크가 있으며 전역 검색에서도 찾을 수 있다.

독립 글 `_articles/<slug>.md`의 주소는 `/posts/<slug>/`, 장 `_chapters/<book-id>/<chapter-id>.md`는 `/posts/chapters/<book-id>/<chapter-id>/`, 책 목차는 `/posts/#<book-id>`다. 공개한 뒤에는 파일명과 책·장 id를 바꾸지 않는다. 예정 장에 본문을 공개할 때는 해당 Markdown을 작성하고 날짜·`public: true`를 확인한 뒤, 책 메타데이터의 같은 id 항목을 `state: published`로 바꾼다. 예정 항목의 `title`은 삭제해도 되며 공개 장 제목은 Markdown의 `title`을 사용한다.

## 빌드·배포 주의

출판 경계는 `_plugins/archive.rb`가 빌드 전에 강제한다. **`--safe` 빌드나 기본 GitHub Pages 제한 플러그인 빌드를 사용하면 안 된다.** `.github/workflows/pages.yml`이 일반 Jekyll 빌드와 원문·출판 검증 후 생성 결과를 GitHub Pages에 배포한다. 비공개 전환·삭제 시 기존 파일이 남지 않도록 매번 깨끗한 destination에 빌드하고 생성 결과 전체를 교체한다. `--future`/`--unpublished` 옵션을 줘도 본 플러그인의 출판 경계는 유지된다.

```sh
docker run --rm -v "$PWD:/srv/jekyll" jekyll/jekyll:4 jekyll build
ruby tests/archive_test.rb
python3 tests/verify_archive.py /path/to/generated/site
python3 tests/archive_lifecycle.py
```

`docs/`, `tests/`, `scripts/`, `tool/`, `.ouroboros/`, `vendor/`는 공개 출력에서 제외된다. 자동 Medium 수집 데이터는 더 이상 Post의 공개 원본이 아니며, 새 외부 글은 별도 승인 후 이관한다. 원문 이관 시 RSS의 본문 HTML과 전체 텍스트를 대조하고 문단·강조·코드 구조를 보존한다. 기존 정본은 자동 수집으로 덮어쓰지 않는다.
