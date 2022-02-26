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

# Mockito

## Example

### doThrow()
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
