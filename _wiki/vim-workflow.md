---
layout  : wiki
title   : Vim/Neovim 업무환경 표준 세팅
summary : 새 맥북에서 10~15분 내 재현 가능한 최소 Vim 업무환경 + 툴 사용법
date    : 2026-02-26 16:50:00 +0900
updated : 2026-02-26 17:35:00 +0900
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
과한 커스터마이징 없이 **최소 툴**만으로 높은 생산성을 내기 위한 가이드다.

핵심 원칙:

1. 새 툴을 최소화한다.
2. 검색/이동/테스트/로그 루프를 빠르게 만든다.
3. 새 맥북에서도 번호 순서대로 바로 복구 가능해야 한다.

---

## 1) 최소 툴셋 (필수만)

### 필수 (5개)
- `neovim` : 편집기
- `tmux` : 터미널 분할/세션 유지
- `ripgrep (rg)` : 코드 검색
- `fzf` : 파일/히스토리/검색 선택
- `fd` : 파일 탐색(빠름)

### 선택 (1개)
- `lazygit` : Git TUI (CLI git가 불편할 때만)

> 기준: "설치 부담 < 체감 이득"인 것만 남김.

---

## 2) 각 툴 사용법 (실무 기준)

## 2.1 Neovim

### 자주 쓰는 기본 키
- 이동: `hjkl`, 단어 이동 `w`, 뒤로 `b`, 단어 끝 `e`
- 편집: `i`(입력), `A`(행 끝 입력), `o`(아래 줄 추가)
- 삭제/변경: `dw`, `di(`, `ciw`
- 반복: `.` (방금 수정 반복)
- 저장/종료: `:w`, `:q`, `:wq`

### 추천 최소 설정
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

vim.keymap.set('i', 'jj', '<Esc>', { silent = true })
vim.keymap.set('n', '<leader>w', ':w<CR>')
vim.keymap.set('n', '<leader>q', ':q<CR>')
vim.keymap.set('n', '<C-h>', '<C-w>h')
vim.keymap.set('n', '<C-j>', '<C-w>j')
vim.keymap.set('n', '<C-k>', '<C-w>k')
vim.keymap.set('n', '<C-l>', '<C-w>l')
```

---

## 2.2 tmux

### 왜 쓰나
- SSH 끊겨도 작업 유지
- 코드/테스트/로그를 한 화면에 유지

### 가장 중요한 명령
(아래는 prefix를 `Ctrl-a`로 바꿨다는 가정)
- 새 세션: `tmux new -s work`
- 패널 분할: `Ctrl-a %`(세로), `Ctrl-a "`(가로)
- 패널 이동: `Ctrl-a` 후 방향키
- 분리(detach): `Ctrl-a d`
- 재접속: `tmux a -t work`

### 최소 설정
`~/.tmux.conf`

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

## 2.3 ripgrep (rg)

### 핵심 사용
- 문자열 검색: `rg "OrderService"`
- 확장자 제한: `rg "timeout" -g "*.kt"`
- 폴더 제외: `rg "TODO" -g "!build/**"`

### 팁
- 프로젝트 루트에서 검색하기
- 결과를 보고 바로 nvim으로 열기: `nvim +{line} {file}`

---

## 2.4 fzf

### 핵심 사용
- 파일 선택 열기:
  - `fd . | fzf`
- git tracked 파일:
  - `git ls-files | fzf`
- 히스토리 검색:
  - `history | fzf`

### 팁
- "찾고 싶은 문자열 일부"만 입력해도 빠르게 좁혀짐

---

## 2.5 fd

### 핵심 사용
- 파일 찾기: `fd service`
- 확장자 필터: `fd -e kt User`
- 특정 폴더 제외: `fd controller src`

---

## 2.6 lazygit (선택)

### 핵심 사용
- 실행: `lazygit`
- 스테이징/커밋/푸시를 TUI로 간단 처리
- 충돌/히스토리 확인이 CLI보다 빠름

---

## 3) 새 맥북 세팅 가이드 (번호 순서대로)

아래 순서 그대로 하면 된다.

1. Xcode Command Line Tools 설치
```bash
xcode-select --install
```

2. Homebrew 설치
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

3. 필수 툴 설치
```bash
brew install neovim tmux ripgrep fzf fd
$(brew --prefix)/opt/fzf/install
```

4. (선택) lazygit 설치
```bash
brew install lazygit
```

5. 설정 파일 생성
```bash
mkdir -p ~/.config/nvim
touch ~/.config/nvim/init.lua
touch ~/.tmux.conf
```

6. 이 문서의 예시 설정을 `init.lua`, `.tmux.conf`에 붙여넣기

7. 동작 확인
```bash
nvim --version
tmux -V
rg --version
fd --version
fzf --version
```

8. tmux 업무 레이아웃 시작
```bash
tmux new -s work
```
- 좌: `nvim .`
- 우상: `./gradlew test --continuous`
- 우하: `tail -f app.log`

9. (권장) dotfiles로 백업
- `~/.config/nvim/init.lua`
- `~/.tmux.conf`
- 셸 설정(`.zshrc`)

10. 첫 주 적응 규칙
- 마우스 사용 금지
- 불편 3회 반복될 때만 설정 추가

---

## 4) Kotlin/Spring 실무 동선 표준

### 검색
- `rg "keyword" -g "*.kt"`
- `fd -e kt Service`

### 테스트
- 전체: `./gradlew test`
- 클래스: `./gradlew test --tests "*UserServiceTest"`
- 메서드: `./gradlew test --tests "*UserServiceTest.shouldCreateUser"`

### 품질
- `./gradlew ktlintCheck detekt`

---

## 5) 어디서든 빠르게 재현 (dotfiles 최소형)

저장소 예시:

```text
~/.dotfiles
  ├─ nvim/.config/nvim/init.lua
  ├─ tmux/.tmux.conf
  ├─ zsh/.zshrc
  └─ scripts/bootstrap.sh
```

`bootstrap.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

brew install neovim tmux ripgrep fzf fd
mkdir -p "$HOME/.config/nvim"
ln -sf "$HOME/.dotfiles/nvim/.config/nvim/init.lua" "$HOME/.config/nvim/init.lua"
ln -sf "$HOME/.dotfiles/tmux/.tmux.conf" "$HOME/.tmux.conf"
ln -sf "$HOME/.dotfiles/zsh/.zshrc" "$HOME/.zshrc"
```

> 토큰/키는 dotfiles에 커밋하지 않는다.

---

## 6) 성과 측정 (효율 체감용)

- 파일 찾기 시간: 30초 → 8초
- 테스트 재실행 시작: 45초 → 15초
- 컨텍스트 스위칭(에디터↔터미널): 일 20회 → 8회

2주 내 위 수치가 개선되면 세팅이 맞게 된 것이다.

---

## 7) 레퍼런스

- Neovim 공식 문서
- kickstart.nvim
- tmux wiki
- fzf 관련 문서
- vim-sensible

이 문서는 위 레퍼런스를 **최소 툴 + 최대 체감 효율** 관점으로 재정리한 버전이다.
