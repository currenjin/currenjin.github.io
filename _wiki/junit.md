---
layout  : wiki
title   : JUnit
summary :
date    : 2022-06-29 20:00:00 +0900
updated : 2022-07-05 00:00:00 +0900
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

## JUnit Life cycle

TBD

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

<img width="675" alt="image" src="https://user-images.githubusercontent.com/60500649/177083450-f5673462-a66b-40d3-ada9-07ac7315b5b0.png">

참고로, 우리가 사용하는 spring boot starter test 라이브러리에는 JUnit 5 가 들어있습니다.<br>
Vintage 가 있기에 두 버전(JUnit 4, JUnit 5) 모두 호환 가능합니다.<br>

## ExtendWith

TBD

## Interceptor

우리는 JUnit Extension 을 통해 테스트에서 수행하는 작업을 intercept 할 수 있습니다.<br>

**org.junit.jupiter.api.extension** Life cycle 을 intercept 할 수 있는 여러 인터페이스가 존재합니다.<br>

![image](https://user-images.githubusercontent.com/60500649/177150637-19c6c3bf-b7bd-4d8a-9daf-d00ef1113683.png)


많이 사용할만한 인터페이스를 추리자면, 아래 정도가 되겠네요.<br>

- BeforeAllCallBack: @BeforeAll 실행 후
- BeforeEachCallBack: @BeforeEach 실행 후
- AfterEachCallBack: @AfterEach 실행 후
- AfterAllCallBack: @AfterAll 실행 후
- TestInstancePostProcessor: Test instance 생성 후
- TestInstancePreDestroyCallBack: Test instance 제거 전

<br>

개인적으로 흥미로운 클래스인 InvocationInterceptor 를 통해서 Example interceptor extension 을 작성해 보았습니다.<br>

```java
@Slf4j
public class InterceptExtension implements InvocationInterceptor {

    @Override
    public <T> T interceptTestClassConstructor(Invocation<T> invocation,
                                               ReflectiveInvocationContext<Constructor<T>> invocationContext,
                                               ExtensionContext extensionContext) throws Throwable {
        log.info("test class constructor !");
        return InvocationInterceptor.super.interceptTestClassConstructor(invocation, invocationContext, extensionContext);
    }
}
```

Test class 가 생성되는 시점에 로그를 찍어보겠습니다.<br>

```java
@ExtendWith({ MockitoExtension.class, InterceptExtension.class })
```

호출하는 테스트 클래스 상위에 ExtendWith Annotation 을 통해 InterceptExtension 을 정의해 주었습니다.<br>
<br>
예상대로라면, 테스트 클래스 생성 시점에 로그가 한 번 찍혀야 합니다.<br>
정말 그렇게 찍히는지 확인해 보겠습니다.<br>

```java
[INFO ][Test worker][20:52:40.529][com.trevari.member.common.InterceptExtension.interceptTestClassConstructor:19] - test class constructor !
```

<br>

테스트 클래스가 생성되는 시점에 정확히 로그가 찍히는 군요.<br>
intercept extension 을 통해 각 테스트의 속도를 측정한다던가.. 등등 다양한 일들을 할 수 있을 거라 생각됩니다.<br>


## Reference
- [JUnit wikipedia](https://en.wikipedia.org/wiki/JUnit)
- [JUnit 4 vs JUnit 5](https://pureainu.tistory.com/190)
- [JUnit Lifecycle](https://huisam.tistory.com/entry/junit)
- [JUnit Extension](https://junit.org/junit5/docs/5.3.0-M1/user-guide/index.html#extensions)
- [Javadoc MockitoExtension](https://javadoc.io/doc/org.mockito/mockito-junit-jupiter/latest/org/mockito/junit/jupiter/MockitoExtension.html)
