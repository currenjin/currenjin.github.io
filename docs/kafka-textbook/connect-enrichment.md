# Kafka Connect 개념 보강

## 범위와 완료 기준

기존 Kafka Wiki 14·15장의 설명을 보강한다. 본문 정본은 `_wiki/kafka.md`이며 새 원고·시리즈·UI는 만들지 않는다.

- [x] Source·Sink를 Kafka 기준 방향과 프로듀서·컨슈머 역할로 설명한다.
- [x] 플러그인 구현, 등록한 connector, 실행 task, worker 프로세스를 구분한다.
- [x] 기존 주문 104 사례로 source와 sink의 독립 실행, worker 증설과 task 병렬성의 차이를 설명한다.
- [x] WAL의 복구 목적, 선행 기록과 데이터 페이지 쓰기의 관계, logical decoding을 설명한다.
- [x] Debezium을 CDC 구현으로 소개하고 Connect·DB 서버·브로커의 책임을 연결한다.
- [x] DB 로그 위치·source 체크포인트·Kafka offset·sink 커밋의 차이와 장애 반례를 구체화한다.
- [x] 기존 장·앵커·출처·이미지·코드·메타데이터를 보존한다. `updated`만 갱신한다.
- [x] 최종 빌드, Kafka/아카이브 검사, 읽기 전용 독립 검토를 확인한다.

게시 후에는 해당 커밋의 Pages 성공과 공개 본문을 별도로 확인한다. 아래 결과는 게시 전 검증 기록이다.

## 설명 순서

14장: 방향 → 역할과 실행 단위 → 기존 실행 경계 그림 → 플러그인·등록 → 기존 정상 레코드 경로 → 위치·장애.
15장: 현재 상태와 변경 이력 → polling → WAL 원리 → Debezium의 CDC 구현 → PostgreSQL decoding 구성 → snapshot·복구.

기존 그림 14-2·14-3이 실행 경계와 양방향 데이터 경로를 이미 보여 주므로 새 그림은 추가하지 않는다. WAL의 선행 기록은 번호 목록의 상태 변화로 설명한다. 기존 그림·ASCII를 재생성하거나 옮기지 않는다.

## 이번에 조회한 1차 자료

조회일: 2026-11-04. 전체 문서 정독이 아니라 아래 관련 절의 대조다.

- Apache Kafka 4.3, Connect Overview: 공통 프레임워크, 그룹 관리와 offset 관리. <https://kafka.apache.org/43/kafka-connect/overview/>
- Apache Kafka 4.3, Connector Development Guide: Core Concepts and APIs, Source Tasks, Sink Tasks, Resuming from Previous Offsets. <https://kafka.apache.org/43/kafka-connect/connector-development-guide/>
- PostgreSQL 17, 28.3 Write-Ahead Logging: WAL 선행 기록, REDO, commit마다 데이터 페이지 flush가 필요하지 않은 이유. <https://www.postgresql.org/docs/17/wal-intro.html>
- PostgreSQL 17, 47.2 Logical Decoding Concepts: 저장 수준 WAL의 변환, slot의 독립 수명·재전달과 보존 비용. <https://www.postgresql.org/docs/17/logicaldecoding-explanation.html>
- Debezium 3.3.0.Final, PostgreSQL connector: Overview, Snapshots, Streaming changes. 고정 release tag의 공식 원문. <https://github.com/debezium/debezium/blob/v3.3.0.Final/documentation/modules/ROOT/pages/connectors/postgresql.adoc>

- Debezium 3.3.0.Final, Architecture: Connect와 별도 Engine·Server 배포 방식의 구분. <https://github.com/debezium/debezium/blob/v3.3.0.Final/documentation/modules/ROOT/pages/architecture.adoc>
- PostgreSQL 17, 28.4 Asynchronous Commit: `synchronous_commit`과 WAL flush 전 성공 응답의 위험. <https://www.postgresql.org/docs/17/wal-async-commit.html>

PostgreSQL 17은 WAL·logical decoding 원리 설명의 명시적인 기준이다. 기존 Kafka 4.3·Debezium 3.3.0.Final을 최신 릴리스라고 주장하지 않는다. 기존 부분 설정 예제는 연동 실행 결과가 아니며 이번에도 실제 PostgreSQL·Debezium·검색 sink의 통합 실행을 완료했다고 보고하지 않는다.

## 검증 상태

- Ruby 3.1 컨테이너의 일반 Jekyll 빌드: 성공. 로컬 Docker를 사용할 수 없던 첫 시도 뒤 엔진을 시작해 실제 빌드를 수행했다.
- `python3 tests/verify_kafka_textbook.py _site`: PASS. 16장, 내부 링크 522개, 기존 Issue 첨부 이미지 20개, 해설 25개. 개념 절의 고정 앵커 5개와 용어표 연결 검사 추가.
- 새 앵커를 하나씩 제거한 disposable 렌더 fixture 5개가 모두 실패함을 확인했다. 최종 실제 렌더는 통과했다.
- `python3 tests/verify_archive.py _site`: PASS. 공개 원문·탐색·작성 자료 제외 경계 확인.
- `ruby tests/archive_test.rb`: 10 tests, 67 assertions, 0 failures/errors.
- `ruby tests/article_toc_test.rb`: 7 tests, 32 assertions, 0 failures/errors.
- `python3 tests/verify_seo.py _site`: PASS.
- `python3 tests/test_kafka_integration_diagrams.py`: 7 tests, PASS.
- 원본 4f1dade와 비교: fenced code block 14개, 이미지 20개, 기존 authored ID 148개, 번호형 출처 참조 300개 보존. 1~13장과 16장·부록 A/B 본문 보존. Frontmatter는 `updated` 외 보존.
- 실제 빌드 HTTP 바이트 일치 확인 후 로컬 Chrome/Playwright에서 1440px·390px, light·dark 각각 문서 가로 overflow 없음, 새 개념의 용어표 링크 5개 이동, 해설 열기를 확인했다. 모바일 배치표와 WAL 본문 및 데스크톱 본문 스크린샷을 확인했다. 문서 UI는 변경하지 않았다.
- 기술 검토는 아래에 별도로 기록한다. 실제 PostgreSQL·Debezium·sink 통합 실행이나 장애 주입 실험, 학습자의 이해·숙달은 검증하지 않았다.
- 게시 시점의 Pages 상태·공개 HTTP 결과는 이 게시 전 기록에 포함하지 않는다.

## 독립 기술·설명 검토

14·15장 전체 문맥과 보강 diff, 부록 C/D, 이 검증 기록을 읽은 별도 읽기 전용 검토에서 차단 지적은 없었다. 검토자는 Kafka 4.3·PostgreSQL 17·Debezium 3.3.0.Final 관련 원문을 직접 대조했다. 검토 원고 SHA-256 `49cda7c298e24cbdbe0d6000771fab2acb76364a6da54b499c8da1077bbf65c8`와 최종 원고가 일치함을 확인했다.

- 14장 선수 개념은 앞 장의 프로듀서·컨슈머·로그다. Source·Sink 방향을 먼저 가르치고, worker A/B의 실제 배치 예로 관리 객체와 복사 실행을 구분했다. `tasks.max`·원본 분할 제약과 뒤의 장애 인계를 연결했다.
- 15장은 현재 상태 조회와 변경 이력의 차이를 출발점으로 쓴다. WAL·메모리 페이지·영구 저장·REDO를 정상 순서로 설명한 뒤, logical decoding과 Debezium 레코드 생성으로 연결했다. 주문 104의 L0/L1·Kafka 500/501 사례는 정상 전달 뒤 source 재발행과 sink 재소비를 별개의 실패 창으로 보여 준다.
- 원고의 예제 값은 가상이며 L0/L1은 실제 LSN 표기가 아님을 명시했다. 비동기 커밋, WAL 보존 손실, 단일 task, Kafka와 외부 쓰기의 분리 조건을 유지한다.
- 문체·설명 검토는 용어 정의, 정상 사례, 전제와 반례, 다음 절 연결을 대상으로 했다. 기존 문서 전체의 재검증, 이미지 실물 재검토, 실제 연동 실행 또는 학습 효과 검증으로 확대하지 않는다.
