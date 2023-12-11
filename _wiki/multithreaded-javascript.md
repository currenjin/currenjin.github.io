---
layout  : wiki
title   : Multithreaded Javascript(Concurrency Beyond the Event Loop)
summary :
date    : 2023-12-09 22:00:00 +0900
updated : 2023-12-09 22:00:00 +0900
tag     : programming
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# 시작하며

지금보다 예전 컴퓨터가 더 다루기 쉬웠다. 고려할 요소가 지금보다 적었다. 80년대 PC에는 8비트짜리 싱글 CPU 코어가 들어가 있었고, 메모리도 크지 않았다. 그리고 싱글 프로세스로 돌아가는게 대부분.

사용자는 OS가 돌아가는 동시에 실제 사용하는 프로그램도 돌아가야 했는데, 이를 위해 멀티태스킹이라는 개념이 생겼다. 프로그램이 여러 개가 돌아가는데, 그중 하나의 프로그램이 실행권을 얻어 작업을 처리하게 된다. 어떤 작업을 먼저 처리할지는 프로그램의 상태에 의해 제어된다. 이러한 방식을 `협력식 멀티태스킹(cooperative multitasking)`이라 한다.

다만 협력식 멀티태스킹에서는 프로그램이 실행권을 얻을 때까지 한없이 기다려야 하는 단점이 있는데, 이 때문에 `선점형 멀티태스킹(preemptive multitasking)`이 새로 등장한다. 이전처럼 프로그램 상태에 의존하지 않고, OS가 어떤 프로그램에게 CPU를 할당할지 작업 시점을 스케줄링 한다. 요즘은 대부분의 OS가 이런 방식을 택한다. 실행 프로그램은 보통 CPU 코어 개수보다 훨씬 많으니 말이다.

스레드라는 개념이 등장하기 전에는, 하나의 프로그램(혹은 프로세스) 안에서 멀티태스킹을 적용하는 것이 불가능했다. 그래서 작업(task)을 작은 단위로 쪼개어 하나의 프로그램 안에서 스케줄링하거나, 여러 개의 프로세스가 서로 통신하게 했었다.

루비나 파이썬에서 Global Interpreter Lock(GIL)이라는 개념은 한 시점에 하나의 스레드만 실행되는 방식이다. 메모리 관리에 효율적이기는 하지만, 스레드를 여러개 생성할 경우 GIL로 인해 한 스레드가 작업하는 동안 다른 스레드는 기다려야 한다. 이러한 문제 때문에 프로세스를 여러 개 만들어 멀티태스킹을 구현하기도 한다. 이번 작업을 통해 콜백이나 프로미스(promise)와 같은 비동기식 함수를 사용해 멀티태스킹을 구현할 것이다.

```javascript
// Example 1-1

readFile(filename,(data) => {
	doSomethingWithData(data, (modifiedData) => {
		writeFile(modifiedData, () => {
			console.log('done');
		});
	});
});

or 

const data = await readFile(filename);
const modifiedData = await doSomethingWithData(data);
const writeFile(filename);
console.log('done');
```

대부분의 Javascript 환경에서는 스레드를 사용한다. GIL처럼 제약을 거는 요소는 없지만, 스레드 간 객체를 직접적으로 공유할 수는 없다. 그럼에도 CPU 부하가 큰 작업을 다룰 때 스레드의 장점이 있다. 브라우저에서 메인 스레드와 별개의 스레드를 생성하여 멀티태스킹을 구현할 수도 있다.

```javascript
// Example 1-2

const worker = new Worker('worker.js');
worker.postMessage('Hello, world');

// worker.js
self.onmessage = (msg) => console.log(msg.data);
```

이번 작업을 통해 Javascript 스레드를 프로그래밍 관점에서 분석하고, 설명할 수 있다. 스레드를 어떻게 사용하는지, 또 무엇보다 언제 사용해야 하는지를 알 수 있다.

## 스레드란?

OS에서 커널 바깥쪽 실행단은 프로세스와 스레드로 구분된다. 개발자는 프로세스나 스레드를 사용해서, 상호 통신을 통해 프로그램 동시성(concurrency)을 구현한다. 멀티코어 시스템의 경우 병렬성(parallelism)을 적용한다고 볼 수 있다.

![image](https://github.com/currenjin/currenjin.github.io/assets/60500649/2f1a205e-09f0-4344-893d-d6ac8421c94f)

하나의 프로그램을 실행한다는 것은 하나의 프로세스가 시작된다는 것을 뜻한다. 이때, 프로세스에 할당된 메모리 공간에 코드가 로드되며, 이는 프로세스마다 고유한 메모리 공간이므로 다른 프로세스가 접근할 수 없다. 보통은 한 시점에 하나의 명령문(instruction)이 실행되며, 프로그램에서 지정한 순서대로 실행된다. (명령문을 코드 한 줄이라고 생각하고, 여러 줄이 적혀있으면 한 줄씩 실행되는 느낌이다)

하나의 프로세스에서 여러 개의 스레드를 생성하는 것도 가능하다. 스레드는 프로세스와 거의 비슷한 개념인데, 차이점이 있다면 동일한 프로세스 아래에 있는 스레드끼리 메모리 공간을 공유할 수 있다는 점이다. 상호 통신이 용이하기 때문에 프로그램 동시성을 구현해야 할 때에는 프로세스보다 스레드가 더 유용하다. (구현 복잡도는 더 높아지지만..) 또한, 스레드도 프로세스와 같이 명령문을 가리키는 고유한 포인터를 가진다.

스레드를 사용하기 좋을 때에는 CPU 부하가 큰 작업(수학 계산 등)을 하는 경우다. 메인 스레드를 통해 사용자 혹은 외부 프로그램과 상호작용하고, 복잡한 작업은 별도 스레드에 맡긴다. 그리고 무한 루프를 돌면서 메인 스레드 이벤트를 감지하면 된다. 아파치(Apache) 같은 정통 웹 서버 프로그램에서 대량의 HTTP 요청을 처리하기 위해 이러한 방식을 사용한다.

![image](https://github.com/currenjin/currenjin.github.io/assets/60500649/0f3d605c-13e5-4a2c-9ed3-1f4af895263c)

스레드의 장점을 극대화하려면, 스레드 간 통신을 잘 활용해야 한다. 스레드 통신이란 하나의 스레드가 다른 스레드로부터 데이터를 전달받아 처리하는 것을 말한다. 이전에 언급했던 것처럼 스레드는 동일한 메모리 공간을 공유한다. 이 메모리 공간 안에서 스레드끼리 메시지를 주고 받는 시스템을 만들 수 있다. 이러한 기능은 보통 프로그래밍 언어 라이브러리에 내장돼 있거나, 플랫폼 차원에서 제공해 주기도 한다.

## 동시성 vs 병렬성

- 동시성 : 여러 작업을 동시에(한꺼번에) 처리하는 것
- 병렬성 : 여러 작업이 실제로 동시에 시작되고, 실행되는 것

동일한 개념처럼 느껴질 수 있지만, 문맥에 따라 다르다. 예를 들어 하나의 작업을 작은 단위로 쪼개어 처리하는 경우, 동시성은 충족되지만 병렬성은 충족되지 않는다. 정해진 시간 안에서, 작은 단위의 작업들이 번갈아 처리될 뿐이다. 병렬성의 경우, 여러 작업이 완전히 똑같은 시점에 시작되어 처리되고 있어야 한다. 여러 개의 CPU 코어에서 작업을 하나씩 맡고, 동시에 시작하여 처리하는 셈이다.

아래 그림에서 동시성의 경우 한 시점에 하나의 작업만 실행된다. 전체적인 흐름을 보면, 정해진 시간 내에 여러 작업이 번갈아 실행되는 것이다. 하지만 병렬성의 경우 여러 작업이 동일한 시점에 실행되고 있다. 또한, 정해진 시간 안에서 여러 작업이 실행되고 있기도 하므로, 동시성의 기준도 충족한다. 즉, 병렬성은 동시성의 부분집합인 것이다.

![image](https://github.com/currenjin/currenjin.github.io/assets/60500649/821c07e1-98c7-4f9b-ac6e-783aaf88ce48)

하지만, 스레드 자체만으로 병렬성을 적용할 수는 없다. 시스템이 멀티코어여야 하고, OS 스케줄러에서 각 코어에서 돌아가는 스레드를 스케줄링해야 한다. 싱글코어 시스템에서는 동시성, 멀티스레딩을 구현해야 한다. 또, GIL이 있는 언어(루비, 파이썬 등)는 병렬 스레딩이 불가하다. 한 시점에 하나의 명령어만 실행되는 제약이 있기 때문이다.

보통 멀티스레딩의 목적은 프로그램 성능을 향상시키기 위함이다. 하지만, 어떤 시스템이 싱글코어만 지원하여 동시성만 적용할 수 있다면, 스레드를 여러 개 만든다고 성능에 딱히 이점이 있진 않을 것이다. 스레드 간 컨텍스트 스위칭 및 동기화로 인한 오버헤드를 생각하면 오히려 성능이 낮아질 수도 있다. 그러므로, 항상 동작 환경을 염두에 두고 성능을 측정해야 한다.

## 싱글스레드 기반 자바스크립트

기존 자바스크립트가 구동되는 플랫폼에서는 멀티스레딩을 제공하지 않았다. 그렇기에 대부분의 사람들이 자바스크립트는 싱글스레드 언어라고 생각한다. 자바스크립트 언어에는 멀티스레딩 관련 내장 기능이 없지만, 가상머신(VM)이 내장된 환경(Node.js 또는 브라우저)에서 관련 API를 제공한다.

대부분의 자바스크립트 프로그램은 싱글스레드 기반의 이벤트 핸들링 코드로 구성돼 있다. 그리고 이벤트가 발생하면 호출되는 함수를 콜백함수라고 부르며, 이는 Node.js 및 브라우저에서 비동기 프로그램을 구현하기 위한 핵심이다. Promise, Async/Await 또한 모두 콜백 기반의 문법이다. 콜백 함수는 다른 함수와 병렬적으로 실행되지 않는다. 콜백 함수의 코드가 처리되는 시점에는 다른 코드를 병렬적으로 실행할 수 없다는 의미다.

보통 여러 작업이 실행되면, 이것이 병렬적으로 실행된다고 생각하기 쉽지만, 동시적인 실행이다. 아래는 Node.js로 구현한 예시다. 아래 코드를 reader.js라는 이름의 파일로 저장한 후, 같은 위치에 1.txt, 2.txt, 3.txt 파일(각 파일에는 1, 2, 3을 저장한다)을 저장해본다. 이후 node reader.js 명령어를 실행해본다.

```javascript
// Example 1-3

import fs from 'fs/promises';

async function getNum(filename) {
	return parseInt(await fs.readFile(filename, 'utf8'), 10);
}

try {
	const numberPromises = [1, 2, 3].map(i => getNum(`${i}.txt`));
	const numbers = await Promise.all(numberPromises);
	console.log(numbers[0] + numbers[1] + numbers[2]);
} catch(err) {
	console.error('Something went wrong:');
	console.error(err);
}

// Output
6
```

코드를 보면, `Promise.all()`이라는 함수를 사용하는데, 3개의 텍스트 파일이 읽히고 파싱이 완료될 때까지 기다리는 함수다. 한 번에 여러 개의 프로미스를 생성하긴 했지만, 그렇다고 3개의 텍스트 파일을 처리하는 작업이 실제로 동시에 처리된 것은 아니다. 작업들이 정해진 시간 내에 번갈아 처리되는 것 뿐이다. 여전히 명령어 포인터는 딱 한 개다. 한 번에 한 개의 명령어만 실행될 수 있다.

싱글스레드는 자바스크립트가 단일할 환경 아래에서 실행된다는 것을 의미한다. VM 인스턴스가 한 개, 명령어 포인터가 한 개, 메모리를 관리하는 가비지 컬렉터도 한 개라는 뜻이다. Interpreter가 한 번에 하나의 명령만 실행할 수 있는 것이다. 하지만, 딱 한 개의 전역 객체만 사용할 수 있는 것은 아니다. 여기서 realm이라는 개념이 나오는데, Node.js와 브라우저 둘 다 사용하는 개념이다.

realm은 자바스크립트 환경 자체가 인스턴스화된 개념이라고 생각하면 된다. 마치 자바스크립트 코드에서 객체가 인스턴스화된 것처럼 말이다. 각 realm마다 전역 객체를 갖고 있고, 전역 객체 Date, Math와 같은 내장 속성도 가지고 있따. Node.js 환경에서는 global, 브라우저에서는 window라고 부른다. 최근에는 어느 환경이던 globalThis로 표준화해 사용한다.

브라우저 환경에서는, 웹페이지 프레임마다 한 개의 realm을 갖고 있다. 각 프레임의 고유한 real 안에서 사용할 수 있는 원시 타입(Primitive) 및 객체 타입(Object) 자료형이 존재한다. 실제로 instanceof를 실행해보면 예상을 빗나가는 결과가 나온다.

```javascript
// Example 1-4

// iframe에 속한 전역 객체를 contentWindow 속성을 통해 접근
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const FrameObject = iframe.contentWindow.Object;

// 메인 프레임의 Object와 FrameObject는 다른 프레임에 속함
console.log(Object === FrameObject);
console.log(new Object() instanceof FrameObject);
// 하지만 Object와 값은 같음
console.log(FrameObject.name);
```

Node.js 환경에서는 `vm.createContext()`라는 함수를 통해 새로운 realm을 생성할 수 있다.

```javascript
// Example 1-5

// runInNewContext로 새로운 컨텍스트에 객체를 생성
const vm = require('vm');
const ContextObject = vm.runInNewContext('Object');

// 메인 컨텍스트의 Object와 ContextObject는 서로 다른 컨텍스트에 속함
console.log(Object === ContextObject);
console.log(new Object() instanceof ContextObject);
// 하지만 Object와 값은 같음
console.log(ContextObject.name);
```

realm의 개념을 브라우저와 Node.js의 예시로 설명했다. 중요한 점은 언제나 명령어 포인터가 한 개이며, 여러 개의 realm에 속한 코드 중 한 개 realm의 코드만 실행될 수 있다. 전제는 싱글스레드 환경이라는 것을 잊지 말자.

## 숨겨진 스레드

## C언어의 스레드 : Happycoin으로 부자되세요

# 브라우저

## 전용 워커

## 공유 워커

## 서비스 워커

## 메시지 패싱 개요

# Node.js

## 스레드가 없었을 시절

## worker_threads 모듈

## Happycoin 다시보기

## Piscina를 통한 워커 풀

## Happycoin으로 가득 찬 풀

# 공유 메모리

## 공유 메모리 입문

## SharedArrayBuffer와 TypedArrays

## 데이터 가공을 위한 Atomic 메서드

## 원자성에 대한 논의

## 데이터 직렬화

# 공유 메모리 중급

## 코디네이션을 위한 Atomic 메서드

## 스레드가 깨어나는 타이밍과 예측 가능성

## 예시 애플리케이션: 콘웨이의 생명 게임

## Atomics와 Events 객체

# 멀티스레드 패턴

## 스레드 풀

## 뮤텍스: 록 기초

## 링 버퍼를 통한 데이터 스트리밍

## 액터 모델

# 웹어셈블리

## 여러분의 첫 번째 웹 어셈블리

## 웹어셈블리의 데이터 원자성 함수

## Emscripten을 통해 C 코드 웹어셈블리로 컴파일하기

## 웹어셈블리 컴파일러: 기타

## AssemblyScript

## Happycoin: AssemblyScript로 구현하기

# 분석

## 멀티스레딩을 적용하지 않아야 하는 경우

## 멀티스레딩을 적용해야 하는 경우

## 주의사항 요약

# 기타
본 문서는 토머스 헌터 2세, 브라이언 잉글리시의 멀티스레드 기반 자바스크립트의 내용을 참고하여 작성했습니다.