---
layout  : wiki
title   : TDD(Test Driven Development, 테스트 주도 개발)
summary :
date    : 2022-01-04 22:38:00 +0900
updated : 2022-08-13 22:00:00 +0900
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

### 테스트할 필요가 없는 것은 무엇인가?

"두려움이 지루함으로 변할 때까지 테스트를 만들어야 합니다."<br>

### 좋은 테스트를 갖췄는지의 여부를 어떻게 알 수 있는가?

테스트란 탄광 속에서 자신의 고통을 통해 고약한 설계 가스의 존재를 드러내는 카나리아입니다.<br>
<br>

다음은 설계에 문제가 있음을 알려주는 테스트의 특징입니다.<br>

#### 긴 셋업 코드

하나의 단순한 단언을 수행하기 위해 수십, 수백 줄의 객체 생성 코드가 필요하다면 문제가 있다고 할 수 있습니다. 한 객체가 너무 크다는 뜻이므로 나뉠 필요가 있습니다.<br>

#### 셋업 중복

공통의 셋업 코드를 넣어 둘 공용 장소를 찾기 힘들다면, 서로 밀접하게 엉킨 객체들이 너무 많다는 뜻입니다.<br>

#### 실행 시간이 오래 걸리는 테스트

테스트 실행 시간이 오래 걸리면 테스트를 자주 실행하지 않게 됩니다. 이에 따라 한동안 실행이 안 된 채로 남는 테스트가 있게 되고, 어떤 테스트는 아예 동작하지 않을 수 있습니다.<br>
더 나쁜 것은, 테스트의 실행 시간이 길다는 것이 application 의 작은 부분만 따로 테스트하기가 힘들다는 것을 의미합니다. 작은 부분만 테스트할 수 없다는 것은 설계 문제를 의미하고 설계를 적절하게 변경해 줄 필요가 있습니다.<br>

#### 꺠지기 쉬운 테스트

예상치 못하게 실패하는 테스트가 있다면 이는 애플리케이션의 특정 부분이 다른 부분에 이상한 방법으로 영향을 끼친다는 것입니다.<br>
연결을 끊거나 두 부분을 합하는 것을 통해 멀리 떨어진 애플리케이션끼리의 영향력이 없도록 설계해야 합니다.<br>

### 테스트를 지워야 할 때는 언제인가?

테스트가 많으면 좋기야 하지만, 서로 겹치는 두 개의 테스트가 있어도 이들을 남겨 두어야 할까요? 대답은 두 기준에 의해 결정됩니다.<br>

- **자신감,** 테스트를 삭제할 경우 자신감이 줄어들 것 같으면 절대 테스트를 지우면 안 됩니다.
- **커뮤니케이션,** 두 테스트가 코드의 동일한 부분을 실행하더라도, 이 둘이 서로 다른 시나리오를 말한다면 그대로 두어야 합니다.

이런 기준들이 있지만, 부가적인 이득이 없는 중복된 테스트가 두 개 있다면, 덜 유용한 것을 제거합니다.

### TDD 는 누구를 위한 것인가?

모든 프로그래밍 방법은 명시적이건 암묵적이건 간에 어떤 가치 체계를 내포합니다. TDD 역시 다르지 않습니다.<br>
만약 여러분이 어느 정도는 작동하는 코드를 왕창 입력해 넣는 것에 행복해 하고, 그 결과를 두 번 다시 쳐다보지 않는 것에 행복해 한다면, TDD 는 여러분을 위한 것이 아닙니다.<br>
TDD 는 더 깔끔한 설계를 할 수 있도록, 그리고 더 많은 것을 배워감에 따라 설계를 더 개선할 수 있도록 적절한 때 적절한 문제에 집중할 수 있게끔 도와줍니다.<br>
<br>

엄청난 흥미를 가지고 새 프로젝트를 시작해서는 시간이 지남에 따라 서서히 코드가 썩어가는 걸 보게됩니다. 일 년쯤 지나면 하루라도 빨리 냄새 나는 코드를 던져버리고 다음 프로젝트가 시작되만을 기다립니다.<br>
TDD 는 시간이 지남에 따라 코드에 대한 자신감을 점점 더 쌓아갈 수 있게 해줍니다. 테스트가 쌓여감에 따라 시스템의 행위에 대한 자신감을 더 많이 얻게 되죠. 설계를 개선해 나감에 따라 점점 더 많은 설계 변경이 가능해 집니다.<br>
<br>

켄트 벡은 우리가 반짝이는 눈빛으로 프로젝트를 시작할 때보다 프로젝트를 시작하고, 1년이 지난 후에 더 좋은 느낌을 갖게 되는 것이 목적이라고 합니다. TDD 는 이 목적을 달성할 수 있도록 도와줍니다.<br>

### TDD 는 초기 조건에 민감한가?

테스트를 취할 때 특정한 순서로 하면 매우 매끄럽게 잘 넘어가는 것 같습니다. 빨강/초록/리팩토링/빨강/초록/리팩토링. 똑같은 테스트를 다른 순서로 구현해 보면, 작은 단계로 나아갈 수 있는 방법이 전혀 없는 것처럼 보이기도 .<br>
<br>

테스트를 특정 순서로 구현하는 것이 다른 순서에 비해 수십배 더 빠르고, 쉽다는 것이 사실일까요? 단지 나의 구현 기술이 부족해서 그런 것은 아닐까요? 테스트를 특정 순서로 공략해야 한다는 것을 넌지시 알려주는 무언가가 테스트 속에 있는 것은 아닐까요? 만약 TDD 가 작은 차원에서 초기 조건에 민감하다면, 큰 차원에서는 예측 가능할까요?<br>
<br>

(미시시피 강의 작은 소용돌이들은 예측 불가능하지만, 강 어귀에서 대략 초당 2,000,000 세제곱 피트 정도의 물이 흐른다는 것은 믿을 수 있습니다)<br>

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

### 단언 우선

테스트를 작성할 때 단언(assert)은 언제 쯤 쓰는게 좋을까요?<br>
테스트를 작성할 때 먼저 단언을 쓰고 진행하는 것이 좋습니다.<br>

- 우리는 어떠한 시스템을 만들어낼 때, 무슨 일을 하는가에 대해 관심이 있습니다. 이때, 시스템이 어떻게 할 것인가에 대한 사용자 스토리를 먼저 작성합니다.
- 특정 기능을 개발할 때, 무슨 일을 하는가에 대해 관심이 있습니다. 이때, 기능이 완료되면 통과할 수 있는 테스트를 먼저 작성합니다.
- 테스트를 개발할 때, 무슨 일을 하는가에 대해 관심이 있습니다. 이때, 완료될 때 통과해야 할 단언부터 작성합니다.

<br>

우리가 구현에 대해 전혀 고려하지 않고 테스트만 작성할 때도 다양한 문제들을 해결할 수 있죠.<br>

- 테스트하고자 하는 기능이 어디에 속할까? 기존의 메소드를 수정해야 할까, 기존의 클래스에 새로운 메소드를 추가해야 할까, 아니면 이름이 같은 메소드를 새 클래스에 넣어야 할까?
- 메소드 이름은 무엇으로 해야 할까?
- 올바른 결과를 어떤 식으로 검사할 건가?
- 테스트가 제안하는 다른 테스트는 무엇이 있을까?

<br>

예를 들어 봅시다. 우리는 소켓을 통해 다른 시스템과 통신하려고 합니다.<br>
통신을 마친 후의 소켓은 닫혀 있고,<br>
소켓에서 문자열 `abc` 를 읽어와야 한다고 합시다.<br>

```java
@Test
void transaction_complete() {
    assertThat(reader.isClosed()).isTrue();
    assertThat(reply.contents()).isEqualTo("abc");
}
```

단언을 먼저 작성했습니다.<br>
reply 는 어디서 올까요? socket 입니다.<br>

```java
@Test
void transaction_complete() {
    Buffer reply = reader.contents();
    
    assertThat(reader.isClosed()).isTrue();
    assertThat(reply.contents()).isEqualTo("abc");
}
```

socket 은 어디에서 올까요? 서버에 접속할 때 생성됩니다.<br>

```java
@Test
void transaction_complete() throws IOException {
    Socket reader = new Socket("localhost", defaultPort());
    
    Buffer reply = reader.contents();

    assertThat(reader.isClosed()).isTrue();
    assertThat(reply.contents()).isEqualTo("abc");
}
```

그리고, 이 서버는 작업 전에 열어둬야 합니다.<br>

```java
@Test
void transaction_complete() throws IOException {
    Server writer = Server(defaultPort(), "abc");
    Socket reader = new Socket("localhost", defaultPort());
    
    Buffer reply = reader.contents();

    assertThat(reader.isClosed()).isTrue();
    assertThat(reply.contents()).isEqualTo("abc");
}
```

코드가 유효하지 않을지 몰라도 지금 중요한 것은 단언 우선의 테스트 코드 작성을 보았다는 것입니다.<br>
우리는 작은 단계로 아주 빠른 피드백을 받으며 테스트의 아웃라인을 만들었습니다.<br>
<br>

감사합니다.<br>

### 하나에서 여럿으로

객체 컬렉션(collection)을 다루는 연산은 어떻게 구현할까요?<br>
먼저, 컬렉션 없이 구현하고 그 다음에 컬렉션을 사용하는 것이 좋습니다.<br>
<br>

예를 들어, 숫자 배열의 합을 구하는 함수를 작성한다고 생각해 봅시다.<br>
하나로 시작합니다.<br>

```java
@Test
void sum_1() {
    assertThat(Operator.sum(5)).isEqualTo(5);
}
```

해당 테스트를 통과시키기 위해서 구현합니다.<br>

```java
public class Operator {
    public static int sum(int n) {
        return n;
    }
}
```

바로 값을 반환한다면 통과하겠죠?<br>
<br>

이제 리스트(`Lists.newArrayList(5, 7)`)를 넘겨 합산을 해보고 싶습니다.<br>
기존 메소드에서 List 를 받는 메소드를 추가로 생성합니다.<br>

```java
@Test
void sum_2() {
    assertThat(Operator.sum(5, Lists.newArrayList(5, 7))).isEqualTo(5);
}
```

```java
public class Operator {
    public static int sum(int n) {
        return n;
    }

    public static int sum(int n, List<Integer> numbers) {
        return n;
    }
}
```

그리고 해당 예시는 변화의 격리하기로 볼 수 있습니다.<br>
인자를 추가하면, 테스트 케이스에 영향을 주지 않으면서 자유롭게 구현을 변경할 수 있죠.<br>
<br>

이제 단일값 대신 컬렉션을 사용할 수 있습니다.<br>

```java
public static int sum(int n, List<Integer> numbers) {
    return numbers.stream().mapToInt(e -> e).sum();
}
```

이제 사용하지 않는 단일 인자를 제거하면 됩니다.<br>

```java
@Test
void sum_2() {
    assertThat(Operator.sum(Lists.newArrayList(5, 7))).isEqualTo(12);
}

public static int sum(List<Integer> numbers) {
    return numbers.stream().mapToInt(e -> e).sum();
}
```

그리고 유효하지 않은 메소드는 제거를 하거나, 제거가 불안하다면 Deprecated annotation 을 달아주면 다른 사람들이 인지할 수 있습니다.<br>

```java
@Deprecated
public static int sum(int n) {
    return n;
}
```

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

### Planetary orbital calculator

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

정의한 궤도의 기본 요소들은 역기점인 J2000 때 측정된 값입니다.<br>
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
<br>

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
<br>

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

지난 시간에 따라 변화한 궤도 요소들을 추출해야 하죠.<br>
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

### 진행하며 발생한 이슈

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


## Reference
[ATDD(Acceptance Test Driven Development)](https://velog.io/@windtrip/ATDDAcceptance-Test-Driven-Development#tdd-bdd-atdd-%EB%B9%84%EA%B5%90)

