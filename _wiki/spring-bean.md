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

### Example

```java
@Component
public class FooBean implements InitializingBean, DisposableBean {

    public FooBean() {
        System.out.println("1. 생성자 호출: Bean 인스턴스 생성");
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("2. @PostConstruct: 의존성 주입이 완료된 후 호출");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("3. InitializingBean's afterPropertiesSet: 초기화");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("4. @PreDestroy: Bean 소멸 전 호출");
    }

    @Override
    public void destroy() {
        System.out.println("5. DisposableBean's destroy: Bean 소멸");
    }
}
```

### Test

```java
@SpringBootTest
class BeanLifeCycleTest {

    @Autowired
    private ConfigurableApplicationContext context;

    @Test
    void lifeCycleTest() {
        context.getBean(FooBean.class);
        context.close();
    }
}
```
