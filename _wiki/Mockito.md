---
layout  : wiki
title   : Mockito
summary :
date    : 2022-02-26 12:00:00 +0900
updated : 2022-06-21 13:30:00 +0900
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
