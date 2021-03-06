---
layout  : wiki
title   : Dockerfile
summary :
date    : 2022-01-31 13:00:00 +0900
updated : 2022-01-31 13:00:00 +0900
tag     : container
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Dockerfile
### Example 1


> **Example**
> 1. 모든 HTTP 요청에 대해 "Hello Docker!!"라는 응답을 보낸다.
> 2. Port Number 8080으로 요청을 받는 서버 애플리케이션으로 동작한다.
> 3. 클라이언트로부터 요청을 받으면 received request라는 메세지를 표준으로 출력한다.

* 해당 조건에 맞게 Image가 될 파일을 작성한다.

* Docker의 이미지가 될 파일은 go언어로 작성하였습니다.

#### Go 언어 설치 작업

[https://snowdeer.github.io/go/2018/01/20/how-to-install-golang-on-centos/](https://snowdeer.github.io/go/2018/01/20/how-to-install-golang-on-centos/)

#### Configuration
**main.go file**
![image](https://user-images.githubusercontent.com/60500649/151737862-05a28d2e-890c-450c-a064-b81d387f3cf4.png)

**Dockerfile**
![image](https://user-images.githubusercontent.com/60500649/151737866-6f2bfed5-7b22-49d7-971f-8a120a81a55e.png)

**FROM** : 도커 이미지의 바탕이 될 베이스 이미지를 지정

-> main.go를 실행하기 위해 Go 언어의 런타임이 설치된 이미지를 사용


**RUN** : 도커 이미지를 실행할 때 컨테이너 안에서 실행할 명령을 정의

-> main.go 애플리케이션을 배치하기 위한 /echo 디렉터리를 mkdir 명령으로 생성


**COPY** : 도커가 동작 중인 호스트 머신의 파일이나 디렉터리를 도커 컨테이너 안으로 복사

-> main.go 파일을 도커 컨테이너 안에서 실행할 수 있도록 컨테이너 안으로 복사


**CMD** : 도커 컨테이너를 실행할 때 컨테이너 안에서 실행할 프로세스를 지정

-> go run /echo/main.go 명령과 같은 내용이다.

#### Docker Image Build

**main파일과 Dockerfile 작성이 끝났으면 image build를 진행해보자.**

![image](https://user-images.githubusercontent.com/60500649/151737872-affa3067-9295-476c-aaef-d4cc2ed3411f.png)

```
root@localhost test# docker build -t new:latest .

-t : 생성할 이미지의 이름 지정
```

![image](https://user-images.githubusercontent.com/60500649/151737874-98e06508-5128-4f08-8d50-5cce0c675e14.png)


이미지가 정상적으로 생성되었다. (go language와 new:latest가 생성되어있는 모습)

![image](https://user-images.githubusercontent.com/60500649/151737878-51070af2-2e87-4e95-83b1-025b2dbd4874.png)


이제 해당 이미지로 컨테이너를 실행해보자.

![image](https://user-images.githubusercontent.com/60500649/151737884-ce0571a4-5352-488d-bbe7-bf0d8ea95686.png)

```
docker run -d -p 9999:8080 --name test new:latest

-d : 해당 컨테이너를 백그라운드로 실행
-p 9999:8080 : 포트포워딩이다. docker를 사용하는 host의 9999포트를 컨테이너의 8080으로 맵핑
--name : container의 이름을 지정한다.
``` 

명령 아랫줄 이상한 문자열은 container의 고유 이름을 나타낸다.

![image](https://user-images.githubusercontent.com/60500649/151737893-9e25d8a8-3e8c-410c-8122-4397a36077bc.png)

정상적으로 작동하는 모습을 볼 수 있다.


#### Test

![image](https://user-images.githubusercontent.com/60500649/151737899-c3695266-07be-49f1-bc2e-b30031db5275.png)

'Hello Docker!!'가 정상적으로 출력이 된다.
