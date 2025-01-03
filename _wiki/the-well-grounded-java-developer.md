---
layout  : wiki
title   : 기본기가 탄탄한 자바 개발자(The well-grounded java developer)
summary :
date    : 2024-12-21 18:00:00 +0900
updated : 2024-12-25 17:00:00 +0900
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

#### 프로젝트 직소
> OpenJDK 내 프로젝트는 프로젝트 직소(Project jigsaw)로 알려져 있다.

**OpenJDK 프로젝트의 모듈화 목표**
- JDK 플랫폼 소스 모듈화하기
- 프로세스 풋프린트 줄이기
- 애플리케이션 시작 시간 개선하기
- JDK와 애플리케이션 코드에서 모듈 사용할 수 있게 하기
- 자바에서 처음으로 진정한 의미의 엄격한 캡슐화 허용
- 이전에는 불가능했던 새로운 접근 제어 모드를 자바 언어에 추가하기

해당 목표는 JDK와 자바 런타임에 밀접하게 초점을 맞춘 후 아래와 같은 다른 목표로 추진됐다.

**추진된 목표**
- 단일 모놀리식 런타임 JAR 끝내기
- JDK 내부를 적절히 캡슐화해서 보호하기
- 외부에 영향 없이 주요 내부의 변경 가능하게 하기
- 모듈을 슈퍼 패키지로 도입하기

#### 모듈식 자바 런타임
- 이전 JAR 형식은 클래스들을 포함하는 zip 파일일 뿐이다.
- 모듈은 프로그램의 생명 주기에서 서로 다른 시점(컴파일/링크타임, 런타임)에 사용되는 각 형식(JMOD, JIMAGE)을 제공한다.
- JMOD : 네이티브 코드를 단일 파일의 일부로 포함할 수 있도록 수정됐다. -> 하지만, 모듈식 JAR로 패키징하는게 더 좋다.
- JIMAGE : 자바 런타임 이미지를 나타내는 데 사용된다.
  ```shell
  $ jimage info $JAVA_HOME/lib/modules
  # or jimage list $JAVA_HOME/lib/modules
  Major Version:  1
  Minor Version:  0
  Flags:          0
  Resource Count: 30672
  Table Length:   30672
  Offsets Size:   122688
  Redirects Size: 122688
  Locations Size: 633083
  Strings Size:   682215
  Index Size:     1560702
  ```

#### 내부 캡슐화
- 플랫폼 내부를 변경하며 가장 큰 장애물은 접근 제어에 대한 접근 방식이 있다.
  - `public, private, protected, package-private`
  - 이러한 수정자는 클래스 레벨 이상에서만 적용된다.
- 과거에는 내부 구조에 접근하기 위해 우회 방법을 사용하는 것이 타당하게 받아들여졌다.
- 플랫폼의 성숙도가 높아지면서 원하는 기능에 대한 공식적인 접근법이 추가됐다.
- 하지만, 보호되지 않는 내부 기능은 플랫폼의 취약점이 되었다.

### 모듈 그래프
- 모듈이 서로 의존하는 방식을 나타낸다.
- 유향 비순환 그래프여야 한다. (순환 의존성이 있을 수 없다)

#### JDK 모듈 그래프
![image](https://github.com/user-attachments/assets/54847e2c-110f-481c-8018-9526b6d25a85)

- java-base는 모든 모듈의 의존성이다. (암시적으로 제거해 표현하는 경우도 있다)
- java 8은 표준 런타임에 1,000개에 달하는 패키지가 있었다.
  - 그래프 그리는 것이 불가능할 정도이다.
  - 의존성이 너무 복잡해 사람이 이해하기 어려웠다.

### 내부 보호
1. java 8에서는 내부 클래스를 확장하여 직접 액세스하는 경우가 있었다.
2. 컴파일을 시도하면 내부 API에 액세스한다는 경고가 표시됐다.
3. 하지만, 컴파일러는 액세스를 허용하는 것이다.
4. 호출된 코드가 이동하거나 교체되면 끊어진다.

일반적인 문제다. 이에 대한 해결책은 자바의 접근 제어 모델을 변경하는 것이다.

### 새로운 접근 제어
#### package export
- java 8 이전엔 모든 패키지의 공개 클래스에 있는 공개 메서드를 호출할 수 있었다.
- 샷건 프라이버시라고 부르기도 한다.
  - 펄 언어를 비꼬는 내용인데, 프라이버시에 대한 집착이 없으며, 샷건을 가지고 있기 때문이 아니라 초대되지 않았기 때문에 거실에 들어오지 않기를 바란다는 뜻이다.
- 자바는 점점 더 많은 라이브러리가 내부 API를 사용하고 있었고, 장기적으로 보안을 해칠 위험이 있었다.
- java 8 이전엔 전체 패키지에 접근 제어를 적용할 방법이 없었다.
  - java, javax로 시작하는 모든 것이 공개 API이고, 모든 것은 내부 전용이라는 관습만 갖고 있었다.
  - 클래스 로딩 메커니즘은 이를 강제하지 않는다.
- 모듈을 사용하면 exports 키워드를 통해 공용 API로 간주되는지 나타낼 수 있다.

### 기본적인 모듈 구문