---
layout  : wiki
title   : Test
summary :
date    : 2022-01-22 22:38:00 +0900
updated : 2022-02-04 20:10:00 +0900
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

## Test Interpretation
### **220127::trevari::member::application::MappingFinderTest**
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
(2) ServiceRunningContext 의 해지 가능 여부를 확인한다.  (해지 시도일: 2021-01-01)<br>
(3) 해지 가능 여부를 확인한다. (true, 가능)<br>

**생각**<br>
테스트 내에 가입 날짜에 대한 내용이 명시적으로 존재하지 않는다. (위로 스크롤 올려서 확인해야 함)<br>
DisplayName 에도 써놓은 거로 대체가 될 수 있는가?<br>
혹은 테스트 내에 명시적으로 집어넣는게 맞는가?<br>_

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
