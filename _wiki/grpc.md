---
layout  : wiki
title   : gRPC
summary : RPC·Protobuf 계약에서 스트리밍·deadline·재시도·보안·운영까지 배우는 웹 교과서
date    : 2026-10-06 16:30:00 +0900
updated : 2026-10-06 16:30:00 +0900
tags    : [network, architecture, engineering]
toc     : true
public  : true
parent  : [[index]]
latex   : false
---

* TOC
{:toc}

## 읽는 순서

gRPC 공식 문서를 학습 순서로 재구성한 비공식 웹 교과서다. HTTP API와 DB 트랜잭션은 알고 있지만 RPC의 계약·통신·실패 모델을 처음부터 연결하려는 독자를 대상으로 한다. 처음에는 순서대로 읽고, 이후에는 목차와 [용어 찾아보기](#glossary)로 필요한 설명을 찾는다. 별도 요약본이나 정해진 학습 주차는 두지 않는다.

본문의 한결마켓·주문·재고 사례는 설명을 위해 만든 가상 사례다. 원리와 정상 흐름을 설명한 뒤 조건을 바꾸어 실패 결과를 살펴본다. 확인 질문의 해설은 펼쳐 볼 수 있다. 5장의 Python 예제 외에 설계용 코드와 설정은 해당 절에 범위를 표시한다.

공식 가이드는 특정 gRPC 릴리스에 고정된 문서가 아니다. 이 문서는 2026-10-06 조회한 원문을 기준으로 한다. Protobuf 설명은 `proto3`, 실행 예제는 Python 3.11·`grpcio==1.84.0`·`grpcio-tools==1.84.0`·`protobuf==7.36.2` 기준이다. Java·Go·C++·Python의 deadline 전파, interceptor, health checking, 관측 API가 모두 같다고 가정하지 않는다. 다른 버전과 언어에서는 각 장의 공식 링크를 다시 확인한다.

| 순서 | 배우는 문제 |
|---|---|
| [1장](#chapter-1) | 원격 호출이 로컬 함수와 다른 이유 |
| [2장](#chapter-2) | `.proto` 계약·field number·presence·호환성 |
| [3장](#chapter-3) | Stub·channel·HTTP/2와 RPC의 시작·종료 |
| [4장](#chapter-4) | 네 가지 RPC·방향별 순서·flow control |
| [5장](#chapter-5) | Python에서 계약을 생성하고 호출하기 |
| [6장](#chapter-6) | Deadline과 연쇄 호출의 시간 예산 |
| [7장](#chapter-7) | 취소·자원 정리와 DB rollback의 차이 |
| [8장](#chapter-8) | Status·metadata·trailer를 읽는 법 |
| [9장](#chapter-9) | 재시도·wait-for-ready·업무 멱등성 |
| [10장](#chapter-10) | TLS·인증·인가·interceptor의 경계 |
| [11장](#chapter-11) | Name resolution·service config·부하 분산 |
| [12장](#chapter-12) | Health check·keepalive·graceful shutdown |
| [13장](#chapter-13) | Channel 재사용·동시성·성능·backpressure |
| [14장](#chapter-14) | 논리 호출과 attempt의 관측·장애 테스트 |
| [15장](#chapter-15) | REST·gRPC-Web·Kafka와 함께 설계하기 |

<a id="chapter-1"></a>
## 1장. 다른 프로세스의 일을 어떻게 요청하는가 | RPC

한결마켓의 주문 서비스가 재고 서비스에 상품 수량을 묻는다. 재고가 같은 프로세스의 객체라면 `get_stock("apple")`을 호출하면 된다. 다른 서버에 있다면 인자를 바이트로 바꾸고, 네트워크로 보내고, 재고 서버가 반환한 바이트를 다시 해석해야 한다. 원격 프로시저 호출(remote procedure call, RPC)은 이 통신을 메서드 호출 형태의 API로 제공한다.

gRPC에서는 서비스의 메서드와 요청·응답 타입을 먼저 정의한다. 기본적으로 Protocol Buffers(Protobuf)를 인터페이스 정의 언어(interface definition language, IDL)와 메시지 직렬화 형식으로 사용한다. 컴파일러와 gRPC 플러그인이 계약에서 클라이언트·서버 코드를 생성한다. Protobuf가 유일하게 가능한 직렬화 방식이라는 뜻은 아니지만, 이 교과서는 공식 문서의 기본 경로인 Protobuf를 사용한다.

### 메서드 모양은 같아도 실패 모델은 다르다

생성된 stub의 `GetStock`을 호출하면 로컬 코드가 네트워크 요청을 만든다. 재고 서버는 요청을 해석하고 업무 코드를 실행한 뒤 결과를 돌려준다. 타입에 맞지 않는 인자를 줄였다고 해서 통신 실패까지 사라지는 것은 아니다.

네트워크 요청은 도착하지 않을 수 있다. 도착했지만 서버가 처리하지 못할 수도 있고, 처리한 뒤 응답만 유실될 수도 있다. 호출자가 같은 오류를 보더라도 서버에서 일어난 일은 다를 수 있다. 이 때문에 '응답을 못 받았다'와 '실행되지 않았다'를 구분해야 한다. 재고를 조회하는 호출과 재고를 차감하는 호출은 같은 방식으로 재시도할 수 없다.

![원격 호출은 요청 전송·업무 실행·응답 전송을 각각 거친다.](/assets/images/grpc-textbook/fig-01-call.svg)

동기(synchronous) API는 응답을 기다리는 동안 호출 스레드를 막는다. 비동기(asynchronous) API는 완료를 나중에 받도록 한다. 동기·비동기는 호출 코드의 대기 방식이고, unary·streaming은 메시지 개수와 방향이다. 비동기 unary도 있고 동기 streaming도 있다. 'gRPC는 비동기다'만으로 API를 설명하면 이 두 축을 섞게 된다.

### 무엇을 계약하고 무엇을 계약하지 않는가

`GetStock(StockRequest) returns (StockReply)`는 어떤 메서드에 어떤 메시지를 보낼지 정한다. 요청을 처리하는 DB 격리 수준, 재고 숫자의 최신성, 성공 응답 이전의 커밋 시점은 서비스 구현과 업무 계약이 정해야 한다. 필드가 `quantity`라는 이름이라고 해서 예약 가능한 수량인지 창고의 실물 수량인지 알 수 없다.

예를 들어 서버가 DB 커밋 뒤 `OK`를 반환하도록 구현했다면, 호출자는 정상 응답에서 그 약속을 기대할 수 있다. 반대로 서버가 큐에 넣은 즉시 `OK`를 반환한다면 그것은 접수 성공이다. gRPC의 성공 상태만으로 두 서비스를 동일한 처리 보장으로 해석하면 안 된다.

### REST·Kafka와 다른 질문을 해결한다

REST는 리소스와 HTTP의 의미를 중심으로 API를 설계하는 방식이며, JSON은 흔히 쓰는 표현 형식이다. REST가 반드시 JSON이나 HTTP/1.1만 사용한다는 뜻은 아니다. gRPC는 서비스·메서드·메시지 계약을 중심으로 호출한다. 계약에서 여러 언어의 코드를 생성하거나 양방향 메시지 흐름이 필요할 때 검토할 수 있다. 어느 쪽이 항상 빠르거나 더 좋은 것은 아니다.

[Kafka](/wiki/kafka/)는 이벤트를 기록하고 소비자가 자신의 위치에서 읽는 모델을 다룬다. gRPC 호출은 브로커의 내구성 있는 로그나 replay offset을 자동으로 만들지 않는다. '지금 재고를 확인한다'와 '주문 완료 사실을 나중에도 소비한다'는 다른 요구다. [15장](#chapter-15)에서는 두 모델을 함께 배치한다.

### 확인 질문: 재고 차감 응답이 사라지면

재고 서버가 수량을 차감한 뒤 응답을 보냈지만 주문 서비스는 응답을 받지 못했다. 같은 요청을 다시 보내면 무엇이 일어날 수 있는가? `.proto`에서 요청 타입을 엄격하게 정의하면 이 문제가 해결되는가?

<details markdown="1">
<summary>해설</summary>

서버가 두 요청을 각각 새 차감으로 처리하면 두 번 줄어든다. 타입 검사는 유효한 메시지의 구조를 다루며, 같은 업무를 한 번만 반영하는 규칙은 만들지 않는다. 요청 식별자와 서버의 중복 처리 규칙이 필요하다. 반대로 첫 요청이 도착하지 않았다면 재시도가 최초 실행이다. 호출자의 통신 오류만으로 두 경우를 판별할 수 없는 것이 문제다.

</details>

공식 원문: [Introduction to gRPC](https://grpc.io/docs/what-is-grpc/introduction/), [Core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/).

<a id="chapter-2"></a>
## 2장. 메시지를 바꾸어도 서로 읽을 수 있는가 | Protobuf 계약

서비스들이 동시에 배포된다는 가정은 오래 유지하기 어렵다. 주문 서비스는 신버전이고 재고 서비스는 구버전일 수 있다. Protobuf의 메시지 계약은 이 혼합 상태에서 바이트를 해석하는 규칙을 제공한다. 바이트를 읽을 수 있다는 사실과 업무 의미가 유지된다는 사실은 별도로 확인해야 한다.

### 이름보다 field number가 wire 계약에 쓰인다

다음은 재고 조회 응답의 설명용 계약이다.

```proto
syntax = "proto3";
package shop.inventory.v1;

message StockReply {
  string product_id = 1;
  int32 quantity = 2;
  optional string warehouse_id = 3;
}
```

`product_id`, `quantity`는 생성 코드에서 쓰는 이름이다. 이진 wire 형식에서 필드를 식별하는 것은 `1`, `2`, `3`이라는 field number다. 한 메시지 안에서 번호는 중복될 수 없다. 기존 필드의 번호를 바꾸면 이름이 같아도 다른 wire 필드가 된다.

필드를 삭제할 때는 번호와 이름을 예약한다. 예를 들어 3번을 지웠다면 다음처럼 작성한다.

```proto
message StockReply {
  reserved 3;
  reserved "warehouse_id";
  string product_id = 1;
  int32 quantity = 2;
}
```

예약한 번호를 새 `discount_percent` 필드에 재사용하면, 오래된 메시지의 3번 데이터가 신버전에서 다른 의미로 해석될 수 있다. 타입이 달라 파싱 결과가 달라질 수도 있지만, 파싱에 성공한다고 안전한 것은 아니다. 번호 재사용 금지는 과거 데이터·구버전 클라이언트가 남아 있는 상황을 함께 보호한다.

### Presence는 '없음'과 '기본값'을 나누는 규칙이다

`proto3`의 일반적인 singular scalar 필드는 implicit presence를 사용한다. 위 `quantity`를 읽으면 보내지 않은 경우에도 숫자의 기본값인 `0`이 나온다. 생성 API의 값만 보고 '필드가 생략됐다'와 '재고 0을 보냈다'를 구분할 수 없다. 문자열은 빈 문자열, boolean은 `false`가 기본값이다.

`optional` scalar는 explicit presence를 가진다. `optional int32 quantity = 2;`로 설계하면, Python의 `HasField("quantity")` 같은 API로 설정 여부를 확인할 수 있다. 설정된 0과 미설정 상태가 다르다. Message 타입과 `oneof`도 presence를 다루지만, repeated 필드와 map은 같은 방식의 '설정 여부'를 제공하지 않는다. 언어별 생성 API는 공식 문서를 확인한다.

재고 변경 요청에서 `quantity = 0`을 '변경하지 않음'으로 해석하면 재고를 실제로 0으로 바꾸기 어렵다. 이 경우 explicit presence나 FieldMask 같은 별도의 변경 계약을 검토한다. 조회한 Proto3 공식 가이드는 proto2·Editions와의 호환성을 위해 scalar의 `optional`을 권한다. Presence를 선택하는 것과 없음 상태의 업무 의미를 정하는 것은 별개다. 예를 들어 optional 필드가 없을 때 '변경하지 않음'인지 '잘못된 요청'인지는 서비스가 계약해야 한다.

### Unknown field 보존에는 통과 경로의 조건이 있다

신버전 서버가 새 필드를 추가하면 구버전 클라이언트는 모르는 필드를 가진 메시지를 받을 수 있다. Proto3는 unknown field를 이진 파싱·재직렬화 과정에서 보존한다. 다만 JSON으로 바꾸거나 알려진 필드만 하나씩 새 메시지에 복사하면 unknown field가 사라질 수 있다.

따라서 '구버전 중계 서비스가 있으니 새 필드도 그대로 돌아올 것이다'는 실제 처리 경로를 확인해야 하는 주장이다. 중계 서비스가 이진 메시지를 파싱·재직렬화하는지, JSON DTO로 변환하는지에 따라 결과가 다르다. Protobuf 이진 호환 규칙을 ProtoJSON과 생성 코드의 source compatibility에 그대로 적용하지 않는다.

### 호환성을 세 층으로 나누어 확인한다

| 층 | 확인할 문제 | 예 |
|---|---|---|
| Wire | 구·신버전이 바이트를 해석하는가 | 새 field number 추가·타입 변경 |
| API/source | 생성 코드를 사용하는 프로그램이 빌드되는가 | 필드 이름 변경·메서드 삭제 |
| 업무 의미 | 같은 값을 같은 뜻으로 쓰는가 | 수량 단위를 개수에서 박스로 변경 |

새 필드 추가는 보통 binary wire-safe한 변화지만, 서버가 새 필드를 모든 요청의 필수 업무 조건으로 삼으면 구버전 클라이언트가 실패한다. 구버전은 필드를 보낼 수 없기 때문이다. 먼저 서버가 없음 상태를 처리하고, 클라이언트를 갱신하고, 실제 호출 현황을 확인한 뒤 구경로를 종료하는 식의 배포 순서가 필요하다. 이것은 Protobuf 문법이 대신 정해 주지 않는 설계 판단이다.

`int32`를 같은 번호의 `string`으로 바꾸는 식의 변경은 안전하다고 가정하지 않는다. 공식 문서는 wire-safe·wire-compatible·wire-unsafe 변경을 구분한다. 일부 숫자 타입 변경이 wire-compatible해도 값 범위에 따라 잘리거나 데이터가 손실될 수 있다. 변경 가능한 타입 목록을 외우기보다 저장된 메시지와 실제 값 범위를 함께 검사한다.

### 확인 질문: 이름을 그대로 두고 단위를 바꾸면

`quantity = 2`의 field number와 타입은 그대로다. 서버가 오늘부터 '개수' 대신 '박스 수'를 보내기로 했다. 구버전 주문 서비스가 정상 파싱하면 호환 배포인가? 새 `box_quantity` 필드를 추가하면 어떤 전환이 필요한가?

<details markdown="1">
<summary>해설</summary>

파싱 성공은 기존 단위가 유지된다는 뜻이 아니다. 구버전이 박스를 개수로 읽으므로 업무 호환성이 깨진다. 새 번호의 필드를 추가하고 기존 필드의 의미를 유지한 상태에서 소비자를 전환해야 한다. 양쪽 필드가 공존할 때 무엇을 우선하는지, 변환할 수 없는 값은 어떻게 처리할지도 계약해야 한다. 이전 번호를 재사용하지 않는다.

</details>

공식 원문: [Proto3 language guide](https://protobuf.dev/programming-guides/proto3/), [Protobuf best practices](https://protobuf.dev/best-practices/dos-donts/).

<a id="chapter-3"></a>
## 3장. 메서드 호출이 어떤 통신으로 바뀌는가 | Stub·Channel·Lifecycle

`.proto`는 통신 계약이지 서버 구현이 아니다. 컴파일러는 메시지 클래스와 서비스 코드를 만들고, 개발자는 생성된 서버 인터페이스의 메서드를 구현한다. 클라이언트는 channel에 연결된 stub을 만든다. Python에서는 메시지가 `inventory_pb2.py`, gRPC 서비스 코드가 `inventory_pb2_grpc.py`에 생성된다.

### Channel을 RPC 하나나 TCP 연결 하나로 보지 않는다

Channel은 대상 주소와 통신 정책을 가진 클라이언트 객체다. 이름 해석·연결·부하 분산 같은 통신 작업이 channel 아래에서 일어난다. 생성 즉시 원격 서버가 업무 요청을 받을 수 있음을 보장하는 것은 아니다. Channel에는 `IDLE`, `CONNECTING`, `READY`, `TRANSIENT_FAILURE` 같은 연결 상태가 있다.

한 channel은 구현과 정책에 따라 0개 이상의 HTTP/2 연결을 사용할 수 있다. 한 연결에는 여러 HTTP/2 stream이 공존할 수 있다. 새 RPC마다 새 channel을 만들면 DNS·연결·TLS 등의 비용을 반복할 수 있으므로, 보통 stub과 channel을 재사용한다. 이 권고가 'channel 하나면 어떤 부하도 처리한다'는 보장은 아니다. [13장](#chapter-13)에서 동시 stream 한도를 살펴본다.

여기서 HTTP/2 stream과 애플리케이션의 streaming RPC는 구분한다. Unary RPC도 HTTP/2 stream을 사용한다. Streaming RPC는 같은 RPC 안에 여러 Protobuf 메시지를 보내는 호출 형태다. 'HTTP/2를 사용하니 응답이 여러 개다'는 설명은 맞지 않는다.

### Unary 호출의 정상 흐름

1. 클라이언트가 stub 메서드에 요청 메시지·deadline·metadata를 넘긴다.
2. gRPC가 대상 서버에 메서드와 metadata를 보내고 요청을 직렬화한다.
3. 서버 런타임이 요청을 해석하고 등록된 handler를 실행한다.
4. Handler가 응답 메시지를 반환한다. 서버는 응답 앞의 initial metadata와 종료 시점의 status·trailing metadata도 보낼 수 있다.
5. 클라이언트가 `OK`와 응답을 받으면 호출이 성공으로 끝난다. 실패 status는 언어의 오류 API로 드러난다.

서버가 언제 initial metadata를 보낼지는 구현에 따라 다르지만 응답 메시지보다 앞서야 한다. 호출은 메시지 내용만으로 끝나지 않는다. Stream을 사용하면 응답 몇 개를 이미 받은 뒤에도 마지막 status가 오류일 수 있다. 일부 데이터를 받았다는 사실과 전체 RPC 완료를 분리해 처리한다.

### 서버와 클라이언트의 성공 판단은 다를 수 있다

서버는 응답을 생성했고 gRPC에 전달했다. 그런데 클라이언트의 deadline이 먼저 지났다면 클라이언트는 `DEADLINE_EXCEEDED`로 끝난다. 공식 core concepts는 양쪽이 독립적으로 호출의 성공을 판단하고 결과가 일치하지 않을 수 있다고 설명한다.

재고 차감 DB 트랜잭션과 gRPC 응답 전송 사이에는 이 경계가 남는다. 네트워크 프로토콜이 DB와 호출자를 하나의 원자적 트랜잭션으로 묶지 않는다. 장애를 조사할 때는 client status, server status, 실제 업무 결과를 함께 확인한다.

### Metadata는 호출의 부가 정보다

상품 ID·수량은 업무 메시지에 넣는다. 인증 토큰·trace context·호출 식별자는 metadata로 전달할 수 있다. Metadata는 HTTP/2 header로 구현되며, 클라이언트 요청과 서버 initial metadata, 서버 trailing metadata에 실린다. Metadata에 넣었다고 신뢰할 수 있는 값이 되는 것은 아니다. 서버는 인증과 입력 검증을 수행해야 한다.

Status code도 HTTP 응답 숫자를 그대로 쓰지 않는다. HTTP 연결이 정상적으로 처리되더라도 gRPC의 마지막 상태는 업무 오류일 수 있다. HTTP 상태만 집계하는 프록시 지표로 RPC 성공률을 판단하지 않는다. [8장](#chapter-8)은 상태별 대응을 다룬다.

### 확인 질문: channel이 READY면 주문도 성공하는가

Channel이 `READY`이고 서버가 TCP 연결을 유지한다. 재고 DB는 접근할 수 없는 상태다. `GetStock`의 성공을 기대할 수 있는가? 서버가 응답을 보내는 데 성공했다고 기록했는데 클라이언트는 timeout을 보고할 수 있는가?

<details markdown="1">
<summary>해설</summary>

READY는 통신에 사용할 연결 상태이지 모든 업무 의존성이 정상이라는 뜻이 아니다. Handler가 DB 오류로 실패할 수 있다. 서버가 성공 응답을 보냈더라도 클라이언트가 deadline 안에 받지 못하면 양쪽의 최종 판단이 달라질 수 있다. 연결 상태, RPC 상태, DB 처리 상태를 나누어 확인한다.

</details>

공식 원문: [Core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [Metadata](https://grpc.io/docs/guides/metadata/), [Performance best practices](https://grpc.io/docs/guides/performance/).

<a id="chapter-4"></a>
## 4장. 한 번의 호출에서 몇 개의 메시지를 주고받는가 | Streaming

Unary는 요청 한 개와 응답 한 개를 주고받는다. 재고의 현재 값을 묻는 `GetStock`에는 이 형태가 맞는다. 같은 상품의 변화를 계속 받으려면 한 요청에 여러 응답을 돌려주는 server streaming을 검토할 수 있다. 개수와 방향은 서비스 메서드에서 선언한다.

```proto
// 호출 형태를 비교하는 설명용 계약
service Inventory {
  rpc GetStock(StockRequest) returns (StockReply);
  rpc WatchStock(StockRequest) returns (stream StockReply);
  rpc UploadCounts(stream StockReply) returns (UploadSummary);
  rpc ExchangeCounts(stream StockReply) returns (stream StockReply);
}
```

| 호출 형태 | 클라이언트 → 서버 | 서버 → 클라이언트 | 가상 용도 |
|---|---|---|---|
| Unary | 1개 | 1개 | 재고 조회 |
| Server streaming | 1개 | 여러 개 | 재고 변경 구독 |
| Client streaming | 여러 개 | 1개 | 검수 결과 업로드 후 집계 |
| Bidirectional streaming | 여러 개 | 여러 개 | 양쪽이 독립적으로 검수 상태 교환 |

`UploadSummary` 등의 메시지는 비교를 위한 이름이다. 실행 가능한 전체 계약은 [5장](#chapter-5)에 따로 둔다.

### 순서는 한 RPC의 각 방향 안에서 보장된다

한 server stream에서 서버가 A, B, C를 보내면 클라이언트는 그 메시지를 같은 순서로 읽는다. Bidi에서는 클라이언트→서버 방향의 순서와 서버→클라이언트 방향의 순서가 각각 유지된다. 양방향에 하나의 전역 순서를 만들거나 '요청 하나당 응답 하나'를 강제하지 않는다.

서버는 요청 여러 개를 모아서 응답할 수 있고, 요청 하나에 응답 여러 개를 낼 수 있다. 두 메시지를 대응시켜야 한다면 업무 메시지에 ID를 넣고 애플리케이션 프로토콜을 정의한다. 서로 다른 RPC나 서로 다른 클라이언트의 메시지까지 하나의 순서로 보장하지 않는다.

![Unary·server streaming·client streaming·bidi는 메시지 개수와 방향이 다르다.](/assets/images/grpc-textbook/fig-02-streams.svg)

### 한 방향을 닫는 것과 전체 호출을 끝내는 것은 다르다

클라이언트가 요청 전송을 마치는 half-close는 '더 보낼 요청 메시지가 없다'는 뜻이다. 서버는 남은 요청을 처리하고 응답을 계속 보낼 수 있다. Bidi에서 클라이언트가 쓰기를 끝냈다는 이유만으로 응답 읽기도 중단하면 마지막 결과를 놓칠 수 있다.

호출 전체는 서버의 종료 status를 포함해 판단한다. 메시지 세 개를 받은 다음 네 번째 처리에서 오류가 나면 앞의 세 메시지를 자동으로 없애 주지 않는다. 결과를 임시로 쌓았다가 `OK`에서 확정할지, 메시지마다 독립적으로 반영할지는 업무 계약이다. 한 stream 전체의 원자성이 필요한지부터 정한다.

### Flow control은 수신 용량을 맞추는 통신 제어다

송신자가 수신자보다 빠르면 무한히 보내도록 둘 수 없다. gRPC는 underlying transport의 flow control을 사용해 보내는 속도를 조절한다. Write가 대기할 수 있으며, write API가 반환됐다고 메시지가 이미 네트워크로 나갔다는 뜻도 아니다. 프레임워크의 버퍼에 전달된 상태일 수 있다.

수신 측에서 메시지를 읽어 전송 용량이 열리는 것과, 그 내용을 DB에 반영한 것은 다르다. 'write가 성공했으니 재고 수정이 끝났다'는 판단은 불가능하다. 업무 완료 확인이 필요하면 응답 메시지에 반영 결과나 처리 위치를 명시하고 그 의미를 계약한다.

두 방향이 모두 많이 쓰면서 읽지 않으면 버퍼·flow-control 용량이 소진되어 서로 진척하지 못할 수 있다. 양쪽이 먼저 상대 메시지를 기다리는 프로토콜도 멈출 수 있다. 읽기와 쓰기의 진척을 독립적으로 관리하고, 애플리케이션 큐에도 용량 제한을 둔다. 수신한 모든 메시지를 무한 큐로 옮기면 통신 flow control만으로 프로세스 메모리를 지키기 어렵다.

### 끊어진 stream은 자동 replay 로그가 아니다

`WatchStock`을 다시 호출해도 마지막 수신 지점 다음부터 재개한다는 보장은 없다. 그런 기능을 원하면 sequence·resume token·보존 범위·중복 처리 규칙을 직접 설계한다. 전송 중 연결이 끊기면 일부 메시지의 수신·처리 여부가 불명확할 수 있다. 장기 보존과 독립적인 재처리가 필요하면 [Kafka](/wiki/kafka/)의 로그 모델과 비교한다.

### 확인 질문: 재접속하면 무엇부터 받는가

클라이언트는 재고 변경 1~10을 읽고 연결이 끊겼다. 10번을 DB에 반영했는지는 로그가 없다. 새 `WatchStock`을 호출하면 11번부터 정확히 한 번 읽을 수 있는가?

<details markdown="1">
<summary>해설</summary>

gRPC 자체에는 그 재개 계약이 없다. 서버가 현재 값부터 보낼 수도, 처음부터 보낼 수도 있다. Resume 위치를 합의하고 저장된 변경 이력에서 읽어야 한다. 위치 저장과 DB 반영 사이에 장애가 있으면 중복·누락 경계도 남으므로 반영과 위치를 원자적으로 기록하거나 메시지별 멱등 처리를 마련한다. 연결 복구와 업무 복구는 다르다.

</details>

공식 원문: [Core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [Flow control](https://grpc.io/docs/guides/flow-control/).

<a id="chapter-5"></a>
## 5장. 계약을 생성하고 직접 호출한다 | Python 예제

이 예제는 외부 DB 없이 고정된 재고 데이터를 조회한다. Unary·server streaming·`NOT_FOUND`·deadline·명시적 취소를 관찰하기 위한 로컬 실습이다. 재고 차감이나 멱등 쓰기를 구현한 운영 서버가 아니다. `127.0.0.1`에만 바인딩하고 TLS 없는 channel을 사용하므로, 외부에 노출하는 서비스의 보안 설정으로 사용하지 않는다.

### 환경과 코드 생성

Python 3.11이 있는 빈 작업 디렉터리에서 실행한다. 버전은 이 문서의 실행 검증 환경과 맞춘 것이다. 최신 버전이라는 전제가 아니라 재현 조건이며, 다른 runtime·generator 버전을 혼합하기 전에 호환 요구를 확인한다.

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install grpcio==1.84.0 grpcio-tools==1.84.0 protobuf==7.36.2
```

다음 내용을 `inventory.proto`로 저장한다. `delay_ms`는 deadline 관찰만을 위한 실습용 필드다.

```proto
syntax = "proto3";
package shop.inventory.v1;

service Inventory {
  rpc GetStock(StockRequest) returns (StockReply);
  rpc WatchStock(StockRequest) returns (stream StockReply);
}

message StockRequest {
  string product_id = 1;
  int32 delay_ms = 2;
}

message StockReply {
  string product_id = 1;
  int32 quantity = 2;
  int32 sequence = 3;
}
```

계약을 저장한 디렉터리에서 메시지 코드와 서비스 코드를 생성한다.

```sh
python -m grpc_tools.protoc -I. \
  --python_out=. --grpc_python_out=. inventory.proto
```

`inventory_pb2.py`는 메시지 클래스, `inventory_pb2_grpc.py`는 stub·servicer·서버 등록 함수를 제공한다. 생성 파일을 직접 고치는 대신 `.proto`를 바꾸고 다시 생성한다.

### 서버: handler를 구현하고 등록한다

다음 내용을 `server.py`로 저장한다. 지연 루프는 취소 여부를 확인한다. `time.sleep` 자체를 gRPC가 즉시 중단시키는 것은 아니므로 짧은 구간으로 나누어 확인한다.

```python
from concurrent import futures
import time
import grpc
import inventory_pb2 as pb
import inventory_pb2_grpc as api


class Inventory(api.InventoryServicer):
    def quantity(self, request, context):
        if not request.product_id:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "product_id required")
        if not 0 <= request.delay_ms <= 5000:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "invalid delay_ms")
        if request.product_id != "apple":
            context.abort(grpc.StatusCode.NOT_FOUND, "product not found")
        end = time.monotonic() + request.delay_ms / 1000
        while time.monotonic() < end:
            if not context.is_active():
                return None
            time.sleep(0.01)
        return 7

    def GetStock(self, request, context):
        quantity = self.quantity(request, context)
        if quantity is None:
            context.abort(grpc.StatusCode.CANCELLED, "call no longer active")
        return pb.StockReply(product_id=request.product_id, quantity=quantity)

    def WatchStock(self, request, context):
        quantity = self.quantity(request, context)
        if quantity is None:
            return
        for sequence in range(1, 4):
            if not context.is_active():
                return
            yield pb.StockReply(
                product_id=request.product_id,
                quantity=quantity,
                sequence=sequence,
            )
            time.sleep(0.1)


def start(address="127.0.0.1:50051"):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    api.add_InventoryServicer_to_server(Inventory(), server)
    port = server.add_insecure_port(address)
    if not port:
        raise RuntimeError("could not bind server")
    server.start()
    return server, port


if __name__ == "__main__":
    server, _ = start()
    print("listening on 127.0.0.1:50051", flush=True)
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(1).wait()
```

`context.abort`는 실패 status와 설명으로 RPC를 중단한다. 서버가 `None`을 정상 응답처럼 반환해 직렬화 오류로 만들지 않고, 업무 오류를 명시한다. Stream은 generator가 메시지를 차례로 생성한다. 이 실습의 세 응답은 실제 재고 변경이 아니라 고정 수량과 증가하는 sequence다.

### 클라이언트: 성공·실패·취소를 구분한다

다음 내용을 `client.py`로 저장한다. 첫 터미널에서 `python server.py`, 다른 터미널에서 `python client.py`를 실행한다.

```python
import grpc
import inventory_pb2 as pb
import inventory_pb2_grpc as api


with grpc.insecure_channel("127.0.0.1:50051") as channel:
    grpc.channel_ready_future(channel).result(timeout=3)
    stub = api.InventoryStub(channel)

    reply = stub.GetStock(pb.StockRequest(product_id="apple"), timeout=1)
    print("unary:", reply.product_id, reply.quantity)

    for reply in stub.WatchStock(pb.StockRequest(product_id="apple"), timeout=2):
        print("stream:", reply.sequence, reply.quantity)

    try:
        stub.GetStock(pb.StockRequest(product_id="missing"), timeout=1)
    except grpc.RpcError as error:
        print("missing:", error.code().name)

    try:
        stub.GetStock(pb.StockRequest(product_id="apple", delay_ms=200), timeout=0.05)
    except grpc.RpcError as error:
        print("slow:", error.code().name)

    call = stub.WatchStock(pb.StockRequest(product_id="apple"), timeout=2)
    print("first:", next(call).sequence)
    call.cancel()
    try:
        next(call)
    except grpc.RpcError as error:
        print("cancelled:", error.code().name)
```

정상 실행의 예상 출력은 다음과 같다. `channel_ready_future`의 timeout은 연결 준비를 기다리는 제한이다. 개별 RPC의 timeout을 대신하지 않는다.

```text
unary: apple 7
stream: 1 7
stream: 2 7
stream: 3 7
missing: NOT_FOUND
slow: DEADLINE_EXCEEDED
first: 1
cancelled: CANCELLED
```

### 조건을 바꾸어 관찰한다

서버를 끄고 호출하면 연결 준비 대기부터 실패할 수 있다. 준비 확인을 생략하고 stub을 직접 호출하면 RPC의 연결 오류를 보게 된다. `delay_ms`를 크게 하고 timeout을 작게 하면 클라이언트가 기다리기를 끝낸다. Handler가 이후 취소를 확인해 멈추는 시점은 클라이언트가 오류를 받은 시점과 완전히 같지 않을 수 있다.

`WatchStock` 반복문을 도중에 그만 읽는 코드에서는 call을 명시적으로 취소하고 자원을 정리한다. 'for문에서 나왔다'만으로 모든 언어·runtime에서 서버가 즉시 멈춘다고 가정하지 않는다. 실제 변경 구독 서비스라면 cancellation 시 구독 해제·파일 정리·하위 호출 종료도 구현해야 한다.

### 확인 질문: timeout을 지우면

서버가 응답을 끝내지 않는 결함을 만들었다. 클라이언트의 `timeout`을 지우면 성공할 가능성이 높아지는가? 반대로 timeout을 매우 짧게 두면 서버 DB의 실패까지 확정할 수 있는가?

<details markdown="1">
<summary>해설</summary>

Deadline이 없다면 응답을 사실상 무한히 기다릴 수 있다. 결함을 해결하지 않고 호출자의 자원을 더 오래 점유하게 한다. 매우 짧은 deadline은 클라이언트의 대기를 줄일 뿐 서버 업무의 rollback을 보장하지 않는다. 필요한 지연 예산을 부하 테스트로 정하고 서버의 취소 대응과 쓰기 결과 조회를 별도로 설계한다.

</details>

공식 원문: [Python quick start](https://grpc.io/docs/languages/python/quickstart/), [Python basics](https://grpc.io/docs/languages/python/basics/), [Deadlines](https://grpc.io/docs/guides/deadlines/), [Cancellation](https://grpc.io/docs/guides/cancellation/).


<a id="chapter-6"></a>
## 6장. 얼마나 기다리고 언제 포기하는가 | Deadline

주문 서비스가 재고 서버에 요청을 보내고 끝없이 기다리면, 재고 장애가 주문 서비스의 스레드·메모리·연결까지 점유한다. Deadline은 호출자가 결과를 기다릴 마지막 시점이다. Timeout은 허용하는 기간이다. Python의 `timeout=1`처럼 기간을 받는 API는 호출 시작을 기준으로 deadline을 만든다.

### 시간 예산은 응답을 받기까지의 경로에 쓴다

기본적으로 gRPC는 deadline을 정하지 않는다. 응답을 사실상 영원히 기다릴 수 있으므로, 호출자는 현실적인 제한을 명시해야 한다. 기간은 네트워크 지연·서버 처리 시간·부하 상황을 바탕으로 정하고 테스트로 검증한다. 무조건 짧으면 좋은 값이 아니다. 정상 처리도 계속 취소되면 재시도 부하와 오류가 늘어난다.

주문 요청에 허용한 전체 예산이 1초라고 하자. 주문 서버가 입력 검증에 200ms를 썼다면 재고 요청과 응답 정리에 쓸 수 있는 시간은 더 적다. 각 하위 RPC에 매번 새 1초를 주면, 최초 요청은 끝났는데 하위 서비스는 계속 처리할 수 있다. 각 단계의 개별 제한과 최초 요청의 남은 예산을 함께 적용한다.

![하위 호출은 이미 사용한 시간을 제외한 남은 예산 안에서 수행한다.](/assets/images/grpc-textbook/fig-03-deadline.svg)

Deadline 전파는 일부 구현에서 지원하며 Java·Go는 기본 전파, C++는 명시적으로 활성화하는 경우가 있다. Python에 같은 기본 동작을 가정하지 않는다. 자동 전파가 없는 코드에서는 incoming context의 남은 시간을 읽고 outgoing call에 제한을 전달한다. 다음은 하위 stub이 있다고 가정한 설계용 Python 코드다. 5장의 서버에 포함된 구현은 아니다.

```python
remaining = context.time_remaining()
# 하위 호출은 최대 0.3초, 전체 요청에 남은 시간보다 길게 기다리지 않는다.
budget = 0.3 if remaining is None else min(0.3, remaining)
if budget <= 0:
    context.abort(grpc.StatusCode.DEADLINE_EXCEEDED, "no time budget")
reply = downstream.GetStock(request, timeout=budget)
```

이 코드만으로 하위 호출의 취소 전파나 DB timeout까지 설정되는 것은 아니다. 하위 오류 처리와 응답 정리에 필요한 여유도 고려해야 한다. `time_remaining()`을 읽은 뒤에도 시간이 흐르므로, 경계에 딱 맞춘 값보다 처리·정리에 남길 시간을 설계하는 편이 낫다.

전파되는 deadline은 서로 다른 서버의 시계가 정확히 같다는 가정에 의존하지 않도록, 이미 경과한 시간을 제외한 timeout으로 변환된다. 업무 메시지에 절대 시각 문자열을 복사하는 것과 gRPC의 deadline 전파는 같지 않다.

### DEADLINE_EXCEEDED는 업무 미실행의 증거가 아니다

재고 서비스가 DB 커밋을 끝냈고 응답 전송 전에 deadline이 지났다고 하자. 호출자는 `DEADLINE_EXCEEDED`를 받지만 재고는 이미 차감됐다. 공식 status 문서는 상태 변경 작업이 성공해도 이 오류가 반환될 수 있다고 명시한다.

시간 초과를 받았다고 재고를 다시 차감하거나 '실패했으니 아무 일도 없었다'고 처리하면 업무가 틀어질 수 있다. 쓰기 요청에는 요청 ID를 기준으로 결과를 조회하거나 같은 ID의 재호출을 안전하게 처리하는 계약이 필요하다. [9장](#chapter-9)의 멱등성이 이 불확실성을 다룬다.

### 서버는 대기 종료와 실제 작업 중단을 연결해야 한다

Deadline이 지나면 gRPC는 서버 측 RPC를 취소한다. 하지만 handler가 별도 스레드·하위 API·DB 쿼리를 시작했다면 애플리케이션이 그것을 중단하거나 정리해야 한다. gRPC의 취소 신호가 이미 커밋된 변경을 rollback하지는 않는다.

쓰기 전에 남은 시간을 확인하면 불필요한 작업을 줄일 수 있지만, 확인 직후 deadline이 지날 수 있으므로 커밋 성공 여부의 원자적 판정이 되지는 않는다. DB 쿼리 timeout과 RPC deadline은 각각 설정하고, 커밋 경계 뒤의 응답 실패를 포함해 설계한다.

### 확인 질문: 하위 서비스에 새 timeout을 주면

사용자는 1초 후 대기를 끝냈다. 주문 서버는 900ms를 쓴 뒤 결제 서버에 새 1초 timeout으로 호출한다. 어떤 낭비가 생길 수 있는가? 남은 100ms를 전달하면 결제 실패까지 확정되는가?

<details markdown="1">
<summary>해설</summary>

최초 호출이 끝난 뒤에도 결제 서버가 일을 계속할 수 있다. 남은 예산을 전달하면 하위 대기·작업 시간을 제한하는 데 도움이 된다. 다만 결제 서버가 제한 안에 커밋했거나 취소를 늦게 관찰했을 수 있으므로 timeout만으로 결제 미반영을 확정할 수 없다. 업무 결과와 취소 정리를 별도로 다룬다.

</details>

공식 원문: [Deadlines](https://grpc.io/docs/guides/deadlines/), [Status codes](https://grpc.io/docs/guides/status-codes/).

<a id="chapter-7"></a>
## 7장. 호출을 취소하면 무엇이 멈추는가 | Cancellation

사용자가 화면을 닫으면 더 이상 재고 변경 stream을 읽을 이유가 없어진다. 호출자는 cancel API로 결과에 대한 관심이 끝났음을 알릴 수 있다. Deadline 만료와 I/O 오류도 취소를 유발한다. 서버는 진행 중인 계산과 구독을 종료하고 호출이 소유하던 자원을 정리해야 한다.

### 취소 신호와 handler의 실행은 동시에 끝나지 않을 수 있다

일반적으로 gRPC는 애플리케이션 handler를 임의의 지점에서 강제로 끊는 수단을 제공하지 않는다. Handler가 긴 계산을 하고 있다면 취소를 확인하도록 협력해야 한다. 5장의 Python 예제는 `context.is_active()`를 반복해서 확인한다.

취소 확인 사이의 작업이 오래 걸리면 그만큼 늦게 멈춘다. 파일 읽기를 10초씩 수행하는 코드가 파일 읽기 뒤에만 취소를 확인하면, 호출자가 취소해도 그 읽기가 먼저 끝나야 할 수 있다. 사용하는 I/O API의 timeout·취소 기능을 함께 고려한다. `is_active()` 한 번으로 이후 모든 작업의 유효성이 보장되지 않는다.

구독 handler에는 `try/finally` 같은 자원 정리 경로를 마련한다. 메시지 큐 구독 해제, 열린 파일 닫기, 등록한 listener 제거를 성공·오류·취소 경로에서 모두 수행한다. Generator가 메시지를 더 만들지 않는 것과 외부 구독이 해제되는 것은 다르다.

### 하위 호출에도 원래 요청의 수명이 전달되어야 한다

주문 서버가 결제 서버를 기다리는 동안 최초 호출이 취소되었다. 하위 결제 호출이 계속 진행하면 원래 요청이 소유한 일이 남는다. 일부 언어는 outgoing RPC 취소를 자동으로 연결하지만, 다른 구현에서는 개발자가 call 객체나 context를 통해 전파해야 한다. 공식 가이드의 언어별 예제를 확인한다.

전파할 수 있는 일과 이미 확정된 업무도 구분한다. 아직 실행되지 않은 조회를 취소하는 것과 완료한 결제를 되돌리는 것은 다르다. 결제 취소는 새로운 업무 작업이며, RPC 취소 신호와 동일하지 않다. 취소 여부만 보고 보상 작업을 수행하면 정상 결제를 중복 취소할 수도 있다.

### Cancellation은 DB transaction이 아니다

다음 순서에서 3번의 cancel은 2번을 없애지 않는다.

```text
1. ReserveStock 요청을 받는다.
2. 재고 예약 DB transaction을 commit한다.
3. 클라이언트가 RPC를 cancel한다.
4. 서버가 취소를 관찰하고 응답 전송을 종료한다.
```

설계상 판단이 필요한 곳은 '호출자가 사라진 뒤 업무를 완료할 것인가'다. 읽기·계산은 중단하는 편이 자원을 아낄 수 있다. 반면 이미 접수한 장기 업무는 지속 가능한 작업 상태로 관리하고 조회 API를 제공할 수 있다. 둘 중 하나를 gRPC가 자동으로 선택하지 않는다.

### 취소 이유를 비즈니스 메시지처럼 쓰지 않는다

클라이언트가 자신의 cancel 로그에 이유를 붙일 수 있는 API가 있어도, 그것이 서버에 동일한 업무 사유로 전달된다고 가정하지 않는다. 고객이 주문을 취소했다는 사실은 `CancelOrder` 같은 인증·인가된 업무 요청으로 표현해야 한다. 통신 취소와 업무 취소의 감사 기록도 분리한다.

### 확인 질문: 작업 정리는 누가 맡는가

Handler가 외부 구독을 등록한 뒤 별도 worker가 메시지를 생성한다. 클라이언트가 stream을 취소했다. Handler가 종료되면 worker와 구독도 자동으로 없어지는가?

<details markdown="1">
<summary>해설</summary>

자동 정리를 가정할 수 없다. 애플리케이션이 구독·worker의 소유권을 정하고 취소 신호를 전달하거나 종료·join해야 한다. Handler의 종료 경로에서 자원을 해제하고, 취소 후 active worker·구독 수가 줄어드는지 테스트한다. 이미 외부 시스템에 반영한 업무 변경은 이 정리로 rollback되지 않는다.

</details>

공식 원문: [Cancellation](https://grpc.io/docs/guides/cancellation/), [Core concepts — RPC termination](https://grpc.io/docs/what-is-grpc/core-concepts/).

<a id="chapter-8"></a>
## 8장. 응답의 실패를 어떻게 해석하는가 | Status·Metadata·Trailers

클라이언트는 status code와 오류 설명으로 호출 결과를 받는다. Status는 서버 업무 코드가 정할 수도 있고 client·server 런타임이 통신 오류에서 만들 수도 있다. 오류 설명 문자열을 파싱해 분기하기보다 상태 코드와 명시적인 오류 계약을 사용한다. 설명에는 내부 정보나 비밀을 넣지 않는다.

### 같은 '실패'라도 다음 행동은 다르다

| Status | 의미와 대응의 기준 |
|---|---|
| `OK` | 호출 성공. 업무 완료의 범위는 메서드 계약에 따른다 |
| `INVALID_ARGUMENT` | 시스템 상태와 무관하게 인자가 잘못됨. 같은 인자를 반복하지 않는다 |
| `NOT_FOUND` | 요청한 대상이 없음. ID와 대상의 존재를 확인한다 |
| `ALREADY_EXISTS` | 생성하려는 대상이 이미 존재함 |
| `UNAUTHENTICATED` | 유효한 인증 정보가 없음 |
| `PERMISSION_DENIED` | 식별된 호출자에게 권한이 없음 |
| `RESOURCE_EXHAUSTED` | quota·용량 등 자원이 부족함. 원인과 정책에 따라 대응한다 |
| `FAILED_PRECONDITION` | 현재 상태에서 작업 불가. 상태를 바꾸기 전 같은 요청을 반복하지 않는다 |
| `ABORTED` | 동시성 충돌 등으로 작업 중단. 상위 read-modify-write 절차 재시도가 필요할 수 있다 |
| `UNAVAILABLE` | 일시적 서비스 이용 불가일 수 있음. 비멱등 쓰기의 재시도 안전성을 따로 확인한다 |
| `DEADLINE_EXCEEDED` | 대기 시간이 끝남. 서버 변경이 성공했을 가능성도 있다 |
| `CANCELLED` | 호출이 취소됨. 변경의 rollback을 뜻하지 않는다 |
| `UNIMPLEMENTED` | 메서드 또는 기능을 구현·지원하지 않음 |
| `INTERNAL`, `UNKNOWN` | 내부 오류나 충분히 분류되지 않은 오류. 근거 없이 재시도 정책에 묶지 않는다 |
| `OUT_OF_RANGE`, `DATA_LOSS` | 유효 범위 밖의 작업, 복구할 수 없는 손실·손상 등. 상세 원인을 확인한다 |

공식 문서는 `UNAVAILABLE`·`ABORTED`·`FAILED_PRECONDITION`을 구분한다. 실패한 호출 자체를 다시 하면 회복 가능한 경우, 더 높은 수준의 전체 절차를 다시 해야 하는 경우, 시스템 상태를 명시적으로 고쳐야 하는 경우가 다르다.

예를 들어 재고 예약의 낙관적 버전 검사가 충돌했다면 `ABORTED` 뒤에 재고를 다시 읽고 판단해야 할 수 있다. 재고가 판매 중지 상태라면 같은 요청을 반복해도 해결되지 않아 `FAILED_PRECONDITION`이 더 적절할 수 있다. 이는 가상 API의 오류 설계이며 실제 서비스의 계약에 맞게 정한다.

### Status만으로 실행 위치를 확정하지 않는다

`UNAVAILABLE`은 '요청이 서버에 도착하지 않았다'만을 뜻하지 않는다. 응답 경로가 끊긴 경우에도 업무가 반영됐을 수 있다. `DEADLINE_EXCEEDED`도 같은 불확실성이 남는다. 클라이언트가 받은 status는 클라이언트의 관측이며, 서버 로그와 요청 ID 기반 업무 결과를 함께 봐야 한다.

공식 문서에서 `INVALID_ARGUMENT`, `NOT_FOUND`, `ALREADY_EXISTS`, `FAILED_PRECONDITION`, `ABORTED`, `OUT_OF_RANGE`, `DATA_LOSS`는 라이브러리가 자동 생성하지 않고 사용자 코드가 반환하는 상태로 구분한다. 그렇다고 다른 상태가 항상 런타임에서만 만들어지는 것은 아니다. 서버 업무 코드도 `UNAVAILABLE` 등을 반환할 수 있다.

### Metadata의 규칙과 신뢰 경계

Metadata key는 ASCII이고 대소문자를 구분하지 않으며, `grpc-` 접두사는 내부 용도로 예약되어 있다. 바이너리 값에는 `-bin` suffix를 사용한다. API가 binary metadata를 처리하는 방식은 언어별로 확인한다. 큰 업무 payload를 metadata에 넣지 않는다. 서버가 request header 크기를 제한할 수 있고, 공식 문서는 8KiB 제한을 제안값으로 언급한다. 모든 서버의 고정 한도라는 뜻은 아니다.

`authorization`, trace context, 요청 ID를 전달할 수 있다. 클라이언트가 `tenant-id`를 보냈다는 이유만으로 해당 테넌트의 데이터 접근을 허용하면 안 된다. 인증한 주체와 허용된 테넌트·대상 자원을 검증한다. Metadata도 입력값이며 로그에 그대로 남기면 토큰과 개인정보가 노출될 수 있다.

Initial metadata는 메시지 앞에, trailing metadata는 서버가 RPC를 닫을 때 보낸다. Trailer는 최종 outcome과 부가 정보를 전달하는 데 쓰인다. Stream에서 앞 메시지들을 반영한 뒤 trailer가 실패로 끝나는 경우의 정책을 정해야 한다. 오류가 난 stream 전체를 다시 실행하면 이미 처리한 메시지가 반복될 수 있다.

### 확인 질문: 버전 충돌이면 같은 요청을 보내면 되는가

클라이언트는 재고 버전 4를 읽었지만 서버는 이미 버전 5다. 조건부 변경이 `ABORTED`로 끝났다. 버전 4 요청을 그대로 계속 보내면 되는가? 인증이 만료된 오류와 같은 backoff 정책으로 처리해도 되는가?

<details markdown="1">
<summary>해설</summary>

버전을 다시 읽고 변경을 다시 판단하는 상위 절차가 필요할 수 있다. 같은 낡은 조건은 계속 충돌한다. 인증 만료는 자격 증명 갱신 등 다른 대응이 필요하다. Status를 모두 '일시 장애'로 묶으면 회복되지 않는 호출을 반복하며 부하만 늘린다. 메서드의 업무 조건과 오류 계약에 맞춰 분기한다.

</details>

공식 원문: [Status codes](https://grpc.io/docs/guides/status-codes/), [Metadata](https://grpc.io/docs/guides/metadata/).

<a id="chapter-9"></a>
## 9장. 같은 호출을 다시 해도 되는가 | Retry·멱등성

재시도는 실패한 호출을 새로운 attempt로 바꾸어 호출 이력을 재생하는 동작이다. 호출자는 한 번 호출했다고 생각해도 서버에는 여러 attempt가 도착할 수 있다. '재시도가 지원된다'와 '재시도해도 업무가 한 번만 반영된다'는 별개의 조건이다.

### Transparent retry와 설정된 retry policy

gRPC는 retry policy가 없어도 일부 낮은 수준의 실패를 transparent retry로 처리할 수 있다. 공식 가이드는 RPC가 client를 벗어나지 않은 경우와, server library에는 도달했지만 server application logic이 보지 않은 경우를 구분한다. 후자는 한 번의 transparent retry가 가능하다. '기본적으로 모든 UNAVAILABLE을 무조건 재시도한다'는 뜻은 아니다.

더 넓은 재시도에는 서비스·메서드별 retry policy를 설정한다. 허용 status, 최대 attempt 수, initial·max backoff, multiplier를 지정한다. Backoff에는 jitter가 적용되어 많은 클라이언트가 같은 시각에 재요청하는 현상을 줄인다. Throttling과 server pushback도 원문에서 확인할 수 있다. 언어·runtime의 지원 범위를 점검한다.

다음은 `GetStock` 조회에만 적용하는 service config 예시다. 운영 권장값이 아니라 설정 구조를 설명한다. Python에서는 JSON을 channel option으로 넘길 수 있으며 [11장](#chapter-11)의 방식과 연결된다.

```json
{
  "methodConfig": [{
    "name": [{"service": "shop.inventory.v1.Inventory", "method": "GetStock"}],
    "retryPolicy": {
      "maxAttempts": 3,
      "initialBackoff": "0.1s",
      "maxBackoff": "1s",
      "backoffMultiplier": 2,
      "retryableStatusCodes": ["UNAVAILABLE"]
    }
  }]
}
```

`maxAttempts`는 최초 attempt를 포함한다. Deadline 안에서 attempt와 backoff가 진행되므로 최대 횟수를 설정해도 항상 그 횟수만큼 실행하지 않는다. 서버가 느린 상황에서 deadline을 늘리고 횟수도 늘리면, 같은 논리 호출이 더 많은 서버 자원을 쓸 수 있다.

### Retry의 commit은 DB commit이 아니다

응답 header를 받으면 RPC는 retry 관점에서 committed 상태가 되어 추가 built-in retry를 하지 않는다. 이때의 commit은 서버 DB의 commit과 다른 용어다. 재시도 이력을 저장할 버퍼 제한을 넘는 경우도 retry 동작을 제한할 수 있으므로 구현과 설정을 확인한다.

따라서 오래된 stream이 중간에 끊겼을 때 retry policy만으로 전체 메시지를 자동 복구한다고 가정하지 않는다. 호출자가 이미 메시지를 처리했다면 재연결·resume·deduplication을 별도로 설계해야 한다. Built-in retry가 하지 않는 재시도를 애플리케이션이 수행할 수도 있으므로 전체 계층을 함께 검사한다.

### Wait-for-ready는 서버 준비 대기다

Channel이 `TRANSIENT_FAILURE`인 시점에 새 RPC를 만들면, 기본 동작은 준비되지 않은 연결 때문에 실패할 수 있다. `wait_for_ready=True`는 연결이 준비될 때까지 호출을 대기시킨다. `IDLE`·`CONNECTING` 상태에서의 정상적인 연결 대기까지 '기본이면 즉시 실패'라고 설명하면 틀린다.

Wait-for-ready에도 deadline은 적용된다. 서버가 복구하지 않으면 대기하다 시간이 끝나며 다른 종류의 실패도 여전히 발생할 수 있다. 이미 서버가 처리한 업무를 되돌리거나 deduplicate하는 기능이 아니다. 배치처럼 잠깐 연결 복구를 기다려도 되는 작업과, 사용자가 빠른 오류를 원하는 화면 요청을 구분한다.

```python
# 5장의 stub에서 사용하는 호출 옵션 예시
reply = stub.GetStock(
    pb.StockRequest(product_id="apple"),
    timeout=1,
    wait_for_ready=True,
)
```

### 쓰기 재시도의 안전성은 서버의 멱등 계약에서 나온다

가상의 `ReserveStock` 요청에 `request_id`, 상품·수량·주체를 넣는다. 서버가 같은 업무 ID의 재요청을 기존 결과로 처리하면 중복 차감을 막을 수 있다. 단순히 메모리 set에 ID를 추가하는 것으로는 서버 재시작·여러 인스턴스·동시 요청을 다루지 못한다.

DB로 구현한다면 업무 변경과 중복 방지 기록을 같은 transaction에 두는 방식을 검토한다. ID의 unique constraint와 충돌 처리가 동시 요청을 직렬화하는 데 필요하다. 동일 ID지만 payload가 다르면 기존 결과를 재사용하지 않고 충돌로 거절해야 한다. ID를 tenant·사용자 등 적절한 경계 안에서 해석하고, 인증되지 않은 호출자가 다른 사용자의 결과를 조회하지 못하게 한다.

```text
transaction 시작
  요청 ID를 해당 업무 범위의 unique key로 확보
  이미 완료됐으면 payload 일치 확인 후 기존 결과 사용
  최초 요청이면 재고 변경과 결과 기록
transaction commit
응답 반환
```

이는 설계 흐름이지 모든 DB에서 그대로 실행하는 SQL은 아니다. 진행 중인 중복 요청의 대기·실패·재조회 정책도 필요하다. 중복 기록 TTL이 지나면 오래된 요청은 다시 실행될 수 있으므로 retry 가능 기간과 보존 정책을 맞춘다. 외부 결제·메일 발송이 같은 DB transaction 밖에 있다면 그 효과까지 자동으로 원자적이지 않다. 외부 시스템의 멱등 키나 [분산 트랜잭션](/wiki/distributed-transaction/)의 복구 설계를 함께 검토한다.

### 확인 질문: 3회 재시도를 켜면 3번 차감되는가

재고 예약 DB 커밋 직후 서버 연결이 끊겼다. `UNAVAILABLE` retry policy로 재호출한다. 요청 ID를 바꾸는 경우, 같은 ID지만 중복 기록을 커밋 전에 따로 저장하는 경우에는 어떤 문제가 생길 수 있는가?

<details markdown="1">
<summary>해설</summary>

매번 ID를 바꾸면 같은 업무의 재시도인지 구분하지 못해 중복 차감될 수 있다. 기록과 차감을 따로 확정하면 기록만 남고 차감하지 않은 상태, 차감했지만 기록이 없는 상태가 발생할 수 있다. 같은 업무 ID를 유지하고 변경·결과 기록의 원자성과 동시 충돌 처리를 설계한다. Retry policy 자체는 exactly-once 업무 실행을 만들지 않는다.

</details>

공식 원문: [Retry](https://grpc.io/docs/guides/retry/), [Wait-for-ready](https://grpc.io/docs/guides/wait-for-ready/), [Service config](https://grpc.io/docs/guides/service-config/). DB 멱등 처리 흐름은 이 교과서의 설계 예시이며 gRPC의 자동 보장이 아니다.

<a id="chapter-10"></a>
## 10장. 누구의 호출이며 무엇을 허용하는가 | 보안·Interceptor

5장의 insecure channel은 localhost 실습을 위한 선택이다. 서비스 사이의 통신이라도 신뢰할 수 있는 주체와 데이터의 경계를 정해야 한다. 내부망이라는 이름만으로 토큰 탈취·잘못된 서비스 호출·테넌트 혼선을 막을 수 없다.

### 암호화·인증·인가는 서로 다른 검사다

TLS는 통신 데이터를 암호화하고 서버 인증서를 검증하는 데 사용한다. mTLS는 서버가 클라이언트 인증서도 검증하도록 구성한다. 인증(authentication)은 누가 호출하는지 식별하고, 인가(authorization)는 그 주체가 해당 메서드·자원을 사용할 수 있는지 판단한다.

클라이언트가 인증서를 제시했다고 모든 테넌트의 재고를 읽을 권한이 생기는 것은 아니다. `authorization` token을 검증할 때도 서명·발급자·대상 audience·만료 등 서비스의 인증 계약을 확인하고, 식별된 주체의 권한과 요청 자원을 대조한다. 토큰 문자열이 존재한다는 사실만 검사하면 인증이 아니다.

Channel credentials는 연결의 TLS 등 통신 보안을 설정하고, call credentials는 호출 metadata에 인증 정보를 붙일 수 있다. 두 종류를 결합해 사용할 수 있다. 대부분의 언어 구현은 call credentials를 암호화되지 않은 channel로 보내지 못하도록 제한하지만, 임의 metadata에 직접 넣는 모든 코드를 대신 보호해 주는 것은 아니다. 비밀은 암호화된 경로와 올바른 대상에만 보낸다.

다음은 Python TLS channel의 구성 예시다. 실제 CA 파일·서버 인증서·호스트명 설정이 필요하므로 5장의 insecure 서버와 바로 연결되는 예제가 아니다.

```python
from pathlib import Path

roots = Path("trusted-ca.pem").read_bytes()
credentials = grpc.ssl_channel_credentials(root_certificates=roots)
channel = grpc.secure_channel("inventory.example.com:443", credentials)
```

검증 오류가 났다고 host name 검증을 무력화하는 옵션으로 덮지 않는다. 인증서 대상 이름·유효기간·신뢰 체인·서버 설정을 확인한다. Google OAuth token도 임의의 사설 서비스에 보내지 않는다. 공식 가이드는 잘못된 대상에 보낸 token이 탈취·악용될 수 있음을 경고한다.

### Interceptor는 호출 단위의 공통 로직이다

Interceptor는 middleware·filter와 비슷하게 많은 RPC에 적용할 공통 처리를 제공한다. Metadata, 로깅, 지표, server-side 인증·인가, fault injection 등에 사용할 수 있다. Client interceptor와 server interceptor의 API는 다르며 언어마다 구현 방식도 다르다.

Interceptor는 per-call 확장점이다. TCP port 설정·TLS 연결 구성 자체를 담당하지 않는다. Client-side 인증 정보를 붙이는 데는 call credentials API가 더 적합할 수 있다. 공통 로직을 한 곳에 두더라도 메서드와 자원의 업무 권한을 실제로 검사해야 한다.

순서도 결과를 바꾼다. Cache interceptor가 먼저 결과를 반환하면 network 쪽 로깅 interceptor는 cache hit를 보지 못할 수 있다. 반대로 application 쪽 로그는 cache hit도 호출로 기록할 수 있다. '요청 수'가 업무 호출 수인지 network attempt 수인지 정하고 순서를 맞춘다.

Streaming interceptor는 handler 반환만 계측하고 끝내면 전체 stream의 완료·오류·취소를 놓칠 수 있다. Message iterator·callback·call completion을 언어 API에 맞춰 다뤄야 한다. 인증 결과와 tenant context를 다른 동시 호출과 공유해 섞지 않는다.

### 로그와 운영 도구도 보안 경계 안에 둔다

요청·응답 본문과 metadata를 통째로 로그에 남기지 않는다. Token·개인정보는 제외·마스킹하고, 업무 ID·method·status·duration 등 필요한 값만 남긴다. Reflection은 서비스 schema를 제공하는 디버깅 기능이며 인증·인가를 대신하지 않는다. 외부 노출 여부와 도구 접근 권한을 정한다.

### 확인 질문: mTLS 뒤에 tenant-id만 보면 되는가

허용된 주문 서비스가 mTLS로 연결하고 metadata에 `tenant-id=B`를 넣었다. 호출자 인증에 성공했으므로 B의 모든 재고를 반환해도 되는가?

<details markdown="1">
<summary>해설</summary>

mTLS는 연결 주체의 인증을 다루며 요청한 테넌트·자원에 대한 권한을 자동으로 만들지 않는다. 인증 주체가 B에 접근 가능한지 확인해야 한다. Client-provided metadata를 신뢰 근거로 그대로 쓰지 않고 인증 결과와 권한 정책에 대조한다. Proxy가 인증을 종료한다면 backend까지 어떤 신뢰 정보를 전달하는지도 명시한다.

</details>

공식 원문: [Authentication](https://grpc.io/docs/guides/auth/), [Interceptors](https://grpc.io/docs/guides/interceptors/), [Metadata](https://grpc.io/docs/guides/metadata/).


<a id="chapter-11"></a>
## 11장. 어떤 서버로 호출을 보내는가 | Name Resolution·Load Balancing

재고 서버를 세 대로 늘렸다고 모든 호출이 자동으로 세 대에 고르게 나뉘는 것은 아니다. 클라이언트가 어느 주소를 알고, 어떤 연결을 열며, 각 RPC에 어떤 backend를 선택하는지 확인해야 한다. 한 번 선택한 서버에 장기 stream이 남는다는 점도 부하에 영향을 준다.

### 이름·주소·연결·선택을 나누어 본다

Name resolver는 `dns:///inventory.example.com:443` 같은 target 이름을 주소 목록으로 해석하고 service config를 제공할 수 있다. Load-balancing policy는 그 주소의 subchannel을 관리하고 새 RPC에 사용할 연결을 고르는 picker를 제공한다. Subchannel은 특정 서버와의 물리 연결을 나타내는 단위다.

Channel target이 하나의 VIP만 가리키면 클라이언트가 실제 서버 세 대를 직접 알고 있는 것과 다르다. 어떤 LB 정책을 지정해도 resolver가 알려 주지 않은 backend 주소를 임의로 찾아내는 것은 아니다. DNS·xDS·proxy가 각각 어떤 endpoint를 제공하는지 확인한다.

기본 `pick_first`는 resolver의 주소들을 시도하고 연결할 수 있는 첫 대상을 사용한다. 이름과 달리 모든 호출을 round-robin 분배하지 않는다. `round_robin`은 알려진 주소들에 연결하고 연결된 backend를 돌아가며 새 RPC를 보낸다. 지원하는 정책과 resolver API는 언어마다 다르다.

![Resolver가 주소를 제공하고 picker가 새 RPC의 backend를 선택한다. 시작한 stream은 자동 이동하지 않는다.](/assets/images/grpc-textbook/fig-04-routing.svg)

### Service config는 target별 client 동작을 정한다

Service config는 특정 target에 대한 client-side 설정이다. Load balancing, call timeout, wait-for-ready, retry·hedging, health checking 등을 제어할 수 있다. 모든 channel의 글로벌 설정이나 서버의 업무 구현을 바꾸는 파일은 아니다.

Resolver가 제공하거나 애플리케이션에서 기본 JSON을 지정할 수 있다. 예를 들어 Go의 DNS resolver는 TXT record를 통한 config를 지원하지만 이를 모든 언어의 DNS 기본 동작으로 일반화하지 않는다. xDS control plane을 사용하면 받은 설정을 client의 service config로 변환하는 경로도 있다. 본문은 xDS 배포 실습을 다루지 않는다.

Python의 설정 구조 예시는 다음과 같다. 실제 DNS가 여러 backend를 제공한다는 조건에서 새 RPC 분산을 관찰할 수 있다. 이 hostname은 설명용이며 그대로 실행하는 주소가 아니다.

```python
import json

config = {
    "loadBalancingConfig": [{"round_robin": {}}],
    "methodConfig": [{"name": [{}], "timeout": "1s"}],
}
channel = grpc.insecure_channel(
    "dns:///inventory.example.com:50051",
    options=[("grpc.service_config", json.dumps(config))],
)
```

여기의 insecure 옵션은 설정 형태 설명용이다. 운영 연결에서는 [10장](#chapter-10)의 TLS 구성을 사용한다. Config가 파싱된 것, 해당 runtime이 정책을 지원하는 것, 실제 endpoint가 여러 개 제공된 것, 트래픽이 분배된 것은 각각 검증해야 한다.

### L4와 L7의 분산 단위가 다르다

설계상 추론으로, TCP 연결 단위로 분산하는 L4 LB 뒤에 재사용되는 HTTP/2 연결 하나가 오래 남으면 그 연결의 많은 RPC가 같은 backend에 갈 수 있다. 서버 인스턴스를 늘려도 기존 연결이 유지되면 트래픽이 즉시 균등해지지 않을 수 있다.

Client-side LB는 클라이언트가 여러 backend를 보고 RPC 단위로 선택하도록 한다. gRPC를 이해하는 L7 proxy도 새로운 HTTP/2 stream을 backend에 분산할 수 있다. 어느 계층에서 분산할지, proxy가 HTTP/2·gRPC trailer·timeout을 제대로 처리하는지 확인한다. 'Kubernetes Service가 있으니 RPC가 균등하다'는 전제로 시작하지 않는다.

시작한 streaming RPC는 다른 backend로 자동 이동하지 않는다. Stream 수만 같아도 보내는 데이터·처리 비용이 다를 수 있다. 장기 stream의 편중을 줄이려면 재접속과 resume 계약, 서버 종료 정책, 새 stream 선택 정책을 함께 다룬다. `round_robin`은 그 자체로 업무량 기반 스케줄러가 아니다.

### 확인 질문: 세 대 중 한 대만 바쁘면

클라이언트가 VIP 한 개를 알고 하나의 HTTP/2 연결을 재사용한다. 그 VIP는 연결 단위로 backend를 고른다. 서버를 세 대에서 여섯 대로 늘리면 기존 장기 stream은 자동 이동하는가? Client의 round-robin 설정만 바꾸면 해결되는가?

<details markdown="1">
<summary>해설</summary>

기존 stream은 유지되던 연결·backend에서 계속 처리된다. Client가 실제 backend 주소들을 받지 않고 VIP 하나만 안다면 round-robin의 선택 대상도 제한된다. Resolver 결과·LB 계층·연결 수·stream 수를 확인하고 새 호출의 분산과 기존 stream의 재개를 따로 설계한다.

</details>

공식 원문: [Custom name resolution](https://grpc.io/docs/guides/custom-name-resolution/), [Custom load balancing](https://grpc.io/docs/guides/custom-load-balancing/), [Service config](https://grpc.io/docs/guides/service-config/), [Performance best practices](https://grpc.io/docs/guides/performance/).

<a id="chapter-12"></a>
## 12장. 연결이 살아 있고 업무를 받을 수 있는가 | Health·Keepalive·종료

재고 서버는 네트워크 연결에 응답하지만 DB 장애 때문에 재고를 조회하지 못할 수 있다. 반대로 업무 코드는 정상이어도 proxy가 idle 연결을 끊을 수 있다. 연결 생존과 서비스 준비 상태를 같은 지표로 다루면 원인을 놓친다.

### Health checking은 서비스 상태를 알리는 계약이다

gRPC의 표준 `health/v1` 서비스는 unary `Check`와 streaming `Watch`를 제공한다. `Check`는 상태를 한 번 조회하며 중앙 감시·LB 등에 쓸 수 있다. `Watch`는 상태 변경을 전달하고 client-side health checking에서 사용한다.

서버에 health library를 등록한 것만으로 모든 의존성 상태가 자동 판정되는 것은 아니다. 서비스가 요청을 받을 수 있으면 `SERVING`, 받을 수 없으면 `NOT_SERVING`으로 갱신하는 책임은 애플리케이션에 있다. 빈 문자열의 service name을 전체 서버 상태로 사용할 수도 있다.

어떤 조건으로 `NOT_SERVING`을 정할지도 설계한다. 모든 선택적 의존성의 일시 실패에서 전체 서버를 내리면 정상 처리 가능한 메서드까지 차단할 수 있다. 반대로 DB가 불가능한데 계속 `SERVING`이면 client가 계속 실패할 서버를 선택할 수 있다. 메서드별 의존성과 전체 서비스의 준비 기준을 맞춘다.

Client-side health checking을 활성화하면 client는 연결 뒤 `Watch`를 사용해 상태를 확인하고 healthy 서비스에 호출을 보낸다. `UNIMPLEMENTED`로 Watch가 실패하면 이 health checking 기능을 끄는 동작이 있으며, `pick_first`처럼 일부 LB policy는 health checking을 비활성화할 수 있다. 설정을 넣었다고 모든 언어·정책에서 반드시 같은 gate가 작동한다고 주장하지 않는다.

### Keepalive는 HTTP/2 PING으로 연결을 확인한다

Keepalive는 HTTP/2 PING을 사용해 연결의 생존을 확인하고 idle 경로를 유지하는 데 쓰인다. PING 응답은 재고 DB가 정상이라거나 권한 검사에 성공했다는 뜻이 아니다. Health check와 다른 문제를 다룬다.

장기 stream에서 keepalive 실패로 연결이 닫히면 진행 중 RPC도 실패할 수 있다. 아직 보내지 않은 데이터는 손실될 수 있으므로 resume·재처리 정책은 애플리케이션에 남는다. PING interval을 무조건 줄이면 빨리 알 수 있다는 장점보다 client 수에 따른 부하·서버의 허용 정책이 문제가 될 수 있다.

서버 운영자와 허용 interval·활성 호출이 없을 때 PING 허용 여부를 맞춘다. 서버가 허용하지 않는 빈번한 PING은 `GOAWAY`와 `too_many_pings`로 이어질 수 있다. 공식 가이드는 호출 없는 keepalive를 피하고 client interval을 1분보다 훨씬 짧게 설정하는 것을 경계한다. 이 문서는 모든 배포에 하나의 고정 interval을 권하지 않는다.

| 확인 수단 | 알 수 있는 것 | 이것만으로 알 수 없는 것 |
|---|---|---|
| TCP/HTTP/2 연결 상태·PING | 해당 통신 경로가 응답하는지 | 재고 DB와 업무 처리의 정상성 |
| Health Check/Watch | 서버가 보고하는 서비스 준비 상태 | 모든 개별 요청의 성공 |
| 실제 RPC status·latency | 호출 결과와 지연 | 외부 업무가 정확히 한 번 반영됐는지 |
| 업무 결과 조회 | 요청 ID의 실제 반영 상태 | 모든 다른 요청의 상태 |

### Graceful shutdown은 새 호출과 진행 중 호출을 나눈다

배포 때 서버를 즉시 종료하면 진행 중 RPC와 stream이 끊긴다. Graceful shutdown은 새 호출을 더 받지 않도록 전환하고 진행 중 호출이 끝날 시간을 준다. 무한 stream이 있으면 종료를 끝없이 기다릴 수 있으므로, 정해진 유예 뒤 forceful shutdown하는 경로도 필요하다.

Health status 갱신·LB drain·gRPC server shutdown·프로세스 종료 시간을 함께 조정한다. Client가 상태 변화를 알아차리기까지 시간이 걸리므로 전환 중 새 요청이나 재시도가 도착할 수 있다. 종료 유예가 있다는 이유로 실패가 완전히 사라지지는 않는다.

Python 실습의 `server.stop(1).wait()`는 새 RPC를 막고 기존 호출에 최대 1초의 grace를 주는 사용 예다. 다른 언어의 graceful 함수는 별도 forceful timer를 구성해야 할 수 있다. 장기 stream에는 종료 신호·재접속·resume 계약을 둔다. Kubernetes 등의 종료 유예도 이 시간과 충돌하지 않아야 한다.

### 확인 질문: PING은 되는데 조회가 실패한다면

Keepalive PING은 정상이다. DB는 사용할 수 없고 health status는 여전히 `SERVING`이다. Keepalive interval을 줄이면 해결되는가? 배포 때 graceful shutdown만 호출하면 무한 stream도 반드시 자연 종료하는가?

<details markdown="1">
<summary>해설</summary>

PING은 연결의 생존만 확인하므로 DB 장애를 해결하거나 올바른 health status를 만들지 않는다. 애플리케이션의 readiness 기준과 갱신 경로를 고쳐야 한다. 무한 stream은 스스로 끝나지 않을 수 있어 종료 프로토콜·유예 제한·강제 종료·client 복구를 함께 설계한다.

</details>

공식 원문: [Health checking](https://grpc.io/docs/guides/health-checking/), [Keepalive](https://grpc.io/docs/guides/keepalive/), [Graceful shutdown](https://grpc.io/docs/guides/server-graceful-stop/).

<a id="chapter-13"></a>
## 13장. 느린 호출은 어디에서 기다리는가 | 성능·동시성·Backpressure

gRPC는 생성 코드·이진 메시지·HTTP/2 연결 재사용을 제공하지만, 특정 workload에서 REST보다 빠르다는 결과를 미리 보장하지 않는다. Message 크기, 직렬화 비용, TLS, client 대기, server executor, DB 처리, 네트워크, proxy를 포함해 측정해야 한다.

### Channel과 stub을 먼저 재사용한다

공식 성능 가이드는 가능하면 channel과 stub을 재사용하라고 권한다. 호출마다 새 객체와 연결을 만들면 연결 준비 비용이 지연에 포함될 수 있다. 다만 재사용한 channel의 실제 connection 수와 연결별 동시 stream 한도도 확인해야 한다.

한 HTTP/2 연결의 active RPC가 동시 stream 한도에 도달하면 추가 RPC는 client에서 기다릴 수 있다. 서버 CPU가 낮더라도 client latency가 늘어날 수 있다. 장기 stream이 연결 용량을 오래 차지하면 짧은 unary 호출도 영향을 받을 수 있다.

고부하 영역의 별도 channel이나 channel pool은 이 대기의 완화책이 될 수 있다. 하지만 runtime이 연결을 재사용해 여러 channel이 실제로 독립 연결을 만들지 않을 수도 있다. 공식 가이드는 channel argument를 다르게 하는 조건도 설명한다. 측정 없이 pool 크기부터 늘리면 연결·메모리 비용만 증가할 수 있다.

### Streaming은 workload의 선택이지 자동 최적화가 아니다

장기 논리 흐름을 하나의 stream으로 유지하면 반복적인 RPC 시작 비용을 줄일 수 있다. 반면 시작한 stream은 다른 backend로 이동하지 못하고, 실패 시 복구와 관측이 복잡해질 수 있다. 많은 작은 RPC를 합치는 이익과 장기 점유·편중의 비용을 비교한다.

특히 Python의 동기 gRPC stack은 streaming의 송수신에 추가 스레드를 사용한다. 공식 가이드는 다른 언어와 달리 이 경로에서 streaming이 unary보다 느릴 수 있음을 설명하고 `asyncio` 사용을 검토하도록 한다. 모든 언어의 streaming 성능을 하나의 규칙으로 묶지 않는다. async로 바꿔도 blocking DB 호출을 event loop에 그대로 두면 다른 작업을 막을 수 있다.

압축도 payload 특성에 따라 CPU와 bandwidth를 맞바꾸는 선택이다. 작은 메시지·이미 압축된 데이터·CPU 병목에서는 이익이 적을 수 있다. Compression on/off만 비교하지 말고 payload 크기와 처리량·latency·CPU를 같은 조건에서 관찰한다. 이것은 측정 설계이며 공식 문서에 없는 성능 수치를 만들어 넣지 않는다.

### Transport의 제어와 애플리케이션 큐의 제어를 연결한다

Flow control은 receiver가 보낼 용량을 알리고 sender가 대기하도록 한다. Handler가 메시지를 읽는 즉시 무제한 작업 큐로 옮기면 전송은 계속 진행될 수 있지만 실제 처리는 밀리고 메모리가 늘어난다. 애플리케이션 큐 길이·최대 동시 작업·메시지 크기도 제한해야 한다.

5장의 server executor는 worker 4개인 학습용 구성이다. 생산 환경의 동시 요청 admission 정책 전체를 구성한 것은 아니다. Worker를 늘리기 전에 DB pool·하위 서비스·메모리의 처리 한도를 맞춘다. 대기 중인 요청이 deadline 뒤에 실행되지 않도록 취소 확인도 필요하다.

Bidi에서 읽기와 쓰기를 무조건 한 작업의 순서로 묶으면 교착 상태가 생길 수 있다. 양쪽이 대량으로 먼저 쓰고 읽지 않으면 상대가 받아야 열리는 용량을 서로 기다리게 된다. 독립적인 reader·writer 또는 명확한 request/response 진행 규칙과 bounded queue를 설계한다.

### 같은 부하 조건으로 비교한다

성능 시험에서는 connection warm-up, payload, 동시 호출 수, 서버 인스턴스, 오류·deadline 비율을 기록한다. 평균만 보지 말고 p95·p99와 client 대기·server 처리 시간을 비교한다. 성공한 빠른 요청만 집계하면 timeout으로 탈락한 느린 호출을 숨길 수 있다.

| 관찰 | 먼저 나눠 볼 위치 |
|---|---|
| Client 느림·server 정상 | 연결 준비·picker 대기·동시 stream queue·네트워크 |
| Server handler 시작이 늦음 | admission·executor·큐 |
| Handler 안에서 느림 | DB·하위 RPC·직렬화·CPU |
| Stream 수 증가와 memory 증가 | 메시지 버퍼·애플리케이션 큐·정리되지 않은 구독 |
| 오류와 retry가 함께 증가 | backend 장애·retry amplification·deadline budget |

이 표는 진단 출발점이지 지표 하나로 원인을 확정하는 규칙이 아니다. Trace·지연 구간·실제 부하 변화로 가설을 검증한다.

### 확인 질문: 스레드만 늘리면 되는가

Server CPU는 낮고 client p99가 길다. 장기 stream이 많다. Handler worker를 두 배로 늘리면 반드시 개선되는가? Client가 메시지를 빨리 읽어 무한 큐에 넣으면 backpressure가 해결되는가?

<details markdown="1">
<summary>해설</summary>

Client connection의 동시 stream 한도나 picker 대기라면 server worker 수와 직접 관계가 없을 수 있다. 지연 위치부터 확인한다. 무한 큐는 통신 대기를 애플리케이션 메모리 증가로 옮길 뿐이다. 처리 용량과 큐 상한을 연결하고 overload 시 거절·대기 정책을 정해야 한다.

</details>

공식 원문: [Performance best practices](https://grpc.io/docs/guides/performance/), [Flow control](https://grpc.io/docs/guides/flow-control/).

<a id="chapter-14"></a>
## 14장. 한 번의 업무 호출을 어떻게 추적하는가 | 관측·장애 테스트

주문 서비스는 재고 조회를 한 번 호출했는데 재고 서버에는 세 요청이 기록됐다. Retry가 있다면 이것이 반드시 세 개의 독립 업무 요청이라는 뜻은 아니다. Client의 논리 호출(call), 전송 attempt, server가 받은 호출, 실제 DB 반영을 나누어 관측한다.

### Call과 attempt를 별도로 집계한다

공식 OpenTelemetry 가이드는 client per-call, client per-attempt, server 계측을 구분한다. `grpc.client.call.duration`은 application 관점의 end-to-end 호출 시간을 관측하고, `grpc.client.attempt.started`와 `grpc.client.attempt.duration`은 재시도 등을 포함한 attempt를 관측한다. Attempt duration에는 subchannel 선택 시간도 포함된다.

Call 한 개가 attempt 여러 개로 이어지면 최종 성공률은 높아 보여도 backend 부하는 늘 수 있다. 논리 호출 수와 attempt 수를 비교하고, retry delay·최종 status·server 처리량을 함께 본다. 계측 지표가 어떤 범위에서 측정됐는지 모르면 오류율 분모도 달라진다.

실험적 retry·LB·xDS 지표는 기본 비활성화일 수 있다. Plugin, optional attribute, 언어별 설치 API와 버전을 확인한다. 같은 이름의 표준 지표 목록이 있다고 모든 runtime에서 설정 없이 전부 나오는 것은 아니다. Metric label에 주문 ID·사용자 ID를 무제한 넣으면 cardinality가 증가하므로 개별 호출 연결은 trace·구조화 로그에서 다룬다.

### 통신 결과와 업무 결과를 같은 ID로 연결한다

Method, target, status, duration, trace ID, 필요하면 안전하게 취급한 업무 요청 ID를 연결한다. Client timeout과 server `OK`가 동시에 발견되면 [6장](#chapter-6)의 응답 경계일 수 있다. 업무 결과 조회나 DB 기록으로 실제 반영을 확인한다.

메서드별 오류율을 볼 때 고객 입력 오류와 서버 가용성 오류를 구분한다. 모든 non-OK가 같은 의미는 아니다. 사용자 취소·잘못된 ID·권한 거절이 늘어나는 상황과 backend 장애가 늘어나는 상황은 운영 대응이 다르다. 원인을 구분하되 오류를 임의로 지워 성공률을 꾸미지 않는다.

### Reflection은 schema 조회 도구를 돕는다

Server reflection은 서버에 등록된 서비스·메시지 schema를 도구가 조회하도록 하는 표준 기능이다. `grpcurl` 같은 도구가 `.proto` 파일 없이 API를 탐색하는 데 사용할 수 있다. Reflection은 명시적으로 활성화·노출하는 기능이며, 5장의 서버는 등록하지 않았다.

Reflection을 켰다고 해당 메서드의 호출 권한이 생기거나 보안 설정이 끝나는 것은 아니다. Proxy에서 reflection service를 전달하는지, 외부에 schema를 공개할지, 운영자가 어떤 credentials로 접근하는지 정한다. 끄더라도 도구가 `.proto` 또는 descriptor를 받으면 호출할 수 있으므로 비노출을 인증 대용으로 삼지 않는다.

### Happy path 밖의 경계를 테스트한다

| 조건 | 확인할 결과 |
|---|---|
| 없는 상품 조회 | `NOT_FOUND`와 예측 가능한 오류 계약 |
| 잘못된 인자 | `INVALID_ARGUMENT`, 같은 인자 재시도 없음 |
| Handler 지연 > deadline | Client 시간 제한·server 취소 대응 |
| Stream 첫 메시지 뒤 cancel | Client 종료·server 구독/worker 정리 |
| 커밋 뒤 응답 단절 | 같은 요청 ID로 중복 없이 결과 조회·재호출 |
| 동일 ID 동시 쓰기 | Unique 충돌·같은 결과·다른 payload 거절 |
| 구·신버전 혼합 | 새 필드 무시·presence·업무 기본 동작 |
| 종료 중 새 호출·장기 stream | Drain·유예·강제 종료·client 재개 |
| 서버 미준비·wait-for-ready | Deadline 안의 대기와 최종 오류 |
| 과부하·많은 stream | Queue·memory 상한과 latency·거절 정책 |

5장 예제에서 unary·server streaming·업무 오류·deadline·취소를 실행해 볼 수 있다. 위 표의 DB 멱등성·TLS·다중 backend·운영 종료·부하 시험까지 그 예제로 검증한 것은 아니다. 실행한 범위와 설계상 확인해야 할 범위를 분리한다.

### 확인 질문: 최종 성공률만 높으면 충분한가

재고 조회의 최종 성공률은 그대로인데 attempt 수와 p99가 늘었다. 무엇을 더 확인해야 하는가? 서버의 `OK` 수만으로 클라이언트 성공 수를 계산할 수 있는가?

<details markdown="1">
<summary>해설</summary>

Retry가 오류를 숨기는 동안 부하·지연을 키웠을 수 있다. Attempt의 status·backoff·backend 상태·call duration을 함께 본다. 서버가 응답을 성공 처리해도 client는 deadline 등으로 실패할 수 있으므로 양쪽의 수가 같다고 가정하지 않는다. 업무 성공이 필요하면 요청 ID의 실제 반영 기록도 확인한다.

</details>

공식 원문: [OpenTelemetry metrics](https://grpc.io/docs/guides/opentelemetry-metrics/), [Reflection](https://grpc.io/docs/guides/reflection/), [Retry](https://grpc.io/docs/guides/retry/).

<a id="chapter-15"></a>
## 15장. 어떤 경계에 gRPC를 두는가 | 설계와 계약 전환

한결마켓에는 상품 화면, 주문 서비스, 재고 서비스, 알림 서비스가 있다. 이 전체를 하나의 통신 방식으로 맞출 필요는 없다. 응답을 지금 받아야 하는지, 사실을 보존해 나중에 읽어야 하는지, 브라우저가 직접 접근하는지, 생성 코드를 배포할 수 있는지부터 판단한다.

### 현재 판단과 이미 일어난 사실을 구분한다

주문 서비스가 재고를 예약할 수 있는지 지금 확인해야 한다면, 재고 API의 원격 호출이 후보가 된다. 계약을 공유하는 내부 서비스에는 gRPC를 검토할 수 있다. 그러나 `GetStock`으로 수량을 확인한 뒤 주문 서버가 독립적으로 '충분하다'고 판단하는 것만으로 동시 주문의 예약 정합성이 유지되지는 않는다. 재고 서비스에서 조건부 예약·원자적 변경을 수행하는 업무 API가 필요하다.

주문이 확정됐다는 사실을 알림·분석·정산이 각각 나중에 처리해야 한다면 [Kafka](/wiki/kafka/) 같은 내구성 있는 이벤트 로그를 검토한다. 이 경우 RPC의 응답과 consumer의 업무 완료는 별개다. 주문 DB commit과 이벤트 발행 사이의 실패 창은 [분산 트랜잭션](/wiki/distributed-transaction/)의 Outbox 같은 설계로 다룰 수 있다. gRPC를 선택한다고 이벤트 발행의 원자성이 생기지 않는다.

### 브라우저에서는 native gRPC와 같은 API를 가정하지 않는다

브라우저의 일반 fetch API를 native gRPC의 stub처럼 사용할 수 있는 것은 아니다. 공식 `grpc-web` 구현은 gRPC-Web client와 이를 backend gRPC로 연결하는 proxy 또는 지원 서버를 사용한다. 보통 Envoy proxy가 예시에 쓰인다. 변환 경로의 CORS·TLS·metadata·trailer 처리도 확인한다.

2026-10-06 조회한 공식 `grpc/grpc-web` README에서 지원 모드는 unary와 server-side streaming이며, server streaming은 `grpcwebtext` 모드에서 지원한다. Client streaming과 bidirectional streaming은 지원하지 않는다고 명시되어 있다. 이는 해당 공식 구현의 현재 범위이며 모든 브라우저 관련 RPC 라이브러리의 영구적인 한계로 확대하지 않는다.

브라우저에서 bidi가 필요하면 WebSocket 등 별도 후보를 검토하거나 다른 구현의 실제 지원·운영 경로를 확인한다. 'native 서버가 bidi를 지원하니 gRPC-Web도 된다'는 추론으로 설계하지 않는다.

| 요구 | 검토할 후보 | 함께 확인할 경계 |
|---|---|---|
| 공개 리소스 API·일반 브라우저 사용 | HTTP/REST 등 | API 의미·인증·캐시·표현 형식 |
| 계약을 공유하는 서비스 간 호출 | Native gRPC | Deadline·retry·언어별 support·업무 멱등성 |
| 브라우저에서 schema 기반 unary/stream | gRPC-Web | Proxy·지원 streaming 모드·CORS·운영 도구 |
| 보존·재처리·독립 소비가 필요한 사실 | Kafka 등 | DB와 발행의 원자성·소비 위치·중복 처리 |

이 표는 우열이 아니라 요구별 검토 기준이다. HTTP API도 강한 schema와 코드 생성을 사용할 수 있고, gRPC도 잘못된 계약·배포·오류 정책을 가질 수 있다. 팀의 디버깅·배포·관측 비용까지 선택에 포함한다.

### 계약 전환은 혼합 버전의 호출로 검증한다

서비스 이름·메서드·메시지 필드를 바꾸면 서버와 client를 한 번에 바꿀 수 있다는 전제를 피한다. 새 메서드를 먼저 제공하고 구메서드와 공존시키거나, optional 필드를 추가하되 없음 상태를 처리하는 식으로 전환할 수 있다.

필드 추가의 binary wire 호환성, 생성 API의 호환성, 업무 의미를 별도로 테스트한다. 새 enum 값을 받았을 때 기존 코드가 어떤 분기로 가는지, optional을 implicit scalar로 통과시키면서 presence를 잃는지, JSON gateway가 unknown fields를 보존하는지도 확인한다. 새 client→구 server와 구 client→새 server 양방향을 시험한다.

사용 중단은 배포 완료뿐 아니라 호출 현황·보관 메시지·오래된 consumer를 기준으로 결정한다. 삭제한 번호·이름은 `reserved`로 남기고 재사용하지 않는다. 버전 이름을 올리는 것만으로 이 검증이 끝나지 않는다.

### 종합 사례: 재고 예약 후 응답이 늦었다

가상 설계를 다음 조건으로 두자. 주문 서비스는 deadline을 명시해 `ReserveStock`을 호출한다. 재고 서비스는 tenant·업무 요청 ID·payload를 검증하고 재고 변경과 결과 기록을 같은 DB transaction에 남긴다. 주문 서비스가 timeout을 받으면 결과를 조회하거나 같은 ID로 재호출한다. 예약 성공과 주문 확정 이후의 이벤트는 별도 발행·소비 경로로 관리한다.

이때 deadline은 대기와 자원 수명을 제한하고, request ID는 불확실한 응답 뒤의 중복을 다룬다. DB transaction은 해당 DB 안의 변경·중복 기록을 묶는다. Outbox는 DB와 이벤트 발행의 경계를 다루고, consumer는 재전달을 처리한다. 각각 다른 문제를 풀기 때문에 한 기능으로 나머지를 대체할 수 없다.

### 확인 질문: 모든 통신을 gRPC로 통일하면

현재 주문·재고 판단, 주문 완료 이벤트, 브라우저의 양방향 실시간 기능을 전부 gRPC로 통일하려 한다. 먼저 확인해야 할 서로 다른 요구는 무엇인가?

<details markdown="1">
<summary>해설</summary>

현재 요청의 결과가 필요한 RPC, 이후 독립적으로 소비할 내구성 있는 사실, 브라우저의 지원 통신 모드를 나누어 본다. gRPC에는 Kafka의 보존·replay가 자동 제공되지 않고 공식 gRPC-Web의 bidi 지원도 native와 같지 않다. 공통 protocol을 늘리는 이익보다 업무 보장·클라이언트 제약·복구 비용을 먼저 판단한다.

</details>

공식 원문: [gRPC introduction](https://grpc.io/docs/what-is-grpc/introduction/), [gRPC-Web 공식 README](https://github.com/grpc/grpc-web), [Proto3 language guide](https://protobuf.dev/programming-guides/proto3/), [Protobuf best practices](https://protobuf.dev/best-practices/dos-donts/). 가상 서비스 배치·DB·Outbox 결합은 설계 예시다.

<a id="glossary"></a>
## 부록 A. 용어 찾아보기

| 용어 | 뜻과 다시 읽을 위치 |
|---|---|
| RPC | 다른 프로세스의 메서드를 통신으로 호출하는 모델 — [1장](#chapter-1) |
| IDL·`.proto` | 서비스·메시지의 구조를 정의하는 계약 — [2장](#chapter-2) |
| Field number·reserved | Wire에서 필드를 구분하는 번호와 재사용 금지 — [2장](#chapter-2) |
| Presence | 필드의 없음과 기본값 설정을 구분하는 규칙 — [2장](#chapter-2) |
| Unknown field | 현재 schema가 모르는 필드. 변환 경로에 따라 보존 여부가 달라짐 — [2장](#chapter-2) |
| Stub·servicer | 생성된 client 호출 API와 server 구현 인터페이스 — [3장](#chapter-3), [5장](#chapter-5) |
| Channel·subchannel | Target·통신 정책의 객체와 backend 연결 단위 — [3장](#chapter-3), [11장](#chapter-11) |
| Unary·streaming | RPC 메시지 개수와 방향 — [4장](#chapter-4) |
| Half-close | 한쪽의 요청 쓰기를 마침. 전체 RPC 종료와 다름 — [4장](#chapter-4) |
| Flow control·backpressure | 전송·처리 용량에 맞춰 진행을 제한함 — [4장](#chapter-4), [13장](#chapter-13) |
| Deadline·timeout | 기다릴 마지막 시점·허용 기간 — [6장](#chapter-6) |
| Cancellation | 호출 중단 신호. 업무 rollback이 아님 — [7장](#chapter-7) |
| Status·metadata·trailers | 결과 코드·호출 부가 정보·서버 종료 metadata — [8장](#chapter-8) |
| Call·attempt | Application의 논리 호출과 개별 실행 시도 — [9장](#chapter-9), [14장](#chapter-14) |
| Transparent retry | 서버 업무 코드가 처리하지 않은 일부 실패의 투명 재시도 — [9장](#chapter-9) |
| Wait-for-ready | 준비되지 않은 연결에서 deadline까지 기다리는 옵션 — [9장](#chapter-9) |
| 멱등성 | 같은 업무의 반복에서 정의한 효과를 중복시키지 않는 계약 — [9장](#chapter-9) |
| Credentials·interceptor | 통신/호출 인증 정보와 호출별 공통 확장점 — [10장](#chapter-10) |
| Resolver·picker | 주소·config 해석과 새 RPC의 연결 선택 — [11장](#chapter-11) |
| Service config | Target별 client 동작 설정 — [11장](#chapter-11) |
| Health·keepalive | 업무 준비 상태와 연결 생존의 별도 확인 — [12장](#chapter-12) |
| Graceful shutdown | 새 호출을 막고 진행 중 호출에 유예를 주는 종료 — [12장](#chapter-12) |
| Reflection | 서버의 서비스·메시지 schema 조회 지원 — [14장](#chapter-14) |
| gRPC-Web | 브라우저용 protocol·client/proxy 경로. Native와 모드가 다름 — [15장](#chapter-15) |

## 부록 B. 자주 섞이는 보장

| 오해 | 구분할 사실 |
|---|---|
| Timeout이면 서버는 실행하지 않았다 | 커밋 뒤 응답 지연도 가능 — [6장](#chapter-6) |
| Cancel하면 DB도 rollback된다 | 이미 반영한 변경은 남음 — [7장](#chapter-7) |
| Retry policy가 exactly-once를 만든다 | 업무 중복은 서버 계약이 다룸 — [9장](#chapter-9) |
| Write API 성공이면 상대가 처리했다 | Framework 버퍼 전달과 업무 완료는 다름 — [4장](#chapter-4) |
| Bidi는 요청·응답이 1:1이다 | 두 방향이 독립. 대응 관계는 업무 protocol — [4장](#chapter-4) |
| Channel 하나는 TCP 연결 하나다 | Channel은 0개 이상의 연결을 사용할 수 있음 — [3장](#chapter-3) |
| READY·PING 성공이면 DB도 정상이다 | 연결·health·업무 결과를 나눔 — [12장](#chapter-12) |
| Protobuf 파싱 성공이면 호환이다 | API·업무 의미·JSON 경로도 확인 — [2장](#chapter-2) |
| 서버를 늘리면 기존 stream도 분산된다 | 시작한 stream은 backend에 남음 — [11장](#chapter-11) |
| 브라우저는 native bidi를 그대로 쓴다 | 공식 gRPC-Web 지원 범위를 확인 — [15장](#chapter-15) |

## 부록 C. 공식 문서로 돌아가기

장별 링크가 본문의 근거다. 더 넓은 API·언어별 동작은 아래 진입점에서 확인한다. 이 교과서는 모든 언어 API나 모든 guide의 완전 번역본이 아니다. Load balancing·health·metrics 설정의 언어별 지원과 버전별 차이는 실제 배포에서 다시 대조한다.

- [gRPC documentation](https://grpc.io/docs/): 공식 문서 전체.
- [Core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/): 서비스·네 가지 호출·lifecycle.
- [Guides](https://grpc.io/docs/guides/): timeout·오류·보안·운영 기능.
- [Python](https://grpc.io/docs/languages/python/): quick start·basics·API 진입점.
- [Go](https://grpc.io/docs/languages/go/), [Java](https://grpc.io/docs/languages/java/), [C++](https://grpc.io/docs/languages/cpp/): 언어별 구현과 사용법.
- [Protocol Buffers](https://protobuf.dev/): 메시지 계약·생성 API·호환 규칙.
- [gRPC-Web](https://github.com/grpc/grpc-web): 브라우저 구현의 지원 모드·proxy 예제.
