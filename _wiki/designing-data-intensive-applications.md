---
layout  : wiki
title   : Designing Data-Intensive Applications(데이터 중심 애플리케이션 설계)
summary :
date    : 2025-09-10 13:00:00 +0900
updated : 2026-02-24 13:00:00 +0900
tags    : architecture database
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Designing Data-Intensive Applications(데이터 중심 애플리케이션 설계)
- [Alexandria playground](https://github.com/currenjin/alexandria-playground/tree/main/book-designing-data-intensive-applications)

## 운영 보강 자료
- [DDIA 운영 플레이북](https://github.com/currenjin/alexandria-playground/blob/main/book-designing-data-intensive-applications/runbook.md)
- [DDIA 플레이북 리허설 가이드](https://github.com/currenjin/alexandria-playground/blob/main/book-designing-data-intensive-applications/runbook-drill.md)
- 월간 리허설 핵심: Replication Lag / Retry Storm / Stream Lag / CDC 중단

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

### TL;DR (3문장)
- 스토리지 엔진은 **로그 기반(LSM-Tree)** 과 **페이지 기반(B-Tree)** 로 나뉜다. 쓰기 많으면 LSM, 읽기 많으면 B-Tree가 유리.
- **인덱스**는 읽기를 빠르게 하지만 **쓰기 증폭(Write Amplification)** 비용이 든다. 모든 쿼리 패턴을 인덱스로 커버할 수 없다.
- OLTP(트랜잭션)와 OLAP(분석)은 접근 패턴이 다르다. 열 지향 저장소, 압축, 머터리얼라이즈드 뷰로 분석 성능을 높인다.

### Key Ideas
- **해시 인덱스**: 메모리에 키→오프셋 매핑. 단순하고 빠르나, 범위 쿼리 불가, 메모리 한계.
- **SSTable/LSM-Tree**: 정렬된 세그먼트 파일 + 메모리 멤테이블 → 병합(Compaction). 쓰기 처리량↑, 읽기 시 여러 파일 탐색.
- **B-Tree**: 페이지 단위 읽기/쓰기, 균형 트리. 읽기 예측 가능, WAL로 내구성. 쓰기 증폭(페이지 분할, WAL).
- **Write Amplification**: 한 번 쓰기가 디스크에 여러 번 쓰기로 증폭. LSM(컴팩션), B-Tree(페이지+WAL) 둘 다 존재.
- **Compaction 전략**: Size-tiered(쓰기 최적화) vs Leveled(읽기/공간 최적화). 백그라운드 I/O 경쟁 주의.
- **클러스터드 인덱스**: 데이터를 인덱스 순서로 저장. 범위 스캔↑, 삽입 비용↑.
- **커버링 인덱스**: 인덱스만으로 쿼리 응답(힙 접근 없음). 인덱스 크기↑.
- **OLAP/열 저장소**: 컬럼별 저장 + 압축(비트맵, Run-length). 집계 쿼리↑, 단건 조회↓.
- **머터리얼라이즈드 뷰/데이터 큐브**: 미리 집계 저장. 쿼리 빠름, 쓰기 시 갱신 비용.

### Trade-offs

| 선택 | 장점 | 단점 | 적용 시점 |
| :--- | :--- | :--- | :--- |
| **LSM-Tree** | 쓰기 처리량이 높고 순차 I/O에 유리 | 컴팩션 부하가 크고 읽기 시 다중 파일 탐색 필요 | 로그/이벤트처럼 쓰기 비중이 높은 경우 |
| **B-Tree** | 읽기 지연 예측이 쉽고 범위 쿼리에 유리 | 페이지 분할 및 WAL로 쓰기 증폭 발생 | 읽기 비중이 높은 OLTP 경로 |
| **해시 인덱스** | 키 조회가 빠름 (`O(1)`) | 범위 쿼리 불가, 메모리 의존도 높음 | 키-값 캐시, 세션 조회 |
| **클러스터드 인덱스** | 범위 스캔 지역성 향상 | 삽입/갱신 비용과 저장 공간 증가 | 시계열/로그 기반 범위 조회 |
| **커버링 인덱스** | 테이블 접근 없이 인덱스만으로 조회 가능 | 인덱스 크기 증가로 쓰기 비용 상승 | 조회 컬럼이 고정된 고빈도 쿼리 |
| **열 저장소** | 집계/대량 스캔 및 압축 효율이 높음 | 단건 조회/갱신 성능이 낮음 | OLAP, 리포트, 대시보드 |
| **Size-tiered 컴팩션** | 쓰기 증폭 완화 | 공간 증폭 및 읽기 탐색 비용 증가 | 쓰기 우선 워크로드 |
| **Leveled 컴팩션** | 읽기 성능과 공간 효율 우수 | 컴팩션으로 인한 쓰기 증폭 증가 | 읽기 우선 및 공간 제약 환경 |

### Apply to Our Domain (Orders/Dispatch)
- **주문 테이블(OLTP)**: B-Tree 기반 RDB. `(user_id, created_at DESC)` 클러스터드/커버링 인덱스로 최근 주문 목록 최적화.
- **이벤트 로그/감사**: LSM-Tree 기반 저장소(Cassandra, RocksDB). 시간순 쓰기 많음, 읽기는 드묾.
- **주문 분석(OLAP)**: 열 저장소(BigQuery, ClickHouse)로 일별/주별 집계. 실시간 대시보드는 머터리얼라이즈드 뷰.
- **nearbyBaseOrderId 탐색**: 키셋 페이징 + `(created_at DESC, id DESC)` 복합 인덱스. 커버링 인덱스로 힙 접근 최소화.
- **캐시 레이어**: Redis 해시 인덱스로 핫 키(주문 상세) O(1) 조회.

### Metrics & SLO (30일 롤링)
#### SLI
- `db.query.p95_ms`: 주요 쿼리 응답 시간
- `db.index_hit_rate`: 인덱스 히트율(인덱스 스캔 vs 풀 스캔)
- `db.write_amplification`: 논리 쓰기 대비 물리 쓰기 비율
- `compaction.pending_bytes`: 컴팩션 대기 데이터 크기
- `olap.query.p95_s`: 분석 쿼리 응답 시간

#### SLO
- `db.query.p95_ms < 100` (OLTP 핵심 경로)
- `db.index_hit_rate >= 98%`
- `compaction.pending_bytes < 1GB` (지연 경고)
- `olap.query.p95_s < 5` (대시보드 쿼리)

### Open Questions
- LSM-Tree 스토리지 도입 시 **컴팩션 스케줄**을 피크 시간 외로 제한할 수 있는가?
- 커버링 인덱스 추가로 인한 **쓰기 증폭**이 현재 쓰기 QPS에서 수용 가능한가?
- 분석 워크로드를 별도 열 저장소로 분리할 때 **ETL 지연**과 **데이터 신선도** 요구사항은?
- 해시 인덱스(Redis) 메모리 한계 도달 시 **eviction 정책**과 **캐시 miss 스파이크** 대응은?

## Ch04 Encoding and Evolution

### TL;DR (3문장)
- 데이터는 **메모리(객체)** 와 **저장/전송(바이트)** 사이를 오간다. 인코딩 포맷 선택이 **호환성, 크기, 성능**을 결정한다.
- **스키마 진화**는 필수다. 전방/후방 호환성을 지키려면 **필드 추가는 optional**, **필드 제거는 신중히**, **타입 변경은 금지**.
- 데이터 흐름(DB, 서비스, 메시지)마다 호환성 요구가 다르다. **롤링 배포**를 전제로 신/구 버전 공존을 설계한다.

### Key Ideas
- **인코딩 포맷 비교**
  - JSON/XML: 사람이 읽기 쉬움, 스키마 약함, 크기↑
  - Thrift/Protocol Buffers: 바이너리, 스키마 필수, 크기↓, 전/후방 호환 설계
  - Avro: 스키마 별도 전달, reader/writer 스키마 분리, 동적 스키마 친화
- **전방 호환(Forward)**: 구 코드가 신 데이터 읽기 → 알 수 없는 필드 무시
- **후방 호환(Backward)**: 신 코드가 구 데이터 읽기 → 새 필드에 기본값
- **스키마 진화 규칙**
  - 필드 추가: optional + 기본값
  - 필드 제거: 더 이상 쓰지 않는 태그 재사용 금지
  - 타입 변경: 대부분 위험(32→64 정도만 안전)
- **데이터 흐름 패턴**
  - DB: 쓰기 시점 스키마 저장, 읽기 시점 해석(schema-on-read 포함)
  - 서비스(REST/RPC): API 버저닝, 클라이언트/서버 독립 배포
  - 메시지(큐/이벤트): 생산자/소비자 버전 불일치 허용 설계
- **롤링 배포와 호환성**: 배포 중 신/구 버전 공존. 양방향 호환 필수.

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **JSON** | 범용, 디버그 쉬움, 스키마 유연 | 크기↑, 타입 모호, 스키마 강제 어려움 | 외부 API, 설정, 로그 |
| **Protocol Buffers** | 크기↓, 스키마 명시, 전/후방 호환 | 스키마 관리 필요, 사람 읽기 어려움 | 내부 서비스 통신, 저장 |
| **Avro** | 스키마 별도, 동적 타입 친화 | 스키마 레지스트리 필요 | 데이터 파이프라인, Kafka |
| **스키마리스(JSON 자유형)** | 빠른 개발, 유연 | 런타임 오류, 진화 관리 어려움 | 프로토타입, 내부 도구 |
| **API 버저닝(URL/헤더)** | 명시적, 클라이언트 선택 | 버전 관리 복잡, 중복 코드 | 외부 API, 장기 지원 |
| **호환성 우선 진화** | 무중단 배포, 롤백 안전 | 스키마 제약, 느린 정리 | 프로덕션 시스템 |

### Apply to Our Domain (Orders/Dispatch)
- **주문 이벤트(Kafka)**: Avro + Schema Registry. 생산자/소비자 독립 배포, 스키마 진화 검증 자동화.
- **내부 서비스 통신**: gRPC/Protocol Buffers. 필드 추가는 optional, 태그 번호 재사용 금지.
- **외부 API(REST)**: JSON + OpenAPI 스키마. 버전 헤더(`Accept-Version: v2`)로 호환성 관리.
- **DB 스키마 진화**: Expand-Migrate-Contract 패턴. nullable 추가 → 백필 → NOT NULL 전환.
- **롤링 배포 체크리스트**:
  1. 신 필드 추가(optional) 배포
  2. 신 코드 배포(신 필드 쓰기/읽기)
  3. 구 필드 읽기 제거 배포
  4. 구 필드 삭제(충분한 기간 후)

### Metrics & SLO (30일 롤링)
#### SLI
- `schema.compatibility.violations`: 스키마 호환성 검증 실패 수
- `api.version.usage`: API 버전별 호출 비율
- `serde.error_rate`: 직렬화/역직렬화 오류율
- `deploy.rollback_rate`: 스키마 관련 롤백 빈도

#### SLO
- `schema.compatibility.violations = 0` (CI/CD 게이트)
- `serde.error_rate < 0.01%`
- `api.deprecated_version.usage < 5%` (마이그레이션 진행 지표)

### Open Questions
- 스키마 레지스트리 장애 시 **폴백 전략**은? (로컬 캐시 TTL, 서킷브레이커)
- 신규 필드 추가 후 **구 버전 소비자 비율**이 일정 이하로 떨어지는 데 걸리는 시간은?
- **필드 삭제 안전 기간**을 어떻게 정의할 것인가? (마지막 읽기 로그 기준)
- gRPC **unknown field 처리** 정책(무시 vs 에러)을 서비스별로 어떻게 통일할 것인가?

## Ch05 Replication

### TL;DR (3문장)
- 복제는 **가용성, 지연 시간, 읽기 처리량**을 높이기 위함이다. 단일 리더, 다중 리더, 리더리스 중 선택.
- **동기 vs 비동기** 복제가 **일관성 vs 가용성** 트레이드오프를 결정한다. 동기는 강한 일관성, 비동기는 데이터 손실 가능.
- **복제 지연**으로 인한 이상(stale read, 인과 역전)을 이해하고, **Read-your-writes, 모노토닉 읽기** 등 보장 수준을 설계한다.

### Key Ideas
- **단일 리더(Leader-based)**
  - 쓰기는 리더만, 읽기는 리더/팔로워
  - 장애 시 팔로워 승격(failover). 데이터 손실/스플릿 브레인 위험
- **다중 리더(Multi-leader)**
  - 지리 분산, 오프라인 클라이언트에 유리
  - **쓰기 충돌** 처리 필요(LWW, 병합, CRDT)
- **리더리스(Leaderless)**
  - 정족수(Quorum) 기반. W+R>N으로 최신성 확보
  - **sloppy quorum/hinted handoff**로 가용성↑, 일관성↓
- **동기 복제**: 리더가 팔로워 확인 후 응답. 내구성↑, 지연↑, 가용성↓
- **비동기 복제**: 리더 즉시 응답. 지연↓, 데이터 손실 가능(failover 시)
- **복제 지연 이상**
  - **Read-your-writes**: 내가 쓴 것을 즉시 못 읽음
  - **모노토닉 읽기**: 과거로 회귀(시간 역전)
  - **인과 일관성**: 원인-결과 순서 역전
- **충돌 해결 전략**
  - LWW(Last Write Wins): 단순, 데이터 손실 가능
  - 병합(Union, Custom logic): 복잡
  - CRDT: 자동 병합 가능 자료구조

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **단일 리더** | 단순, 일관성 보장 쉬움 | 쓰기 병목, 리더 장애 시 전환 비용 | 대부분의 OLTP |
| **다중 리더** | 지리 분산, 오프라인 지원 | 충돌 해결 복잡, 일관성 보장 어려움 | 글로벌 서비스, 협업 앱 |
| **리더리스** | 가용성↑, 단일 장애점 없음 | 정족수 관리, 충돌 해결, 읽기 복잡 | 높은 가용성 요구, AP 시스템 |
| **동기 복제** | 강한 내구성, 데이터 손실 없음 | 지연↑, 팔로워 장애 시 쓰기 차단 | 금융, 결제 등 데이터 손실 불가 |
| **비동기 복제** | 지연↓, 가용성↑ | failover 시 데이터 손실 가능 | 대부분의 읽기 복제본 |
| **반동기(Semi-sync)** | 최소 1개 팔로워 보장 | 설정 복잡, 1개 장애까지만 안전 | 내구성과 가용성 균형 |
| **LWW 충돌 해결** | 단순, 예측 가능 | 데이터 손실(동시 쓰기) | 멱등 작업, 최종 상태만 중요 |
| **CRDT** | 자동 병합, 충돌 없음 | 지원 자료구조 제한, 복잡 | 실시간 협업, 카운터, 집합 |

### Apply to Our Domain (Orders/Dispatch)
- **주문 DB**: 단일 리더(MySQL/PostgreSQL) + 비동기 읽기 복제본. 읽기 분산, failover 자동화.
- **Read-your-writes 보장**: 쓰기 직후 조회는 리더 라우팅 또는 세션 스티키.
- **배차 카운터**: 정족수 기반(N=3, W=2, R=2) 또는 단일 리더 + 동기 복제 1개(반동기).
- **지리 분산(향후)**: 다중 리더 검토. 주문 생성은 LWW 불가 → CRDT 카운터 또는 중앙 조정자.
- **복제 지연 모니터링**: `replication_lag_ms` 추적, 임계치 초과 시 읽기 경로 리더 전환.

### Metrics & SLO (30일 롤링)
#### SLI
- `replication_lag_ms.p95`: 리더-팔로워 지연
- `failover.duration_ms`: 리더 장애 시 전환 시간
- `failover.data_loss_events`: failover 시 데이터 손실 발생 수
- `read_your_writes.violation_rate`: 쓰기 후 읽기 불일치 비율
- `conflict.resolution_rate`: 다중 리더 충돌 발생/해결 비율

#### SLO
- `replication_lag_ms.p95 < 1000`
- `failover.duration_ms < 30000`
- `failover.data_loss_events = 0` (동기/반동기 경로)
- `read_your_writes.violation_rate < 0.1%`

### Open Questions
- 현재 복제 지연이 **Read-your-writes 위반**을 얼마나 유발하는가? (측정 필요)
- failover 자동화 시 **스플릿 브레인** 방지 메커니즘(펜싱, STONITH)은 충분한가?
- 다중 리전 확장 시 **다중 리더 vs 리더리스** 중 어떤 모델이 주문 도메인에 적합한가?
- 비동기 복제에서 **데이터 손실 허용 범위**(RPO)는 어떻게 정의할 것인가?

### Hands-on
#### 실험 목표
- 비동기 복제에서 발생하는 stale read를 재현하고 완화 전략(리더 라우팅)의 효과를 비교한다.

#### 준비
- 리더 1, 팔로워 1 이상인 로컬/스테이징 DB
- 읽기 트래픽을 리더/팔로워로 분리할 수 있는 라우팅 설정

#### 실행 단계
1. 동일 사용자에 대해 `write -> immediate read`를 1,000회 반복한다.
2. 읽기 대상을 팔로워로 고정해 위반율(`read-your-writes`)을 측정한다.
3. 동일 테스트를 "쓰기 후 3초 리더 라우팅" 정책으로 재실행한다.
4. failover를 1회 유도하고 손실 이벤트/전환 시간을 기록한다.

#### 검증 메트릭
- `read_your_writes.violation_rate`
- `replication_lag_ms.p95`
- `failover.duration_ms`

#### 실패 시 체크포인트
- 팔로워 지연이 급증하면 읽기 경로를 즉시 리더로 전환
- failover 이후 이중 리더 징후(동시 쓰기 허용) 로그 확인

## Ch06 Partitioning

### TL;DR (3문장)
- 파티셔닝(샤딩)은 **데이터를 여러 노드에 분산**하여 처리량과 저장 용량을 확장한다. 핫스팟을 피하는 것이 핵심.
- **키 범위 파티셔닝**은 범위 쿼리에 유리하고, **해시 파티셔닝**은 균등 분산에 유리하다. 복합 키로 둘을 조합할 수 있다.
- **리밸런싱**은 불가피하다. 고정 파티션 수 또는 동적 분할 전략을 선택하고, 무중단 마이그레이션을 설계한다.

### Key Ideas
- **파티션 키 선택**
  - 키 범위(Range): 정렬/범위 쿼리↑, 핫스팟 위험(시간순 데이터 등)
  - 해시(Hash): 균등 분산, 범위 쿼리 불가
  - 복합 키: `(user_id, timestamp)` → user_id로 파티션, timestamp로 정렬
- **핫스팟 완화**
  - 핫 키에 랜덤 접두사/접미사 추가(fan-out)
  - 애플리케이션 레벨 분산(유명인 문제)
- **보조 인덱스와 파티셔닝**
  - 로컬 인덱스(문서 기준): 쓰기 빠름, 읽기 시 scatter-gather
  - 글로벌 인덱스(용어 기준): 읽기 빠름, 쓰기 시 분산 트랜잭션/비동기 갱신
- **리밸런싱 전략**
  - 고정 파티션 수: 노드 추가 시 파티션 재할당만
  - 동적 분할: 파티션 크기 기준 분할/병합
  - 노드 비례: 노드당 고정 파티션 수
- **라우팅(쿼리 라우팅)**
  - 클라이언트 직접 라우팅
  - 라우팅 티어(프록시)
  - 코디네이터(ZooKeeper, etcd)로 메타데이터 관리

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **키 범위 파티셔닝** | 범위 쿼리 효율↑, 지역성↑ | 핫스팟 위험(시계열 등) | 범위 스캔 주도 워크로드 |
| **해시 파티셔닝** | 균등 분산, 핫스팟↓ | 범위 쿼리 불가(scatter-gather) | 균등 분산 필요, 점 쿼리 주도 |
| **복합 키** | 범위+분산 균형 | 키 설계 복잡 | user별 시계열 등 |
| **로컬 인덱스** | 쓰기 빠름, 단순 | 읽기 scatter-gather | 쓰기 많은 워크로드 |
| **글로벌 인덱스** | 읽기 빠름 | 쓰기 복잡/비동기 지연 | 읽기 많은 워크로드 |
| **고정 파티션 수** | 리밸런싱 단순 | 초기 설정 중요, 유연성↓ | 예측 가능한 성장 |
| **동적 분할** | 자동 확장, 유연 | 분할/병합 오버헤드 | 예측 어려운 성장 |

### Apply to Our Domain (Orders/Dispatch)
- **주문 테이블 파티셔닝**
  - 파티션 키: `user_id` (해시) → 사용자별 균등 분산
  - 복합 키: `(user_id, created_at)` → 사용자별 시간순 정렬/범위 쿼리
- **핫스팟 대응**: 대량 주문 사용자(B2B) 키에 샤드 힌트 접미사 추가 검토
- **보조 인덱스**: `status` 인덱스는 로컬(문서 기준). 상태별 조회 시 scatter-gather 허용.
- **nearbyBaseOrderId**: 키셋 페이징 + 파티션 내 정렬. 파티션 키 포함 쿼리로 단일 파티션 접근.
- **리밸런싱**: 고정 파티션 수(초기 충분히 크게, 예: 256) + 노드 추가 시 재할당.
- **라우팅**: 애플리케이션 레벨 consistent hashing 또는 프록시(Vitess, ProxySQL).

### Metrics & SLO (30일 롤링)
#### SLI
- `partition.size_skew`: 파티션 간 크기 편차(max/avg)
- `partition.qps_skew`: 파티션 간 QPS 편차
- `scatter_gather.query_rate`: scatter-gather 쿼리 비율
- `rebalance.duration_ms`: 리밸런싱 소요 시간
- `rebalance.data_moved_gb`: 리밸런싱 시 이동 데이터량

#### SLO
- `partition.size_skew < 2x` (최대 파티션이 평균의 2배 이하)
- `partition.qps_skew < 3x`
- `scatter_gather.query_rate < 10%` (대부분 단일 파티션 접근)
- `rebalance.duration_ms < 3600000` (1시간 이내)

### Open Questions
- 현재 주문 데이터의 **핫스팟 키**(대량 주문 사용자)가 존재하는가? 분포 분석 필요.
- 파티션 수를 **초기 몇 개**로 설정할 것인가? (향후 5년 성장 예측 기반)
- `status` 인덱스 scatter-gather가 **p95 지연**에 미치는 영향은?
- 리밸런싱 중 **쓰기 차단 없이** 마이그레이션 가능한 전략은? (이중 쓰기, 백그라운드 복사)

### Hands-on
#### 실험 목표
- 파티션 키 선택에 따른 분산 품질(QPS skew, hot partition)을 정량 비교한다.

#### 준비
- 테스트 데이터(최소 100만 건)와 트래픽 재생 스크립트
- 후보 키 2종(예: `user_id`, `region+time_bucket`)

#### 실행 단계
1. 후보 키 A로 적재 후 파티션별 QPS/크기 편차를 측정한다.
2. 핫 키 시나리오(상위 1% 사용자 트래픽 집중)를 주입한다.
3. 후보 키 B 또는 랜덤 접미사 전략을 적용해 동일 부하를 재실행한다.
4. 리밸런싱 1회를 수행해 이동 데이터량과 지연 변화를 측정한다.

#### 검증 메트릭
- `partition.qps_skew`
- `partition.size_skew`
- `rebalance.data_moved_gb`
- `scatter_gather.query_rate`

#### 실패 시 체크포인트
- 특정 파티션 CPU 80%+ 지속 시 핫 키 분산 전략 즉시 적용
- 리밸런싱 중 p95 지연 급증 시 이동 스로틀 다운

## Ch07 Transaction
### TL;DR (3문장)

- 트랜잭션은 동시성에서 **불변식(invariant)** 을 지키기 위한 도구다. 격리 수준 선택이 **허용/차단**할 이상(anomaly)을 결정한다.
- **Snapshot Isolation(RR)** 은 dirty/non-repeatable/read skew는 막지만 **write skew/phantom**은 막지 못한다. **Serializable**이 가장 안전하나 비용↑.
- 서비스 간에는 2PC보다 **SAGA + Outbox + 멱등성**으로 일관성을 설계하고, **재시도/백오프/서킷**을 전제한다.

### Key Ideas

- **ACID 재정의(실무 관점)**: A(원자성)·I(격리)·D(내구성)는 스토리지+CC로 보장, **C(일관성)**은 애플리케이션 불변식으로 정의해야 함.
- **격리 수준과 이상**
  - RC(Read Committed): dirty read x, 그 외 대부분 허용
  - RR/SI(Repeatable Read / Snapshot Isolation): dirty/non-repeat/read skew x, **write skew o**, phantom (DB 의존)
  - Serializable: 주요 이상 전부 x (가장 안전)
- **주요 이상**
  - **Dirty Read**: 커밋 전 데이터 읽음
  - **Non-repeatable Read**: 같은 행 재조회 값 변동
  - **Read Skew**: 서로 다른 행/테이블 사이 시간 왜곡
  - **Write Skew**: 두 트랜잭션이 각각 검사-쓰기로 **불변식 위반**
  - **Lost Update**: 동시 갱신 중 덮어쓰기
  - **Phantom**: 조건에 맞는 행 집합이 동시성으로 바뀜
- **동시성 제어(요약)**
  - **2PL(락 기반)**: 행/범위(갭/프레디킷) 락으로 직렬화 보장, 교착/대기↑
  - **MVCC + SI**: 스냅샷 읽기(락 적음), 대신 **write-write 충돌/쓰기 스큐** 가능
  - **SSI(Serializable SI)**: SI 위에 충돌 검사로 직렬화 보장(충돌 시 abort)
  - **명시적 원자 연산/제약**: `UPSERT/UNIQUE/FOREIGN KEY`, `SELECT ... FOR UPDATE`
- **분산 트랜잭션**
  - 2PC는 블로킹/파티션 장애에 취약. 실무에선 **SAGA(보상 트랜잭션)** + **Outbox/CDC** + **소비자 멱등성**을 조합
- **패턴**
  - 검사-후-쓰기(Check-then-write)는 SI에서 위험 → **원자적 카운터/제약/락/큐**로 대체
  - 장시간 트랜잭션은 핫락/재시도 폭증 유발 → **작게 쪼개기/오프로드**

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

- **불변식 1: "동시 배차 ≤ 10건/지역"**
  - 옵션A: **Serializable** + 프레디킷/갭 락(성능 비용↑)
  - 옵션B: **카운터 테이블**에 `atomic increment` 후 임계 초과 시 롤백(권장)
  - 옵션C: **큐**(단일 워커)로 직렬화
- **불변식 2: 주문번호 유일** → DB **UNIQUE** + **Idempotency-Key** (재시도 안전)
- **Lost Update 방지**: 버전 칼럼으로 **CAS(낙관적 잠금)** 또는 `FOR UPDATE`
- **서비스 간 일관성**: OrderCreated → **Outbox/CDC**로 발행, 소비자는 **멱등 처리**
- **읽기-당장-쓰기(Read-your-writes)**: 사용자 세션은 **리더 라우팅/세션 스티키**

### Metrics & SLO (권장)

- `db.tx.abort_rate` (전체/사유별: deadlock, serialization, lock timeout)
- `db.lock_wait_ms.p95` / `db.row_version_conflicts`
- `api.idempotency.dedup_hits` (중복 차단 성공률)
- **SLO 예시(30일)**: `deadlock_rate < 0.1%`, `serialization_fail_rate < 0.5%`, `lock_wait_p95 < 50ms`

### Open Questions

- 어떤 경로에 **Serializable**을 적용/예외로 둘 것인가? (화이트리스트)
- 카운터 테이블 방식과 큐 직렬화의 **성능/가용성** 비교 실험 계획은?
- 멱등키 **보존 TTL**과 저장소(캐시/RDB) 선택은?
- 다중 리전에선 **세션 일관성**을 어떻게 보장할 것인가?(리더 고정/CRDT/지연 허용)

### Hands-on
#### 실험 목표
- `write skew`를 재현하고 방지 전략(Serializable, 원자 카운터)의 비용 차이를 측정한다.

#### 준비
- 동시성 테스트 스크립트(동일 불변식에 동시 요청)
- 격리 수준 변경 가능한 DB 환경

#### 실행 단계
1. RR/SI에서 동일 불변식 경로에 동시 요청을 500회 주입한다.
2. 위반 케이스(예: 동시 배차 제한 초과) 발생률을 측정한다.
3. 같은 시나리오를 Serializable로 재실행한다.
4. 마지막으로 카운터 테이블 원자 증가 방식으로 재실행한다.

#### 검증 메트릭
- `invariant.violation_rate`
- `db.tx.abort_rate`
- `db.lock_wait_ms.p95`
- `api.latency_ms.p95`

#### 실패 시 체크포인트
- 교착 급증 시 트랜잭션 범위/락 순서 재검토
- abort율이 SLO 초과면 Serializable 적용 범위를 축소해 핵심 경로만 보호

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

### Hands-on
#### 실험 목표
- 재시도 정책이 장애 증폭을 일으키는지 검증하고 Retry Budget의 효과를 확인한다.

#### 준비
- 의존 서비스에 인위적 지연/오류를 주입할 수 있는 테스트 환경
- 재시도 정책 토글(고정 간격 vs 백오프+지터+budget)

#### 실행 단계
1. 의존 서비스에 5xx 20%, 지연 300ms를 10분간 주입한다.
2. 고정 간격 재시도로 요청 성공률/타임아웃/부하를 측정한다.
3. 백오프+지터+Retry Budget(5%)로 동일 테스트를 반복한다.
4. 선택 경로에서 조건부 헤지 1회를 적용해 p99 변화를 기록한다.

#### 검증 메트릭
- `dep.retry_rate`
- `dep.timeout_rate`
- `upstream.qps`
- `api.latency_ms.p99`

#### 실패 시 체크포인트
- retry_rate 급증 시 즉시 circuit open 및 재시도 차단
- 헤지 비율이 과도하면 발사 조건(p95 임계) 상향

## Ch09 Consistency and Consensus

### TL;DR (3문장)
- **일관성 모델**은 시스템이 보장하는 약속이다. 선형성(Linearizability)은 가장 강하지만 가용성/지연 비용이 크다.
- **합의(Consensus)** 는 분산 시스템에서 노드들이 하나의 값에 동의하는 문제다. 리더 선출, 원자적 커밋의 기반.
- FLP 불가능성으로 비동기 시스템에서 완벽한 합의는 불가능. **타임아웃과 리더 기반 프로토콜(Raft, Paxos)**로 실용적 해결.

### Key Ideas
- **일관성 모델 스펙트럼**
  - **선형성(Linearizability)**: 모든 연산이 단일 복사본처럼 동작. 최신 쓰기 보장.
  - **순차 일관성(Sequential)**: 전역 순서 존재, 실시간 순서는 보장 안 함.
  - **인과 일관성(Causal)**: 인과 관계만 보존. 동시 쓰기는 순서 미정.
  - **최종 일관성(Eventual)**: 결국엔 수렴. 중간 상태 비일관 허용.
- **선형성 비용**: CAP 정리. 네트워크 파티션 시 선형성↔가용성 택일.
- **인과 일관성과 전체 순서**
  - 인과 순서는 부분 순서(partial order)
  - 전체 순서(total order)는 선형성 또는 합의로 달성
- **Lamport 타임스탬프**: 인과 순서 추적. 전체 순서 아님(동시 이벤트 구분 불가).
- **전체 순서 브로드캐스트**: 모든 노드가 같은 순서로 메시지 수신. 합의와 동등.
- **합의 알고리즘**
  - **2PC**: 코디네이터 장애 시 블로킹. 실용적이지만 취약.
  - **Paxos/Raft/Zab**: 리더 기반, 과반수 합의. 리더 장애 시 재선출.
  - **PBFT**: 비잔틴 장애 허용(악의적 노드). 복잡, 느림.
- **합의 활용**
  - 리더 선출, 원자적 커밋, 분산 락, 유일 ID 생성
  - ZooKeeper, etcd: 합의 기반 코디네이션 서비스

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **선형성** | 강한 보장, 추론 쉬움 | 지연↑, 파티션 시 불가용 | 분산 락, 유일 제약, 리더 선출 |
| **인과 일관성** | 가용성↑, 지연↓ | 동시 쓰기 순서 미정 | 협업 앱, 소셜 피드 |
| **최종 일관성** | 최대 가용성/성능 | 읽기 비일관, 충돌 해결 필요 | 캐시, 읽기 복제본, DNS |
| **2PC** | 단순, 명확한 원자성 | 코디네이터 SPOF, 블로킹 | 단일 데이터센터, 짧은 트랜잭션 |
| **Raft/Paxos** | 비블로킹, 고가용 | 복잡, 리더 재선출 지연 | 메타데이터, 설정, 분산 락 |
| **외부 코디네이터(ZK/etcd)** | 검증된 구현, 운영 도구 | 추가 인프라, 의존성 | 리더 선출, 서비스 디스커버리 |

### Apply to Our Domain (Orders/Dispatch)
- **분산 락(배차 동시성 제어)**
  - 선형성 필요: 동시에 같은 배차 슬롯 할당 방지
  - 구현: Redis Redlock(주의: 선형성 보장 약함) 또는 ZooKeeper/etcd 분산 락
  - 펜싱 토큰 필수: 락 획득 시 토큰 발급, 저장소에서 토큰 검증
- **리더 선출(배차 워커)**
  - etcd 리스(lease) 기반 리더 선출
  - 리더 장애 시 자동 재선출, 리스 만료 > 클럭 스큐
- **주문 번호 유일성**
  - 선형성 필요: DB UNIQUE 제약 또는 합의 기반 ID 생성기
  - Snowflake ID: 타임스탬프+노드ID+시퀀스(선형성 아님, 유일성만 보장)
- **이벤트 순서(Kafka)**
  - 파티션 내 전체 순서 보장(선형성 아님)
  - 인과 일관성: 같은 파티션 키로 인과 관계 메시지 라우팅

### Metrics & SLO (30일 롤링)
#### SLI
- `lock.acquire_time_ms.p95`: 분산 락 획득 시간
- `lock.contention_rate`: 락 경합 비율
- `consensus.leader_election_ms`: 리더 재선출 시간
- `consensus.commit_latency_ms.p95`: 합의 커밋 지연
- `linearizable_op.availability`: 선형성 연산 가용률

#### SLO
- `lock.acquire_time_ms.p95 < 100`
- `consensus.leader_election_ms < 5000`
- `consensus.commit_latency_ms.p95 < 50`
- `linearizable_op.availability >= 99.9%`

### Open Questions
- 현재 Redis 기반 락이 **선형성을 충분히 보장**하는가? (클럭 스큐, 네트워크 파티션 시나리오)
- ZooKeeper/etcd 도입 시 **운영 복잡도**와 **가용성 향상** 트레이드오프는?
- 배차 불변식("동시 배차 ≤ N")을 **합의 기반**으로 보장할 때 지연 영향은?
- 이벤트 순서가 **인과 일관성**으로 충분한가, **전체 순서**가 필요한 경로는?

### Hands-on
#### 실험 목표
- 분산 락에서 펜싱 토큰 유무에 따른 안전성 차이를 재현한다.

#### 준비
- 락 서비스(etcd/ZooKeeper 또는 테스트 구현)
- 동일 자원 쓰기 경쟁 워커 2개 이상

#### 실행 단계
1. 펜싱 토큰 없이 리스 기반 락으로 동시 쓰기 시나리오를 실행한다.
2. 워커 하나에 인위적 stop-the-world 지연을 주입한다.
3. 지연 복귀 워커의 늦은 쓰기 덮어쓰기 여부를 확인한다.
4. 펜싱 토큰 검증을 추가하고 동일 테스트를 반복한다.

#### 검증 메트릭
- `stale_leader_write.count`
- `lock.acquire_time_ms.p95`
- `consensus.leader_election_ms`

#### 실패 시 체크포인트
- stale write 1건이라도 발생하면 락 구현을 즉시 차단/교체
- 리더 선출 지연이 길면 quorum/네트워크 설정 점검

## Ch10 Batch Processing

### TL;DR (3문장)
- 배치 처리는 **대량 데이터를 한 번에** 처리한다. 입력 불변, 출력 재생성 가능 → 멱등성/재시도 용이.
- **MapReduce**는 분산 배치의 기본 모델. Map(추출/변환) → Shuffle(그룹핑) → Reduce(집계).
- 현대 배치 엔진(Spark, Flink Batch)은 **DAG 실행, 메모리 캐싱**으로 MapReduce 한계 극복.

### Key Ideas
- **Unix 철학과 배치**
  - 단일 목적 도구, 파이프라인 조합
  - 입력/출력 불변 → 디버깅, 재실행 용이
- **MapReduce 모델**
  - Map: 입력 레코드 → (key, value) 쌍 방출
  - Shuffle: 같은 키를 같은 Reducer로 파티셔닝
  - Reduce: 키별 값 집계
- **분산 파일 시스템(HDFS)**
  - 데이터 지역성: 연산을 데이터가 있는 노드로 이동
  - 복제로 내결함성
- **조인 전략**
  - Sort-Merge Join: 큰 데이터셋 간 조인
  - Broadcast Join: 작은 테이블을 모든 노드에 복제
  - Partitioned Join: 같은 키로 파티셔닝된 데이터 간 조인
- **MapReduce 한계**
  - 중간 결과를 디스크에 기록(I/O 오버헤드)
  - 반복 연산에 비효율(ML 등)
- **현대 배치 엔진(Spark, Flink)**
  - DAG 기반 실행 계획
  - 메모리 캐싱(RDD, Dataset)
  - 지연 실행, 최적화
- **출력 무결성**
  - 배치 출력은 원자적(성공 또는 전체 실패)
  - 재시도 시 동일 출력 보장(멱등)

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **MapReduce** | 단순, 내결함성↑, 대용량 | 느림(디스크 I/O), 반복 비효율 | 레거시, 단순 ETL |
| **Spark** | 메모리 캐싱, 빠른 반복 | 메모리 요구↑, 복잡 | ML, 반복 처리, 대화형 분석 |
| **Sort-Merge Join** | 대용량 조인 가능 | 정렬 비용, I/O↑ | 큰 테이블 간 조인 |
| **Broadcast Join** | 작은 테이블 조인 빠름 | 메모리 한계, 네트워크↑ | 차원 테이블 조인 |
| **일일 배치** | 단순, 예측 가능 | 지연↑(최대 24시간) | 리포트, 정산 |
| **마이크로 배치** | 지연↓(분 단위) | 오버헤드↑, 복잡 | 준실시간 대시보드 |

### Apply to Our Domain (Orders/Dispatch)
- **일일 정산 배치**
  - 입력: 주문 이벤트 로그(HDFS/S3)
  - 처리: Spark로 일별 매출, 수수료, 정산금 집계
  - 출력: 정산 테이블(Parquet) → 결제 시스템 연동
- **주문 분석 ETL**
  - 원천: OLTP DB CDC → Kafka → S3
  - 변환: Spark로 비정규화, 차원 테이블 조인
  - 적재: 열 저장소(BigQuery, Redshift)
- **재처리/백필**
  - 입력 불변 → 로직 수정 후 전체 재실행
  - 출력 버저닝: `output/v2/date=2024-01-01/`
- **조인 전략**
  - 주문 + 사용자: Broadcast Join(사용자 테이블 작음)
  - 주문 + 상품: Partitioned Join(둘 다 대용량)

### Metrics & SLO (30일 롤링)
#### SLI
- `batch.job.duration_min.p95`: 배치 작업 소요 시간
- `batch.job.success_rate`: 작업 성공률
- `batch.data.freshness_hours`: 출력 데이터 신선도(지연)
- `batch.reprocess.count`: 재처리 횟수

#### SLO
- `batch.job.duration_min.p95 < 60` (1시간 이내)
- `batch.job.success_rate >= 99%`
- `batch.data.freshness_hours < 6` (6시간 이내 반영)
- `batch.reprocess.count < 2/week`

### Open Questions
- 현재 배치 파이프라인의 **병목 단계**(I/O, 셔플, 조인)는 어디인가?
- **마이크로 배치**(Spark Structured Streaming)로 전환 시 지연 개선 폭은?
- 재처리 시 **멱등성 보장**을 위한 출력 경로/버저닝 전략은?
- 배치 실패 시 **알람 및 자동 재시도** 정책은?

### Hands-on
#### 실험 목표
- 조인 전략(Broadcast vs Partitioned)에 따른 처리 시간/비용 차이를 측정한다.

#### 준비
- 대용량 사실 테이블 + 소형/중형 차원 테이블
- 동일 로직을 두 조인 전략으로 실행 가능한 잡 정의

#### 실행 단계
1. Broadcast Join으로 배치를 실행해 소요시간/메모리 사용량을 기록한다.
2. Partitioned Join으로 동일 작업을 실행한다.
3. 입력량을 2배로 늘려 두 전략의 확장 추세를 비교한다.
4. 실패 레코드 주입 후 재실행 시 멱등 결과 여부를 확인한다.

#### 검증 메트릭
- `batch.job.duration_min`
- `batch.shuffle_bytes`
- `executor.memory_peak_mb`
- `batch.result.diff_count`

#### 실패 시 체크포인트
- OOM 발생 시 Broadcast 임계값 축소 또는 파티션 전략 전환
- diff_count > 0 이면 출력 경로 원자성/중복 제거 로직 점검

## Ch11 Stream Processing

### TL;DR (3문장)
- 스트림 처리는 **이벤트가 발생하는 즉시** 처리한다. 배치보다 낮은 지연, 무한 데이터셋 처리.
- **이벤트 시간 vs 처리 시간**을 구분해야 한다. 워터마크로 지연 이벤트 처리, 윈도우로 시간 범위 집계.
- **Exactly-once**는 어렵다. 멱등성 + 트랜잭션 + 체크포인트 조합으로 효과적 exactly-once 달성.

### Key Ideas
- **메시지 전달 보장**
  - At-most-once: 메시지 유실 가능
  - At-least-once: 중복 가능 → 소비자 멱등성 필요
  - Exactly-once: 시스템 레벨 보장 어려움 → 효과적 exactly-once
- **이벤트 시간 vs 처리 시간**
  - 이벤트 시간: 이벤트 발생 시점
  - 처리 시간: 시스템 수신 시점
  - 지연 이벤트: 이벤트 시간 < 처리 시간 - 허용 지연
- **윈도우(Window)**
  - Tumbling: 고정 크기, 겹침 없음
  - Sliding: 고정 크기, 겹침 있음
  - Session: 활동 기반, 가변 크기
- **워터마크(Watermark)**
  - "이 시점 이전 이벤트는 모두 도착" 추정
  - 지연 이벤트 허용 창(allowed lateness)
- **상태 관리**
  - 로컬 상태 + 체크포인트(Flink, Kafka Streams)
  - 외부 상태 저장소(Redis 등) → 네트워크 오버헤드
- **스트림-테이블 이중성**
  - 스트림: 변경 로그(changelog)
  - 테이블: 스트림의 최신 스냅샷
  - CDC(Change Data Capture)로 DB → 스트림
- **조인**
  - Stream-Stream: 윈도우 조인
  - Stream-Table: 테이블 룩업(enrichment)
  - Table-Table: 양쪽 변경 시 재계산

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **At-least-once** | 단순, 유실 없음 | 중복 처리 필요 | 대부분의 스트림 처리 |
| **Exactly-once(시스템)** | 중복 없음 | 성능↓, 복잡, 경계 조건 | 금융, 결제 |
| **이벤트 시간 처리** | 정확한 시간 기반 분석 | 지연 이벤트 처리 복잡 | 분석, 집계 |
| **처리 시간 처리** | 단순, 지연↓ | 재처리 결과 불일치 | 모니터링, 알람 |
| **Tumbling 윈도우** | 단순, 예측 가능 | 경계 이벤트 분할 | 시간별/일별 집계 |
| **Session 윈도우** | 사용자 행동 분석에 적합 | 상태 관리 복잡 | 사용자 세션 분석 |
| **로컬 상태** | 빠름, 네트워크↓ | 복구 시 재구축 필요 | 대부분의 상태 저장 |
| **외부 상태(Redis)** | 공유 가능, 영속 | 네트워크 지연↑ | 서비스 간 공유 상태 |

### Apply to Our Domain (Orders/Dispatch)
- **실시간 주문 집계**
  - Kafka → Flink/Kafka Streams
  - Tumbling 윈도우(1분)로 지역별 주문 수 집계
  - 대시보드 실시간 업데이트
- **배차 이벤트 처리**
  - At-least-once + 멱등 소비자(주문ID 기준 중복 제거)
  - 이벤트 시간 기준 처리(배차 요청 시점)
  - 지연 이벤트 허용 창: 5분
- **CDC 기반 읽기 모델 동기화**
  - DB CDC(Debezium) → Kafka → 읽기 모델 갱신
  - Stream-Table 조인: 주문 이벤트 + 사용자 테이블 enrichment
- **알람/이상 탐지**
  - Sliding 윈도우(5분, 1분 슬라이드)로 에러율 계산
  - 임계치 초과 시 알람 발행

### Metrics & SLO (30일 롤링)
#### SLI
- `stream.lag_ms.p95`: 소비자 지연(처리 시간 - 이벤트 시간)
- `stream.throughput_eps`: 초당 이벤트 처리량
- `stream.duplicate_rate`: 중복 이벤트 비율
- `stream.late_event_rate`: 지연 이벤트(워터마크 이후) 비율
- `checkpoint.duration_ms.p95`: 체크포인트 소요 시간

#### SLO
- `stream.lag_ms.p95 < 5000` (5초 이내)
- `stream.duplicate_rate < 0.1%` (멱등 처리 후)
- `stream.late_event_rate < 1%`
- `checkpoint.duration_ms.p95 < 10000`

### Open Questions
- 현재 **소비자 지연**의 주요 원인은? (처리 병목, 파티션 불균형, 외부 호출)
- **워터마크 전략**을 어떻게 설정할 것인가? (주기적 vs 이벤트 기반)
- **지연 이벤트 허용 창**을 넘는 이벤트는 어떻게 처리할 것인가? (버림, 사이드 출력)
- Stream-Table 조인 시 **테이블 동기화 지연**이 결과에 미치는 영향은?

### Hands-on
#### 실험 목표
- 워터마크/allowed lateness 설정이 지연 이벤트 정확도와 지연 시간에 미치는 영향을 비교한다.

#### 준비
- 이벤트 시간 포함 테스트 스트림
- 지연 이벤트 주입 도구(1분, 5분, 10분 지연)

#### 실행 단계
1. 워터마크 보수적 설정으로 30분 스트림 집계를 실행한다.
2. late event 비율과 집계 보정 횟수를 기록한다.
3. 워터마크 공격적 설정으로 동일 테스트를 반복한다.
4. 지연 허용 창을 5분/10분으로 바꿔 정확도-지연 트레이드오프를 비교한다.

#### 검증 메트릭
- `stream.late_event_rate`
- `stream.lag_ms.p95`
- `window.recompute.count`
- `stream.output.diff_rate`

#### 실패 시 체크포인트
- lag 급증 시 상태 크기/체크포인트 주기 조정
- diff_rate가 높으면 워터마크를 보수적으로 되돌림

## Ch12 The Future of Data Systems

### TL;DR (3문장)
- 미래 데이터 시스템은 **여러 저장소/처리 엔진을 조합**한다. 단일 만능 솔루션은 없다.
- **데이터 통합**은 CDC, 이벤트 로그, 파생 데이터로 이루어진다. 진실의 원천(Source of Truth)을 명확히.
- **정확성(Correctness)** 은 결국 end-to-end로 보장해야 한다. 멱등성, 제약, 감사로 불변식 지킨다.

### Key Ideas
- **데이터 통합 패턴**
  - CDC(Change Data Capture): DB 변경 → 이벤트 스트림
  - 이벤트 소싱: 상태 변경을 이벤트 시퀀스로 저장
  - 파생 데이터: 원천에서 읽기 최적화 뷰 생성
- **Unbundling the Database**
  - 전통 DB: 저장, 인덱싱, 쿼리, 트랜잭션 통합
  - 현대: 각 기능을 별도 시스템으로 분리 조합
  - 예: Kafka(로그) + Elasticsearch(검색) + Redis(캐시)
- **Lambda vs Kappa 아키텍처**
  - Lambda: 배치 + 스트림 이중 경로
  - Kappa: 스트림만(재처리는 리플레이)
- **End-to-End 정확성**
  - 시스템 경계에서 정확성 깨짐 가능
  - 클라이언트 → 서버 → DB → 이벤트 전체 경로 보장 필요
- **멱등성의 중요성**
  - 네트워크 불확실성 → 재시도 필연
  - 모든 쓰기 연산 멱등하게 설계
- **불변식 검증**
  - 제약(Constraint)으로 불변식 명시
  - 비동기 감사(Audit)로 사후 검증
- **신뢰와 검증**
  - 외부 입력 신뢰하지 않음
  - 모든 경계에서 검증
- **윤리와 개인정보**
  - 데이터 수집/사용의 윤리적 고려
  - 최소 수집, 목적 제한, 삭제 권리

### Trade-offs

| 선택 | 장점 | 단점 | 언제 |
|---|---|---|---|
| **단일 통합 DB** | 단순, 트랜잭션↑ | 확장 한계, 유연성↓ | 소규모, 단순 도메인 |
| **다중 저장소 조합** | 유연, 각 요구 최적화 | 일관성 관리 복잡 | 대규모, 다양한 접근 패턴 |
| **이벤트 소싱** | 감사↑, 시간여행, 디버깅 | 복잡, 쿼리 어려움 | 감사 필수, 이력 중요 |
| **CDC 기반 통합** | 기존 DB 유지, 점진 도입 | CDC 지연, 스키마 결합 | 레거시 현대화 |
| **Lambda 아키텍처** | 정확성(배치) + 저지연(스트림) | 이중 유지, 복잡 | 정확성과 지연 둘 다 중요 |
| **Kappa 아키텍처** | 단일 경로, 단순 | 재처리 비용, 스트림 한계 | 스트림만으로 충분한 경우 |
| **동기 제약 검증** | 즉시 차단 | 지연↑, 가용성↓ | 핵심 불변식 |
| **비동기 감사** | 가용성↑ | 사후 발견, 보상 필요 | 느슨한 정합 허용 |

### Apply to Our Domain (Orders/Dispatch)
- **데이터 통합 아키텍처**
  - 원천: 주문 DB(PostgreSQL)
  - CDC: Debezium → Kafka
  - 파생: Elasticsearch(검색), Redis(캐시), BigQuery(분석)
- **이벤트 소싱 검토**
  - 주문 상태 변경을 이벤트로 저장
  - 현재 상태 = 이벤트 시퀀스 리플레이
  - 감사 로그 자동화, 상태 복원 가능
- **End-to-End 멱등성**
  - 클라이언트: Idempotency-Key 헤더
  - 서버: 키 저장(24h TTL), 중복 요청 동일 응답
  - 이벤트: 소비자별 처리 기록(exactly-once 효과)
- **불변식 검증**
  - 동기: DB UNIQUE, CHECK 제약
  - 비동기: 일일 감사 배치(잔액 불일치, 중복 배차 등)
- **Kappa 아키텍처 적용**
  - 스트림 처리로 읽기 모델 갱신
  - 재처리 = Kafka 리플레이(오프셋 리셋)

### Metrics & SLO (30일 롤링)
#### SLI
- `cdc.lag_ms.p95`: CDC 지연
- `derived.freshness_ms.p95`: 파생 데이터 신선도
- `audit.violation_count`: 감사에서 발견된 불변식 위반 수
- `idempotency.dedup_rate`: 멱등키 중복 차단 비율
- `e2e.consistency_check.pass_rate`: End-to-End 일관성 검증 통과율

#### SLO
- `cdc.lag_ms.p95 < 5000`
- `derived.freshness_ms.p95 < 10000`
- `audit.violation_count = 0` (목표)
- `e2e.consistency_check.pass_rate >= 99.99%`

### Open Questions
- **이벤트 소싱** 전면 도입 시 쿼리 복잡도와 성능 영향은?
- CDC 장애 시 **파생 데이터 정합성** 복구 전략은?
- **Lambda vs Kappa** 중 우리 도메인에 더 적합한 아키텍처는?
- End-to-End **멱등성 보장 범위**를 어디까지 확장할 것인가? (외부 결제, 알림 등)
- 데이터 삭제 요청(GDPR 등) 시 **이벤트 로그 처리** 전략은?

### Hands-on
#### 실험 목표
- CDC 기반 파생 데이터 파이프라인의 End-to-End 정확성과 신선도를 검증한다.

#### 준비
- 원천 DB + CDC 커넥터 + 메시지 브로커 + 파생 저장소 1종
- 샘플 불변식(예: 주문 상태 전이 규칙, 중복 주문 금지)

#### 실행 단계
1. 원천 DB에 주문 생성/취소/변경 이벤트를 순차 주입한다.
2. 파생 저장소 반영 지연(`freshness`)을 측정한다.
3. 동일 이벤트를 중복 재전송해 멱등 처리 여부를 확인한다.
4. 일괄 감사 배치로 원천-파생 불일치 건수를 집계한다.

#### 검증 메트릭
- `cdc.lag_ms.p95`
- `derived.freshness_ms.p95`
- `idempotency.dedup_rate`
- `audit.violation_count`

#### 실패 시 체크포인트
- 불일치 발생 시 재처리(runbook)로 복구 가능 여부 우선 검증
- CDC 중단 시 재시작 오프셋/스냅샷 전략 점검
