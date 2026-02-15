---
layout  : wiki
title   : Docker
summary :
date    : 2022-01-31 11:00:00 +0900
updated : 2022-01-31 13:00:00 +0900
tags     : container
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Docker
## Docker Network
### Docker Network 구조와 종류는 어떨까? - 1/2

#### Docker Network의 구조를 파악해보자 !

**컨테이너 내부**에서 **인터페이스 를 확인** 해봅시다.

```
docker exec [container-id] ifconfig
```

**output:**

```
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)
        RX packets 4093  bytes 14274253 (14.2 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 3092  bytes 171175 (171.1 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

확인해보니 일반 호스트와 다를게 없네요? **eth0, lo Interface**와 **172.17.0.0/16** 대역을 갖고 있음을 확인 했어요.

**'172.17.0.2'** 는 해당하는 Subnet(172.17.0.0/16)에서 컨테이너에 **순차적으로 IP를 할당**하게 되어있어요.

또, 재시작 시 변경될 수도 있답니다.

해당 Subnet은 Docker Container 내부에서 할당하는 대역이에요. 즉, **바깥과 통신하기 위한 무언가**가 필요하다는 말이죠.

**HOW?**

그렇다면 이 대역은 어떻게 바깥 네트워크 대역과 통신이 가능할까요?

이런 과정은 'Host'에서 컨테이너를 실행할 때마다 생성되는 **veth... Interface**와 연관이 있어요.

Docker는 각 컨테이너의 외부 연결을 위해 **컨테이너마다 가상 인터페이스를 하나씩 생성해주어야 합니다.**

**따로 생성해주지 않아도 네트워크는 잘 되는데요?**

맞아요! 사실 가상 인터페이스는 사용자가 직접 생성하는 것이 아닌 도커 엔진에서 자동을 생성한답니다. veth...라는 이름으로 말이죠.

veth : virtual ethernet

컨테이너를 생성한 **'Host'** 에서 **인터페이스를 확인** 해봅시다.

```
ifconfig
```

**output:**

```
docker0   Link encap:Ethernet  HWaddr 02:42:bf:83:fa:71
          inet addr:172.17.0.1  Bcast:172.17.255.255  Mask:255.255.0.0
          inet6 addr: fe80::42:bfff:fe83:fa71/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:3092 errors:0 dropped:0 overruns:0 frame:0
          TX packets:4085 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:127887 (127.8 KB)  TX bytes:14273605 (14.2 MB)

ens33     Link encap:Ethernet  HWaddr ...

lo        Link encap:Local Loop...

veth23890e1 Link encap:Ethernet  HWaddr 32:14:59:53:c6:30
          inet6 addr: fe80::3014:59ff:fe53:c630/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:3092 errors:0 dropped:0 overruns:0 frame:0
          TX packets:4093 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:171175 (171.1 KB)  TX bytes:14274253 (14.2 MB)
```

**end33, lo, veth.. 그리고 docker0 Interface가 확인되었어요.**

생성된 가상 인터페이스는 **docker0이라는 'Bridge'** 도 존재하는데, 이 인터페이스는 **각 veth...와 바인딩 되어 호스트 외부 인터페이스와 이어주는 역할**을 해요.

아래 구성을 보시면 이해가 더 쉬울겁니다!

![image](https://user-images.githubusercontent.com/60500649/151731540-318a5d2d-4687-49fa-af8a-f4e101042aa8.png)


실제로 바인딩이 되었는지 확인

```
# brctl show docker0
bridge name     bridge id               STP enabled     interfaces
docker0         8000.0242bf83fa71       no              veth23890e1
```

이번 포스팅은 Docker Network 구조에 대해서 알아보았습니다 !

정말 흥미로운 친구이지만 그 만큼 알아야 할 부분도 많겠지요.


### Docker Network 구조와 종류는 어떨까? - 2/2

#### Docker Network의 종류를 알아보자 !

저번 포스팅에서 컨테이너를 생성하면 기본적으로 docker() 브리지를 통해 외부와 통신할 수 있는 환경을 사용할 수 있다는 설명을 드렸어요.

그렇지만, 사용자의 선택에 따라 다양한 네트워크 드라이버를 사용할 수 있답니다.

Docker에서 제공하는 네트워크 드라이버 중 대표적인 것은 **브리지, 호스트, 논, 컨테이너, 오버레이**가 있어요.

저는 이 중 오버레이를 제외한 드라이버에 대해 설명을 드릴게요!

**먼저 도커의 네트워크 리스트를 볼까요?**

```
docker network ls
```

output:

```
NETWORK ID          NAME                DRIVER              SCOPE
82624d630045        bridge              bridge              local
2531da1527a7        host                host                local
b4a85ae68d7c        none                null                local
```

**이미 bridge, host, none 네트워크가 존재함을 알 수 있어요.**

bridge 네트워크는 아시다시피 컨테이너를 생성하면 docker() 브리지를 자동으로 연결하는데 활용해요.

**docker network inspect [network]**

: 네트워크의 자세한 정보를 살펴볼 수 있어요!

```
docker network inspect bridge
```

output:

```
...
"Config": [
{
	"Subnet": "172.17.0.0/16"
}
]
...
"Containers": {
...
```

**Config**

: 서브넷과 게이트웨이 등을 확인할 수 있어요.

**Containers**

: 해당 네트워크를 사용 중인 컨테이너를 확인할 수 있어요.

> **역시 아무런 설정 없이 컨테이너를 생성하면 docker() 브리지를 사용하겠죠?**

#### Bridge Network

저번 포스팅에서 설명한 **docker() 브리지와 비슷한 구조**에요. 브리지 네트워크는 **사용자가 새로 정의한 브리지를 각 컨테이너에 연결하는 네트워크 구조**랍니다. (마찬가지로 외부와 통신을 할 수 있죠!)

새로운 브리지를 생성하려면 아래의 명령어를 입력해주세요.

```
docker network create --driver bridge newbr
```

output:

```
e163895231fc2f8995026a7b9d29b556626517c7a624e1fdc8869990c023a2e8
```

생성이 완료되었어요. 여기서 'newbr'는 생성한 브리지 네트워크의 이름이랍니다.

손수 만든 네트워크를 생성하는 컨테이너에 적용하고 싶나요?  **--net [network] 옵션만 붙여주면 된답니다!**

```
docker run -itd --name ubuntu_test --net mybr ubuntu
```

호스트에 네트워크 인터페이스를 확인해보면

```
ifconfig
```

output:

```
br-e163895231fc Link encap:Ethernet  HWaddr 02:42:29:51:f4:30
          inet addr:172.18.0.1  Bcast:172.18.255.255  Mask:255.255.0.0
          inet6 addr: fe80::42:29ff:fe51:f430/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:0 (0.0 B)  TX bytes:648 (648.0 B)
```

와우..! **브리지 형태의 새로운 네트워크 대역을 가진 인터페이스가 생성**된 것을 확인할 수 있네요.

컨테이너에 정의한 네트워크는 **'docker network disconnect/connect'** 명령으로 유동적이게 붙이고 뗄 수 있어요.

```
docker network disconnect mybr ubuntu_test
docker network connect mybr ubuntu_test
```

정말 간단한 것 같아요.

아래는 **네트워크의 서브넷과 게이트웨이, IP 할당 범위 등을 임의로 설정해 네트워크를 생성**하는 명령이에요.

```
docker network create --driver=bridge \
--subnet=192.168.0.0/24 \
--ip-range=192.168.0.0/25 \
--gateway=192.168.0.1 \
mybr
```

mybr이라는 이름의 브리지 네트워크를 생성했어요! subnet 대역은 '192.168.0.0/24'를 사용하며, 할당에 대한 범위를 'prefix 25'만큼 주었고 게이트웨이는 '192.168.0.1'이 되겠네요.

#### Host Network

호스트 네트워크는 간단합니다.

```
docker run -itd --name ubuntu_test --net host ubuntu
```

위 브리지 네트워크같이 별도로 생성할 필요 없이 **'host'라는 이름의 네트워크를 바로 사용이 가능하기 때문**이죠.

컨테이너 내부의 아이피를 확인해볼게요.

```
br-e163895231fc: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.18.0.1  netmask 255.255.0.0  broadcast 172.18.255.255
...

docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
...

ens33: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.10.100  netmask 255.255.255.0  broadcast 192.168.10.255
...
```

신기한 노릇이네요. 호스트 머신의 네트워크 인터페이스의 내용이 일치합니다!

더군다나 호스트 머신에서 설정한 호스트 이름도 컨테이너가 그대로 가져갔네요.

**바로 이 점에서 호스트 네트워크의 특징이 주목되는데요.**

컨테이너의 네트워크를 'Host'로 설정하게 된다면 컨테이너 내부의 애플리케이션을 별도의 포트 포워딩없이 바로 서비스 할 수 있어요. 마치 실제 호스트 머신에서 동작하는 것과 같이요!

ex) 호스트 네트워크를 사용하는 컨테이너에서 웹 서버를 구동한다면 호스트의 IP와 컨테이너의 아파치 웹 포트인 80번 포트로 바로 접근이 가능합니다.

이런 구조를 그림으로 표현해보자면 이런 형식이지 않을까요?

![image](https://user-images.githubusercontent.com/60500649/151731632-3ba72c10-e0f3-4944-a4b1-15385483c949.png)


#### None Network

단어 그대로 아무런 네트워크를 사용하지 않아요. 무슨말이냐고요?

다음과 같이 컨테이너를 생성해봅시다.

```
docker run -itd --name ubuntu_test --net none ubuntu
```

이렇게 생성한 호스트의 내부 네트워크를 확인해보면

```
docker exec ubuntu_test ifconfig
```

output:

```
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1  (Local Loopback)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

**lo 인터페이스 외에는 존재하지 않는** 것을 알 수 있어요. 이는 곧 외부와의 단절이라는 뜻입니다!

#### Container Network

다른 컨테이너의 네트워크 네임스페이스 환경을 공유할 수 있어요. 공유되는 속성은 내부 IP, 네트워크 인터페이스의 MAC주소 등이에요.

컨테이너를 생성할 때 **--net 옵션으로 container:[container ID]** 를 입력해주면 돼요!

```
docker run -itd --name ubuntu_test1 ubuntu
docker run -itd --name ubuntu_test2 --net container:ubuntu_test1 ubuntu
```

**네트워크 인터페이스를 확인해볼까요?**

```
docker exec ubuntu_test1 ifconfig
docker exec ubuntu_test2 ifconfig
```

output:

```
# ubuntu_test1
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.3  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:ac:11:00:03  txqueuelen 0  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        
        
# ubuntu_test2
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.3  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:ac:11:00:03  txqueuelen 0  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
```

결과는 동일하네요.

**마치 Host Network의 특징에서 관계만 Host - Container가 아닌 Container1 - Container2로 바뀐 것 같아요!**

이해하기 쉽게 그림으로 표현하자면 이런 모습이랍니다.

![image](https://user-images.githubusercontent.com/60500649/151731649-748e41d0-67e8-4ee8-9c84-2029807ac72c.png)


## Docker Volume

우리는 도커를 사용하면서 약간의 불편함을 겪었어요.

너무나도 간편하게 컨테이너를 생성하고 지울 수 있는 도커이지만 실수로 삭제했을 때는 복구가 불가능하다는 것이죠.

**왜요?.. 자세하게 설명해주세요!**

도커 이미지로 컨테이너를 생성하면 해당 이미지는 읽기 전용이 돼요. 이 때는 컨테이너의 변경 사항들만 별도로 저장해서 각 컨테이너의 정보를 보존하죠.

예를 들어, 우리가 httpd 이미지로 컨테이너를 생성했을 때 웹에 대한 접속 로그는 httpd 컨테이너에 남게 되는 것처럼 말이에요.

이 구성은 아래 그림과 같은 구조를 연상시킨답니다.

![image](https://user-images.githubusercontent.com/60500649/151731152-0e3094f2-6efa-4088-97f2-392fc5e5ffa1.png)

이미 생성된 이미지는 어떠한 경우로도 변경되지 않으며, 컨테이너 계층에 원래 이미지에서 변경된 파일시스템 등을 저장합니다. (httpd log 처럼 말이죠)

하지만 아까 언급했던 것처럼 컨테이너를 삭제하면 컨테이너 계층에 있던 모든 파일과 정보가 사라진다는 점이 가장 치명적인 단점이죠.

**이 상황을 방지하기 위해 컨테이너의 데이터를 영속적(Persistent) 데이터로 활용할 수 있는 방법이 있어요.**

**그 중 가장 활용하기 쉬운 방법이 볼륨을 활용하는 것이랍니다.**

---

**Docker에서 사용하는 볼륨의 종류**

-   Host Volume 공유
-   Volume Container
-   Docker Volume

> **Host Volume 공유**

다음 명령어로 웹 컨테이너를 생성해보아요.

```
docker run -d --name web_hostvolume \
-p 80:80 \
-v ~/test_hostvolume:/usr/test_hostvolume \
httpd
```

-p 옵션으로 컨테이너의 웹 포트를 호스트 80번 포트로 매핑시켰으므로 호스트 IP를 통해 웹접속을 할 수 있어요.

여기서 포인트는 -v 옵션이에요.

-v [호스트의 공유 디렉토리]:[컨테이너의 공유 디렉토리]

즉, 호스트의 ~/test_hostvolume 디렉토리와 컨테이너의 /usr/test_hostvolume 디렉토리를 공유한다는 뜻입니다.

> **이때, 주의해야할 점!**
>
> 1. 컨테이너의 디렉토리는 호스트의 디렉토리에 의해 덮어씌워집니다.  
> 2. 호스트 또는 컨테이너에 해당 디렉토리가 없으면 새로 생성합니다.

제대로 공유가 되는지 컨테이너에서 파일을 생성해보고 호스트에서 공유가 되었는지 확인해볼게요!

```
[컨테이너에서 파일 생성]
docker exec web_hostvolume \
touch /usr/test_hostvolume/test.txt

[호스트에서 공유 확인]
$ cd ~/test-hostvolume
$ ls
test.txt
```

파일이 정상적으로 공유되었군요.

이 상태로 컨테이너를 삭제해볼까요?

```
docker stop web_hostvolume
docker rm web_hostvolume
```

다시 한 번 디렉토리를 확인해보면 데이터가 그대로 남아있는 것을 볼 수 있어요!

```
$ cd ~/test_hostvolume
$ ls
test.txt
```

-v 옵션으로 컨테이너와 호스트의 볼륨을 공유한 것을 그림으로 표현했어요.

![image](https://user-images.githubusercontent.com/60500649/151731230-029708d1-6f6b-40f3-812a-9ed564b111c6.png)

컨테이너와 호스트 간의 디렉토리를 공유하는 것이 아닌 완전히 같은 디렉토리입니다.

> **Volume Container**

-v 옵션으로 볼륨을 공유하던 컨테이너를 다른 컨테이너와 공유하는 방법이에요.

--volumes-from [Container-ID/Name] 옵션을 통해 사용이 가능해요.

첫 번째 공유했던 컨테이너처럼 똑같이 생성합니다. 이 친구가 중간자 역할을 해주는군요.

```
docker run -d \
--name web_hostvolume \
-p 80:80
-v ~/test_hostvolume:/usr/test_hostvolume \
httpd
```

그리고 Volume Container로써 공유받는 컨테이너를 생성합니다.

```
[컨테이너 생성]
docker run -it \
--name web_volumecontainer \
--volumes-from web_hostvolume \
ubuntu:16.04

[파일 공유 확인]
root@2d613e84e9b9:/# cd /usr/test_containervolume/
root@2d613e84e9b9:/usr/test_containervolume# ls
test.txt
```

이런 구조를 그림으로 나타내면 아래와 같겠군요!

![image](https://user-images.githubusercontent.com/60500649/151731250-963398f8-86f8-4519-b622-670240e72df3.png)


그림처럼 여러 컨테이너가 동일한 컨테이너에 --volumes-from 옵션을 사용함으로써 볼륨을 공유해 사용할 수 있어요.

즉, 볼륨을 사용하려는 컨테이너에 -v 옵션 대신 --volumes-from 옵션으로 데이터를 간접적으로 공유받는 방식이에요.

**이 구조를 이용하면 볼륨만 공유하는 '볼륨 컨테이너'역할을 수행할 수 있답니다.**

> **Docker Volume**

docker volume 명령을 사용할 수 있어요.

지금까지의 방법은 호스트와 볼륨을 공유해 컨테이너의 데이터를 보존했어요. 하지만 도커 자체에서 제공하는 볼륨 기능을 이용해 데이터를 보존할 수도 있습니다.

아래 명령어를 입력해 testvolume을 생성해주세요.

```
$ docker volume create --name testvolume
testvolume
```

docker volume ls 명령어로 생성한 볼륨을 확인합니다.

```
$ docker volume ls
DRIVER              VOLUME NAME
local               testvolume
```

볼륨을 생성할 때 플러그인 드라이버를 설정해 여러 종류의 스토리지 백엔드를 쓸 수 있지만 우리는 기본적으로 제공되는 드라이버인 local을 사용할거에요. 이 볼륨은 로컬 호스트에 저장되며 도커 엔진에 의해 생성되고 삭제됩니다!

생성한 볼륨을 사용하는 컨테이너를 만들어볼까요?

-v 옵션을 이용해 만들지만 [Volume Name]:[Container Directory] 형식으로 입력해줘야 한답니다.

```
docker run -it \
--name testvolume_1 \
-v testvolume:/root/ \
ubuntu:16.04

root@c7eb2f1d040e:/# echo hello, volume! >> /root/volume
```

/root 디렉토리에 volume이라는 파일을 생성했어요.

우리는 이제 예상할 수 있습니다. 다른 컨테이너도 해당 볼륨을 사용하면 volume이라는 파일이 있겠구나!

자, 두번째 컨테이너를 생성해봅시다.

```
docker run -it \
--name testvolume_2 \
-v testvolume:/root/ \
ubuntu:16.04

root@2409b6d0d916:~# cat /root/volume
hello, volume!
```

완벽해요! 같은 파일인 volume이 존재하는군요.

이 구조를 그림으로 표현하면 아래와 같아요.

![image](https://user-images.githubusercontent.com/60500649/151731263-39435ffb-69f1-42c2-a3dc-dd88390e1f8a.png)


볼륨은 디렉터리 하나에 상응하는 단위로서 도커 엔진에서 직접 관리하죠.

도커 볼륨도 호스트 볼륨 공유와 마찬가지로 호스트에 저장하긴 합니다!

사실 그냥 이용하는 입장에선 알 필요가 없겠지만 분명 궁금한 분이 계실거에요. 저도 그랬고요 ㅎㅎ

docker inspect 명령어를 사용하면 해당 볼륨이 어디에 저장되는지 알 수 있답니다.

```
$ docker inspect --type volume testvolume
[
    {
        "CreatedAt": "2020-07-16T12:21:21Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/mnt/sda1/var/lib/docker/volumes/testvolume/_data",
        "Name": "testvolume",
        "Options": {},
        "Scope": "local"
    }
]
```

Driver : 볼륨의 드라이버

Label : 볼륨을 구분하는 라벨

Mountpoint : 실제로 어디에 저장이 되었는지

반대로 컨테이너가 어떤 볼륨을 사용하는지 알고 싶다면 아래와 같이 입력해주시면 됩니다.

```
$ docker inspect --type container testvolume_2

.....
"Mounts": [
            {
                "Type": "volume",
                "Name": "testvolume",
                "Source": "/mnt/sda1/var/lib/docker/volumes/testvolume/_data",
.....
```

inspect 명령은 컨테이너, 이미지, 볼륨 등 도커의 모든 구성 단위의 정보를 확인할 때 사용하죠.  
(정보의 종류를 확인할 때는 --type 옵션으로 입력합니다)

사실 Docker volume을 생성할 때에는 docker volume create 명령을 별도로 입력하지 않아도 컨테이너 생성 시 만들어지도록 설정 할 수 있어요.

아래와 같이 컨테이너에서 공유할 디렉터리 위치를 -v 옵션에 입력하면 해당 디렉터리에 대한 볼륨을 자동으로 생성합니다!

```
docker run -it \
--name volume_auto \
-v /root \
ubuntu:16.04
```

그리고, 도커 볼륨을 사용하다보면 불필요한 볼륨이 남아있을 때가 있어요. 볼륨을 사용하는 컨테이너를 삭제해도 볼륨은 자동으로 삭제가 되지 않기 때문인데요.

아래 명령어를 입력하면 한번에 삭제할 수 있어요.

```
docker volume prune
또는
docker volume rm $(docker volume list -q)
```

---

위에 내용들처럼 컨테이너가 아닌 외부에 데이터를 저장하고 컨테이너는 그 데이터로 동작하도록 설계하는 것을 무상태(Stateless)하다고 말합니다. 컨테이너 자체는 상태가 없고 상태를 결정하는 데이터는 외부로부터 제공받죠. 도커를 사용할 때 Stateless하도록 설계하는 것은 아주 바람직합니다. (Stateless 반대는 Stateful)

## Docker Logging

### Container Logging (1/4)

컨테이너 내부에서 어떤 일이 일어나는지 아는 것은 디버깅뿐만 아니라 운영 측면에서도 굉장히 중요해요.

그래서 Application Level에서 로그가 기록되도록 개발해 별도의 로깅 서비스를 쓸 수도 있습니다.

**But!** **도커는 컨테이너의 표준 출력(StdOut)과 에러(StdErr) 로그를 별도의 메타데이터 파일로 저장하고 확인하는 명령어를 제공**하죠.

mysql 이미지의 컨테이너를 생성해 간단한 로그를 남겨볼게요.

```
docker run -d \
--name mysql \
-e MYSQL_ROOT_PASSWORd=password \
mysql
```

mysql 컨테이너는 Foreground 상태로 실행되므로 -d 옵션을 사용해 background 상태로 컨테이너를 생성했어요.

이에 대해 우리는 Application이 잘 동작하는지, 어떻게 동작하는지를 궁금해 할 필요가 있죠.

**docker logs 명령은 우리가 동작에 대한 궁금증을 해소할 수 있도록 도와줍니다.**

```
# docker logs mysql
2020-07-18 04:51:37+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.31-1debian10 started.
2020-07-18 04:51:37+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
2020-07-18 04:51:37+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.31-1debian10 started.
```

docker logs 명령을 통해 우리는 컨테이너 내부에서 출력하는 내용들을 볼 수 있답니다.

한 번, 우리는 -e 옵션을 제외한 방법으로 mysql 컨테이너를 생성해볼게요.

```
docker run -d \
--name nopw_mysql \
mysql
```

이상하네요! 컨테이너가 정상적으로 동작하지 않는군요.

```
# docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                     PORTS               NAMES
d2f57ef971ce        mysql:5.7           "docker-entrypoint.s…"   7 seconds ago       Exited (1) 6 seconds ago                       nopw_mysql
```

컨테이너가 정상적으로 동작하지 않는 위 상황에서 우리는 attach 명령으로 접속할 수도 없고 참 난감합니다.

이때에도 docker logs 명령을 통해서 무슨 문제가 있는지 확인해 볼 수 있어요.

```
# docker logs nopw_mysql
.....
2020-07-18 05:05:15+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
        You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD
```

로그를 통해 우리는 mysql 컨테이너에 대한 password 값이 지정되지 않았다는 것을 알았어요.

로그가 너무 많아 읽기 힘들다면 --tail 옵션으로 출력하는 로그 줄 수를 조절할 수 있습니다.

```
# docker logs --tail 2 nopw_mysql
2020-07-18 05:05:15+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
        You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD
```

추가로, 아래와 같은 옵션들이 있으니 적절한상황에서 효율적으로 사용하길 바랍니다!

> -t : 타임스태프 표시  
> -f : 실시간으로 출력되는 로그들을 스트림으로 확인  
> --since : 유닉스 시간을 입력해 특정 시간 이후의 로그 확인

**로그 데이터 포맷**

기본적으로 컨테이너 로그들은 JSON 형태로 도커 내부에 저장됩니다!

이 파일들은 다음 경로에 컨테이너 ID로 시작하는 파일명으로 저장돼죠. cat, vi 등의 명령으로 json 형태인 것을 확인할 수 있습니다.

```
/var/lib/docker/containers/${CONTAINER_ID}/${CONTAINER_ID}-json.log
```

컨테이너 내부의 출력이 너무 많은 상태로 방치되면 json 파일의 크기가 계속해서 커지는 것은 당연한 일입니다. 이 것이 지속되다보면 호스트의 저장 공간을 엄청 많이 차지하게 돼죠.

이 상황을 방지하기 위해 --log-opt 옵션으로 컨테이너 json 로그 파일의 최대 크기를 지정할 수 있어요.

```
docker run -d \
--log-opt max-size=10k --log-opt max-file=3 \
--name mysql \
mysql
```

max-size : log file의 크기

max-file : log file의 개수


### Container Logging - (2/4)

도커는 컨테이너의 로그를 기본적으로 Json-file로 저장합니다.

**그 밖에도 각종 로깅 드라이버를 사용하도록 설정해 컨테이너의 로그를 수집**할 수도 있죠.

**우리가 다뤄볼 것은 syslog, fluentd, awslogs 입니다.**

#### Syslog

**컨테이너의 로그는 JSON뿐만 아니라 syslog로 보내 저장하도록 설정**할 수 있습니다.

syslog는 유닉스 계열 OS에서 로그를 수집하는 오래된 표준이에요!

Kernel, Security 등 시스템과 관련된 로그, 애플리케이션 로그 등 다양한 종류의 로그를 수집해 저장하죠.

유닉스 계열의 OS에서는 Syslog를 사용하는 인터페이스가 모두 동일해 체계적으로 관리할 수 있어요.

우리는 --log-driver 옵션을 통해  syslog에 로그를 저장하는 컨테이너를 생성할거에요.

아래 옵션으로 컨테이너를 생성하면 syslogtest라는 문구를 출력하고 종료될 겁니다.

```
docker run -d \
> --name syslog \
> --log-driver=syslog \
> ubuntu:16.04 \
> echo syslogtest
```

syslog의 경로는 OS마다 다른데요.

CentOS 같은 경우에는 /var/log/messages, 제가 쓰는 Ubuntu 같은 경우에는 /var/log/syslog 입니다.

```
# cat /var/log/syslog
.....
Jul 18 14:51:21 master fd25400ee4c4[3225]: syslogtest
.....
```

로그를 확인해보니 정상적으로 기록이 되었음을 알 수 있네요.

이러한 syslog는 원격 서버에 설치된다면 로그 옵션을 추가해 로그 정보를 원격 서버로 보낼 수 있죠.

이런 동작을 가능하게하는 rsyslog를 사용해 중앙 컨테이너로 로그를 저장해 볼거에요.

#### rsyslog

```
docker run -it \
-h rsyslog \
--name rsyslog_server \
-p 514:514 -p 514:514/udp \
ubuntu:16.04
```

컨테이너 내부의 rsyslog.conf 파일에서 syslog 서버를 구동시키는 항목의 주석을 해제해 저장합니다.

```
root@rsyslog:/# vi /etc/rsyslog.conf
.....
# provides UDP syslog reception
module(load="imudp")
input(type="imudp" port="514")

# provides TCP syslog reception
module(load="imtcp")
input(type="imtcp" port="514")
```

설정 변경했으니 서비스 재시작!

```
root@rsyslog:/# service rsyslog restart
```

빠져나와 로그를 출력하기 위한 컨테이너를 생성합니다.

```
docker run -itd \
--log-driver=syslog \
--log-opt syslog-address=tcp://192.168.99.100:514 \
--log-opt tag="log" \
ubuntu:16.04 echo "syslog test!"
```

생성한 컨테이너는 syslog test 라는 문장을 외친 후 자동으로 종료됩니다.

--log-opt는 로깅 드라이버에 추가할 옵션을 뜻해요.

syslog-address에서 rsyslog 컨테이너 접근을 위한 주소를 입력하고,

tag는 로그 데이터가 기록될 때 함께 저장될 태그입니다. 주로 로그를 분류할 때 사용하죠.

rsyslog 서버 컨테이너에서 돌아와 로그가 기록되었는지 확인해볼까요?

```
$ docker exec -it rsyslog_server tail /var/log/syslog
.....
Jul 18 14:22:50 192.168.99.100 log[2599]: #033]0;root@0f6ca2286dac: /#007root@0f6ca2286dac:/# exit#015
Jul 18 14:23:11 192.168.99.100 log[2599]: syslog test!#015
```

성공적으로 로그가 기록되었네요. 또 추가한 'log' 태그도 눈에 띄는군요 ㅎㅎ

여기서 추가로 --log-opt 옵션에서는 syslog-facility를 사용할 수 있어요.

이 옵션은 로그를 생성하는 주체에 따라 로그를 다르게 저장하는 것입니다.

예를들어, 여러 애플리케이션 중 mail에서 로그가 출력된다면 mail이라는 파일로 저장을 하는것이죠!

```
docker run -itd \
--log-driver=syslog \
--log-opt syslog-address=tcp://192.168.99.100:514 \
--log-opt tag="maillog" \
--log-opt syslog-facility="mail" \
ubuntu:16.04 echo "syslog test!"
```

이제 서버 컨테이너는 새로운 로그 파일이 생겨 maillog를 저장하게 될 거에요.

```
$ docker exec -it rsyslog_server tail /var/log/mail.log
Jul 18 14:32:31 192.168.99.100 maillog[2599]: syslog test!#015
```

#### etc

**지금까지 사용했던 syslog와 rsyslog는 유닉스 계열 OS에서 사용할 수 있는 가장 기본적인 Logging 방법이었어요. 하지만 별도의 UI를 제공하지는 않지만 logentries, LogAnalyzer 등과 같은 로그 분석기와 연동하면 웹 인터페이스를 활용해 편리하게 로그를 확인할 수 있답니다.**

### Container Logging - (3/4)

도커에서 컨테이너 로그를 수집할 때 각종 드라이버를 통해 다양한 방법으로 컨테이너의 로그를 수집할 수 있죠.

이번에는 도커에서 제공하는 로깅 드라이버 중 fluentd를 사용해볼거에요!

#### fluentd

fluentd는 각종 로그를 수집하고 저장할 수 있는 기능을 제공하는 오픈소스 도구에요.

도커 엔진의 컨테이너 로그를 fluentd를 통해 저장할 수 있도록 플러그인을 공식적으로 제공한답니다.

데이터 포맷을 json 형태로 저장하기 때문에 사용하기도 쉬울뿐더러 각종 저장소(S3, HDFS, MongoDB 등)에도 저장이 가능합니다!

이제 우리는 실습을 통해 fluentd의 프로세스를 이해할거에요. 작업은 아래 시나리오를 기준으로 진행합니다!

![image](https://user-images.githubusercontent.com/60500649/151731749-74a3094f-126f-4342-a04e-ca9e6d8ccdf1.png)


fluentd와 mongoDB를 연동해 데이터를 저장하는 구조에요.

특정 호스트에 생성되는 컨테이너는 하나의 fluentd에 접근하고, fluentd는 mongoDB에 데이터를 저장하죠.

**먼저, mongoDB 컨테이너를 생성합니다.**

```
docker run -d --name mongoDB \
--net host \
mongo
```

mongoDB가 사용하는 포트는 27017으로, 호스트 네트워크를 사용했어요.

**그 다음으로, fluentd 컨테이너를 생성하는 작업을 진행합니다.**

컨테이너를 생성하기 전에 아래와 같은 내용의 fluent.conf 파일을 저장할거에요.

```
<source>
  @type forward
</source>

<match docker.**>
  @type mongo
  database nginx
  collection access
  host mongoDB
  port 27017
  flush_interval 10s
</match>
```

fluentd 서버에 들어오는 로그 데이터를 mongoDB에 전송하고, access라는 이름의 컬렉션에 로그를 저장하며, mongoDB 컨테이너의 포트를 지정한 것이에요.

<match docker.**>는 로그의 태그가 docker로 시작하면 이를 mongoDB에 전달하는 것을 의미합니다!

> 이 예제에서는 mongoDB의 사용자와 비밀번호를 통한 인증 작업을 설정하진 않았어요.  
> 만약 인증 정보를 설정했다면, <match> 태그 안에 사용자 명과 비밀번호를 명시해야해요.  
> user [username]  
> password [password]

파일이 저장되었다면, 저장된 경로에서 다음 명령어를 실행해 컨테이너를 생성합니다! 사용 포트는 24224 랍니다.

```
docker run -d --name fluentd \
--net host \
-v $(pwd)/fluent.conf:/fluentd/etc/fluent.conf \
-e FLUENTD_CONF=fluent.conf \
alicek106/fluentd:mongo
```

기존 도커 허브의 fluentd 이미지는 mongoDB에 연결하는 플러그인이 내장돼 있지 않아요.

그렇기 때문에 플러그인을 설치한 alicek106님의 fluentd:mongo 이미지를 이용합니다.

**이제! 로그를 수집하기 위한 컨테이너를 생성합니다.**

```
docker run -d --name nginx \
--net host \
--log-driver=fluentd \
--log-opt fluentd-address=127.0.0.1:24224 \
--log-opt tag=docker.nginx.webserver \
nginx
```

--log-driver를 fluentd로 설정하고 --log-opt의 fluentd-address 값에 fluentd 서버 주소를 지정해요.

--log-opt tag를 사용함으로써 로그의 태그를 docker.webserver로 <match docker.**> 조건에 맞춰줍니다.

호스트의 80번 포트 웹으로 접속하면 로그가 출력됩니다.

아래는 mongoDB에 접근 로그가 정상적으로 저장되었는지 확인하는 커맨드에요.

```
# docker exec -it mongoDB mongo

> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
nginx   0.000GB

> use nginx
switched to db nginx

> show collections
access

> db['access'].find()
{ "_id" : ObjectId("5f12af73eb0a190009bc6f47"), "container_id" : "f6d0f4b3cd7d27ee1e94b55ea00b1bb2fa2c97d444c42ede20b6408dd8186147", "container_name" : "/nginx", "source" : "stdout", "log" : "/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration", "time" : ISODate("2020-07-18T08:14:33Z") }
```

성공적입니다!

**여기서 기억해야할 포인트는 Docker 엔진이 fluentd 서버에 컨테이너 로그를 전송했고, 이 로그는 다시 mongoDB 서버로 전송해 저장되었다는 것이에요. :)**

### Container Logging - (4/4)

도커에서 컨테이너 로그를 수집할 때 각종 드라이버를 통해 다양한 방법으로 컨테이너의 로그를 수집할 수 있죠.

이번에는 도커에서 제공하는 로깅 드라이버 중 awslogs를 사용해볼거에요!

#### awslogs

AWS(Amazon Web Service)에서는 로그 및 이벤트 등을 수집하고 저장해 시각적으로 보여주는 CloudWatch를 제공합니다!

그렇기에 만약 도커를 AWS EC2에서 사용하고 있다면 다른 도구를 별도로 설치할 필요 없이 컨테이너에서 드라이버 옵션을 설정하는 것만으로 드라이버를 사용할 수 있죠.

구성을 위한 순서는 아래와 같아요.

> 1. CloudWatch에 해당하는 IAM 권한 생성  
> 2. Log Group 생성  
> 3. Log Group에 LogStream 생성  
> 4. CloudWatch의 IAM 권한을 사용할 수 있는 EC2 인스턴스 생성과 로그 전송

CloudWatch를 사용하기 위해선 AWS 계정이 필요합니다! 가입은 간단하기에 따로 설명은 하지 않을게요.

**1. CloudWatch에 해당하는 IAM 권한 생성**

![image](https://user-images.githubusercontent.com/60500649/151731822-aa408839-b6ca-498d-92b2-f596711019e5.png)


[IAM]를 클릭합니다.
	
![image](https://user-images.githubusercontent.com/60500649/151731841-9ed11b85-c9a6-4c45-9b52-1ef9170f4546.png)
	

사이드바의 [역할]탭을 클릭하고 [역할 만들기]를 통해 새로운 IAM 권한을 생성해줄게요.

![image](https://user-images.githubusercontent.com/60500649/151731866-0802c4c9-3495-4b73-888b-3cd23c37966d.png)


EC2를 선택한 뒤 [다음 : 권한]을 클릭해주세요.

![image](https://user-images.githubusercontent.com/60500649/151731890-5db0c28d-7043-46ba-a183-137470bf3e39.png)


정책 필터에서 CloudWatchFullAccess를 입력해 선택해주고 [다음 : 태그]를 클릭해줄게요.

태그 항목에서는 키와 값을 입력할 수 있는데, 선택사항이므로 저는 패스하겠습니다. [다음 : 검토] 클릭

![image](https://user-images.githubusercontent.com/60500649/151731915-0bbcd1ae-4f3d-4c7d-a86c-99969167c600.png)


IAM 역할의 이름을 지정해주고 [역할 만들기]를 클릭해 새로운 역할 생성을 마무리합니다.

**2. Log Group 생성**

![image](https://user-images.githubusercontent.com/60500649/151731931-1710bf9b-1c23-4de3-ae2f-77589748d614.png)
	
[관리 및 거버넌스]에서 [CloudWatch]를 클릭할게요.

![image](https://user-images.githubusercontent.com/60500649/151731942-e9787dda-c7a2-4781-bbb1-67906e4a4dde.png)

	
사이드바에서 [로그 그룹]을 클릭한 뒤 [로그 그룹 생성]을 통해 새로운 로그 그룹을 만들어봅시다.

![image](https://user-images.githubusercontent.com/60500649/151731958-03834bc5-c2be-4a66-ad89-88e2b7ea96df.png)

	
**3. Log Group에 LogStream 생성**

생성된 로그 그룹의 이름을 클릭해 로그 스트림을 생성합니다.

![image](https://user-images.githubusercontent.com/60500649/151731992-da057d07-3fbe-4b44-b7b4-f239585e3a34.png)


[로그 스트림] 탭의 [로그 스트림 생성]을 클릭해주고 이름을 지정해줍시다.

![image](https://user-images.githubusercontent.com/60500649/151732018-ed254716-88d2-43f6-ba1e-7dbe7084f922.png)

![image](https://user-images.githubusercontent.com/60500649/151732024-6f3877ac-1206-41fe-9030-40e9b9acd2e1.png)
	
	
생성은 했지만 아직 컨테이너에 대한 로그를 전송하도록 설정하진 않았기에 저장되어있진 않아요.

**4. CloudWatch의 IAM 권한을 사용할 수 있는 EC2 인스턴스 생성과 로그 전송**

EC2 인스턴스에서 아까 생성했던 IAM 권한을 추가해야해요.

![image](https://user-images.githubusercontent.com/60500649/151732033-2a139cc2-8770-41b4-a7b6-8972c5e21c4e.png)

	
[단계 3: 인스턴스 세부 정보 구성]에서 IAM 역할을 지정해줍시다.

IAM 권한을 사용할 수 있도록 설정한 EC2 인스턴스에서 옵션을 추가해 컨테이너를 생성해봐요.

```
docker run -d \
> --log-driver=awslogs \
> --log-opt awslogs-region=ap-northeast-2 \
> --log-opt awslogs-group=logs \
> --log-opt awslogs-stream=logstream \
> ubuntu:16.04 \
> echo 'Log test!!!'
```

logging driver로는 awslogs(CloudWatch)를 사용하고, Log Group과 Log Stream을 알맞게 설정해줍시다.

Region은 ap-northeast-2(서울)로 지정해요.

![image](https://user-images.githubusercontent.com/60500649/151732043-358436b5-8b38-4dc4-b2b1-15ecd5912e9a.png)

	
CloudWatch에 확인하고자 하는 Log가 정상적으로 수집되었음을 알 수 있습니다!

**이렇게 수집한 로그를 통해 AWS에서는 다양한 작업을 할 수 있습니다.**

**효율적인 운영과 관리를 진행할 수 있어 더욱 편하겠군요!**

## Docker Resource
### Docker 컨테이너 자원 할당 제한

우리가 컨테이너를 생성할 때 따로 옵션을 지정하지 않으면 컨테이너는 호스트의 자원을 제한 없이 쓸 수 있게 설정이 됩니다!

만약 우리가 제품 단계의 컨테이너를 고려한다면 자원에 대해 예민해져야 해요.

**Memory, CPU, Block I/O 제한**

컨테이너를 생성하는 run, create 명령어에서 컨테이너의 자원 할당량을 조정하도록 옵션을 설정할 수 있답니다.

기존에 만들어져있는 컨테이너에 대해 자원 제한을 변경하려면 update 명령을 입력해주세요.

```
docker update [resource limit] [container name]
```

자원이 제한되어 있는 컨테이너를 확인하기 위해선 inspect 명령어를 입력하세요.

```
docker inspect [container name]

# docker inspect ubuntu
.....
        "HostConfig": {
            .....
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": [],
            "BlkioDeviceReadBps": null,
            "BlkioDeviceWriteBps": null,
            "BlkioDeviceReadIOps": null,
            "BlkioDeviceWriteIOps": null,
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": [],
            "DeviceCgroupRules": null,
            "DiskQuota": 0,
            "KernelMemory": 0,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": false,
            "PidsLimit": 0,
            "Ulimits": null,
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            .....
.....
```

기본값은 0이군요!

---

> **Container Memory**

docker run 명령에 **\--memory 옵션**을 지정해 메모리를 제한할 수 있습니다!

```
docker run -itd --name memory_1g \
--memory=1g \
ubuntu:16.04
```

입력할 수 있는 단위는 m(megabyte), g(gigabyte)에요. 최소로 제한할 수 있는 메모리는 4MB랍니다.

inspect 명령으로 확인해보니 잘 적용 되었네요.

```
# docker inspect memory_1g | grep \"Memory\"
    "Memory": 1073741824,
```

**주의하세요!**

컨테이너 내의 프로세스가 컨테이너에 할당된 메모리를 초과하면 컨테이너는 자동으로 종료됩니다.  
그렇기 때문에 애플리케이션에 따라 메모리를 적절하게 할당하는 것이 좋죠.

아래 명령은 메모리를 매우 적게 할당하는 경우로서 4MB 메모리로 mysql 컨테이너를 실행하면 메모리가 부족해 컨테이너가 실행이 되지 않는 상황입니다.

```
docker run -d --name memory_4m \
--memory=4m \
mysql
```

기본적으로 컨테이너의 Swap 메모리는 메모리의 2배로 설정되지만 별도로 지정할 수도 있어요!

```
docker run -it --name swap_500m \
--memory=200m \
--memory-swap=500m \
ubuntu:16.04
```

Swap 메모리를 500MB로, 메모리를 200MB로 설정해 컨테이너를 생성했습니다 ㅎㅎ

---

> **Container CPU**

**--cpu-shares**

--cpu-shares 옵션은 컨테이너의 가중치를 설정해 해당 컨테이너가 CPU를 상대적으로 얼마나 사용하는지를 나타냅니다!

즉, CPU의 개수를 할당하는 것이 아닌 CPU를 나누는 비중을 정의하는 것입니다.

```
docker run -it --name cpu_share \
--cpu-shares 1024 \
ubutnu:16.04
```

아무 컨테이너도 설정되어있지 않기 때문에 cpu_share 컨테이너에 할당하는 CPU 비중은 1이에요.

stress 옵션을 통해 cpu 부하를 줄게요.

```
# docker run -d --name cpu_1024 \
--cpu-shares 1024 \
alicek106/stress stress --cpu 1
```

(stress 패키지가 설치된 alicek106님의 이미지를 사용했어요)

CPU 사용률을 확인해볼까요?

```
# ps aux | grep stress
root      38833  0.1  0.0   7484  1024 ?        Ss   12:26   0:00 stress --cpu 1
root      38880 96.4  0.0   7484    96 ?        R    12:26   0:14 stress --cpu 1
```

제한된 cpu 값이 1024이지만 대부분의 사용률을 차지하고 있습니다.

이 상태에서 cpu 값이 512만큼 사용하는 컨테이너를 생성하면 어떻게 될까요?

```
# docker run -d --name cpu_512 \
--cpu-shares 512 \
alicek106/stress stress --cpu 1
```

시간이 지나고 CPU 사용률을 확인해볼게요.

```
# ps aux | grep stress
root      38833  0.0  0.0   7484  1024 ?        Ss   12:26   0:00 stress --cpu 1
root      38880 70.0  0.0   7484    96 ?        R    12:26  19:27 stress --cpu 1
root      39105  0.0  0.0   7484   948 ?        Ss   12:30   0:00 stress --cpu 1
root      39150 33.2  0.0   7484    92 ?        R    12:30   8:12 stress --cpu 1
```

두 컨테이너가 각각 [1024 : 512 = 2 : 1] 비율로 CPU를 나누어 쓰는군요!

**--cpuset-cpus**

호스트에 CPU가 여러 개 있을 때 해당 옵션을 지정해 컨테이너가 특정 CPU만 사용하도록 해요.

아래는 컨테이너가 3번째 CPU만 사용하도록 설정하는 명령입니다.

```
docker run -d --name cpuset_2 \
--cpuset-cpus=2 \
alicek106/stress stress --cpu 1
```

**--cpu-period, --cpu-quota**

컨테이너의 CFS 주기는 기본적으로 100ms로 설정됩니다. 하지만 위 옵션을 통해 주기를 변경할 수 있지요.

--cpu-period 값은 기본적으로 100000이며, 100ms를 뜻해요. --cpu-quota 옵션은 --cpu-period에 설정된 시간 중 CPU 스케줄링에 얼마나 할당할 것인지를 설정합니다.

```
docker run -d --name quota \
--cpu-period=100000 \
--cpu-quota=25000 \
alicek106/stress stress --cpu 1
```

이 예시에서는 100000 중 25000 만큼 할당해 CPU 주기가 1/4로 줄었으므로 일반적인 컨테이너보다 CPU 성능이 1/4로 감소해요.

1/4으로 줄은 만큼의 사용률을 확인해보면 쉽게 이해할 수 있어요!

```
# ps aux | grep stress
root      39893  0.1  0.0   7484   936 ?        Ss   13:00   0:00 stress --cpu 1
root      39941 25.7  0.0   7484    92 ?        R    13:00   0:04 stress --cpu 1
```

**--cpus**

이 옵션은 --cpu-period, --cpu-quota 옵션과 동일하지만 더욱 직관적이에요. CPU의 개수를 직접 지정하거든요.

```
docker run -d --name cpus \
--cpus=0.25 \
alicek106/stress stress --cpu 1
```

quota를 이용한 설정과 cpus 옵션의 CPU 사용률을 서로 비교해봤어요.

```
# ps aux | grep stress

[--cpu-period, --cpu-quota]
root      39941 25.0  0.0   7484    92 ?        R    13:00   1:17 stress --cpu 1

[--cpus]
root      40215 25.1  0.0   7484    92 ?        R    13:04   0:23 stress --cpu 1
```

사용하는 비율이 동일하군요!

---

> **Container Block I/O**

우리가 컨테이너를 생성할 때 아무런 옵션도 설정하지 않으면 컨테이너 내부에서 파일을 읽고 쓰는 대역폭에 제한이 설정되지 않아요.

한 컨테이너에서 블록 입출력을 과도하게 사용하지 않도록 설정하려면 아래 옵션이 필요해요.

```
[절대적인 값으로 제한]
--device-write-bps
--device-read-bps

[상대적인 값으로 제한]
--device-write-iops
--device-read-iops
```

**--device-write-bps, --device-read-bps**

```
docker run -it \
--device-write-bps /dev/sda:1mb \
ubuntu:16.04
```

위 명령어로 생성된 컨테이너에서 쓰기 작업을 테스트 해보면 제한되는 것을 확인할 수 있어요.

```
root@0ba7400b69af:/# dd if=/dev/zero of=test.out bs=1M count=10 oflag=direct
10+0 records in
10+0 records out
10485760 bytes (10 MB, 10 MiB) copied, 15.001 s, 699 kB/s
```

**--device-write-iops, --device-read-iops**

--device-write-iops 값이 약 2배 차이나는 컨테이너에 쓰기 작업을 수행하면 시간 또한 2배 가량 차이가 나게돼요.

```
[컨테이너 생성]
docker run -it \
--device-write-iops /dev/sda:5 \
ubuntu:16.04

[쓰기 작업 수행]
root@459696708c1d:/# dd if=/dev/zero of=test.out bs=1M count=10 oflag=direct
10+0 records in
10+0 records out
10485760 bytes (10 MB, 10 MiB) copied, 4.00854 s, 2.6 MB/s
```

```
[컨테이너 생성]
docker run -it \
--device-write-iops /dev/sda:10 \
ubuntu:16.04

[쓰기 작업 수행]
root@38a1ba0be9a6:/# dd if=/dev/zero of=test.out bs=1M count=10 oflag=direct
10+0 records in
10+0 records out
10485760 bytes (10 MB, 10 MiB) copied, 2.00477 s, 5.2 MB/s
```

## Docker Image
### 도커 이미지 정복하기 - (1/2)

모든 컨테이너는 이미지를 기반으로 생성됩니다. 그래서 우리가 도커 컨테이너를 생성하기 위해선 이미지 다루는 방법을 알아야 하죠.

다루는 내용은 아래와 같습니다.

-   Docker Hub
-   이미지 생성과 삭제를 위한 명령어
-   도커 이미지의 구조 이해
-   이미지 추출과 배포를 위한 저장소 생성

---

![image](https://user-images.githubusercontent.com/60500649/151732101-f9a060c2-95d0-4749-b04b-539213d21904.png)

	
#### **도커 허브**

데비안/우분투에서 apt-get install 명령을 실행하면 apt 레포지터리에서 패키지를 내려받습니다. 레드햇에서 yum install 명령을 실행하면 yum 레포지터리에서 패키지를 내려받습니다.

이처럼 도커에서도 docker create/run/pull 명령을 사용하면 기본적으로 도커 허브(Docker Hub)라는 중앙 이미지 저장소에서 쫙 스캔한 후 이미지를 내려받아요.

도커 허브는 도커가 공식적으로 제공하는 이미지 저장소로서, 도커 계정을 갖고 있다면 누구든지 이미지를 올리고 내려받을 수 있어 다른 사람들과 쉽게 이미지를 공유할 수 있답니다.

**docker search** 명령을 입력하면 도커 허브의 이미지를 검색할 수 있어요.

```
# docker search ubuntu
NAME      DESCRIPTION                                     STARS       OFFICIAL   AUTOMATED
ubuntu    Ubuntu is a Debian-based Linux operating sys…   11157       [OK]
```

#### **이미지 생성**

앞서 입력한 docker search 명령으로 검색한 이미지는 **docker pull** 명령으로 내려받아 사용할 수도 있습니다. 하지만 도커로 개발하는 많은 경웅에는 컨테이너에 애플리케이션을 위한 특정 개발 환경을 직접 구축한 뒤 사용자만의 이미지를 직접 생성할 것입니다.

이를 위해 컨테이너 안에서 작업한 내용을 이미지로 만들어 볼게요.

```
# docker run -it --name hello alpine
# echo hello! > hello.txt
```

컨테이너를 생성할 때 사용한 이미지는 **alpine linux입니다.** 크기가 매우 경량화돼있는 장점이 있죠.

컨테이너에 **hello.txt** 이름을 가진 파일을 추가했어요.

기존 alpine linux 이미지에서 변경 사항이 있다면 hello.txt 파일을 갖고 있는 것입니다.

변경된 사항을 이미지로 저장하는 **docker commit** 명령어를 입력할게요.

```
# docker commit \
> -a "hyun0524e" -m "hello image" \
> hello \
> hello:0.0
sha256:f7e6f77ba29996e511d203aa95c0d84654a189c4909ed533d9b107d41195b611
```

저장소 이름은 입력하지 않아도 상관없어요. 하지만 이미지의 태그를 입력하지 않으면 자동으로 **latest로** 설정된답니다.

**-a 옵션**은 author를 뜻하며, 이미지의 작성자를 나타내는 메타데이터를 이미지에 포함시켜요.

**-m 옵션**은 커밋 메시지를 뜻하며, 이미지에 포함될 부가 설명을 입력해요.

생성된 이미지를 확인해봤어요!

```
# docker images
REPOSITORY      TAG            IMAGE ID         CREATED             SIZE
hello           0.0            f7e6f77ba299     22 seconds ago      5.57MB
alpine          latest         a24bb4013296     8 weeks ago         5.57MB
```

0.0이라는 태그로 이미지가 생성됐군요.

원본 이미지와는 차이가 없습니다. 겨우 bytes에 불과한 내용이 변경됐기 때문이죠.

#### **이미지 구조**

위 처럼 컨테이너를 이미지로 만드는 방법은 commit 명령으로 손쉽게 구현할 수 있습니다. 하지만 이미지를 좀 더 효율적으로 다루기 위해 컨테이너가 어떻게 이미지로 만들어지는지, 구조는 어떤지를 알 필요가 있죠.

아래 명령어를 입력하면 이미지의 전체 정보를 알 수 있습니다.

```
# docker inspect alpine
# docker inspect hello:0.0
```

```
[alpine]

"Layers": [
                "sha256:50644c29ef5a27c9a40c393a73ece2479de78325cae7d762ef3cdc19bf42dd0a"



[hello:0.0]

"Layers": [
                "sha256:50644c29ef5a27c9a40c393a73ece2479de78325cae7d762ef3cdc19bf42dd0a",
                "sha256:85fa24607ff757324074754f25fb18302512ac7ea44f700def4bcfae0f4db8cf"
            ]
```

많은 정보 중에서 우리가 주목해야 할 것은 **alpine, hello 이미지의 Layers 항목**입니다.

이 내용을 알아보기 쉽게 그림으로 나타내볼게요.

![image](https://user-images.githubusercontent.com/60500649/151732129-226ae954-a4e8-4556-8fbb-8af030a685ab.png)
	
alpine linux 이미지와 hello:0.0 이미지가 서로 5.7MB라고 출력이 되어도 5.7MB 크기의 이미지가 각각 존재하는 것은 아니에요. 이미지를 커밋할 때 컨테이너에서 변경된 사항만 새로운 레이어로 저장하고, 그 레이어를 포함해 새로운 이미지를 생성하기 때문에 전체 이미지의 **실제 크기는 5.7MB + hello:0.0 변경 사항 크기**가 되죠.

이런 레이어 구조는 docker history 명령으로 더욱 쉽게 확인할 수 있답니다.

```
# docker history hello:0.0
IMAGE         CREATED        CREATED BY                           SIZE    COMMENT
f7e6f77ba299  16 minutes ago /bin/sh                              34B     hello image
a24bb4013296  8 weeks ago    /bin/sh -c #(nop)  CMD ["/bin/sh"]   0B
<missing>     8 weeks ago    /bin/sh -c #(nop) ADD file:c92c248…  5.57MB
```

만약 alpine linux 이미지를 삭제하면 어떻게 될까요?

```
# docker rmi alpine
Error response from daemon: conflict: unable to remove repository reference "alpine" (must force) - container f7d8f3ab9b25 is using its referenced image a24bb4013296
```

해당 이미지를 사용 중인 컨테이너가 존재하므로 삭제할 수 없다는 내용이군요. -f 옵션을 추가하면 강제로 삭제할 수는 있지만 실제 레이어 파일은 삭제되지 않기 때문에 의미가 없습니다.

사용 중인 이미지를 docker rmi -f로 강제 삭제하면 이미지의 이름이 <none>으로 변경돼요. 이 이미지는 댕글링(dangling) 이미지라고 불리죠. 댕글링 이미지는 docker images -f dangline=true 명령으로 확인할 수 있습니다. (사용 중이지 않은 댕글링 이미지는 docker image prune 명령으로 한 번에 삭제할 수 있습니다)

그렇기 때문에 이미지를 삭제하기 위해선 **해당 이미지에 의존하는 모든 것들을 먼저 지워야하죠.**

```
# docker stop hello && docker rm hello
hello
hello

# docker rmi hello:0.0
Untagged: hello:0.0
Deleted: sha256:f7e6f77ba29996e511d203aa95c0d84654a189c4909ed533d9b107d41195b611
Deleted: sha256:d1257920df0f85735b7ff4bffff68bbe30407e137adeecac534a641f9fbf9a6a

# docker rmi alpine
Untagged: alpine:latest
Untagged: alpine@sha256:185518070891758909c9f839cf4ca393ee977ac378609f700f60a771a2dfe321
Deleted: sha256:a24bb4013296f61e89ba57005a7b3e52274d8edd3ae2077d04395f806b63d83e
```

여기서 Deleted는 이미지 레이어가 실제로 삭제되었다는 의미에요. 역시 부모 이미지가 존재하지 않아야 전부 삭제가 가능합니다.

그렇지만 hello:0.0 이미지만 삭제했을 때에는 alpine 이미지가 같이 삭제되진 않습니다. hello:0.0 이미지에 추가된 파일이 존재하는 레이어만 삭제되고, alpine 이미지 태그는 아직 존재하기 때문이죠.

**이미지 추출과 배포를 위한 저장소 생성** 파트는 다음 포스팅에서 다루겠습니다.

궁금하거나, 이런 부분을 추가했으면 좋겠다는 점은 댓글 남겨주세요. 많은 도움이 됐길 바랍니다!

### 도커 이미지 정복하기 - (2/2)

모든 컨테이너는 이미지를 기반으로 생성됩니다. 그래서 우리가 도커 컨테이너를 생성하기 위해선 이미지 다루는 방법을 알아야 하죠.

다루는 내용은 아래와 같습니다.

-   Docker Hub
-   이미지 생성과 삭제를 위한 명령어
-   도커 이미지의 구조 이해
-   이미지 추출과 배포를 위한 저장소 생성

---

#### **이미지 추출**

도커 이미지를 별도로 저장하거나 옮기는 등 필요에 따라 이미지를 단일 바이너리 파일로 저장해야 할 때가 있어요. 이때, **docker save** 명령어를 사용하면 컨테이너의 커맨드, 이미지 이름과 태그 등 이미지의 모든 메타데이터를 포함해 하나의 파일로 추출할 수 있답니다.

```
# docker save -o alpine.tar alpine

# ls
alpine.tar 
```

-o 옵션은 추출될 파일명을 지정합니다.

alpine.tar 파일이 존재하는 것을 볼 수 있어요. 해당 이미지를 가지고 도커에 다시 로드하려면 **docker load** 명령어를 사용하면 됩니다!

```
# docker load -i alpine.tar
```

**save와 load 비슷한 명령어로 export, import가 있어요.**

docker commit 명령어로 컨테이너를 이미지로 만들면 컨테이너에서 변경된 사항뿐만 아니라 컨테이너가 생성될 때 설정된 detached모드, 컨테이너 커맨드와 같은 컨테이너의 설정 등 모든 게 이미지에 저장됩니다!

```
# docker export -o commit_alpine.tar commit_alpine
# docker import commit_alpine commit_alpine:0.0
```

하지만 이렇게 사용하는 것은 도커의 근본적인 목적을 훼손하는 꼴이 됩니다. 효율적이지가 않아요.

**생성된 이미지 파일은 레이어 구조가 아닌 단일 파일이기 때문에 여러 버전의 이미지를 추출하면 이미지의 용량은 각각 존재하게 됩니다. 물론 사용하는 때에 따라 다르겠다고 생각돼요.**

#### **이미지 배포**

이미지 배포입니다! 이 부분을 완벽하게 활용한다면 실무에서는 부족함 없이 이미지를 관리할 수 있을 거예요.

위처럼 추출이 가능하지만 단일 파일로 만드는 방식 자체가 비효율적이기 때문에 도커에서 공식적으로 지원하는 Docker Hub를 이용해 배포하는 방법을 주로 사용하죠.

**Docker Hub 이미지 배포**

도커 허브는 도커 이미지를 저장하기 위한 클라우드 공간이라고 생각하면 이해하기 쉬워요. 사용자는 그저 이미지를 올리고(push) 내려받고(pull) 하면 되기에 간단하죠. Docker Hub에는 비공개(Private) 저장소가 있지만 일정 비용을 지불하지 않으면 공개(Public) 저장소를 이용해야 하죠.

**[클릭](https://hub.docker.com)** 하면 도커 허브로 이동합니다!. 해당 사이트에서도 docker search 명령어를 입력할 때처럼 이미지를 검색할 수 있답니다.

![image](https://user-images.githubusercontent.com/60500649/151732292-2882dc07-ea29-4af6-9ea2-1c6ffcf5e891.png)
	
이제 본격적으로 도커 허브에 이미지를 올리기 위해서 저장소를 생성할 거예요. 로그인은 필수입니다! \[Sign up\]을 클릭해 가입하면 돼요.

가입이 됐다면 메인 페이지에서 오른쪽에 보이는 [Create Repository]를 클릭해 저장소를 생성할 거예요.

![image](https://user-images.githubusercontent.com/60500649/151732363-bdcc66fa-974a-4a75-8583-bbb960f94ec2.png)

	
[VIsibility] 영역은 사용자가 접속할 수 있도록 Public으로 하느냐, 접속하지 못하도록 Private으로 하느냐를 선택합니다. 기본적으로 비공개 저장소는 1개만 무료지만 사용할 이유가 없으니 Public으로 선택할게요.

![image](https://user-images.githubusercontent.com/60500649/151732382-998dfcc0-9174-45ef-bcdf-2cb6edc98800.png)

	
생각할수록 놀라운 것 같아요! 이렇게 간단하게 저장소가 생성됐다는 게

![image](https://user-images.githubusercontent.com/60500649/151732399-c83e7e07-fee0-47c7-a2a6-a726ac8f2a58.png)
	
이렇게 생성된 저장소에 이미지를 올려볼까요?

```
# docker run -it --name commit1 alpine echo "commit_image!" >> test.txt

# docker commit commit1 commit_image:0.0
sha256:a1ff9cd22b46e9a968e7bf625fc12840c01a2020147e5ce7aaf2cd3803b207d2
```

commit1이라는 컨테이너를 만들어 test.txt 파일을 생성했어요. 그리곤 commit\_image:0.0라는 이름으로 커밋했죠.

이렇게 커밋된 이미지를 저장소에 올리기 위해선 저장소의 이름(docker hub 이름)을 이미지 앞에 접두어로 추가해야 돼요. 이때, docker tag 명령어를 사용하면 이미지 이름을 추가할 수 있답니다.

```
# docker tag commit_image:0.0 hyun0524e/commit_image:0.0

# docker images
REPOSITORY                 TAG       IMAGE ID        CREATED          SIZE
hyun0524e/commit_image     0.0       a1ff9cd22b46    3 minutes ago    5.57MB
```

이미지 이름을 변경하고 나면 docker login 명령어를 이용해 도커 허브 서버에 로그인합니다. 로그인하지 않으면 생성한 저장소에 이미지를 올릴 수 있는 권한을 가질 수 없죠.

```
# docker login
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: hyun0524e
Password:
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

로그인 후 우리는 docker push 명령어로 이미지를 저장소에 업로드할 거예요. 드디어!

```
# docker push hyun0524e/commit_image:0.0
```


Docker Hub Registry에서 확인을 해보니 이미지가 잘 업로드가 됐군요.

![image](https://user-images.githubusercontent.com/60500649/151732418-949f06dd-43fe-4c80-96ae-27c985f2fa9c.png)
	
이 이미지를 내려받고 시다면 별도 로그인 필요 없이 hyun0524e/commit_image:0.0을 입력하면 됩니다!

## Docker command
명령은 기본적으로 "docker [Options] COMMAND"로 작성한다.

세세한 옵션에 대해서 정확하게 알고 싶다면 다음 명령어로 도움말을 확인한다.

```
# docker help
```

### 컨테이너 관리 
**Docker Container 생애주기**

: 실행 중, 정지, 파기

실행 중 : Dockerfile에 포함된 CMD 및 ENTRYPOINT 인스트럭션에 정의된 애플리케이션이 실행

정지 : 사용자가 명시적으로 정지하거나 컨테이너에서 실행된 애플리케이션이 종료된 경우 컨테이너가 종료

파기 : 정지 상태의 컨테이너는 명시적으로 파기하지 않는 이상 디스크에 그대로 남아 있는 상태(완전 삭제 바람)


#### 컨테이너 생성 및 실행
```
docker container run [Options] Image(or Image ID)[:tag] [command]
ex) docker run new:latest
	
-> 도커 이미지로부터 컨테이너를 생성하고 실행하는 명령이다.
-d : 백그라운드로 컨테이너 실행
-p : 포트포워딩(-p 9999:8888)
-i : 컨테이너 실행 시 컨테이너 쪽 입력과의 연결을 유지
-t : 유사 터미널 기능을 활성화한다.(-i 옵션에 의존)
--rm : 컨테이너 종료 시 자동으로 파기
--name : 컨테이너에 이름 설정(--name nice)
```

#### 컨테이너 정지
```
docker container stop [Container ID 또는 Container 명]
```

#### 컨테이너 재시작
```
docker container restart [Container ID 또는 Container 명]
```

#### 컨테이너 제거(또는 파기)
```
docker container rm [Container ID 또는 Container 명]
```

#### 컨테이너 표준 출력 연결하기
```
docker logs [Options] [컨테이너ID 또는 컨테이너명]

-> 실행 중인 특정 도커 컨테이너의 표준 출력 내용을 확인할 수 있다.
-f : 새로 출력되는 표준 출력 내용을 계속 보여준다.(실시간)
```

#### 컨테이너에서 명령 실행하기
```
docker exec [Options] [컨테이너ID 또는 컨테이너명]
ex) docker exec -it echo nice!

-> 실행 중인 컨테이너에서 원하는 명령을 실행할 수 있다.
-it 등 run과 밀접한 옵션들을 사용 가능함.
```

#### 컨테이너 파일 복사하기
```
docker cp [Options] [컨테이너:원본파일] [컨테이너:대상파일]
ex) docker cp test:/test.txt .
```

### 운영 관리 명령어
#### 컨테이너 및 이미지 일괄 파기
```
docker [container/image] prune [Options]
ex) docker container prune

-> 정지된 컨테이너, 사용 중인 컨테이너가 없는 이미지 일괄 삭제
```

#### 사용 현황 확인하기
```
docekr stats [Options] [대상 Container ID]
-> top 명령어와 비슷한 느낌
```

### 이미지 관리 명령어
#### 이미지 빌드
```
docker image build -t Image:Tag Dockerfile_path
ex) docker image build -t image:latest .

-> Dockerfile이 존재하지 않으면 실행이 불가

-t : 이미지명과 tag명을 붙이는 것
-f : Dockerfile이 다른 파일명으로 되어있을 시에 지정하는 옵션
--pull : 베이스 이미지를 강제로 받아오는 옵션(--pull=true)
```

#### 이미지 검색
```
docker search [Options] [검색 키워드]
ex) docker search ubuntu

-> 해당 키워드와 관련된 레포지터리 목록을 볼 수 있다.(네임스페이스가 생략된 이미지는 공식 레포지토리)

--limit : 최대 검색 건수 제한(--limit 5)
```

#### 이미지 받기
```
docker pull [Options] Repo[:Tag]
ex) docker pull ubuntu:latest

-> 인자로 지정한 레포지토리명과 태그는 Docker Hub에 존재해야 한다.
```

#### 보유한 이미지 조회
```
docker images Repo[:Tag]
ex) docker images 또는 docker image ls

-> Docker Daemon이 동작하는 HostOS에 저장된 Docker Image 목록 출력
```

#### 이미지에 태그 부여
```
docker image tag 기존이미지명[:태그] 새이미지명[:태그]
ex) docker image tag new:latest renew:1.0

-> Docker Image의 특정 버전에 태그를 붙일 때 사용
```

#### 이미지 외부에 공개
```
docker image push [Options] Repo[:Tag]
ex) docker image push new:latest

-> 하기에 앞서 이미지의 네임스페이스를 먼저 변경(자신 혹은 기관이 소유한 Repo에만 이미지 등록할 수 있다.)
```

