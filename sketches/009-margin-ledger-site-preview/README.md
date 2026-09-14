# 009 — Margin Ledger full-site static preview

`008-margin-ledger`의 조용한 아카이브 장부 문법을 상세 페이지와 발견 경험까지 확장한, 빌드 없이 열 수 있는 정적 HTML 프리뷰다. 운영 Jekyll 템플릿·컬렉션·데이터는 변경하지 않는다.

## Page map

| 파일 | 역할 | 주요 이동 |
| --- | --- | --- |
| `index.html` | 홈, 날짜순 wiki/review/Medium 혼합 스트림 | 필터, 제목의 상세 이동, 별도 버튼으로 여는 리뷰 표지 |
| `wiki/index.html` | 최근 수정순 Wiki 카탈로그 | 텍스트 검색, 태그 필터, Distributed Transaction 상세 |
| `wiki/distributed-transaction.html` | 대표 Wiki 상세 | sticky 목차, 본문 앵커, 관련 문서와 Graph |
| `reviews/index.html` | 날짜순 Reviews 장부 | 텍스트 검색, 매체 필터, 표지 일괄 접기/펼치기 |
| `reviews/cosmos.html` | 대표 Review 상세 | 실제 표지·메타데이터·본문, 목차 |
| `graph/index.html` | Graph/search 발견 화면 | 실제 위키링크 관계, 그래프 노드와 검색 결과에서 내부 이동 |
| `assets/style.css` | 모든 화면의 공용 시각·반응형 규칙 | 008 토큰과 장부 그리드 확장 |
| `assets/site.js` | 모든 화면의 공용 상호작용 | 검색, 필터, disclosure, graph 강조, `Cmd/Ctrl+K` |

## Design decisions

- 008의 회백색 종이, Georgia 계열 serif, 작은 sans 메타데이터, 선 없는 여백 중심 장부를 그대로 기준으로 삼았다.
- 홈은 Wiki·Review·외부 기록을 하나의 시간축에 섞고, 연결 문맥은 4번째 열의 청록색 margin note로 둔다.
- 홈의 Review 표지는 기본으로 닫고, 제목은 상세 이동 전용으로 둔다. 제목 옆 `표지 보기 +` 버튼만 미리보기를 연다. Reviews 목록에서는 표지를 기본으로 펼치며 개별 접기와 일괄 접기를 지원한다.
- 상세 페이지는 읽기 폭과 관계/목차 열을 분리한다. 모바일에서는 목차와 margin note가 본문 흐름 안으로 내려온다.
- Graph 선은 실제 `_wiki/`의 위키링크만 사용했다: Distributed Transaction ↔ Kafka / Designing Data-Intensive Applications, Building Evolutionary Architectures → Distributed Transaction, COSMOS → Grafana·Loki·Tempo.
- 모든 제목, 날짜, 요약, 저자, 장르, 평점, 표지 URL과 본문은 `_wiki/`, `_reviews/`, `_data/updates.json` 및 008에 이미 반영된 repository data에서 가져왔다. 프리뷰용 작품이나 날짜를 만들지 않았다.
- 760px 이하에서 장부의 날짜 열을 64px로 줄이고 관계 열을 본문 아래로 이동한다. 표·SVG·이미지는 컨테이너 안에서만 렌더링해 약 390px 폭에서도 수평 오버플로가 없도록 했다.

## Interaction notes

- 홈: `all / wiki / reviews / elsewhere` 필터, 제목의 상세 이동, 별도 표지 토글.
- Wiki: 제목·요약·태그 실시간 검색 및 태그 필터 조합.
- Reviews: 제목·저자·장르 실시간 검색, 매체 필터, 각 표지 disclosure와 표지 전체 접기/펼치기.
- Graph: 검색어와 맞지 않는 노드를 흐리게 하고 결과 목록을 동시에 거른다.
- 검색이 있는 화면에서 `Cmd/Ctrl+K`로 검색 입력에 포커스한다.

## Run

`index.html`을 직접 열어도 상대 링크와 상호작용이 작동한다. 서버 기반 확인은 이 디렉터리에서 다음처럼 실행할 수 있다.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

그 뒤 `http://127.0.0.1:8000/`을 연다.
