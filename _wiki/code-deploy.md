---
layout  : wiki
title   : Code Deploy
summary :
date    : 2022-01-08 15:28:00 +0900
updated : 2022-01-08 15:28:00 +0900
tags     : aws
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Code Deploy

## Code Deploy 란?
AWS 에서 제공하는 배포 자동화 서비스 <br>
AWS 에서 제공하기 때문에, AWS 내 다양한 서비스와 손쉽게 연동해서 사용 가능 <br>
무중단 배포 기법(현재 위치 배포, 블루/그린 배포 등)을 지원 <br>

## 배포 과정
### 다이어그램
![image](https://user-images.githubusercontent.com/60500649/148670039-ed76b7e3-95b4-4f1e-a6aa-0dd54ef49a37.png)

### 작동 절차
1. Application Code, AppSpec.yml 파일을 코드 저장소에 업로드
2. CodeDeploy 에 배포를 요청
3. CodeDeploy 가 EC2 인스턴스들에 설치돼 있는 Agent 들에게 배포해달라 요청
4. Agent 들은 코드 저장소에서 코드를 내려받고, AppSpec.yml 에 적혀있는 설명서대로 배포를 진행
5. CodeDeploy Agent 를 배포한 이후 성공/실패 등 결과를 CodeDeploy 에게 알려줌

## 구성 요소
### CodeDeploy Agent
- EC2 인스턴스에 설치되어 CodeDeploy 명령을 기다리는 프로그램
- CodeDeploy 가 EC2 를 직접 움직이는게 아니라 Agent 가 모든 배포 행위를 진행
- 배포 진행 명령을 받으면, AppSpec.yml 파일에 있는 절차를 그대로 따라서 배포를 진행

### AppSpec.yml
- [공식 문서 링크](https://docs.aws.amazon.com/ko_kr/codedeploy/latest/userguide/reference-appspec-file.html)
- CodeDeploy Agent 가 명령을 받았을 때 어떻게 배포를 진행하는지 적어둔 명세서 파일
- YAML 양식

*스크립트 파일에 권한 추가 후 Git 에 올리고 싶다면 아래 명령 수행
```shell
git update-index --chmod=+x <script-file>
```
<br>

*각 스크립트 단계에서 exit code
```shell
코드 미지정 : 배포 성공
0 : 배포 성공
그 외 : 배포 실패
```
<br>

*서비스 실행 검증 스크립트 예제

ex) 배포 후 로컬의 10000번 포트에 대해 GET /health 요청을 날려보고 HTTP 응답 코드가 200인 경우에만 성공으로 간주한다.

```yaml
result=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:10000/health)

if [[ "$result" =~ "200" ]]; then
  exit 0
else
  exit 1
fi
```

## Examples
### 빌드 된 산출물이 서버에 복사되어 배포하도록 합니다.
AppSpec.yml 파일을 이용해 배포에 필요한 내용을 스크립팅
- application name : wsi-api
- deployment group name : dev-api
- deployment type : In-place deployment
- deployment target : EC2 Tag "wsi:deploy:group"="dev-api"


