---
layout  : wiki
title   : Mockito
summary :
date    : 2022-02-26 12:00:00 +0900
updated : 2022-06-30 18:00:00 +0900
tag     : test
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Mockito

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
