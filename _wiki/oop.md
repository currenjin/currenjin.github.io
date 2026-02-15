---
layout  : wiki
title   : 객체 지향 프로그래밍(Object-Oriented Programming, OOP)
summary :
date    : 2022-02-22 22:30:00 +0900
updated : 2022-03-03 23:00:00 +0900
tags     : programming
toc     : true
public  : true
parent  : [[index]]
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

## 응집도와 결합도
좋은 소프트웨어 설계를 위해서는 결합도(coupling)는 낮추고 응집도(cohesion)는 높여야한다.

### 결합도
모듈(클래스) 간의 상호 의존 정도를 나타내는 지표로써 결합도가 낮으면 모듈 간의 상호 의존성이 줄어들어 객체의 재사용 및 유지보수가 유리

### 응집도
하나의 모듈 내부에 존재하는 구성 요소들의 기능적 관련성으로 응집도가 높은 모듈은 하나의 책임에 집중하고 독립성이 높아져, 재사용 및 유지보수가 용이


## 객체 지향 설계 5원칙 SOLID
### SRP(Single Responsibility Principle, 단일 책임 원칙)
한 클래스는 한 가지 책임을 가져야 한다.

<img width="531" alt="image" src="https://user-images.githubusercontent.com/60500649/155144381-2c77bec0-af1d-4f4b-8744-5f870f75d336.png">

### OCP(Open Closed Principle, 개방 폐쇄 원칙)
자신의 확장에는 열려 있고, 주변의 변화에 대해서는 닫혀있어야 한다.

<img width="532" alt="image" src="https://user-images.githubusercontent.com/60500649/155144292-413ebd0c-9cfd-432f-99fb-e698db85af64.png">

### LSP(Liskov Substitution Principle, 리스코프 치환 원칙)
서브 타입은 언제나 자신의 상위 타입으로 교체할 수 있어야 한다.

<img width="635" alt="image" src="https://user-images.githubusercontent.com/60500649/155144201-b0af26e0-9571-4d8b-ad32-82746a3023bb.png">

### ISP(Interface Segregation Principle, 인터페이스 분리 원칙)
클라이언트는 자신이 사용하지 않는 메서드에 의존 관계를 맺으면 안 된다.

<img width="625" alt="image" src="https://user-images.githubusercontent.com/60500649/155144770-72d7d514-10c8-4765-b95c-7ca10c0cec82.png">

### DIP(Dependency Inversion Principle, 의존 역전 원칙)
자신보다 변하기 쉬운 것에 의존하지 말아야 한다.

<img width="561" alt="image" src="https://user-images.githubusercontent.com/60500649/155145072-b80a306a-f85b-4ce1-af59-9abc62a48e49.png">

## 객체 지향 생활 체조 원칙
객체 지향 생활 체조 원칙은 소트웍스 앤솔러지에서 다루고 있는 내용으로 객체 지향 프로그래밍을 잘하기 위한 9가지 원칙을 제시하고 있다.

1. 한 메서드에 오직 한 단계의 들여쓰기만 한다.
2. else 예약어를 쓰지 않는다.
3. 모든 원시 값과 문자열을 포장한다.
4. 한 줄에 점을 하나만 찍는다.
5. 줄여 쓰지 않는다(축약 금지).
6. 모든 엔티티를 작게 유지한다.
7. 3개 이상의 인스턴스 변수를 가진 클래스를 쓰지 않는다.
8. 일급 컬렉션을 쓴다.
9. getter/setter/프로퍼티를 쓰지 않는다.
