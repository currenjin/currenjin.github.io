---
layout  : wiki
title   : Claude Code
summary : 소스맵 유출로 드러난 내부 아키텍처 분석
date    : 2026-04-01 12:00:00 +0900
updated : 2026-04-01 12:00:00 +0900
tags     : ai-agent
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# Claude Code

Anthropic이 만든 터미널 기반 에이전틱 코딩 도구. 2026년 3월 31일, npm 패키지에 소스맵이 실수로 포함되어 내부 TypeScript 소스코드가 공개되었다.

> 참고 자료
> - [Learn Claude Code (9bow)](https://9bow.github.io/learn-claude-code/)
> - [Claude Code Source Map Leak Analysis](https://bits-bytes-nn.github.io/insights/agentic-ai/2026/03/31/claude-code-source-map-leak-analysis.html)
> - [claude-code-sourcemap (GitHub)](https://github.com/leeyeel/claude-code-sourcemap/tree/main)

## 1. 소스코드 유출 사건

### 1.1 경위

- Claude Code npm 패키지 **v2.1.88** 배포 시, 59.8MB의 소스맵 파일이 실수로 포함됨
- 소스맵에는 Cloudflare R2 버킷에 호스팅된 zip 파일 경로가 담겨 있었고, 그 안에 원본 TypeScript 소스가 그대로 존재
- 보안 연구자 Chaofan Shou가 X(구 Twitter)에서 최초 공개
- Anthropic은 "릴리즈 패키징 과정의 인적 오류(human error)"라고 발표

### 1.2 유출 규모

| 항목 | 수치 |
|------|------|
| 노출된 파일 수 | 4,600개 이상 |
| 공식 오픈소스 저장소 파일 수 | 279개 (플러그인 인터페이스만) |
| 코드 줄 수 | 약 51만 줄 이상 |
| GitHub 포크 수 | 41,500회 이상 |

### 1.3 노출된 내용

- 슬래시 커맨드 및 내장 도구 전체
- 텔레메트리 코드, 피처 플래그
- 에이전트 아키텍처 및 컨텍스트 관리 로직
- 미출시 기능들 (Voice Mode, Kairos, Bridge 등)

모델 가중치, 고객 데이터, 인증 자격증명은 포함되지 않았다.

---

## 2. 기술 스택

| 항목 | 내용 |
|------|------|
| 런타임 | Bun (빠른 시작, TypeScript 네이티브) |
| UI | React 18 + Ink (터미널 UI 렌더링) |
| API | Anthropic SDK, MCP 클라이언트 |
| 번들러 | Bun의 `feature()` 함수로 빌드 타임 데드코드 제거 |

---

## 3. 에이전틱 루프 (`query.ts`, 1,729줄)

`async generator` 패턴으로 이벤트 스트리밍과 종료 시맨틱을 처리한다. 매 턴마다 6단계 파이프라인이 실행된다.

1. **Pre-Request Compaction**: 5개 압축 메커니즘 순차 적용
2. **API 호출 + 스트리밍**: 모델이 응답하는 중 도구가 병렬 실행
3. **에러 복구**: 무료 → 저비용 → 고비용 순 캐스케이드
4. **Stop Hooks**: 사용자 정의 검증 로직
5. **도구 실행**: 배치 및 스트리밍 모드 공존
6. **Post-Tool**: 메모리 프리페치 수확, 상태 전이

설계 전반을 관통하는 원칙은 **"비용 최소화"**다.

---

## 4. 메시지 압축: 4단계 계층

| 단계 | 비용 | 정보손실 | 특징 |
|------|------|---------|------|
| Snip | 무료 | 높음 | 오래된 메시지 제거 |
| Microcompact | 무료 | 중간 | 캐시 편집 블록 피닝 |
| Context Collapse | 낮음 | 중간 | 읽기 시점 프로젝션 |
| Auto-Compact | 높음 | 낮음 | Claude API로 전체 요약 |

각 계층은 파레토 최적점. **프롬프트 캐싱과의 조화**가 설계 핵심이다.

---

## 5. 보안: 8개 레이어

1. **빌드 타임 게이트**: `feature()` 함수로 코드 물리 제거
2. **피처 플래그**: GrowthBook 기반 서버 측 킬 스위치
3. **설정 기반 규칙**: 8개 소스의 우선순위 체계
4. **Transcript Classifier**: "자동 모드"에서 AI가 안전성 판정
5. **위험 패턴 감지**: Bash 인터프리터 와일드카드 차단
6. **파일시스템 권한**: symlink 탈출 방지, 경로 정규화
7. **Trust Dialog**: 초기 실행 시 보안 검토
8. **Bypass Kill Switch**: 최후 수단으로 권한 우회 모드 전체 차단

`feature()` 함수로 코드가 컴파일 타임에 제거되므로, 런타임에 환경변수를 조작해도 해당 기능을 활성화할 수 없다.

---

## 6. 미출시 기능 (피처 플래그 뒤)

### 6.1 Voice Mode

- OAuth 전용, API 키 불가
- `tengu_amber_quartz_disabled` 킬 스위치

### 6.2 Web Browser Tool

- 실제 JavaScript 렌더링 자동화
- Computer Use의 CLI 버전

### 6.3 Coordinator Mode

- 메타 오케스트레이터가 워커 에이전트를 관리
- 워커 간 공유 스크래치패드 (`tengu_scratch`)
- "AI가 AI를 오케스트레이션하는" 마이크로서비스 구조

### 6.4 Kairos (선제적 모드)

- `SleepTool`: 백그라운드 대기
- `SubscribePRTool`: GitHub PR 웹훅 구독
- `PushNotificationTool`: 모바일 알림
- 사용자 세션 없이도 Claude가 독립적으로 작동하는 구조

### 6.5 Bridge (원격 제어)

- 33개 파일, Git worktree로 세션 격리
- Standard / Elevated 2티어 인증
- claude.ai 웹에서 로컬 머신을 제어

---

## 7. 아키텍처 인사이트

### 7.1 비용 인식이 기술적 우아함을 결정

- 에러 복구는 API 호출이 없는 방법부터 시도
- 감소 수익(diminishing returns) 3턴 후 자동 중단
- 도구 정렬이 캐시 히트율을 최적화

### 7.2 상태 관리의 원자성

- "Continue Site" 패턴으로 상태를 전체 재할당
- 부분 업데이트로 인한 중간 상태 버그 방지

### 7.3 스트리밍 중 병렬 도구 실행

- 읽기 전용 도구는 `isConcurrencySafe` 플래그로 병렬화
- 형제 도구 에러 시 다른 도구도 `sibling_error`로 취소

### 7.4 Defense in Depth

- 한 레이어가 실패해도 다음 레이어가 잡음
- Fail-to-prompting 전략: 거부가 아닌 사용자 판단 위임

---

## 8. 교훈

8겹의 보안 레이어와 정교한 컨텍스트 관리를 갖췄음에도, `source map을 .npmignore에 추가`하는 기초적인 빌드 프로세스 체크리스트를 놓쳤다.

**복잡한 시스템도 단순한 실수에 무너진다.** 소프트웨어 공학의 본질을 보여주는 사례다.

이는 2025년 2월의 동일 유형 유출에 이은 두 번째 사건이기도 하다.
