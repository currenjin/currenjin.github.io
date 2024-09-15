---
layout  : wiki
title   : Fixture Monkey를 적용해보자 w/JPA Test
summary :
date    : 2024-09-15 22:00:00 +0900
updated : 2024-09-15 22:00:00 +0900
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

## Problem

테스트를 작성하며 각자 느끼는 고충이 있을 것이다. 그 중 많은 사람들이 테스트를 위한 셋업 코드를 작성하며 많은 시간을 소요하고, 지루함을 느끼곤 한다.

TDD의 저자 켄트벡은 두려움이 지루함으로 변할 때까지 테스트를 작성하라고 하지만, 나는 반복되는 지루함은 반드시 자동화해야 한다고 생각한다.

테스트 코드를 작성하는 우리의 두려움은 지루함으로 바뀌었으니, 이 지루함의 반복됨을 편함으로 바꿀 수는 없을까?

그런 나는 발견했다.

## Fixture Monkey

> Fixture Monkey는 테스트 객체를 쉽게 생성하고 조작할 수 있도록 고안된 라이브러리다.

Fixture Monkey를 사용하며 테스트 코드를 작성 시 반복적이고 지루한 셋업 코드를 줄일 수 있다.

이는 개발자가 테스트 로직 자체에 더욱 집중할 수 있다는 의미이다.

## Spring Boot Jpa

Fixture Monkey를 테스트하기 위해 Spring Data Jpa 프로젝트에 구현되어있는 테스트 코드를 참고할 생각이다.

### Links

- [GitHub - Spring Data Jpa](https://github.com/spring-projects/spring-data-jpa/blob/main/spring-data-jpa/src/test/java/org/springframework/data/jpa/repository/UserRepositoryTests.java)
- [GitHub - Example Code](https://github.com/currenjin/TDD/tree/main/fixture-monkey/src)

### Environment

- `Spring Boot Framework 2.6.4`
- `Java 17`
- `Fixture Monkey 1.0.25`
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

    private int age;

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

### AS-IS Example

먼저, 우리가 일반적으로 작성하는 테스트 코드로 작성하겠다.




### TO-BE Example

## The End
