---
layout  : wiki
title   : JUnit
summary :
date    : 2022-06-29 20:00:00 +0900
updated : 2022-07-04 14:00:00 +0900
tag     : test
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# JUnit

JUnit 은 Java 를 위한 Unit test framework 입니다.<br>
JUnit은 컴파일 타임에 JAR 로 연결됩니다.<br>
<br>
여담으로, 2013년 GitHub 에 올라온 10,000 개의 Java 프로젝트에 대해 수행된 연구 조사에 따르면 JUnit(slf4j-api 와 동점)이 가장 일반적으로 포함되는 라이브러리였습니다.<br>
(각 라이브러리는 프로젝트의 30.7% 만큼 사용되었습니다)<br>
(우리의 영웅 켄트 벡 아저씨도 해당 프레임워크의 개발자더군요. 처음 알았습니다)<br>

## JUnit 4
JUnit 4 는 단일 모듈로, org.junit 패키지 하위에 존재합니다.<br>

## JUnit 5
JUnit 5 는 세 개의 모듈로 나뉘어 존재합니다. (Platform, Jupiter, Vintage)<br>

### JUnit Platform
JVM 환경에서 테스트 프레임워크를 수행합니다.<br>
TestEngine API 가 정의되어 있습니다.<br>

ex) `@RunWith(JUnitPlatform.class)`

<img width="462" alt="image" src="https://user-images.githubusercontent.com/60500649/176426152-fb336d69-43f1-466b-9dcb-3357a319f959.png">


### JUnit Jupiter
JUnit 5 에서 새롭게 탄생했습니다.<br>
Jupiter 기반 테스트를 실행하기 위한 Test Engine 을 제공합니다. (TestEngine API 의 구현체)<br>

<img width="462" alt="image" src="https://user-images.githubusercontent.com/60500649/176426191-1a75d540-044e-4fff-bbed-d8b14e2aeaf0.png">


### JUnit Vintage
JUnit 3 & 4 를 JUnit 5 플랫폼에서 사용할 수 있도록 지원합니다. (빈티지라서.. 이름이 재밌네요)<br>

## JUnit 4 vs JUnit 5
| JUnit 5      | JUnit 4      | Features                                           |
|--------------|--------------|----------------------------------------------------|
| @Test        | @Test        | Test method 정의                                   |
| @BeforeAll   | @BeforeClass | 클래스에 포함된 모든 테스트가 수행하기 전에 실행   |
| @AfterAll    | @AfterClass  | 클래스에 포함된 모든 테스트가 수행한 후에 실행     |
| @BeforeEach  | @Before      | 클래스에 포함된 각각의 테스트가 수행하기 전에 실행 |
| @AfterEach   | @After       | 클래스에 포함된 각각의 테스트가 수행한 후에 실행   |
| @Disable     | @Ignore      | 테스트 클래스 또는 메소드 distable 처리            |
| @TestFactory | N/A          | Dynamic test를 위한 테스트 factory 메소드          |
| @Nested      | N/A          | 클래스 안의 클래스를 선언                          |
| @Tag         | @Category    | 테스트 필터링                                      |
| @ExtendWith  | N/A          | Custom extension 등록                              |
| @DisplayName | N/A          | 테스트 메소드 또는 클래스에 사용자가 정의한 이름 정의  |


참고로, 우리가 사용하는 spring boot starter test 라이브러리에는 JUnit 5 가 들어있습니다.<br>
Vintage 가 있기에 두 버전(JUnit 4, JUnit 5) 모두 호환 가능합니다.<br>

## ExtendWith

TBD

## Reference
- [JUnit wikipedia](https://en.wikipedia.org/wiki/JUnit)
- [JUnit 4 vs JUnit 5](https://pureainu.tistory.com/190)
