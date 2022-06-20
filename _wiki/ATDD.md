---
layout  : wiki
title   : ATDD(Acceptance Test Driven Development, 인수 테스트 주도 개발)
summary :
date    : 2022-02-23 00:30:00 +0900
updated : 2022-06-20 10:00:00 +0900
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

### Search Test

#### Acceptance Criteria
1. 사용자는 검색어를 사용하여 저자와 제목 필드를 모두 검색하는 간단한 기본 검색을 할 수 있다.
2. 사용자는 저자, 제목, ISBN 의 어떤 조합이든 입력하여 책을 검색할 수 있다.

#### Test by first AC
- 제목에는 나타나지만 저자에는 나타날 가능성이 희박한 단어로 검색한다. ex) '항해'
- 저자에는 나타나지만 제목에는 나타날 가능성이 희박한 단어로 검색한다. ex) '존(John)'

#### Test by second AC
- 적어도 한 권은 있는 저자와 제목의 값을 사용한다.
- 존재하지 않는 책의 저자와 제목의 값을 사용한다.
- ISBN 으로 검색을 시도한다.

### Checkout Test

#### Acceptance Criteria
1. 사용자는 책을 '장바구니'에 넣어두고 쇼핑을 마친 뒤에 구입할 수 있다.
2. 사용자는 장바구니에 있는 아이템의 수량을 조절할 수 있다. 수량을 0으로 지정하면 장바구니에서 아이템을 삭제한다.

> 2번 AC는 원래 아래 스토리이지만, 예외 상황에 의해 대체되었다.
> 
> **사용자는 장바구니에 있는 아이템의 수량을 조절할 수 있다. 수량을 0으로 지정하면 장바구니에서 아이템을 삭제한다.**
>> 품절된 상품을 장바구니에 넣을 수 있는가?<br>
>> 출간되지 않은 책에 대해서는 어떠한가?<br>
>> 수량을 증가시키는 경우는 어떠한가?<br>

#### Test by first AC
- 품절된 책을 장바구니에 담는다. 사용자에게 재고가 확보되면 배송할 거라고 알려주는지 확인한다.
- 아직 출간되지 않은 책을 장바구니에 담는다. 사용자에게 책이 출간되면 배송할 거라고 알려주는지 확인한다.
- 재고가 있는 책을 장바구니에 담는다.

#### Test by second AC
- 책의 수량을 1에서 10으로 변경한다.
- 책의 수량을 10에서 1로 변경한다.
- 수량을 0으로 바꾸어 책을 제거한다.

### Payment Test

#### Acceptance Criteria
1. 책들 구입하기 위해 사용자는 청구지 주소, 배송지 주소 및 신용카드 정보를 입력한다.

#### Test by first AC
- 청구지 주소를 입력하고 배송지 주소가 같음을 표시한다.
- 청구지 주소와 배송지 주소를 따로 입력한다.
- 주소와 일치하지 않는 우편번호를 입력해 보고 시스템이 불일치를 잡아내는지 확인한다.
- 유효한 비자카드를 사용하여 테스트한다.
- 유효한 마스터카드를 사용하여 테스트한다.
- 유효한 아메리칸익스프레스카드를 사용하여 테스트한다.(실패)
- 유효기간이 만료된 비자카드를 사용하여 테스트한다.
- 한도가 초과된 마스터카드를 사용하여 테스트한다.
- 숫자가 빠진 비자카드 번호를 사용하여 테스트한다.
- 숫자 위치가 바뀐 비자카드 번호를 사용하여 테스트한다.
- 완전히 잘못된 비자카드 번호를 사용하여 테스트한다.

### User Account Test

#### Acceptance Criteria
1. 사용자는 배송지 정보와 요금청구 정보를 기억하는 계정을 만들 수 있다.
2. 사용자는 자신의 게정에 저장된 신용카드 정보를 수정할 수 있다.
3. 사용자는 자신의 계정에 저장된 배송지와 청구지 주소를 수정할 수 있다.

#### Test by first AC
- 사용자는 게정을 생성하지 않고도 주문할 수 있다.
- 계정을 생성한 다음 계정 정보가 저장되었는지 확인한다.

#### Test by second AC
- 신용카드 번호를 유효하지 않는 번호로 변경하고 시스템이 사용자에게 경고하는지 확인한다.
- 카드의 유효기간 날짜를 하루전으로 변경하고 시스템이 사용자에게 경고하는지 확인한다.
- 새 유효한 카드 번호로 수정하고 변경된 내용이 저장되는지 확인한다.
- 카드의 유효기간 날짜를 미래로 수정하고 변경된 내용이 저장되는지 확인한다.

#### Test by third AC
- 배송지 주소의 여러 부분을 수정해 보고 변경된 내용이 저장되는지 확인한다.
- 청구지 주소의 여러 부분을 수정해 보고 변경된 내용이 저장되는지 확인한다.

### System manager test

#### Acceptance Criteria
1. 관리자는 새로운 책을 사이트에 추가할 수 있다.
2. 관리자는 책을 삭제할 수 있다.
3. 관리자는 기존 책에 관한 정보를 편집할 수 있다.

#### Test by first AC
- 관리자가 사이트에 책을 추가할 수 있는지 테스트한다.
- 관리자가 아닌 사람이 책을 추가할 수 없는지 테스트한다.
- 필요한 정보를 모두 입력해야만 책을 추가할 수 있는지 테스트한다.

#### Test by second AC
- 관리자가 책을 삭제할 수 있는지 확인한다.
- 관리자가 아닌 사람이 책을 삭제할 수 없는지 확인한다.
- 책을 삭제한 후 이전에 그 책을 주문한 고객에게는 문제없이 배송되는지 확인한다.

#### Test by third AC
- 제목, 저자, 쪽 수 등의 항목이 수정되는지 확인한다.
- 가격이 수정되는지 확인하고, 변경된 가격이 이전 주문된 건에 대해서는 영향응ㄹ 미치지 않음을 확인한다.

### Rule test

#### Acceptance Criteria
1. 웹 사이트에서 발생하는 주문은 전화 주문과 동일한 주문 데이터베이스에 기록되어야 한다.
2. 시스템은 최대 50명의 동시 사용자 접근을 처리할 수 있어야 한다.

#### Test by fist AC
- 주문을 하고, 전화 주문 데이터베이스를 열어 주문이 그 데이터베이스에 저장되었는지 확인한다.

#### Test by second AC
- 50명의 가상 사용자로 하여금 다양한 검색과 주문하는 것을 테스트한다. 나타나는 데 4초 이상 걸리는 화면이 없어야 하며 손실되는 주문도 없어야 한다.

### Recommend Test

#### Acceptance Criteria
1. 사용자는 다양한 주제에 대해 우리가 추천하는 도서들을 볼 수 있다.

#### Test by first AC
- 주제(예를 들어 항해 또는 순항)를 선택하면 해당 주제에 적절한 추천 도서 목록이 나타나는지 확인한다.
- 추천도서 목록에 있는 아이템을 클릭하면 웹 브라우저가 해당 도서의 정보를 보여주는 페이지로 이동하는지 확인한다.

# Archive
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
