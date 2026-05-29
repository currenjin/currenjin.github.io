# AGENTS.md

개인 Jekyll 블로그. 핵심 산출물은 **공개 위키(`_wiki/`)**, 독서 로그(`_books/`),
태그 기반 지식 그래프. 이 문서는 위키·책·전역 UI를 추가/수정하는 에이전트가
일관된 규칙으로 작업하기 위한 in-repo 스키마다.

## 위키 (`_wiki/*.md`)

### 프론트매터 (75개 파일 기준)

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

### `[[backlink]]` 문법 — `_includes/createLink.html` 기준

```
[[doc]]              → <a href="/wiki/doc">doc</a>
[[doc]]{표시명}       → <a href="/wiki/doc">표시명</a>
[[/dir/doc]]         → 중첩 경로
\[[escape]]          → 링크 안 만들고 그대로 표시
```

### 태그 taxonomy (상위 25, 실사용 빈도순)

```
java · devops · engineering · design · tdd · programming · test · productivity
spring · architecture · observability · database · aws · pattern · network
container · ai · sre · javascript · ai-agent · jvm · jpa · sql · refactoring · kubernetes
```

새 태그를 만들기 전에 위 어휘로 분류 가능한지 먼저 검토한다. taxonomy 비대화는
그래프·검색의 신호 대비 잡음을 떨어뜨린다.

### 톤 (한국어 공개 레퍼런스)

- **객관 레퍼런스 톤.** "내 시험 대비", "재학 중 정리한", "X과목 내가 듣는" 같은
  본인 시점·계획 표현 금지. 위키는 누가 읽어도 동일한 사실 정리여야 한다.
- 이모지·과장 형용사 금지. "결론은~", "핵심은~" 같은 마무리 공식 금지.
- 기계적 `1·2·3` 나열을 남발하지 않는다. 흐름 있는 글은 문장으로 잇는다.
- 어미를 다양화한다 — `~합니다/~한다`만 반복하지 않도록.

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

## 책 (`_books/*.md`)

```yaml
---
layout   : book
title    : "..."
author   : "..."                                # 번역서는 원저자 한글 표기 우선
type     : "소프트웨어"                          # 또는 "인문" 등
status   : reading | want | finished
cover_url: "https://image.aladin.co.kr/product/.../cover500/...jpg"
rating   : 4                                    # finished 일 때만 (5점 척도)
tags     : [database, architecture]             # 선택
---
```

- `cover_url`은 알라딘의 `cover500` 패턴을 사용. **무료특별판이 아니라 정식
  종이책 ItemId의 표지**를 쓴다 (무료판은 별도 ItemId/표지를 가진다).
- 파일명은 한국어 제목을 그대로 사용하되 공백은 `-` 로 치환
  (예: `시스템-성능-엔지니어링.md`).

## 그래프 도크 / 전역 UI

- 전역 도크: `_includes/global-ui.html` → `_includes/graph-dock.html`.
  default / home / searchList 레이아웃에서 자동 노출. `/graph/` 페이지에서는
  중복 방지를 위해 미노출.
- 단축키: `Cmd/Ctrl + G`로 도크 토글, `Cmd/Ctrl + K`는 명령 팔레트.
- 새 전역 UI(토스트, 단축키 헬프 등)는 **`_includes/global-ui.html`에만 추가**한다.
  세 레이아웃에 따로따로 넣지 않는다.
- 그래프 코어 토큰은 `_layouts/graph.html` `:root`의 `--g-*`, 도크 chrome 토큰은
  `_includes/graph-dock.html` `:root`의 `--gd-*`. 색·간격은 토큰을 사용한다.
- 모바일 브레이크포인트는 `720px` (도크 폭 `100vw` 전환 기준).

## 빌드 / 검증

- 로컬 호스트 Jekyll은 의존성이 깨져 있다. **도커로 빌드**:
  `docker run --rm -v "$PWD:/srv/jekyll" jekyll/jekyll:4 jekyll build`.
- 출력은 `_site/`. Python 정적 서버로 확인:
  `cd _site && python3 -m http.server 4000 --bind 127.0.0.1`.
- `graph-data.json` / `search-index.json` 은 Jekyll 빌드 시 자동 생성된다
  (위키·책 컬렉션을 순회) — 수동으로 손대지 않는다.

## 작업 위생

- 다단계 Bash 권한 프롬프트를 줄이도록 **단일 스크립트로 묶고**, 파일은 가능한 한
  Read/Edit/Write 도구로 처리한다.
- 한 번에 작은 commit, conventional commit prefix (`feat`/`fix`/`docs`/`refactor`/`style`/`chore`).
  공동 저자는 사용자가 명시할 때만 추가한다.
- 워크트리에서 작업 후 `git merge --ff-only` 로 main에 반영하고 origin에 push한다.
