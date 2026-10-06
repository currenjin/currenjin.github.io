# gRPC 위키 보강 근거·검증 기록

대상: `_wiki/grpc.md`. 기준 커밋 `03c1c3e`의 본문을 `docs/wiki-authoring.md` 기준으로 점검했다. 공식 자료 조회일: **2026-10-06**(작업 시점의 실제 날짜). 이 기록은 `_config.yml`의 `docs` 제외 규칙에 따라 사이트에 출판하지 않는다. 최초 작성 근거는 [grpc-verification.md](grpc-verification.md)에 있다.

## 범위와 원칙

- 15장 구성, 장 번호, 앵커(`chapter-1`~`chapter-15`, `glossary`), 코드 블록, 그림 4개, 확인 질문·해설, 기존 링크 32개, `ai` 메타데이터를 그대로 두었다. `updated`만 갱신했다.
- 수정 범위는 공식 원문과 대조해 부분 지지·누락으로 판정된 구간, 첫 사용 용어, 여러 생각이 섞인 문단으로 한정했다. 반박(CONTRADICTED)된 주장은 없었다.
- UI·CSS·다른 위키·`_data`는 바꾸지 않았다. 코드 예제의 버전은 올리지 않았다.

## 조회한 공식 자료

`current` 문서는 고정 릴리스가 아니다. 날짜는 페이지에 표시된 Last modified 또는 원본 저장소의 마지막 커밋이다.

| 자료 | 최종 수정 표시 |
|---|---|
| [Introduction](https://grpc.io/docs/what-is-grpc/introduction/) | 2024-11-12 |
| [Core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) | 2026-05-11 |
| [Metadata](https://grpc.io/docs/guides/metadata/) | 2024-11-12 |
| [Flow control](https://grpc.io/docs/guides/flow-control/) | 2023-10 |
| [Performance](https://grpc.io/docs/guides/performance/) | 2024-11-12 |
| [Python quick start](https://grpc.io/docs/languages/python/quickstart/), [Basics](https://grpc.io/docs/languages/python/basics/) | 2024-11-25 |
| [gRPC Python API](https://grpc.github.io/grpc/python/grpc.html) | 문서 표기 v1.83.0 |
| [Deadlines](https://grpc.io/docs/guides/deadlines/) | 2025-07-07 |
| [Cancellation](https://grpc.io/docs/guides/cancellation/) | 2024-02-29 |
| [Status codes](https://grpc.io/docs/guides/status-codes/), [statuscodes.md](https://github.com/grpc/grpc/blob/master/doc/statuscodes.md) | 2024-08-21 |
| [Retry](https://grpc.io/docs/guides/retry/) | 2025-11-26 |
| [gRFC A6 Client Retries](https://github.com/grpc/proposal/blob/master/A6-client-retries.md) | 제안 문서 |
| [Wait-for-ready](https://grpc.io/docs/guides/wait-for-ready/) | 2023-08-22 |
| [Service config](https://grpc.io/docs/guides/service-config/) | 2025-09-22 |
| [Authentication](https://grpc.io/docs/guides/auth/), [Interceptors](https://grpc.io/docs/guides/interceptors/) | 원본 markdown 조회 |
| [Custom name resolution](https://grpc.io/docs/guides/custom-name-resolution/) | 2025-04-23 |
| [Custom load balancing](https://grpc.io/docs/guides/custom-load-balancing/) | 2024-11-12 |
| [load-balancing.md](https://github.com/grpc/grpc/blob/master/doc/load-balancing.md), [connectivity-semantics-and-api.md](https://github.com/grpc/grpc/blob/master/doc/connectivity-semantics-and-api.md) | master |
| [Health checking](https://grpc.io/docs/guides/health-checking/) | 2024-05-20 |
| [Keepalive](https://grpc.io/docs/guides/keepalive/) | 2025-11-10 |
| [Graceful stop](https://grpc.io/docs/guides/server-graceful-stop/) | 2025-01-15 |
| [OpenTelemetry metrics](https://grpc.io/docs/guides/opentelemetry-metrics/), [Reflection](https://grpc.io/docs/guides/reflection/) | 2026-05-11 |
| [Proto3](https://protobuf.dev/programming-guides/proto3/), [Field presence](https://protobuf.dev/programming-guides/field_presence/), [Dos and don'ts](https://protobuf.dev/best-practices/dos-donts/) | 날짜 표시 없음 |
| [grpc/grpc-web README](https://github.com/grpc/grpc-web) | 2026-08-26, 최신 릴리스 2.1.1 |

## 기술 수정·보강과 근거

인용은 원문 영어 그대로다.

| 장 | 변경 | 근거 |
|---|---|---|
| 2 | optional 권고 문구를 원문에 맞춤(scalar 한정 → implicit 필드 대비) | Proto3 › Field Cardinality: "`optional` is recommended over implicit fields for maximum compatibility with protobuf editions and proto2." |
| 2 | wire-safe 분류의 위치를 'Updating A Message Type' 절로 특정, 안전하지 않은 변경 예 추가 | Proto3 › "Binary Wire-unsafe Changes"; "Changing field numbers for any existing field is not safe."; "Moving fields into an existing `oneof` is not safe." |
| 2 | 64비트 값을 int32로 읽을 때의 잘림 예 | Proto3: "If a 64-bit number is read as an int32, it will be truncated to 32 bits." |
| 2 | field number 범위·구현 예약 범위 | Proto3 › Assigning Field Numbers (1~536,870,911, 19,000~19,999 예약) |
| 2 | 이름 예약의 이유 | Proto3 › Deleting Fields: "You should also reserve the field name to allow JSON and TextFormat encodings of your message to continue to parse." |
| 2 | bytes·enum 기본값, presence 규칙 문단 분리 | Proto3 › Default Values; Field presence: "proto3 does not track presence explicitly for repeated fields." |
| 2 | unknown field 보존 API | Proto3 › Retaining Unknown Fields: "message-oriented APIs, such as `CopyFrom()` and `MergeFrom()`" |
| 3 | channel 상태에 `SHUTDOWN` 추가, 출처 링크 추가 | connectivity-semantics-and-api.md: SHUTDOWN "Any new RPCs should fail immediately". 기존 인용 문서(Core concepts)는 상태 이름을 열거하지 않는다. |
| 3 | 동시 stream 한도에서 추가 RPC가 클라이언트에 대기 | Performance: "additional RPCs are queued in the client" |
| 4 | 교착 조건을 원문 범위로 좁힘 | Flow control: "potential for a deadlock if both the client and server are doing synchronous reads or using manual flow control and both try to do a lot of writing without doing any reads." |
| 4 | flow control이 streaming에 적용됨 | Flow control: "It applies to streaming RPCs and is not relevant for unary RPCs." |
| 5 | `context.abort`가 예외를 발생시키고 OK로 호출 불가, Python API 링크 추가 | Python API: "Raises an exception to terminate the RPC with a non-OK status… must not be StatusCode.OK." |
| 6 | 서버는 deadline 만료를 `CANCELLED`로 관찰 | Deadlines › Deadlines on the Server: "automatically cancelling a call (`CANCELLED` status) once a deadline set by the client has passed" |
| 7 | 자동 하위 취소 언어 명시 | Cancellation › Language Support 표: Java·Go·C++ "Automatically cancels outgoing RPCs", Python 표기 없음 |
| 7 | 취소 이유가 서버에 전달되지 않음(가정 → 원문 사실) | Cancellation: "gRPC clients do not provide additional details to the server about the reason for the cancellation… will result in a client-side exception and/or log." |
| 8 | `INTERNAL`·`UNKNOWN`, `OUT_OF_RANGE`·`DATA_LOSS` 행 분리 | Status codes: INTERNAL "reserved for serious errors"; UNKNOWN "errors raised by APIs that do not return enough error information"; OUT_OF_RANGE "may be fixed if the system state changes" |
| 8 | `-bin` 근거로 Core concepts 링크 추가 | Core concepts › Metadata: "Binary-valued keys end in `-bin`" |
| 9 | transparent retry 두 경우(무제한/1회)와 `maxAttempts` 비포함 | Retry: "unlimited transparent retry when RPC never leaves the client" / "single transparent retry…"; A6: "transparent retries do not count toward the limit of configured RPC attempts" |
| 9 | retry 기본 켜짐·기본 policy 없음·끌 수 있음 | Retry: "Retries are enabled by default, but there is no default retry policy… disable retries entirely… disables transparent retries" |
| 9 | backoff 정의, jitter ±20% | Retry: "Jitter of plus or minus 20% is applied to the backoff delay"; A6 backoff 공식 |
| 9 | throttling·pushback 설명 | Retry: "Failed RPCs decrement the count by 1, successful RPCs increment it by tokenRatio… below half of maxTokens"; A6: `grpc-retry-pushback-ms` |
| 9 | 재시도 정상 흐름 번호 목록 | A6의 재시도 조건(retryable status, commit, deadline, maxAttempts, throttling, pushback)을 순서로 정리한 설명 |
| 9 | `maxAttempts` 상한 5 | A6: "Values greater than 5 are treated as 5… This client-side maximum value can be changed by the client through the use of channel arguments." |
| 9 | committed의 두 조건, 버퍼 한도 | A6: "The client receives Response-Headers. / The client's outgoing message has overflowed the gRPC client library's buffer." |
| 9 | retry와 hedging 중 하나만 설정 | Service config: "One of: Retry policy… Hedging policy" |
| 9 | Python 예제의 `grpc.enable_retries` | 공식 Python retry 예제의 channel option |
| 9 | TRANSIENT_FAILURE 기본 동작을 '즉시 실패'로, permanent failure | Wait-for-ready: "without Wait-for-Ready it will immediately return a failure"; 흐름도 "READY (or a permanent failure)" |
| 9 | 멱등성 첫 정의와 status 문서 경고 | statuscodes.md: "it is not always safe to retry non-idempotent operations." |
| 10 | Google token 경고 문구를 원문에 맞춤 | Auth: "Sending a Google issued OAuth2 token to a non-Google service could result in this token being stolen and used to impersonate the client to Google services." |
| 11 | 표준 DNS의 주소 갱신 시점 | Custom name resolution: "a client looks up the address… at the beginning of the connection and maintains its connection to that address for the lifetime of the connection." |
| 11 | 코드 지정 service config는 기본값 | Service config: "used to provide a default service config that will be used in situations where the name resolver does not provide a service config." |
| 11 | gRPC LB는 호출 단위 | load-balancing.md: "Load-balancing within gRPC happens on a per-call basis, not a per-connection basis." |
| 12 | healthy 전 요청 보류, Watch 재시도 | Health checking: "Requests won't be sent until the health check service sends a healthy status"; "retries will be made (with exponential backoff)" |
| 12 | 서버 종료를 health library에 알림 | Health checking: "inform the health check library about server shutdown so that it can notify all the connected clients." |
| 12 | `GOAWAY`/`too_many_pings` 조건을 원문 범위로 수정 | Keepalive Note: "If the service does not support keepalive, the first few keepalive pings will be ignored, and the server will eventually send a `GOAWAY`…" `PERMIT_KEEPALIVE_TIME` 기본 5분은 같은 문서의 설정 표 |
| 12 | 1분 권고의 이유(DDoS) | Keepalive Warning: "To avoid DDoSing… avoid configuring their keepalive much below one minute." |
| 12 | Python `stop(grace)`가 grace 후 중단 포함 | Python API: "RPCs that haven't been terminated within the grace period are aborted." |
| 13 | Python streaming 성능 문구를 원문에 맞춤('동기 stack', '느릴 수 있음' → 원문 표현) | Performance › Python: "Streaming RPCs create extra threads… much slower than unary RPCs in gRPC Python, unlike the other languages"; "Using asyncio could improve performance." |
| 13 | 여러 channel은 임시 해결책 | Performance: "any solution involving creating multiple channels is a temporary workaround" |
| 14 | 실험 지표는 항상 기본 비활성 | OpenTelemetry metrics: "Experimental metrics are always off by default." |
| 15 | Envoy가 기본 proxy, 다른 proxy·서버 프레임워크 존재 | grpc-web README: "by default, gRPC-web uses Envoy"; Ecosystem 목록 |
| 15 | `grpcweb` 모드는 unary만 | grpc-web README › Wire Format Mode: "Only unary calls are supported." |

원문 대조로 지지된 나머지 주장(Protobuf 기본 IDL, 단방향 순서 보장, 독립적 성공 판단, 기본 deadline 없음, 언어별 deadline 전파, DEADLINE_EXCEEDED의 성공 가능성, 라이브러리가 생성하지 않는 status 7종, metadata 8 KiB 제안값, call credentials의 비암호화 channel 제한, interceptor 순서 예, `pick_first` 기본값, health `Check`/`Watch`, keepalive 실패 시 미전송 데이터 손실, stream은 시작 후 재분산 불가, OTel call/attempt 지표, reflection 기본 비활성, gRPC-Web 지원 모드)은 문장을 바꾸지 않았다. 압축의 CPU·bandwidth 교환은 공식 문서에서 찾지 못했으나 본문이 이미 측정 설계로 표시하므로 유지했다.

## 용어 첫 설명·문단 정리

기술 의미를 바꾸지 않은 가독성 수정이다.

- 첫 사용에 설명을 붙인 용어: stub, wire 형식, FieldMask, Editions, ProtoJSON, source compatibility, HTTP/2 stream, 하위 전송 계층, servicer, generator, attempt, 멱등성, backoff, jitter, throttling, pushback, hedging, fault injection, VIP, xDS, L4/L7, GOAWAY, drain, readiness, backpressure, admission, p95·p99, retry amplification, cardinality, CORS.
- 한 문단에 여러 생각이 있던 구간을 나눴다: 머리말의 조회일·재현 버전·언어 차이, 2장 presence(정의/필드 종류별 규칙/변경 계약/권고), 2장 타입 변경(분류/잘림), 3장 channel(상태/연결·stream/재사용), 5장 abort/generator, 8장 metadata(규칙/크기), 9장 retry(정의/멱등성, backoff/jitter/throttling), 11장 VIP/xDS/주소 갱신, 12장 health checking·keepalive, 14장 지표 기본값/cardinality, 15장 proxy/CORS.
- 부록 A에 `Backoff·jitter` 한 줄을 추가했다.

## 버전 확인과 재현

- 조회일 PyPI 최신: grpcio 1.84.0(2026-09-14), grpcio-tools 1.84.0(2026-09-14, `protobuf<8.0.0,>=7.35.1` 요구), protobuf 7.36.2(2026-09-17). 기존 재현 버전과 같으므로 코드와 고정 버전을 바꾸지 않았다. 조회일과 재현 버전은 본문 머리말에서 분리해 표기했다.
- `tests/grpc_textbook_examples.py`(신규): 본문 5장의 `inventory.proto`, `server.py`, `client.py`와 예상 출력을 본문에서 그대로 추출해 실행한다. Python 3.11.14, grpcio 1.84.0, grpcio-tools 1.84.0, protobuf 7.36.2에서 코드 생성, 서버 기동, 클라이언트 출력 8줄 일치, 본문 JSON 예제 파싱까지 PASS.

## 렌더링·출판 검증

- 일반 Docker Jekyll 빌드(깨끗한 `_site`) 성공.
- `tests/verify_grpc_textbook.py`(신규): 목차의 1~15장, `chapter-*`·`glossary` 앵커, 내부 fragment 152개, ID 중복 없음, SVG 4개 파싱, 장마다 `공식 원문` 줄, 기준 커밋 대비 코드 블록·그림·앵커·외부/위키 링크·확인 질문·프론트매터 보존, 검증 문서의 비출판 확인. PASS. 코드 블록과 확인 질문을 일부러 지운 사본에서 FAIL을 확인했다.
- `tests/verify_archive.py _site` PASS, `ruby tests/archive_test.rb` 6 runs·49 assertions 통과, `git diff --check` 통과.
- 본문 외부 링크 36개(기존 32 + 신규 4)를 GET으로 확인했다. 모두 HTTP 200. 링크 생존은 내용 검토와 별개다.

## 검증하지 않은 범위

- retry·hedging·throttling·pushback, 다중 backend 부하 분산, health `Watch`, keepalive `GOAWAY`, TLS·mTLS, gRPC-Web 브라우저 호출, OpenTelemetry 지표는 실행하지 않았다. 원문 대조만 했다.
- Java·Go·C++ 동작과 Python 외 언어의 기본값은 실행 검증하지 않았다. Python의 deadline 자동 전파 여부는 공식 문서에 명시가 없어 본문의 '가정하지 않는다' 표현을 유지했다.
- 시각 요소(그림·CSS)는 바꾸지 않았으므로 브라우저 폭·테마 확인은 다시 하지 않았다.
- `_data/updates.json`의 gRPC 항목은 범위 밖이라 갱신하지 않았다.
