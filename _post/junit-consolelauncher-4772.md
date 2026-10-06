---
layout: "post"
title: "JUnit ConsoleLauncher — 잘못된 classpath root 감지 및 로깅 개선 (#4772)"
date: "2025-08-18 00:00:00 +0900"
updated: "2025-08-18 00:00:00 +0900"
public: true
source_name: "Medium"
source_url: "https://medium.com/@jung23e/junit-consolelauncher-%EC%9E%98%EB%AA%BB%EB%90%9C-classpath-root-%EA%B0%90%EC%A7%80-%EB%B0%8F-%EB%A1%9C%EA%B9%85-%EA%B0%9C%EC%84%A0-4772-1b07dce63fa9?source=rss-a0ae377eb2b1------2"
source_date: "2025-08-18"
---

### JUnit ConsoleLauncher — 잘못된 classpath root 감지 및 로깅 개선 (#4772)

### Intro: 호기심

평소에 TDD를 즐겨하면서 JUnit은 늘 옆에 두고 쓰던 도구였다. 그러다 오픈소스 기여 모임에서 JUnit 이슈 목록을 살펴보다가, 콘솔 런처(ConsoleLauncher)에서 잘못된 classpath root를 감지하지 못하는 문제([#4772](https://github.com/junit-team/junit-framework/issues/4772))를 발견했다. “**비교적 단순하지만, 분명 유용한 개선”** 이라는 생각이 들어 작업을 시작했다.

![](https://cdn-images-1.medium.com/max/1024/1*8zn7M5PkgQGR8GGVWURCnw.png)

### 문제: Silently ignored Invalid path

이슈의 핵심은 --scan-class-path 옵션을 사용했을 때, 존재하지 않거나 읽을 수 없는 classpath root가 있으면 아무 경고 없이 넘어간다는 것이었다. 이로 인해 사용자는 테스트가 하나도 발견되지 않아도 원인을 파악하기 어려웠다. ([옵션 가이드 참고](https://docs.junit.org/5.10.0/user-guide/index.html#discovering-tests))

```text
$ java -jar junit-platform-console-standalone/build/libs/junit-platform-console-standalone-6.0.0-SNAPSHOT.jar \
  execute \
  --class-path=build/classes/java/test \
  --scan-class-path=/does/not/exist


💚 Thanks for using JUnit! Support its development at https://junit.org/sponsoring

╷
├─ JUnit Platform Suite ✔
├─ JUnit Jupiter ✔
└─ JUnit Vintage ✔

Test run finished after 19 ms
[         3 containers found      ]
[         0 containers skipped    ]
[         3 containers started    ]
[         0 containers aborted    ]
[         3 containers successful ]
[         0 containers failed     ]
[         0 tests found           ]
[         0 tests skipped         ]
[         0 tests started         ]
[         0 tests aborted         ]
[         0 tests successful      ]
[         0 tests failed          ]
```

### 원인: determineClasspathRoots()

문제 해결을 위해 DiscoveryRequestCreator 내부에서 classpath root를 수집하는 로직을 찾아냈다. (IDEA에서 --scan-class-path를 검색했다)

```text
class DiscoveryRequestCreator {
 // ...

 private static List<? extends DiscoverySelector> createDiscoverySelectors(TestDiscoveryOptions options) {
  List<DiscoverySelector> explicitSelectors = options.getExplicitSelectors();
  if (options.isScanClasspath()) {
   Preconditions.condition(explicitSelectors.isEmpty(),
    "Scanning the classpath and using explicit selectors at the same time is not supported");
   return createClasspathRootSelectors(options);
  }
  // ...
  return Preconditions.notEmpty(explicitSelectors,
   "Please specify an explicit selector option or use --scan-class-path or --scan-modules");
 }


 private static List<ClasspathRootSelector> createClasspathRootSelectors(TestDiscoveryOptions options) {
  Set<Path> classpathRoots = determineClasspathRoots(options);
  return selectClasspathRoots(classpathRoots);
 }


 // 해당 함수가 중요하다
 private static Set<Path> determineClasspathRoots(TestDiscoveryOptions options) {
  var selectedClasspathEntries = Preconditions.notNull(options.getSelectedClasspathEntries(),
   () -> "No classpath entries selected");
  if (selectedClasspathEntries.isEmpty()) {
   Set<Path> rootDirs = new LinkedHashSet<>(ReflectionUtils.getAllClasspathRootDirectories());
   rootDirs.addAll(options.getExistingAdditionalClasspathEntries());
   return rootDirs;
  }
  return new LinkedHashSet<>(selectedClasspathEntries);
 }
}
```

- determineClasspathRoots 메서드는 테스트 클래스의 시작점인 classpath root 목록을 리스트업 한다.
- 쉽게말해, JUnit이 “이 경로에서 테스트할거야” 라고 판단하는 최종 경로 리스트를 만드는 곳이다.
- 잘못된 경로가 이곳에서 걸러지지 않는다면, 이후 로직에서 사용자는 테스트가 왜 안 뜨는지도 모르고 0 test found 를 보게된다.

### 해결: validateAndLogInvalidRoots()

validateAndLogInvalidRoots() 메서드를 추가해, 다음 조건을 만족하지 않는 경로는 INFO 레벨로 로깅하도록 했다. ([로깅은 Logger 참고](https://docs.junit.org/5.13.1/api/org.junit.platform.commons/org/junit/platform/commons/logging/Logger.html))

- 존재 여부 (Files.exists())
- 읽기 가능 여부 (Files.isReadable())
- 디렉토리 또는 JAR 여부 (isDirOrJar())

```text
private static Set<Path> determineClasspathRoots(TestDiscoveryOptions options) {
 var selectedClasspathEntries = Preconditions.notNull(options.getSelectedClasspathEntries(),
  () -> "No classpath entries selected");
 if (selectedClasspathEntries.isEmpty()) {
  Set<Path> rootDirs = new LinkedHashSet<>(ReflectionUtils.getAllClasspathRootDirectories());
  rootDirs.addAll(options.getExistingAdditionalClasspathEntries());
  return validateAndLogInvalidRoots(rootDirs);
 }
 return validateAndLogInvalidRoots(new LinkedHashSet<>(selectedClasspathEntries));
}

private static Set<Path> validateAndLogInvalidRoots(Set<Path> roots) {
 LinkedHashSet<Path> valid = new LinkedHashSet<>();
 HashSet<Path> seen = new HashSet<>();

 for (Path root : roots) {
  if (!seen.add(root))
   continue;

  boolean exists = Files.exists(root);
  boolean readable = Files.isReadable(root);
  boolean dirOrJar = isDirOrJar(root);

  if (!exists || !readable || !dirOrJar) {
   logger.info(
    () -> "Ignoring invalid search path root: %s (exists=%s, readable=%s, dirOrJar=%s)".formatted(root,
     exists, readable, dirOrJar));
   continue;
  }
  valid.add(root);
 }

 return valid;
}

private static boolean isDirOrJar(Path root) {
 return Files.isDirectory(root) || root.toString().endsWith(".jar");
}
```

### 테스트: logs\_when\_invalid\_search\_path\_present()

또한, 테스트에서 표현할 내용은 잘못된 경로를 INFO로그로 남기고 이를 로깅 시스템에서 확인하는 것이라고 생각했다. 이를 위해 LoggerFactory의 로그를 가로채 /does/not/exist 메시지를 확인하는 테스트를 추가했다.

```text
@Test
void logs_when_invalid_search_path_present() {
 LogRecordListener listener = new LogRecordListener();
 LoggerFactory.addListener(listener);
 try {
  var opts = new TestDiscoveryOptions();
  opts.setScanClasspath(true);
  opts.setSelectedClasspathEntries(List.of(Paths.get("/does/not/exist")));

  DiscoveryRequestCreator.toDiscoveryRequestBuilder(opts);

  boolean saw = listener.stream(DiscoveryRequestCreator.class).anyMatch(
   r -> String.valueOf(r.getMessage()).contains("/does/not/exist"));

  assertThat(saw).as("should log about invalid search path root").isTrue();
 }
 finally {
  LoggerFactory.removeListener(listener);
 }
}
```

### 배운 점 1

코드 수정 자체는 단순했지만, 몇 가지 예상치 못한 장벽이 있었다.

1. **재현 방법 파악**--scan-class-path 옵션이 실제로 어떤 실행 플로우를 타는지 찾는 데 시간이 걸렸다. 문서와 코드를 오가며 호출 경로를 파악했다.
2. **스타일 가이드 준수  
   -** String.format() → String.formatted() 변경  
   - LinkedHashSet을 파라미터 타입으로 쓰면 안 된다는 Error Prone 규칙 준수
3. **테스트 코드 작성**  
    단순히 경로를 검사하는 로직이라도, 실제 JUnit 실행 맥락에서 로그를 검증하는 테스트를 작성해야 했다. 이 과정에서 JUnit이 JUnit을 테스트하는 구조를 자연스럽게 이해하게 되었다.

### 결과: Before / After

**Before**

```text
0 tests found
```

**After**

```text
Ignoring invalid search path root: /does/not/exist (exists=false, readable=false, dirOrJar=false)
0 tests found
```

### 피드백 및 반영

#### **피드백 1 — 로그 레벨**

![](https://cdn-images-1.medium.com/max/975/1*k1N-G0fUy4tk5TNySpRSCQ.png)

- **내용:** “이 로그는 INFO가 아니라 WARN이어야 한다”는 제안과 함께, javac처럼 stderr 출력도 고려해보라는 의견이다.
- **반영:** 로깅 레벨을 WARN으로 변경하여 사용자 주의를 더 명확하게 끌 수 있도록 했다.

#### **피드백 2 — 메서드 선택**

![](https://cdn-images-1.medium.com/max/1024/1*1tuhvDjoeT0VjKxU7_lWaw.png)

- **내용:** getExistingAdditionalClasspathEntries()는 이미 존재하는 경로만 필터링하므로, 새로 추가한 존재 여부 검증 로직이 의미 없어진다. 대신 getAdditionalClasspathEntries()로 호출해 원본 리스트를 받고 직접 검증하라는 제안이다.
- **반영:** determineClasspathRoots()에서 getExistingAdditionalClasspathEntries() 호출을 getAdditionalClasspathEntries()로 변경하여, 필터링 전의 전체 목록을 받아 직접 검증하도록 수정했다.

#### **피드백 3 — 호출 위치**

![](https://cdn-images-1.medium.com/max/1024/1*PI5FGwNZPqqWvBCsyuLhrw.png)

- **내용:** validateAndLogInvalidRoots() 호출을 createClasspathRootSelectors() 단계로 옮기면 중복 호출을 방지할 수 있다는 의견이다.
- **반영:** 메서드 호출 위치를 조정하여 불필요한 반복 검증을 제거하고 로직을 단순화했다.

#### **피드백 4 — 테스트 코드 보강**

![](https://cdn-images-1.medium.com/max/1024/1*NwTnIZA2yLruZqrm0uyUcA.png)![](https://cdn-images-1.medium.com/max/1024/1*N7Cevp0UCflCQnKcNvYDjA.png)

**내용**

- setAdditionalClasspathEntries() 호출 경로를 커버하는 별도 테스트를 추가하라는 제안이다.
- TrackLogRecords를 활용해 로그 출력 여부를 검증하는 테스트 필요성 제안이다.
- 기존 테스트 메서드 네이밍이 snake case였던 것을 camel case로 변경하라는 요청이다.

**반영**

- setAdditionalClasspathEntries() 호출 시 비존재 경로가 포함된 경우 로그가 출력되는지 검증하는 doesNotLogInvalidAdditionalClasspathRoots() 테스트를 추가했다.
- TrackLogRecords를 활용하여 특정 경로 문자열이 WARN 로그로 기록되는지 검증 테스트를 작성했다.
- 기존 logs\_when\_invalid\_search\_path\_present → logsWhenInvalidSearchPathPresent로 네이밍을 변경했다.
- 로그 메시지 필터링과 개수 검증 로직을 람다 체이닝 형태로 정리했다.

#### **피드백 5 — 릴리스 노트 반영**

![](https://cdn-images-1.medium.com/max/1024/1*VqpMK1IL2iasM_vfomWqUQ.png)

- **내용:** 변경 사항을 documentation/src/docs/asciidoc/release-notes/release-notes-6.0.0-RC1.adoc의 *JUnit Platform > New Features and Improvements* 섹션에 추가해 달라는 요청이다.
- **반영:** 릴리스 노트에 개선 내용을 추가했다.

### 최종 코드

```text
private static List<ClasspathRootSelector> createClasspathRootSelectors(TestDiscoveryOptions options) {
    Set<Path> classpathRoots = determineClasspathRoots(options);
    Set<Path> classpathRoots = validateAndLogInvalidRoots(determineClasspathRoots(options));
    return selectClasspathRoots(classpathRoots);
}

private static Set<Path> determineClasspathRoots(TestDiscoveryOptions options) {
    var selectedClasspathEntries = Preconditions.notNull(options.getSelectedClasspathEntries(),
       () -> "No classpath entries selected");
    if (selectedClasspathEntries.isEmpty()) {
       Set<Path> rootDirs = new LinkedHashSet<>(ReflectionUtils.getAllClasspathRootDirectories());
       rootDirs.addAll(options.getExistingAdditionalClasspathEntries());
       rootDirs.addAll(options.getAdditionalClasspathEntries());
       return rootDirs;
    }
    return new LinkedHashSet<>(selectedClasspathEntries);
}

private static Set<Path> validateAndLogInvalidRoots(Set<Path> roots) {
    LinkedHashSet<Path> valid = new LinkedHashSet<>();
    HashSet<Path> seen = new HashSet<>();

    for (Path root : roots) {
       if (!seen.add(root)) {
          continue;
       }
       if (Files.exists(root)) {
          valid.add(root);
       }
       else {
          logger.warn(() -> "Ignoring nonexistent classpath root: %s".formatted(root));
       }
    }

    return valid;
}
```

### 다른 이슈 발견: Locale mismatch caused test failure

테스트가 내 로컬 환경(한국, ko\_KR)에서는 실패했다. 로그 메시지가 영어(INFO)가 아니라 한국어(정보)로 찍혀서, 스냅샷 비교에서 불일치가 발생한게 원인이었다.

확인해보니, StandaloneTests 에서 일부 테스트만 언어 설정이 존재하지 않았다.

```text
@Test
@Order(3)
@Execution(SAME_THREAD)
void execute(@FilePrefix("console-launcher") OutputFiles outputFiles) throws Exception {
var result = ProcessStarters.java() //
  .workingDir(workspace) //
  .putEnvironment("NO_COLOR", "1") // --disable-ansi-colors
  // 언어설정 없음

...

@Test
@Order(4)
@Execution(SAME_THREAD)
void executeOnJava17(@FilePrefix("console-launcher") OutputFiles outputFiles) throws Exception {
var javaHome = Helper.getJavaHome(17).orElseThrow(TestAbortedException::new);
var result = ProcessStarters.java(javaHome) //
  .workingDir(workspace) //
  .addArguments("-Duser.language=en", "-Duser.country=US") // 언어설정 있음
```

원인을 파악하고, Gradle 테스트 실행 시 JVM 옵션에 언어 옵션을 추가했다. (어쩌다보니 다른 이슈도 해결하게 된 셈이다)

### 배운 점 2

- JUnit ConsoleLauncher의 classpath 해석 과정(DiscoveryRequestCreator)
- 오픈소스 기여에서 코드만큼 중요한 팀 규칙과 테스트 문화의 이해
- 리뷰 피드백은 단순 수정 요청이 아니라, 더 나은 방향으로 기능을 설계할 기회라는 것
- 로케일 문제처럼, 글로벌 환경을 고려한 테스트 작성이 중요하다는 것
- 오픈소스 프로젝트에서는 작은 로그 레벨 하나도 신중히 선택해야 한다는 것

### 마무리: 첫 비즈니스 로직

![](https://cdn-images-1.medium.com/max/750/1*CZI0pIfIN4uqkYwdVhqODA.png)

이전에도 프레임워크에 단순 수정 PR을 보낸 적은 있었지만, 이번처럼 비즈니스 로직이 머지된 건 처음이었다. 작은 개선이지만, 실제 사용자에게 도움이 되는 변화를 만들었다는 점에서 의미 있었다.

다음 목표는, 이번처럼 발견된 이슈를 단순히 수정하는 수준이 아닌, **TDD로 처음부터 끝까지 오픈소스 기능을 구현하는 것**이다. (계속해서 수련해야겠다)

*\* 도전의 트리거* ***OpenSource Contributors Community****에 감사를 올린다.*

### **링크**

- [Issue](https://github.com/junit-team/junit-framework/issues/4772)
- [PR](https://github.com/junit-team/junit-framework/pull/4823)
- [OpenSource contributors blog](https://medium.com/opensource-contributors)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=1b07dce63fa9)
