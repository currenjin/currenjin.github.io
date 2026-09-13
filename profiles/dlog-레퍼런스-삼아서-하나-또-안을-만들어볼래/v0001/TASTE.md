# Taste Profile: dlog 레퍼런스 삼아서 하나 또 안을 만들어볼래?

Version: 1
Source session: `tasty_22c58226772e4bc3`

## Summary
currenjin.github.io는 블랙홀이 있는 공통 Gateway 뒤에서 Wiki와 Reviews만 제공하는 개인 출판면으로 재편한다. 루트는 두 영역의 대표 콘텐츠를 함께 보여주는 합본 홈이며, Wiki와 Reviews 각각 대표 콘텐츠 3편 다음에 최근 기록을 배치한다. DLOG에서는 대표 콘텐츠를 먼저 골라 주고 최신 기록으로 이어지는 편집 방식을 참고한다. 두 영역은 하나의 흑백 중심 편집 디자인을 공유하되 Wiki는 글, Reviews는 표지 이미지가 중심이 된다. 보조 탐색 기능은 본질이 아니며 새 구조에 자연스럽게 들어갈 때만 유지한다.

## Confirmed rules
- 모든 서비스의 랜딩은 블랙홀이 있는 공통 Gateway가 맡고, Gateway에서 Wiki와 Reviews로 이동한다.
  - Evidence: cmp_164e8aa4e2414fb5
- currenjin.github.io의 주 콘텐츠는 Wiki와 Reviews 두 출판면으로 한정한다.
  - Evidence: cmp_164e8aa4e2414fb5
- currenjin.github.io 루트는 Wiki와 Reviews의 대표 콘텐츠를 함께 보여주는 편집된 합본 홈으로 구성한다.
  - Evidence: cmp_8c04d5bfbc2f4878
- 합본 홈의 Wiki 영역은 대표 기록 3편을 먼저 보여주고 그 아래에 최근 기록을 간결하게 이어 붙인다.
  - Evidence: cmp_d123841390404183
- 합본 홈의 Reviews 영역은 취향과 관점을 보여주는 대표 리뷰 3편을 표지와 함께 먼저 보여주고 그 아래에 최근 작품을 간결하게 이어 붙인다.
  - Evidence: cmp_f39cb2d961fe4fcd
- Wiki와 Reviews는 같은 마스트헤드·글꼴·여백·격자·흑백 중심 색을 공유해 하나의 출판물에 속한 서로 다른 지면처럼 보이게 한다.
  - Evidence: cmp_83254b9327364db2
- 같은 편집 체계 안에서 Wiki는 제목과 문장 중심으로, Reviews는 표지 이미지 중심으로 콘텐츠 차이를 표현한다.
  - Evidence: cmp_83254b9327364db2

## Avoid
- currenjin.github.io를 COSMOS Gateway나 블랙홀 랜딩으로 다시 만들지 않는다. Gateway는 별도의 공통 진입점이며 이 사이트는 그 뒤의 출판면이다.
  - Evidence: cmp_af25de79197e4b47, cmp_164e8aa4e2414fb5
- Medium Blog·GitHub·About을 currenjin.github.io의 동등한 주 콘텐츠 영역으로 두지 않는다.
  - Evidence: cmp_164e8aa4e2414fb5
- Knowledge Graph·검색·최근 업데이트·태그·/books/ 호환을 보존하기 위해 Wiki·Reviews의 핵심 구조를 복잡하게 만들지 않는다.
  - Evidence: cmp_83254b9327364db2

## Contextual rules
- **DLOG의 현재 홈에서 확인한 편집 원칙, 대표 글 3편, 최근 글 흐름을 currenjin.github.io에 번역할 때:** DLOG를 화면 그대로 복제하지 않고 ‘대표 콘텐츠를 먼저 골라 주고 최근 기록으로 이어지는 편집 방식’만 참고한다.
  - Evidence: cmp_8c04d5bfbc2f4878, cmp_d123841390404183, cmp_f39cb2d961fe4fcd
- **새 합본 홈과 개별 Wiki·Reviews 화면에 보조 탐색을 배치할 때:** Knowledge Graph·검색·최근 업데이트·태그·/books/는 새 구조에 별도 설명 없이 자연스럽게 통합되는 경우에만 유지하고 그렇지 않으면 제거한다.
  - Evidence: cmp_83254b9327364db2

## Unresolved
- 대표 Wiki 기록 3편과 대표 Review 3편의 실제 항목
- 합본 홈과 개별 영역에 사용할 정확한 문구·색상·서체·간격
- Gateway에서 Wiki와 Reviews로 연결할 최종 URL 구조
- Knowledge Graph·검색·최근 업데이트·태그·/books/ 중 실제 시안에서 자연스럽게 유지되는 기능

## Decision boundaries
- 이번 프로필은 블랙홀 Gateway 자체가 아니라, Gateway에서 이동한 뒤 만나는 currenjin.github.io의 Wiki·Reviews 재개편에 한정한다.
- 개별 Wiki 문서와 개별 Review 본문의 콘텐츠 구조는 이번 결정에서 고정하지 않는다.
- 실제 대표 Wiki 3편과 대표 Review 3편의 선정은 별도 검토가 필요하다.
- 이 결정은 재개편 시안 작성 기준이며 실제 Jekyll 파일 수정·커밋·배포 완료를 뜻하지 않는다.

## Preferences
### DLOG의 편집 구조를 새 시안의 중심 골격으로 삼을지, COSMOS 홈 안의 한 구간으로 제한할지 결정한다.
- Choice: **N**
- Preference: Neither candidate was accepted.
- Reason: 사용자는 COSMOS 시안이 아니라 DLOG를 레퍼런스로 삼은 currenjin.github.io 전체 사이트의 추가 개편안을 요청했다. 제시된 두 후보는 모두 COSMOS 홈을 전제로 하므로 선택하지 않는다.

### DLOG를 참고한 currenjin.github.io가 방문자에게 먼저 수행할 역할을 결정한다.
- Choice: **D**
- Preference: 모든 랜딩은 블랙홀이 있는 Gateway로 통일하고, Gateway에서 Wiki와 Reviews로 이동하며, currenjin.github.io에는 Wiki와 Reviews만 둔다.
- Reason: 사용자는 currenjin.github.io 자체를 인물 소개나 통합 랜딩으로 쓰지 않고, 별도의 공통 Gateway 뒤에 놓인 Wiki·Reviews 출판면으로 한정하기로 했다.

### 공통 Gateway가 Wiki와 Reviews의 선택을 맡을 때 currenjin.github.io 루트가 어떤 콘텐츠 화면이 될지 결정한다.
- Choice: **A**
- Preference: 루트를 두 출판면의 편집된 합본으로 둔다. currenjin.github.io에 들어오면 Wiki의 대표 기록·최근 업데이트와 Reviews의 대표 작품·최근 감상을 한 화면에서 만나고, 각 섹션의 전체 아카이브로 이동한다. 새로운 세계관 랜딩은 만들지 않지만, DLOG처럼 지금 읽을 콘텐츠를 골라 주는 출판 홈은 유지한다.

### DLOG의 대표 글 편집 방식을 Wiki의 방대한 기록에 어떻게 적용할지 결정한다.
- Choice: **A**
- Preference: 대표 기록 3편을 고정한다. 홈의 Wiki 영역 맨 앞에 currenjin의 관점과 기록 성격을 가장 잘 보여주는 글 3편을 크게 배치하고, 그 아래에는 최근 수정된 기록을 간결하게 이어 붙인다. 처음 온 사람은 대표 글로 방향을 이해하고, 다시 온 사람은 최근 기록으로 바로 들어간다.

### Reviews를 Wiki와 동등한 출판면으로 만들기 위한 첫 화면과 아카이브 구조를 결정한다.
- Choice: **A**
- Preference: 대표 리뷰 3편을 편집해 보여준다. 책·영화·음악 등 매체를 억지로 하나씩 맞추지 않고, 지금 currenjin의 취향과 관점을 가장 잘 보여주는 리뷰 3편을 표지와 함께 크게 배치한다. 그 아래에는 최근 기록한 작품을 간결하게 이어 붙이고 전체 Reviews로 이동한다.

### Wiki·Reviews의 본질적인 읽기 경험과 공통 시각 언어를 먼저 정한다. Knowledge Graph·검색·최근 업데이트·태그·/books/ 호환 경로는 새 구조에 자연스럽게 통합될 때만 유지하고, 구조를 복잡하게 만들거나 별도 설명이 필요하면 제거한다.
- Choice: **A**
- Preference: 하나의 편집 디자인을 공유한다. Wiki와 Reviews 모두 같은 마스트헤드, 글꼴, 여백, 격자, 흑백 중심 색을 사용한다. 차이는 콘텐츠 표현에만 둔다. Wiki는 제목과 문장 중심, Reviews는 같은 격자 안에서 표지 이미지가 더 크게 보인다. 두 영역이 한 출판물의 서로 다른 지면처럼 느껴진다.

## Provenance
References below informed or inspired candidates. They are not treated as user preferences or proof of claims.
- [inspiration] DLOG — https://blog.dohyeon.kr/
- [evidence] currenjin.github.io 재개편 기존 Tasty 프로필
