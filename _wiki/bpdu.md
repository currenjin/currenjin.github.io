---
layout  : wiki
title   : BPDU(Bridge Protocol Data Unit)
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

# BPDU(Bridge Protocol Data Unit)

## BPDU 란?
Switch간 연결링크가 확립이 되면 송/수신 되는 STP의 정보데이터이다. (종류: Configuration BPDU / TCN BPDU)

ex) BPDU가 한 군데로 들어오면 경로가 1개, 두 군데로 들어오면 경로가 2개다.

STP에서 Root-Bridge를 선출하기 위해선 Bridge-ID를 비교한다고 했는데, 상대방의 Bridge-ID를 어떻게 알 수 있을까?

바로 그 역할을 수행하는 것이 BPDU라는 Frame데이터이다.

## BPDU의 간단 구조

![image](https://user-images.githubusercontent.com/60500649/152643679-4ff0c964-60d7-480e-81df-afc7d6fe000d.png)

사진과 같이 BPDU의 구조는

Protocol ID, Version, Message Type, Flags, Root ID, Path Cost, Bridge ID, Port ID, Message Age,

그리고 세 개의 Time( Maximum Age, Hello Time, Forwarding Delay )으로 되어있다.

### Time

Hello Time : root-bridge에 의해 보내지는 bpdu의 간격 ( 2sec )

Forward delay time : Router가 Bridge Table을 완성하는 시간 ( 리스닝, 학습 상태 각각 15sec, 총 30sec )

Max age time : BPDU가 업데이트되기 전까지 저장되는 시간 ( 20sec )

웬만한 네트워크 엔지니어들은 STP구조에서 발생하는 공격, 오류로 부터 최대한 안전해지고자 STP 조정/보호기술을 적용한다.

## STP 조정/보호 기술
### BPDU Guard

- 포트를 통해서 BPDU를 수신했을 때 해당포트를 자동으로 Shutdown 시켜버린다. ( 주로 종단장치 포트에 설정됨 )

* 우선 정상적인 경우, 종단장치와 연결된 포트는 BPDU가 송신될 필요가 없다. 그리고 같은 이유로도 수신 될 필요가 없다.

  만약 BPDU가 해당 포트로 송, 수신이 된다는 것은 허가되지 않은 스위치, 허브 연결 또는 STP관련 해킹 공격 암시를 의미함.

### BPDU Filtering

- 포트에 BPDU를 송/수신 하지 않도록 설정하는 기능이다.

* 주로 BPDU를 송/수신 할 필요성이 없다고 판단되는 장비에 쓸데없는 이유로 부하가 걸리지 않도록 하는데 목적을 둠.

### Loop Guard

- STP구조에서의 BPDU수신으로 차단상태로 된 포트에서 자동으로 전송상태가 되는 것을 방지한다.

* STP구조에서 이미 차단상태가 되어버린 포트에서 상대 포트에게 일정시간 이상( 기본 50sec ) BPDU를 받지 못하면,

  차단상태에서 전송상태로 자동 변경된다. 이럴 경우, Looping 현상이 발생하여 그 것을 방지하기 위해 설정.
