---
layout  : wiki
title   : 기본기가 탄탄한 자바 개발자(The well-grounded java developer)
summary :
date    : 2024-12-21 18:00:00 +0900
updated : 2025-01-20 13:00:00 +0900
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

#### JVM 동작
1. javac로 .class 파일 생성
2. 저장소에 있는 .class파일을 JVM메모리로 로딩 
   - 동적 로딩 기반
   - 클래스 로더의 단점은 로딩만 할 수 있고, 언로딩은 불가
     - 기존 스프링부트 서버를 생각하면, 언로딩을 하지 않고 계속해서 로딩
     - 가비지 컬렉션에서 처리하는 것과는 다른 언로딩인가?
3. .class를 변환작업을 거쳐 새로운 .class 생성
   - compiler가 .class파일로 변환할 때와 JVM이 .class 파일로 변환할 때의 차이
4. 새로 생성된 .class를 JIT컴파일러로 컴파일하여 기계어로 변환
   - 핫스팟으로 지정된 건 기계어로 실행
     - 핫스팟이란 무엇인가?
   - 핫스팟에 대한 판단 역할은 JDK
     - OpenJDK, correta 등 환경마다 다름

#### JVM실행 모드에 대한 이해
1. 인터프리터로만 실행
   - JVM의 주 동작은 인터프리팅
2. 인터프리터로 실행하다가 JIT컴파일하여 기계어로 실행
   - 인터프리터로 실행하고, JIT컴파일 안 하는게 좋다. (빠른 스타트, 느린 실행)
3. .class를 기계어로 컴파일 하는 컴파일러는 c1, c2가 있음
   - JIT컴파일러가 느리기 때문에 모든 JVM 내 c1, c2 내장
   - c1 : 최적화 안 하고 빠르게 실행하기 때문에 낮은 성능
   - c2 : 인라인, 데드트래킹 등을 하는데 느린 속도
4. c1으로만 실행 또는 c2로만 실행
   - `java -XX options`
   - c1 컴파일러로 동작하게 실행하면 실행 할때마다 JIT로 계속 컴파일

#### 클래스 로딩 후 바이트코드 조작
1. 자바 에이전트를 이용함
2. 자바 에이전트도 자바로 작성한 jar파일임
3. java.lang.instrument 패키지의 다양한 기능을 사용
4. 실행 시 에이전트 옵션을 넣고 실행
   - `java -javaagent:agent.jar -cp . MyClass`
5. 에이전트에 의한 바이트코드 조작은 컴파일타임에는 인지할 수 없음
6. 따라서 모니터링이나 코드 커버리지 계산 등 부수작업에 흔히 사용됨
7. 하지만, AspecJ처럼 AOP에도 사용될 수 있고 인터페이스로 조작하면 Annotation Processor 없이 비슷한 동작 가능
   - JPA는 AOP임. 엄청 느리다. 특히 Kotlin을 사용하면 KSP로 한 번 더 감싸기 때문에 엄청 느려짐



### 릴리즈 로드맵

![image](https://github.com/user-attachments/assets/6eaa7350-7a0b-40e3-8c78-223daa6e37a0)

- 6개월마다 주요 릴리즈

### 향상된 타입 추론

- [LVTI Guide](https://openjdk.org/projects/amber/guides/lvti-style-guide)
- 단순한 초기화에서, 오른쪽이 생성자 또는 정적 팩토리 메서드에 대한 호출인 경우
- 명시적 타입을 제거하면 반복되거나 중복된 정보가 삭제되는 경우
- 변수 이름만으로도 타입을 알 수 있는 경우
- 로컬 변수의 범위와 사용법이 짧고 간단한 경우

#### 시스템
- Java : 지역 변수 선언 시점의 컨텍스트만 고려
- Kotlin : 빌더가 되는 람다 내의 내용까지 고려

#### type interface
```java
List<Integer> before = Collections.<Integer>emptyList();
List<Integer> after = Collections.emptyList();
```

#### diamond syntax
```java
Map<Integer, Map<String, String>> beforeUserLists = new HashMap<Integer, Map<String, String>>();
Map<Integer, Map<String, String>> afterUserLists = new HashMap<>();
```

#### lambda
```java
Function<String, Integer> lengthFn = s -> s.length();
```

#### LVTI, local variable type interface
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

#### Nondenotable type
```java
var duck = new Object() {
    void quack() {
        System.out.println("Quack!");
    }
};

duck.quack();
```

#### var 쓸만할 때
1. 익명클래스를 명시적으로 선언하지 않아도 자동화됨
2. for(var item : collection)에서 특히 효과적
3. 람다 인자에 Annotation 넣고 싶을 때
   `Consumer<Person> f = (@Nonnull var person) -> {..}`

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
#### 모듈 기술자(`module-info.java`)
포함되는 내용
- 모듈 이름
- 모듈 의존성
- 공개 API(내보낸 패키지)
- 리플렉션 액세스 권한
- 제공되는 서비스
- 소비되는 서비스

#### 모듈 내보내기 및 의존 모듈 선언하기
모듈 내보내기
```java
exports com.currenjin;
```

- `java.base` 모듈은 항상 모든 모듈의 암시적 의존성이어서 `module-info.java`에 선언할 필요가 없다.
- `java.lang`이 모든 자바 클래스에 대해 암시적으로 임포트되는 것과 같은 방식이다.

모듈 이름에 대한 기본 규칙과 관례
- 모듈은 글로벌 네임스페이스에 있다.
- 모듈 이름은 고유해야 한다.
- 가능하면 표준적으로 `com.company.project`를 사용한다.

#### 전이성(Transitivity)
A가 B를 필요로 하는 상황
1. A는 B에서 직접적으로 의존해야 하는 어떤 타입도 export하지 않는다.
2. A가 직접적으로 의존해야 하는 타입 일부 API에 B를 포함한다.

A가 B에 정의된 타입을 반환하는 메서드를 내보내는 경우, A의 클라이언트도 B를 의존하지 않는 한 A를 사용할 수 없게 되며, A의 클라이언트에게 불필요한 오버헤드를 초래할 수 있다.

`requires transitive` : 위 문제를 해결하기 위해 제공
- 모듈 A가 다른 모듈을 전이적으로 필요한 경우 A에 종속된 모든 코드는 암시적으로 전이적 의존성도 함께 가져온다.
- 전이성 사용을 최소화하는 것이 권장된다.

### 모듈 전이성과 클래스로딩 문제
1. 기존 : 패키지 바다에서 의존성이 연결된 클래스파일을 모아 로딩
2. 모듈 : 클래스로더가 모듈의존성 그래프에 기반하여 관련된 모듈 내 클래스를 일제히 로딩
3. 모듈 전체가 아니라 필요한 클래스만 골라서 로딩
4. but, 전이성 설정을 비롯하여 internal 작성이 유도됨에 따라 폭발정인 클래스 의존성이 쉽게 작성되는 경향이 강함

#### 모듈 캐노니컬
1. 기존 : 클래스 캐노니컬 충돌이 생김
2. 모듈 : 모듈 캐노니컬 충돌이 생김
3. 기존 해결 방식 : 클래스 로더를 분리하여 각각 로딩할 수 있음
4. 모듈 해결 방식 : 없음. 직소는 모든 모듈을 하나의 이름공간으로 관리

### 모듈 로드
클래스 로딩에 대한 모듈식 접근 방식의 기본 원칙
- 모듈은 과거 방식의 클래스 패스가 아닌 모듈 패스에서 해결한다.
- 시작 시 JVM은 비순환적이어야 하는 모듈 그래프를 확인한다.
- 하나의 모듈은 그래프의 루트이며 실행이 시작되는 곳이다.
  - 이곳에 진입점이 될 메인 메서드가 있는 클래스를 포함한다.

#### Platform Module
> 모듈형 JDK 자체의 모듈

#### Application Module(Library Module)
> 모듈화된 의존성 또는 애플리케이션 자체를 나타내는 모듈

#### Automatic Module
> 모듈 패스로 옮기고 클래스 패스에서 제거한 JAR 파일

#### Unnamed Module
> 클래스 패스에 있는 모든 클래스와 JAR가 추가되는 단일 모듈

### jlink
1. 설치형 프로그램을 만들기 좋음. msi, dmg 등 생성
2. OS별 서명, 메타정보 등을 지원하지는 않음
3. 코틀린 컴포즈 테스크톱 등이 사용
4. 자동모듈을 활용

## 자바 17

### Text block(ver.13,14,15)
```java
"""hello, %s""".formatted(name) // name이 String이 아니라면 런타임에러
```

### Text Template(ver.21,22,23)
```java
FMT."""hello, %s""".formatted(name) // 컴파일 시 타입 검사
```

### Switch 식(ver.14,...,23 preview)
- Preview가 아주 길게 이어지고 있다. (정식 버전이 아님)
- 계속 지켜봐야 한다.

### 객체와 값 객체
1. 이론적으로 객체지향의 입출력은 모두 객체를 통해야 한다.
2. 유일한 예외는 생성으로 생성 시에는 값을 할당한다.
3. 결국 객체는 값을 감싸 행동으로 추상화한 무언가다.
4. 하지만 객체가 아닌 구조체가 존재한다.
5. 구조체는 관계없는 값이 집합으로 묶여있는 것이다.
6. 이런 구조체는 값 특성을 강화(값객체) 또는 집합이라는 점에 집중(러스트)한다.
7. 값은 불변성과 복사를 통한 할당이라는 특징을 가져야 한다.
8. 하지만 값 객체는 불변성만 내장하고 참조를 공유한다.

### 값 객체와 record
1. 레코드는 값객체 생성을 지원한다.
2. 각 속성의 불변성, 값을 통한 비교 등을 지원한다.
3. final 클래스로 선언되며 암묵적으로 Record를 상속한다.
4. 인터페이스를 구상할 수 있다.(sealed interface와 결합)
5. equals, hashCode, toString의 오버라이드를 허용한다.
   1. 기존 생태계의 디버깅, 직렬화 등과의 호환성을 고려한다.
   2. 철학적으로 커스터마이징 가능성을 위배하지 않기 위함이다.

### Sealed 추상화
1. 허용범위 : 선언된 모듈 - 모듈 전체, 무명 모듈 - 패키지
2. 합타입(sum) 또는 대수타입을 정의한다.
3. 하위 타입이 이미 알려져있어 OOP적 해석으로는 위반된다.
4. 타입분기를 통해 값 분기를 타입 분기로 대체할 수 있다.
5. permits가 귀찮다.
    - 어설픈 모듈 정책으로 범위 산정이 어렵다. -> 같은 패키지에 있는게 속편하다.
    - 기명 모듈 - permits가 모듈 내 타입이면 통과한다.
    - 무명 모듈 - permits의 타입이 같은 패키지여야 한다.

## 클래스 파일과 바이트코드
### 요약
- 클래스 파일 형식과 클래스 로딩은 JVM의 핵심이다. 가상머신에서 실행하는 모든 언어에 필수이다.
- 다양한 단계의 클래스 로딩을 통해 런타임에 보안과 성능 기능을 모두 구현할 수 있다.
- JVM 바이트코드는 관련 기능을 가진 제품군으로 구성된다.
- javap를 사용해 클래스 파일을 분해하면 하위 레벨을 이해하는 데 도움이 될 수 있다.
- 리플렉션은 자바의 주요 기능이다.

### 클래스 로딩
> 실행 중인 JVM 프로세스에 새로운 클래스를 통합하는 프로세스

1. CustomLoader로 로딩한 클래스는 코드상 강타입이 되지 않는다.
2. 클래스의 정체성은 FQCN + Loader이기 때문에 컴파일은 통과한다.
   - 런타임 내 CustomLoader의 instance는 캐스팅에러
3. CustomLoader를 강타입으로 사용하고자 한다면, 추상층은 App ClassLoader 로딩을 한다.
   - 구상 클래스만 로딩하여 외부에서 추상층으로 전달
   - 매우 복잡한 구조가 됨

#### Example
```java
Class<?> clazz = Class.forName("MyClass");
```

`MyClass`라는 클래스를 현재 실행 상태로 로드한다.
1. `MyClass`라는 이름에 해당하는 클래스 파일을 찾는다.
2. 해당 파일에 포함된 클래스를 해석한다.
   1. 위 단계는 네이티브 코드에서 수행되며, 핫스팟에서는 `JVM_DefineClass()`라는 네이티브 메서드가 이를 담당
   2. 높은 수준에서 네이티브 코드가 `JVM`의 내부 표현(Internal representation)을 빌드(klass)
3. `JVM`은 `klass`의 자바 미러를 생성하고 `Class` 객체로 자바 코드에 반환된다.
   1. 실행 중인 시스템에서 `Class` 객체를 사용 가능
   2. 해당 클래스의 새로운 인스턴스 생성 가능

> clazz는 MyClass 타입에 해당하는 Class 객체를 보유하고, klass는 자바 객체가 아닌 JVM 내부 객체여서 clazz가 보유할 수 없다.

#### 로딩과 링킹

> JVM은 하나의 실행 컨테이너로 볼 수 있다. JVM의 목적은 클래스 파일을 소비하고 그 안에 포함된 바이트코드를 실행하는 것이다.

1. 클래스 파일을 구성하는 바이트 데이터 스트림을 가져오는 것
2. 스트림을 파싱하여 유효한 클래스 파일 구조를 포함하고 있는지 확인(형식 검사, format checking)
3. 포함한다면 후보 klass 생성
4. 이제 클래스를 링크한 후 초기화하면 사용 가능
   1. 검증
      - 바이트코드가 허용되지 않거나 악의적인 방법으로 스택 조작 시도를 확인
      - 모든 분기 명령어(if or loop)에 적절한 대상 명령어가 있는지 확인
      - 메서드가 올바른 정적 유형의 매개변수 수로 호출되는지 확인
      - 로컬 변수에 적절한 타입의 값만 할당됐는지 확인
      - 던질 수 있는 각 예외에 적절한 캐치 핸들러가 있는지 확인
   2. 준비
      - 메모리 할당 후 클래스 정적 변수를 초기화할 수 있도록 준비
      - 변수를 초기화하거나 JVM 바이트코드를 실행하지는 않음
   3. 해결
      - 링킹할 클래스의 상위 유형(및 클래스가 구현하는 모든 인터페이스)이 이미 링킹됐는지 확인
      - 그렇지 않으면 클래스 링크 전에 해당 타입을 링크(재귀 링크 프로세스 발생 가능)
   4. 초기화
      - 모든 정적 변수 초기화 및 모든 정적 초기화 블록 실행
      - JVM이 새로 로드된 클래스의 바이트코드를 실행

### 클래스 객체
> 로딩와 링킹 프로세스의 최종 결과는 새로 로드되고 링크된 타입을 나타내는 `Class` 객체

- 상위 타입에 해당하는 `Class` 객체를 반환하는 `getSuperclass()` 등 여러 유용한 메서드를 제공한다.
- `Method`, `Field` 그리고 클래스의 멤버에 대한 참조가 존재한다.

### 클래스 로더
#### BootstrapClassLoader(or PrimordialClassLoader)
- `java.base` 로드 시 사용된다.
- `JVM` 시작 프로세스의 초기에 인스턴스화된다.(JVM의 일부)

#### PlatformClassLoader
- 애플리케이션이 의존하는 나머지 플랫폼 모듈을 로드한다.
- 모든 플랫폼 클래스에 액세스하기 위한 기본 인터페이스이다.(내부 클래스의 인스턴스)

#### AppClassLoader
- 애플리케이션 클래스를 로드한다.
- 최신 자바 환경에서 대부분의 작업을 수행한다.

#### CustomClassLoader
- ClassLoader를 서브클래싱할 수 있다.
- ClassLoader class가 final이 아니기 때문에 가능하다.

#### 클래스로더 계층구조
![image](https://github.com/user-attachments/assets/2afa1147-8fef-4f02-9161-91d96af9230e)

## 동시성
### 요약
- 자바의 스레드는 저수준 추상화다.
- 멀티스레딩은 자바 바이트코드에서도 사용된다.
- 자바 메모리 모델은 매우 유연하지만 최소한의 보장만 제공한다.
- 동기화는 협력적인 메커니즘이다. 모든 스레드가 참여하여 안정성을 보장해야 한다.
- `Thread.stop()` 또는 `Thread.suspend()`는 사용하지 말자.

### 동시성 이론
#### `java.util.concurrent`
- 블록 구조 동시성(block-structured concurrency)
- 동기화 기반 동시성(synchronization-based concurrency)
- 클래식 동시성(classic concurrency)

#### 하드웨어
- 동시성 프로그래밍은 근본적으로 성능에 관한 것이다.
- 실행 중인 시스템의 성능이 직렬 알고리즘으로 작동하기에 충분하다면 기본적으로 동시성 알고리즘을 구현할 이유가 없다.
- 모든 자바 프로그램은 멀티 스레드이며, 애플리케이션 스레드가 하나만 있는 프로그램도 마찬가지다.
    - JVM 자체가 다중 코어를 사용할 수 있는 멀티스레드 바이너리이다.(JIT 컴파일 또는 가비지 컬렉션)
    - 표준 라이브러리에는 런타임이 관리하는 동시성을 사용해 멀티스레드 알고리즘을 구현했다.

#### 암달의 법칙
> 여러 실행 단위에서 공유할 때의 효율성을 추론하기 위한 대략적인 모델이다.

```
T(N) = s + (1/N) * (T1 - s)
```

#### 스레드 모델
> - 공유되며 기본적으로 보이는 가변상태
> - 운영체제에 의한 선점형 스레드 스케줄링

가장 중요하게는,
- 객체는 프로세스 내의 모든 스레드 간에 쉽게 공유할 수 있다.
- 객체에 대한 참조가 있는 모든 스레드에서 객체를 변경할 수 있다.
- 스레드 스케줄러는 언제든지 코어에 스레드를 할당하거나 제거할 수 있다.
- 메서드는 실행 중에도 교체할 수 있어야 한다.
- 예측 불가능한 스레드 스왑이 발생해 메서드가 완료되지 않아 일관되지 않은 상태로 남을 위험이 있다.
- 취약한 데이터를 보호하기 위해 객체를 잠글 수 있다. `synchronized`

### 디자인 컨셉
- 안정성(동시성 타입 안정성)
- 활성성
- 성능
- 재사용성

#### 안정성(동시성 타입 안정성)
> 다른 동작들이 동시에 발생하는 상황에서도 객체 인스턴스가 항상 자기 일관성을 유지하도록 보장한다.
> 
> 시스템은 안전하다거나, 동시에 타입이 안전하다고 한다.

예시로 아래 코드가 있다고 생각해보자.
```java
public class StringStack {
	private String[] values = new String[16];
	private int current = 0;

	public boolean push(String s) {
		// 예외 생략
		if (current < values.length) {
			values[current++] = s;
			current = current + 1;
			return true;
		}
		return false;
	}

	public String pop() {
		if (current < 1) {
			return null;
		}
		current = current - 1;
		return values[current];
	}
}
```

단일 스레드에서 사용할 때는 괜찮은데, 선점형 스레드 스케줄링은 문제를 일으킬 수 있다.
```java
public boolean push(String s) {
    if (current < values.length) {
        values[current++] = s;
        // 이곳에서 컨텍스트 스위칭이 발생한다면? 
        current = current + 1;
        return true;
    }
    return false;
}
```
위 상황에서, `values`는 업데이트 됐지만 `current`가 업데이트되지 않는다.

한 마디로, 위 상황에서는 객체가 일관되지 않은 상태로 남게된다는 뜻이다.

> 이를 위한 한 가지 전략은 일관되지 않은 상태의 비공개(nonprivate)가 아닌 메서드에서는 절대 반환하지 않고, 일관되지 않은 상태에서 비공개가 아닌 어떤 메서드도 호출하지 않는 것이다. 일관되지 않은 상태에서 객체를 보호하는 방법(synchronized-lock or critical section)과 결합한다면 시스템은 안전을 보장하게 된다.

#### 활성성
> 모든 시도된 작업이 최종적으로 진행되거나 실패하는 시스템을 말한다.
> 
> 활성성이 없다면, 고착상태이지만 성공이 진행되지도 실패하지도 않는다.

- 잠금 또는 잠금 획득 대기
- 네트워크 I/O 등의 입력 대기
- `asset`의 일시적인 오류
- 스레드 실행 시간이 충분치 않음

일반적인 원인으로는,
- Deadlock(교착상태)
- 복구 불가능한 `asset`(ex, NFS 등이 사라짐)
- Missed signal(신호 누락)

#### 성능
> 주어진 리소스로 얼마나 많은 작업을 수행할 수 있는지 측정할 수 있는 척도

#### 재사용성
> 작성 예정

#### 오버헤드
내재적 원인
- 모니터(예, 잠금 및 조건 변수)
- 컨텍스트 스위치 수
- 스레드 수
- 스케줄링
- 메모리 위치
- 알고리즘

### 블록 구조 동시성(Before ver.5)
#### synchronized
은행 계좌에서 돈을 인출하는 메서드가 있다.
```java
public synchronized boolean withdraw(int amount) {
    if (balance >= amount) {
        balance = balance - amount;
        return true;
    }

    return false;
}
```

메서드는 객체 인스턴스에 속한 잠금을 획득해야 한다. 한 번에 한 스레드만 객체의 동기화된 블록이나 메서드를 통과할 수 있다. 만약, 다른 스레드가 시도하면 JVM에 의해 일시 중단된다. (`critical section`)

- 원시타입이 아닌 객체만 잠글 수 있다.
- 객체들의 배열을 잠가도 개별 객체는 잠기지 않는다.
- 동기화된 메서드는 전체 메서드를 포괄하는 `synchronized (this)` 블록과 동일하다고 생각할 수 있다. (바이트코드에선 다르다)
- `static synchronized` 메서드는 잠글 인스턴스가 없어 `Class`를 잠근다.
- 내부 클래스의 동기화는 외부 클래스와 독립적이다.
- 동기화되지 않은 메서드는 잠금 상태를 고려하지 않는다. 해당 메서드는 동시에 실행이 가능하고, 동기화된 메서드가 실행 중일 때도 진행이 가능하다.
- 자바의 잠금은 재진입이 가능하다. 재진입은 한 스레드가 이미 보유한 잠금을 다시 얻을 수 있는 특성이다. 
  - 동일한 객체에 대해 `synchronized` 메서드가 다른 `synchronized` 메서드를 호출하는 경우 이미 잠금을 보유하고 있는 스레드는 다른 동기화 지점을 만나더라도 계속 진행할 수 있다.

#### 스레드의 상태 모델
<img width="500" alt="Image" src="https://github.com/user-attachments/assets/8288c0b6-8037-4cff-a705-ef85f3d23605" />

1. 자바 스레드 객체는 처음에 `NEW` 상태로 생성
   1. OS 스레드는 아직 존재하지 않으며 그 후로도 존재하지 않을 수 있다.
   2. 실행 스레드를 생성하려면 `Thread.start()`를 호출해야 한다.
2. 스케줄러는 새로운 스레드를 실행 대기열에 배치하고 나중에 실행할 코어를 찾는다.
   1. 스레드는 할당받은 시간을 소모해서 계속 진행하다 다시 실행 대기열에 배치돼 추가적인 프로세서 시간 할당을 기다릴 수 있다.
   2. 코어에 배치돼 실행되고, 다시 실행 대기열에 배치되는 이 스케줄링 프로세스 내내 자바 객체는 `RUNNABLE` 상태이다.
   3. 스레드 자체도 자신이 현재 코어를 사용할 수 없음을 나타낼 수 있다.
      1. 프로그램 코드는 `Thread.sleep()`을 호출하여 스레드가 진행하기 전에 일정 시간을 기다려야 함을 나타낸다.
         - 일정 시간 동안 절전 모드를 요청한다. 자바 스레드가 `TIMED_WAITING` 상태로 전환되고 운영체제가 타이머를 설정한다.
         - 타이머가 만료되면 잠자고 있던 스레드가 깨어나 다시 실행할 준비가 돼 실행 대기열에 다시 배치된다.
      2. 스레드가 어떤 외부 조건이 충족될 때까지 기다려야 함을 인식하고 `Object.wait()`을 호출한다.
         - 자바의 객체별 모니터의 조건 측면을 사용한다. 이 경우 `WAITING` 상태로 전한돼 무기한 대기한다.
         - 운영체제에서 조건이 충족됐다는 신호(`Object.notify()`)를 보낼 때까지 스레드는 깨어나지 않는다.
      3. 스레드가 I/O를 대기 중이거나 다른 스레드가 보유한 잠금을 획득하기 위해 `BLOCKED` 상태로 전환될 수 있다.
      4. 자바 스레드에 해당하는 OS 스레드가 실행을 중단한 경우 해당 스레드 객체는 `TERMINATED` 상태로 전환된다.

#### 완전히 동기화된 객체
- 모든 필드는 모든 생성자에서 일관된 상태로 초기화된다.
- `public` 필드가 없다.
- 객체 인스턴스는 비공개 메서드에서 반환된 후에도 일관성이 보장된다.
- 모든 메서드는 유한한 시간 안에 종료된다는 것이 증명돼야 한다.
- 모든 메서드는 동기화돼야 한다.
- 어떤 메서드도 불일치한 상태에서 다른 인스턴스의 메서드를 호출하지 않는다.
- 어떤 메서드도 불일치한 상태에서 현재 인스턴스의 비공개 메서드를 호출하지 않는다.

```java
public class FSOAccount {
    private double balance;

    public FSOAccount(double openingBalance) {
        this.balance = openingBalance;
    }

    public synchronized void deposit(int amount) {
        balance += amount;
    }

    public double getBalance() {
        return balance;
    }
}
```
- 잔액에 대한 모든 접근을 조정하기 위해 `synchronized`를 사용해야 한다.
- 이러한 잠금이 결국 성능을 저하시킨다.

#### 교착상태
교착상태에 대해 알아보기 위해 `FSOAccount` 클래스 내 이체를 위한 메서드를 추가한다.
```java
public synchronized boolean transferTo(FSOAccount other, int amount) {
    try {
        Thread.sleep(10);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }

    if (amount >= balance) {
        balance -= amount;
        other.deposit(amount);
        return true;
    }

    return false;
}
```

그리고 이를 사용하는 `Main` 클래스다.
```java
public class FSOMain {
    private static final int MAX_TRANSFERS = 1_000;

    public static void main(String[] args) throws InterruptedException {
        FSOAccount a = new FSOAccount(10_000);
        FSOAccount b = new FSOAccount(10_000);

        Thread tA = new Thread(() -> {
            for (int i = 0; i <MAX_TRANSFERS; i++) {
                boolean ok = a.transferTo(b, 1);
                if (!ok) {
                    System.out.println("Thread A failed at " + i);
                }
            }
        });

        Thread tB = new Thread(() -> {
            for (int i = 0; i <MAX_TRANSFERS; i++) {
                boolean ok = b.transferTo(a, 1);
                if (!ok) {
                    System.out.println("Thread B failed at " + i);
                }
            }
        });

        tA.start();
        tB.start();
        tA.join();
        tB.join();

        System.out.println("End: " + a.getBalance() + " : " + b.getBalance());
    }
}
```

FSOAccount의 Thread.sleep() 코드는 스레드 스케줄러가 두 개의 스레드를 실행해 교착상태를 일으킬 수 있도록 하기 위한 것이다.

### 메모리 모델

### 바이트 코드

## 자바 성능6