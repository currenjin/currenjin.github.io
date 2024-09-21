---
layout  : wiki
title   : Fixture Monkey를 적용해보자 w/JPA Test
summary :
date    : 2024-09-15 22:00:00 +0900
updated : 2024-09-21 21:00:00 +0900
tag     : fixture-monkey
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Fixture Monkey를 적용해보자

> 지루함을 편함으로 바꿔주는 Fixture Monkey에 대한 문서이다.

![image](https://github.com/user-attachments/assets/91f37f68-ca1b-495b-872a-f53d2986ab59)

## Problem

테스트를 작성하며 각자 느끼는 고충이 있을 것이다. 그 중 많은 사람들이 테스트를 위한 셋업 코드를 작성하며 많은 시간을 소요하고, 지루함을 느끼곤 한다. TDD의 저자 켄트벡은 두려움이 지루함으로 변할 때까지 테스트를 작성하라고 하지만, 나는 더 나아가 반복되는 지루함은 반드시 자동화해야 한다고 생각한다.

> 테스트 코드를 작성하는 우리의 두려움은 지루함으로 바뀌었으니, 이 지루함의 반복됨을 편함으로 바꿀 수는 없을까?

## Fixture Monkey

Fixture Monkey는 이런 고민을 해결해준다. 이 라이브러리를 사용하면,

1. 테스트 데이터 생성을 자동화하여 시간을 아낄 수 있다.
2. 다양한 시나리오를 쉽게 테스트할 수 있다.
3. 테스트 코드의 가독성과 유지보수성이 높아진다.
4. 엣지 케이스를 쉽게 생성하여 더 견고한 테스트가 가능하다.

Fixture Monkey를 사용하면, 테스트 작성에 대한 부담은 줄어들고 실제 비즈니스 로직 테스트에 더 집중할 수 있다.

## Spring Boot JPA

Fixture Monkey를 테스트하기 위해 Spring Data JPA 프로젝트에 구현되어있는 테스트 코드를 참고할 생각이다. JPA가 무엇인지, 사용법은 어떻게 되는지는 이 글을 보는 사람이라면 알고 있다고 가정하겠다.

### Links

- [GitHub - Spring Data JPA](https://github.com/spring-projects/spring-data-jpa/blob/main/spring-data-jpa/src/test/java/org/springframework/data/jpa/repository/UserRepositoryTests.java)
- [GitHub - Example Code](https://github.com/currenjin/TDD/blob/main/fixture-monkey/src/test/java/com/tdd/domain/user/UserRepositoryTest.java)

### Environment

- `Spring Boot Framework 2.6.4`
- `Java 17`
- `Fixture Monkey 1.0.25`
- `Spring Data JPA`
- `H2 Database`

### Domain Model

`User Entity`

```java
@Entity
@Table(name = "user")
public class User {
    public User() {
        this(null, null, null);
    }

    public User(String firstName, String lastName, String emailAddress) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.emailAddress = emailAddress;
        this.active = true;
        this.createdAt = new Date();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String firstName;

    private String lastName;

    private boolean active;

    @Column(nullable = false, unique = true)
    private String emailAddress;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    // ...Getter
    // ...Setter
}
```

`User Repository`
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
```

## Test

먼저, 우리가 일반적으로 작성하는 테스트 코드로 작성하겠다.

기본 클래스 셋업으로는 아래 코드와 같다.

```java
@DataJpaTest
class UserRepositoryTest {
    @PersistenceContext
    private EntityManager em;

    @Autowired
    private UserRepository repository;
    
    // ...Test Function
}
```

설명해보자면,

1. `@DataJpaTest` : JPA 테스트를 위한 어플리케이션 컨텍스트만 로드하여 인메모리 데이터베이스를 사용한다.
2. `@PersistenceContext EntityManager` : JPA EntityManager를 주입받는다. 테스트에서 직접적인 데이터베이스 조작이 필요한 경우 사용한다. 
3. `@Autowired UserRepository` : 테스트 대상인 UserRepository를 주입받는다. 

### Creation AS-IS

첫 번째로, 생성을 위한 테스트를 진행하겠다.

```java
@BeforeEach
void setUp() {
    firstUser = new User("hyunjin", "jeong", "hyun0524e@naver.com");
}

@Test
void creation() {
    Query query = em.createQuery("select count(u) from User u");
    Long before = (Long) query.getSingleResult();

    repository.save(firstUser);

    assertEquals(before + 1L, query.getSingleResult());
}
```

1. firstUser 객체를 직접 생성한다.
2. entityManager를 통해 count 쿼리를 생성한다.
3. 생성 이전 count를 조회한다.
4. firstUser를 db에 저장한다.
5. 생성 이후 count와 생성 이전 count + 1과 일치한지 확인한다.

위 코드만 보면 우리가 일반적으로 작성하는 테스트 코드로 생각된다.

여기서, firstUser 객체에 더 많은 파라미터를 담게 된다면 어떨까?

```java
@BeforeEach
void setUp() {
    firstUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
}
```

**게다가** 객체를 여러 개 생성하여 테스트하려면 어떻게 될까?

```java
private User firstUser;
private User secondUser;
private User thirdUser;
private User fourthUser;
private User fifthUser;

@BeforeEach
void setUp() {
    firstUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    secondUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    thirdUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    fourthUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    fifthUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
}
```

**게다가** 우리가 만든 User Entity에서 이메일은 중복할 수 없다는 점은 잊지 말자

```java
@BeforeEach
void setUp() {
    firstUser = new User("hyunjin", "jeong", "hyun0524e@naver.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    secondUser = new User("hyunjin", "jeong", "qwe@test.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    thirdUser = new User("hyunjin", "jeong", "zxc@test.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    fourthUser = new User("hyunjin", "jeong", "dfg@test.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
    fifthUser = new User("hyunjin", "jeong", "asd@test.com", "서울특별시 강남구 태헤란로 xx번길", "xx아파트 xxx동 xxxx호", "010-0000-0000", LocalDate.of(2000, 5, 24));
}
```

자, 이제 어떻게 할 것인가? 이메일만 따로 받아 객체를 생성하는 메소드를 작성할 것인가? 그러면 완전 다른 값이 필요한 객체는?

결국엔 객체를 생성하며 모든 값을 '생각하고' 넣어주어야 한다는 것이다. Fixture Monkey에서는 우리가 테스트 로직에만 집중할 수 있도록 도와준다.

### Dependency & Build object

일단 종속성을 추가하고,

**Dependency**
```java
dependencies {
    testImplementation 'com.navercorp.fixturemonkey:fixture-monkey-starter:1.0.25'
}
```

사용을 위해 테스트 클래스에서 FixtureMonkey 객체를 빌드한다.

**First SetUp**
```java
@DataJpaTest
class UserRepositoryTest {
    FixtureMonkey fixtureMonkey = FixtureMonkey.builder().objectIntrospector(ConstructorPropertiesArbitraryIntrospector.INSTANCE).build();
    
    // ...
}
```

### Creation TO-BE

아까 정의했던 객체를 FixtureMonkey를 통해 생성해 보자.

```java
@BeforeEach
void setUp() {
    firstUser = fixtureMonkey.giveMeOne(User.class);
}
```

**놀랍게도 이게 끝이다!**

fixtureMonkey 객체에서 giveMeOne(class)를 호출하면 필요한 파라미터에 난수값을 적용해 해당 클래스의 객체를 생성해주는 것이다.

Debug를 통해 생성된 객체를 확인해 볼까?

```java
User {
    id = null;
    firstName = "춝䪼ꧏ";
    lastName = "苖⻵ꪘ쫏▷膄톣㷂䱧";
    active = true;
    emailAddress = "ᛩോ튅⛝櫕ᣵ솙칖谌ｰ퀭埘樅㺏㧑⍭規喲ꫮ൐Ὧ륑삲砎鳃抝Фꞻ᣾⤇崆";
    createdAt = "Mon Sep 16 12:18:00 KST 2024";
}
```

## Fixture Monkey 동작
> 내부 동작이 궁금하지 않다면 넘어가도 좋다.

### 내부 동작 

라이브러리의 소스코드를 파악해 본 결과 다음과 같은 동작 과정을 거친다.

![image](https://github.com/user-attachments/assets/b79fec6c-0c74-4f11-8b40-2212abfad4c0)

1. giveMeOne 메서드를 호출한다.
2. 타입 정보를 담은 default builder 인스턴스를 생성한 후 sample 메서드를 호출한다.
3. sample 메서드에서는 각 필드의 타입에 일치하는 값을 생성하고, 이 값으로 해당하는 타입 인스턴스를 생성한다.
   1. resolve 함수가 호출되면 타입에 일치하는 값을 생성한다.
   2. conbimed 함수가 호출되면 필드에 생성된 값으로 인스턴스를 생성해 반환한다.

**giveMeOne**

```java
public <T> T giveMeOne(Class<T> type) {
    return this.giveMe(type, 1).get(0);
}
```

타입 객체를 넘기며 호출하는 내부 함수 giveMe가 있다.

**giveMe**
```java
public <T> List<T> giveMe(Class<T> type, int size) {
    return this.giveMe(type).limit(size).collect(toList());
}

public <T> Stream<T> giveMe(Class<T> type) {
    return Stream.generate(() -> this.giveMeBuilder(type).sample());
}
```

giveMeBuilder를 호출한 후, sample을 호출하는데

먼저 giveMeBuilder를 보자.

```java
public <T> ArbitraryBuilder<T> giveMeBuilder(Class<T> type) {
    TypeReference<T> typeReference = new TypeReference<T>(type) {
    };
    return giveMeBuilder(typeReference);
}
```

giveMeBuilder에서는 type을 받고, 해당하는 타입에 대한 ArbitraryBuilder를 리턴받는다.

ArbitraryBuilder를 만들어주는 함수를 확인해볼까? 이해하기 쉽게 주석을 달아놨다.

```java
public <T> ArbitraryBuilder<T> giveMeBuilder(TypeReference<T> type) {
    // 1. Type에 대한 정보를 담는다.
    RootProperty rootProperty = new RootProperty(type.getAnnotatedType());

    // 2. Type에 해당하는 ArbitraryBuilder를 매칭한다.
    ArbitraryBuilderContext builderContext = registeredArbitraryBuilders.stream()
        .filter(it -> it.match(rootProperty))
        .map(MatcherOperator::getOperator)
        .findAny()
        .map(DefaultArbitraryBuilder.class::cast)
        .map(DefaultArbitraryBuilder::getContext)
        .orElse(new ArbitraryBuilderContext());

    // 3. Type 정보를 담은 DefaultArbitraryBuilder 인스턴스를 생성한다.
    return new DefaultArbitraryBuilder<>(
        fixtureMonkeyOptions,
        rootProperty,
        new ArbitraryResolver(
            traverser,
            manipulatorOptimizer,
            monkeyManipulatorFactory,
            fixtureMonkeyOptions,
            monkeyContext,
            registeredArbitraryBuilders
        ),
        traverser,
        monkeyManipulatorFactory,
        builderContext.copy(),
        registeredArbitraryBuilders,
        monkeyContext,
        fixtureMonkeyOptions.getInstantiatorProcessor()
    );
}
```

우리는 User Type을 통해 호출하니 User Type에 대한 정보를 담은 ArbitraryBuilder가 반환될 것이다.

이제 위에서 언급한 sample 메서드가 호출되면 어떤일이 발생할까?

```java
public interface ArbitraryBuilder<T> {
    T sample();
}

// 구현체
public final class DefaultArbitraryBuilder<T> implements ArbitraryBuilder<T>, ExperimentalArbitraryBuilder<T> {
    public T sample() {
        return this.resolveArbitrary(this.context).combined();
    }
}
```

resolverArbitrary를 호출하면, 해당 컨텍스트 정보에 맞게 값을 생성한다. User class 내 각 필드 타입에 따라 값을 생성한다는 의미다.

여기서 호출하는 resolve 메서드에는 ObjectTree 인스턴스를 구성한다. 일부 코드를 가져와서 확인해보자.

```java
public CombinableArbitrary<?> resolve(
        RootProperty rootProperty,
        ArbitraryBuilderContext builderContext
) {
   // ...
   
   objectTree -> {
       List<ArbitraryManipulator> registeredManipulators =
           monkeyManipulatorFactory.newRegisteredArbitraryManipulators(
               registeredArbitraryBuilders,
               objectTree.getMetadata().getNodesByProperty()
           );
   
       List<ArbitraryManipulator> joinedManipulators =
           Stream.concat(registeredManipulators.stream(), manipulators.stream())
               .collect(Collectors.toList());
   
       List<ArbitraryManipulator> optimizedManipulator = manipulatorOptimizer
           .optimize(joinedManipulators)
           .getManipulators();
   
       for (ArbitraryManipulator manipulator : optimizedManipulator) {
           manipulator.manipulate(objectTree);
       }
       return objectTree.generate();
   }
}
```

resolve 메서드의 반환 코드 중 일부인데, ArbitraryManipulator 인스턴스를 이용해 ObjectTree 인스턴스를 컨트롤하고, generate 메서드를 호출해 최종 객체를 완성한다.

resolve 메서드에서 반환되는 객체는 CombinableArbitrary 인스턴스이고, combined 메서드를 호출한다.

combined 메서드가 호출되면 생성되었던 ObjectTree 인스턴스를 이용해 User 인스턴스를 생성하고 반환한다. 결과적으로 아래 값이 반환된다.

```java
User {
    id = null;
    firstName = "춝䪼ꧏ";
    lastName = "苖⻵ꪘ쫏▷膄톣㷂䱧";
    active = true;
    emailAddress = "ᛩോ튅⛝櫕ᣵ솙칖谌ｰ퀭埘樅㺏㧑⍭規喲ꫮ൐Ὧ륑삲砎鳃抝Фꞻ᣾⤇崆";
    createdAt = "Mon Sep 16 12:18:00 KST 2024";
}
```

### Fixture Monkey 문자열 난수

문자열의 난수는 어떤 방식으로 생성될까?

#### 로직 분석

예를 들어, User 클래스의 firstName 타입은 문자열(String)이다. 문자열은 MonkeyStringArbitrary 클래스를 통해 처리된다.

```java
public final class MonkeyStringArbitrary implements StringArbitrary {
}
```

해당 클래스는 StringArbitrary 인터페이스를 구현했는데, 관련된 함수가 jqwik 라이브러리에 의존하기 때문이다.

아래 코드를 보면 잘 확인할 수 있다.

```java
public final class MonkeyStringArbitrary implements StringArbitrary {
    // 문자 생성 담당
    private CharacterArbitrary characterArbitrary = new DefaultCharacterArbitrary();
    
    // 문자열 생성 메서드 
    @Override
    public RandomGenerator<String> generator(int genSize) {
        long maxUniqueChars = characterArbitrary
              .exhaustive(maxLength())
              .map(ExhaustiveGenerator::maxCount)
              .orElse((long)maxLength());
        return RandomGenerators.strings(
              randomCharacterGenerator(),
              minLength, maxLength(), maxUniqueChars,
              genSize, lengthDistribution,
              newThreadSafeArbitrary(characterArbitrary)
        );
    }
}
```

generator 메서드 호출을 통해 jqwik 라이브러리로 위임을 했다. DefaultCharacterArbitrary 클래스를 확인해 보면 아래와 같은 코드가 있다.

```java
private Arbitrary<Character> defaultArbitrary() {
   return this.rangeArbitrary('\u0000', '\uffff').filter((c) -> {
      return !isNoncharacter(c) && !isPrivateUseCharacter(c);
   });
}
```

기본적으로 유니코드를 생성하고 있는데 이 때문에 여러 언어가 포함된 값이 생성된다. 대신, 비문자와 개인용 문자를 제외한다.

이를 사용하는 과정을 MonkeyStringArbitrary 클래스부터 확인해보자.

```java
// MonkeyStringArbitrary
private RandomGenerator<Character> randomCharacterGenerator() {
   RandomGenerator<Character> characterGenerator = effectiveCharacterArbitrary().generator(1, false);
   if (repeatChars > 0) {
      return characterGenerator.injectDuplicates(repeatChars);
   } else {
      return characterGenerator;
   }
}

// DefaultCharacterArbitrary
public RandomGenerator<Character> generator(int genSize) {
   return this.arbitrary().generator(genSize);
}

private Arbitrary<Character> arbitrary() {
   if (this.partsWithSize.isEmpty()) {
      return this.defaultArbitrary();
   } else {
      return this.partsWithSize.size() == 1 ? (Arbitrary)((Tuple.Tuple2)this.partsWithSize.get(0)).get2() : Arbitraries.frequencyOf(this.partsWithSize);
   }
}
```

이렇게 defaultArbitrary를 호출하여 값을 생성하는 것을 알 수 있다.

여러 테스트 환경 특성 상 중국어 간체라던가 키릴문자가 나오는 상황이 발생하면 안 될 수도 있다. 알파벳 값만 얻고 싶은가?

```java
@Override
public StringArbitrary alpha() {
  this.characterArbitrary = this.characterArbitrary.alpha();
  return this;
}
```

친절하게도 MonkeyStringArbitrary 구현체에 구현이 되어있다. 알파벳 뿐만 아니라 ascii, numberic, whitespace 등을 사용할 수 있다.

#### 로직 구현

이를 이용해 모든 문자열 필드는 알파벳만으로 구성해 보겠다.

```java
@BeforeEach
void setUp() {
    firstUser = fixtureMonkey.giveMeBuilder(User.class)
            .set("firstName", new MonkeyStringArbitrary().alpha())
            .sample();
}

// 결과
User {
   id = null;
   firstName = "NiGPfLvWoDwxIrhOdnXkyVYCmtRpASM";
   lastName = "彜ॵ䕥殿騍눭≖鿤ᄭ똊暿즹쓨ᷧ⻐ᣡ媻哙떬បଝ䗳";
   active = true;
   emailAddress = null;
   createdAt = "Mon Sep 16 17:07:37 KST 2024";
}
```

모든 객체를 생성할 때, 한 번에 적용하고 싶다면? 처음 fixtureMonkey 인스턴스를 빌드할 때 register 해주면 된다.

```java
FixtureMonkey fixtureMonkey = FixtureMonkey.builder()
      .objectIntrospector(FieldReflectionArbitraryIntrospector.INSTANCE)
      .register(User.class, arbitraryBuilder ->
              arbitraryBuilder.giveMeBuilder(String.class)
                      .set("firstName", new MonkeyStringArbitrary().alpha())
                      .set("lastName", new MonkeyStringArbitrary().alpha())
      )
      .build();

User {
   id = null;
   firstName = "sZfq";
   lastName = "PbAuticMWIXoUJVLhJZdrVRCPzh";
   active = false;
   emailAddress = "";
   createdAt = "Thu Feb 08 00:00:00 KST 2024";
}
```

### 한글 문자열 적용(feat. contribute)

- [PR Link](https://github.com/naver/fixture-monkey/pull/1056)

문자열에 한글만 적용하고 싶다면 어떻게 할까?

**문자열 난수** 챕터에서 확인했듯이, FixtureMonkey 인스턴스를 빌드하는 과정에서 MonkeyStringArbitrary를 적용할 수 있을 것이다.

#### 로직 분석

한글만 적용해주기 위해서는 일단 alpha 메서드를 확인할 필요가 있다. (한글만 적용해주는 메서드가 없기 때문이다)

```java
@Override
public StringArbitrary alpha() {
   this.characterArbitrary = this.characterArbitrary.alpha();
   return this;
}

public CharacterArbitrary alpha() {
    return this.range('A', 'Z').range('a', 'z');
}
```

jqwik 라이브러리를 호출한다.

내부에서 range를 알파벳으로 정의해 주는데, 직접 range를 설정할 수 있는 메서드를 지원하지 않을리가 없다고 생각한다.

```java
@Override
public StringArbitrary all() {
    return this.withCharRange(Character.MIN_VALUE, Character.MAX_VALUE);
}

@Override
public StringArbitrary withCharRange(char from, char to) {
   this.characterArbitrary = this.characterArbitrary.range(from, to);
   return this;
}
```

MonkeyStringArbitrary 클래스 내에 all 메서드를 발견했는데, 해당 메서드에서는 모든 범위를 직접 지정해준다. 운이 좋게도 withCharRange는 public 메서드여서 직접 정의할 수가 있겠다.

#### 어떤 값을 정의하는가?

jqwik library 내의 defaultArbitrary에서 확인했듯이 Unicode로 범위를 지정해줘야 한다. 한글은 AC00부터 D7AF까지이며, 실질적 사용 범위는 D7A3까지이다. (나머지 문자는 정의되지 않음)

<img width="125" alt="image" src="https://github.com/user-attachments/assets/b970cae4-b0a0-46ec-8bd8-4ad81fec42b9">
<img width="125" alt="스크린샷 2024-09-21 오후 9 50 55" src="https://github.com/user-attachments/assets/b9c2ba8d-3b6b-4e84-a674-2e20d6b0a8e8">

그리고 이를 문자로 봤을 때 `가`부터 `힣` 까지이다.

직접 정의해 보면,

```java
FixtureMonkey fixtureMonkey = FixtureMonkey.builder()
   .objectIntrospector(FieldReflectionArbitraryIntrospector.INSTANCE)
   .register(User.class, arbitraryBuilder ->
      arbitraryBuilder.giveMeBuilder(String.class)
         .set("firstName", new MonkeyStringArbitrary().withCharRange('가', '힣'))
         .set("lastName", new MonkeyStringArbitrary().withCharRange('가', '힣'))
      )
   .build();
```

생성된 객체를 확인해 봤을 때 값은 아래와 같다.

```java
User {
   id = null;
   firstName = "짇쇅";
   lastName = "뚼셃룫욻믉묩돚펇뒄냱쨃뮀튣퇿졷쑂졗징욡뎩몁";
   active = true;
   emailAddress = null;
   createdAt = "Wed Feb 07 00:00:00 KST 2024";
} 
```

#### Contribute

이는 메서드화될 수 있다고 생각하여 FixtureMonkey Repository를 Fork하여 [Pull Request](https://github.com/naver/fixture-monkey/pull/1056)를 진행해 둔 상태이다.

**MonkeyStringArbitrary**

```java
public StringArbitrary korean() {
   this.characterArbitrary = this.characterArbitrary.range('가', '힣');
   return this;
}
```

그리고 위 메서드를 검증하기 위한 테스트도 작성했다.

**MonkeyStringArbitraryTest**

```java
StringArbitrary koreanStringArbitrary = new MonkeyStringArbitrary().korean();

@Test
void koreanShouldGenerateOnlyKoreanCharacters() {
   StringArbitrary arbitrary = koreanStringArbitrary.ofMinLength(1).ofMaxLength(10);

   String sample = arbitrary.sample();

   assertTrue(sample.chars().allMatch(ch -> ch >= '가' && ch <= '힣'));
}
```

샘플 데이터를 추출하여 Unicode 상 한글 범위에 해당하는지 테스트했다.

```java
@Property(tries = 100)
void koreanShouldAlwaysGenerateStringsWithinKoreanCharacterRange(
    @ForAll @Size(min = 1, max = 50) String ignored
) {
   String sample = koreanStringArbitrary.sample();

   assertTrue(sample.chars().allMatch(ch -> ch >= '가' && ch <= '힣'));
}
```

마찬가지로 여러번 시도하여 항상 한글 범위에 해당하는지 테스트했다.

```java
@Test
void koreanShouldRespectMinAndMaxLength() {
   int minLength = 5;
   int maxLength = 10;
   StringArbitrary arbitrary = koreanStringArbitrary.ofMinLength(minLength).ofMaxLength(maxLength);

   String sample = arbitrary.sample();

   assertTrue(sample.length() >= minLength && sample.length() <= maxLength);
}
```

그리고 샘플 데이터 생성을 요청한 길이가 올바른지 또한 검증했다.

해당 PR이 통과할지는 불분명하겠지만, 불편함을 편함으로 바꿔주는 FixtureMonkey를 다루며 편리함을 추구하는 시도는 지속할 것이다.

### 객체 리스트 생성

객체를 하나하나 정의하기에도 지루함이 느껴질 때가 있다.

```java
private User firstUser;
private User secondUser;
private User thirdUser;
private User fourthUser;
private User fifthUser;

@BeforeEach
void setUp() {
  firstUser = fixtureMonkey.giveMeOne(User.class);
  secondUser = fixtureMonkey.giveMeOne(User.class);
  thirdUser = fixtureMonkey.giveMeOne(User.class);
  fourthUser = fixtureMonkey.giveMeOne(User.class);
  fifthUser = fixtureMonkey.giveMeOne(User.class);
}

@Test
void creation() {
   Query query = em.createQuery("select count(u) from User u");
   Long before = (Long) query.getSingleResult();
   List<User> users = List.of(firstUser, secondUser, thirdUser, fourthUser, fifthUser);

   repository.saveAll(users);

   assertEquals(before + 5L, query.getSingleResult());
}
```

위 예제 코드와 같이 사용할 수도 있겠지만, 여러 개의 객체를 한 번에 생성하고자 하면 어떻게 해야할까?

#### 로직 분석

동작 과정을 살펴보던 중 giveMeOne 메서드에서 호출하던 giveMe 메서드를 보자.

```java
public <T> T giveMeOne(Class<T> type) {
    return this.giveMe((Class)type, 1).get(0);
}

public <T> List<T> giveMe(Class<T> type, int size) {
   return (List)this.giveMe(type).limit((long)size).collect(Collectors.toList());
}
```

size 값만큼 객체를 생성해주는 것으로 보인다. 마침, public 메서드이니 우리도 사용할 수 있겠다.

#### 로직 구현

```java
private List<User> userList;

@BeforeEach
void setUp() {
    userList = fixtureMonkey.giveMe(User.class, 5);
}

@Test
void creation() {
   Query query = em.createQuery("select count(u) from User u");
   Long before = (Long) query.getSingleResult();

   repository.saveAll(userList);

   assertEquals(before + 5L, query.getSingleResult());
}
```

giveMe 메서드를 호출하여 5개의 객체 생성을 요청했다.

테스트는 성공했고, Debug mode로 userList를 확인해 보자.

<img width="743" alt="image" src="https://github.com/user-attachments/assets/466a4709-9ab4-4330-b3aa-91511adcd71c">

다섯 개의 User 인스턴스가 생성된 것을 확인할 수 있다.

## The End

FixtureMonkey를 활용하면 테스트 데이터 생성의 복잡성을 줄이고 테스트 자체에 더 집중할 수 있다. 이는 코드의 품질을 높이고 개발 생산성을 향상시키는 데 큰 도움이 될 것이다. FixtureMonkey와 함께 더 나은 테스트 문화를 만들어나가길 바란다.

추가로, 사실과 다른 내용이 있다면 댓글로 남겨주길 바란다.

### TO-DO(memo)
- Nullable 테스트를 고려하기(ex. null인 경우 예외, null이 아닌 경우 예외 등)
- 특정 포맷을 적용하기(ex. email@test.com)
- 특정 범위만 허용/제외하기(ex. 1-99)
