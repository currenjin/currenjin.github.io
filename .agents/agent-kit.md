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
  | python3 - --revision "$REV" --path skills/diagram/SKILL.md
```

원격 로더는 저장소 밖의 비공개 새 임시 디렉터리에 `KIT_ROOT`를 만들고, 그 경로와 SHA를 출력합니다. 요청한 `skills/diagram/SKILL.md`와 `rules/writing.md`, `rules/tidy-first.md`의 전체 출력도 실제로 읽습니다. 요약·URL·앞부분만 읽고 절차를 적용했다고 보고하지 않습니다.

- 원격 의존성도 같은 SHA로 읽습니다. 참조된 상대 경로와 보조 스크립트는 로더가 출력한 `KIT_ROOT` 안에서 해석하며 소비 저장소나 기존 홈 설치본에서 찾지 않습니다.
- 추가 문서가 필요하면 동일한 `$REV`에 고정된 위 로더에 `--path`로 요청합니다. 중앙 소비 계약의 경로는 `docs/CONSUMERS.md`이며, 새 `main` 조회와 섞지 않습니다.
- 이 임시 디렉터리는 설치본이 아닙니다. 홈이나 소비 저장소에 설치하지 않으며, 작업에 필요한 참조를 끝낸 뒤 해당 작업의 임시 디렉터리만 정리합니다.
- 인증·접근·다운로드·로더 실행이 실패하면 도식 작업을 중단하고 실패를 보고합니다. 오래된 로컬 스킬이나 캐시로 대체하지 않으며, 기존 본문과 도식은 유지합니다.

원격 문서를 읽은 뒤 [로컬 diagram 입구](skills/diagram/SKILL.md)의 Jekyll·Issue 첨부·본문 보존·출판 경계를 함께 적용합니다. `.agents`와 이 문서는 `_config.yml`의 제외 대상이며 공개 `_site`에 포함하지 않습니다.
