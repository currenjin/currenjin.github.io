---
layout  : wiki
title   : Mockito
summary :
date    : 2022-02-26 12:00:00 +0900
updated : 2022-07-06 22:00:00 +0900
tag     : test
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Mockito

## MockitoExtension

```java
@ExtendWith(MockitoExtension.class)
```

이거 많이 보셨죠?<br>
테스트 클래스에서 Mock Annotation 을 사용하기 위해 항상 정의하던 Extension 입니다.<br>
MockitoExtension 은 도대체 어떤 역할을 하는지 간단하게 기술하겠습니다. (아직 얕게 훑어봐서 그래요)<br>
<br>
<br>

MockitoExtension 클래스는 JUnit Jupiter 종속성 하위에 존재합니다.<br>
<br>
해당 클래스는 테스트에 사용되는 여러 인터페이스를 구현합니다.<br>

- BeforeEachCallback
- AfterEachCallback
- ParameterResolver

<br>
많이 본 이름들이 보이죠?<br>
그 중에서도 BeforeEachCallback 인터페이스는 beforeEach 메소드를 갖고 있습니다.<br>
MockitoExtension 에서는 beforeEach method 를 override 해 구현하죠.<br>
그럼 beforeEach 에서는 어떤 행동을 할까요?<br>
<br>

### beforeEach

```java
@Override
public void beforeEach(final ExtensionContext context) {
    List<Object> testInstances = context.getRequiredTestInstances().getAllInstances();

    Strictness actualStrictness = this.retrieveAnnotationFromTestClasses(context)
        .map(MockitoSettings::strictness)
        .orElse(strictness);

    MockitoSession session = Mockito.mockitoSession()
        .initMocks(testInstances.toArray())
        .strictness(actualStrictness)
        .logger(new MockitoSessionLoggerAdapter(Plugins.getMockitoLogger()))
        .startMocking();

    context.getStore(MOCKITO).put(MOCKS, new HashSet<>());
    context.getStore(MOCKITO).put(SESSION, session);
}
```

#### ExtensionContext

```java
public void beforeEach(final ExtensionContext context) {}
```

ExtensionContext 는 현재 실행되고 있는 테스트 context 를 캡슐화합니다.<br>


#### Test instances

```java
List<Object> testInstances = context.getRequiredTestInstances().getAllInstances();
```

먼저 필요한 testInstances 들을 끌고 옵니다. 디버깅을 통해 찍어보니, 실제 테스트 클래스에서 Mock Annotation 을 붙인 Instance 가 표시되더군요.

<img width="395" alt="image" src="https://user-images.githubusercontent.com/60500649/177028979-c9b14172-2e92-4374-9210-32b49994cb1a.png">

#### Strictness

```java
Strictness actualStrictness = this.retrieveAnnotationFromTestClasses(context)
    .map(MockitoSettings::strictness)
    .orElse(strictness);
```

Strictness 를 정의합니다. 해당 객체에는 STRICT_STUBS 가 정의되는데, Mockito version 2 의 새로나온 기능이며 Mockito 의 Strict 한 사용을 위함입니다.

#### Mockito session

```java
MockitoSession session = Mockito.mockitoSession()
    .initMocks(testInstances.toArray())
    .strictness(actualStrictness)
    .logger(new MockitoSessionLoggerAdapter(Plugins.getMockitoLogger()))
    .startMocking();
```

mockito session 이 정의되는 과정에서 mocking 을 이용해 테스트 인스턴스를 초기화합니다.<br>
<br>
한 마디로,<br>

<img width="440" alt="image" src="https://user-images.githubusercontent.com/60500649/177028511-d487797d-1aac-41ab-b655-16ed7838fae0.png">

원래 이랬던 애들이<br>

<img width="610" alt="image" src="https://user-images.githubusercontent.com/60500649/177028482-aa3c1b13-f331-4184-8169-4bfa4258b1c5.png">

이렇게 됩니다. <br> 
<br>
필요로 하는 값이 정의되고 나면 해당 세션을 시작하게되죠.<br>
(세션이 정확히 어떤 역할을 하는 지는 아직 잘 모르겠습니다)<br>

#### Context

```java
context.getStore(MOCKITO).put(MOCKS, new HashSet<>());
context.getStore(MOCKITO).put(SESSION, session);
```

Mock 인스턴스 초기화 과정을 마치고 세션이 시작되면, context 에는 관련 정보가 기입이 됩니다. (아직 정확히 무슨 일을 하는 것인지 모릅니다)<br>
해당 context 들은 afterEach 메소드를 통해서, 테스트가 끝나면 제거됩니다. 해당 내용은 더 알아보고 남겨두겠습니다.<br>

### afterEach

```java
@Override
public void afterEach(ExtensionContext context) {
    context.getStore(MOCKITO).remove(MOCKS, Set.class).forEach(mock -> ((ScopedMock) mock).closeOnDemand());
    context.getStore(MOCKITO).remove(SESSION, MockitoSession.class)
            .finishMocking(context.getExecutionException().orElse(null));
}
```

## doThrow()
예외를 던지고 싶을 때 사용합니다.
```java
@Test(expected = IllegalArgumentException.class)
public void name(){
    Person person = mock(Person.class);
    doThrow(new IllegalArgumentException()).when(person).setName(eq("currenjin"));
    String name = "currenjin";
    p.setName(name);
}
```

## ArgumentCaptor

전달하는 인자를 확인합니다..

```java
ArgumentCaptor<Person> argument = ArgumentCaptor.forClass(Person.class);
verify(mock).doSomething(argument.capture());
assertEquals("Hyunjin", argument.getValue().getName()); 
```

## ConsecutiveCalls

특정 메소드가 여러 번 호출되더라도 서로 다른 값을 반환합니다.

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

## Verify Order
순서대로 호출하는지 확인합니다.
```java
@Test
void verify_method() {
    InOrder inOrder = inOrder(repository, member);
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);
    given(member.isTerminated()).willReturn(false);

    sut.terminate(command);

    inOrder.verify(repository).findById(ANY_MEMBER_ID);
    inOrder.verify(member).terminate();
    inOrder.verify(repository).save(member);
}
```

## VerifyNoMoreInteractions

mock 객체에서 더이상 호출하는 메소드가 없음을 확인할 수 있습니다.

```java
// 메소드 호출
mock.doSomething();
mock.doSomethingUnexpected();

// 동작 확인
verify(mock).doSomething();

// doSomethingUnexpected 메소드가 호출되기 때문에 실패합니다.
verifyNoMoreInteractions(mock);
```

## Verification with Timeout
시간 초과를 확인할 수 있습니다.

```java
// someMethod method 가 100ms 이내이면 통과합니다.
verify(mock, timeout(100)).someMethod();

// someMethod method 가 100ms 이내에서 두 번 호출되면 통과합니다.
verify(mock, timeout(100).times(2)).someMethod();

// 위와 동일합니다. atLeast method 는 적어도 두 번 호출한다는 뜻입니다.
verify(mock, timeout(100).atLeast(2)).someMethod();
```

## reset()

mock 객체를 초기화할 수 있습니다.

```java
List mock = mock(List.class);
when(mock.size()).thenReturn(10);
mock.add(1);

// 해당 시점에 mock 객체는 인지하고 있던 모든 stub 과 interaction 을 잊게 됩니다.
reset(mock);
```

### Verify AtLeast

mock 객체 메소드에 대해 최소한의 호출을 확인합니다.

```java
// 적어도 세 번 호출하면 성공합니다.
verify(mock, atLeast(3)).someMethod("some arg");

// 적어도 한 번 호출하면 성공합니다.
verify(mock, atLeastOnce()).someMethod("some arg");
```

### MockedStatic

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
