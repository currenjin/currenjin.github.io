---
layout  : wiki
title   : Designing Data-Intensive Applications(데이터 중심 애플리케이션 설계)
summary :
date    : 2025-09-10 13:00:00 +0900
updated : 2025-09-18 13:00:00 +0900
tags     : architecture
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Designing Data-Intensive Applications(데이터 중심 애플리케이션 설계)
- [Alexandria playground](https://github.com/currenjin/alexandria-playground/tree/main/book-designing-data-intensive-applications)

## Ch01 Reliability, Scalability, Maintainability
### TL;DR
- **품질**은 신뢰성, 확장성, 유지보수성의 균형으로 본다.
- 평균 대신 **백분위(p95, p99)**와 **오류율**로 측정한다.
- **신뢰성**은 결함이 발생해도 시스템이 올바르게 동작하고, 장애 전파를 막는 설계다.
- **확장성**은 캐시, 큐 그리고 수평확장 등 부하가 증가해도 좋은 성능을 유지하기 위한 전략이다.
- **유지보수성**은 레거시를 줄이고, 운용성, 단순성 그리고 발전성을 높이는 일이다.

### Key Ideas
- **결함**: 잘못될 수 있는 일이다. 결함을 예측하고 대처할 수 있는 시스템을 내결함성 또는 탄력성을 지녔다고 말한다.
- **부하 증가**: 성능 저하를 유발하는 가장 흔한 이유이다. 그리고 부하 매개변수를 정의할 수 있다.
- **응답 시간**: 온라인 시스템에서의 중요한 관심사다. 평균보다는 백분위(p95, p99, p999)를 사용하는 편이 좋다.
- **단순성**: 우발적 복잡도를 줄이고 좋은 추상화로 유지할 수 있다.

### Trade-offs

| 선택      | 장점                          | 단점                         | 언제                                        |
|---------|-----------------------------|----------------------------|-------------------------------------------|
| 수평 확장   | 탄력성과 확장성이 증가한다.             | 키/리밸런싱이 복잡하다.              | 고정적인 고부하 또는 대규모 데이터 발생 시 유용하다.            |
| 수직 확장   | 장점: 도입이 쉽고, 단일 노드 성능이 증가한다. | 단점: 상향의 한계가 있고, 비용이 급증한다.  | 언제 적용하는가: 일시적 스파이크가 발생하거나 간단한 워크로드에 유용하다. |
| 동기 처리   | 장점: 단순하고, 결과가 일관됐다.         | 단점: 지연 시간이 증가하고, 장애가 전파된다. | 언제 적용하는가: 강한 즉시성이 필요할 때 유용하다.             |
| 비동기 + 큐 | 장점: 스파이크를 흡수하거나 격리한다.       | 단점: 순서, 지연을 관리해야 한다.       | 언제 적용하는가: 쓰기 요청이 폭주하거나 후처리에 유용하다.         | 

### Apply our Domain
- 우리 서비스는 백분위 기준이 존재하지 않음
- p95 기준 정의하기 ex) `GET /orders?nearbyBaseOrderId -> p95: 500ms`
- 응답 시간 줄이기 ex) `GET /orders?nearbyBaseOrderId`

#### SLI, SLO
- SLI
    - `orders.read.p95_ms`: `GET /orders` p95 응답시간
    - `orders.read.error_rate`: 5xx + 타임아웃/전체 요청
    - `cache.hit_rate.orders`: 주문 조회 캐시 히트율
- SLO (30 days)
    - `orders.read.p95_ms < 200`
    - `orders.read.error_rate < 0.1%`
    - `cache.hit_rate.orders >= 80%`

#### Load Parameters
- TOP-N
- Cache Hit by Key
- Egress/Ingress

### Open Questions
- 부하 매개변수를 증가시키고 시스템 자원은 변경하지 않고 유지하면 시스템 성능은 어떻게 영향을 받을까?
- 부하 매개변수를 증가시켰을 때 성능이 변하지 않고 유지되길 원한다면 자원을 얼마나 많이 늘려야 할까?
- 캐시 TTL 1m/5m/10m에서 **p95, 히트율, 신선도 불만율**의 상관관계는?

## Ch02 Data Models and Query Languages
### TL;DR
- 스키마는 접근 패턴이 정한다. (무엇을 얼마나 자주/어떻게 읽고 쓰는가)
- **색인(인덱스)** 는 읽기를 빠르게 하지만 쓰기/공간 비용이 든다. (복수 인덱스 유지=쓰기 증폭)
- **문서 모델은 읽기 스키마(schema-on-read)** 에 가깝고 지역성/집계 읽기에 유리, 관계형은 조인/트랜잭션에 유리.
- 정규화 vs 비정규화는 쓰기 일관성 vs 읽기 성능의 교환.

### Key Ideas
- Access-Pattern First: “최근 7일 유저별 주문 20개”, “주문 상세 빠르게” 같은 핵심 질의를 먼저 적고 스키마/인덱스 설계.
- 인덱스 기본기: 복합 인덱스(예: (user_id, created_at DESC)), 커버링 인덱스(SELECT 컬럼이 전부 인덱스에 있을 때), 선택도(cardinality) 체크.
- 정규화/비정규화 믹스: 핵심 엔터티는 정규화, API 응답 최적화용 읽기 모델은 비정규화/스냅샷 필드(ex: shipping_address_snapshot).
- 참조 vs 내장(embedding): 변경 잦고 공유되는 것은 ID 참조, 항상 같이 읽는 작은 하위 구조는 내장.
- Row-store vs Column-store: 온라인 트랜잭션(OLTP)은 보통 행 저장, 분석/리포트(OLAP)는 열 저장(+압축) 채택.
- Schema-on-write vs read: RDB는 쓰기 시 강한 스키마, 문서/데이터 레이크는 읽기 시 해석(유연하지만 쿼리 복잡도↑).
- 무중단 스키마 변경 패턴: Expand → Migrate → Contract(새 컬럼/인덱스 추가 → 백필/듀얼리드 → 구식 제거).

### Trade-offs
| 선택                  | 장점              | 단점            | 언제               |
|---------------------|-----------------|---------------|------------------|
| **문자열 내장 저장**       | 한 번에 읽기, 조인 없음  | 중복/부분 업데이트 비용 | 응답에 항상 필요한 작은 필드 |
| **ID 참조**           | 중복 없음, 변경 전파 쉬움 | 조인/추가 조회 필요   | 재사용/변경 잦은 공통 엔터티 |
| **정규화**             | 쓰기 일관성·중복 최소    | 읽기 시 조인 비용    | 강한 정합·중복 방지 우선   |
| **비정규화(스냅샷)**       | 읽기/캐시 지역성↑      | 쓰기 시 동기화 부담   | 응답 최적화·과거 상태 보존  |
| **보조 인덱스 추가**       | p95 읽기↓, 스캔↓    | 쓰기/공간↑, 유지비↑  | 조회가 훨씬 많을 때      |
| **Row-store**       | 단건 읽기/쓰기 빠름     | 대규모 집계 비효율    | OLTP 경로          |
| **Column-store**    | 대용량 집계 효율↑      | 단건 트랜잭션 느림    | 리포트/분석 경로        |
| **Schema-on-write** | 검증·일관성↑         | 스키마 진화 마찰     | 핵심 트랜잭션 데이터      |
| **Schema-on-read**  | 유연성↑            | 쿼리 복잡/품질 편차   | 레이크/로그/실험 데이터    |

### Apply our Domain

도메인: 주문(Order) 조회/상세, “nearbyBaseOrderId” 탐색

#### 모델 제안

주문 RDB(정규화) + 읽기 모델(비정규화) 병행

RDB 테이블: orders(id, user_id, status, created_at, total_amount, ...), order_items(order_id, product_id, qty, price, ...)

읽기 최적화 필드(스냅샷): shipping_address_snapshot, user_name_snapshot

문서형 대안(선택): order 문서에 items 내장(최근 주문 타임라인 API 등 한 번에 내려줄 때)

#### 인덱스/쿼리
- 최근 주문 목록: INDEX (user_id, created_at DESC) → WHERE user_id=? ORDER BY created_at DESC LIMIT 20
- 상태 필터: INDEX (status, created_at DESC)
- 유니크: UNIQUE(order_no)
- nearbyBaseOrderId: 키셋 페이징(offset 대신 created_at < :cursor_created_at OR (created_at = :cursor AND id < :cursor_id)), 복합 인덱스 (created_at DESC, id DESC)

#### 마이그레이션(무중단) 예시
- Expand: 새 컬럼 shipping_address_snapshot nullable 추가, 새 인덱스 생성
- Migrate: 백필 배치 + API 듀얼 리드(없으면 조인, 있으면 스냅샷 사용)
- Contract: 충분한 기간 후 구식 조인 경로 제거, NOT NULL 전환/제약 강화

### SLI, SLO (초안)
#### SLI
- `db.orders.query.p95_ms`: 주문 목록/상세 쿼리 p95
- `db.orders.index_hit_rate`: 해당 쿼리 인덱스 히트율
- `db.orders.rows_scanned`: 쿼리당 스캔 로우 수 p95
- `api.orders.stale_read_rate`: 신선도 임계(예: 5분) 초과 응답 비율

#### SLO (rolling 30d)
- `db.orders.query.p95_ms` < 150
- `db.orders.index_hit_rate` ≥ 95%
- `db.orders.rows_scanned.p95` ≤ 5k
- `api.orders.stale_read_rate` ≤ 0.5%

### Open Questions
- nearbyBaseOrderId 탐색에서 키셋 페이징으로 완전히 전환 가능한가? (정렬 기준/커서 설계 확정)
- 스냅샷 필드의 신선도 임계(ex. 5분)를 넘는 경우, 언제/어떻게 갱신? (비동기 리프레시/쓰기 시 동기화)
- 문서형 대안을 도입한다면, 어떤 엔드포인트에서 조인 제거→응답 시간/비용 이득이 가장 큰가?
- 보조 인덱스 추가로 쓰기 QPS가 얼마나 감소하는가? (배치 쓰기/인덱스 리빌드 윈도우 필요?)

### 메모(마이그레이션 팁)
- 컬럼 추가 시 nullable + 기본값으로 시작 → 애플리케이션이 null 허용하도록 먼저 배포(네가 적어둔 포인트 아주 좋음!)
- 인덱스는 온라인 생성/백그라운드 옵션 사용, 리빌드 시간 동안 배포 금지 윈도우 설정
- 이중 쓰기가 필요하면 가능한 Outbox/이벤트로 일관성 보강, 아니면 듀얼 리드로 점진 전환

## Ch03 Storage and Retrieval

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch04 Encoding and Evolution

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch05 Replication

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch06 Partitioning

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch07 Transaction
### TL;DR (3문장)

* 트랜잭션은 동시성에서 **불변식(invariant)** 을 지키기 위한 도구다. 격리 수준 선택이 **허용/차단**할 이상(anomaly)을 결정한다.
* **Snapshot Isolation(RR)** 은 dirty/non-repeatable/read skew는 막지만 **write skew/phantom**은 막지 못한다. **Serializable**이 가장 안전하나 비용↑.
* 서비스 간에는 2PC보다 **SAGA + Outbox + 멱등성**으로 일관성을 설계하고, **재시도/백오프/서킷**을 전제한다.

### Key Ideas

* **ACID 재정의(실무 관점)**: A(원자성)·I(격리)·D(내구성)는 스토리지+CC로 보장, **C(일관성)**은 애플리케이션 불변식으로 정의해야 함.
* **격리 수준과 이상**
    * RC(Read Committed): dirty read x, 그 외 대부분 허용
    * RR/SI(Repeatable Read / Snapshot Isolation): dirty/non-repeat/read skew x, **write skew o**, phantom (DB 의존)
    * Serializable: 주요 이상 전부 x (가장 안전)
* **주요 이상**

    * **Dirty Read**: 커밋 전 데이터 읽음
    * **Non-repeatable Read**: 같은 행 재조회 값 변동
    * **Read Skew**: 서로 다른 행/테이블 사이 시간 왜곡
    * **Write Skew**: 두 트랜잭션이 각각 검사-쓰기로 **불변식 위반**
    * **Lost Update**: 동시 갱신 중 덮어쓰기
    * **Phantom**: 조건에 맞는 행 집합이 동시성으로 바뀜
* **동시성 제어(요약)**

    * **2PL(락 기반)**: 행/범위(갭/프레디킷) 락으로 직렬화 보장, 교착/대기↑
    * **MVCC + SI**: 스냅샷 읽기(락 적음), 대신 **write-write 충돌/쓰기 스큐** 가능
    * **SSI(Serializable SI)**: SI 위에 충돌 검사로 직렬화 보장(충돌 시 abort)
    * **명시적 원자 연산/제약**: `UPSERT/UNIQUE/FOREIGN KEY`, `SELECT ... FOR UPDATE`
* **분산 트랜잭션**

    * 2PC는 블로킹/파티션 장애에 취약. 실무에선 **SAGA(보상 트랜잭션)** + **Outbox/CDC** + **소비자 멱등성**을 조합
* **패턴**

    * 검사-후-쓰기(Check-then-write)는 SI에서 위험 → **원자적 카운터/제약/락/큐**로 대체
    * 장시간 트랜잭션은 핫락/재시도 폭증 유발 → **작게 쪼개기/오프로드**

### Trade-offs

| 선택                        | 장점             | 단점                        | 언제               |
|---------------------------|----------------|---------------------------|------------------|
| **RC**                    | 지연·경합↓, 처리량↑   | 읽기 왜곡/스큐 허용               | 단순 조회/보고용        |
| **RR/SI**                 | 읽기 안정성↑, 락 경합↓ | **Write Skew/Phantom** 위험 | 대부분의 OLTP 기본값    |
| **Serializable(2PL/SSI)** | 불변식 강보장        | 지연/Abort/교착↑              | 금전·재고 등 강한 제약    |
| **SELECT ... FOR UPDATE** | 잃어버린 업데이트 방지   | 락 경합/대기↑                  | 소수 행 갱신 충돌 방지    |
| **UNIQUE/제약/원자연산**        | 애플리케이션 버그 차단   | 스키마 의존, 유연성↓              | 불변식은 **제약으로** 표현 |
| **2PC**                   | 전역 원자성         | 복잡/장애취약/락홀드               | 내부 단일 스토리지 계열    |
| **SAGA+Outbox**           | 탄력/장애내성, 독립 배포 | 보상 로직 필요(복잡)              | 서비스 간 업무 흐름      |

### Apply to Our Domain (주문/배차)

* **불변식 1: "동시 배차 ≤ 10건/지역"**

    * 옵션A: **Serializable** + 프레디킷/갭 락(성능 비용↑)
    * 옵션B: **카운터 테이블**에 `atomic increment` 후 임계 초과 시 롤백(권장)
    * 옵션C: **큐**(단일 워커)로 직렬화
* **불변식 2: 주문번호 유일** → DB **UNIQUE** + **Idempotency-Key** (재시도 안전)
* **Lost Update 방지**: 버전 칼럼으로 **CAS(낙관적 잠금)** 또는 `FOR UPDATE`
* **서비스 간 일관성**: OrderCreated → **Outbox/CDC**로 발행, 소비자는 **멱등 처리**
* **읽기-당장-쓰기(Read-your-writes)**: 사용자 세션은 **리더 라우팅/세션 스티키**

### Metrics & SLO (권장)

* `db.tx.abort_rate` (전체/사유별: deadlock, serialization, lock timeout)
* `db.lock_wait_ms.p95` / `db.row_version_conflicts`
* `api.idempotency.dedup_hits` (중복 차단 성공률)
* **SLO 예시(30일)**: `deadlock_rate < 0.1%`, `serialization_fail_rate < 0.5%`, `lock_wait_p95 < 50ms`

### Open Questions

* 어떤 경로에 **Serializable**을 적용/예외로 둘 것인가? (화이트리스트)
* 카운터 테이블 방식과 큐 직렬화의 **성능/가용성** 비교 실험 계획은?
* 멱등키 **보존 TTL**과 저장소(캐시/RDB) 선택은?
* 다중 리전에선 **세션 일관성**을 어떻게 보장할 것인가?(리더 고정/CRDT/지연 허용)

## Ch08 The Trouble with Distributed Systems

### TL;DR (3문장)
- 네트워크는 **손실,지연,중복,재정렬**이 모두 가능하다. 응답이 없다고 해서 미전달이 아님 → **타임아웃,재시도,멱등성**이 기본 전제.
- **시계**는 신뢰하기 어렵다(스큐,점프). 지연/타임아웃은 **monotonic clock**으로, 순서 판단은 **버전/시퀀스**로.
- 프로세스는 **GC,스톨**로 멈출 수 있고, FD(결함 감지기)는 **오탐/지연** 트레이드오프를 가진다. 정족수/리스/펜싱으로 리더십을 안전하게.

### Key Ideas
- **네트워크 현실**: 손실,중복,재정렬 + 큐잉 지연. → **멱등키/시퀀스/중복제거** 설계.
- **타임아웃 설계**: 홉별 예산분배 + `timeout ≈ 2d + r`(왕복/처리 시간 추정) + **모노토닉** 기준.
- **재시도 제어**: 지수 백오프 + 지터 + **Retry Budget(예: ≤5%)**로 증폭 방지. *멱등 작업만* 재시도.
- **Failure Detector(FD)**: 헬스체크/φ-accrual로 **의심 점수화**. 공격적(빠른 차단) ↔ 보수적(오탐↓) 조절.
- **헤지드 요청**: p95/p99에서 *조건부* 세컨드샷로 tail 레이턴시 절단(중복 안전 필수).
- **정족수(Quorum)**: N, R, W 선택으로 최신성↔가용성 조절. **W+R>N**이면 최신 쓰기와 교집합 보장.
- **리스/펜싱 토큰**: 리더/락 소유권을 시간,토큰으로 방어(클럭 스큐 고려).
- **Exactly-once 환상 깨기**: 현실은 at-least-once/at-most-once → **소비자 멱등,재처리**로 보정.
- **프로세스 스톨**: GC/Stop-the-world → **타임아웃/풀,큐 상한**으로 전파 억제, **관측성**으로 감지.

### Trade-offs
| 선택             | 장점               | 단점             | 언제           |
|----------------|------------------|----------------|--------------|
| **짧은 타임아웃**    | Fail-fast, 빠른 전환 | 오탐↑, 재시도 폭증    | 내부 저지연 링크    |
| **긴 타임아웃**     | 오탐↓              | 복구 느림, 자원 홀드   | 외부/불안정 네트워크  |
| **공격적 FD**     | 장애 격리 빠름         | False-suspect↑ | 핵심 경로 SLO 엄격 |
| **보수적 FD**     | 오탐↓              | 장애 인지 늦음       | 배치/비핵심       |
| **헤지 ON(조건부)** | tail 절단          | 부하↑, 중복처리 필요   | p99 문제가 클 때만 |
| **W,R 크게**     | 최신성/안전↑          | 지연/가용성↓        | 강한 정합 필요     |
| **단일 리더 + 리스** | 단순/일관성↑          | 리더 장애시 전환 비용   | 쓰기 주도 경로     |
| **멀티 리더**      | 가용성↑             | 충돌/병합 복잡       | 지리 분산/쓰기 분산  |

### Apply to Our Domain (Orders/Dispatch)
- **홉별 타임아웃/재시도 예산**
    - GW **100ms** (retry 0) → OrderSvc **350ms** (내부 호출 2×**100ms**) → DB **250ms** (retry 0)
    - **Retry Budget ≤ 5%**, 지수 백오프(100→200→400ms)+지터
- **멱등/중복제거**
    - `POST /orders`: `Idempotency-Key` 저장(24h TTL) → 중복 200/동일 바디
    - 이벤트 소비자: **키-데두프 스토어**+**시퀀스 번호**(재정렬 허용 창)
- **FD & 리더십**
    - φ-accrual FD, 임계 φ=8에서 격리; 리더는 **리스(> clock_skew_p99 + RTT)** + **펜싱 토큰**
    - 배차 카운터 저장소: **N=3, W=2, R=2** (Raft/Quorum)
- **Tail 컷(선택적)**
    - `/orders/{id}` p95>300ms이고 에러버짓 여유>50%일 때 **헤지 1회**(중복 안전 경로만)

### Metrics & SLO (30일 롤링 권장)
- `dep.timeout_rate < 0.2%` (의존성별)
- `dep.retry_rate ≤ 5%`  *(budget)*
- `hedged_share ≤ 2%`    *(헤지 발사 비율)*
- `fd.false_suspect_rate < 0.1%/h`
- `clock_skew_p99 < 200ms`, `gc_pause_p99 < 50ms`
- `quorum_write_p95_ms < 120ms`
- `api.idempotency.dedup_hits` 추이(↑일수록 재시도 흡수)

### Open Questions (실험 계획으로 전환)
- 현재 RTT/큐잉 분해 기준으로 **홉별 타임아웃**은 적정한가?
- **헤지 조건**을 어느 엔드포인트에, 어떤 임계(p95, 에러버짓)로 둘까?
- 리더 **리스 기간**을 얼마로? (`lease >> clock_skew_p99 + RTT`)
- **Retry Budget** 소진 시 정책(스로틀/셰딩/에러)과 알람 기준은?
- 이벤트 스트림의 **재정렬 허용 창**(seconds)과 **데두프 TTL**은?

## Ch09 Consistency and Consensus

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch10 Batch Processing

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch11 Stream Processing

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions

## Ch12 The Future of Data Systems

### TL;DR

### Key Ideas

### Trade-offs

### Apply our Domain

### SLI, SLO
#### SLI

#### SLO

### Open Questions