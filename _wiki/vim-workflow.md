---
layout  : wiki
title   : Vim 업무환경 표준 세팅
date    : 2026-02-26 16:50:00 +0900
updated : 2026-02-26 23:58:00 +0900
tags    : vim tmux productivity
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# Vim 업무환경 표준 세팅

이 문서는 처음 세팅한 뒤 바로 업무에 쓰는 데 집중한다.
최소 툴만 사용한다.

최소 툴:
- vim
- tmux
- ripgrep(rg)
- fzf
- fd

---

## 1. 초기 세팅 (처음 1회)

### 1-1. 설치

```bash
xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install vim tmux ripgrep fzf fd git
$(brew --prefix)/opt/fzf/install
```

### 1-2. 설정 파일 만들기

```bash
cat > ~/.vimrc <<'VIM'
set nocompatible
set number
set relativenumber
set tabstop=2
set shiftwidth=2
set expandtab
set ignorecase
set smartcase
set incsearch
set hlsearch

" 저장/종료
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>

" insert 모드 탈출
inoremap jj <Esc>
VIM

cat > ~/.tmux.conf <<'TMUX'
set -g mouse on
set -g history-limit 100000
set -g base-index 1
setw -g pane-base-index 1
unbind C-b
set -g prefix C-a
bind C-a send-prefix
bind r source-file ~/.tmux.conf \; display-message "tmux reloaded"
TMUX
```

### 1-3. 설치 확인

```bash
vim --version
tmux -V
rg --version
fd --version
fzf --version
```

---

## 2. 사용법 (시나리오별)

### 시나리오 1) 특정 에러 코드 원인 찾고 수정하기

상황:
- 로그에 `B4000-CO-GN001` 에러가 발생함

흐름:
1. tmux 세션 시작
```bash
tmux new -s work
```
2. 패널 분할
- `Ctrl-a %` (세로)
- `Ctrl-a "` (가로)
- 패널 이동: `Ctrl-a + 방향키`
3. 좌측 패널: 코드 열기
```bash
vim .
```
4. 우상 패널: 테스트 대기
```bash
./gradlew test --continuous
```
5. 우하 패널: 로그 확인
```bash
tail -f app.log
```
6. 코드에서 에러 코드 검색
```bash
rg "B4000-CO-GN001" -g "*.kt"
```
7. 후보 파일 중 하나 열기
```bash
vim "$(fd exception | fzf)"
```
8. vim에서 수정
- 검색: `/B4000-CO-GN001`
- 단어 수정: `ciw`
- 저장: `:w`
9. 테스트 통과 확인 후 커밋

---

### 시나리오 2) 함수 이름은 아는데 파일 위치를 모를 때

상황:
- `processExcel` 함수 위치를 빠르게 찾고 싶음

흐름:
1. 함수명으로 내용 검색
```bash
rg "fun processExcel|processExcel\(" -g "*.kt"
```
2. 파일명이 애매하면 파일명 탐색
```bash
fd excel -e kt
```
3. 결과가 많으면 fzf로 선택
```bash
fd -e kt | fzf
```
4. 선택 파일 열기
```bash
vim "$(fd -e kt | fzf)"
```
5. vim에서 함수로 점프
- `/processExcel`
- 다음 결과: `n`

---

### 시나리오 3) 대규모 문자열 치환하기

상황:
- `transportMessage`를 `loadingMessage`로 바꿔야 함

흐름:
1. 영향 범위 확인
```bash
rg "transportMessage" -g "*.kt"
```
2. 하나 파일에서 안전하게 변경
- 파일 열기: `vim <파일>`
- 전체 치환: `:%s/transportMessage/loadingMessage/g`
- 저장: `:w`
3. 여러 파일 변경은 반복 수행
- `rg`로 재확인해서 남은 항목 처리
4. 테스트로 회귀 확인
```bash
./gradlew test
```

---

### 시나리오 4) 커맨드 기억 안 날 때

상황:
- 예전에 쓴 복잡한 gradle 명령을 다시 쓰고 싶음

흐름:
1. 히스토리 검색
```bash
history | fzf
```
2. 선택한 명령 복사/재실행
3. 결과 확인 후 필요 시 tmux 세션 분리
- 분리: `Ctrl-a d`
- 복귀: `tmux a -t work`

---

### 시나리오 5) 하루 작업 다시 이어가기

상황:
- 터미널 닫았는데 작업 상태를 그대로 이어가고 싶음

흐름:
1. 세션 목록 확인
```bash
tmux ls
```
2. 기존 세션 복귀
```bash
tmux a -t work
```
3. 패널에서 기존 로그/테스트/코드 상태 그대로 이어서 작업

## 3. 각 툴 사용법

### 3-1. Vim 단축키

모드:
- Normal 모드: 이동/명령
- Insert 모드: 입력
- Visual 모드: 범위 선택

기본(입력/저장/종료)
- `i` 삽입 입력
- `I` 줄 맨 앞 입력
- `a` 커서 뒤 입력
- `A` 줄 맨 끝 입력
- `o` 아래 줄 추가
- `O` 위 줄 추가
- `jj` Insert → Normal
- `:w` 저장
- `:q` 종료
- `:wq` 저장 후 종료
- `:q!` 저장 안 하고 종료

이동
- `h j k l` 좌하상우
- `w` 다음 단어 시작
- `b` 이전 단어 시작
- `e` 단어 끝
- `0` 줄 시작
- `^` 공백 제외 줄 시작
- `$` 줄 끝
- `gg` 파일 시작
- `G` 파일 끝
- `:{숫자}` 해당 줄 이동
- `%` 짝 괄호 이동

검색/이동
- `/text` 아래로 검색
- `?text` 위로 검색
- `n / N` 다음/이전 검색 결과
- `* / #` 현재 단어 다음/이전 검색
- `:%s/old/new/g` 파일 전체 치환
- `:noh` 하이라이트 제거

편집(삭제/변경/복사)
- `x` 문자 1개 삭제
- `dd` 한 줄 삭제
- `dw` 단어 삭제
- `di(` 괄호 안 삭제
- `d$` 커서부터 줄 끝 삭제
- `yy` 한 줄 복사
- `yw` 단어 복사
- `p / P` 아래/위 붙여넣기
- `cc` 한 줄 변경
- `cw` 단어 변경
- `ciw` 현재 단어 변경
- `C` 커서부터 줄 끝 변경

선택(Visual)
- `v` 문자 단위 선택
- `V` 줄 단위 선택
- `Ctrl-v` 블록 선택
- 선택 후 `y` 복사, `d` 삭제, `>` 들여쓰기, `<` 내어쓰기

실행취소/반복
- `u` 실행 취소
- `Ctrl-r` 다시 실행
- `.` 직전 작업 반복

창/버퍼
- `:split` 가로 분할
- `:vsplit` 세로 분할
- `Ctrl-w h/j/k/l` 분할 창 이동
- `:e 파일명` 파일 열기
- `:bn` 다음 버퍼
- `:bp` 이전 버퍼
- `:bd` 현재 버퍼 닫기

자주 쓰는 조합 예시
- 단어 빠른 수정: `ciw` → 입력 → `jj`
- 괄호 안 교체: `di(` → 입력
- 같은 수정 반복: 한 번 수정 후 `.` 연타
- 특정 단어 일괄 치환: `:%s/old/new/g`

### 3-2. tmux 단축키

(prefix는 `Ctrl-a` 기준)
- `Ctrl-a %` : 세로 분할
- `Ctrl-a "` : 가로 분할
- `Ctrl-a + 방향키` : 패널 이동
- `Ctrl-a d` : 세션 분리
- `tmux a -t work` : 세션 복귀
- `Ctrl-a r` : tmux 설정 리로드

### 3-3. ripgrep (rg)

```bash
rg "OrderService"
rg "timeout" -g "*.kt"
rg "TODO" -g "!build/**"
```

### 3-4. fd

```bash
fd service
fd -e kt User
```

### 3-5. fzf

```bash
fd . | fzf
git ls-files | fzf
history | fzf
```

---

## 4. 언제 어디서든 같은 세팅 적용 (재현)

정답은 dotfiles 1개다.

### 4-1. 구조

```text
~/.dotfiles
  ├─ vim/.vimrc
  ├─ tmux/.tmux.conf
  ├─ zsh/.zshrc
  └─ scripts/bootstrap.sh
```

### 4-2. bootstrap 예시

```bash
#!/usr/bin/env bash
set -euo pipefail

brew install vim tmux ripgrep fzf fd git
ln -sf "$HOME/.dotfiles/vim/.vimrc" "$HOME/.vimrc"
ln -sf "$HOME/.dotfiles/tmux/.tmux.conf" "$HOME/.tmux.conf"
ln -sf "$HOME/.dotfiles/zsh/.zshrc" "$HOME/.zshrc"
```

### 4-3. 새 맥북에서 복구

```bash
git clone <dotfiles-repo> ~/.dotfiles
bash ~/.dotfiles/scripts/bootstrap.sh
```
