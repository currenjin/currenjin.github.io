---
layout  : wiki
title   : Apache SkyWalking
summary : 마이크로서비스, 클라우드 네이티브 환경을 위한 분산 추적 및 APM 오픈소스
date    : 2026-04-03 00:00:00 +0900
updated : 2026-04-03 00:00:00 +0900
tags    : skywalking oss apm java
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

## Apache SkyWalking

마이크로서비스, 클라우드 네이티브 환경에서 분산 추적과 성능 모니터링을 담당하는 APM(Application Performance Monitoring) 오픈소스다. Alibaba, Tencent 등에서 실제 운영 환경에 사용하고 있고, Apache 재단의 top-level 프로젝트이기도 하다.

한마디로 설명하면 "내 서비스가 언제 어디서 느려지는지 알고 싶을 때 쓰는 도구"다.

에이전트를 붙이면 서비스 간 요청 흐름을 추적할 수 있고, MAL/OAL 같은 자체 언어로 메트릭을 정의해서 집계할 수도 있다. 백엔드는 OAP(Observability Analysis Platform) 서버가 담당하고, 스토리지는 BanyanDB, Elasticsearch, 혹은 JDBC 기반 RDB를 선택해서 붙일 수 있다.

---

## 기여

### JDBC 프로파일링 쿼리 버그 수정

> [apache/skywalking#13785](https://github.com/apache/skywalking/pull/13785) · 2026-04-03 머지

#### 이슈를 찾기까지

이슈 목록을 살펴봤는데 대부분 good first issue 레이블이 붙어 있어도 이미 누군가 진행 중이거나, 프론트엔드나 프로토콜 서브모듈이 얽혀 있어서 바로 손대기 어려운 것들이 많았다.

그래서 방향을 바꿔서 직접 코드를 읽다가 이상한 부분을 찾기로 했다. JDBC 스토리지 플러그인 쪽 DAO 코드를 보던 중에 눈에 걸리는 패턴이 있었다.

```java
public List<JFRProfilingDataRecord> getByTaskIdAndInstancesAndEvent(
        String taskId, List<String> instanceIds, String eventType) throws IOException {
    if (StringUtil.isBlank(taskId) || StringUtil.isBlank(eventType)) {
        return new ArrayList<>();
    }
    // ...
    sql.append(" and ").append(JFRProfilingDataRecord.EVENT_TYPE).append(" =? ");
    condition.add(eventType);

    if (CollectionUtils.isNotEmpty(instanceIds)) {
        sql.append(" and ").append(JFRProfilingDataRecord.INSTANCE_ID).append(" in (?) ");
        String joinedInstanceIds = String.join(",", instanceIds);
        condition.add(joinedInstanceIds);
    }
```

메서드 이름에 `ByTaskId`가 들어가 있는데 `taskId`가 WHERE 절에 없다. 검증만 하고 버린다.

그리고 `in (?)` 부분도 이상하다. JDBC `?`는 값 하나를 바인딩하는 자리인데, 여기에 `"id1,id2,id3"` 같은 문자열을 통째로 넘기고 있다. 실제로 실행되는 SQL은 이렇게 된다.

```sql
WHERE instance_id IN ('id1,id2,id3')
```

이건 `instance_id` 컬럼을 리터럴 문자열 `'id1,id2,id3'`와 비교하는 거라 인스턴스가 여러 개면 항상 결과가 없다.

#### 원인 추적

커밋 히스토리를 보니 두 버그 모두 Async Profiler 기능을 처음 추가한 PR(#12671, 2024년 10월)에서 시작됐다. 그리고 pprof 기능을 추가한 PR(#13502, 2025년 10월)이 JFR DAO 코드를 그대로 복사하면서 같은 버그를 가져왔다.

기존에 보고된 이슈도 없었다. 이 코드 경로가 실제로 실행됐을 때 데이터가 안 나와도 태스크 자체는 동작하니까 티가 잘 안 났던 것 같다.

#### 수정

`taskId` 필터는 단순히 WHERE 절에 추가하면 됐다.

IN 절은 인스턴스 수만큼 `?`를 동적으로 만들어야 한다. 같은 프로젝트 안에 `JDBCEBPFProfilingTaskDAO`에 `appendListCondition`이라는 메서드가 이미 그 역할을 하고 있었고, `Collections.nCopies` + `String.join`을 쓰는 패턴이 더 간결했다.

```java
sql.append(" and ").append(JFRProfilingDataRecord.TASK_ID).append(" = ?");
condition.add(taskId);

if (CollectionUtils.isNotEmpty(instanceIds)) {
    sql.append(" and ").append(JFRProfilingDataRecord.INSTANCE_ID)
       .append(" in (").append(String.join(",", Collections.nCopies(instanceIds.size(), "?"))).append(")");
    condition.addAll(instanceIds);
}
```

#### 테스트 작성에서 막힌 부분

`JDBCClient`를 Mockito로 모킹해서 SQL을 캡처하려고 했는데 varargs 때문에 한참 헤맸다.

`executeQuery(String sql, ResultHandler handler, Object... params)` 시그니처인데, DAO 내부에서는 `condition.toArray(new Object[0])`를 varargs로 넘긴다. Mockito는 이 배열을 개별 인자로 펼쳐서 보관한다.

그래서 `invocation.getArgument(2)`를 하면 `Object[]`가 아니라 varargs 첫 번째 원소인 `String`이 나온다. 처음에는 `ClassCastException`이 터져서 왜 그런지 한참 찾았다.

```java
// 인자 전체를 가져와서 인덱스 2부터 슬라이싱
final Object[] allArgs = invocation.getArguments();
capturedParams.set(Arrays.copyOfRange(allArgs, 2, allArgs.length));
```

이렇게 하니까 해결됐다. stub 매칭도 `any(Object[].class)`로 잡아야 했다.

최종 테스트는 세 가지를 확인한다.

- SQL에 `task_id = ?`가 포함되고 파라미터에 taskId가 있는가
- 인스턴스가 3개면 `in (?,?,?)`가 생성되는가
- taskId가 빈 문자열이면 빈 리스트를 반환하는가
