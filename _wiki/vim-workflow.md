---
layout  : wiki
title   : Vim/Neovim 업무환경 표준 세팅
date    : 2026-02-26 16:50:00 +0900
updated : 2026-02-26 19:20:00 +0900
tags    : vim neovim tmux productivity
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# Vim/Neovim 업무환경 표준 세팅

이 문서는 “처음 세팅한 뒤 바로 업무에 쓰는 것”에 집중한다.
과한 플러그인 없이 **최소 툴**만 사용한다.

최소 툴:
- neovim
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
brew install neovim tmux ripgrep fzf fd git
$(brew --prefix)/opt/fzf/install
```

### 1-2. 설정 파일 만들기

```bash
mkdir -p ~/.config/nvim
cat > ~/.config/nvim/init.lua <<'LUA'
vim.g.mapleader = ' '
vim.o.number = true
vim.o.relativenumber = true
vim.o.mouse = ''
vim.o.clipboard = 'unnamedplus'
vim.o.ignorecase = true
vim.o.smartcase = true
vim.o.updatetime = 200
vim.o.termguicolors = true

-- insert 모드 탈출
vim.keymap.set('i', 'jj', '<Esc>', { silent = true })

-- 저장/종료
vim.keymap.set('n', '<leader>w', ':w<CR>')
vim.keymap.set('n', '<leader>q', ':q<CR>')

-- 창 이동
vim.keymap.set('n', '<C-h>', '<C-w>h')
vim.keymap.set('n', '<C-j>', '<C-w>j')
vim.keymap.set('n', '<C-k>', '<C-w>k')
vim.keymap.set('n', '<C-l>', '<C-w>l')
LUA

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
nvim --version
tmux -V
rg --version
fd --version
fzf --version
```

---

## 2. 초기 실행 확인

### 2-1. 업무 시작

```bash
tmux new -s work
```

패널 구성:
- 좌: 코드 `nvim .`
- 우상: 테스트 `./gradlew test --continuous`
- 우하: 로그 `tail -f app.log`

### 2-2. 업무 중
- Jira 티켓 확인
- 코드 수정
- 테스트 확인
- 로그 확인

### 2-3. 업무 종료
- 커밋/푸시
- tmux 분리: `Ctrl-a d`
- 다음에 복귀: `tmux a -t work`

---

## 3. 사용법

### 3-1. 업무 순서 그대로
- 기본 흐름은 위 `2. 초기 실행 확인`(시작→작업→종료) 그대로 사용.
- 아래부터는 각 툴을 그 흐름 안에서 어떻게 쓰는지 정리.

### 3-2. Neovim 단축키 (필수만)

### 모드
- Normal 모드: 이동/명령
- Insert 모드: 입력

### 가장 많이 쓰는 키
- `i` : 입력 시작
- `A` : 줄 끝에서 입력
- `o` : 아래 줄 추가 후 입력
- `jj` : Insert → Normal
- `h j k l` : 이동
- `w / b` : 단어 앞으로/뒤로
- `/텍스트` : 검색
- `n / N` : 다음/이전 검색 결과
- `dd` : 줄 삭제
- `yy` : 줄 복사
- `p` : 붙여넣기
- `ciw` : 단어 바꾸기
- `di(` : 괄호 안 삭제
- `.` : 방금 편집 반복
- `u` : 되돌리기
- `Ctrl-r` : 다시 실행
- `:w` : 저장
- `:q` : 종료
- `:wq` : 저장 후 종료

> 핵심: `ciw`, `.`, `/검색` 3개만 익혀도 체감이 큼.

---

### 3-3. tmux 단축키

(prefix는 `Ctrl-a` 기준)
- `Ctrl-a %` : 세로 분할
- `Ctrl-a "` : 가로 분할
- `Ctrl-a + 방향키` : 패널 이동
- `Ctrl-a d` : 세션 분리
- `tmux a -t work` : 세션 복귀
- `Ctrl-a r` : tmux 설정 리로드

---

### 3-4. ripgrep (rg)

- 텍스트 검색:
```bash
rg "OrderService"
```

- Kotlin 파일만 검색:
```bash
rg "timeout" -g "*.kt"
```

- build 제외 검색:
```bash
rg "TODO" -g "!build/**"
```

---

### 3-5. fd

- 파일명 검색:
```bash
fd service
```

- 확장자 제한:
```bash
fd -e kt User
```

---

### 3-6. fzf

- 파일 선택기:
```bash
fd . | fzf
```

- git 파일 선택:
```bash
git ls-files | fzf
```

- 히스토리 검색:
```bash
history | fzf
```

---

## 4. 언제 어디서든 같은 세팅 적용 (재현)

정답은 dotfiles 1개다.

### 4-1. 구조

```text
~/.dotfiles
  ├─ nvim/.config/nvim/init.lua
  ├─ tmux/.tmux.conf
  ├─ zsh/.zshrc
  └─ scripts/bootstrap.sh
```

### 4-2. bootstrap 예시

```bash
#!/usr/bin/env bash
set -euo pipefail

brew install neovim tmux ripgrep fzf fd git
mkdir -p "$HOME/.config/nvim"
ln -sf "$HOME/.dotfiles/nvim/.config/nvim/init.lua" "$HOME/.config/nvim/init.lua"
ln -sf "$HOME/.dotfiles/tmux/.tmux.conf" "$HOME/.tmux.conf"
ln -sf "$HOME/.dotfiles/zsh/.zshrc" "$HOME/.zshrc"
```

### 4-3. 새 맥북에서 복구

```bash
git clone <dotfiles-repo> ~/.dotfiles
bash ~/.dotfiles/scripts/bootstrap.sh
```

---

## 5. 1주 적응 체크리스트

- Day 1~2: 이동/검색만 Vim으로
- Day 3~4: 편집(`ciw`, `di(`, `.`) 적용
- Day 5~7: tmux + 테스트/로그까지 고정

규칙:
- 불편 1~2회는 그대로
- 같은 불편 3회 반복되면 그때 설정 추가

---

## 6. 목표 지표

- 파일 찾기: 30초 → 8초
- 테스트 재실행 시작: 45초 → 15초
- 에디터↔터미널 전환 횟수: 20회/일 → 8회/일

2주 내 이 수치가 내려가면 세팅이 잘 맞는 것이다.
