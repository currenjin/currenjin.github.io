---
layout  : wiki
title   : AWS Summit Seoul 2026 정리
summary : 직접 들은 세션 정리 (피지컬 AI, 당근 CloudHSM/KMS, 넥슨 에이전틱 Ops, 요기요 AIOps)
date    : 2026-05-20 00:00:00 +0900
updated : 2026-05-20 00:00:00 +0900
tags    : [conference, aws, devops, ai]
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# AWS Summit Seoul 2026

- 기간: 2026-05-20 (수) ~ 2026-05-21 (목)
- 장소: COEX Convention Center, Seoul
- 구성: Industry Day (5/20) + AI Day (5/21)
- 공식: [aws.amazon.com/ko/events/summits/seoul](https://aws.amazon.com/ko/events/summits/seoul/ )

여기서는 직접 들은 세션만 정리한다.

## AWS 피지컬 AI로 실현하는 기업의 차세대 혁신 전략

- Publisher: TBD

(정리 예정)

## 당근의 CloudHSM/KMS 기반 대규모 서명키 관리 시스템 구축기

- Publisher: 최용환 (Yany, SRE), 조승환 (Josh.cho, Identity Service Engineer)

### 한 줄 요약
- KMS vs CloudHSM
- 대부분의 워크로드는 KMS, 규제가 있고 직접 구축할 수 있다면 CloudHSM

> 스크린샷: KMS vs CloudHSM 비교 장표

---

### 당근 서비스와 서명키 과제 (최용환, SRE)

#### 기존 아키텍처의 한계

> 스크린샷: 기존 서명 아키텍처

- 촘촘한 접근 제어 기법이 필요했다
- 의도치 않은 토큰 서명이 발생할 수 있는 구조였다

#### 새 시스템에서 고려한 부분
- Private 키 유출이 없어야 한다
- 서명 트래픽을 감당해야 한다
- SPOF 없이 대안이 존재해야 한다
- 서명 트래픽에 촘촘한 접근 제어가 가능해야 한다
- 담당자 없이도 임의로 안전하게 서명할 수 있어야 한다

#### KMS vs CloudHSM 비교

| 기준 | KMS | CloudHSM |
|------|-----|----------|
| 처리량 | 1,000 RPS Soft Limit (증설 요청 가능) | 4 HSM 기준 7,000 RPS |
| 과금 | 요청당 과금 (요청 적으면 유리) | 인스턴스당 과금 (요청 많으면 유리) |
| 위치 | AWS Managed VPC 내 | 고객 VPC 내 물리적 격리 |
| 레이턴시 | 비교적 높음 | 같은 VPC 내라 낮음 |
| 접근 제어 | API | PKCS#11 |

---

### CloudHSM 선택과 도입기

> 스크린샷: 전체 아키텍처

#### 접근 제어 흐름
- HSM 담당자: HSM 관리 인스턴스에서 CLI로 HSM 접근
- 개발자: 접근 불가
- Token Issuer: Secrets Manager의 정보로 HSM 접근

#### HSM 사용자 역할

| 역할 | 권한 |
|------|------|
| Admin | User 관리 |
| Crypto | 키 생성과 설정 관리 |
| Crypto Read-only | 서명 수행 |

#### Access Controller

> 스크린샷: Access Controller 구성도

- Kyverno로 정책 적용
- CloudTrail로 감사

---

### Lessons Learned: Forward Proxy
- PKCS#11 Client 초기화 시 커넥션 에러 발생
- Istio에서 CloudHSM IP 식별을 위해 도메인을 병행 사용해야 함
- 처음에는 Service Discovery로 관리하려 했지만 세션이 불안정해 도메인 접근 포기
- 지금은 `configure-pkcs11` 방식으로 운영

---

### 서명 시스템 구현과 Failover 설계 (조승환, Identity Service Engineer)

PKCS#11은 C 기반으로 Shared Object 바이너리를 호출하는 구조라 FFI가 필요하다.

#### 서명 Failover
- Active / Standby 구조로 설계
- 서명 실패 시 Fallback signer 사용
- 실제 사례: HSM 통신에 Latency Spike 발생 시 Failover로 Secondary(KMS) 서명 전환

```mermaid
flowchart LR
    REQ["서명 요청"]
    REQ --> ACT["Primary: CloudHSM"]
    ACT -- "실패 / 지연" --> FB["Fallback: KMS"]
    ACT -- "성공" --> OUT["서명 결과"]
    FB --> OUT
```

#### 서명 알고리즘 전환
- 기존: RS256 (소인수분해 기반)
- 신규: ES256 (타원곡선 이산대수)

---

### 트러블슈팅

#### Scale-out 시 세션 고정 문제
- HSM을 추가하면 애플리케이션에서 세션 재연결이 필요
- 현재는 애플리케이션 재시작으로 대응

#### Scale-in 중 요청 실패
- HSM 인스턴스 종료 시점에 처리 중이던 요청 실패
- Fallback으로 사용자 관점의 에러는 없도록 처리

#### MaxSessions 튜닝
- 실패보다 대기가 낫다
- MaxSessions를 너무 높게 잡으면 Flow control이 없어 Latency 급등
- MaxSessions를 낮게 잡고 `poolWaitTimeout`을 함께 설정해서 Latency 소폭 증가만으로 안정화

#### 로깅 체계
- PKCS#11은 자체 로그 트래킹이 불가
- `.so` 파일이 남기는 바이너리 로그 파일을 실시간 tail하는 LogTail 구현
- Error Level은 Sentry, Metric은 Datadog로 송출

---

### 서명키 안전하게 전환하기 (Key Rotation)

```mermaid
flowchart LR
    A["1. 새 키 생성"] --> B["2. Weight 이동"]
    B --> C["3. 기존 서명 중단"]
    C --> D["4. 토큰 만료 대기"]
    D --> E["5. 공개키 제거"]
```

1. 새 키 생성
2. 트래픽 Weight 이동
3. 기존 키로의 서명 중단
4. 기존 키로 서명된 토큰 만료 대기
5. 공개키 제거

## 새벽 3시, 18만 개의 모델이 대신 판단한다 : 넥슨의 에이전틱 Ops

- Publisher: TBD

(정리 예정)

## 요기요의 AIOps: SRE 운영의 콘솔 탈출기

- Publisher: TBD

(정리 예정)

## 참고
- [AWS Summit Seoul 2026 공식](https://aws.amazon.com/ko/events/summits/seoul/ )
