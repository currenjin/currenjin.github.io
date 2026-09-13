## Variant: DLOG Editorial Home

### Design stance
DLOG의 화면을 복제하지 않고, **대표 콘텐츠를 먼저 고르고 최근 기록으로 이어지는 편집 원칙**을 공개 아카이브 홈에 적용한다. Wiki와 Reviews는 현재 전면에 놓인 두 아카이브이며, 사이트 전체를 영구적으로 제한하는 경계가 아니다.

### Key choices
- Layout: 하나의 마스트헤드 아래 Wiki와 Reviews를 차례로 읽는 합본 출판 홈
- Typography: 장식 없는 산세리프 UI와 큰 세리프 제목의 대비
- Color: 흑백 중심. Wiki는 밝은 종이, Reviews는 검은 지면으로 구분
- Content: 실제 저장소의 Wiki 제목·요약과 Review 표지·평점 사용
- Interaction: Wiki/Reviews 앵커 탐색, Curated/Latest 강조 전환, 프로토타입 링크 안내 토스트

### Real fixtures
- Wiki: `distributed-transaction.md`, `modern-software-engineering.md`, `grafana-loki-tempo.md`
- Reviews: `To-Pimp-a-Butterfly.md`, `코스모스.md`, `창조적-행위.md`
- 외부 표지는 각 Review 프론트매터의 `cover_url`을 그대로 사용

### Trade-offs
- Strong at: 처음 온 사람에게 기록의 방향과 취향을 즉시 보여줌. Wiki와 Reviews가 한 출판물로 느껴짐.
- Weak at: 전체 자료 탐색·필터·Knowledge Graph는 첫 화면에서 의도적으로 약함. 실제 대표 3편 선정은 별도 검토 필요.

### Best for
- Gateway에서 목적지를 이미 선택한 뒤, currenjin의 대표 기록을 편집된 순서로 읽으려는 방문자

### Reference boundary
DLOG는 `featured → recent`의 편집 위계만 참고했다. 화면 구성, 문구, 색, 타이포그래피는 그대로 복제하지 않았다.
