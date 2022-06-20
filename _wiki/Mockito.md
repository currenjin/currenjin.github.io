---
layout  : wiki
title   : Mockito
summary :
date    : 2022-02-26 12:00:00 +0900
updated : 2022-06-20 13:30:00 +0900
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
