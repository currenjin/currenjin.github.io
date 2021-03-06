---
layout  : wiki
title   : 공인 아이피와 사설 아이피(Public & Private IP Address)
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

# 공인 아이피와 사설 아이피(Public & Private IP Address)
## 공인 아이피(Public IP) 란?

일단 당신의 집 주소가 XX시 XX구 XX동 123-1 번지라고 하자.

해당하는 이 주소는 당신이 택배를 주문한다고 하면 배송을 위해 자신의 위치를 알리는 전 세계에서 하나 뿐인 주소인 것이다.

**공인 IP도 같다.** 인터넷에게서 자신을 알릴 수 있는 전 세계에서 유일한 고유 IP Address 인 것.

### 공인 IP 종류

#### A Class
**Range** : 0.0.0.0 ~ 126.255.255.255 <br>
**Start bit** : 0000 0000 ~ <br>

* A Class 127대역은 루프백 주소.

#### B Class
**Range** : 128.0.0.0 ~ 191.255.255.255<br>
**Start bit** : 1000 0000 ~

#### C Class
**Range** : 192.0.0.0 ~ 223.255.255.255
**Start bit** : 1100 0000 ~

#### D Class
**Range** : 224.0.0.0 ~ 239.255.255.255
**Start bit** : 1110 0000 ~

#### E Class
**Range** : 240.0.0.0 ~ 255.255.255.255
**Start bit** : 1111 0000 ~

## 사설 아이피(Private IP) 란?

XX시 XX구 XX동 123-1 번지라는 고유 주소가 존재할 때, 밖에서 불리우는 주소가 아닌 내부에서 불리우는 주소가 있다.

예를 들어 우리 집의 거실, 주방, 화장실, 옷방 등 내부에서만 알 수 있는 것.

그렇게 사설 IP도 소수의 공인 IP를 이용해 NAT라는 기술을 사용하며 내부의 주소를 더욱 확장시키는 용도로 쓰인다.

<br>

**굳이 왜 그렇게 까지?**

만약 규모가 큰 한 회사에서 직원 개개인마다 인터넷을 사용한다고 했을 때 컴퓨터마다 IP를 주어야 할 것이다.

하지만 할당하는 IP가 전 세계에서 같이 사용하는 Public IP Address 라면 그 수 많던 IP는 얼마 못 가 고갈될 것.

또 보안적인 측면에서도 문제가 생길 것이고, 공인 IP 하나하나도 다 관리가 되고있기 때문에 비용에 대한 부담도 생길 것이다.

이러한 이유들 때문에 내부적으로 사용하는 Private IP Address를 사용하는 것이다.

### Class 별 Private IP 대역 

- 10.0.0.0 ~ 10.255.255.255

- 172.16.0.0 ~ 172.31.255.255

- 192.168.0.0 ~ 192.168.255.255