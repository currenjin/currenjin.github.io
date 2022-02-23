---
layout  : wiki
title   : ATDD(Acceptance Test Driven Development, 인수 테스트 주도 개발)
summary :
date    : 2022-02-23 00:30:00 +0900
updated : 2022-02-24 00:30:00 +0900
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

## Overview
Acceptance Test 는 사용자 관점, 즉 시스템의 외부 관점에서 이루어진다. 특정 입력이 주어지면 시스템의 올바른 출력을 지정하는 것과 같이 외부에서 볼 수 있는 효과를 리스트업한다. <br>
예를 들면, 주문이 **지불**에서 **배송됨**으로 바뀌는 것과 같이 상태가 어떻게 변경되는지 확인할 수 있다.

## Creation
Acceptance Test 는 요구 사항이 분석될 때와 코딩 전에 생성된다.  이 덕에, 요구 사항의 요청자(프로덕트 오너, 비즈니스 분석가, 고객 담당자 등), 개발자 및 테스터가 공동으로 개발할 수 있다.

- 개발자는 Acceptance Test 를 사용해 시스템을 구현한다.
- 테스트에 실패하면, 요구 사항이 충족되지 않는다는 빠른 피드백을 제공한다.
- 테스트는 비즈니스 도메인 용어로 지정된다. 그런 다음 용어는 고객, 개발자 및 테스터 간에 공유되는 유비쿼터스 언어를 형성한다.
- 테스트와 요구 사항은 상호 연관이 있다.
- 테스트가 없는 요구 사항은 제대로 구현되지 않았을 수 있다.
- 요구 사항을 참조하지 않는 테스트는 불필요한 테스트다.
- 구현이 시작된 후 개발된 Acceptance Test 는 새로운 요구 사항을 나타낸다.

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
In addition to acceptance tests for requirements, acceptance tests can be used on a project as a whole. For example, if this requirement was part of a library book checkout project, there could be acceptance tests for the whole project. These are often termed SMART objectives. An example test is "When the new library system is in production, the users will be able to check books in and out three times as fast as they do today".
