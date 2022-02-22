---
layout  : wiki
title   : 객체 지향 프로그래밍(Object-Oriented Programming, OOP)
summary :
date    : 2022-02-22 22:30:00 +0900
updated : 2022-02-22 22:30:00 +0900
tag     : programming
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# 객체 지향 프로그래밍(Object-Oriented Programming, OOP)

## 객체의 3가지 요소

### 상태 유지(객체의 상태)
- 객체는 상태 정보를 저장하고, 유지되어져야 하며 이러한 속성(Variable)은 변수로 정의되어야 한다.
- 해당 속성값이 바뀜으로 인해, 객체 상태가 변경될 수 있어야 한다.

### 기능 제공(객체의 책임)
- 객체는 기능을 제공해야 한다. (method 제공)
- 캡슐화와 연관이 있으며, 외부로부터 직접 속성에 접근하여 변경하는 것이 아닌 객체가 제공하는 method 로 기능이 제공되어야 한다.

### 고유 식별자 제공(객체의 유일성)
- 각각의 객체는 고유한 식별자를 가져야 한다.
- 카드의 카드번호, 자동차의 자동차번호 등
- DB 내 Unique Key, Primary Key 로 작성

## 물리 객체와 개념 객체
### 물리 객체
실제 존재하는 사물을 클래스로 정의한 객체<br>
<br>
**Example)**
- 자동차 렌탈 시스템 : 자동차, 고객, 직원, 사업장, 정비소 등
- 급여 관리 시스템 : 직원, 월급통장 등

### 개념 객체
개발할 웹 시스템에서 Service 에 해당, 이는 Business logic 을 처리하는 부분을 의미<br>
Business logic 에서는 여러 객체를 서로 상호작용하도록 하며, 객체가 제공하는 오퍼레이션 method 를 통해 객체 속성을 변경<br>
<br>

**Example)**
- 사용자 관리 시스템<br>
: 사용자 객체의 마지막 접속 일자를 이용하여 계정 만료, 비밀번호 초기화, 재등록 처리 등

- ATM 시스템<br>
: 사용자(Object)의 Action 에 따라 계좌(Object) 잔고 속성을 변경하는 입/출금 logic 처리
