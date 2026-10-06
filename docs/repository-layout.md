# 저장소 구성과 정리 기준

## 정본과 공개 출력

- `_articles/`, `_chapters/`, `_wiki/`, `_reviews/`: 저자 원문과 공개 메타데이터. 파일명과 공개 URL을 임의 변경하지 않는다.
- `_data/`: 목차와 목록의 정본. Post 출판 절차는 `post-authoring.md`, 문체는 `writing-convention.md`에서 관리한다.
- `_plugins/archive.rb`: 출판 경계. `_layouts/`, `_includes/`: 렌더링. 전역 UI 진입점은 `_includes/global-ui.html`이다.
- `js/`, `css/`, `_sass/`, `resource/`: 공개 자산과 스타일 소스. 내부 참조가 없다는 이유만으로 공개 자산을 삭제하지 않는다.
- `data/`: 기존 태그·문서 JSON 주소. JS가 태그·문서명으로 경로를 조합하므로 개별 정적 참조만으로 삭제 여부를 판단할 수 없다.
- `generateData.js`: `start.sh`와 `tool/pre-commit`이 사용하는 기존 JSON 생성 CLI. 직접 실행할 때만 생성하고 모듈 로드만으로 파일을 쓰지 않는다. 정본 콘텐츠나 추적 중인 JSON을 검증 목적으로 재생성하지 않는다.
- `scripts/`, `tool/`, `test/`, `tests/`, `docs/`: 내부 도구·검증·문서. `_config.yml`의 `exclude`로 공개 출력에서 제외한다.
- `_site/`, `.jekyll-cache/`: 빌드 부산물. 커밋하지 않는다.

## 이번 정리와 유지 예외

- 미사용 `_includes/graph-dock.html`을 제거했다. Liquid include 호출과 동적 include가 없으며 include 자체는 공개 파일로 출력되지 않는다. 연결된 미사용 도크의 테마 검사만 제거하고 현재 공용 CSS·그래프의 검사는 유지한다.
- `scripts/import_notes.py`, `scripts/import_notes_html.py`, `scripts/migrate_to_collection.py`는 없어진 `_data/books.yml`과 `_books/`를 대상으로 하는 과거 일회성 이관 도구라 제거했다. 저장소·배포·현재 도구에서 호출하지 않으며 공개 출력에도 포함되지 않는다. 새 Review 이관에 재사용하지 않는다. 필요하면 Git 이력에서 복구한다.
- `js/command-palette.js`와 관련 스타일은 현재 로드하지 않지만 공개 자산과 기존 직접 URL을 보존한다. 외부 사용 여부는 내부 참조 조사만으로 증명할 수 없다.
- `generateData.js`, `start.sh`, `tool/pre-commit`, `data/metadata/`, `data/tag/`, `js/axios.min.js`는 레거시여도 실행·동적 조회 경로가 있어 유지한다.
- 검색 정규화의 작은 중복은 별도 공유 JS·로더 추가 없이 유지한다. 이번 정리는 공개 페이지의 스크립트·스타일 의존성을 바꾸지 않는다.

## 검증

기존 `AGENTS.md`의 Docker 일반 Jekyll 빌드, `npm test`, 아카이브 검증을 사용한다. 변경 전후 깨끗한 빌드에서 공개 파일 경로, 페이지 본문, 로드되는 스크립트·스타일과 검색·그래프 JSON을 대조한다. `test/generate-data.test.cjs`는 임시 디렉터리에서 모듈 로드의 무부작용과 기존 CLI의 공개/비공개·중첩 경로·정렬을 검증한다. 의존성은 기존 `package.json`을 그대로 사용한다.
