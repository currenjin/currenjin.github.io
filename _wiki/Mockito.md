---
layout  : wiki
title   : Mockito
summary :
date    : 2022-02-26 12:00:00 +0900
updated : 2022-02-26 12:00:00 +0900
tag     : test
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

테스트(Test) : 평가하다

# Mockito

## Example

### doThrow()
예외를 던지고 싶을 땐, doThorw() 를 사용한다.

```java
@Test(expected = IllegalArgumentException.class)
public void name(){
    Person person = mock(Person.class);
    doThrow(new IllegalArgumentException()).when(person).setName(eq('currenjin'));
    String name = 'currenjin';
    p.setName(name);
}
```
