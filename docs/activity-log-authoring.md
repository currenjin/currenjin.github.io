# Activity log authoring

`_data/activity_log.yml`에 완료한 활동을 한두 문장으로 남긴다. 상세 페이지는 필요하지 않다. 계획이나 예정된 참여는 넣지 않고 날짜, 결과, 프로젝트 링크는 사용자가 확인한 내용만 쓴다. 감상이나 사진을 추측해서 추가하지 않는다.

```yaml
- id: completed-project
  date: "2026-10-18"
  public: false
  title: 프로젝트 이름
  summary: 확인된 활동과 결과를 한두 문장으로 적는다.
  # project_url: 실제로 확인한 HTTPS 프로젝트 URL이 있을 때만 추가
```

- `id`는 소문자 영문, 숫자, 하이픈으로 만든 고유 식별자다. 검색 결과가 `/log/#<id>`로 연결되므로 공개 후 바꾸지 않는다.
- `date`는 실제 활동일인 `YYYY-MM-DD`다. 시각이나 느슨한 날짜 형식은 받지 않는다.
- `title`과 `summary`는 비어 있지 않은 일반 텍스트다. HTML이나 Markdown으로 해석하지 않고 그대로 escape해서 표시한다.
- 새 초안은 `public: false`로 둔다. 공개 승인을 받은 기록만 YAML 불리언 `public: true`로 바꾼다. 문자열 `"true"`는 공개하지 않는다.
- `draft: true`, `published: false`, 유효하지 않거나 사이트 빌드일보다 미래인 날짜는 공개를 막는다. 빌드 기준 시간대는 기존 사이트 설정인 `Asia/Seoul`이다.
- `project_url`은 선택 사항이다. 사용자 정보가 없는 HTTPS URL이 있으면 날짜, 제목, 요약을 포함한 행을 클릭해 이동한다. 링크가 없으면 일반 텍스트로 남는다. 이미지를 임의로 추가하지 않는다.
- 등수와 참가 표기는 `1st Place`, `Top 6 Finalist`, `Participant`로 통일하고 행사명과 결과는 콤마로 구분한다.
- `_plugins/activity_log.rb`가 공개 항목만 골라 최신순 `site.activity_log`를 만든다. Home, `/log/`, 검색은 이 뷰만 사용한다. `site.data.activity_log`를 직접 출력하지 않는다. 새 출력 필드는 플러그인의 허용 목록에도 명시한다.
- 기존 date/type/title 행과 요약 스타일을 재사용한다. 별도 카드, 배지, 통계, 그래프 노드는 만들지 않는다.

## 검증

```sh
ruby tests/activity_log_test.rb
npm test
bundle exec ruby tests/activity_log_fixture_test.rb
bundle exec jekyll build
python3 tests/verify_archive.py _site
python3 tests/verify_seo.py _site
```

일반 Jekyll 빌드를 사용한다. `--safe` 빌드는 출판 필터를 실행하지 않으므로 지원하지 않는다. 빌드 후 Home의 all/log 필터, 전체 개수, 최신순 정렬, 검색 결과의 앵커, `/log/`의 현재 탐색 표시를 확인한다. 작은 모바일 폭에서도 헤더와 필터가 넘치지 않는지 확인한다. 이 문서는 기존 `docs` 제외 규칙으로 공개 출력에 복사되지 않는다.
