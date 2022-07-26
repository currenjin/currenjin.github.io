---
layout  : wiki
title   : TDD(Test Driven Development, 테스트 주도 개발)
summary :
date    : 2022-01-04 22:38:00 +0900
updated : 2022-07-26 20:00:00 +0900
tag     : tdd
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# TDD

테스트 주도 개발(Test-driven development TDD)은 매우 짧은 개발 사이클을 반복하는 소프트웨어 개발 프로세스 중 하나이다. 개발자는 먼저 (1) 요구사항을 검증하는 자동화된 테스트 케이스를 작성한다. 그런 후에, (2) 그 테스트 케이스를 통과하기 위한 최소한의 코드를 생성한다. 마지막으로 (3) 작성한 코드를 표준에 맞도록 리팩토링한다. 이 기법을 개발했거나 '재발견' 한 것으로 인정되는 Kent Beck은 2003년에 TDD가 단순한 설계를 장려하고 자신감을 불어넣어준다고 말하였다.

## Test
### 어떻게 테스트할 것인가?

- '테스트하다(test)'는 '평가하다'라는 뜻의 동사다.
- '승인 또는 거부에 도달하는 과정'을 뜻하는 명사기도 하다.

변화에 따른 테스트(수작업)는 동사적 의미를 암시하고, 테스트를 갖고 있다는 것(자동화)은 명사를 암시한다.<br>
그렇기에, 변화에 따른 테스트는 테스트를 갖고 있는 것과 동일하지 않다.<br>

### 테스트는 서로 어떤 영향을 미치는가?

- 테스트를 실행하는 것은 서로 아무 영향이 없어야 한다.

격리된 테스트는 각 테스트가 실행 순서에 독립적이게 된다는 것이다.<br>
테스트를 일부만 실행할 때, 선행 테스트가 실행되지 않아서 내가 실행하려는 테스트가 실패하진 않을까 걱정할 필요없이 테스트를 진행할 수 있어야 한다.<br>
테스트를 격리하기 위한 작업은 결과적으로 응집도가 높고, 결합도가 낮은 시스템으로 구성되도록 한다.

### 무엇을 테스트하는가?

- 시작 전, 작성해야 할 테스트 목록을 모두 적어둔다.

향후 몇 시간 내 처리해야 하는 일, 몇 주 몇 달 내로 해야하는 일을 정의할 필요가 있다.<br>
'지금' 할 일에 속하는 지, '나중에' 할 일에 속하는 지, 또는 할 필요가 없는 일인지 결정한다.<br>
개발에서도 비슷하게 적용된다. 구현해야 할 것들에 대한 테스트를 목록에 적고, 지금 할 일과 나중에 할 일, 또는 할 필요가 없는 일을 인지한다.

### 언제 테스트를 작성하는가?

- 테스트 대상이 되는 코드를 작성하기 직전에 작성하는 것이 좋다.
- 코드 작성 후에는 테스트를 만들지 않는 것이 좋다.

테스트를 먼저 해야 한다는 규칙을 도입해보면 영향도를 뒤집을 수 있고, 효과적인 주기를 만들어내게 된다.

## CYCLE
1. 작은 테스트를 하나 추가한다.
2. 모든 테스트를 실행해서 테스트가 실패하는 것을 확인한다.
3. 조금 수정한다.
4. 모든 테스트를 실행해서 테스트가 성공하는 것을 확인한다.
5. 중복을 제거하기 위해 리팩토링을 한다.

## Pattern

### 픽스처

여러 테스트에서 공통으로 사용하는 객체를 생성할 때, 어떻게하면 좋을까요?<br>
각 테스트 코드에 있는 지역 변수를 인스턴스 변수로 바꾸고 setUp() 메서드를 재정의하여 이 메서드에 인스턴스 변수들을 초기화하도록 합니다.<br>
<br>

우리는 모두 코드에서 중복을 제거하길 원합니다. 이떄, 우리는 테스트 코드에서도 중복을 제거해야 할까요?<br>
제거해야 할 겁니다.<br>
<br>

우리가 종종 테스트 코드를 만들었을 때, 객체를 세팅하는 코드는 여러 테스트에 걸쳐 동일한 경우가 있습니다. (이러한 객체들은 테스트 픽스처라고 부릅니다)<br>
이런 중복이 좋지 않은 이유는 다음과 같습니다.<br>

- 복붙을 하더라도 반복 작성하는 코드에는 시간이 소요되는데, 테스트를 빠르게 작성하는 데에 방해 요소가 됩니다.
- 인터페이스를 수동으로 변경할 필요가 있을 경우, 여러 인터페이스를 고쳐줘야 합니다.

<br>

예시를 통해 중복을 제거해 봅시다.<br>

```java
@Test
void empty() {
    Rectangle empty = new Rectangle(0, 0, 0, 0);

    assertThat(empty.isEmpty()).isTrue();
}

@Test
void width() {
    Rectangle empty = new Rectangle(0, 0, 0, 0);

    assertThat(empty.getWidth()).isEqualTo(0.0);
}
```

다음과 같이 중복을 제거할 수 있습니다.<br>

```java
Rectangle empty;

@BeforeEach
void setUp() {
    empty = new Rectangle(0, 0, 0, 0);

}

@Test
void empty() {
    assertThat(empty.isEmpty()).isTrue();
}

@Test
void width() {
    assertThat(empty.getWidth()).isEqualTo(0.0);
}
```

공통 적으로 필요한 객체를 setUp method 로 추출했습니다.<br>
해당 method 는 각 test method 가 호출되기 전에 호출되죠.<br>
<br>

사실, 위 내용과 아래 내용을 모두 사용해도 상관은 없습니다.<br>
저 같은 경우에는 공통적인 setUp 코드를 분리하는데, 이 과정에서 세부 사항에 대해 외워야 한다는 단점이 있습니다.<br>
이것을 덜 분리하는 방향도 좋습니다.<br>
또는 test method 내에서 보아야 하는 내용만 setUp 하기도 합니다.<br>
<br>

사실 테스트 케이스의 하위 클래스와 하위 클래스의 인스턴스 관계는 사람들이 가장 혼란스러워 하는 부분 중 하나입니다.<br>
저는 되도록이면 서로 다른 유형의 인스턴스인 경우에는 따로 분리해서 테스트 케이스를 작성합니다. (ex. EmptyRectangleTest, NormalRectangleTest)<br>
그렇게 되면 setUp method 내에서도 생성하는 인스턴스가 서로 다르겠죠.<br>
이는 각 인스턴스의 유형에 따라 특정 관계가 맺어진다는 뜻이 될 수도 있습니다.<br>
<br>

하지만 꼭 모든 픽스처가 유형 별로 분리되어지지는 않습니다.<br>
한 픽스처가 여러 클래스를 통해 테스트하는 경우도 있고, 한 클래스를 통해 여러 픽스처를 테스트하는 경우도 있습니다.<br>
우리가 인식해야할 것은 꼭 한 모델에 대해서 하나의 테스트 클래스가 대응되지 않는다는 점입니다.<br>
<br>

감사합니다.<br>

### 초록 막대 패턴

깨진 테스트가 있다면 그걸 고쳐야 합니다. 빨간 막대를 가능한 한 빨리 고쳐야 하는 조건으로 다룬다면 당신은 금세 초록 막대로 옮겨갈 수 있다는 것을 깨닫게 될 것입니다. 코드가 테스트를 통과하게 만들기 위해 이 패턴을 사용하세요. (비록 그 결과 코드가 당신이 한 시간도 견뎌낼 수 없는 것이라고 해도..)<br>

### 삼각 측량법

추상화 과정을 테스트로 주도하고 싶을 때, 어떻게 최대한 보수적으로 할 수 있을까요?<br>
켄트 벡은 오로지 예시가 두 개 이상일 때만 추상화하라 합니다.<br>
<br>

두 정수의 합을 반환하는 함수를 작성하고 싶다 생각해 보죠.<br>
예시는 아래와 같습니다.<br>

```java
@Test
void sum() {
    assertThat(Operator.plus(3, 1)).isEqualTo(4);
}
```

```java
public class Operator {
    public static int plus(int n1, int n2) {
        return 4;
    }
}
```

위 테스트를 돌린다면, 성공하겠죠. 하지만 우리는 올바른 로직이 아니란 것을 인지하고 있습니다.<br>
삼각 측량법을 통해 올바른 설계로 유도해 봅시다.<br>
<br>

```java
@Test
void sum() {
    assertThat(Operator.plus(3, 1)).isEqualTo(4);
    assertThat(Operator.plus(3, 4)).isEqualTo(7);
}
```

해당 테스트를 작성한 후, 돌리게 되면 실패하게 됩니다.<br>
하지만 이 테스트를 통해 우린 정확한 로직으로 변경할 수 있게 되죠.<br>

```java
public static int plus(int n1, int n2) {
    return n1 + n2;
}
```

테스트를 돌려보면 통과하게 됩니다.<br>
<br>

처음엔 특정 값을 반환하여 테스트를 통과시키게 했지만, 삼각 측량법을 이용해 하나의 테스트를 또 추가해 우리를 올바른 로직으로 인도합니다.<br>
삼각 측량법은 빠르게 테스트를 통과하기 위해 저질렀던 다양한 범죄에서 우리를 구원해 주죠.<br>
저 또한 어떤 감을 잡기 어려운 테스트같은 경우에 삼각 측량법을 사용합니다. 제가 주로 사용하는 경곗값 테스트도 비슷한 맥락입니다.<br>

### 테스트 우선

테스트를 언제 작성하는 것이 좋을까요?<br>
테스트 대상이 되는 코드를 작성하기 직전에 작성하는 것이 좋습니다.<br>
<br>

코드를 작성한 후에 우리는 테스트를 만들지 않습니다. 만든다고 해도, 대부분의 경우에 해피 케이스에 대한 테스트일 겁니다.<br>
우리의 목표는 동작하는 소프트웨어를 만드는 것이지, 테스트를 만드는 것이 목표는 아니기 때문이죠.<br>
하지만, 우리는 이렇게 작성하는 코드의 설계에 대해 생각해 볼 시간이 필요하고, 작업 범위를 조절할 방법도 필요할 겁니다.<br>
<br>

테스트를 먼저 작성해야 한다고 생각하면 어떨까요?<br>
스트레스와 테스트의 관계가 있습니다. 스트레스를 받을 수록, 충분한 테스트를 하지 못할 가능성이 큽니다. 동시에 충분한 테스트를 하지 못하면 그에 따른 스트레스를 받을 수 있죠. 또한 테스트 외에도 코드를 작성하며 여러 테스트를 받을 수 있습니다.<br>
이런 굴레에서 벗어나기 위해 테스트를 먼저 작성하는 것입니다. 테스트를 먼저 작성하면, 우리는 즉각적인 피드백 또는 통과하는 초록불로 인해 스트레스 지수를 낮출 수 있습니다.<br>
이는 우리가 보다 더 좋은 품질의 코드를 작성할 수 있다고 믿게 합니다.<br>
<br>

테스트 퍼스트..<br>

## Example

### Fibonacci

첫 번째 테스트는 `fib(0) = 0` 으로 시작합니다.<br>

```java
@Test
void fibonacci() {
    assertThat(Fibonacci.fib(0)).isEqualTo(0);
}
```

어차피 확인할 값이 0 뿐이라, 빠르게 성공시키기 위해 0을 바로 반환합니다.<br>

```java
public static int fib(int n) {
    return 0;
}
```

<br>

두 번째 테스트는 `fib(1) = 1` 입니다.<br>

```java
@Test
void fibonacci() {
    assertThat(Fibonacci.fib(0)).isEqualTo(0);
    assertThat(Fibonacci.fib(1)).isEqualTo(1);
}
```

돌려보면, 당연히도 실패하겠죠.<br>
저는 빠르게 테스트를 성공시키기 위해 아래와 같은 '범죄'를 저지를 것입니다.<br>

```java
public static int fib(int n) {
    if (n == 0) return 0;
    return 1;
}
```

이 상태에서 테스트를 돌리면 성공합니다.<br>
<br>

다음 수열을 케이스로 작성해 보겠습니다.<br>

```java
@Test
void fibonacci() {
    assertThat(Fibonacci.fib(0)).isEqualTo(0);
    assertThat(Fibonacci.fib(1)).isEqualTo(1);
    assertThat(Fibonacci.fib(2)).isEqualTo(1);
}
```

좀 꼴보기가 싫어지는 군요.<br>
제가 아는 도구를 통해, 좀 더 빠르게 테스트를 진행해 보겠습니다.<br>
<br>

```java
@ParameterizedTest
@CsvSource(value = {"0, 0", "1, 1", "2, 1"})
void fibonacci(int n, int result) {
    assertThat(Fibonacci.fib(n)).isEqualTo(result);
}
```

간단하게, csv source 값들 중 각 따옴표 내의 값들이 n, result 값으로 들어와 테스트 메소드가 반복 호출됩니다.<br>
도구에 대한 설명은 뒤로하고, 계속 진행해 보겠습니다.<br>
<br>

테스트를 돌려보면 통과합니다.<br>

![image](https://user-images.githubusercontent.com/60500649/179350418-272560c7-21dc-4369-9cbf-daa42fdcf702.png)

좀 이상하다고 생각할 수 있지만 일단 돌아가니 넘어갑시다.<br>
<br>

다음 케이스는 셋째 항의 값이 2인 경우입니다.<br>

```java
@ParameterizedTest
@CsvSource(value = {"0, 0", "1, 1", "2, 1", "3, 2"})
void fibonacci(int n, int result) {
    assertThat(Fibonacci.fib(n)).isEqualTo(result);
}
```

돌리면, 당연하게도 실패합니다.<br>
테스트를 빠르게 통과시키기 위해, 이전에 저질렀던 범죄를 다시 한 번 저질러 봅시다.<br>

```java
public static int fib(int n) {
    if (n == 0) return 0;
    if (n <= 2) return 1;
    return 2;
}
```

자. 이렇게 하면 통과하겠죠?<br>
하지만 더이상 나아가면, 계속해서 범죄를 저지르게 되고 그 범죄는 더 큰 악을 낳을 수 밖에 없게 됩니다.<br>
이정도 쯤에서 악을 제거하기 위해 리팩토링을 진행해 봅시다.<br>
<br>

일단, 마지막에 반환하는 2 는 1 + 1 로도 바꿀 수 있습니다.<br>

```java
public static int fib(int n) {
    if (n == 0) return 0;
    if (n <= 2) return 1;
    return 1 + 1;
}
```

이렇게 변경하는게 무슨 의미가 있냐고요?<br>
잘 보시면, 중복된 값(1)이 생긴 것을 알 수 있습니다.<br>

반환하는 첫 번째 1이라는 값은 재귀를 통해 중복을 제거할 수 있겠군요.<br>

```java
public static int fib(int n) {
    if (n == 0) return 0;
    if (n <= 2) return 1;
    return fib(n - 1) + 1;
}
```

네, 이 상태로 테스트를 돌려봅시다.<br>

![image](https://user-images.githubusercontent.com/60500649/179350673-be20937d-94c0-4c0f-9c25-ffb7b0880079.png)

잘 돌아가는 것을 확인할 수 있습니다.<br>
<br>

하지만, 여전히 추가하는 값(1)의 중복도 불편합니다.<br>
해당 값은 사실 1이 아니라 2번째 이전 항의 값이므로, 동일하게 재귀를 사용합니다.<br>

```java
public static int fib(int n) {
    if (n == 0) return 0;
    if (n <= 2) return 1;
    return fib(n - 1) + fib(n - 2);
}
```

이제, 4항을 추가해 볼까요?<br>

```java
@ParameterizedTest
@CsvSource(value = {"0, 0", "1, 1", "2, 1", "3, 2", "4, 3"})
void fibonacci(int n, int result) {
    assertThat(Fibonacci.fib(n)).isEqualTo(result);
}
```

돌려보면, 성공합니다.<br>
<br>

문제가 없는 건가? 저는 아직 불안한 마음이 있어 세 항을 더 추가해 테스트하겠습니다.<br>

```java
@ParameterizedTest
@CsvSource(value = {"0, 0", "1, 1", "2, 1", "3, 2", "4, 3", "5, 5", "6, 8", "7, 13"})
void fibonacci(int n, int result) {
    assertThat(Fibonacci.fib(n)).isEqualTo(result);
}
```

![image](https://user-images.githubusercontent.com/60500649/179350985-93461d03-1398-48a8-97fe-8074e2da1f94.png)

성공하는군요!<br>
저는 이렇게 안심할 수 있는 로직을 한 개 만들게 되었습니다.<br>

## Reference
[ATDD(Acceptance Test Driven Development)](https://velog.io/@windtrip/ATDDAcceptance-Test-Driven-Development#tdd-bdd-atdd-%EB%B9%84%EA%B5%90)

