---
layout  : wiki
title   : Git
summary :
date    : 2025-01-17 20:00:00 +0900
updated : 2025-01-17 20:00:00 +0900
tags     : git
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
```
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
- Test : 테스트 코드, 리펙토링 테스트 코드 추가, Production Code(실제로 사용하는 코드) 변경 없음
- Chore : 빌드 업무 수정, 패키지 매니저 수정, 패키지 관리자 구성 등 업데이트, Production Code 변경 없음
- Rename : 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
- Remove : 파일을 삭제하는 작업만 수행한 경우


### Error

```shell
fatal: unable to get credential storage lock in 1000 ms: File exists
```
