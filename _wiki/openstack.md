---
layout  : wiki
title   : Openstack
summary :
date    : 2022-01-31 13:50:00 +0900
updated : 2022-01-31 13:50:00 +0900
tag     : cloud-computing
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Openstack
## Installation

|   **Openstack을 설치하기 위한 최소 사양**   |  |
| --- | --- |
|   **Controller Node (Core Component)**   |   CPU Processor 1-2, RAM 8GB, Storage 100GB, 2 NIC   |
|   **Compute Node (Core Component)**   |   CPU Processor 2-4, RAM 8GB, Storage 100GB, 2 NIC   |
|   **Block Storage Node (Optional)**   |   CPU Processor 1-2, RAM 4GB, Storage 100GB, 1 NIC   |
|   **Object Storage Node (Optional)**   |   CPU Processor 1-2, RAM 4GB, Storage 100GB, 1 NIC   |

### Devstack 설치(Ocata)

**Ubuntu 환경에서 Network 환경 설정을 마친 상태를 기준으로 설명한다. (Single Node)**

#### 방화벽 비활성화**
```
# systemctl stop ufw  // 방화벽 중지
# systemctl disable ufw  // 재시작 시 방화벽 자동 실행 비활성화
```

#### 호스트 설정
해당 아이피에 'devstack'이 인식될 수 있도록 설정해준다.(Domain Name과 같다.)
```
# vi /etc/hosts
```

#### Stack User 생성
'stack'이라는 유저를 생성해 'sudo'명령 사용 시 비밀번호를 요구하지 않도록 설정했다.
```
# useradd -s /bin/bash -d /opt/stack -m stack
# echo "stack ALL=(ALL) NOPASSWD: ALL" | tee /etc/sudoers.d/stack
```

이제 stack 유저로 접속하자.
```
# su - stack
```

#### 본격적인 설치

devstack을 git으로 받는데 ocata라는 릴리즈를 사용하도록 한다.
```
$ git clone https://git.openstack.org/openstack-dev/devstack -b stable/ocata
```

```
$ cd ./devstack/
~/devstack$ vi local.conf

// (샘플파일은 '/devstack/sample/local.conf'에 해당한다.)
```

위와 같이 환경을 설정해준다.

현재 목적은 '설치'이기 때문에 최소한의 요구사항만을 설정했다.

```
ADMIN_PASSWORD=stack
```
ADMIN_PASSWORD : 새로 구성하는 openstack의 admin password이다.

HOST_IP : Openstack을 서비스 할 HOST IP를 나타낸다.


이제 모든 환경이 구성되었으니 **Openstack 설치를 시작**하자.

```
~/devstack$ ./stack
...
...
...
```

약 1시간 정도 소요가 된다.

설치가 정상적으로 완료되면 아래와 같은 내용이 출력될 것이다.

[](https://m.blog.naver.com/hyun0524e/221869319612#)[##_Image|t/cfile@995F3A385EA626B92F|CDM|1.3|{"originWidth":800,"originHeight":409,"width":800,"height":409}_##]

**horizon site, keystone site 등 기본적인 서비스들의 웹 주소가 출력된다.**

**# Devstack이 설치될 경로를 지정하지 않으면 `Default Path : '/opt/[username]'`**

[##_Image|t/cfile@999FC53A5EA626BC2D|CDM|1.3|{"originWidth":800,"originHeight":538,"style":"alignCenter","width":800,"height":538}_##]

웹의 로그인 화면


[##_Image|t/cfile@999E483A5EA626BC2D|CDM|1.3|{"originWidth":800,"originHeight":406,"style":"alignCenter","width":800,"height":406}_##]

**위 대쉬보드를 통해 거의 모든 설정을 총괄할 수 있다고 보면 된다.**

