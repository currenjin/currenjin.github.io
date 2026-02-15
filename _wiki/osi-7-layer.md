---
layout  : wiki
title   : OSI 7 Layer(OSI 7 계층)
summary :
date    : 2022-02-05 14:00:00 +0900
updated : 2022-02-05 14:00:00 +0900
tags     : network
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# OSI 7 Layer(OSI 7 계층)

![image](https://user-images.githubusercontent.com/60500649/152643750-17bf0f2e-2a60-48ee-9aaf-c65ac4ed3caa.png)


## OSI 7 Layer - 개방형 시스템

모든 종류의 컴퓨터 시스템 간 통신을 가능하게 하는 네트워크 시스템 설계를 위한 계층구조이다.

통신을 7단계로 표준화하여 효율성을 높이기 위함.

### 개방형 시스템이란?

: 기반 구조에 관계없이 서로 다른 시스템 간의 통신 기능을 제공하는 것을 말한다.

### OSI 7계층이 생겨나게 된 이유
1. 데이터의 흐름이 한 눈에 보임   ->   계층별 캡슐화, 디캡슐화

2. 문제해결에 용이   ->   네트워크 문제를 7단계로 나누어 접근

3. 여러 장비의 호환성이 증대   ex) 국산 케이블, 인텔 랜카드 = 이상 X

## 계층 별 역할

### Layer 1 ( 물리계층, Physical - 데이터 단위 : Bit )
전기적 신호를 이용해서 통신 케이블로 데이터를 전송한다. ( 신뢰성과 피드백은 관여 X )

유선 : 꼬임선( UTP, STP ), 동축 케이블, 광 케이블 등

무선 : 주파수 대역 등

장비는 Hub와 Repeater 등이 있다.

### Layer 2 ( 데이터링크계층, Data Link - 데이터 단위 : Frame )
송/수신 되는 정보의 오류와 흐름을 관리하여 안전한 정보의 전달을 수행할 수 있도록 돕는 역할을 한다. ( MAC Address 통신 )

- 같은 네트워크 상에 어떤 장비가 어떤 장비에게 보내는 데이터를 전달
- 오류제어, 흐름제어

* MAC Address(16진수 2자리 = 1byte, MAC = 6byt)


#### Ethernet Protocol Header ( 총 14byte )

![image](https://user-images.githubusercontent.com/60500649/152643758-ac7f5dbe-e8a1-473d-9e3c-97367979d314.png)


Preamble = 프레임시작 구분 (4 byte)
Destination = MAC Address (6 byte)
Source = MAC Address(6 byte)
Ethernet Type = 상위 Protocol 알리미(2 byte)

#### Simulation

1. PC MAC Address 확인 - ipconfig /all
   1. (mac address oui : mac 제조업체 확인)

2. Ethernet Protocol Capture 
   1. 목적지 mac, 출발지 mac 확인, Ethernet Type 확인 
   2. Etthernet Type ( 0x = 16진수로 표현된다는 의미 )
   3. [ieee-802](https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml)


### Layer 3 ( 네트워크계층, Network - 데이터 단위 : Packet )
데이터를 목적지까지 가장 안전하고 빠르게 전달하는 역할을 한다. (Routing)<br>
서로 다른 네트워크 대역 간의 데이터 전달, 제어를 담당한다.<br>

ex) 편지 봉투 겉에 써진 주소를 생각하면 됨. 편지내용은 봉투 내부에 있고, 봉투에 써진 주소로 위치를 찾아간다.

- 송신 측 : 패킷 구성
- 수신 측 : 패킷 분해 
- Traffic 제어, 네트워크 보안, 송/수신 측 논리적 주소( IP ) 설정 
- 장비는 Router, L3 Switch 등이 있다.

#### IP 주소
- IP 주소, 서브넷 마스크, 게이트웨이 등으로 구성

##### Classful IP (낭비가 심해 사용 X)

![image](https://user-images.githubusercontent.com/60500649/152643766-40c3e009-09d1-4cf5-8b50-7a20d9a47623.png)

##### Classless IP (일반적으로 사용)

![image](https://user-images.githubusercontent.com/60500649/152643772-dc6d67a5-a9b5-4d40-afde-ddd55a7e17ed.png)

##### Subnet Mask
- Classfull Network의 대역을 나눠주는데 사용하는 값.
- Network대역을 좀 더 효율적이게 나누어주는 역할.

ex) 1111 1111 . 1111 1111 . 1111 1111 . 1100 0000<br>
-> 사용 가능한 Host 수 = 64 대<br>

#### 부족한 IP 주소를 위하여 탄생한 Private IP, Public IP

![image](https://user-images.githubusercontent.com/60500649/152643781-6b6c53cf-2e75-4404-aad3-49977594d5d0.png)

- 이 과정에서 NAT를 사용

**NAT = 한 IP를 다른 IP로 변환시키는 기술**

![image](https://user-images.githubusercontent.com/60500649/152643789-4805eaac-17be-405e-a63e-f8c849fd86fb.png)

- 외부에서 내부를 확인할 수 없다.
- 내부의 Host가 외부로 나갈 시에는 전달장치가 상세 내용을 기록함.
- PortForwarding 설정 하면 외부에서도 접속 가능

#### 예외적인 IP
- 0.0.0.0( wildcard:나머지 )
- 127.0.0.1( Loopback )
- Gateway Address

#### 서브넷팅 예제풀이

1. 211.100.10.0/24

Subnetmask : 26

subnet 갯수 : 4

Host갯수 : 61 ( network-id, broadcast address, Gateway address 제외 )

마지막 subnet의 network-id : 211.100.10.192

첫번째 subnet의 broadcast : 211.100.10.63

두번째 subnet의 사용가능한 IP 범위 : 211.100.10.65 ~ 126 network, broad 제외

2. 195.168.12.0/24 -> 195.168.12.0/27

11000011.10101000.00001100.00000000

11111111.11111111.11111111.00000000

-> 11000011.10101000.00001100.000 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.001 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.010 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.011 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.100 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.101 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.110 00000 ~ 11110, broadcast : 11111

    11000011.10101000.00001100.111 00000 ~ 11110, broadcast : 11111

11111111.11111111.11111111.111 00000

-> 195.168.12.0, 195.128.12.31, 195.128.1~30

    195.168.12.32, 195.128.12.63, 195.128.33~62

    195.168.12.64, 195.128.12.95, 195.128.65~94

    195.168.12.96, 195.128.12.127, 195.128.97~126

    195.168.12.128, 195.128.12.159, 195.128.129~158

    195.168.12.160, 195.128.12.191, 195.128.161~190

    195.168.12.192, 195.128.12.223, 195.128.193~222

    195.168.12.224, 195.128.12.255, 195.128.225~254

3. 189.101.7.0/24

network broad range

- 189.101.7.0 189.101.7.63 189.101.7.1 ~ 189.101.7.62

- 189.101.7.64 189.101.7.127 189.101.7.65 ~ 189.101.7.126

- 189.101.7.128         189.101.7.191 189.101.7.129 ~ 189.101.7.190

- 189.101.7.192         189.101.7.255 189.101.7.193 ~ 189.101.7.254

#### 사설망 이해(VMware GuestOS)

- 자신의 호스트 안의 Guest OS에서는 서로간의 Ping은 가능하다.

but. 상대방 호스트에서 나의 Guest OS로는 Ping이 불가능하다.

#### 프로토콜
##### ARP(Address Resolution Protocol)

- 같은 네트워크 대역에서 통신을 위해선 상대방의 MAC주소가 필요하다. 그래서 IP를 이용해 알아오는 프로토콜이다.

###### ARP Header (28 byte)

![image](https://user-images.githubusercontent.com/60500649/152643817-eda71b8a-1198-4a3a-b83d-e3642e0146ba.png)


Hardware type : DataLink 계층 프로토콜 타입( 보통 Ethernet타입 : 0x0001 )
- Address Resolution Protocol Parameters Hardware Types 확인

Protocol type : Network 계층 프로토콜 타입( 보통 IPv4타입 : 0x0800 )
- Address Resolution Protocol Parameters Protocol Types 확인

Hardware Address Length : MAC주소 길이

Protocol Address Length : IP주소 길이

Opcode : 0001 = 질의, 0002 = 응답

- Address Resolution Protocol Parameters Operation Codes 확인

Source Hardware Address : 출발지 MAC주소 (6 byte)

Source Protocol Address : 출발지 IPv4 (4 byte)

Destination Hardware Address : 목적지 MAC주소

Destination Protocol Address : 목적지 IPv4

###### ARP프로토콜의 과정

**요청**

1. 목적지의 MAC주소를 모르기 때문에 00 00 00 00 00 00 으로 작성 후 요청한다.

2. Ethernet Header에서는 목적지를 Broadcast ( FF FF FF FF FF FF )로 작성

3. 해당 네트워크의 모든 Host들은 각자 요청을 받는다.

**확인**

1. 요청을 받은 모든 Host들은 각자 Decapsulation을 진행

2. 누가 자신의 MAC을 요청하는지 확인 한 Host는 Payload의 MAC을 작성

3. 다른 모든 Host는 해당 요청을 파기

**응답**

1. 자신의 MAC을 작성한 Host는 응답을 송신 (해당 MAC은 알기 때문에 정확히 작성)

2. 해당 MAC을 받게된 요청자는 Decapsulation 후 학습하여 ARP Cache Table에 기록

* arp cache table arp -a로 확인 가능

###### wireshark 패킷 캡쳐

1. arp 테이블 확인 후 패킷 분석

2. arp 테이블 제거 후 ping 날린 패킷 분석

프레임의 최소 단위 : 60 byte, 최대 단위 : 1514( 유동적 )

padding : 최소단위 맞춰줌 (0000으로, 안들어간 경우 캡쳐가 되지 않은 것)

information tab : 물음표 = 요청


##### IPv4 프로토콜(Internet Protocol Version 4)
- 네트워크 상 데이터를 교환하기 위한 프로토콜 ( 전달 보장X, 비신뢰성 )

###### IPv4 Header (20 byte 옵션제외)

![image](https://user-images.githubusercontent.com/60500649/152643824-d8cb8635-2f63-49cb-a396-05697af4e387.png)


Version : 4 (4 bit)

IHL( Header Length ) : 나누기 5 한 숫자 (4 bit) ex) 20byte면 5를 기록

TOS( Type of Service ) : 00 (1 byte)

Total Length : Header와 Payload의 전체 길이 (2 byte)

Identification : ID를 확인 해 조각화 된 패킷이 원래 하나였다는 것을 인식 (2 byte)

IP Flags : X / D : 조각화 안함 / M : 조각화 된 패킷이 더 있음을 알림 (3 bit)

Fragment Offset : 뒤죽박죽인 패킷의 순서를 나열 ( 패킷의 떨어져 있는 길이, 나누기 8 )

TTL( Time To Live ) : 패킷이 지날 수 있는 홉 수 지정 ( OS 마다 TTL 값 다름 )

Protocol : 상위 프로토콜 TCP/UDP, ICMP

Header Checksum : 오류 확인 ( 필드 값 수신측과 비교 )

Source Address : 출발지 IP Address

Destination Address : 목적지 IP Address

##### ICMP 프로토콜(Internet Control Message Protocol)
- 상대측과 통신을 확인하기 위해서 사용하는 프로토콜, PING 주로 사용

###### ICMP Header (8 byte)

![image](https://user-images.githubusercontent.com/60500649/152643831-695e3a3d-5e20-4f6a-9a21-ec283e424ee7.png)


Type : ICMP 타입 (1 byte)

    0 - 정상적인 응답
    3 - 목적지 도착 불능
    8 - 요청
    11 - 시간 초과

Code : 타입의 소분류

    5 - 리다이렉트, 라우팅 테이블 수정

CheckSum : 해당 패킷의 오류를 확인하기 위한 값

나머지 : ICMP 프로토콜을 이용하는 프로그램에서 추가하고 싶은 기능을 추가

##### 라우팅 테이블(Routing Table)

![image](https://user-images.githubusercontent.com/60500649/152643835-c1933552-fa75-4b68-baae-dd2e278f8cac.png)


- 어디로 보내야 하는지를 설정되어 있는 테이블(지도)

ex) PC-A에서 PC-B로 ICMP 요청

1. PC-A에서 Routing Table 확인 ( MAC, IP 알고 있다는 가정으로 진행 )

2. 요청 프로토콜을 생성 후 IPv4 Header, Ethernet Header 작성

3. A측 공유기에서 Eternet Header Decapsulation 진행

4. 목적지 IP 확인 후 Routing Table 확인

5. Eternet Header 재작성 -> Router로 송신 -> Eternet Header Decapsulation -> 목적지 IP 확인 -> Ethernet Header Encapsulation -> 과정 반복

6. Decapsulation 후 PC-B의 MAC Address를 Ethernet Header에 작성

7. 수신된 패킷에 Decapsulation 후 ICMP 응답 메세지 작성

8. 4, 5번과 같은 방법으로 응답 메세지 PC-A로 송신

##### IPv4의 조각화

![image](https://user-images.githubusercontent.com/60500649/152643859-403c0ab9-4b0e-41ce-aba9-feb8e46a1e7d.png)


- 적은 MTU(Maximum Transmission Unit)를 갖는 링크를 통하여 전송되려면 여러개의 작은 패킷으로 조각화 되어 전송돼야 한다.

MTU : 최대 전송 유닛

패킷의 조각화

###### 예시 
12000( IPv4 Header 포함 ) bytes

3300 byte의 MTU를 가진 상태라면

-> 각각 3280 + 20( IPv4 Header )

MoreFregment 1 : 내 뒤에 조각된 패킷이 있다.

Offset : 데이터의 나누기 8을 한 숫자

![image](https://user-images.githubusercontent.com/60500649/152643877-3ad56d11-7117-4638-8de0-2a9fc480f7e7.png)


IPv4 Header가 붙고나서 MTU에 의해 필터

![image](https://user-images.githubusercontent.com/60500649/152643880-c3d20d07-ac5d-4dad-8ce0-3ed340718c6e.png)


조각화 진행

ICMP 요청은 마지막 조각에 붙음

MTU필터 후 +EthernetHeader

###### 확인

라우팅 테이블 확인 : netstat -r

- 네트워크 대상은 인터페이스에 연결 됨.

Wireshark 패킷 캡쳐 확인 : ping x.x.x.x -l 4800 ( 4800바이트 만큼 전송 )

ex) DATA : 4800

        MTU : 1500

       1. 1480 mf 1 offset 0

       2. 1480 mf 1 offset 1480( 185, 0x00B9 )

       3. 1480 mf 1 offset 2960( 370, 0x0172 )

       4. 360 mf 0 offset 4440 ( 555, 0x022b )

#### Router란? (Routing Protocol, Routing Table)
- 서로 다른 네트워크를 연결하고 Broadcast Domain을 나눈다.
- 경로결정 : Packet이 목적지로 도달할 수 있는 가장 최적의 경로(Best path)를 결정

##### 내부 구성
1) RAM (Running-config, 휘발성)
- IOS가 올라와서 실행되고, Routing table과 구성파일이 올라와서 동작하는 장소.

2) NVRAM (Non Volatile, Startup-config, 비휘발성)
- 설정파일을 저장하는 장소이다.

3) Flash Memory
- IOS 이미지 파일 저장용으로 사용되는 장소이다.

4) ROM (Read-Only-Memory)
- Router의 가장 기본적인 내용을 저장하는 장소이다.


##### 부팅 과정
1) Power on self test (POST)
2) Load and run bootstrap code
3) Find the IOS software
4) Load the IOS software
5) Find the configuration
6) Load the configuration
7) Run

##### 여러가지 모드
###### Rommon Mode (RXBoot, ROM Monitor)
복구모드

###### Setup Mode
NVRAM에 Router 설정 파일이 없는 경우 실행되는 모드

###### User Mode
기본적인 실행모드이다. ( Console 혹은 Telnet으로 접속하면 보이는 화면, Router> )

###### Privileged Mode
Router의 운영자 모드이다. ( Enable 명령 시, Router# )

###### Global Configuration Mode
Router의 설정을 변경하거나 새로 설정하는 경우 사용하는 모드이다. ( Configure terminal, Router(config)# ) 

##### 라우터의 기본적인 설정 명령어

```
Router> enable //모드 전환
Router# configure terminal //모드 전환
Router(config)# hostname R1 //라우터의 이름 설정
Router(config)# no ip domain-lookup //명령어 오타를 쳤을 때 해당 명령어를 도메인으로 인식하지 않게 설정
Router(config)# line console 0 //현재 사용중인 설정창에 대한 설정을 하기 위한 모드 전환 
Router(config-line)# exec-timeout 0 0 //명령어가 일정시간 입력되지 않더라도 console 밖으로 튕기지 않게 설정 
Router(config-line)# logging synchronous //로그 메시지와 명령어가 서로 겹치지 않도록 설정 
Router(config-line)# end //모드 전환
```

##### Routing Protocol (Routing table)
목적지 네트워크로 가는 경로를 알아내기 위해 사용하는 Protocol

###### 라우팅 테이블
- 목적지 네트워크와 해당 네트워크로 가기 위해서 어느 경로로 나가야 하는지의 정보를 담고 있다.

###### 정적 라우팅
- 관리자가 직접 목적지 네트워크의 정보를 입력하는 Protocol (동적 라우팅보다 우선순위)

###### 정적 라우팅 장, 단점

![image](https://user-images.githubusercontent.com/60500649/152644517-7f6fff9a-7d33-48b5-8fa6-7434bae4cde6.png)

![image](https://user-images.githubusercontent.com/60500649/152644522-6584bb60-d334-4c36-bb0c-98ce2d5955fb.png)


###### configuration

```
ip route [network] [subnet mask] [next-hop address | exit interface] [distance]
ip route 0.0.0.0 0.0.0.0 [next-hop address | exit interface] [distance]
```

###### 동적 라우팅
설정되어진 Routing Protocol 알고리즘이 Best path를 찾아서 Routing Table에 올린다. (라우터끼리의 정보 공유)

1. Distance Vector(RIP, IGRP) : 물리적인 Best Path 결정
2. Link-State(OSPF, IS-IS) : 링크의 상태로 Best Path 결정
3. 복합적인 기능을 하는 EIGRP

###### 동적 라우팅 장,단점

![image](https://user-images.githubusercontent.com/60500649/152644531-a6e14af1-b37a-40c1-9ce9-b10d145ac97c.png)


###### RIP

- 라우터 수에 따라 최적의 경로를 설정

![image](https://user-images.githubusercontent.com/60500649/152644539-ed13a72e-5c52-4358-9066-7c7ffe1f8fae.png)


###### OSPF 

- Area 단위로 구성

![image](https://user-images.githubusercontent.com/60500649/152644555-6d9db8c1-419d-491c-a32e-07fb948ecab7.png)


###### EIGRP 

- Distance Vector & Link-State

![image](https://user-images.githubusercontent.com/60500649/152644560-ed990109-48d1-40cc-b7b8-6de371825f40.png)


###### 실습환경 ( GNS3 )

-> 모든 IP 셋팅이라 가정

![image](https://user-images.githubusercontent.com/60500649/152644574-6426df86-1fab-4320-ad5f-0740ef2232d1.png)

 1. R4(config)ip route 200.200.200.0 255.255.255.252 100.100.100.2

 2. R6(config)ip route 100.100.100.0 255.255.255.252 200.200.200.1


### Layer 4 ( 전송계층, Transport - 데이터 단위 : Segment )
양 단말 간( End-to-End )을 연결하는 전송 경로를 통하여 데이터의 효율적 전송을 위한 역할을 한다. ( TCP, UDP )

ex) TCP : 전화를 생각해라. 호를 누르고 연결이 됐을 때 통화가 가능

       UDP : 방송을 생각해라. 특정 대상과의 연결이 아니고 영상을 모두에게 뿌려 볼 수 있게

데이터 분할 및 재조립, E-t-E 간 흐름 제어, 오류 제어 기능, Port Number 구분

- 송, 수신자 간 프로세스를 연결하는 통신 서비스를 제공한다.
- 연결 지향 데이터 스트림 지원, 신뢰성, 흐름 제어, 다중화 등 ( TCP, UDP )
- 속도 : UDP > TCP, 안정성 : TCP > UDP

#### TCP( Transmission Control Protocol ) : 전송 제어 프로토콜

- 연결 지향 전송 방식을 사용한다.
- 인터넷에 연결된 컴퓨터에서 실행되는 프로그램 간에 통신을 안정적으로, 순서대로, 에러없이 교환할 수 있게 한다.

##### TCP Header (20 byte 옵션제외)

![image](https://user-images.githubusercontent.com/60500649/152643885-e8c0932a-3c20-482c-a1a5-54ed6eace0cb.png)


Source Port, Destination Port : 출발지, 목적지 Port

Sequence Number : 송신측의 보낼 데이터 스트림의 단위를 나타내는 순번.

Acknowledgment Number : 자신이 수신할 때 상대방이 보내야 할 송신 순번을 가짐.

Offset : 4로 나눔

Reserved(예약) : 사용안함

Window : 보냄과 받음 확인 ( 사용 공간 확인 )

###### TCP Flags

![image](https://user-images.githubusercontent.com/60500649/152643889-4e2438e5-9637-4b62-b4c6-fa639c87c337.png)


- Acknowledgment : 승인함
- Push : 데이터 넣기
- Reset : 초기화
- Sync : 상대와 연결 시 무조건 사용, 계속되는 연결 상태 확인
- Final : 종료선언

Urgent Pointer : TCP Flags의 Urgent bit와 세트이다.

###### TCP의 연결 수립 과정 ( 3Way Handshake : 악수 )

- TCP를 이용한 통신 중 프로세스와 프로세스를 연결하기 위해 가장 먼저 수행되는 과정

1. Client가 Server에게 요청 패킷을 보낸다.

2. Server가 Client의 요청을 받아들이는 패킷을 보낸다.

3. Client는 이를 최종적으로 수락하는 패킷을 보낸다.

ex)

1way - Flag : SYN : Client

    S:100 A:0 ( S : 랜덤한 값 생성 )

2way - Flag : SYN+ACK : Server

    S:2000 A:101 ( S : 랜덤한 값 생성, A : 1way의 S값 + 1 )

3way - Flag : ACK : Client

    S:101 A:2001 ( S : 2way의 A값, A : 2way의 S값 + 1 )

###### TCP의 데이터 송수신 과정

1. Client가 다시 요청 시엔 SEQ번호와 ACK번호가 그대로이다.

2. Server가 요청 받을 때 SEQ번호는 받은 ACK번호가 된다.

3. Client의 ACK번호는 받은 SEQ번호 + 데이터크기

ex)

    1 - Flag : PUSH + ACK : Client

      S:101 A:2001 ( 연결 수립 과정 중 3way 부분의 값을 그대로 사용 )

    2 - Flag : PUSH + ACK : Server

     S:2001 A:201 ( S : 1번의 A값, A : 1번 S값 + 보내는 데이터 )

    3 - Flag : ACK : Client

     S:201 A:2501 ( S : 2번의 A값, A : 2번의 S값 + 받는 데이터 )


###### TCP 상태 전이도

![image](https://user-images.githubusercontent.com/60500649/152643894-0050e299-bdf9-4f29-86ff-0d20894418a6.png)


active opne : 능동

passive opne : 수동

LISTEN : 요청 대기 상태

ESTABLISHED : 연결 수립 상태

실선 : Client

점선 : Server

**확인**

-> 아무 웹 접속 후 TCP Stream, Flow Graph 확인해보면 자세하게 나와있다.

-> netcat 프로그램으로 가상머신과 테스트 후 캡쳐화면 확인.



#### UDP( User Datagram Protocol ) : 사용자 데이터그램 프로토콜

- 단순한 전송에 사용되고, 오류의 검사와 수정이 필요 없는 프로그램에서 주로 수행

- 서비스의 신뢰성이 낮고, 데이터그램 도착 순서가 바뀌거나, 중복되거나, 심지어는 통보    없이 누락시키기도 한다.



##### UDP Header (8 byte)

![image](https://user-images.githubusercontent.com/60500649/152643904-f588cdce-168c-40f5-b444-b5cfec6b2c77.png)


DNS( UDP/53 ), TFTP( UDP/69 ), RIP 등

**확인**

-> VM과 HOST에서 tftpd 프로그램 테스트

    - tftpd로 HOST -> VM 파일 옮긴 후 패킷캡쳐 확인

#### Port Number
- 특정 프로세스끼리 통신을 하기 위해 사용( 하나의 포트번호는 하나의 프로그램만 )
- 연결 정보 : netstat -ano

##### Well-Known(잘 알려진 포트 번호)
```
FTP : 20, 21
SSH : 22
TELNET : 23
SMTP : 25
DNS : 53
DHCP : 67, 68
TFTP : 69
HTTP : 80
POP3 : 110
HTTPS : 443
```

##### Registered(유명한 포트 번호)
```
Oracle DB Server : 1521
MySQL Server : 3306
MS Remote Desktop : 3389
```

##### Dynamic(일반 사용 포트 번호)
```
49152 ~ 65535
```

##### 확인
`netstat -ano`
- TCP는 상태가 활발함, UDP는 상태가 없음. ( 연결, 비연결형의 차이점 드러남 )
- PID( Process ID ) : 프로그램을 구분하는 ID ( 유동적인 ID )

### Layer 5 ( 세션계층, Session )
양 끝단의 응용프로세스가 통신을 관리하기 위한 방법을 제공한다. ( 대화채널 )

* 대화채널이란? 멀티 미디어 통신 환경에 오디오 채널, 비디오 채널, 텍스트 채널을 일컫는다.

모드 - 전이중, 반이중, 단방향 등

동기화 - 데이터 스트림에 동기점 추가

### Layer 6 ( 표현계층, Presentation )
7계층에서 만들어진 데이터에 확장자를 붙여 어떤 유형의 데이터인지를 알려주는 계층이다. ( 데이터 압축, 암호화, 부호화 )

### Layer 7 ( 응용계층, Application )
사용자와 컴퓨터 간의 연결을 제공할 수 있는 UserInterface를 제공하는 영역이다. ( 프로그램과의 대화 )

하위 계층의 자원을 받아서 특정 서비스를 제공하기 위함.

#### HTTP(HyperText Transfer Protocol)
- www에서 쓰이는 핵심 프로토콜로 웹 표준 데이터를 받아오는 프로토콜이다. (Request / Responnse 동작에 기반하여 서비스를 제공한다)


##### 웹 생성을 위한 다양한 기술들
**WEB 표준** : HTML, Javascript, CSS 등 (Client에서 동작한다, Front-End)
**WEB 기술** : ASP/ASP.NET, JSP, PHP 등(Server에서 동작한다, Back-End)

**HTTP 1.0**
 - 연결 수립, 동작, 연결 해제의 단순함이 특징이다. ( 하나의 URL은 하나의 TCP 연결 )
 - 단순 동작이 반복되어 통신 부하 문제가 발생하기도 한다. ( 3Way handshake 반복 )

**HTTP 1.1**
 - 연결이 맺어지면 데이터를 모두 받기 전까지는 연결을 끊지 않는다.

##### HTTP 요청 프로토콜 구조

![image](https://user-images.githubusercontent.com/60500649/152644020-f9f30563-ed2c-4b39-ba6c-2258fe751692.png)

- Request Line : 요청
- Headers : 옵션 개념
- 공백
- Body : 요청 시 추가적인 데이터

###### 일반적인 예시

![image](https://user-images.githubusercontent.com/60500649/152644039-e0986dcf-40ca-4c82-8fc1-18ed713be502.png)

- Request Line : 맨 윗줄
- Headers : 나머지

##### HTTP 요청 프로토콜의 메소드

![image](https://user-images.githubusercontent.com/60500649/152644083-d1ae9f4a-b7f9-4f98-bff3-9f07b0bfaf30.png)


###### 요청 타입

![image](https://user-images.githubusercontent.com/60500649/152644067-85a8e7e3-06c6-4c52-8468-e7781a1a6d3f.png)


- GET : 데이터를 요청( 보낼 수 있다? )
- POST : 데이터를 보냄 ( 요청 할 수 있다? )
- COPY, MOVE, DELETE 등 : 대부분 막는다.

**GET과 POST의 차이점**
- GET는 요청사항을 주소 창에 포함, POST는 Body에 포함
- 결국 packet capture 시에는 다 보이기 때문에 HTTPS를 사용


##### URI (Uniform Resource Identifier)
- 인터넷 상에서 특정 자원을 나타내는 유일한 주소

**구조**
`protocol://host[:port][/path][?query]`

-> query데이터를 path에 전달해준다.


###### 확인
-> jdk(oracle) 설치 후 apache-tomcat 실행

- 환경변수 : 시스템의 환경과 관련된 값을 저장하는 변수

( 고급 시스템 설정 -> 고급 -> 환경 변수 시스템 변수 설정 -> ;Path 경로 설정 )<br>
( 추가 변수 JAVA_HOME, C:\Program Files\Java\jdk1.8.0_231 )<br>

-> tomcat\bin\startup.bat 실행<br>
-> webapps\123\456\789.txt 파일 만든 후 웹 주소 뒤에 해당 경로 입력 확인<br>
-> ?query실습도 진행 ( jsp파일 생성 후 진행 )<br>


##### HTTP 응답 프로토콜 구조

![image](https://user-images.githubusercontent.com/60500649/152644144-328c7b01-f3e1-49b5-a638-4554b301a247.png)

- Status Line
- Headers
- 공백
- Body


##### HTTP 응답 프로토콜의 메소드

![image](https://user-images.githubusercontent.com/60500649/152644193-a1df4ab1-868b-4fcc-af1e-7735cf04e7b0.png)


##### HTTP 상태코드

![image](https://user-images.githubusercontent.com/60500649/152644203-f58d3493-bcae-416d-b38f-7e8a74aa0b69.png)


- 403 : Forbidden (권한 X)
- 404 : Not Found (서버에 없는)
- 500 : Internal Server Error (서버 멈추거나 설정 오류)
- 503 : Service Unavailable (최대 Session 수를 초과)


##### HTTP의 헤더

![image](https://user-images.githubusercontent.com/60500649/152644217-690581fc-ffb7-4a9c-af55-c24efaa5a0e6.png)


###### 일반적인 헤더
- Content-Length : 메시지 바디 길이를 나타낼 때 쓰임
- Content-Type : 메시지 바디에 들어있는 컨텐츠의 종류

###### 요청 헤더
- Cookie : 서버로부터 받은 쿠키를 다시 서버에게 보내주는 역할을 함.
- Host : 요청된 URL에 나타난 호스트명을 상세하게 표시 ( HTTP1.1은 필수 )
- User-Agent : Client Program에 대한 식별 가능 정보를 제공

###### 응답 헤더
- Server : 사용하고 있는 웹 서버의 소프트웨어에 대한 정보를 포함
- Set-Cookie : 쿠키를 생성하고 브라우저에 보낼 때 사용.

###### 확인
`netcat을 이용해 www.nate.com에 접속 ( port : 80 )`

- GET / HTTP/1.1 요청 시 응답이 오는 것을 볼 수 있다.

`HTTP 프로토콜 수정 실습( Falcon Proxy Settings, burpsuite Proxy Intercept )`

- 페이지 새로고침 하면 Burpsuite의 인터셉트 진행 ( Forward로 다음 )

## Header

![image](https://user-images.githubusercontent.com/60500649/152643706-38e3e06f-a937-46e2-8695-a65ce475add7.png)

위 사진은 송신 측 A  ----- > 수신 측 B로 통신이 이루어 질 때의 각 계층별 데이터의 구조이다.

```
AH : Application Header
PH : Physical Header
SH : Session Header
TH : Transport Header
NH : Network Header
DH : Data-Link Header
DT : Data-Link Trailer
```
송신 측 A에서 데이터를 전송하면 각 계층을 거쳐 Data에 여러 Header가 붙게된다.

Header가 포함된 Data는 수신 측 B에서 받고, 순서대로 분해가 진행됨.

## 계층 별 프로토콜과 표준 모델

### Network Protocol
- 일종의 규칙과 양식, 약속

### 각 계층별 프로토콜

- 물리 ( MAC ) : Ethernet Protocol
- 네트워크 ( IP ) : ICMP, IPv4, IPv6, ARP
- 전송 ( PortNumber ) : TCP, UDP

(목적지를 위해선 일단 가까운 곳부터 Ethernet -> IPv4 -> TCP -> Data)

### Network Model (OSI 7 Layer, TCP/IP 4 Layer)

![image](https://user-images.githubusercontent.com/60500649/152643720-03e253e5-6ab9-4316-9148-a00924ca0776.png)

OSI 7계층( ISO에서 지정한 국제 표준 )
- 데이터를 주고받을 때 데이터 자체의 흐름을 각 구간별로 나눠 놓은 것
- 각 회사 별 통신 장비의 호환성을 위해, 장애가 났을 때의 대응 편리

TCP/IP계층
- 컴퓨터들이 서로 정보를 주고받는데 쓰이는 통신 규약의 모음


#### OSI 7 Layer, TCP/IP 4 Layer 비교

![image](https://user-images.githubusercontent.com/60500649/152643729-ef9862c3-d752-437f-bd20-8ebe0a1c7f4e.png)

OSI : 역할 기반, 통신 전반에 대한 표준
TCP/IP : 프로토콜 기반, 데이터 전송기술 특화


Packet : 네트워크 상에서 전달되는 데이터의 단위 ( 데이터의 형식화된 블록 )
- 제어정보와 사용자 데이터( Payload )로 이루어져있다.


####  캡슐화 된 패킷의 기본 형식

**Packet Encapsulation**

![image](https://user-images.githubusercontent.com/60500649/152643734-3243943e-2820-4ffc-9bfe-d475d68c2140.png)


**Packet Decapsulation**

![image](https://user-images.githubusercontent.com/60500649/152643739-7247f16c-1c44-4666-9abe-a902cca604ac.png)


