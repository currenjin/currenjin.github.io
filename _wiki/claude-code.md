---
layout  : wiki
title   : Claude Code
summary : Claude Code의 내부 아키텍처, Dynamic Workflows, Mythos/Glasswing 보안 이니셔티브 분석
date    : 2026-04-01 12:00:00 +0900
updated : 2026-05-29 12:25:27 +0900
tags    : [ai-agent, ai, productivity, engineering]
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# Claude Code

Anthropic이 만든 터미널 기반 에이전틱 코딩 도구. 소스맵 유출로 드러난 내부 아키텍처와, 이후 공식 발표된 Dynamic Workflows 및 Claude Mythos/Glasswing 보안 흐름을 함께 정리한다.

> 참고 자료
> - [Learn Claude Code (9bow)](https://9bow.github.io/learn-claude-code/)
> - [Claude Code Source Map Leak Analysis](https://bits-bytes-nn.github.io/insights/agentic-ai/2026/03/31/claude-code-source-map-leak-analysis.html)
> - [claude-code-sourcemap (GitHub)](https://github.com/leeyeel/claude-code-sourcemap/tree/main)
> - [Introducing dynamic workflows in Claude Code](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)
> - [Project Glasswing: Securing critical software for the AI era](https://www.anthropic.com/glasswing)

---

## 1. 소스코드 유출 사건

### 1.1 경위

Claude Code npm 패키지 **v2.1.88** 배포 시 59.8MB의 소스맵 파일이 실수로 포함되었다. 소스맵에는 Cloudflare R2 버킷에 호스팅된 zip 파일 경로가 담겨 있었고, 그 안에 원본 TypeScript 소스가 그대로 존재했다.

보안 연구자 Chaofan Shou가 X에서 최초 공개했고, Anthropic은 "릴리즈 패키징 과정의 인적 오류(human error)"라고 공식 발표했다.

주목할 점은 이것이 첫 번째 사건이 아니라는 것이다. **2025년 2월에도 동일한 방식**으로 초기 버전의 소스가 유출된 바 있다. 8겹의 보안 레이어를 갖춘 시스템이 `.npmignore` 한 줄 누락으로 무너진 아이러니다.

### 1.2 유출 규모

| 항목 | 수치 |
|------|------|
| 노출된 파일 수 | 4,600개 이상 |
| 공식 오픈소스 저장소 파일 수 | 279개 (플러그인 인터페이스만) |
| 코드 줄 수 | 약 51만 줄 이상 |
| GitHub 포크 수 | 41,500회 이상 |

공식 저장소에는 279개 파일(플러그인 인터페이스)만 공개되어 있었지만, 핵심 엔진은 완전히 비공개 상용 코드였다. 유출로 인해 그 전체가 드러났다.

---

## 2. 기술 스택

| 항목 | 내용 |
|------|------|
| 런타임 | Bun (빠른 시작, TypeScript 네이티브) |
| UI | React 18 + Ink (터미널 UI 렌더링) |
| API | Anthropic SDK, MCP 클라이언트 |
| 번들러 | Bun의 `feature()` 함수로 빌드 타임 데드코드 제거 |

**React + Ink 조합**이 흥미롭다. 터미널 UI를 DOM처럼 선언적으로 작성할 수 있어, 복잡한 스트리밍 출력을 컴포넌트 단위로 관리한다. UI 레이어에 React 상태 관리 철학이 그대로 적용된 셈이다.

주요 진입점은 `src/entrypoints/` 디렉터리에 있으며, CLI 모드와 SDK 모드가 분리되어 있다. 핵심 루프인 `query.ts`는 두 모드에서 공통으로 사용된다.

---

## 3. 에이전틱 루프 (`query.ts`, 1,729줄)

에이전틱 루프는 Claude Code의 심장부다. 핵심 설계 선택은 **async generator 패턴**이다.

실제 `src/query.ts` 시그니처:

```typescript
// src/query.ts:124
export async function* query(
  messages: Message[],
  systemPrompt: string[],
  context: { [k: string]: string },
  canUseTool: CanUseToolFn,
  toolUseContext: ToolUseContext,
  getBinaryFeedbackResponse?: (
    m1: AssistantMessage,
    m2: AssistantMessage,
  ) => Promise<BinaryFeedbackResult>,
): AsyncGenerator<Message, void>
```

이 시그니처가 보여주는 것은:
- `yield`: 중간 이벤트(스트리밍 텍스트, 도구 호출 등)를 실시간으로 소비자에게 전달
- `return`: 루프가 끝난 이유(`Terminal` 타입 — 완료, 에러, 사용자 중단 등)를 명확히 표현
- 소비자는 `for await...of`로 자연스럽게 처리하고 에러도 자동 전파

콜백이나 EventEmitter로 같은 것을 구현하면 복잡한 상태 머신이 된다. Generator는 "중간 값을 계속 내보내면서 최종 결과도 반환한다"는 의미를 코드 구조 자체로 표현한다.

### 3.1 매 턴의 6단계 파이프라인

```mermaid
flowchart LR
    A([새 턴 시작]) --> B[1. Compaction]
    B --> C[2. API 호출\n+스트리밍]
    C --> D[3. 에러 복구]
    D --> E[4. Stop Hooks]
    E --> F[5. 도구 실행]
    F --> G[6. 상태 전이]
    G --> H{계속?}
    H -->|next_turn| A
    H -->|완료/중단| Z([종료])

    style A fill:transparent,stroke:#111827
    style Z fill:transparent,stroke:#111827
```

#### 1단계: Pre-Request Compaction (프롬프트 최적화)

API를 호출하기 전에 5개의 압축 메커니즘을 순서대로 시도한다. 순서 자체가 핵심이다 — 앞 단계에서 충분히 줄어들면 비용이 큰 뒤 단계가 발동하지 않는다.

```mermaid
flowchart LR
    A([컨텍스트 초과?]) --> B[Tool Result Budget\n도구 결과 크기 제한]
    B -->|아직 큼| C[Snip Compact\n오래된 메시지 제거\n무료]
    C -->|아직 큼| D[Microcompact\n캐시 블록 피닝\n무료]
    D -->|아직 큼| E[Context Collapse\n읽기 시점 프로젝션\n저비용]
    E -->|아직 큼| F[Auto-Compact\nClaude API 요약\n고비용]
    B -->|충분히 줄었으면| Z([API 호출])
    C -->|충분히 줄었으면| Z
    D -->|충분히 줄었으면| Z
    E -->|충분히 줄었으면| Z
    F --> Z

    style Z fill:transparent,stroke:#111827
    style A fill:transparent,stroke:#111827
```

#### 2단계: API 호출 + 스트리밍

모델이 응답을 생성하는 중에도 도구가 병렬 실행된다. 분기 기준은 `isReadOnly()`다. 실제 코드:

```typescript
// src/query.ts:178 — isReadOnly()로 병렬/직렬 분기
if (
  toolUseMessages.every(msg =>
    toolUseContext.options.tools.find(t => t.name === msg.name)?.isReadOnly(),
  )
) {
  for await (const message of runToolsConcurrently(...)) { ... }
} else {
  for await (const message of runToolsSerially(...)) { ... }
}

// src/query.ts:244 — 병렬 실행: MAX_TOOL_USE_CONCURRENCY = 10
async function* runToolsConcurrently(...): AsyncGenerator<Message, void> {
  yield* all(
    toolUseMessages.map(toolUse => runToolUse(toolUse, ...)),
    MAX_TOOL_USE_CONCURRENCY,
  )
}
```

각 도구는 `isReadOnly()`를 구현한다:

```typescript
// src/tools/FileReadTool/FileReadTool.tsx:66 — 읽기 전용
isReadOnly() { return true }

// src/tools/BashTool/BashTool.tsx:72 — 쓰기 가능
isReadOnly() { return false }
```

상태를 변경하는 도구(`FileWrite`, `Bash`)는 직렬 실행만 허용된다.

프리페치 전략도 이 단계에서 시작된다. 스킬 디스커버리나 메모리 어태치먼트 같이 6단계에서 필요할 정보를 미리 백그라운드에서 가져오기 시작한다. 블로킹 없이 진행하고 결과는 나중에 수확하는 방식이다.

#### 3단계: 에러 복구 캐스케이드

에러가 발생하면 무조건 비용이 낮은 방법부터 시도한다.

`Prompt-Too-Long(413)` 에러와 `Max-Output-Tokens` 에러의 복구 순서:

**Prompt-Too-Long (413)**:

```mermaid
flowchart LR
    E1([413 에러]) --> R1[Context Collapse 드레인\nAPI 호출 0회]
    R1 -->|성공| OK1([재시도])
    R1 -->|실패| R2[Reactive Compact\nAPI 호출 1회]
    R2 -->|성공| OK1
    R2 -->|실패| R3([에러 표출])

    style E1 fill:transparent,stroke:#111827
    style OK1 fill:transparent,stroke:#111827
    style R3 fill:transparent,stroke:#111827
```

**Max-Output-Tokens**:

```mermaid
flowchart LR
    E2([Max-Output-Tokens]) --> S1[토큰 캡 에스컬레이션\n비용 0]
    S1 -->|성공| OK2([재시도])
    S1 -->|실패| S2[Resume 메시지 주입\n최대 3회]
    S2 -->|성공| OK2
    S2 -->|실패| S3([현재 결과로 완료])

    style E2 fill:transparent,stroke:#111827
    style OK2 fill:transparent,stroke:#111827
    style S3 fill:transparent,stroke:#111827
```

첫 번째 시도는 항상 무료다. 사용자는 자동 복구가 일어나는 것을 느끼지 못한다.

#### 4단계: Stop Hooks

사용자가 정의한 검증 로직을 실행한다. 예를 들어 "테스트를 실행하고 통과하면 계속, 실패하면 에러 메시지를 대화에 다시 주입해라"는 식의 커스텀 게이트다.

**감소 수익(Diminishing Returns) 감지**:

```
연속 3회 계속했는데 매번 500 토큰 미만 생성 → "더 이상 의미 없음" → 중단
```

무한 루프 방지의 실전 전략이다. 의도적으로 설계된 조기 종료다.

#### 5단계: 도구 실행

배치 모드와 스트리밍 모드가 공존한다. 형제 도구 중 하나가 에러를 내면 나머지도 `sibling_error` 사유로 취소된다. 모델 폴백 시에는 고아 메시지에 tombstone을 생성하여 대화 일관성을 유지한다.

#### 6단계: Post-Tool — 상태 전이

`Continue Site` 패턴으로 상태를 전체 재할당한다.

```typescript
state = {
  ...state,
  messages: [...messagesForQuery, ...assistantMessages, ...toolResults],
  turnCount: nextTurnCount,
  transition: { reason: 'next_turn' }
}
```

9개의 개별 필드를 하나씩 수정하지 않고 전체 객체를 재할당한다. 이렇게 하면:
- **원자성 보장**: 9개 필드 중 일부만 업데이트된 중간 상태가 존재하지 않는다
- **전이 추적**: `transition.reason`으로 "왜 다음 턴으로 넘어갔는지"가 기록된다 — 테스트에서 메시지 내용을 파싱하지 않고도 전이 이유로 단언(assert)할 수 있다

React의 불변 상태 관리 철학이 백엔드 에이전틱 루프에까지 스며든 설계다. 6단계에서는 2단계에서 시작해 둔 프리페치 결과도 수확한다.

---

## 4. 메시지 압축: 4단계 계층

| 단계 | 비용 | 정보손실 | 핵심 특징 |
|------|------|---------|---------|
| Snip | 무료 | 높음 | 오래된 메시지 통째로 제거 |
| Microcompact | 무료 | 중간 | 캐시 블록 피닝으로 선택적 제거 |
| Context Collapse | 낮음 | 중간 | 원본 보존, 읽기 시점 프로젝션 |
| Auto-Compact | 높음 | 낮음 | Claude API로 의미 기반 전체 요약 |

### 4.1 각 단계의 설계 의도

**Snip**: 가장 단순한 전략. 오래된 내부 메시지를 통째로 제거하고 최근 컨텍스트만 유지한다. `snipTokensFreed` 메트릭이 후속 단계로 전달되어, 이미 충분히 줄었으면 추가 압축을 막는다.

**Microcompact**: 도구 결과를 선택적으로 제거하면서 프롬프트 캐싱 히트를 보존한다. 캐시된 블록의 ID를 추적하여, 이미 캐시된 내용을 지웠다가 재계산하는 불필요한 비용을 방지한다.

**Context Collapse**: 원본 메시지는 그대로 남겨두고, 축소된 뷰만 별도 저장소에 보관한다. Git의 스냅샷처럼 읽기 시점 프로젝션을 제공하면서 캐시 무효화를 피한다. "원본은 건드리지 않는다"는 원칙 덕분에 필요하면 언제든 원본으로 복구 가능하다.

**Auto-Compact**: 전체 대화 히스토리를 Claude에게 보내서 의미 기반 요약을 요청한다. API 호출이 필요하지만 핵심 정보 보존율이 가장 높다. 3회 연속 실패 시 서킷 브레이커가 작동한다.

각 계층은 **비용-정보보존 트레이드오프** 축에서 다른 지점을 차지하며, 모두 파레토 최적점이다. 중요한 것은 이 4단계가 프롬프트 캐싱 설계와 긴밀하게 얽혀 있다는 점이다. 압축할 때 캐시 히트율을 떨어뜨리면 실질적인 비용이 더 커질 수 있기 때문이다.

---

## 5. 보안: 8개 레이어

**L1 ~ L4 (빌드 · 서버 · AI 판정)**

```mermaid
flowchart LR
    REQ([요청]) --> L1["L1\nfeature 함수"] --> L2["L2\n피처 플래그"] --> L3["L3\n설정 규칙"] --> L4["L4\nTranscript Classifier"] --> NEXT(["→ L5"])

    style REQ fill:transparent,stroke:#111827
    style NEXT fill:transparent,stroke:#111827
```

**L5 ~ L8 (실행 단계)**

```mermaid
flowchart LR
    PREV(["L4 →"]) --> L5["L5\n위험 패턴 감지"] --> L6["L6\n파일시스템 권한"] --> L7["L7\nTrust Dialog"] --> L8["L8\nBypass Kill Switch"] --> OK([허용])

    style PREV fill:transparent,stroke:#111827
    style OK fill:transparent,stroke:#111827
```

| 레이어 | 메커니즘 | 특징 |
|--------|---------|------|
| 1 | 빌드 타임 게이트 | `feature()`로 코드가 바이너리에 존재하지 않음 |
| 2 | 피처 플래그 | GrowthBook 서버 측 킬 스위치 |
| 3 | 설정 기반 규칙 | 8개 소스의 우선순위 체계 |
| 4 | Transcript Classifier | AI가 AI의 도구 사용 안전성 판정 |
| 5 | 위험 패턴 감지 | Bash 인터프리터 와일드카드 차단 |
| 6 | 파일시스템 권한 | symlink 탈출 방지, 경로 정규화 |
| 7 | Trust Dialog | 초기 실행 시 사용자 동의 |
| 8 | Bypass Kill Switch | 최후 수단, 권한 우회 모드 전체 차단 |

### 5.1 주목할 설계들

**빌드 타임 게이트**: `feature()` 함수는 런타임 플래그가 아니라 컴파일 타임에 코드를 물리적으로 제거한다. 런타임에 환경변수를 조작해도 해당 코드가 바이너리에 없으므로 활성화가 불가능하다. 보안의 가장 강한 형태다.

**Bash 권한 검사** 실제 구현 — 허용 명령어 화이트리스트:

```typescript
// src/permissions.ts:17
const SAFE_COMMANDS = new Set([
  'git status', 'git diff', 'git log', 'git branch',
  'pwd', 'tree', 'date', 'which',
])

// src/permissions.ts:25
export const bashToolCommandHasExactMatchPermission = (
  tool: Tool,
  command: string,
  allowedTools: string[],
): boolean => {
  if (SAFE_COMMANDS.has(command)) {
    return true
  }
  if (allowedTools.includes(getPermissionKey(tool, { command }, null))) {
    return true
  }
  return false
}
```

**Transcript Classifier**: "자동 모드"에서 AI가 AI의 도구 사용 안전성을 판정한다. 분류기가 판단 불가 상황에서는 거부가 아닌 **사용자 프롬프팅으로 폴백**한다. 이를 "Fail-open" 철학이라 한다 — 안전을 위해 기능을 막기보다 사용자 판단을 신뢰한다. 연속 3회 거부 시에는 폴백이 발동된다.

**Defense in Depth**: 한 레이어가 실패해도 다음 레이어가 잡는다. 레이어들이 서로 독립적이므로, 피처 플래그 서버가 다운되어도 빌드 타임 게이트가 살아있다.

---

## 6. 도구 시스템

### 6.1 병렬 실행 메커니즘

`query.ts`의 `runToolsConcurrently` / `runToolsSerially`가 모델 응답 스트림과 도구 실행을 동시에 관리한다.

```mermaid
sequenceDiagram
    participant M as Model (스트리밍 중)
    participant E as StreamingToolExecutor
    participant R as 읽기 도구 (FileRead, Grep)
    participant W as 쓰기 도구 (FileWrite, Bash)

    M->>E: tool_use: FileRead (isConcurrencySafe=true)
    M->>E: tool_use: Grep (isConcurrencySafe=true)
    M->>E: tool_use: FileWrite (isConcurrencySafe=false)

    par 병렬 실행
        E->>R: FileRead 실행
        E->>R: Grep 실행
    end

    R-->>E: 결과 반환
    Note over E: 쓰기 도구는 읽기 완료 후 직렬 실행
    E->>W: FileWrite 실행
    W-->>E: 결과 반환

    Note over E: 하나 실패 시 sibling_error로 나머지 취소
```

`AbortReason`이 취소 사유를 추적하여 취소가 사용자 요청인지, 에러인지, 형제 도구 실패인지를 구분한다. 이 정보는 `tengu_tool_use_cancelled` 이벤트로 기록된다.

### 6.2 도구 정렬과 프롬프트 캐싱

도구 목록을 프롬프트에 포함할 때 순서가 중요하다. 빌트인 도구와 MCP 도구를 각각 따로 정렬한 뒤 이어 붙인다. MCP 서버를 추가하거나 제거해도 빌트인 도구 목록의 순서가 바뀌지 않아 프롬프트 캐시가 무효화되지 않는다. 사소해 보이지만 실제 비용에 직결되는 최적화다.

유출된 소스의 도구 목록 (`src/tools/` 디렉터리):

```
AgentTool      ArchitectTool   BashTool       FileEditTool
FileReadTool   FileWriteTool   GlobTool       GrepTool
MCPTool        MemoryReadTool  MemoryWriteTool NotebookEditTool
NotebookReadTool  StickerRequestTool  ThinkTool  lsTool
```

`StickerRequestTool`과 `ThinkTool`의 존재가 눈에 띈다. `ThinkTool`은 모델이 명시적으로 "생각"을 도구 호출로 수행하게 하는 설계다.

---

## 7. 미출시 기능 (피처 플래그 뒤)

### 7.1 Voice Mode

OAuth 전용(Claude.ai 계정 필요)으로, API 키나 Bedrock/Vertex로는 사용이 불가하다. `tengu_amber_quartz_disabled` 킬 스위치로 즉시 비활성화 가능하다. 음성 인터페이스를 계정 기반으로만 제공하는 것은 사용량 추적과 안전 정책 적용을 위한 선택으로 보인다.

### 7.2 Web Browser Tool

실제 JavaScript 렌더링을 포함한 자동화 도구다. Computer Use의 CLI 버전에 해당한다. 현재 Bash 도구로 처리하는 웹 관련 작업을 브라우저 수준에서 처리할 수 있게 된다.

### 7.3 Coordinator Mode

메타 오케스트레이터가 워커 에이전트를 관리하는 구조다. Coordinator는 직접 도구를 실행하지 않는다. `AgentTool`, `TaskStop`, `SendMessage`만 허용된다.

```mermaid
flowchart LR
    C[Coordinator\nAgentTool / TaskStop\nSendMessage만 허용]
    C -->|위임| W1[Worker 1\n파일 읽기/쓰기]
    C -->|위임| W2[Worker 2\n테스트 실행]
    C -->|위임| W3[Worker 3\nPR 생성]
    W1 <-->|공유| S[(tengu_scratch)]
    W2 <-->|공유| S
    W3 <-->|공유| S

    style C fill:transparent,stroke:#111827
    style S fill:transparent,stroke:#111827
```

**최소 권한 원칙(Least Privilege)**의 극단적 적용이다. 오케스트레이터에게 실행 권한을 주지 않고 위임만 허용한다. 권한이 없으면 실수로 파괴적인 작업을 직접 실행하는 사고를 원천 차단한다.

### 7.4 Kairos (선제적 모드)

기존 Claude Code가 사용자의 명령을 기다리는 반응형이라면, Kairos는 독립적으로 작동하는 선제적 모드다.

- `SleepTool`: 다음 이벤트까지 백그라운드 대기
- `SubscribePRTool`: GitHub PR 웹훅을 구독
- `PushNotificationTool`: 모바일 알림 전송

사용자 세션이 없어도 Claude가 PR을 모니터링하고, 지정된 조건이 충족되면 자율적으로 작업을 시작한다. 지금의 "Claude에게 시키는" 패러다임에서 "Claude가 알아서 하는" 패러다임으로의 전환점이다.

### 7.5 ArchitectTool

도구 목록(`src/tools/ArchitectTool`)에 존재하지만 일반 사용자에게는 노출되지 않는 설계 전용 도구다. 코드 작성 대신 시스템 설계와 계획 수립에 특화된 것으로 보인다. Claude Code가 단순 코딩 보조를 넘어 아키텍처 설계 에이전트로 확장되는 방향을 시사한다.

### 7.6 Bridge (원격 제어)

33개 파일로 구성된 원격 제어 시스템이다.

- **Git worktree 격리**: 각 세션이 독립된 worktree에서 실행되어 세션 간 상태 오염을 방지
- **2티어 인증**: Standard / Elevated 권한으로 작업의 민감도에 따라 차등 보안 적용
- **claude.ai 웹 → 로컬 머신 제어**: 웹 인터페이스에서 로컬 환경을 원격으로 조작

모바일이나 다른 기기에서 로컬 개발 환경을 통제하는 유스케이스를 노린 것으로 보인다.

---

## 8. Dynamic Workflows

### 8.1 레퍼런스 문서

- 원문: [Introducing dynamic workflows in Claude Code](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)
- 발행: 2026-05-28, Anthropic Product announcements
- 주제: Claude Code가 하나의 세션 안에서 수십~수백 개의 병렬 subagent를 실행하고, 결과를 사용자에게 전달하기 전에 자체 검증하는 workflow 기능

### 8.2 원문에 가까운 정리

2026년 5월 28일 Anthropic은 Claude Code에 **Dynamic Workflows**를 도입했다. 목적은 Claude가 어려운 작업을 끝까지 처리할 수 있게 하는 것이다. 보통 분기 단위로 계획하던 작업을 며칠 안에 끝내는 것을 목표로 하며, Claude는 한 세션 안에서 오케스트레이션 스크립트를 동적으로 작성하고 수십~수백 개의 병렬 subagent를 실행한다. 결과가 사용자에게 도달하기 전에는 Claude가 먼저 자기 작업을 검토한다.

단일 agent가 한 번에 처리하기에는 너무 큰 문제가 있다. 복잡한 legacy codebase 전체에서 버그를 찾는 일, 수백 개 파일에 걸친 migration, 실행하기 전에 여러 각도에서 검증받고 싶은 계획이 여기에 해당한다. Dynamic Workflows는 이런 작업을 end-to-end로 처리하기 위해 만들어졌다.

#### 8.2.1 제공 범위

출시 시점의 상태는 **research preview**다.

| 항목 | 내용 |
|------|------|
| 제품 | Claude Code CLI, Desktop, VS Code extension |
| 플랜 | Max, Team, Enterprise(admin enabled) |
| API 경로 | Claude API, Amazon Bedrock, Vertex AI, Microsoft Foundry |
| 기본값 | Max/Team/API는 기본 활성화, Enterprise는 출시 시점 기본 비활성화 |

Dynamic Workflows는 일반 Claude Code 세션보다 훨씬 많은 token을 사용할 수 있다. Anthropic은 처음부터 큰 범위를 맡기기보다, 먼저 좁은 task로 사용량 감각을 잡으라고 권한다.

가장 좋은 사용 경험을 위해서는 auto mode를 켜는 것이 권장된다. workflow를 시작하는 방법은 두 가지다.

1. Claude에게 직접 dynamic workflow를 만들라고 요청한다. 예: `Create a workflow`
2. Claude Code 전용 설정인 `ultracode`를 켠다. 이 설정은 effort level을 `xhigh`로 올리고, Claude가 task에 workflow가 필요한지 자동 판단하게 한다.

첫 workflow 실행 시 Claude Code는 앞으로 무엇을 실행할지 보여주고 사용자 확인을 요청한다. 조직 관리자는 managed settings를 통해 workflow를 비활성화할 수 있다.

#### 8.2.2 Dynamic Workflows가 겨냥하는 작업

초기 사용자와 Anthropic 내부 팀은 다음 유형의 작업에 Dynamic Workflows를 사용했다.

| 유형 | 원문이 강조한 방식 |
|------|--------------------|
| 코드베이스 전역 버그 헌트 | service/repo를 병렬로 검색하고, 각 발견 사항을 독립 검증한 뒤 실제 이슈만 보고 |
| profiler 기반 최적화 감사 | 성능 병목을 여러 영역으로 나눠 병렬 조사 |
| 보안 감사 | auth check, input validation, unsafe pattern을 codebase 전체에서 점검 |
| 대규모 migration/modernization | framework 교체, API deprecation 대응, 언어 포팅처럼 수천 파일에 걸친 변경 처리 |
| 두 번 확인해야 하는 중요 작업 | 독립 시도와 adversarial agent를 통해 결과를 깨뜨려 본 뒤 사용자에게 전달 |

원문의 핵심은 병렬성 자체보다 **검증 구조**다. Claude는 문제를 여러 독립 각도에서 풀고, 다른 agent가 그 결과를 반박하게 하며, 답이 수렴할 때까지 반복한다. 그래서 단일 pass로는 도달하기 어려운 결과를 노린다.

#### 8.2.3 작동 방식

workflow가 시작되면 Claude는 prompt를 바탕으로 동적으로 계획을 세운다. 그 다음 작업을 subtask로 쪼개고, 병렬 subagent에게 fan-out한다. 각 결과는 바로 합쳐지지 않고 먼저 검증된다. 사용자는 마지막에 하나의 조율된 답을 받는다.

```mermaid
flowchart LR
    A([사용자 요청]) --> B[동적 계획]
    B --> C[Subtask 분해]
    C --> D[병렬 subagent 실행]
    D --> E[결과 검증]
    E --> F[반박/검토 agent]
    F --> G{답이 수렴했는가?}
    G -->|아니오| C
    G -->|예| H[조율된 최종 답변]

    style A fill:transparent,stroke:#111827
    style H fill:transparent,stroke:#111827
```

Dynamic Workflows는 hours~days 단위로 이어지는 병렬·장기 작업을 전제로 한다. 실행 중 progress가 저장되므로 중단된 job은 처음부터 다시 시작하지 않고 이어서 진행할 수 있다. 또 coordination은 대화 바깥에서 일어나므로, task가 커져도 plan이 대화 컨텍스트에 묻혀 흐트러지는 문제를 줄인다.

이 구조는 앞서 유출 소스에서 보였던 `Coordinator Mode`, `AgentTool`, `TaskStop`, `SendMessage`, `tengu_scratch`류의 흔적과 방향이 맞다. 당시에는 feature flag 뒤에 있던 미출시 구조가, 공식적으로는 Dynamic Workflows라는 제품 기능으로 드러난 셈이다.

#### 8.2.4 Bun rewrite 사례

원문이 제시한 대표 사례는 Jarred Sumner의 Bun rewrite다. Dynamic Workflows를 사용해 Bun을 Zig에서 Rust로 porting했다.

| 항목 | 내용 |
|------|------|
| 작업 | Bun을 Zig에서 Rust로 porting |
| 테스트 | 기존 test suite 99.8% 통과 |
| 규모 | 약 750,000 lines of Rust |
| 기간 | 첫 commit부터 merge까지 11일 |
| 첫 workflow | Zig codebase의 각 struct field에 적절한 Rust lifetime 매핑 |
| 다음 workflow | 각 `.zig` 파일에 대응하는 behavior-identical `.rs` 파일 작성 |
| 검토 방식 | 수백 개 agent가 병렬 작업하고, 각 파일에 reviewer 2개를 붙임 |
| 수습 loop | build/test suite가 깨끗하게 통과할 때까지 fix loop 실행 |
| 후속 작업 | merge 후 overnight workflow로 불필요한 data copy를 찾아 PR 생성 |

이 사례에서 중요한 점은 “생성”만 한 것이 아니라는 점이다. workflow는 파일 단위 구현자와 reviewer를 함께 배치했고, build/test loop로 결과를 계속 수렴시켰다. 즉 Dynamic Workflows는 대규모 작업을 병렬로 흩뿌리는 기능이라기보다, **생산·검토·수정 loop를 묶은 임시 agent 조직**에 가깝다.

단, 원문은 이 Bun rewrite가 아직 production에는 적용되지 않았다고 밝힌다. 따라서 이 사례는 가능성을 보여주는 강한 데모이지, 운영 안정성까지 완전히 입증한 사례는 아니다.

#### 8.2.5 해석

Dynamic Workflows는 Claude Code를 “터미널에서 명령을 수행하는 단일 coding agent”에서 **작업을 분해하고, 여러 agent를 실행하고, 검증 결과를 수렴시키는 실행 플랫폼**으로 확장한다.

실무에서 바로 쓸 만한 영역은 단순 기능 구현보다 다음에 가깝다.

- 넓은 codebase에서 놓친 문제를 찾는 discovery
- security/performance audit처럼 독립 검증이 중요한 작업
- 대규모 migration처럼 파일 수가 많고 반복 패턴이 있는 작업
- 중요한 계획을 여러 관점에서 반박해 보는 review

적용할 때는 범위와 검증 기준을 먼저 좁혀야 한다. repo 전체를 한 번에 맡기기보다 module/service 단위로 시작하고, tests/lint/typecheck/benchmark처럼 기계적으로 판정 가능한 완료 조건을 명시해야 한다. long-running workflow에는 token budget과 시간 상한이 필요하며, deploy·credential 접근·destructive command는 auto mode에서도 별도 승인 대상으로 남겨두는 편이 안전하다.

---

## 9. Project Glasswing

Anthropic이 발표한 **AI 시대 critical software 보안 이니셔티브**. 핵심은 Claude Mythos Preview라는 미공개 frontier model의 취약점 탐지·악용 능력을, 공격자보다 방어자에게 먼저 제공하겠다는 것이다.

### 9.1 레퍼런스 문서

- 원문: [Project Glasswing: Securing critical software for the AI era](https://www.anthropic.com/glasswing)
- 발행: Anthropic
- 주제: Claude Mythos Preview를 활용한 critical software 취약점 탐지, open-source 보안 강화, AI 시대 사이버 방어 체계 구축

### 9.2 원문에 가까운 정리

#### 9.2.1 발표의 핵심

Anthropic은 Project Glasswing을 발표하면서 Amazon Web Services, Apple, Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, Linux Foundation, Microsoft, NVIDIA, Palo Alto Networks 등과 함께 세계의 critical software를 보호하겠다고 밝혔다.

이 프로젝트의 배경은 Anthropic이 훈련한 새 frontier model에서 관측한 사이버 보안 능력이다. **Claude Mythos Preview**는 일반 목적의 미공개 frontier model인데, Anthropic은 이 모델이 소프트웨어 취약점을 찾고 exploit하는 능력에서 최상위권 인간 전문가를 제외한 대부분의 사람을 넘어설 수 있는 수준에 도달했다고 설명한다.

Mythos Preview는 이미 수천 개의 high-severity vulnerability를 발견했으며, 여기에는 주요 운영체제와 웹 브라우저의 취약점도 포함된다. Anthropic은 이런 능력이 빠르게 확산될 경우 경제, 공공 안전, 국가 안보에 큰 피해를 줄 수 있다고 본다. Project Glasswing은 그 능력을 방어 목적으로 먼저 투입하려는 시도다.

#### 9.2.2 참여 구조와 지원 규모

Project Glasswing의 launch partner들은 Mythos Preview를 각자의 defensive security 작업에 사용한다. Anthropic은 그 과정에서 얻은 학습을 업계와 공유하겠다고 한다.

또한 critical software infrastructure를 만들거나 유지하는 40개 이상의 추가 조직에도 접근 권한을 제공한다. 목적은 first-party system과 open-source system을 scan하고 보안 문제를 줄이게 하는 것이다.

| 항목 | 내용 |
|------|------|
| 주요 참여자 | AWS, Apple, Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, Linux Foundation, Microsoft, NVIDIA, Palo Alto Networks 등 |
| 추가 접근 대상 | critical software infrastructure를 만들거나 유지하는 40개 이상 조직 |
| 모델 크레딧 | Mythos Preview 사용에 최대 $100M usage credits 제공 |
| 직접 기부 | open-source security 조직에 $4M 기부 |

Anthropic은 이것을 시작점으로 본다. frontier AI 개발자, 소프트웨어 기업, 보안 연구자, open-source maintainer, 정부가 모두 역할을 해야 하며, 사이버 인프라 방어는 수년이 걸릴 수 있지만 frontier AI 능력은 몇 달 단위로 빠르게 발전할 수 있다고 경고한다.

#### 9.2.3 AI 시대의 사이버 보안 문제

은행 시스템, 의료 기록, 물류망, 전력망처럼 일상과 사회 인프라를 지탱하는 소프트웨어에는 늘 버그가 있었다. 많은 버그는 사소하지만, 일부는 공격자가 시스템을 장악하거나 운영을 방해하거나 데이터를 훔칠 수 있게 하는 심각한 보안 결함이다.

Anthropic은 이미 기업 네트워크, 의료 시스템, 에너지 인프라, 교통 허브, 정부 기관이 사이버 공격으로 큰 피해를 입어 왔다고 짚는다. 국가 단위에서는 중국, 이란, 북한, 러시아 같은 state-sponsored actor가 민간 생활과 군사 준비 태세를 지탱하는 인프라를 위협해 왔다고 설명한다. 전 세계 cybercrime 비용은 추정이 어렵지만 매년 약 **$500B** 수준일 수 있다고 한다.

지금까지 많은 소프트웨어 결함은 수년 동안 발견되지 않았다. 취약점을 찾고 exploit하는 데 필요한 전문성이 극히 일부 보안 전문가에게만 있었기 때문이다. 하지만 frontier AI 모델이 발전하면서 취약점을 찾고 악용하는 데 필요한 비용, 노력, 전문성 수준이 크게 낮아지고 있다.

#### 9.2.4 Claude Mythos Preview의 취약점 탐지 사례

Anthropic은 지난 몇 주 동안 Mythos Preview를 사용해 수천 개의 zero-day vulnerability를 찾았다고 밝혔다. 여기서 zero-day는 소프트웨어 개발자가 이전에 알지 못했던 결함을 뜻한다. 다수는 critical 수준이며, 주요 운영체제와 주요 웹 브라우저, 그리고 다른 중요한 소프트웨어에서도 발견되었다.

Anthropic은 이미 patch된 일부 취약점과 exploit 방식을 Frontier Red Team blog에 기술적으로 공개했다. 원문이 제시한 예시는 다음과 같다.

| 사례 | 내용 |
|------|------|
| OpenBSD | 보안이 강한 운영체제로 알려진 OpenBSD에서 27년 된 취약점 발견. 공격자가 연결만으로 원격 crash를 유발할 수 있었음 |
| FFmpeg | 수많은 소프트웨어가 사용하는 FFmpeg에서 16년 된 취약점 발견. automated test가 해당 코드 라인을 500만 번 실행했지만 잡지 못했음 |
| Linux kernel | 여러 취약점을 autonomously 찾아 chain으로 연결하여 일반 사용자 권한에서 machine complete control로 escalation 가능 |

Anthropic은 위 취약점들을 maintainer에게 보고했고 모두 patch되었다고 밝혔다. 다른 취약점들에 대해서는 세부 정보를 바로 공개하지 않고 cryptographic hash를 먼저 제공한 뒤, 수정이 완료된 후 구체 내용을 공개하겠다고 한다.

#### 9.2.5 벤치마크와 모델 능력

원문은 Mythos Preview의 사이버 보안 능력이 강한 agentic coding과 reasoning 능력에서 나온다고 설명한다. 주요 수치는 다음과 같다.

| 평가 | Mythos Preview | Opus 4.6 |
|------|----------------|----------|
| CyberGym: Cybersecurity Vulnerability Reproduction | 83.1% | 66.6% |
| SWE-bench Pro | 77.8% | 53.4% |
| Terminal-Bench 2.0 | 82.0% | 65.4% |
| SWE-bench Multimodal(internal) | 59.0% | 27.1% |
| SWE-bench Multilingual | 87.3% | 77.8% |
| SWE-bench Verified | 93.9% | 80.8% |
| GPQA Diamond | 94.6% | 91.3% |
| Humanity's Last Exam without tools | 56.8% | 40.0% |
| Humanity's Last Exam with tools | 64.7% | 53.1% |
| BrowseComp | 86.9% | 83.7% |
| OSWorld-Verified | 79.6% | 72.7% |

단서도 있다.

- SWE-bench Verified/Pro/Multilingual 일부 문제는 memorization screen에 걸렸지만, 해당 문제를 제외해도 Mythos Preview의 우위는 유지된다고 한다.
- SWE-bench Multimodal은 internal implementation이므로 public leaderboard와 직접 비교하면 안 된다.
- Terminal-Bench 2.0은 Terminus-2 harness, maximum effort adaptive thinking, task당 100만 token budget 조건이다.
- Humanity's Last Exam은 low effort에서도 성능이 높아 memorization 가능성을 시사할 수 있다고 밝혔다.

Anthropic은 Mythos Preview를 **일반 공개할 계획이 없다**고 명시한다. 목표는 장기적으로 Mythos-class model을 안전하게 대규모 배포할 수 있게 하는 것이며, 이를 위해 위험한 cyber output을 탐지하고 차단하는 safeguard가 필요하다고 본다.

#### 9.2.6 Project Glasswing의 계획

Project Glasswing은 장기 프로젝트의 시작이다. 성공하려면 기술 산업 전체와 그 밖의 넓은 참여가 필요하다고 Anthropic은 말한다.

파트너들은 Mythos Preview 접근 권한을 받아 foundational system의 취약점과 약점을 찾고 고친다. 원문이 예상한 작업 범위는 다음과 같다.

- local vulnerability detection
- binary black-box testing
- endpoint security
- penetration testing

Anthropic의 $100M usage credits는 research preview 기간의 상당한 사용량을 지원한다. 이후 Project Glasswing 참여자는 Claude API, Amazon Bedrock, Google Cloud Vertex AI, Microsoft Foundry에서 Mythos Preview를 사용할 수 있으며 가격은 input/output token 백만 개당 **$25/$125**로 제시되었다.

open-source 측면에서는 Linux Foundation을 통해 Alpha-Omega와 OpenSSF에 **$2.5M**, Apache Software Foundation에 **$1.5M**를 기부했다. open-source maintainer는 Claude for Open Source program을 통해 접근을 신청할 수 있다.

Anthropic은 90일 안에 배운 점, 수정된 취약점, 공개 가능한 개선 사항을 보고하겠다고 한다. 또한 보안 관행이 AI 시대에 어떻게 바뀌어야 하는지에 대한 실무 권고안을 만들 계획이다.

검토 대상은 다음과 같다.

- vulnerability disclosure process
- software update process
- open-source and supply-chain security
- SDLC와 secure-by-design practice
- regulated industry standard
- triage scaling and automation
- patching automation

#### 9.2.7 정부와 산업 표준

Anthropic은 Mythos Preview의 offensive/defensive cyber capability에 대해 미국 정부 관계자들과도 논의해 왔다고 한다. critical infrastructure 보안은 민주주의 국가의 핵심 국가 안보 과제이며, 이런 cyber capability의 등장은 미국과 동맹국이 AI 기술에서 결정적 우위를 유지해야 하는 또 다른 이유라고 설명한다.

동시에 이 작업이 더 큰 산업·공공 부문 협력으로 이어지길 기대한다. 중기적으로는 민간과 공공 부문 조직을 함께 묶을 수 있는 독립적인 제3자 기관이 대규모 cybersecurity project의 적절한 거점이 될 수 있다고 제안한다.

#### 9.2.8 이름의 의미

Glasswing은 투명한 날개를 가진 나비 **Greta oto**에서 가져온 이름이다. 원문은 이 은유를 두 가지로 설명한다.

- 투명한 날개는 눈앞에 숨어 있는 취약점과 닮았다.
- 동시에 투명성은 해를 피하는 수단이며, Anthropic이 주장하는 접근 방식의 투명성을 상징한다.

### 9.3 해석

Project Glasswing은 단순한 보안 제품 발표가 아니다. Anthropic이 말하는 핵심 전환은 **AI가 취약점 탐지뿐 아니라 exploit 구성까지 자동화할 수 있는 수준으로 올라왔다는 것**이다.

위험은 명확하다. 같은 능력이 공격자에게 가면 zero-day 발견과 exploit 개발의 비용이 낮아지고 속도는 빨라진다. 방어자의 기존 프로세스, 특히 수동 triage와 느린 patching process는 더 이상 충분하지 않을 수 있다.

하지만 원문은 동시에 낙관의 근거도 제시한다. 공격에 쓰일 수 있는 능력은 방어에도 쓰일 수 있다. critical software를 먼저 scan하고, open-source maintainer에게 보안 능력을 확장해 주고, 취약점 공개·패치·공급망 보안 프로세스를 AI 시대에 맞게 재설계하면 방어자가 지속적인 우위를 가질 수 있다는 주장이다.

실무적으로는 다음 변화가 중요하다.

- 보안 리뷰가 사람 전문가 중심 병목에서 AI-assisted triage 구조로 이동한다.
- open-source maintainer도 고급 vulnerability detection 도구를 사용할 수 있어야 한다.
- patching automation과 disclosure process가 공격 속도에 맞춰 빨라져야 한다.
- powerful model의 cyber capability는 일반 공개보다 접근 통제와 safeguard가 먼저 필요하다.

결론적으로 Project Glasswing은 “AI로 보안 문제를 더 많이 찾자”가 아니라, **AI가 공격 속도를 바꿀 것이므로 방어 체계 자체를 다시 설계해야 한다**는 선언에 가깝다.

---

## 10. 메모리 시스템

CLAUDE.md 파일을 4계층 구조로 관리한다:

```mermaid
flowchart LR
    A["~/.claude/CLAUDE.md\n전역"] --> MERGE
    B["~/project/CLAUDE.md\n프로젝트 루트"] --> MERGE
    C["~/project/src/CLAUDE.md\n서브디렉터리"] --> MERGE
    D[대화 중 동적 메모리] --> MERGE
    MERGE[컨텍스트 어셈블리\n@include 병합] --> CTX([모델])

    style MERGE fill:transparent,stroke:#111827
    style CTX fill:transparent,stroke:#111827
```

`@include` 지시자로 파일을 포함할 수 있고, 컨텍스트 어셈블리 단계에서 이 4계층이 병합된다. `Auto-Compact` 압축이 일어난 뒤에도 CLAUDE.md 기반 메모리는 보존된다.

---

## 11. 아키텍처 관통 원칙

유출된 소스에서 드러난 가장 중요한 설계 철학은 하나다: **비용 인식(Cost Awareness)**.

- 에러 복구는 항상 무료 옵션부터
- 프리페치는 비블로킹 백그라운드에서
- 도구 정렬로 프롬프트 캐시 히트 최적화
- 트랜스크립트 저장은 사용자 메시지만 블로킹, 어시스턴트 메시지는 fire-and-forget
- 압축 단계마다 "얼마나 줄였는가"를 다음 단계로 전달해 중복 비용 방지

이는 단순한 기술적 우아함이 아니다. API 호출 한 번이 곧 비용인 LLM 시스템에서 비용 인식은 **경제적 생존 전략**이다. 아키텍처의 모든 결정이 이 원칙으로 수렴한다.

---

## 12. 교훈

8겹의 보안 레이어, 정교한 압축 시스템, 비용 인식 아키텍처를 갖췄음에도, `source map을 .npmignore에 추가`하는 기초적인 빌드 프로세스 체크리스트를 두 번 연속 놓쳤다.

이것이 소프트웨어 공학의 본질이다. **시스템의 정교함과 운영 실수는 서로 다른 축에 있다.** 복잡한 보안 아키텍처는 의도적인 공격을 막지만, 인간의 단순 실수를 막지는 못한다.

구체적으로, 아래 중 하나만 있었어도 막을 수 있었다:

- **`npm pack --dry-run`을 CI에서 실행** — 실제 배포될 파일 목록을 미리 출력해 소스맵 포함 여부를 확인할 수 있다
- **번들 파일 크기 임계값 검사** — 정상 배포 크기(수 MB)를 벗어나면 빌드를 실패시키는 단순 스크립트
- **`.npmignore` 변경 시 리뷰 필수 정책** — 패키징 규칙은 별도 승인 없이 수정할 수 없도록 브랜치 보호 규칙 추가

빌드 파이프라인의 자동화된 검증이 왜 중요한지를 보여주는 사례다.
