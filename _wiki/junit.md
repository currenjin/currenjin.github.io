---
layout  : wiki
title   : JUnit
summary :
date    : 2022-06-29 20:00:00 +0900
updated : 2025-08-16 23:00:00 +0900
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

## JUnit Life cycle

개별 테스트 메서드를 격리하여 실행할 수 있도록 하고 변경 가능한 테스트 인스턴스 상태로 인한 예기치 않은 부작용을 피하기 위해 JUnit은 각 테스트 메서드 를 실행하기 전에 각 테스트 클래스의 새 인스턴스를 만듭니다 ( 테스트 클래스 및 메서드 참조 ). 이 "메소드별" 테스트 인스턴스 수명 주기는 JUnit Jupiter의 기본 동작이며 모든 이전 버전의 JUnit과 유사합니다.<br>
<br>

```
"메서드별" 테스트 인스턴스 수명 주기 모드가 활성화된 경우에도 조건 (예: , 등) 을 통해 주어진 테스트 메서드 가 비활성화 된 경우 테스트 클래스가 계속 인스턴스화됩니다 .@Disabled@DisabledOnOs
JUnit Jupiter가 동일한 테스트 인스턴스에서 모든 테스트 메소드를 실행하도록 하려면 테스트 클래스에 @TestInstance(Lifecycle.PER_CLASS). 이 모드를 사용하면 테스트 클래스당 한 번 새 테스트 인스턴스가 생성됩니다. 따라서 테스트 메서드가 인스턴스 변수에 저장된 상태에 의존하는 경우 @BeforeEach또는 @AfterEach메서드에서 해당 상태를 재설정해야 할 수 있습니다.
```

<br>

"클래스별" 모드에는 기본 "메서드별" 모드에 비해 몇 가지 추가 이점이 있습니다. 특히 "클래스별" 모드를 사용하면 비정적 메서드와 인터페이스 @BeforeAll메서드 를 선언할 수 있습니다. 따라서 "클래스별" 모드를 사용하면 테스트 클래스 에서 및 메서드 를 사용할 수도 있습니다.@AfterAlldefault@BeforeAll@AfterAll@Nested<br>
<br>

Kotlin 프로그래밍 언어를 사용하여 테스트를 작성 하는 경우 "클래스별" 테스트 인스턴스 수명 주기 모드로 전환하여 메서드를 @BeforeAll더 쉽게 구현할 수도 있습니다 .@AfterAll<br>
<br>

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

## Core Annotations
- 테스트 클래스(test class): 클래스, 정적 멤버 클래스, 하나 이상의 테스트 메서드를 포함하는 `@Nested` 애노테이션이 붙은 내부 클래스를 말한다.
  - 추상 클래스일 수 없다.
  - 단일한 생성자를 가지고 있어야 한다.
  - 생성자는 파라미터가 아예 없거나, 런타임에 의존성 주입으로 동적으로 리졸브할 수 있는 파라미터만 사용할 수 있다.
  - 가시성을 보장하기 위한 최소 요구 사항으로 디폴트 접근 제어자를 사용할 수 있다.
- 테스트 메서드(test method): `@Test`, `@RepeatedTest`, `@ParameterizedTest`, `@TestFactory`, `@TestTemplate` 애노테이션이 붙은 메서드를 말한다.
- 생애 주기 메서드(life cycle method): `@BeforeAll`, `@AfterAll`, `@BeforeEach`, `@AfterEach` 애노테이션이 붙은 메서드를 말한다.

```java
public class CoreAnnotationsTest {
	private static ResourceForAllTests resourceForAllTests;
	private SUT sut;

	@BeforeAll
	static void beforeAll() {
		resourceForAllTests = new ResourceForAllTests("테스트를 위한 리소스");
	}

	@AfterAll
	static void afterAll() {
		resourceForAllTests.close();
	}

	@BeforeEach
	void setUp() {
		sut = new SUT("테스트 대상 시스템");
	}

	@AfterEach
	void tearDown() {
		sut.close();
	}

	@Test
	void testRegularWork() {
		boolean canReceiveRegularWork = sut.canReceiveRegularWork();

		assertTrue(canReceiveRegularWork);
	}

	@Test
	void testAdditionalWork() {
		boolean canReceiveAdditionalWork = sut.canReceiveAdditionalWork();

		assertFalse(canReceiveAdditionalWork);
	}
}
```

### `@BeforeAll`
- 전체테스트가 실행되기 전에 한 번 실행된다.
- 테스트 클래스에 `@TestInstance(Lifecycle.PER_CLASS)가 없다면 정적(`static`)으로 선언해야 한다.

### `@AfterAll`
- 전체 테스트가 실행된 후 한 번 실행된다.
- 테스트 클래스에 `@TestInstance(Lifecycle.PER_CLASS)가 없다면 정적(`static`)으로 선언해야 한다.

### `@BeforeEach`
- 각 테스트가 실행되기 전에 실행된다.

### `@AfterEach`
- 각 테스트가 실행된 이후에 실행된다.

### `@Test`
- 독립적으로 실행된다.


## `@ExtendWith`

TBD

## `@DisplayName`

> 테스트 클래스나 테스트 메서드에 자신만의 디스플레이 네임을 작성하는 데 사용한다.

- 테스트 클래스, 테스트 메서드에서 사용할 수 있다.
- IDE, 빌드 도구 등의 테스트 리포트에서도 보통 적용된다.

```java
@DisplayName("The test class showing the @DisplayName annotation.")
public class DisplayNameTest {
  private SUT sut = new SUT();

  @Test
  @DisplayName("Our system under test says hello.")
  void testHello() {
    assertEquals("Hello", sut.hello());
  }

  @Test
  @DisplayName("🥺")
  void testTalking() {
    assertEquals("How are you?", sut.talk());
  }

  @Test
  void testBye() {
    assertEquals("Bye", sut.bye());
  }
}
```

<img width="641" height="199" alt="Image" src="https://github.com/user-attachments/assets/c39acd47-616f-45d3-9f97-854b505de41c" />

## `@Disabled`

Disabled annotation 을 통해 테스트 클래스 또는 메소드를 비활성화할 수 있습니다.<br>
<br>

**Class**

```java
@Disabled("Disabled until bug has been fixed")
class ClassDisabledTest {

    @Test
    void add() {
        int actual = Operator.add(1, 3);

        assertThat(actual).isEqualTo(4);
    }
}
```

**Method**

```java
class MethodDisabledTest {

    @Disabled("Disabled until bug has been fixed")
    @Test
    void add() {
        int actual = Operator.add(1, 3);

        assertThat(actual).isEqualTo(4);
    }
}
```

## Condition

### Operating system

특정 운영 체제에서만 테스트가 동작할 수 있도록 할 수 있습니다.<br>
<br>

```java
@Test
@EnabledOnOs(MAC)
void onlyOnMacOs() {
    // ...
}

@TestOnMac
void testOnMac() {
    // ...
}

@Test
@EnabledOnOs({ LINUX, MAC })
void onLinuxOrMac() {
    // ...
}

@Test
@DisabledOnOs(WINDOWS)
void notOnWindows() {
    // ...
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Test
@EnabledOnOs(MAC)
@interface TestOnMac {
}
```

### Java runtime environment

특정 버전의 JRE 에서만 테스트가 동작될 수 있도록 할 수 있습니다.<br>
<br>

```java
@Test
@EnabledOnJre(JAVA_8)
void onlyOnJava8() {
    // ...
}

@Test
@EnabledOnJre({ JAVA_9, JAVA_10 })
void onJava9Or10() {
    // ...
}

@Test
@EnabledForJreRange(min = JAVA_9, max = JAVA_11)
void fromJava9to11() {
    // ...
}

@Test
@EnabledForJreRange(min = JAVA_9)
void fromJava9toCurrentJavaFeatureNumber() {
    // ...
}

@Test
@EnabledForJreRange(max = JAVA_11)
void fromJava8To11() {
    // ...
}

@Test
@DisabledOnJre(JAVA_9)
void notOnJava9() {
    // ...
}

@Test
@DisabledForJreRange(min = JAVA_9, max = JAVA_11)
void notFromJava9to11() {
    // ...
}

@Test
@DisabledForJreRange(min = JAVA_9)
void notFromJava9toCurrentJavaFeatureNumber() {
    // ...
}

@Test
@DisabledForJreRange(max = JAVA_11)
void notFromJava8to11() {
    // ...
}
```


### System property

특정 JVM 시스템의 속성에 따라 테스트가 동작될 수 있도록 할 수 있습니다.<br>
<br>

```java
@Test
@EnabledIfSystemProperty(named = "os.arch", matches = ".*64.*")
void onlyOn64BitArchitectures() {
    // ...
}

@Test
@DisabledIfSystemProperty(named = "ci-server", matches = "true")
void notOnCiServer() {
    // ...
}
```

### Environment variable

특정 환경 변수에 따라 테스트가 동작될 수 있도록 합니다.<br>
<br>

```java
@Test
@EnabledIfEnvironmentVariable(named = "ENV", matches = "staging-server")
void onlyOnStagingServer() {
    // ...
}

@Test
@DisabledIfEnvironmentVariable(named = "ENV", matches = ".*development.*")
void notOnDeveloperWorkstation() {
    // ...
}
```

### Custom

사용자가 정의한 조건에 따라 테스트가 동작될 수 있도록 합니다.<br>


```java
@Test
@EnabledIf("customCondition")
void enabled() {
    // ...
}

@Test
@DisabledIf("customCondition")
void disabled() {
    // ...
}

boolean customCondition() {
    return true;
}
```

Condition method 가 외부에 존재할 수 있습니다.<br>

```java
package example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

class ExternalCustomConditionDemo {

    @Test
    @EnabledIf("example.ExternalCondition#customCondition")
    void enabled() {
        // ...
    }

}

class ExternalCondition {

    static boolean customCondition() {
        return true;
    }

}
```

@EnabledIf, @DisabledIf annotation 이 클래스 수준에서 사용되는 경우 condition 메서드는 항상 static 이어야 합니다.<br>
외부 클래스에 있는 condition 메서드 또한 static 이어야 합니다.<br>
<br>


## Interceptor

우리는 JUnit Extension 을 통해 테스트에서 수행하는 작업을 intercept 할 수 있습니다.<br>

**org.junit.jupiter.api.extension** Life cycle 을 intercept 할 수 있는 여러 인터페이스가 존재합니다.<br>

![image](https://user-images.githubusercontent.com/60500649/177150637-19c6c3bf-b7bd-4d8a-9daf-d00ef1113683.png)


많이 사용할만한 인터페이스를 추리자면, 아래 정도가 되겠네요.<br>

- BeforeAllCallBack: `@BeforeAll` 실행 후
- BeforeEachCallBack: `@BeforeEach` 실행 후
- AfterEachCallBack: `@AfterEach` 실행 후
- AfterAllCallBack: `@AfterAll` 실행 후
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

## `@Tag`
각 테스트 클래스 및 메소드에는 태깅을 할 수 있습니다.<br>
해당 태그가 나중에 테스트를 검색하거나 실행하고자 하는 대상을 필터링하는 데 사용되기도 한다더군요.<br>
<br>
테스트 클래스 또는 메소드에 @Tag Annotation 을 사용하면 됩니다. (junit jupiter 패키지 하위에 존재합니다)<br>
<br>

```java
@Tag("tagging")
class TaggingTest {

    @Test
    @Tag("test")
    void test() {
    }
}
```

### Example

깨끗한 테스트는 clean, 더러운 테스트는 dirty 라는 태그를 달아놓겠습니다.<br>

```java
class TagTest {

    @Test
    @Tag("clean")
    void clean_first() {
    }

    @Test
    @Tag("clean")
    void clean_second() {
    }

    @Test
    @Tag("dirty")
    void dirty_first() {
    }

    @Test
    @Tag("dirty")
    void dirty_second() {
    }
}
```

이제, 해당 태그에 맞는 테스트 코드를 각각 실행시켜 보겠습니다.<br>

#### Gradle

gradle 설정을 통해 특정 태그에 대한 테스트만 수행할 수 있습니다.<br>
<br>


**특정 태그만 제외**

```gradle
tasks.named('test') {
    useJUnitPlatform {
        excludeTags 'dirty'
    }
}
```

**특정 태그만 포함**

```gradle
tasks.named('test') {
    useJUnitPlatform {
        includeTags 'clean'
    }
}
```

**gradle 명령을 통해 특정 태그만 수행**

```gradle
task cleanTest(type: Test) {
    useJUnitPlatform {
        includeTags 'clean'
    }
}
```

**결과**

<img width="948" alt="스크린샷 2022-07-09 오후 7 07 13" src="https://user-images.githubusercontent.com/60500649/178101202-097ef952-3fe7-4b39-80c9-00159ce2ac9d.png">

하지만, gradle 명령에 의존해야 하는 단점이 있습니다.<br>
<br>

#### Intellij

intelliJ 설정을 통해 특정 태그만 수행할 수 있습니다.<br>

1. Edit Configurations 을 들어갑니다.

<img width="369" alt="스크린샷 2022-07-09 오후 6 55 33" src="https://user-images.githubusercontent.com/60500649/178101284-85c51ff3-b73c-4f42-b1de-63244944f79a.png">

2. Add New Configuration 을 통해 JUnit 설정을 추가합니다.

<img width="488" alt="스크린샷 2022-07-09 오후 7 02 53" src="https://user-images.githubusercontent.com/60500649/178101313-9364edec-bc84-4add-92bb-c6e51d1a8c07.png">


3. 실행 방법을 Tags 로 선택합니다.

<img width="648" alt="스크린샷 2022-07-09 오후 7 03 34" src="https://user-images.githubusercontent.com/60500649/178101329-b574d90a-d6dc-44e3-90bf-7d9efbf17f71.png">

4. 실행하고자 하는 태그 이름을 작성합니다.

<img width="550" alt="스크린샷 2022-07-09 오후 7 03 54" src="https://user-images.githubusercontent.com/60500649/178101337-2744d1a7-eff7-4fe7-af5c-e500b41664e9.png">

5. 실행하면 작성한 태그만 실행됩니다.

<img width="948" alt="스크린샷 2022-07-09 오후 7 07 13" src="https://user-images.githubusercontent.com/60500649/178101342-1008be64-b1ab-4b17-b501-c61d3d7bac45.png">

### Custom annotation

Tag 를 custom annotation 으로 만들어 사용할 수 있습니다.<br>

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Test
@Tag("clean")
public @interface CleanTest {
}
```

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Test
@Tag("dirty")
public @interface DirtyTest {
}
```

@Target(ElementType.METHOD) : 메소드에서 사용할 것이라고 명시합니다.<br>
@Retention(RetentionPolicy.RUNTIME) : Runtime 동안(컴파일 이후) JVM 에서 참조가 가능합니다.<br>
@Test : 테스트 어노테이션 입니다.<br>
@Tag : 태그 어노테이션 입니다.<br>

<br>

추가한 커스텀 어노테이션을 적용해 봅시다.<br>

```java
public class CustomTagTet {

    @CleanTest
    void clean_first() {
    }

    @CleanTest
    void clean_second() {
    }

    @DirtyTest
    void dirty_first() {
    }

    @DirtyTest
    void dirty_second() {
    }
}
```

<br>

이제, gradle 설정에 dirty tag 는 제외하라는 스크립트를 붙여주고 테스트를 실행해 봅시다.<br>

```gradle
tasks.named('test') {
    useJUnitPlatform {
        excludeTags 'dirty'
    }
}
```

<img width="552" alt="image" src="https://user-images.githubusercontent.com/60500649/178264859-5e0acb1e-2d04-41b5-928e-f43d33c0ffe3.png">

원하는대로, 테스트가 태그를 필터링 해 돌고 있습니다.<br>

## Repeated test

JUNit Jupiter 에서, RepeatedTest annocation 을 통해 지정된 횟수만큼 테스트를 반복할 수 있습니다.<br>
RepeatedTest annotation 의 동작은 일반 @Test 메서드와 같은 .<br>
<br>

아래는 10번 반복되는 테스트입니다.<br>

```java
class OperatorTest {
    @RepeatedTest(10)
    void repeat_10() {
        assertThat(Operator.add(2, 3)).isEqualTo(5);
    }
}
```

<br>

RepeatedTest annotation 에서는 횟수뿐만 아니라, displayName property 를 통해 각 반복에 대한 이름을 정의할 수 있습니다.<br>
그리고 displayName 은 텍스트와 repetition 의 조합으로 구성할 수 있습니다.<br>
<br>

- {displayName}: RepeatedTest annotation 의 이름을 붙여줍니다.
- {currentRepetition}: 현재 반복 횟수를 표시합니다.
- {totalRepetitions}: 총 반복 횟수를 표시합니다.

<br>

RepeatedTest 의 기본 display name 은 다음과 같은 패턴을 갖습니다.<br>
`repeatation {currentRepetition} of {totalRepetition}` <br>

<img width="388" alt="스크린샷 2022-08-06 오후 5 21 24" src="https://user-images.githubusercontent.com/60500649/183241042-129b46b0-392d-4770-a8c1-a7b91a202498.png">

<br>

### Example

The RepeatedTestsDemo class at the end of this section demonstrates several examples of repeated tests.

The repeatedTest() method is identical to example from the previous section; whereas, repeatedTestWithRepetitionInfo() demonstrates how to have an instance of RepetitionInfo injected into a test to access the total number of repetitions for the current repeated test.

The next two methods demonstrate how to include a custom @DisplayName for the @RepeatedTest method in the display name of each repetition. customDisplayName() combines a custom display name with a custom pattern and then uses TestInfo to verify the format of the generated display name. Repeat! is the {displayName} which comes from the @DisplayName declaration, and 1/1 comes from {currentRepetition}/{totalRepetitions}. In contrast, customDisplayNameWithLongPattern() uses the aforementioned predefined RepeatedTest.LONG_DISPLAY_NAME pattern.

repeatedTestInGerman() demonstrates the ability to translate display names of repeated tests into foreign languages — in this case German, resulting in names for individual repetitions such as: Wiederholung 1 von 5, Wiederholung 2 von 5, etc.

Since the beforeEach() method is annotated with @BeforeEach it will get executed before each repetition of each repeated test. By having the TestInfo and RepetitionInfo injected into the method, we see that it’s possible to obtain information about the currently executing repeated test. Executing RepeatedTestsDemo with the INFO log level enabled results in the following output.

```
INFO: About to execute repetition 1 of 10 for repeatedTest
INFO: About to execute repetition 2 of 10 for repeatedTest
INFO: About to execute repetition 3 of 10 for repeatedTest
INFO: About to execute repetition 4 of 10 for repeatedTest
INFO: About to execute repetition 5 of 10 for repeatedTest
INFO: About to execute repetition 6 of 10 for repeatedTest
INFO: About to execute repetition 7 of 10 for repeatedTest
INFO: About to execute repetition 8 of 10 for repeatedTest
INFO: About to execute repetition 9 of 10 for repeatedTest
INFO: About to execute repetition 10 of 10 for repeatedTest
INFO: About to execute repetition 1 of 5 for repeatedTestWithRepetitionInfo
INFO: About to execute repetition 2 of 5 for repeatedTestWithRepetitionInfo
INFO: About to execute repetition 3 of 5 for repeatedTestWithRepetitionInfo
INFO: About to execute repetition 4 of 5 for repeatedTestWithRepetitionInfo
INFO: About to execute repetition 5 of 5 for repeatedTestWithRepetitionInfo
INFO: About to execute repetition 1 of 1 for customDisplayName
INFO: About to execute repetition 1 of 1 for customDisplayNameWithLongPattern
INFO: About to execute repetition 1 of 5 for repeatedTestInGerman
INFO: About to execute repetition 2 of 5 for repeatedTestInGerman
INFO: About to execute repetition 3 of 5 for repeatedTestInGerman
INFO: About to execute repetition 4 of 5 for repeatedTestInGerman
INFO: About to execute repetition 5 of 5 for repeatedTestInGerman
```

```java
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.logging.Logger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.RepetitionInfo;
import org.junit.jupiter.api.TestInfo;

class RepeatedTestsDemo {

    private Logger logger = // ...

    @BeforeEach
    void beforeEach(TestInfo testInfo, RepetitionInfo repetitionInfo) {
        int currentRepetition = repetitionInfo.getCurrentRepetition();
        int totalRepetitions = repetitionInfo.getTotalRepetitions();
        String methodName = testInfo.getTestMethod().get().getName();
        logger.info(String.format("About to execute repetition %d of %d for %s", //
            currentRepetition, totalRepetitions, methodName));
    }

    @RepeatedTest(10)
    void repeatedTest() {
        // ...
    }

    @RepeatedTest(5)
    void repeatedTestWithRepetitionInfo(RepetitionInfo repetitionInfo) {
        assertEquals(5, repetitionInfo.getTotalRepetitions());
    }

    @RepeatedTest(value = 1, name = "{displayName} {currentRepetition}/{totalRepetitions}")
    @DisplayName("Repeat!")
    void customDisplayName(TestInfo testInfo) {
        assertEquals("Repeat! 1/1", testInfo.getDisplayName());
    }

    @RepeatedTest(value = 1, name = RepeatedTest.LONG_DISPLAY_NAME)
    @DisplayName("Details...")
    void customDisplayNameWithLongPattern(TestInfo testInfo) {
        assertEquals("Details... :: repetition 1 of 1", testInfo.getDisplayName());
    }

    @RepeatedTest(value = 5, name = "Wiederholung {currentRepetition} von {totalRepetitions}")
    void repeatedTestInGerman() {
        // ...
    }

}
```

When using the ConsoleLauncher with the unicode theme enabled, execution of RepeatedTestsDemo results in the following output to the console.<br>
<br>

```
├─ RepeatedTestsDemo ✔
│  ├─ repeatedTest() ✔
│  │  ├─ repetition 1 of 10 ✔
│  │  ├─ repetition 2 of 10 ✔
│  │  ├─ repetition 3 of 10 ✔
│  │  ├─ repetition 4 of 10 ✔
│  │  ├─ repetition 5 of 10 ✔
│  │  ├─ repetition 6 of 10 ✔
│  │  ├─ repetition 7 of 10 ✔
│  │  ├─ repetition 8 of 10 ✔
│  │  ├─ repetition 9 of 10 ✔
│  │  └─ repetition 10 of 10 ✔
│  ├─ repeatedTestWithRepetitionInfo(RepetitionInfo) ✔
│  │  ├─ repetition 1 of 5 ✔
│  │  ├─ repetition 2 of 5 ✔
│  │  ├─ repetition 3 of 5 ✔
│  │  ├─ repetition 4 of 5 ✔
│  │  └─ repetition 5 of 5 ✔
│  ├─ Repeat! ✔
│  │  └─ Repeat! 1/1 ✔
│  ├─ Details... ✔
│  │  └─ Details... :: repetition 1 of 1 ✔
│  └─ repeatedTestInGerman() ✔
│     ├─ Wiederholung 1 von 5 ✔
│     ├─ Wiederholung 2 von 5 ✔
│     ├─ Wiederholung 3 von 5 ✔
│     ├─ Wiederholung 4 von 5 ✔
│     └─ Wiederholung 5 von 5 ✔
```

## Parameterized test

ParameterizedTest annotation 을 사용하면 서로 다른 인자를 통해 테스트를 여러번 동작시킬 수 있습니다.<br>
Test annotation 대신, ParameterizedTest annotation 을 사용합니다.<br>
<br>

아래는 ValueSource annotation 을 사용하여 String 배열을 인자로하는 Parameterized test 를 보여줍니다.

```java
@ParameterizedTest
@ValueSource(strings = { "racecar", "radar", "able was I ere I saw elba" })
void palindromes(String candidate) {
    assertTrue(StringUtils.isPalindrome(candidate));
}
```

위 테스트 메소드를 실행할 때 각 테스트 별로 동작하고, 결과가 노출됩니다.<br>

```
palindromes(String) ✔
├─ [1] candidate=racecar ✔
├─ [2] candidate=radar ✔
└─ [3] candidate=able was I ere I saw elba ✔
```

## Reference
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [JUnit wikipedia](https://en.wikipedia.org/wiki/JUnit)
- [JUnit 4 vs JUnit 5](https://pureainu.tistory.com/190)
- [JUnit Lifecycle](https://huisam.tistory.com/entry/junit)
- [JUnit Extension](https://junit.org/junit5/docs/5.3.0-M1/user-guide/index.html#extensions)
- [Javadoc MockitoExtension](https://javadoc.io/doc/org.mockito/mockito-junit-jupiter/latest/org/mockito/junit/jupiter/MockitoExtension.html)
