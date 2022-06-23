---
layout  : wiki
title   : Fitnesse
summary :
date    : 2022-06-22 09:30:00 +0900
updated : 2022-06-23 09:30:00 +0900
tag     : java
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# FitNesse

## What is FitNesse
FitNesse 는 자동화 테스트 도구입니다.<br>
우리가 흔히 말하는 Acceptance criteria 를 지정하고 검증하는 도구죠.<br>
- Acceptance Criteria 에 대해서 궁금하다면 여기를 보시면 됩니다.<br>
<br>
FitNesse 는 프로젝트의 모든 이해 관계자가 서로 쉽게 상호작용할 수 있도록 웹 브라우저를 통해 요구사항을 만들고, 수정할 수도 있습니다.(by Wiki)<br>
또한, 요구사항들은 실제로 실행될 수 있기 때문에 Application 이 설계된 대로 작동한다는 것을 증명할 수 있죠.<br>
<br>

## FitNesse Download
FitNesse 는 web server 의 형태이기 때문에, 서버를 실행시켜야 합니다.

1. [FitNesse Download](http://fitnesse.org/FitNesseDownload) 페이지에 접속합니다.
2. jar file 을 다운로드합니다.
3. `java -jar [jar file]` 명령을 통해 실행합니다.
4. 포트번호를 따로 지정하지 않았다면 80 번 포트의 프로세스가 띄워집니다.
5. `http://localhost` or `http://127.0.0.1` 주소로 접속합니다.

## FitNesse Process
![image](https://user-images.githubusercontent.com/60500649/175182572-e72dd4cc-5b4c-45fe-9db7-08d5ed986f90.png)

## How to use FitNesse

## Example
### TwoMinuteExample
- [Link](http://localhost/FitNesse.UserGuide.TwoMinuteExample)

테스트 페이지에 접속했습니다.

1. 상단 'Test' 버튼을 클릭합니다.
2. 테스트가 실패합니다.
   1. 테스트 테이블에서 100 을 4로 나누었을 때, 33 을 예상했습니다.
   2. 실제로는 25 가 반환되었습니다.
   3. 이는 테스트 테이블의 결함입니다.
3. 상단, 'Edit' 버튼을 클릭합니다.
4. 테스트 테이블의 33 값을 25.0 으로 변경 후 'Save' 합니다.
5. 'Test' 버튼을 클릭하면 성공하는 것을 확인할 수 있습니다.
