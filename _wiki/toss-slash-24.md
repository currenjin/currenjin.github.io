---
layout  : wiki
title   : TOSS SLASH 24 정리
summary :
date    : 2024-09-15 06:00:00 +0900
updated : 2024-09-15 06:00:00 +0900
tags     : conference
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# TOSS SLASH 24
## CPU Observability 높이는 Hyperthread 톺아보기

- Publisher : `최준우 Server Developer`
- File : `slash24-5.pdf`

### Problem
> 노드의 50%를 넘어서 사용할 때 경합으로 인해 성능이 떨어지는 이슈가 있다.

> 고객 사례중 비슷한 케이스도 확인되었고, CPU 사용률이 50% 이상인 경우 HyperThreading 아키텍쳐가 적합한 모델이 아니라 함.

### Hyperthread란?
1개의 물리적 코어를 여러 개의 논리적 코어로 사용할 수 있는 Intel의 기술

1. Pipeline
   - 명령어 처리 과정을 여러 단계로 나누어 동시 처리 
   1. Instruction fetch : CPU가 메모리에서 다음 실행할 명령어를 가져옴
   2. Decode : 가져온 명령어를 CPU가 이해할 수 있는 형태로 변환
   3. Executable : 명령어 실행에 필요한 리소스가 사용 가능한지 확인
   4. Execute : 리소스가 사용 가능하면 명령어 실행. 그렇지 않으면 대기 상태
   5. Complete : 결과 저장 후 다음 명령어로 넘어감
2. Out of order
   - 명령어의 원래 순서와 관계없이 실행 가능한 명령어를 먼저 처리
3. Super scalar
   - 여러 개의 명령어를 동시에 실행할 수 있는 다중 실행 유닛을 가진 아키텍처

### 성능 측정
- CPU Usage는 노이즈가 있으니 Instruction 처리량을 확인해야 함
- Linux-KI, perf 활용

다른 노드에서 HT on VS off
   - Hyperthread 활성화한 경우가 성능이 더 좋다고 파악됨(약 30%)
같은 노드에서 HT on VS off
   - 마찬가지로, Hyperthread 활성화한 경우가 성능이 더 좋다고 파악됨(약 30%)

그럼 무엇이 문제인가?
   - 자원 경합으로 인한 stall 증가
   - stall은 CPU가 다음 명령어를 실행하지 못하고 대기하는 상태

그렇다면, CPU frontend부터 backend까지 Performance counter를 통해 병목지점 분석
   - Tools : pmu-tools
   - Backend Bound 성능이 눈에 띄게 저하됨

### 결론
우리가 좋다고 생각하는 모든 기술은 다양한 환경과 상황에 따라 원하는 퍼포먼스를 내지 않을 수 있다.

사용 중인 워크로드의 환경과 조건을 생각해 최선의 선택을 하자.

## 클릭 한 번으로 테스트 45만 개 완료! 테스트 자동화 플랫폼 구축기

- Publisher : `박정웅, Node.js Developer`
- File : `slash24-14.pdf`


### Problem
1. 표준화 되지 않은 다양한 테스트 자동화 도구 사용 
   - 통합된 테스트 자동화 플랫폼 제공

2. 표준화 되지 않은 자동화 코드의 공유
   - 통합된 테스트 자동화 플랫폼을 활용한 공유(git 연동)

3. 테스트 결과 가공의 어려움
   - 테스트 결과의 이력관리 및 커스텀 리포트 자동 생성

### Playwright
- 테스트 코드에 필요한 대부분의 함수 제공
- Visual Studio Code와 연동되는 개발 도구
- 리포트 생성 도구

### MVP
- 테스트 파일 실행 제어 -> `Playwright로 커버 가능`
- 테스트 파일의 실행 리포트 생성 -> `Playwright로 커버 가능`
- 실행 이력 조회

### Platform
1. Admin
   - 테스트 관련 요청 조회, 데이터 처리
2. Test Runner
   - Playwright 실행, 결과 전달
3. Deploy Server
   - JS 파일 번들링, S3 업로드

**테스트 동작 순서**
1. Admin : 테스트 실행 요청
2. SQS : 실행 요청량 제어
3. Runner : 테스트 실행
4. S3 : 결과 저장

But, 컴퓨팅 리소스 문제가 있다.
- SQS로 해결
- Chunk 단위로 처리(Reporter Interface)

**배포 동작 순서**
1. Bundling : 여러 모듈을 하나의 JS 파일로 합침(webpack)
2. S3 : 테스트 파일 저장


