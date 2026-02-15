---
layout  : wiki
title   : GC(Garbage Collection, 가비지 컬렉션)
summary :
date    : 2025-04-8 19:00:00 +0900
updated : 2025-04-8 19:00:00 +0900
tags     : garbage-collection
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Garbage Collection

> 시스템에 있는 모든 객체의 수명을 정확히 몰라도 런타임이 대신 객체를 추적하며 쓸모없는 객체를 알아서 제거하는 것

## 기본 원칙
- 알고리즘은 반드시 모든 가비지를 수집해야 한다.
- **살아 있는 객체는 절대로 수집해선 안 된다.**
  - Segmentation Fault가 발생할 수 있다.
  - 데이터가 조용히 더럽혀진다.

### Segmentation Fault

> 컴퓨터 소프트웨어의 실행 중에 일어날 수 있는 특수한 오류.
> 
> Segfault라고도 한다.

- 프로그램이 허용되지 않은 메모리 영역에 접근을 시도하거나, 허용되지 않은 방법으로 메모리 영역에 접근을 시도할 경우 발생한다.

## Mark and Sweep

### Algorithm

> 할당됐지만, 아직 회수되지 않은 객체를 가리키 포인터를 포함한 할당 리스트(allocated list)를 사용한다.

1. 할당 리스트를 순회하면서 마크 비트(mark bit)를 지운다.
2. GC 루트부터 살아 있는 객체를 찾는다.
3. 찾은 객체마다 마크 비트를 세팅한다.
4. 할당 리스트를 순회하면서 마크 비트가 세팅되지 않은 객체를 찾는다.
   1. 힙에서 메모리를 회수해 프리 리스트(free list)에 되돌린다.
   2. 할당 리스트에서 객체를 삭제한다.

살아 있는 객체는 DFS(depth-first search, 깊이 우선 탐색) 방식으로 찾는다.

이렇게 생성된 객체 그래프는 live object graph(라이브 객체 그래프) 또는 transitive closure of reachable objects(접근 가능한 객체의 전이 폐쇄)라고도 한다.

#### allocated list
메모리 관리 시스템에서 현재 할당된 모든 객체들의 포인터를 추적하는 자료구조로, 프로그램이 메모리 할당 함수를 호출할 때마다 해당 객체에 대한 참조가 이 리스트에 추가된다.

- 가비지 컬렉터가 실행될 때 이 리스트를 순회하면서 어떤 객체가 여전히 사용 중인지(마크된 객체), 어떤 객체가 더 이상 사용되지 않는지(마크되지 않은 객체)를 확인한다.
- 메모리 누수를 방지하기 위한 핵심 자료구조로, 프로그램이 할당한 모든 메모리를 추적할 수 있게 한다.
- 일반적으로 연결 리스트나 해시 테이블 등의 형태로 구현된다.

#### free list
동적 메모리 할당을 위해 계획적으로 사용된 자료구조로, 메모리의 할당되지 않은 영역들을 연결 리스트로 연결해서 운용한다.

#### dfs
루트 노드부터 시작해 간선을 타고 내려가다가 막다른 골목에 이르면 마지막에 타고 내려온 간선을 따라 되돌아가며 탐색하는 방식이다.

#### live object graph(or transitive closure of reachable objects)
이산 수학에 나오는 용어로, 살아있는 객체 그래프의 어느 지점에서 출발하든 접근 가능한 모든 지점의 집합을 의미한다. 

### Example
- [Link](https://github.com/currenjin/alexandria-playground/blob/main/implementation-mark-and-sweep-algorithm/src/main/java/com/currenjin/markandsweep/ObjectGraph.java)
