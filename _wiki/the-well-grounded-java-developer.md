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

## 자바 모듈
### 요약
- 모듈은 패키지를 그룹화하고 모듈 전체에 대한 메타데이터, 의존성, 공개 인터페이스에 대한 정보를 제공한다.
  - 이런 제약 조건은 컴파일러와 런타임에 의해 강제된다.
- 모듈화된 라이브러리와 애플리케이션은 JAR 파일을 통해 배포하고 표준 빌드 도구를 통해 다운로드할 수 있다.
- 모듈로 전환하려면 자바 개발 방식의 변화가 필요하다.
  - 클래스 로딩은 모듈이 정의하는 제한 사항을 인식하고 비모듈화된 코드의 로딩을 처리한다.
  - 모듈로 빌드하려면 새로운 명령줄 플래그와 자바 프로젝트의 표준 레이아웃을 변경해야 한다.
- 모듈은 작업에 대해 이점을 제공한다.
  - 세분화된 제어가 가능해 유지 보수성을 위해 근본적인 설계로 나아갈 수 있다.
  - 컨테이너에서 에셋의 사용량을 줄이는 데 핵심적인 역할을 한다.
  - 정적 컴파일처럼 다른 새로운 기능을 위한 길을 열어준다.
- 기존 모놀리식 애플리케이션의 경우 모듈로 마이그레이션하는 것이 어려울 수 있다.

### 배경
모듈은 자바 9부터 도입된 새로운 개념이다. 모듈은 런타임에 의미를 가지는 애플리케이션 배포 및 의존성의 단위다.

#### 기존 자바 개념
- JAR 파일은 런타임에 보이지 않고, 단순 클래스 파일을 포함하고 있는 압축된 디렉터리다.
- 패키지는 실제로 접근 제어를 위해 클래스를 그룹화하기 위한 네임스페이스다.
- 의존성은 클래스 레벨에서만 정의된다.
- 접근 제어와 리플렉션이 결합돼 명확한 배포 단위 경계 없이 최소한의 시행으로, 근본적으로 개방적인 시스템을 생성한다.

#### 모듈의 개념
- 모듈은 모듈 간의 의존성 정보를 정의하므로 컴파일 또는 애플리케이션 시작 시점에서 모든 종류의 해결과 연결 문제를 감지할 수 있다.
- 적절한 캡슐화를 제공해서 내부 패키지와 클래스를 조작하려는 사용자로부터 안전하게 보호할 수 있다.
- 최신 자바 런타임에서 이해하고 사용할 수 있는 메타데이터가 포함된 적절한 배포 단위이며, 자바 타입 시스템에서 표현된다.

#### 모듈의 목표
- 배포 단위를 가능한 한 서로 독립적으로 만드는 것이다.
- 실제 애플리케이션은 관련 기능을 제공하는 모듈의 그룹에 종속될 수 있지만, 모듈은 개별적 로드 및 링크될 수 있도록 설계된다.