---
layout  : wiki
title   : ATDD(Acceptance Test Driven Development, 인수 테스트 주도 개발)
summary :
date    : 2022-02-23 00:30:00 +0900
updated : 2022-03-05 00:00:00 +0900
tag     : atdd
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# ATDD(Acceptance Test Driven Development, 인수 테스트 주도 개발)
인수 테스트 주도 개발(Acceptance Test Driven Development, ATDD)은 비즈니스 고객, 테스터, 개발자 간의 커뮤니케이션을 기반으로 하는 개발 방법론이다. <br>

## What is Acceptance?
- 인수받다의 그 인수다.
- 소프트웨어개발을 의뢰하고 결과물을 인수받는다는 것이다.

## Acceptance Criteria
- 인수하기 위한 조건이다.

### Example
강사는 강의료 환불을 해주기 위해 수강생의 수강을 취소할 수 있다.
- given: 수강생이 수강 신청을 하였다, 과정의 남은 기간이 절반 이상이다.
- when: 강사는 특정 수강생의 수강 상태를 취소 요청을 한다.
- then: 특정 수강생의 수강 상태가 취소 된다, 특정 수강생의 결제 내역이 환불 된다.

### 조건 작성 순서
1. 검증하고자 하는 When 구문을 먼저 작성
2. 기대 결과를 의미하는 Then 구문을 작성
3. When 과 Then 에 필요한 정보를 Given 에서 작성

## Acceptance Test
- 인수 조건을 위한 테스트다.
- 사용자 관점, 즉 시스템의 외부 관점에서 이루어진다. 특정 입력이 주어지면 시스템의 올바른 출력을 지정하는 것과 같이 외부에서 볼 수 있는 효과를 리스트업한다.
- 예를 들면, 주문이 **지불**에서 **배송됨**으로 바뀌는 것과 같이 상태가 어떻게 변경되는지 확인할 수 있다.

### Tools
#### 테스트 서버(환경)
- @SpringBootTest(webEnvironment, RANDOM_PORT 설정)
![image](https://user-images.githubusercontent.com/60500649/156778005-2feb8a1a-dc54-400a-a8d3-bff8d7f5b7d5.png)

#### 테스트 객체(클라이언트)
- MockMVC: webEnvironment.MOCK 과 함께 사용가능, mocking 된 web environment 환경에서 테스트
- WebTestClient: webEnvironment.RANDOM_PORT 또는 DEFINED_PORT 함께 사용, Tomcat 대신 Netty 기본 사용
- RestAssured: 실제 web environment(apache tomcat)을 사용해 테스트

#### 조합
1. @SpringBootTest / Mock + MockMVC
2. @SpringBootTest / RANDOM_PORT + RestAssured

#### Example

![image](https://user-images.githubusercontent.com/60500649/156778338-e858983c-90d1-4230-ac04-26e81a62e500.png)

### 테스트 데이터 초기화

#### repository 활용하여 데이터 초기화
- 손쉽게 데이터 초기화 가능
- 구현이 달라지면 테스트 영향을 받음
- 유효성 검사 로직 없음
- 깨지기 쉬운 테스트가 될 가능성이 높음

#### 요청을 통한 데이터 초기화
- 테스트 객체를 이용하여 직접 호출 후 초기화

![image](https://user-images.githubusercontent.com/60500649/156778517-95550056-9d58-43af-99b7-b0ffe42adb2e.png)

#### 테스트가 다른 테스트에 영향을 주는 상황
@DirtiesContext
- 스프링 테스트 환경에서 캐싱된 Context 를 사용하지 않도록 설정
- 매번 Context 를 새로 구성하다 보니 시간이 많이 걸림

![image](https://user-images.githubusercontent.com/60500649/156778627-00065348-6dbf-477a-8893-2729db92a5df.png)


#### 일괄적인 데이터 초기화
- EntityManager 를 활영하여 테이블 이름 조회
- 각 테이블 Truncate 수행
- ID auto increment 값 초기화

![image](https://user-images.githubusercontent.com/60500649/156778722-7d33efc1-5122-44b5-a7d2-4d4aa1ec0f1c.png)

### 중복 처리 & 가독성 개선 필요
- 가독성이 좋지 않으면 방치될 가능성 높음
- 반복되는 코드는 메소드로 분리
- 다른 인수 테스트에서 재사용
- 한글 메서드 네이밍으로 의도를 드러내기

### 외부 API 호출
- 외부 서비스에 의존하는 경우 상당히 중요한 기능일 경우 허용
- Fake 서비스에 요청하는 경우 메인 서비스가 죽었을 때 파악하기 힘듦

#### Example
Github API
- 테스트 계정으로 실제 요청
- 대기 시간이 필요한 경우 delay 처리

결제 API 연동
- 실제가 아닌 Fake 서비스에 요청하도록 구성

### TIP
#### 간단한 성공 케이스 우선 작성
1. 동작 가능한 가장 간단한 성공 케이스로 시작
2. 테스트가 동작하면 더 좋은 생각이 떠오를 수 있음

#### 인수 테스트 클래스
1. 같은 테스트 픽처를 공유하는 인수 테스트를 클래스 단위로 묶음
2. 필요한 given 만 모아서 하나의 인수 테스트 클래스를 만들어 다른 사람이 해당 클래스를 사용하면 된다는 것을 빠르게 파악

#### Live Templates
1. template 를 설정해서 단축키로 템플릿 불러올 수 있음

### Flow
- Top-Down 방향으로 잡고, Bottom-Up 구현
- 인수 테스트 작성을 통해 요구사항과 기능 전반에 대한 이해를 선행
- 내부 구현에 대한 설계 흐름을 구상
- 설계가 끝나면 도메인부터 차근차근 TDD 로 기능 구현
- 도메인이 복잡하거나 설계가 어려운 경우 이해하고 있는 부분 먼저 기능 구현
- 인수 테스트의 요청을 처리하는 부분부터 진행 가능

## Creation
Acceptance Test 는 요구 사항이 분석될 때와 코딩 전에 생성된다.  이 덕에, 요구 사항의 요청자(프로덕트 오너, 비즈니스 분석가, 고객 담당자 등), 개발자 및 테스터가 공동으로 개발할 수 있다.

- 개발자는 Acceptance Test 를 사용해 시스템을 구현한다.
- 테스트에 실패하면, 요구 사항이 충족되지 않는다는 빠른 피드백을 제공한다.
- 테스트는 비즈니스 도메인 용어로 지정된다. 그런 다음 용어는 고객, 개발자 및 테스터 간에 공유되는 유비쿼터스 언어를 형성한다.
- 테스트와 요구 사항은 상호 연관이 있다.
- 테스트가 없는 요구 사항은 제대로 구현되지 않았을 수 있다.
- 요구 사항을 참조하지 않는 테스트는 불필요한 테스트다.
- 구현이 시작된 후 개발된 Acceptance Test 는 새로운 요구 사항을 나타낸다.

## Process
<img width="835" alt="image" src="https://user-images.githubusercontent.com/60500649/155984411-70ee09c7-2286-4853-be93-c8cbdaa8dceb.png">

## Acceptance criteria and tests by Example
Acceptance criteria 는 테스트에서 확인할 사항에 대한 설명이다. "이용자로서 도서관에서 책을 대출하고 싶습니다" 와 같은 요구 사항이 주어지면 Acceptance Criteria 는 "책이 대출된 것으로 표시되었는지 확인" 일 수 있다. 이 요구 사항에 대한 승인 테스트는 매번 동일한 효과로 테스트를 실행할 수 있도록 세부 정보를 제공한다.

### Test format
Acceptance Test 는 일반적으로 다음 형식을 따른다.

#### Given(setup)
> 시스템의 상태가 지정되는 것

#### When(trigger)
> 행동 또는 사건이 일어나는 것

#### Then(verification)
> 시스템 상태가 변경되거나, 출력이 만들어진 것

#### Example
```
Given - Book that has not been checked out
And - User who is registered on the system
When - User checks out a book
Then - Book is marked as checked out
```

### Complete test
이전 단계에는 특정 예제 데이터가 포함되어 있지 않으므로 테스트를 완료하기 위해 추가된다.

#### Given
> Book that has not been checked out

**Books**
- Title : Great book
- Checked out : No

<br>

> User who is registered on the system

**Users**
- Name : Sam

#### When
> User checks out a book

**Checkout action**
- User : Sam, Checks out, Great book

#### Then
> Book is marked as checked out

**Books**
- Title : Great book
- Checked out : Yes
- User : Sam

### Test examination
특정 데이터로 테스트를 검토하면 일반적으로 많은 질문이 나온다. 예시의 경우 다음과 같을 수 있다.

```
책이 이미 대여된 경우 어떻게 하는가?
책이 존재하지 않으면?
사용자가 시스템에 등록되어 있지 않으면 어떻게 하는가?
책을 체크인해야 하는 날짜가 있는가?
사용자는 몇 권의 책을 체크아웃할 수 있는가?
```

이러한 질문은 누락되거나 모호한 요구 사항을 밝히는 데 도움이 된다. 예상 결과에 마감일과 같은 추가 세부 정보를 추가할 수 있다. 다른 승인 테스트는 이미 대출된 책을 대출하려고 하는 것과 같은 조건에서 예상한 오류가 발생하는지 확인할 수 있다.

### Another test example
비즈니스 고객이 사용자가 한 번에 하나의 책만 대출할 수 있는 비즈니스 규칙을 원한다고 가정한다. 다음 테스트를 통해 다음 사항을 확인할 수 있다.

#### Scenario
> Check that checkout business rule is enforced

#### Given
> Book that has been checked out

**Books**

Data 1.
- Title	: Great book
- Checked out	: Yes
- User : Sam

Data 2.
- Title : Another great book
- Checked out : No

**Users**
- Name : Sam

#### When
> User checks out another book

**Checkout action**
- User :	Sam,	Checks out,	Another great book

#### Then
> Error occurs

**Error occurred**
- Description
- Violation of checkout business rule

### Project acceptance tests
요구 사항에 대한 Acceptance tests 외에도 Acceptance tests 는 프로젝트 전체에서 사용할 수 있다. 예를 들어, 요구 사항이 도서관 도서 대출 프로젝트의 일부인 경우 전체 프로젝트에 대한 Acceptance test 가 있을 수 있다.

#### Example
- 새 도서관 시스템이 프로덕션 단계에 있을 때 사용자는 현재보다 3배 빨리 책을 대출 및 반납할 수 있을 것이다.
