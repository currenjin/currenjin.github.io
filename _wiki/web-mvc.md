---
layout  : wiki
title   : Web-MVC
summary :
date    : 2022-01-07 11:30:00 +0900
updated : 2022-01-07 11:30:00 +0900
tag     : spring
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Web MVC

### 톰캣을 이용해 브라우저에서 hello world 를 호출한다.
공식 문서 -> fist web application -> download example application <br>
-> 톰캣 다운로드
-> sample war 를 webapps 폴더로 이동
-> 권한 이슈 시 chmod 777 부여

### 톰캣 query param 을 받아 출력
request.getParameter(param);

### sample/trevari.jsp 접속 시 Hello Trevari 출력
sample/trevari.jsp 파일 생성 후 Hello Trevari 를 html 태그로 적용

### WAS 가 무엇인가
Web Application Server

## Mission
### sample에 두개의 링크가 있는데, smaple/trevari.jsp를 검색했을 때 저 페이지가 나오면 됨
Hello Trevari가 나오면 됨
### http://localhost:8080/sample/trevari 이렇게 쳤을 때 sample/hello가 나오도록 해라
### http://localhost:8080/sample/trevari 이렇게 쳤을 떄 Hello Trevari가 나오게 한다.
### conf를 까봐라.
자바 파일 만들고 이걸 클래스파일로 만들고 web.xml을 건드러야 마지막 미션을 수행할 수 있을 것이다~
