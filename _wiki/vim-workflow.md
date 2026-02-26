---
layout  : wiki
title   : Vim/Neovim 업무환경 표준 세팅
summary : 어디서든 빠르게 복구 가능한 Vim/Neovim + tmux + fzf/rg 업무환경 가이드
date    : 2026-02-26 16:50:00 +0900
updated : 2026-02-26 16:50:00 +0900
tags    : vim neovim tmux productivity
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# Vim/Neovim 업무환경 표준 세팅

이 문서는 **Kotlin/Java/Spring + SRE 업무** 기준으로,
Vim/Neovim 환경을 빠르게 구축하고 다른 컴퓨터에서도 재현 가능하게 만드는 실전 가이드다.

핵심 원칙은 3가지다.

1. 과한 커스터마이징 금지
2. 검색/이동/테스트/로그 루프 최적화
3. dotfiles + bootstrap으로 환경 재현

---

## 1. 최종 아키텍처 (권장)

- 편집기: `neovim`
- 터미널 멀티플렉서: `tmux`
- 검색/파일 탐색: `ripgrep(rg)`, `fd`, `fzf`
- Git TUI: `lazygit`
- 언어도구: `jdtls`, `kotlin-language-server`, `ktlint`, `google-java-format`

이 조합이면 IDE 의존도를 낮추면서도 실무 속도를 유지할 수 있다.

---

## 2. 10분 설치 (macOS 기준)

```bash
brew install neovim tmux fzf ripgrep fd lazygit
$(brew --prefix)/opt/fzf/install
```

확인:

```bash
nvim --version
tmux -V
rg --version
fd --version
fzf --version
```

---

## 3. Neovim 최소 실전 설정

### 3.1 시작점

- kickstart.nvim 스타일(작고 문서화 잘됨)을 권장
- 처음부터 대형 배포판에 의존하지 말고, 필요한 기능만 추가

### 3.2 최소 `init.lua` 예시

`~/.config/nvim/init.lua`

```lua
vim.g.mapleader = ' '
vim.o.number = true
vim.o.relativenumber = true
vim.o.mouse = ''
vim.o.clipboard = 'unnamedplus'
vim.o.ignorecase = true
vim.o.smartcase = true
vim.o.updatetime = 200
vim.o.termguicolors = true

-- jj로 insert 탈출
vim.keymap.set('i', 'jj', '<Esc>', { silent = true })

-- 창 이동
vim.keymap.set('n', '<C-h>', '<C-w>h')
vim.keymap.set('n', '<C-j>', '<C-w>j')
vim.keymap.set('n', '<C-k>', '<C-w>k')
vim.keymap.set('n', '<C-l>', '<C-w>l')

-- 빠른 저장/종료
vim.keymap.set('n', '<leader>w', ':w<CR>')
vim.keymap.set('n', '<leader>q', ':q<CR>')
```

> 참고: LSP/완성/탐색 플러그인은 kickstart.nvim 기본 구성을 가져와 단계적으로 추가한다.

---

## 4. tmux 업무 레이아웃 (고정)

권장 레이아웃: **좌(코드) / 우상(테스트) / 우하(로그)**

```bash
tmux new -s work
# pane 분할
# 코드: nvim .
# 테스트: ./gradlew test --continuous
# 로그: tail -f app.log
```

`~/.tmux.conf` 최소 예시:

```tmux
set -g mouse on
set -g history-limit 100000
set -g base-index 1
setw -g pane-base-index 1
unbind C-b
set -g prefix C-a
bind C-a send-prefix

bind r source-file ~/.tmux.conf \; display-message "tmux reloaded"
```

---

## 5. Kotlin/Spring 실무 동선 표준

### 5.1 검색/탐색

- 문자열 검색: `rg "keyword"`
- 파일 검색: `fd service`
- Neovim 내부 탐색: fzf 계열 사용

### 5.2 테스트 실행

- 전체: `./gradlew test`
- 특정 클래스: `./gradlew test --tests "*UserServiceTest"`
- 특정 메서드: `./gradlew test --tests "*UserServiceTest.shouldCreateUser"`

### 5.3 품질 검사

- `./gradlew ktlintCheck detekt`
- 포맷 자동화는 pre-commit 훅으로 연결 권장

---

## 6. Vim 학습 로드맵 (2주)

### 1주차

- 목표: 편집 + 검색 + 이동만 Vim으로 처리
- 필수 습관: `hjkl`, `w/b/e`, `ciw`, `di(`, `.` 반복

### 2주차

- 목표: Git/테스트/로그까지 tmux+vim에서 처리
- 필수 습관: quickfix, 매크로(`q`), split 이동

원칙:
- “불편 1회”는 참기
- “같은 불편 3회”면 설정 추가

---

## 7. 어디서든 빠르게 재현: dotfiles

### 7.1 저장소 구조 예시

```text
~/.dotfiles
  ├─ nvim/.config/nvim/init.lua
  ├─ tmux/.tmux.conf
  ├─ zsh/.zshrc
  ├─ Brewfile
  └─ scripts/bootstrap.sh
```

### 7.2 bootstrap 예시

`scripts/bootstrap.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

brew bundle --file="$HOME/.dotfiles/Brewfile"
mkdir -p "$HOME/.config/nvim"
ln -sf "$HOME/.dotfiles/nvim/.config/nvim/init.lua" "$HOME/.config/nvim/init.lua"
ln -sf "$HOME/.dotfiles/tmux/.tmux.conf" "$HOME/.tmux.conf"
ln -sf "$HOME/.dotfiles/zsh/.zshrc" "$HOME/.zshrc"

echo "bootstrap done"
```

### 7.3 민감정보 분리

- 토큰/키는 dotfiles에 커밋 금지
- `~/.env.local`처럼 로컬 전용 파일 사용

---

## 8. 실무 KPI (세팅 효과 측정)

- 파일 찾기 시간: 평균 30초 → 8초
- 테스트 재실행까지 시간: 45초 → 15초
- 컨텍스트 스위칭 횟수(IDE↔터미널): 일 20회 → 8회
- 장애 대응 시 로그 접근 시간: 20초 → 5초

수치가 줄어들면 세팅이 잘 된 것이다.

---

## 9. 자주 발생하는 실패 패턴

1. 플러그인부터 과도하게 설치
2. 키맵을 한 번에 너무 많이 바꿈
3. tmux 없이 단일 터미널로만 작업
4. dotfiles 자동화 없이 수작업 재설정

해결: **작게 시작 + 측정 + 점진적 추가**.

---

## 10. 추천 레퍼런스

- Neovim 공식 문서
- kickstart.nvim
- tmux wiki
- fzf.vim / fzf-lua
- vim-sensible (기본값 참고)

이 문서는 위 레퍼런스의 공통 실전 포인트를 Kotlin/Spring 업무에 맞게 재구성했다.
