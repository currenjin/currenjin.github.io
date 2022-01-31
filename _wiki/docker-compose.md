---
layout  : wiki
title   : Docker Compose
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

# Docker Compose

## Docker Compose 란?

: yam 포맷으로 기술된 설정 파일로, 여러 컨테이너의 실행을 한 번에 관리할 수 있게 해준다.

아래 주소를 통해 최신 버전의 정보를 얻을 수 있다.

[github-docker-compose](https://github.com/docker/compose/releases)

## 실행 예시

```
curl -L https://github.com/docker/compose/releases/download/1.25.4/docker-compose-`uname -s`-\`uname -m\` -o /usr/local/bin/docker-compose
```

### 권한 부여
```
chmod +x /usr/local/bin/docker-compose
```

### 버전 체크
```
docker-compose version
```

## docker-compose 명령으로 컨테이너 실행
먼저 컨테이너 하나를 실행해본다. (후에 같은 작업을 compose로 진행)

docker run -d -p 9999:8080 --name test new:latest

[##_Image|t/cfile@99044D365EA625382D|CDM|1.3|{"originWidth":800,"originHeight":94,"width":500,"height":59}_##]

잘 되는 것을 확인할 수 있다.

하지만 이 것이 목적은 아니니 바로 본론으로 돌아간다.

임의의 디렉터리에서 **docker-compose.yml** 라는 파일명으로 내용을 작성한다.  *띄어쓰기에 민감하니 조심하자.

[##_Image|t/cfile@99FE80375EA625392E|CDM|1.3|{"originWidth":216,"originHeight":111,"width":216,"height":111}_##]

**version** : 해당 파일을 해석하는데 필요한 문법 버전을 선언

**test**는 컨테이너의 이름에 해당한다.

**image**는 필자가 사용하는 new:latest 이미지를 이용한다

**ports**는 해당하는 컨테이너에 포트포워딩이다.


해당 파일을 실행하려면 **'docker-compose up'**을 사용한다.

[##_Image|t/cfile@996E2D485EA625392E|CDM|1.3|{"originWidth":363,"originHeight":34,"width":363,"height":34}_##]

run 명령과 같게도 성공적으로 실행이 된 모습이다.

**docker-compose down**

위 명령을 사용하게되면 yml파일에 정의된 모든 컨테이너가 정지 혹은 삭제된다.


**compose**의 놀라운 점은 컨테이너를 올리는 것만이 아니다.

이미지를 함께 빌드해 새로 생성된 이미지로 컨테이너를 올리는 것도 가능하다.


예를들어 Dockerfile에 정의된 이미지 빌드 파일이 main.go라면 일단 해당 파일이 있는 디렉터리로 향한다.

**docker-compose.yml** 파일에 다음과 같이 작성한다.

[##_Image|t/cfile@9945AD475EA6253B2D|CDM|1.3|{"originWidth":178,"originHeight":109,"width":178,"height":109}_##]


build에서는 Docker파일이 같은 디렉토리에 위치하므로 상대경로로 작성한다.

마찬가지로 **'docker-compose up'**명령으로 실행한다.

[##_Image|t/cfile@990382365EA6253C2D|CDM|1.3|{"originWidth":380,"originHeight":259,"width":380,"height":259}_##]

만약 해당 이미지를 빌드한 적이 있다면 빌드를 생략한다.

**! 하지만 --build 옵션을 사용하면 강제로 다시 빌드함**



## docker-compose 를 이용한 Jenkins 서비스 구축
위의 기능들을 사용하면서도 컨테이너의 관리를 충분히 유용하게 사용할 수 있다.  그러나, 진가는 여러 컨테이너를 실행할 때 발휘된다.

**Jenkins**를 예로 삼아 컴포즈를 진행한다.

**docker-compose.yml**

[##_Image|t/cfile@99E681435EA6253D30|CDM|1.3|{"originWidth":414,"originHeight":158,"width":414,"height":158}_##]


**volumes** : 호스트와 컨테이너 간 파일을 공유할 수 있다.

-> 작업 디렉토리 바로 아래에 jenkins_home을 /var/jenkins_home으로 마운트

**-d옵션을 이용하지 않고**(포어그라운드) **compose up**을 진행하겠다.

!! 만약 compose up 중 아래와 같은 오류가 난다면

[##_Image|t/cfile@994226505EA6253D2B|CDM|1.3|{"originWidth":736,"originHeight":48,"width":736,"height":48}_##]

-> 해당 디렉토리에 권한을 부여해주면 된다.

[##_Image|t/cfile@992749445EA6253E2A|CDM|1.3|{"originWidth":666,"originHeight":513,"width":666,"height":513}_##]

정상적인 up 상태이다.

문구 가운데에 **복잡한 문자열** 은 jenkins 웹에서 사용하는 **암호**이다.

[##_Image|t/cfile@990408365EA6253E2D|CDM|1.3|{"originWidth":800,"originHeight":681,"width":500,"height":426}_##]

다음 화면에선 따로 세세한 설정은 하지 않으니 바로 **Install**을 진행한다.

[##_Image|t/cfile@9946D9475EA6253F2D|CDM|1.3|{"originWidth":800,"originHeight":491,"width":500,"height":307}_##]

**설치 후 계정 설정을 해준다.**

**모든 설치가 완료된 모습**

[##_Image|t/cfile@9960A64B5EA6253F2D|CDM|1.3|{"originWidth":800,"originHeight":330,"width":500,"height":206}_##]

이와 더불어 실용적인 예로 **슬레이브 젠킨스 컨테이너를 추가** 해보겠다.

먼저 준비 작업으로 마스터 컨테이너에서 SSH 키를 생성

**docker exec -it master ssh-keygen -t rsa -C ""**

[##_Image|t/cfile@9998864A5EA625402D|CDM|1.3|{"originWidth":558,"originHeight":356,"width":558,"height":356}_##]

/var/jenkins_home/.ssh/id_rsa.pub 파일은 마스터가 슬레이브에 접속 시 사용

docker-compose.yml 파일

[##_Image|t/cfile@9927EA445EA625412A|CDM|1.3|{"originWidth":800,"originHeight":349,"width":500,"height":218}_##]

**slave01 영역의 SSH_PUBKEY 부분은 마스터의 id_rsa.pub 파일 내용을 복사한다.**
(외부 환경 변수로 받아오게 해야 한다.)

**links** : 다른 services 그룹에 해당하는 다른 컨테이너와 통신  (master에 slave에 대한 links 설정)

마찬가지로 **'docker-compose up -d'**를 진행한 후 정상적으로 올라온 것을 확인할 수 있다.

[##_Image|t/cfile@994159505EA625422B|CDM|1.3|{"originWidth":788,"originHeight":87,"width":500,"height":55}_##]

**이제 마스터 Jenkins에서 Slave를 인식시켜줘야 한다.**

Main Page -> Jenkins 관리 -> 노드 관리 탭에서 신규 노드 생성항목을 선택한다.

[##_Image|t/cfile@998C874A5EA625422D|CDM|1.3|{"originWidth":800,"originHeight":116,"width":500,"height":73}_##]

해당 탭을 지나서 설정 화면이 나오게 되는데 건드려야 할 설정은 아래와 같다.
1. **Remote root directory** : 홈디렉토리를 설정한다.(맘대로 해라)
2. **Launch method** : SSH를 사용하기 때문에 탭을 열어 SSH로 바꿔주어라.
3. **Host** : slave01 (SSH를 연결 시킬 Host)
4. **Credentials** : 탭을 열어 Jenkins를 선택해주자.(인증정보 추가에서는 아이디를 jenkins, Private Key는 Master의 id_rsa 파일)
5. **Host Key Verification** :Known hosts file Verification Strategy

저장을 하면 노드가 새로 추가되어 서로 간의 통신이 가능하다.



