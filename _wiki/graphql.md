---
layout  : wiki
title   : GraphQL
summary :
date    : 2022-01-31 14:30:00 +0900
updated : 2022-01-31 22:00:00 +0900
tags     : graphql
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# GraphQL

> GraphQL 공식 학습 문서의 내용을 빌린 글입니다. GraphQL의 동작 방식과 사용법을 다루는 포스팅이며, 매력적인 이 기술을 많은 분들이 보시고 도움을 받으셨으면 좋겠어요!  

**GraphQL은 API를 위한 쿼리 언어입니다.** 데이터의 타입을 미리 지정하는 타입 시스템을 이용하여 쿼리를 실행하는 서버사이드 런타임이죠. GraphQL은 특정 DB 또는 스토리지 엔진과 관계되어 있지 않아 기존 코드와 데이터에 의해 대체될 수 있어 접근성, 호환성 모두 좋습니다.

**GraphQL은 타입과 필드를 정의해요.** 그리고 각 타입의 필드에 대한 함수로 구현되죠. 예를 들어, 로그인한 사용자가 누구인지(me)와 해당 사용자의 이름(name)을 가져오는 GraphQL 서비스는 다음과 같습니다.

```
type Query {
  me: User
}

type User {
  id: ID
  name: String
}
```

각 타입의 필드에 대한 함수를 작성하면 다음과 같이 작성할 수 있어요!

```graphql
function Query_me(request) {
  return request.auth.user;
}
function User_name(user) {
  return user.getName();
}
```

GraphQL 서비스가 실행되면, GraphQL 쿼리를 전송하여 유효성을 검사하고 실행할 수 있습니다. 수신된 쿼리는 미리 정의되어 있던 타입과 필드만 참조하여 검사한 다음, 함수를 실행하여 결과를 만들죠.

예제 쿼리는 아래와 같습니다.

```graphql
{
  me {
    name
  }
}
```

해당 요청에 따라 다음과 같은 JSON을 얻게 돼요! 정말 정의한 만큼, 원하는 데이터만 뽑아올 수 있다는 점이 정말 매력적으로 다가옵니다.

```graphql
{
  "me": {
    "name": "hyunjin jeong"
  }
}
```

간단하게 GraphQL에 대한 사용법을 알아봤어요. 곧 추가될 포스트는 우리가 어떻게 하면 GraphQL을 매력적으로, 효율적으로 사용할 수 있을지에 대해서 중점적으로 다룰 예정입니다. 물론, 저도 매력을 느끼고 있는 과정에 놓여있죠. 감사합니다!

