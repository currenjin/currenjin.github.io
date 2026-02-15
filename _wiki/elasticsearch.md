---
layout  : wiki
title   : Elasticsearch
summary :
date    : 2022-05-25 19:00:00 +0900
updated : 2022-05-26 12:00:00 +0900
tags     : elasticsearch
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

## Spring data Elasticsearch PoC(Proof of Concept)

[PoC Repository](https://github.com/currenjin/spring-data-elasticsearch-poc)

### Scenario

![image](https://user-images.githubusercontent.com/60500649/170408195-a3212762-90f6-48fc-8096-9986e25fa589.png)

#### In(Index)

유저 정보를 삽입할 수 있다.

#### Out(Query)

유저 이름으로 유저 정보를 조회할 수 있다.
유저 전화번호로 유저 정보를 조회할 수 있다.

### SDK

```java
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-elasticsearch'
}
```

### Elasticsearch Repository

```java
/**
 * ElasticsearchRepository 를 상속합니다. 해당 인터페이스는 PagingAndSortingRepository 를 상속합니다.
 * save(), findById(), findAll(), count(), delete() 등의 메소드가 포함됩니다.
 */
```

### Elasticsearch Configuration

```java
/**
 * Spring data Elasticsearch 가 Spring Data 저장소에 대해 제공된 패키지를 스캔하도록 합니다.
 * Elasticsearch Server 와 통신을 위해 간단한 RestHighLevelClient 를 사용합니다.
 * ElasticsearchOperations Bean 을 설정해, 서버에서 작업을 실행합니다.
 */
```

### User

```java
@Document(indexName = "user_index")
public class User {

    @Id
    private String id;

    @Field(type = FieldType.Text, name = "name")
    private String name;

    @Field(type = FieldType.Text, name = "phoneNumber")
    private String phoneNumber;
}
```

### Run server

```shell
Elasticsearch
$ make start-elasticsearch * jar is required.

Opensearch
$ make start-opensearch * jar is required.
```

### Indexing

```shell
$ curl -d '{"id":"test","name":"currenjin","phoneNumber":"01012341234"}' \
-H "Content-Type: application/json" \
-X POST http://localhost:{PORT}/
```

![image](https://user-images.githubusercontent.com/60500649/170406070-fb1ac02f-f52b-4962-81ca-7fc321167faa.png)


### Query

```shell
$ curl -X GET "http://localhost:{PORT}/test"
$ curl -X GET "http://localhost:{PORT}?name=currenjin"
$ curl -X GET "http://localhost:{PORT}?phoneNumber=01012341234"
```

```shell
{"id":"test","name":"currenjin","phoneNumber":"01028810909"}
```

## Pricing

## Reference
- [SLA](https://www.elastic.co/guide/en/cloud/current/ec-faq-getting-started.html#faq-subscriptions)
- [Elastic Cloud Pricing](https://www.elastic.co/kr/pricing/)
- [Elastic Cloud Feature matrix](https://www.elastic.co/kr/subscriptions/cloud)
- [Opensearch Pricing calculator](https://aws.amazon.com/ko/opensearch-service/pricing/)
- [elasticsearch로 로그 검색 시스템 만들기](https://d2.naver.com/helloworld/273788)
- [Elastic 가이드 북](https://esbook.kimjmin.net)
- [[엘라스틱서치] 실무 가이드(1) - 검색 시스템](https://12bme.tistory.com/589)
- [Spring-data-Elasticsearch](https://docs.spring.io/spring-data/elasticsearch/docs/current/reference/html/)
