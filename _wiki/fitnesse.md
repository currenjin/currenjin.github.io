---
layout  : wiki
title   : Fitnesse
summary :
date    : 2022-06-22 09:30:00 +0900
updated : 2022-06-25 20:00:00 +0900
tag     : atdd
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
- Acceptance Criteria 에 대해서 궁금하다면 [여기](https://currenjin.github.io/wiki/ATDD/#acceptance-criteria)를 보시면 됩니다.<br>
<br>
<br>
FitNesse 는 프로젝트의 모든 이해 관계자가 서로 쉽게 상호작용할 수 있도록 웹 브라우저를 통해 요구사항을 만들고, 수정할 수도 있습니다.(with Wiki)<br>
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

### Click on the 'Test' button
테스트 버튼을 클릭하면 무슨 일이 발생할까요?

1. 먼저 FitNesse 는 기본 테스트 시스템인 Slim 에 테스트 테이블을 제출합니다. (테스트 시스템에는 테스트를 실제로 수행하는 데 필요한 코드가 포함되어 있음)
2. Slim 은 테스트 테이블에 해당하는 Fixture code 를 찾아 실행합니다.
3. Fixture code 는 작업을 수행하기 위해 기본 애플리케이션을 호출하고 결과를 픽스처에 다시 보고합니다.
4. Fit 은 Fixture 코드를 실행한 결과를 FitNesse 에 돌려줍니다.
5. FitNesse 는 테이블 셀을 빨간색으로 바꿀지 녹색으로 바꿀지(예외가 발생한 경우 노란색) 파악하고 그에 따라 결과 페이지를 표시합니다.

### What is Fixture code
Fixture 는 Slim 이 테이블 내용을 처리하는데 사용할 클래스입니다.<br>

#### Example
`eg.Division`
- `eg` 는 Java 패키지를 지정합니다.
- `Division` 은 호출할 실제 클래스를 지정합니다.


## How to use FitNesse
### Test page
### Test table

## Example
### TwoMinuteExample
- [Link](http://localhost/FitNesse.UserGuide.TwoMinuteExample)

#### Division class

```java
public class Division {
  private double numerator, denominator;
  
  public void setNumerator(double numerator) {
    this.numerator = numerator;
  }
  
  public void setDenominator(double denominator) {
    this.denominator = denominator;
  }
  
  public double quotient() {
    return numerator/denominator;
  }
} 
```

테스트 페이지에 접속했습니다.

1. 상단 'Test' 버튼을 클릭합니다.
2. 테스트가 실패합니다.
   1. 테스트 테이블에서 100 을 4로 나누었을 때, 33 을 예상했습니다.
   2. 실제로는 25 가 반환되었습니다.
   3. 이는 테스트 테이블의 결함입니다.
3. 상단, 'Edit' 버튼을 클릭합니다.
4. 테스트 테이블의 33 값을 25.0 으로 변경 후 'Save' 합니다.
5. 'Test' 버튼을 클릭하면 성공하는 것을 확인할 수 있습니다.

#### Fixture code 를 사용해 slim 이 테스트 테이블을 처리하는 방법
<img width="271" alt="image" src="https://user-images.githubusercontent.com/60500649/175770160-263c3147-36d2-4b5d-b9b3-3f940d25f55b.png">
<br>

1. Slim 은 예제 데이터의 행을 처리합니다. (왼쪽에서 오른쪽으로)
2. Setter method 를 이용해 Division 클래스 필드(numerator, denominator)에 각각 값을 저장합니다.
   1. setNumerator(numerator), setDenominator(denominator) 를 호출하도록 지시합니다.
4. 이후 각 행에 대해 quotient method 를 호출합니다.
5. 값은 각 셀의 색상을 지정하는 결정 테이블로 반환됩니다.
   1. 반환 값이 셀 값과 일치하면 FitNesse 는 셀을 녹색으로 바꿉니다.
   2. 일치하지 않으면 FitNesse 는 빨간색으로 바꾸고, 예상 값과 실제 값을 표시합니다.
   3. Slim 이 예외를 만나거나 필드 또는 메소드를 찾을 수 없는 경우 셀을 노란색으로 바꾸고, 스택 추적을 삽입합니다.



