---
layout  : wiki
title   : Git
summary :
date    : 2025-01-17 20:00:00 +0900
updated : 2026-03-03 20:30:00 +0900
tags    : [git]
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Git

## Commit message conventions

### 과거형, 진행형, 현재형

**Git commit message**를 작성할 때 **과거형, 진행형, 현재형** 중 뭐가 좋을까?

_**결론 : 현재형**_

#### 근거

1. 표준화
    - Git 자체 명령어 및 행위가 모두 현재형으로 작성되어 있습니다. (ex. Pull request, Merge, Approve)
    - 사용자 입장에서 이를 따라 Commit message를 작성할 경우 일관성을 띌 수 있습니다.
2. 시간 독립성
    - Git의 특성 상 과거에 작업한 Commit을 가져오는 일도 빈번합니다.
    - 현재형의 Commit message인 경우, 과거 또는 현재에 작업한 이력을 적용하는 시점이 어느 때라도 ‘이 작업이 지금 반영된다‘라는 의미가 유지됩니다.
3. 의미 전달의 능동성
    - 과거형인 경우 ‘무슨 일이 일어났는지‘를 설명합니다.
    - 현재형인 경우 ‘이 커밋이 무슨 일을 하는지’를 설명합니다.

웬만하면 현재형으로 작성하자.

```text
ex) Feat: Separate API query scope between SuperAdmin and Admin
```

### Commit type

- Feat : 새로운 기능을 추가
- Fix : 버그 수정
- Design : CSS 등 사용자 UI 디자인 변경
- !BREAKING CHANGE : 커다란 API 변경의 경우
- !HOTFIX : 급하게 치명적인 버그를 고쳐야하는 경우
- Style : 코드 포맷 변경, 세미 콜론 누락, 코드 수정이 없는 경우
- Refactor : 프로덕션 코드 리팩토링
- Comment : 필요한 주석 추가 및 변경
- Docs : 문서 수정
- Test : 테스트 코드, 리펙토링 테스트 코드 추가, Production Code 변경 없음
- Chore : 빌드/패키지 매니저/설정 업데이트, Production Code 변경 없음
- Rename : 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
- Remove : 파일을 삭제하는 작업만 수행한 경우

---

## 자주 쓰는 실전 설정

### 최초 글로벌 설정

```bash
git config --global user.name "your-name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global rebase.autoStash true
git config --global fetch.prune true
git config --global core.autocrlf input
```

### 추천 alias

```bash
git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.co checkout
git config --global alias.sw switch
git config --global alias.br branch
git config --global alias.rb rebase
git config --global alias.cm "commit -m"
git config --global alias.unstage "restore --staged"
```

---

## 브랜치 운영

### 기본 흐름

1. main 최신화
2. feature 브랜치 생성
3. 작은 단위로 commit
4. push + PR
5. merge 후 로컬 브랜치 정리

```bash
git switch main
git pull --rebase

git switch -c feature/login
# ... 작업 ...
git add .
git commit -m "Feat: Add login API"
git push -u origin feature/login
```

### 브랜치 정리

```bash
git branch -d feature/login
git fetch -p
```

---

## Stage/Commit 고급 사용

### 부분 스테이징 (hunk 단위)

```bash
git add -p
```

### 직전 커밋 메시지/내용 수정

```bash
git commit --amend
```

### 커밋은 유지하고 index만 되돌리기

```bash
git reset --soft HEAD~1
```

---

## Rebase / Cherry-pick / Revert / Reset

### interactive rebase (커밋 정리)

```bash
git rebase -i HEAD~5
```

- squash/fixup: 커밋 합치기
- reword: 메시지 수정
- drop: 커밋 제거

### 특정 커밋만 가져오기

```bash
git cherry-pick <commit-hash>
```

### 공유 브랜치에서 안전한 되돌리기

```bash
git revert <commit-hash>
```

### 로컬 작업만 강하게 되돌리기 (주의)

```bash
git reset --hard <commit-hash>
```

---

## 충돌 해결 실전

### rebase 중 충돌

```bash
# 충돌 해결 후
git add .
git rebase --continue

# 포기
git rebase --abort
```

### merge 도구 사용

```bash
git mergetool
```

### 같은 충돌 반복 해결 자동화

```bash
git config --global rerere.enabled true
```

---

## 추적/디버깅에 강한 명령어

### 누가 이 줄을 바꿨는지

```bash
git blame path/to/file
```

### 파일 변경 히스토리 집중 보기

```bash
git log -- path/to/file
```

### 버그 유입 커밋 찾기

```bash
git bisect start
git bisect bad
git bisect good <known-good-hash>
# 테스트 반복 후
git bisect reset
```

### 잃어버린 커밋 복구

```bash
git reflog
git switch -c recovery <reflog-hash>
```

---

## Stash 제대로 쓰기

```bash
# 현재 변경 임시 저장
git stash push -m "wip: login form"

# untracked 포함
git stash -u

# 목록/적용/삭제
git stash list
git stash apply stash@{0}
git stash drop stash@{0}
```

---

## Git worktree

`git worktree`는 **하나의 Git 저장소를 여러 작업 디렉토리로 동시에 체크아웃**해서 쓰는 기능이다.

- 장점
  - 브랜치 전환(stash) 없이 병렬 작업 가능
  - hotfix / feature / release를 동시에 열어두기 쉬움
  - CI 재현, 코드리뷰 대응, 긴급 패치 속도 향상

### 기본 개념

- 메인 저장소: `.git` 메타데이터를 가진 원본 디렉토리
- 워크트리: 같은 저장소를 참조하는 추가 작업 디렉토리
- 제약: **하나의 브랜치는 동시에 하나의 워크트리에서만 checkout 가능**

### 자주 쓰는 명령어

```bash
# 1) 현재 연결된 worktree 목록 확인
git worktree list

# 2) 새 worktree 생성 (기존 브랜치)
git worktree add ../repo-feature feature/login

# 3) 새 worktree 생성 + 새 브랜치 생성 (-b)
git worktree add -b feature/payment ../repo-payment main

# 4) 새 worktree 생성 + 원격 브랜치 tracking
git worktree add --track -b feature/api ../repo-api origin/main

# 5) worktree 제거
git worktree remove ../repo-feature

# 6) 끊어진(worktree 폴더를 수동 삭제한) 메타데이터 정리
git worktree prune
```

### 실전 워크플로우

#### 1) 기능 개발 분리

```bash
# 메인 저장소 위치: ~/workspace/my-repo
cd ~/workspace/my-repo

# 로그인 기능 작업용 worktree 생성
git worktree add -b feature/login ../my-repo-login main

# 결제 기능 작업용 worktree 생성
git worktree add -b feature/payment ../my-repo-payment main
```

- `my-repo-login`, `my-repo-payment` 폴더를 각각 IDE로 열어 독립 개발
- 각 워크트리에서 별도 commit / push / PR 수행

#### 2) 긴급 hotfix 병행

```bash
# 운영 브랜치 기준으로 hotfix worktree 생성
git worktree add -b hotfix/critical ../my-repo-hotfix release
```

- 기존 feature 작업을 건드리지 않고 즉시 패치 가능

### 브랜치/삭제 관련 주의점

- 워크트리가 붙어 있는 브랜치는 바로 삭제 안 됨
- 먼저 워크트리 제거 후 브랜치 삭제

```bash
git worktree remove ../my-repo-login
git branch -d feature/login
```

강제 삭제가 필요한 경우:

```bash
git worktree remove --force ../my-repo-login
git branch -D feature/login
```

### 이동/락(lock)

```bash
# worktree 경로 이동 (Git 메타데이터까지 같이 업데이트)
git worktree move ../my-repo-payment ../my-repo-payment-v2

# 실수 삭제 방지를 위한 잠금
git worktree lock ../my-repo-hotfix

# 잠금 해제
git worktree unlock ../my-repo-hotfix
```

### 장애 복구 팁

워크트리 폴더를 Finder/터미널에서 그냥 지웠다면:

```bash
git worktree prune
```

worktree 상태가 꼬였을 때 점검 순서:

1. `git worktree list`로 참조 경로 확인
2. 실제 디렉토리 존재 여부 확인
3. 없는 경로 정리: `git worktree prune`
4. 필요 시 다시 생성: `git worktree add ...`

### 팀 운영 권장 규칙

- worktree 디렉토리는 저장소 옆에 규칙적으로 생성
  - 예: `../my-repo-feature-xxx`, `../my-repo-hotfix-yyy`
- 브랜치명과 디렉토리명을 최대한 맞춘다
- 작업 종료 시 반드시 `worktree remove`로 정리
- 장기 방치 방지를 위해 주기적으로 `git worktree list` 점검

---

## 원격/푸시 실수 방지

### upstream 지정

```bash
git push -u origin feature/login
```

### 강제 푸시는 `--force-with-lease`

```bash
git push --force-with-lease
```

`--force`보다 안전하다. (원격이 예상과 다르면 푸시 거부)

### 원격 브랜치 정리

```bash
git fetch -p
```

---

## 태그/릴리즈

```bash
# annotated tag
git tag -a v1.2.0 -m "release v1.2.0"

# 태그 푸시
git push origin v1.2.0

# 전체 태그 푸시
git push origin --tags
```

---

## 파일/라인엔딩/대용량 관리

### .gitignore 적용 누락 시

```bash
git rm -r --cached .
git add .
git commit -m "Chore: Re-apply .gitignore"
```

### 대용량 파일은 Git LFS 검토

- 바이너리/모델 파일/대형 아카이브를 일반 Git에 계속 쌓지 않는다.
- 필요시 Git LFS 사용.

---

## 팀 규칙 추천 (짧고 강하게)

- 커밋은 작고 의미 있게
- main에 직접 push 금지
- PR은 1개의 목적만 담기
- 리뷰 전 `rebase`로 히스토리 정리
- 머지 후 브랜치/워크트리 즉시 정리

---

## Error

### credential lock

```shell
fatal: unable to get credential storage lock in 1000 ms: File exists
```

해결 순서:

1. 동시에 실행 중인 Git 프로세스 종료
2. 잠금 파일 제거 (`~/.git-credential*` 계열 확인)
3. 필요시 터미널 재시작 후 재시도

### push rejected (fetch first)

```shell
! [rejected] main -> main (fetch first)
```

```bash
git pull --rebase origin main
git push
```

### detached HEAD

```bash
git switch -c fix/detached-head
```

현재 HEAD 상태를 브랜치로 고정한 뒤 작업 이어가면 된다.
