---
layout  : wiki
title   : Test
summary :
date    : 2022-01-22 22:38:00 +0900
updated : 2025-04-08 19:30:00 +0900
tag     : test
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Test

## 테스트란 무엇인가
테스트(Test) : 평가하다

## Performance Test

### Latency test

> 종단 트랜잭션에 걸리는 시간은?

### Throughput test

> 현재 시스템이 처리 가능한 동시 트랜잭션 개수는?

### Load test

> 특정 부하를 시스템이 감당할 수 있는가?

### Stress test

> 이 시스템의 한계점은 어디까지인가?

### Endurance test

> 시스템을 장시간 실행할 경우 성능 이상 증상이 나타나는가?

### Capacity planning test

> 리소스를 추가한 만큼 시스템이 확장되는가?

### Degradation

> 시스템이 부분적으로 실패할 경우 어떤 일이 벌어지는가?

## Test Tools

### **220620::mockito::inorder**
테스트 코드를 작성할 때, 관심있는 메소드에 대한 호출 여부를 파악할 때가 있습니다.<br>
보통 Mockito verify 메소드를 통해 확인하지만, 해당 메소드는 순서에 대한 보장은 하지 않습니다.<br>
<br>
이런 상황에선, InOrder 를 사용함으로써 순서를 보장할 수 있도록 합니다.<br>
<br>
사용법은 간단합니다.<br>
1. inOrder 메소드 내 Mock instance 를 인자로 넣습니다.
2. inOrder 의 verify 를 통해 순서대로 호출합니다.

#### Example)
```java
InOrder inOrder = inOrder(firstMock, secondMock);

inOrder.verify(firstMock).someMethod("was called first");
inOrder.verify(secondMock).someMethod("was called second");
```

같은 메소드가 여러번 호출됐는지 확인하려면 times 를 추가합니다.

```java
inOrder.verify(someMock, times(3)).someMethod("was called");
```

### **220621::mockito::ConsecutiveCalls**
우리는 테스트 코드를 작성할 때, 특정 메소드가 여러 번 호출되더라도 서로 다른 값을 반환해야 하는 상황이 생깁니다.<br>
이런 경우에 활용하면 좋은 방법을 공유합니다.<br>
<br>

#### Example)
```java
when(mock.someMethod("some arg"))
  .thenThrow(new RuntimeException())
  .thenReturn("foo");

 // Exception 이 발생합니다.
 mock.someMethod("some arg");

 // foo 를 출력합니다.
 System.out.println(mock.someMethod("some arg"));

 // foo 를 출력합니다.
 System.out.println(mock.someMethod("some arg"));
```

<br>

첫 번째 호출: RuntimeException 을 발생시킵니다.<br>
두 번째 호출: foo 를 반환합니다.<br>
이후 호출: foo 를 반환합니다.<br>
_정의한 횟수가 넘어가면, 마지막 스터빙이 동작합니다._<br>
<br>

더 짧게 사용할 수도 있습니다.<br>

<br>

```java
when(mock.someMethod("some arg"))
  .thenReturn("one", "two", "three");
```
<br>

하지만, chaining 방식을 사용하지 않고 아래와 같이 when 메소드를 여러번 사용하는 경우 항상 마지막 스터빙이 동작합니다.<br>

<br>

```java
when(mock.someMethod("some arg"))
  .thenReturn("one")
when(mock.someMethod("some arg"))
  .thenReturn("two")
```

<br>

호출 시 항상 two 를 반환합니다.<br>

### **220622::mockito::ArgumentCaptor**
테스트 시, 전달하는 인자를 확인할 수도 있습니다.<br>
마치 사진을 찍어놓고 해당 사진이 정확히 찍혔는지 확인하는 것처럼요.<br>
<br>

#### Example)

```java
ArgumentCaptor<Person> argument = ArgumentCaptor.forClass(Person.class);
verify(mock).doSomething(argument.capture());
assertEquals("Hyunjin", argument.getValue().getName()); 
```

### **220626::mockito::VerificationWithTimeout**
우리가 화이트박스 테스트를 하면서, 시간 초과를 확인할 수 있습니다.<br>
1. verify method 를 통해 동작합니다.
2. verify method 가 원하는 interaction 을 위해 지정된 시간 동안 대기합니다.
3. 하지만, 메소드가 호출되지 않는 경우 바로 실패합니다.

<br>

#### Example)
```java
// someMethod method 가 100ms 이내이면 통과합니다.
verify(mock, timeout(100)).someMethod();

// someMethod method 가 100ms 이내에서 두 번 호출되면 통과합니다.
verify(mock, timeout(100).times(2)).someMethod();

// 위와 동일합니다. atLeast method 는 적어도 두 번 호출한다는 뜻입니다.
verify(mock, timeout(100).atLeast(2)).someMethod();
```

<br>

하지만, 해당 메소드를 통해 테스트하는 것이 정말 좋은 방법인가에 대한 것은 생각해 봐야겠습니다.

### **220627::mockito::VerifyNoMoreInteractions**

mock 객체에서 더이상 호출하는 메소드가 없음을 확인할 수 있습니다.<br>

<br>

#### Example)

```java
// 메소드 호출
mock.doSomething();
mock.doSomethingUnexpected();

// 동작 확인
verify(mock).doSomething();

// doSomethingUnexpected 메소드가 호출되기 때문에 실패합니다.
verifyNoMoreInteractions(mock);
```

verifyNoMoreInteractions 의 동작 여부 확인 범위는 setUp method 도 포함됩니다. (@Before)<br>
<br>

해당 메소드의 경우에는 객체 그 자체의 상호작용을 확인하기 때문에 명시적이지 않다고 생각합니다. (mockito reference 에서 한 말을 빌리자면..)<br>
저의 경우에는 해당 메소드보다, never() 를 통해 각 메소드 별 동작 여부를 확인합니다.<br>
비교적 명시적이기 때문이죠.<br>
<br>

### **220628::mockito::Reset**

mock 객체의 스텁과 호출한 메소드를 모두 초기화할 수 있습니다.<br>

#### Example)

```java
List mock = mock(List.class);
when(mock.size()).thenReturn(10);
mock.add(1);

// 해당 시점에 mock 객체는 인지하고 있던 모든 stub 과 interaction 을 잊게 됩니다.
reset(mock);
```

저는 해당 메소드를 알게 되면서 좋은 점이 생겼습니다.<br>
바로 reset method 를 사용하는 순간이 온다면, 그건 테스트를 잘못했다는 것의 증거가 되기 때문입니다.<br>
<br>
mock 객체의 초기화를 통해 알고자 하는 정보가 있을까요?<br>
<br>
저는 한 테스트에서는 한 가지만 봐야한다고 생각합니다. 객체의 단일 행동에 집중해야 하기 때문이죠.<br>
객체의 초기화가 필요하다면, 그것은 한 번의 테스트에서 여러가지를 확인하고자 하는 경우일 겁니다.<br>
이런 경우에는 잘못됐다는 인지를 할 수 있으며, 작성하던 테스트 코드를 다시한 번 생각할 수 있다고 생각합니다.<br>
<br>
저에겐 reset method 를 사용하지 않기 위해 존재하는 reset method 같은 기분이 드네요.<br>
(참고로 mockito reference 에서도 사용하지 않는 것을 권장합니다)<br>
<br>

### **220630::mockito::verify::AtLeast**

mock 객체 메소드에 대해 최소한의 호출을 확인할 수 있습니다.<br>

#### Example)

```java
// 적어도 세 번 호출하면 성공합니다.
verify(mock, atLeast(3)).someMethod("some arg");

// 적어도 한 번 호출하면 성공합니다.
verify(mock, atLeastOnce()).someMethod("some arg");
```

아직 해당 메소드를 사용한 적이 없습니다.<br>
보통은 모두 times 를 사용해서 호출 횟수에 대한 테스트를 진행했죠.<br>
아마, 정확한 횟수보다는 융통성을 요구할 때 사용할 거라 생각됩니다.<br>
<br>
사용하는 케이스가 있다면, 말씀해 주셔도 좋을 것 같습니다!<br>


### **220705::springtest::DirtiesContext**

@DirtiesContext Annotation 을 통해 Test life cycle 마다 Application context 를 다시 생성할 수 있습니다.<br>
Method 와 Class 에 해당 Annotation 을 달 수 있습니다.<br>
<br>
예시 코드를 확인해 보겠습니다.<br>

#### Example)

예시를 위한 Class 를 정의해 줬습니다.

**User**

```java
public class User {
}
```

<br>

**UserCache**

```java
@Component
public class UserCache {

    private List<User> userList = new ArrayList<>();

    public List<User> getUserList() {
        return userList;
    }

    public void addUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException();
        }

        userList.add(user);
    }
}
```

<br>

정의한 예시 클래스를 통해 간단한 SpringTest 를 진행해 보겠습니다.<br>
<br>

먼저, 테스트 클래스에 필요한 어노테이션을 정의해 줍니다.<br>

```java
@ExtendWith(MockitoExtension.class)
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
public class DirtiesContextTest
```

- SpringBootTest 를 위한 어노테이션을 정의했습니다.
- Mock 어노테이션을 사용한 객체의 생성을 위해 MockitoExtension 을 정의했습니다.
- 각 테스트 메소드 실행의 순서를 보장하기 위해 TestMethodOrder 를 정의했습니다.

<br>


먼저, DirtiesContext 를 사용하지 않고 테스트를 진행해 보겠습니다.<br>

```java
@Autowired
private UserCache sut;

@Mock
User user_1;

@Test
@Order(1)
void user_1_을_추가합니다() {
    sut.addUser(user_1);

    assertThat(sut.getUserList().size()).isEqualTo(1);
}

@Test
@Order(2)
void user_list_를_확인합니다() {
    assertThat(sut.getUserList().size()).isEqualTo(1);
}
```

1. 유저를 UserCache 에 추가한 후 유저 리스트의 길이를 확인합니다.
2. 다음 테스트에서도 유저 리스트의 길이가 유지되는지 확인합니다.

<br>

당연하게도, 해당 테스트는 통과합니다.<br>

<img width="369" alt="image" src="https://user-images.githubusercontent.com/60500649/177319917-e4cc5a2c-8966-4d8d-a8c8-00db48dc187c.png">

Spring Application Context 가 유지되면서 추가되었던 유저가 계속 존재하게 되는 현상이죠.<br>
<br>

우리는 이번에 DirtiesContext 를 통해 다음 테스트로 넘어갈 때에도, 해당 정보가 유지되지 않게 설정해 보려 합니다.<br>
DirtiesContext Annotation 은 spring-test package 하위에 존재합니다.<br>

```java
@Test
@Order(3)
void user_1_을_다시_한_번_추가합니다() {
    sut.addUser(user_1);

    assertThat(sut.getUserList().size()).isEqualTo(2);
}

@Test
@Order(4)
@DirtiesContext(methodMode = BEFORE_METHOD)
void user_list_를_확인합니다_with_dirties_context() {
    assertThat(sut.getUserList().size()).isEqualTo(0);
}
```

기존에 존재하던 테스트에서 위 테스트를 추가했습니다.<br>

1. 기존 테스트를 통해 1인 유저리스트에 user 를 추가합니다. 당연하게도 길이는 2 입니다.
2. 하지만 해당 테스트에서 @DirtiesContext annotation 을 통해 context 를 재설정했습니다. 길이는 0 이 됩니다.

<br>

감동적이게도, 모든 테스트가 정상적으로 돌아가는 것을 확인할 수 있습니다.<br>

<img width="346" alt="image" src="https://user-images.githubusercontent.com/60500649/177320752-d6d1efd6-b286-4fe1-872d-93bc1863c2a1.png">


확인된 것과 같이, DirtiesContext 는 Spring test 의 application context 를 재설정할 수 있다는 장점이 있습니다.<br>
물론, 재설정하면서 테스트 실행 시간은 쭉쭉 늘어나죠.<br>

<br>

#### Supported

DirtiesContext 를 통해 지원하는 동작 리스트입니다 !

**Class level**
테스트 클래스에 대한 ClassMode 옵션은 컨텍스트가 재설정되는 시기를 정의합니다.

- BEFORE_CLASS: 현재 Test class 의 동작 전
- BEFORE_EACH_TEST_METHOD: 현재 Test class 의 각 test method 실행 전
- AFTER_EACH_TEST_METHOD: 현재 Test class 의 각 test method 실행 전
- AFTER_CLASS: 현재 Test class 의 동작 후

**Method level**
개별 메서드에 대한 MethodMode 옵션은 컨텍스트가 재설정되는 시기를 정의 합니다 .

- BEFORE_METHOD: Test method 실행 전
- AFTER_METHOD : Test method 실행 후


### **220706::mockito::MockStaticMethod**

우리는 테스트를 위해 특정 클래스를 Mocking 합니다.<br>
Mocking 된 객체를 통해 특정 메소드가 원하는 값을 반환하도록 명령하고, 또는 어떤 동작을 하라고 미리 정의해 두기도 하죠.<br>
<br>
하지만 클래스에 존재하는 static method 를 통해 stub 을 적용하거나, mocking 을 시도하는 데에 있어서 어려움을 겪습니다.<br>
기존에 우리가 사용하던 Mock 은 static method 가 아니라 객체를 위해 사용되기 때문이죠.<br>

<br>

#### Failed example)

특정 상황을 예시로 들어보겠습니다.<br>

```java
@Test
void 이름을_가진_유저를_생성합니다() {
    User actual = new User(NAME);

    assertThat(actual.getName()).isEqualTo(NAME);
}

@Test
void super_유저를_생성합니다() {
    User actual = User.superUserOf();

    assertThat(actual.getName()).isEqualTo("super");
}
```

1. User 클래스가 존재합니다.
2. User 는 name 을 갖습니다.
3. User 클래스는 superUser 를 생성하는 static method 가 존재합니다.
4. superUser 의 name 은 super 입니다.

<br>

이런 상황에서, superUser 가 super 라는 이름 대신 currenjin 이라는 이름을 갖도록 하고싶습니다.<br>
<br>

given 을 통해 static method 의 반환 값을 의도적으로 정의해 보려 하겠습니다.<br>

```java
@Mock
User user;

@Test
void super_유저를_생성합니다() {
    given(User.superUserOf()).willReturn(new User(SUPER_USER_NAME));

    User actual = User.superUserOf();

    assertThat(actual.getName()).isEqualTo(SUPER_USER_NAME);
}
```

실행을 하면, 당연하게도 실패합니다. 에러 메시지를 보세요.<br>

```java
when() requires an argument which has to be 'a method call on a mock'.
For example:
    when(mock.getArticles()).thenReturn(articles);
```

<br>

특정 호출에 대한 반환 값을 정의하려면 mock 의 method 여야 합니다.<br>
static method 를 어떻게 mocking 할 수 있을까요?
<br>

#### mockStatic

mockStatic 을 사용할 수 있습니다.<br>
mockito version 3.4.0 이상부터 지원한다고 합니다.<br>

<br>

의존성

```java
testImplementation 'org.mockito:mockito-inline:3.6.0'
```

<br>

```java
@Test
void super_유저를_생성합니다() {
    MockedStatic<User> user = mockStatic(User.class);
    given(User.superUserOf()).willReturn(new User(CURRENJIN));

    User actual = User.superUserOf();

    assertThat(actual.getName()).isEqualTo(CURRENJIN);
    user.close();
}
```

1. Mocking 하기 위한 클래스를 MockedStatic 객체로 정의해 줍니다.
2. 원하던 작업을 합니다.
3. 테스트가 끝났다면, MockedStatic 객체를 close 합니다.

close 를 해줘야 하는 이유는 한 스레드에서 등록할 수 있는 static mock 은 한 개이기 때문입니다.<br>
만약 제거해 주지 않으면 이미 등록되었다는 에러가 발생합니다.<br>

```java
For com.currenjin.learningtest.mockedstatic.User, static mocking is already registered in the current thread
```

<br>

전체적으로 간단하다고 생각합니다. 근데, 보기 좀 불편하니 BeforeEach/AfterEach 로 옮겨줍시다.<br>

```java
private MockedStatic user;

@BeforeEach
void beforeEach() {
    user = mockStatic(User.class);
}

@AfterEach
void afterEach() {
    user.close();
}

@Test
void super_유저를_생성합니다() {
    given(User.superUserOf()).willReturn(new User(CURRENJIN));

    User actual = User.superUserOf();

    assertThat(actual.getName()).isEqualTo(CURRENJIN);
}
```

테스트 정상적으로 성공합니다.<br>

### **220707::mockito::AtMost**

mock 객체 메소드에 대해 최대한의 호출을 확인할 수 있습니다.<br>

#### Example)

```java
// 세 번 이하로 호출됐으면 성공합니다.
verify(mock, atMost(3)).someMethod("some arg");

// 한 번 호출됐으면 성공합니다.
verify(mock, atMostOnce()).someMethod("some arg");
```

아직 해당 메소드를 사용한 적이 없습니다.<br>
보통은 모두 times 를 사용해서 호출 횟수에 대한 테스트를 진행했죠.<br>
아마, 정확한 횟수보다는 융통성을 요구할 때 사용할 거라 생각됩니다.<br>
<br>
사용하는 케이스가 있다면, 말씀해 주셔도 좋을 것 같습니다!<br>

### **220708::mockito::Tag**
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


### **220709::mockito::Tag::Filtering**

각 테스트 클래스 및 메소드에는 태깅을 할 수 있습니다.<br>
오늘은 태깅한 메소드를 필터링 해 테스트하는 것을 시연해 보겠습니다.<br>
<br>

#### Example)

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

**Gradle**

gradle 설정을 통해 특정 태그에 대한 테스트만 수행할 수 있습니다.<br>
<br>


_특정 태그만 제외_

```gradle
tasks.named('test') {
    useJUnitPlatform {
        excludeTags 'dirty'
    }
}
```

_특정 태그만 포함_

```gradle
tasks.named('test') {
    useJUnitPlatform {
        includeTags 'clean'
    }
}
```

_gradle 명령을 통해 특정 태그만 수행_

```gradle
task cleanTest(type: Test) {
    useJUnitPlatform {
        includeTags 'clean'
    }
}
```

_결과_

<img width="948" alt="스크린샷 2022-07-09 오후 7 07 13" src="https://user-images.githubusercontent.com/60500649/178101202-097ef952-3fe7-4b39-80c9-00159ce2ac9d.png">

하지만, gradle 명령에 의존해야 하는 단점이 있습니다.<br>
<br>

**Intellij**

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

### **220711::mockito::Tag::CustomAnnotation**

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

### **220712::trevari::Elsa::CustomAnnotation**

오늘은 어떤 지식을 전달한다기 보다, 지식을 얻고자 작성합니다.<br>
<br>

일단 아래 코드를 봐주세요.<br>

```java
@Test
void 서비스가_해지되면_상태변경_이벤트를_발행한다() {
    Elsa.freeze(purchasedAt);

    ...
    ...
}
```

저는 해당 테스트 코드에서 Elsa.freeze() 를 꼭 추가해 줘야 하나? 생각했습니다.<br>
저런 정보들이 물론 있어야 하는 정보이지만, 굳이 메소드 내에 존재하면서 자리를 차지할 필요는 없다고 생각했어요.<br>
그리고, 테스트를 위해서 Elsa 가 무엇을 하는 클래스인지 알아야 했죠.<br>
<br>
결론부터 말하자면, 아래와 같이 바꾸고 싶었습니다.<br>

```java
@ClockFreezeTest(purchasedAt)
void 서비스가_해지되면_상태변경_이벤트를_발행한다() {
  ...
  ...
}
```

바뀐 annotation 이 눈에 들어오실 겁니다.<br>
적용하게 되면, 이 테스트가 실행되기 위해서 무엇이 선행되어야 하는지를 명시적으로 나타낼 수 있다고 생각했죠.<br>
<br>

하지만, 적용하는게 순탄하지 않더군요.<br>
가장 큰 이슈는 Annotation 의 field 에는 LocalDateTime 을 추가할 수 없었습니다.<br>
<br>

```java
@Target({ ElementType.ANNOTATION_TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Test
public @interface ClockFreezeTest {
    LocalDateTime value();
}
```

위와 같이 적용하니 해당 에러가 발생하더군요.<br>

```java
Invalid type 'LocalDateTime' for annotation member
```

<br>

이해할 수 없었습니다.<br>
왜 annotation member 는 LocalDateTime 을 가질 수 없는지?<br>
그렇다면 String 으로 변환해 다시 파싱하는 불필요한 작업을 해야하나?<br>
<br>

글을 작성하는 시점에선 이런 의문으로 멈춘 상태입니다.<br>
<br>

만약, LocalDateTime 을 사용할 수 있게 된다면 JUnit life cycle 을 intercepter 해서 아래와 같은 코드로 annotation 을 완성할 수 있을 것 같습니다.<br>
더 나아가면, 라이브러리로 적용하여 우리 프로젝트에서 공통화된 형식으로 더욱 편리하게 사용할 수 있게될 거라고 생각합니다.<br>

```java
@Target({ ElementType.ANNOTATION_TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Test
public @interface ClockFreezeTest {
    LocalDateTime value();

    class ClockFreezer implements BeforeEachCallback, AfterEachCallback {

        @Override
        public void beforeEach(ExtensionContext context) throws Exception {
            Elsa.freeze(ClockFreezeTest::value);
        }

        @Override
        public void afterEach(ExtensionContext context) throws Exception {
            Elsa.rollback();
        }
    }
}
```

의견 부탁드립니다. 감사합니다.


### **220713::trevari::Elsa::CustomAnnotation**

오늘은 어떤 지식을 전달한다기 보다, 지식을 얻고자 작성합니다.<br>
<br>

일단, Elsa.freeze 를 어노테이션으로 사용할 수 있도록 하려 했습니다.<br>
이를 위해서 Custom annotation 을 제작하려고 했죠.<br>
Custom annotation 을 만들던 중 annotation member 에는 LocalDateTime 타입이 들어가지 못한다는 것을 알았습니다.<br>
<br>

저는 먼저, 빠르게 동작하는 소프트웨어를 만들기 위해 생각했습니다.<br>

1. Custom annotation 의 value 에는 날짜를 정해진 포맷의 String 타입으로 보낸다.
2. Test life cycle 내 beforeEach 에서 해당 문자열을 파싱해, LocalDateTime 으로 만든다.
3. 해당 값으로 Elsa.freeze() 를 호출한다.

<br>

그래서 작성한 코드입니다.

#### Custom annotation

```java
@Target({ ElementType.ANNOTATION_TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Test
public @interface ClockFreezeTest {
    String value() default "";
}
```

#### Interceptor

```java
public class Interceptor implements BeforeEachCallback, AfterEachCallback {
    @Override
    public void beforeEach(ExtensionContext context) {

        Method testMethod = context.getTestMethod().orElseThrow(IllegalStateException::new);
        ClockFreezeTest methodAnn = AnnotatedElementUtils.findMergedAnnotation(testMethod, ClockFreezeTest.class);

        if (methodAnn == null) {
            return;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime dateTime = LocalDateTime.parse(methodAnn.value(), formatter);

        Elsa.freeze(dateTime);
    }

    @Override
    public void afterEach(ExtensionContext context) {
        Elsa.rollback();
    }
}
```

#### Example test

```java
@ExtendWith(Interceptor.class)
class TicketExpireTest {

    private static final LocalDateTime EXPIRE_DATE = LocalDateTime.of(2021, 12, 20, 0, 0);
    private static Ticket TICKET;

    @ClockFreezeTest("2021-12-19 23:59:59")
    void 티켓_만료일_이전엔_만료될_티켓이_아니다() {
        TICKET = new Ticket(null, null, EXPIRE_DATE);

        // |-----만료여부확인-----티켓만료-----|
        // |-------19-----------20--------|
        assertThat(TICKET.willBeExpired()).isFalse();
    }
}
```

#### 결과
해당 테스트를 돌려보았지만, 실패합니다.<br>
확인해 보니, 테스트하는 도메인 메소드에서 현재 시각을 가져올 때, freeze 한 날짜가 나오지 않더군요.<br>

**Capture freeze**

<img width="649" alt="image" src="https://user-images.githubusercontent.com/60500649/178736232-43ecfc6e-9e3f-436d-b8a9-a6c259f05ecf.png">

<br>

**Capture now**

<img width="850" alt="image" src="https://user-images.githubusercontent.com/60500649/178736437-0797e92f-8025-4827-99d4-f8b28e4f24df.png">

<br>

freeze 를 시도하는 BeforeEach override method 와, Clocks 객체의 Life cycle 가 서로 다르다는 생각을 하고 있으나,<br>
현재는 해당 부분에서 막힌 상태입니다.<br>
<br>

혹시 의심가는 부분이 있거나, 의견이 있으시면 말씀 부탁드립니다. 감사합니다.<br>

### **220714::trevari::Elsa::CustomAnnotation**

오늘은 어떤 지식을 전달한다기 보다, 지식을 얻고자 작성합니다.<br>
소스코드는 [여기](https://github.com/trevari/wallet/pull/103) 있습니다.<br>
<br>


#### 이슈 해결

전 날, 이슈가 있었습니다.<br>
시간을 멈춰도, 멈춘 시간대로 가져오질 못 했던 점이죠.<br>

**Capture freeze**

<img width="649" alt="image" src="https://user-images.githubusercontent.com/60500649/178736232-43ecfc6e-9e3f-436d-b8a9-a6c259f05ecf.png">

<br>

**Capture now**

<img width="850" alt="image" src="https://user-images.githubusercontent.com/60500649/178736437-0797e92f-8025-4827-99d4-f8b28e4f24df.png">

<br>

원인을 파악하기 위해, Clocks 객체의 시간이 freeze 되는지 break point 를 걸어 확인했습니다.<br>
<br>

정상적인 상황이라면, 아래와 같이 시간이 지정되어야 하지만

<img width="532" alt="image" src="https://user-images.githubusercontent.com/60500649/178971253-7ecc879f-3953-4b7f-82fd-c35d13bbed19.png">

<br>

실제 객체에서 시간이 정의되지 않은 것을 확인했습니다.

<img width="542" alt="스크린샷 2022-07-14 오후 7 51 29" src="https://user-images.githubusercontent.com/60500649/178971465-b8e1c459-a9fd-40f3-86a1-15d71f6f007c.png">

<br>

문제를 더 좁혀, freeze 의 호출을 확인해 보았는데, 호출되지 않더군요.<br>
<br>

그렇게 알게 된 사실이 있습니다.<br>
interceptor 에서 library 화 된 Clocks 를 사용했지만, 실제 도메인 코드에선 같은 패키지 디렉토리 내에 있는 Clocks 를 사용했던 것입니다.<br>
<br>

라이브러리화 된 지금에서는 모듈 내에 정의된 Clocks 파일들을 제거해야 된다는 생각이 들었습니다.<br>
<br>

#### 결과

Custom annotation 을 통해 시간을 freeze 한 후, 테스트를 진행해보니 잘 동작하는 것을 확인할 수 있었습니다.<br>

<img width="788" alt="image" src="https://user-images.githubusercontent.com/60500649/178972651-dbcf6a0d-949e-44d9-973a-6ec20a1e63a5.png">

#### 필요 개선점

**첫 번째, Interceptor 를 꼭 써야하나?**

```java
@ExtendWith(Interceptor.class)
class TicketExpireTest {
}
```

_시간을 멈추는 테스트를 하기 위해, Interceptor 를 확장해야 한다._<br>
문장부터 어색합니다. 굳이 붙이지 않고, ClockFreezeTest annotation 만 사용해서 테스트를 진행할 수도 있지 않을까 싶습니다.<br>
하지만, 마땅한 방법이 생각나지 않습니다.<br>
<br>

**두 번째, ClockFreezeTest 에 전달하는 값을 LocalDateTime 으로 할 수 없을까?**

```java
@ClockFreezeTest("2021-12-21 00:00:00")
void 티켓_만료일_이후엔_만료될_티켓이다() {
}
```

위와 같이 멈출 시간을 정의할 때, 문자열과 정해진 포맷으로 전달해야한다는 불편함이 있습니다.<br>
String 으로 하게된 이유는 annotation member 에 LocalDateTime 을 지정할 수 없었기 때문입니다.<br>
덕분에, Interceptor 를 통해 파싱하는 작업을 추가로 붙여야 했었죠.<br>
그냥 이전에 사용했던 것처럼 EXPIRE_DATE.plusDays(1) 과 같은 값을 넘기면 어떨까 싶습니다.<br>
이또한, 마땅한 방법이 생각나지 않습니다.<br>
<br>

기본적으로 이런 점들이 개선된다면, 적어도 라이브러리화 시킬 수 있겠다 라는 생각을 합니다.<br>
의견 부탁드립니다.<br>
[링크](https://github.com/trevari/wallet/pull/103)<br>
<br>

### **220715::trevari::Elsa::CustomAnnotation**

오늘은 전날 발송했던 메일에 대해서 피드백받은 내용을 정리합니다.<br>
<br>

#### Annotation 은 Test 와 분리한다.

**Before**

```java
@ClockFreezeTest("2021-12-21 00:00:00")
void 티켓_만료일_이후엔_만료될_티켓이다() {
}
```

**After**

```java
@Test
@ClockFreeze("2021-12-21 00:00:00")
void 티켓_만료일_이후엔_만료될_티켓이다() {
}
```

ClockFreezeTest 어노테이션을 Test 와 함께 사용했었지만, 해당 어노테이션의 목적이 다르기 때문에 분리합니다.<br>
<br>

#### Interceptor 를 확장하는것은 필수다.

```java
@ExtendWith(Interceptor.class)
class TicketExpireTest {
}
```

보이는게 거슬려 제거하고싶었지만, JUnit life cycle 을 intercept 하는 것은 해당 구현체의 역할이기 때문에 확장이 필요하다.<br>
<br>

#### ClockFreezeTest 의 값에 들어가는게 String 이어도 괜찮다.

```java
@ClockFreeze("2021-12-21 00:00:00")
```

이또한, String 값으로 넘겨가며 파싱까지 해야하는 번거로움이 있어 제거하고 싶었습니다.<br>
하지만 생각보다 다들 괜찮아 하는 것 같아서 유지하기로 했습니다.<br>
<br>

다만, Enum 값으로 정의할 수도 있고, 날짜를 만들기 위한 static 메소드를 생성할 수도 있겠다고 피드백을 받았습니다.<br>
해당 부분은 더 디벨롭해 보겠습니다.<br>
<br>

#### 기타

전체적으로 재밌었던 작업이어서, 프로젝트에 적용하는데에 욕심이 생겼습니다.<br>
오늘 시간내 들어주시고, 피드백도 해주셔서 감사합니다.<br>

### **220717::currenjin::PlanetaryOrbitalCalculator::Orbit**

제가 혼자 즐기기 시작한 작업이 있습니다.<br>
태양계 궤도를 계산하는 계산기를 만들어 주는 것인데요.<br>
<br>

오늘은 이론적인 부분에 대한 서치를 통해 시간을 많이 썼습니다.<br>
이에 따라 진행했던 테스트에 대해서만 작성합니다.<br>
<br>

태양계의 모든 행성들의 궤도 데이터를 담는 객체가 필요했습니다.<br>

```java
@Test
void 궤도를_생성합니다() {
    Orbit actual = Orbit.of(LONG_RADIUS,
            ECCENTRICITY,
            INCLINATION,
            LONGITUDE_OF_ASCENDING_NODE,
            AVERAGE_LONGITUDE,
            PERIHELION_LONGITUDE);

    assertThat(actual).isInstanceOf(Orbit.class);
}
```

날짜별 행성의 위치 계산에 필요한 궤도 데이터가 정의되어야 했기에, 제가 필요한 데이터들을 생성자로 넣어줬습니다.<br>
그리고, 그 객체가 Orbit 인지 확인했죠.<br>
<br>

처음엔 빠르게 통과시키기 위해, 빈 객체를 반환했습니다.<br>
<br>

통과하는 상태에서 다음 스텝을 나아갔습니다.<br>

```java
@Test
void 궤도_데이터가_삽입한_데이터와_일치합니다() {
    Orbit actual = Orbit.of(LONG_RADIUS,
            ECCENTRICITY,
            INCLINATION,
            LONGITUDE_OF_ASCENDING_NODE,
            AVERAGE_LONGITUDE,
            PERIHELION_LONGITUDE);

    assertThat(actual.getLongRadius()).isEqualTo(LONG_RADIUS);
    assertThat(actual.getEccentricity()).isEqualTo(ECCENTRICITY);
    assertThat(actual.getInclination()).isEqualTo(INCLINATION);
    assertThat(actual.getLongitudeOfAscendingNode()).isEqualTo(LONGITUDE_OF_ASCENDING_NODE);
    assertThat(actual.getAverageLongitude()).isEqualTo(AVERAGE_LONGITUDE);
    assertThat(actual.getPerihelionLongitude()).isEqualTo(PERIHELION_LONGITUDE);
}
```

조금 장황하긴 하지만, 해당 궤도 데이터가 잘 들어가는지 확인이 필요했기에 작성한 테스트입니다.<br>
이 테스트는 빈 객체를 반환하기만하면 성공하지 못합니다.<br>
그렇기에 해당 값을 가진 객체를 생성하도록 한 후 Getter 메소드를 추가해 테스트를 성공시켰습니다.<br>

```java
public class Orbit {
    public static Orbit of(Double longRadius,
                           Double eccentricity,
                           Double inclination,
                           Double longitudeOfAscendingNode,
                           Double averageLongitude,
                           Double perihelionLongitude) {
        return new Orbit(longRadius, eccentricity, inclination, longitudeOfAscendingNode, averageLongitude, perihelionLongitude);
    }

    private final Double longRadius;
    private final Double eccentricity;
    private final Double inclination;
    private final Double longitudeOfAscendingNode;
    private final Double averageLongitude;
    private final Double perihelionLongitude;

    protected Orbit(Double longRadius, Double eccentricity, Double inclination, Double longitudeOfAscendingNode, Double averageLongitude, Double perihelionLongitude) {

        this.longRadius = longRadius;
        this.eccentricity = eccentricity;
        this.inclination = inclination;
        this.longitudeOfAscendingNode = longitudeOfAscendingNode;
        this.averageLongitude = averageLongitude;
        this.perihelionLongitude = perihelionLongitude;
    }

    public Double getLongRadius() {
        return longRadius;
    }

    public Double getEccentricity() {
        return eccentricity;
    }

    public Double getInclination() {
        return inclination;
    }

    public Double getLongitudeOfAscendingNode() {
        return longitudeOfAscendingNode;
    }

    public Double getAverageLongitude() {
        return averageLongitude;
    }

    public Double getPerihelionLongitude() {
        return perihelionLongitude;
    }
}
```

Lombok 을 사용하지 않아 좀 장황하게 됐습니다.<br>
어쨌던 테스트는 성공합니다.<br>
<br>

이제 그릇은 만들어졌고, 태양계 행성 각각의 궤도 데이터를 담아야 했습니다.<br>
행성 각각의 데이터는 정의한 궤도 데이터에 추가로 필요한 데이터가 있습니다.<br>

- AU: 태양과 행성까지의 거리(km)
- Change per century: 세기 당 궤도 데이터 변화량

모든 궤도 데이터는 이미 계산되어 있어 저는 갖다 쓰기만 하면 됩니다.<br>
마찬가지로, 담을 그릇이 필요했죠.<br>
새로운 그릇을 추가했습니다.<br>

```java
@Test
void 지구_궤도를_생성합니다() {
    PlanetOrbit actual = PlanetOrbit.of(EARTH.LONG_RADIUS,
            EARTH.ECCENTRICITY,
            EARTH.INCLINATION,
            EARTH.LONGITUDE_OF_ASCENDING_NODE,
            EARTH.AVERAGE_LONGITUDE,
            EARTH.PERIHELION_LONGITUDE,
            EARTH.AU,
            EARTH.CHANGE_PER_CENTURY);

    assertThat(actual).isInstanceOf(Orbit.class);
    assertThat(actual.getAu()).isEqualTo(EARTH.AU);
    assertThat(actual.getChangePerCentury()).isEqualTo(EARTH.CHANGE_PER_CENTURY);
}
```

먼저 선택된 건 지구입니다.<br>
지구에 대한 모든 궤도 데이터는 클래스의 스태틱 필드로 만들어 가져오게 했습니다.<br>

```java
public class EARTH {
  public static final Double AU = 149597870.0;

  public static final Double LONG_RADIUS = 1.00000261 * AU;
  public static final Double ECCENTRICITY = 0.01671123;
  public static final Double INCLINATION = -0.00001531;
  public static final Double LONGITUDE_OF_ASCENDING_NODE = 0.0;
  public static final Double AVERAGE_LONGITUDE = 100.46457166;
  public static final Double PERIHELION_LONGITUDE = 102.93768193;

  public static final Orbit CHANGE_PER_CENTURY = Orbit.of(
          0.00000562 * AU,
          -0.00004392,
          -0.01294668,
          0.0,
          35999.37244981,
          0.32327364);
}
```

<br>

이제 테스트를 빠르게 성공시키기 위해서 PlanetOrbit 클래스를 생성했습니다.<br>
PlanetOrbit 클래스는 Orbit 을 상속했고, AU 와 Change per Century 필드가 추가되었습니다.

```java
public class PlanetOrbit extends Orbit {

  public static PlanetOrbit of(Double longRadius,
                         Double eccentricity,
                         Double inclination,
                         Double longitudeOfAscendingNode,
                         Double averageLongitude,
                         Double perihelionLongitude,
                         Double au,
                         Orbit changePerCentury) {

      return new PlanetOrbit(longRadius, eccentricity, inclination, longitudeOfAscendingNode, averageLongitude, perihelionLongitude, au, changePerCentury);
  }

  private final Double au;
  private final Orbit changePerCentury;

  private PlanetOrbit(Double longRadius, Double eccentricity, Double inclination, Double longitudeOfAscendingNode, Double averageLongitude, Double perihelionLongitude, Double au, Orbit changePerCentury) {
      super(longRadius, eccentricity, inclination, longitudeOfAscendingNode, averageLongitude, perihelionLongitude);
      this.au = au;
      this.changePerCentury = changePerCentury;
  }

  public Orbit getChangePerCentury() {
      return this.changePerCentury;
  }

  public Double getAu() {
      return this.au;
  }
}
```

현재는 여기까지 작업을 마무리한 상태입니다.<br>
지금은 정해진 값들을 정해진 위치에 넣는 것 뿐이라 그저 그렇겠지만, 이 시기가 끝나면 훨씬 재밌는 테스트로 찾아뵐 수 있을 거라 생각합니다.<br>
감사합니다.<br>

### **220718::currenjin::PlanetaryOrbitalCalculator::JulianClock**

이전에 정의했던 궤도의 기본 요소들은 역기점인 J2000 때 측정된 값입니다.<br>
<br>

역기점은 천문학에서 천체의 궤도 요소의 기준이 되는, 관측 또는 예측이 된 시기를 의미합니다.<br>
국제 천문 연맹에서는, 1984 년부터 J2000.0 을 사용하기로 결정했죠.<br>
J 는 1년을 365.25 일로 산정하는 율리우스력을 의미하며, 2000.0 은 2000 년부터 시작되는 것을 의미합니다.<br>
<br>

오늘은 작업하면서 사용할 시간을 역기점을 기준으로 측정할 수 있도록 해주는 유틸리티를 TDD 로 구현합니다.<br>
<br>

처음엔, 기본적으로 역기점으로부터 하루가 지났음을 테스트했습니다.<br>
TimeFreezer(aka. Elsa) 를 통해 시간을 얼리고, 날짜가 얼마나 지났는지 확인했습니다.<br>

```java
@Test
void 역기점으로부터_하루가_지났다() {
    TimeFreezer.freeze(J2000.plusDays(1));

    assertThat(sut.elapsedDate()).isEqualTo(1);
}
```

필요한 로직을 정의했습니다.<br>

```java
private static final LocalDateTime J2000 = LocalDateTime.of(2000, 1, 1, 12, 0, 0);
private final int DAY = 60 * 60 * 24;
    
public int elapsedDate() {
    return getEpochTime() / DAY;
}
```

역기점을 가져오는 getEpochTime 메소드를 생성했습니다.<br>

```java
private int getEpochTime() {
    return (int) (Clocks.now().toEpochSecond(UTC) - J2000.toEpochSecond(UTC));
}
```

조금 복잡하게 정의되어 있습니다.<br>
이유는, 실제 LocalDateTime 에서 제공하는 EpochTime 은 천문학에서 사용되는 EpochTime 과 다르더군요.<br>
LocalDateTime 에서 사용되는 EpochTime 은 `1970년 1월 1일 00:00:00` 기준이며,<br>
천문학에서 사용되는 EpochTime 과 30년 12시간 차이가 존재합니다.<br>
<br>

어쩄건, 천문학에서 사용하는 역기점으로 변환시켜주는 작업을 진행했습니다.<br>
그 이후 테스트를 돌려보니 잘 돌아가더군요.<br>

<img width="305" alt="image" src="https://user-images.githubusercontent.com/60500649/179501295-89171f20-15c7-4563-b089-d701f245766b.png">

<br>

경계값을 확인하기 위해 테스트를 추가했습니다.<br>

```java
@Test
void 역기점으로부터_하루_전이다() {
    TimeFreezer.freeze(J2000.minusDays(1));

    assertThat(sut.elapsedDate()).isEqualTo(-1);
}

@Test
void 역기점_당일이다() {
    TimeFreezer.freeze(J2000);

    assertThat(sut.elapsedDate()).isEqualTo(0);
}
```

<br>

이제 실제로 사용해야 하는 세기에 대한 테스트가 필요합니다.<br>

먼저, 다음과 같은 상수를 정의했습니다.<br>

```java
static final double YEAR = 365.25;
static final double CENTURY = 100 * YEAR;
```

YEAR 는 율리우스력의 1년을 일수로 정의했습니다.<br>
CENTURY 는 한 세기를 의미합니다.<br>
<br>

이제 아래 테스트를 진행하고자 했습니다.<br>
Between 을 통한 테스트로 진행한 이유는 따로 설명하겠습니다.<br>

```java
@Test
void 역기점으로부터_1세기가_지났다() {
    TimeFreezer.freeze(J2000.plusYears(100));

    assertThat(sut.elapsedCentury()).isBetween(0.999, 1.0);
}
```

그리고 빠르게 통과할 수 있도록 로직을 작성했습니다.<br>

```java
public double elapsedCentury() {
    return elapsedDate() / TimeConstant.CENTURY;
}
```

테스트가 통과하는 군요.<br>

<img width="324" alt="image" src="https://user-images.githubusercontent.com/60500649/179509111-6a50a440-c483-450f-8c93-f24578980d8b.png">

<br>

이제, 필요한 다른 테스트도 추가해 줍니다.<br>

```java
@Test
void 역기점으로부터_1세기_전이다() {
    TimeFreezer.freeze(J2000.minusYears(100));

    assertThat(sut.elapsedCentury()).isBetween(-1.0, -0.999);
}

@Test
void 역기점으로부터_10세기_전이다() {
    TimeFreezer.freeze(J2000.minusYears(1000));


    assertThat(sut.elapsedCentury()).isBetween(-10.0, -9.999);
}

@Test
void 역기점으로부터_20세기_후이다() {
    TimeFreezer.freeze(J2000.plusYears(2000));

    assertThat(sut.elapsedCentury()).isBetween(19.999, 20.0);
}
```

모두 돌려보니 통과하는 것을 확인할 수 있습니다.<br>

<img width="327" alt="image" src="https://user-images.githubusercontent.com/60500649/179509278-1a95ccd8-e077-43e9-b913-360d07f47ab0.png">

<br>

이렇게 JulianClock 이라는 클래스를 만들 수 있었습니다.<br>
궤도 요소에 따른 계산이 필요할 때, 유용하게 사용할 예정입니다.<br>

#### 진행하며 발생한 이슈

처음엔, 세기에 대한 테스트를 진행할 때 아래와 같은 테스트 케이스를 작성했습니다.<br>

```java
@Test
void 역기점으로부터_1세기_전이다() {
    TimeFreezer.freeze(J2000.minusYears(100));

    assertThat(sut.elapsedCentury()).isEqualTo(-1);
}
```

하지만 해당 테스트를 돌려보면 실패합니다.<br>
왜냐하면, 천문학적인 단위를 통해서 우리가 일반적으로 사용하는 딱 떨어지는 값을 요구하기 어려웠죠.<br>
<br>

처음엔 해결하고자 long 값으로 어떻게든 처리하려고 했으나, 결국 정밀한 값을 위해서는 double 이 옳다는 판단을 내렸고 통과했던 테스트 케이스로 변경하게 되었습니다.<br>

### **220719::currenjin::PlanetaryOrbitalCalculator::ArgumentOfPeriapsisAndEccentricityAnomalyCalculator**

궤도 요소 중 근일점 편각과 편심 이각이 필요합니다.<br>
<br>

하지만 정의된 행성의 궤도 데이터에는 없어 직접 계산을 해줘야 하는데요.<br>
이번엔 두 요소를 계산하는 계산기를 만들려고 합니다.<br>
<br>

#### 근일점 편각

궤도의 승교점부터 근점까지의 각을 운동 방향으로 잰 각거리로, 궤도 요소 중 하나입니다.<br>
<br>

근일점 편각 w 를 구하기 위해선 근일점 경도와, 승교점 적경이 필요합니다.<br>
필요한 값들은 이미 궤도 데이터에 존재하기에 계산만 해주면 됩니다.<br>

```java
지구 궤도 데이터

public static final Double LONGITUDE_OF_ASCENDING_NODE = 0.0; // 승교점 적경
public static final Double PERIHELION_LONGITUDE = 102.93768193; // 근일점 경도
```

근일점 편각은 근일점 경도에서 승교점 적경을 뺀 값입니다.<br>
해당 값을 구하기 위한 테스트를 작성해 보겠습니다.<br>

```java
public static final Double LONGITUDE_OF_ASCENDING_NODE = 0.0;
public static final Double PERIHELION_LONGITUDE = 102.93768193;

@Test
void 근일점_편각은_근일점_경도에서_승교적_적경을_뺀_값이다() {
    double actual = ArgumentOfPeriapsisCalculator.calculate(PERIHELION_LONGITUDE, LONGITUDE_OF_ASCENDING_NODE);

    assertThat(actual).isEqualTo(PERIHELION_LONGITUDE - LONGITUDE_OF_ASCENDING_NODE);
}
```

간단하네요. 이제 해당 테스트를 통과시켜 봅시다.<br>

```java
public static double calculate(Double perihelionLongitude, Double longitudeOfAscendingNode) {

    return perihelionLongitude - longitudeOfAscendingNode;
}
```

돌려보면 통과합니다.<br>
<br>

실패하는 케이스를 추가해 볼까요?<br>

```java
@Test
void 근일점_경도가_유효하지_않은_값이면_안된다() {
    assertThatThrownBy(() ->
            ArgumentOfPeriapsisCalculator.calculate(null, LONGITUDE_OF_ASCENDING_NODE))
            .isInstanceOf(IllegalArgumentException.class);
}

@Test
void 승교점_적경이_유효하지_않은_값이면_안된다() {
    assertThatThrownBy(() ->
            ArgumentOfPeriapsisCalculator.calculate(PERIHELION_LONGITUDE, null))
            .isInstanceOf(IllegalArgumentException.class);
}
```

네, 두 테스트는 IllegalArgumentException 을 던지도록 유도되었습니다.<br>
테스트를 성공시켜 보겠습니다.<br>

```java
public static double calculate(Double perihelionLongitude, Double longitudeOfAscendingNode) {
    validate(perihelionLongitude, longitudeOfAscendingNode);

    return perihelionLongitude - longitudeOfAscendingNode;
}

private static void validate(Double perihelionLongitude, Double longitudeOfAscendingNode) {
    if (perihelionLongitude == null) {
        throw new IllegalArgumentException();
    }

    if (longitudeOfAscendingNode == null) {
        throw new IllegalArgumentException();
    }
}
```

너무 간단한 로직이라 사실 필요없는 행위들이라고 생각할 수 있습니다.<br>
하지만 저는 메세지를 담을 수 있다는 점에서 충분히 할 수 있는 행위라고 느껴집니다.<br>
테스트를 돌려보면 성공하는 것을 볼 수 있습니다.<br>

<img width="320" alt="image" src="https://user-images.githubusercontent.com/60500649/179745684-e8e296a0-eb66-42ee-b97e-8d1e54c162f2.png">

<br>

#### 편심 이각

이제, 근일점 편각을 구헀으니 편심 이각을 구해야 합니다.<br>
편심 이각은 움직이는 물체의 위치를 결정하는 궤도 요소입니다. 해당 값으로 실제 행성이 어떤 위치에 있는지에 대한 값을 도출할 수 있습니다.<br>
<br>

해당 값을 구하기 위해선 먼저, 평균근점이각을 구해야 하는데요.<br>
평균근점이각은 어떤 물체가 공전 속도와 공전 주기를 유지한 채 정확한 원 궤도로 옮겨간다고 가정했을 때 물체와 궤도 근점간의 각거리를 의미합니다.<br>
<br>

평균근점이각을 구하는 이유는 편심 이각 때문이니, 편심 이각 계산기에 평균근점이각 계산 메소드를 포함시키겠습니다.<br>
평균근점이각을 계산하는 테스트를 작성할게요.<br>
평균근점이각 M 을 구하는 방법은 평균 경도 l 과 근일점 경도 w 의 차입니다. (M = l - w)<br>
평균 경도와 근일점 경도는 역시 궤도 데이터에 포함되어 있습니다.<br>

```java
public static final Double AVERAGE_LONGITUDE = 100.46457166;
public static final Double PERIHELION_LONGITUDE = 102.93768193;

@Test
void 평균근점이각은_평균_경도에서_근일점_경도를_뺀_값이다() {
    double actual = EccentricityAnomalyCalculator.calculateMeanAnomaly(AVERAGE_LONGITUDE, PERIHELION_LONGITUDE);

    assertThat(actual).isEqualTo(AVERAGE_LONGITUDE - PERIHELION_LONGITUDE);
}

@Test
void 평균근점이각_계산시_평균_경도가_유효하지_않으면_안된다() {
    assertThatThrownBy(() ->
            EccentricityAnomalyCalculator.calculateMeanAnomaly(null, PERIHELION_LONGITUDE))
            .isInstanceOf(IllegalArgumentException.class);
}

@Test
void 평균근점이각_계산시_근일점_경도가_유효하지_않으면_안된다() {
    assertThatThrownBy(() ->
            EccentricityAnomalyCalculator.calculateMeanAnomaly(AVERAGE_LONGITUDE, null))
            .isInstanceOf(IllegalArgumentException.class);
}
```

로직이 단순하니 확신을 갖고 빠르게 넘어가겠습니다.<br>

```java
public static double calculateMeanAnomaly(Double averageLongitude, Double perihelionLongitude) {
    validateMeanAnomalyCalculator(averageLongitude, perihelionLongitude);

    return averageLongitude - perihelionLongitude;
}

private static void validateMeanAnomalyCalculator(Double averageLongitude, Double perihelionLongitude) {
    if (averageLongitude == null) {
        throw new IllegalArgumentException();
    }

    if (perihelionLongitude == null) {
        throw new IllegalArgumentException();
    }
}
```

테스트가 모두 통과합니다.<br>

<img width="339" alt="image" src="https://user-images.githubusercontent.com/60500649/179748824-e61b6005-2179-44df-8456-257074fbae9b.png">

<br>

평균근점이각까지 구하며, 편심 이각을 구할 준비가 되었습니다.<br>
다음 시간에 구해볼게요. 감사합니다.<br>

### **220720::currenjin::PlanetaryOrbitalCalculator::EccentricityAnomalyCalculator**

필요한 궤도 요소 중 근일점 편각과 편심 이각을 계산해야 합니다.<br>
근일점 편각은 전 날 작업을 통해 구할 수 있게 되었고, 편심 이각을 계산하기 위한 평균 근점 이각까지 구할 수 있게 됐습니다.<br>
<br>

#### 편심 이각

평균 근점 이각으로 편심 이각을 유도하는 공식은 아래와 같습니다.<br>

<img width="233" alt="스크린샷 2022-07-19 오후 9 22 33" src="https://user-images.githubusercontent.com/60500649/179951029-b2fdfbe4-693e-4d73-859d-d589aae4131a.png">

e 는 이심률, M 은 평균 근점 이각이죠.<br>
<br>

테스트를 진행해 보겠습니다.<br>

```java
public static final Double EPOCH_ECCENTRICITY = 0.01671123;
public static final Double EPOCH_AVERAGE_LONGITUDE = 100.46457166;
public static final Double EPOCH_PERIHELION_LONGITUDE = 102.93768193;

@Test
void 편심_이각을_계산한다() {
    double actual = EccentricityAnomalyCalculator.calculate(EPOCH_ECCENTRICITY, EPOCH_AVERAGE_LONGITUDE, EPOCH_PERIHELION_LONGITUDE);

    assertThat(actual).isEqualTo(-0.044630145101967715);
}
```

역기점 때 관측한 궤도 요소를 통해 테스트를 진행합니다.<br>
정해진 공식이 있으니, 빠르게 구현해 줍니다.<br>

```java

public static double calculate(Double eccentricity, Double averageLongitude, Double perihelionLongitude) {

    double meanAnomaly = calculateMeanAnomaly(averageLongitude, perihelionLongitude);

    return (meanAnomaly + (eccentricity * Math.sin(meanAnomaly))) / (1 - (eccentricity * Math.cos(meanAnomaly)));
}
```

하지만, 지금 상태에서 테스트를 돌리면 실패하게 될 겁니다.<br>
계산기에서 구한 meanAnomaly 는 degree 값이지만, 실제 공식에서 사용되는 값은 radian 값이기 때문이죠.<br>
radian 값으로 변환해 줍니다.<br>

```java
public static double calculate(Double eccentricity, Double averageLongitude, Double perihelionLongitude) {
    double meanAnomaly = calculateMeanAnomaly(averageLongitude, perihelionLongitude);
    double radianMeanAnomaly = meanAnomaly * (Math.PI / 180);

    return (radianMeanAnomaly + (eccentricity * Math.sin(radianMeanAnomaly))) / (1 - (eccentricity * Math.cos(radianMeanAnomaly)));
}
```

<br>

테스트를 돌리면, 성공하는 것을 확인할 수 있습니다.<br>

<img width="318" alt="image" src="https://user-images.githubusercontent.com/60500649/179952041-3e9d7c3d-8c67-432f-8890-ec88c6e41569.png">

<br>

이제 예외에 대한 테스트도 진행해 줍니다.<br>
마찬가지로, 빠르게 작성할게요.<br>

```java
@Test
void 편심_이각을_계산시_이심률이_유효하지_않으면_안된다() {
    assertThatThrownBy(() ->
            EccentricityAnomalyCalculator.calculate(null, EPOCH_AVERAGE_LONGITUDE, EPOCH_PERIHELION_LONGITUDE))
            .isInstanceOf(IllegalArgumentException.class);
}

@Test
void 편심_이각을_계산시_평균_적경이_유효하지_않으면_안된다() {
    assertThatThrownBy(() ->
            EccentricityAnomalyCalculator.calculate(EPOCH_ECCENTRICITY, null, EPOCH_PERIHELION_LONGITUDE))
            .isInstanceOf(IllegalArgumentException.class);
}

@Test
void 편심_이각을_계산시_근일점_적경이_유효하지_않으면_안된다() {
    assertThatThrownBy(() ->
            EccentricityAnomalyCalculator.calculate(EPOCH_ECCENTRICITY, EPOCH_AVERAGE_LONGITUDE, null))
            .isInstanceOf(IllegalArgumentException.class);
}
```

빠르게 추가해 줍니다.<br>

```java
private static void validate(Double eccentricity, Double averageLongitude, Double perihelionLongitude) {
    if (eccentricity == null) {
        throw new IllegalArgumentException();
    }

    if (averageLongitude == null) {
        throw new IllegalArgumentException();
    }

    if (perihelionLongitude == null) {
        throw new IllegalArgumentException();
    }
}
```

이제 돌리면 모든 테스트가 통과합니다.<br>

<img width="359" alt="image" src="https://user-images.githubusercontent.com/60500649/179954316-dbebf7bb-4be9-4b60-83b3-999022fbac6b.png">

<br>

이제 편심 이각까지 구하면서 모든 궤도 요소가 모이게 되었습니다.<br>
하지만 아직 해결해야 하는 부분이 있습니다.<br>
세기당 변화량을 적용해 궤도 요소를 추출할 수 있어야 합니다.<br>
<br>

내일 계산해 주겠습니다!<br>
감사합니다.<br>

### **220721::currenjin::PlanetaryOrbitalCalculator::CurrentOrbitCalculator**

이전 작업을 통해 모든 궤도 요소를 구하게 되었습니다.<br>
이제 해야할 일은, 지난 시간에 따라 변화한 궤도 요소들을 추출해야 하죠.<br>
해당 작업을 완료하면 드디어 현 시점의 궤도 요소를 얻을 수 있게 됩니다. 기대가 되는 군요.<br>

#### 시간에 따른 궤도 요소

테스트를 먼저 작성해 보겠습니다.

```java
@Test
void 역기점으로부터_한_세기가_지난_시점의_장반경_값() {
    TimeFreezer.freeze(A_CENTURY_AFTER_EPOCH_TIME);

    Orbit actual = CurrentOrbitCalculator.of(PLANET);

    assertThat(actual.getLongRadius())
            .isEqualTo(PLANET.getLongRadius() + PLANET.getChangePerCentury().getLongRadius());
}
```

정의했던 장반경의 한 세기 지난 시점의 값을 기대하는 테스트입니다.<br>
<br>

이번엔 좀 더 전통적인 방식으로 TDD 를 해보겠습니다.<br>
먼저, 가장 빠르게 테스트를 통과하려면 어떻게 해야할까요?<br>
로직을 작성해 보겠습니다.<br>

```java
public class CurrentOrbitCalculator {

    public static Orbit of(PlanetOrbit planetOrbit) {
        double longRadius = planetOrbit.getLongRadius() + planetOrbit.getChangePerCentury().getLongRadius();

        return Orbit.of(longRadius,
                null,
                null,
                null,
                null,
                null);
    }
}
```

멋지죠?<br>
테스트를 돌려보면 당연히도 통과합니다.<br>
하지만, 우리의 마음 속에는 아직 찝찝함이 있죠.<br>
이런 불편함을 조금이라도 덜어줄 수 있게 리팩토링을 해볼까요?<br>

```java
public static Orbit of(PlanetOrbit planetOrbit) {
    double longRadius = planetOrbit.getLongRadius() + planetOrbit.getChangePerCentury().getLongRadius();
    double eccentricity = 1.1;
    double inclination = 1.1;
    double longitudeOfAscendingNode = 1.1;
    double averageLongitude = 1.1;
    double perihelionLongitude = 1.1;

    return Orbit.of(longRadius,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            averageLongitude,
            perihelionLongitude);
}
```

이번 스텝은 이정도면 됐습니다.<br>
이제 다음 스텝을 위한 테스트를 추가해 볼게요!<br>

```java
@Test
void 역기점으로부터_두_세기가_지난_시점의_장반경_값() {
    TimeFreezer.freeze(TWO_CENTURY_AFTER_EPOCH_TIME);

    Orbit actual = CurrentOrbitCalculator.of(PLANET);

    assertThat(actual.getLongRadius())
            .isEqualTo(PLANET.getLongRadius() + (PLANET.getChangePerCentury().getLongRadius() * 2));
}
```

두 세기가 지난 시점에서의 기대하는 장반경 값을 정의했습니다.<br>
이 테스트가 통과되기 위한 가장 빠른 방법은 무엇일까요?<br>
아까 작성한 로직에서 2를 곱해주는 방법이 있겠지만, 그렇게되면 다른 테스트는 실패하게 되겠죠?<br>
이 시점에서 정확한 로직을 파악하는 것이 중요합니다.<br>
<br>
현 시점에 얼만큼의 세기가 지났는지 계산해 주던 계산기를 만들었었죠.<br>
그 친구를 이용해 로직을 작성해 보겠습니다.<br>

```java
public static Orbit of(PlanetOrbit planetOrbit) {
    JulianClock julianClock = new JulianClock();
    double elapsedCentury = julianClock.elapsedCentury();

    double longRadius = planetOrbit.getLongRadius() + (planetOrbit.getChangePerCentury().getLongRadius() * elapsedCentury);
    double eccentricity = 1.1;
    double inclination = 1.1;
    double longitudeOfAscendingNode = 1.1;
    double averageLongitude = 1.1;
    double perihelionLongitude = 1.1;

    return Orbit.of(longRadius,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            averageLongitude,
            perihelionLongitude);
}
```

간단하네요.<br>
세기당 변화량에 현 시점에서 지난 세기만큼 곱해준다면, 현 시점의 궤도 요소 변화량을 알 수 있습니다.<br>
이제, 테스트를 돌려보겠습니다.<br>

<img width="405" alt="image" src="https://user-images.githubusercontent.com/60500649/180196653-c3a1b1f2-4c92-4235-a039-bd5bfa744e09.png">

잘 돌아가네요!<br>
<br>

우리가 안심해도 될 지, 정말 문제가 없는지, 역기점과 이의 한 세기 전도 테스트해 보겠습니다.<br>

```java
@Test
void 역기점으로부터_한_세기_이전_시점의_장반경_값() {
    TimeFreezer.freeze(A_CENTURY_BEFORE_EPOCH_TIME);

    Orbit actual = CurrentOrbitCalculator.of(PLANET);

    assertThat(actual.getLongRadius())
            .isEqualTo(PLANET.getLongRadius() + (PLANET.getChangePerCentury().getLongRadius() * -1));
}

@Test
void 역기점의_장반경_값() {
    TimeFreezer.freeze(EPOCH_TIME);

    Orbit actual = CurrentOrbitCalculator.of(PLANET);

    assertThat(actual.getLongRadius())
            .isEqualTo(PLANET.getLongRadius());
}
```

<img width="232" alt="image" src="https://user-images.githubusercontent.com/60500649/180197853-bf1fcbe2-e7fd-4979-b3c2-77c7bdb0453e.png">

테스트가 잘 통과합니다!<br>
<br>

나머지 궤도 요소들 또한 같은 테스트를 진행해 줍니다.<br>
이제 복붙의 영역이네요. 신나게 해줍시다.<br>

```java
public static Orbit of(PlanetOrbit planetOrbit) {
    JulianClock julianClock = new JulianClock();
    double elapsedCentury = julianClock.elapsedCentury();

    double longRadius = planetOrbit.getLongRadius() + (planetOrbit.getChangePerCentury().getLongRadius() * elapsedCentury);
    double eccentricity = planetOrbit.getEccentricity() + (planetOrbit.getChangePerCentury().getEccentricity() * elapsedCentury);
    double inclination = planetOrbit.getInclination() + (planetOrbit.getChangePerCentury().getInclination() * elapsedCentury);
    double longitudeOfAscendingNode = planetOrbit.getLongitudeOfAscendingNode() + (planetOrbit.getChangePerCentury().getLongitudeOfAscendingNode() * elapsedCentury);
    double averageLongitude = planetOrbit.getAverageLongitude() + (planetOrbit.getChangePerCentury().getAverageLongitude() * elapsedCentury);
    double perihelionLongitude = planetOrbit.getPerihelionLongitude() + (planetOrbit.getChangePerCentury().getPerihelionLongitude() * elapsedCentury);

    return Orbit.of(longRadius,
            eccentricity,
            inclination,
            longitudeOfAscendingNode,
            averageLongitude,
            perihelionLongitude);
}
```

코드가 더럽습니다. 대부분 중복으로 이루어져 있네요.<br>
이 부분들은 추후 리팩토링할 수 있을 것 같아요.<br>
이제 테스트를 돌려볼까요? (하나씩 테스트해 보며 추가해서 결과를 알고 있지만)<br>

<img width="368" alt="image" src="https://user-images.githubusercontent.com/60500649/180199260-23717a8c-bac8-42ca-ad08-64f0f32ff717.png">

와우! 모두 통과합니다!<br>
이제 우린 현시점의 궤도 요소들을 알 수 있게 되었습니다.<br>
<br>

다음 시간에는 해당 궤도 요소를 통해 실제 행성의 위치를 도출할 수 있을 거라 기대합니다.<br>
감사합니다.<br>

### **220723::currenjin::PlanetaryOrbitalCalculator::PlanetaryPositionCalculator**

이제 태양계 행성들의 시간 별 위치 값을 계산할 수 있습니다.<br>
<br>

실제 행성의 위치를 표현할 수 있는 요소는 진근점 이각과 유클리드 거리인데요.<br>
진근점 이각은 항성과 천체까지의 거리각입니다.<br>
유클리드 거리는 두 점 사이의 거리를 계산할 때 주로 사용하는 방법인데요. 여기서 두 조첨은 항성과 천체를 나타냅니다.<br>
<br>

먼저, 두 값을 구하기 위해 필요한 황도 좌표 평면의 좌표값을 구해볼게요.<br>

#### 황도 좌표 평면의 좌표값

좌표값 x, y는 아래와 같은 수식으로 구할 수 있습니다.<br>

```
e : 이심률
E : 편심 이각
l : 장반경

x = l * (cosE - e)
y = l * √(1 - e^2) * sinE
```

테스트를 작성해 볼까요?<br>

```java
@Test
void 역기점의_황도_좌표값() {
    TimeFreezer.freeze(EPOCH_TIME);

    EclipticCoordinate actual = sut.calculateEclipticCoordinate(PLANET);

    assertThat(actual.getX()).isEqualTo(X_OF_EPOCH_TIME);
    assertThat(actual.getY()).isEqualTo(Y_OF_EPOCH_TIME);
}
```

역기점을 기준으로, 황도 좌표 평면의 X 축 Y 축을 구했습니다.<br>
비교하는 값은 실제 역기점의 좌표 값을 가져왔습니다.<br>
<br>

해당 테스트를 통과시키려 하는데, EclipticCoordinate 라는 객체가 필요하군요.<br>
먼저 생성해 줬습니다.<br>

```java
public class EclipticCoordinate {
}
```

이 상태에서는 테스트가 통과할 수 없습니다.<br>
가장 빠르게 통과할 수 있도록, 해당 객체가 좌표 값을 가질 수 있도록 테스트를 추가했습니다.<br>

```java
@Test
void 황도_좌표를_생성합니다() {
    EclipticCoordinate actual = EclipticCoordinate.of(X, Y);

    assertThat(actual.getX()).isEqualTo(X);
    assertThat(actual.getY()).isEqualTo(Y);
}
```

해당 테스트가 통과할 수 있도록 구현했습니다.<br>

```java
public class EclipticCoordinate {

    public static EclipticCoordinate of(double x, double y) {
        return new EclipticCoordinate(x, y);
    }

    private final double x;
    private final double y;

    private EclipticCoordinate(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }
}
```

테스트를 돌려보면 잘 통과하는 군요.<br>
<br>

다시 돌아와서, 좌표를 계산해 주는 테스트가 통과할 수 있도록 로직을 작성해 보겠습니다.<br>
<br>

```java
public class PlanetaryPositionCalculator {

  public EclipticCoordinate calculateEclipticCoordinate(PlanetOrbit planet) {

      Orbit currentOrbit = CurrentOrbitCalculator.of(planet);
      double eccentricityAnomaly = EccentricityAnomalyCalculator.calculate(currentOrbit.getEccentricity(), currentOrbit.getAverageLongitude(), currentOrbit.getPerihelionLongitude());

      double x = (currentOrbit.getLongRadius() * 1000) * (Math.cos(eccentricityAnomaly) - currentOrbit.getEccentricity());
      double y = (currentOrbit.getLongRadius() * 1000) * (Math.sqrt(1 - (currentOrbit.getEccentricity() * currentOrbit.getEccentricity()))) * Math.sin(eccentricityAnomaly);

      return EclipticCoordinate.of(x, y);
  }
}
```

행성의 역기점 기준 궤도 요소를 받습니다.<br>
역기점 기준 궤도 요소를 통해 현 시점의 궤도 요소를 계산합니다.<br>
필요한 추가 요소를 계산한 후 x 축과 y 축을 계산합니다.<br>
<br>

통과하는지 확인해 볼까요?<br>

![image](https://user-images.githubusercontent.com/60500649/180588905-1075176b-bfd9-406f-a3aa-c4931ad69274.png)

좋습니다! 잘 통과하네요.<br>

혹시 모르니 null 값이 들어가는 상황에 대한 예외 처리 테스트도 수행해 줍시다.<br>

```java
@Test
void 황도_좌표값_계산시_유효하지_않은_값이면_안된다() {
    assertThatThrownBy(() -> sut.calculateEclipticCoordinate(null)).isInstanceOf(IllegalArgumentException.class);
}
```

```java
public EclipticCoordinate calculateEclipticCoordinate(PlanetOrbit planet) {

    validatePlanetOrbit(planet);
    
    ...
}

private void validatePlanetOrbit(PlanetOrbit planet) {
    if (planet == null) {
        throw new IllegalArgumentException();
    }
}
```

<br>

#### 유클리드 거리
이제 필요한 좌표 값을 구했으니, 먼저 유클리드 거리 값을 구해볼게요.<br>
<br>

좌표 값을 통해 구할 수 있는 유클리드 거리의 수식은 아래와 같습니다.<br>

```java
AU : 태양과 지구 

√(x^2 + y^2) / AU
```

마찬가지로 테스트를 작성해 줍니다.<br>

```java
@Test
void 역기점의_유클리드_거리를_계산한다() {
    TimeFreezer.freeze(EPOCH_TIME);

    double actual = sut.calculateEuclideanDistance(PLANET);

    assertThat(actual).isEqualTo(EUCLIDEAN_DISTANCE_OF_EPOCH_TIME);
}
```

마찬가지로, 역기점 기준의 유클리드 거리 값과 비교합니다.<br>
성공하기 위한 로직을 작성해 줍니다.<br>

```java
public double calculateEuclideanDistance(PlanetOrbit planet) {

    EclipticCoordinate eclipticCoordinate = calculateEclipticCoordinate(planet);

    return Math.sqrt(Math.pow(eclipticCoordinate.getX(), 2) + Math.pow(eclipticCoordinate.getY(), 2)) / (1000 * planet.getAu());
}
```

행성 궤도 요소를 받습니다.<br>
황도 좌표 평면의 좌표값을 받습니다.<br>
해당 값으로 위에 작성한 수식에 맞게 계산해 줍니다.<br>
<br>

이제 테스트를 돌려보면 잘 통과합니다.<br>

![image](https://user-images.githubusercontent.com/60500649/180590186-04a776a4-2765-4805-b921-dddbe0efe26a.png)

아까와 같이 validate 도 진행해 주는 테스트를 짜고 통과시켰습니다.<br>
과정은 동일하기에 생략합니다.<br>
<br>

#### 진근점 이각

마지막입니다. 진근점 이각을 구하면 끝입니다.<br>
좌표 값을 통해 유도할 수 있는 진근점 이각의 수식은 아래와 같습니다.<br>

```java
atan2(y, x)
```

테스트를 만들고, 빠르게 로직을 작성해 주겠습니다.<br>

```java
@Test
void 역기점의_진근점_이각을_계산한다() {
    TimeFreezer.freeze(EPOCH_TIME);

    double actual = sut.calculateTrueAnomaly(PLANET);

    assertThat(actual).isEqualTo(TRUE_ANOMALY_OF_EPOCH_TIME);
}
```

마찬가지로, 역기점을 기준으로 계산된 진근점 이각을 비교합니다.<br>

```java
public double calculateTrueAnomaly(PlanetOrbit planet) {

    EclipticCoordinate eclipticCoordinate = calculateEclipticCoordinate(planet);

    return Math.atan2(eclipticCoordinate.getY(), eclipticCoordinate.getX()) * (180 / Math.PI);
}
```

행성 궤도 요소 값을 받습니다.<br>
궤도 요소 값을 통해 좌표 값을 가져옵니다.<br>
좌표 값으로 위 수식에 맞게 계산합니다.<br>
(180 / pi) 는 radian 값을 degree 로 변환해 주기 위해 추가했습니다.<br>
<br>

테스트를 돌려보면 역시 통과하죠.<br>

![image](https://user-images.githubusercontent.com/60500649/180590400-1faa9a2d-2452-4a66-941f-1d3fa271f907.png)

아까와 같이 validate 테스트와 로직을 추가해 주면 됩니다.<br>
<br>

#### 결과

이제 드디어 행성 위치를 계산할 수 있게 되었습니다.<br>
이 글을 작성하는 시점에서의 지구의 위치는 태양으로부터 `0.9944538116859933 AU` 만큼 떨어져 있고, 태양과 지구 사이에 `0.9944538116859933 도` 만큼 기울어져 있습니다.<br>
<br>

감사합니다.

## Test Interpretation
### **220127::trevari::member::application::MappingFinderTest**
`반영 완료`

```java
@Test
void find_by_product_option_id() {
    given(sut.findBy(ANY_PRODUCT_OPTION_ID, ANY_EVENTED_AT)).willReturn(ANY_MAPPING);

    Mapping actual = sut.findBy(ANY_PRODUCT_OPTION_ID, ANY_EVENTED_AT);

    assertThat(actual).isEqualTo(ANY_MAPPING);
}
```
_**해석**<br>
(1) sut.findBy 메소드가 호출될 때, ANY_MAPPING 을 반환하도록 합니다.<br>
(2) ANY_PRODUCT_OPTION_ID, ANY_EVENTED_AT 을 통해 Mapping 타입의 객체를 가져옵니다. 이때, ANY_MAPPING 을 반환받습니다.<br>
(3) Mapping 타입의 객체는 ANY_MAPPING 과 비교하여 일치한 지 확인합니다.<br>
<br>
**생각**<br>
ANY_MAPPING 을 의도적으로 반환해 ANY_MAPPING 이랑 비교하는게 의미없는 테스트라 생각됩니다.<br>_

### **220128::trevari::member::domain::GeneralServiceTerminationSpecificationTest**
```java
@Test
void 해지불가_이전에만_만족한다() {
    //1-----2------3-<-해지불가일 ---
    given(period.getImpossibleTerminatedAt())
            .willReturn(localDate(_2021, _1, _3));

    assertThat(sut.isSatisfy(localDate(_2021, _1, _2))).isTrue();
    assertThat(sut.isSatisfy(localDate(_2021, _1, _3))).isFalse();
    assertThat(sut.isSatisfy(localDate(_2021, _1, _4))).isFalse();
}
```
_**해석**<br>
(1) 누군가 해지 불가일을 가져오려고 하면, 해지 불가일(2021-01-03)을 반환합니다.<br>
(2) 각 날짜별로 해지가 가능 여부를 올바르게 반환하는지 확인합니다. (2021-01-02, 2021-01-03, 2021-01-04)<br>
(3) 해지 불가일이 지나지 않았다면, 해지가 가능합니다.<br>
(4) 해지 불가일이 지났다면, 해지가 불가능합니다.<br>_

### **220129::trevari::member::domain::ServiceRunningContextTerminateTest**
`반영 완료`

```java
private static final LocalDateTime ANY_LOCAL_DATE_TIME = localDate(2021, 1, 1);

@Mock
ServiceRunningPeriod definition;

ServiceRunningContext sut;

@BeforeEach
void setUp() {
    sut = new ServiceRunningContext(ANY_SERVICE_ID, Times.of(1), Times.ZERO, AVAILABLE, definition, null, null);

    //초기 상태
    assertThat(sut.isTerminated()).isFalse();
}

@Test
void 여러번_해지해도_멱등하다() {

    sut.terminate(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.isTerminated()).isTrue();

    sut.terminate(ANY_LOCAL_DATE_TIME, alwaysTrue()); // 멱등
    assertThat(sut.isTerminated()).isTrue();
}
```
_**해석**<br>
(1) ServiceRunningContext(이하 SRC)을 해지합니다.<br>
(2) 해지 여부를 확인할 때, 해지가 항상 가능하도록 합니다.<br>
(3) SRC 가 해지되었는지 확인합니다.<br>
(4) 1-3 번을 다시한 번 수행한 뒤에도 해지된 상태인지 확인합니다.<br>
<br>
**생각 또는 흐름**<br>
terminate 메소드 호출 시 전달하는 인자에 ANY_LOCAL_DATE_TIME, alwaysTrue() 를 넘깁니다.<br>
저의 경우에는, 해당 인자를 넘기는 게 어떤 의미인지 바로 파악되지 않았습니다.<br>
terminate 메소드를 까 본 후에 날짜와 해지가 가능하도록 하는 specification 을 넘긴다는 사실을 알았습니다.<br>_

### **220130::trevari::member::domain::ServiceStateChangedEventTest**
```java
@Test
void 서비스가_해지되면_상태변경_이벤트를_발행한다() {
    Elsa.freeze(purchasedAt);

    member.terminate();

    DomainEvent event = DomainEventFinder.occurredDomainEventEnvelop(member, ServiceStateChangedEvent.class);

    ServiceStateChangedEvent payload = event.getPayload(ServiceStateChangedEvent.class);
    assertThat(payload.getMembershipId()).isEqualTo(MEMBERSHIP.getId());
    assertThat(payload.getUserId()).isEqualTo(USER.getId());
}

```
_**해석**<br>
(1) 특정 시점으로 현재 시점을 고정합니다. (purchasedAt, 211106 20:00)<br>
(2) 고정된 시점에서 멤버 해지를 시도합니다.<br>
(3) 멤버 객체를 도메인 이벤트로 감쌉니다.<br>
(4) 도메인 이벤트 내에 값이 감싸기 위한 객체 내 값과 일치한 지 확인합니다. (membership id, user id)<br>_

### **220131::trevari::member::domain::ServiceRunningContextUseTest**
```java
ServiceRunningContext sut;

@BeforeEach
void setUp() {
    sut = new ServiceRunningContext(ANY_SERVICE_ID, Times.of(1), Times.ZERO, AVAILABLE, definition, null, null);
}

@Test
void 해지가되면_사용할수없다() {
    //해지처리
    whenTerminated();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue())).hasMessageContaining("Service already Terminated when usedAt is");
}

private void whenTerminated() {
    sut.terminate(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.isTerminated()).isTrue();
}
```
_**해석**<br>
(1) ServiceRunningContext(이하 SRC) 의 상태를 해지로 변경합니다.<br>
(2) SRC 사용 시도를 합니다.<br>
(3) 이미 해지되어 사용할 수 없다는 예외를 확인합니다.<br>_

### **220201::trevari::member::domain::ServiceRunningContextUseTest**
```java
ServiceRunningContext sut;

@BeforeEach
void setUp() {
    sut = new ServiceRunningContext(ANY_SERVICE_ID, Times.of(1), Times.ZERO, AVAILABLE, definition, null, null);
}

@Test
void 사용스펙이_만족하면_사용처리한다() {
    sut = sut.withProvided(Times.of(1));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());

    assertThat(sut.getUsed()).isEqualTo(oneTime);
    assertThat(sut.isRemained()).isFalse();
    assertThat(sut.isUsedUp()).isTrue();
}
```
_**해석**<br>
(1) ServiceRunningContext(이하 SRC) 의 사용 가능 횟수를 지정한다. (1회)<br>
(2) SRC 를 사용한다.<br>
(3) SRC 의 사용 횟수를 확인한다. (1회)<br>
(4) SRC 의 남은 횟수를 확인한다. (0회)<br>
(5) SRC 의 상태를 확인한다. (USED_UP, 다 사용함)<br>_

### **220202::trevari::member::domain::ServiceRunningContextUseTest**
```java
ServiceRunningContext sut;

@BeforeEach
void setUp() {
    sut = new ServiceRunningContext(ANY_SERVICE_ID, Times.of(1), Times.ZERO, AVAILABLE, definition, null, null);
}

@Test
void 남은_회수() {
    sut = sut.withProvided(Times.of(2));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(ONE);
    assertThat(sut.isRemained()).isTrue();
    assertThat(sut.isUsedUp()).isFalse();

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(TWO);
    assertThat(sut.isRemained()).isFalse();
    assertThat(sut.isUsedUp()).isTrue();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME,  alwaysTrue())).hasMessage("Service already UsedUp when usedAt is " + ANY_LOCAL_DATE_TIME);
}
```
_**해석**<br>
(1) ServiceRunningContext(이하 SRC) 의 사용 가능 횟수를 지정한다. (2회)<br>
(2) SRC 를 사용한다.<br>
(3) 첫 번째 SRC 확인<br>_
1. _SRC 의 사용 횟수를 확인한다. (1회)<br>_
2. _SRC 의 남은 횟수가 있는지 확인한다. (있음)<br>_
3. _SRC 의 상태를 확인한다. (NOT USED UP, 다 사용하지 않음)<br>_

_(4) SRC 를 사용한다.<br>
(5) 두 번째 SRC 확인<br>_
1. _SRC 의 사용 횟수를 확인한다. (2회)<br>_
2. _SRC 의 남은 횟수가 있는지 확인한다. (없음)<br>_
3. _SRC 의 상태를 확인한다. (USED UP, 다 사용함)<br>_

### **220203::trevari::member::domain::GeneralServiceTerminationSpecificationTest**
```java
@InjectMocks
GeneralServiceTerminationSpecification sut;

@Mock
ServiceRunningPeriod period;
@Mock
ServiceRunningContext context;

@BeforeEach
void setUp() {
    Elsa.freeze(localDateTime(_2021, _1, _1, 0, 0)); /** Clocks.now() 이전에 선행되어야 함 **/
    sut = new GeneralServiceTerminationSpecification(period, context, Clocks.now());
}

@Test
void 모두사용일때는_해지되지않는다() {
    given(period.getImpossibleTerminatedAt())
            .willReturn(localDate(_2021, _1, _3));
    given(context.isUsedUp()).willReturn(true);

    assertThat(sut.isSatisfy(localDate(_2021, _1, _2))).isFalse();

}
```
_**해석**<br>
(1) 누군가 해지 불가 시작일을 가져오려고 시도하면, 지정된 날짜를 반환한다. (2021-01-03)<br>
(2) ServiceRunningContext 의 사용 여부 조회시, 지정된 값을 반환한다. (true, 사용함)<br>
(3) 해지 가능 여부를 확인한다. (false, 불가)<br>_

### **220204::trevari::member::domain::GeneralServiceTerminationSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceTerminationSpecification sut;

@Mock
ServiceRunningPeriod period;
@Mock
ServiceRunningContext context;

@BeforeEach
void setUp() {
    Elsa.freeze(localDateTime(_2021, _1, _1, 0, 0)); /** Clocks.now() 이전에 선행되어야 함 **/
    sut = new GeneralServiceTerminationSpecification(period, context, Clocks.now());
}

@Test
@DisplayName("2021-01-01 00:00:00 가입 / 2021-01-01 03:33:00 해지")
void 당일_환불이면_해지된다() {
    given(period.getImpossibleTerminatedAt()).willReturn(localDate(_2021, _1, _1));

    boolean satisfy = sut.isSatisfy(localDateTime(_2021, _1, _1, 3, 33));

    assertThat(satisfy).isTrue();
}
```
_**해석**<br>
(1) 누군가 해지 불가 시작일을 가져오려고 시도하면, 지정된 날짜를 반환한다. (2021-01-01)<br>
(2) ServiceRunningContext 의 해지 가능 여부를 확인한다.  (가능 : True, 해지 시도일: 2021-01-01)<br>_

_**생각**<br>
테스트 내에 가입 날짜에 대한 내용이 명시적으로 존재하지 않는다. (위로 스크롤 올려서 확인해야 함)<br>
DisplayName 에도 써놓은 거로 대체가 될 수 있는가?<br>
혹은 테스트 내에 명시적으로 집어넣는게 맞는가?<br>_

### **220205::trevari::member::domain::GeneralServiceTerminationSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceTerminationSpecification sut;

@Mock
ServiceRunningPeriod period;
@Mock
ServiceRunningContext context;

@BeforeEach
void setUp() {
    Elsa.freeze(localDateTime(_2021, _1, _1, 0, 0)); /** Clocks.now() 이전에 선행되어야 함 **/
    sut = new GeneralServiceTerminationSpecification(period, context, Clocks.now());
}

@Test
@DisplayName("2021-01-01 00:00:00 가입 / 2021-01-03 03:33:00 해지")
void 환불기간이_지나고_당일_환불도_아니면_해지되지_않는다() {
    given(period.getImpossibleTerminatedAt()).willReturn(localDate(_2021, _1, _1));

    boolean satisfy = sut.isSatisfy(localDateTime(_2021, _1, _3, 3, 33));

    assertThat(satisfy).isFalse();
}
```
_**해석**<br>
(1) 누군가 해지 불가 시작일을 가져오려고 시도하면, 지정된 날짜를 반환한다. (2021-01-01)<br>
(2) ServiceRunningContext 의 해지 가능 여부를 확인한다.  (불가능 : False, 해지 시도일: 2021-01-03)<br>_

_**생각**<br>
테스트 내에 가입 날짜를 명시하면 테스트가 더 명확할 것 같다.<br>_

### **220206::trevari::member::domain::CommunityServiceRunningContextTerminateTest**
`반영 완료`

```java
@Test
void 서비스_기간에_해지를_시도하면_해지되지_않는다() {
    Elsa.freeze(firstMeetingAt.plusDays(6));
    
    // 주문 -- << ----해지---- 서비스 기간  ----->>
    // 6 --- << 13 ----(14)---- 20 ---- 4개월후 >>

    member.terminate();

    COMMUNITY_STATUS_OF(COMMUNITY_MEMBER, AVAILABLE);
}

private void COMMUNITY_STATUS_OF(Badge badge, ServiceRunningState status) {
    assertThat(member.getServiceRunningContextList().getItems().stream()
            .filter(i->badge.equals(i.getBadge())).allMatch(i->status.equals(i.getState()))).isTrue();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (첫 모임일의 6일 후)<br>
(2) 멤버를 해지합니다.<br>
(3) 뱃지의 존재 여부와 상태를 확인합니다. (COMMUNITY_MEMBER, AVAILABLE)<br>_

_**떠오르는 의문**<br>
(1) 테스트 코드만 확인하면, 첫 모임일의 6일 후가 서비스 기간 내에 포함되는지 어떻게 알 수 있는가?<br>
(2) COMMUNITY_STATUS_OF 라는 메소드 명은 제 역할을 하고 있는지?<br>
(3) 혹은 2번 메소드의 이름을 변경해야 하는 건 아닌지?<br>_

### **220207::trevari::member::domain::CommunityServiceRunningContextTerminateTest**
`반영 완료`

```java
@Test
void 보너스_기간에_해지를_시도하면_모든_커뮤니티서비스가_해지된다() {
    Elsa.freeze(purchasedAt.plusDays(1));

    // 주문 ---해지--- << ---- 서비스 기간  ----->>
    // 6 ---(7)--- << 13 ---- 20 ---- 4개월후 >>

    member.terminate();

    COMMUNITY_STATUS_OF(COMMUNITY_MEMBER, TERMINATED);
}

private void COMMUNITY_STATUS_OF(Badge badge, ServiceRunningState status) {
    assertThat(member.getServiceRunningContextList().getItems().stream().filter(i->badge.equals(i.getBadge())).allMatch(i->status.equals(i.getState()))).isTrue();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (첫 모임일의 1일 후)<br>
(2) 멤버를 해지합니다.<br>
(3) 뱃지의 존재 여부와 상태를 확인합니다. (COMMUNITY_MEMBER, TERMINATED)<br>_

_**떠오르는 의문**<br>
(1) 테스트 코드만 확인하면, 첫 모임일의 1일 후가 서비스 기간 내에 포함되는지 어떻게 알 수 있는가?<br>
(2) COMMUNITY_STATUS_OF 라는 메소드 명은 제 역할을 하고 있는지?<br>
(3) 혹은 메소드 명을 변경해야 하는 건 아닌지?<br>_

### **220208::trevari::wallet::domain::TicketExpireTest**
```java
@Test
void 티켓_만료일_이후엔_만료될_티켓이다() {
    Elsa.freeze(EXPIRE_DATE.plusDays(1));
    TICKET = new Ticket(null, null, EXPIRE_DATE);

    // |-----티켓만료-----만료여부확인-----|
    // |-------20-----------21--------|
    assertThat(TICKET.willBeExpired()).isTrue();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (티켓 만료일 하루 뒤, 21일)<br>
(2) 티켓을 생성합니다. (만료일 지정, 20일)<br>
(3) 티켓이 만료될 티켓인지 확인합니다. (True)<br>_

### **220209::trevari::wallet::domain::TicketExpireTest**
```java
@Test
void 티켓_만료일_이전엔_만료될_티켓이_아니다() {
    Elsa.freeze(EXPIRE_DATE.minusDays(1));
    TICKET = new Ticket(null, null, EXPIRE_DATE);

    // |-----만료여부확인-----티켓만료-----|
    // |-------19-----------20--------|
    assertThat(TICKET.willBeExpired()).isFalse();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (티켓 만료일 하루 전, 19일)<br>
(2) 티켓을 생성합니다. (만료일 지정, 20일)<br>
(3) 티켓이 만료될 티켓인지 확인합니다. (False)<br>_

### **220210::trevari::wallet::domain::TicketExpireTest**
`반영 완료`

```java
@Test
void 티켓_만료일이_null_이면_만료될_티켓이_아니다() {
    Elsa.freeze(EXPIRE_DATE);
    TICKET = new Ticket(null, null, null);

    assertThat(TICKET.willBeExpired()).isFalse();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (티켓 만료일, 20일)<br>
(2) 티켓을 생성합니다. (만료일 null)<br>
(3) 티켓이 만료될 티켓인지 확인합니다. (False)<br>_

_**생각**<br>
(1) 시점 고정 로직(freeze)은 없어져도 될 것 같다. 해당 테스트에서 관심있는 부분이 아니기 때문에.<br>_

### **220211::trevari::wallet::domain::TicketsExpireTest**
```java
@Test
void 만료일이_지난_티켓들을_가져온다() {
    Elsa.freeze(EXPIRE_DATE_20.plusDays(1));

    Ticket TICKET1 = new Ticket("KEY1", null, EXPIRE_DATE_20);
    Ticket TICKET2 = new Ticket("KEY2", null, EXPIRE_DATE_20);
    Ticket TICKET3 = new Ticket("KEY3", null, EXPIRE_DATE_22);

    TICKETS.add(TICKET1);
    TICKETS.add(TICKET2);
    TICKETS.add(TICKET3);

    assertThat(TICKETS.size()).isEqualTo(3);

    // |-----티켓1,2만료일-----만료여부확인-----티켓3만료일-----|
    // |-------20-------------21--------------22--------|
    assertThat(TICKETS.expirableTickets().size()).isEqualTo(2);
}
```
_**해석**<br>
(1) 시점을 고정합니다. (21일)<br>
(2) 티켓을 생성합니다. (TICKET1 만료일 : 20일, TICKET2 만료일 : 20일, TICKET3 만료일 : 22일)<br>
(3) 전체 티켓의 개수를 확인합니다. (3개)<br>
(4) 만료 티켓의 개수를 확인합니다. (2개)<br>_

### **220212::trevari::wallet::domain::TicketsExpireTest**
`반영 완료`

```java
@Test
void 만료일이_지난_티켓들을_가져온다_expiryDate_null_포함() {
    Elsa.freeze(EXPIRE_DATE_20.plusDays(1));

    Ticket TICKET1 = new Ticket("KEY1", null, EXPIRE_DATE_20);
    Ticket TICKET2 = new Ticket("KEY2", null, null);
    Ticket TICKET3 = new Ticket("KEY3", null, EXPIRE_DATE_22);

    TICKETS.add(TICKET1);
    TICKETS.add(TICKET2);
    TICKETS.add(TICKET3);

    assertThat(TICKETS.size()).isEqualTo(3);

    // |-----티켓1만료일-----만료여부확인-----티켓3만료일-----|
    // |-------20-------------21--------------22--------|
    assertThat(TICKETS.expirableTickets().size()).isEqualTo(1);
}
```
_**해석**<br>
(1) 시점을 고정합니다. (21일)<br>
(2) 티켓을 생성합니다. (TICKET1 만료일 : 20일, TICKET2 만료일 : null, TICKET3 만료일 : 22일)<br>
(3) 전체 티켓의 개수를 확인합니다. (3개)<br>
(4) 만료 티켓의 개수를 확인합니다. (1개)<br>_

_**생각**<br>
(1) 전체 티켓의 개수를 확인할 필요가 없다고 생각한다.<br>
(2) 하지만, 총 몇 개의 티켓에서 이 정도를 가져왔다. 라는 걸 알려주려면 필요하려나?<br>_

### **220213::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void addTicketAndFind() {
    AddTicketCommand command = AddTicketCommandFactory.create("KEY", TicketProps.empty(), ANY_EXPIRY_DATE);

    sut.execute(command);

    assertThat(sut.has(command.newTicket())).isTrue();
}
```
_**해석**<br>
(1) 티켓 추가를 위한 명령을 생성합니다. (AddTicketCommand)<br>
(2) 지갑에 티켓 추가 명령을 실행합니다. (AddTicket)<br>
(3) 지갑에 추가된 티켓이 존재하는지 확인합니다. (True)<br>_

### **220214::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void when_add_ticket_ignore_same_key() {
    AddTicketCommand command1 = AddTicketCommandFactory.create("KEY1", TicketProps.empty(), ANY_EXPIRY_DATE);
    AddTicketCommand command2 = AddTicketCommandFactory.create("KEY2", TicketProps.empty(), ANY_EXPIRY_DATE);
    AddTicketCommand command3 = AddTicketCommandFactory.create("KEY2", TicketProps.empty(), ANY_EXPIRY_DATE);


    assertThat(sut.hasNotTickets()).isTrue();

    sut.execute(command1);
    sut.execute(command2);
    sut.execute(command3);

    assertThat(sut.getSizeOfTicket()).isEqualTo(2);
}
```
_**해석**<br>
(1) 티켓 추가를 위한 명령을 각각 생성하며, 중복된 키가 있도록 합니다. (command1-KEY1, command2-KEY2, command3-KEY2)<br>
(2) 티켓이 없는지 확인합니다. (True)<br>
(3) 지갑에 티켓 추가 명령을 실행합니다. (command1-KEY1, command2-KEY2, command3-KEY2)<br>
(4) 추가된 티켓 수를 확인합니다. (2개, 중복된 티켓 제외)<br>_

### **220215::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}


@Test
void terminate() {
    String key1 = "KEY 1";
    String key2 = "KEY 2";

    sut.execute(AddTicketCommandFactory.create(key1, TicketProps.empty(), ANY_EXPIRY_DATE));
    sut.execute(AddTicketCommandFactory.create(key2, TicketProps.empty(), ANY_EXPIRY_DATE));
    assertThat(sut.getSizeOfTicket()).isEqualTo(2);

    sut.execute(terminateWithTargetPredicate((t1) -> key2.equals(t1.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(1);

    sut.execute(terminateWithTargetPredicate((t) -> key1.equals(t.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(0);
    assertThat(sut.hasNotTickets()).isTrue();
}


private TerminateTicketCommand terminateWithTargetPredicate(TicketFilter ticketFilter) {
    return TerminateTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}

```
_**해석**<br>
(1) 티켓 추가를 위한 명령을 실행합니다. (Ticket's key : KEY 1, KEY 2)<br>
(2) 티켓 개수를 확인합니다. (2개)<br>
(3) 동일한 키를 가진 티켓을 해지합니다. (KEY 2)<br>
(4) 티켓 개수를 확인합니다. (1개)<br>
(5) 동일한 키를 가진 티켓을 해지합니다. (KEY 1)<br>
(6) 티켓 개수를 확인합니다. (0개)<br>
(7) 보유한 티켓이 없는지 확인합니다. (True)<br>_

### **220216::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void terminateWithAll() {
    sut.execute(AddTicketCommandFactory.create("KEY 1", TicketProps.empty(), ANY_EXPIRY_DATE));

    TerminateTicketCommand command = terminateWithTargetPredicate(TicketFilter.ALL);

    sut.execute(command);

    assertThat(sut.hasNotTickets()).isTrue();

}

private TerminateTicketCommand terminateWithTargetPredicate(TicketFilter ticketFilter) {
    return TerminateTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 생성합니다. (KEY 1)<br>
(2) 티켓 제거 명령을 만듭니다. (모든 티켓)<br>
(3) 티켓 제거 명령을 실행합니다. <br>
(4) 티켓이 존재하지 않는지 확인합니다. (True)<br>_

### **220217::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void expireTicket() {

    String key1 = "KEY 1";
    String key2 = "KEY 2";

    sut.execute(AddTicketCommandFactory.create(key1, TicketProps.empty(), ANY_EXPIRY_DATE));
    sut.execute(AddTicketCommandFactory.create(key2, TicketProps.empty(), ANY_EXPIRY_DATE));
    assertThat(sut.getSizeOfTicket()).isEqualTo(2);

    sut.execute(expireWithTargetPredicate((t1) -> key2.equals(t1.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(1);

    sut.execute(expireWithTargetPredicate((t) -> key1.equals(t.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(0);
    assertThat(sut.hasNotTickets()).isTrue();
}

private ExpireTicketCommand expireWithTargetPredicate(TicketFilter ticketFilter) {
    return ExpireTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 생성합니다. (KEY 1, KEY 2)<br>
(2) 티켓을 지갑에 추가합니다.<br>
(3) 지갑 내 티켓의 총 개수를 확인합니다 (2개)<br>
(4) 지갑 내 티켓을 만료시킵니다. (KEY 2)<br>
(5) 티켓의 개수를 확인합니다. (1개)<br>
(6) 지갑 내 티켓을 만료시킵니다. (KEY 1)<br>
(7) 티켓의 개수를 확인합니다. (0개)<br>
(8) 티켓이 존재하지 않는지 확인합나다. (True)<br>_

_**생각**<br>
(1) 이게 만료로 인해 제거된 건지는 어떻게 알 수 있을까? expireWithTargetPredicate? 헷갈릴 수도 있을 것 같다. <br>_

### **220218::trevari::wallet::domain::WalletTest**
`반영 완료`

```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void expireWithAll() {
    sut.execute(AddTicketCommandFactory.create("Ket 1", TicketProps.empty(), ANY_EXPIRY_DATE));

    ExpireTicketCommand command = expireWithTargetPredicate(TicketFilter.ALL);

    sut.execute(command);

    assertThat(sut.hasNotTickets()).isTrue();
}

private ExpireTicketCommand expireWithTargetPredicate(TicketFilter ticketFilter) {
    return ExpireTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 지갑에 추가합니다. (Ket 1, 오타인 듯)<br>
(2) 모든 티켓에 대해 만료시키는 명령을 생성합니다.<br>
(3) 지갑에서 만료 명령을 실행합니다.<br>
(4) 지갑에 티켓이 없는지 확인합니다.<br>_

_**생각**<br>
(1) 키 네임에서 오타가 하나 있었는데, 그걸 발견했을 때 저걸 고치는 게 맞는 걸까?<br>
(2) 저거 하나만 배포하는 게 맞을까?<br>
(3) 아니면 다른 거 나갈 때 같이 포함해서?<br>
(4) 아니면 아예 냅둬도 될 까? 동작하는 기능엔 문제가 없으니?<br>_

### **220219::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void useTicketTest() {

    String key1 = "KEY 1";
    String key2 = "KEY 2";

    sut.execute(AddTicketCommandFactory.create(key1, TicketProps.empty(), ANY_EXPIRY_DATE));
    sut.execute(AddTicketCommandFactory.create(key2, TicketProps.empty(), ANY_EXPIRY_DATE));
    assertThat(sut.getSizeOfTicket()).isEqualTo(2);

    sut.execute(useWithTargetPredicate((t1) -> key2.equals(t1.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(1);

    sut.execute(useWithTargetPredicate((t) -> key1.equals(t.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(0);
    assertThat(sut.hasNotTickets()).isTrue();
}

private UseTicketCommand useWithTargetPredicate(TicketFilter ticketFilter) {
    return UseTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 지갑에 추가합니다. (KEY 1, KEY 2)<br>
(2) 지갑 내 티켓 개수를 확인합니다. (2개)<br>
(3) 티켓을 사용 처리합니다. (KEY 2)<br>
(4) 지갑 내 티켓 개수를 확인합니다. (1개)<br>
(5) 티켓을 사용 처리합니다. (KEY 1)<br>
(6) 지갑 내 티켓 개수를 확인합니다. (0개)<br>
(7) 지갑 내 티켓이 존재하지 않는지 확인합니다. (True)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 건 어떨까?<br>
(3) requestNotFound(inavalidWalletId) 와 같은 형태처럼<br>_

### **220220::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void 새롭게_생성한_지갑은_삭제되지_않은_상태다() {
    Wallet sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);

    boolean usable = sut.isDeleted();

    assertThat(usable).isFalse();
}
```
_**해석**<br>
(1) 지갑을 생성합니다.<br>
(2) 지갑이 삭제된 상태인지 확인합니다. (False)<br>_

### **220221::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void delete는_지갑을_삭제된_상태로_만든다() {
    Wallet sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);

    sut.delete();

    assertThat(sut.isDeleted()).isTrue();
}
```
_**해석**<br>
(1) 지갑을 생성합니다.<br>
(2) 지갑을 제거합니다.<br>
(3) 지갑이 제거된 상태인지 확인합니다. (True)<br>_

### **220222::trevari::wallet::api::WalletApiControllerTest**
`반영 완료`

```java
@InjectMocks
WalletApiController sut;

@Test
void getWallet() {
    given(walletService.findBy(WALLET_ID_VALUE)).willReturn(Optional.of(wallet));

    sut.getWallet(WALLET_ID_VALUE);

    verify(walletService).findBy(WALLET_ID_VALUE);
    verify(walletResponseConverter).convertBy(wallet);
}
```
_**해석**<br>
(1) walletId 를 통해 wallet 을 가져올 때, 미리 정의한 wallet 을 반환합니다.<br>
(2) walletId 를 통해 지갑을 가져옵니다. (이때, 미리 정의한 wallet 을 반환하도록 합니다)<br>
(3) walletService 에서 findBy 를 호출했는지 확인합니다.<br>
(4) walletResponseConverter 에서 convertBy 를 호출했는지 확인합니다.<br>_

_**생각**<br>
(1) 이것이 화이트박스 테스트인가 보다. (내부 동작을 검사)<br>
(2) 너무 개발자스러운 테스트라 생각했다.<br>
(3) 뭔가 좀 더 일상적인 용어로 설명할 수 있을 정도의 테스트면 어떨까?<br>_

### **220223::trevari::wallet::api::WalletApiControllerTest**
```java
@InjectMocks
WalletApiController sut;

@Test()
@DisplayName("Wallet 이 없다면 예외를 던진다.")
void when_wallet_is_none_service_throws_exception() {
    given(walletService.findBy(WALLET_ID_VALUE)).willReturn(Optional.empty());

    assertThatThrownBy(() -> sut.getWallet(WALLET_ID_VALUE)).isInstanceOf(WalletNotFoundException.class);

}
```
_**해석**<br>
(1) walletId 를 통해 wallet 을 가져올 때, 빈 wallet 을 반환하도록 합니다.<br>
(2) walletId 를 통해 wallet 을 가져올 때 지갑이 존재하지 않는다는 예외가 발생하는지 확인합니다.<br>_

### **220224::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[400] In getWallet, When Wallet Id is invalid, Http State is 400")
void _400_getWallet_for_walletId_is_invalid_state_is_400() throws Exception {
    mvc.perform(get(WALLETS_URL + "/{walletId}", "this is string")
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isBadRequest())
            .andExpect(jsonOf(ErrorResponse.with(400, "Invalid WalletId.")));
    //hints Resolved Exception:
}
```
_**해석**<br>
(1) api 요청을 합니다. (유효하지 않은 요청, '/apis/wallets/this is string')<br>
(2) http status 가 올바른지 확인합니다. (BadRequest)<br>
(3) http code 가 올바른지 확인합니다. (400)<br>
(4) http reason 가 올바른지 확인합니다. (Invalid WalletId.)<br>_

### **220225::trevari::wallet::api::WalletApiControllerMVCTest**
`반영 완료`

```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[404] In getWallet, When Wallet is None, Http State is 404")
void _404_getWallet_when_wallet_is_none_state_is_404() throws Exception {
    given(walletService.findBy(anyLong())).willReturn(Optional.empty());

    mvc.perform(get(WALLETS_URL + "/{walletId}", 1)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNotFound())
            .andExpect(jsonOf(ErrorResponse.with(404, WalletNotFoundException.withWalletId(1L).getMessage())));
}
```
_**해석**<br>
(1) wallet 을 가져오려 하면, 빈 값을 반환하도록 합니다.
(2) api 요청을 합니다. (존재하지 않는 walletId, '/apis/wallets/1')<br>
(3) http status 가 올바른지 확인합니다. (Not Found)<br>
(4) http code 가 올바른지 확인합니다. (404)<br>
(5) http reason 가 올바른지 확인합니다. (Wallet(1) is Not found)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 건 어떨까?<br>
(3) requestNotFound(inavalidWalletId) 와 같은 형태처럼<br>_

### **220226::trevari::wallet::api::WalletApiControllerMVCTest**
`반영 완료`

```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[500] In getWallet")
void _500_getWallet() throws Exception {
    doThrow(new RuntimeException("some message")).when(walletService).findBy(anyLong());

    mvc.perform(get(WALLETS_URL + "/{walletId}", 1)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isInternalServerError())
            .andExpect(jsonOf(ErrorResponse.with(500, "some message")));
}
```
_**해석**<br>
(1) wallet 을 가져오려 하면, 예외를 던지도록 합니다. (some message)<br>
(2) api 요청을 합니다. (/apis/wallets/1)<br>
(3) http status 가 올바른지 확인합니다. (Internal Server Error)<br>
(4) http code 가 올바른지 확인합니다. (500)<br>
(5) http reason 가 올바른지 확인합니다. (some message)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 것도 괜찮을 것 같다. (ex. requestInternalServerError())<br>_

_**doThrow**<br>
(1) 이번 테스트 케이스를 통해 doThrow 라는 메소드를 처음 알았다.<br>
(2) 테스트 시 특정 동작에서 임의의 예외를 던지도록 지정하는 메소드임.<br>_

### **220227::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[200] In getWallet ")
void _200_getWallet() throws Exception {
    given(walletService.findBy(ANY.WALLET_ID_VALUE)).willReturn(Optional.of(ANY.WALLET));

    mvc.perform(MockMvcRequestBuilders.get(WALLETS_URL + "/{walletId}", ANY.WALLET_ID_VALUE)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isOk())
            .andExpect(content().string(objectMapper.writeValueAsString(walletResponseConverter.convertBy(ANY.WALLET))));
}
```
_**해석**<br>
(1) wallet 을 가져오려 하면, 미리 정의한 wallet 을 반환합니다.<br>
(2) api 요청을 합니다. (/apis/wallets/{walletId})<br>
(3) http status 가 올바른지 확인합니다. (Ok)<br>
(4) http response content 가 올바른지 확인합니다. (미리 정의한 wallet)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 것도 괜찮을 것 같다. (ex. requestOk())<br>_

### **220228::trevari::wallet::api::WalletApiControllerMVCTest**
`반영 완료`

```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[500] In findBy")
void _500_findBy() throws Exception {
    doThrow(new RuntimeException("some message")).when(walletService).findBy(ANY.USER_ID);

    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", ANY.USER_ID.getId())
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isInternalServerError())
            .andExpect(jsonOf(ErrorResponse.with(500, "some message")));;
}
```
_**해석**<br>
(1) userId 로 wallet 을 가져오려 하면, 예외를 던집니다. (Runtime exception, "some message")<br>
(2) api 요청을 합니다. (/apis/wallets?f=find&user={userId})<br>
(3) http status 가 올바른지 확인합니다. (Internal server error)<br>
(3) http code 가 올바른지 확인합니다. (500)<br>
(4) http response 가 올바른지 확인합니다. (some message)<br>_

_**해당 테스트 목적**<br>
(1) Runtime exception 이 감지되면 Internal server error (code: 500) 이 발생한다는 것을 표현한다 생각된다.<br>_

### **220301::trevari::wallet::api::WalletApiControllerMVCTest**
`반영 완료`

```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[400] In findBy, When user id is None, Http State is 400 ")
void _400_findBy_when_user_id_parameter_is_empty_state_is_400() throws Exception {
    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", StringUtils.EMPTY)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isBadRequest())
            .andExpect(jsonOf(ErrorResponse.with(400, "Invalid UserId.")));
}
```
_**해석**<br>
(1) api 요청을 합니다. ("/apis/wallets?f=find&user={userId}", userId is empty)<br>
(2) http status 가 일치하는지 확인합니다. (Bad Request)<br>
(3) http code 가 일치하는지 확인합니다. (400)<br>
(4) http response message 가 올바른지 확인합니다. (Invalid UserId)<br>_

_**해당 테스트 목적**<br>
(1) 요청 시 userId Parameter 값이 비어있다면, Bad Request(400, Invalid UserId) 로 응답한다는 것을 알리기 위해 존재한다고 생각한다.<br>_

### **220302::trevari::wallet::api::WalletApiControllerMVCTest**
`반영 완료`

```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[404] In findBy, When Wallet is None, Http State is 404 ")
void _404_findBy_when_wallet_is_none_state_is_404() throws Exception {
    given(walletService.findBy(ANY.USER_ID)).willReturn(Optional.empty());

    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", ANY.USER_ID.getId())
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNotFound())
            .andExpect(jsonOf(ErrorResponse.with(404, WalletNotFoundException.withMessage("Wallet is Not found. UserId is " + ANY.USER_ID.getId()).getMessage())));
}
```
_**해석**<br>
(1) userId 로 wallet 을 가져올 때, 빈 값을 반환합니다.<br>
(2) api 요청을 합니다. ("/apis/wallets?f=find&user={userId}", Returned wallet is empty)<br>
(3) http status 가 일치하는지 확인합니다. (Not Found)<br>
(4) http code 가 일치하는지 확인합니다. (404)<br>
(5) http response message 가 올바른지 확인합니다. (Wallet is Not found. UserId is {userId})<br>_

_**해당 테스트 목적**<br>
(1) 요청 시 userId 에 일치하는 wallet 이 없으면 Not found 로 응답한다는 것을 알리는 목적이라 생각된다.<br>_

### **220303::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[200] In findBy")
void _200_findByUser() throws Exception {
    given(walletService.findBy(ANY.WALLET.getUserId())).willReturn(Optional.of(ANY.WALLET));

    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", ANY.WALLET.getUserId().getId())
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(walletResponseConverter.convertBy(ANY.WALLET))));
}
```
_**해석**<br>
(1) userId 로 지갑을 가져올 때, 지정된 지갑을 반환합니다.<br>
(2) api 요청을 합니다. ("/apis/wallets?f=find&user={userId}")<br>
(3) http status 가 일치하는지 확인합니다. (Ok)<br>
(4) http code 가 일치하는지 확인합니다. (200)<br>
(5) http response content 가 올바른지 확인합니다. (지정된 지갑 데이터)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>
(2) 해당 테스트 코드에서는 "/apis/wallets?f=find&user={userId}" 로 요청 시 지갑 데이터를 반환해 준다.<br>_

### **220304::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[400] In findUserIdByMeetingId, When meetingId id is None, Http State is 400 ")
void _400_findUserIdByMeetingId_when_meeting_id_parameter_is_empty_state_is_400() throws Exception {
    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("meetingId", StringUtils.EMPTY)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isBadRequest())
            .andExpect(jsonOf(ErrorResponse.with(400, "Invalid UserId.")));
}
```
_**해석**<br>
(1) api 요청을 합니다. ("/apis/wallets?f=find&meetingId={meetingId}&v=0.1.0", meetingId is empty)<br>
(2) http status 가 일치하는지 확인합니다. (Bad Request)<br>
(3) http code 가 일치하는지 확인합니다. (400)<br>
(4) http response message 가 올바른지 확인합니다. (Invalid UserId)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>
(2) 해당 테스트 코드에서는 아래 형식으로 요청 시 에러(code=400, message=Invalid UserId)를 반환해 준다.<br>
URL = "/apis/wallets?f=find&meetingId={meetingId}&v=0.1.0"<br>
MetaData = "contentType=application-json, accept=application-json"<br>_

_**이상한 점**<br>
(1) meetingId 가 empty 지만, 실제 내보내는 에러 메시지는 Invalid UserId 이다.<br>
(2) Invalid MeetingId 로 수정되어야 한다 생각된다.<br>_

### **220305::trevari::wallet::api::DeleteWalletApiControllerTest**
```java
@Test
void _204_successful_deletion(@Mock Wallet wallet) throws Exception {
    given(walletService.findBy(UserId.of("user_id"))).willReturn(Optional.of(wallet));

    mvc.perform(delete("/apis/wallets/users/{user}", "user_id")
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNoContent());
}
```
_**해석**<br>
(1) 지갑 삭제 요청 시 미리 정의된 지갑을 반환합니다.<br>
(2) 지갑 삭제를 요청합니다. ("/apis/wallets/users/{user}?v=0.1.0")<br>
(3) 상태가 일치한 지 확인합니다. (No Content)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>_

_**No Content**<br>
(1) 성공적으로 처리했지만 컨텐츠를 제공하지는 않는다. 일반 사용자가 볼 일은 거의 드물며 처리 결과만 중요한 API 요청 등에서 주로 사용한다.<br>_

_**약간의 의문**<br>
(1) 삭제 요청에 성공했을 때 성공 여부를 반환하는게 맞지 않나?<br>
(2) 동시에 htpp code 는 200 으로 반환하는게 맞다 생각된다.<br>_

### **220306::trevari::wallet::api::DeleteWalletApiControllerTest**
```java
@Test
void _404_WalletNotFoundException(@Mock Wallet wallet) throws Exception {
    doThrow(WalletNotFoundException.class).when(deleteWalletService).deleteWallet(wallet);

    mvc.perform(delete("/apis/wallets/users/{user}", "user_id")
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNotFound());
}
```
_**해석**<br>
(1) 지갑 삭제 요청 시 예외를 던집니다. (WalletNotFoundException)<br>
(2) 지갑 삭제를 요청합니다. ("/apis/wallets/users/{user}?v=0.1.0")<br>
(3) 상태가 일치한 지 확인합니다. (Not Found)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>_

### **220307::trevari::wallet::consumer::WalletFinderTest**
`반영 완료`

```java
@Test
void walletByUserId(@Mock Wallet wallet) {
    given(repository.findByUserId(USER_ID)).willReturn(wallet);
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);

    Wallet actual = sut.walletByUserId(USER_ID);

    assertThat(actual).isInstanceOf(Wallet.class);
}
```
_**해석**<br>
(1) 레파지토리에서 지갑을 가져오려 할 때, 지정된 지갑을 반환합니다.<br>
(2) Wallet Finder 를 정의합니다.<br>
(3) Wallet Finder 를 통해 지갑을 가져옵니다.<br>
(4) 가져온 지갑이 Wallet 클래스인지 확인합니다.<br>_

_**내 생각**<br>
(1) 이미 특정 지갑을 반환하라고 정의했으니 반환하는 값에 대한 비교가 의미없다고 생각됨.<br>
(2) 이런 Application 같은 경우에는 WhiteBox 테스트를 통해 특정 메소드를 호출하는 것을 확인하는게 좋겠다.<br>
(3) 이때는 Mockito.verify() 메소드가 사용될 것이다.<br>_

### **220308::trevari::wallet::consumer::AddServiceTest**
`반영 완료`

```java
@InjectMocks
AddService sut;

@BeforeEach
void setUp() {
    anyServices = new ArrayList<>();
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, null);
    ANY_PROPERTIES.put(MEMBER_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(MEMBERSHIP_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(SERVICE_ID_PROPERTIES_NAME, "1L");
    ANY_CHANGED_SERVICE.setServiceId(ANY_SERVICE_ID);
    ANY_CHANGED_SERVICE.setBadge(null);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
}

@Test
void MEETING_ID_가_없는_독서모임_서비스_예외_처리() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, null);
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, ANY_SERVICE_PERIOD_PROPERTIES);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);

    assertThatThrownBy(() -> sut.add(command));
}
```
**해석**<br>
해당 테스트 코드는 티켓을 추가하는 서비스에서 독서모임 티켓 추가 명령 시 _MEETING_ID_PROPERTIES_ 가 없으면 예외를 내보내는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
해당 테스트를 보자마자 숨이 턱 막혔습니다.<br>
왜 그럴까요?<br>
일단.. 알아야 할 정보가 너무 많습니다.<br>
그래서 테스트 코드 내에서 필요한 데이터를 추가해 주는 부분이 명시적이지 못하다고 생각합니다.<br>
이름 자체가 _MEETING ID가 없는 독서모임 서비스 예외 처리_ 이기 때문이죠.<br>
이런 경우에는 메소드를 따로 정의하는 것이 어떨까 생각합니다.<br>
<br>
_ex) MEETING_ID_IS_NULL();_<br>
<br>
그리고 다른 프로퍼티 및 데이터들에 대해서는 다른 코드와 비교하여 공통적인 부분만 따로 메소드로 빼거나 _setUp_ 에서 정의하는 게 좋을 것 같습니다.<br>
그러면 더욱 가독성이 좋은 테스트 코드가 될 것이라는 생각입니다.<br>

### **220309::trevari::wallet::consumer::AddServiceTest**
`반영 완료`

```java
@InjectMocks
AddService sut;

@BeforeEach
void setUp() {
    anyServices = new ArrayList<>();
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, null);
    ANY_PROPERTIES.put(MEMBER_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(MEMBERSHIP_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(SERVICE_ID_PROPERTIES_NAME, "1L");
    ANY_CHANGED_SERVICE.setServiceId(ANY_SERVICE_ID);
    ANY_CHANGED_SERVICE.setBadge(null);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
}

@Test
void SERVICE_PERIOD_가_없는_독서모임_서비스_예외_처리() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, "asdasdasdasd");
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, null);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);

    assertThatThrownBy(() -> sut.add(command));
}
```
**해석**<br>
해당 테스트 코드는 티켓을 추가하는 서비스에서 독서모임 티켓 추가 명령 시 _SERVICE_PERIOD_ 가 없으면 예외를 내보내는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
해당 테스트 코드에서 알아야하는 정보가 너무 많습니다. 그저 SERVICE_PERIOD 가 없을 때 예외 처리되는 것 을 보고싶을 뿐인데 말이죠.<br>
이 테스트 코드에서 얻어야 하는 정보는 _(1) SERVICE_PERIOD 가 유효하지 않은 것과 (2) 그 상황에서 add 명령을 시도했을 때, 예외가 발생한다는 것_ 입니다.<br>
코드를 수정해 봤습니다.<br>

```java
@Test
void SERVICE_PERIOD_가_없는_독서모임_서비스_예외_처리() {
    SET_DATA_FOR_INVALID_SERVICE_PERIOD();

    assertThatThrownBy(() -> sut.add(command));
}

private void SET_DATA_FOR_INVALID_SERVICE_PERIOD() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, "asdasdasdasd");
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, null);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);
}
```

메소드 _SET_DATA_FOR_INVALID_SERVICE_PERIOD_ 를 통해 어떤 일을 하는 코드인지 더욱 명시적으로 표현해 봤습니다.<br>
다른 테스트 코드와의 공통점을 찾아 공통 메소드로 분리하는 것도 좋은 방법일 것 같다는 생각입니다.<br>

### **220310::trevari::wallet::consumer::AddServiceTest**
`반영 완료`

```java
@InjectMocks
AddService sut;

@Test
void 티켓_추가() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, "asdasdasdasd");
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, ANY_SERVICE_PERIOD_PROPERTIES);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);

    sut.add(command);

    verify(wallet).execute(any(AddTicketCommand.class));
}
```
**해석**<br>
해당 테스트 코드는 티켓을 추가하는 서비스에서 티켓 추가 명령이 호출된다는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
티켓을 추가할 때 필요한 PROPERTIES 에 대해 추가하는 것은 보여줘도 된다 생각합니다.<br>
하지만 ANY_CHANGED_SERVICE? 왜 추가하는 서비스에서 변경하는 서비스를 알아야 하지?<br>
의문이 생기네요..<br>
<br>
행하는 역할에 대해서는 따로 이견이 없지만, 상수명이 헷갈립니다.<br>
차라리, 상수명을 아래처럼 변경하는 것이 더 좋을 것 같습니다.<br>
ANY_CHANGED_SERVICE -> ANY_SERVICE<br>
<br>

### **220311::trevari::wallet::consumer::CreateServiceTest**
`반영 완료`

```java
@InjectMocks
CreateService sut;

@Test
void 지갑이_이미있다면_생성하지않는다() {
    UserId userId = UserId.of("Tester");
    CreateCommand command = CreateCommand.of(userId);

    given(repository.existsByUserId(userId)).willReturn(true);

    assertThatThrownBy(() -> sut.create(command)).isInstanceOf(EntityAlreadyExistsException.class);

    verify(repository, never()).save(any(Wallet.class));
}
```
**해석**<br>
지갑을 추가할 때, 해당하는 유저의 지갑이 이미 있다면 예외를 던지는 테스트 코드입니다.<br>

**생각**<br>
딱히 뭐라고 할 코드는 아닙니다.<br>
하지만 우리가 집중하고자 하는 방향에 좀 더 초점을 맞출 수 있도록 하려면 어떻게 해야할까요?<br>
<br>
두 가지가 있습니다.<br>
(1) 딱히 알아도 되지 않을 정보를 빼고<br>
(2) 알고싶은 정보를 추가합니다.<br>
<br>
첫 번째, 알아도 되지 않을 정보는 _userId 와 verify_ 부분인 것 같습니다.<br>
해당 유저에 대한 지갑 생성 명령 시 _이미 있는 유저인가? 에 대해서 이미 있다._ 라고 답하는 것만 있으면 되고<br>
_이미 있는 유저이기 때문에 예외를 발생_ 시키는 것을 알면 됩니다.<br>
<br>
두 번째, 알고싶은 정보는 _어떤 예외를 던지는 지와 그 예외에서 어떤 메시지를 던지는 지_ 알고 싶습니다.<br>
어떤 예외를 던지는 지는 이미 적혀있습니다. 하지만, 이 예외에서 어떤 메시지를 던지는 지는 알 수 없습니다.<br>
추가해 주면 좋겠습니다.<br>
```java
assertThatThrownBy(() -> sut.create(command))
        .isInstanceOf(EntityAlreadyExistsException.class)
        .hasMessageContaining("userId is already exist");
```

### **220312::trevari::wallet::consumer::CreateServiceTest**
```java
@InjectMocks
CreateService sut;

@Test
void 지갑이_없다면_생성한다() {
    UserId userId = UserId.of("Tester");
    CreateCommand command = CreateCommand.of(userId);

    given(repository.existsByUserId(userId)).willReturn(false);

    sut.create(command);

    verify(idGenerator).gen(WalletId.class);
    verify(repository).save(any(Wallet.class));
}
```
**해석**<br>
지갑을 추가할 때, 해당하는 유저의 지갑이 없다면 지갑을 추가하는 테스트 코드입니다.<br>

**생각**<br>
지갑을 생성하는 명령을 실행할 때, 필요한 정보들을 다 담고 있으며,<br>
지갑의 ID 가 생성되고, 생성된 지갑을 저장하는 것까지 명시적입니다.<br>
딱히 변경할 필요가 없다고 생각이 드는 코드입니다.<br>

### **220313::trevari::wallet::consumer::WalletFinderTest**
`반영 완료`

```java
@Test
void walletByUserId(@Mock Wallet wallet) {
    given(repository.findByUserId(USER_ID)).willReturn(wallet);
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);

    Wallet actual = sut.walletByUserId(USER_ID);

    assertThat(actual).isInstanceOf(Wallet.class);
}
```
**해석**<br>
유저 정보(userId)를 통해 지갑 조회 테스트하는 코드입니다.<br>

**생각**<br>
현재 해당 테스트는 의미없다 생각합니다.<br>
미리 지정된 지갑을 반환하고, 그 지정된 지갑이 맞는지 확인하는 것이기 때문입니다.<br>
제 생각에는 애플리케이션 로직인 만큼 다른 로직이 호출되는 것을 확인하는 것이 로직을 표현하기에 좋은 테스트같습니다.<br>
해당 테스트에서는 repository 의 메소드 호출을 확인하는 것이 될 수 있겠네요.<br>
이런 식으로 코드를 짤 수 있습니다.<br>
```java
@BeforeEach
void before() {
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);
}

@Test
void walletByUserId(@Mock Wallet wallet) {
    sut.walletByUserId(USER_ID);
    verify(repository).findByUserId(USER_ID);
}
```

### **220314::trevari::wallet::consumer::TicketKeyGeneratorTest**
```java
@Test
void generate_book_meeting_ticket_key() {
    service.setBadge(BOOK_CLUB_MEMBER);
    String key = ticketKeyGenerator.generate(service);

    assertThat(key).isEqualTo("BC:" + MEETING_ID_1);
}
```
**해석**<br>
뱃지에 따라 알맞은 포맷으로 키를 생성하는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
서비스에 뱃지를 셋팅하고, 키를 만드는 코드를 실행합니다.<br>
그리고 그 생성한 키를 받아 뱃지에 맞는 포맷인지 확인하네요.<br>
딱히 변경할 점이 없어보입니다. 저는 알고싶은 부분을 정확하게 알게 되었습니다.<br>

### **220315::trevari::member::consumer::TerminateServiceImplTest**
`반영 완료`

```java
TerminateServiceImpl sut;
TerminateCommand command = new TerminateCommand();

@Mock
MemberRepository repository;

@Mock
Member member;

@BeforeEach
void setUp() {
    command.setMemberId(ANY_MEMBER_ID);
    command.setRefundApplicatedAt(ANY_REFUND_APPLICATED_AT);
    sut = new TerminateServiceImpl(repository);
}

@Test
void verify_method() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);

    sut.terminate(command);

    verify(repository).findById(ANY_MEMBER_ID);
    verify(member).terminate();
    verify(repository).save(member);
}
```
**해석**<br>
해지 명령을 실행할 때, 호출되어야 하는 메소드가 호출되는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
딱히 부족하다고 생각이 드는 코드는 아닙니다.<br>
하지만 더욱 명시적으로 하기 위해선, 멤버가 정말 해지 대상인지 확인시켜주는 코드가 내부에 있으면 좋을 것 같습니다.<br>
아래 코드를 넣어주면 더욱 명시적일 것 같습니다.<br>
```java
given(member.isTerminated()).willReturn(false);
```

### **220316::trevari::member::consumer::TerminateServiceImplTest**
`반영 완료`

```java
TerminateServiceImpl sut;
TerminateCommand command = new TerminateCommand();

@Mock
MemberRepository repository;

@Mock
Member member;

@BeforeEach
void setUp() {
    command.setMemberId(ANY_MEMBER_ID);
    command.setRefundApplicatedAt(ANY_REFUND_APPLICATED_AT);
    sut = new TerminateServiceImpl(repository);
}

@Test
void when_member_terminated_never_terminate_again() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);
    given(member.isTerminated()).willReturn(true);

    sut.terminate(command);

    verify(member, never()).terminate();
}
```
**해석**<br>
해지 명령을 실행할 때, 멤버가 이미 해지되어 있다면 해지 명령을 다시하지 않는 것을 보여주는 테스트 코드입니다.<br>

**생각**<br>
해당 테스트에서 필요한 내용을 생각해 봅니다.<br>
일단 해지 명령을 시도하는 것이 있을 것이고(sut.terminate), 해지 명령을 시도할 때 멤버가 이미 해지되어 있다는 내용도 필요합니다(willReturn).<br>
그리고 최종적으로 해지 명령을 다시하지 않는다는 내용이 필요합니다.(verify)<br>
이 부분들은 전부 포함이 되어있군요.<br>
해당 테스트 코드에서 표현하고 싶은 부분은 전부 있는 것 같습니다.<br>
가독성도 괜찮은 것 같아요.<br>
굳이 변경을 주자면, 테스트 제목을 한글로 바꾸는 건 어떨까요?<br>
_ex) 멤버를 해지할 때, 이미 해지된 멤버면 해지명령을 시도하지 않는다_<br>
꼭 필요한 부분은 아니지만 한 걸음 더 나아갔다는 느낌을 받을 수는 있을 것 같습니다.<br>

### **220317::trevari::scheduler::domain::ScheduleGroupTest**
```java
private static final ScheduleGroupId SCHEDULE_GROUP_ID = ScheduleGroupId.of(1L);
private static final ScheduleTriggerRuleId SCHEDULE_TRIGGER_RULE_ID = ScheduleTriggerRuleId.of(1L);
private static final LocalDateTime _2022_03_15_18_00 = LocalDateTime.of(2022, 3, 15, 18, 0);

private static ScheduleGroup sut;

@BeforeEach
void setUp() {
    sut = ScheduleGroup.of(SCHEDULE_GROUP_ID, SCHEDULE_TRIGGER_RULE_ID, _2022_03_15_18_00);
}

@Test
void 스케줄을_추가한다() {
    sut.newSchedule("d-7");
    sut.newSchedule("d-5");
    sut.newSchedule("d-3");

    assertThat(sut.hasScheduleBy(getTriggerDateTime("d-7"))).isTrue();
    assertThat(sut.hasScheduleBy(getTriggerDateTime("d-5"))).isTrue();
    assertThat(sut.hasScheduleBy(getTriggerDateTime("d-3"))).isTrue();
}

private LocalDateTime getTriggerDateTime(String s) {
    return TriggerRule.ofPattern(s).applyTo(_2022_03_15_18_00);
}
```
**해석**<br>
스케줄을 추가하고, 각 triggerRuleText 에 해당하는 schdule 이 있는지 확인합니다.<br>

**생각**<br>
메일을 보내는 시점에서 작업이 진행 중인 프로젝트의 테스트 코드입니다.<br>
작업을 진행하며 피드백을 반영해도 좋겠다 싶어 테스트 해석 메일로 발송합니다.<br>
<br>
일단, 두 가지에 대해 말하고 싶습니다.<br>
1. ScheduleGroup 을 생성할 때 넘기는 날짜<br>
2. hasScheduleBy 메소드<br>
<br>
ScheduleGroup 생성 시 넘기는 날짜는 무엇을 의미하는 것인지 잘 모르겠습니다.<br>
그냥 실제 property name 인 _REFERENCE_DATE_TIME_ 으로 변경해 명시적으로 표현하면 좋을 것 같습니다.<br>
<br>
hasScheduleBy 메소드는 테스트 코드를 제외하면 내부에서만 사용하는 메소드입니다.<br>
이전에는 findScheduleBy 라는 메소드로 테스트에 사용했으나, 해당 메소드는 아무 곳도 사용하는 곳이 없어 제거한 상태입니다.<br>
이런 경우에는 private 메소드로 변경하는 게 맞다고 생각하지만, 변경한 이후엔 스케줄을 추가했다는 테스트를 어떻게 할 지 잘 떠오르지 않습니다.. 그래서 현재 public 메소드로 두고 있습니다.<br>
<br>

### **220318::trevari::member::consumer::MembershipPeriodFinderTest**
`반영 완료`

```java
@BeforeEach
void setUp() {
    sut = new MembershipPeriodFinder();
}

@Test
void wrong_club_type() {
    MemberInfoChangeCommand command = new MemberInfoChangeCommand();
    command.setEventedAt(Clocks.now());
    command.setClub(Club.of(null, "WRONG_TYPE", LocalDateTime.now(), LocalDateTime.now()));
    command.setMeetings(Lists.newArrayList(Meeting.of(MeetingId.of("123"), 1L, LocalDateTime.of(2021, 6, 1, 1, 1), LocalDateTime.of(2021, 12, 1, 1, 1))));

    assertThatThrownBy(
            () -> sut.getPeriodOfMembership(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Proper Club Type is not found.");
}
```
**해석**<br>
멤버십 기간을 가져올 때, 유효하지 않은 타입이면 예외를 던진다는 것을 알 수 있는 테스트입니다.<br>

**생각**<br>
커맨드를 만들고, 해당하는 커맨드를 통해 명령을 실행합니다.<br>
저는 집중하고싶은 부분이 clubType 이기 때문에, 해당 값을 제외하고는 알지 않아도 괜찮다고 생각합니다.<br>
따로 메소드로 추출하고 싶네요. 구현해 보면 아래 형태의 코드가 됩니다.<br>
```java
@Test
void wrong_club_type() {
    MemberInfoChangeCommand command = createCommandByClubType("WRONG_TYPE");;

    assertThatThrownBy(
            () -> sut.getPeriodOfMembership(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Proper Club Type is not found.");
}

private MemberInfoChangeCommand createCommandByClubType(String clubType) {
    MemberInfoChangeCommand command = new MemberInfoChangeCommand();
    command.setEventedAt(Clocks.now());
    command.setClub(Club.of(null, clubType, LocalDateTime.now(), LocalDateTime.now()));
    command.setMeetings(Lists.newArrayList(Meeting.of(MeetingId.of("123"), 1L, LocalDateTime.of(2021, 6, 1, 1, 1), LocalDateTime.of(2021, 12, 1, 1, 1))));

    return command;
}
```

### **220319::trevari::member::consumer::MembershipPeriodFinderTest**
```java
@BeforeEach
void setUp() {
    sut = new MembershipPeriodFinder();
}

@Test
void period_of_membership() {
    MemberInfoChangeCommand command = new MemberInfoChangeCommand();
    command.setEventedAt(Clocks.now());
    command.setClub(Club.of(null, "BOOK_MEETING_CLUB", LocalDateTime.now(), LocalDateTime.now()));
    command.setMeetings(Lists.newArrayList(Meeting.of(MeetingId.of("123"), 1L, LocalDateTime.of(2021, 6, 1, 1, 1), LocalDateTime.of(2021, 12, 1, 1, 1))));

    Period result = sut.getPeriodOfMembership(command);

    assertThat(result).isInstanceOf(Period.class);
}
```
**해석**<br>
멤버십 기간을 가져오는지 확인하는 테스트 코드입니다.<br>

**해석하며 생각한 흐름**<br>
아마 테스트하는 부분이 무엇인지 확인하면 이 테스트에서 필요한 게 뭔지 알 수 있을 것 같습니다.<br>
<br>
then 부분을 먼저 확인해 보겠습니다.<br>
```java
assertThat(result).isInstanceOf(Period.class);
```
결과에 대한 변수가 Period.class 인지 확인합니다.<br>
결과에 대한 변수는 result 군요.<br>
<br>
result를 살펴봅시다.<br>
```java
Period result = sut.getPeriodOfMembership(command);
```
해당 값은 뭔진 모르겠지만 멤버십 기간을 가져오는 메소드를 커맨드를 넘기면서 호출한다는 사실을 알 수 있습니다.<br>
<br>
어떤 커맨드 일까요?<br>
```java
MemberInfoChangeCommand command = new MemberInfoChangeCommand();
command.setEventedAt(Clocks.now());
command.setClub(Club.of(null, "BOOK_MEETING_CLUB", LocalDateTime.now(), LocalDateTime.now()));
command.setMeetings(Lists.newArrayList(Meeting.of(MeetingId.of("123"), 1L, LocalDateTime.of(2021, 6, 1, 1, 1), LocalDateTime.of(2021, 12, 1, 1, 1))));
```
MemberInfoChangeCommand 타입의 객체를 넘기는 군요. <br>
그 아래 setter 를 호출하는 부분은 아마 필요한 값들을 적용하는 것 같습니다.<br>
진짜 그럴까요? 한 번 setter 를 주석처리하고 테스트를 돌려볼게요.<br>
```java
java.lang.NullPointerException
```
네.. NullPointerException 이 발생합니다. 커맨드에 세팅해준 값을 통해 어떤 동작을 수행한다는 것을 알 수 있겠네요.<br>
<br>
이런 과정으로 저는 필요한 부분이 모두 존재한다는 사실을 알았습니다.<br>

### **220320::trevari::wallet::domain::TicketsSerializeTest**
`반영 완료`

```java
@Test
void serializeAndDeserialize() {
    LocalDateTime expiryDate = LocalDateTime.MIN;
    Tickets tickets = Tickets.init();
    tickets.add(new Ticket("A", TicketProps.builder().with("id", 1L).build(), expiryDate));
    tickets.add(new Ticket("B", TicketProps.builder().with("id", 2L).build(), expiryDate));

    String serialized = serializer.serialize(tickets);
    Tickets deserialized = serializer.deserialize(serialized, Tickets.class);

    assertThat(tickets).isEqualTo(deserialized);
    assertThat(serializer.serialize(deserialized)).isEqualTo(serialized);
}
```
**해석**<br>
티켓을 직렬화와 역직렬화 했을 때, 데이터가 일치하는 지 확인하는 테스트 코드입니다.<br>

**생각**<br>
then 부분을 보면 tickets 가 deserialized 와 같은지, deserialized 가 직렬화되면 serialized 와 같은지 확인합니다.<br>
저는 이 테스트에서 표현하고 싶은게 두 가지로 보입니다.<br>
<br>
(1) 직렬화한 데이터가 옳은가?<br>
(2) 역직렬화한 데이터가 옳은가?<br>
<br>
위 두 가지를 이 한 테스트 코드에서 모두 표현하는 것은 오히려 가독성을 떨어뜨리는 일이라고 생각합니다.<br>
저는 위 테스트 코드를 쪼개 두 가지 테스트 코드로 표현하고자 합니다.<br>
<br>
```java
@Test
void Serialize() {
    Tickets tickets = getTickets();
    String ticketsString = getTicketsString();

    String serialized = serializer.serialize(tickets);

    assertThat(serialized).isEqualTo(ticketsString);
}


@Test
void Deserialize() {
    Tickets tickets = getTickets();
    String ticketsString = getTicketsString();

    Tickets deserialized = serializer.deserialize(ticketsString, Tickets.class);

    assertThat(deserialized).isEqualTo(tickets);
}

private Tickets getTickets() {
    LocalDateTime expiryDate = LocalDateTime.MIN;
    Tickets tickets = Tickets.init();
    tickets.add(new Ticket("A", TicketProps.builder().with("id", 1L).build(), expiryDate));
    return tickets;
}

private String getTicketsString() {
    return "{\"items\":[{\"key\":\"A\",\"properties\":{\"props\":{\"id\":\"1\"}},\"expiryDate\":\"-999999999-01-01T00:00:00\"}]}";
}
```
네, 저는 이렇게 나눈 것이 각 단위를 더 명확하게 표현할 수 있다고 생각해요.<br>
약간 ticket 들을 가져올 때, 고정된 값을 반환하는 게 약간 불편하긴 하지만 제가 원하는 목적은 일단 달성을 한 것 같습니다.<br>

### **220321::trevari::wallet::domain::TicketsSerializeTest**
`반영 완료`

```java
@Test
void 티켓이_없을때_Serialize() {
    Tickets tickets = Tickets.init();

    String serialized = serializer.serialize(tickets);
    Tickets deserialized = serializer.deserialize(serialized, Tickets.class);

    assertThat(serialized).isEqualTo("{\"items\":[]}");
    assertThat(deserialized).isEqualTo(tickets);
}
```
**해석**<br>
티켓 값이 비어있는 상황에서 직렬화가 되는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
then 부분에서 두 가지를 확인하는 군요? serialized, deserialized.<br>
티켓이 빈 상태에서 serialize 된 것만 확인하면 되니, 굳이 deserialize 된 부분을 확인할 필요는 없을 것 같네요.<br>
해당 부분만 확인할 수 있도록 수정합니다.<br>
```java
@Test
void 티켓이_없을때_Serialize() {
    Tickets tickets = Tickets.init();

    String serialized = serializer.serialize(tickets);

    assertThat(serialized).isEqualTo("{\"items\":[]}");
}
```

### **220322::trevari::wallet::api::DeleteWalletServiceTest**
`반영 완료`

```java
@BeforeEach
void setUp() {
    sut = new DeleteWalletService(walletRepository);
}

@Test
void wallet_삭제하면_isDeleted가_true() {
    sut.deleteWallet(wallet);

    assertThat(wallet.isDeleted()).isTrue();
}
```
**해석**<br>
지갑을 지우는 명령을 실행하면, 지갑은 지워진 상태가 된다는 것을 표현하는 테스트 코드입니다.<br>

**생각**<br>
해당 코드는 어플리케이션의 로직을 테스트 하는 코드입니다.<br>
저는 보통 어플리케이션 로직에선 white box 테스트를 진행합니다.<br>
<br>
- 화이트박스 테스트는 내부 동작을 확인하는 테스트입니다.<br>
<br>
이곳을 예시로, 지갑의 상태가 어떻게 되던 이 테스트 코드에선 신경쓸 것이 아니라고 생각하고,<br>
지갑에 대한 처리는 명령을 받은 지갑 도메인 로직에서 알아서 처리할 것이기 때문이죠.<br>
<br>
결론은 상태에 대한 테스트 보단, 어떤 메소드가 호출되었는지 테스트하는 것이 더 중요하다고 생각합니다.<br>
그래서, 저의 생각을 반영한 코드를 작성해 보았습니다.<br>

```java
@Mock
WalletRepository walletRepository;

@Mock
Wallet wallet;

@BeforeEach
void setUp() {
    sut = new DeleteWalletService(walletRepository);
}

@Test
void deleteWallet에서_호출하는_메소드_확인() {
    sut.deleteWallet(wallet);

    verify(wallet).delete();
    verify(walletRepository).save(wallet);
}
```

### **220323::trevari::wallet::api::DeleteWalletServiceTest**
`반영 완료`

```java
@BeforeEach
void setUp() {
    sut = new DeleteWalletService(walletRepository);
}

@Test
void userId의_지갑이_이미_삭제된_상태이면_WalletNotFoundException() {
    wallet.delete();

    assertThrows(WalletNotFoundException.class, () -> sut.deleteWallet(wallet));
}
```
**해석**<br>
지갑을 지우는 명령을 실행할 때, 지갑이 이미지 지워진 상태면 예외를 발생시킨다는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
두 가지의 문제가 보입니다.<br>
<br>
_제목에 userId 가 있지만, 테스트 코드 어느 곳에서도 userId 가 표현되지 않는 것_<br>
_직접 지갑 객체에서 삭제 명령을 실행하는 것_<br>
<br>
위 두 문제 덕분에 해당 테스트 코드에서는 확인하고자 하는 부분이 불분명해 보일 수 밖에 없습니다.<br>
제가 생각하는 이곳 테스트에서 보고자 하는 부분은 크게 두 가지라 생각합니다.<br>
<br>
_지갑이 삭제 상태인가?_<br>
_삭제 상태이면 예외를 던지는가?_<br>
<br>
위 두 부분이 결여된 상태의 현재 테스트 코드는 의미가 없기 때문이죠.<br>
제가 표현하고자 하는 부분을 반영한 코드는 다음과 같습니다.<br>

```java
@Test
void 이미_삭제된_지갑이면_예외가_발생한다() {
    given(wallet.isDeleted()).willReturn(true);

    assertThatThrownBy(() -> sut.deleteWallet(wallet))
            .isInstanceOf(WalletNotFoundException.class)
            .hasMessageContaining("is already deleted.");
}
```

given willReturn 메소드를 통해 지갑이 삭제되었다는 것을 알리는 것이 표현되었습니다.<br>
그리고, 어플리케이션에서 삭제 명령을 실행했을 때, 예외가 발생하는 것,<br>
어떤 예외가 발생하는지, 어떤 메시지가 담기는 지도 표현되었습니다.<br>

### **220324::trevari::wallet::api::WalletServiceTest**
`반영 완료`

```java
@Test
void findBy() {
    given(repository.findById(WalletId.of(ANY_WALLET_ID))).willReturn(wallet, (Wallet) null);

    assertThat(sut.findBy(ANY_WALLET_ID).get()).isEqualTo(wallet);
    assertThat(sut.findBy(ANY_WALLET_ID)).isEqualTo(Optional.empty());
}
```

**해석**<br>
WALLET ID 에 일치하는 지갑을 가져온다는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
_willReturn 내의 인자가 여러개인 것, 호출되는 횟수에 따라 해당 인덱스에 있는 값이 반환되는 것을 알았다.(여러 개를 쓸 수 있구나)_<br>
<br>
자, 코드를 보면 두 가지 테스트가 존재하네요.<br>
<br>
_ID 에 따라 지갑을 가져오는가_<br>
_ID 에 맞는 지갑이 없으면 빈 값인가_<br>
<br>
서로 다른 테스트 둘이 붙어있으니 테스트 명도 불명확하고 보는사람으로 하여금 헷갈릴 수 있기 때문이죠.<br>
해당 테스트 코드는 분리해 주고, 이름도 각 테스트 별로 명확하게 짓는 것이 좋을 것 같습니다.<br>
제 생각을 반영해 작성한 코드입니다.<br>
<br>
```java
@Test
void 지갑_조회_시_존재하면_지갑이_반환된다() {
    given(repository.findById(WalletId.of(ANY_WALLET_ID))).willReturn(wallet);

    assertThat(sut.findBy(ANY_WALLET_ID).get()).isEqualTo(wallet);
}

@Test
void 지갑_조회_시_존재하지_않을_때() {
    given(repository.findById(WalletId.of(ANY_WALLET_ID))).willReturn(null);

    assertThat(sut.findBy(ANY_WALLET_ID)).isEqualTo(Optional.empty());
}
```

### **220325::trevari::product::api::MappingFinderTest**
`반영 완료`

```java
@Test
void 삭제된_클럽을_find_할_때_null을_반환하는지_확인한다() {
    ProductMembershipMapping productMembershipMapping = new ProductMembershipMapping(null,null,clubId,null,null,null,null,null,null);
    productMembershipMapping.delete();
    given(repository.findByClubId(clubId)).willReturn(productMembershipMapping);

    ProductMembershipMapping productMembershipMapping1 = sut.find(clubId);

    assertThat(productMembershipMapping1).isNull();
}
```

**해석**<br>
clubId 를 통해 삭제된 매핑 데이터를 조회하면 null 이 반환되는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
해당 어플리케이션 테스트 코드는 도메인 로직에 의존하여 작성됩니다.<br>
이러면 도메인 객체 변화가 일어나면(생성자 access level 을 private 으로 바꾸는 등) 해당 테스트 코드는 깨지게 됩니다.<br>
저는 도메인 객체를 불러다 와 직접 삭제하는 방식은 사용하지 않아도 된다고 생각합니다.<br>
제 생각을 반영해 작성한 코드입니다.<br>

```java
@Mock
ProductMembershipMapping productMembershipMapping;

@Mock
ProductMembershipMappingRepository repository;

@Test
void 삭제된_클럽을_find_할_때_null을_반환하는지_확인한다() {
    given(repository.findByClubId(clubId)).willReturn(productMembershipMapping);
    given(productMembershipMapping.isDeleted()).willReturn(true);

    ProductMembershipMapping actual = sut.find(clubId);

    assertThat(actual).isNull();
}
```

### **220326::trevari::member::consumer::DefaultMemberJoinServiceTest**
`반영 완료`

```java
@Test
void 멤버가_없다면_생성한다() {
    UserId  userId = UserId.of("Tester");
    MembershipId membershipId = MembershipId.of(1L);
    command.setUserId(userId);
    command.setMembershipId(membershipId);

    when(longIdGenerator.gen(MemberId.class)).thenReturn(MemberId.of(1L));
    given(repository.existsByUserIdAndMembershipIdAndState(userId, membershipId, MemberState.JOINED)).willReturn(false);
    Meeting[] meetings = new Meeting[command.getMeetings().size()];
    meetings = command.getMeetings().stream().map(e -> Meeting.of(e.getId().getValue(), e.getStartedAt())).collect(Collectors.toList()).toArray(meetings);
    LocalDateTime purchasedAt = command.getEventedAt();


    Period periodOfMembership = new BookClubMembershipPeriodFactory(meetings).create();
    ServiceRunningPeriod communityServiceRunningPeriod = new GeneralServiceRunningContextPeriodFactory(purchasedAt, periodOfMembership).create();
    List<ServiceRunningContextFactory> list = Arrays.stream(SupportedService.values())
            .filter(v -> Badge.COMMUNITY_MEMBER.equals(v.getBadge()))
            .map(s -> new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), s, communityServiceRunningPeriod, ExtendedPropsFactory.DO_NOTING)).collect(Collectors.toList());
    list.addAll(Arrays.stream(meetings)
            .map(meeting -> new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), BOOK_CLUB_MEETING, new BookMeetingPeriodFactory(meeting).create(), MeetingExtendedPropsFactory.of(meeting))).collect(Collectors.toList()));
    ServiceRunningContextFactory[] factories = new ServiceRunningContextFactory[list.size()];
    factories = list.toArray(factories);

    given(membershipMemberFactoryFinder.findMembershipFactory(command)).willReturn(new GeneralMembershipMemberFactory(() -> longIdGenerator.gen(MemberId.class), periodOfMembership, factories));

    sut.join(command);

    verify(longIdGenerator).gen(MemberId.class);
    verify(repository).save(any(Member.class));
}
```

**해석**<br>
해당하는 멤버가 없을 때, 멤버를 생성하는 명령을 실행하는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
보자마자 숨이 턱 막혔습니다.<br>
해당 테스트를 알기 위해선 너무나도 많은 정보를 알아야 하고, 동시에 너무나도 많은 피로감이 쌓입니다.<br>
어플리케이션 로직에서 이렇게 다 만들면서 테스트를 진행하면 의미가 드러나지 않게 된다고 생각하거든요.<br>
어플리케이션은 다른 로직을 호출하기 위한 중간자라고 생각하기 때문입니다.<br>
테스트에서 표현하고자 하는 부분을 인식하고 빨리 갈아엎는 게 좋겠네요.<br>
<br>
표현하고자 하는 부분은 두 가지인 것 같습니다.<br>
<br>
_해당하는 멤버가 없는지_<br>
_없으면 멤버 생성 메소드를 호출하는지_<br>
<br>
복잡한 정보들을 다 빼고, 필요한 부분만 남긴 코드입니다.<br>

```java
@Mock
JoinCommand joinCommand;

@Mock
MembershipMemberFactory factory;

@Mock
Member member;

@Test
void 멤버가_없다면_생성을_시도한다() {
    given(repository.existsByUserIdAndMembershipIdAndState(joinCommand.getUserId(), joinCommand.getMembershipId(), MemberState.JOINED)).willReturn(false);
    given(membershipMemberFactoryFinder.findMembershipFactory(joinCommand)).willReturn(factory);
    given(factory.create(joinCommand.getUserId(), joinCommand.getMembershipId(), joinCommand.getEventedAt())).willReturn(member);

    sut.join(joinCommand);

    verify(repository).save(member);
}
```

### **220327::trevari::member::consumer::DefaultMemberJoinServiceTest**
```java
@Test
void 멤버의_상태가_joined인_멤버가_이미있다면_생성하지않는다() {

    given(repository.existsByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, MemberState.JOINED)).willReturn(true);

    assertThatThrownBy(() -> sut.join(command)).isInstanceOf(EntityAlreadyExistsException.class);

    verify(repository, never()).save(any(Member.class));
}
```

**해석**<br>
JOINED 인 멤버가 이미 존재한다면 멤버를 생성하지 않는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
저장하는 메소드를 따로 호출하지 않는 것을 확인하고, join 메소드를 호출했을 때 예외가 발생하네요.<br>
어떨 때 예외가 발생하는지 확인하고 싶어 시선을 위로 돌리면 이미 membershipId 에 일치하는 멤버가 존재한다는 것을 알 수 있습니다.<br>
전체적으로 표현하고자 하는 부분만 표현한 깔끔한 테스트라고 생각합니다.<br>
저는 딱히 고칠 부분이 없다고 생각합니다.<br>

### **220328::trevari::member::consumer::DefaultMemberJoinServiceTest**
`반영 완료`

```java
@Test
void 멤버가_동일한_멤버십을_구매했는데_멤버State가_TERMINATED이라면_기존데이터는_유지하고_새로운멤버로_JOIN시킨다() {
    given(repository.existsByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, MemberState.JOINED)).willReturn(false);
    when(longIdGenerator.gen(MemberId.class)).thenReturn(MemberId.of(1L));
    Meeting[] meetings = new Meeting[command.getMeetings().size()];
    meetings = command.getMeetings().stream().map(e -> Meeting.of(e.getId().getValue(), e.getStartedAt())).collect(Collectors.toList()).toArray(meetings);
    LocalDateTime purchasedAt = command.getEventedAt();


    Period periodOfMembership = new BookClubMembershipPeriodFactory(meetings).create();
    ServiceRunningPeriod communityServiceRunningPeriod = new GeneralServiceRunningContextPeriodFactory(purchasedAt, periodOfMembership).create();

    List<ServiceRunningContextFactory> list = Arrays.stream(SupportedService.values())
            .filter(v -> Badge.COMMUNITY_MEMBER.equals(v.getBadge()))
            .map(s -> new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), s, communityServiceRunningPeriod, ExtendedPropsFactory.DO_NOTING)).collect(Collectors.toList());
    list.addAll(Arrays.stream(meetings)
            .map(meeting ->
                    new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), BOOK_CLUB_MEETING, new BookMeetingPeriodFactory(meeting).create(), MeetingExtendedPropsFactory.of(meeting)))
            .collect(Collectors.toList()));
    ServiceRunningContextFactory[] factories = new ServiceRunningContextFactory[list.size()];
    factories = list.toArray(factories);
    given(membershipMemberFactoryFinder.findMembershipFactory(command)).willReturn(new GeneralMembershipMemberFactory(() -> longIdGenerator.gen(MemberId.class), periodOfMembership, factories));

    sut.join(command);

    verify(repository).save(any(Member.class));
}
```

**해석**<br>
같은 멤버십에서 JOINED 인 멤버가 존재하지 않으면 멤버를 생성한다는 것을 알려주는 테스트 코드입니다.<br>

**생각**<br>
테스트 제목에는 TERMINATED 상태인 멤버라면 데이터를 유지하고 새로 멤버를 만든다고 하지만,<br>
멤버가 TERMINATED 상태인 것은 그 어디에도 표현되지 않고 있습니다.<br>
또한, given/when/then 에서 given 부분이 너무 장황합니다. 알아야 하는 정보가 너무 많습니다.<br>
TERMINATED 부분을 어떻게 표현할 방법이 없어, 해당 테스트의 의미를 다시 정의해 보는게 좋을 것 같습니다.<br>
<br>
_JOINED 상태인 멤버가 없다면, 생성한다._<br>
<br>
위와 같이 정의해보니 테스트할 부분이 더 명확해 지는 것 같습니다.<br>
테스트에서 표현하고 싶은 부분을 정리해 보면,<br>
<br>
_JOINED 상태인 멤버가 없는가?_<br>
_멤버를 생성하는가?_<br>
<br>
두 가지가 나옵니다.<br>
즉시 반영해 보겠습니다.<br>

```java
@Test
void JOINED_상태인_멤버가_없다면_생성한다() {
    given(repository.existsByUserIdAndMembershipIdAndState(joinCommand.getUserId(), joinCommand.getMembershipId(), MemberState.JOINED)).willReturn(false);
    given(membershipMemberFactoryFinder.findMembershipFactory(joinCommand)).willReturn(factory);
    given(factory.create(joinCommand.getUserId(), joinCommand.getMembershipId(), joinCommand.getEventedAt())).willReturn(member);

    sut.join(joinCommand);

    verify(repository).save(member);
}
```

### **220329::trevari::member::consumer::TerminateServiceImplTest**
```java
@Test
void verify_method() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);

    sut.terminate(command);

    verify(repository).findById(ANY_MEMBER_ID);
    verify(member).terminate();
    verify(repository).save(member);
}
```

**해석**<br>
해지 명령을 실행하면, 호출해야하는 메소드를 호출하는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
Application 로직의 테스트에서는 화이트박스 테스트를 하는 것이 좋다고 생각합니다.<br>
화이트박스 테스트는 로직의 내부 동작을 검사하는 테스트로, 메소드의 호출 따위를 확인합니다.<br>
위 테스트 코드를 봤을 때, 해지 명령 시 어떤 것을 호출하는지 확인할 수 있습니다.<br>
저는 해당 테스트 코드에서 Application 로직이 어떤 동작을 수행하는지 알 수 있네요.<br>
수정할 필요는 없이 유지해도 좋은 테스트 코드인 것 같습니다.<br>

### **220330::trevari::member::consumer::TerminateServiceImplTest**
```java
@Test
void when_member_terminated_never_terminate_again() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);
    given(member.isTerminated()).willReturn(true);

    sut.terminate(command);

    verify(member, never()).terminate();
}
```

**해석**<br>
해지 명령을 실행하면, 이미 해지된 멤버라면 다시 해지하지 않는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
Application 로직의 테스트에서는 화이트박스 테스트를 하는 것이 좋다고 생각합니다.<br>
화이트박스 테스트는 로직의 내부 동작을 검사하는 테스트로, 메소드의 호출 따위를 확인합니다.<br>
<br>
_멤버가 해지되었는가?_<br>
_멤버 해지를 다시 시도하지 않는가?_<br>
<br>
테스트 코드를 봤을 때, 해지 명령 시 어떤 것을 호출하는지 확인할 수 있습니다. 위 두 가지 사항에 대해서도 알 수 있죠.<br>
수정할 필요는 없이 유지해도 좋은 테스트 코드인 것 같습니다.<br>

### **220331::trevari::member::consumer::TerminateServiceImplTest**
`반영 완료`

```java
@Test
private final TerminateCommand NULL_COMMAND = null;

void validate_command() {
    assertThatThrownBy(() -> sut.terminate(NULL_COMMAND));
}
```

**해석**<br>
유효하지 않은 커맨드로 명령을 실행하면 예외를 발생시킨다는 것을 알려주는 테스트 코드입니다.<br>

**생각**<br>
뭐 딱히.. 이견은 없는 코드이지만, 예외에 대해 디테일한 정보가 추가되었으면 좋겠군요.<br>
예외 타입이라던지, 메시지라던지.<br>
보는 사람으로 하여금 더 정확한 정보를 알 수 있게 될 것 같습니다.<br>
```java
@Test
void when_command_is_null() {
    assertThatThrownBy(() -> sut.terminate(NULL_COMMAND))
            .isInstanceOf(InvalidValueException.class)
            .hasMessageContaining("terminateCommand is null");
}
```
<br>

### **220401::trevari::member::domain::GeneralServiceUseSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceUseSpecification sut;

@Mock
ServiceRunningContext context;

@Mock
ServiceRunningPeriod periods;

@Test
void name() {
    given(periods.ofService())
            .willReturn(Period.of(localDate(_2021, _1, _3), localDate(_2021, _1, _4)));

    given(context.isNotTerminated()).willReturn(true);
    given(context.isRemained()).willReturn(true);

    assertThat(sut.isSatisfy(localDate(_2021, _1, _3))).isTrue();
}
```

**해석**<br>
기간 내에 있으며, 해지되지 않고, 아직 사용 횟수가 남아있다면 사용 가능하다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
아직 프로덕션에서 사용되지 않는 코드이지만, 해석하며 나중을 대비하는 것도 괜찮을 것 같아서 미루다 미루다 이제 봅니다.<br>
우선 테스트 코드를 해석하며 생각한 흐름을 써보겠습니다.<br>
<br>
일단 테스트 제목으론 알 수 없으니 맨 아래 결과를 확인하는 then 부분을 보겠습니다.<br>
어떤 결과에 대해 만족을 요구할 때, 날짜를 집어넣습니다. 뭔진 모르겠지만 상태에 대한 블랙박스 테스트인 것 같습니다. 내부 동작보단 상태가 더 중요한 테스트겠네요.<br>
이 날짜가 무엇을 의미하는지 생각해 볼 때, given 절을 보면 periods.ofService 라는 메소드가 있네요.<br>
여기서 어떤 기간을 반환합니다.(2021. 01. 03 ~ 2021. 01. 04)<br>
해당 기간 안에 속해있다면 만족하도록 하는 것 같네요.<br>
그리고 해지된 상태가 아닌가, 남아있는 상태인가에 대해서도 확인을 하는군요.<br>
<br>
일단, 사용 기간 내에 있는가에 대한 부분이 덜명시적이라고 생각합니다.<br>
어떤 메소드를 통해서 사용 기간 내에 있다는 걸 표시해 주면 좋을텐데, 이 부분은 아직 어떻게 해줘야 할 지 잘 떠오르지 않네요.<br>
추후 수정을 고려해봐야 겠어요.<br>
<br>
제목이 바뀌어야 겠네요. 어떤 테스트인지는 제목으로 알 수 없고, 해석하고 난 뒤에야 알 수 있기 때문이죠.<br>
아래 처럼 바꾸어주면 좋겠네요.<br>
<br>
_사용 기간 내에 있으며 해지되지 않고 남아있다면 만족한다_
<br>

### **220402::trevari::member::domain::GeneralServiceUseSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceUseSpecification sut;

@Mock
ServiceRunningContext context;

@Mock
ServiceRunningPeriod periods;

@Test
void name33() {
    given(periods.ofService())
            .willReturn(Period.of(localDate(_2021, _1, _3), localDate(_2021, _1, _4)));

    given(context.isNotTerminated()).willReturn(true);
    given(context.isRemained()).willReturn(true);

    assertThat(sut.isSatisfy(localDate(_2021, _1, _4))).isFalse();
}
```

**해석**<br>
해지되지 않고, 아직 사용 횟수가 남아있지만 기간 내에 있지 않으면 사용이 불가하다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
테스트 코드를 해석하며 생각한 흐름을 작성해 보겠습니다.<br>
<br>
결과를 보니 210104 라는 날짜가 만족하지 않는다고 나오는 군요?<br>
저는 이제 이전에 해석했던 경험이 있어 날짜가 무엇을 의미하는지 압니다.<br>
하지만, 처음 보는 분들이 있을 수 있겠죠?<br>
해당하는 날짜는 서비스의 기간 내에 속해있는지 판단하는 것입니다.<br>
서비스의 기간은 맨 위 given 에서 명시가 되어있습니다.(210103 ~ 210104)<br>
해당 기간의 경계값을 통해 만족 여부를 판단하는 것 같네요.<br>
<br>
_딱 떨어지는 날짜라면 만족하지 않도록 합니다._<br>
<br>
나머지 given 은 지금 테스트에서 굳이 알아야 할 정보인가? 싶긴 하지만 일단 냅둡니다.<br>
바꿀 건 그럼 제목밖에 없겠네요. 아래처럼 정의해 줄게요!<br>
<br>
_서비스 기간의 마지막이 도래하면 만족하지 않는다._<br>

### **220403::trevari::member::domain::GeneralServiceUseSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceUseSpecification sut;

@Mock
ServiceRunningContext context;

@Mock
ServiceRunningPeriod periods;

@Test
void name2() {
    given(periods.ofService())
            .willReturn(Period.of(localDate(_2021, _1, _3), localDate(_2021, _1, _4)));

    given(context.isNotTerminated()).willReturn(false); //Look!
    given(context.isRemained()).willReturn(true);

    assertThat(sut.isSatisfy(localDate(_2021, _1, _3))).isFalse();
}
```

**해석**<br>
기간 내에 있고, 남아있지만 해지되었다면 만족하지 않는다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
테스트 코드를 해석하며 생각한 흐름을 작성해 보겠습니다.<br>
<br>
저는 이전에 해석했던 경험을 통해서 이 테스트에서 보는 날짜가 기간 내(210103 ~ 210104)에 속해있는지 판단을 위해 존재하는 것을 압니다.<br>
하지만 기간 내에 속해있어도 만족하지 않는 군요.<br>
그래서 given 절을 살펴보니 Look 이라는 주석이 보입니다.<br>
해지가 되지 않았다라는 메시지에 false 가 있군요. 해지되었다는 것을 의미합니다.<br>
해지되었다면 만족하지 않는 로직에 대한 테스트인 것을 알 수 있습니다.<br>
<br>
한 번 해석하면 이해하기엔 쉬운 테스트지만 제목이 없어 더 노력을 들여야 합니다.<br>
누군가 테스트를 확인하면서 힘을 덜 들일 수 있도록 제목을 지어줍니다.<br>
<br>
_해지된 상태라면 만족하지 않는다_<br>
<br>

### **220404::trevari::member::domain::GeneralServiceUseSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceUseSpecification sut;

@Mock
ServiceRunningContext context;

@Mock
ServiceRunningPeriod periods;

@Test
void name3() {
    given(periods.ofService())
            .willReturn(Period.of(localDate(_2021, _1, _3), localDate(_2021, _1, _4)));

    given(context.isNotTerminated()).willReturn(true);
    given(context.isRemained()).willReturn(false); //Look!

    assertThat(sut.isSatisfy(localDate(_2021, _1, _3))).isFalse();
}
```

**해석**<br>
기간 내에 있고, 해지되지 않았지만 남아있지 않다면 만족하지 않는다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
테스트 코드를 해석하며 생각한 흐름을 작성해 보겠습니다.<br>
<br>
저는 이전에 해석했던 경험을 통해서 이 테스트에서 보는 날짜가 기간 내(210103 ~ 210104)에 속해있는지 판단을 위해 존재하는 것을 압니다.<br>
하지만 기간 내에 속해있어도 만족하지 않는 군요.<br>
그래서 given 절을 살펴보니 Look 이라는 주석이 보입니다.<br>
남아있는가에 대한 메시지에 false 가 있군요. 남아있지 않다는 것을 의미합니다.<br>
남아있지 않으면 만족하지 않는 로직에 대한 테스트인 것을 알 수 있습니다.<br>
<br>
한 번 해석하면 이해하기엔 쉬운 테스트지만 제목이 없어 더 노력을 들여야 합니다.<br>
누군가 테스트를 확인하면서 힘을 덜 들일 수 있도록 제목을 지어줍니다.<br>
<br>
_남아있지 않은 상태라면 만족하지 않는다_<br>
<br>

### **220405::trevari::member::domain::GeneralServiceUseSpecificationTest**
`반영 완료`

```java
@InjectMocks
GeneralServiceUseSpecification sut;

@Mock
ServiceRunningContext context;

@Mock
ServiceRunningPeriod periods;

@Test
void name4() {
    given(periods.ofService())
            .willReturn(Period.of(localDate(_2021, _1, _3), localDate(_2021, _1, _4)));
    given(periods.ofBonus())
            .willReturn(Period.of(localDate(_2021, _1, _2), localDate(_2021, _1, _3)));

    given(context.isNotTerminated()).willReturn(true);
    given(context.isRemained()).willReturn(true);

    assertThat(sut.isSatisfy(localDate(_2021, _1, _1))).isFalse();
    assertThat(sut.isSatisfy(localDate(_2021, _1, _2))).isTrue(); //Bonus !!
    assertThat(sut.isSatisfy(localDate(_2021, _1, _3))).isTrue(); //Service !!
    assertThat(sut.isSatisfy(localDate(_2021, _1, _4))).isFalse();
}
```

**해석**<br>
보너스 기간과 서비스 기간 내에 있다면 만족한다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
given 에선 보너스 기간에 대해서 명시가 되어있고, 서비스 기간에 대해 명시가 되어있습니다.<br>
then 에선 두 구간에 대해 만족하는지 테스트를 합니다.<br>
이 곳에선 테스트를 하고자 하는 게 두 가지가 있는 것 같네요.<br>
<br>
_서비스 기간에 만족하는가_<br>
_보너스 기간에 만족하는가_<br>
<br>
하지만 한 테스트 코드에 두 의미를 가진 테스트가 존재하는 건 좋지 않다고 생각합니다.<br>
한 테스트에는 한 의미를 가진 테스트가 있어야 한다고 생각합니다<br>
이전에 해석했던 코드를 생각했을 때, 서비스 기간에 대한 테스트는 이미 존재합니다<br>
<br>
하지만, given 부분에 서비스 기간을 빼면 에러가 발생하니 넣어주긴 해야되어 제거하기엔 난감하군요..<br>
고민이 되지만.. 일단 코드를 유지해 주겠습니다.<br>
추가로, 테스트 목적을 알 수 없는 제목을 변경하겠습니다.<br>
<br>
_보너스 기간과 서비스 기간 내에 있으면 만족한다_<br>
<br>

### **220406::trevari::member::domain::ServiceRunningContextUseTest**
```java
@Mock
ServiceRunningPeriod definition;

ServiceRunningContext sut;

@BeforeEach
void setUp() {
    sut = new ServiceRunningContext(ANY_SERVICE_ID, Times.of(1), Times.ZERO, AVAILABLE, definition, null, null);
}

@Test
void 해지가되면_사용할수없다() {
    //해지처리
    whenTerminated();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue())).hasMessageContaining("Service already Terminated when usedAt is");
}

private void whenTerminated() {
    sut.terminate(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.isTerminated()).isTrue();
}
```

**해석**<br>
해지가 되면 사용할 수 없는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
테스트 제목을 보았을 때, 블랙박스 테스트를 통해 확인할 건 두 가지라 생각했습니다.<br>
<br>
_해지가 되는지_<br>
_해지된 걸 사용할 수 없는지_<br>
<br>
위 두가지가 있고 해당 내용도 제목에 잘 표현되어서 변경할 부분은 없는 것 같습니다.<br>

### **220407::trevari::member::domain::ServiceRunningContextUseTest**
`반영 완료`

```java
@Test
void 사용스펙이_만족하지않으면_사용처리는_실패한다() {

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME, alwaysFalse())).hasMessageContaining("Unsatisfied UseSpecification and invalid periods is");
}
```

**해석**<br>
사용할 때, 조건이 맞지 않으면 사용할 수 없다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
표현하고자 하는 부분은 잘 표현이 되었다고 생각합니다.<br>
<br>
_사용하는 것_<br>
_만족하지 않는 것_<br>
_예외가 발생하는 것_<br>
<br>
다만, 예외 상황에 대해 더욱 명시적이었으면 좋겠습니다.<br>
대표적으로 예외에 담긴 메시지와 예외 클래스의 타입이 명시되면 갖고자 하는 정보를 더욱 많이 담은 테스트 코드가 되겠죠.<br>
(메시지는 담겨 있습니다. 타입만 명시해주면 될 것 같네요)<br>
<br>
```java
@Test
void 사용스펙이_만족하지않으면_사용처리는_실패한다() {
    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME, alwaysFalse()))
            .isInstanceOf(MemberException.class)
            .hasMessageContaining("Unsatisfied UseSpecification and invalid periods is");
}
```

### **220408::trevari::member::domain::ServiceRunningContextUseTest**
```java
@Test
void 사용스펙이_만족하면_사용처리한다() {
    sut = sut.withProvided(Times.of(1));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());

    assertThat(sut.getUsed()).isEqualTo(oneTime);
    assertThat(sut.isRemained()).isFalse();
    assertThat(sut.isUsedUp()).isTrue();
}
```

**해석**<br>
사용할 때, 조건이 맞으면 사용한다는 것을 확인시켜주는 테스트 코드입니다.<br>

**생각**<br>
이 테스트 코드에서 표현하고자 하는 부분을 보겠습니다.<br>
<br>
_사용한 횟수가 한 번 인가_<br>
_남지 않았는가_<br>
_모두 사용했는가_<br>
<br>
위 세 가지에 대해서 각각 살펴봅니다.<br>
<br>
**사용한 횟수가 한 번인가** 에 대해서는 then 구문인 use 를 한 번 호출했으니 당연한 것으로 보입니다.<br>
**남지 않았는가** 에 대해서는 given 구문에서 횟수 한 번을 정의한 다음, then 구문에서 사용을 한 번 했으니 만족합니다.<br>
마지막으로, **모두 사용했는가** 에 대해서 윗 줄과 같은 맥락으로 횟수 한 번을 정의하고 한 번을 사용했으니 모두 사용했다 표현되는군요.<br>
<br>
저는 표현하고자 하는 부분은 다 들어가 있다고 생각합니다.<br>
제목에서 말하는 사용 처리에 대해 이 모두가 사용 처리에 대한 상태인가? 를 생각해보면, 좀 애매하긴 하지만 딱히 이견은 없습니다.<br>

### **220409::trevari::member::domain::ServiceRunningContextUseTest**
`반영 완료`

```java
@Test
void 남은_회수() {
    sut = sut.withProvided(Times.of(2));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(ONE);
    assertThat(sut.isRemained()).isTrue();
    assertThat(sut.isUsedUp()).isFalse();

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(TWO);
    assertThat(sut.isRemained()).isFalse();
    assertThat(sut.isUsedUp()).isTrue();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME,  alwaysTrue())).hasMessage("Service already UsedUp when usedAt is " + ANY_LOCAL_DATE_TIME);
}
```

**해석**<br>
사용할 수 있는 횟수가 남지 않았다면, 사용할 수 없는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
제목을 확인했을 때, 딱 와닿지는 않습니다.<br>
일단 해석해 보면, 처음 사용할 수 있는 횟수를 두 번 지정한 뒤 두 번의 사용을 거칩니다.<br>
그 이후 남은 횟수가 없는 상태에서 사용을 시도하면 예외가 발생하는 군요.<br>
저는 이 테스트 코드에서 표현하고자 하는 부분이 두 가지인 것 같습니다.<br>
<br>
_남은 횟수가 없는가_<br>
_남은 횟수가 없는 상태에서 사용하면 예외가 발생하는가_<br>
<br>
일단 저는 해당 테스트 코드에서 남은 횟수가 없다는 부분이 더 잘 보였으면 좋겠네요.<br>
그리고 제목에 대한 수정도 필요해 보입니다.<br>
좀 더 표현하고자 하는 부분만 드러내 수정한 코드입니다.<br>
<br>
```java
@Test
void 남은_횟수가_없다면_사용할_수_없다() {
    sut = sut.withProvided(Times.of(1));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(ONE);
    assertThat(sut.isRemained()).isFalse();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME,  alwaysTrue()))
            .isInstanceOf(MemberException.class)
            .hasMessage("Service already UsedUp when usedAt is " + ANY_LOCAL_DATE_TIME);
}
```

### **220410::trevari::wallet::consumer::WalletFinderTest**
`반영 완료`

```java
@Test
void walletByUserId(@Mock Wallet wallet) {
    given(repository.findByUserId(USER_ID)).willReturn(wallet);
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);

    Wallet actual = sut.walletByUserId(USER_ID);

    assertThat(actual).isInstanceOf(Wallet.class);
}
```

**해석**<br>
지갑을 요청하면 지갑을 반환하는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
이번 테스트 케이스 같은 경우에, 어플리케이션 로직이지만 도메인 메소드를 호출해 가져오는 값을 확인하는 군요.<br>
심지어 given 에는 그 값이 반환되도록 미리 정의가 되어있습니다.<br>
의미가 없는 테스트라 생각합니다.<br>
<br>
이전 해석에서도 여러 번 언급을 했습니다만, 어플리케이션 로직에서는 화이트 박스 테스트를 추구합니다.<br>
화이트 박스 테스트는 특정 로직의 내부 동작을 확인하는 테스트 입니다.<br>
어플리케이션 로직은 다른 도메인 메소드를 가져다 쓰는 역할로 존재합니다.<br>
해당 테스트에선, 어떤 메소드를 호출하는지 테스트하면 되겠네요.<br>
그에 맞게 제목도 변경해 줍니다.<br>
아래는 제 의견을 반영한 테스트 코드입니다.<br>
<br>
```java
@Test
void walletByUserId_에서_메소드를_호출한다() {
    sut.walletByUserId(USER_ID);

    verify(repository.findByUserId(USER_ID));
}
```

### **220411::trevari::wallet::api::DeleteWalletServiceTest**
`반영 완료`

```java
@Test
void wallet_삭제하면_isDeleted가_true() {
    sut.deleteWallet(wallet);

    assertThat(wallet.isDeleted()).isTrue();
}
```

**해석**<br>
지갑을 제거하면 제거 상태가 된다는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
지갑을 제거하는 명령을 수행하지만, 이 곳은 어플리케이션 로직입니다.<br>
어플리케이션 테스트에서 도메인 로직을 호출하여 도메인의 상태를 확인하는 것이 옳지 않다고 생각합니다.<br>
어플리케이션 테스트는 어플리케이션 로직만을 확인할 수 있어야 합니다.<br>
<br>
_지갑을 제거하는 도메인 명령을 호출하는가_<br>
_제거한 지갑을 저장하는가_<br>
<br>
내부 동작을 확인하는 화이트 박스 테스트를 적용하여, 위 사항에 대해 테스트하는 것이 좋겠습니다.<br>
의견을 반영해 적용한 코드입니다.<br>
<br>
```java
@Test
void 제거_명령을_실행하면_호출한다() {
    sut.deleteWallet(wallet);

    verify(wallet).delete();
    verify(walletRepository).save(wallet);
}
```

### **220412::trevari::wallet::api::DeleteWalletServiceTest**
`반영 완료`

```java
@Test
void userId의_지갑이_이미_삭제된_상태이면_WalletNotFoundException() {
    wallet.delete();

    assertThrows(WalletNotFoundException.class, () -> sut.deleteWallet(wallet));
}
```

**해석**<br>
지갑이 이미 삭제된 상태라면 예외가 발생한다는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
어플리케이션 로직에서 위 테스트 코드처럼 도메인의 상태를 직접 변경하는 것은 좋지 않은 방법이라고 생각합니다.<br>
어플리케이션 로직에서는 타 메소드를 호출할 뿐이고, 그의 테스트 코드는 그 호출에 대한 확인만 이루어 졌으면 좋겠습니다.<br>
굳이 필요한 상황이라면, given 을 통해 정의해 주는 방법도 있습니다.<br>
제 생각을 반영한 코드입니다.<br>
<br>
```java
@Test
void 이미_삭제된_지갑이면_예외가_발생한다() {
    given(wallet.isDeleted()).willReturn(true);

    assertThatThrownBy(() -> sut.deleteWallet(wallet))
            .isInstanceOf(WalletNotFoundException.class)
            .hasMessageContaining("is already deleted.");
}
```

### **220413::trevari::wallet::api::WalletServiceTest**
`반영 완료`

```java
@Test
void findBy() {
    given(repository.findById(WalletId.of(ANY_WALLET_ID))).willReturn(wallet, (Wallet) null);

    assertThat(sut.findBy(ANY_WALLET_ID).get()).isEqualTo(wallet);
    assertThat(sut.findBy(ANY_WALLET_ID)).isEqualTo(Optional.empty());
}
```

**해석**<br>
지갑을 찾을 때, 지갑을 가져오는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
해당 로직은 어플리케이션 로직입니다. 도메인 객체의 결과를 테스트하는 방법은 지양합니다.<br>
어플리케이션 로직에서는 화이트박스 테스트를 지향합니다.<br>
제 생각을 반영한 테스트는 아래와 같습니다.<br>
<br>
_지갑을 찾을 때, 지갑을 찾는 레포지토리 메소드를 호출한다._<br>
<br>
```java
@Test
void 지갑을_찾을_때_호출한다() {
    sut.findBy(ANY_WALLET_ID);

    verify(repository).findById(WalletId.of(ANY_WALLET_ID));
}
```

### **220414::trevari::wallet::batch::BatchConfigurationTest**
```java
@Test
void JobExecution_상태가_COMPLETED_이다() throws Exception {
    JobExecution jobExecution = jobLauncherTestUtils.launchJob(jobParameters);

    assertThat(jobExecution.getStatus()).isEqualTo(BatchStatus.COMPLETED);
}
```

**해석**<br>
Job 실행 시, Job Execution 상태가 Completed 인 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
batch configuration 에 푹 빠져버린 찰나 배치 테스트를 해석하게 되었습니다. 흥미롭네요. (제가 짠 테스트지만..)<br>
<br>
Spring batch Process 의 작업을 나타내는 단위인 Job 을 실행했을 때, 상태가 정상적인 경우를 테스트합니다.<br>
Spring batch 의 테스트는 좀 생소하지만 Job launch 를 하면 execution 상태가 변경되는 것을 알 수 있네요.<br>
충분히 처음 보는 사람도 이해할 수 있을 정도의 테스트라고 생각합니다.<br>
딱히 변경의 필요성은 보이지 않습니다.<br>

### **220415::trevari::wallet::batch::BatchConfigurationTest**
```java
@Test
void StepExecution_상태가_COMPLETED_이다() throws Exception {
    JobExecution jobExecution = jobLauncherTestUtils.launchJob(jobParameters);
    Collection<StepExecution> stepExecutions = jobExecution.getStepExecutions();

    stepExecutions.forEach(stepExecution -> assertThat(stepExecution.getStatus()).isEqualTo(BatchStatus.COMPLETED));
}
```

**해석**<br>
Step 실행 시, Step Execution 상태가 Completed 인 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
스프링 배치에 고통을 받고 있는 요즘입니다.<br>
현재 작성하는 배치 코드에서 테스트 코드를 짤 수 없는 상황이라 고통을 받고 있으나, 곧 추가를 하려합니다.<br>
이 불편한 마음을 위안으로 삼아 해당 테스트 코드를 해석해 볼게요.(물론 제가 짠 테스트 코드입니다)<br>
<br>
Spring batch Process 에서 Job 을 실행했을 때, 각 단계의 상태가 COMPLETED 인 경우를 테스트합니다.<br>
Job launch 를 하면 Step 의 Execution 상태가 변경되는 것을 알 수 있네요.<br>
스프링의 동작 방식을 표현한 테스트입니다. 변경은 필요해 보이지 않네요.<br>
스프링 배치에서 제공하는 기능을 테스트하는 것이 필요한가에 대해서는 의문이긴 합니다.. 학습 테스트에 가까운 것 같아요.<br>

### **220416::trevari::wallet::batch::BatchConfigurationTest**
```java
@Test
@Rollback
@SqlMergeMode(MERGE)
@Sql(statements = {"INSERT INTO \"wallet\" VALUES (1, null, '{\"items\":[{\"key\":\"KEY1\",\"properties\":{},\"expiryDate\":\"2021-12-11T23:59:59\"}]}', null, null, 1, null);"})
void Reader_Writer_호출을_확인한다() throws Exception {
    // |----검색 데이터---------대상 데이터--------Reader 호출--------Writer 호출-----|
    // |------1개--------------1개---------------1번----------------1번---------|
    JobExecution jobExecution = jobLauncherTestUtils.launchJob(jobParameters);
    Collection<StepExecution> stepExecutions = jobExecution.getStepExecutions();

    stepExecutions.forEach(stepExecution -> {
        assertThat(stepExecution.getReadCount()).isEqualTo(1);
        assertThat(stepExecution.getWriteCount()).isEqualTo(1);
    });
}
```

**해석**<br>
데이터가 한 개 있을 때, Reader 와 Writer 를 한 번씩 호출하는 것을 확인하는 테스트입니다.<br>

**생각**<br>
마찬가지로 스프링 배치에 대한 기능을 확인하는 테스트네요.<br>
있으면 확실히 어떻게 동작하는지는 알 수 있어 도움은 되겠네요.<br>
수정할 필요는 없다고 생각이 들지만, 해당 테스트는 스프링 배치의 기능에 대한 테스트이므로 딱히 구성할 필요는 없다 생각이 듭니다.<br>
학습 테스트에 가깝네요.<br>

### **220417::trevari::wallet::batch::ItemReaderTest**
`반영 완료`

```java
@Test
@Rollback
@SqlMergeMode(MERGE)
@Sql(statements = {"INSERT INTO \"wallet\" VALUES (1, null, '{\"items\":[{\"key\":\"KEY1\",\"properties\":{},\"expiryDate\":\"2021-12-11T23:59:59\"}]}', null, null, 1, null);"})
void 티켓이_있으면_가져온다() throws Exception {
    JdbcPagingItemReader<Wallet> reader = job.reader();

    reader.afterPropertiesSet();
    Wallet result = reader.read();

    assertThat(result.getId().getId()).isEqualTo(1);
    assertThat(result.getTickets()).isNotNull();
}
```

**해석**<br>
티켓을 가진 데이터가 존재하면 읽어오는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
ItemReader 를 통해 티켓이 있는 데이터만 읽어오는 테스트네요.<br>
<br>
_티켓을 가진 데이터_<br>
_데이터를 읽어오는 것_<br>
_읽어온 데이터가 티켓을 가진 데이터인 것_<br>
<br>
위 세 가지에 대해 확인하면 되네요.<br>
하지만 이미 확인하고자 하는 내용은 존재합니다. 눈에 잘 안 들어올 뿐이죠.<br>
이 부분을 위해서 필요한 부분만 남기는 작업이 필요해 보이네요.<br>
아래는 좀 더 보고자 하는 부분만 남긴 코드입니다.<br>
<br>
```java
@Test
@Rollback
@SqlMergeMode(MERGE)
@Sql(statements = HAS_TICKETS)
void 티켓이_있으면_가져온다() throws Exception {
    Wallet result = read();

    assertThat(result.getId().getId()).isEqualTo(1);
    assertThat(result.getTickets()).isNotNull();
}
```

### **220418::trevari::wallet::batch::ItemReaderTest**
`반영 완료`

```java
@Test
@Rollback
@SqlMergeMode(MERGE)
@Sql(statements = {"INSERT INTO \"wallet\" VALUES (1, null, '{\"items\":[]}', null, null, 1, null);"})
void 티켓이_없으면_가져오지_않는다() throws Exception {
    JdbcPagingItemReader<Wallet> reader = job.reader();

    reader.afterPropertiesSet();
    Wallet result = reader.read();

    assertThat(result).isNull();
}
```

**해석**<br>
티켓이 존재하지 않으면 읽어오지 않는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
ItemReader 를 통해 데이터를 가져올 때, 티켓이 없으면 가져오지 않는 코드네요.<br>
하지만, 테스트 코드를 딱 봤을 때 의도가 명확하지 않아 보입니다.<br>
해당 테스트 코드에서 표현하고자 하는 의도는 무엇일까요?<br>
<br>
_티켓이 존재하지 않는 데이터_<br>
_데이터를 읽어오는 것_<br>
_읽어온 데이터가 없는 것_<br>
<br>
해당 세 가지에 대해서 테스트 코드에 의미를 부여하면 될 것 같다고 생각이 듭니다.<br>
이런 의도를 좀 더 드러내고자 하는 코드는 다음과 같습니다.<br>
<br>
```java
private static final String HAS_NOT_TICKETS_DATA = "INSERT INTO \"wallet\" VALUES (1, null, '{\"items\":[]}', null, null, 1, null);";

@Test
@Rollback
@SqlMergeMode(MERGE)
@Sql(statements = HAS_NOT_TICKETS_DATA)
void 티켓이_없으면_가져오지_않는다() throws Exception {
    Wallet result = readData();

    assertThat(result).isNull();
}

private Wallet readData() throws Exception {
    JdbcPagingItemReader<Wallet> reader = job.reader();

    reader.afterPropertiesSet();
    return reader.read();
}
```

### **220419::trevari::wallet::batch::ItemReaderTest**
`반영 완료`

```java
@Test
void 데이터가_없으면_가져오지_못한다() throws Exception {
    JdbcPagingItemReader<Wallet> reader = job.reader();

    reader.afterPropertiesSet();
    Wallet result = reader.read();

    assertThat(result).isNull();
}
```

**해석**<br>
데이터가 존재하지 않으면 어떠한 것도 읽어오지 않는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
ItemReader 를 통해 데이터를 가져올 때, 데이터가 없으면 가져오지 않는 코드네요.<br>
하지만, 테스트 코드를 딱 봤을 때 데이터가 없다는 부분은 어떻게 알 수 있을까요?<br>
해당 테스트 코드에서 표현하고자 하는 의도는 무엇일까요?<br>
<br>
_데이터가 존재하지 않음_<br>
_데이터를 읽어오는 것_<br>
_읽어온 데이터가 없는 것_<br>
<br>
위 세 가지에 대해서 생각을 해봤습니다. 하지만, 첫 번째 '데이터가 존재하지 않음' 부분은 도저히 떠오르지가 않네요.<br>
없는 걸 어떻게 표현할 지에 대한 문제는 가장 어려운 부분인 것 같습니다.<br>
그 외 나머지 부분에 대해 명시적으로 표현한 코드입니다.<br>
<br>
```java
@Test
void 데이터가_없으면_가져오지_못한다() throws Exception {
    Wallet result = readData();

    assertThat(result).isNull();
}

private Wallet readData() throws Exception {
    JdbcPagingItemReader<Wallet> reader = job.reader();

    reader.afterPropertiesSet();
    return reader.read();
}
```

### **220420::trevari::wallet::batch::BatchConfigurationTest**
```java
@Test
@Rollback
@SqlMergeMode(MERGE)
@Sql(statements = {
        "INSERT INTO \"wallet\" VALUES (1, null, '{\"items\":[{\"key\":\"KEY1\",\"properties\":{},\"expiryDate\":\"2021-12-11T23:59:59\"}]}', null, null, 1, null);",
        "INSERT INTO \"wallet\" VALUES (2, null, '{\"items\":[{\"key\":\"KEY2\",\"properties\":{},\"expiryDate\":\"2021-12-11T23:59:59\"}]}', null, null, 1, null);",
        "INSERT INTO \"wallet\" VALUES (3, null, '{\"items\":[{\"key\":\"KEY3\",\"properties\":{},\"expiryDate\":\"2021-12-13T23:59:59\"}]}', null, null, 1, null);"})
void 대상_데이터_만큼_writer_가_호출된다() throws Exception {
    // |----검색 데이터---------대상 데이터--------Writer 호출-----|
    // |------3개--------------2개-----------------2번--------|
    JobExecution jobExecution = jobLauncherTestUtils.launchJob(jobParameters);
    Collection<StepExecution> stepExecutions = jobExecution.getStepExecutions();

    stepExecutions.forEach(stepExecution -> assertThat(stepExecution.getWriteCount()).isEqualTo(2));
}
```

**해석**<br>
특정 대상 데이터 개수만큼 write 를 진행하는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
이 또한 Writer 에 몇 개의 값이 들어왔는 가에 따라 Write count 가 증가하는 Batch 의 특성을 그대로 반영한 테스트 코드라고 생각합니다.<br>
_다만 알 수 없는 것은 어떻게 대상 데이터가 추출되는가?_ 입니다.<br>
이 부분은 Processor 에서 추출이 진행되지만 해당 테스트 코드만을 확인해서 알 수가 없군요.<br>
이를 어떻게 드러내야 할 지는 떠오르지 않습니다.<br>
해당 테스트 코드를 현재는 유지하지만, 떠오르는 것이 있으시면 말씀 부탁드립니다. 적극 반영하겠습니다.<br>

### **220421::trevari::wallet::batch::WalletDtoTest**
`반영 완료`

```java
@Test
void validate_id() {
    assertThatThrownBy(() -> WalletDto.of(null, TICKETS));
    assertThatThrownBy(() -> WalletDto.of(-1L, TICKETS));
    assertThatThrownBy(() -> WalletDto.of(0L, TICKETS));
}
```

**해석**<br>
객체 생성 시, 유효한 값이 아니면 예외가 발생하는 것을 알 수 있는 테스트 코드입니다.<br>

**생각**<br>
저는 객체 따위를 생성할 때, 생성 그 자체에 대한 테스트도 하지만<br>
객체를 생성할 때 넘기는 인자의 유효성 검증도 진행합니다.<br>
넘기는 인자의 타입이 Long 일 때, 그 값이 음수인지, 0인지, null 인지.<br>
또는 타입이 String 이라면 그 값이 빈 문자열인지, null 인지. 등에 대해 값의 유효성을 따집니다.<br>
이런 처리가 되어있지 않으면 해당 객체는 null 과 0 등의 값을 허용하는 것으로 생각하고, 누구나 넣을 수 있겠다 생각합니다.<br>
그래서 이를 사전에 방지하고자 객체 생성 시 바로 검증하는 것이죠.<br>
테스트 코드 자체는 변경할 필요가 없어 보입니다.<br>
하지만 제목이 좀 더 명시적으로 바뀌었으면 좋겠네요.<br>
<br>
_ID 가 유효하지 않으면 안 된다._<br>
<br>

### **220422::trevari::member::consumer:MemberFinderImplTest**

```java
@Test
void find_member() {
    given(memberRepository.findByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED)).willReturn(member);

    sut.findBy(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED);

    verify(memberRepository).findByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED);
}
```

**해석**<br>
멤버를 찾을 때, 찾는 메소드를 사용하는지 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
어플리케이션 로직은 다른 도메인 메소드를 호출하는 것이 특징입니다.<br>
해당 테스트는 그 특성을 잘 반영한 것 같네요.<br>
verify 를 통해서 다른 로직의 호출 여부를 테스트하고 있습니다.<br>
다만, given 부분은 있어도 의미가 없다고 생각되네요. 빼줍시다.<br>
<br>
```java
@Test
void find_member() {
    sut.findBy(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED);

    verify(memberRepository).findByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED);
}
```

### **220423::trevari::member::consumer:MemberFinderImplTest**
`반영 완료`

```java
@Test
void does_not_exist() {
    given(memberRepository.findByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED)).willReturn(null);
    assertThatThrownBy(() -> sut.findBy(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED)).isInstanceOf(IllegalArgumentException.class);
}
```

**해석**<br>
조건에 맞는 멤버 데이터가 존재하지 않으면 예외를 발생시키는 것을 알 수 있는 테스트 코드입니다.<br>

**생각**<br>
이 테스트를 통해서 우리가 알 수 있는 건 두 가지인 것 같습니다.<br>
<br>
_조건에 맞는 멤버가 없으면 null 을 반환한다._<br>
_null 이 반환되면 예외를 발생시킨다._<br>
<br>
표현하고자 하는 부분에선 부족함이 없다 생각합니다.<br>
하나의 변화를 주자면, 메시지라도 추가하는게 좋겠네요.<br>
<br>
```java
@Test
void does_not_exist() {
    given(memberRepository.findByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED)).willReturn(null);
    
    assertThatThrownBy(() -> sut.findBy(ANY_USER_ID, ANY_MEMBERSHIP_ID, JOINED))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Member is does not exist.");
}
```

### **220424::trevari::wallet::domain::WalletTest**
`반영 완료`

```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void addTicketAndFind() {
    AddTicketCommand command = AddTicketCommandFactory.create("KEY", TicketProps.empty(), ANY_EXPIRY_DATE);//.create(TicketProps.empty(), (p)->"KEY");

    sut.execute(command);

    assertThat(sut.has(command.newTicket())).isTrue();
}
```

**해석**<br>
티켓을 추가하고 해당 티켓이 존재하는지 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
알고자 하는 부분은 딱 두 가지라고 생각합니다.<br>
<br>
_티켓을 추가한다._<br>
_티켓이 있는지 확인한다._<br>
<br>
먼저 티켓을 추가하는 행위를 진행하기 위해서는 두 가지가 필요하네요.<br>
**티켓 추가를 위한 정보를 담는 커맨드** 와 그 **커맨드를 실행하는 지갑** 입니다.<br>
커맨드에는 Key, TicketProps, ExpiryDate 가 들어가는 것을 확인할 수 있네요.<br>
<br>
추가 명령을 실행한 뒤에는 **같은 티켓을 또 생성해, 지갑 내 티켓 존재 여부를 확인** 합니다.<br>
이 테스트로 유추할 수 있는 건, 커맨드를 실행하면 내부에선 newTicket 이 호출된다는 것입니다.<br>
<br>
저는 로직에선 필요한 부분은 다 존재한다고 생각합니다.<br>
이해하기 어려운 테스트 이름과 왜 있는지 모르는 주석이 조금 신경쓰일 뿐이네요.<br>
변경하고, 지워줍니다.<br>
<br>
```java
@Test
void 티켓을_추가하고_확인합니다() {
    AddTicketCommand command = AddTicketCommandFactory.create("KEY", TicketProps.empty(), ANY_EXPIRY_DATE);
    
    sut.execute(command);

    assertThat(sut.has(command.newTicket())).isTrue();
}
```

### **220425::trevari::wallet::api::DeleteWalletServiceTest**
`반영 완료`

```java
@BeforeEach
void setUp() {
    sut = new DeleteWalletService(walletRepository);
}

@Test
void userId의_지갑이_이미_삭제된_상태이면_WalletNotFoundException() {
    wallet.delete();

    assertThrows(WalletNotFoundException.class, () -> sut.deleteWallet(wallet));
}
```

**해석**<br>
지갑을 지우는 명령을 실행할 때, 지갑이 이미지 지워진 상태면 예외를 발생시킨다는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
두 가지의 문제가 보입니다.<br>
<br>
_제목에 userId 가 있지만, 테스트 코드 어느 곳에서도 userId 가 표현되지 않는 것_<br>
_직접 지갑 객체에서 삭제 명령을 실행하는 것_<br>
<br>
위 두 문제 덕분에 해당 테스트 코드에서는 확인하고자 하는 부분이 불분명해 보일 수 밖에 없습니다.<br>
제가 생각하는 이곳 테스트에서 보고자 하는 부분은 크게 두 가지라 생각합니다.<br>
<br>
_지갑이 삭제 상태인가?_<br>
_삭제 상태이면 예외를 던지는가?_<br>
<br>
위 두 부분이 결여된 상태의 현재 테스트 코드는 의미가 없기 때문이죠.<br>
제가 표현하고자 하는 부분을 반영한 코드는 다음과 같습니다.<br>
<br>
```java
@Test
void 이미_삭제된_지갑이면_예외가_발생한다() {
    given(wallet.isDeleted()).willReturn(true);

    assertThatThrownBy(() -> sut.deleteWallet(wallet))
            .isInstanceOf(WalletNotFoundException.class)
            .hasMessageContaining("is already deleted.");
}
```

given willReturn 메소드를 통해 지갑이 삭제되었다는 것을 알리는 것이 표현되었습니다.<br>
그리고, 어플리케이션에서 삭제 명령을 실행했을 때, 예외가 발생하는 것,<br>
어떤 예외가 발생하는지, 어떤 메시지가 담기는 지도 표현되었습니다.<br>

### **220426::trevari::product::api::MappingFinderTest**
`반영 완료`

```java
@Test
void 삭제된_클럽을_find_할_때_null을_반환하는지_확인한다() {
    ProductMembershipMapping productMembershipMapping = new ProductMembershipMapping(null,null,clubId,null,null,null,null,null,null);
    productMembershipMapping.delete();
    given(repository.findByClubId(clubId)).willReturn(productMembershipMapping);

    ProductMembershipMapping productMembershipMapping1 = sut.find(clubId);

    assertThat(productMembershipMapping1).isNull();
}
```

**해석**<br>
clubId 를 통해 삭제된 매핑 데이터를 조회하면 null 이 반환되는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
해당 어플리케이션 테스트 코드는 도메인 로직에 의존하여 작성됩니다.<br>
이러면 도메인 객체 변화가 일어나면(생성자 access level 을 private 으로 바꾸는 등) 해당 테스트 코드는 깨지게 됩니다.<br>
저는 도메인 객체를 불러다 와 직접 삭제하는 방식은 사용하지 않아도 된다고 생각합니다.<br>
제 생각을 반영해 작성한 코드입니다.<br>

```java
@Mock
ProductMembershipMapping productMembershipMapping;

@Mock
ProductMembershipMappingRepository repository;

@Test
void 삭제된_클럽을_find_할_때_null을_반환하는지_확인한다() {
    given(repository.findByClubId(clubId)).willReturn(productMembershipMapping);
    given(productMembershipMapping.isDeleted()).willReturn(true);

    ProductMembershipMapping actual = sut.find(clubId);

    assertThat(actual).isNull();
}
```

### **220427::trevari::member::consumer::DefaultMemberJoinServiceTest**
`반영 완료`

```java
@Test
void 멤버가_동일한_멤버십을_구매했는데_멤버State가_TERMINATED이라면_기존데이터는_유지하고_새로운멤버로_JOIN시킨다() {
    given(repository.existsByUserIdAndMembershipIdAndState(ANY_USER_ID, ANY_MEMBERSHIP_ID, MemberState.JOINED)).willReturn(false);
    when(longIdGenerator.gen(MemberId.class)).thenReturn(MemberId.of(1L));
    Meeting[] meetings = new Meeting[command.getMeetings().size()];
    meetings = command.getMeetings().stream().map(e -> Meeting.of(e.getId().getValue(), e.getStartedAt())).collect(Collectors.toList()).toArray(meetings);
    LocalDateTime purchasedAt = command.getEventedAt();


    Period periodOfMembership = new BookClubMembershipPeriodFactory(meetings).create();
    ServiceRunningPeriod communityServiceRunningPeriod = new GeneralServiceRunningContextPeriodFactory(purchasedAt, periodOfMembership).create();

    List<ServiceRunningContextFactory> list = Arrays.stream(SupportedService.values())
            .filter(v -> Badge.COMMUNITY_MEMBER.equals(v.getBadge()))
            .map(s -> new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), s, communityServiceRunningPeriod, ExtendedPropsFactory.DO_NOTING)).collect(Collectors.toList());
    list.addAll(Arrays.stream(meetings)
            .map(meeting ->
                    new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), BOOK_CLUB_MEETING, new BookMeetingPeriodFactory(meeting).create(), MeetingExtendedPropsFactory.of(meeting)))
            .collect(Collectors.toList()));
    ServiceRunningContextFactory[] factories = new ServiceRunningContextFactory[list.size()];
    factories = list.toArray(factories);
    given(membershipMemberFactoryFinder.findMembershipFactory(command)).willReturn(new GeneralMembershipMemberFactory(() -> longIdGenerator.gen(MemberId.class), periodOfMembership, factories));

    sut.join(command);

    verify(repository).save(any(Member.class));
}
```

**해석**<br>
같은 멤버십에서 JOINED 인 멤버가 존재하지 않으면 멤버를 생성한다는 것을 알려주는 테스트 코드입니다.<br>

**생각**<br>
테스트 제목에는 TERMINATED 상태인 멤버라면 데이터를 유지하고 새로 멤버를 만든다고 하지만,<br>
멤버가 TERMINATED 상태인 것은 그 어디에도 표현되지 않고 있습니다.<br>
또한, given/when/then 에서 given 부분이 너무 장황합니다. 알아야 하는 정보가 너무 많습니다.<br>
TERMINATED 부분을 어떻게 표현할 방법이 없어, 해당 테스트의 의미를 다시 정의해 보는게 좋을 것 같습니다.<br>
<br>
_JOINED 상태인 멤버가 없다면, 생성한다._<br>
<br>
위와 같이 정의해보니 테스트할 부분이 더 명확해 지는 것 같습니다.<br>
테스트에서 표현하고 싶은 부분을 정리해 보면,<br>
<br>
_JOINED 상태인 멤버가 없는가?_<br>
_멤버를 생성하는가?_<br>
<br>
두 가지가 나옵니다.<br>
즉시 반영해 보겠습니다.<br>

```java
@Test
void JOINED_상태인_멤버가_없다면_생성한다() {
    given(repository.existsByUserIdAndMembershipIdAndState(joinCommand.getUserId(), joinCommand.getMembershipId(), MemberState.JOINED)).willReturn(false);
    given(membershipMemberFactoryFinder.findMembershipFactory(joinCommand)).willReturn(factory);
    given(factory.create(joinCommand.getUserId(), joinCommand.getMembershipId(), joinCommand.getEventedAt())).willReturn(member);

    sut.join(joinCommand);

    verify(repository).save(member);
}
```

### **220428::trevari::wallet::api::DeleteWalletServiceTest**
`반영 완료`

```java
@BeforeEach
void setUp() {
    sut = new DeleteWalletService(walletRepository);
}

@Test
void wallet_삭제하면_isDeleted가_true() {
    sut.deleteWallet(wallet);

    assertThat(wallet.isDeleted()).isTrue();
}
```
**해석**<br>
지갑을 지우는 명령을 실행하면, 지갑은 지워진 상태가 된다는 것을 표현하는 테스트 코드입니다.<br>

**생각**<br>
해당 코드는 어플리케이션의 로직을 테스트 하는 코드입니다.<br>
저는 보통 어플리케이션 로직에선 white box 테스트를 진행합니다.<br>
<br>
- 화이트박스 테스트는 내부 동작을 확인하는 테스트입니다.<br>
<br>
이곳을 예시로, 지갑의 상태가 어떻게 되던 이 테스트 코드에선 신경쓸 것이 아니라고 생각하고,<br>
지갑에 대한 처리는 명령을 받은 지갑 도메인 로직에서 알아서 처리할 것이기 때문이죠.<br>
<br>
결론은 상태에 대한 테스트 보단, 어떤 메소드가 호출되었는지 테스트하는 것이 더 중요하다고 생각합니다.<br>
그래서, 저의 생각을 반영한 코드를 작성해 보았습니다.<br>

```java
@Mock
WalletRepository walletRepository;

@Mock
Wallet wallet;

@BeforeEach
void setUp() {
    sut = new DeleteWalletService(walletRepository);
}

@Test
void deleteWallet에서_호출하는_메소드_확인() {
    sut.deleteWallet(wallet);

    verify(wallet).delete();
    verify(walletRepository).save(wallet);
}
```

### **220429::trevari::member::consumer::DefaultMemberJoinServiceTest**
`반영 완료`

```java
@Test
void 멤버가_없다면_생성한다() {
    UserId  userId = UserId.of("Tester");
    MembershipId membershipId = MembershipId.of(1L);
    command.setUserId(userId);
    command.setMembershipId(membershipId);

    when(longIdGenerator.gen(MemberId.class)).thenReturn(MemberId.of(1L));
    given(repository.existsByUserIdAndMembershipIdAndState(userId, membershipId, MemberState.JOINED)).willReturn(false);
    Meeting[] meetings = new Meeting[command.getMeetings().size()];
    meetings = command.getMeetings().stream().map(e -> Meeting.of(e.getId().getValue(), e.getStartedAt())).collect(Collectors.toList()).toArray(meetings);
    LocalDateTime purchasedAt = command.getEventedAt();


    Period periodOfMembership = new BookClubMembershipPeriodFactory(meetings).create();
    ServiceRunningPeriod communityServiceRunningPeriod = new GeneralServiceRunningContextPeriodFactory(purchasedAt, periodOfMembership).create();
    List<ServiceRunningContextFactory> list = Arrays.stream(SupportedService.values())
            .filter(v -> Badge.COMMUNITY_MEMBER.equals(v.getBadge()))
            .map(s -> new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), s, communityServiceRunningPeriod, ExtendedPropsFactory.DO_NOTING)).collect(Collectors.toList());
    list.addAll(Arrays.stream(meetings)
            .map(meeting -> new GeneralMemberServiceRunningContextFactory(command.getUserId(), command.getMembershipId(), BOOK_CLUB_MEETING, new BookMeetingPeriodFactory(meeting).create(), MeetingExtendedPropsFactory.of(meeting))).collect(Collectors.toList()));
    ServiceRunningContextFactory[] factories = new ServiceRunningContextFactory[list.size()];
    factories = list.toArray(factories);

    given(membershipMemberFactoryFinder.findMembershipFactory(command)).willReturn(new GeneralMembershipMemberFactory(() -> longIdGenerator.gen(MemberId.class), periodOfMembership, factories));

    sut.join(command);

    verify(longIdGenerator).gen(MemberId.class);
    verify(repository).save(any(Member.class));
}
```

**해석**<br>
해당하는 멤버가 없을 때, 멤버를 생성하는 명령을 실행하는 것을 확인하는 테스트 코드입니다.<br>

**생각**<br>
보자마자 숨이 턱 막혔습니다.<br>
해당 테스트를 알기 위해선 너무나도 많은 정보를 알아야 하고, 동시에 너무나도 많은 피로감이 쌓입니다.<br>
어플리케이션 로직에서 이렇게 다 만들면서 테스트를 진행하면 의미가 드러나지 않게 된다고 생각하거든요.<br>
어플리케이션은 다른 로직을 호출하기 위한 중간자라고 생각하기 때문입니다.<br>
테스트에서 표현하고자 하는 부분을 인식하고 빨리 갈아엎는 게 좋겠네요.<br>
<br>
표현하고자 하는 부분은 두 가지인 것 같습니다.<br>
<br>
_해당하는 멤버가 없는지_<br>
_없으면 멤버 생성 메소드를 호출하는지_<br>
<br>
복잡한 정보들을 다 빼고, 필요한 부분만 남긴 코드입니다.<br>

```java
@Mock
JoinCommand joinCommand;

@Mock
MembershipMemberFactory factory;

@Mock
Member member;

@Test
void 멤버가_없다면_생성을_시도한다() {
    given(repository.existsByUserIdAndMembershipIdAndState(joinCommand.getUserId(), joinCommand.getMembershipId(), MemberState.JOINED)).willReturn(false);
    given(membershipMemberFactoryFinder.findMembershipFactory(joinCommand)).willReturn(factory);
    given(factory.create(joinCommand.getUserId(), joinCommand.getMembershipId(), joinCommand.getEventedAt())).willReturn(member);

    sut.join(joinCommand);

    verify(repository).save(member);
}
```

### **220430::trevari::wallet::consumer::WalletFinderTest**
`반영 완료`

```java
@Test
void walletByUserId(@Mock Wallet wallet) {
    given(repository.findByUserId(USER_ID)).willReturn(wallet);
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);

    Wallet actual = sut.walletByUserId(USER_ID);

    assertThat(actual).isInstanceOf(Wallet.class);
}
```
**해석**<br>
유저 정보(userId)를 통해 지갑 조회 테스트하는 코드입니다.<br>

**생각**<br>
현재 해당 테스트는 의미없다 생각합니다.<br>
미리 지정된 지갑을 반환하고, 그 지정된 지갑이 맞는지 확인하는 것이기 때문입니다.<br>
제 생각에는 애플리케이션 로직인 만큼 다른 로직이 호출되는 것을 확인하는 것이 로직을 표현하기에 좋은 테스트같습니다.<br>
해당 테스트에서는 repository 의 메소드 호출을 확인하는 것이 될 수 있겠네요.<br>
이런 식으로 코드를 짤 수 있습니다.<br>
```java
@BeforeEach
void before() {
    sut = new WalletFinder(repository, longIdGenerator);
}

@Test
void walletByUserId() {
    sut.walletByUserId(USER_ID);
    
    verify(repository).findByUserId(USER_ID);
}
```

### **220501::trevari::member::domain::ServiceRunningContextUseTest**
`반영 완료`

```java
@Test
void 남은_회수() {
    sut = sut.withProvided(Times.of(2));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(ONE);
    assertThat(sut.isRemained()).isTrue();
    assertThat(sut.isUsedUp()).isFalse();

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(TWO);
    assertThat(sut.isRemained()).isFalse();
    assertThat(sut.isUsedUp()).isTrue();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME,  alwaysTrue())).hasMessage("Service already UsedUp when usedAt is " + ANY_LOCAL_DATE_TIME);
}
```

**해석**<br>
사용할 수 있는 횟수가 남지 않았다면, 사용할 수 없는 것을 확인할 수 있는 테스트 코드입니다.<br>

**생각**<br>
제목을 확인했을 때, 딱 와닿지는 않습니다.<br>
일단 해석해 보면, 처음 사용할 수 있는 횟수를 두 번 지정한 뒤 두 번의 사용을 거칩니다.<br>
그 이후 남은 횟수가 없는 상태에서 사용을 시도하면 예외가 발생하는 군요.<br>
저는 이 테스트 코드에서 표현하고자 하는 부분이 두 가지인 것 같습니다.<br>
<br>
_남은 횟수가 없는가_<br>
_남은 횟수가 없는 상태에서 사용하면 예외가 발생하는가_<br>
<br>
일단 저는 해당 테스트 코드에서 남은 횟수가 없다는 부분이 더 잘 보였으면 좋겠네요.<br>
그리고 제목에 대한 수정도 필요해 보입니다.<br>
좀 더 표현하고자 하는 부분만 드러내 수정한 코드입니다.<br>
<br>
```java
@Test
void 남은_횟수가_없다면_사용할_수_없다() {
    sut = sut.withProvided(Times.of(1));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(ONE);
    assertThat(sut.isRemained()).isFalse();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME,  alwaysTrue()))
            .isInstanceOf(MemberException.class)
            .hasMessage("Service already UsedUp when usedAt is " + ANY_LOCAL_DATE_TIME);
}
```

#### **220509::FOR::FEEDBACK**
`현진님 질문이 있읍니다. 수정된 테스트 코드에서는 assertThat(sut.isUsedUp()).isTrue(); 를 제거해주셨는데 이미 exception message에서 그 의미를 담고 있기 때문에 그러신걸까요?? assertThat(sut.isUsedUp()).isTrue(); 도 남은 횟수가 없다는 메세지를 내포하고 있는 것 같아서 여쭈어봐요`

```java
@Test
void 남은_횟수가_없다면_사용할_수_없다() {
    sut = sut.withProvided(Times.of(1));

    sut.use(ANY_LOCAL_DATE_TIME, alwaysTrue());
    assertThat(sut.getUsed()).isEqualTo(ONE);
    assertThat(sut.isUsedUp()).isTrue();
    assertThat(sut.isRemained()).isFalse();

    assertThatThrownBy(() -> sut.use(ANY_LOCAL_DATE_TIME,  alwaysTrue()))
            .isInstanceOf(MemberException.class)
            .hasMessage("Service already UsedUp when usedAt is " + ANY_LOCAL_DATE_TIME);
}
```

### **220502::trevari::member::consumer::TerminateServiceImplTest**
`반영 완료`

```java
TerminateServiceImpl sut;
TerminateCommand command = new TerminateCommand();

@Mock
MemberRepository repository;

@Mock
Member member;

@BeforeEach
void setUp() {
    command.setMemberId(ANY_MEMBER_ID);
    command.setRefundApplicatedAt(ANY_REFUND_APPLICATED_AT);
    sut = new TerminateServiceImpl(repository);
}

@Test
void verify_method() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);

    sut.terminate(command);

    verify(repository).findById(ANY_MEMBER_ID);
    verify(member).terminate();
    verify(repository).save(member);
}
```
**해석**<br>
해지 명령을 실행할 때, 호출되어야 하는 메소드가 호출되는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
딱히 부족하다고 생각이 드는 코드는 아닙니다.<br>
하지만 더욱 명시적으로 하기 위해선, 멤버가 정말 해지 대상인지 확인시켜주는 코드가 내부에 있으면 좋을 것 같습니다.<br>
아래 코드를 넣어주면 더욱 명시적일 것 같습니다.<br>
```java
given(member.isTerminated()).willReturn(false);
```

#### **220507::FOR::FEEDBACK**

`InOrder.verify 를 사용해보는건 어때요?`

```java
@Test
void verify_method() {
    InOrder inOrder = inOrder(repository, member);
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);
    given(member.isTerminated()).willReturn(false);

    sut.terminate(command);

    verify(repository).findById(ANY_MEMBER_ID);
    verify(member).terminate();
    verify(repository).save(member);
    inOrder.verify(repository).findById(ANY_MEMBER_ID);
    inOrder.verify(member).terminate();
    inOrder.verify(repository).save(member);
}
```


### **220503::trevari::wallet::domain::TicketsSerializeTest**
`반영 완료`

```java
@Test
void 티켓이_없을때_Serialize() {
    Tickets tickets = Tickets.init();

    String serialized = serializer.serialize(tickets);
    Tickets deserialized = serializer.deserialize(serialized, Tickets.class);

    assertThat(serialized).isEqualTo("{\"items\":[]}");
    assertThat(deserialized).isEqualTo(tickets);
}
```
**해석**<br>
티켓 값이 비어있는 상황에서 직렬화가 되는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
then 부분에서 두 가지를 확인하는 군요? serialized, deserialized.<br>
티켓이 빈 상태에서 serialize 된 것만 확인하면 되니, 굳이 deserialize 된 부분을 확인할 필요는 없을 것 같네요.<br>
해당 부분만 확인할 수 있도록 수정합니다.<br>
```java
@Test
void 티켓이_없을때_Serialize() {
    Tickets tickets = Tickets.init();

    String serialized = serializer.serialize(tickets);

    assertThat(serialized).isEqualTo("{\"items\":[]}");
}
```

## Think of Test

1독 - 테스트에 관한 글을 읽습니다. <br>
1기 - 글에 관한 생각을 기록합니다. <br>

### 나의 생각

```
테스트 주도 개발(Test-driven development TDD)은 매우 짧은 개발 사이클을 반복하는 소프트웨어 개발 프로세스 중 하나이다. 개발자는 먼저 (1) 요구사항을 검증하는 자동화된 테스트 케이스를 작성한다. 그런 후에, (2) 그 테스트 케이스를 통과하기 위한 최소한의 코드를 생성한다. 마지막으로 (3) 작성한 코드를 표준에 맞도록 리팩토링한다. 이 기법을 개발했거나 '재발견' 한 것으로 인정되는 Kent Beck은 2003년에 TDD가 단순한 설계를 장려하고 자신감을 불어넣어준다고 말하였다.
```
제일 중요한 건 빠른 속도로 완전한 코드를 완성시켜 나간다는 것이다. 우리는 완벽하진 않지만 빠르게 결과물을 확인해 나갈 수 있고, 성취감 또한 빠르게 여러번 느낄 수 있다. 이런 과정을 통해 개발자가 설계 및 구현에 대한 자신감을 갖고 진행할 수 있도록 하는 것 같다는 생각이다.

```
TDD에서는 리팩토링을 특이한 방법으로 사용한다. 일반적으로 리팩토링은 어떤 상황에서도 프로그램의 의미론을 변경해서는 안 된다. 하지만 TDD에서는 상수를 변수로 바꾸고 양심에 거리낌 없이 이를 리팩토링이라고 부른다. 왜냐면 이 행위가 통과하는 테스트의 집합에 아무 변화도 주지 않기 때문이다. 의미론이 유지되는 상황이란 사실 테스트 케이스 하나일 수도 있다. 그럴 때 이전에 통과한 다른 테스트 케이스들은 실패하게 될 것이다. 하지만 우린 아직 나머지 테스트를 만들지 않았기 때문에 이 테스트들에 대해서는 걱정할 필요가 없다.
```
일단 의미론을 내가 모른다는 걸 알았다... 이어가서 상수와 변수를 바꾸어도 통과하는 테스트 집합에 아무 변화도 주지 않는다는 점이 이해가 잘 되지 않는다. 무슨 말일까... 그럼 실패하는 케이스는 왜 아직 걱정할 필요가 없지? 의미론 적으로 바뀌지 않아서 그런가? 도통 모르겠군..

```
TDD 주기 1. 테스트를 작성한다.
마음 속에 있는 오퍼레이션이 코드에 어떤 식으로 나타나길 원하는지 생각해보라. 이야기를 써내려가는 것이다. 원하는 인터페이스를 개발하라. 올바른 답을 얻기 위해 필요한 이야기의 모든 요소를 포함시켜라.
```
개발 코드를 작성한다는 것은 글을 써내려간다는 것이다. 그리고 그 글은 시스템이 어떻게 동작하는지 설명하고 있고, 그 동작을 이해하기 위해 다른 개발자 들도 글을 바라본다. 우리가 일상에서 사용하는 용어와 문체를 개발 코드에 녹여야 한다. 내가 생각했을 때, 가장 잘 쓴 글은 모두가 빠르고 정확하게 이해할 수 있는 글이다. 코드도 마찬가지다. 빠르고 이해하기 좋은 코드를 나타내는 것이 결국 잘 작성한 코드인 것이다.

```
TDD 주기 2. 실행 가능하게 만든다.
다른 무엇보다도 중요한 것은 빨리 초록 막대를 보는 것이다. 깔끔하고 단순한 해법이 명백히 보인다면 그것을 입력하라. 만약 깔끔하고 단순한 해법이 있지만 구현하는 데 몇 분 정도 걸릴 것 같으면 일단 적어 놓은 뒤에 원래 문제(초록 막대를 보는 것)로 돌아오자. 미적인 문제에 대한 이러한 전환은 몇몇 숙련된 소프트웨어 공학자들에게는 어려운 일이다. 그들은 오로지 좋은 공학적 규칙들을 따르는 방법만 알 뿐이다. 빨리 초록 막대를 보는 것은 모든 죄를 사해준다. 하지만 아주 잠시 동안만이다.
```
빠르게 진행 상황을 업데이트 시키는 것이 좋다. 그러면 진척도를 실시간으로 확인하며 성취감을 느낄 수 있을 뿐더러 문제에 대한 파악도 빠르게 일어날 것이다. 몇몇 고착화된 규칙을 따르다 보면 완벽하게 모든 것을 진행하려는 경향이 있다. 하지만 처음부터 모든 것을 완벽하게 만들 수는 없다. 빠르게 되는 것을 확인하는 것이 계단을 걸어 올라가며 완벽을 향한 벽돌을 쌓는 과정이 될 것이다.


```
TDD 주기 3. 올바르게 만든다.
이제 시스템이 작동하므로 직전에 저질렀던 죄악을 수습하자. 좁고 올곧은 소프트웨어 정의(software righteousness)의 길로 되돌아와서 중복을 제거하고 초록 막대로 되돌리자.
```
어떤 죄악을 저지르던, 결과가 중요한 법이다. 우리 목적은 작동하는 깔끔한 코드를 얻는 것이다. 아마 많은 개발자들이 인지하고 있으면서 어려워하는 부분일 테다. 나도 그렇다. 결국 우리는 작동하고 깔끔한 코드를 한 번에 얻기란 불가능할 것이다. 나같은 초보 개발자는 더더욱이나.. 그래서 부분 부분을 나누어 작동하는 것을 확인하고 넘어가는 것이다. 그 과정에서 저지르는 죄악은 용서받을 수 있다. 추후 리팩토링을 하면 된다. 일단 동작을 되게 하자.
