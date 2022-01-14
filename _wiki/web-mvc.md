---
layout  : wiki
title   : Web-MVC
summary :
date    : 2022-01-07 11:30:00 +0900
updated : 2022-01-14 15:00:00 +0900
tag     : spring
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Web MVC

## Spring MVC 를 통해 CORS 을 처리할 수 있다.
- 현재 보안상 브라우저는 속해있는 origin 을 제외한, 외부의 origin resource 에 대한 호출을 금지한다.
- 그렇기에 허용된 도메인 간 요청의 종류를 지정할 수 있도록 가능하다.

### Processing
Spring MVC HandlerMapping 은 CORS 에 대한 내장 지원을 제공한다.<br>

### @CrossOrigin

```java
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin
    @GetMapping("/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```

- All origins
- All headers
- All http methods to which the controller method is mapped

### Global Configure

**Default**
- All origins
- All headers
- GET, HEAD, POST

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/api/**")
            .allowedOrigins("https://domain2.com")
            .allowedMethods("PUT", "DELETE")
            .allowedHeaders("header1", "header2", "header3")
            .exposedHeaders("header1", "header2")
            .allowCredentials(true).maxAge(3600);

        // Add more mappings...
    }
}
```

### CORS filter
`CorsFilter`

```java
CorsConfiguration config = new CorsConfiguration();

// Possibly...
// config.applyPermitDefaultValues()

config.setAllowCredentials(true);
config.addAllowedOrigin("https://domain1.com");
config.addAllowedHeader("*");
config.addAllowedMethod("*");

UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
source.registerCorsConfiguration("/**", config);

CorsFilter filter = new CorsFilter(source);
```

## Test
- Servlet API Mocks: Unit Test Controller
- TestContext Framework
- Spring MVC Test: Annotation 이 달린 Controller 를 테스트하기 위한 프레임워크.
- Client side REST
- WebTestClient

### MockMvc
- Spring MVC Application Test 지원
- 자체적으로 요청을 수행하고, 응답을 확인하는 데 사용


## Mission

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

### sample에 두개의 링크가 있는데, smaple/trevari.jsp를 검색했을 때 저 페이지가 나오면 됨
Hello Trevari가 나오면 됨
### http://localhost:8080/sample/trevari 이렇게 쳤을 때 sample/hello가 나오도록 해라
### http://localhost:8080/sample/trevari 이렇게 쳤을 떄 Hello Trevari가 나오게 한다.
### conf를 까봐라.
자바 파일 만들고 이걸 클래스파일로 만들고 web.xml을 건드러야 마지막 미션을 수행할 수 있을 것이다~
