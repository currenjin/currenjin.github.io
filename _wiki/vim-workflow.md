---
layout  : wiki
title   : Vim 업무환경 표준 세팅
date    : 2026-02-26 16:50:00 +0900
updated : 2026-02-26 23:42:00 +0900
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

## 2. 사용법

### 2-1. 업무 시작

```bash
tmux new -s work
```

패널 구성:
- 좌: 코드 `vim .`
- 우상: 테스트 `./gradlew test --continuous`
- 우하: 로그 `tail -f app.log`

패널 분할 방법:
- 세로 분할: `Ctrl-a %`
- 가로 분할: `Ctrl-a "`
- 패널 이동: `Ctrl-a + 방향키`

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

## 3. 각 툴 사용법

### 3-1. Vim 단축키 (필수)

모드:
- Normal 모드: 이동/명령
- Insert 모드: 입력

자주 쓰는 키:
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
