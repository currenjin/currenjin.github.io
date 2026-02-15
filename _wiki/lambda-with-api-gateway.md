---
layout  : wiki
title   : Using Lambda with API Gateway
summary :
date    : 2022-07-17 15:00:00 +0900
updated : 2022-07-17 15:00:00 +0900
tags     : aws
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Using Lambda with API Gateway

<img width="915" alt="image" src="https://user-images.githubusercontent.com/60500649/179385256-1c619137-e8b7-49ee-ba28-88de977fc6a9.png">

## Create a DynamoDB table

Lambda 함수가 사용하는 DynamoDB 테이블을 생성합니다.<br>

1. DynamoDB 콘솔에 접속합니다.
2. 테이블 생성을 클릭합니다.
3. 테이블 세부 사항을 설정합니다.
   1. 원하는 테이블 이름을 설정합니다. (ex. encryptDynamoDB)
   2. 파티션 키를 id 로 입력합니다. (타입은 문자열입니다)
4. 테이블 생성을 클릭합니다.

## Create the Lambda function

API Gateway 에서 호출할 Lambda 함수를 생성합니다.<br>

1. Lambda 콘솔에 접속합니다.
2. 함수 생성을 클릭합니다.
3. 함수 세부 사항을 설정합니다.
   1. 원하는 함수 이름을 설정합니다. (ex. functionForDynamoDB)
   2. 함수의 런타임을 설정합니다. (이번 POC 에선 Python 3.8 사용)
4. 함수 생성을 클릭합니다.

## Write a function

```python
from __future__ import print_function

import boto3
import json

dynamo = boto3.client('dynamodb')

def lambda_handler(event, context):
    
    operation = event['operation']
    print(event['operation'])

    operations = {
        'create': lambda x: dynamo.put_item(**x),
        'read': lambda x: dynamo.get_item(**x),
        'update': lambda x: dynamo.update_item(**x),
        'delete': lambda x: dynamo.delete_item(**x),
        'list': lambda x: dynamo.scan(**x),
        'echo': lambda x: x,
        'ping': lambda x: 'pong'
    }

    if operation in operations:
        return operations[operation](event.get('payload'))
    else:
        raise ValueError('Unrecognized operation "{}"'.format(operation))
```

## Grant permission to Lambda function

Lambda 함수가 DynamoDB 로 요청할 수 있도록 권한을 부여합니다.<br>

1. IAM 콘솔에 접속합니다.
2. 역할 탭에 접속합니다.
3. Lambda 함수의 역할을 선택합니다.
4. 정책을 연결합니다.
   1. 이번 POC 에선 AmazonDynamoDBFullAccess 를 부여합니다.

## Test the Lambda function

Lambda 함수가 적절한 응답을 하는지 테스트합니다.<br>

1. Lambda 콘솔에 접속합니다.
2. 테스트하고자 하는 함수를 클릭합니다.
3. 하단의 테스트 탭에서 이벤트 페이로드를 정의해, 테스트합니다.

### Ping & Pong

**Request**<br>

```json
{
  "operation": "ping"
}
```

**Response**<br>

정상적인 응답이 내려옵니다.<br>

```json
"pong"
```

### Create

**Request**<br>

```json
{
  "operation": "create",
  "payload": {
    "TableName": "encryptDynamoDB",
    "Item": {
      "id": {
        "S": "some id"
      },
      "text": {
        "S": "some text"
      }
    }
  }
}
```

**Response**<br>

Http Status code 가 200(정상) 입니다.<br>

```json
{
  "ResponseMetadata": {
    ...
    "HTTPStatusCode": 200,
  }
}
```

<br>

DynamoDB 테이블 내 항목에도 추가되었군요.<br>

<img width="537" alt="image" src="https://user-images.githubusercontent.com/60500649/179386161-4291b691-d332-4ec4-a9fe-bf7c73adaf49.png">

<br>

이제 Lambda -> DynamoDB 의 연결은 확인되었습니다.<br>
API Gateway 연결만 진행하면 되겠군요.<br>
<br>

## Create the API Gateway

Lambda 함수를 호출하기 위한 API Gateway 를 생성합니다.<br>

### Create the API

1. API Gateway 콘솔에 접속합니다.
2. API 생성을 클릭합니다.
3. REST API 에서 구축을 클릭합니다.
4. 세부사항을 설정합니다.
   1. 프로토콜은 REST 입니다.
   2. 새 API 를 생성합니다.
   3. 원하는 API 이름을 설정합니다. (ex. DynamoDBOperations)
   4. 엔드포인트를 지역으로 선택합니다.
5. API 생성을 클릭합니다.

### Create a resource

REST API 의 리소스를 생성합니다.<br>

1. API 의 리소스 트리에서 루트(/) 를 선택합니다. 
2. 작업을 선택하고, 리소스 생성을 클릭합니다.
3. 세부사항을 설정합니다.
   1. 리소스 이름에 DynamoDBOperator 입력합니다. 
   2. 리소스 경로 설정을 /dynamodboperator로 유지합니다. 
4. 리소스 생성을 클릭합니다.

### Create a POST method on the resource

리소스에서 POST 메소드를 생성합니다.<br>

1. API 의 리소스 트리에서 /dynamodboperator 를 선택합니다. 
2. 작업을 선택하고, 메소드 생성을 클릭합니다.
3. 드롭다운 메뉴에서 POST 를 선택한 후, 체크 표시를 클릭합니다.
4. 설정 창에서 세부사항을 설정합니다.
   1. 통합 유형은 Lambda 함수입니다.
   2. 생성했 람다 함수를 선택합니다.
5. 저장 버튼을 클릭합니다.

## Integration test

API Gateway 를 이용한 DynamoDB 항목 생성 테스트를 진행합니다.<br>

1. API Gateway 의 리소스 탭을 접속합니다.
2. 생성한 POST 메소드를 클릭합니다.
3. 좌측의 테스트를 클릭합니다.
4. Request Body 내에 JSON 값을 전달합니다.
5. 테스트 버튼을 클릭합니다.


### Request Body

<img width="495" alt="image" src="https://user-images.githubusercontent.com/60500649/179386623-294a6152-dc46-4368-b52c-7ffe5059b3db.png">

### Response

<img width="320" alt="image" src="https://user-images.githubusercontent.com/60500649/179386653-cc468473-7b0f-40b4-b884-9481ec24a271.png">

### DynamoDB Table

<img width="566" alt="image" src="https://user-images.githubusercontent.com/60500649/179386672-5c847a3d-6d7b-4b64-94ca-d240357c485b.png">

