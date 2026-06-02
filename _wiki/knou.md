---
layout  : wiki
title   : 한국방송통신대학교(Korea National Open University)
summary : KNOU 컴퓨터과학과 학교·학과 안내와 주요 과목 강의별 정리, 핵심 암기표
date    : 2026-05-18 12:00:00 +0900
updated : 2026-06-02 12:00:00 +0900
tags    : [knou, computer-science, exam-prep]
toc     : true
public  : true
parent  : [[index]]
latex   : false
---
* TOC
{:toc}

# 한국방송통신대학교(Korea National Open University)

한국방송통신대학교(KNOU) 컴퓨터과학과의 학교·학과 안내, 주요 과목 강의별 정리,
평가 운영 방식, 시험 대비용 암기표를 한 곳에 모은 위키 문서다.

## 출처와 한계

본 문서의 강의별 정리·연습문제·암기표는 U-KNOU 강의 페이지의 학습개요·학습목표·연습문제·정리하기·참고자료를 교재 및 멀티미디어 강의에서 가져와 시험 대비용으로 재구성한 것이다.
시험 범위와 평가 방식은 학기마다 바뀔 수 있으므로 응시 전 반드시 학교 공지사항으로 최종 확인한다.
강의 개편이 있는 경우 최신 내용은 학교 공지에서 확인한다.

원본 자료 저장소: <https://github.com/currenjin/knou-archive>

## 한국방송통신대학교 안내

KNOU(Korea National Open University)는 원격 학사 시스템을 운영하는 국립대학이다.
온라인 강의(U-KNOU)와 출석수업, 지역 학습관 운영을 결합해 학기는 1·2학기 체제로 진행하고,
평가는 출석수업(또는 대체시험), 과제물, 형성평가, 기말시험으로 구성한다.

공식 안내는 학교 사이트를 참고한다.

- 학교 홈페이지: <https://www.knou.ac.kr/>
- U-KNOU(강의 사이트): <https://ucampus.knou.ac.kr/>

## 컴퓨터과학과 안내

컴퓨터과학과는 정보컴퓨터과학대학 소속으로, 프로그래밍 언어(Java, Python),
웹 프로그래밍(HTML5), 데이터 처리·분석, 컴퓨팅 응용 영역(유비쿼터스 등)을 다룬다.
이 문서에서 다루는 과목은 학과 커리큘럼의 일부이며, 전체 과목 안내는 학과 페이지를 참고한다.

- 학과 안내(컴퓨터과학과): <https://cs.knou.ac.kr/>

## 평가 운영 방식

| 구분 | 방식 | 비고 |
|---|---|---|
| 출석수업평가 | 맞춤형평가 (지역대학별) | 출석수업 담당 교수가 직접 출제 |
| 출석수업대체시험 | 온라인출석시험(객관식) 또는 온라인과제물 | 과목별로 다름 |
| 형성평가 | 학습진도율 + 연습문제 | 진도·연습 비중은 과목별 상이 |
| 기말시험 | 온라인출석시험(객관식) | 교재 및 멀티미디어 강의 전 범위 |

## 학습 가이드

각 강의의 학습목표와 연습문제부터 훑은 뒤, 헷갈리는 강의는 학습개요·주요용어로 되돌아가 다시 읽는다.
연습문제는 정답을 가리고 풀어본 뒤 맞춘다.
강의별 정리만으로 부족하면 각 과목 끝에 붙어 있는 핵심 암기표·시험범위 암기 리스트·키워드 압축 카드를 활용한다.

## 과목별 강의 정리

### 데이터정보처리입문

> 우선순위: 통계자료 검색·엑셀 함수/그래프·R/Python 분석 흐름을 절차 중심으로 암기

#### 핵심 암기표

| 주제 | 외울 문장 |
|---|---|
| 분석 절차 | - 데이터 분석은 문제 정의 → 수집 → 정리/분석 → 평가/해석 순서다. (순서 암기) |
| 데이터 vs 정보 | - 데이터는 관찰·측정된 값이다. (원자료)<br>- 정보는 데이터를 목적에 맞게 처리한 결과다. (의미 부여) |
| 자료 종류 | - 범주형 자료는 성별, 지역처럼 분류값이다. (숫자 연산 X)<br>- 양적 자료는 키, 점수처럼 수치값이다. (계산 가능) |
| 모집단 vs 표본 | - 모집단은 관심 대상 전체다. (population)<br>- 표본은 모집단에서 뽑은 일부다. (sample) |
| 중심 측도 | - 평균은 모든 값을 더해 개수로 나눈 값이다. (이상치 약함)<br>- 중앙값은 정렬했을 때 가운데 값이다. (이상치 강함)<br>- 최빈값은 가장 자주 나타나는 값이다. (여러 개 가능) |
| 산포 측도 | - 분산은 평균에서 얼마나 흩어졌는지를 나타낸다. (제곱 단위)<br>- 표준편차는 분산의 제곱근이다. (원 단위) |
| 통계 패키지 | - SPSS는 GUI 중심 통계 분석 도구다. (쉬운 조작)<br>- SAS는 대용량 자료 처리에 강하다. (상용)<br>- R은 오픈소스 통계 분석 언어다. (r-project)<br>- Python은 범용 프로그래밍과 데이터 분석에 모두 쓴다. (라이브러리 활용)<br>- Anaconda는 Python/R 데이터 분석 배포판이다. (패키지 포함) |
| 엑셀 함수 | - 엑셀 함수 입력은 `=`로 시작한다. (수식 표시) |
| 셀 참조 | - 상대참조는 복사 시 위치가 변한다. (기본 참조)<br>- 절대참조는 복사해도 고정된다. (`$` 고정)<br>- 혼합참조는 열 또는 행만 고정한다. (`$` 위치) |
| 그래프 종류 | - 막대그래프는 범주별 크기 비교에 쓴다. (category)<br>- 꺾은선그래프는 시간에 따른 변화를 보여준다. (trend)<br>- 원그래프는 전체 대비 구성 비율을 보여준다.<br>- 산점도는 두 변수 관계를 보여준다. (correlation 감각) |
| pandas 기본 | - `pd.read_csv()`는 CSV 파일을 읽는다. (DataFrame)<br>- `describe()`는 요약 통계를 출력한다. (count/mean/std) |

#### 키워드 압축 카드

| 주제 | 내용 |
|---|---|
| 한 줄 공식 | - 데이터 분석 = **문제 정의 → 수집 → 정리/분석 → 평가/해석**.<br>- 시험은 **통계자료 검색 + 엑셀 + R/Python 코드 흐름** 중심. |
| 통계/자료 | - 데이터 = 관찰·측정된 값.<br>- 정보 = 데이터를 목적에 맞게 처리한 결과.<br>- 범주형 = 성별/전공/지역처럼 분류.<br>- 양적 = 키/몸무게/점수처럼 수치.<br>- 모집단 = 전체, 표본 = 일부.<br>- 평균은 이상치에 약함, 중앙값은 이상치에 강함. |
| 통계 패키지 | - SPSS = GUI 중심, 쉬운 분석.<br>- SAS = 대용량 자료 처리 강점.<br>- R = 오픈소스 통계 분석, 공식 사이트 `www.r-project.org`.<br>- Python = 범용 프로그래밍 + 데이터 분석 라이브러리.<br>- Anaconda = Python/R 데이터 분석 배포판, `www.anaconda.com`. |
| 엑셀 | - 함수 입력은 `=`로 시작.<br>- 상대참조 = 복사 시 변함.<br>- 절대참조 = `$A$1`, 복사해도 고정.<br>- 혼합참조 = `$A1`, `A$1`.<br>- 그래프는 데이터 성격에 맞게 선택.<br>  - 막대 = 범주 비교<br>  - 꺾은선 = 시간 변화<br>  - 원 = 구성 비율<br>  - 산점도 = 두 변수 관계 |
| R/Python | - `pip` = Python 패키지 설치.<br>- `pd.read_csv()` = CSV 읽기.<br>- `pd.read_excel()` = 엑셀 읽기.<br>- `describe()` = 요약 통계.<br>- `iloc[:, 1:]` = 행 전체, 두 번째 열부터.<br>- `plt.bar` = 막대그래프. |
| 시험 감각 | - “반드시 프로그램 언어를 알아야 한다” 같은 절대 표현은 보통 틀림.<br>- “전 범위”, “절차”, “그래프 선택 이유”를 같이 묻는 문제 주의. |

#### 빈칸 테스트

1. 데이터 분석 절차는 (     ) → (     ) → (     ) → (     )이다.
2. 데이터는 (     ), 정보는 (     )이다.
3. 범주형은 (     ), 양적은 (     ) 자료다.
4. 모집단은 (     ), 표본은 (     )이다.
5. 평균은 이상치에 (     ), 중앙값은 이상치에 (     ).
6. 절대참조 표기는 (     )이다.
7. 막대그래프는 (     ), 꺾은선그래프는 (     ), 원그래프는 (     ), 산점도는 (     )에 쓴다.
8. `pd.read_csv()`는 (     ), `describe()`는 (     )이다.

<details markdown="1">
<summary>정답 보기</summary>

1. 문제 정의 / 수집 / 정리·분석 / 평가·해석
2. 관찰·측정된 값 / 데이터를 목적에 맞게 처리한 결과
3. 분류값 / 수치값
4. 관심 대상 전체 / 모집단에서 뽑은 일부
5. 약함 / 강함
6. `$A$1`
7. 범주 비교 / 시간 변화 / 구성비 / 두 변수 관계
8. CSV 읽기 / 요약 통계 출력

</details>

---
#### 연습문제

> 지문:
> ( a ) - 조사, 실험의 계획 - 데이터의 수집 - ( b ) - 분석결과의 평가
**Q1. 일반적인 데이터분석 절차이다. ( )안에 순서대로 가장 적합한 것은?**
1. a : 문제의 정의, b : 설문지 평가
2. a : 설문지 작성, b : 데이터의 정리, 분석
3. a : 전문가와의 상담, b : 데이터의 분석
4. a : 문제의 정의, b : 데이터의 정리, 분석

**Q2. 컴퓨터를 통하여 데이터 정보를 효율적으로 처리하기 위해 요구되는 사항이 아닌 것은?**
1. 컴퓨터를 쉽게 사용할 수 있어야 한다.
2. 정보를 검색하고 수집․분석하기 위해서는 반드시 컴퓨터 프로그램 언어를 알아야 한다.
3. 데이터 분석에 대한 기본개념과 방법론들을 숙지하여야 한다.
4. 데이터 분석을 위한 다양한 소프트웨어의 활용법을 숙지하여야 한다.

**Q3. 다음 중 범용 통계패키지에 대한 설명으로 잘못된 것은?**
1. SPSS는 GUI 환경아래에서 통계분석 및 자료처리가 이루어지므로 쉽게 분석처리를 할 수 있다.
2. SAS는 방대한 양의 자료 처리 기능이 뛰어나며 다양한 통계 분석 절차를 제공하고 있다.
3. 파이썬은 미국에서 개발된 프로그램 언어로 스프레드시트 형태의 데이터 입력을 취하고 있다.
4. R은 객체지향 프로그래밍 언어로서 대화형 통계분석과 그래프 기능이 뛰어나다.

**Q4. 오늘날과 같이 효율적인 정보의 수집, 수집된 정보의 가치판단, 정보활용 능력이 필수적으로 요구되는 사회를 가장 잘 나타낸 말은?**
1. 유비쿼터스사회
2. 전자정보화사회
3. 지식정보화사회
4. 전자통신사회

**Q5. R 통계패키지를 다운받고자 한다. R 공식 사이트는 ?**
1. www.r-package.org
2. www.r-project.org
3. www.r-package.com
4. www.r-project.com

**Q6. 설문문항에서 명목척도에 해당하는 것은?**
1. 문항1, 문항3
2. 문항2, 문항3
3. 문항2, 문항4
4. 문항3, 문항4

**Q7. 주어진 설문지를 이용하여 100명의 학생들에게 응답을 얻었다. 데이터의 구성에 대한 올바른 설명은?**
1. 4개의 케이스와 100개의 변수로 구성된다.
2. 100개의 케이스와 4개의 변수로 구성된다.
3. 50개의 케이스와 4개의 변수로 구성된다.
4. 4개의 케이스와 50개의 변수로 구성된다.

> 지문:
> Ⅰ. 데이터는 어떤 관심 주제에 대한 구조화된 정보(information)이다.
> Ⅱ. 데이터 수집의 대표적인 방법으로는 조사, 실험, 관찰 등을 들 수 있다.
> Ⅲ. 데이터는 숫자로만 이루어져 있다.
**Q8. 다음의 데이터에 대한 설명 중 올바른 것끼리 짝지어진 것은?**
1. Ⅰ, Ⅱ
2. Ⅰ, Ⅲ
3. Ⅱ, Ⅲ
4. Ⅰ, Ⅱ, Ⅲ

**Q9. 다음 측정 수준에 대한 설명 중 옳지 않은 것은?**
1. 명목척도에서 각 조사단위에 부여된 숫자는 구분을 목적으로 부여된 기호에 불과하다.
2. 섭씨온도, 습도, 지능지수 등은 구간척도로 측정된 값이다.
3. 변수의 측정수준이 적합한 통계 분석 기법의 선택에 영향을 미치지는 않는다.
4. 계란을 크기에 따라 대․중․소로 구분하면 순서척도로 측정된 것이다.

**Q10. 데이터를 입력한 후, 제대로 입력되었는지 점검하고자 한다. 데이터의 오류를 점검하기 위한 방법이 아닌 것은?**
1. 각 변수의 입력 범위를 벗어난 케이스를 확인해 본다.
2. 변수간의 논리적 연관성을 고려하여 확인한다.
3. 각 케이스를 조사된 설문지와 비교하면서 점검한다.
4. 설문항목 중 하나라도 응답하지 않은 경우가 있다면 해당 설문지는 분석에서 제외한다.

> 지문:
> - 학생의 소속 지역대학
> - 학교 생활만족도(아주 만족, 만족, 보통, 불만족, 아주 불만족)
> - 수강 신청한 과목 중 제일 좋아하는 교과목
**Q11. 통계·데이터과학과에 재학 중인 학생들을 대상으로 통계조사를 실시하였다. 다음에 제시된 변수를 조사하였는데, 이 중 명목척도로 측정된 변수는 몇 개인가?**
1. 없음
2. 1개
3. 2개
4. 3개

**Q12. 한국사회과학데이터센터 사이트는?**
1. http://ww.ksdc.re.kr
2. http://ecos.bok.or.kr/
3. http://lib.stat.cmu.edu/DASL
4. http://www.itl.nist.gov/div898/strd/

**Q13. 국가경제에 관한 통계들을 제공하는 한국은행 경제시스템 사이트는?**
1. http://kosis.kr/
2. http://ecos.bok.or.kr/
3. http://kostat.go.kr/
4. http://laborstat.molab.go.kr/

**Q14. 통계청 사이트는?**
1. http://kosis.kr/
2. http://ecos.bok.or.kr/
3. http://kostat.go.kr/
4. http://laborstat.molab.go.kr/

**Q15. 다음 중 카네기 멜론 통계학과에서 운영하는 사이트로서 다양한 데이터를 제공하는 사이트는?**
1. http://kosis.kr/
2. http://ecos.bok.or.kr/
3. http://lib.stat.cmu.edu/DASL
4. http://www.itl.nist.gov/div898/strd/

**Q16. NIST(National Institute of Standards and Technology)에서 여러 통계 분석 등과 관련하여 유용한 데이터를 제공하는 사이트는?**
1. http://ww.ksdc.re.kr
2. http://ecos.bok.or.kr/
3. http://lib.stat.cmu.edu/DASL
4. http://www.itl.nist.gov/div898/strd/

**Q17. 다음 중 표본분산을 구하는 공식은?**

**Q18. 자료의 개수나 측정단위가 다른 두 개 이상의 자료에 대한 표본집단 간의 상대적인 산포를 비교할 때 이용되는 측도로, 두 집단의 단위가 다르거나, 단위는 같지만 평균의 차이가 클 때 두 그룹의 산포를 비교하는 데 유용하게 이용되는 측도는?**
1. 중앙값
2. 표준편차
3. 표준오차
4. 변동계수

**Q19. 다음 중 표본평균을 구하는 공식은?**

> 지문:
> 22 5 21 16 18 20 23 24 32 490 36
**Q20. 조사된 자료가 다음과 같다. 중앙값은?**
1. 20
2. 21
3. 22
4. 23

**Q21. 탐색적 자료분석의 관점에서 살펴볼 때 한 묶음의 자료를 정리하는 숫자로서 다섯숫자요약이란 다음 중 무엇인가?**
1. 중앙값, 평균, 분산, 제1사분위수, 제3사분위수
2. 중앙값, 평균, 표준편차, 제1사분위수, 제3사분위수
3. 최소값, 최대값, 중앙값, 제1사분위수, 제3사분위수
4. 최소값, 최대값, 평균, 제1사분위수, 제3사분위수

> 지문:
> 문서를 작성하다 보면 전문적인 용어에 대한 추가적인 설명이 필요한 경우가 있다. 이 때 이용할 수 있는 것이 ( ㉠ )와(과) ( ㉡ )이다. ( ㉠ )는(은) 낱말이 있는 페이지의 아래쪽에 추가 설명이 위치하며, ( ㉡ )는(은) 문서의 맨 마지막에 온다는 점에서 차이가 있다.
**Q22. 다음 괄호 안에 알맞은 용어로 짝 지어진 것은?**
1. ㉠ : 각주 ㉡ : 미주
2. ㉠ : 미주 ㉡ : 각주
3. ㉠ : 장평 ㉡ : 간격
4. ㉠ : 간격 ㉡ : 장평

> 지문:
> ( ㉠ )^2 ~ ( ㉡ ) =~ sum {( 관측도수 - 기대도수 )^2 } ( ㉢ ) 기대도수 #
> ( ㉡ ) =~ sum { ( f_{i`j`} - {hat f}_{i`j`} )^2 } ( ㉢ ) {hat f}_{i`j`}}
> 수식편집기창을 이용하여 다음 수식을 작성하고자 한다.
**Q23. 수식편집창의 다음 ( ) 안의 ㉠, ㉡, ㉢에 적합한 것은?**
1. ㉠ : chi, ㉡ : &, ㉢ : vert
2. ㉠ : chi, ㉡ : &, ㉢ : over
3. ㉠ : theta, ㉡ : #, ㉢ : vert
4. ㉠ : theta, ㉡ : &, ㉢ : over

> 지문:
> f(x) = ( a ) { 1, & 0 leq x leq 1 ( b )
> 0, & 아닐 ~때 }
> 한글 2018의 수식편집기창을 이용하여 다음 수식을 작성하고자 한다.
**Q24. 수식편집창의 다음 ( ) 안의 a, b 에 적합한 것은?**
1.
   ```text
   a=cases, b=&
   ```
2.
   ```text
   a=vert, b=&
   ```
3.
   ```text
   a=cases, b=#
   ```
4.
   ```text
   a=vert, b=#
   ```

> 지문:
> Ⅰ. 복사나 이동을 위한 블록 지정에서 F3는 칸 단위 블록 설정, F4는 줄 단위 블록을 지정할 수 있다.
> Ⅱ. 신문이나 잡지 등에서 사용되고 있는 다단 편집의 기능은 제공하고 있다.
> Ⅲ. 그림을 삽입하여 문서를 작성할 수 있다.
**Q25. 다음은 한글 2018 사용법에 대한 설명이다. 옳은 설명을 모두 고른 것은?**
1. Ⅰ, Ⅱ
2. Ⅰ, Ⅲ
3. Ⅱ, Ⅲ
4. Ⅰ, Ⅱ, Ⅲ

> 지문:
> Ⅰ. 한자로 된 단어를 입력하고자 하는 경우는 먼저 한글로 해당 단어를 입력하고 [입력] - [한자로 변화]을 이용하여 변환한다.
> Ⅱ. [F5] 키를 이용하면 [입력] - [한자 입력]을 대신할 수 있다.
> Ⅲ. 두 글자 이상의 단어는 [F3] 키로 블록으로 잡아 한자로 변환시킬 수 있다.
**Q26. 다음은 한글 2018 사용법에서 한자 변환에 대한 설명이다. 옳은 설명을 모두 고른 것은?**
1. Ⅰ, Ⅱ
2. Ⅰ, Ⅲ
3. Ⅱ, Ⅲ
4. Ⅰ, Ⅱ, Ⅲ

> 지문:
> 가. 값, 셀참조, 함수 등을 사용하여 새로운 값을 생성한다.
> 나. 함수식은 등호(=)로 시작한다.
> 다. 엑셀에서 함수 이름은 대문자로만 입력해야 한다.
**Q27. 다음은 엑셀에 대한 함수 사용방법에 대한 설명이다. 옳은 설명끼리 짝지어진 것은?**
1. 가, 나
2. 가, 다
3. 나, 다
4. 가, 나, 다

**Q28. 다음은 엑셀의 통합문서(workbook)와 워크시트(worksheet)에 대한 내용이다. 잘못된 것은?**
1. 통합문서는 데이터 입력이나 분석 작업을 하여 그 결과를 저장하는 하나의 파일을 의미한다.
2. 통합문서는 워크시트(worksheet), 차트시트(chart sheet), 매크로시트(macro sheet)를 포함한다.
3. 통합문서를 한 권의 책에 비유한다면 하나의 워크시트는 한 페이지를 의미한다.
4. 워크시트는 항상 고정된 이름을 가지며, 한번 정해지면 바꿀 수 없다.

**Q29. 선택된 셀의 정보를 보여주고, 데이터를 입력하거나 수정할 수 있으며, 계산을 위해서 수식을 입력할 수 있는 부분을 무엇이라 하는가?**
1. 메뉴표시줄
2. 도구모음
3. 워크시트
4. 수식입력줄

**Q30. 데이터를 입력한 후 이웃하지 않은 셀들을 선택하고자 한다. 올바른 방법은?**
1. ALT 키를 누른 상태에서 마우스로 원하는 셀들을 선택한다.
2. CTRL 키를 누른 상태에서 마우스로 원하는 셀들을 선택한다.
3. SHIFT 키를 누른 상태에서 마우스로 원하는 셀들을 선택한다.
4. TAB 키를 누른 상태에서 마우스로 원하는 셀들을 선택한다.

**Q31. 다음 중 엑셀의 중요한 기능이라고 할 수 없는 것은?**
1. 그래프 표현 기능을 가지고 있다.
2. 통계분석 기능을 가지고 있다.
3. 인터넷 검색기능을 가지고 있다.
4. 데이터베이스의 관리도구 기능을 가지고 있다.

**Q32. 엑셀에서 B2셀의 값이 60보다 작으면 “불합격”, 60이상이면 “합격”을 D2셀에 표시하고자 한다. 적합한 엑셀함수 사용은?**
1.
   ```excel
   =(IF(B2<60) "합격“ ELSE "불합격”)
   ```
2.
   ```excel
   =(IF(B2<60) "불합격“ ELSE "합격”)
   ```
3.
   ```excel
   =IF(B2<60, "합격“, ”불합격“)
   ```
4.
   ```excel
   =IF(B2<60, "불합격“, ”합격“)
   ```

**Q33. B2와 C2 셀에 데이터를 입력한 후 두 값의 평균점수를 구하고자 한다. 적합한 수식입력은?**
1.
   ```excel
   AVERAGE(B2:C2)
   ```
2.
   ```excel
   =AVERAGE(B2:C2)
   ```
3.
   ```excel
   STDEV(B2:C2)
   ```
4.
   ```excel
   =STDEV(B2:C2)
   ```

> 지문:
> ※ (3 ~ 5) 학생들 30명에 대한 통계학 점수와 수학 점수 자료를 다음과 같이 입력하였다. 물음에 답하시오.
**Q34. 데이터를 입력한 후 그림과 같이 각 케이스에 대하여 평균점수를 구하고자 한다. (A) 부분에 적합한 수식입력은?**
1.
   ```excel
   AVERAGE(B2:C2)
   ```
2.
   ```excel
   =AVERAGE(B2:C2)
   ```
3.
   ```excel
   MEDIAN(B2:C2)
   ```
4.
   ```excel
   =MEDIAN(B2:C2)
   ```

> 지문:
> ※ (3 ~ 5) 학생들 30명에 대한 통계학 점수와 수학 점수 자료를 다음과 같이 입력하였다. 물음에 답하시오.
**Q35. D2 셀에 =IF(SUM(B2:C2)>=130, "합격“, ”불합격“)를 입력하였을 때 그 결과는?**
1. 140
2. 70
3. 합격
4. 불합격

> 지문:
> ※ (3 ~ 5) 학생들 30명에 대한 통계학 점수와 수학 점수 자료를 다음과 같이 입력하였다. 물음에 답하시오.
**Q36. D2 셀에 =$B$2+$C$2를 입력한 후 드래그&드롭 기능을 이용하여 D11 셀까지 채워 넣었다. 이 때 D3 셀의 결과는?**
1. 136
2. 121
3. 오류 발생
4. 알 수 없음

**Q37. 다음과 같은 성별 도수분포를 그래프로 나타내고자 한다. 적합한 그래프끼리 묶인 것은?**
1. 막대그래프, 원그래프
2. 히스토그램, 원그래프
3. 막대그래프, 방사형 차트
4. 원그래프, 분산형 차트

**Q38. 통계청 홈페이지를 방문하여 최근 5년간의 매월 소비자 물가지수 데이터를 구하여 적합한 그래프를 엑셀로 그려서 전체적인 경향을 파악하고자 한다. 가장 알맞은 차트의 종류는 무엇인가?**
1. 원형
2. 히스토그램
3. 방사형
4. 꺾은선형

**Q39. 시간의 흐름에 따라 관측된 시계열 데이터의 추세 변화나 경향을 파악하고자 한다. 다음 중 이와 같은 분석 목적에 가장 적합하지 않은 그래프는?**
1. 꺾은선 그래프
2. 원 그래프
3. 세로 막대형 그래프
4. 분산형 그래프

> 지문:
> 뉴스 : 33.3%, 연속극 : 36.3%, 스포츠 : 9.1%, 오락 : 11.5%, 기타 : 9.9%
**Q40. 사람들이 즐겨보는 TV 프로그램에 대한 비율을 다음과 같이 조사하였다. 이러한 경우 전체에 대한 항목별 비율을 비교하거나, 특정 항목을 강조하기 하기 위해 가장 적합한 그래프는?**
1. 히스토그램
2. 산점도
3. 원 그래프
4. 꺾은선 그래프

**Q41. 엑셀을 이용하여 간격이 일정한 시계열 데이터의 경향을 파악하고자 한다. 엑셀 차트 중에서 가장 적합한 차트 유형은?**
1. 세로 막대형이나 가로 막대형
2. 영역형
3. 분산형
4. 꺾은선형

**Q42. 엑셀 함수를 이용하여 구한 시간의 흐름에 따른 전압 값을 다음과 같은 그래프로 표시하였다. 이와 같은 그래프를 얻기 위해서 사용된 엑셀 차트의 유형은 무엇인가?**
1. 히스토그램
2. 세로 막대형
3. 원형
4. 분산형

**Q43. 두 연속인 변수 X와 Y 사이의 상관계수를 구했더니 0.9가 나왔다. 올바른 해석은?**
1. X값이 커지면 Y값은 직선관계를 가지고 커진다.
2. X값이 커지면 Y값은 직선관계를 가지고 작아진다.
3. X값이 커지면 Y값은 곡선관계를 가지고 커진다.
4. X값이 커져도 Y값은 변화가 없다.

**Q44. 두 변수들 사이의 관계를 살펴보기 위해 산점도를 그리고자 한다. 차트마법사의 차트 종류 입력상자에서 선택할 차트 종류는?**
1. 세로 막대형이나 가로 막대형
2. 영역형
3. 분산형
4. 꺾은선형

**Q45. 도수분포표에 대한 다음 설명 중 옳지 않은 것은?**
1. 겹치지 않는 몇 개의 범주 또는 계급에 속한 관측치의 개수를 요약하여 작성한 표이다.
2. 연속형 데이터에 대한 분석에서 도수분포표를 기초로 히스토그램을 그릴 수 있다.
3. 연속형 데이터에 대해 도수분포표를 작성할 때는 계급의 개수와 폭을 결정하는 것이 중요하다.
4. 정성적 데이터에 대한 분석에는 활용할 수 없다.

**Q46. 다음의 산점도에 대한 상관계수로 가장 적합할 것으로 생각되는 값은?**
1.
   ```text
   r = -0.87
   ```
2.
   ```text
   r = 0.25
   ```
3.
   ```text
   r = 0.92
   ```
4.
   ```text
   r = 1.02
   ```

**Q47. A2 셀에 “대한민국”이라고 입력되어 있다. "=MID(A2, 2, 2)"의 결과로 알맞은 것은?**
1. 대
2. 대한
3. 한민
4. 민국

**Q48. G2 셀에 어떤 사람의 생년월일이 “1980-12-5”로 같이 입력되어 있다고 한다. 엑셀 함수 “=YEAR(NOW())-YEAR(G2))"의 결과를 바르게 설명한 것은?**
1. 현재 시점의 연도가 표시된다.
2. 현재 시점의 나이를 구한다.
3. 위의 함수식에 NOW()는 인수가 없기 때문에 잘못된 함수이다.
4. 이 사람의 생년월일 중에서 연도에 해당하는 1980이 표시된다.

> 지문:
> ※ 학과별 학생의 성적 데이터를 워크시트에 입력하였다. 다음 물음에 답하여라.
**Q49. 학과코드의 첫 번째 자리 알파벳이 A이면 통계·데이터과학과, B이면 컴퓨터학과 학생이다. 학과 셀에 학과를 표기하고자 한다. C2 셀에 알맞은 함수식은?**
1.
   ```excel
   =IF(RIGHT(A2,1)=“A”, “통계·데이터과학”, “컴퓨터”)
   ```
2.
   ```excel
   =IF(RIGHT(A2,1)=“A”, “컴퓨터”, “통계·데이터과학”)
   ```
3.
   ```excel
   =IF(LEFT(A2,1)=“A”, “통계·데이터과학”, “컴퓨터”)
   ```
4.
   ```excel
   =IF(LEFT(A2,1)=“A”, “컴퓨터”, “통계·데이터과학”)
   ```

> 지문:
> ※ 학과별 학생의 성적 데이터를 워크시트에 입력하였다. 다음 물음에 답하여라.
**Q50. 최종 점수는 시험점수와 과제물, 태도점수의 합계에서 결석일수에 5를 곱한 수를 뺀 것으로 계산하고자 한다. H2 셀에 알맞은 함수식은?**
1.
   ```excel
   =AVERAGE(D2:F2)-5*G2
   ```
2.
   ```excel
   =AVERAGE(D2:F2)+5*G2
   ```
3.
   ```excel
   =SUM(D2:F2)-5*G2
   ```
4.
   ```excel
   =SUM(D2:F2)+5*G2
   ```

**Q51. 다음과 같이 워크시트에 값이 입력되어 있을 때 ‘=SUMPRODUCT(A1:A3, B1:B3)’을 D1 셀에 입력하면 얻게 되는 계산값은 얼마인가?**
1. 10
2. 12
3. 14
4. 16

**Q52. 함수 f(x) = -x³ + 2x² - 2x + 3의 개형을 (-3, 3) 범위에서 그렸더니 2 근처에서 축을 통과한다는 것을 알았다. 엑셀을 활용하여 (-3, 3) 범위에서 f(x) = 0의 정확한 해를 구하고자 한다면 어떤 기능을 이용해야 하는가?**
1. 함수마법사 기능
2. 꺾은선형 그래프
3. 데이터분석 기능
4. 목표값 찾기 기능

**Q53. 다음과 같이 셀 C7에 입력되어 있는 수식을 드래그 & 드롭으로 C11까지 채워서 1월부터 6월까지의 미달러($) 기준의 수출액을 원화(￦) 기준으로 바꾸고자 한다. 셀 C6에 입력할 수식으로 맞는 것은?**
1.
   ```excel
   =B6*B2
   ```
2.
   ```excel
   =B$6*B2
   ```
3.
   ```excel
   =B6*B$2
   ```
4.
   ```excel
   =B$6*B$2
   ```

**Q54. 함수 f(x) = -x³ + 2x² - 2x + 3의 개형을 (-3, 3) 범위에서 그리고자 한다. 차트마법사의 차트 종류 입력상자에서 선택할 차트 종류로 알맞은 것은?**
1. 세로 막대형이나 가로 막대형
2. 영역형
3. 분산형
4. 꺾은선형

**Q55. 복리로 계산될 때 연이율 r, 기간이 n인 경우 현재 금액 p에 대한 일정 기간 후의 원리합계는 p × (1 + r)^n으로 계산할 수 있다. 원금이 1,000만원인 경우에 연 4.5%와 연 5.0%로 향후 20년까지 경과하였을 때 원리합계가 얼마인지 계산하고자 한다. 채워넣기를 이용해서 계산한다고 할 때 B5 셀에 알맞은 함수식은?**
1.
   ```excel
   =$B$1*(1+B2)^A5
   ```
2.
   ```excel
   =$B$1*(1+B$2)^$A5
   ```
3.
   ```excel
   =$B$1*(1+B$2)^A$5
   ```
4.
   ```excel
   =$B$1*(1+$B2)^$A$5
   ```

**Q56. 데이터 객체 ex.data의 변수들을 직접 사용하고자 한다. 유용한 명령은 ?**
1.
   ```r
   load(ex.data)
   ```
2.
   ```r
   detach(ex.data)
   ```
3.
   ```text
   unload(data)
   ```
4.
   ```r
   attach(ex.data)
   ```

**Q57. 그룹변수인 성별(sex)의 값에 따라 변수 salary의 평균(mean)을 구하는 명령은 ?**
1.
   ```r
   sapply(salary, sex, mean)
   ```
2.
   ```r
   sapply(mean, sex, salary)
   ```
3.
   ```r
   tapply(salary, sex, mean)
   ```
4.
   ```r
   tapply(mean, sex, salary)
   ```

**Q58. > ( b )(ex.data)**
1. head
2. list
3. print
4. output

> 지문:
> 다음과 같은 텍스트파일을 읽어들이는 R 명령은 ?
**Q59. ex.data = ( a )("c:/data/example.txt", header=T)**
1. scan
2. read.table
3. data.frame
4. read.xlsx

**Q60. package xlsx를 인스톨하였다. 이를 가동시키기 위한 명령은 ?**
1.
   ```text
   system(xlsx)
   ```
2.
   ```text
   use(xlsx)
   ```
3.
   ```r
   library(xlsx)
   ```
4.
   ```r
   load(xlsx)
   ```

```r
power.value <- function(x,n1,n2,n3=5)
{ n1.val = x^n1
n2.val = x^n2
n3.val = x^n3
value = list(v1=n1.val, v2=n2.val, v3=n3.val)
return(value)
}
> aval = power.value(2, 1/2, 2)
> aval$v3
```

**Q61. 다음 R 명령 수행결과는 ?**
1. 1.414
2. 8
3. 16
4. 32

```r
power.value <- function(x,n1,n2,n3=5)
{ n1.val = x^n1
n2.val = x^n2
n3.val = x^n3
value = list(v1=n1.val, v2=n2.val, v3=n3.val)
return(value)
}
> aval = power.value(2, 1/2, 2)
> aval$v1
```

**Q62. 다음 R 명령 수행결과는 ?**
1. 1.414
2. 8
3. 16
4. 32

```r
> sq.value <- (function(x) { x*x }
> sq.value(2)
```

**Q63. 다음 R 명령 수행결과는 ?**
1. 1.414
2. 2
3. 4
4. 8

**Q64. 상자그림을 그리는 명령은 ?**
1.
   ```r
   stem(ex.data)
   ```
2.
   ```r
   boxplot(ex.data)
   ```
3.
   ```r
   box(data)
   ```
4.
   ```r
   box.plot(ex.data)
   ```

**Q65. 파이썬에서 딕셔너리로 선언하고자 한다. 적합한 것은 ?**
1.
   ```python
   me = [‘height’ : 180, ‘weight’: 70 ]
   ```
2.
   ```python
   me = {‘height’ : 180, ‘weight’: 70 }
   ```
3.
   ```python
   me = {‘height’ = 180, ‘weight’ = 70 }
   ```
4.
   ```python
   me = [‘height’ = 180, ‘weight’ = 70 ]
   ```

```
C:\anaconda3>( ) install tensorflow
```

**Q66. Python 패키지를 설치하고 관리하는 프로그램이다. Dos 창에서 ( ) 안에 맞는 명령은 ?**

**Q67. Anaconda 공식 사이트는?**

```python
>>> a = [1,2,3,4,5]
>>> a[4]
```

**Q68. 다음 파이썬 프로그래밍에서 a[4] 의 결과는 ?**

```python
def hello2(object):
print("Hello " + object + " !")
hello2("Jeong")
```

**Q69. 다음과 같이 파이썬 함수문을 작성하였다. hello2("Jeong") 의 결과는 ?**

```python
nex8.head(3)
Out:
id sex age edu salary
0 1 1 21 2 150
1 2 2 22 1 100
2 3 1 33 2 200
edu_freq = pd.crosstab(index=nex8["edu"], columns="count")
import matplotlib.pyplot as plt
( )(edu_freq.index, edu_freq["count"] )
```

**Q70. 변수 edu 의 막대그림을 그리고자 한다. ( ) 명령은 ?**

```python
import pandas as pd
nex8 = ( )("c:/data/dataintro/nex8-1.csv", header=0)
```

**Q71. 파이썬에서 csv 텍스트 파일을 읽기 위한 명령 ( )는 ?**

```python
nex8.head(3)
Out:
id sex age edu salary
0 1 1 21 2 150
1 2 2 22 1 100
2 3 1 33 2 200
( )
Out:
sex age edu salary
count 10.000000 10.000000 10.000000 10.000000
mean 1.400000 34.800000 2.200000 243.000000
std 0.516398 10.347302 0.788811 98.211789
min 1.000000 21.000000 1.000000 100.000000
25% 1.000000 29.000000 2.000000 177.500000
50% 1.000000 33.000000 2.000000 220.000000
75% 2.000000 40.500000 3.000000 297.500000
max 2.000000 55.000000 3.000000 410.000000
```

**Q72. 다음 출력결과와 같이 데이터객체 nex8의 각 변수의 기술통계량을 구하고자 한다. ( ) 명령은 ?**

```python
nex8.head(2)
Out:
id sex age edu salary
0 1 1 21 2 150
1 2 2 22 1 100
nex8 = ( )
nex8.head(2)
Out:
sex age edu salary
0 1 21 2 150
1 2 22 1 100
```

**Q73. 파이썬에서 nex8.head( ) 의 결과가 다음과 같다. 여기서 변수 id를 제거하고 나머지 변수를 가져오기 위한 명령 ( )은 ?**

```python
import pandas as pd
nex8 = ( )("c:/data/dataintro/nex8-1.xlsx, header=0)
```

**Q74. 파이썬에서 엑셀 파일을 읽기 위한 명령 ( )는 ?**

#### 연습문제 정답

1. 4
2. 2
3. 3
4. 3
5. 2
6. 3
7. 2
8. 1
9. 3
10. 4
11. 3
12. 1
13. 2
14. 3
15. 3
16. 4
17. 4
18. 4
19. 3
20. 3
21. 3
22. 1
23. 2
24. 3
25. 3
26. 2
27. 1
28. 4
29. 4
30. 2
31. 3
32. 4
33. 2
34. 2
35. 3
36. 1
37. 1
38. 4
39. 2
40. 3
41. 4
42. 4
43. 1
44. 3
45. 4
46. 3
47. 3
48. 2
49. 3
50. 3
51. 1
52. 4
53. 3
54. 3
55. 2
56. 4
57. 3
58. 1
59. 2
60. 3
61. 4
62. 1
63. 3
64. 2
65. 2
66. pip
67. www.anaconda.com
68. 5
69. Hello Jeong !
70. plt.bar
71. pd.read_csv
72. nex8.describe()
73. nex8.iloc[:, 1:]
74. pd.read_excel

### HTML5웹프로그래밍

> 우선순위: HTML 의미론·CSS 선택자/박스모델·JS DOM/BOM·Canvas/API를 속성/메서드 단위로 구분

#### 핵심 암기표

| 주제 | 외울 문장 |
|---|---|
| 웹 구성 3요소 | - HTML은 구조, CSS는 표현, JavaScript는 동작이다. (역할 구분) |
| 문서 기본 | - `<!DOCTYPE html>`은 HTML5 문서 선언이다. (태그 아님)<br>- `<meta charset="UTF-8">`은 문자 깨짐을 막는다. (head 안)<br>- viewport는 모바일 화면 크기 대응 설정이다. (CSS 아님) |
| 텍스트 태그 | - h1~h6은 제목 구조를 나타낸다. (글자 크기용 X)<br>- `br`은 줄바꿈, `hr`은 주제 전환이다. (br은 빈 요소) |
| 컨테이너 | - div는 블록, span은 인라인 컨테이너다. (의미 없음)<br>- 시맨틱 태그는 영역의 의미를 드러낸다. (div와 구분) |
| 목록 | - ul은 순서 없음, ol은 순서 있음, dl은 설명 목록이다. (li는 ul/ol 자식) |
| 링크와 이미지 | - `a href`는 하이퍼링크를 만든다. (href가 목적지)<br>- `img src alt`는 이미지와 대체 텍스트다. (alt 중요) |
| 표 | - table은 표, tr은 행, th는 제목 셀, td는 데이터 셀이다. (행 먼저) |
| 미디어 | - audio와 video는 외부 플러그인 없이 미디어를 재생한다. (controls 기억) |
| 폼 | - form은 입력 묶음, input은 입력 요소다. (type별 기능)<br>- label은 입력 요소 설명과 접근성을 높인다. (for-id 연결)<br>- required는 입력 필수 검사를 지정한다. (JS 없이 가능) |
| CSS 선택자 우선순위 | - inline > id > class/속성/가상클래스 > 요소. (높은 것 우선) |
| 박스 모델 | - 박스 모델은 content → padding → border → margin 순서다. (안에서 밖으로) |
| display | - block은 한 줄 차지, inline은 내용만큼 차지한다. (inline 크기 제한) |
| position | - position은 요소 배치 방식을 정한다. (absolute 기준 부모) |
| 변형·전환·애니메이션 | - transform은 요소 모양/위치를 변형한다. (변화 과정 아님)<br>- transition은 값 변화 과정을 부드럽게 한다. (hover와 자주 사용)<br>- animation은 keyframes 기반 반복 동작이다. (transition과 구분) |
| DOM / BOM | - DOM은 HTML 문서를 객체로 다루는 모델이다. (요소 조작)<br>- BOM은 브라우저 창/주소/기록 등을 다루는 모델이다. (브라우저 조작) |
| 이벤트 | - addEventListener는 이벤트 처리 함수를 등록한다. (onclick 대체 가능) |
| 저장소 | - localStorage는 영구, sessionStorage는 세션 동안 저장이다. (객체는 JSON 변환) |
| Canvas | - canvas 2D는 `getContext('2d')`로 얻는다. (그림판) |
| Geolocation API | - Geolocation은 위치 정보를 얻는 API다. (권한 필요) |

#### 키워드 압축 카드

| 주제 | 내용 |
|---|---|
| 한 줄 공식 | - 웹 페이지 = **HTML 구조 + CSS 표현 + JavaScript 동작**.<br>- 클라이언트 = 요청 보내고 HTML/CSS/JS를 해석해 화면 표시.<br>- 관심사의 분리 = 구조/디자인/동작을 나눔. |
| HTML 기본 | - 최소 구조 = `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`.<br>- `meta charset="UTF-8"` = 문자 깨짐 방지.<br>- `viewport` = 모바일 반응형 대응.<br>- `h1~h6` = 제목 구조. 디자인 용도 X.<br>- `hr` = 주제 전환 의미.<br>- `br` = 줄바꿈.<br>- `div` = 블록 컨테이너.<br>- `span` = 인라인 컨테이너. |
| 리스트/링크/표/미디어 | - `ul` = 순서 없는 목록.<br>- `ol` = 순서 있는 목록.<br>- `dl/dt/dd` = 설명 목록.<br>- `a href` = 하이퍼링크.<br>- `img src alt` = 이미지와 대체 텍스트.<br>- `table` = 표, `tr` 행, `th` 제목 셀, `td` 데이터 셀.<br>- `audio`, `video` = 미디어.<br>- 시맨틱 = `header nav main section article aside footer`. |
| 폼 | - `form` = 입력 묶음.<br>- `input type="text/password/email/tel/radio/checkbox/submit"`.<br>- `label` = 입력 요소 설명, 접근성 향상.<br>- `required` = 필수 입력.<br>- `placeholder` = 입력 힌트. |
| CSS | - 선택자 우선순위 = **inline > id > class/속성/가상클래스 > 요소**.<br>- 박스 모델 = **content → padding → border → margin**.<br>- `display: block` = 한 줄 차지.<br>- `display: inline` = 내용만큼.<br>- `display: inline-block` = inline처럼 흐르지만 크기 조절 가능.<br>- `position: static/relative/absolute/fixed/sticky`.<br>- `transform` = 변형, `transition` = 변화 과정, `animation` = 키프레임 반복. |
| JavaScript/DOM/BOM | - DOM = 문서 객체 모델. HTML 요소를 객체처럼 다룸.<br>- BOM = 브라우저 객체 모델. `window`, `location`, `history`, `navigator`.<br>- `getElementById`, `querySelector`, `addEventListener` 기억.<br>- `localStorage` = 영구 저장, `sessionStorage` = 세션 동안 저장.<br>- 객체 저장은 `JSON.stringify`, 복원은 `JSON.parse`. |
| Canvas/API | - Canvas 2D context = `getContext('2d')`.<br>- 선 = `beginPath → moveTo → lineTo → stroke`.<br>- 사각형 = `fillRect`, `strokeRect`.<br>- 위치 API = Geolocation.<br>- Drag & Drop, Web Storage, Web Worker 개념 구분. |

#### 빈칸 테스트

1.
   ```javascript
   HTML은 (     ), CSS는 (     ), JavaScript는 (     )이다.
   ```
2. `<meta charset="UTF-8">`은 (     )을 막는다.
3. `div`는 (     ), `span`은 (     ) 컨테이너다.
4. `tr`은 (     ), `th`는 (     ), `td`는 (     )이다.
5. CSS 우선순위는 (     ) > (     ) > (     ) > (     )이다.
6. 박스 모델은 (     ) → (     ) → (     ) → (     ) 순서다.
7. DOM은 (     ) 객체 모델, BOM은 (     ) 객체 모델이다.
8. localStorage는 (     ), sessionStorage는 (     ) 저장이다.

<details markdown="1">
<summary>정답 보기</summary>

1. 구조 / 표현 / 동작
2. 문자 깨짐
3. 블록 / 인라인
4. 행 / 제목 셀 / 데이터 셀
5. inline / id / class·속성·가상클래스 / 요소
6. content / padding / border / margin
7. HTML 문서 / 브라우저 창·주소·기록
8. 영구 / 세션 동안

</details>

---
#### 연습문제

**Q1. 서버-클라이언트 구조에서 클라이언트의 역할로 가장 적절한 것은?**
1. 데이터를 저장하고 서버 소프트웨어를 실행한다.
2. HTTP 규약을 정의하는 역할을 한다.
3. DNS 서버를 직접 운영한다.
4. 요청을 보내고, 받은 HTML 코드를 해석해 화면에 표시한다.

**Q2. 다음 중 meta 요소의 설명으로 틀린 것은?**
1.
   ```javascript
   charset="utf-8"은 다국어 깨짐을 방지하기 위한 필수 설정이다.
   ```
2. viewport 설정은 모바일 반응형 웹 환경 대응을 위한 필수 설정이다.
3. keywords 속성은 현대 검색엔진 최적화(SEO)에서 가장 중요한 요소이다.
4. og:title 등의 Open Graph는 SNS 공유 시 미리보기 정보를 정의한다.

**Q3. 다음 중 문장의 주제가 전환될 때 의미적 구분선의 역할로 사용되는 요소는?**
1. br
2. hr
3. line
4. border

**Q4. 제목 요소(h1~h6)의 사용 규칙으로 옳은 것은?**
1. 큰 크기의 제목을 원할 때는 h2/h3보다 h1을 사용하는 것이 권장된다.
2. h2 다음에 h4로 건너뛰어도 SEO에 유리하다.
3. h1은 대표 제목으로 페이지당 1개 사용을 원칙으로 한다.
4. 제목 요소의 스타일은 HTML에서만 변경해야 한다.

**Q5. 다음 중 물리적 요소와 이를 대체하는 논리적 요소의 짝이 잘못 연결된 것은?**
1. b - strong
2. i - em
3. s - del
4. span - div

> 지문:
> - 한 줄을 모두 차지한다.(너비 100%)
> - 위아래 줄바꿈이 발생한다.
> - 크기(폭, 높이) 조절이 가능하다.
**Q6. 위 지문과 같은 특징을 갖는 요소는?**
1. div
2. span
3. a
4. strong

**Q7. 다음 중 리스트의 불릿(기호)을 없애기 위해 실무에서 가장 많이 사용하는 CSS 속성은?**
1.
   ```css
   list-style-type: disc;
   ```
2.
   ```css
   list-style: none;
   ```
3.
   ```css
   text-decoration: none;
   ```
4.
   ```css
   display: none;
   ```

**Q8. 정의-설명 리스트에서 "설명/값"에 해당하는 요소는?**
1. dt
2. dd
3. ol
4. caption

```css
img {
( 가 ): 100%;
height: ( 나 );
}
```

**Q9. 위 지문 중 img 요소의 srcset 속성이나 picture 요소를 언급하지 않았을 때, 반응형 환경에서 이미지를 유연하게 만드는 CSS 설정에서 (가)와 (나)에 알맞은 내용은?**
1. (가) width, (나) 100%
2. (가) max-width, (나) auto
3. (가) min-width, (나) auto
4. (가) width, (나) fixed

**Q10. a 요소에서 target="_blank" 속성을 사용할 때 실무 보안 규칙으로 가장 적절한 것은?**
1.
   ```javascript
   rel="nofollow"를 반드시 함께 사용한다.
   ```
2. download 속성을 반드시 함께 사용한다.
3.
   ```javascript
   rel="noopener noreferrer"를 반드시 함께 사용한다.
   ```
4.
   ```javascript
   aria-hidden="true"를 반드시 함께 사용한다.
   ```

**Q11. 동일한 페이지 내의 특정 위치(id="section1")로 이동하는 앵커 링크의 올바른 표현은?**
1.
   ```html
   <a href="section1">이동</a>
   ```
2.
   ```html
   <a href="#section1">이동</a>
   ```
3.
   ```html
   <a link="#section1">이동</a>
   ```
4.
   ```html
   <a target="section1">이동</a>
   ```

**Q12. 표의 '제목 셀'을 생성하며, 기본적으로 굵게 표시되고 가운데 정렬되는 요소는?**
1. th
2. td
3. caption
4. head

**Q13. thead, tbody, tfoot 요소의 사용 목적에 대한 올바른 설명은?**
1. 시각 효과를 위해 색상을 바꾸는 요소이다.
2. 표의 행을 의미적으로 그룹핑해 구조 이해 및 스타일링과 출력에 도움을 준다,
3. 표를 렌더링하기 위해서 반드시 사용해야 한다.
4. 각 영역으로 구분한 후 영역 제목을 부여하기 위한 요소이다.

**Q14. audio 요소에서 자동 재생을 시도할 때의 기본 전제로서 가장 적절한 코드 형태는?(단, src 속성 표현은 생략한다.)**
1.
   ```html
   <audio autoplay></audio>
   ```
2.
   ```html
   <audio autoplay muted></audio>
   ```
3.
   ```html
   <audio autoplay loop></audio>
   ```
4.
   ```html
   <audio autoplay preload="auto"></audio>
   ```

**Q15. 미디어 표현에서 source 요소를 사용하는 가장 핵심적인 목적은?**
1. CSS 적용을 쉽게 하려고
2. autoplay를 강제하기 위해
3. 서로 다른 포맷을 제공해 브라우저 호환성을 확보하기 위해
4. controls 속성의 UI를 숨기기 위해

**Q16. 시멘틱 요소를 사용하는 핵심 목적(실무 중심)으로 가장 적절한 것은?**
1. 디자인을 자동으로 예쁘게 만들기 위해
2. 파일 용량을 줄이기 위해
3. 자동 재생을 보장하기 위해
4. 브라우저/검색엔진/개발자에게 역할(의미)을 명확히 전달하기 위해

**Q17. figure 요소의 핵심 역할로 가장 적절한 것은?**
1. 독립 콘텐츠와 캡션이 떼려야 뗄 수 없는 관계임을 알린다.
2. 이미지를 크게 보이게 한다.
3. 이미지가 깨지면 자동 복구한다.
4. alt를 대신한다.

**Q18. time 요소에서 기계가 읽는 값을 나타내기 위한 속성은?**
1. date
2. datetime
3. value
4. content

**Q19. progress 요소에서 value 속성을 사용하지 않았을 때 나타나는 현상은?**
1. 아무것도 표시되지 않아 동작을 비활성화하는 효과를 가진다.
2. 진행률이 기본값인 0%로 표시된다.
3. 파란 막대가 좌우로 움직이는 불확정 상태 애니메이션이 재생된다.
4. 무조건 진행률 100%로 표시되어 작업의 완료를 알려준다.

**Q20. 다음 중 form 요소의 속성 표현 method="get"을 적용하기에 가장 적합한 상황에 해당하는 것은?**
1. 회원가입 처리
2. 로그인 처리
3. 게시글 작성
4. 상품 목록 검색 및 필터링

**Q21. input 요소의 텍스트 입력 필드에서 사용자가 입력을 시작하면 사라지는 힌트 텍스트를 제공하는 속성은?**
1. title
2. alt
3. placeholder
4. value

**Q22. inputmode 속성의 목적은?**
1. 서버 전송 형식을 바꾸는 것
2. 모바일에서 적절한 키보드 레이아웃을 유도하는 것
3. 자동 검증을 끄는 것
4. 텍스트 입력에 사용하려는 언어의 종류를 지정하기 것

**Q23. fieldset 요소의 역할로 올바른 것은?**
1. 입력을 그룹으로 묶는다.
2. 입력을 숨긴다.
3. 전송을 차단한다.
4. 자동완성을 끈다.

**Q24. input 요소에서 radio 입력을 같은 그룹으로 만드는 핵심 조건은?**
1. id가 같아야 한다.
2. name이 같아야 한다.
3. pattern이 같아야 한다.
4. group이 같아야 한다.

**Q25. datalist 요소와의 연동을 위해서 input 요소에서 반드시 지정해야 할 속성은?**
1. id
2. data
3. list
4. options

**Q26. 인라인 스타일(inline style) 방식의 적용을 실무에서 가급적 지양해야 하는 이유로서 적절하지 못한 것은?**
1. 유지보수가 매우 어렵기 때문이다.
2. 스타일의 재사용이 불가능하기 때문이다.
3. 외부 스타일 시트보다 명시도 점수가 낮아 적용이 안 되기 때문이다.
4. 구조(HTML)와 표현(CSS)의 분리 원칙에 어긋나기 때문이다.

> 지문:

```html
<style>
.text { color: blue; }
p { color: red; }
</style>
<p class="text">안녕하세요</p>
```

**Q27. 위 지문의 코드에서 화면에 출력될 "안녕하세요"의 글자 색상은?**
1. red
2. blue
3. black
4. red와 blue의 혼합색

**Q28. 다음 중 필수 입력 속성(required)이 있는 input 요소만 골라내어 스타일을 적용하기 위한 올바른 CSS 선택자 표현은?**
1.
   ```css
   input:required { ... }
   ```
2. input[required] { ... }
3. input.required { ... }
4. input #required { ... }

**Q29. 다음 코드 중 ul 바로 밑에 있는 li들만 선택하기 위한 결합자의 표현으로 올바른 것은?**
1.
   ```css
   ul > li
   ```
2. ul li
3. ul + li
4. ul ~ li

**Q30. 현재 글자 색상(color)을 그대로 가져와서 테두리 등에 사용하게 해주는 키워드는?**
1. inherit
2. auto
3. transparent
4. currentColor

**Q31. 다음 중 rem 단위 설명으로 옳은 것은?**
1. 루트(html) 기준 상대 단위
2. 부모 요소 기준 상대 단위
3. 색상 단위
4. 화면 너비 기준 상대 단위

**Q32. 다음 중 한글의 문단 가독성이라는 관점에서 기본적인 설정 조합으로 가장 적절한 것은?**
1.
   ```css
   font-size: 12px; line-height: 1;
   ```
2.
   ```css
   font-size: 16px; line-height: 1.5;
   ```
3.
   ```css
   font-size: 40px; line-height: 0.8;
   ```
4.
   ```css
   font-size: 8px; line-height: 1;
   ```

**Q33. 폰트 단축 속성(font)에 포함될 수 있는 속성은?**
1.
   ```javascript
   letter-spacing
   ```
2. border-collapse
3. line-height
4. list-style

**Q34. 말줄임 표시를 위한 CSS 속성은?**
1. text-align
2. text-transform
3. text-decoration
4. text-overflow

**Q35. 내비게이션 메뉴(GNB) 등을 만들 때 리스트 초기화 코드로 가장 적절한 것은?**
1.
   ```css
   ul { list-style: disc; }
   ```
2.
   ```css
   ul { list-style: none; padding: 0; margin: 0; }
   ```
3.
   ```css
   ul { display: inline; border: 1px solid black; }
   ```
4.
   ```css
   ul { vertical-align: middle; }
   ```

**Q36. 테이블에서 열 너비 계산을 단순화해 레이아웃을 안정화할 때 쓰는 속성은?**
1. table-layout: fixed
2. table-layout: nowrap
3. table-layout: hidden
4. table-layout: ellipsis

```css
.box {
width: 200px;
padding-left: 10px;
padding-right: 10px;
border: 1px solid black;
}
```

**Q37. 브라우저의 기본 box-sizing 설정("box-sizing: content-box;")에서 주어진 스타일이 적용되는 요소의 실제 렌더링 가로 너비는 얼마인가?**
1. 200px
2. 202px
3. 220px
4. 222px

```css
div {
_______ : 30px;
}
```

**Q38. 요소의 왼쪽 바깥쪽 여백을 30px 벌려서 다른 요소를 오른쪽으로 밀어내고 싶을 때 사용하는 속성은?**
1. margin-left
2. padding-left
3. border-left
4. spacing-left

```css
.container {
width: 800px;
}
.box {
width: 400px;
___________
}
```

**Q39. 특정 블록 요소(.box)를 부모 컨테이너(.container)의 '가로 중앙'에 오도록 정렬할 때 margin 속성을 활용하려고 한다. 이에 알맞은 코드 표현은?**
1.
   ```css
   margin: auto 0;
   ```
2.
   ```css
   margin: 0 auto;
   ```
3.
   ```css
   margin-left: 50%;
   ```
4.
   ```css
   padding: 0 auto;
   ```

**Q40. grid에서 열을 3개로 나누는 가장 명확한 선언은?**
1.
   ```css
   grid-template-columns: 1fr 1fr 1fr;
   ```
2.
   ```css
   grid-columns: 3;
   ```
3.
   ```css
   columns: grid(3);
   ```
4.
   ```css
   grid-template-rows: 1fr 1fr 1fr;
   ```

**Q41. 알약 형태(pill shape)의 둥근 버튼을 만들기 위해, 버튼의 너비가 유동적으로 변해도 양쪽 끝이 항상 완벽한 반원 형태를 유지하도록 실무에서 주로 사용하는 border-radius 속성 값은?**
1.
   ```css
   border-radius: 50%;
   ```
2.
   ```css
   border-radius: 100%;
   ```
3.
   ```css
   border-radius: 9999px; (또는 매우 큰 px 값)
   ```
4.
   ```css
   border-radius: auto;
   ```

**Q42. box-shadow 속성에서 그림자를 박스 '바깥쪽'이 아니라 박스 '안쪽'으로 생기게 해서, 버튼이 꾹 눌린 듯한 효과를 낼 때 쓰는 단어(키워드)는?**
1. inside
2. inset
3. inner
4. internal

**Q43. 배경 이미지가 잘려 나가지 않고 온전히 다 보이도록, 요소의 크기에 맞춰 원본 비율을 유지한 채 최대 크기로 이미지를 맞추는 background-size 속성값은?**
1. cover
2. contain
3. 100% 100%
4. auto

**Q44. 배경 이미지나 배경색이 테두리(border) 영역에는 칠해지지 않고, '패딩(padding) 영역까지만' 칠해지도록 제한 범위를 설정하는 CSS 속성은?**
1. background-origin
2. background-attachment
3. background-clip
4. box-sizing

**Q45. linear-gradient(90deg, red, blue)에서 각도 지정 90deg가 의미하는 진행 방향은?**
1. 아래쪽에서 위쪽으로 (to top)
2. 왼쪽에서 오른쪽으로 (to right)
3. 오른쪽에서 왼쪽으로 (to left)
4. 위쪽에서 아래쪽으로 (to bottom)

**Q46. 피자 조각을 나눈 것처럼 중심점을 기준으로 시계 방향으로 360도 돌아가며 색상이 변하는 CSS 그라디언트 함수로서, '컬러 휠'이나 '파이 차트'를 만들 때 쓰이는 것은?**
1. radial-gradient
2. rotate-gradient
3. sweep-gradient
4. conic-gradient

```css
.modal {
position: absolute;
top: 50%; left: 50%;
transform: ___(A)___;
}
```

**Q47. 위 지문에서 요소를 화면의 정중앙에 완벽하게 배치할 때, 'top: 50%; left: 50%;' 로 밀어낸 후 요소 자기 자신의 크기 절반만큼 다시 위/왼쪽으로 당겨오기 위해 사용하는 (A)에 알맞은 것은?**
1.
   ```css
   translate(-50%, -50%)
   ```
2.
   ```css
   translate(50%, 50%)
   ```
3.
   ```css
   translate(-50vw, -50vh)
   ```
4.
   ```css
   margin(-50%, -50%)
   ```

```css
.card-face {
_________: hidden;
}
```

**Q48. CSS로 카드를 뒤집는 효과(Flip Card)를 만들었을 때, 카드가 180도 회전하여 뒷면을 보이고 있을 때 그 뒷면의 내용(거울처럼 뒤집힌 글자)이 보이지 않게 숨겨주는 속성은?**
1. visibility
2. opacity
3. display
4. backface-visibility

```css
.box {
_________: background-color;
transition-duration: 1s;
}
```

**Q49. 위 지문에서 요소의 상태가 변할 때, 특정 CSS 속성에만 부드러운 애니메이션 효과를 주고자 할 때 대상을 지정하기 위해 밑줄 친 부분에 들어갈 속성은?**
1. transition-target
2. transition-type
3. transition-property
4. transition-name

**Q50. 전환 속도를 처음엔 느리게, 중간엔 빠르게, 끝날 땐 부드럽게 등 속도의 흐름(가감속)을 조절하는 속성은?**
1. transition-timing-function
2. transition-speed-curve
3. transition-pace
4. transition-flow

```css
.box {
animation-direction: ________;
}
```

**Q51. 위 지문에서 애니메이션이 정방향(0→100)으로 실행된 후, 다시 툭 끊겨 처음으로 돌아가지 않고 역방향(100→0)으로 부드럽게 되돌아오는 '요요 효과'를 주는 속성값은?**
1. reverse
2. alternate
3. normal
4. backwards

```css
.box:hover {
_________: paused;
}
```

**Q52. 위 지문에서 진행 중인 애니메이션을 마우스 오버 시 일시 정지하고 싶을 때 사용하는 속성은?**
1. animation-stop
2. animation-play-state
3. animation-status
4. animation-control

**Q53. 다단 레이아웃에서 단의 개수를 고정하지 않고, 각 단의 너비가 최소 300px은 되어야 한다라고 브라우저에 최적의 너비를 제시하는 속성은?**
1.
   ```css
   column-width: 300px;
   ```
2.
   ```css
   min-width: 300px;
   ```
3.
   ```css
   column-min: 300px;
   ```
4.
   ```css
   column-size: 300px;
   ```

**Q54. 텍스트의 분량에 따라 단의 높이가 결정될 때, 브라우저가 알아서 모든 단의 높이를 최대한 비슷하게(균등하게) 맞추도록 내용을 재분배하는 속성은?**
1.
   ```css
   column-height: auto;
   ```
2.
   ```css
   columns: equal;
   ```
3.
   ```css
   column-distribute: even;
   ```
4.
   ```css
   column-fill: balance;
   ```

```
________ score = 100;
score = 80;
```

**Q55. 위 지문의 자바스크립트에서 값이 중간에 변할 수 있는 일반적인 변수를 선언할 때 사용하는 가장 모던하고 올바른 키워드는?**
1.
   ```javascript
   const
   ```
2.
   ```javascript
   let
   ```
3.
   ```javascript
   var
   ```
4. int

```javascript
const userMsg = "";
const defaultMsg = "환영합니다";
const result = userMsg || defaultMsg;
```

**Q56. 위 지문에서 논리 연산자의 단축 평가를 활용한 코드이다. 변수 result에 할당되는 값은?**
1. "" (빈 문자열)
2. undefined
3. true
4. "환영합니다"

```javascript
console.log(10 == "10"); // (A)
console.log(10 === "10"); // (B)
```

**Q57. 위 지문에서 자바스크립트의 비교 연산자 '=='와 '==='를 적용하였을 때 (A)와 (B) 문장의 결과값으로 올바른 것은?**
1. (A) true, (B) false
2. (A) false, (B) false
3. (A) true, (B) true
4. (A) false, (B) true

```javascript
const fruits = ["Apple", "Banana"];
fruits.push("Cherry");
fruits.pop( );
```

**Q58. 위 지문의 배열에 데이터를 추가하고 삭제하는 내장 메서드들의 동작을 바르게 설명한 것은?**
1. push는 배열의 맨 앞에 요소를 추가하고, pop은 맨 앞의 요소를 제거한다.
2. push는 배열의 맨 뒤에 요소를 추가하고, pop은 맨 뒤의 요소를 제거한다.
3. 위 동작을 마치면 원본 배열은 ["Cherry"]가 된다.
4. 배열의 원본은 유지되며 새로운 배열이 반환된다.

```javascript
const nums = [1, 2, 3];
const doubled = nums.________(n => n * 2); // [2, 4, 6]
```

**Q59. 위 지문의 배열에서 기존 원본을 훼손(수정)하지 않고, 각 요소를 콜백 함수로 가공하여 완전히 새로운 똑같은 길이의 배열을 만들어 반환하는 함수형 메서드는?**
1.
   ```javascript
   forEach( )
   ```
2.
   ```javascript
   filter( )
   ```
3.
   ```javascript
   map( )
   ```
4.
   ```javascript
   reduce( )
   ```

```javascript
form.addEventListener('submit', function(e) {
e._________________; // 기본 동작 중지
console.log('페이지 이동 없이 JS 로직 실행');
});
```

**Q60. 사용자가 폼 전송 버튼(`<button type="submit">`)을 눌렀을 때, 페이지가 새로고침되며 서버로 데이터가 넘어가는 브라우저의 '기본 동작'을 강제로 취소시키는 메서드는?**
1.
   ```javascript
   stopPropagation( )
   ```
2.
   ```javascript
   cancelEvent( )
   ```
3.
   ```javascript
   preventDefault( )
   ```
4.
   ```javascript
   stopBubbling( )
   ```

```javascript
const items = document.__________________('li');
items.forEach(item => console.log(item));
```

**Q61. 위 지문 중 배열 순회 시 최신 브라우저에서 forEach 메서드를 별도의 변환 없이 바로 사용할 수 있는 DOM 컬렉션은?**
1. getElementsByTagName
2. getElementById
3. getElementsByClassName
4. querySelectorAll

**Q62. 개별 `<input>` 요소 100개에 각각 이벤트를 걸지 않고, 부모인 `<form>` 요소 하나에만 이벤트를 걸어 동적으로 추가되는 자식들의 이벤트까지 모두 처리하는 기법을 일컫는 표현은?**
1. 이벤트 버블링 차단
2. 이벤트 위임
3. 콜백 분리
4. 클로저

```javascript
box.classList.____________('active');
```

**Q63. 위 지문에서 classList를 사용하여 요소에 특정 클래스가 있으면 제거하고, 없으면 추가하기 위해 사용하는 메서드는?**
1. switch
2. replace
3. toggle
4. contains

```
box.style.___________________ = "gold";
```

**Q64. 위 지문에서 DOM 요소의 인라인 스타일을 직접 수정할 때, 하이픈이 포함된 CSS 속성명(background-color)은 자바스크립트에서 어떻게 작성해야 하는가?**
1. background-color
2. background_color
3. BackgroundColor
4. backgroundColor

```javascript
const cart = document.querySelector('#cart');
cart.__________________;
```

**Q65. 위 지문에서 쇼핑 장바구니처럼 `<div>` 안의 모든 상품(자식 요소)을 한 번에 싹 지워버리려 한다. 성능이 가장 뛰어나고 깔끔한 최신 메서드 호출 방식은?**
1.
   ```javascript
   innerHTML = ""
   ```
2.
   ```javascript
   removeChildren( )
   ```
3.
   ```javascript
   replaceChildren( )
   ```
4.
   ```javascript
   clearAll( )
   ```

```
// 방송대로 페이지 이동
________________ = 'https://www.knou.ac.kr';
```

**Q66. 위 지문에서 현재 웹 페이지의 주소(URL) 정보를 읽거나, 다른 페이지로 강제 이동시킬 때 사용하는 BOM의 핵심 객체와 속성은?**
1. window.navigator.href
2. window.history.move
3. location.href
4. document.move

**Q67. ctx.save( ) 메서드를 호출했을 때 스택에 저장되는 대상이 아닌 것은?**
1. 좌표계의 이동, 회전, 스케일 변환 상태
2. fillStyle, strokeStyle, globalAlpha 등의 색상 속성
3. 캔버스 도화지에 이미 색칠된 픽셀(그림) 데이터
4. lineWidth와 lineCap 등의 선 스타일

**Q68. 패스(Path) 기반 방식으로 그림을 그릴 때 새로운 밑그림을 시작하겠다는 의미의 선언으로 이전 경로들과의 연결을 끊는 리셋 버튼 역할을 하는 필수 메서드는?**
1.
   ```javascript
   ctx.moveTo( )
   ```
2.
   ```javascript
   ctx.closePath( )
   ```
3.
   ```javascript
   ctx.beginPath( )
   ```
4.
   ```javascript
   ctx.resetPath( )
   ```

**Q69. 다각형의 내부 색상(노란색)과 테두리(파란색, 두께 5)를 모두 그릴 때, 테두리 두께가 색상에 덮이지 않고 온전하게 5px 굵기를 유지하기 위한 올바른 메서드 호출 순서는?**
1.
   ```javascript
   ctx.stroke( ); 후 ctx.fill( );
   ```
2.
   ```javascript
   ctx.fill( ); 후 ctx.stroke( );
   ```
3. 순서는 전혀 상관없다.
4.
   ```javascript
   ctx.closePath( );를 생략하면 된다.
   ```

**Q70. 원이나 부채꼴을 그리는 ctx.arc( ) 함수에서 기본적으로 각도를 재는 방향과 기준점(0라디안)은 어디인가?**
1. 12시 방향 기준, 시계 방향
2. 12시 방향 기준, 시계 반대 방향
3. 3시 방향 기준, 시계 방향
4. 3시 방향 기준, 시계 반대 방향

```javascript
ctx.______________ = "round";
```

**Q71. 위 지문에서 굵은 선을 그렸을 때 선의 끝부분 모서리 형태를 지정하는 속성으로, 둥근 버튼 형태 UI를 그릴 때 주로 사용하는 스타일 값은 무엇인가?**
1. lineJoin
2. lineShape
3. lineCap
4. strokeType

```javascript
ctx.setLineDash([10, 5]);
ctx._________________ = offset; // 패턴 시작 위치를 당기거나 밈
```

**Q72. 위 지문 중 포토샵처럼 점선이 스르륵 흐르는 듯한 애니메이션을 구현할 때, 점선의 패턴 설계도를 왼쪽이나 오른쪽으로 미세하게 밀어주는 역할을 하는 속성은?**
1. lineWidth
2. lineDashOffset
3. linePatternStart
4. strokeOffset

```javascript
const grad = ctx.createLinearGradient(0, 0, 200, 0);
grad.addColorStop(0, "black");
grad.addColorStop(1, "white");
```

**Q73. 위 지문은 선형 그라디언트를 생성하는 코드의 일부이다. 그라디언트가 그려지는 방향은 어떻게 되는가?**
1. 왼쪽에서 오른쪽으로 (수평)
2. 위에서 아래로 (수직)
3. 좌상단에서 우하단으로 (대각선)
4. 중앙에서 바깥쪽으로 (방사형)

```javascript
const pattern = ctx.__________________(img, 'repeat');
```

**Q74. 위 지문의 캔버스에서 외부 이미지를 불러와 타일처럼 반복되는 패턴 객체를 생성하는 메서드는?**
1. createPattern
2. makePattern
3. buildPattern
4. drawPattern

```javascript
ctx.______________ = 10; // 10픽셀만큼 흐려짐
```

**Q75. 위 지문에서 그림자의 경계선을 칼같이 자르지 않고, 뿌옇게 퍼지도록 만드는 속성은 무엇인가?**
1. shadowSpread
2. shadowOpacity
3. shadowRadius
4. shadowBlur

```javascript
ctx.__________________ = "center";
ctx.fillText("가운데 정렬", 150, 100);
```

**Q76. 위 지문에서 지정된 X 좌표를 기준으로 텍스트를 "가운데 정렬(수평 중앙)" 시키기 위해 사용하는 속성은?**
1. textBaseline
2. textAlign
3. horizontalAlign
4. justifyContent

```javascript
ctx.________(img, 0, 0);
```

**Q77. 위 지문의 캔버스에 외부에서 가져온 사진이나 이미지를 그려넣는 가장 기본적이고 널리 쓰이는 메서드는 무엇인가?**
1.
   ```javascript
   paintImage( )
   ```
2.
   ```javascript
   insertImage( )
   ```
3.
   ```javascript
   showImage( )
   ```
4.
   ```javascript
   drawImage( )
   ```

**Q78. ctx.scale(2,2)를 적용한 후 도형을 그렸다. 도형의 크기가 2배 커지는 것 외에 또 어떤 속성이 2배로 영향을 받아 시각적으로 달라지는가?**
1. 도형 내부의 투명도
2. 선의 두께
3. 그림자 반경
4. 채우기 색상

> 지문:

```html
<video src="bgm.mp4" autoplay __________________></video>
```
**Q79. 위 지문에서 모던 브라우저 정책상 오디오나 비디오를 웹페이지 접속 시 자동으로 재생(autoplay)되게 하려면, 사용자 경험을 위해 반드시 함께 명시해야 하는 속성은 무엇인가?**
1. loop
2. controls
3. muted
4. preload

```javascript
if (video.__________) {
console.log("현재 영상이 멈춰있습니다.");
}
```

**Q80. 위 지문의 자바스크립트에서 비디오나 오디오 객체를 선택하여 현재 '일시정지' 상태인지 아닌지를 확인하기 위해 사용하는 프로퍼티는 무엇인가?**
1. isPaused
2. paused
3. stopped
4. notPlaying

```javascript
function stopVideo( ) {
video.pause( );
________________;
}
```

**Q81. 위 지문의 HTML5 미디어 API에는 stop( ) 메서드가 존재하지 않는다. 자바스크립트로 영상을 완전히 정지시키고 재생 위치를 맨 처음(0초)으로 되돌리는 로직으로 올바른 것은?**
1.
   ```javascript
   video.reset( );
   ```
2.
   ```javascript
   video.time = 0;
   ```
3.
   ```javascript
   video.currentTime = 0;
   ```
4.
   ```javascript
   video.reload( );
   ```

```javascript
card.addEventListener('dragstart', (e) => {
e._____________.setData('text/plain', card.id);
});
```

**Q82. 위 지문에서 드래그 앤 드롭 통신의 핵심으로, 드래그가 시작될 때 데이터를 담고 드롭될 때 데이터를 꺼낼 수 있게 해주는 '수레(바구니)' 역할을 하는 이벤트 객체 내부의 프로퍼티 이름은 무엇인가?**
1. dataObject
2. dataTransfer
3. dragBasket
4. payload

```javascript
column.addEventListener('dragover', (e) => {
_____________________;
});
```

**Q83. 위 지문에서 드래그 앤 드롭 구현 시, 목적지 영역에 요소를 내려놓기 위해 타겟의 dragover와 drop 핸들러에서 기본 동작의 차단 목적으로 반드시 사용해야 하는 메서드는?**
1.
   ```javascript
   e.allowDrop( )
   ```
2.
   ```javascript
   e.preventDefault( )
   ```
3.
   ```javascript
   e.stopPropagation( )
   ```
4.
   ```javascript
   e.accept( )
   ```

**Q84. 컴퓨터 바탕화면에 있는 이미지 파일을 끌어다가 브라우저 화면 안으로 떨어뜨렸다. 이때 목적지의 drop 이벤트 내에서 넘어온 파일 데이터를 꺼내보려면 어떤 객체를 확인해야 하는가?**
1. window.droppedFiles
2.
   ```javascript
   e.dataTransfer.getData('file')
   ```
3.
   ```javascript
   e.target.files
   ```
4.
   ```javascript
   e.dataTransfer.files
   ```

```javascript
const user = { name: '홍길동' };
(가) // 객체 저장
```

**Q85. 위 지문에서 자바스크립트 객체를 웹 스토리지에 에러 없이 온전하게 보관하기 위한 실무 표준 코드로 (가)에 적합한 것은?**
1.
   ```javascript
   localStorage.setItem('user', user);
   ```
2.
   ```javascript
   localStorage.setItem('user', JSON.parse(user));
   ```
3.
   ```javascript
   localStorage.setItem('user', JSON.stringify(user));
   ```
4.
   ```javascript
   localStorage.setItem('user', user.toString());
   ```

**Q86. 웹 스토리지에 저장된 캔버스 환경설정 정보를 가져오려고 한다. 이를 위한 메서드의 올바른 사용은?**
1.
   ```javascript
   const mode = localStorage.getValue('theme');
   ```
2.
   ```javascript
   const mode = localStorage.getItem('theme');
   ```
3.
   ```javascript
   const mode = localStorage.get('theme');
   ```
4.
   ```javascript
   const mode = localStorage.fetchItem('theme');
   ```

**Q87. window.addEventListener('storage', ...) 이벤트가 브라우저에서 발생하는 정확한 시점은 언제인가?**
1. 현재 보고 있는 탭에서 데이터가 저장/수정/삭제되었을 때
2. 스토리지 저장 용량 한도를 초과하여 데이터를 저장하려고 할 때
3. 웹 페이지가 로드되어 클라이언트에 스토리지가 생성될 때
4. 같은 스토리지 영역을 사용하는 다른 탭이나 창에서 스토리지가 변경되었을 때

**Q88. 배달 라이더 앱에서처럼 사용자가 이동할 때마다 브라우저가 알아서 연속적으로 위치 변화를 감지해서 콜백을 실행해 주는 실시간 위치 추적 메서드는?**
1.
   ```javascript
   navigator.geolocation.getCurrentPosition( )
   ```
2.
   ```javascript
   navigator.geolocation.observeLocation( )
   ```
3.
   ```javascript
   navigator.geolocation.watchPosition( )
   ```
4.
   ```javascript
   navigator.geolocation.liveTracking( )
   ```

```javascript
const options = {
_____________________: true
};
```

**Q89. 위 지문에서 위치 정보를 얻어올 때 3번째 인자로 옵션(options) 객체를 전달한다. 이 중 배터리 소모가 심해지더라도 기지국 대신 GPS 센서를 강제로 깨워 최대한 오차 없는 정밀한 위치를 원할 때 사용하는 속성은?**
1. enableHighAccuracy
2. useGPS
3. highPrecision
4. maximumAccuracy

```javascript
const lat = position._________.latitude;
const lng = position._________.longitude;
```

**Q90. 위 지문에서 getCurrentPosition( )이 성공해서 position 객체를 콜백으로 받았고, 여기서 가장 핵심적인 위도와 경도 데이터를 뽑아내려고 한다. 이때 밑줄 친 부분에 들어갈 객체는?**
1. coords
2. location
3. data
4. gps

#### 연습문제 정답

1. 4
   - 해설: 클라이언트(브라우저)는 요청을 보내고, 서버가 응답한 HTML을 파싱/렌더링하여 화면에 표시한다.
2. 3
   - 해설: meta 요소의 keywords 속성은 현대 SEO 관점에서 사실상 사용되지 않고, 대신에 OG가 훨씬 중요하게 사용된다.
3. 2
   - 해설: hr 요소는 단순히 수평선을 그리는 것이 아니라, 주제의 전환이라는 의미적 구분선 기능을 수행한다. 따라서 단순히 시각적인 수평선을 그리는 경우라면 CSS border-bottom 속성을 사용한다.
4. 3
   - 해설: 헤딩 요소는 사용 규칙(h1은 페이지당 오직 1개 사용, 순서를 건너뛰지 말고 순차적으로 사용, 디자인 용도(글씨를 크게 하는 용도)로 사용 금지)을 준수하여 사용한다. HTML 요소의 스타일 변경은 CSS로 처리하는 것이 기본적인 원칙이다.
5. 4
   - 해설: b-strong, i-em, s-del, u-ins는 각각 표현 중심(물리적)과 의미 중심(논리적)의 대응 관계이다. 하지만 span과 div는 인라인 컨테이너와 블록 컨테이너의 차이일 뿐 논리/물리적 관계가 아니다.
6. 1
   - 해설: 주어진 특징은 블록 요소에 대한 설명이다. div는 블록 요소이고, 나머지(span, a, strong)는 모두 인라인 요소이다.
7. 2
   - 해설: 'list-style: none;'을 사용하여 불릿을 제거하는 것이 내비게이션 등을 만들 때 사용하는 기본 패턴이다.
8. 2
   - 해설: dl은 "정의-설명" 구조의 리스트를 만들기 위한 것으로, 자식 요소로 '용어/키'를 표시하는 dt 요소와 '설명/값'을 나타내는 dd를 사용한다.
9. 2
   - 해설: 'max-width: 100%;'는 이미지가 부모 영역보다 커지는 것을 방지하고, 'height: auto;'는 이미지의 비율이 찌그러지는 것을 방지하기 위한 것이다. 이 속성들을 사용하면 화면 크기에 따라 이미지의 크기가 자동으로 늘어나고/줄어드는 기능을 만들 수 있다.
10. 3
   - 해설: 새 창 열기(target="_blank")을 사용할 때는 보안 취약점 방지를 위해 rel="noopener noreferrer"를 함께 사용하는 것이 규칙이다.
11. 2
   - 해설: 내부 앵커로 이동할 때는 href 속성에 #을 붙인 이름("#section1")을 값으로 지정하고, 이를 목적지 요소에서 id 속성값으로 사용한다.
12. 1
   - 해설: th(table header) 요소는 열이나 행의 제목을 나타내는 셀이다. 반면 caption은 표 전체의 제목을 기본적으로 표 상단 중앙에 나타내는 것으로, 표 의미를 요약해 주는 접근성 핵심 요소이다.
13. 2
   - 해설: thead/tbody/tfoot 요소는 표에서 행 단위 콘텐츠를 각각 머리글, 본문, 바닥글 영역으로 명시적인 구분/그룹핑을 위한 것으로, 시각적인 "장식"이 아니라 구조 구분용이다.
14. 2
   - 해설: 최신 브라우저는 브라우저 정책상 미디어의 자동 재생(autoplay)을 강제로 차단한다. 즉 사용자의 조작 없는 자동 재생을 제한한다. 따라서 이를 사용하려면 반드시 muted 속성을 함께 명시해야 한다.
15. 3
   - 해설: 브라우저마다 미디어 파일의 지원 상황이 다를 수 있으므로 audio/video 요소의 단일 src 속성 대신 source 요소로 사용하여 대체 소스를 제공하며, 이는 브라우저 호환성을 확보하기 위한 실무적 접근 방법이다.
16. 4
   - 해설: 시멘틱 요소는 브라우저, 검색엔진, 개발자에게 이 부분이 어떤 역할을 하는지 명확한 의미를 전달하기 위한 것이며, 이는 접근성, 검색엔진 최적화(SEO) 및 유지보수와 밀접하게 연결되어 있다.
17. 1
   - 해설: figure는 '독립적인 콘텐츠+캡션'이라는 결합의 의미를 브라우저/검색엔진에 전달한다. 따라서 캡션이 필요 없는 경우에는 현실적으로 figure를 사용하지 않으며, 이미지, 코드 블록, 도표, 인용문 등이 독립적인 콘텐츠에 해당한다.
18. 2
   - 해설: time은 날짜/시간에 의미를 부여하기 위한 요소로서, 검색엔진이 이를 정확히 인식하게 하여 검색 결과에 날짜를 표시할 때 주로 사용한다. 이때 요소의 텍스트는 단순히 사람의 이해를 돕기 위한 것이고, 속성 datetime="YYYY-MM-DD"를 사용하면 검색엔진이나 캘린더 앱이 날짜를 정확히 인식할 수 있다.
19. 3
   - 해설: progress 요소는 진행 중인 작업의 진행률을 표시하기 위한 것으로, 자바스크립트와의 연동을 통해서 value의 지속적인 업데이트가 필수적이다. 만약 요소에서 value 속성을 사용하지 않으면 작업 완료 시간을 예측할 수 없는 '불확정 상태'로 간주하여, 브라우저는 자동으로 파란 막대가 좌우로 왔다 갔다 하는 애니메이션이 재생된다.
20. 4
   - 해설: 검색이나 조회 기능은 URL 공유가 가능해야 하므로 속성값 get이 적합하며, 데이터 변경이나 민감 정보(예: 로그인, 글쓰기, 회원가입, 결제, 대량 데이터 등)는 post 값을 사용한다.
21. 3
   - 해설: placeholder 속성은 입력하기 전에 희미하게 보이는 예시/힌트 텍스트를 제공하지만, 입력 시 사라지므로 label 요소를 대체하는 방법으로 사용하면 안 된다. 참고로 alt 속성은 이미지 버튼(type="image")의 대체 텍스트를 나타낸다. value 속성은 입력창에 미리 채워져 있을 초기값 또는 현재값을 의미하며, 버튼(submit, button 등)에서는 버튼 위에 표시될 글자(‘버튼 이름’)가 된다.
22. 2
   - 해설: inputmode 속성은 모바일 키보드의 모양을 결정하는 속성이다. 즉 모바일 기기(아이폰, 안드로이드)에서 입력창을 눌렀을 때 어떤 모양의 가상 키보드를 띄울지를 브라우저에게 알려준다. 신용카드 번호나 인증 번호처럼 순수 숫자만 필요한 경우, type="number" 대신 type="text"와 inputmode="numeric" 조합을 실무적으로 선호한다.
23. 1
   - 해설: 폼 안에서 관련된 입력 요소들을 하나의 그룹으로 묶고, 그 그룹의 제목을 붙여주는 요소이다. 특히 체크박스나 라디오 버튼을 사용할 때는 접근성을 위해 반드시 사용해야 한다. 그룹의 제목 지정은 legend 요소를 사용하며, 이 요소는 fieldset 요소의 첫 번째 자식 요소로 사용해야 한다.
24. 2
   - 해설: radio 버튼은 같은 그룹에서 오직 하나의 항목만 선택("배타적 선택") 가능하며, 그룹이 여러 개이면 그룹마다 하나씩 그룹 수만큼 선택할 수 있다. 이때 동일한 그룹에 속하는 항목들은 동일한 name 속성값으로 지정해야 한다.
25. 3
   - 해설: 선택 리스트인 datalist 요소를 사용하기 위해서는 input 요소와의 연동이 필수적이며, 이를 위해서는 input 요소의 list 속성과 datalist 요소의 id 속성을 동일한 값으로 지정한다.
26. 3
   - 해설: 인라인 스타일은 명시도 점수가 1,000점으로 매우 높아 오히려 다른 스타일로 덮어쓰기가 어렵다.
27. 2
   - 해설: 클래스 선택자(.text)와 요소/타입 선택자(p)가 충돌된 경우이다. 이때 명시도 점수를 계산하면 클래스 선택자는 10점, 타입 선택자는 1점이므로 점수가 더 높은 클래스 스타일이 적용된다.
28. 2
   - 해설: 속성 선택자는 기본적으로 '[ ]'를 사용해서 표현하며, 특정 속성의 존재 여부만으로 선택할 때는 '[속성명]' 문법을 사용한다. 이 밖의 주요 속성 표현 패턴으로는 '[속성="값"]', '[속성*="값"]', '[속성^="값"]', '[속성$="값"]' 등이 있다.
29. 1
   - 해설: ul 바로 밑에 있는 li들만 선택한다는 것은 직계 자식 요소만 골라낸다는 의미이며, 자식 결합자는 > 기호를 사용한다. ② 자손 결합자, ③ 인접 형제 결합자, ④ 일반 형제 결합자에 해당한다.
30. 4
   - 해설: 키워드 currentColor를 사용하면 글자 색상이 바뀔 때 테두리나 아이콘 색도 자동으로 함께 바뀐다. transparent는 완전 투명한 검정색을 나타낸다.
31. 1
   - 해설: rem은 최상위 요소(루트 요소, html) 크기에 비례하는 단위로서, 보통 1rem=16px이다. 반면 em은 부모 요소 크기에 비례하는 단위이며, 이는 버튼 내부의 패딩/마진 같이 컴포넌트 내부 미세 조정에 제한적으로 사용하는 것이 바람직하다.
32. 2
   - 해설: 본문을 기준으로 글자 크기 1rem 그리고 줄간격 1.5~1.6(한글 기준)이 가독성 원칙에 가장 부합한다.
33. 3
   - 해설: font는 글꼴 관련 font-*의 단축 속성으로, "font: [스타일] [변형] [두께] 크기 / 줄간격 서체;" 형식을 사용한다. 이때 폰트와 직접 관련된 속성 이외에 line-height 값이 함께 지정될 수 있으며, 이때에는 반드시 font-size 값 뒤에 슬래시를 사용해서 값을 표현해야 한다.
34. 4
   - 해설: 기본적으로 말줄임(...) 표시를 위한 속성은 text-overflow이다. 실제 한 줄 말줄임을 위해서는 "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"와 같이 3가지 속성을 하나의 공식처럼 반드시 함께 사용한다.
35. 2
   - 해설: 리스트의 기본 기호와 들여쓰기를 모두 제거해야 메뉴 디자인을 자유롭게 할 수 있다. 기본 불릿/기호를 없애기 위해서는 "ul, ol { list-style-type: none; }"을 사용한다.
36. 1
   - 해설: table-layout 속성은 테이블 각 셀의 너비를 계산하는 방식과 관련된 속성으로, 테이블의 렌더링 속도와 디자인 고정을 위해 매우 중요하게 사용된다. 이때 속성값으로 fixed로 지정(실무 추천)하면 내용물의 길이에 상관없이 지정한 폭을 강제로 유지할 수 있어 테이블의 안정성을 높일 수 있다. 한편 auto로 지정하면 내용물의 길이에 따라 각 칸의 너비가 자동으로 조정된다.
37. 4
   - 해설: 기본값인 content-box에서는 width(200) + 좌우 패딩(20) + 좌우 테두리(2) = 222px이 실제 차지하는 가로 너비가 된다. 한편, 속성값 border-box의 경우에는 지정한 width 값에 콘텐츠, 패딩, 테두리의 크기까지 모두 포함되므로 실제 렌더링 가로 너비는 width의 크기와 같다.
38. 1
   - 해설: 바깥 여백'은 margin이고, '왼쪽'은 left이므로 margin-left을 사용해야 한다. margin은 요소와 다른 요소 사이의 간격을 벌릴 때 사용하며, padding은 콘텐츠와 테두리 사이의 공간으로, 요소의 배경색이나 테두리 안쪽 공간을 넓힐 때 사용한다.
39. 2
   - 해설: 'margin: 0 auto;'는 위아래 마진을 0으로, 좌우 마진을 브라우저가 남은 공간을 반씩 나누어 갖도록(auto) 해서 블록 요소를 가로 중앙에 배치하는 가장 고전적이고 확실한 방법으로 실무에서 많이 사용된다. 이 방법은 인라인 요소나 width가 없는 요소에서는 동작하지 않는다.
40. 1
   - 해설: 'grid-template-columns: 1fr 1fr 1fr;'는 열의 개수와 크기를 정의한다. 크기를 지정하는 fr 단위는 남은 공간의 비율을 의미하며, '1fr 1fr 1fr'은 남은 공간을 1:1:1 비율로 3등분한다.
41. 3
   - 해설: 속성값 50%을 지정하면 완전한 원/타원이 되고, 9999px 처럼 요소의 실제 높이보다 훨씬 큰 px 값을 지정하면 브라우저가 그릴 수 있는 최대치의 반원을 그려 양쪽 끝이 둥근 캡슐/알약 모양이 된다.
42. 2
   - 해설: inset 키워드를 쓰면 안쪽으로 파고드는 내부 그림자가 만들어진다. 참고로, text-shadow 속성은 inset 키워드를 지원하지 않는다.
43. 2
   - 해설: contain은 이미지가 잘리지 않는 한도 내에서 요소를 꽉 채우도록 비율을 유지하며 늘어난다. 하지만, 빈 여백이 생길 수 있다. cover는 빈틈없이 박스를 꽉 채우지만 이미지가 잘릴 수 있으며, 100% 100%는 박스 크기에 억지로 끼워 맞추기 때문에 찌그러짐이 발생할 수 있다.
44. 3
   - 해설: background-clip은 배경색이나 이미지가 그려지는(칠해지는) 범위를 지정한다. padding-box로 설정하면 투명한 테두리나 점선 테두리 밑으로 배경이 비치지 않는다.
45. 2
   - 해설: CSS 선형 그라디언트에서 0deg는 위쪽(12시)이며, 시계 방향으로 증가한다. 따라서 90deg는 오른쪽(3시 방향, to right)을 의미하며, 기본값은 180deg(to bottom)이다.
46. 4
   - 해설: conic-gradient( )는 원뿔(cone)을 위에서 내려다본 것처럼 각도(deg, turn)를 기준으로 색상이 회전하는 그라디언트 함수입니다. linear-gradient( )는 색상이 한 방향으로 변하며, radial-gradient( )는 중심점에서 바깥쪽으로 퍼저 나가는 원형/타원형의 그라디언트이다.
47. 1
   - 해설: translate 내부의 % 값은 부모가 아닌 요소 자기 자신의 너비와 높이를 기준으로 한다. 따라서 각 방향으로 -50%를 주면 자신의 크기 절반만큼 정확히 역이동하여 완벽한 중앙 정렬이 이룰 수 있다.
48. 4
   - 해설: 요소가 3D 회전하여 사용자와 등지게(뒷면이 보이게) 되었을 때, 해당 면을 렌더링하지 않고 투명하게 처리하는 속성 표현은 'backface-visibility: hidden;'이다.
49. 3
   - 해설: 전환 효과를 적용할 CSS 속성(예: width, opacity 등)을 지정할 때는 transition-property를 사용하며, 이와 함께 transition-duration 속성을 0이 아닌 값으로 지정해야 전환 효과를 부여할 수 있다.
50. 1
   - 해설: transition-timing-function은 애니메이션의 속도 변화(가속과 감속)를 제어하는 속성이며, 보기에서 언급한 나머지 것들은 실제로 존재하지 않는다.
51. 2
   - 해설: 속성값 alternate는 반복 실행될 때 홀수 번째는 정방향, 짝수 번째는 역방향으로 진행하여 매끄러운 왕복 효과를 연출한다.
52. 2
   - 해설: animation-play-state은 애니메이션의 재생 상태를 paused(일시 정지) 또는 running(재생)으로 제어하는 속성이다.
53. 1
   - 해설: column-width는 단의 최적 너비(가이드라인)를 지정하는 속성으로, 공간이 허락하는 한 이 너비 이상을 유지하며 단의 개수를 자동으로 늘리거나 줄여서 반응형 다단을 구성할 수 있다.
54. 4
   - 해설: column-fill 속성의 기본값인 balance는 내용이 부족하더라도 모든 단의 높이를 균형 있게 맞추기 위해 내용을 적절히 쪼갠다.
55. 2
   - 해설: ES6 이후부터는 값이 변할 수 있는 변수를 만들 때 버그가 많은 var 대신 안전한 let을 사용하는 것이 표준이다. 한편 변하지 않는 고정된 값(상수)을 선언할 때는 const 키워드를 사용한다.
56. 4
   - 해설: 논리합(||) 연산자는 왼쪽 피연산자가 falsy 값("", 0, null, undefined 등)이면 오른쪽 피연산자를 그대로 반환합니다. 빈 문자열은 falsy이므로 defaultMsg가 변수에 할당된다. 이는 매개변수 기본값 설정에 자주 쓰이는 패턴이다.
57. 1
   - 해설: '=='(느슨한 비교)는 브라우저가 값의 타입을 강제로 변환하여 비교하므로 true가 나온다. 하지만 '==='(엄격한 비교)는 타입과 값이 모두 일치해야 하므로 false가 된다. 실무에서는 버그 방지를 위해 항상 ===를 사용한다.
58. 2
   - 해설: push( )와 pop( )은 햄버거 통(스택)처럼 배열의 맨 마지막 꼬리 부분을 다루는 메서드이며, 맨 앞부분을 다루는 것은 unshift( )와 shift( )이다. 이 메서드들은 원본 배열 자체를 변경한다.
59. 3
   - 해설: map( )은 배열의 모든 요소를 순회하며 가공한 결괏값들로 꽉 채워진 '새로운 배열'을 반환하는 메서드이다.
60. 3
   - 해설: e.preventDefault( )를 호출하면 요소가 가진 원래의 기능(&lt;a&gt;의 링크 이동이나 &lt;form&gt;의 제출 등)이 작동하지 않고 취소하여 JS가 통제권을 쥐게 한다.
61. 4
   - 해설: querySelectorAll( )이 반환하는 NodeList는 최신 브라우저에서 forEach 메서드를 자체 지원하여 코드가 훨씬 간결해진다.
62. 2
   - 해설: 부모 요소에 단 하나의 리스너만 등록하여, 새로 추가되는 동적 자식 요소의 이벤트까지 메모리 낭비 없이 한 번에 자동 관리하는 방식을 이벤트 위임(event delegation)이라 한다.
63. 3
   - 해설: classList.toggle('클래스명')은 스위치처럼 클래스의 존재 여부를 파악해 가감(Add/Remove)을 알아서 처리해 주는 핵심 메서드이다.
64. 4
   - 해설: 자바스크립트 객체의 속성으로 CSS 속성을 제어할 때는 마이너스(-) 기호 연산과 헷갈리지 않게 하이픈을 빼고 카멜케이스(낙타체)인 backgroundColor로 작성해야 합니다.
65. 3
   - 해설: element.replaceChildren( ) 메서드에 인자를 넣지 않고 호출하면, 내부의 모든 자식 요소가 가장 빠르고 안전하게 삭제된다.
66. 3
   - 해설: location 객체의 href 속성에 새로운 URL을 대입하면 해당 주소로 페이지가 이동한다.
67. 3
   - 해설: "캔버스(도화지)에 그려진 그림(픽셀)은 저장되지 않는다. 오직 '붓의 상태'와 '도화지의 상태'만 저장된다." save( )와 restore( )는 Undo 기능이 아니다. 스타일링 설정이 꼬이는 부작용 없이 안전하게 그림을 그리기 위해서는, 그리기 전에 ctx.save( )를 호출하고, 그림을 다 그린 직후 ctx.restore( )로 마무리하는 것이 중요하다.
68. 3
   - 해설: 패스 기반 방식을 시작할 때 beginPath( )를 생략하면 이전 경로를 계속 기억하여 의도치 않은 그림이 그려지게 된다. 따라서 다른 그림을 그릴 때마다 beginPath( )로 시작하는 것은 새로운 설계도의 시작을 알린다는 의미를 갖는 매우 중요한 선언이다.
69. 2
   - 해설: 캔버스에서 선은 경로의 중앙을 기준으로 양옆으로 퍼집니다. 테두리를 먼저 그리고(stroke) 면을 채우면(fill), 채우는 색상이 테두리의 안쪽 절반을 덮어버려 선이 얇아 보인다. 따라서 채우기를 먼저 한 뒤 테두리를 그리는 것이 정석이다.
70. 3
   - 해설: 캔버스에서 0라디안은 시계의 3시 방향이며, counterclockwise 속성이 기본값 false일 때 각도는 시계 방향(아래쪽)으로 증가한다.
71. 3
   - 해설: 선의 시작점과 끝점 양끝 모양을 결정하는 속성은 lineCap이며, "round"로 설정하면 선의 굵기 반만큼 둥근 반원이 끝에 추가된다.
72. 2
   - 해설: lineDashOffset 속성은 지정된 점선 패턴이 어디서부터 시작할지 오프셋 거리를 지정한다. 애니메이션 함수에서 이 값을 계속 증가/감소시키면 선이 움직이는 듯한 시각적 환상을 줄 수 있다.
73. 1
   - 해설: createLinearGradient(x0, y0, x1, y1)에서 y좌표는 0으로 고정이고 x좌표만 0에서 200으로 변하므로, 왼쪽에서 오른쪽으로 변하는 수평 그라디언트가 된다.
74. 1
   - 해설: 이미지를 반복 패턴으로 만들어주는 메서드는 createPattern(이미지변수, 반복방식)이다.
75. 4
   - 해설: 그림자의 흐림 정도(가우시안 블러 반경)를 설정하는 속성은 shadowBlur이다.
76. 2
   - 해설: 텍스트의 수평 정렬(좌, 우, 중앙 등)을 담당하는 속성은 textAlign이다.
77. 4
   - 해설: 이미지를 캔버스에 렌더링하는 내장 메서드의 이름은 drawImage이다.
78. 2
   - 해설: scale( )은 캔버스 그리드 픽셀 자체를 확대하므로, 명시된 선 두께(lineWidth=1)도 똑같이 스케일(두 배 확대)이 적용되어 2픽셀 두께로 굵게 렌더링된다.
79. 3
   - 해설: 사용자 동의 없는 소리 자동 재생은 브라우저가 차단하므로, autoplay는 반드시 소리를 끄는 muted 속성과 함께 사용해야 동작한다.
80. 2
   - 해설: 미디어의 일시정지 상태 여부를 true 또는 false로 반환하는 속성은 paused이다.
81. 3
   - 해설: 미디어를 멈추고(pause) 현재 재생 시점을 의미하는 currentTime 속성에 0을 대입하여 재생 헤드를 맨 앞으로 옮기는 것이 정지(stop)의 구현 방식이다.
82. 2
   - 해설: 출발지와 목적지 사이에서 데이터를 운반하는 핵심 객체는 이벤트 객체 내의 dataTransfer이다.
83. 2
   - 해설: 브라우저는 기본적으로 다른 요소 위에 데이터를 떨어뜨리는 것을 거부한다. 따라서 dragover 이벤트에서 e.preventDefault( )를 호출해 기본 거부 동작을 취소해야만 drop 이벤트가 정상적으로 발생한다.
84. 4
   - 해설: 운영체제에서 브라우저로 드롭된 파일들은 텍스트 데이터가 아니므로, dataTransfer 객체의 files 프로퍼티(배열 형태의 FileList)에 고스란히 담겨 들어온다.
85. 3
   - 해설: 웹 스토리지는 "오직 문자열로만 저장할 수 있다"라는 데이터 타입의 한계가 존재한다. 따라서 객체나 배열을 문자열로 안전하게 변환하여 스토리지에 넣으려면 무조건 JSON.stringify( )를 사용해야 한다. 반대로 스토리지에서 꺼내와서 자바스크립트 객체로 변환하기 위해서는 JSON.parse( )를 사용한다.
86. 2
   - 해설: 웹 스토리지에서 데이터를 읽어오는 표준 메서드는 getItem(key)이다. 물론 내장 메서드가 아닌 객체 속성(점 표기)이나 대괄호( [ ] )를 사용하는 방법도 존재하지만, 스토리지 자체 메서드/속성과 이름이 겹칠 위험이 있으므로 실무에서는 사용하지 않는다.
87. 4
   - 해설: storage 이벤트는 데이터를 변경한 '현재 탭'에서는 절대 발생하지 않고, 오직 같은 도메인을 공유하는 '다른 탭/창'에서만 발생한다. 이는 탭 간의 통신을 위해 만들어졌기 때문이다.
88. 3
   - 해설: 사용자의 위치가 변경될 때마다 계속해서 위치를 가져오는 실시간 추적 메서드는 watchPosition( )이며, 목적지에 도착했거나 백그라운드 전환 시에는 반드시 clearWatch( )를 수행하여 추적을 종료한다.
89. 1
   - 해설: 더 많은 배터리가 소모되고 속도가 좀 느리더라도 매우 정확한 위치 측정이 필요한 경우에는 ‘enableHighAccuracy : true’ 옵션을 사용한다.
90. 1
   - 해설: 성공 콜백으로 반환된 position 객체 내부의 coords (coordinates) 객체를 통해서 위도, 경도, 정확도 등의 실제 정보를 얻을 수 있다. 단 위치가 파악된 시간 정보(1970.1.1.부터 경과된 밀리초 단위 시간)는 position.timestamp를 통해 얻는다.

### Java프로그래밍

> 우선순위: 객체지향/상속/인터페이스/제네릭/컬렉션/스트림/JDBC를 구분해서 암기

#### 핵심 암기표

| 주제 | 외울 문장 |
|---|---|
| Java 기본 | - Java는 클래스 기반 객체지향 언어이며 JVM 위에서 바이트코드가 실행된다. (플랫폼 독립)<br>- Java 플랫폼은 JVM + Java API다. (JDK는 개발도구 포함)<br>- Java 프로그래밍을 하려면 JDK가 필요하다. (JRE만으로 개발 X) |
| 클래스와 객체 | - Java 프로그램의 기본 구성 단위는 클래스다. (파일명/public class)<br>- 클래스는 데이터와 메서드로 객체를 추상화한 틀이다. (데이터+행위) |
| 변수와 타입 | - 변수는 인스턴스 변수, 클래스 변수, 지역 변수, 파라미터로 나뉜다. (위치/소속 구분)<br>- 기본형은 byte, short, int, long, float, double, char, boolean이다. (String은 참조형)<br>- 클래스와 배열은 참조형이고 참조값을 저장한다. (객체 자체 저장 X)<br>- 묵시적 형변환은 손실 없을 때 자동, 명시적 형변환은 캐스팅이다. (큰→작은 강제)<br>- 명령행 매개변수는 main의 String[] args로 전달된다. (실행 시 클래스명 뒤) |
| 접근 제어 | - 일반 최상위 클래스 접근 제어자는 public 또는 생략만 가능하다. (private 클래스 X)<br>- 접근 제어자 생략은 같은 패키지에서 접근 가능하다. (package-private) |
| 생성자 | - 생성자는 클래스 이름과 같고 반환형이 없다. (void 쓰면 메서드)<br>- this()는 같은 클래스 생성자, super()는 부모 생성자를 호출한다. (생성자 첫 줄) |
| 배열과 문자열 + | - 배열은 생성 후 사용하며 `배열.length`로 크기를 얻는다. (length 메서드 아님)<br>- 문자열에 `+`를 적용하면 문자열 연결이다. (숫자+문자 주의) |
| static과 초기화 | - 모든 객체가 공유하는 데이터는 static 필드로 둔다. (클래스 소속)<br>- 필드 선언문, 초기화 블록, 생성자로 초깃값을 지정한다. (실행 순서 주의) |
| 오버라이딩 vs 오버로딩 | - 부모 메서드 몸체를 자식 클래스에서 다시 정의하는 것이다. (상속 필요)<br>- 같은 이름의 메서드를 매개변수 목록으로 구별한다. (반환형만 다르면 X) |
| this vs super | - this는 현재 객체, super는 부모 객체 쪽을 가리킨다. (생성자 호출도 가능) |
| 인터페이스 vs 추상 클래스 | - 인터페이스는 추상 메서드 중심이며 default/static 메서드는 몸체가 있다. (Java 8 이후)<br>- 의미적으로 유사한 클래스 묶음은 추상 클래스를 쓴다. (일부 구현 가능)<br>- 기능적으로 유사한 클래스 묶음은 인터페이스를 쓴다. (다중 구현 가능) |
| enum | - 열거형 상수값은 하나의 객체처럼 취급된다. (정해진 상수 집합) |
| 다형성 | - 다형성은 오버로딩/오버라이딩/상속/형변환/동적 바인딩으로 구현된다. (부모 타입 참조) |
| 익명 클래스 | - 익명 클래스는 이름 없이 일회성 상속/구현 객체를 만든다. (한 번 쓰는 클래스) |
| 제네릭 | - 제네릭 타입은 자료형을 매개변수로 가지는 클래스/인터페이스다. (컴파일 시 타입검사)<br>- 타입 파라미터는 필드형, 반환형, 인자형으로 쓰일 수 있다. (`<T>`)<br>- 제네릭 메서드는 자료형을 매개변수로 가지는 메서드다. (메서드 자체 T) |
| 람다 | - 람다식은 함수형 인터페이스 객체 생성을 간결하게 한다. (추상 메서드 1개)<br>- 람다식의 결과 타입에 해당하는 인터페이스가 타깃 타입이다. (문맥으로 결정) |
| 패키지와 import | - 패키지는 관련 클래스와 인터페이스의 계층적 묶음이다. (디렉터리 구조)<br>- 다른 패키지 클래스를 편하게 쓰려면 import를 사용한다.<br>- java.lang 패키지는 import 없이 사용할 수 있다. (자동 import)<br>- 필요한 클래스/패키지는 CLASSPATH 경로에서 찾을 수 있어야 한다. (실행 환경) |
| 예외 처리 | - 예외는 실행 중 정상 흐름을 벗어난 비정상 상황이다. (Error와 구분)<br>- checked Exception은 반드시 처리하거나 throws로 선언해야 한다. (컴파일러 검사)<br>- 직접 처리는 try-catch, 전파는 throws다. (throw는 발생) |
| Object 클래스 | - 모든 클래스는 Object를 상속한다. (java.lang.Object)<br>- toString()과 equals()는 Object에 정의되어 있고 재정의될 수 있다. (기본 동작은 단순 비교/문자열화) |
| 문자열 클래스 | - String은 immutable이라 생성 후 내용 변경이 불가능하다. (반복 변경 비효율)<br>- 자주 변경되는 문자열은 StringBuffer나 StringBuilder가 효율적이다. (Buffer 동기화 O)<br>- 기본형 값을 객체로 다루기 위해 포장 클래스가 있다. (int→Integer) |
| 표준 입출력 | - System은 in, out, err 표준 입출력 객체를 제공한다. (표준 입력/출력/오류) |
| 스트림 I/O | - 스트림은 생산자/소비자 종류와 무관하게 입출력을 수행하게 한다. (입출력 통로)<br>- Buffered 계열은 보조 스트림으로 버퍼링 성능을 제공한다. (기본 스트림 감쌈)<br>- InputStreamReader는 바이트 입력을 문자 입력으로 변환한다. (bridge stream) |
| 파일 I/O | - File은 파일/디렉터리를 표현하지만 입출력 메서드는 제공하지 않는다. (경로 조작)<br>- RandomAccessFile은 파일 포인터 위치에서 임의 읽기/쓰기가 가능하다. (순차만 아님) |
| NIO | - java.nio는 java.io를 개선한 새 입출력 패키지다. (New IO)<br>- Path는 File보다 풍부한 파일 경로 기능을 제공한다. (java.nio.file)<br>- Files는 파일/디렉터리 조작과 읽기·쓰기 static 메서드를 제공한다. (유틸 클래스)<br>- 채널 입출력에서 버퍼는 기본형 데이터 보관소다. (버퍼 단위 IO)<br>- FileChannel은 입출력 모두 제공하고 기본 버퍼링을 사용한다. (멀티스레드 안전 설계)<br>- WatchService는 디렉터리 이벤트를 감시한다. (변경 감시) |
| 컬렉션 (JCF) | - JCF는 컬렉션을 효율적으로 다루기 위한 API 프레임워크다. (Java Collections Framework)<br>- 컬렉션은 여러 원소를 저장·관리하는 객체다. (Map은 별도 계열)<br>- Set은 순서 의미가 없고 중복을 허용하지 않는다. (중복 제거)<br>- List는 순서 의미가 있고 중복을 허용한다. (인덱스)<br>- Queue는 순서 의미가 있고 FIFO 방식으로 자료를 관리한다. (offer/poll)<br>- Map은 key-value 쌍을 관리한다. (키 중복 X)<br>- LinkedList는 List와 Queue를 모두 구현하고 스택 메서드도 제공한다. (다용도) |
| 스트림 처리 | - 내부 반복은 반복 코드를 직접 쓰지 않고 처리 코드만 람다로 전달한다. (forEach)<br>- forEach는 원소를 외부로 꺼내지 않고 내부에서 탐색한다. (람다와 사용)<br>- 필터링은 중복 제거 또는 조건 만족 원소만 걸러내는 중간 연산이다. (distinct/filter)<br>- 매핑은 원소를 다른 원소로 변환하는 중간 연산이다. (map)<br>- 매칭은 조건 만족 여부를 확인하는 최종 연산이다. (any/all/noneMatch)<br>- 수집은 결과 원소를 List/Set/Map 등으로 취합하는 최종 연산이다. (collect) |
| 스레드 | - 스레드 실행 코드는 `public void run()`에 정의한다. (start가 run 호출)<br>- 스레드는 Thread 상속 또는 Runnable 구현으로 만든다. (Runnable 선호)<br>- start()는 새 스레드를 시작하고 run()을 실행하게 한다. (run 직접 호출 X)<br>- start, join, interrupt, yield, sleep, wait, notify를 구분한다. (wait/notify는 Object)<br>- 스레드는 Startable, Runnable, Running, Not Running 등의 상태를 거친다. (상태 전이)<br>- synchronized는 공유 객체 접근을 한 번에 한 스레드로 제한한다. (데이터 무결성) |
| JDBC | - JDBC는 Java에서 관계형 DB와 연동하는 표준 API다. (java.sql)<br>- MariaDB는 MySQL 호환 오픈소스 RDBMS다. (드라이버 필요)<br>- JDBC 사용에는 DB용 JDBC 드라이버 jar를 Classpath에 추가해야 한다. (.jar)<br>- DBMS 연결은 java.sql.Connection 객체로 표현한다. (연결 객체)<br>- SQL 실행은 execute(), executeQuery(), executeUpdate()를 사용한다. (결과별 구분)<br>- SELECT 실행은 executeQuery()이고 결과는 ResultSet이다. (조회 전용)<br>- INSERT/UPDATE/DELETE는 executeUpdate()를 사용한다. (변경 행 수) |
| 라이브러리 · 모듈 | - 라이브러리는 자주 쓰는 클래스/인터페이스를 컴파일된 형태로 제공한 것이다. (재사용 코드)<br>- Java 라이브러리는 .class 파일을 묶은 .jar 형태다. (압축 파일)<br>- 모듈은 라이브러리의 업그레이드로 패키지 단위 접근성을 설정한다. (Java 9)<br>- 라이브러리는 Classpath, 모듈은 Modulepath에 추가한다. (경로 구분)<br>- module-info.java에서 exports와 requires로 의존관계를 설정한다. (모듈 선언)<br>- java.base는 Java 표준 모듈 중 가장 기본 모듈이다. (자동 의존) |

#### 키워드 압축 카드

| 주제 | 내용 |
|---|---|
| 한 줄 공식 | - Java = **클래스 기반 + 객체지향 + 바이트코드 + JVM + 플랫폼 독립**.<br>- Java 플랫폼 = **JVM + Java API**.<br>- 프로그램 기본 단위 = **클래스**, 객체 = **클래스의 인스턴스**. |
| 문법 핵심 | - `main` 형식 = `public static void main(String[] args)`.<br>- 기본형 8개 = `byte short int long float double char boolean`.<br>- 참조형 = **클래스, 배열, 인터페이스**. 값이 아니라 **주소/참조값** 저장.<br>- 묵시적 형변환 = 손실 없음, 자동. 명시적 형변환 = 캐스팅 필요.<br>- 점프문 = `break`, `continue`, `return`. |
| 클래스/상속 | - 생성자 = **클래스 이름과 같음 + 반환형 없음**.<br>- 오버로딩 = 같은 이름, **매개변수 다름**.<br>- 오버라이딩 = 상속받은 메서드 **재정의**.<br>- `static` = 클래스 소속, 객체 없이 접근 가능.<br>- `final` = 변경/상속/재정의 제한.<br>- 추상 클래스 = 미완성 설계도. 인터페이스 = 구현 약속. |
| 제네릭/람다/컬렉션 | - 제네릭 = 타입을 나중에 지정, 형변환 감소.<br>- 람다 = 함수형 인터페이스의 구현을 간결하게 표현.<br>- `List` = 순서 O, 중복 O.<br>- `Set` = 중복 X.<br>- `Map` = key-value.<br>- `Queue` = `offer()` 추가, `poll()` 삭제. |
| 입출력/예외/JDBC | - 예외처리 = `try-catch-finally`, 직접 던짐 = `throw`, 선언 = `throws`.<br>- 바이트 스트림 = `InputStream/OutputStream`.<br>- 문자 스트림 = `Reader/Writer`.<br>- JDBC 흐름 = **Driver → Connection → Statement/PreparedStatement → ResultSet → close**.<br>- 모듈에서 JDBC 사용 = `requires java.sql;`. |
| 헷갈리는 짝 | - `String` = immutable. 문자열 누적 반복에 불리.<br>- `StringBuffer` = 동기화 O, 느릴 수 있음.<br>- `StringBuilder` = 동기화 X, 단일 스레드에서 빠름.<br>- `ArrayList` = 검색/순차 접근 유리.<br>- `LinkedList` = 중간 삽입/삭제 유리. |

#### 빈칸 테스트

1. Java 플랫폼은 (     ) + (     )로 구성된다.
2. Java 소스는 컴파일 후 (     )가 되고, (     )에서 실행된다.
3. Java 프로그램의 기본 구성 단위는 (     )다.
4. 변수 4종은 (     ), (     ), (     ), (     )이다.
5. 기본형 8개는 (     )이다.
6. 참조형 변수에는 객체 자체가 아니라 (     )이 저장된다.
7. main의 명령행 인자는 (     )로 전달된다.
8. 최상위 클래스 접근 제어자는 (     ) 또는 (     )만 가능하다.
9. 접근 제어자 생략은 같은 (     )에서 접근 가능하다.
10. 생성자는 클래스 이름과 (     )고 (     )이 없다.
11. 배열 크기는 (     )로 확인한다.
12. static 필드는 모든 객체가 (     )하는 데이터다.
13. 오버로딩은 (     ) 목록으로 구별한다.
14. 오버라이딩은 부모 메서드를 자식에서 (     )하는 것이다.
15. this()는 (     ) 생성자, super()는 (     ) 생성자를 호출한다.
16. 의미적으로 유사한 클래스는 (     ), 기능적으로 유사한 클래스는 (     )로 묶는다.
17. enum의 각 상수값은 하나의 (     )와 같다.
18. 제네릭은 (     )을 매개변수로 가진다.
19. 람다식의 대상 인터페이스를 (     ) 타입이라고 한다.
20. 패키지는 관련 (     )와 (     )의 묶음이다.
21. checked Exception은 반드시 (     )하거나 (     )해야 한다.
22. java.lang 패키지는 import 없이 (     )된다.
23. String은 (     ) 클래스라 내용 변경이 불가능하다.
24. 기본형을 객체로 다루기 위한 클래스는 (     ) 클래스다.
25. Buffered 계열은 (     ) 스트림이며 성능을 높인다.
26. InputStreamReader는 (     ) 입력을 (     ) 입력으로 변환한다.
27. File 클래스는 파일/디렉터리를 표현하지만 (     ) 메서드는 제공하지 않는다.
28. NIO의 Path는 java.io의 (     )보다 풍부한 기능을 제공한다.
29. Files 클래스는 파일 조작과 읽기·쓰기 (     ) 메서드를 제공한다.
30. WatchService는 (     ) 이벤트를 감시한다.
31. JCF는 (     )을 효율적으로 다루기 위한 API 프레임워크다.
32. Set은 중복을 (     ), List는 순서와 중복을 (     ).
33. Queue는 (     ) 방식이다.
34. Map은 (     )와 (     )의 쌍을 관리한다.
35. Stream의 filter는 (     ), map은 (     ), collect는 (     ) 연산이다.
36. 스레드 실행 코드는 (     ) 메서드에 정의한다.
37. 새 스레드 시작은 run()이 아니라 (     )로 한다.
38. synchronized는 공유 객체 접근을 한 번에 (     ) 스레드로 제한한다.
39. JDBC는 Java에서 (     ) DB와 연동하는 표준 API다.
40. SELECT 실행은 (     ), 결과는 (     )이다.
41. Java 라이브러리는 .class 파일을 묶은 (     ) 형태다.
42. 모듈 의존관계는 (     ) 파일에 (     )와 (     )로 설정한다.
43. java.base는 Java 표준 모듈 중 가장 (     ) 모듈이다.

<details markdown="1">
<summary>정답 보기</summary>

1. JVM / Java API
2. 바이트코드 / JVM
3. 클래스
4. 인스턴스 / 클래스 / 지역 / 파라미터
5. byte / short / int / long / float / double / char / boolean
6. 참조값
7. `String[] args`
8. `public` / 생략(package-private)
9. 같은 패키지
10. 같다 / 반환형
11. `배열.length`
12. 공유
13. 매개변수
14. 재정의
15. 같은 클래스 / 부모
16. 추상 클래스 / 인터페이스
17. 객체
18. 자료형(타입)
19. 타깃(target)
20. 클래스 / 인터페이스
21. 처리(try-catch) / throws 선언
22. 자동 import
23. immutable
24. Wrapper(포장)
25. 보조
26. 바이트 / 문자
27. 입출력
28. `File`
29. static
30. 디렉터리
31. 컬렉션
32. 허용하지 않음(중복 X) / 허용(순서·중복 모두 O)
33. FIFO
34. key / value
35. 중간 / 중간 / 최종
36. `run()`
37. `start()`
38. 하나의(한)
39. 관계형
40. `executeQuery()` / `ResultSet`
41. `.jar`
42. `module-info.java` / `exports` / `requires`
43. 기본(base)

</details>

#### 연습문제

> 지문:
> 똑같은 바이트코드가 Java 플랫폼이 설치된 다양한 하드웨어와 운영체제에서 수정없이 실행될 수 있다.
**Q1. Java 언어의 특징 중에 다음 내용이 의미하는 것은?**
1. 엄격한 자료형의 검사
2. 플랫폼에 독립적
3. 예외처리 기능의 지원
4. 멀티 스레딩의 지원

```java
public class A { }
class B { }
```

**Q2. 다음 파일의 이름은 A.java 이다. 이 파일을 컴파일할 때 결과로 만들어지는 것을 정확히 설명한 것은?**
1. A.class만 생성된다.
2. B.class만 생성된다.
3. A.class와 B.class가 생성된다.
4. 오류가 있어 컴파일되지 않는다.

**Q3. Java 언어와 객체지향 프로그래밍에 관한 서술형 문제이다.**

**Q4. 다음 중 클래스 이름에 해당하지 않는 것은?**
1. Integer
2. String
3. System
4. boolean

**Q5. 다음 정수 리터럴 중 값이 다른 하나는 무엇인가?**
1. 10
2. 00001010
3. 0x0A
4. 0b0000_1010

**Q6. 위의 for문을 향상된 for문을 이용해 다시 작성하여라.**

**Q7. 다음 중 문법적으로 올바른 문장은 무엇인가?**
1. int a[10] = new int[ ];
2. int b[ ] = new int(10);
3.
   ```java
   int[ ][ ] c = new int[5][ ];
   ```
4.
   ```java
   int[5] d = {1, 2, 3, 4, 5};
   ```

**Q8. int형 변수 i와 j의 값을 각각 출력하기 위해 적당한 출력문은 무엇인가?**
1.
   ```java
   System.out.println( i , j );
   ```
2.
   ```java
   System.out.println( i + " " + j );
   ```
3.
   ```java
   System.out.println( i + j );
   ```
4.
   ```java
   System.out.println( i + ‘=’ + j );
   ```

**Q9. 퍼블릭 Alpha 클래스에서 protected 데이터 필드가 정의되었다고 가정할 때, 아래 4개의 클래스 중에서 이 데이터 필드를 사용할 수 없는 클래스는 무엇인가?**
1. Alpha
2. AlphaSub
3. Beta
4. Gamma

**Q10. 키워드 final에 관한 설명으로 틀린 것은?**
1.
   ```java
   final 클래스의 자식 클래스를 정의할 수 없다.
   ```
2. 부모 클래스의 final 메소드는 자식 클래스로 상속될 때 재정의될 수 없다.
3.
   ```java
   final 변수는 상수로 사용된다.
   ```
4.
   ```java
   final 클래스의 객체를 생성할 수 없다.
   ```

**Q11. Circle 클래스에서 원주율 PI를 상수로 선언하기 위해 ㉠에 들어갈 적당한 내용은 무엇인가?**
1.
   ```java
   double PI = 3.14;
   ```
2.
   ```java
   final double PI = 3.14;
   ```
3.
   ```java
   const double PI = 3.14;
   ```
4.
   ```java
   static final double PI = 3.14;
   ```

**Q12. Circle 클래스의 생성자에서 밑줄 친 ㉡에 들어갈 적당한 내용을 작성하시오**

**Q13. 다음 프로그램을 실행했을 때 예상되는 출력은?**
1. A
2. B
3. 컴파일 오류
4. 실행 오류

**Q14. 밑줄 친 ㉠, ㉡에 들어갈 키워드는 순서대로 무엇인가?**
1. extends, extends
2. extends, implements
3. implements, implements
4. implements, extends

**Q15. 밑줄 친 부분의 의미를 정확히 설명하시오. 단, CSuper는 클래스 이름이다.**

**Q16. 다음과 같은 제네릭 클래스가 있다고 가정하자. 보기에서 문법적으로 오류가 있는 것은?**
1.
   ```java
   Data<int> d = new Data<>( );
   ```
2.
   ```java
   Data<Integer> d = new Data<>( );
   ```
3.
   ```java
   Data<String> d = new Data<String>( );
   ```
4.
   ```java
   Data d = new Data( );
   ```

**Q17. 다음과 같은 인터페이스가 있다고 가정할 때, 보기에서 람다식 사용이 잘못된 것은?**
1.
   ```java
   Addable ad = (int a, int b) -> { return (a + b); };
   ```
2.
   ```java
   Addable ad = (int a, int b) -> a + b;
   ```
3.
   ```java
   Addable ad = (a, b) -> return (a + b);
   ```
4.
   ```java
   Addable ad = (a, b) -> (a + b);
   ```

**Q18. 제네릭 타입 T를 반환하는 `get()` 메소드 선언을 작성하시오.**

**Q19. Client 클래스를 myprogram.game 패키지에 위치시키려고 한다. Client 클래스를 정의하는 소스 파일의 맨 위에 포함시켜야 코드는 무엇인가?**
1.
   ```java
   package myprogram.game;
   ```
2.
   ```java
   package myprogram.game.Client;
   ```
3.
   ```java
   import myprogram.game;
   ```
4.
   ```java
   import myprogram.game.Client;
   ```

**Q20. 밑줄 부분에 들어가야 할 내용은 무엇인가?**
1. throw IOException
2. throws IOException
3. throw FileNotFoundException
4. throws FileNotFoundException

**Q21. `Scanner` 클래스를 사용하기 위해 필요한 import 문을 작성하시오.**

**Q22. 다음 프로그램의 출력 결과는 무엇인가?**
1. Jovo
2. Java
3. JovoExam
4. JavaExam

**Q23. Object 클래스와 String 클래스에 대한 설명이다. 잘못된 것은 무엇인가?**
1. 모든 클래스는 묵시적으로 Object 클래스를 상속받는다.
2. Object 클래스에 toString()과 equals() 메소드가 정의되어 있다.
3. String 클래스에 toString()과 equals() 메소드가 재정의되어 있다.
4. String 클래스는 표준 입출력 스트림을 위한 static 필드를 제공한다.

**Q24. 문자열 연결을 반복할 때 `String`보다 `StringBuilder` 또는 `StringBuffer`가 더 효율적인 이유와, 두 클래스의 성능 차이가 생기는 이유를 설명하시오.**

**Q25. 입력 스트림은 기본 스트림과 보조 스트림으로 나뉜다. 다음 중 기본 스트림에 해당하지 않는 것은?**
1. StringReader
2. FileReader
3. ByteArrayInputStream
4. BufferedReader

**Q26. BufferedReader 클래스에 관한 설명으로 틀린 것은 무엇인가?**
1. Reader의 자식 클래스이다.
2.
   ```java
   read()와 readLine() 등 다양한 입력 메소드를 제공한다.
   ```
3. 바이트 단위의 입력 기능을 제공한다.
4. 입력 과정에 버퍼링 기능을 제공한다.

**Q27. 키보드에서 한글을 입력받기 위해서 바이트 단위의 표준 입력 스트림(System.in)을 캐릭터 스트림으로 변환하는 것이 필요하다. 다음 밑줄 부분에 공통으로 들어갈 클래스 이름은 무엇인가?**

**Q28. Path 인터페이스에 관한 설명이다. 잘못된 것은?**
1. java.io.File 클래스를 대체할 수 있다.
2. 파일시스템에 존재하는 파일 또는 디렉터리의 경로를 표현한다.
3. 경로의 생성, 경로의 조작/비교, 경로의 요소를 조회하는 기능을 제공한다.
4. 파일 내용의 읽기와 쓰기 기능을 제공한다.

**Q29. FileChannel 클래스에 관한 설명으로 틀린 것은 무엇인가?**
1. java.io 패키지의 파일 관련 스트림 클래스를 대체하기 위한 클래스이다.
2.
   ```java
   FileChannel.open(path)으로 객체 생성을 하면 해당 파일을 읽기용으로 열게 된다.
   ```
3. 파일 입력을 위해 FileChannelReader, 파일 출력을 위해 FileChannelWriter를 사용한다.
4. 멀티 스레드 환경에서도 안전하게 사용할 수 있게 설계되었다.

**Q30. `WatchKey` 객체가 파일 시스템 감시에서 어떤 상태 정보를 가지는지 설명하시오.**

**Q31. ArrayList 클래스에 관한 설명으로 적당하지 않은 것은?**
1. List 인터페이스를 구현한 클래스이다.
2. 여러 원소를 저장하기 위해 내부적으로 배열을 사용한다.
3. 원소의 순서가 의미를 가진다.
4. 같은 자료를 중복으로 저장할 수 없다.

**Q32. (key, value) 형태의 원소로 구성되는 자료 묶음을 다루기 위한 인터페이스나 클래스가 아닌 것은?**
1. HashMap
2. HashSet
3. Hashtable
4. Map

**Q33. Queue에서 원소를 추가하고 삭제할 때 사용할 수 있는 메소드를 각각 작성하시오.**

**Q34. 주어진 배열을 스트림으로 만들려고 한다. 밑줄 부분에 들어갈 적당한 내용은?**
1.
   ```java
   IntStream.range(numbers)
   ```
2.
   ```java
   Arrays.stream(numbers)
   ```
3.
   ```java
   numbers.stream( )
   ```
4.
   ```java
   numbers.getStream( )
   ```

**Q35. 주어진 문자열 배열에서 길이가 6 이상인 단어를 대문자로 변환한 후 정렬하여 출력하려고 한다. 밑줄 부분에 들어갈 메소드는 무엇인가?**
1. peek
2. map
3. match
4. filter

**Q36. 스트림의 중간연산과 종료연산의 차이를 설명하시오.**

**Q37. 스레드 동기화와 관련된 다음 설명 중 올바른 것은?**
1. 메소드 interrupt()는 현재 스레드가 인터럽트를 받을 적이 있는지 검사한다.
2. 메소드 notify()는 현재 실행 중인 스레드를 정해진 시간 동안 중지시킨다.
3. 메소드 wait()는 대기 상태의 스레드들 가운데 하나를 기다리게 한다.
4. 메소드 join()은 this 스레드가 종료될 때까지 현재 스레드가 기다린다.

**Q38. 스레드 동기화의 의미를 가장 잘 설명한 것은?**
1. 메인 스레드가 가장 마지막에 종료되는 것을 보장하는 것
2. 공유 객체에 여러 스레드들이 동시 접근할 수 있게 하는 것
3. 한순간에 한 스레드만 공유 객체에 접근할 수 있게 하는 것
4. 여러 개의 스레드들이 순서대로 하나씩 수행되게 하는 것

> 지문:
> 여러 스레드가 공유 객체를 사용할 때, 한 스레드가 공유 객체의 메소드를 실행 중이라면 다른 스레드가 동일 객체에 접근할 수 없다.
**Q39. 밑줄 부분에 들어갈 스레드 동기화를 위한 자바 키워드는 무엇인가?**

**Q40. JDBC 프로그래밍에 사용되는 클래스나 인터페이스가 아닌 것은?**
1. Connection
2. DriverManager
3. Statement
4. Runnable

**Q41. PreparedStatement 객체에 대한 설명으로 잘못된 것은?**
1. PreparedStatement는 Statement의 부모 인터페이스이다.
2. 객체를 생성할 때 SQL 구문을 지정해야 한다.
3. 같은 SQL 구문을 여러 번 실행할 때 효율적으로 활용될 수 있다.
4. 매개 변수를 가지는 SQL 구문을 저장할 수 있다.

**Q42. JDBC에서 SQL 조회 결과를 행 단위로 저장하고 처리하는 객체는 무엇인가?**

**Q43. .jar 파일 형식으로 배포된 라이브러리를 사용하고자 할 때, 이러한 .jar 파일을 어떤 환경 변수에 추가해야 하는가?**
1. Classpath
2. Modulepath
3. Javadoc
4. Jarpath

**Q44. Java의 표준 모듈 중 requires 키워드로 사용 선언을 하지 않아도 사용이 가능한 모듈은 무엇인가?**
1. jdk.base
2. jdk.lang
3. java.lang
4. java.base

**Q45. java.sql 모듈에서 제공하는 java.sql 패키지가 있으며, 여기에 포함된 클래스(또는 인터페이스)를 사용하는 모듈 프로젝트가 있을 때, module-info.java 파일에서 아래 밑줄 부분에 들어가야 할 내용은?**

#### 연습문제 정답

1. 2
2. 3
3. 서술형/공식 정답 미제공
4. 4
5. 2
6. (답)
7. 3
8. 2
9. 4
10. 4
11. 4
12. this.radius = radius;
13. 2
14. 2
15. CSuper 클래스를 상속받는 익명 클래스를 정의하고, 동시에 익명 클래스의 객체를 생성한다.
16. 1
17. 3
18. T get( )
19. 1
20. 2
21. import java.util.Scanner; 또는 import java.util.*;
22. 1
23. 4
24. String 클래스는 immutable 클래스여서 반복이 진행될수록 계속해서 기존 문자열은 버려지고 새로운 문자열이 새롭게 만들어지기 때문이다(버려지거나 만들어지는 문자열의 길이도 점점 커진다). StringBuffer 클래스를 사용한 경우가 StringBuilder 클래스를 사용한 경우보다 시간이 더 걸리는 이유는 동시성 제어를 고려하여 메소드가 구현되었기 때문이다.
25. 4
26. 3
27. InputStreamReader
28. 4
29. 3
30. WatchKey는 등록된 디렉터리에 어떤 관심 이벤트가 등록되어 있으며, 실제 어떤 이벤트가 일어났는지에 관한 상태 정보를 가지고 있다.
31. 4
32. 2
33. 추가 시 boolean offer(E), 삭제 시 E poll( )을 사용함
   - 해설: (또는 추가 시 boolean add(E), 삭제 시 E remove( )를 사용할 수 있음)
34. 2
35. 4
36. 중간연산은 스트림을 변환하거나 필터링 하는 등의 작업을 수행하며, 다음 단계 처리를 위해 새로운 스트림을 리턴하는데, 체인 형태로 연속해 여러 번 호출될 수 있다. 종료연산은 스트림의 원소를 이용해 최종 결과를 만들어 리턴한다.
37. 4
38. 3
39. synchronized
40. 4
41. 1
42. ResultSet
43. 1
44. 4
45. requires java.sql;

### 파이썬프로그래밍기초

> 우선순위: 제어구조/함수/컬렉션/객체/모듈/파일 처리 문법을 코드 결과 예측 중심으로 훈련

#### 핵심 암기표

| 주제 | 외울 문장 |
|---|---|
| Python 특징 | - Python은 인터프리터, 동적 타입, 들여쓰기 블록 언어다. (세미콜론 중심 X) |
| 변수와 자료형 | - 변수는 값을 가리키는 이름이다. (타입 선언 없음)<br>- 주요 자료형은 int, float, str, bool, list, tuple, dict, set이다. (컬렉션 구분) |
| 입출력 | - input은 문자열을 입력받는다. (숫자 변환 필요)<br>- print는 값을 화면에 출력한다. (sep/end 가능) |
| 대입 vs 비교 | - `=`는 대입, `==`는 비교다. (시험 자주 나옴) |
| 문자열 | - 문자열 인덱스는 0부터 시작한다. (음수 인덱스 가능)<br>- 슬라이싱은 end를 포함하지 않는다. (끝 미포함) |
| 조건과 반복 | - 조건문은 if, elif, else로 분기한다. (elif 오타 주의)<br>- for는 정해진 반복, while은 조건 반복에 주로 쓴다. (무한루프 주의)<br>- range(n)은 0부터 n-1까지다. (끝 미포함)<br>- break는 반복문을 종료한다. (전체 반복 종료)<br>- continue는 이번 반복만 건너뛴다. (다음 반복 진행) |
| 함수 | - 함수는 `def name(params):`로 정의한다. (들여쓰기 필수)<br>- return은 값을 반환하고 함수를 끝낸다. (print와 구분)<br>- 지역변수는 함수 안에서만 유효하다. (밖에서 접근 X)<br>- 전역변수 변경은 global 선언이 필요하다. (읽기와 변경 구분) |
| 컬렉션 | - list는 순서가 있고 변경 가능하다. (mutable)<br>- tuple은 순서가 있고 변경 불가능하다. (immutable)<br>- dict는 key-value 구조다. (key로 접근)<br>- set은 중복을 허용하지 않는다. (순서 의미 약함) |
| 클래스 | - 클래스는 객체의 설계도다. (객체지향)<br>- `__init__`은 객체 생성 시 초기화 메서드다. (언더바 2개)<br>- self는 객체 자기 자신을 가리킨다. (첫 매개변수) |
| 모듈과 파일 | - import는 모듈을 가져온다. (별칭 as 가능)<br>- 파일은 `with open(...) as f`로 열면 자동으로 닫힌다. (close 생략 가능) |

#### 키워드 압축 카드

| 주제 | 내용 |
|---|---|
| 한 줄 공식 | - Python = **인터프리터 + 동적 타입 + 들여쓰기 블록 + 객체지향 지원**.<br>- 시험은 “이 코드의 결과는?” 감각이 중요. |
| 기초 | - 변수는 값을 가리키는 이름.<br>- 자료형 = `int`, `float`, `str`, `bool`, `list`, `tuple`, `dict`, `set`.<br>- 문자열 인덱스는 0부터.<br>- 슬라이싱 = `[start:end:step]`, end는 미포함.<br>- 입력 = `input()`, 출력 = `print()`. |
| 제어구조 | - 조건문 = `if / elif / else`.<br>- 반복문 = `for`, `while`.<br>- `break` = 반복 종료.<br>- `continue` = 이번 반복 건너뜀.<br>- `range(n)` = 0부터 n-1.<br>- `range(a,b)` = a부터 b-1. |
| 함수 | - 함수 정의 = `def name(params):`.<br>- 반환 = `return`.<br>- 기본값 매개변수는 뒤쪽에 둠.<br>- 지역변수 = 함수 내부.<br>- 전역변수 변경은 `global` 필요. |
| 컬렉션 | - list = 순서 O, 변경 O.<br>- tuple = 순서 O, 변경 X.<br>- dict = key-value.<br>- set = 중복 X, 순서 의미 약함.<br>- list append = 끝에 추가.<br>- dict 접근 = `d[key]`, 안전 접근 = `d.get(key)`. |
| 객체/모듈/파일 | - 클래스 = 설계도, 객체 = 인스턴스.<br>- 생성자 = `__init__`.<br>- 자기 자신 = `self`.<br>- 모듈 사용 = `import`.<br>- 파일 열기 = `open()`.<br>- 파일은 사용 후 닫거나 `with open(...) as f` 사용. |
| 암기 포인트 | - 들여쓰기 틀리면 문법 오류.<br>- `=`는 대입, `==`는 비교.<br>- 문자열 + 숫자는 바로 더할 수 없음. 형변환 필요.<br>- 리스트는 mutable이라 원본 변경 문제 주의. |

#### 빈칸 테스트

1.
   ```python
   Python은 (     ), (     ), (     ) 블록 언어다.
   ```
2. input은 기본적으로 (     )을 반환한다.
3. `=`는 (     ), `==`는 (     )이다.
4. 슬라이싱 `[start:end]`에서 end는 (     )된다.
5. range(n)은 (     )부터 (     )까지다.
6. break는 (     ), continue는 (     )이다.
7. list는 변경 (     ), tuple은 변경 (     )이다.
8. dict는 (     ), set은 (     ) 구조다.
9. `__init__`은 (     ), self는 (     )이다.

<details markdown="1">
<summary>정답 보기</summary>

1. 인터프리터 / 동적 타입 / 들여쓰기
2. 문자열(str)
3. 대입 / 비교
4. 미포함
5. 0 / n-1
6. 반복문 종료 / 이번 반복만 건너뜀
7. 가능(mutable) / 불가능(immutable)
8. key-value / 중복 없음(unique)
9. 초기화 메서드 / 객체 자기 자신

</details>

---
#### 연습문제

**Q1. 기계를 바꾸지 않고 처리 방법의 교체만으로 무엇이든 할 수 있도록 다음과 같이 입력, 기억 ·저장, 제어, 연산, 출력 장치로 역할을 구분한 구조는?**
1. 폰 노이만 구조
2. 하버드 구조
3. 컴파일러
4. 알고리즘

**Q2. ‘방송통신대학교 컴퓨터과학과의 파이썬 프로그래밍 기초는 전공 과목이다’라고 할 때, ‘전공’이라는 설명은 어떤 유형의 데이터에 속하는가?**
1. 연속적 데이터
2. 범주적 데이터
3. 양적 데이터
4. 반정형 데이터

**Q3. 해석의 모호성을 제거하고 자연어와 유사한 형태의 문법을 처음으로 도입한 프로그래밍 언어는?**
1. 1세대 프로그래밍 언어
2. 2세대 프로그래밍 언어
3. 3세대 프로그래밍 언어
4. 4세대 프로그래밍 언어

**Q4. 다음 중 파이썬의 장점이라고 할 수 없는 것은?**
1. 뛰어난 생산성
2. 빠른 실행 속도
3. 대형 개발자 커뮤니티
4. 직관적 문법

**Q5. 파이썬 프로그램이 플랫폼 독립적으로 실행될 수 있도록 아래 그림의 (가)와 같이 파이썬 인터프리터가 동작하는 과정에서 중간 언어로 만드는 것은?**
1. 바이트 코드
2. 어셈블러 코드
3. 파이썬 소스 코드
4. 기계어 코드

**Q6. 파이썬 프로그래밍 환경 중 오픈소스이며 문서화가 쉽고 전통적인 소스코드-컴파일-실행 방식에서 벗어나 웹 기반 대화형 개발 및 실행 환경을 제공하는 것은?**
1. IDLE
2. VS Code
3. 주피터 노트북
4. 구글 코랩

**Q7. 'Our goal is to predict the future'**
1.
   ```python
   print("Computer science is the best")
   ```

 print("Our goal is to predict the future")
2.
   ```python
   print("Computer science is the best")
   ```

print("Our goal is to predict the future")
3.
   ```python
   print(Computer science is the best)
   ```

print(Our goal is to predict the future)
4. "Computer science is the best"

"Our goal is to predict the future"

**Q8. 다음 중 식별자로 사용할 수 없는 것은?**
1. _pythonic
2. graduate130
3. 44size
4. 부피

```python
apple = 2
banana = 3
cranberry = 1
detox = (banana ** 2 - 4 * apple * cranberry) // apple
print(detox)
```

**Q9. 다음 프로그램의 실행 결과로 올바른 것은?**
1. 0
2. 1
3. 9
4. 3

**Q10. 특정 영역 내의 명령문에 대한 실행 여부를 프로그램 실행 과정 중 조건에 따라 결정하는 구조**
1. 선택 구조
2. 반복 구조
3. 순차 구조
4. 명령 구조

**Q11. number 변수에 저장되어 있는 정수를 사용하여 “상자에사과가n개들어있습니다.”라는 메시지를 출력하려고 한다. 올바른 명령문은? (단, n은 number 변수에 저장된 정수를 의미한다.)**
1.
   ```python
   print("상자에", "사과가", number, "개", "들어있습니다.")
   ```
2.
   ```python
   print("상자에사과가number개들어있습니다.")
   ```
3.
   ```python
   print("상자에""사과가"number"개""들어있습니다.")
   ```
4.
   ```python
   print("상자에", "사과가", number, "개", "들어있습니다.", sep="")
   ```

**Q12. ‘논리적으로 실행 불가능한 명령문 작성 시 발생’ 오류를 무엇이라고 하는가?**
1. 의미 오류
2. 실행 오류
3. 구문 오류
4. 구조 오류

**Q13. 파이썬에서 명령어의 논리적 집합인 명령 블록을 표현하기 위한 방법은?**
1. 불리언식
2. 들여쓰기
3. 콜론(:)
4. 중괄호( { } )

```python
temp = int(input("온도를 입력하세요: "))

(____________________)
    print("겨울입니다.")
```

**Q14. 다음은 온도(temp)가 0 이하일 경우, “겨울입니다.”를 출력하는 프로그램의 일부이다. 밑줄 친 빈 칸에 들어갈 명령문은?**
1.
   ```python
   temp > 0
   ```
2.
   ```python
   temp <= 0
   ```
3. if temp > 0
4. if temp <= 0 :

```python
guess = int(input("온도를 입력하세요: "))

if guess % 3 == 0 (____) guess % 5 == 0 :
    print("3과 5의 공배수입니다.")
else
    print("3과 5의 공배수가 아닙니다.")
```

**Q15. 다음은 사용자가 입력한 수가 3과 5의 공배수일 경우 “3과 5의 공배수입니다”를, 아닐 경우 “3과 5의 공배수가 아닙니다.”를 출력하는 프로그램의 일부이다. 밑줄 친 빈 칸에 들어갈 연산자는?**
1. and
2. or
3. True
4. False

**Q16. 계수 제어 반복 구조에서 특정 반복 횟수와 반복 시 계수의 값을 정하기 위해 사용하는 데이터 타입은?**
1. 변수
2. 정수
3. 시퀀스
4. 식별자

**Q17. 다음과 같이 반복 구조 내부에 또 다른 반복 구조가 포함되어 실행 흐름을 만드는 구조를 무엇이라고 하는가?**
1. 이분 선택 구조
2. 조건 제어 반복 구조
3. 계수 제어 반복 구조
4. 중첩 반복 구조

```python
for i in range(1, 11) :
    print(i, end = " ")
```

**Q18. 다음 코드의 출력값으로 옳은 것은?**
1. 2 3 4 5 6 7 8 9 10 11
2. 2 3 4 5 6 7 8 9 10
3. 1 2 3 4 5 6 7 8 9 10 11
4. 1 2 3 4 5 6 7 8 9 10

**Q19. 다음 중 반환값에 따른 함수의 종류를 구분할 때, 나머지와 다른 하나는?**
1. print
2. input
3. format
4. int

```python
temp, season = 27, 'summer'
season, temp = temp, season
print(season)
```

**Q20. 다음 코드의 실행 결과는?**
1. 'summer'
2. 27
3. season
4. print

```python
x = 1

def updatex():
    x = 2
    x = x + 1

updatex()
print(x)
```

**Q21. 다음 코드의 실행 결과는?**
1. 1
2. 2
3. 3
4. 오류발생

**Q22. 다음 중 key-value의 쌍으로 데이터를 저장하는 매핑 자료형은 무엇인가?**
1. list
2. tuple
3. set
4. dictionary

```python
hei_list = [1, 5, 14, 26, 31]
print(hei_list[:3])
```

**Q23. 다음 코드의 실행 결과로 옳은 것은?**
1.
   ```python
   [1, 5, 14]
   ```
2.
   ```python
   [14, 26, 31]
   ```
3.
   ```python
   [1, 14, 31]
   ```
4.
   ```python
   [31, 26, 14]
   ```

```python
hei_list = [1, 5, 14, 26, 31]
hei_even = [h for h in hei_list if h % 2 == 0]
print(hei_even)
```

**Q24. 다음 코드의 출력값으로 옳은 것은?**
1.
   ```python
   [1, 5, 31]
   ```
2.
   ```python
   [14, 26]
   ```
3.
   ```python
   [1, 14, 31]
   ```
4.
   ```python
   [26, 31]
   ```

**Q25. 다음 중 튜플에 대한 설명으로 옳은 것은?**
1. 원소를 자유롭게 수정할 수 있는 가변 시퀀스
2. 중복을 허용하지 않는 비순서 컬렉션
3. key-value의 쌍으로 데이터를 저장하는 자료형
4. 원소의 순서를 유지하는 불변 시퀀스

```python
msg = "I do love python"
print(msg.split(" "))
```

**Q26. 다음 코드의 출력값으로 옳은 것은?**
1. "I do love python"
2.
   ```python
   ['I', 'do', 'love', 'python']
   ```
3.
   ```python
   ('I', 'do', 'love', 'python')
   ```
4.
   ```python
   ['I do love python']
   ```

**Q27. 다음 중 세트에 사용할 수 없는 연산자는 무엇인가?**
1. in
2. not in
3. +
4.
   ```excel
   ==
   ```

**Q28. 객체의 상태를 초기화하기 위해 사용하는 특수 메소드는 무엇인가?**
1.
   ```python
   __main__
   ```
2.
   ```python
   __init__
   ```
3. class
4. return

```python
class Cone :
    def __init__(self, radius = 20, height = 30):
        self.r = radius
        self.h = height

unitcone = Cone(50, 100)
print(unitcone.h)
```

**Q29. 다음 코드의 출력값으로 옳은 것은?**
1. 20
2. 30
3. 50
4. 100

**Q30. 다음 중 접근자와 변경자에 대한 설명으로 옳은 것은?**
1. 접근자는 데이터를 삭제하고, 변경자는 객체를 생성한다.
2. 접근자는 private 데이터 필드를 반환하고, 변경자는 private 데이터 필드를 설정한다.
3. 접근자와 변경자는 모두 클래스 외부에서만 정의된다.
4. 접근자는 객체를 복사하고, 변경자는 객체를 정렬한다.

**Q31. 파이썬에서 관련된 함수, 변수, 클래스 등을 하나의 파일로 묶어 재사용성과 유지보수성을 높이는 기본 단위는 무엇인가?**
1. 클래스 (Class)
2. 모듈 (Module)
3. 인터페이스 (Interface)
4. 네임스페이스 (Namespace)

**Q32. 특정 모듈(math)에서 특정 함수(sqrt)만을 가져오기 위한 올바른 구문 형식은?**
1.
   ```python
   import math.sqrt
   ```
2.
   ```python
   import sqrt from math
   ```
3. from math import sqrt
4. math import sqrt

**Q33. 코드의 실행을 잠시 3초 동안 멈추고자 할 때 사용하는 time 모듈의 함수는?**
1.
   ```python
   time.stop(3)
   ```
2.
   ```python
   time.pause(3)
   ```
3.
   ```python
   time.wait(3)
   ```
4.
   ```python
   time.sleep(3)
   ```

**Q34. 현재 작업 디렉토리의 위치가 /var/home/user/docs라고 가정하자. 부모 디렉토리에 있는 lib 폴더 내의 config.txt 파일을 상대 경로로 열고자 할 때, 가장 적절한 경로는?**
1.
   ```python
   /var/home/lib/config.txt
   ```
2. ./lib/config.txt
3. ../lib/config.txt
4. ~/lib/config.txt

**Q35. 프로그램이 데이터가 누적되도록 파일을 다루고자 할 때, open() 함수에 지정해야 할 가장 적절한 모드는?**
1. "r"
2. "w"
3. "a"
4. "x"

**Q36. 대용량의 파일 분석 프로그램 작성 시, 다음 중 데이터를 안전하게 처리할 수 있는 방법은?**
1.
   ```python
   read() 메소드를 사용하여 파일 전체를 하나의 문자열 변수에 담아 분석한다.
   ```
2.
   ```python
   readlines() 메소드를 사용하여 파일의 모든 줄을 메모리에 리스트 구조로 한 번에 적재한다.
   ```
3. 한 번에 한 줄(line)씩만 메모리에 읽어 들여 정제 처리를 수행한 후 다음 줄로 넘어가는 반복문(for line in file:)을 구성한다.
4. 데이터를 읽기 전 close() 함수를 선제적으로 호출하여 메모리를 비운다.

**Q37. 원시 데이터가 가치 있는 정보로 변환되기까지 거치는 표준화된 흐름을 뜻하는 것은?**
1. 파이프라인
2. 컴포넌트
3. 인코딩
4. 네임스페이스

**Q38. 텍스트 분석 시 문법적으로는 쓰이나 분석적 의미가 없어 제거하는 단어(예: a, the, of)를 무엇이라 하는가?**
1. 불용어
2. 예약어
3. 식별자
4. 상수

**Q39. 단어와 빈도수를 쌍으로 묶어 카운팅 데이터를 저장하고 관리하기에 가장 적합한 자료구조는?**
1. 리스트
2. 튜플
3. 세트
4. 딕셔너리

**Q40. 대량의 데이터를 수집해 두었다가 특정 시간에 지정된 방식에 따라 한꺼번에 일괄 처리하는 프로그램 구동 방식은 무엇인가?**
1. 이벤트 프로그램
2. 실시간 프로그램
3. 인터랙티브 프로그램
4. 배치 프로그램

**Q41. 이벤트 기반 프로그래밍의 구동 구조에 속하는 구성 요소라고 할 수 없는 것은?**
1. 이벤트 큐
2. 이벤트 루프
3. 컴파일러
4. 이벤트 핸들러

**Q42. 게임 프로그램에서, 게임이 종료될 때까지 '이벤트 검사 → 게임 업데이트 → 화면 생성 및 업데이트'의 과정을 끊임없이 반복하는 구조는?**
1. 게임 루프
2. 이벤트 큐
3. 데이터 파이프라인
4. 컴포넌트 기반 개발

**Q43. 숫자, 문자열, 또 다른 리스트까지 중복에 구애받지 않고 여러 데이터를 순서대로 묶어서 저장할 수 있는 파이썬의 자료구조는?**
1. 정수
2. 리스트
3. 실수
4. 세트

**Q44. 이름이 distance인 2차원 리스트에서 원하는 데이터 위치를 접근하기 위해 사용하는 인덱스 표기법은?**
1.
   ```python
   distance(행, 열)
   ```
2. distance[행, 열]
3. distance[[행][열]]
4. distance[행][열]

**Q45. 2차원 리스트 내부에 있는 모든 항목을 순회하며 값을 출력하려고 할 때, 필수적으로 작성해야 하는 제어 구조는?**
1. 단일 조건문
2. 다중 예외 처리
3. 단일 반복문
4. 중첩 반복문

#### 강의 체크포인트

각 강 멀티미디어 강의 체크포인트(강당 2문항)의 문제·정답·풀이다.

**1강. 컴퓨터의 이해**

**1번. 한 학생이 "컴퓨터는 모든 데이터를 01000001과 같이 2진수로 저장하므로 언제나 같은 의미를 가진다"라고 말했다. 이 설명을 가장 적절하게 평가한 것은?**
1. 맞다. 같은 2진 데이터는 어떤 상황에서도 반드시 같은 숫자값만 의미한다.
2. 틀리다. 같은 2진 데이터라도 숫자, 문자 등 다양한 해석 방식에 따라 다른 의미를 가질 수 있다.
3. 맞다. 컴퓨터 내부에서는 문자와 숫자를 구분하지 않으므로 사람이 해석할 때도 차이가 없다.
4. 틀리다. 2진 데이터는 숫자만 표현할 수 있고 문자는 컴퓨터 내부에서 표현할 수 없다.

**2번. 다음 설명의 문제점으로 가장 적절한 것은? "터치스크린은 화면이니까 출력장치이고, 모니터는 정보 처리와 관련 없다."**
1. 맞다. 화면이 있는 장치는 모두 출력장치이다.
2. 틀리다. 터치스크린은 입력 역할도 할 수 있고, 모니터는 처리 결과를 출력한다.
3. 맞다. 입력장치는 키보드와 마우스뿐이다.
4. 틀리다. 모니터는 보조기억장치이다.

**2강. 파이썬의 이해**

**1번. 다음 중 파이썬을 선택하기에 가장 적절한 상황이라고 할 수 있는 것은?**
1. 초고속 실시간 제어가 가장 중요한 시스템 개발
2. 모바일 앱을 단독으로 완성해야 하는 프로젝트
3. 실행 속도가 최우선인 대규모 계산 전용 프로그램
4. 여러 사람이 빠르게 이해할 수 있는 데이터 분석 프로토타입 제품 개발

**2번. 다음 설명에 대한 판단으로 가장 적절한 것은? "파이썬은 플랫폼 독립적이니까 인터프리터가 없어도 어디서나 실행된다."**
1. 맞다. 파이썬 코드는 운영체제 없이도 실행된다.
2. 맞다. 파이썬은 기계어로 바로 저장된다.
3. 틀리다. 각 운영체제에 맞는 인터프리터가 코드를 해석해야 한다.
4. 틀리다. 파이썬은 Windows에서만 실행된다.

**3강. 파이썬 시작하기**

> 지문:
> 상품 가격: 53000000
> 주문 번호: 53000000
**1번. 쇼핑몰 프로그램에서 위 두 값을 저장하려고 할 때, 가장 적절한 설명은?**
1. 둘 다 숫자로 보이므로 반드시 정수형으로 저장해야 한다.
2. 둘 다 계산할 값이 아니므로 문자열로 저장해야 한다.
3. 가격은 계산 대상이므로 숫자형, 주문 번호는 식별 목적이므로 문자열이 적절하다.
4. 인용 부호를 붙여도 값의 연산 방식은 달라지지 않는다.

```python
amount = "53000000"
print(amount + 1000)
```

**2번. 위 코드가 의도대로 실행되지 않는 가장 적절한 이유는?**
1. 변수 이름 amount가 식별자 규칙에 맞지 않는다.
2.
   ```python
   print() 함수는 표현식을 출력할 수 없다.
   ```
3. 53000000은 너무 큰 숫자라서 계산할 수 없다.
4. amount는 문자열이고 1000은 정수이므로 바로 더할 수 없다.

**4강. 구조적 프로그래밍**

```python
rad = 10
vol = rad * 2
rad = 20
```

**1번. 위 코드에 대한 설명으로 가장 적절한 것은?**
1. vol은 20으로 계산되고, 이후 rad만 20으로 바뀐다.
2. rad는 10과 20을 동시에 저장한다.
3. rad가 20으로 바뀌면 vol도 자동으로 40이 된다.
4.
   ```python
   rad = 20은 rad와 20이 같은지 비교하는 문장이다.
   ```

```python
rad = input("반지름: ")
hei = input("높이: ")
print(rad + hei)
```

**2번. 위 코드 실행 후 사용자가 10과 24를 각각 입력했더니 결과가 1024로 출력되었다. 가장 적절한 원인은?**
1.
   ```python
   print()는 숫자를 출력할 수 없다.
   ```
2. + 연산자는 항상 숫자 덧셈만 수행한다.
3.
   ```python
   input()의 안내 문구 때문에 값이 바뀐다.
   ```
4.
   ```python
   input()은 입력값을 문자열로 반환한다.
   ```

**5강. 선택 구조**

```python
temp = 30
season = "spring"
fruit = "apple"

if temp >= 27 and season == "summer" or fruit == "apple":
    print("선택")
else:
    print("보류")
```

**1번. 위 코드를 실행했을 때 출력은?**
1. 보류
2. 선택
3. 오류 발생
4. 아무것도 출력되지 않음

```python
x = 0

if x != 0 and 10 / x > 2:
    print("A")
else:
    print("B")
```

**2번. 위 코드에 대해 한 학생이 "10 / x 때문에 오류가 난다"고 말했다. 가장 적절한 설명은?**
1. 맞다. and는 항상 양쪽 조건을 모두 평가한다.
2. 맞다. if 조건식에는 나눗셈을 쓸 수 없다.
3. 틀리다. 앞 조건이 거짓이라 뒤 조건은 평가되지 않고 B가 출력된다.
4. 틀리다. 앞 조건이 거짓이어도 A가 출력된다.

**6강. 반복 구조**

```python
count = 1

while count <= 5:
    print(count)
```

**1번. 위 코드는 의도한 대로 종료되지 않는다. 가장 적절한 원인은?**
1. while문에는 숫자 조건을 사용할 수 없다.
2.
   ```python
   print() 때문에 반복문이 종료되지 않는다.
   ```
3. count가 증가하지 않아 조건이 계속 참이다.
4. count의 초기값이 1이라서 오류가 난다.

```python
sum = 0
i = 1

while i <= 4:
    sum += i
    i += 1

print(sum)
```

**2번. 위 코드의 실행 결과는?**
1. 4
2. 6
3. 10
4. 15

**7강. 함수**

**1번. 원뿔의 부피를 여러 반지름과 높이에 대해 계산하려고 할 때, 적절한 함수 설계는?**
1. `def cone_vol(): r = 10; h = 20; print(1 / 3 * 3.14 * r ** 2 * h)` (인자 없이 값 고정)
2.
   ```python
   def cone_vol(r, h): return 1 / 3 * 3.14 * r ** 2 * h
   ```
3. `r = 10; h = 20; print(1 / 3 * 3.14 * r ** 2 * h)` (함수 아님)
4.
   ```python
   def cone_vol(r, h): print("원뿔의 부피")
   ```

```python
def prt_cone_vol(r, h):
    print(r, h)

rad = 30
hei = 50
prt_cone_vol(rad, hei)
```

**2번. 위 코드에 대한 설명으로 가장 적절한 것은?**
1. 이름이 다르므로 rad는 r에 전달될 수 없다.
2. r과 h는 함수 밖에서도 계속 사용할 수 있다.
3. 함수 정의만으로 30, 50이 자동 출력된다.
4. rad의 값은 r에, hei의 값은 h에 전달된다.

**8강. 컬렉션 1**

**1번. 여러 학생의 점수를 순서대로 저장하고, 이후 점수를 추가·삭제·수정하려고 한다. 가장 적절한 자료 구조는?**
1. 세트
2. 문자열 변수
3. 리스트
4. 불리언 타입 변수

```python
hei = [1, 5, 14, 26, 31]
hei.append(27)
x = hei.pop(1)
hei.insert(2, x)
print(hei)
```

**2번. 위 코드의 실행 결과로 올바른 것은?**
1.
   ```python
   [1, 5, 14, 26, 31, 27]
   ```
2.
   ```python
   [1, 14, 5, 26, 31, 27]
   ```
3.
   ```python
   [1, 14, 26, 31, 27, 5]
   ```
4.
   ```python
   [5, 1, 14, 26, 31, 27]
   ```

**9강. 컬렉션 2**

**1번. 회원 가입일을 2026, 5, 8처럼 저장하려고 한다. 가입일은 연도·월·일의 순서가 중요하고, 가입 후 임의로 바뀌면 안 된다. 가장 적절한 자료구조는?**
1. 리스트
2. 튜플
3. 세트
4. 딕셔너리

```python
d1 = {"a": 10, "b": 20, "c": 30, "d": 40}

print(d1["a"])
print(d1[40])
```

**2번. 위 코드에서 오류가 발생하는 이유로 가장 적절한 것은?**
1. 딕셔너리에는 숫자 값을 저장할 수 없기 때문
2. 40은 값이지 키가 아니기 때문
3. 딕셔너리는 인덱스로만 접근해야 하기 때문
4. "a"와 40을 동시에 사용할 수 없기 때문

**10강. 객체지향**

**1번. 도서 대출 프로그램에서 책마다 제목, 저자, 대출 여부를 저장하고, 대출·반납 기능을 제공하려고 한다. 가장 적절한 설계는?**
1. 제목, 저자, 대출 여부를 각각 전역 변수로 둔다.
2. Book 클래스에 책의 상태와 대출·반납 메소드를 함께 둔다.
3. 책 한 권마다 같은 코드를 복사해 작성한다.
4. 대출 여부는 출력문 안에서만 계산한다.

```python
unit = Cone(10, 20)
unit.r = -50
```

**2번. 위 코드 때문에 원뿔의 반지름에 음수가 저장될 수 있다. 가장 적절한 대응은?**
1. 반지름을 아예 저장하지 않고 계산할 때마다 새로 입력받는다.
2. 모든 데이터 필드를 전역 변수로 바꾼다.
3. 음수가 들어와도 계산식에서 그대로 사용한다.
4. 반지름을 숨기고, 양수일 때만 수정하는 변경자 메소드를 둔다.

**11강. 모듈**

**1번. 학생 명단에서 발표자 2명을 중복 없이 뽑으려고 한다. 가장 적절한 코드는?**
1.
   ```python
   import random` / `pick = random.choice(students)
   ```
2.
   ```python
   import random` / `pick = random.sample(students, 2)
   ```
3.
   ```python
   import math` / `pick = math.sample(students, 2)
   ```
4.
   ```python
   students.sample(2)
   ```

```python
import math
print(factorial(5))
```

**2번. 위 코드에서 발생하는 오류 원인으로 가장 적절한 것은?**
1. math 모듈에는 factorial() 함수가 없다.
2.
   ```python
   import math 후에는 math.factorial(5)처럼 호출해야 한다.
   ```
3.
   ```python
   factorial()은 정수가 아니라 문자열만 처리한다.
   ```
4.
   ```python
   print() 안에서는 모듈 함수를 사용할 수 없다.
   ```

**12강. 파일**

**1번. 현재 작업 폴더 안의 data 폴더에 있는 한글 파일 survey.txt를 읽으려 한다. 가장 적절한 코드는?**
1.
   ```python
   fp = open("./data/survey.txt", "r", encoding="utf-8")
   ```
2.
   ```python
   fp = open("./data/survey.txt", "w", encoding="utf-8")
   ```
3.
   ```python
   fp = open("survey.txt", "utf-8", "a",)
   ```
4.
   ```python
   fp = open("C:/", "r", encoding="utf-8")
   ```

```python
fp = open("out.txt", "w")
fp.write("A")
fp.write("B")
fp.close()
```

**2번. 위 코드를 보고 한 학생이 말했다. "write()를 두 번 썼으니 A와 B가 두 줄에 저장된다."**
1. 맞다. write()는 호출할 때마다 자동 줄바꿈한다.
2. 틀리다. 줄바꿈 문자가 없으므로 'AB'로 저장된다.
3. 틀리다. write()는 한 번만 사용할 수 있다.
4. 틀리다. "w" 모드에서는 아무 내용도 저장되지 않는다.

**13강. 실전 프로젝트 1**

**1번. 한 학생이 "후기 분석에서 '그리고', '하지만', '정말'이 많이 나왔으니 가장 중요한 상품 키워드이다."라고 말했다. 이에 대한 가장 적절한 분석은?**
1. 맞다. 많이 등장한 단어는 항상 중요한 키워드이다.
2. 맞다. 전처리는 원문을 훼손하므로 하면 안 된다.
3. 틀리다. 자주 나오지만 분석 목적과 관련이 약한 단어는 불용어로 처리할 수 있다.
4. 틀리다. 빈도 분석에서는 모든 단어를 삭제해야 한다.

```python
text = "Great! great, slow."
stopwords = {"slow"}

clean = text.lower().replace("!", "").replace(",", "").replace(".", "")
words = clean.split()

counts = {}
for w in words:
    if w not in stopwords:
        counts[w] = counts.get(w, 0) + 1

print(counts)
```

**2번. 위 코드의 실행 결과로 가장 적절한 것은?**
1.
   ```python
   {'Great': 1, 'great': 1, 'slow': 1}
   ```
2.
   ```python
   {'great': 2}
   ```
3.
   ```python
   {'great': 1, 'slow': 1}
   ```
4.
   ```python
   {}
   ```

**14강. 실전 프로젝트 2-1**

> 지문:
> - 방향키를 누르면 캐릭터가 이동한다.
> - 장애물에 닿으면 게임이 끝난다.
> - Q를 누르면 사용자가 종료할 수 있다.
**1번. 키보드로 캐릭터를 움직이는 미니 게임을 만들기 전 위 요구를 정리했다. SDLC 관점에서 가장 가까운 단계는?**
1. 계획 단계
2. 분석 단계
3. 구현 단계
4. 유지보수 단계

```python
events = ["RIGHT", "RIGHT", "QUIT", "LEFT"]
x = 0

for e in events:
    if e == "QUIT":
        break
    if e == "RIGHT":
        x += 1
    if e == "LEFT":
        x -= 1

print(x)
```

**2번. 위 코드의 실행 결과로 가장 적절한 것은?**
1. 0
2. 1
3. 2
4. 3

**15강. 실전 프로젝트 2-2**

**1번. 교실 좌석을 5행 6열로 표현하고, 각 좌석에 학생 이름을 붙이려고 한다. 가장 적절한 자료구조는?**
1. 이름 30개를 하나의 문자열로 연결한다.
2. 5개의 리스트를 원소로 갖는 리스트를 사용한다.
3. 세트와 리스트를 사용해 이름을 저장한다.
4. 학생 이름을 하나의 변수에 여러 번 저장한다.

```python
grid = [
    [1, 2, 3],
    [4, 5, 6]
]

print(grid[1, 2])
```

**2번. 위 코드에 대해 한 학생이 "2행 3열 값에 접근하는 올바른 코드"라고 말했다. 이에 대한 가장 적절한 설명은?**
1. 맞다. 2차원 리스트는 grid[행, 열]로 접근한다.
2. 틀리다. 2차원 리스트는 grid[1][2]처럼 두 번 접근해야 한다.
3. 맞다. 리스트는 쉼표로 여러 인덱스를 받을 수 있다.
4. 틀리다. 2차원 리스트는 값을 출력할 수 없다.

---

**정답 및 해설**

**1강 1번 답: 2**
> 해설: 컴퓨터는 숫자만 처리하는 것이 아니라 이미지·문자 등 다양한 데이터를 다룬다. 같은 비트열도 해석 방식에 따라 다른 의미를 가진다.

**1강 2번 답: 2**
> 해설: 터치스크린은 화면 출력과 손동작 입력을 함께 수행하는 입출력 겸용 장치이고, 모니터는 처리 결과를 보여 주는 출력장치다.

**2강 1번 답: 4**
> 해설: 파이썬만으로 완전한 애플리케이션을 개발하기는 어려워 Rust·Go 등을 대안으로 고려하며, 인터프리터 언어라 자바나 C보다 실행 속도가 빠르지 않다. 생산성과 가독성이 높아 데이터 분석·프로토타이핑에 적합하다.

**2강 2번 답: 3**
> 해설: 인터프리터나 컴파일러가 없으면 기계어로 해석할 수 없어 실행되지 않는다. 인터프리터는 운영체제별로 존재해야 한다.

**3강 1번 답: 3**
> 해설: 상품 가격은 여러 값을 합산할 수 있어야 하므로 계산 가능한 숫자형, 주문 번호는 식별용이라 문자열이 적절하다.

**3강 2번 답: 4**
> 해설: amount는 문자열이고 1000은 정수라 바로 더할 수 없다. 더하려면 `int(amount)`로 형변환해야 한다.

**4강 1번 답: 1**
> 해설: 한 변수에 두 값을 동시에 저장할 수 없고, vol은 대입 시점의 값(20)으로 고정된다. 비교는 별도의 연산자가 담당하며 `=`는 할당 연산자다.

**4강 2번 답: 4**
> 해설: input()은 입력값을 문자열로 반환하므로 "10" + "24" = "1024"가 된다. 숫자 덧셈을 하려면 int()로 변환해야 한다.

**5강 1번 답: 2**
> 해설: and가 or보다 우선순위가 높아 `(temp >= 27 and season == "summer")`는 거짓이지만, `or fruit == "apple"`이 참이라 조건 전체가 참이 되어 "선택"이 출력된다.

**5강 2번 답: 3**
> 해설: `x != 0`이 거짓이라 단락 평가(short-circuit)로 `10 / x`는 평가되지 않고 곧장 else의 B가 출력된다.

**6강 1번 답: 3**
> 해설: while 안에서 count를 증가시켜야 한다(`count = count + 1` 또는 `count += 1`). 그렇지 않으면 조건이 계속 참이라 무한 반복된다.

**6강 2번 답: 3**
> 해설: i가 1, 2, 3, 4로 더해져 1 + 2 + 3 + 4 = 10이다.

**7강 1번 답: 2**
> 해설: 여러 반지름·높이에 대해 재사용하려면 매개변수(r, h)를 받아 결과를 return하는 함수가 적절하다.

**7강 2번 답: 4**
> 해설: 인자는 위치 순서대로 전달되어 rad→r, hei→h가 된다. 스코프상 r·h는 함수 밖에서 쓸 수 없고, 정의만으로는 출력되지 않는다.

**8강 1번 답: 3**
> 해설: 세트는 중복을 제거하므로 같은 점수가 사라질 수 있고, 문자열·불리언 변수는 여러 점수를 담기에 부적절하다. 리스트는 순서가 보장되고 중복 허용·원소 수정이 가능하다.

**8강 2번 답: 2**
> 해설: append(27)로 [1, 5, 14, 26, 31, 27], pop(1)로 인덱스 1의 5를 꺼내 [1, 14, 26, 31, 27], insert(2, 5)로 인덱스 2에 5를 넣어 [1, 14, 5, 26, 31, 27]이 된다.

**9강 1번 답: 2**
> 해설: 순서가 보장되는 것은 리스트와 튜플인데, 그중 튜플은 순서를 지키면서 원소 수정이 불가능해 변경되면 안 되는 값에 적합하다.

**9강 2번 답: 2**
> 해설: 딕셔너리는 키로만 접근한다. 40은 값이라 키로 쓸 수 없어 `d1[40]`에서 오류가 난다.

**10강 1번 답: 2**
> 해설: 데이터(상태)와 그 데이터를 다루는 메소드를 하나의 클래스로 묶는 것이 객체지향 설계에 부합한다.

**10강 2번 답: 4**
> 해설: 데이터 필드를 외부에서 직접 바꾸지 못하게 숨기고(은닉), 값을 검증하는 변경자(setter) 메소드를 통해서만 수정하도록 한다.

**11강 1번 답: 2**
> 해설: random.choice는 값을 하나만 고르고, math 모듈에는 sample이 없으며, 리스트에는 sample 메소드가 없다. 중복 없이 여러 개는 `random.sample(대상, 개수)`를 쓴다.

**11강 2번 답: 2**
> 해설: `import math`로 가져오면 `math.factorial(5)`처럼 호출해야 한다. `factorial`만 쓰려면 `from math import factorial` 구문이 필요하다.

**12강 1번 답: 1**
> 해설: 경로는 `./data/survey.txt`, 한글 파일이라 `encoding="utf-8"`, 읽기 목적이라 모드는 `"r"`이다.

**12강 2번 답: 2**
> 해설: write()는 자동으로 줄바꿈하지 않는다. 줄을 나누려면 `\n`을 명시해야 하며, 그렇지 않으면 'AB'로 이어 저장된다.

**13강 1번 답: 3**
> 해설: 자주 나오더라도 분석 목적과 관련이 약한 단어(불용어)는 제거할 수 있다.

**13강 2번 답: 2**
> 해설: lower()로 모두 소문자가 되어 "great great slow"가 되고, 불용어 slow를 제외하면 great가 2번 → {'great': 2}.

**14강 1번 답: 2**
> 해설: 무엇을 어떻게 동작하게 할지 요구사항을 구체적으로 정리하는 것은 분석 단계다. (계획 단계에서는 어떤 게임을 만들지·장단점을 다룬다.)

**14강 2번 답: 3**
> 해설: RIGHT로 x=1, RIGHT로 x=2, QUIT에서 break로 반복이 끝나 LEFT는 처리되지 않는다 → 2.

**15강 1번 답: 2**
> 해설: 5행 6열 격자는 행마다 리스트 하나씩, 그 리스트들을 원소로 갖는 2차원 리스트(리스트의 리스트)로 표현하는 것이 적절하다.

**15강 2번 답: 2**
> 해설: 파이썬 리스트는 `grid[1, 2]` 형태를 지원하지 않는다. 2차원 리스트는 `grid[1][2]`처럼 인덱스를 두 번 적용해 접근한다.

#### 연습문제 정답

1. 1
   - 해설: 자세한 내용은 강의를 참고하세요
2. 2
   - 해설: 자세한 내용은 강의를 참고하세요
3. 3
   - 해설: 자세한 내용은 강의를 참고하세요
4. 2
   - 해설: 강의를 참고하세요
5. 1
   - 해설: 강의를 참고하세요
6. 3
   - 해설: 강의를 참고하세요
7. 2
   - 해설: 강의를 참고하세요
8. 3
   - 해설: 강의와 강의록을 참고하세요
9. 1
   - 해설: 강의를 참고하세요
10. 1
11. 4
   - 해설: 강의를 참고하세요
12. 2
   - 해설: 강의를 참고하세요
13. 2
   - 해설: 자세한 내용은 강의를 참고하세요
14. 4
   - 해설: 자세한 내용은 강의를 참고하세요
15. 1
   - 해설: 자세한 내용은 강의를 참고하세요
16. 3
17. 4
   - 해설: 강의 및 강의록을 참고하세요
18. 4
   - 해설: 강의 및 강의록을 참고하세요
19. 1
20. 2
21. 1
22. 4
23. 1
24. 2
25. 4
26. 2
27. 3
28. 2
29. 4
30. 2
31. 2
32. 3
33. 4
34. 3
35. 3
36. 3
37. 1
38. 1
39. 4
40. 4
41. 3
42. 1
43. 2
44. 4
45. 4

### 유비쿼터스컴퓨팅개론

> 우선순위: 핵심 기술 용어·구성요소·장단점·적용 사례를 비교형으로 암기

#### 핵심 암기표

| 주제 | 외울 문장 |
|---|---|
| 기본 개념 | - 유비쿼터스는 언제 어디서나 자연스럽게 컴퓨팅을 이용하는 환경이다. (ubiquitous)<br>- 유비쿼터스 공간은 물리공간과 전자공간의 융합이다. (핵심 문장)<br>- 상황인식은 사용자, 위치, 시간, 환경 정보를 바탕으로 서비스한다. (맥락 기반) |
| HCI / HRI | - HCI는 인간과 컴퓨터의 상호작용이다. (computer)<br>- HRI는 인간과 로봇의 상호작용이다. (robot) |
| 하드웨어 요소 | - SoC는 여러 기능을 하나의 칩에 통합한 것이다. (System on Chip)<br>- MEMS는 초소형 기계·전자 시스템이다. (센서/구동)<br>- RFID는 무선 주파수로 대상을 식별한다. (태그/리더)<br>- USN은 유비쿼터스 센서 네트워크다. (센서+네트워크)<br>- 나노기술은 초미세 단위 물질 조작 기술이다. (10^-9)<br>- 차세대 전지는 모바일/센서 기기의 지속성을 높인다. (에너지) |
| 유비쿼터스 네트워크 | - 유비쿼터스 네트워크는 언제 어디서나 연결되는 네트워크다. (anytime) |
| 클라우드 | - 클라우드는 컴퓨팅 자원을 네트워크로 제공한다. (소유보다 이용)<br>- 클라우드 장점은 확장성, 비용 효율, 접근성이다.<br>- 클라우드 단점은 보안, 장애 의존성, 개인정보 문제다. |
| 블록체인 | - 블록체인은 분산 원장으로 위변조가 어렵다. (탈중앙) |
| 핀테크 | - 핀테크는 금융과 IT의 결합이다. (finance+tech) |
| 가상/현실 기술 | - VR은 완전한 가상현실이다. (현실 차단)<br>- AR은 현실 위에 정보를 덧붙인다. (현실 기반)<br>- MR은 현실과 가상을 상호작용하게 섞는다. (혼합)<br>- 메타버스는 지속적 가상 세계와 사회적 상호작용이다. (사회성) |
| 응용 분야 | - 스마트 자동차는 센서, 통신, AI, 자율주행을 결합한다. (자동차+ICT)<br>- 빅데이터 3V는 Volume, Velocity, Variety다. (크기/속도/다양성)<br>- AI는 학습, 추론, 인식 등 지능형 처리를 수행한다. (머신러닝 포함) |
| 정보보호 | - 정보보호 3요소는 기밀성, 무결성, 가용성이다.<br>- 인증은 사용자가 누구인지 확인하는 것이다. (Authentication)<br>- 접근통제는 허가된 자원만 사용하게 제한한다. (Authorization) |

#### 키워드 압축 카드

| 주제 | 내용 |
|---|---|
| 한 줄 공식 | - 유비쿼터스 = **언제 어디서나 자연스럽게 컴퓨팅을 이용하는 환경**.<br>- 핵심 = 물리공간 + 전자공간 융합. |
| 기본 개념 | - 유비쿼터스 공간 = 물리공간과 전자공간의 유기적 융합.<br>- 상황인식 = 사용자/환경/시간/위치 정보를 바탕으로 서비스 제공.<br>- HCI = 인간-컴퓨터 상호작용.<br>- HRI = 인간-로봇 상호작용. |
| 디바이스/센서 | - SoC = 여러 기능을 하나의 칩에 통합.<br>- MEMS = 초소형 기계·전자 시스템.<br>- RFID = 무선 주파수 기반 식별.<br>- USN = 유비쿼터스 센서 네트워크.<br>- 나노기술 = 초미세 단위 조작.<br>- 차세대 전지 = 모바일/센서 지속성 핵심. |
| 네트워크/클라우드 | - 유비쿼터스 네트워크 = 언제 어디서나 연결.<br>- 클라우드 = 컴퓨팅 자원을 네트워크로 제공.<br>- 장점 = 확장성, 비용 효율, 접근성.<br>- 단점 = 보안, 장애 의존성, 개인정보 이슈. |
| 블록체인/핀테크 | - 블록체인 = 분산 원장, 위변조 어려움.<br>- 특징 = 탈중앙화, 투명성, 무결성.<br>- 핀테크 = 금융 + IT. |
| VR/메타버스/스마트카 | - VR = 가상현실.<br>- AR = 현실 위 정보 증강.<br>- MR = 현실+가상 혼합.<br>- 메타버스 = 지속적 가상 세계/사회적 상호작용.<br>- 스마트 자동차 = 센서, 통신, 인공지능, 자율주행. |
| 빅데이터/AI/보안 | - 빅데이터 3V = Volume, Velocity, Variety.<br>- AI = 학습/추론/인식 등 지능형 처리.<br>- 정보보호 3요소 = 기밀성, 무결성, 가용성.<br>- 개인정보보호와 인증/접근통제 중요. |

#### 빈칸 테스트

1. 유비쿼터스는 (     ) 어디서나 자연스럽게 컴퓨팅을 이용하는 환경이다.
2. 유비쿼터스 공간은 (     )과 (     )의 융합이다.
3. 상황인식은 (     ), (     ), (     ), (     ) 정보를 바탕으로 한다.
4.
   ```text
   HCI는 (     ), HRI는 (     ) 상호작용이다.
   ```
5. SoC는 (     ), MEMS는 (     )이다.
6. RFID는 (     ), USN은 (     )이다.
7. 클라우드는 (     )를 네트워크로 제공한다.
8. 블록체인은 (     ) 원장이고 위변조가 (     ).
9. VR은 (     ), AR은 (     ), MR은 (     )이다.
10. 빅데이터 3V는 (     ), (     ), (     )이다.
11. 정보보호 3요소는 (     ), (     ), (     )이다.

<details markdown="1">
<summary>정답 보기</summary>

1. 언제
2. 물리공간 / 전자공간
3. 사용자 / 위치 / 시간 / 환경
4. 인간-컴퓨터 / 인간-로봇
5. 여러 기능을 하나의 칩에 통합 / 초소형 기계·전자 시스템
6. 무선 주파수로 대상 식별 / 유비쿼터스 센서 네트워크
7. 컴퓨팅 자원
8. 분산 / 어렵다
9. 완전한 가상현실 / 현실 위에 정보 덧붙임 / 현실과 가상의 상호작용 혼합
10. Volume / Velocity / Variety
11. 기밀성 / 무결성 / 가용성

</details>

---
#### 연습문제

**Q1. 물리공간과 전자공간을 유기적으로 융합한 것을 무엇이라고 하는가 ?**
1. 전자공간
2. 유비쿼터스 공간
3. 사이버 공간
4. 초현실 공간

**Q2. 물리공간과 전자공간의 연계를 위한 관점에 포함되지 않는 것은 무엇인가 ?**
1. 사물-컴퓨터-사람의 네트워크 연결
2. 사물의 인식
3. 물리적 속성과 전자적 특성 간의 연계
4. 인공지능 기반의 전자공간

> 지문:
> 전자공간과 물리공간의 연계는 “물리공간의 (가), 전자공간의 (나), 양쪽에 존재하는 (다)간의 제한 없는 통신 네트워크를 기반으로 하며, 물리공간에 존재하는 장소, 사물, 사람의 물리적 속성에 대한 인식이 가능하고, 이러한 물리적 속성과 전자공간상의 전자적 속성이 양방향으로 상호작용할 수 있는 기능 중심의 환경”이라고 정의할 수 있으며, 이러한 환경을 유비쿼터스 환경이라고 한다.
**Q3. 위 내용의 빈칸에 알맞은 것은 무엇인가 ?**
1. 사물(센서/칩/태그), 사람, 컴퓨터
2. 사람, 사물(센서/칩/태그), 컴퓨터
3. 사람, 컴퓨터, 사물(센서/칩/태그)
4. 사물(센서/칩/태그), 컴퓨터, 사람

**Q4. 유비쿼터스 컴퓨팅의 특징으로 틀리는 것은 무엇인가 ?**
1. 모든 사물의 컴퓨터 내재화
2. 물리공간을 가상공간으로 이동
3. 모든 사물의 지능화
4. 사물들의 유기적 연결

**Q5. 유비쿼터스 컴퓨팅 환경을 구현하기 위한 관심 분야로서 전자공간 사이의 좀 더 개선된 결합의 모습을 추구하는 개념은 무엇인가 ?**
1. 가시성
2. 복잡성
3. 추상화
4. 연결성

> 지문:
> ( )은 1988년 PARC의 마크 와이저에 의해 “사람을 포함한 현실공간에 존재하는 모든 대상물을 기능적 공간적으로 연결하여 사용자에게 필요한 정보나 서비스를 즉시에 제공할 수 있는 기반 기술”로 정의되었다.
**Q6. 위 내용의 괄호 안에 알맞은 내용을 넣으시오**

**Q7. 실제로 존재하지 않은 환경이나 상황을 컴퓨터 등으로 구현한 후 인간의 감각을 이용하여 체험하게 하는 기술은 무엇인가 ?**
1. 가상현실
2. 혼합현실
3. 메타버스
4. 증강현실

**Q8. 미래 가속화 연구재단(ASF; Acceleration Studies Foundation)에서 정의한 메타버스 구성의 네 가지 시나리오가 아닌 것은 무엇인가 ?**
1. 가상세계
2. 일상기록
3. 혼합현실
4. 증강현실

**Q9. 소셜 미디어가 모임, 쇼핑, 게임 등이 가능한 메타버스로 발전한 형태인 소셜 기반 메타버스가 아닌 것은 무엇인가 ?**
1. 제페토(Zepeto)
2. 게더타운(Gather.town)
3. 호라이즌 월드(Horizon World)
4. 로블록스(Roblox)

**Q10. SoC의 특징이 아닌 것은 무엇인가 ?**
1. 칩 자체가 하나의 시스템으로 기능을 수행할 수 있다.
2. 마이크로프로세서, 디지털 신호 처리장치, 메모리 등을 직접시킨 칩이다.
3. 기능마다 별개의 칩으로 구성된다.
4. 부품의 개수와 부피를 줄일 수 있다.

**Q11. SoC 제작과정중에서 펌웨어등의 개발이 관여되는 과정은 무엇인가 ?**
1. 시스템 명세 단계
2. 전문가에 의한 구조 결정 단계
3. 시제품 제작 및 테스트 단계
4. SoC 제품 생산 단계

**Q12. 다음 중 MEMS 기술의 특징이 아닌 것은 무엇인가 ?**
1. 입출력 대상의 다양성
2. 효율적인 소형화
3. 제작의 융합화
4. 생산공정의 단순화

**Q13. 나노 기술의 특징이 아닌 것은 무엇인가 ?**
1. 물질의 특성을 나노 스케일에서 규명하고 제어하는 기술
2. 원자나 분자를 적절하게 결합시켜 새로운 미세한 구조를 만들어내어 기존 물질을 변형하거나 새로운 물질을 창출하는 것을 가능하게 하는 초미세기술
3. 기술의 핵심은 기존의 구조물들을 융합하여 구조물을 만드는 기술
4. 입자의 질량이 너무 작아서 중력의 영향은 덜 받고, 상대적으로 넓은 표면적으로 인하여 흡착력이 커지게 됨

**Q14. 화학전지에 속하지 않는 것은 ?**
1. Ni-Cd 전지
2. Ni-MH 전지
3. 태양 전지
4. 리튬이온 전지

**Q15. 나노미터 수준의 가공을 통해 나노미터 크기의 구조체를 인공적으로 형성하는 나노 기술의 접근 기술은 ?**
1. 하향식 접근 방식
2. 상향식 접근 방식
3. 다측면 접근 방식
4. 입체 접근 방식

**Q16. 유비쿼터스 네트워킹을 위한 구조적 모델에서 사물의 수행 환경과 상황정보는 통신하는 단말이나 사용자의 이동, 실행 환경의 변화 등 여러 통신 환경 변화에 따라 영향을 받기 때문에 각 사물은 예측할 수 없는 실행 상황에도 대처하는 계층은 무엇인가?**
1. 차세대 네트워크 서비스층
2. 차세대 네트워크 전송층
3. 최종 사용자
4. 유비쿼터스 네트워킹 응용 프로그램

**Q17. 사물인터넷에서 서버상의 콘텐츠 같은 객체의 사물 유형은 무엇인가?**
1. 고정 사물
2. 이동 사물
3. 체 사물
4. 논리적 사물

> 지문:
> 하부에 위치한 다양한 목적의 ( )들은 주변 환경으로부터 데이터를 수집하여 전달하고 있으며, 이러한 사물들로부터 데이터를 전달받아서 효율적으로 처리하기 위한 ( ), 그리고 수집된 데이터를 이용하여 서비스를 제공하는 ( )으로 구분할 수 있다.
**Q18. 위 지문의 빈칸에 알맞은 것은 무엇인가?**
1. 사물, 플랫폼, 응용 프로그램
2. 플랫폼, 사물, 응용 프로그램
3. 플랫폼, 응용 프로그램, 사물
4. 사물, 응용 프로그램, 플랫폼

**Q19. 블록체인의 특징이 아닌 것은 무엇인가?**
1. 분산형 장부관리
2. 투명성
3. 자동성
4. 가용성

**Q20. 승인된참여자만 참여할 수 있는 폐쇄형 블록체인 플랫폼은 무엇인가?**
1. 비트코인 블록체인
2. 동적 블록체인
3. 퍼블릭 블록체인
4. 프라이빗 블록체인

**Q21. 블록체인 플랫폼에서 특정 블록을 찾기 위해서는 식별자가 필요하며, 블록의 식별자는 ( )과 ( )으로 정의된다.**
1. 블록 해시값, 블록 높이값
2. 블록 높이값, 블록 해시값
3. 논스, 블록 해시값
4. 블록 높이값, 난이도

**Q22. 클라우드 서비스에 대한 설명으로 옳지 않은 것은 무엇인가?**
1. 인터넷을 통해 액세스할 수 있는 IT 서비스
2. 사용자가 신청하여 즉시 사용할 수 있고, 사용한 만큼 비용을 지불하는 컴퓨팅
3. 사용자의 필요 용도에 따라 클라우드 컴퓨팅에서 제공하는 서비스의 성능도 가변적으로 변경 가능한 서비스
4. 고정적인 컴퓨팅 리소스에 대한 포털을 제공하는 서비스

**Q23. 클라우드에서 제공되는 가상 인프라를 제공하는 영역은 클라우드 아키텍처의 어느 부분인가?**
1. 프로비저닝계층
2. 물리적 시스템 계층
3. 가상화 계층
4. 클라우드 컴퓨팅 서비스 관리 체계 계층

**Q24. 클라우드 사용자에게 통신 네트워크를 통해 소프트웨어를 가상화하여 제공하는 클라우드 서비스 모델은 무엇인가?**
1. SaaS 모델
2. IaaS 모델
3. PaaS 모델
4. DaaS 모델

**Q25. 일반적으로 측정 대상물을 감지 또는 측정하거나 전파의 강도를 감지/측정하여 유용한 신호로 변환하고, 그 측정량을 전기신호로 변환하는 장치는 무엇인가?**
1. 센서
2. 사물
3. USN 미들웨어
4. USN 응용 프로그램

**Q26. 센서 네트워크의 센서 네트워크 프로토콜 아키텍처의 기능 측면에 해당되지 않는 것은 무엇인가?**
1. 전력 관리 측면
2. 이동성 관리 측면
3. 업무 관리 측면
4. 자원 분배 측면

**Q27. USN 미들웨어의 기능이 아닌 것은 무엇인가?**
1. 센서들의 센싱를 모아서 외부 네트워크로 전송
2. 다양한 질의 유형 지원
3. 센싱 정보 관리
4. 서로 다른 기종의 센서 네트워크 통합 지원

**Q28. 상황의 분류에 포함되지 않는 것은 무엇인가?**
1. 지식적 상황
2. 컴퓨팅 상황
3. 사용자 상황
4. 물리적 상황

**Q29. 상황(또는 상황정보, Context)의 정의에 포함되지 않는 것은 무엇인가?**
1. 상황인식을 하기 위해 필요한 기본 정보
2. 실세계에 존재하는 실체의 상태를 특징화하여 정의한 정보
3. 사용자의 상황을 특징지을 수 있는 정보
4. 사용자의 주변을 구성하는 가상화된 자원 정보

**Q30. 상황인식 서비스 요소 기술이 아닌 것은 무엇인가?**
1. 상황정보 연계 기술
2. 상황정보 모델링 기술
3. 상황정보 추론 기술
4. 상황정보 관리 기술

**Q31. HCI(Human-Computer Interaction)의 구성요소에 포함되지 않는 것은 무엇인가?**
1. 사물
2. 인간
3. 컴퓨터
4. 상호작용

**Q32. 음성을 통한 HCI에 포함되지 않는 것은 무엇인가?**
1. 음성 인식
2. 음성 합성
3. 자연어처리
4. 상황인식

**Q33. 착용 컴퓨팅 기반의 HCI에서 운영체제, 미들웨어, 장치 관리/보안, 음성인식, 응용 프로그램 등의 기술 분류는 무엇에 해당하는가?**
1. 기반 기술
2. 디바이스 / 컴포넌트 기술
3. 소프트웨어 기술
4. 착용 솔루션 기술

**Q34. 유비쿼터스 시대의 정보보호 요구사항에 포함되지 않는 것은 무엇인가?**
1. 유비쿼터스 장치의 절도 및 분실에 대한 대처
2. 신원정보 및 위치정보 노출에 대한 대처
3. IP 위장하기(IP Spoofing)에 대한 대처
4. 사용자 익명 사용에 대한 대처

**Q35. 메시지의 송‧수신이나 교환 후, 또는 통신이나 처리가 실행된 후에 그 사실을 사후에 증명함으로써 사실 부인을 방지하는 보안 기술은 무엇인가?**
1. 서비스 거부 공격(DoS)
2. 패킷 엿보기(Packet Sniffing)
3. 부적절한 개인정보 유통
4. 부인방지(Non-repudiation)

**Q36. 정상적인 기능을 하는 시스템으로 가장하여 프로그램 내에 숨어서 의도하지 않은 기능을 수행하는 백도어(backdoor) 프로그램 코드는 무엇인가?**
1. 패킷 엿보기 (Packet Sniffing) 코드
2. 페러데이케이지(Faraday Cage) 코드
3. 트로이 목마(Trojan Horse) 코드
4. 킬 태그(Kill Tag) 코드

**Q37. 일부 기능을 제외하면 정상적인 주행 혹은 사고나 충돌 임박 상황에서 자동차 제어권을 운전자가 소유하는 자동차의 자동화 단계는 무엇인가?**
1. 비자동화
2. 조합 기능 자동화
3. 제한된 자율주행
4. 특정 기능 자동화

**Q38. 차량 상태의 위험 상황과 운전자 상태를 감지하여 사고 발생 가능성이 있는 경우, 사고를 회피시키는 차량 제어 기술은 무엇인가?**
1. 운전지원
2. 사고피해경감
3. 사고예방
4. 사고회피

**Q39. 차량과 주변 인프라망이 유무선 통신에 의해 접속되는 단말과 서버 간에 이루어지는 무선통신. 차량에 인터넷 프로토콜(IP) 기반의 교통정보 및 안전운행 정보를 내려받을 수 있는 서비스는 무엇인가?**
1. 전자제어 장치(ECU; Electronic Control Unit)
2. 협력 · 지능형 교통 체계(C-ITS; Cooperative Intelligent Transport Systems)
3. 차량 인프라 간 통신(V2I; Vehicle to Infrastructure communication)
4. 차선 유지 보조 시스템(LKAS; Lane Keeping Assistance System)

**Q40. 저장될 데이터에 대하여 미리 정해진 규칙(혹은 스키마)을 정의한 후, 그에 따라 저장된 데이터는 무엇인가?**
1. 정형 데이터
2. 비정형 데이터
3. 반정형 데이터
4. 추상형 데이터

> 지문:
> 빅데이터 적재 기술은 수집한 데이터를 분산 저장장치에 영구 또는 임시로 저장하는 기술이다. 수집된 빅데이터는 이전 정형 데이터를 주로 다루는 관계형 데이터베이스와는 다른 방식으로 저장되어야 한다. 이를 위해 빅데이터 분산 저장소는 대개 HDFS(Hadoop Distributed File System)이나 NoSQL을 활용한다. HDFS는 대용량 파일 적재에 주로 활용하지만, 실시간 발생하는 대용량 데이터 적재를 위해서는 NoSQL을 사용한다.
**Q41. 위 지문은 무엇에 대한 설명인가?**
1. 빅데이터 적재
2. 빅데이터 수집
3. 빅데이터 처리
4. 빅데이터 분석

**Q42. 여러 서버를 연결하여 대용량 빅데이터를 분산처리할 수 있도록 지원하는 자바(Java) 기반의 오픈소스 프레임워크는 무엇인가?**
1. 아파치 스파크(Spark)
2. 네임노드(NameNode)
3. 하둡(Hadoop)
4. 맵리듀스(MapReduce)

**Q43. 모든 학습 데이터(x)에 적당한 레이블(y)을 부여한 후, 기계가 입력집합 x를 모델에 넣어 결과에 해당하는 y값과 비교함으로써 모델의 성능을 높이는 학습 방식은 무엇인가?**
1. 지도학습(Supervised Learning)
2. 비지도학습(Unsupervised Learning)
3. 강화학습(Reinforcement Learning)
4. 반지도학습(Semi-supervised Learning)

> 지문:
> 인공신경망(Artificial Neural Network)에서 은닉층(hidden layer)을 여러 계층 쌓아서 만든 깊은 신경망(Deep Neural Network)이며, 뇌의 신경망 구조와 유사한 방식으로 동작하도록 계층적인 인공신경망을 기반으로 설계된다.
**Q44. 위 지문은 무엇에 대한 설명인가?**
1. 인공지능
2. 머신러닝
3. 딥러닝
4. 튜링 테스트

**Q45. 출력되는 값이 분류 문제처럼 N개의 값 중 하나를 예측하는 것이 아니라, 연속된 값 중 하나를 출력하는 것은 무엇인가?**
1. 회귀 모델
2. 분류 모델
3. 군집화 모델
4. 마르코프 의사결정 과정 모델

#### 연습문제 정답

1. 2
2. 4
3. 4
4. 2
5. 4
6. 유비쿼터스 컴퓨팅
7. 1
8. 3
9. 4
10. 3
11. 3
12. 4
13. 3
14. 3
15. 1
16. 1
17. 4
18. 1
19. 3
20. 4
21. 1
22. 4
23. 3
24. 1
25. 1
26. 4
27. 1
28. 1
29. 4
30. 1
31. 1
32. 4
33. 3
34. 4
35. 4
36. 3
37. 4
38. 4
39. 3
40. 1
41. 1
42. 3
43. 1
44. 3
45. 1
