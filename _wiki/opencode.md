---
layout  : wiki
title   : Open Code
summary :
date    : 2026-01-19 13:00:00 +0900
updated : 2026-02-17 22:40:00 +0900
tags    : ai-agent
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Open Code

Open Code를 처음 시작할 때 필요한 최소 설치/설정/실행 절차를 정리한다.

## 1. Install

기본 설치는 공식 문서 또는 배포 채널을 우선 사용한다.

- [Open Code 리뷰(1) : OpenCode 설치(oh-my-opencode 사전 학습) 및 설정, 기본 명령어 살펴보기](https://goddaehee.tistory.com/484)

설치 확인:

```bash
opencode --version
```

## 2. 기본 설정

사용하는 Provider API 키를 환경 변수로 등록한다.

```bash
export OPENAI_API_KEY="여기에_키_입력"
source ~/.zshrc
```

프로젝트 루트에서 설정 파일을 만든다.

```bash
mkdir -p ~/.config/opencode
vim ~/.config/opencode/config.yaml
```

예시:

```yaml
provider:
  name: openai
  model: gpt-5
  api_key_env: OPENAI_API_KEY

runtime:
  approval_mode: on-failure
  sandbox_mode: workspace-write
```

## 3. 실행

```bash
opencode doctor
opencode run
```

정상 확인 포인트:

- 설정 파일 로드 성공
- API 키 인증 성공
- 작업 디렉터리 접근 가능

## 4. OpenClaw와 비교

둘 다 비슷한 형태로 사용할 수 있으므로 아래 기준으로 선택한다.

- 현재 저장소 문서/자동화가 OpenClaw 중심이면 OpenClaw 우선
- 기존 팀 스크립트/별칭이 Open Code 기준이면 Open Code 우선
- 혼용 시에는 설정 파일 경로와 명령어 prefix를 명확히 분리

## 5. 트러블슈팅

### 5.1 `command not found: opencode`

- 설치 경로가 `PATH`에 포함되어 있는지 확인
- 셸 재시작 또는 `source ~/.zshrc` 재적용

### 5.2 `API key not found`

- `echo $OPENAI_API_KEY`로 값 확인
- `config.yaml`의 `api_key_env` 값 확인

### 5.3 권한 오류

- 실행 권한 확인: `chmod +x <opencode-binary>`
- 쓰기 경로 권한 확인

## 6. 운영 메모

- 설정 변경 전 `~/.config/opencode/config.yaml` 백업
- profile/alias를 분리해 OpenClaw와 명령 충돌을 피한다
- 공통 프롬프트는 별도 파일로 분리해 재사용한다
