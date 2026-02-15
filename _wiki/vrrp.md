---
layout  : wiki
title   : VRRP(Virtual Router Redundancy Protocol)
summary :
date    : 2022-02-05 14:00:00 +0900
updated : 2022-02-05 14:00:00 +0900
tags     : network
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# VRRP(Virtual Router Redundancy Protocol, 가상 라우터 중복 프로토콜)

## 배경

**PC-Router-Internet**

![image](https://user-images.githubusercontent.com/60500649/152643651-b30e30d6-0a71-4e40-821a-2a6dcec45107.png)

보통의 경우에 PC가 통신을 하기 위해선 Router를 지나 인터넷으로 향한다.

* 위 그림에서 PC는 Gateway 주소가 Router 를 바라본다.

**BUT !**

이러한 상황에서 Router 에 문제가 발생한다면 ? PC는 인터넷과의 어떤 접촉도 할 수가 없어진다.

그렇기 때문에 장애에 대비해 아래와 같이 두 개의 Router 를 놓아 이중화 구성을 하는 것.



**PC-Switch-Router(2)-Internet**

![image](https://user-images.githubusercontent.com/60500649/152643657-4c0afb0c-630b-401a-ae9d-fc2533e82505.png)


하지만 이런 구성에서도 불편함은 있었다.

만약, PC의 Gateway 가 Router1을 바라보고 있었을 때 Router1이 정상작동을 하지 못 하는 상태라면

PC 에서는 수동으로 Gateway 에 정상작동하는 Router2의 주소를 입력해야 할 것이다.

이러한 상황을 해결하고자 VRRP 가 탄생하게 된 것이다.

## 특징

* 여러 대의 Router 로 가는 Interface 를 논리적으로 하나로 묶은 후 VIP(Virtual IP)를 부여.

ex) Router1과 Router2으로 가는 Interface 에 각각 10.0.0.1, 10.0.0.2의 IP가 부여된 상태에서 VRRP 구성을 하여 묶은 Interface 에 10.0.0.3을 준다.

-> PC 에서는 Gateway 를 10.0.0.3 으로 주면, 마치 한 Interface 로만 통신이 되는 줄 안다.

* 해당 Router 중 한 대를 지정하여 Master, 다른 나머지 라우터가 Backup 의 역할을 하게 된다.

- Master 의 장비가 다운되면, Backup 장비가 Master 로 승격.

아 참, 같은 기능과 목적을 가진 프로토콜 중 HSRP(Hot Standby Router Protocol)라는 녀석도 있다.

