---
layout  : wiki
title   : Docker Swarm
summary :
date    : 2022-01-31 13:00:00 +0900
updated : 2022-01-31 13:00:00 +0900
tags     : container
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Docker Swarm

## Docker Swarm?

![image](https://user-images.githubusercontent.com/60500649/151737760-39abab95-d0df-4450-8b31-d9058aa9cc8d.png)


**컨테이너 오케스트레이션** 도구 중 하나 !

**Docker Swarm**은 **초기엔 도커와 별도로 개발**되었지만 Docker 1.12버전부터 **Swarm mode**라는 이름으로 합쳐졌어요. (다른 툴을 설치할 필요가 없다는게 장점이에요)

**컨테이너 오케스트레이션이란?**

- 여러 컨테이너의 배포 프로세스를 최적화를 목적으로 해요.

- 컨테이너와 호스트 수 증가에 따라 점점 가치있는 기능이에요.

ex) kubernetes, docker swarm, apache mesos

모두 각각의 장점을 갖고 있는 도구들이지요.

## 용어

Docker Swarm에서 주로 사용하는 용어를 알아볼게요.

### node
스웜 클러스터에 속한 도커 서버의 단위 (1 서버 = 1 노드)

### manager node
스웜 클러스터를 관리하는 노드 (워커노드로의 역할도 가능)

### worker node
매니저 노드의 명령을 받아 컨테이너를 생성 후 상태를 체크하는 노드

### service
기본적인 배포 단위   하나의 서비스는 하나의 이미지를 기반으로 생성

### task
컨테이너 배포 단위   하나의 서비스는 여러개의 테스크를 실행 (각 테스크가 컨테이너 관리)

## Docker Swarm이 제공하는 기능

### 스케줄링 - scheduling

서비스를 만들면 컨테이너를 워커노드에 배포해요. 현재는 균등하게 배포하는 방식만 지원하며 추후 다른 배포 전략이 추가될 예정이에요. 노드에 라벨을 지정하여 특정 노드에만 배포할 수 있고 모든 서버에 한 대씩 배포하는 기능(Global)도 제공해요. 서비스 별로 CPU, Memory 등의 자원 사용량을 미리 지정할 수도 있어요.

### 고가용성 - high available

여러 개의 매니저 노드를 운영할 수 있어요. 여러 대 중 1대가 죽어도 클러스터는 정상적으로 동작하지요. 지정하는 방법은 간단해서 쉽게 관리할 수 있는게 장점이에요.

### 멀티 호스트 네트워크 - multi host network

SDN(Software Defined Network)를 지원해 여러 노드에 분산된 컨테이너를 한 네트워크로 묶을 수 있어요. 각 컨테이너는 독립된 IP가 부여되고 서로 다른 노드에 있어도 할당된 IP로 통신을 할 수 있어요. (꼭 IP를 알아야하는건 아니에요!)

### 서비스 디스커버리 - service discovery

컨테이너를 생성하면 서비스명과 동일한 도메인을 등록하고 컨테이너가 멈추면 도메인을 제거하는 기능이에요.

### 순차적 업데이트 - rolling update

서비스를 새로운 이미지로 업데이트하는 경우 차례차례 업데이트해요. 이 또한 조정이 가능한 부분이 있답니다. ex) 동시 업데이트 작업의 수, 업데이트 간격 등

### 상태 체크 - health check

컨테이너와 특정 쉘 스크립트가 정상적으로 실행이 되어있는지에 대한 여부를 체크할 수 있어요. 컨테이너만 실행되었다고 원하는 모든 서비스가 실행되는 것은 아닐 수도 있으니 오류에 대한 디테일한 부분을 체크할 수 있어요.

### 비밀값 저장 - secret management

비밀번호를 스웜 어딘가에 생성하고 컨테이너에서 읽을 수 있어요. 비밀 값을 관리하기 위한 외부 서비스를 설치하지 않아도 더욱 쉽게 사용이 가능하죠.

### 로깅 - logging

같은 노드 뿐 아니라 다른 노드에 속해있는 모든 서비스, 컨테이너의 로그를 한 곳에서 볼 수 있어요.

### 모니터링 - mornitoring

아쉽게도 리소스에 대한 모니터링은 제공하지 않은가봐요. prometheus, grafana 등을 설치해야 한답니다.

### 반복작업 - cron

직접적인 제공은 하지 않지만 구현하면 돼요.

## Docker Swarm 본격적으로 다뤄보기

![image](https://user-images.githubusercontent.com/60500649/151737790-f66f04b0-4cc8-4646-899b-c0791c9067c7.png)


### Swarm 클러스터 생성하기

클러스터의 생성은 매니저 노드를 우선 생성 후 매니저 노드가 만들어낸 토큰으로 워커 노드에서 접속을 하면 돼요.

1. 매니저 노드를 설정

```
docker swarm init --advertise-addr 192.168.10.30
```

만들어진 후 출력되는 문구에요. 친절하게도 워커 노드에서 입력 할 명령어도 같이 출력되네요.

```
Swarm initialized: current node (jxqyen7d62f8666usvyncdesj) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join \
    --token SWMTKN-1-3owa7yc5eurovnng69piyuul2ntwx7id5y65f17a13royob59x-cdlskzv3oprfhr1ust0vaha6y \
    192.168.10.30:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

2. 워커 노드를 설정

```
docker swarm join \
    --token SWMTKN-1-3owa7yc5eurovnng69piyuul2ntwx7id5y65f17a13royob59x-cdlskzv3oprfhr1ust0vaha6y \
    192.168.10.30:2377
```

**매니저 노드에서 확인**

```
docker node ls
```

```
ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
jxqyen7d62f8666usvyncdesj *  manager   Ready   Active        Leader
z2pqxnhynhqi8zexos2e9vqrr    worker    Ready   Active
```

### 서비스 생성하기

서비스를 생성할 때에는 **service create** 명령을 이용해요.

```
docker service create --name web \
--replicas 2 \
-p 1234:80 \
nginx
```

간단한 서비스를 생성해보았어요.

**nginx** 를 이용하면서 **80번 포트(http)** 를 로컬호스트의 **1234 port 로 포워딩** 해 오픈했습니다.

이 서비스가 잘 생성이 되었는지는**service ls** 명령으로 확인합니다.

```
ID            NAME  MODE        REPLICAS  IMAGE
dq3ziht006hp  web   replicated  2/2       nginx:latest
```

REPLICAS 2/2 인 것을 보니 컨테이너가 생성이 된 것을 알 수 있어요. (0/2라면 컨테이너 생성이 아직 되지 않은거에요)

서비스에 대한 내용을 더욱 자세히 **service ps [name]** 명령을 입력합니다.

해당 컨테이너가 어떤 노드에서 실행이 되는지도 확인이 가능해요 !

```
ID            NAME   IMAGE         NODE     DESIRED STATE  CURRENT STATE           ERROR  PORTS
y2xnvynjnx0g  web.1  nginx:latest  worker   Running        Running 29 seconds ago
mb5p4htkivl7  web.2  nginx:latest  manager  Running        Running 29 seconds ago
```

### 서비스 테스트

```
curl 192.168.10.30:1234
curl 192.168.10.40:1234
```

output

```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

정상적으로 출력이 되는 것을 확인 할 수 있어요.

### Replica 설정 변경

```
docker service scale [name]=[size]
```

**컨테이너가** 정상적인 작동을 하지 못 한다면 어떻게 될까요?

```
docker stop [container id]
```

```
[root@worker ~]# docker ps -a
CONTAINER ID        IMAGE                                                                           COMMAND                  CREATED             STATUS                     PORTS               NAMES
3da83f90c97b        nginx@sha256:30dfa439718a17baafefadf16c5e7c9d0a1cde97b4fd84f63b69e13513be7097   "nginx -g 'daemon ..."   3 seconds ago       Created                                        web.2.hy2w3dzlbhwbrm0bwhikqu9nr
c7cab1af6e25        nginx@sha256:30dfa439718a17baafefadf16c5e7c9d0a1cde97b4fd84f63b69e13513be7097   "nginx -g 'daemon ..."   12 seconds ago      Exited (0) 3 seconds ago                       web.2.v536ntebpgn69cjkkoewpai1u
```

멈추었던 컨테이너 대신에 **추가로 컨테이너가 만들어지고** 있어요 !

이 상황에서의 작업은 **컨테이너 오케스트레이션의 목적을 분명히** 드러냅니다.

생성되어진 여러 컨테이너 중 한 컨테이너라도 서비스 불가 상태가 된다면 바로 다른 컨테이너가 생성되어 대체를 하게돼요.

놀랍지 않나요? 고작 명령어 몇 줄 입력했을 뿐인데

### 서비스 삭제

```
docker service rm web
```

생성되었던 서비스는 물론이고 해당하는 레플리카(컨테이너)까지 모두 사라져요 !

### 노드 제거

자신에게**해당하는 노드에서 떠나는**(?) 명령을 사용해요. (worker부터 진행)

```
docker swarm leave
```

```
ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
jxqyen7d62f8666usvyncdesj *  manager   Ready   Active        Leader
z2pqxnhynhqi8zexos2e9vqrr    worker    Down    Active
```

manager에서 다른 노드의 down 확인을 먼저해요. 후엔**node rm 명령**을 이용해서 노드를 삭제한답니다.

```
docker node rm worker
```

삭제 후

```
ID                           HOSTNAME  STATUS  AVAILABILITY  MANAGER STATUS
jxqyen7d62f8666usvyncdesj *  manager   Ready   Active        Leader
```

**혼자남은 manager에서도 떠나면 됩니다.**

```
docker swarm leave
```

## Swarm에서 주로 쓸만한 명령어

docker swarm --help

### Worker -> Manager
```
docker node promote [hostname]
```

### Manager -> Worker
```
docker node demote [hostname]
```

### 토큰 확인
```
docker swarm join-token manager 또는 worker
```
