# gRPC 위키 출처·검증 기록

대상: `_wiki/grpc.md`. 2026-10-06 작성. 이 기록은 `docs/` 제외 규칙에 따라 사이트에 출판하지 않는다.

## 출처 범위와 검토

기준은 [gRPC 공식 문서](https://grpc.io/docs/)의 Overview·Core concepts·Guides·Python 문서, [Proto3 가이드](https://protobuf.dev/programming-guides/proto3/), [Protobuf Best Practices](https://protobuf.dev/best-practices/dos-donts/), [공식 gRPC-Web 저장소](https://github.com/grpc/grpc-web)다. 고정 릴리스 매뉴얼이 아닌 갱신되는 문서이며, 라이브러리별 기능과 기본값은 실제 사용하는 버전에서 다시 확인한다. 수집 자체와 내용 대조·실행 검증은 구분한다.

| 본문 | 대조한 원문 | 검토한 경계 |
|---|---|---|
| 1~4장 | Introduction, Core concepts, Metadata, Flow control | 원격 실패와 업무 실행, 네 RPC 형태, 방향별 순서, channel과 연결, write 완료와 소비 완료 |
| 2장 | Proto3, Best Practices | field number, reserved, optional presence, unknown fields, binary·JSON·업무 의미 호환성 |
| 5장 | Python Quick Start, Basics | 코드 생성, servicer 등록, unary·server stream, status·timeout·cancel |
| 6~7장 | Deadlines, Cancellation | 전파의 언어별 차이, 남은 예산, 취소와 작업 정리, DB rollback을 보장하지 않음 |
| 8~9장 | Status codes, Metadata, Retry, Wait-for-ready, Service config | 실패의 처리 단계 차이, transparent retry, 최초 시도를 포함하는 maxAttempts, retry commit과 DB commit 구분, 준비 대기와 재시도 구분 |
| 10장 | Authentication, Interceptors | TLS·인증·인가 분리, channel/call credentials, streaming interceptor 수명 |
| 11~12장 | Name resolution, Load balancing, Health, Keepalive, Graceful stop | resolver 주소 집합, READY 연결 선택, stream 고정, health와 PING 분리, drain과 forceful stop |
| 13~14장 | Performance, OpenTelemetry metrics, Reflection | channel 재사용, 동시 stream 제약, call과 attempt, reflection 접근 통제 |
| 15장 | gRPC-Web, Core concepts, 기존 Kafka·분산 트랜잭션 위키 | 브라우저와 native gRPC 차이, 공개 gRPC-Web 구현의 streaming 제약, RPC와 이벤트 로그의 다른 역할 |

일반 REST 비교, 멱등 처리 흐름, Outbox 연결, 배포·장애 대응은 원문이 보장하는 기능과 구분한 설계 설명이다. 서비스 예제의 상품·수량·서버는 가상이다. 도식에도 deadline 전파 전제, READY 연결, bidi 방향의 독립성을 명시했다.

## 실행·렌더링 검증

- Python 3.11.14, grpcio 1.84.0, grpcio-tools 1.84.0, protobuf 7.36.2에서 본문의 `inventory.proto`, `server.py`, `client.py`를 추출했다. 최종 본문의 코드와 실행 파일이 같은지 대조했다.
- `grpc_tools.protoc` 코드 생성과 Python 구문 검증 성공. JSON 설정 예제도 파싱했다.
- 로컬 loopback에서 테스트 10개 통과: unary 결과, stream 메시지·순서, NOT_FOUND, 빈 ID, 잘못된 지연 값, DEADLINE_EXCEEDED, stream 취소, wait-for-ready 정상 호출, 본문 client의 전체 출력, Protobuf roundtrip.
- 일반 Docker Jekyll 4.1.1 빌드 성공. `tests/verify_archive.py` 통과. `tests/archive_test.rb` 6개 테스트·49개 assertion 통과.
- 렌더링된 15장과 목차 항목, fragment 대상, ID 중복 없음, 펼침 해설 15개, SVG 4개, 검색·그래프·홈 등록을 확인했다.
- 본문의 공식 URL 32개를 GET으로 확인했다. 모두 HTTP 200이었다. 링크 생존 확인은 내용 검토와 별개다.
- Chrome에서 1280px·390px, light·dark 네 조합의 이미지 로딩, 문서 가로 넘침 없음, Kafka 링크, 해설 열기·닫기를 확인했다. 최종 도식의 잘림·겹침을 시각적으로 확인했다.

## 검증하지 않은 범위

DB·외부 결제 연동, 실제 자동 retry·LB·health 서비스, TLS·mTLS, Kubernetes rollout, 부하 시험, 브라우저 gRPC-Web RPC는 실행하지 않았다. 서버 stream 이후의 재개·중복 제거는 설계 설명이며 실습 코드가 구현하지 않는다. Java·Go·C++ 예제의 실행이나 모든 언어의 기본값을 검증한 것으로 간주하지 않는다.
