---
layout  : wiki
title   : Unit-Test(단위 테스트)
summary :
date    : 2022-03-05 16:00:00 +0900
updated : 2022-03-05 16:00:00 +0900
tag     : test
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Unit Test(단위 테스트)


## JUnit
### Version 5.x
Annotation 을 활용한 테스트 코드 구현
- @Test
- @BeforeEach, @AfterEach
- Assertions Class 내 static assert method 를 활용해 테스트 결과 검증

```java
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculatorTest {
    Calculator cal;

    @BeforeEach
    public void setUp()  {
        cal = new Calculator();
    }

    @Test
    public void 덧셈()  {
        assertEquals(7, cal.add(3, 4));
    }

    @Test
    public void 뺄셈()  {
        assertEquals(1, cal.subtract(5,  4));
    }

    @Test
    public void 곱셉()  {
        assertEquals(6, cal.multiply(2, 3));
    }

    @Test
    public void 나눗셈()  {
        assertEquals(2, cal.divide(8, 4));
    }

    @AfterEach
    public void tearDown() {
        cal = null;
    }
}
```

### Version 4.x
Annotation 을 활용한 테스트 코드 구현
- @org.junit.Test
- @org.junit.Before, @org.junit.After
- Assert Class 내 static assert method 를 활용해 테스트 결과 검증

```java
public class CalculatorTest {
    @Before
    public void setup() {
      System.out.println("setup");
    }
    
    @Test
    public void test1() throws Exception {
      System.out.println("test1");		
    }
    
    @Test
    public void test2() throws Exception {
      System.out.println("test2");		
    }
    
    @After
    public void teardown() {
      System.out.println("teardown");		
    }
}
```

## 학습 테스트
- 다른 사람이 구현해 놓은(오픈 소스 프레임워크, 다른 사람이 만든 프레임워크) 것을 단위 테스트로 만들어 테스트하는 것이다.
- 스프링 공부도 학습 테스트를 기반으로 할 수 있다.

### 예시

```java
@Test
@DisplayName("'1,2' 를 분할해 배열로 저장합니다.")
void split() {
    String[] actual = "1,2".split(",");
    assertThat(actual).contains("1", "2");
}
```

### 연습 효과
- 단위테스트 방법을 학습할 수 있다
- 단위테스트 도구의 사용법을 익힐 수 있다.
- 사용하는 API 에 대한 학습 효과가 있다.

