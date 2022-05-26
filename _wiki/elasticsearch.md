---
layout  : wiki
title   : Elasticsearch
summary :
date    : 2022-05-25 19:00:00 +0900
updated : 2022-05-26 10:40:00 +0900
tag     : elasticsearch
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Elasticsearch

## 특징
- **스키마가 없는 JSON 기반 저장소**
  - JSON 형태의 데이터 모델을 사용함
  - NoSQL 처럼 사용 가능
  - 스키마를 정의하지 않아도 JSON 데이터를 넘겨주면 자동으로 인덱싱
  - 숫자나 날짜 등의 타입을 자동 매핑

- **Document-Oriented**
  - JSON 형식의 구조화된 문서로 인덱스에 저장
  - 계층 구조로 문서도 한번의 쿼리로 쉽게 조회 가능

- **Multi-Tenancy 를 지원**
  - Multi-Tenancy 란 단일 소프트웨어 인스턴스로 다른 여러 사용자 그룹에 서비스를 제공할 수 있는 소프트웨어 아키텍쳐
  - 하나의 ES 서버에 여러 인덱스를 저장하고, 여러 인덱스의 데이터를 하나의 쿼리로 조회 가능
  - 서로 상이한 인덱스라도 검색할 필드명만 같으면 여러개의 인덱스를 한번에 조회가능

### 단점
- **실시간이 아니다**
  - 인덱스가 된 데이터는 통상적으로 1초 뒤에 검색이 가능하다.
  - 내부적으로 commit 과 flush 과 같은 과정을 거치기 때문에
  - 이를 준 실시간 시스템 (Near Realtime System) 이라고 한다

- **트랜잭션과 롤백이 없다**
  - ES는 기본적으로 분산 시스템으로 구성된다
  - 전체적인 클러스터의 성능 향상을 위해서 시스템적으로 비용 소모가 큰 롤백과 트랜잭션을 지원하지 않는다.
  - 데이터 손실의 위험이 있다.

- **데이터의 업데이트는 권장되지 않는다**
  - Immutable 이다.
  - 업데이트 요청이 발생할 경우 기존 문서를 삭제하고 변경된 내용으로 새로운 문서를 생성하는 방식을 쓴다.
  - 단순 업데이트에 비해서 많은 비용이 발생한다

## Elasticsearch Rest API

```
http://host:port/ ${index} / ${type} / ${action | id}
```

## Client SDK
- Spring data elasticsearch
- Rest High-Level Client

## Pricing

## TEST 

## Reference
- [SLA](https://www.elastic.co/guide/en/cloud/current/ec-faq-getting-started.html#faq-subscriptions)
- [Elastic Cloud Pricing](https://www.elastic.co/kr/pricing/)
- [Elastic Cloud Feature matrix](https://www.elastic.co/kr/subscriptions/cloud)
- [Opensearch Pricing calculator](https://aws.amazon.com/ko/opensearch-service/pricing/)
- [elasticsearch로 로그 검색 시스템 만들기](https://d2.naver.com/helloworld/273788)
- [Elastic 가이드 북](https://esbook.kimjmin.net)
- [[엘라스틱서치] 실무 가이드(1) - 검색 시스템](https://12bme.tistory.com/589)
