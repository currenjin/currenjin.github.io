---
layout  : wiki
title   : OpenClaw
summary : OpenClaw 설치 및 설정 가이드
date    : 2026-02-17 18:00:00 +0900
updated : 2026-02-17 22:35:00 +0900
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

공식 릴리즈 페이지에서 `darwin-arm64` 파일을 내려받아 설치한다.

```bash
# 1) 공식 릴리즈 페이지에서 darwin-arm64 파일 다운로드
# 2) 다운로드한 파일명을 아래 변수에 넣고 실행
FILE="openclaw-darwin-arm64"
chmod +x "$FILE"
sudo mv "$FILE" /usr/local/bin/openclaw
```

설치 확인:

```bash
openclaw --version
uname -m
```

`uname -m` 결과가 `arm64`면 Apple Silicon 환경이 맞다.

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

### 3.1 설정 키 설명 (필수/선택)

| 키 | 필수 여부 | 설명 |
| --- | --- | --- |
| `profile` | 선택 | 기본 프로파일 이름 |
| `provider.name` | 필수 | Provider 식별자 |
| `provider.model` | 필수 | 사용할 모델 ID |
| `provider.api_key_env` | 필수 | API 키를 읽어올 환경 변수명 |
| `runtime.approval_mode` | 선택 | 승인 정책 |
| `runtime.sandbox_mode` | 선택 | 파일/명령 샌드박스 정책 |
| `runtime.shell` | 선택 | 기본 셸 |
| `paths.workspace_root` | 선택 | 작업 루트 경로 |
| `paths.log_dir` | 선택 | 로그 저장 경로 |
| `defaults.language` | 선택 | 응답 언어 기본값 |
| `defaults.response_style` | 선택 | 응답 스타일 기본값 |

## 4. Apple Silicon 기종별 권장값

아래는 시작점으로 쓰기 좋은 값이다. 실제로는 프로젝트 크기와 사용하는 모델에 맞춰 조정한다.

| 기종 | 권장 프로파일 | 동시 작업 수(worker) | 요청 타임아웃 | 비고 |
| --- | --- | --- | --- | --- |
| MacBook Air M1 (8GB/16GB) | `air-m1` | 1~2 | 120s | 메모리 여유를 우선 |
| MacBook Air M2 (8GB/16GB/24GB) | `air-m2` | 2~3 | 120s | M1 대비 약간 공격적 |
| Mac mini M4 (16GB+) | `mini-m4` | 3~5 | 90s | 병렬 작업 중심 |

프로파일 예시:

```yaml
profiles:
  air-m1:
    runtime:
      max_workers: 2
      request_timeout_sec: 120
  air-m2:
    runtime:
      max_workers: 3
      request_timeout_sec: 120
  mini-m4:
    runtime:
      max_workers: 5
      request_timeout_sec: 90
```

조정 기준:

- 발열/배터리 소모가 빠르면 `max_workers`를 1 낮춘다.
- 응답 지연이 잦으면 `request_timeout_sec`를 30초 단위로 늘린다.
- IDE, 브라우저, Docker를 동시에 사용할 때는 Air 계열에서 `max_workers`를 1~2로 유지한다.

## 5. 프로파일 적용 예시

`config.yaml`의 기본 프로파일을 기종에 맞게 고정해서 사용한다.

```yaml
profile: air-m2
```

혹은 실행 시 프로파일을 명시한다.

```bash
openclaw run --profile air-m2
```

## 6. 환경 변수 등록

쉘 설정 파일(`~/.zshrc` 또는 `~/.bashrc`)에 추가:

```bash
export OPENAI_API_KEY="여기에_키_입력"
```

적용:

```bash
source ~/.zshrc
```

## 7. 첫 실행

```bash
openclaw doctor
openclaw run
```

정상이라면 다음을 확인할 수 있다.

- 설정 파일 로드 성공
- Provider 인증 성공
- workspace 접근 가능

성공 출력 예시:

```text
[OK] config loaded: ~/.config/openclaw/config.yaml
[OK] provider auth: OPENAI_API_KEY
[OK] workspace access: ~/work
```

실패 출력 예시:

```text
[ERR] provider auth failed: OPENAI_API_KEY is empty
[ERR] config parse error: line 12, column 3
```

## 8. 콘텐츠 반영 확인 (GitHub Actions)

이 저장소는 `_wiki/**`가 `main`에 push되면 `Sync Medium Posts` 워크플로우가 실행되고 `_data/updates.json`을 갱신한다.

체크 순서:

1. 위키 문서 커밋 후 `main`에 push
2. GitHub Actions에서 `Sync Medium Posts` 성공 확인
3. 홈 화면 `최근 업데이트`에 문서가 노출되는지 확인

## 9. 자주 쓰는 운영 팁

- 설정 변경 전 `config.yaml` 백업
- 프로젝트별 profile 분리(`default`, `work`, `personal`)
- 로그 폴더 용량 주기적 정리

## 10. 트러블슈팅

### 10.1 `API key not found`

- `echo $OPENAI_API_KEY`로 값 확인
- 쉘 파일 수정 후 `source` 적용 여부 확인

### 10.2 `permission denied`

- 바이너리 실행 권한 확인: `chmod +x /usr/local/bin/openclaw`
- 작업 디렉터리 권한 확인

### 10.3 `config parse error`

- YAML 들여쓰기(스페이스 2칸) 점검
- 키 이름 오타 점검

## 11. 업데이트 체크리스트

업데이트할 때는 아래 순서로 진행한다.

1. 현재 설정 백업
2. OpenClaw 버전 업데이트
3. `openclaw --version` 확인
4. `openclaw doctor` 재검증
5. 문제 없으면 기존 백업 삭제
