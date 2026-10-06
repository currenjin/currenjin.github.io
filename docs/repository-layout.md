# 저장소 구성

## 도메인과 정본

```text
_post/                         Post 단일 Jekyll collection (post)
  <slug>.md                    독립 글
  books/<book-id>/<chapter-id>.md  직접 쓴 책의 장
_wiki/                         지식 레퍼런스
_reviews/                      작품 감상
_data/post_books.yml           승인된 책 목차·순서·예정 장
_plugins/                      출판 경계와 SEO
_layouts/, _includes/          렌더링과 공통 UI
_sass/                         Jekyll 스타일 소스
js/, css/, resource/, data/    기존 공개 자산과 JSON 주소
scripts/
  generation/                  Wiki JSON 생성과 외부 피드 동기화
  maintenance/                 기존 이미지 유지보수 도구
  hooks/                       선택 설치용 기존 Git hook
 tests/
  js/                          Node 단위·계약 테스트
  browser/                     빌드와 서버가 필요한 브라우저 회귀
  fixtures/                    승인 원문·검증 데이터
  *.rb, *.py                   출판·SEO·본문·실제 빌드 검증
 docs/                         저작·구조·검증 안내
```

Post는 `_posts`가 아닌 `_post`다. 날짜형 파일명이나 Jekyll 블로그 의미를 적용하지 않는다.
독립 글은 `/posts/<slug>/`, 장은 `/posts/chapters/<book-id>/<chapter-id>/`를 유지한다.
소스 이동 때문에 프론트매터를 고치지 않는다. `_plugins/archive.rb`가 렌더 전 URL을 결정하고
단일 collection에서 공개 가능한 문서만 남긴다. `books/`는 예약된 장 디렉터리이며,
메타데이터가 없더라도 독립 글로 우회 공개되지 않는다. 상세 스키마는 `post-authoring.md`에 있다.

## 출판 흐름

1. `_post`를 읽고 문서 공개 상태와 날짜를 검증한다.
2. 독립 글과 장을 구분하고 승인된 책 목차에 등록된 공개 장만 선택한다.
3. 예정 목차·책 최신 날짜·이전/다음 링크를 구성한다.
4. Home/Post/검색/SEO는 `archive_articles`, `archive_books`, `archive_documents`,
   `archive_catalog`라는 동일한 뷰를 사용한다. 뷰 이름의 articles는 collection 이름이 아니다.
5. Wiki·Review 출판과 SEO는 기존 `_plugins/public_seo.rb`가 담당한다.

## 내부 도구와 호환 경계

- Wiki JSON 생성의 정본은 `scripts/generation/generate-data.js`다.
  `npm run generate:wiki`, `start.sh`, `scripts/hooks/pre-commit`은 이 구현을 직접 사용한다.
  기존 `/generateData.js` 및 루트 CLI는 작은 호환 진입점으로 남긴다. 모듈 로드만으로 쓰지 않는다.
  실제 생성은 작업 디렉터리의 `_wiki`를 읽어 `data/`를 쓴다. 검증은 임시 복사본에서 한다.
- 외부 피드 CI는 `scripts/generation/sync-medium-posts.js`를 실행한다.
  자동 수집은 승인된 Post 원문을 덮어쓰지 않는다.
- `scripts/hooks/pre-commit`과 `scripts/maintenance/save-images.sh`는 기존 선택 도구다.
  자동 설치·실행하지 않는다. hook은 파일 변경·stage를 수행하므로 승인 없이 호출하지 않는다.
  Post 이미지 이관에는 사용하지 않는다(현재 첨부 URL 규칙은 `AGENTS.md` 참고).
- `js/command-palette.js`, `js/axios.min.js`, `data/metadata/`, `data/tag/` 등 기존 공개·동적
  경로는 내부 호출이 적다는 이유로 지우지 않는다. `_sass`도 Jekyll 소스 의미 때문에 유지한다.
- **과거 구조**의 `_articles`, `_chapters`, `test`, `tool`, `_scripts`는 더 이상 정본이 아니다.
  없어진 `_data/books.yml` 대상 표지 수집, `_books` 기반 일회성 태그 이관,
  오래된 upstream/master로 hard reset하는 skeleton 도구는 제거했다. 필요한 과거 기록은 Git 이력에 있다.

`docs`, `tests`, `scripts`, 에이전트 지침과 로컬 실험·의존성 디렉터리는 공개 출력에서 제외한다.
기존 공개 `/start.sh`와 `/generateData.js`는 호환 경로로 유지한다. 비공개 장·초안은 빌드 결과에 남지 않는다.

## 검증

```sh
npm test
python3 tests/test_repository_layout.py
ruby tests/archive_test.rb
python3 tests/archive_lifecycle.py
python3 tests/verify_archive.py _site
python3 tests/verify_seo.py _site
python3 tests/verify_kafka_textbook.py
```

브라우저 회귀는 `tests/browser/`에서 별도로 실행한다. 사용법과 임시 의존성은 각 파일 머리말을 따른다.
삭제·비공개 전환은 깨끗한 destination에 일반 Docker Jekyll 빌드로 확인한다(`--safe` 금지).
구조 변경은 이동 전후 소스 전체 바이트, 공개 URL 목록, HTML·검색·그래프·사이트맵,
스크립트·스타일 의존성 및 생성 CLI의 JSON/stdout을 대조한다. feed의 확인된 빌드 시각만 정규화한다.
