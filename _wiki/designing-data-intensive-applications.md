---
layout  : wiki
title   : Designing Data-Intensive Applications(데이터 중심 애플리케이션 설계)
summary : 데이터 중심 애플리케이션 설계 북클럽 정리와 장별 참고 자료
date    : 2025-09-10 13:00:00 +0900
updated : 2026-06-25 12:48:02 +0900
tags    : [architecture, database, engineering, design]
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

<img src="https://github.com/SanDiegoMachineLearning/bookclub/blob/master/images/designing-data-intensive-apps.jpg?raw=true" width="160">

# Designing Data-Intensive Applications(데이터 중심 애플리케이션 설계)

마틴 클레프만(Martin Kleppmann)의 [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/)를 읽으며 데이터 시스템을 설계할 때 필요한 신뢰성, 확장성, 유지보수성, 저장소, 복제, 파티셔닝, 트랜잭션, 분산 시스템, 일관성, 배치/스트림 처리, 데이터 시스템의 미래를 정리한다.

## 문헌 참고 자료

각 장에는 더 깊게 읽을 수 있는 논문과 글이 많이 포함되어 있다. 최신 참고 문헌 목록은 다음 저장소에서 관리된다.

- [DDIA 참고 문헌 저장소](https://github.com/ept/ddia-references)

## 개인 실습 자료

책 내용을 실제 운영/설계 감각으로 옮기기 위한 개인 실습 자료다.

- [Alexandria playground](https://github.com/currenjin/alexandria-playground/tree/main/book-designing-data-intensive-applications)
- [DDIA 운영 플레이북](https://github.com/currenjin/alexandria-playground/blob/main/book-designing-data-intensive-applications/runbook.md)
- [DDIA 플레이북 리허설 가이드](https://github.com/currenjin/alexandria-playground/blob/main/book-designing-data-intensive-applications/runbook-drill.md)
- 월간 리허설 핵심: Replication Lag / Retry Storm / Stream Lag / CDC 중단

## 노트와 영상

장별 노트와 밋업 녹화 자료다.

### Chapter 1. 신뢰성, 확장성, 유지보수성 있는 애플리케이션

Reliable, Scalable, and Maintainable Applications
[노트](https://docs.google.com/document/d/1MMMAAqen9FdskelaiGOsElVAlmxN5B60uxbBG-Cw2tA/edit?usp=sharing) / [밋업 영상](https://youtu.be/JqDAEH_2t6M)

### Chapter 2. 데이터 모델과 질의 언어

Data Models and Query Languages
[노트](https://docs.google.com/document/d/1tpV0cvj0sS5tslPKQnbI48uAf2UKg3_1WI-vYJZlA5E/edit?usp=sharing) / [밋업 영상](https://youtu.be/8Xd1Nf1APmc)

### Chapter 3. 저장소와 검색

Storage and Retrieval
[노트](https://docs.google.com/document/d/1r_k-1PJlSp04LusH6yHpsSQ2o-vZIW1Catv9PRAV2iQ/edit?usp=sharing) / [밋업 영상](https://youtu.be/b1djvhyUJUk)

### Chapter 4. 부호화와 발전

Encoding and Evolution
[노트](https://docs.google.com/document/d/1MUh3SYMrSfK0i3t_Bj96SxPlOflkysJ5tUrnsj_F3Jo/edit?usp=sharing) / [밋업 영상](https://youtu.be/YZAvkAEPgVw)

### Chapter 5. 복제

Replication
[노트](https://docs.google.com/document/d/1T8Y4DNrJXr9Cxemz2J9SqxCMA1M115G7o8_-ggMUz9U/edit?usp=sharing) / [밋업 영상](https://youtu.be/wk9yig6xqPo)

### Chapter 6. 파티셔닝

Partitioning
[노트](https://docs.google.com/document/d/1JUt1vZMUgTBB3egr59Lj3DFJ2QxWUJYWViYcGOVNwtU/edit?usp=sharing) / [밋업 영상](https://youtu.be/cARZXd8x7Ew)

### Chapter 7. 트랜잭션

Transactions
[노트](https://docs.google.com/document/d/1NDisyUYoBhSpzTzsi7NQ5KYRg3BULgmc-J5QT2oNcS4/edit?usp=sharing) / [밋업 영상](https://youtu.be/9vvKkkMGQ2Q)

### Chapter 8. 분산 시스템의 골칫거리

The Trouble with Distributed Systems
[노트](https://docs.google.com/document/d/1CuQn6nEu2z5P1oe6KPZRLQO-3Lrz-S8CqTp5LHNYlOc/edit?usp=sharing) / [밋업 영상](https://youtu.be/WJcKtG7zxe0)

### Chapter 9. 일관성과 합의

Consistency and Consensus
[노트](https://docs.google.com/document/d/1MVwTKULlNDjnMw5MvhU5D1Ms5BBs07163C3_NfYkLaU/edit?usp=sharing) / [밋업 영상](https://youtu.be/0rRsOVCKnsQ)

### Chapter 10. 일괄 처리

Batch Processing
[노트](https://docs.google.com/document/d/10wPVoRnLInhWNbjXYV3yXPmWzgFHyX1bgLBCFkM8b_s/edit) / [밋업 영상](https://youtu.be/uR2fTP26xK8)

### Chapter 11. 스트림 처리

Stream Processing
[노트](https://docs.google.com/document/d/1cj0uHh2hl49S1BozHlHHUJY-i8GqaX5QQ-tryb0sWms/edit?usp=sharing) / [밋업 영상](https://youtu.be/bLCUSDwjnNM)

### Chapter 12. 데이터 시스템의 미래

The Future of Data Systems
[노트](https://docs.google.com/document/d/1ltpJUG8SSD1WQftjutPWd_hmbRS9IP1gnuo5JGVOasM/edit) / [밋업 영상](https://youtu.be/KyCk_MUITY4)
