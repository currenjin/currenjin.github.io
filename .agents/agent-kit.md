# 개인 아카이브의 공통 스킬 연결

이 저장소의 diagram 입구는 private 저장소 `currenjin/agent-kit`의 공통 절차를 읽습니다. 이 문서는 유지보수자용 설정 안내이며, private 스킬 본문이나 설치본을 이 공개 저장소에 복사하지 않습니다. 사이트를 읽거나 빌드하는 데 agent-kit 인증은 필요하지 않습니다. 해당 도식 작성 절차를 사용할 때만 필요합니다.

## 다른 컴퓨터에서 도식 작성

1. 이 저장소의 최신 변경을 pull합니다.
2. `~/.agents/skills/diagram/SKILL.md`가 실제로 읽히는지 확인합니다. 없으면 [중앙 소비 설정 가이드](https://github.com/currenjin/agent-kit/blob/bf49068fb3051c0f39d03ee1cb4b36891664ab04/docs/CONSUMERS.md)의 clone 없는 설치·연결 절차를 따릅니다. GitHub 인증과 private 저장소 읽기 권한이 필요합니다.
3. 도식 작업은 [이 저장소의 diagram 입구](skills/diagram/SKILL.md)를 읽습니다. 공통 판단·구성·검토는 중앙 스킬, Jekyll·Issue 첨부·본문 원문·출판 경계는 이 저장소 지침을 따릅니다.
4. 파일이 없거나 권한이 없으면 설정이 필요하다고 보고합니다. URL만 보고 private 본문을 읽었다고 가정하거나 오래된 본문을 재생성하지 않습니다.

공통 스킬·설정은 소비 기기의 홈에 설치합니다. `.agents`와 이 문서는 Jekyll `_config.yml`의 제외 대상이며 공개 `_site`에 포함하지 않습니다. 저장소를 pull했다고 전역 설정이나 다른 컴퓨터가 자동 갱신되는 것은 아닙니다.
