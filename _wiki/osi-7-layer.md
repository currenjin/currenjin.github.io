---
layout  : wiki
title   : OSI 7 Layer(OSI 7 계층)
summary :
date    : 2022-02-05 14:00:00 +0900
updated : 2022-02-05 14:00:00 +0900
tag     : network
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# OSI 7 Layer(OSI 7 계층)
## OSI 7 Layer - 개방형 시스템

모든 종류의 컴퓨터 시스템 간 통신을 가능하게 하는 네트워크 시스템 설계를 위한 계층구조이다.

통신을 7단계로 표준화하여 효율성을 높이기 위함.

### 개방형 시스템이란?

: 기반 구조에 관계없이 서로 다른 시스템 간의 통신 기능을 제공하는 것을 말한다.

### OSI 7계층이 생겨나게 된 이유
1. 데이터의 흐름이 한 눈에 보임   ->   계층별 캡슐화, 디캡슐화

2. 문제해결에 용이   ->   네트워크 문제를 7단계로 나누어 접근

3. 여러 장비의 호환성이 증대   ex) 국산 케이블, 인텔 랜카드 = 이상 X



## Layer 1 ( 물리계층, Physical - 데이터 단위 : Bit )

: 전기적 신호를 이용해서 통신 케이블로 데이터를 전송한다. ( 신뢰성과 피드백은 관여 X )

유선 : 꼬임선( UTP, STP ), 동축 케이블, 광 케이블 등

무선 : 주파수 대역 등

장비는 Hub와 Repeater 등이 있다.

## Layer 2 ( 데이터링크계층, Data Link - 데이터 단위 : Frame )

: 송/수신 되는 정보의 오류와 흐름을 관리하여 안전한 정보의 전달을 수행할 수 있도록 돕는 역할을 한다. ( MAC Address 통신 )



Frame 구조, 오류 제어, 흐름 제어, 동기화, 접근 제어

장비는 Switch와 Bridge 등이 있다.

## Layer 3 ( 네트워크계층, Network - 데이터 단위 : Packet )

: 데이터를 목적지까지 가장 안전하고 빠르게 전달하는 역할을 한다. ( Routing )

ex) 편지 봉투 겉에 써진 주소를 생각하면 됨. 편지내용은 봉투 내부에 있고, 봉투에 써진 주소로 위치를 찾아간다.



송신 측 : 패킷 구성

수신 측 : 패킷 분해

Traffic 제어, 네트워크 보안, 송/수신 측 논리적 주소( IP ) 설정

장비는 Router, L3 Switch 등이 있다.

## Layer 4 ( 전송계층, Transport - 데이터 단위 : Segment )

: 양 단말 간( End-to-End )을 연결하는 전송 경로를 통하여 데이터의 효율적 전송을 위한 역할을 한다. ( TCP, UDP )

ex) TCP : 전화를 생각해라. 호를 누르고 연결이 됐을 때 통화가 가능

       UDP : 방송을 생각해라. 특정 대상과의 연결이 아니고 영상을 모두에게 뿌려 볼 수 있게

데이터 분할 및 재조립, E-t-E 간 흐름 제어, 오류 제어 기능, Port Number 구분

## Layer 5 ( 세션계층, Session )

: 양 끝단의 응용프로세스가 통신을 관리하기 위한 방법을 제공한다. ( 대화채널 )

* 대화채널이란? 멀티 미디어 통신 환경에 오디오 채널, 비디오 채널, 텍스트 채널을 일컫는다.

모드 - 전이중, 반이중, 단방향 등

동기화 - 데이터 스트림에 동기점 추가

## Layer 6 ( 표현계층, Presentation )

: 7계층에서 만들어진 데이터에 확장자를 붙여 어떤 유형의 데이터인지를 알려주는 계층이다. ( 데이터 압축, 암호화, 부호화 )

## Layer 7 ( 응용계층, Application )

: 사용자와 컴퓨터 간의 연결을 제공할 수 있는 UserInterface를 제공하는 영역이다. ( 프로그램과의 대화 )

하위 계층의 자원을 받아서 특정 서비스를 제공하기 위함.

## Header

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
