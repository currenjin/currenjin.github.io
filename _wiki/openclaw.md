---
layout  : wiki
title   : OpenClaw
summary : OpenClaw 설치 및 설정 가이드
date    : 2026-02-17 21:00:00 +0900
updated : 2026-02-17 21:00:00 +0900
tags    : ai-agent
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# OpenClaw 설정 가이드

이 문서는 2026-02-17 기준으로, 처음 세팅하는 사람이 그대로 따라 할 수 있게 정리한 OpenClaw 설정 가이드다.

## 1. 준비

- OpenClaw를 실행할 머신(로컬 또는 서버)
- 패키지 매니저(`brew`, `apt` 등)
- 편집기(`vim`, `nano`, `code` 중 하나)
- API 키(필요한 Provider 기준)

## 2. 설치

아래 둘 중 한 가지 방법으로 설치한다.

### 2.1 패키지 매니저 사용

```bash
# 예시 (환경에 맞게 수정)
brew install openclaw
```

### 2.2 바이너리 직접 설치

```bash
# 예시 (버전/플랫폼에 맞는 파일로 변경)
curl -LO https://example.com/openclaw/openclaw-linux-amd64
chmod +x openclaw-linux-amd64
sudo mv openclaw-linux-amd64 /usr/local/bin/openclaw
```

설치 확인:

```bash
openclaw --version
```

## 3. 설정 파일 만들기

기본 경로 예시:

```bash
mkdir -p ~/.config/openclaw
vim ~/.config/openclaw/config.yaml
```

`config.yaml` 예시:

```yaml
profile: default

provider:
  name: openai
  model: gpt-5
  api_key_env: OPENAI_API_KEY

runtime:
  approval_mode: on-failure
  sandbox_mode: workspace-write
  shell: zsh

paths:
  workspace_root: ~/work
  log_dir: ~/.config/openclaw/logs

defaults:
  language: ko
  response_style: concise
```

## 4. 환경 변수 등록

쉘 설정 파일(`~/.zshrc` 또는 `~/.bashrc`)에 추가:

```bash
export OPENAI_API_KEY="여기에_키_입력"
```

적용:

```bash
source ~/.zshrc
```

## 5. 첫 실행

```bash
openclaw doctor
openclaw run
```

정상이라면 다음을 확인할 수 있다.

- 설정 파일 로드 성공
- Provider 인증 성공
- workspace 접근 가능

## 6. 자주 쓰는 운영 팁

- 설정 변경 전 `config.yaml` 백업
- 프로젝트별 profile 분리(`default`, `work`, `personal`)
- 로그 폴더 용량 주기적 정리

## 7. 트러블슈팅

### 7.1 `API key not found`

- `echo $OPENAI_API_KEY`로 값 확인
- 쉘 파일 수정 후 `source` 적용 여부 확인

### 7.2 `permission denied`

- 바이너리 실행 권한 확인: `chmod +x /usr/local/bin/openclaw`
- 작업 디렉터리 권한 확인

### 7.3 `config parse error`

- YAML 들여쓰기(스페이스 2칸) 점검
- 키 이름 오타 점검

## 8. 업데이트 체크리스트

업데이트할 때는 아래 순서로 진행한다.

1. 현재 설정 백업
2. OpenClaw 버전 업데이트
3. `openclaw --version` 확인
4. `openclaw doctor` 재검증
5. 문제 없으면 기존 백업 삭제
