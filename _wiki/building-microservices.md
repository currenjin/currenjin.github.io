---
layout  : wiki
title   : Building Microservices
summary :
date    : 2025-10-30 13:00:00 +0900
updated : 2025-12-07 22:00:00 +0900
tags     : architecture
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Building Microservices

## Ch01. 마이크로서비스란?

### TL;DR
- 마이크로서비스 아키텍처는 복잡성이 높은 반면에, 독립적 배포, 도메인 중심 모델링, 견고성 및 확장성, 팀 구성 등에 높은 유연성을 부여할 수 있다.
- 조직에서 어느정도의 복잡성을 수용할 것인지 결정해야 한다.
- 마이크로서비스 아키텍처를 채택했다면, 로그 집계와 분산 추적, 컨테이너, 스트리밍, 클라우드 서비스를 고려해야 한다.

### Key Ideas
- 마이크로서비스의 장점: 기술 이질성, 견고성, 확장성, 배포 용이성, 조직적 정렬, 조합성
- 마이크로서비스의 고충: 개발자 경험, 기술 과다, 비용, 리포팅, 모니터링과 디버깅, 보안, 테스팅, 지연 시간, 데이터 일관성
- 견고성: 견고성을 향상 시키는 핵심 개념은 벌크헤드다. 고장이 연속적으로 발생하지 않게 문제를 격리하는 것이다.

### Open Questions
- 어느 정도의 규모가 되어야 마이크로서비스 아키텍처를 수용할 수 있을까?
  - 5명으로 구성된 스타트업에서는 마이크로서비스 아키텍처는 걸림돌이 될 우려가 크다.
  - 100명 규모로 빠르게 성장하는 회사라면, 마이크로서비스 아키텍처는 성장을 수용하기 쉬울 것이다.
  - 하지만, 사람 수가 아니라 복잡성에 달려있다.
    - 하나의 코드베이스로 더 이상 모든 기능을 안전하게 수정할 수 없을 때
    - 다른 팀의 배포를 기다려야 하는 상황이 잦을 때
    - 팀이 기능 중심이 아니라 도메인 중심으로 나눠질 수 있을 때
    - 일부 서비스만 다른 언어/DB/플랫폼이 더 적합할 때
    - 트래픽/자원 사용 패턴이 도메인 별로 달라질 때
- 규모가 적어도 마이크로서비스가 유용한 상황이 있을까?
  - 도메인 독립 실험이 필요한 경우
  - 기술 격리가 중요한 경우
  - 팀 구조가 분산되어 있는 경우
  - API 게이트웨이/서드파티 연동이 주된 비즈니스인 경우

## Ch02. 마이크로서비스 모델링 방법

### TL;DR
- 도메인을 자세히 이해하는 것은 낮은 결합도와 강한 응집력, 문제 영역에서의 경계를 찾는 데 도움이 된다.
- 올바른 마이크로서비스의 경계를 만드는 것은 정보 은닉, 높은 응집력, 낮은 결합도이다.
- 하나의 애그리거트는 하나의 마이크로서비스에서 관리돼야 한다.

### Key Ideas
- 정보 은닉(Information Hiding): 모듈 경계 뒤에 가능한 많은 세부 정보를 숨기려는 욕구
- 도메인 결합(Domain Coupling): 한 마이크로서비스가 다른 마이크로서비스와 상호작용
- 통과 결합(Pass-Through Coupling): 한 마이크로서비스가 다른 마이크로서비스에 데이터를 전달. 이 경우, 하위 서비스와 직접 통신
- 공통 결합(Common Coupling): 둘 이상의 마이크로서비스가 공통 데이터 집합을 사용. 이 경우, 한 서비스가 온전히 책임을 지도록 해야함
- 내용 결합(Content Coupling): 상위 서비스가 하위 서비스 내부까지 도달해 서비스 내부 상태를 변경. 이 경우, 직접 요청을 보내도록 해야함

### Open Questions
- 모든 결합은 나쁜가?
  - 결합은 필연적이고, 불필요한 결합을 줄이고 필요한 결합을 느슨하게 유지하는 것이다.
  - 좋은 결합의 조건
    - 비즈니스적으로 필수
    - 안정적인 컨트랙트위에서 이뤄짐
    - 시간적 독립성 보장
  - 나쁜 결합의 신호
    - 다른 서비스의 내부 스키마/컬럼에 의존
    - 공통 DB 쓰기로 배포 독립성 상실
    - 동기 체인으로 SLO가 전파됨
- 내용 결합은 주로 어떤 상황에서 발생하는가?
  - 공유 DB 및 스키마를 여러 서비스가 직접 조회 및 갱신할 때
  - 다른 서비스의 내부 엔터티를 DTO처럼 재사용할 때
  - GraphQL/REST 응답을 내부 모델 그대로 노출해 외부가 내부 필드에 묶일 때 -> 외부에는 전용 DTO만 노출
  - 빠르게 붙이자는 이유로 ACL 없이 타 서비스의 내부 API를 그대로 소비할 때 -> 외부, 내부 도메인 변환 계층

## Ch03. 모놀리스 분해

### TL;DR
- 마이그레이션은 점진적이어야 한다. 변경하고 나서 해당 변경 사항을 출시하고, 평가하고, 다시 수행한다.
- 모놀리스를 분해할 때에는 여러 패턴이 도움된다. ex) Strangler Fig, Parallel Run, Feature Toggle, ...
- 데이터베이스의 성능, 데이터 무결성, 트랜잭션, 변경 도구, 리포팅에 대한 고려가 필요하다.

### Key Ideas
- 교살자 무화과 패턴(strangler fig): 새로운 서비스가 만들어졌다면, 기존 시스템에 대한 호출을 가로채고 새 서비스 호출로 리디렉션한다. 만약 변경되지 않았다면, 기존 요청은 그대로 둬도 된다.
- 병렬 실행(parallel run): 모놀리식 기능 구현과 새로운 서비스 구현을 나란히 실행해 같은 요청을 제공하고 결과를 비교한다.
- 기능 토글(feature toggle): 기능을 켜거나 끄고 기능에 대한 2개의 다른 구현 사이를 오가게 하는 메커니즘이다.
- 대상을 선정하고, 분해를 시도하자. 분해는 코드 우선 또는 데이터 우선으로 진행된다.
- 완벽한 선경지명과 무한한 자금만 있으면 가질 수 있는 이상적인 시스템 아키텍처 버전을 하나 출력해서 박제해둔다. 점진적으로 그 방향에 도달한다.
- 코드센스와 같은 정적 분석 도구는 코드베이스의 불안정한 부분을 신속하게 찾아준다.

### Open Questions
- 나 또한 마이크로서비스 아키텍처를 경험하고, 일정 규모 전까지는 모놀리식이 낫다는 것을 깨달았다. 작은 단위부터 분해하기 위해서는 어떤 기준이 필요한가?
- 각 분해 패턴이 유용한 경우는 각각 어떤 상황인가?
  - 교살자 무화과 패턴(strangler fig)
  - 병렬 실행(parallel run)
  - 기능 토글(feature toggle)
- 분해된 마이크로서비스에서 다른 테이블 데이터가 필요하다면?

## Ch04. 마이크로서비스 통신 방식

### TL;DR
- 마이크로서비스의 통신 유형은 동기식 블로킹, 비동기식 논블로킹, 요청 및 응답, 이벤트 기반, 공통 데이터를 고려할 수 있다.
- 이벤트 기반 통신은 마이크로서비스 아키텍처에 적절한 방식이지만, 협업 방식이 제한적인 경우 복잡성의 원인이 될 수 있다. 하나의 이벤트에서 확장하라.

### Key Ideas
- 동기식 블로킹: 다운스트림 프로세스의 응답을 기다리는 호출이다. 익숙한 것이 장점이지만, 고유한 시간적 결합의 단점이 있다. (결제 서비스 이상거래 탐지 등)
- 비동기식 논블로킹: 공통 데이터 통신, 요청 및 응답, 이벤트 기반 상호작용 등의 방식이 있다. 호출 시 서비스를 블로킹하지 않는 장점이 있지만, 잘 알고 사용해야 한다. (장기 수행 프로세스)
- 공통 데이터 통신: 데이터를 정의한 위치에 넣고 다른 서비스가 그 데이터를 이용할 때 사용한다. 기본적으로 비동기이며, 간단한 구현과 많은 데이터 양을 수용 가능하다. 하지만, 결합의 원천이 될 수 있다. (프로세스의 상호 운용성)
- 요청 및 응답 통신: 요청을 보내고 응답을 받길 기대한다. 동기와 비동기 방식 각각 구현이 가능하다. (재시도 또는 보상 조치)
- 이벤트 기반 통신: 수신여부가 보장되지 않는 이벤트를 발행하고, 리스너가 이를 실행한다.
  - 이벤트에 ID만 포함: 대상 서비스가 정보를 알아야 하는 경우 추가 도메인 결합이 생긴다.
  - 자세한 이벤트: 자립적이며, 느슨한 결합을 가능하게 한다. 하지만 이벤트 크기와 민감 정보가 우려된다.

### Open Questions
- 이벤트 기반 통신에서 하이브리드 기법을 사용한다면 어떻게? 그리고 언제?

## Ch05. 마이크로서비스의 통신 구현

### TL;DR
- 해결하고자 하는 문제로 기술을 결정할 수 있는지 고민하자. 그리고 선택된 기술 중 일부는 직렬화 포맷과 스키마가 결정되기도 한다.
- 어떤 선택이든 스키마 사용을 고려하자. 이는, 계약을 명시적으로 만드는 데 유용할 뿐만 아니라 우발적 중단 변경을 찾는 데도 도움이 된다.
- 마이크로서비스의 중단 변경을 피하기 위해 적절한 방법을 고민해자. 최대한 락스텝 배포를 피할 수 있는 방법을 찾아봐야 한다.

### Key Ideas
- Remote Procedure Call: 로컬 호출을 통해 원격 서비스를 실행하는 기술. 클라이언트 코드 생성이 쉽지만 기술 결합, 취성 등의 문제가 있다. (동기식 요청 및 응답 모델에 적합)
- REST: 리소스 기준 요청 형식. HATEOAS도 있다. 중복과 성능 문제가 있을 수 있지만, 최근에는 다소 해결된 솔루션이 제공되었다. (다양한 클라이언트 액세스 허용 시 동기식 요청 및 응답 인터페이스에 적합)
- GraphQL: 맞춤형 서버 측 집계를 구현하지 않아도 된다. 하지만 클라이언트가 동적으로 변경되는 쿼리를 실행할 수 있어 성능 문제가 발생할 수 있으며, 캐싱이 복잡하다. (외부 클라이언트에 기능을 노출하는 시스템의 경계에 적합)
- Message Broker: 미들웨어이며, 프로세스 사이에서 프로세스 간 통신을 관리한다. 토픽과 큐가 주로 사용되며, 전달 보장과 순서 보장 및 쓰기 트랜잭션과 같은 주요한 특성이 있다.
- Serialization Format: 데이터 직렬화 및 역직렬화와 관련된 기술을 선택할 수 있다. 포맷으로는 크게 텍스트 포맷(XML, JSON), 바이너리 포맷(Protocol buffer, SBE 등)으로 나뉜다.
- Schema: 직렬화 포맷에 따라 정하게 되며, 계약 위반에 대해서는 대체적으로 구조적 위반(기존과 호환 불가)과 의미적 위반(동작의 변경)이 있다. 이를 해결하기 위해서는 테스트를 사용해야 한다.
- 마이크로서비스의 중단 변경을 피하기 위해서는 확장 변경(expansion changes), 관대한 독자(tolerant reader), 올바른 기술(right technology), 명시적 인터페이스(explicit interface)와 같은 아이디어가 있다.
- 중단 변경이 필요하다면 락스텝 배포(lockstep deployment), 호환되지 않는 마이크로서비스 버전의 공존, 기존 인터페이스 에뮬레이션과 같은 선택지가 있다.
- 마이크로서비스가 어디 있는지 알고 싶다면, 서비스 디스커버리를 알아보라. DNS, Dynamic Service Registry(Zookeeper), Consul, etcd & K8S, Eureka 등

### Open Questions
- 내가 경험한 서비스에서 사용한 REST, GraphQL, Message Broker 기술은 그 상황에서 적절한 선택이었을까?
- 내가 지금 경험하고 있는 서비스의 중단 변경은 어떤게 있을까?
- 내가 지금까지 경험했던 중단 변경 대응 방식은 어떤게 있었을까?
- 서비스 메시와 API 게이트웨이. 두 방식 중 상황 별로 적합한 선택은 어떨까?

## Ch06. 워크플로

### TL;DR
- 워크플로를 구현하는 방법은 구현할 비즈니스 프로세스를 명시적으로 모델링하는 것이다.
- 분산 트랜잭션은 최대한 피하자. 첫 번째 방법은 데이터를 분리하지 말되, 정말 분해해야 한다면 사가를 고려하자.

### Key Ideas
- ACID
  - Atomicity(원자성): 트랜잭션 내에서 시도된 작업이 두 가지 상태, 즉 모두 완료한 상태거나 모두 실패한 상태인지 확인한다. 어떤 이유로든 시도한 변경이 실패하면 전체 연산이 중단되고 아무것도 적용되지 않은 것처럼 보인다.
  - Consistency(일관성): 데이터베이스가 변경되면, 유효하고 일관된 상태가 유지된다.
  - Isolation(격리성): 여러 트랜잭션이 간섭없이 동시에 작동할 수 있다. 이는 어떤 트랜잭션 중에 이뤄진 모든 중간 상태 변경이 다른 트랜잭션에 안 보이게 하는 방법으로 달성된다.
  - Durability(내구성): 일단 트랜잭션이 완료되고 나면 시스템 오류가 발생하는 상황에서도 데이터가 손실되지 않는 것을 보장한다.
- Two-Phase Commit
  - Voting: coordinator는 트랜잭션에 참가할 모든 worker에 연락하고 일부 상태 변경이 가능한지 여부를 확인 요청한다.
  - Commit: 모든 워커가 변경에 동의한 경우, 커밋 단계에서 실제 변경이 일어나고, 잠금이 해제된다. 찬성하지 않은 경우 모든 당사자에 롤백 메시지를 보내 로컬에서 정리하도록 보장한다.

#### Saga Pattern
<img width="372" height="747" alt="Image" src="https://github.com/user-attachments/assets/df709959-637b-4917-9210-458d6e592cf6" />

Failure: 역방향 복구에는 실패 복구와 이후에 일어나는 정리 작업인 롤백이 포함되며, 정방향 복구는 실패가 발생한 지점에서 데이터를 가져와 계속 처리한다.
- 모든 단계가 단일 데이터베이스 트랜잭션이면, 간단한 롤백으로 정리할 수 있다. 하지만 그렇지 않다면, 보상 트랜잭션(compensating transaction)을 구현해야 한다.
- 하지만, 트랜잭션이 일어나지 않은 것처럼 만들 수는 없기 때문에 의미적 롤백(semantic rollback)이라고도 한다.
- 롤백을 줄이기 위해서는 워크플로의 단계를 재정렬 할 수도 있다.

Orchestrated Saga: central coordinator를 사용해 실행 순서를 정의하고, 보상 조치를 트리거 한다.
- 너무 많은 중앙 집중화를 피하기 위해서는 서로 다른 흐름에 대해 서로 다른 서비스가 오케스트레이터 역할을 수행하도록 하는 것이다.
- 본질적으로 이 방식은 어느 정도 결합된 방식이며, 서비스에 전달돼야 할 로직이 오케스트레이터에 흡수되기도 한다는 점을 고려해야 한다.

Choreographed Sage: 여러 협력 서비스 사이에서 사가 운영에 대한 책임을 분산시키는 것을 목표로 한다.
- 모든 서비스는 상대 서비스에 대해 전혀 모르도록 설계가 가능하다. 도메인 결합도가 낮은 아키텍처를 만들 수 있다.
- 어떤 일이 발생하는지 파악하기 더 어려워질 수도 있다. 이 경우에는 사가에 대한 고유 ID, 즉 correlation ID를 생성해 방출되는 이벤트에 넣어 추적할 수 있다.

### Open Questions
- Orchestrated Saga VS Choreographed Saga
  - 오케스트레이션형 사가에서 요청 및 응답 호출 방식이 더 많이 사용되는 반면, 코레오그래피형 사가에서는 이벤트 방식이 더 많이 사용되는 경향에 대해 유의할 필요가 있다.
  - 필자는 한 팀이 전체 사가 구현을 담당하는 경우에는 오케스트레이션형 사가, 여러 팀이 관여하는 경우 코레오그래피형 사가를 선호한다.

## Ch07. 빌드

### TL;DR
- 함께 일하는 모든 이들의 커뮤니케이션 리소스 및 불필요한 충돌을 방지하기 위해 CI/CD를 고려하라. 기존 코드가 새로 체크인한 코드와 통합되는지, 모든 체크인에 지속적인 피드백을 받는지 확인하는 방법이다.
- 소규모 팀이라면, 모노레포와 멀티레포 방식 모두 괜찮지만, 규모가 커질수록 멀티레포 방식이 더 간단할 것이다.

### Key Ideas
- Continuous Integration(지속적 통합): 모든 사람이 서로 조화롭게 동기화되도록 유지하는 것이 핵심 목표이다.
    - 기존 코드와 새로 체크인한 코드가 적절히 통합되는지 코드 커밋을 감지하고, 체크아웃하며, 코드가 컴파일되고 테스트를 통과하는지 확인하는 등의 검증을 수행한다.
    - 메인라인에 하루에 한 번 체크인하는가? 변경 사항을 검증하는 일련의 테스트가 있는가? 빌드가 깨졌을 때 이를 수정하는 것이 팀의 최우선 일인가? 등을 고려하자.
    - 또한, 트렁크 기반 개발을 통해 브랜치 전략 중 GitFlow 방식과 같은 것을 고려하라.
- Continuous Delivery(지속적 제공): 모든 체크인의 운영 환경 준비 상태에 대한 지속적인 피드백을 받고 더 나아가 모든 체크인을 릴리스 후보로 취급하는 접근 방식이다.
    - Build Pipeline(빌드 파이프라인)과 같은 방식을 통해 느린 테스트보다 빠른 테스트를 먼저 검증해 피드백 속도를 높일 수 있다.
- Monorepo(모노레포): 여러 서비스를 담은 하나의 레포지토리 패턴. 하나의 서비스가 변경되면 모든 서비스의 빌드가 일어나지만, 락스텝을 적용하면 완벽하다. 하지만, 락스텝은 최대한 피하자.
- Multirepo(멀티레포): 서비스 별 단일 레포지토리 패턴. 개발자가 여러 레포지토리를 사용해 작업하는 경우 힘들고, 다른 레포지토리 코드에 의존하는 것을 막지 못한다.

### Open Questions
- 우리는 정말 CI/CD가 구축되어있는 환경인가? 각 단계에 해당하는 부분을 설명해보라.
- 지금은 웬만한 서비스는 모노레포로 멀티모듈 환경을 구성하여 커버할 수 있는 것 같다. 하지만, 멀티레포로 가면 좋은 순간이 언제일까?
    - 우리 팀이 커지고, 더이상 한 명이 모든 서비스를 커버할 수 없을 때이다. 이 경우 각 역할 별로 서비스를 맡을 것이고, 그 서비스에서 몰입해야 하는 기술의 깊이가 깊을 것이다.
    - 분리하게 되는 경우에는 생각보다 많은 리소스를 수반하므로, 신중히 고려해야 한다. 지금과 같은 상황에서는 공통 모듈에 대한 분리, 기존 CI/CD 연동, 레포지토리 권한 등이 있을 것이다.

### References
- [구글은 왜 수십억 줄의 코드를 단일 저장소에 저장하는가?](https://oreil.ly/wMyH3)

## Ch08. 배포

### TL;DR
- 고장 나지 않았다면, 고치지 말라.
- 만족한다고 느끼는 만큼 통제권을 포기한 다음 조금씩 더 포기하라. PaaS에 맡길 수 있다면, 그렇게 하라. 설정을 일일이 손봐야 하는 것이 아니다.
- 마이크로서비스를 컨테이너화하는 일이 쉽지는 않지만, 격리 비용에 대한 절충안임은 분명하다. 제어권을 제공하면서, 로컬 개발에 이점을 가져온다.

### Key Ideas
#### 배포 원칙
- 격리 실행: 다른 마이크로서비스 인스턴스에 영향을 미치지 않도록 실행돼야 한다. (ex. Lambda, Heroku)
- 자동화 집중: 고수준의 자동화를 가능하게 할 기술을 선택하는 데 집중하고 문화의 핵심 부분으로 채택하라. (ex. REA, Financial Times)
- 코드형 인프라스트럭쳐: 자동화하고, 정보 공유를 촉진하는 인프라스트럭처 구성을 기술하라. (Chef, Ansible, Terraform, AWS CDK)
- 무중단 배포: 독립적인 배포를 통해 사용자에게 다운타임 없이 새 버전을 배포할 수 있어야 한다. (Rolling upgrade, Blue/Green)
- 기대 상태 관리: 장애가 발생하거나 트래픽이 증가할 때 필요하다면 지정된 상태의 새로운 인스턴스를 시작한다. (AWS Auto Scaling, GitOps)

#### 배포 방법
- 물리 머신: 마이크로서비스 인스턴스는 가상화 없이 물리 머신에 직접 배포된다.
- 가상 머신: 마이크로서비스 인스턴스는 가상 머신에 배포된다.
- 컨테이너: 마이크로서비스 인스턴스는 가상 또는 물리 머신에서 격리된 컨테이너로 실행된다.
- 애플리케이션 컨테이너: 마이크로서비스 인스턴스는 다른 애플리케이션 인스턴스들을 관리하는 애플리케이션 컨테이너 안에서 실행된다.
- PaaS: 마이크로서비스 인스턴스를 배포하는 데 한층 고도화된 추상화 플랫폼이 사용된다. (ex. Heroku, AWS Elastic Beanstalk, Google App Engine)
- FaaS: 마이크로서비스 인스턴스는 하부 플랫폼에서 실행된다. (ex. AWS Lambda, Azure Functions)

## Ch09. 테스트

### TL;DR
- 빠른 피드백을 위해 취적화하고 테스트 타입을 적절히 분리하라.
- 둘 이상의 팀에 걸쳐있는 E2E 테스트의 필요성을 줄여라. 대신 소비자 주도 계약을 고려하라. 소비자 주도 계약을 통해 팀 간 대화의 초점을 제공하자.
- 테스트에 더 많은 노력을 기울이는 것과 운영 환경에서 문제를 더 빨리 감지하는 것 같의 절충점을 이해하려고 노력하라.
- 운영 환경에서 테스트하라.
- 평균 무고장 시간(Mean Time Between Failures)의 최적화와 평균 수리 시간(Mean Time to Repair)의 최적화 간 균형점을 고려하자.

### Key Ideas
- 마이크 콘의 테스트 피라미드: 피라미드 위로 올라갈 수록 테스트의 범위는 증가하고, 테스트 중인 기능이 작동한다는 확신도 커진다. 반면에, 테스트를 실행하는 데 오랜 시간이 걸리면 피드백 주기 시간이 늘어나고, 테스트가 실패하면 어떤 기능이 손상됐는지 확인하기 더 어려워질 수 있다. 피라미드 아래로 내려가면, 이의 반대다.
- Unit Test: 단일 함수 또는 메서드 호출을 테스트한다.
- Service Test: 사용자 인터페이스를 우회하고 서비스를 직접 테스트하도록 설계됐다.
- E2E Test: 시스템 전체에 대해 수행한다. 단, 범위가 증가함에 따라 구성 요소 수 역시 증가하고, 구성 요소가 많을 수록 테스트는 더 불안정해진다.
- 소비자 주도 테스트(소비자 주도 계약 & 계약 테스트)은 마이크로서비스의 작동 방식에 대한 기대치를 테스트하고, 이에 대해 외부 종속성이 제거된 고객 서비스만 실행하면 된다. 팀의 누군가가 협력해 테스트를 생성하도록 하는 것도 좋다. ([Pact](https://pact.io/), [Contract](https://spring.io/projects/spring-cloud-contract))
- 운영환경 테스트를 통해 높은 품질의 피드백을 받자. 헬스 체크도 한 예가 되고, 스모크 테스트와 카나리아 릴리즈, 가짜 사용자 행동을 주입 등을 고려할 수 있다.
- 평균 무고장 시간(Mean Time Between Failures)의 최적화와 평균 수리 시간(Mean Time to Repair)의 최적화 간 균형점을 고려하자.

### Open Questions
- 프론트엔드에서의 테스트는 어떻게 진행하면 좋을까?
- 조직의 문화로 테스트를 자리잡게 하기 위해서는 어떤 것을 하면 좋을까?
- 우리에게 필요한 엔드투엔드 테스트는 무엇이 있을까? 그 중 꼭 필요한 건 무엇인가?
    - 기본 테스트에 대해 E2E 테스트가 필요하다 생각한다. playwright 같은 도구를 통해 고정적인 테스트를 진행할 수 있을 것이다.
    - 우리는 항상 테스트 시간이 되면, 모두가 테스트를 진행한다. 이 테스트는 개발자, 디자이너, 기획자 상관없이 모두가 참여한다. 해당 과정에서 발생하는 문제는 한 시트에 리스트업을 하고, 테스트가 끝나면 이슈들에 대해 우선순위를 논의한다. 이슈 논의가 끝나면, 해당 이슈를 수정하고, 다시 테스트에 돌입한다. 이 사이클을 4-5번 반복하면 드디어 우리는 프로덕션 배포에 대한 준비가 된 것이다.
    - 하지만 이 과정에서 불필요한 것이 있다라면 무엇일까? 바로, 기본 사이클에 대한 테스트일 것이다. 기본 테스트가 자동화되어있다면, 미리 감지하고, 테스트 시간에는 새로운 기능들에 대한 테스트를 진행할 수 있을 것이다.
- 우리 서비스에 소비자 주도 테스트를 적용한다면 어떤 모습일까?
    - 현재 개발 프로세스는 다음과 같다.
        1. 기획/디자인 리뷰 및 이벤트 스토밍
        2. 이벤트에 따른 API 리스트업
        3. 백엔드 개발자는 Dummy API 작업 및 restDocs 테스트 추가
        4. 프론트엔드 개발자는 해당 문서를 보고 작업, 테스트 진행
        5. 실제 API 구현
    - 위 프로세스에서 봤을 때, 소비자 주도 테스트를 진행하고 있다 생각한다. 클라이언트와 서버 간 계약을 기준으로 소통 및 작업을 진행하는 맥락으로는 동일하기 때문이다.
    - 위 프로세스로 변경 후 front-end 개발자의 만족도와 생산성이 올라갔고, back-end 개발자 또한 별도 문서 작업 없이 restDocs로 문서 생성 및 테스트가 완료되어 생산성이 향상된다.
- 우리 서비스의 MTBF, MTTR은 얼마나 되는가? 그 균형은 잘 유지되고 있는가

## Ch10. 모니터링에서 관찰가능성으로

### TL;DR
- 시스템 또는 마이크로서비스 상태를 '행복' 또는 '슬픔' 로 이해하는 이분법적인 상태에서 벗어나, 진실은 항상 그보다 더 미묘한 차이가 있다는 것을 인식하라.
- 알림 피로를 줄이고 SLO를 수용해 이 원칙에 따라 알림을 보내기를 적극 고려하라.
- 관찰가능성을 위해서는 로그, 메트릭, 분산 추적, 알림 등을 필수적으로 적용하라.

### Key Ideas
#### 로그 집계
여러 마이크로서비스에서 정보를 수집하는 것으로, 모든 모니터링이나 관찰가능성 솔루션의 중요한 구성 요소다.
- 로그 날짜, 시간, 서비스 이름, 로그 레벨 등이 각 로그의 일관된 위치에 있어야 한다.
- Fluentd, Elasticsearch, Kibana, Humio, Datadog

#### 메트릭 집계
마이크로서비스와 인프라스트럭쳐에서 원시 수치를 캡처해 문제를 탐지하고, 용량 계획을 추진하며, 애플리케이션 확장까지 할 수 있다.
- 카디널리티는 주어진 데이터 포인트에서 쉽게 쿼리할 수 있는 필드의 수이다. 쿼리하려는 필드가 많을수록 지원해야 하는 카디널리티는 높아진다. 이는 시계열 데이터베이스에서 더욱 문제가 된다.
- Prometheus

#### 분산 추적
무엇이 잘못됐는지 파악하고 정확한 지연 시간 정보를 도출하기 위해 여러 마이크로서비스 경계에서 호출 흐름을 추적한다.
- 대부분 유사한 방식으로 동작한다. 1) 스레드의 로컬 활동은 스팬으로 캡처된다. 2) 각 스팬은 고유 식별자를 사용해 연결되며, 3) 트레이스로 구성되도록 중앙 수집기로 전송된다.
- OpenTracking API, Dapper, Jaeger, OpenTracing, Open Telemetry API

#### 지금 괜찮은가?
에러 예산, SLA, SLO 등을 살펴보고, 마이크로서비스가 소비자의 요구 사항을 충족하는지 확인하는 과정의 일부로 사용할 수 있는 방법을 확인한다.
- 한 마리의 벌이 행복하지 않다고 모든 벌이 행복하지 않은 것은 아니다. 양호한 CPU 레벨은 무엇인지 또는 허용 가능한 응답 시간을 만드는 요소는 무엇인지 등을 결정해 서비스가 정상인지 알아낼 수 있다.
- Service-Level Agreement: 시스템을 구축하는 사람과 시스템을 사용하는 사람 사이의 계약이다. 사용자가 기대하는 것뿐만 아니라 허용 가능한 동작 수준에 도달하지 못할 경우 발생하는 상황도 해당한다.
- Service-Level Objective: 팀 수준에서 계약하는 것을 정의한다. 예상 가동 시간이나 지정된 연산에 대한 허용 가능한 응답 시간과 같은 항목이 해당한다.
- Service-Level Indicator: 소프트웨어가 수행하는 작업의 척도다. 특정 프로세스의 응답 시간, 등록 중인 고객, 고객에게 제기된 오류 또는 진행 중인 주문이 될 수 있다.

#### 알림
무엇을 알려야 할까? 좋은 알림이란 어떤 것일까?
- 관련성: 경고할 가치가 있는지 확인하라.
- 고유성: 경고가 다른 경고를 복제하지 않도록 하라.
- 적시성: 알림을 활용할 수 있도록 신속하게 알림을 받아야 한다.
- 우선순위: 알림을 처리할 순서를 결정할 수 있도록 운영자에게 충분한 정보를 제공하라.
- 알기 쉬움: 알림의 정보는 명확하고 읽기 쉬워야 한다.
- 진단: 무엇이 잘못됐는지 명확해야 한다.
- 자문: 운영자가 취해야 할 조치를 이해하도록 도와야 한다.
- 집중: 가장 중요한 문제에 주목하라.

#### 시멘틱 모니터링
시스템의 상태와 새벽 3시에 우리를 깨워야 하는 것에 대해 다른 방식으로 생각한다.

#### 운영 환경에서 테스트
운영 환경의 다양한 테스트 기법에 대한 요약
- 합성 트랜잭션, A/B 테스트, 카나리아 릴리스, 병렬 실행, 스모크 테스트, 카오스 엔지니어링 등

#### 맥락 제공
- 시간적 맥락: 1분, 1시간, 1일 또는 1개월 전과 비교해 어떻게 보이는가?
- 상대적 맥락: 시스템의 다른 것과 관련해 어떻게 변경됐는가?
- 관계적 맥락: 이것에 의존하는 것이 있는가? 혹은 다른 것에 의존하는가?
- 비례적 맥락: 얼마나 나쁜가? 범위가 크거나 작은가? 어떤 것이 영향을 받는가?

### Open Questions
- 우리의 SLA, SLO, SLI는 무엇으로 기준을 세우고, 그 수치는 얼마나 되는가?
    - SLA: 고객과 계약하는 약속이다. 벌금 또는 크레딧의 조건이 포함되어 있어야 한다. 예시로, 월 가용성 99.5% 미만인 경우, 사용료의 10%를 크레딧으로 지급할 수 있다.
    - SLO: 우리가 지키고 싶은 목표에 해당한다. 예시로, 지난 30일 동안 성공 요청 비율 99% 이상, 지난 7일 동안 P95 응답시간 300ms 이하와 같이 목표를 세운다.
    - SLI: 서비스 품질을 나타내는 정량 지표이다. 예시로, 성공 요청 비율 = 성공 요청 수 / 전체 요청 수, P95 응답 지연 시간과 같이 수식을 정의할 수 있다.
- 우리가 사용하는 로그와 메트릭 집계, 분산 추적 툴은 어떤 것이 있으며, 각각 어떻게 동작하는가?
    - 로그 집계: Loki - label 기반으로 로그를 인덱싱, 저장한다.
    - 메트릭 집계: Prometheus - 주기적으로 메트릭(CPU, latency, count 등)을 수집한다.
    - 분산 추적: Tempo - Trace 데이터(TraceID, Span, Duration, ServiceName 등)를 저장한다.
    - OpenTelemetry: 허브같은 존재다. Observability 데이터를 받아 각 서비스(Loki, Prometheus, Tempo)로 라우팅한다.
    - Grafana: 대시보드다. Metrics, Logs, Traces를 한 번에 탐색할 수 있다.
- 우리의 서비스에는 적절한 맥락을 어떤 것을 제공해야 하는가?

## Ch11. 보안

### TL;DR

### Key Ideas

#### 핵심 원칙
> 보다 안전한 소프트웨어를 구축하려 할 때 수용하는 데 유용한 기본 개념
- 최소 권한의 원칙: 당사자가 필요한 기능을 수행하는 데 필요한 최소한의 액세스 권한을 필요한 기간 동안만 부여한다.
- 심층 방어: 공격자로부터 방어하기 위해 여러 보호 장치를 갖추는 것이 중요하다.
- 자동화: 자동화는 사건 발생 후 복구하는 데 도움이 된다. 이를 사용해 보안키를 취소하거나 교체하고 도구를 사용해 잠재적인 보안 문제를 보다 쉽게 감지할 수 있다.
- 제공 프로세스에 보안 주입: 개발자가 보안 관련 사항에 보다 일반적인 인식을 갖게 만들고, 필요할 경우 전문가가 제공 팀에 합류할 수 있는 방법을 찾으며, 보안 관련 개념을 소프트웨어에 구축할 수 있도록 도구를 개선해야 한다.

#### 사이버 보안의 다섯 가지 기능
> 애플리케이션 보안을 위한 다섯 가지 주요 기능 영역(식별, 보호, 탐지, 대응, 복구)에 대한 개요
- 식별: 잠재적인 공격자가 누구인지, 공격 대상이 무엇인지, 가장 취약한 곳은 어디인지 식별하라.
- 보호: 잠재적인 해커로부터 주요 자산을 보호하라.
- 감지: 최선의 노력에도 불구하고 공격이 발생했는지 감지하라.
- 대응: 나쁜 일이 발생했다는 것을 알게 되면 대응하라.
- 복구: 사고 발생 후 복구하라.

#### 애플리케이션 보안의 기초
> 애플리케이션 보안의 특정한 몇 가지 기본 개념과 자격 증명, 보안, 패치, 백업, 재빌드를 포함해 마이크로서비스에 적용하는 방법

#### 암묵적 신뢰 대 제로 트러스트
> 마이크로서비스 환경에서 신뢰를 위한 다양한 접근 방식과 이 방식이 보안 관련 활동에 미치는 영향

#### 데이터 보안
> 데이터가 네트워크를 통해 이동하고 디스크에 저장될 때 데이터를 보호하는 방법

#### 인증 및 권한 부여
> 마이크로서비스 아키텍처에서 SSO가 작동하는 방식, 중앙 집중식 대 분산식 인증 모델, 그리고 그 일부인 JWT 토큰의 역할

### Open Questions

## ADR001. Monolithic to Microservices

### Context
- 현 시점으로 내가 경험하고 있는 서비스(루티 프로)는 마이크로서비스로 전환하기에 적합한가?
  - 현재 서비스는 마이크로서비스로 전환하기에 적합하지 않다.
  - 가장 큰 원인으로는, 관리하는 사람이 절대적으로 적다.
  - 총 7명이 해당 서비스에 집중하고 있으며, 백엔드 개발자 2명, 프론트엔드 개발자 2명이다.
  - 각 서비스로 쪼갠다면 이 서비스를 관리하기에는 리소스가 턱없이 부족하다.
- 일부만 전환해야 한다면, 어떤 것을 먼저 전환해야 할까?
  - 그럼에도 필요에 의해 일부를 분리할 수 있을 것이다. 첫 번째 대상으로는 엑셀 서비스가 될 것이다.
  - 엑셀 서비스는 대량의 데이터를 수용할 수 있어야 하며, 적지 않은 수의 스레드를 점유한다.
  - 또한, 후속 처리가 필요한 이벤트가 있기에 한 번 엑셀이 업로드되면, 다른 유저에게 지연이 발생하게 될 것이다.
  - 이를 해결하기 위해서 해당 서비스를 분리해 트래픽을 분산할 수 있다.

### Decision
- 엑셀 서비스를 분리한다.
- 템플릿과 관련 라이브러리는 엑셀 서비스로 옮긴다.

### Consequences
- API Endpoint 변경이 필요하다.
  - Strangler Fig: 점진적 마이그레이션을 위해 처음엔 API Endpoint는 유지하고, 기존 서비스 내에서 엑셀 서비스를 호출하는 방식 적용한다.
- 배포 및 부하 독립성을 확보한다.
- 기존 디비는 유지하고, 엑셀 서비스에서 해당 디비를 접근하도록 한다.
  - 추후 이벤트 기반 통신으로 변경하면, 각 데이터를 이벤트로 전송한다.

## ADR002. Domain Coupling
- createdDate: 2025-10-23
- updatedDate: 2025-10-24

### Context
#### 우리 서비스에서 현재 발생하는 도메인 결합이 어떤게 있는가?
##### Order, Dispatch 간 결합
- 기본 설명
  - Order: 유저의 요청
  - Dispatch: 유저의 요청을 배송하기 위한 차량 배차
  - 우리 서비스 역사적으로 가장 유명한 결합이다.
  - 과거에는 dispatch 내 orderId 를 두어 결합이 발생했다. 현재에는 mapping 테이블을 두고 서로를 매핑하고있어 이전보다는 느슨해졌다.

#### 도메인 결합을 점진적으로 줄여나가기 위해서는 어떤 방식을 채택해야 하는가?
- 결합
  - 상태 변경이 해당한다. order와 dispatch는 서로의 상태에 관심이 있다. dispatch가 confirmed로 변경되면, order는 ready로 변경된다.
  - 해당 상태를 컨트롤하는 API는 여러 개로 분산되어있다.
  - 애초부터 이 둘의 상태 연관관계가 맺어진 것이 문제였을까? 점진적으로 나아가기 위해서는 어떤 방식이 필요한가?
    - 사실 현재 서비스에서도 상태의 연관은 맺어져있지 않다.
    - 다만 service layer에서 두 상태를 관리하는 주체가 있다.
    - Service layer에서는 domain layer로 요청만 보내야 하지, 값을 직접 컨트롤하면 안 된다.
    - 이는 내용 결합으로 표현될 수 있다.
  - 둘은 상/하 관계일까? 동등한 관계일까?
    - 지금은 동등한 관계라고 표현할 수 있을 것 같다.

### Decision
- 상태 변경 로직은 domain model에 응집한다.
  - Service layer에서 값을 직접 입력하는 것이 아니라, domain model 메소드에 요청하도록 한다.
  - 상태 변경 관련 비즈니스 규칙은 domain model만 확인하면 된다.
- 분산된 상태 변경 관련 service 및 api를 응집한다.
  - 처음부터 합치지 않고, api endpoint를 만들어서 client가 모두 해당 endpoint를 호출할 수 있도록 유도한다.

### Consequences
- 유저가 상태 변경을 못 할 수도 있다. 기존 API를 사용하는 client에서 변경된 API를 더이상 사용하지 못할 수 있다. 놓치지 않도록 한다.
- 각 api, service 별 상태 변경 로직이 다를 수 있다. 이는 잘 파악해서 먼저 도메인 로직에 응집할 수 있도록 한다.

## ADR003. Migrate to Excel
- createdDate: 2025-10-26
- updatedDate: 2025-10-26

### Context

엑셀 서비스가 별도로 구성되었다고 가정한다. 다음과 같은 상황 및 결정이 있다.
<img width="556" height="429" alt="Image" src="https://github.com/user-attachments/assets/1fc85239-0d17-49b8-90bc-f52db4a23a51" />
1. 운영 중인 서비스이며, 가장 높은 신뢰성이 요구되는 서비스이기 때문에 한 번에 옮기기에는 리스크가 크다고 판단했다.
2. 기능이 계속해서 추가되고 변경되기 때문에 옮겨진 서비스가 방치되는 시간이 길어지면 안 된다.
3. 비용의 부담으로 인해 데이베이스 분리 없이 기존 데이터베이스를 연결한다.
4. 주로 엑셀 업로드 시 부하가 발생하기 때문에 해당 부하를 분산하기 위해 엑셀 서비스를 우선적으로 분리한다.

### Decision
- 한 번에 옮기기에는 리스크가 있다고 판단하기 때문에 점진적 마이그레이션을 택한다. 대신, 이상적으로 생각하는 아키텍처의 결과를 항상 되뇌자.
- 점진적 기능 추가 및 마이그레이션에 유용한 교살자 무화과 패턴을 사용하자. 기능이 계속해서 추가되고 변경되기 때문에 코드를 중복해서 서비스를 구동하고, 이를 유지하기에는 부담이 있기 때문이다.
- API 엔드포인트는 유지하고, 서비스를 하나씩 옮기자. 옮겨진 서비스는 새로운 API 엔드포인트를 갖게 되고, 기존 호출되던 API는 새로운 API를 호출하게 하자.
- 기존 서비스와 엑셀 서비스에서 의존하던 코어 모듈은 공통적으로 사용할 수 있도록 라이브러리화 한다.
- 서비스가 모두 옮겨진 후 문제가 발생하지 않는다면, 해당 엔드포인트를 프론트엔드에서 최종 변경한다.

### Consequences
- 새로운 API 호출 시 규격 일치
- 엑셀에 의존하는 기존 서비스 파악
- 코어 모듈 라이브러리화

## ADR004. Is REST the best?
- createdDate: 2025-10-30
- updatedDate: 2025-10-30

### Context
#### 현재 우리 서비스에서 REST는 적절한 선택이었을까?
대부분의 기능에 대해서는 적절하다고 생각한다. 특정 도메인의 생성을 요청하고, 수정 및 조회에 따른 결과물이 각 페이지 별로 제공되기 때문이다.
그리고 이 과정에서는 동기적인 요청 및 응답 방식이 요구되고, 사실상 클라이언트와의 통신에 있어서 표준 방식으로 요구되기 때문이다.

하지만 일부 기능에 대해서는 적절하다 생각하지는 않는다. 이를테면,
1. 엑셀 업로드
  - 엑셀 업로드는 요청과 응답이 꼭 동기적인 방식으로 이루어지지 않아도 괜찮다. 물론, 엑셀의 기본 검증 결과는 반환받아야 하지만, 그 이후의 일은 신경쓰지 않아도 되기 때문이다.
  - 사용자에게는 기본 검증이 완료되면 무조건 올라간다는 보장을 제공해야 하고, 서비스 또한 그렇게 동작해야 한다. 기본 검증 이후에는 기다릴 필요가 없다는 뜻이다.
  - 그러기 위해서는 엑셀의 비동기성 처리가 필요한데, 이를 메시징으로 처리할 수 있다는 생각이 든다. 각 데이터를 메시지로 발행하고, 이를 소비하면 각 데이터가 생성되는 방식이다.
  - 하지만 실패한다면 모든 데이터의 트랜잭션 처리는 어쩌면 좋을지에 대해 고민이 필요하다.
2. 각 페이지 별 조회
  - 각 페이지 별 조회가 있지만, 일부 상이한 필드로 인해 여러 개의 API를 생성하고 있다. 이는 유지관리의 생산성에 크게 도움되지 않는다.
  - 클라이언트에서 요구하는 필드는 상이하지만, 값이 같다면 GraphQL을 고려해봐도 괜찮을 것 같다. 페이지에 상관없이 조회하고자 하는 도메인 데이터는 조합해서 불러올 수 있기 때문이다.
  - 하지만 아직 고민이 필요한데, 수정 및 생성에 있어서 GraphQL은 적절하다는 생각이 들지 않는다. 통일성 측면에서도 기존 REST로 자리잡힌 인터페이스와 달라져, 리소스가 적게 들지는 않을 것 같다.

### Decision
- 엑셀 업로드 시 각 데이터 별로 메시지를 발행하는 방식을 사용한다.
  - 별도 큐를 사용하기에는 비용적인 측면을 고려해야 하므로, 스프링 내부 이벤트를 발행하도록 한다.
  - 엑셀 업로드 로직은 특정 도메인의 데이터를 생성하기 위해 특별한 작업을 하지 않고, 이벤트만 발행하면 되므로 결합도를 낮추는데 도움이 된다.

### Consequences
- 엑셀 업로드 시 특정 데이터에 오류가 났을 때, 트랜잭션 처리가 제대로 되는지 확인이 필요하다. 그리고 이를 사용자가 인지할 수 있도록 해야한다.

## INTERVIEW-001. What are microservices?
- createdDate: 2025-11-05
- updatedDate: 2025-11-05

### Answer
Microservices are independently deployable services modeled around a business domain.

#### Key
- Independent deployment: each service can be deployed without affecting others
- Business domain focus: organized around capabilities like "orders" or "payments", not technical layers
- Decentralized data - each service owns its data

The key phrase is "independently deployable" - this is what distinguishes microservices from other service-oriented approaches.

### What NOT to say
- Small services: size is relative and not the defining characteristic
- Using containers: deployment mechanism, not architecture

### Follow-up prepared
- Benefits: technology heterogeneity, resilience, independent scaling
- Challenges: distributed transactions, operational complexity, monitoring

### Connection to experience
- Decided against full migration due to operational overhead
- Shows understanding of trade-offs, not just blindly following trends

## INTERVIEW-002. When would you not use microservices?
- createdDate: 2025-11-05
- updatedDate: 2025-11-05

### Situation
At my current company, the product team wanted to migrate our service to microservices architecture for "scalability". Our team has 7 people total - 2 backend developers, 2 frontend developers, and others

### Tasks
I needed to evaluate whether microservices were appropriate given our team capacity and system complexity, and provide a recommendation with clear reasoning.

### Action
- Analyzed the operational overhead: each microservice needs monitoring, deployment pipelines, on-call rotation
- Calculated team capacity: with 2 backend developers, managing multiple service would spread us too thin
- Researched industry examples: found that team under 10-15 people typically struggle with microservices overhead
- Proposed an alternative: extract only the Excel service which had the highest resource consumption and different load patterns

### Result
- Avoided introduction 10x operational complexity with a small team
- Still achieved key benefits by extracting the Excel service for independent scaling
- Team remained productive and focused on delivering features
- Kept the migration path open for future growth when team size justifies it
- This decision was documented and accepted by leadership

### Key points to emphasize
- Show maturity: knowing when NOT to use a pattern
- Quantify: 7 people, 2 backend developers, 10x complexity
- Offered alternative solution, not just "no"
- Data-driven decision, not opinion

## INTERVIEW-003. What are the main challenges of microservices?
- createdDate: 2025-11-06
- updatedDate: 2025-11-06

### Answer
From my study and experience, I'd highlight four main challenges - remember them as DMOT

#### Distributed Transactions (D)
- Problem: No ACID guarantees across services
- Solution: Saga pattern with compensating transactions
- Example: Order -> Payment -> Inventory flow

#### Monitoring & Debugging (M)
- Problem: Logs scattered across multiple services
- Solution: Distributed tracing with correlation IDs, centralized logging
- Example: One Excel upload request touches 3 services

#### Operational Complexity (O)
- Problem: 10x deployment complexity vs monolith
- Solution: Strong CI/CD, container orchestration, automation
- Example: Need comprehensive automated testing

#### Testing (T)
- Problem: Integration tests become expensive and slow
- Solution: Consumer-driven contract tests
- Example: Each service has contract tests with dependencies

### Important
- Don't just list problems
- Always mention solutions and show I've thought the challenges

### Connection to experience
- Operational complexity was key factor in decision
- Planning to implement Saga pattern

## INTERVIEW-004. How do you ensure resilience in microservices?
- createdDate: 2025-11-06
- updatedDate: 2025-11-06

### Answer
The key concept is the Bulkhead pattern

isolate failures so they don't cascade

Like compartments in a ship, one breach doesn't snk the whole vessel

#### Four key techniques
1. Timeouts: Don't wait forever for downstream services(e.g. 3-seconds timeout)
2. Circuit Breakers: Stop calling a failing service temporarily, fail fast
    - Open circuit after N failures
    - Try again after cooldown period
3. Fallbacks: Degrade gracefully instead of complete failure
    - Return cached data
    - Return default/static response
    - Show partial results
4. Resource Isolation: Separate thread pools per dependency
    - payment service gets its own thread pool
    - If it's slow, doesn't block other operations

#### Example from my work
I extracted Excel service because
- Excel upload failures were affecting order processing
- By separating services: physical isolation
- Using async messaging: temporal isolation
- Independent databases: data isolation

This is bulkhead pattern in practice

## INTERVIEW-005. What's the difference between microservices and SOA?
- createdDate: 2025-11-07
- updatedDate: 2025-11-07

### Answer
Both are about services, but different philosophy

| Aspect        | SOA                               | Microservices                             |
|---------------|-----------------------------------|-------------------------------------------|
| Goal          | Enterprise-wide integration       | Team independence                         |
| Communication | ESB (smart pipes, dumb endpoints) | HTTP/events (dumb pipes, smart endpoints) |
| Data          | Often shared databases            | Database per service                      |
| Governance    | Centralized standards             | Decentralized, team autonomy              |
| Service size  | Larger, more coarse-grained       | Smaller, focused                          |

#### Key phrase
Microservices are about maximizing team independence, while SOA focused on enterprise-wide reuse

#### What Not to do
- Don't over-explain unless interviewer asks
- Don't say "SOA is old, microservices are new"
- Focus on different goals and design principles

## INTERVIEW-006. At what team size should you adopt microservices?
- createdDate: 2025-11-07
- updatedDate: 2025-11-07

### Answer
There's no magic number, but consider Conway's Law: system design mirrors organizational structure

#### My rule of thumb
- < 10 people: Monolith (unless special circumstances)
- 10-30 people: Modular monolith or extract high-load services only
- 30+ people: Full microservices architecture makes sense

#### But team size alone isn't enough. Also consider
1. Complexity: Can one person understand the entire codebase?
2. Scaling needs: Do different domains have different load patterns?
3. Team structure: Are teams already organized by business domain?
4. Deployment conflicts: Are teams blocking each other's releases?
5. Technology needs: Do some domains need different tech stacks?

#### Real example
- My team: 7 people total, 2 backend developers
- Decision: NOT full microservices
- But: Extracted Excel service due to resource consumption
- Formula: Team size x System complexity = Total overhead

### Key message
It's about complexity and team structure, not just headcount. I've experienced this firsthand
