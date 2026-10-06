# AGENTS.md

개인 공개 아카이브. Jekyll로 **Post(`_articles/`, `_chapters/`)**, **Wiki(`_wiki/`)**,
**Review(`_reviews/`)**, 태그 기반 지식 그래프를 출판한다.
이 문서는 도구와 무관한 공통 작업 규칙의 정본이다. 에이전트 지침은 `AGENTS.md`만 유지하며 별도 `CLAUDE.md`는 만들지 않는다.

## 기본 원칙

- 작업 전 `git status --short`, 현재 브랜치 및 원격 상태를 확인한다. 깨끗한 `main`은 `git pull --ff-only`로 갱신한다.
- 사용자 요청 범위만 수정하고 다른 작업자의 변경을 덮어쓰지 않는다.
- Post는 저자의 글·책, Wiki는 지식 레퍼런스, Review는 작품 감상이다. 임의로 분류·그룹·페이지를 만들지 않는다.
- 사용자 원문·인용·감상은 표현과 문장부호를 보존한다. 감상, 평점, 완료일을 추측해서 추가하지 않는다.
- AI 표식이나 공동 저자 표기를 자동으로 추가하지 않는다. 기존 메타데이터는 별도 요청 없이 삭제하지 않는다.
- 콘텐츠 유지보수의 실행·게시 요청은 검증 후 커밋·푸시까지 수행한다. 디자인 실험은 최종 승인 전 커밋·푸시하지 않는다.
- 개인 경로·인증정보·비공개 초안·로컬 실험물을 공개 산출물에 넣지 않는다.

## 글쓰기

- 본문 작성·수정 전 `docs/writing-convention.md`를 읽는다. 글쓰기 세부 기준은 그 문서에서만 관리한다.
- 문서의 장르와 사용자 원문을 먼저 확인한다. 위키·개인 글·리뷰에 같은 말투를 강제하지 않는다.
- 사용자가 승인한 해당 장르의 문체 예시를 참고한다. 승인 대기 예시나 AI 생성 글을 사용자 고유 문체의 근거로 삼지 않는다.
- 내용 검토와 문체 검토를 구분한다. 윤문하면서 사실, 조건, 기술 용어, 출처, 코드, 그림, 목차와 링크를 훼손하지 않는다.

## Post (`_articles/`, `_chapters/`)

- 독립 글은 `_articles/<slug>.md` → `/posts/<slug>/`.
- 책 목차는 `_data/post_books.yml`, 장 본문은 `_chapters/<book-id>/<chapter-id>.md`에서 관리한다.
- 스키마, 예정 목차, 출처 보존, 출판 절차는 `docs/post-authoring.md`를 먼저 읽는다.
- 새 초안은 `public: false`. 공개 승인을 받은 문서만 YAML 불리언 `public: true`로 전환한다.
- `date`·`updated`가 유효하고 미래가 아니며 `updated >= date`여야 한다. `draft: true`와 `published: false`는 공개를 막는다.
- 책·장 공개에는 책의 공개 상태, 목차의 `state: published`, 장의 공개 상태가 모두 필요하다. 예정 목차는 승인된 제목만 공개하고 본문 링크를 만들지 않는다.
- 공개 후 slug와 책·장 id를 임의 변경하지 않는다.
- Home의 전체 목록에서는 책 목차가 접히고 Post 필터에서는 펼쳐진다. `/posts/`의 목차는 항상 보인다.
- 출판 경계는 `_plugins/archive.rb`가 강제한다. `--safe` 또는 기본 제한 플러그인 빌드로 우회하지 않는다.
- 자동 수집 데이터로 승인된 정본을 덮어쓰지 않는다.
- Post 이미지는 저장소의 `resource/`, `resources/` 등에 새로 저장하지 않고 GitHub Issue에 실제 첨부 업로드한 `https://github.com/user-attachments/assets/...` URL을 사용한다. raw GitHub URL이나 업로드하지 않은 링크로 대체하지 않는다.
- 기존 Post 이미지 이관은 원본 바이트를 보존하고 첨부 URL의 HTTP 응답·SHA-256 일치·브라우저 렌더링을 확인한 뒤 참조만 바꾼다. 저장소 전체의 참조를 점검하여 다른 콘텐츠·공용 자산에서 쓰지 않는 원본만 삭제한다. 업로드 인증이 막히면 기존 참조와 파일을 유지하고 차단 사유를 보고한다. Wiki·Review·공용 자산은 이 Post 규칙의 이관 범위가 아니다.

## 위키 (`_wiki/*.md`)

### 프론트매터

| 키        | 필수 | 설명 |
|-----------|:----:|------|
| `layout`  | ✓ | 항상 `wiki` |
| `title`   | ✓ | 문서 제목 |
| `date`    | ✓ | 최초 작성일. **과거 시각만 허용** — 미래 날짜면 페이지가 빈칸으로 렌더된다 |
| `updated` | ✓ | 최종 수정일. `date` 이상 |
| `tags`    | ✓ | 아래 taxonomy의 고정 어휘에서 선택 |
| `parent`  | ✓ | 상위 문서. 보통 `[[index]]`. 패널의 "상위 문서" 표시·그래프에 사용 |
| `summary` | ✓ | 한 줄 요약. 검색·그래프 툴팁·index 카탈로그에 노출 |
| `public`  | ✓ | `false`면 그래프·검색·목록 전부에서 제외 |
| `toc`     | ✓ | `true`면 목차 렌더 |
| `latex`   | ✓ | `true`면 MathJax 로드 |

기존 `ai`, `tags`, `parent`, `public`, `toc`, `latex` 등 메타데이터를 보존한다. 새 AI 출처 표식은 사용자가 요청한 경우에만 추가한다.

### `[[backlink]]` 문법 — `_includes/createLink.html` 기준

```
[[doc]]              → <a href="/wiki/doc">doc</a>
[[doc]]{표시명}       → <a href="/wiki/doc">표시명</a>
[[/dir/doc]]         → 중첩 경로
\[[escape]]          → 링크 안 만들고 그대로 표시
```

### 기존 태그 어휘 예시

```
java · devops · engineering · design · tdd · programming · test · productivity
spring · architecture · observability · database · aws · pattern · network
container · ai · sre · javascript · ai-agent · jvm · jpa · sql · refactoring · kubernetes
```

새 태그를 만들기 전에 위 어휘로 분류 가능한지 먼저 검토한다. taxonomy 비대화는
그래프·검색의 신호 대비 잡음을 떨어뜨린다.

### 톤 (한국어 공개 레퍼런스)

위키의 사실 설명은 객관적인 레퍼런스 문체로 쓴다. 구체적인 문장·형식·장르별 기준과 편집 절차는 `docs/writing-convention.md`를 따른다. 개인 글과 회고에는 이 객관 문체를 강제하지 않는다.

### 인라인 HTML 안전

본문에 라이브 HTML 태그(`<style>`, `<script>` 등)를 그대로 두면 페이지 레이아웃을
깬다. **반드시 fenced code block 또는 백틱으로 escape**한다. blockquote 안에
넣어도 안전하지 않다.

```
<style>...</style>     ← bad: 실제 스타일이 적용됨
`<style>...</style>`   ← good: 텍스트로 표시
```

### 새 위키 추가 워크플로우

1. `_wiki/<slug>.md` 생성 — 위 프론트매터 채움 (`date`/`updated` 모두 과거 시각)
2. `_wiki/index.md`에 `* [[slug]]` 한 줄 추가
3. `parent`는 `[[index]]` 또는 더 적합한 상위 문서로 설정
4. 관련 기존 글에 `[[slug]]` 역참조 1~2개 심기 — 그래프·역링크에 도움
5. `_data/updates.json` 최상단에 항목 추가
   (`title / url / updated / summary / tags / source: "Wiki" / external: false`)

## 리뷰 (`_reviews/*.md`)

```yaml
---
layout   : review
title    : "..."
author   : "..."                                # 책은 원저자 한글 표기 우선
type     : book | music | movie | tv | animation | webtoon | game | exhibition | other
genre    : "소프트웨어"                         # 작품 유형 안의 분야·장르
status   : reading | want | finished
cover_url: "https://..."                        # 작품 표지·포스터·대표 이미지
rating   : 4.0                                   # 완료한 작품일 때만 (5점 척도, 소수점 한 자리)
tags     : [database, architecture]             # 선택
---
```

- 평점은 숫자 값으로 저장하고 소수점 한 자리로 통일한다(`4.0`, `4.5`). `4`와 `4.0`은 같은 점수이며 표기 변경으로 평가를 바꾸지 않는다.
- 공용 목록 카드(`_includes/review-card.html`)와 상세(`_layouts/review.html`) 모두 소수점 한 자리로 출력한다. 목록은 `4.0`, 상세는 `4.0/5.0` 형식이다.
- 평점·완료일(`end_date`)은 제공된 경우에만 추가한다. 감상 본문은 사용자가 준 원문을 보존한다.
- 표지는 외부 직접 이미지 URL로만 기록한다. 핫링크 차단을 피하려고 저장소에 이미지를 복사하지 않는다.
- 상태·매체·장르는 서로 다른 분류다. `/books/`에는 새 정본이나 탐색 링크를 추가하지 않는다.
- `type`은 작품 매체 유형이다. 현재 이관된 기존 독서 로그는 모두 `book`으로 둔다.
- `genre`는 기존 독서 로그의 `소프트웨어`·`인문` 같은 분야 값을 보존하며, 리뷰 화면에서 별도 필터로 쓴다.
- 책의 `cover_url`은 알라딘 `cover500` 패턴을 사용한다. 다른 유형도 `cover_url`을 사용하며, 앨범은 공식 앨범 아트워크, 콘서트·리스닝 파티는 해당 투어/이벤트의 공식 포스터, 영화는 공식 극장 포스터, 애니메이션은 공식 키비주얼 또는 포스터를 우선한다.
- 이미지는 아티스트·배급사·주최사·공식 프레스 자료·검증된 플랫폼 아트워크처럼 직접 열리는 안정적 URL만 기록한다. 작품과 무관한 인물 사진·스틸컷·임의 이미지는 넣지 않으며, 정확한 이미지를 검증할 수 없거나 핫링크가 막히면 `cover_url`을 비워 둔다.
- 파일명은 한국어 제목을 그대로 사용하되 공백은 `-` 로 치환
  (예: `시스템-성능-엔지니어링.md`).
- 공개 진입점은 `/reviews/`다. `/books/`는 기존 링크를 위한 호환 리디렉션으로만 유지한다.

## 전역 UI / 그래프

- 전역 검색: `js/ledger.js`가 `role="dialog"` 검색 모달을 만들고, `_includes/site-header.html`의
  `search` 버튼과 `Cmd/Ctrl + K`로 연다. 포커스 순환은 `js/focus-trap.js`가 맡는다.
  `main.css`와 `head.html`을 쓰는 default / home / searchList 계열 레이아웃에만 있다.
- `/graph/`(`_layouts/graph.html`)는 자체 `<head>`를 쓰므로 전역 검색이 없다. 대신 그래프
  아래 `기록 목록으로 찾기` 목록(`#graph-index`)이 같은 그래프 데이터로 노드를 검색·선택하는
  키보드 대안이다. 선택 패널(`#node-info`)에는 연결된 기록 버튼이 있다.
- 과거의 전역 그래프 도크와 `Cmd/Ctrl + G` 단축키는 현재 노출되지 않는다.
  `_includes/global-ui.html`은 도크를 포함하지 않으며 미사용 도크 include는 제거했다.
  `js/command-palette.js`는 로드하지 않지만 기존 공개 URL 호환성을 위해 유지한다.
  저장소 구성과 정리 예외는 `docs/repository-layout.md`를 참고한다.
- 새 전역 UI(토스트, 단축키 헬프 등)는 **`_includes/global-ui.html`에만 추가**한다.
  세 레이아웃에 따로따로 넣지 않는다.
- 그래프 코어 토큰은 `_layouts/graph.html` `:root`의 `--g-*`이며 `css/main.css` 팔레트와
  1:1로 맞춘다. 색·간격은 토큰을 사용한다.
- 브레이크포인트: 공용 헤더·페이지 여백은 `760px`(와 `420px`)로, `/graph/` 헤더도 같은 값을
  따른다. 그래프 내부 오버레이(설정 패널 기본 접힘, 선택 패널·확대 버튼 배치)는 `720px` 기준이다.

## 빌드 / 검증

- 배포는 `.github/workflows/pages.yml`의 일반 Jekyll 빌드·검증·Pages 배포를 사용한다.
- 삭제·비공개 전환 검증은 깨끗한 destination에서 빌드한다. 예전 공개 파일이 남아 있으면 실패다.

- 로컬 호스트 Jekyll은 의존성이 깨져 있다. **도커로 빌드**:
  `docker run --rm -v "$PWD:/srv/jekyll" jekyll/jekyll:4 jekyll build`.
- 출력은 `_site/`. Python 정적 서버로 확인:
  `cd _site && python3 -m http.server 4000 --bind 127.0.0.1`.
- `graph-data.json` / `search-index.json` 은 Jekyll 빌드 시 자동 생성된다
  (위키·리뷰 컬렉션을 순회) — 수동으로 손대지 않는다.

### 변경 범위별 확인

```sh
# 공개 원문·출판·탐색 무결성 (Pages CI와 동일한 검증)
python3 tests/verify_archive.py _site
ruby tests/archive_test.rb

# JS·테마·상호작용 변경
npm test

# SEO 변경
python3 tests/verify_seo.py _site
```

- Post의 공개/비공개·삭제 동작을 바꿀 때는 `python3 tests/archive_lifecycle.py`도 실행한다.
- 리뷰는 대상 목록 카드와 상세 페이지에서 정확한 평점·본문·날짜를 각각 확인한다. 빌드 성공만으로 완료 처리하지 않는다.
- UI 변경은 실제 데스크톱·모바일 폭, 키보드 조작, 테마, overflow를 확인한다. 기존 사용자 테마 선택을 보존한다.
- 문서·에이전트 지침은 `_config.yml`의 `exclude`에 넣고 공개 `_site`에 복사되지 않는지 확인한다.

## 작업 위생

- 다단계 Bash 권한 프롬프트를 줄이도록 **단일 스크립트로 묶고**, 파일은 가능한 한
  Read/Edit/Write 도구로 처리한다.
- 한 번에 작은 commit, conventional commit prefix (`feat`/`fix`/`docs`/`refactor`/`style`/`chore`).
  공동 저자는 사용자가 명시할 때만 추가한다.
- 워크트리에서 작업 후 `git merge --ff-only` 로 main에 반영하고 origin에 push한다.

- 빌드 전후 diff를 비교하고 의도치 않은 `Gemfile.lock`, `.bundle/`, `vendor/` 등 빌드 부산물을 커밋하지 않는다.
- 요청 파일만 명시적으로 stage하고 `git diff --cached --check`를 실행한다.
- 푸시 뒤 로컬 HEAD와 원격 `main` SHA가 일치하는지 확인한다. 실제 배포 완료를 말할 때는 Pages 성공·공개 페이지도 확인한다.
- 완료 보고에는 변경 내용과 검증 결과를 간결하게 전달한다. 로컬 빌드·푸시와 실제 공개 배포를 구분한다.
