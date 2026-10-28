# 개인 아카이브의 공통 스킬 연결

도식 작성 시 private 저장소 `currenjin/agent-kit`의 현재 원격 정본을 읽습니다. 이 공개 저장소에는 호출 방법과 로컬 출판 계약만 두며 private 스킬·규칙 본문은 복사하지 않습니다. 사이트 열람·빌드에는 agent-kit 접근 권한이 필요하지 않습니다.

## 도식 작업 전 원격 읽기

기존에 인증된 `gh`와 private 저장소 읽기 권한, `python3`, Bash를 사용합니다. 기기별 스킬 설치나 전역 설정 변경은 하지 않습니다. 다음 코드를 Bash로 실행하며, `main`의 SHA는 작업 시작 시 한 번만 조회합니다.

```bash
set -euo pipefail
REV="$(gh api repos/currenjin/agent-kit/commits/main --jq .sha)"
if [[ ! "$REV" =~ ^[0-9a-f]{40}$ ]]; then
  printf '%s\n' 'agent-kit: invalid revision; stop' >&2
  exit 1
fi
gh api "repos/currenjin/agent-kit/contents/scripts/read_remote.py?ref=$REV" \
  -H 'Accept: application/vnd.github.raw+json' \
  | python3 - --revision "$REV" --skill diagram
```

원격 로더는 저장소 밖의 비공개 새 임시 디렉터리에 `KIT_ROOT`를 만들고, 그 경로와 SHA를 출력합니다. 요청한 `skills/diagram/SKILL.md`와 `rules/writing.md`, `rules/tidy-first.md`의 전체 출력도 실제로 읽습니다. 요약·URL·앞부분만 읽고 절차를 적용했다고 보고하지 않습니다.

- 원격 의존성도 같은 SHA로 읽습니다. 참조된 상대 경로와 보조 스크립트는 로더가 출력한 `KIT_ROOT` 안에서 해석하며 소비 저장소나 기존 홈 설치본에서 찾지 않습니다.
- 추가 스킬은 `--skill NAME`, 규칙은 `--rule NAME`으로 동일한 `$REV`에 고정된 위 로더에 요청합니다. 정확한 하위 가이드·문서 경로에만 `--path`를 사용합니다. 중앙 소비 계약의 경로는 `docs/CONSUMERS.md`이며, 새 `main` 조회와 섞지 않습니다.
- 이 임시 디렉터리는 설치본이 아닙니다. 홈이나 소비 저장소에 설치하지 않으며, 작업에 필요한 참조를 끝낸 뒤 해당 작업의 임시 디렉터리만 정리합니다.
- 인증·접근·다운로드·로더 실행이 실패하면 도식 작업을 중단하고 실패를 보고합니다. 오래된 로컬 스킬이나 캐시로 대체하지 않으며, 기존 본문과 도식은 유지합니다.

## 종류를 구분한 선택과 이름 확인

`writing`과 `tidy-first`는 스킬이 아니라 규칙입니다. `--rule writing`은 `rules/writing.md`, `--rule tidy-first`는 `rules/tidy-first.md`를 선택합니다. 보고서는 `--skill report`로 `skills/report/SKILL.md`를 선택합니다. 규칙 이름으로 `skills/<rule>/SKILL.md`를 추측하지 않습니다.

이름이나 종류가 불확실하면 같은 SHA의 `--list`로 규칙·스킬 목록을 확인하고, 목록에서 검증된 이름만 해당 `--rule` 또는 `--skill`로 선택합니다. 다음 명령은 이미 확인한 정확한 `$REV`를 그대로 사용합니다. 새 `main` 조회로 revision을 바꾸지 않습니다.

```text
gh api "repos/currenjin/agent-kit/contents/scripts/read_remote.py?ref=$REV" -H 'Accept: application/vnd.github.raw+json' | python3 - --revision "$REV" --list
```

`--path`는 기존 정확한 경로 호출과 호환되지만 일반 스킬·규칙 선택의 기본값은 아닙니다. 선택한 presentation child guide는 `--skill presentation --path skills/presentation/slidev/GUIDE.md`처럼 부모 스킬과 함께 읽습니다. 다른 엔진도 확인된 정확한 child 경로를 사용합니다. 성공한 `KIT_ROOT`를 재사용할 때도 검증된 종류·이름의 대응 경로만 읽습니다.

`RESOURCE_NOT_FOUND`는 선택한 이름·경로가 해당 SHA에 없다는 오류이며 후보는 제안일 뿐 자동 대체나 성공을 뜻하지 않습니다. 같은 SHA에서 `--list`로 확인한 뒤 선택을 명시하고 다시 읽습니다. 다운로드·아카이브 실패는 이 오류와 다르며 이름을 바꾸어 재시도할 근거가 아닙니다. 인증·네트워크·다운로드·아카이브·본문 읽기 실패는 원인을 보고하고 중단하며 홈 설치본·내장 사본·다른 이름으로 몰래 대체하지 않습니다.

원격 문서를 읽은 뒤 [로컬 diagram 입구](skills/diagram/SKILL.md)의 Jekyll·Issue 첨부·본문 보존·출판 경계를 함께 적용합니다. `.agents`와 이 문서는 `_config.yml`의 제외 대상이며 공개 `_site`에 포함하지 않습니다.
