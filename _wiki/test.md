---
layout  : wiki
title   : Test
summary :
date    : 2022-01-22 22:38:00 +0900
updated : 2022-03-18 14:00:00 +0900
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
(2) ServiceRunningContext 의 해지 가능 여부를 확인한다.  (가능 : True, 해지 시도일: 2021-01-01)<br>_

_**생각**<br>
테스트 내에 가입 날짜에 대한 내용이 명시적으로 존재하지 않는다. (위로 스크롤 올려서 확인해야 함)<br>
DisplayName 에도 써놓은 거로 대체가 될 수 있는가?<br>
혹은 테스트 내에 명시적으로 집어넣는게 맞는가?<br>_

### **220205::trevari::member::domain::GeneralServiceTerminationSpecificationTest**
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
@DisplayName("2021-01-01 00:00:00 가입 / 2021-01-03 03:33:00 해지")
void 환불기간이_지나고_당일_환불도_아니면_해지되지_않는다() {
    given(period.getImpossibleTerminatedAt()).willReturn(localDate(_2021, _1, _1));

    boolean satisfy = sut.isSatisfy(localDateTime(_2021, _1, _3, 3, 33));

    assertThat(satisfy).isFalse();
}
```
_**해석**<br>
(1) 누군가 해지 불가 시작일을 가져오려고 시도하면, 지정된 날짜를 반환한다. (2021-01-01)<br>
(2) ServiceRunningContext 의 해지 가능 여부를 확인한다.  (불가능 : False, 해지 시도일: 2021-01-03)<br>_

_**생각**<br>
테스트 내에 가입 날짜를 명시하면 테스트가 더 명확할 것 같다.<br>_

### **220206::trevari::member::domain::CommunityServiceRunningContextTerminateTest**
```java
@Test
void 서비스_기간에_해지를_시도하면_해지되지_않는다() {
    Elsa.freeze(firstMeetingAt.plusDays(6));
    
    // 주문 -- << ----해지---- 서비스 기간  ----->>
    // 6 --- << 13 ----(14)---- 20 ---- 4개월후 >>

    member.terminate();

    COMMUNITY_STATUS_OF(COMMUNITY_MEMBER, AVAILABLE);
}

private void COMMUNITY_STATUS_OF(Badge badge, ServiceRunningState status) {
    assertThat(member.getServiceRunningContextList().getItems().stream()
            .filter(i->badge.equals(i.getBadge())).allMatch(i->status.equals(i.getState()))).isTrue();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (첫 모임일의 6일 후)<br>
(2) 멤버를 해지합니다.<br>
(3) 뱃지의 존재 여부와 상태를 확인합니다. (COMMUNITY_MEMBER, AVAILABLE)<br>_

_**떠오르는 의문**<br>
(1) 테스트 코드만 확인하면, 첫 모임일의 6일 후가 서비스 기간 내에 포함되는지 어떻게 알 수 있는가?<br>
(2) COMMUNITY_STATUS_OF 라는 메소드 명은 제 역할을 하고 있는지?<br>
(3) 혹은 2번 메소드의 이름을 변경해야 하는 건 아닌지?<br>_

### **220207::trevari::member::domain::CommunityServiceRunningContextTerminateTest**
```java
@Test
void 보너스_기간에_해지를_시도하면_모든_커뮤니티서비스가_해지된다() {
    Elsa.freeze(purchasedAt.plusDays(1));

    // 주문 ---해지--- << ---- 서비스 기간  ----->>
    // 6 ---(7)--- << 13 ---- 20 ---- 4개월후 >>

    member.terminate();

    COMMUNITY_STATUS_OF(COMMUNITY_MEMBER, TERMINATED);
}

private void COMMUNITY_STATUS_OF(Badge badge, ServiceRunningState status) {
    assertThat(member.getServiceRunningContextList().getItems().stream().filter(i->badge.equals(i.getBadge())).allMatch(i->status.equals(i.getState()))).isTrue();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (첫 모임일의 1일 후)<br>
(2) 멤버를 해지합니다.<br>
(3) 뱃지의 존재 여부와 상태를 확인합니다. (COMMUNITY_MEMBER, TERMINATED)<br>_

_**떠오르는 의문**<br>
(1) 테스트 코드만 확인하면, 첫 모임일의 1일 후가 서비스 기간 내에 포함되는지 어떻게 알 수 있는가?<br>
(2) COMMUNITY_STATUS_OF 라는 메소드 명은 제 역할을 하고 있는지?<br>
(3) 혹은 메소드 명을 변경해야 하는 건 아닌지?<br>_

### **220208::trevari::wallet::domain::TicketExpireTest**
```java
@Test
void 티켓_만료일_이후엔_만료될_티켓이다() {
    Elsa.freeze(EXPIRE_DATE.plusDays(1));
    TICKET = new Ticket(null, null, EXPIRE_DATE);

    // |-----티켓만료-----만료여부확인-----|
    // |-------20-----------21--------|
    assertThat(TICKET.willBeExpired()).isTrue();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (티켓 만료일 하루 뒤, 21일)<br>
(2) 티켓을 생성합니다. (만료일 지정, 20일)<br>
(3) 티켓이 만료될 티켓인지 확인합니다. (True)<br>_

### **220209::trevari::wallet::domain::TicketExpireTest**
```java
@Test
void 티켓_만료일_이전엔_만료될_티켓이_아니다() {
    Elsa.freeze(EXPIRE_DATE.minusDays(1));
    TICKET = new Ticket(null, null, EXPIRE_DATE);

    // |-----만료여부확인-----티켓만료-----|
    // |-------19-----------20--------|
    assertThat(TICKET.willBeExpired()).isFalse();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (티켓 만료일 하루 전, 19일)<br>
(2) 티켓을 생성합니다. (만료일 지정, 20일)<br>
(3) 티켓이 만료될 티켓인지 확인합니다. (False)<br>_

### **220210::trevari::wallet::domain::TicketExpireTest**
```java
@Test
void 티켓_만료일이_null_이면_만료될_티켓이_아니다() {
    Elsa.freeze(EXPIRE_DATE);
    TICKET = new Ticket(null, null, null);

    assertThat(TICKET.willBeExpired()).isFalse();
}
```
_**해석**<br>
(1) 시점을 고정합니다. (티켓 만료일, 20일)<br>
(2) 티켓을 생성합니다. (만료일 null)<br>
(3) 티켓이 만료될 티켓인지 확인합니다. (False)<br>_

_**생각**<br>
(1) 시점 고정 로직(freeze)은 없어져도 될 것 같다. 해당 테스트에서 관심있는 부분이 아니기 때문에.<br>_

### **220211::trevari::wallet::domain::TicketsExpireTest**
```java
@Test
void 만료일이_지난_티켓들을_가져온다() {
    Elsa.freeze(EXPIRE_DATE_20.plusDays(1));

    Ticket TICKET1 = new Ticket("KEY1", null, EXPIRE_DATE_20);
    Ticket TICKET2 = new Ticket("KEY2", null, EXPIRE_DATE_20);
    Ticket TICKET3 = new Ticket("KEY3", null, EXPIRE_DATE_22);

    TICKETS.add(TICKET1);
    TICKETS.add(TICKET2);
    TICKETS.add(TICKET3);

    assertThat(TICKETS.size()).isEqualTo(3);

    // |-----티켓1,2만료일-----만료여부확인-----티켓3만료일-----|
    // |-------20-------------21--------------22--------|
    assertThat(TICKETS.expirableTickets().size()).isEqualTo(2);
}
```
_**해석**<br>
(1) 시점을 고정합니다. (21일)<br>
(2) 티켓을 생성합니다. (TICKET1 만료일 : 20일, TICKET2 만료일 : 20일, TICKET3 만료일 : 22일)<br>
(3) 전체 티켓의 개수를 확인합니다. (3개)<br>
(4) 만료 티켓의 개수를 확인합니다. (2개)<br>_

### **220212::trevari::wallet::domain::TicketsExpireTest**
```java
@Test
void 만료일이_지난_티켓들을_가져온다_expiryDate_null_포함() {
    Elsa.freeze(EXPIRE_DATE_20.plusDays(1));

    Ticket TICKET1 = new Ticket("KEY1", null, EXPIRE_DATE_20);
    Ticket TICKET2 = new Ticket("KEY2", null, null);
    Ticket TICKET3 = new Ticket("KEY3", null, EXPIRE_DATE_22);

    TICKETS.add(TICKET1);
    TICKETS.add(TICKET2);
    TICKETS.add(TICKET3);

    assertThat(TICKETS.size()).isEqualTo(3);

    // |-----티켓1만료일-----만료여부확인-----티켓3만료일-----|
    // |-------20-------------21--------------22--------|
    assertThat(TICKETS.expirableTickets().size()).isEqualTo(1);
}
```
_**해석**<br>
(1) 시점을 고정합니다. (21일)<br>
(2) 티켓을 생성합니다. (TICKET1 만료일 : 20일, TICKET2 만료일 : null, TICKET3 만료일 : 22일)<br>
(3) 전체 티켓의 개수를 확인합니다. (3개)<br>
(4) 만료 티켓의 개수를 확인합니다. (1개)<br>_

_**생각**<br>
(1) 전체 티켓의 개수를 확인할 필요가 없다고 생각한다.<br>
(2) 하지만, 총 몇 개의 티켓에서 이 정도를 가져왔다. 라는 걸 알려주려면 필요하려나?<br>_

### **220213::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void addTicketAndFind() {
    AddTicketCommand command = AddTicketCommandFactory.create("KEY", TicketProps.empty(), ANY_EXPIRY_DATE);

    sut.execute(command);

    assertThat(sut.has(command.newTicket())).isTrue();
}
```
_**해석**<br>
(1) 티켓 추가를 위한 명령을 생성합니다. (AddTicketCommand)<br>
(2) 지갑에 티켓 추가 명령을 실행합니다. (AddTicket)<br>
(3) 지갑에 추가된 티켓이 존재하는지 확인합니다. (True)<br>_

### **220214::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void when_add_ticket_ignore_same_key() {
    AddTicketCommand command1 = AddTicketCommandFactory.create("KEY1", TicketProps.empty(), ANY_EXPIRY_DATE);
    AddTicketCommand command2 = AddTicketCommandFactory.create("KEY2", TicketProps.empty(), ANY_EXPIRY_DATE);
    AddTicketCommand command3 = AddTicketCommandFactory.create("KEY2", TicketProps.empty(), ANY_EXPIRY_DATE);


    assertThat(sut.hasNotTickets()).isTrue();

    sut.execute(command1);
    sut.execute(command2);
    sut.execute(command3);

    assertThat(sut.getSizeOfTicket()).isEqualTo(2);
}
```
_**해석**<br>
(1) 티켓 추가를 위한 명령을 각각 생성하며, 중복된 키가 있도록 합니다. (command1-KEY1, command2-KEY2, command3-KEY2)<br>
(2) 티켓이 없는지 확인합니다. (True)<br>
(3) 지갑에 티켓 추가 명령을 실행합니다. (command1-KEY1, command2-KEY2, command3-KEY2)<br>
(4) 추가된 티켓 수를 확인합니다. (2개, 중복된 티켓 제외)<br>_

### **220215::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}


@Test
void terminate() {
    String key1 = "KEY 1";
    String key2 = "KEY 2";

    sut.execute(AddTicketCommandFactory.create(key1, TicketProps.empty(), ANY_EXPIRY_DATE));
    sut.execute(AddTicketCommandFactory.create(key2, TicketProps.empty(), ANY_EXPIRY_DATE));
    assertThat(sut.getSizeOfTicket()).isEqualTo(2);

    sut.execute(terminateWithTargetPredicate((t1) -> key2.equals(t1.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(1);

    sut.execute(terminateWithTargetPredicate((t) -> key1.equals(t.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(0);
    assertThat(sut.hasNotTickets()).isTrue();
}


private TerminateTicketCommand terminateWithTargetPredicate(TicketFilter ticketFilter) {
    return TerminateTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}

```
_**해석**<br>
(1) 티켓 추가를 위한 명령을 실행합니다. (Ticket's key : KEY 1, KEY 2)<br>
(2) 티켓 개수를 확인합니다. (2개)<br>
(3) 동일한 키를 가진 티켓을 해지합니다. (KEY 2)<br>
(4) 티켓 개수를 확인합니다. (1개)<br>
(5) 동일한 키를 가진 티켓을 해지합니다. (KEY 1)<br>
(6) 티켓 개수를 확인합니다. (0개)<br>
(7) 보유한 티켓이 없는지 확인합니다. (True)<br>_

### **220216::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void terminateWithAll() {
    sut.execute(AddTicketCommandFactory.create("KEY 1", TicketProps.empty(), ANY_EXPIRY_DATE));

    TerminateTicketCommand command = terminateWithTargetPredicate(TicketFilter.ALL);

    sut.execute(command);

    assertThat(sut.hasNotTickets()).isTrue();

}

private TerminateTicketCommand terminateWithTargetPredicate(TicketFilter ticketFilter) {
    return TerminateTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 생성합니다. (KEY 1)<br>
(2) 티켓 제거 명령을 만듭니다. (모든 티켓)<br>
(3) 티켓 제거 명령을 실행합니다. <br>
(4) 티켓이 존재하지 않는지 확인합니다. (True)<br>_

### **220217::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void expireTicket() {

    String key1 = "KEY 1";
    String key2 = "KEY 2";

    sut.execute(AddTicketCommandFactory.create(key1, TicketProps.empty(), ANY_EXPIRY_DATE));
    sut.execute(AddTicketCommandFactory.create(key2, TicketProps.empty(), ANY_EXPIRY_DATE));
    assertThat(sut.getSizeOfTicket()).isEqualTo(2);

    sut.execute(expireWithTargetPredicate((t1) -> key2.equals(t1.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(1);

    sut.execute(expireWithTargetPredicate((t) -> key1.equals(t.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(0);
    assertThat(sut.hasNotTickets()).isTrue();
}

private ExpireTicketCommand expireWithTargetPredicate(TicketFilter ticketFilter) {
    return ExpireTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 생성합니다. (KEY 1, KEY 2)<br>
(2) 티켓을 지갑에 추가합니다.<br>
(3) 지갑 내 티켓의 총 개수를 확인합니다 (2개)<br>
(4) 지갑 내 티켓을 만료시킵니다. (KEY 2)<br>
(5) 티켓의 개수를 확인합니다. (1개)<br>
(6) 지갑 내 티켓을 만료시킵니다. (KEY 1)<br>
(7) 티켓의 개수를 확인합니다. (0개)<br>
(8) 티켓이 존재하지 않는지 확인합나다. (True)<br>_

_**생각**<br>
(1) 이게 만료로 인해 제거된 건지는 어떻게 알 수 있을까? expireWithTargetPredicate? 헷갈릴 수도 있을 것 같다. <br>_

### **220218::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void expireWithAll() {
    sut.execute(AddTicketCommandFactory.create("Ket 1", TicketProps.empty(), ANY_EXPIRY_DATE));

    ExpireTicketCommand command = expireWithTargetPredicate(TicketFilter.ALL);

    sut.execute(command);

    assertThat(sut.hasNotTickets()).isTrue();
}

private ExpireTicketCommand expireWithTargetPredicate(TicketFilter ticketFilter) {
    return ExpireTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 지갑에 추가합니다. (Ket 1, 오타인 듯)<br>
(2) 모든 티켓에 대해 만료시키는 명령을 생성합니다.<br>
(3) 지갑에서 만료 명령을 실행합니다.<br>
(4) 지갑에 티켓이 없는지 확인합니다.<br>_

_**생각**<br>
(1) 키 네임에서 오타가 하나 있었는데, 그걸 발견했을 때 저걸 고치는 게 맞는 걸까?<br>
(2) 저거 하나만 배포하는 게 맞을까?<br>
(3) 아니면 다른 거 나갈 때 같이 포함해서?<br>
(4) 아니면 아예 냅둬도 될 까? 동작하는 기능엔 문제가 없으니?<br>_

### **220219::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void useTicketTest() {

    String key1 = "KEY 1";
    String key2 = "KEY 2";

    sut.execute(AddTicketCommandFactory.create(key1, TicketProps.empty(), ANY_EXPIRY_DATE));
    sut.execute(AddTicketCommandFactory.create(key2, TicketProps.empty(), ANY_EXPIRY_DATE));
    assertThat(sut.getSizeOfTicket()).isEqualTo(2);

    sut.execute(useWithTargetPredicate((t1) -> key2.equals(t1.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(1);

    sut.execute(useWithTargetPredicate((t) -> key1.equals(t.getKey())));
    assertThat(sut.getSizeOfTicket()).isEqualTo(0);
    assertThat(sut.hasNotTickets()).isTrue();
}

private UseTicketCommand useWithTargetPredicate(TicketFilter ticketFilter) {
    return UseTicketCommand.builder()
            .withTargetPredicate(ticketFilter)
            .build();
}
```
_**해석**<br>
(1) 티켓을 지갑에 추가합니다. (KEY 1, KEY 2)<br>
(2) 지갑 내 티켓 개수를 확인합니다. (2개)<br>
(3) 티켓을 사용 처리합니다. (KEY 2)<br>
(4) 지갑 내 티켓 개수를 확인합니다. (1개)<br>
(5) 티켓을 사용 처리합니다. (KEY 1)<br>
(6) 지갑 내 티켓 개수를 확인합니다. (0개)<br>
(7) 지갑 내 티켓이 존재하지 않는지 확인합니다. (True)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 건 어떨까?<br>
(3) requestNotFound(inavalidWalletId) 와 같은 형태처럼<br>_

### **220220::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void 새롭게_생성한_지갑은_삭제되지_않은_상태다() {
    Wallet sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);

    boolean usable = sut.isDeleted();

    assertThat(usable).isFalse();
}
```
_**해석**<br>
(1) 지갑을 생성합니다.<br>
(2) 지갑이 삭제된 상태인지 확인합니다. (False)<br>_

### **220221::trevari::wallet::domain::WalletTest**
```java
private Wallet sut;

@BeforeEach
void setUp() {
    sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);
}

@Test
void delete는_지갑을_삭제된_상태로_만든다() {
    Wallet sut = Wallet.of(ANY_WALLET_ID, ANY_USER_ID);

    sut.delete();

    assertThat(sut.isDeleted()).isTrue();
}
```
_**해석**<br>
(1) 지갑을 생성합니다.<br>
(2) 지갑을 제거합니다.<br>
(3) 지갑이 제거된 상태인지 확인합니다. (True)<br>_

### **220222::trevari::wallet::api::WalletApiControllerTest**
```java
@InjectMocks
WalletApiController sut;

@Test
void getWallet() {
    given(walletService.findBy(WALLET_ID_VALUE)).willReturn(Optional.of(wallet));

    sut.getWallet(WALLET_ID_VALUE);

    verify(walletService).findBy(WALLET_ID_VALUE);
    verify(walletResponseConverter).convertBy(wallet);
}
```
_**해석**<br>
(1) walletId 를 통해 wallet 을 가져올 때, 미리 정의한 wallet 을 반환합니다.<br>
(2) walletId 를 통해 지갑을 가져옵니다. (이때, 미리 정의한 wallet 을 반환하도록 합니다)<br>
(3) walletService 에서 findBy 를 호출했는지 확인합니다.<br>
(4) walletResponseConverter 에서 convertBy 를 호출했는지 확인합니다.<br>_

_**생각**<br>
(1) 이것이 화이트박스 테스트인가 보다. (내부 동작을 검사)<br>
(2) 너무 개발자스러운 테스트라 생각했다.<br>
(3) 뭔가 좀 더 일상적인 용어로 설명할 수 있을 정도의 테스트면 어떨까?<br>_

### **220223::trevari::wallet::api::WalletApiControllerTest**
```java
@InjectMocks
WalletApiController sut;

@Test()
@DisplayName("Wallet 이 없다면 예외를 던진다.")
void when_wallet_is_none_service_throws_exception() {
    given(walletService.findBy(WALLET_ID_VALUE)).willReturn(Optional.empty());

    assertThatThrownBy(() -> sut.getWallet(WALLET_ID_VALUE)).isInstanceOf(WalletNotFoundException.class);

}
```
_**해석**<br>
(1) walletId 를 통해 wallet 을 가져올 때, 빈 wallet 을 반환하도록 합니다.<br>
(2) walletId 를 통해 wallet 을 가져올 때 지갑이 존재하지 않는다는 예외가 발생하는지 확인합니다.<br>_

### **220224::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[400] In getWallet, When Wallet Id is invalid, Http State is 400")
void _400_getWallet_for_walletId_is_invalid_state_is_400() throws Exception {
    mvc.perform(get(WALLETS_URL + "/{walletId}", "this is string")
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isBadRequest())
            .andExpect(jsonOf(ErrorResponse.with(400, "Invalid WalletId.")));
    //hints Resolved Exception:
}
```
_**해석**<br>
(1) api 요청을 합니다. (유효하지 않은 요청, '/apis/wallets/this is string')<br>
(2) http status 가 올바른지 확인합니다. (BadRequest)<br>
(3) http code 가 올바른지 확인합니다. (400)<br>
(4) http reason 가 올바른지 확인합니다. (Invalid WalletId.)<br>_

### **220225::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[404] In getWallet, When Wallet is None, Http State is 404")
void _404_getWallet_when_wallet_is_none_state_is_404() throws Exception {
    given(walletService.findBy(anyLong())).willReturn(Optional.empty());

    mvc.perform(get(WALLETS_URL + "/{walletId}", 1)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNotFound())
            .andExpect(jsonOf(ErrorResponse.with(404, WalletNotFoundException.withWalletId(1L).getMessage())));
}
```
_**해석**<br>
(1) wallet 을 가져오려 하면, 빈 값을 반환하도록 합니다.
(2) api 요청을 합니다. (존재하지 않는 walletId, '/apis/wallets/1')<br>
(3) http status 가 올바른지 확인합니다. (Not Found)<br>
(4) http code 가 올바른지 확인합니다. (404)<br>
(5) http reason 가 올바른지 확인합니다. (Wallet(1) is Not found)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 건 어떨까?<br>
(3) requestNotFound(inavalidWalletId) 와 같은 형태처럼<br>_

### **220226::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[500] In getWallet")
void _500_getWallet() throws Exception {
    doThrow(new RuntimeException("some message")).when(walletService).findBy(anyLong());

    mvc.perform(get(WALLETS_URL + "/{walletId}", 1)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isInternalServerError())
            .andExpect(jsonOf(ErrorResponse.with(500, "some message")));
}
```
_**해석**<br>
(1) wallet 을 가져오려 하면, 예외를 던지도록 합니다. (some message)<br>
(2) api 요청을 합니다. (/apis/wallets/1)<br>
(3) http status 가 올바른지 확인합니다. (Internal Server Error)<br>
(4) http code 가 올바른지 확인합니다. (500)<br>
(5) http reason 가 올바른지 확인합니다. (some message)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 것도 괜찮을 것 같다. (ex. requestInternalServerError())<br>_

_**doThrow**<br>
(1) 이번 테스트 케이스를 통해 doThrow 라는 메소드를 처음 알았다.<br>
(2) 테스트 시 특정 동작에서 임의의 예외를 던지도록 지정하는 메소드임.<br>_

### **220227::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[200] In getWallet ")
void _200_getWallet() throws Exception {
    given(walletService.findBy(ANY.WALLET_ID_VALUE)).willReturn(Optional.of(ANY.WALLET));

    mvc.perform(MockMvcRequestBuilders.get(WALLETS_URL + "/{walletId}", ANY.WALLET_ID_VALUE)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isOk())
            .andExpect(content().string(objectMapper.writeValueAsString(walletResponseConverter.convertBy(ANY.WALLET))));
}
```
_**해석**<br>
(1) wallet 을 가져오려 하면, 미리 정의한 wallet 을 반환합니다.<br>
(2) api 요청을 합니다. (/apis/wallets/{walletId})<br>
(3) http status 가 올바른지 확인합니다. (Ok)<br>
(4) http response content 가 올바른지 확인합니다. (미리 정의한 wallet)<br>_

_**생각**<br>
(1) 전달하는 walletId 나 다른 메타 데이터(contentType, accept, queryParam)는 테스트를 보는 사람 입장에선 딱히 볼 필요가 없다 생각된다.<br>
(2) 다른 메소드의 형태로 정의해 호출하는 것도 괜찮을 것 같다. (ex. requestOk())<br>_

### **220228::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[500] In findBy")
void _500_findBy() throws Exception {
    doThrow(new RuntimeException("some message")).when(walletService).findBy(ANY.USER_ID);

    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", ANY.USER_ID.getId())
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isInternalServerError())
            .andExpect(jsonOf(ErrorResponse.with(500, "some message")));;
}
```
_**해석**<br>
(1) userId 로 wallet 을 가져오려 하면, 예외를 던집니다. (Runtime exception, "some message")<br>
(2) api 요청을 합니다. (/apis/wallets?f=find&user={userId})<br>
(3) http status 가 올바른지 확인합니다. (Internal server error)<br>
(3) http code 가 올바른지 확인합니다. (500)<br>
(4) http response 가 올바른지 확인합니다. (some message)<br>_

_**해당 테스트 목적**<br>
(1) Runtime exception 이 감지되면 Internal server error (code: 500) 이 발생한다는 것을 표현한다 생각된다.<br>_

### **220301::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[400] In findBy, When user id is None, Http State is 400 ")
void _400_findBy_when_user_id_parameter_is_empty_state_is_400() throws Exception {
    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", StringUtils.EMPTY)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isBadRequest())
            .andExpect(jsonOf(ErrorResponse.with(400, "Invalid UserId.")));
}
```
_**해석**<br>
(1) api 요청을 합니다. ("/apis/wallets?f=find&user={userId}", userId is empty)<br>
(2) http status 가 일치하는지 확인합니다. (Bad Request)<br>
(3) http code 가 일치하는지 확인합니다. (400)<br>
(4) http response message 가 올바른지 확인합니다. (Invalid UserId)<br>_

_**해당 테스트 목적**<br>
(1) 요청 시 userId Parameter 값이 비어있다면, Bad Request(400, Invalid UserId) 로 응답한다는 것을 알리기 위해 존재한다고 생각한다.<br>_

### **220302::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[404] In findBy, When Wallet is None, Http State is 404 ")
void _404_findBy_when_wallet_is_none_state_is_404() throws Exception {
    given(walletService.findBy(ANY.USER_ID)).willReturn(Optional.empty());

    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", ANY.USER_ID.getId())
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNotFound())
            .andExpect(jsonOf(ErrorResponse.with(404, WalletNotFoundException.withMessage("Wallet is Not found. UserId is " + ANY.USER_ID.getId()).getMessage())));
}
```
_**해석**<br>
(1) userId 로 wallet 을 가져올 때, 빈 값을 반환합니다.<br>
(2) api 요청을 합니다. ("/apis/wallets?f=find&user={userId}", Returned wallet is empty)<br>
(3) http status 가 일치하는지 확인합니다. (Not Found)<br>
(4) http code 가 일치하는지 확인합니다. (404)<br>
(5) http response message 가 올바른지 확인합니다. (Wallet is Not found. UserId is {userId})<br>_

_**해당 테스트 목적**<br>
(1) 요청 시 userId 에 일치하는 wallet 이 없으면 Not found 로 응답한다는 것을 알리는 목적이라 생각된다.<br>_

### **220303::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[200] In findBy")
void _200_findByUser() throws Exception {
    given(walletService.findBy(ANY.WALLET.getUserId())).willReturn(Optional.of(ANY.WALLET));

    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("user", ANY.WALLET.getUserId().getId())
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isOk())
            .andExpect(content().json(objectMapper.writeValueAsString(walletResponseConverter.convertBy(ANY.WALLET))));
}
```
_**해석**<br>
(1) userId 로 지갑을 가져올 때, 지정된 지갑을 반환합니다.<br>
(2) api 요청을 합니다. ("/apis/wallets?f=find&user={userId}")<br>
(3) http status 가 일치하는지 확인합니다. (Ok)<br>
(4) http code 가 일치하는지 확인합니다. (200)<br>
(5) http response content 가 올바른지 확인합니다. (지정된 지갑 데이터)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>
(2) 해당 테스트 코드에서는 "/apis/wallets?f=find&user={userId}" 로 요청 시 지갑 데이터를 반환해 준다.<br>_

### **220304::trevari::wallet::api::WalletApiControllerMVCTest**
```java
public static final String WALLETS_URL = "/apis/wallets";

@Autowired
MockMvc mvc;

@Test
@DisplayName("[400] In findUserIdByMeetingId, When meetingId id is None, Http State is 400 ")
void _400_findUserIdByMeetingId_when_meeting_id_parameter_is_empty_state_is_400() throws Exception {
    mvc.perform(get(WALLETS_URL)
                    .param("f", "find")
                    .param("meetingId", StringUtils.EMPTY)
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isBadRequest())
            .andExpect(jsonOf(ErrorResponse.with(400, "Invalid UserId.")));
}
```
_**해석**<br>
(1) api 요청을 합니다. ("/apis/wallets?f=find&meetingId={meetingId}&v=0.1.0", meetingId is empty)<br>
(2) http status 가 일치하는지 확인합니다. (Bad Request)<br>
(3) http code 가 일치하는지 확인합니다. (400)<br>
(4) http response message 가 올바른지 확인합니다. (Invalid UserId)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>
(2) 해당 테스트 코드에서는 아래 형식으로 요청 시 에러(code=400, message=Invalid UserId)를 반환해 준다.<br>
URL = "/apis/wallets?f=find&meetingId={meetingId}&v=0.1.0"<br>
MetaData = "contentType=application-json, accept=application-json"<br>_

_**이상한 점**<br>
(1) meetingId 가 empty 지만, 실제 내보내는 에러 메시지는 Invalid UserId 이다.<br>
(2) Invalid MeetingId 로 수정되어야 한다 생각된다.<br>_

### **220305::trevari::wallet::api::DeleteWalletApiControllerTest**
```java
@Test
void _204_successful_deletion(@Mock Wallet wallet) throws Exception {
    given(walletService.findBy(UserId.of("user_id"))).willReturn(Optional.of(wallet));

    mvc.perform(delete("/apis/wallets/users/{user}", "user_id")
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNoContent());
}
```
_**해석**<br>
(1) 지갑 삭제 요청 시 미리 정의된 지갑을 반환합니다.<br>
(2) 지갑 삭제를 요청합니다. ("/apis/wallets/users/{user}?v=0.1.0")<br>
(3) 상태가 일치한 지 확인합니다. (No Content)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>_

_**No Content**<br>
(1) 성공적으로 처리했지만 컨텐츠를 제공하지는 않는다. 일반 사용자가 볼 일은 거의 드물며 처리 결과만 중요한 API 요청 등에서 주로 사용한다.<br>_

_**약간의 의문**<br>
(1) 삭제 요청에 성공했을 때 성공 여부를 반환하는게 맞지 않나?<br>
(2) 동시에 htpp code 는 200 으로 반환하는게 맞다 생각된다.<br>_

### **220306::trevari::wallet::api::DeleteWalletApiControllerTest**
```java
@Test
void _404_WalletNotFoundException(@Mock Wallet wallet) throws Exception {
    doThrow(WalletNotFoundException.class).when(deleteWalletService).deleteWallet(wallet);

    mvc.perform(delete("/apis/wallets/users/{user}", "user_id")
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON)
                    .queryParam("v", "0.1.0"))

            .andExpect(status().isNotFound());
}
```
_**해석**<br>
(1) 지갑 삭제 요청 시 예외를 던집니다. (WalletNotFoundException)<br>
(2) 지갑 삭제를 요청합니다. ("/apis/wallets/users/{user}?v=0.1.0")<br>
(3) 상태가 일치한 지 확인합니다. (Not Found)<br>_

_**해당 테스트 목적**<br>
(1) 코드에 명시된 URL, Parameters, Meta data 의 조합으로 요청을 했을 때, 어떤 결과가 나오는 지 알려주는 용도인 것 같다.<br>_

### **220307::trevari::wallet::consumer::WalletFinderTest**
```java
@Test
void walletByUserId(@Mock Wallet wallet) {
    given(repository.findByUserId(USER_ID)).willReturn(wallet);
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);

    Wallet actual = sut.walletByUserId(USER_ID);

    assertThat(actual).isInstanceOf(Wallet.class);
}
```
_**해석**<br>
(1) 레파지토리에서 지갑을 가져오려 할 때, 지정된 지갑을 반환합니다.<br>
(2) Wallet Finder 를 정의합니다.<br>
(3) Wallet Finder 를 통해 지갑을 가져옵니다.<br>
(4) 가져온 지갑이 Wallet 클래스인지 확인합니다.<br>_

_**내 생각**<br>
(1) 이미 특정 지갑을 반환하라고 정의했으니 반환하는 값에 대한 비교가 의미없다고 생각됨.<br>
(2) 이런 Application 같은 경우에는 WhiteBox 테스트를 통해 특정 메소드를 호출하는 것을 확인하는게 좋겠다.<br>
(3) 이때는 Mockito.verify() 메소드가 사용될 것이다.<br>_

### **220308::trevari::wallet::consumer::AddServiceTest**
```java
@InjectMocks
AddService sut;

@BeforeEach
void setUp() {
    anyServices = new ArrayList<>();
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, null);
    ANY_PROPERTIES.put(MEMBER_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(MEMBERSHIP_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(SERVICE_ID_PROPERTIES_NAME, "1L");
    ANY_CHANGED_SERVICE.setServiceId(ANY_SERVICE_ID);
    ANY_CHANGED_SERVICE.setBadge(null);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
}

@Test
void MEETING_ID_가_없는_독서모임_서비스_예외_처리() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, null);
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, ANY_SERVICE_PERIOD_PROPERTIES);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);

    assertThatThrownBy(() -> sut.add(command));
}
```
**해석**<br>
해당 테스트 코드는 티켓을 추가하는 서비스에서 독서모임 티켓 추가 명령 시 _MEETING_ID_PROPERTIES_ 가 없으면 예외를 내보내는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
해당 테스트를 보자마자 숨이 턱 막혔습니다.<br>
왜 그럴까요?<br>
일단.. 알아야 할 정보가 너무 많습니다.<br>
그래서 테스트 코드 내에서 필요한 데이터를 추가해 주는 부분이 명시적이지 못하다고 생각합니다.<br>
이름 자체가 _MEETING ID가 없는 독서모임 서비스 예외 처리_ 이기 때문이죠.<br>
이런 경우에는 메소드를 따로 정의하는 것이 어떨까 생각합니다.<br>
<br>
_ex) MEETING_ID_IS_NULL();_<br>
<br>
그리고 다른 프로퍼티 및 데이터들에 대해서는 다른 코드와 비교하여 공통적인 부분만 따로 메소드로 빼거나 _setUp_ 에서 정의하는 게 좋을 것 같습니다.<br>
그러면 더욱 가독성이 좋은 테스트 코드가 될 것이라는 생각입니다.<br>

### **220309::trevari::wallet::consumer::AddServiceTest**
```java
@InjectMocks
AddService sut;

@BeforeEach
void setUp() {
    anyServices = new ArrayList<>();
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, null);
    ANY_PROPERTIES.put(MEMBER_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(MEMBERSHIP_ID_PROPERTIES_NAME, "1L");
    ANY_PROPERTIES.put(SERVICE_ID_PROPERTIES_NAME, "1L");
    ANY_CHANGED_SERVICE.setServiceId(ANY_SERVICE_ID);
    ANY_CHANGED_SERVICE.setBadge(null);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
}

@Test
void SERVICE_PERIOD_가_없는_독서모임_서비스_예외_처리() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, "asdasdasdasd");
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, null);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);

    assertThatThrownBy(() -> sut.add(command));
}
```
**해석**<br>
해당 테스트 코드는 티켓을 추가하는 서비스에서 독서모임 티켓 추가 명령 시 _SERVICE_PERIOD_ 가 없으면 예외를 내보내는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
해당 테스트 코드에서 알아야하는 정보가 너무 많습니다. 그저 SERVICE_PERIOD 가 없을 때 예외 처리되는 것 을 보고싶을 뿐인데 말이죠.<br>
이 테스트 코드에서 얻어야 하는 정보는 _(1) SERVICE_PERIOD 가 유효하지 않은 것과 (2) 그 상황에서 add 명령을 시도했을 때, 예외가 발생한다는 것_ 입니다.<br>
코드를 수정해 봤습니다.<br>

```java
@Test
void SERVICE_PERIOD_가_없는_독서모임_서비스_예외_처리() {
    SET_DATA_FOR_INVALID_SERVICE_PERIOD();

    assertThatThrownBy(() -> sut.add(command));
}

private void SET_DATA_FOR_INVALID_SERVICE_PERIOD() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, "asdasdasdasd");
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, null);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);
}
```

메소드 _SET_DATA_FOR_INVALID_SERVICE_PERIOD_ 를 통해 어떤 일을 하는 코드인지 더욱 명시적으로 표현해 봤습니다.<br>
다른 테스트 코드와의 공통점을 찾아 공통 메소드로 분리하는 것도 좋은 방법일 것 같다는 생각입니다.<br>

### **220310::trevari::wallet::consumer::AddServiceTest**
```java
@InjectMocks
AddService sut;

@Test
void 티켓_추가() {
    ANY_PROPERTIES.put(BADGE_PROPERTIES_NAME, BOOK_CLUB_BADGE_NAME);
    ANY_PROPERTIES.put(MEETING_ID_PROPERTIES_NAME, "asdasdasdasd");
    ANY_PROPERTIES.put(SERVICE_PERIOD_PROPERTIES_NAME, ANY_SERVICE_PERIOD_PROPERTIES);
    ANY_CHANGED_SERVICE.setProperties(ANY_PROPERTIES);
    ANY_CHANGED_SERVICE.setBadge(Badge.BOOK_CLUB_MEMBER);
    anyServices.add(ANY_CHANGED_SERVICE);

    given(repository.findById(ANY_WALLET_ID)).willReturn(wallet);
    given(command.getWalletId()).willReturn(ANY_WALLET_ID);
    given(command.getServices()).willReturn(anyServices);

    sut.add(command);

    verify(wallet).execute(any(AddTicketCommand.class));
}
```
**해석**<br>
해당 테스트 코드는 티켓을 추가하는 서비스에서 티켓 추가 명령이 호출된다는 것을 알리는 테스트 코드입니다.<br>

**생각**<br>
티켓을 추가할 때 필요한 PROPERTIES 에 대해 추가하는 것은 보여줘도 된다 생각합니다.<br>
하지만 ANY_CHANGED_SERVICE? 왜 추가하는 서비스에서 변경하는 서비스를 알아야 하지?<br>
의문이 생기네요..<br>
<br>
행하는 역할에 대해서는 따로 이견이 없지만, 상수명이 헷갈립니다.<br>
차라리, 상수명을 아래처럼 변경하는 것이 더 좋을 것 같습니다.<br>
ANY_CHANGED_SERVICE -> ANY_SERVICE<br>
<br>

### **220311::trevari::wallet::consumer::CreateServiceTest**
```java
@InjectMocks
CreateService sut;

@Test
void 지갑이_이미있다면_생성하지않는다() {
    UserId userId = UserId.of("Tester");
    CreateCommand command = CreateCommand.of(userId);

    given(repository.existsByUserId(userId)).willReturn(true);

    assertThatThrownBy(() -> sut.create(command)).isInstanceOf(EntityAlreadyExistsException.class);

    verify(repository, never()).save(any(Wallet.class));
}
```
**해석**<br>
지갑을 추가할 때, 해당하는 유저의 지갑이 이미 있다면 예외를 던지는 테스트 코드입니다.<br>

**생각**<br>
딱히 뭐라고 할 코드는 아닙니다.<br>
하지만 우리가 집중하고자 하는 방향에 좀 더 초점을 맞출 수 있도록 하려면 어떻게 해야할까요?<br>
<br>
두 가지가 있습니다.<br>
(1) 딱히 알아도 되지 않을 정보를 빼고<br>
(2) 알고싶은 정보를 추가합니다.<br>
<br>
첫 번째, 알아도 되지 않을 정보는 _userId 와 verify_ 부분인 것 같습니다.<br>
해당 유저에 대한 지갑 생성 명령 시 _이미 있는 유저인가? 에 대해서 이미 있다._ 라고 답하는 것만 있으면 되고<br>
_이미 있는 유저이기 때문에 예외를 발생_ 시키는 것을 알면 됩니다.<br>
<br>
두 번째, 알고싶은 정보는 _어떤 예외를 던지는 지와 그 예외에서 어떤 메시지를 던지는 지_ 알고 싶습니다.<br>
어떤 예외를 던지는 지는 이미 적혀있습니다. 하지만, 이 예외에서 어떤 메시지를 던지는 지는 알 수 없습니다.<br>
추가해 주면 좋겠습니다.<br>
```java
assertThatThrownBy(() -> sut.create(command))
        .isInstanceOf(EntityAlreadyExistsException.class)
        .hasMessageContaining("userId is already exist");
```

### **220312::trevari::wallet::consumer::CreateServiceTest**
```java
@InjectMocks
CreateService sut;

@Test
void 지갑이_없다면_생성한다() {
    UserId userId = UserId.of("Tester");
    CreateCommand command = CreateCommand.of(userId);

    given(repository.existsByUserId(userId)).willReturn(false);

    sut.create(command);

    verify(idGenerator).gen(WalletId.class);
    verify(repository).save(any(Wallet.class));
}
```
**해석**<br>
지갑을 추가할 때, 해당하는 유저의 지갑이 없다면 지갑을 추가하는 테스트 코드입니다.<br>

**생각**<br>
지갑을 생성하는 명령을 실행할 때, 필요한 정보들을 다 담고 있으며,<br>
지갑의 ID 가 생성되고, 생성된 지갑을 저장하는 것까지 명시적입니다.<br>
딱히 변경할 필요가 없다고 생각이 드는 코드입니다.<br>

### **220313::trevari::wallet::consumer::WalletFinderTest**
```java
@Test
void walletByUserId(@Mock Wallet wallet) {
    given(repository.findByUserId(USER_ID)).willReturn(wallet);
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);

    Wallet actual = sut.walletByUserId(USER_ID);

    assertThat(actual).isInstanceOf(Wallet.class);
}
```
**해석**<br>
유저 정보(userId)를 통해 지갑 조회 테스트하는 코드입니다.<br>

**생각**<br>
현재 해당 테스트는 의미없다 생각합니다.<br>
미리 지정된 지갑을 반환하고, 그 지정된 지갑이 맞는지 확인하는 것이기 때문입니다.<br>
제 생각에는 애플리케이션 로직인 만큼 다른 로직이 호출되는 것을 확인하는 것이 로직을 표현하기에 좋은 테스트같습니다.<br>
해당 테스트에서는 repository 의 메소드 호출을 확인하는 것이 될 수 있겠네요.<br>
이런 식으로 코드를 짤 수 있습니다.<br>
```java
@BeforeEach
void before() {
    WalletFinder sut = new WalletFinder(repository, longIdGenerator);
}

@Test
void walletByUserId(@Mock Wallet wallet) {
    sut.walletByUserId(USER_ID);
    verify(repository).findByUserId(USER_ID);
}
```

### **220314::trevari::wallet::consumer::TicketKeyGeneratorTest**
```java
@Test
void generate_book_meeting_ticket_key() {
    service.setBadge(BOOK_CLUB_MEMBER);
    String key = ticketKeyGenerator.generate(service);

    assertThat(key).isEqualTo("BC:" + MEETING_ID_1);
}
```
**해석**<br>
뱃지에 따라 알맞은 포맷으로 키를 생성하는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
서비스에 뱃지를 셋팅하고, 키를 만드는 코드를 실행합니다.<br>
그리고 그 생성한 키를 받아 뱃지에 맞는 포맷인지 확인하네요.<br>
딱히 변경할 점이 없어보입니다. 저는 알고싶은 부분을 정확하게 알게 되었습니다.<br>

### **220315::trevari::member::consumer::TerminateServiceImplTest**
```java
TerminateServiceImpl sut;
TerminateCommand command = new TerminateCommand();

@Mock
MemberRepository repository;

@Mock
Member member;

@BeforeEach
void setUp() {
    command.setMemberId(ANY_MEMBER_ID);
    command.setRefundApplicatedAt(ANY_REFUND_APPLICATED_AT);
    sut = new TerminateServiceImpl(repository);
}

@Test
void verify_method() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);

    sut.terminate(command);

    verify(repository).findById(ANY_MEMBER_ID);
    verify(member).terminate();
    verify(repository).save(member);
}
```
**해석**<br>
해지 명령을 실행할 때, 호출되어야 하는 메소드가 호출되는지 확인하는 테스트 코드입니다.<br>

**생각**<br>
딱히 부족하다고 생각이 드는 코드는 아닙니다.<br>
하지만 더욱 명시적으로 하기 위해선, 멤버가 정말 해지 대상인지 확인시켜주는 코드가 내부에 있으면 좋을 것 같습니다.<br>
아래 코드를 넣어주면 더욱 명시적일 것 같습니다.<br>
```java
given(member.isTerminated()).willReturn(false);
```

### **220316::trevari::member::consumer::TerminateServiceImplTest**
```java
TerminateServiceImpl sut;
TerminateCommand command = new TerminateCommand();

@Mock
MemberRepository repository;

@Mock
Member member;

@BeforeEach
void setUp() {
    command.setMemberId(ANY_MEMBER_ID);
    command.setRefundApplicatedAt(ANY_REFUND_APPLICATED_AT);
    sut = new TerminateServiceImpl(repository);
}

@Test
void when_member_terminated_never_terminate_again() {
    given(repository.findById(ANY_MEMBER_ID)).willReturn(member);
    given(member.isTerminated()).willReturn(true);

    sut.terminate(command);

    verify(member, never()).terminate();
}
```
**해석**<br>
해지 명령을 실행할 때, 멤버가 이미 해지되어 있다면 해지 명령을 다시하지 않는 것을 보여주는 테스트 코드입니다.<br>

**생각**<br>
해당 테스트에서 필요한 내용을 생각해 봅니다.<br>
일단 해지 명령을 시도하는 것이 있을 것이고(sut.terminate), 해지 명령을 시도할 때 멤버가 이미 해지되어 있다는 내용도 필요합니다(willReturn).<br>
그리고 최종적으로 해지 명령을 다시하지 않는다는 내용이 필요합니다.(verify)<br>
이 부분들은 전부 포함이 되어있군요.<br>
해당 테스트 코드에서 표현하고 싶은 부분은 전부 있는 것 같습니다.<br>
가독성도 괜찮은 것 같아요.<br>
굳이 변경을 주자면, 테스트 제목을 한글로 바꾸는 건 어떨까요?<br>
_ex) 멤버를 해지할 때, 이미 해지된 멤버면 해지명령을 시도하지 않는다_<br>
꼭 필요한 부분은 아니지만 한 걸음 더 나아갔다는 느낌을 받을 수는 있을 것 같습니다.<br>

### **220317::trevari::scheduler::domain::ScheduleGroupTest**
```java
private static final ScheduleGroupId SCHEDULE_GROUP_ID = ScheduleGroupId.of(1L);
private static final ScheduleTriggerRuleId SCHEDULE_TRIGGER_RULE_ID = ScheduleTriggerRuleId.of(1L);
private static final LocalDateTime _2022_03_15_18_00 = LocalDateTime.of(2022, 3, 15, 18, 0);

private static ScheduleGroup sut;

@BeforeEach
void setUp() {
    sut = ScheduleGroup.of(SCHEDULE_GROUP_ID, SCHEDULE_TRIGGER_RULE_ID, _2022_03_15_18_00);
}

@Test
void 스케줄을_추가한다() {
    sut.newSchedule("d-7");
    sut.newSchedule("d-5");
    sut.newSchedule("d-3");

    assertThat(sut.hasScheduleBy(getTriggerDateTime("d-7"))).isTrue();
    assertThat(sut.hasScheduleBy(getTriggerDateTime("d-5"))).isTrue();
    assertThat(sut.hasScheduleBy(getTriggerDateTime("d-3"))).isTrue();
}

private LocalDateTime getTriggerDateTime(String s) {
    return TriggerRule.ofPattern(s).applyTo(_2022_03_15_18_00);
}
```
**해석**<br>
스케줄을 추가하고, 각 triggerRuleText 에 해당하는 schdule 이 있는지 확인합니다.<br>

**생각**<br>
메일을 보내는 시점에서 작업이 진행 중인 프로젝트의 테스트 코드입니다.<br>
작업을 진행하며 피드백을 반영해도 좋겠다 싶어 테스트 해석 메일로 발송합니다.<br>
<br>
일단, 두 가지에 대해 말하고 싶습니다.<br>
1. ScheduleGroup 을 생성할 때 넘기는 날짜<br>
2. hasScheduleBy 메소드<br>
<br>
ScheduleGroup 생성 시 넘기는 날짜는 무엇을 의미하는 것인지 잘 모르겠습니다.<br>
그냥 실제 property name 인 _REFERENCE_DATE_TIME_ 으로 변경해 명시적으로 표현하면 좋을 것 같습니다.<br>
<br>
hasScheduleBy 메소드는 테스트 코드를 제외하면 내부에서만 사용하는 메소드입니다.<br>
이전에는 findScheduleBy 라는 메소드로 테스트에 사용했으나, 해당 메소드는 아무 곳도 사용하는 곳이 없어 제거한 상태입니다.<br>
이런 경우에는 private 메소드로 변경하는 게 맞다고 생각하지만, 변경한 이후엔 스케줄을 추가했다는 테스트를 어떻게 할 지 잘 떠오르지 않습니다.. 그래서 현재 public 메소드로 두고 있습니다.<br>
<br>

### **220318::trevari::member::consumer::MembershipPeriodFinderTest**
```java
@BeforeEach
void setUp() {
    sut = new MembershipPeriodFinder();
}

@Test
void wrong_club_type() {
    MemberInfoChangeCommand command = new MemberInfoChangeCommand();
    command.setEventedAt(Clocks.now());
    command.setClub(Club.of(null, "WRONG_TYPE", LocalDateTime.now(), LocalDateTime.now()));
    command.setMeetings(Lists.newArrayList(Meeting.of(MeetingId.of("123"), 1L, LocalDateTime.of(2021, 6, 1, 1, 1), LocalDateTime.of(2021, 12, 1, 1, 1))));

    assertThatThrownBy(
            () -> sut.getPeriodOfMembership(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Proper Club Type is not found.");
}
```
**해석**<br>
멤버십 기간을 가져올 때, 유효하지 않은 타입이면 예외를 던진다는 것을 알 수 있는 테스트입니다.<br>

**생각**<br>
커맨드를 만들고, 해당하는 커맨드를 통해 명령을 실행합니다.<br>
저는 집중하고싶은 부분이 clubType 이기 때문에, 해당 값을 제외하고는 알지 않아도 괜찮다고 생각합니다.<br>
따로 메소드로 추출하고 싶네요. 구현해 보면 아래 형태의 코드가 됩니다.<br>
```java
@Test
void wrong_club_type() {
    MemberInfoChangeCommand command = createCommandByClubType("WRONG_TYPE");;

    assertThatThrownBy(
            () -> sut.getPeriodOfMembership(command))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Proper Club Type is not found.");
}

private MemberInfoChangeCommand createCommandByClubType(String clubType) {
    MemberInfoChangeCommand command = new MemberInfoChangeCommand();
    command.setEventedAt(Clocks.now());
    command.setClub(Club.of(null, clubType, LocalDateTime.now(), LocalDateTime.now()));
    command.setMeetings(Lists.newArrayList(Meeting.of(MeetingId.of("123"), 1L, LocalDateTime.of(2021, 6, 1, 1, 1), LocalDateTime.of(2021, 12, 1, 1, 1))));

    return command;
}
```

보기에 더욱 깔끔한 코드가 된 것 같습니다.<br>

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
