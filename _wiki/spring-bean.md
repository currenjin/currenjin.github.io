---
layout  : wiki
title   : Spring Bean
summary :
date    : 2024-10-31 17:00:00 +0900
updated : 2024-10-31 17:00:00 +0900
tag     : spring
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Spring Bean

## Bean이란 무엇인가?

### 예시

일단 코드를 보자.

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User findUser(Long id) {
        return userRepository.findById(id);
    }
}
```

위 코드에서 `UserService`와 `UserRepository`는 `Bean`이다.

### 개념

1. SpringIoC 컨테이너가 관리하는 자바 객체다.
2. 개발자가 직접 `new UserService()`와 같이 생성하지 않아도 된다.
3. Spring이 대신 객체를 생성하고 관리해준다.

### 등록하는 법

1. `@Component` 어노테이션을 사용한다.
2. `@Service`, `@Repository`, `@Controller` 등의 목적에 따라 구분된 어노테이션을 사용한다.
3. `@Configuration` 클래스 내에서 `@Bean`으로 등록한다.

### 테스트

실제 테스트를 하고 싶다면 아래 코드를 작성해보자.

```java
@SpringBootTest
class BeanTest {
    @Autowired
    ApplicationContext applicationContext;

    @Test
    void beanTest() {
        String[] beanNames = applicationContext.getBeanDefinitionNames();

        Arrays.stream(beanNames).forEach(System.out::println);
    }
}
```

## IoC Container

### 예시

일반적인 객체 생성 방식:
```java
public class UserService {
    private UserRepository userRepository = new UserRepository();
    private EmailService emailService = new EmailService();
}
```

IoC Container의 생성 방식:
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
}
```

### 역할

1. Bean 생성과 관리
   - Application 실행 시 Bean으로 등록된 클래스들의 인스턴스 생성
   - Bean의 생명주기 관리(생성, 초기화, 소멸 등)
2. 의존성 주입(Dependency Injection)
   - Bean 간의 의존관계 파악
   - 필요 의존성 자동 주입(ex. UserService -> UserRepository)


## Life Cycle

그렇다면, Bean이라는 녀석은 어떤 타이밍에 생성되고, 또 소멸될까?

Bean의 생명주기에 대한 궁금증을 해결할 수 있는 챕터다.

### 순서

크게 다음과 같은 순서를 갖는다.
1. 생성자 호출 (Bean 인스턴스 생성)
2. 의존성 주입 (Properties 세팅)
3. @PostConstruct 메서드 실행
4. afterPropertiesSet() 메서드 실행
5. @PreDestroy 메서드 실행
6. destroy() 메서드 실행

순서만 봐서는 와닿지 않을 것이다. 아래와 같은 예제를 생각해보자.

```java
@Service
public class UserService {
   private final UserRepository userRepository;

   public UserService(UserRepository userRepository) {
      this.userRepository = userRepository;
   }
}

@Repository
public class UserRepository {
}
```

### 생성자 호출

Bean의 생명주기에 따라 콘솔 출력을 해보자. 첫 번째로는, 생성자를 호출하는 것이다.

- [ ] 생성자 호출 (Bean 인스턴스 생성)
- [ ] 의존성 주입 (Properties 세팅)
- [ ] @PostConstruct 메서드 실행
- [ ] afterPropertiesSet() 메서드 실행
- [ ] @PreDestroy 메서드 실행
- [ ] destroy() 메서드 실행

UserService의 생성자에 콘솔을 작성해보자.

```java
public UserService(UserRepository userRepository) {
  System.out.println("1. 생성자 호출: Bean 인스턴스 생성");
  this.userRepository = userRepository;
}
```

이를 확인하기 위한 테스트는 다음과 같이 작성할 수 있다.

```java
@SpringBootTest
class UserServiceBeanTest {
   @Test
   void lifeCycleTest() {
      AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
      context.register(UserService.class);
      context.register(UserRepository.class);
      context.refresh();

      context.getBean(UserService.class);

      context.close();
   }
}
```

실행해보면, 아래와 같이 출력된다.

```
1. 생성자 호출: Bean 인스턴스 생성
```

- [x] **생성자 호출 (Bean 인스턴스 생성)**
- [ ] 의존성 주입 (Properties 세팅)
- [ ] @PostConstruct 메서드 실행
- [ ] afterPropertiesSet() 메서드 실행
- [ ] @PreDestroy 메서드 실행
- [ ] destroy() 메서드 실행

### 의존성 주입

의존성 주입도 확인해보자. `UserService`가 `UserRepository`를 의존하고 있기 때문에 `UserRepository`의 생성자에 다음과 같은 콘솔을 추가한다.

```java
@Repository
public class UserRepository {
    public UserRepository() {
        System.out.println("2. 의존성 주입: Properties 세팅");
    }
}
```

테스트 코드를 실행해보자. 아래와 같은 순서로 출력될 것이다.

```
2. 의존성 주입: Properties 세팅
1. 생성자 호출: Bean 인스턴스 생성
```

숫자를 2로 마킹해서 그렇지, 당연한 결과다. `UserService`를 호출하기 위해 `UserRepository` 인스턴스가 먼저 생성되어야 하기 때문이다. (1, 2번의 순서대로 출력될 거라 생각한 사람은 다시금 깨닫는 계기가 될 수 있다)

- [x] **생성자 호출 (Bean 인스턴스 생성)**
- [x] **의존성 주입 (Properties 세팅)**
- [ ] @PostConstruct 메서드 실행
- [ ] afterPropertiesSet() 메서드 실행
- [ ] @PreDestroy 메서드 실행
- [ ] destroy() 메서드 실행

### @PostConstruct 메서드 실행

이제, `PostConstruct` 메서드로 넘어가보자.

PostConstruct 메서드는 이름과 같이, 생성자를 호출한 이후 호출되는 메서드이다.

`UserService`, `UserRepository` 모두 적용해보자.

```java
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        System.out.println("1. 생성자 호출: Bean 인스턴스 생성");
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("3. PostConstruct 메서드 실행: UserService");
    }
}
```

```java
@Repository
public class UserRepository {
    public UserRepository() {
        System.out.println("2. 의존성 주입: Properties 세팅");
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("3. PostConstruct 메서드 실행: UserRepository");
    }
}
```

결과가 어떻게 나올지 상상해보고 테스트를 실행해보자. 어떻게 나올 것 같은가?

결과는 다음과 같다.

```
2. 의존성 주입: Properties 세팅
3. PostConstruct 메서드 실행: UserRepository
1. 생성자 호출: Bean 인스턴스 생성
3. PostConstruct 메서드 실행: UserService
```

감이 좀 잡히는가?

- [x] **생성자 호출 (Bean 인스턴스 생성)**
- [x] **의존성 주입 (Properties 세팅)**
- [x] **@PostConstruct 메서드 실행**
- [ ] afterPropertiesSet() 메서드 실행
- [ ] @PreDestroy 메서드 실행
- [ ] destroy() 메서드 실행

### afterPropertiesSet() 메서드 실행

이제는 afterPropertiesSet 메서드를 상속받아 실행해보자.

afterPropertiesSet 메서드는 우리가 application.yml 등에서 정의한 환경변수가 스프링의 빈에 의해 주입된 이후 실행되는 메서드다.

확인하기 위해서는 InitializingBean을 상속하여 메서드를 오버라이딩 해야한다.

```java
@Service
public class UserService implements InitializingBean {
   // ...

   @Override
   public void afterPropertiesSet() {
      System.out.println("4. afterPropertiesSet 메서드 실행: UserService");
   }
}


@Repository
public class UserRepository implements InitializingBean {
   // ...


   @Override
   public void afterPropertiesSet() {
      System.out.println("4. afterPropertiesSet 메서드 실행: UserRepository");
   }
}
```

실행해보면 다음과 같다.

```
2. 의존성 주입: Properties 세팅
3. PostConstruct 메서드 실행: UserRepository
4. afterPropertiesSet 메서드 실행: UserRepository
1. 생성자 호출: Bean 인스턴스 생성
3. PostConstruct 메서드 실행: UserService
4. afterPropertiesSet 메서드 실행: UserService
```

어떤 차이인지 모르겠다면 `UserService`에서 `Value Annotation`을 통해 `Properties`를 주입받도록 해준다. (`cacheEnabled`)

```java
@Service
public class UserService implements InitializingBean {
   @Value("${user.cache.enabled:true}")
   private boolean cacheEnabled;

   private final UserRepository userRepository;

   public UserService(UserRepository userRepository) {
      System.out.println("1. 생성자 호출: Bean 인스턴스 생성. property : " + cacheEnabled);
      this.userRepository = userRepository;
   }

   @PostConstruct
   public void postConstruct() {
      System.out.println("3. PostConstruct 메서드 실행: UserService. property : " + cacheEnabled);
   }

   @Override
   public void afterPropertiesSet() {
      System.out.println("4. afterPropertiesSet 메서드 실행: UserService. property : " + cacheEnabled);
   }
}
```

결과가 어떨지 상상해보자.

```
2. 의존성 주입: Properties 세팅
3. PostConstruct 메서드 실행: UserRepository
4. afterPropertiesSet 메서드 실행: UserRepository
1. 생성자 호출: Bean 인스턴스 생성. property : false
3. PostConstruct 메서드 실행: UserService. property : true
4. afterPropertiesSet 메서드 실행: UserService. property : true
```

무언가 이상하지 않은가? PostConstruct를 호출하는 시점에 이미 properties가 주입되어있는 상태이다. 그렇다면, PostConstructor와 afterPropertiesSet은 도대체 무슨 차이일까?

극명한 차이는 다음과 같다. PostConstruct는 javax 패키지에 있고, afterPropertiesSet 메서드는 springframework 패키지에 있다. 특히 정의된 afterPropertiesSet 메서드를 보면, Exception을 던질 수 있다.

```java
void afterPropertiesSet() throws Exception;
```

이로 인해, afterPropertiesSet 메서드는 property 값에 따라 예외를 핸들링 할 수 있다. 그 외에는 큰 차이가 없으므로 스프링 프레임워크에 의존하지 않는 PostConstruct 어노테이션이 주로 사용된다.

- [x] **생성자 호출 (Bean 인스턴스 생성)**
- [x] **의존성 주입 (Properties 세팅)**
- [x] **@PostConstruct 메서드 실행**
- [x] **afterPropertiesSet() 메서드 실행**
- [ ] @PreDestroy 메서드 실행
- [ ] destroy() 메서드 실행

### @PreDestroy 메서드 실행

PreDestroy 또한 어노테이션이 존재한다. `UserService`와 `UserRepository`에 다음과 같이 적용해보자.

```java
@Service
public class UserService implements InitializingBean {
   // ...

   @PreDestroy
   public void preDestroy() {
      System.out.println("5. PreDestroy 메서드 실행: UserService. property : " + cacheEnabled);
   }
}

@Repository
public class UserRepository implements InitializingBean {
   // ...

   @PreDestroy
   public void preDestroy() {
      System.out.println("5. PreDestroy 메서드 실행: UserRepository");
   }
}
```

그리고 테스트 코드에서 destroy의 구분을 위해 콘솔을 추가한다.

```java
@SpringBootTest
class UserServiceBeanTest {
    @Test
    void lifeCycleTest() {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(UserService.class);
        context.register(UserRepository.class);
        context.refresh();

        context.getBean(UserService.class);

        System.out.println("============================");

        context.close();
    }
}
```

자, 이번엔 결과가 어떨지 상상해보자. 이제는 예상이 가지 않는가? 자연스럽게 상상해보자.

결과는 다음과 같다.

```
2. 의존성 주입: Properties 세팅
3. PostConstruct 메서드 실행: UserRepository
4. afterPropertiesSet 메서드 실행: UserRepository
1. 생성자 호출: Bean 인스턴스 생성. property : false
3. PostConstruct 메서드 실행: UserService. property : true
4. afterPropertiesSet 메서드 실행: UserService. property : true
============================
5. PreDestroy 메서드 실행: UserService. property : true
5. PreDestroy 메서드 실행: UserRepository
```

`context.close` 메서드가 호출되면, `UserRepository`를 의존하는 `UserService`에서 먼저 `Destroy`가 진행된다. 당연한 결과다.

- [x] **생성자 호출 (Bean 인스턴스 생성)**
- [x] **의존성 주입 (Properties 세팅)**
- [x] **@PostConstruct 메서드 실행**
- [x] **afterPropertiesSet() 메서드 실행**
- [x] **@PreDestroy 메서드 실행**
- [ ] destroy() 메서드 실행

### destroy() 메서드 실행

이제 마지막 단계인 destroy() 메서드는 어떨까?

```java
@Service
public class UserService implements InitializingBean, DisposableBean {
   // ...

   @Override
   public void destroy() {
      System.out.println("6. destroy 메서드 실행: UserService. property : " + cacheEnabled);
   }
}

@Repository
public class UserRepository implements InitializingBean, DisposableBean {
   // ...
   
   @Override
   public void destroy() {
      System.out.println("6. destroy 메서드 실행: UserRepository");
   }
}
```

결과는 대부분 예상할 수 있을 것이다.

```
2. 의존성 주입: Properties 세팅
3. PostConstruct 메서드 실행: UserRepository
4. afterPropertiesSet 메서드 실행: UserRepository
1. 생성자 호출: Bean 인스턴스 생성. property : false
3. PostConstruct 메서드 실행: UserService. property : true
4. afterPropertiesSet 메서드 실행: UserService. property : true
============================
5. PreDestroy 메서드 실행: UserService. property : true
6. destroy 메서드 실행: UserService. property : true
5. PreDestroy 메서드 실행: UserRepository
6. destroy 메서드 실행: UserRepository
```

눈치챈 사람도 있겠지만, PreDestroy는 javax 패키지에 존재하고, destroy 메서드는 springframework 패키지에 존재하며 에러 핸들링이 가능하다는 차이가 있다.
