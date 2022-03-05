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
