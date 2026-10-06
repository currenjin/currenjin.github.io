# Kafka Wiki 출처·검증 기록

교과서의 유일한 본문은 `_wiki/kafka.md`다. 이 폴더는 별도 원고가 아니라 출처 범위와 검증 한계를 기록한다.

## 근거 범위

- Kafka: Apache Kafka 4.3 공식 문서, 설정·Javadoc·운영 설명. `source-inventory.json`은 수집 결과와 최종 본문에서의 URL 인용 여부다. **수집 또는 인용은 페이지 전체 정독을 뜻하지 않는다.**
- Confluent JDBC Source/Sink: 공식 `current` 문서. 고정 버전이 아니므로 설치한 플러그인 릴리스의 지원 조건을 다시 확인한다.
- Debezium PostgreSQL·Outbox Event Router: `v3.3.0.Final` release tag의 프로젝트 공식 AsciiDoc 원문. 웹 출판면 접근 제약으로 release 원문을 사용했다.
- 사례·수치·도식: 교육용 가상 사례. 공식 예제 또는 실측 결과로 취급하지 않는다.

## 수행한 검토

- 기존 원고의 Kafka 주장 83항목과 공식 페이지/앵커 98개를 캐시된 공식 HTML에 대조한 기계 검사는 모두 통과했다. **옛 원고 대상의 제한된 정규식 검사이며 최종 본문 전체의 기술 검증 결과가 아니다.**
- 최종 본문에 대해 독립 검토: 중복 제거의 이벤트 ID, LSO 기준 lag, HW 정의, 시간 보존의 한계, 9~15장의 운영·KRaft·보안·Connect·CDC·Outbox 경계를 공식 원문과 대조했다.
- 수정: `acks=all`의 현재 ISR 전체 확인과 최소 ISR 조건 구분, 읽기 위치/커밋/업무 완료 구분, lag의 LSO–HW 차이, 정상 standby controller의 0, static/dynamic KRaft 설정 구분, 실제 로그 범위에 의한 재처리 판단.
- 읽기 동선 검토: 도입 질문과 해설의 참조 관계 복원, 장 이동 후 용어·문서 찾아보기 링크 수정, Connect를 13~15장 정식 본문으로 포함.

## 재현 가능한 검사

```sh
docker run --rm -v "$PWD:/srv/jekyll" jekyll/jekyll:4 jekyll build
python3 tests/verify_archive.py _site
python3 tests/verify_kafka_textbook.py _site
```

마지막 검사는 렌더링된 장·출처 내부 링크, 중복 ID, 그림 파일 존재·SVG 문법, 해설 펼침 및 장 수를 확인한다. 기술 내용의 무오류 또는 실운영 동작을 보장하지는 않는다. 커넥터/DB를 실행한 통합 테스트는 수행하지 않았다. 공식 문서 전체 정독·모든 설정/프로토콜 완전 해설을 주장하지 않는다.
