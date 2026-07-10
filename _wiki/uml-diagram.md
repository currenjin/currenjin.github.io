---
layout  : wiki
title   : UML 다이어그램(Unified Modeling Language Diagram)
summary : UML 다이어그램을 읽을 때 참고하는 표기법, 선 모양, 관계 의미 정리
date    : 2026-07-10 14:50:00 +0900
updated : 2026-07-10 15:25:00 +0900
tags    : [design, architecture, engineering]
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# UML 다이어그램(Unified Modeling Language Diagram)

UML(Unified Modeling Language)은 소프트웨어 구조와 동작을 시각적으로 표현하기 위한 표준 모델링 언어다. 이 문서는 UML을 읽거나 설계 리뷰할 때 빠르게 확인할 수 있는 **표기법, 선 모양, 관계 의미**만 남긴 레퍼런스다.

## 언제 어떤 다이어그램을 쓰는가

| 상황 | 다이어그램 | 의미 |
|---|---|---|
| 클래스, 인터페이스, 상속, 소유 관계를 설명한다 | 클래스 다이어그램 | 정적 구조 |
| 요청 처리 순서와 객체 간 메시지를 설명한다 | 시퀀스 다이어그램 | 시간 순서 |
| 사용자가 시스템으로 달성하는 목표를 설명한다 | 유스케이스 다이어그램 | 기능 범위 |
| 조건, 반복, 승인 같은 업무 흐름을 설명한다 | 액티비티 다이어그램 | 절차 흐름 |
| 주문·결제·계정처럼 상태가 바뀌는 대상을 설명한다 | 상태 다이어그램 | lifecycle |
| 모듈, 서비스, 패키지 의존성을 설명한다 | 컴포넌트/패키지 다이어그램 | 아키텍처 경계 |
| 테이블과 cardinality가 핵심이다 | [[ERD]] | 데이터 관계 |

## 공통 규칙

| 규칙 | 의미 |
|---|---|
| 제목은 질문처럼 좁힌다 | `전체 구조`보다 `주문 결제 시 재고 예약 흐름`이 낫다 |
| 모든 것을 넣지 않는다 | UML은 코드 전체 복사가 아니라 의사소통용 모델이다 |
| 선에는 의미가 있다 | 실선/점선/삼각형/다이아몬드/화살표를 구분한다 |
| 관계가 헷갈리면 label을 붙인다 | `uses`, `contains`, `creates`, `publishes`처럼 동사를 쓴다 |
| 개수가 중요하면 multiplicity를 표시한다 | `1`, `0..1`, `1..*`, `0..*` |
| 구현 상세는 줄인다 | getter/setter, private helper, 단순 DTO 필드는 보통 생략한다 |

## 클래스 다이어그램

클래스 다이어그램은 시스템의 **정적 구조**를 보여준다. [[oop]]{객체 지향 설계}에서 클래스, 인터페이스, enum, 상속, 구현, 소유 관계를 설명할 때 사용한다.

### 클래스 표기 규칙

| 표기 | 의미 | 예시 |
|---|---|---|
| 클래스 이름 | 타입 이름 | `Order` |
| `<<interface>>` | 인터페이스 | `<<interface>> PaymentGateway` |
| `<<enumeration>>` | enum | `<<enumeration>> OrderStatus` |
| 속성 | 주요 상태 | `-status OrderStatus` |
| 오퍼레이션 | 주요 책임 | `+pay(command) PaymentResult` |
| `+` | public | `+pay()` |
| `-` | private | `-status` |
| `#` | protected | `#validate()` |
| `~` | package/internal | `~calculate()` |
| `*` | abstract | `+calculate()*` |
| `$` | static | `+of()$` |


### 클래스 선 규칙

아래 그림의 **선 끝 모양**을 기준으로 읽는다.

![UML class diagram line notation](/assets/images/wiki/uml-class-lines.svg)

| 관계 | 의미 | 판단 기준 |
|---|---|---|
| 일반화(Generalization) | 상속, `is-a` | `Cat`은 `Animal`이다 |
| 실체화(Realization) | 인터페이스 구현 | `CardGateway`가 `PaymentGateway`를 구현한다 |
| 연관(Association) | 지속적으로 알고 있음 | 필드로 참조한다 |
| 의존(Dependency) | 일시적으로 사용함 | 파라미터, 지역 변수, static call로만 쓴다 |
| 집합(Aggregation) | 약한 전체-부분 | 전체가 없어도 부분은 독립적으로 산다 |
| 합성(Composition) | 강한 전체-부분 | 전체가 사라지면 부분 lifecycle도 끝난다 |

### Multiplicity 규칙

| 표기 | 의미 |
|---|---|
| `1` | 정확히 하나 |
| `0..1` | 없거나 하나 |
| `*` | 여러 개 |
| `1..*` | 하나 이상 |
| `0..*` | 없거나 여러 개 |


### 클래스 다이어그램 판단 규칙

| 헷갈리는 지점 | 판단 |
|---|---|
| 상속 vs 구현 | class 상속은 일반화, interface 구현은 실체화 |
| 연관 vs 의존 | 오래 들고 있으면 연관, 잠깐 쓰면 의존 |
| 집합 vs 합성 | lifecycle을 함께하면 합성, 독립 생존하면 집합 |
| 필드가 많다 | 설계 의도와 관계없는 필드는 생략한다 |
| 선이 많다 | 핵심 메시지와 관계없는 의존은 지운다 |

## 시퀀스 다이어그램

시퀀스 다이어그램은 런타임의 **시간 순서**를 보여준다. API 요청, 트랜잭션, 외부 시스템 호출, 실패 흐름을 설명할 때 사용한다.

### 시퀀스 선 규칙

아래 그림의 **선 종류와 화살표 머리**를 기준으로 읽는다.

![UML sequence diagram message notation](/assets/images/wiki/uml-sequence-lines.svg)

| 의미 | 사용 예시 |
|---|---|
| 동기 호출 | API call, method call |
| 응답 | return, response |
| 비동기 메시지 | event publish, queue send |
| 호출과 처리 구간 시작 | 긴 처리 시작 강조 |
| 응답과 처리 구간 종료 | 긴 처리 종료 강조 |


### 시퀀스 구조 규칙

| 표기 | 의미 |
|---|---|
| `actor` | 사용자 또는 외부 행위자 |
| `participant` | 객체, 서비스, DB, 외부 시스템 |
| `activate` / `deactivate` | 처리 중인 구간 |
| `alt` / `else` | 조건 분기 |
| `opt` | 선택 흐름 |
| `loop` | 반복 |
| `par` | 병렬 흐름 |


### 시퀀스 다이어그램 판단 규칙

| 헷갈리는 지점 | 판단 |
|---|---|
| 모든 레이어를 넣을까? | 책임 경계, 장애 가능성, 외부 연동만 남긴다 |
| 응답 화살표를 다 그릴까? | 의미 있는 응답만 남긴다 |
| 실패 흐름을 넣을까? | 설계 판단이 달라지는 실패는 `alt`로 넣는다 |
| DB를 넣을까? | 트랜잭션/성능/장애 포인트면 넣는다 |

## 유스케이스 다이어그램

유스케이스 다이어그램은 actor가 시스템으로 달성하려는 **목표**를 보여준다. 내부 API나 CRUD보다 사용자 목적을 이름으로 둔다.

| 표기 | 의미 |
|---|---|
| actor | 시스템 밖 행위자 |
| system boundary | 시스템 범위 |
| use case | actor가 달성하려는 목표 |
| include | 항상 포함되는 하위 기능 |
| extend | 조건부로 확장되는 기능 |


## 액티비티 다이어그램

액티비티 다이어그램은 업무나 알고리즘의 **절차 흐름**을 보여준다.

| 표기 | 의미 |
|---|---|
| 시작/끝 노드 | 프로세스 시작과 종료 |
| 액션 | 수행할 작업 |
| 다이아몬드 | 조건 분기 |
| 화살표 | 다음 단계 |
| 병렬 분기 | 동시에 수행되는 작업 |


## 상태 다이어그램

상태 다이어그램은 하나의 대상이 이벤트에 따라 어떤 **상태**로 전이되는지 보여준다.

| 표기 | 의미 |
|---|---|
| 상태 | 현재 머무는 값/단계 |
| 전이 | 이벤트로 상태가 바뀜 |
| 시작/종료 점 | 상태 흐름의 시작 또는 종료 |
| 전이 label | 어떤 이벤트가 상태를 바꾸는지 표시 |


상태 이름은 `Paid`, `Cancelled`처럼 명사/형용사형으로 쓰고, 전이 label은 `submit`, `cancel`, `delivered`처럼 이벤트 이름으로 쓴다.

## 컴포넌트/패키지 다이어그램

컴포넌트/패키지 다이어그램은 모듈, 서비스, 패키지, 외부 시스템 사이의 **의존성 방향**을 보여준다.

| 선 | 의미 |
|---|---|
| 실선 화살표 | A가 B를 사용한다 |
| 점선 화살표 | 약한 의존, optional dependency |
| subgraph | 경계 또는 패키지 |
| DB 모양 | 저장소 |


의존성 방향은 실제 import/call 방향과 맞춘다. 계층형 설계에서는 도메인이 인프라를 직접 참조하지 않는지 확인하는 용도로 쓴다.

## 자주 틀리는 부분

| 실수 | 수정 기준 |
|---|---|
| 클래스 다이어그램에 모든 필드와 메서드를 넣는다 | 설계 의도에 필요한 것만 남긴다 |
| 합성을 단순 필드 보유로 판단한다 | lifecycle 소유권이 있을 때만 합성으로 표시한다 |
| 시퀀스 다이어그램이 호출 스택이 된다 | 책임 경계와 외부 연동만 남긴다 |
| 유스케이스를 CRUD로 쓴다 | `Create Order`보다 `Place order`처럼 actor 목표로 쓴다 |
| 선 label이 없다 | 관계 의미가 헷갈리면 label을 붙인다 |

## Reference

- [UML 클래스 다이어그램(Class Diagram) - Junhyunny’s Devlogs](https://junhyunny.github.io/information/class-diagram-in-uml/)
- [UML Diagrams - Class Diagrams Reference](https://www.uml-diagrams.org/class-reference.html)
- [UML Diagrams - Sequence Diagrams](https://www.uml-diagrams.org/sequence-diagrams.html)
