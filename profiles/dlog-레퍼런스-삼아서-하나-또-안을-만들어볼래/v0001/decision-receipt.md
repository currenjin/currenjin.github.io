# Decision Receipt — v0001

- Target: dlog 레퍼런스 삼아서 하나 또 안을 만들어볼래?
- Session: tasty_22c58226772e4bc3
- Compiled: 2026-09-13T10:08:21.924Z
- Decisions: 6
- Estimate revisions: 3

## Decision trail
1. **DLOG의 편집 구조를 새 시안의 중심 골격으로 삼을지, COSMOS 홈 안의 한 구간으로 제한할지 결정한다.** → N: Neither candidate was accepted. _(reason: 사용자는 COSMOS 시안이 아니라 DLOG를 레퍼런스로 삼은 currenjin.github.io 전체 사이트의 추가 개편안을 요청했다. 제시된 두 후보는 모두 COSMOS 홈을 전제로 하므로 선택하지 않는다.)_
2. **DLOG를 참고한 currenjin.github.io가 방문자에게 먼저 수행할 역할을 결정한다.** → D: 모든 랜딩은 블랙홀이 있는 Gateway로 통일하고, Gateway에서 Wiki와 Reviews로 이동하며, currenjin.github.io에는 Wiki와 Reviews만 둔다. _(reason: 사용자는 currenjin.github.io 자체를 인물 소개나 통합 랜딩으로 쓰지 않고, 별도의 공통 Gateway 뒤에 놓인 Wiki·Reviews 출판면으로 한정하기로 했다.)_
3. **공통 Gateway가 Wiki와 Reviews의 선택을 맡을 때 currenjin.github.io 루트가 어떤 콘텐츠 화면이 될지 결정한다.** → A: 루트를 두 출판면의 편집된 합본으로 둔다. currenjin.github.io에 들어오면 Wiki의 대표 기록·최근 업데이트와 Reviews의 대표 작품·최근 감상을 한 화면에서 만나고, 각 섹션의 전체 아카이브로 이동한다. 새로운 세계관 랜딩은 만들지 않지만, DLOG처럼 지금 읽을 콘텐츠를 골라 주는 출판 홈은 유지한다.
4. **DLOG의 대표 글 편집 방식을 Wiki의 방대한 기록에 어떻게 적용할지 결정한다.** → A: 대표 기록 3편을 고정한다. 홈의 Wiki 영역 맨 앞에 currenjin의 관점과 기록 성격을 가장 잘 보여주는 글 3편을 크게 배치하고, 그 아래에는 최근 수정된 기록을 간결하게 이어 붙인다. 처음 온 사람은 대표 글로 방향을 이해하고, 다시 온 사람은 최근 기록으로 바로 들어간다.
5. **Reviews를 Wiki와 동등한 출판면으로 만들기 위한 첫 화면과 아카이브 구조를 결정한다.** → A: 대표 리뷰 3편을 편집해 보여준다. 책·영화·음악 등 매체를 억지로 하나씩 맞추지 않고, 지금 currenjin의 취향과 관점을 가장 잘 보여주는 리뷰 3편을 표지와 함께 크게 배치한다. 그 아래에는 최근 기록한 작품을 간결하게 이어 붙이고 전체 Reviews로 이동한다.
6. **Wiki·Reviews의 본질적인 읽기 경험과 공통 시각 언어를 먼저 정한다. Knowledge Graph·검색·최근 업데이트·태그·/books/ 호환 경로는 새 구조에 자연스럽게 통합될 때만 유지하고, 구조를 복잡하게 만들거나 별도 설명이 필요하면 제거한다.** → A: 하나의 편집 디자인을 공유한다. Wiki와 Reviews 모두 같은 마스트헤드, 글꼴, 여백, 격자, 흑백 중심 색을 사용한다. 차이는 콘텐츠 표현에만 둔다. Wiki는 제목과 문장 중심, Reviews는 같은 격자 안에서 표지 이미지가 더 크게 보인다. 두 영역이 한 출판물의 서로 다른 지면처럼 느껴진다.

## Plan revisions
- 5 → 6: 첫 비교가 COSMOS 홈을 잘못 전제로 삼았으므로 유효한 디자인 선호로 사용하지 않습니다. 이후 비교는 DLOG를 레퍼런스로 삼은 currenjin.github.io 전체 사이트의 추가 개편안에만 한정하고, COSMOS Gateway 구조와 세계관은 끌어오지 않습니다.
- 6 → 6: 사용자가 정보 구조를 다시 확정했습니다. 공통 랜딩은 블랙홀이 있는 Gateway가 맡고, currenjin.github.io는 Wiki와 Reviews 두 출판면만 둡니다. Medium Blog·GitHub·About은 이 사이트의 주 영역에서 제외하며, 검색·태그·최근 업데이트·Knowledge Graph는 Wiki·Reviews를 지원하는 기능으로 다룹니다.
- 6 → 6: Knowledge Graph·검색·최근 업데이트·태그·/books/는 재개편의 본질이 아닙니다. Wiki와 Reviews의 읽기 경험을 우선하고, 이 기능들은 새 구조에 자연스럽게 들어갈 때만 유지하며 그렇지 않으면 제거합니다. 이 원칙은 현재 제시된 루트 A/B의 선택으로 해석하지 않습니다.
