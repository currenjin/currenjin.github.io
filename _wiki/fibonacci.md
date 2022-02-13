---
layout  : wiki
title   : Fibonacci
summary :
date    : 2022-01-23 14:00:00 +0900
updated : 2022-02-13 12:00:00 +0900
tag     : Math
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# 피보나치 수열
수학에서, 피보나치 수(영어: Fibonacci numbers)는 첫째 및 둘째 항이 1이며 그 뒤의 모든 항은 바로 앞 두 항의 합인 수열이다. 처음 여섯 항은 각각 1, 1, 2, 3, 5, 8이다. 편의상 0번째 항을 0으로 두기도 한다.

## 피보나치 수열을 이용한 사각형
![image](https://user-images.githubusercontent.com/60500649/150665710-790a7f1f-fa24-4656-9f5e-6d29c58cba0a.png)

피보나치 수열에 의해 만들어지는 사각형의 비율은 황금비(1:1.6)에 근접하다.<br>

## 코딩
### 피보나치 수열 테스트
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

## Test