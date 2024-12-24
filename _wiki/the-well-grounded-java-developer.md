---
layout  : wiki
title   : 기본기가 탄탄한 자바 개발자(The well-grounded java developer)
summary :
date    : 2024-12-21 18:00:00 +0900
updated : 2024-12-22 18:00:00 +0900
tag     : java
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
  {:toc}

# 기본기가 탄탄한 자바 개발자(The well-grounded java developer)

## 모던 자바

### 요약
- 자바 언어와 플랫폼은 자바 생태계의 두 가지 개별 구성 요소다.
- 자바 8 이후 자바 플랫폼은 새로운 릴리즈 프로세스를 채택했다.
  - 새로운 버전은 6개월마다, 장기 지원 버전은 2-3년마다 출시된다.

### 언어와 플랫폼
- 자바 언어: 정적 타입의 객체지향 언어.
- 자바 플랫폼: 클래스 파일 형태로 제공된 코드를 링크하고 실행하는 JVM

자바 시스템의 개별 사양
- JLS(Java Language Specification)
- JVMSpec: 현재 JVM은 실행하는 데 있어서 언어에 구애받지 않는다.

분리된 사양이 모여 자바 시스템을 구성하는 원리
- `.java` -(javac)-> `.class` -(class loader)-> `변환된 .class` -(interpreter)-> `실행코드` -(JIT Compiler)-> `기계어`  
- 자바는 **컴파일 언어**이면서 **인터프리터 언어**이다.

### 릴리즈 로드맵

![image](https://github.com/user-attachments/assets/6eaa7350-7a0b-40e3-8c78-223daa6e37a0)

- 6개월마다 주요 릴리즈

### 향상된 타입 추론

- [LVTI Guide](https://openjdk.org/projects/amber/guides/lvti-style-guide)
- 단순한 초기화에서, 오른쪽이 생성자 또는 정적 팩토리 메서드에 대한 호출인 경우
- 명시적 타입을 제거하면 반복되거나 중복된 정보가 삭제되는 경우
- 변수 이름만으로도 타입을 알 수 있는 경우
- 로컬 변수의 범위와 사용법이 짧고 간단한 경우

type interface
```java
List<Integer> before = Collections.<Integer>emptyList();
List<Integer> after = Collections.emptyList();
```

diamond syntax
```java
Map<Integer, Map<String, String>> beforeUserLists = new HashMap<Integer, Map<String, String>>();
Map<Integer, Map<String, String>> afterUserLists = new HashMap<>();
```

lambda
```java
Function<String, Integer> lengthFn = s -> s.length();
```

LVTI, local variable type interface
- 로컬 변수의 선언만을 검사한다.
- 제약 조건 해결 알고리즘을 적용한다.
```java
var names = new ArrayList<String>();
```

Bad case
```java
public class Var {
    private static Var var = null;

    public static Var var() {
        return var;
    }

    public static void var(Var var) {
        Var.var = var;
    }
}
```

```java
void var_test() {
    var var = Var.var();
    if (var == null) {
        Var.var(new Var());
    }
}
```

Fail example
- 추론자가 해결해야 하는 타입 제약 조건 방정식을 **과소결정 연립방정식**이라 한다.
```java
var fn = s -> s.length();
var n = null;
```

Nondenotable type
```java
var duck = new Object() {
    void quack() {
        System.out.println("Quack!");
    }
};

duck.quack();
```