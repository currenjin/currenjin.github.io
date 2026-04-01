---
layout  : wiki
title   : Optimizer와 쿼리 실행계획 (MySQL 기준)
summary : RDBMS 공통 개념을 바탕으로 MySQL EXPLAIN/EXPLAIN ANALYZE 읽는 법 정리
date    : 2026-03-27 15:20:33 +0900
updated : 2026-03-27 15:27:00 +0900
tags    : [database, sql]
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# Optimizer와 쿼리 실행계획 (MySQL 기준)

이 문서는 **MySQL 기준**으로 설명한다.
다만 핵심 개념(옵티마이저, 카디널리티, 조인 순서, 접근 방식)은 PostgreSQL/Oracle/SQL Server 등 **대부분 RDBMS에 공통**으로 통용된다.

---

## 1) Optimizer는 무엇을 하는가

SQL은 "무엇을 원하는지"를 선언하는 언어다.
실제 "어떻게 읽을지"(인덱스 사용 여부, 조인 순서, 정렬 방식)는 Optimizer가 결정한다.

Optimizer가 고르는 대표 선택:

- 어떤 테이블부터 읽을지 (join order)
- 어떤 접근 방식을 쓸지 (index scan / range / full scan)
- 정렬/그룹 연산을 메모리/임시테이블 중 어떻게 처리할지
- where 조건을 어느 시점에 적용할지

핵심 포인트:

- SQL 문장 자체보다 **데이터 분포(통계), 인덱스 구조, 조건 선택도**가 성능을 크게 좌우한다.

---

## 2) RDBMS 공통 원리 (MySQL 외에도 유효)

### 2-1. Cost 기반 선택

대부분의 RDBMS Optimizer는 "예상 비용(cost)"이 가장 낮은 실행 계획을 선택한다.

비용 판단 요소 예시:

- 읽어야 하는 row 수
- 랜덤 I/O vs 순차 I/O
- 정렬/해시/임시공간 사용량
- 조인 시 중간 결과 크기

### 2-2. 카디널리티(Cardinality)

조건이 얼마나 데이터를 줄이는지(선택도) 판단이 중요하다.

- 선택도가 높다: 결과가 많이 줄어듦 → 인덱스 효율 높음
- 선택도가 낮다: 결과가 거의 안 줄어듦 → 풀스캔이 더 유리할 수도 있음

### 2-3. 조인 순서

보통 더 적은 row를 만드는 경로를 먼저 읽는 편이 유리하다.
조인 순서가 바뀌면 성능이 크게 달라진다.

---

## 3) Optimizer가 실제로 계획을 고르는 과정 (MySQL)

아래는 MySQL이 쿼리를 처리할 때 내부적으로 거치는 흐름을 실무 관점으로 단순화한 것이다.

### 3-1. SQL 파싱/정규화

- SQL을 내부 트리(파스 트리) 형태로 변환
- 같은 의미의 표현을 내부적으로 정리

예:

- `WHERE a = 1 AND b = 2`
- `WHERE b = 2 AND a = 1`

두 쿼리는 같은 논리식으로 다뤄진다.

### 3-2. 후보 실행계획 생성

Optimizer는 가능한 후보를 만든다.

- 테이블 읽기 순서 후보
- 인덱스 접근 후보 (`range`, `ref`, `ALL` 등)
- 조인 방식 후보
- 정렬/임시테이블 처리 후보

중요한 점은 "한 개" 계획을 바로 고르는 게 아니라, **여러 후보를 만든 뒤 평가**한다는 점이다.

### 3-3. 통계 기반 비용 추정

각 후보에 대해 대략적인 비용을 계산한다.

- 예상 row 수
- 랜덤 I/O/순차 I/O
- 정렬/임시공간 비용
- 조인 중간 결과 크기

여기서 핵심 입력이 카디널리티(선택도)다.

- 특정 조건이 row를 많이 줄인다고 추정하면 인덱스를 선호할 수 있고
- 거의 못 줄인다고 추정하면 풀스캔이 더 싸다고 판단할 수 있다.

### 3-4. 최저 비용 플랜 선택

가장 cost가 낮은 계획을 선택해 실제 실행한다.

즉, Optimizer는 "정답"을 찾는 게 아니라 **통계 기반 최적 추정**을 한다.
통계가 틀리면 플랜도 틀릴 수 있다.

### 3-5. 왜 EXPLAIN ANALYZE가 필요한가

`EXPLAIN`은 예상치(estimate) 중심이라서,
옵티마이저가 얼마나 정확히 추정했는지 바로 알기 어렵다.

`EXPLAIN ANALYZE`는 실제 실행값을 보여줘서 다음을 확인할 수 있다.

- 예상 row vs 실제 row 차이
- 어느 단계에서 시간이 많이 쓰였는지
- 병목이 추정 문제인지, 연산 자체 문제인지

### 3-6. 짧은 예시로 보는 의사결정

```sql
SELECT *
FROM orders
WHERE status = 'PAID'
  AND created_at >= '2026-03-01'
ORDER BY created_at DESC
LIMIT 50;
```

옵티마이저는 대략 이렇게 판단한다.

1. `status='PAID'`가 충분히 줄여주는가?
2. `created_at` 조건과 정렬을 같은 인덱스로 처리 가능한가?
3. LIMIT 50이라면 처음 50건을 빨리 찾는 경로가 무엇인가?

예를 들어 `(status, created_at)` 복합 인덱스가 있고 선택도가 괜찮으면,
인덱스 범위 스캔 + 정렬 비용 축소 경로를 선택할 가능성이 높다.

반대로 `status='PAID'`가 대부분 row를 차지하면,
인덱스보다 다른 경로가 더 싸다고 계산될 수 있다.

---

## 4) MySQL 실행계획 확인 방법

### 3-1. EXPLAIN

```sql
EXPLAIN
SELECT o.id, o.status, m.name
FROM orders o
JOIN members m ON m.id = o.member_id
WHERE o.created_at >= '2026-03-01'
  AND o.status = 'PAID';
```

- 예상 실행계획(estimate)을 보여준다.
- 실제 실행시간은 직접 보여주지 않는다.

### 3-2. EXPLAIN ANALYZE (MySQL 8+)

```sql
EXPLAIN ANALYZE
SELECT o.id, o.status, m.name
FROM orders o
JOIN members m ON m.id = o.member_id
WHERE o.created_at >= '2026-03-01'
  AND o.status = 'PAID';
```

- 실제 실행하면서 통계를 보여준다.
- "예상 row"와 "실제 row" 차이를 비교할 수 있어 튜닝 정확도가 올라간다.

---

## 5) EXPLAIN 주요 컬럼 읽는 법 (MySQL)

- `table` : 현재 단계에서 접근하는 테이블
- `type` : 접근 방식 (중요)
- `possible_keys` : 사용 가능 후보 인덱스
- `key` : 실제 사용한 인덱스
- `rows` : 읽을 것으로 예상한 row 수
- `filtered` : where 조건으로 남을 비율(%)
- `Extra` : 추가 작업 정보 (Using filesort, Using temporary 등)

### 4-1. `type` 대략 우선순위

좋은 편 → 나쁜 편 (상황에 따라 예외 있음)

- `const`
- `eq_ref`
- `ref`
- `range`
- `index`
- `ALL` (풀스캔)

`ALL`이 항상 악은 아니지만, 대용량 테이블 + 빈번 호출이면 우선 점검 대상이다.

### 4-2. `Extra`에서 자주 보는 신호

- `Using where` : 조건 필터링 수행
- `Using index` : 커버링 인덱스 가능성 (테이블 접근 줄어듦)
- `Using temporary` : 임시테이블 사용
- `Using filesort` : 추가 정렬 연산 발생

`Using temporary`, `Using filesort`는 쿼리 특성상 필요한 경우도 있지만,
핫쿼리에서 반복되면 비용이 커질 수 있어 확인이 필요하다.

---

## 6) 튜닝할 때 보는 체크리스트

### 5-1. 인덱스가 맞는지

- where / join / order by 컬럼이 인덱스에 반영됐는지
- 복합 인덱스 순서가 조건 순서와 맞는지
- 너무 많은 중복 인덱스는 아닌지

### 5-2. 쿼리 형태가 인덱스를 깨지 않는지

다음은 인덱스 효율을 떨어뜨릴 수 있다.

- 컬럼에 함수 적용 (`DATE(created_at)` 등)
- leading wildcard (`LIKE '%abc'`)
- 암묵적 형변환
- OR 남용(조건에 따라 분리 쿼리가 나을 수 있음)

### 5-3. 예상 row vs 실제 row 차이

- EXPLAIN ANALYZE에서 예상/실제가 크게 다르면
  통계 또는 데이터 분포 가정이 틀렸을 가능성이 크다.

### 5-4. 정렬/그룹 비용

- ORDER BY, GROUP BY가 인덱스로 처리되는지
- 임시테이블/파일정렬이 빈번한지

---

## 7) 실무 튜닝 루틴 (권장)

1. 느린 쿼리 식별 (슬로우 로그/APM)
2. EXPLAIN으로 계획 확인
3. EXPLAIN ANALYZE로 실제 실행 확인
4. 병목 원인 분류
   - 접근 방식 문제
   - 조인 순서/조인 조건 문제
   - 정렬/그룹 비용 문제
   - 통계/카디널리티 문제
5. 인덱스/쿼리 수정
6. 동일 데이터 조건에서 재측정
7. 적용 후 모니터링

핵심은 "추측"이 아니라 **실측 기반 반복**이다.

---

## 8) 예시: 복합 인덱스 설계 포인트

쿼리:

```sql
SELECT id, member_id, status, created_at
FROM orders
WHERE status = 'PAID'
  AND created_at >= '2026-03-01'
ORDER BY created_at DESC
LIMIT 50;
```

후보 인덱스:

```sql
CREATE INDEX idx_orders_status_created_at
ON orders (status, created_at DESC);
```

왜 이 구성이 유리할 수 있나:

- `status`로 1차 필터
- `created_at` 범위/정렬을 같이 처리
- LIMIT 50에서 빠르게 상위 집합 반환 가능

주의:

- 실제 유리한지는 데이터 분포/호출 패턴에 따라 달라진다.
- 반드시 EXPLAIN ANALYZE로 확인해야 한다.

---

## 9) 정리

- Optimizer는 SQL을 실제 실행 단계로 바꾸는 핵심 컴포넌트다.
- 성능은 쿼리 문법보다 **통계/카디널리티/인덱스/조인 순서**의 영향이 크다.
- MySQL에서는 EXPLAIN + EXPLAIN ANALYZE를 함께 봐야 정확하다.
- 튜닝은 한 번에 끝내는 작업이 아니라, 측정-수정-검증의 반복이다.
