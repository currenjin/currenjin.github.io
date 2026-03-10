---
layout  : wiki
title   : Vim 업무환경 표준 세팅
date    : 2026-02-26 16:50:00 +0900
updated : 2026-03-10 21:30:00 +0900
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

# copy-mode (vi)
setw -g mode-keys vi

# Space 키 충돌 방지: v로 선택 시작, y로 복사
unbind-key -T copy-mode-vi Space
bind-key -T copy-mode-vi v send -X begin-selection
bind-key -T copy-mode-vi y send -X copy-pipe-and-cancel "pbcopy"

# macOS 시스템 클립보드 연동
set -s set-clipboard on
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

## 2. 각 툴 사용법

### 2-1. Vim 단축키

#### 모드
- Normal 모드: 이동/명령
- Insert 모드: 입력
- Visual 모드: 범위 선택

#### 기본 (입력/저장/종료)
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

#### 디렉토리 탐색 (netrw)
- `vim .` 현재 디렉토리 탐색 시작
- `Enter` 파일/디렉토리 열기
- `-` 상위 디렉토리로 이동
- `%` 파일 생성
- `d` 디렉토리 생성
- `D` 파일/디렉토리 삭제
- `R` 이름 변경
- `:Ex` 디렉토리 보기로 돌아가기
- `:Rex` 직전에 보던 디렉토리 창 복귀
- `Ctrl-^` 이전 버퍼(직전 파일/창) 전환

#### 파일 복사/이동 (netrw)
- `mf` 현재 파일 mark (복수 파일 가능)
- `mt` 대상 디렉토리를 target으로 지정
- `mc` mark한 파일 복사
- `mm` mark한 파일 이동
- `mu` mark 해제

#### 이동
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

#### 검색/이동
- `/text` 아래로 검색
- `?text` 위로 검색
- `n / N` 다음/이전 검색 결과
- `* / #` 현재 단어 다음/이전 검색
- `:%s/old/new/g` 파일 전체 치환
- `:noh` 하이라이트 제거

#### 편집 (삭제/변경/복사)
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

#### 선택 (Visual)
- `v` 문자 단위 선택
- `V` 줄 단위 선택
- `Ctrl-v` 블록 선택
- 선택 후 `y` 복사, `d` 삭제, `>` 들여쓰기, `<` 내어쓰기

#### 실행취소/반복
- `u` 실행 취소
- `Ctrl-r` 다시 실행
- `.` 직전 작업 반복

#### 창/버퍼
- `:split` 가로 분할
- `:vsplit` 세로 분할
- `Ctrl-w h/j/k/l` 분할 창 이동
- `:e 파일명` 파일 열기
- `:bn` 다음 버퍼
- `:bp` 이전 버퍼
- `:bd` 현재 버퍼 닫기

#### 자주 쓰는 조합 예시
- 단어 빠른 수정: `ciw` → 입력 → `jj`
- 괄호 안 교체: `di(` → 입력
- 같은 수정 반복: 한 번 수정 후 `.` 연타
- 특정 단어 일괄 치환: `:%s/old/new/g`

### 2-2. tmux 단축키

> prefix는 이 문서 기준 `Ctrl-a` (`set -g prefix C-a`)다.

#### 세션(Session)
- `tmux new -s work` : 새 세션 생성
- `tmux ls` : 세션 목록
- `tmux a -t work` : 세션 접속(attach)
- `Ctrl-a d` : 세션 분리(detach)
- `Ctrl-a $` : 현재 세션 이름 변경
- `Ctrl-a s` : 세션 목록에서 선택/전환
- `tmux kill-session -t work` : 특정 세션 종료
- `tmux kill-server` : 모든 세션 종료

#### 윈도우(Window)
- `Ctrl-a c` : 새 윈도우 생성
- `Ctrl-a ,` : 현재 윈도우 이름 변경
- `Ctrl-a n` : 다음 윈도우
- `Ctrl-a p` : 이전 윈도우
- `Ctrl-a 0~9` : 해당 번호 윈도우로 이동
- `Ctrl-a w` : 윈도우 목록 표시 후 선택
- `Ctrl-a &` : 현재 윈도우 닫기
- `Ctrl-a l` : 직전 윈도우로 이동
- `Ctrl-a f` : 윈도우 이름 검색
- `Ctrl-a .` : 현재 윈도우 번호 재배치(move)

#### 패널(Pane)
- `Ctrl-a %` : 세로 분할
- `Ctrl-a "` : 가로 분할
- `Ctrl-a o` : 다음 패널로 이동
- `Ctrl-a ;` : 직전 활성 패널로 이동
- `Ctrl-a + 방향키` : 방향 기준 패널 이동
- `Ctrl-a q` : 패널 번호 표시
- `Ctrl-a x` : 현재 패널 닫기
- `Ctrl-a z` : 현재 패널 확대/복원(zoom)
- `Ctrl-a {` : 현재 패널을 왼쪽으로 이동
- `Ctrl-a }` : 현재 패널을 오른쪽으로 이동
- `Ctrl-a !` : 현재 패널을 새 윈도우로 분리
- `Ctrl-a Space` : 레이아웃 순환
- `Ctrl-a Alt-1` : even-horizontal 레이아웃
- `Ctrl-a Alt-2` : even-vertical 레이아웃
- `Ctrl-a Alt-3` : main-horizontal 레이아웃
- `Ctrl-a Alt-4` : main-vertical 레이아웃
- `Ctrl-a Alt-5` : tiled 레이아웃
- `Ctrl-a Ctrl-방향키` : 패널 크기 조절(작게/크게)

#### 복사 모드/스크롤/붙여넣기
- `Ctrl-a [` : copy-mode 진입(스크롤)
- `q` : copy-mode 종료
- `v` : 선택 시작 (copy-mode-vi)
- `y` : 복사 + copy-mode 종료 (`pbcopy`로 macOS 클립보드까지 복사)
- `Ctrl-a ]` : tmux 버퍼 붙여넣기
- `Ctrl-a #` : paste buffer 목록
- `Ctrl-a =` : paste buffer 선택기
- `Ctrl-a ~` : 직전 버퍼 내용 표시
- `Ctrl-a PageUp` : copy-mode + 페이지 업

#### 명령/설정/도움
- `Ctrl-a :` : tmux 명령 프롬프트
- `Ctrl-a ?` : 키 바인딩 도움말
- `Ctrl-a t` : 시계 표시
- `Ctrl-a r` : tmux 설정 리로드

#### 자주 쓰는 운영 조합
- 작업 시작: `tmux new -s work` → `Ctrl-a %` / `Ctrl-a "`
- 복귀: `tmux ls` → `tmux a -t <세션명>`
- 레이아웃 망가졌을 때: `Ctrl-a Space`
- 패널 정리: `Ctrl-a x` 또는 `Ctrl-a !`

### 2-3. ripgrep (rg)

```bash
rg "OrderService"
rg "timeout" -g "*.kt"
rg "TODO" -g "!build/**"
```

### 2-4. fd

```bash
fd service
fd -e kt User
```

### 2-5. fzf

```bash
fd . | fzf
git ls-files | fzf
history | fzf
```

## 3. 사용법 (시나리오별)

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

---

### 시나리오 6) 키워드 포함 파일을 fzf로 골라서 바로 열기/cat 하기

상황:
- `TRANSITS`가 들어간 Kotlin 파일을 찾고, 하나 골라 바로 열고 싶음

흐름:
1. 매치된 "파일 목록"만 뽑기
```bash
rg --files-with-matches "TRANSITS" -g "*.kt"
```
2. fzf로 하나 선택해서 `cat`
```bash
cat "$(rg --files-with-matches "TRANSITS" -g "*.kt" | fzf)"
```
3. 같은 방식으로 vim 열기
```bash
vim "$(rg --files-with-matches "TRANSITS" -g "*.kt" | fzf)"
```

참고:
- `rg -n` 결과(`파일:라인:내용`)를 그대로 `cat`에 넣으면 실패한다.
- `cat (rg ... | fzf)`는 zsh에서 서브쉘 문법이 맞지 않아서 `$(...)`를 써야 한다.

---

### 시나리오 7) 매치된 줄을 보고 선택한 뒤 해당 라인으로 점프해서 열기

상황:
- 파일만 여는 게 아니라, `TRANSITS`가 나오는 정확한 줄로 점프하고 싶음

흐름:
1. `파일:라인:내용` 후보를 fzf로 선택
```bash
sel="$(rg -n "TRANSITS" -g "*.kt" | fzf)"
```
2. 파일/라인 분리
```bash
file="$(echo "$sel" | cut -d: -f1)"
line="$(echo "$sel" | cut -d: -f2)"
```
3. vim에서 라인 점프 오픈
```bash
vim "+$line" "$file"
```

원라이너:
```bash
sel="$(rg -n "TRANSITS" -g "*.kt" | fzf)"; vim "+$(echo "$sel" | cut -d: -f2)" "$(echo "$sel" | cut -d: -f1)"
```

---

### 시나리오 8) 자주 쓰는 패턴을 함수/alias로 고정하기

상황:
- 위 명령을 매번 타이핑하기 귀찮음

`~/.zshrc` 예시:
```bash
# 키워드로 파일 골라 vim 열기
rff() {
  local q="$1"
  vim "$(rg --files-with-matches "$q" -g "*.kt" | fzf)"
}

# 키워드 매치 라인 선택 후 해당 줄로 vim 점프
rfl() {
  local q="$1"
  local sel
  sel="$(rg -n "$q" -g "*.kt" | fzf)" || return
  local file line
  file="$(echo "$sel" | cut -d: -f1)"
  line="$(echo "$sel" | cut -d: -f2)"
  vim "+$line" "$file"
}
```

사용:
```bash
rff TRANSITS
rfl TRANSITS
```

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

---

## 5. 실무 속도 올리는 추가 세팅

### 5-1. `.vimrc` 보강 옵션

기본 세팅 위에 아래를 추가하면 체감이 크다.

```vim
" 붙여넣기/복사 품질
set clipboard=unnamed

" 백업/스왑 파일 분리(프로젝트 오염 방지)
set backupdir=~/.vim/tmp//
set directory=~/.vim/tmp//
set undodir=~/.vim/tmp//
set undofile

" 화면/탐색
set scrolloff=5
set wildmenu
set wildmode=longest:full,full
set list
set listchars=tab:»·,trail:·

" 빠른 검색 루프
nnoremap <leader>h :noh<CR>
nnoremap <leader>e :Ex<CR>
```

사전 준비:
```bash
mkdir -p ~/.vim/tmp
```

### 5-2. 자주 쓰는 실전 매핑

```vim
" 현재 파일 기준 같은 폴더에 복제 후 열기
" 사용: :Dup 2026-03-01.md
command! -nargs=1 Dup execute ':!cp % ' . <q-args> | execute ':e ' . <q-args>

" 저장하고 디렉토리 뷰로 복귀
nnoremap <leader>x :w<CR>:Ex<CR>

" 현재 파일 경로 복사
nnoremap <leader>p :let @+ = expand('%:p')<CR>
```

---

## 6. 자주 막히는 구간 트러블슈팅

### 6-1. netrw 복사(`mf`/`mt`/`mc`)가 안 되는 경우

원인 대부분은 Vim 현재 작업 디렉토리(`:pwd`)와 탐색 위치가 어긋난 경우다.

해결 순서:
1. `:pwd` 확인
2. 현재 파일 기준으로 디렉토리 고정
```vim
:cd %:p:h
```
3. 다시 `:Ex` 열고 복사 수행

안 되면 즉시 우회:
```vim
:!cp % <new-file>.md
:e <new-file>.md
```

### 6-2. 한글 입력 후 ESC 지연/깨짐

터미널 입력기 충돌이 원인일 때가 많다.
- Insert 종료를 `jj`로 통일
- iTerm2/Terminal에서 한글 조합 중 ESC 연타 습관 제거

### 6-3. tmux에서 마우스/클립보드 이상

- tmux 설정 리로드: `Ctrl-a r`
- 세션 완전 재시작:
```bash
tmux kill-server
tmux new -s work
```

### 6-4. ripgrep/fd 명령이 없다고 뜰 때

```bash
brew install ripgrep fd
exec $SHELL -l
```

---

## 7. Kotlin/Spring 실무용 즉시 실행 루틴

### 7-1. 3패널 고정 레이아웃

1) 좌측: `vim .`
2) 우상: `./gradlew test --continuous`
3) 우하: `./gradlew bootRun` 또는 `tail -f build/logs/*.log`

핵심 원칙: **코드/테스트/로그를 동시에 본다.**

### 7-2. 함수 수정 표준 사이클

1. 함수 검색: `rg "fun 함수명|함수명\(" -g "*.kt"`
2. 파일 선택: `fd -e kt | fzf`
3. 수정: `ciw`, `di(`, `:%s/old/new/g`
4. 저장: `:w`
5. 테스트/로그 확인
6. 통과 후 커밋

### 7-3. 커밋 분리 규칙 (권장)

- 1커밋: 구조 변경(Tidy)
- 1커밋: 동작 변경(기능/버그 수정)
- 1커밋: 테스트 보강

섞지 않으면 리뷰 속도와 롤백 안전성이 올라간다.
