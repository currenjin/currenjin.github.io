---
layout  : wiki
title   : Sleuth AWS SQS
summary :
date    : 2022-05-03 13:30:00 +0900
updated : 2022-05-26 13:00:00 +0900
tags     : container
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
  {:toc}

# Sleuth AWS SQS

## Slueth

Spring cloud Sleuth 에서 분산 추적을 위한 Sprign boot Auto-configuration 을 제공합니다.

Sleuth는 시작하는 데 필요한 모든 것을 구성합니다. 여기에는 trace data(spans)가 보고되는 위치, 유지할 추적 데이터 수(sampling), 원격 필드(baggage)가 전송되는 경우 및 추적되는 라이브러리가 포함됩니다.

특히, Spring Cloud Sleuth…

Slf4J MDC에 추적 및 범위 ID를 추가하므로 로그 수집기의 지정된 추적 또는 범위에서 모든 로그를 추출할 수 있습니다.

Spring 애플리케이션(서블릿 필터, 나머지 템플릿, 예약된 작업, 메시지 채널, 가상 클라이언트)에서 일반적인 수신 및 송신 지점을 계측합니다.

사용 가능한 경우 spring-cloud-sleuth-zipkin앱은 HTTP를 통해 Zipkin 호환 추적을 생성하고 보고합니다. 기본적으로 localhost(포트 9411)의 Zipkin 수집기 서비스로 보냅니다. 를 사용하여 서비스의 위치를 ​​구성합니다 spring.zipkin.baseUrl.

## Zipkin

Zipkin은 분산 추적 시스템입니다. 서비스 아키텍처의 대기 시간 문제를 해결하는 데 필요한 타이밍 데이터를 수집하는 데 도움이 됩니다. 기능에는 이 데이터의 수집 및 조회가 모두 포함됩니다.

로그 파일에 추적 ID가 있는 경우 해당 ID로 직접 이동할 수 있습니다. 그렇지 않으면 서비스, 작업 이름, 태그 및 기간과 같은 속성을 기반으로 쿼리할 수 있습니다. 서비스에 소요된 시간의 백분율 및 작업 실패 여부와 같은 몇 가지 흥미로운 데이터가 요약됩니다.

## POC(Proof of Concept)
- [Repository](https://github.com/currenjin/sleuth-sqs-poc)

해당 프로젝트는 Slueth(Zipkin) 를 통한 메시지 추적 POC(Proof of concept) 입니다.
Rest API 를 통해 POST 요청을 받으면, 메시지를 발행/소비 합니다. 이 과정에서 유지되는 TraceId 를 확인합니다.

![image](https://user-images.githubusercontent.com/60500649/167242411-f1b70721-f4f6-4bbd-862f-fc9a535cad88.png)

### Run
#### Clone project

```shell
$ git clone https://github.com/currenjin/sleuth-sqs-poc
```

#### Run container

```shell
$ make start-app *jar is required.
```

#### Invoke api

```shell
$ curl --request POST --data 'test' http://localhost:5000/post
```

### Request API

### Producer

### Consumer

1. 메시지가 수신되면 SimpleMessageListenerContainer 의 executeMessage 를 호출

2. executeMessage 에서는 handleMessage 를 호출

3. 이때, TraceMessagingAutoConfiguration 의 SqsQueueMessageHandler 클래스의 handleMesage 가 호출
  - SqsQueueMessageHandler 는 QueueMessageHandler 를 상속

4. handleMessage 에서는 TracingMethodMessageHandlerAdapter 의 wrapMethodMessageHandler 를 호출

5. wrapMethodMessageHandler 는 tracer 정보를 삽입
  - spanId
  - traceId

## References
- [Spring cloud sleuth](https://spring.io/projects/spring-cloud-sleuth)
- [Zipkin](https://zipkin.io)
