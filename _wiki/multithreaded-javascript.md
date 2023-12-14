---
layout  : wiki
title   : Multithreaded Javascript(Concurrency Beyond the Event Loop)
summary :
date    : 2023-12-09 22:00:00 +0900
updated : 2023-12-14 22:00:00 +0900
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

자바스크립트 코드가 싱글스레드로 돌아간다. 하지만, 코드가 실행되는 프로세스 자체가 싱글스레드 기반이라고 생각하면 안 된다. 코드 뒤에서 여러 개의 스레드가 돌아가고 있을 수 있다. 이러한 차원에서, Node.js가 과연 싱글스레드 기반일까?

V8과 같은 자바스크립트 엔진에선, 가비지 컬렉션이나 코드 실행과 직접적으로 연관이 없는 함수는 별도의 스레드에서 실행시킨다. 또한, 런타임 환경에서도 필요에 따라 여러 개의 스레드를 돌려야 할 때도 있다.

Node.js에서는 libuv라는 라이브러리가 있다. 비동기 처리를 위한 I/O 인터페이스인 셈이다. 모든 I/O가 비동기인 것은 아니므로, libuv에서는 여러 개의 워커 스레드를 생성해 블로킹 작업(파일시스템 API 등)을 처리한다. default 설정으로는 4개의 워커 스레드가 생성되고, 이 개수는 UV_THREADPOOL_SIZE 환경변수를 통해 변경할 수 있다(최대 1,024개).

실제로 Node.js 프로그램 하나를 실행해 사용되는 스레드 수는 여러개일 것이다(리눅스 환경에선 `top -H` 명령어를 사용해 확인). 자바스크립트 코드를 실행하는 브라우저도 마찬가지다.

우리는 애플리케이션 리소스 관리 측면에서, 멀티스레드를 고려할 수 있다. 자바스크립트가 싱글스레드 기반의 언어긴 하지만, 애플리케이션 구현 마저 싱글스레드로 제한하지 않아도 된다. 예를 들어, Node.js 프로그램을 만든다면, 몇 개의 스레드가 필요할 지 미리 구상해보자.

## C언어의 스레드 : Happycoin으로 부자되세요

# 브라우저

## 전용 워커

## 공유 워커

## 서비스 워커

## 메시지 패싱 개요

# Node.js

자바스크립트 런타임의 종류 중 브라우저를 제외하면 Node.js가 남는다. Node.js는 CPS(Continuation Passing Style) 콜백 기반으로, 싱글스레드 동시성을 구현한 서버 사이드 플랫폼이었다. 시간이 지나면서 다목적 플랫폼으로 발전하게 됐지만..

Node.js는 원래 이벤트 처리나 네트워크 요청에 특화된 플랫폼이었다. 하지만 요즘 자바스크립트 파일 빌드 시스템 역할을 하는 도구가 많이 개발되었다. 특히 Babel, Typescript는 자바스크립트 최신 문법(ECMAScript 표준)을 브라우저에서 인식할 수 있도록 한다. Webpack, Rollup, Parcel과 같은 번들러(bundler)는 여러 개의 파일을 하나의 자바스크립트 코드로 압축하고, 최적화해 준다. 프론트엔드나 서버리스 환경에서는 속도가 생명이기 때문에, 이러한 툴을 사용해야 한다. 또한, 대량의 파일시스템 I/O 작업과 함께, 동시에 대량의 데이터 프로세싱이 발생하는 환경에서 일반적으로는 동기적으로 처리되지만, 코드에 병렬성을 적용해 더 빠르게 작업을 완료할 수 있다.

병렬성은 Node.js 서버에서 꼭 필요한 요소다. 경우에 따라 대량의 데이터 프로세싱을 요구하는 환경이 있다. 예를 들어 서버 사이드 렌더링(SSR)의 경우 대량의 문자열 처리 작업이 발생한다. 이때 병렬성을 적용한다면 어떨까? Node.js에서는 worker_threads라는 모듈을 제공하고, 이를 통해 프로그램에 병렬성을 적용할 수 있다.

## 스레드가 없었을 시절

CPU가 멀티코어인 경우 여러 개의 프로세스를 사용할 수 있다. 멀티스레드와 비교했을 때, 멀티프로세스의 단점 중 하나는 공유 메모리였다. 하지만 상관없다면 멀티프로세스를 구현해도 좋다.

아래 그림을 다시 보면, 워커 스레드에서 메인 스레드로부터 온 HTTP 요청을 받는다. 이때 각각의 워커 스레드에는 포트가 할당되어 여러 개의 요청 트래픽으로 분산시킬 수 있다.

![image](https://github.com/currenjin/currenjin.github.io/assets/60500649/0f3d605c-13e5-4a2c-9ed3-1f4af895263c)

위 내용을 프로세스로도 비슷한 방식으로 구현할 수 있다.

```javascript
// Example 3-1

const http = require('http');

http.createServer((req, res) => {
	res.end('Hello, world!\n');
}).listen(3000);
```

이후 cluster 모듈을 이용해 4개의 프로세스를 추가해보자. 가장 쉬운 방법은 if를 통해 현재 위치가 메인 프로세스인지, 워커 프로세스인지 구분하는 것이다. 메인 프로세스라면, 워커 프로세스를 생성하고, 워커 프로세스라면 서버를 하나 띄우자.

```javascript
// Example 3-2, cluster.d.ts 파일에 예시가 있다.

// require()를 통해 cluster 모듈을 불러온다.
const http = require('http');
const cluster = require('cluster');

// 메인 프로세스라면, 4개의 워커 프로세스를 만들고,
// 워커 프로세스라면, 웹 서버를 띄우고 listen()을 통해 3000번 포트에 오픈한다.
// isPrimary는 원래 isMaster였는데, isMaster는 현재 Deprecated 상태이다. (차별 용어 지양)
// pid가 궁금하다면, process 모듈을 import하여 process.pid를 출력하면 된다.
if (cluster.isPrimary) {
	cluster.fork();
	cluster.fork();
	cluster.fork();
	cluster.fork();
} else {
	http.createServer((req, res) => {
		res.end('Hello, world!\n');
	}).listen(3000); 
}
```

하지만 이렇게되면, 4개의 프로세스에서 모두 동일한 포트에 서버를 오픈하지 않을까 걱정이 되지 않나? 이는 cluster 모듈이 해결해 줄 것이다.

만약 여러 개의 워커 프로세스가 cluster로 묶일 경우, listen() 함수를 호출하게 되면 워커가 아닌 메인 프로세스에 리스너가 붙게 된다. 그리고 메인 프로세스에서는 IPC를 통해 워커 프로세스에 후속 처리를 넘기게 된다. 이는 대부분의 시스템에서 라운드 로빈(round-robin) 방식으로 수행된다. 이를 기반으로 여러 개의 워커가 동일한 포트에 연결되고, 메인 프로세스에서 포트로 들어오는 메시지를 받아 워커에 분산시켜 준다.

스레드와 비교했을 때 프로세스의 단점은 추가적인 오버헤드가 발생한다는 것이다. 또한 공유 메모리에 접근할 수 없기에, 데이터 전송 속도가 저하될 것이다. 이제는 worker_threads 모듈을 살펴볼 것이다.

## worker_threads 모듈

Node.js에서는 `worker_threads` 모듈을 제공하는데, 브라우저와는 별개의 플랫폼이기에 서로 다른 API를 가지고 있으며, 워커 스레드의 내부 환경도 상이하다.

Node.js에 포함된 ESM을 통해 `require()`, `import()` 등의 API를 사용할 수도 있다. 다만, 메인 스레드에서는 되지만, 워커 스레드에서는 안 되는 API도 있다.

- `process.exit();`로 프로그램 종료가 불가능하다. 다만, 스레드만 종료된다.
- `process.child();`로 디렉터리 변경이 불가능하다.
- `process.on();`으로 이벤트 핸들링이 불가능하다.

한 가지 더 기억해야 할 것은, 여러 개의 워커 스레드가 1개의 libuv 워커 풀을 공유한다. libuv 스레드 풀에서 기본적으로 4개의 스레드를 생성하여, I/O 관련 블로킹 API를 논블로킹 스타일로 처리한다. I/O 작업 속도를 높이기 위해 스레드 생성자를 통해 무작정 스레드를 추가한다면, 성능이 엄청 개선되진 않을 것이다. 대신 환경변수인`UV_THREADPOOL_SIZE`의 값을 늘려야 한다.

```javascript
// Example 3-3

const { Worker } = require('worker_threads');

// 워커 스레드에서 실행할 파일 경로
const worker = new Worker('/path/to/worker-file-name.js');
```

### workerData

워커 스레드만 만들면 끝이 아니라, 스레드와 통신을 해야 한다. `Worker` 생성자는 두 번째 인자로 `options` 객체를 받는데, 이를 통해 워커 스레드 생성 시점에 스레드에 데이터를 전송할 수 있다. 스레드 내부에서 `worker_threads` 모듈의 `workerData` 속성을 이용해 복제된 데이터에 접근할 수 있다는 의미다.

```javascript
// Example 3-4

const {
	Worker,
	isMainThread,
	workerData,
} = require('worker_threads');
const assert = require('assert');

if (isMainThread) {
	const worker = new Worker(__filename, { workerData: { num: 42 } });
} else {
	assert.strictEqual(workerData.num, 42);
}
```

`workerData` 객체의 속성은 ‘복제된’ 것이지, 스레드 간 ‘공유된’ 것이 아니다. 즉, 하나의 객체 데이터를 공유하는 것이 아니라, 아예 별도의 객체인 것이다. 하지만 `SharedArrayBuffer`를 이용해 메모리 공유가 가능하다.

### MessagePort

`MessagePort`는 양방향 데이터 스트림의 한쪽 끝을 의미한다. 기본적으로 1개의 워커 스레드에 1개의 `MessagePort`가 할당되며, 이를 통해 메인 스레드와 메시지를 주고받을 수 있다. 워커 스레드에서는 `worker_threads` 모듈의 `parentPort` 속성을 통해 접근한다.

`MessagePort`를 통해 메시지를 보낼 때는 `postMessage()` 함수를 호출한다. 메시지 전송이 완료되면 `message` 이벤트가 발생하며, 데이터는 이벤트 핸들러 함수의 첫 번째 인자로 전달된다. 만약 데이터를 받는 쪽이 메인 스레드라면 `worker` 인스턴스를 통해 메시지 핸들러 및 `postMessage()` 메서드를 사용한다. 반면 받는 쪽이 워커 스레드라면 `MessagePort` 인스턴스를 통해야 한다.

```javascript
// Example 3-5

const {
	Worker,
	isMainThread,
	parentPort,
} = require('worker_threads');

if (isMainThread) {
	const worker = new Worker(__filename);
	worker.on('message', msg => {
		worker.postMessage(msg);
	});
} else {
	parentPort.on('message', msg => {
		console.log('We got a message from the main thread:', msg);
	});
	parentPort.postMessage('Hello, world!');
}
```

혹은, `MessageChannel`을 통해 `MessagePort` 인스턴스를 생성하고, 한 쌍의 포트를 메인 스레드와 워커 스레드 각각에 연결하는 방법도 있다. `workerData`의 `port` 속성에 새로 생성한 포트를 할당하는 것이다. 예시로, 메인 스레드가 아닌, 워커 스레드끼리 통신이 필요한 경우가 있을 것이다.

```javascript
// Example 3-6

const {
	Worker,
	isMainThread,
	MessageChannel,
	workerData,
} = require('worker_threads');

if (isMainThread) {
	const { port1, port2 } = new MessageChannel();
	const worker = new Worker(__filename, {
		workerData: {
			port: port2,
		},
		transferList: [port2],
	});
	port1.on('message', msg => {
		port1.postMessage(msg);
	});
} else {
	const { port } = workerData;
	port.on('message', msg => {
		console.log('We got a message from the main thread:', msg);
	});
	port.postMessage('Hello, world!');
}
```

위 코드에선, `Worker`를 인스턴스화 할 때 `transferList`라는 옵션을 사용하는데, 해당 옵션을 통해 객체의 소유권을 다른 스레드로 이전시킬 수 있다. `workerData` 혹은 `postMessage`를 통해 소유권을 이전시킬 수 있는 객체는 `MessagePort`, `ArrayBuffer`, `FileHandle`이다. 소유권이 이전된 경우, 기존 스레드에서는 더이상 사용할 수 없다.

## Happycoin 다시보기

Happycoin을 Node.js버전으로 구현해 보자. Happycoin은 단순한 작업증명 시스템 알고리즘으로 동작하는 암호화폐다. 조건은 아래와 같다.

1. 랜덤한 unsigned 64비트 integer를 생성한다.
2. 1번의 integer가 행복한지 아닌지 판별한다.
3. 행복하지 않다면, Happycoin이 아니다.
4. 10,000으로 나눠지지 않는다면, Happycoin이 아니다.
5. 3번과 4번을  충족하지 않는다면, Happycoin이다.

### 메인 스레드 1개로 구현하기

랜덤 숫자를 생성하는 것부터 시작한다.

```javascript
import crypto from 'crypto';

const big64arr = new BigUint64Array(1);
const random64 = () => {
  crypto.randomFillSync(big64arr);
  return big64arr[0];
};
```

위 예시에선 Node.js에서 제공하는 crypto 모듈이 등장한다. 해당 모듈에는 암호학적으로 안전한 랜덤 숫자 생성 기능이 있다.

1. `randomFillSync` 함수를 호출하면, 타입 배열에 랜덤한 숫자를 채워서 리턴해준다.
2. `BigUint64Array` 배열 생성자로 생성한다. 우리의 암호화폐는 64비트 unsigned integer 타입만 다루기 때문이다.

그리고, 해당 숫자가 행복한지 아닌지 판단하는 코드를 추가한다.

```javascript
const sumDigitsSquared = (num) => {
  let total = 0n;
  while (num > 0) {
    const numModBase = num % 10n;
    total += numModBase ** 2n;
    num = num / 10n;
  }

  return total;
};

const isHappy = (num) => {
  while (num != 1n && num != 4n) {
    num = sumDigitsSquared(num);
  }
  return num === 1n;
};

const isHappycoin = (num) => {
  return isHappy(num) && num % 10000n === 0n;
};
```

n이라는 접미사를 통해 정수 리터럴을 표기한게 생소하게 느껴질 수 있다. ‘해당 숫자를 number 타입이 아닌, bigint 타입으로 인식하라.’라는 의미이다. number 타입과 bigint 타입을 서로 연산할 수 없음에 주의하자.

이제는 채굴 코드이다.

```javascript
let count = 0;
for (let i = 1; i < 10000000; i++) {
  const randomNum = random64();
  if (isHappycoin(randomNum)) {
    process.stdout.write(randomNum.toString() + ' ');
    count++;
  }
}

process.stdout.write(`\ncount : ${count}\n`);
```

10,000,000번의 루프를 돌며, 랜덤 숫자를 구한 뒤 happycoin인지 확인한다. happycoin이라면 그 값을 출력한다. `process.stdout.write()` 함수를 사용한 이유는 `console.log()` 함수를 사용했을 때의 개행을 방지하기 위해서다.

코드를 실행해보자.

```javascript
// COMMAND
$ node happycoin.js

// OUTPUT
6451259954051880000 177133728540020000 10782987174359660000 9481562806272950000 5176053797630860000 9264655798699530000 12179311000756630000 4135456038735870000 17011224930539630000 7719601324206930000 683063025004800000 8677112011069900000 14802126973622910000...
count : 126
실행 시간 : 45224
```

실행 시간을 추가했다. 실제 실행해보면, 시간이 조금 오래걸린다는 생각이 들 것이다. 여기서 기억해야 할 점은, 애플리케이션의 성능을 최적화시킬 때, 오버헤드가 걸리는 근본 원인을 파악하는 것이 중요하다.

일단, worker_threads를 통해 멀티스레딩으로 구현하여 작업 로드를 분산시켜보자. 과연 드라마틱하게 줄어들까?

### 워커 스레드 4개로 구현하기

let count=0; 코드부터, count 출력 부분까지 지우고 아래의 코드로 변경하자. (import 필수)

```javascript
import {
  Worker,
  isMainThread,
  parentPort,
} from 'worker_threads';

const THREAD_COUNT = 2;

if (isMainThread) {
  let inFlight = THREAD_COUNT;
  let count = 0;
  for (let i = 0; i < THREAD_COUNT; i++) {
    const worker = new Worker('./happycoin/happycoin-threads.js');
    worker.on('message', (msg) => {
      if (msg === 'done') {
        if (--inFlight === 0) {
          process.stdout.write(`\ncount : ${count}\n`);
        }
      } else if (typeof msg === 'bigint') {
        process.stdout.write(randomNum.toString() + ' ');
        count++;
      }
    });
  }
} else {
  for (let i = 1; i < 10000000/THREAD_COUNT; i++) {
    const randomNum = random64();
    if (isHappycoin(randomNum)) {
      process.stdout.write(randomNum.toString() + ' ');
      count++;
    }
  }
  parentPort.postMessage('done');
}
```

전체적으로 if 분기가 많이 되어있다. 아래와 같은 프로세스로 진행된다.

1. 현재 실행 위치가 메인 스레드라면
   1. js 파일을 통해 4개의 워커 스레드를 생성한다.
   2. 각 워커에 메시지 핸들러를 붙인다.
   3. 메시지 핸들러 내부에서 전달받은 메시지가 `done`일 경우 워커의 작업을 종료한다.
   4. 전달받은 메시지가 bigint인 경우 happycoin이므로, 각 숫자를 출력한다.
   5. 모든 워커의 작업이 끝난 경우 `count`를 출력한다.
2. 현재 실행 위치가 메인스레드가 아니라면
   1. 10,000,000/4번 루프를 돈다. 동일한 작업을 4개의 루프가 나눠서 처리하기 때문이다.
   2. 찾아낸 happycoin을 메인 스레드에 보낸다. 이때, `MessagePort` 객체를 통해 전송한다.
   3. 루프가 종료되면, `MessagePort` 객체를 통해 `done`이라는 메시지를 보낸다.

각각의 워커 스레드에서 마구잡이로 출력하지 않기 위해 한 곳에서만 출력하도록 했다.

각 스레드 수 별로 코드를 실행해보자.

```javascript
// COMMAND
$ node happycoin-threads.js

// OUTPUT, THREAD_COUNT = 2
count : 132
실행 시간 : 23592

// OUTPUT, THREAD_COUNT = 3
count : 133
실행 시간 : 18630

// OUTPUT, THREAD_COUNT = 4
count : 129
실행 시간 : 69134

// OUTPUT, THREAD_COUNT = 8
count : 128
실행 시간 : 80152
```

싱글 스레드로 작업을 처리할 때보다, 2개의 스레드로 처리할 때 속도가 2배 이상 빨랐다. 3개는 훨씬 더 빨라졌다. 엄청난 속도 향상을 보였는데 반면, 4개부터는 오히려 속도가 줄기 시작한다. 이 글을 읽는 사람들도 자신의 환경에서 테스트해보길 바란다. 이유가 과연 무엇일까?에 대한 고민을 스스로 충분히 해보고, 환경에 따른 적절한 스레드가 몇 개인지에 대한 설계를 해보자.

## Piscina를 통한 워커 풀

프로그램 부하가 점점 높아진다면 어떻게 해결할까? 우리는 이제 자연스럽게 멀티스레딩을 떠올리게 될 것이다. Node.js의 경우 특히 HTTP 요청을 처리하는 작업이 매우 자주 발생하는데, 해당 작업을 여러 스레드로 분산시켜 속도를 높여줄 수 있겠다. 예를 들어 작업 1개를 스레드 1개에 할당하고, 다 처리되면 결과를 받는 식으로 말이다. 이렇게 여러 개의 워커 스레드가 필요한 경우, 워커 스레드 풀을 만들어서 메인 스레드가 하나의 풀에 작업 처리를 요청하면 어떨까?

스레드 풀과 관련된 모듈 중 piscina(이탈리아어로 수영장)라는 모듈이 있다. 여러 개의 워커 스레드를 하나의 풀로 합쳐, 각 스레드에 작업을 할당해 주는 기능을 지원한다.

사용법은 간단하다.

1. 메인 스레드에서는 Piscina 인스턴스를 생성하고, 생성자에는 워커 스레드의 동작 코드가 담긴 `filename`을 넘기면 된다.
2. 인스턴스 내부적으로는 워커 스레드 풀을 만들어서, 들어오는 작업 요청을 할당할 큐를 설정한다.
3. 작업 할당 시 `run()` 함수를 호출하는데, 인자로는 작업을 처리할 때 필요한 값을 넘긴다.

   해당 값은 기본적으로 `postMessage()`를 통해 워커로 전달되어 소유권 이전이 아니라, 데이터가 복사된다.

4. 작업이 완료되면 프로미스를 리턴한다.
5. 그리고 워커 스레드에서는 메인 스레드에서 넘겨준 인자를 받아 작업을 수행하는 함수를 `export`한다.

```javascript
// Example 3-12

const Piscina = require('piscina');

if (!Piscina.isWorkerThread) {
  const piscina = new Piscina({ filename: './example_3-12.js' });
  piscina.run(9).then(squareRootOfNine => {
    console.log('The square root of nine is', squareRootOfNine);
  });
}

module.exports = num => Math.sqrt(num);
```

위 예시처럼 풀에서 딱 한 종류의 작업만 수행하면 괜찮지만, 여러 종류의 작업을 수행하는 경우가 대부분일 것이다. 예를 들어 0부터 10,000,000 미만의 모든 숫자에 대한 제곱근을 계산한다면 어떨까? 그러면 10,000,000번의 루프를 돌 것이다. (`console.log()` 함수를 사용하면 로그가 너무 많이 찍혀 `assert` 문으로 변경하겠다)

```javascript
// Example 3-13

const Piscina = require('piscina');
const assert = require('assert');

if (!Piscina.isWorkerThread) {
  const piscina = new Piscina({filename: './example_3-12.js'});

  for (let i = 0; i < 10000000; i++) {
    piscina.run(i).then(squareRootOfI => {
      assert.ok(typeof squareRootOfI === 'number');
    });
  }
}

module.exports = num => Math.sqrt(num);
```

하지만, 이렇게 작업하면 작업 큐가 계속해서 늘어나 결국 메모리 할당 에러가 발생한다. 이를 해결하기 위해서는 큐의 크기에 제한을 걸어야 하는데, piscina 인스턴스 생성자에 `maxQueue`라는 옵션을 넣을 수 있다. piscina 개발자들이 가장 이상적인 값으로는 스레드 개수의 제곱으로 설정한다고 한다. 그대로 적용하기 위해서는 `auto`로 설정하면 된다.

```javascript
const piscina = new Piscina({ filename: './example_3-12.js', maxQueue: "auto" });
```

이제 큐의 크기에 제한을 걸었다. 큐가 꽉 찼을 때를 대비해야할 텐데, 방법은 두 가지다.

1. `piscina.queueSize`, `piscina.options.maxQueue` 값을 서로 비교한다.

   만약 서로의 값이 동일하다면 큐가 꽉 찼다는 의미다. `piscina.run()`을 호출하기 전 값을 비교한다면, 큐에 작업을 할당하기 전에 미리 확인할 수 있다.

2. `piscina.run()` 호출 시점에 큐가 가득찬 경우, 리턴되는 프로미스는 `reject`이다.

   해당 값을 이용해 처리하면 된다. 하지만 처리하기 전에, 큐에 불필요한 작업 할당 시도가 있을 수 있다.


큐가 가득찼을 때에는 piscina 모듈의 `drain`이라는 이벤트를 통해 큐가 비는 시점을 알 수 있다.

```javascript
// Example 3-14

const Piscina = require('piscina');
const assert = require('assert');
const { once } = require('events');

if (!Piscina.isWorkerThread) {
  const piscina = new Piscina({
    filename: './example_3-12.js',
    maxQueue: "auto",
  });

  (async () => {
    for (let i = 0; i < 10000000; i++) {
			// 두 값이 동일하면, 큐가 꽉 참
      if (piscina.queueSize === piscina.options.maxQueue) {
				// drain 이벤트가 발생할 때까지 기다린 다음, 새로운 태스크를 큐에 할당
        await once(piscina, 'drain');
      }

      piscina.run(i).then(squareRootOfI => {
        assert.ok(typeof squareRootOfI === 'number');
      });
    }
  })();
}
```

이제 실행하게 되면, 메모리 할당 에러가 발생하지 않을 것이다. 이후에는 piscina를 통해 happycoin을 채굴해보자.

## Happycoin으로 가득 찬 풀

Happycoin 코드에 piscina 모듈을 적용할 것이다. 기존에는 happycoin을 찾을 때마다 메인 스레드에 값을 보냈다. 이번에는 happycoin을 찾으면 그 값을 한 곳에 모아뒀다가, 코드가 종료되는 시점에 한 번에 내보낼 것이다. 이러면 굳이 `MessagePort`를 통해 매번 메인 스레드에 값을 보낼 필요가 없다. 차이점은, 결과를 보기 위해 프로그램이 끝날 때까지 기다려야한다는 것이다.

```javascript
import crypto from 'crypto';
import Piscina from 'piscina';

const big64arr = new BigUint64Array(1);
const random64 = () => {
  crypto.randomFillSync(big64arr);
  return big64arr[0];
};

const sumDigitsSquared = (num) => {
  let total = 0n;
  while (num > 0) {
    const numModBase = num % 10n;
    total += numModBase ** 2n;
    num = num / 10n;
  }

  return total;
};

const isHappy = (num) => {
  while (num != 1n && num != 4n) {
    num = sumDigitsSquared(num);
  }
  return num === 1n;
};

const isHappycoin = (num) => {
  return isHappy(num) && num % 10000n === 0n;
};

const THREAD_COUNT = 8;

if (!Piscina.isWorkerThread) {
  const piscina = new Piscina({
    filename: './happycoin/happycoin-piscina.js',
    minThreads: THREAD_COUNT,
    maxThreads: THREAD_COUNT,
  });

  let done = 0;
  let count = 0;

  for (let i = 0; i < THREAD_COUNT; i++) {
    (async () => {
      const { total, happycoins } = await piscina.run();
      process.stdout.write(happycoins);
      count += total;

      if (++done === THREAD_COUNT) {
        console.log(`\ncount : ${count}\n`);
      }
    })();
  }
}
```

이제 아래 내용을 넣어볼게요. 워커 스레드에서 실행할 함수를 `export`한 부분입니다.

```javascript
exports = () => {
  let happycoins = '';
  let total = 0;

  for (let i = 0; i < 10000000/THREAD_COUNT; i++) {
    const randomNum = random64();

    if (isHappycoin(randomNum)) {
      happycoins += randomNum.toString() + ' ';
      total++;
    }
  }

  return { total, happycoins };
};
```

실행해보면, 결과는 비슷하지만 하나씩 출력되는 것이 아니라, 한 꺼번에 출력된다. 이번 작업은 piscina 모듈의 일반적인 사용법과는 다르다. 보통은 독립적인 역할을 수행하는 작업이 여러 개 있고, 작업의 순서와 작업량을 고려해 큐에 담는다. 하지만, 메인 스레드에서 10,000,000번 도는 루프가 있고, 루프를 돌 때마다 매번 큐에 작업을 할당하고 응답을 기다렸다면 단일 스레드에서 실행하는 것과 비슷할 정도로 느릴 것이다.

# 공유 메모리

그동안은 멀티스레딩 구현에 있어 메시지 패싱 API를 통해 이벤트 루프에 전적으로 맡겼다. 하지만, 이번에는 `Atomics`와 `SharedArrayBuffer`를 이용해 공유 메모리로 멀티스레딩을 구현해보자.

## 공유 메모리 입문

### 브라우저에서 공유 메모리 사용하기

아주 기초적인 웹 워커 통신 애플리케이션을 구현해보자. `postMessage()`는 여전히 나오지만, 아주 기본적인 부분만 사용한다.

```javascript
// Example 4-1

<html>
    <head>
        <title>Shared Memory Hello World</title>
        <script src="example_4-2.js"></script>
    </head>
</html>
```

```javascript
// Example 4-2

import {Worker} from "worker_threads";

if (!crossOriginIsolated) {
  throw new Error('Cannot use SharedArrayBuffer');
}

const worker = new Worker('example_4-3.js');

const buffer = new SharedArrayBuffer(1024);
const view = new Uint8Array(buffer);

console.log('now', view[0]);

worker.postMessage(buffer);

setTimeout(() => {
  console.log('later', view[0]);
  console.log('prop', buffer.foo);
}, 500);
```

일단, 이전에 만들었던 코드와 유사하다. 다른 특징은 브라우저 전역 변수인 `crossOriginIsolated` 값을 확인해, `SharedArrayBuffer` 인스턴스 생성 가능 여부를 확인할 수 있다([스펙터 버그](https://ko.wikipedia.org/wiki/%EC%8A%A4%ED%8E%99%ED%84%B0_(%EB%B2%84%EA%B7%B8))). 이를 위해 HTTP 헤더를 다음과 같이 설정하자.

```javascript
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

테스트 환경에서는 위 헤더를 자동으로 설정하지만, 상용화된 앱에서 SharedArrayBuffer를 사용할 경우 반드시 설정하자.

위 코드에서는 워커 인스턴스를 생성한 다음, SharedArrayBuffer 인스턴스를 생성했다. 인자 1,024는 버퍼에 할당된 바이트 개수를 나타낸다. 다른 버퍼 객체와 달리, SharedArrayBuffer 객체를 생성하면 이후 줄이거나 늘릴 수가 없다.

이후 나오는 변수 view는 버퍼를 읽고 쓰는 수단이다. 뷰를 사용하는 방법은 배열의 요소에 접근할 때 인덱스를 사용하는 것과 동일하다. 코드에서는 view[0]를 확인한 후, worker.postMessage() 함수에 buffer 인스턴스를 넘긴다.

```javascript
// Example 4-3

self.onmessage = ({ data: buffer }) => {
  buffer.foo = 42;
  const view = new Uint8Array(buffer);

  view[0] = 2;

  console.log('updated in worker');
};
```

onmessage 이벤트 핸들러를 구현했다.

1. example_4-2에서 postMessage() 함수가 호출되면, 뒤이어 이 핸들러가 호출된다.
2. 그리고 인자로 넘어온 buffer를 읽어들인다.
3. buffer.foo 속성을 할당한다.
4. buffer에 대한 새로운 뷰를 붙인다.
5. 새로운 뷰로 버퍼값을 업데이트한다.

### Node.js의 공유 메모리

```javascript
// Example 4-4

import { Worker } from 'worker_threads';

const worker = new Worker('./example_4-5.js');

const buffer = new SharedArrayBuffer(1024);
const view = new BigUint64Array(buffer);

console.log('now', view[0]);

worker.postMessage(buffer);

setTimeout(() => {
  console.log('later', view[0]);
  console.log('prop', buffer.foo);
  worker.unref();
}, 500);
```

```javascript
// Example 4-5

import { parentPort } from "worker_threads";

parentPort.on('message', (buffer) => {
  buffer.foo = 1;
  const view = new Uint8Array(buffer);
  view[0] = 2;
  console.log('updated in worker');
});
```

이전 코드와 거의 유사하다. 다만, `worker.unref()`를 호출하여 워커 스레드가 무한정 돌아가지 않고 종료되게 한다. 이후 워커 스레드 코드를 구현하여 `parentPort` 속성을 사용한다. (브라우저와 같이 `self.onmessage`를 사용할 수 없기 때문이다)

```javascript
// COMMAND
node ./example_4-4.js

// OUTPUT
now 0n
updated in worker
later 2n
prop undefined
```

첫 번째 로그는 메인 스레드에서 출력되었고, `buffer`의 초기값이다. 이후 로그는 워커 스레드에서, 그 이후 출력된 값은 `2`로 변경되었다.

마지막 `buffer.foo`를 출력한 로그는 왜 `undefined`가 떴을까? 사실 스레드 간 공유한 것은 저장된 메모리 위치의 레퍼런스다. `buffer` 객체 자체는 공유되지 않는다. (공유된다면 구조화된 클론 알고리즘 법칙을 저해하는 것이다. 해당 법칙은 서로 다른 스레드 간 객체 레퍼런스를 공유할 수 없다)

## SharedArrayBuffer와 TypedArrays

전통적으로 자바스크립트 언어에서는 바이너리 데이터를 직접 다루는 기능을 지원하지 않았다.

- 문자열? 문자열은 데이터 스토리지 메커니즘을 추상화한 개념이다.
- 배열? 배열에 여러 가지 타입의 값을 담기는 하지만 버퍼라고 하기엔 적합하지 않다.

Node.js가 등장하고, 웹 페이지 외부에서 자바스크립트를 실행하는 것이 가능해지며 달라졌다. Node.js 런타임을 통해 우리는 파일시스템을 용이하게 읽고 쓸 수 있으며, 네트워크를 통한 데이터 스트리밍을 할 수 있다. 이때 상호작용하는 데이터는 ASCII 기반의 텍스트 파일, 바이너리 데이터 등이 포함된다. 이때 활용하기 위해 `Buffer` 클래스가 탄생했다.

자바스크립트 언어 자체의 제한으로, 이를 대신할 API가 개발되었고 브라우저 외부 컨텍스트와 상호작용이 가능해졌다. 결과적으로 먼저 `ArrayBuffer`, 뒤따라 `SharedArrayBuffer` 객체가 탄생했고, 자바스크립트 언어의 핵심이 됐다.

`ArrayBuffer`, `SharedArrayBuffer`는 정해진 크기의 바이너리 데이터를 담는 버퍼다. 바이너리 데이터는 말 그대로 2진수로 된 데이터를 말한다. 직접 버퍼 인스턴스 값을 콘솔 로그로 출력하면 16진수로 표현될 것이다. 예를 들어 0x54(접두사 0x는 10진수, 0b는 2진수)라는 값은 두 가지의 수로 나타낼 수 있다. 대문자 T, 10진수 84. 이를 결정하는 것은 문맥이다.

메모리값만 보아서는 해당 데이터를 파악하기 어렵다. 또한 버퍼에 저장된 데이터를 직접 수정할 수가 없기 때문에 뷰를 먼저 생성해 데이터를 수정해야 한다.

`ArrayBuffer`, `SharedArrayBuffer`의 부모 클래스는 `Object`이다. `Object`에서 속성과 메서드를 상속받으며, 자식 클래스에 버퍼의 바이트 길이를 나타내는 `read-only byteLength`, 인자로 넘긴 범윗값에 해당하는 버퍼 데이터를 리턴하는 `slice(begin, end)` 메서드다.

```javascript
// EXAMPLE
const ab = new ArrayBuffer(8);
const view = new Uint8Array(ab);

for (let i = 0; i < 8; i++) view[i] = i;

console.log(view);

console.log('bytelength', ab.byteLength);
console.log('slice 0, 3', ab.slice(0, 3));
console.log('slice 3, 5', ab.slice(3, 5));
console.log('slice 3, 5\'s bytelength', ab.slice(3, 5).byteLength);
console.log('slice -2, 7', ab.slice(-2, 7));
console.log('slice -5, -3', ab.slice(-5, -3));
console.log('array buffer', ab);

// OUTPUTS on Node.js
Uint8Array(8) [
  0, 1, 2, 3,
  4, 5, 6, 7
]
bytelength 8
slice 0, 3 ArrayBuffer { [Uint8Contents]: <00 01 02>, byteLength: 3 }
slice 3, 5 ArrayBuffer { [Uint8Contents]: <03 04>, byteLength: 2 }
slice 3, 5's bytelength 2
slice -2, 7 ArrayBuffer { [Uint8Contents]: <06>, byteLength: 1 }
slice -5, -3 ArrayBuffer { [Uint8Contents]: <03 04>, byteLength: 2 }
array buffer ArrayBuffer {
  [Uint8Contents]: <00 01 02 03 04 05 06 07>,
  byteLength: 8
}

// OUTPUTS on Chrome
Uint8Array(8) [0, 1, 2, 3, 4, 5, 6, 7, buffer: ArrayBuffer(8), byteLength: 8, byteOffset: 0, length: 8, Symbol(Symbol.toStringTag): 'Uint8Array']
51-3783436a3f5768d6.js:1 bytelength 8
51-3783436a3f5768d6.js:1 slice 0, 3 ArrayBuffer(3)
51-3783436a3f5768d6.js:1 slice 3, 5 ArrayBuffer(2)
51-3783436a3f5768d6.js:1 slice 3, 5's bytelength 2
51-3783436a3f5768d6.js:1 slice -2, 7 ArrayBuffer(1)
51-3783436a3f5768d6.js:1 slice -5, -3 ArrayBuffer(2)
51-3783436a3f5768d6.js:1 array buffer ArrayBuffer(8)
```

`ArrayBuffer`는 자바스크립트 환경에 따라 다른 방식으로 출력된다. Node.js는 `Uint8Array` 뷰를 통해 읽어들인 것처럼 16진수 형태로 출력한다. 크롬에서는 여러 종류의 뷰로 읽어들인 값을 하나의 객체에 담아 보여준다. 그리고 파이어폭스에서는 데이터가 출력되지 않는다. 출력하기 위해서는 뷰를 생성해 읽어들여야 한다.

뷰의 부모 클래스는 `TypedArray` 클래스다. `TypedArray`는 별도 인스턴스로 생성하거나 전역 객체로 사용할 수가 없다. 대신 자식 클래스의 인스턴스를 생성해 `prototype` 속성에 접근할 수 있다.

참고로, `Uint8Array`를 사용하면, 2진수 8비트의 최대값까지만 기록이 가능하다. 즉, 0부터 255까지만 기록할 수 있다. 맨 앞의 U는 `unsinged`, 양수만 담을 수 있다는 뜻이고, 없다면 음수도 가능하다. 첫 번째 비트가 0이면 양수를, 1이면 음수를 나타낸다.

자바스크립트에는 `integer` 타입이 없고, `Number` 타입이 존재한다. 부동 소수점 형식인데, 이는 `Float64`와 동일한 데이터 형식이다. `Float64`가 아닌 다른 형식의 데이터를 뷰에 할당할 경우 자바스크립트 내부적으로 숫자 변환을 시킨다. `Float64Array` 뷰에 어떤 숫자를 할당하면 원래 값을 거의 그대로 유지한다. 만약 `Float32Array` 뷰에 어떤 숫자를 대입하면, 해당 뷰를 통해 표현할 수 있는 숫자의 최솟/최댓값 범위는 줄고, 소수점 정확도 범위도 줄어든다.

```javascript
// EXAMPLE

const buffer = new ArrayBuffer(16);

const view64 = new Float64Array(buffer);
view64[0] = 1.123456789123456789;
console.log(view64[0]);

const view32 = new Float32Array(buffer);
view32[2] = 1.123456789123456789;
console.log(view32[2]);

// OUTPUT
1.1234567891234568
1.1234568357467651
```

`Float64Array` 뷰는 소수점 16번째까지 정확도가 유지되지만, `Float32Array` 뷰는 소수점 6번째까지만 정확도가 유지된다.

짚고 넘어가야 할 부분이 있다. 위 코드에서 버퍼를 가리키는 `TypedArray` 인스턴스가 2개다. 각각의 뷰에 값을 적용한 이후 바로 버퍼를 출력해보면 아래와 같다.

```javascript
// view64
ArrayBuffer {
  [Uint8Contents]: <16 12 7c d3 ad f9 f1 3f 00 00 00 00 00 00 00 00>,
  byteLength: 16
}

// view32
ArrayBuffer {
  [Uint8Contents]: <16 12 7c d3 ad f9 f1 3f 6f cd 8f 3f 00 00 00 00>,
  byteLength: 16
}
```

만약, `view64[1]`, `view32[0]`을 읽어들이면 어떤 결과가 나올까?

```javascript
console.log(view64[1]);
console.log(view32[0]);

// OUTPUT
5.268660944e-315
-1082635190272
```

이런 말도 안 되지만 사실 굉장히 합리적인 결과가 나오게 된다. 하나의 데이터를 표현하는 메모리 공간이 2가지 종류의 뷰에 의해 잘리거나, 합쳐지면서 새로운 값이 표현된다. 또한, `nonfloat` 타입 `TypedArray` 뷰의 경우, 뷰의 지원 범위를 벗어난 값이 대입되면 특정한 변환 과정을 거친다. 먼저, 소수점 자릿수는 소거되어 정수로 변환된다. 범위를 벗어난 값은 0으로 리셋된다. `Uint8Array`를 사용해서 테스트해 보자.

```javascript
// EXAMPLE
const buffer = new ArrayBuffer(8);
const view = new Uint8Array(buffer);

view[0] = 255;
view[1] = 256;
view[2] = 257;
view[3] = 1.1;
view[4] = -1;
view[5] = -1.9;

console.log(view[0]);
console.log(view[1]);
console.log(view[2]);
console.log(view[3]);
console.log(view[4]);
console.log(view[5]);

// OUTPUT
255
0
1
1
255
255
```

## 데이터 가공을 위한 Atomic 메서드

원자성(Atomicity)이라는 말이 있다. 데이터베이스에서 ACID 트랜잭션 특성의 제일 첫 번째인 A에 해당한다. 원자성은, 트랜잭션의 연산이 여러 개의 작은 단계로 구성될 때 모든 단계가 완전히 성공하거나, 그렇지 않다면 어떤 단계도 수행되지 않아야 하는 것이다. 예를 들어, 데이터베이스에 1개의 쿼리를 던지면 이는 원자성을 보장한다. 하지만 3개의 쿼리를 던지면 이는 원자성을 보장하지 않는다.

반면, 3개의 쿼리를 하나의 데이터베이스 트랜잭션으로 감싼다면, 이 트랜잭션은 원자성을 보장한다. 모두 성공하거나, 그렇지 않다면 어떤 쿼리도 수행하지 않는다. 이렇게 하지 않는다면 동일한 상탯값에 동시에 접근하는 등의 부작용이 있을 것이다. 여기서 독립성이라는 개념이 나오는데, 하나의 연산을 수행할 때, 다른 종류의 연산이 끼어들지 않아야 한다는 것이다(새치기).

자바스크립트에 Atomics라는 전역 객체가 있는데, 모든 속성과 메서드는 정적이다. new 생성자를 통해 생성할 수 없다는 의미다. 우리에게 익숙한 Math 전역 객체와 비슷한 특징이다.

### 메서드

**add 메서드**는 typedArray의 index 위치에 있는 값에 value 를 더한다. 그리고 더하기 전의 기존 값을 리턴한다.

```javascript
old = Atomics.add(typedArray, index, value);
```

**and 메서드**는 typedArray의 index 위치에 있는 값에 value를 곱한다.

```javascript
old = Atomics.and(typedArray, index, value);
```

**compreExchange 메서드**는 oldExpectedValue 값이 typedArray의 index 위치에 있는 값과 동일한지 확인한다. 동일하다면, 그 값을 value 값으로 교체하고, 그렇지 않다면 아무 작업도 수행하지 않는다.

교체 성공 여부는 oldExpectedValue와 old 값을 서로 비교하여 동일한지 확인하면 된다.

```javascript
old = Atomics.compareExchange(typedArray, index, oldExpectedValue, value);
```

**exchange 메서드**는 typedArray의 index 위치에 있는 값을 value 값으로 교체한다. 역시 기존 값을 리턴한다.

```javascript
old = Atomics.exchange(typedArray, index, value);
```

**isLockFree 메서드**는 size 값이 TypedArray 객체의 BYTES_PER_ELEMENT 속성에 포함되는지 확인한다. true라면, Atomics를 통해 고성능의 알고리즘을 구현할 수 있다.

```javascript
free = Atomics.isLockFree(size);
```

**load 메서드**는 typedArray의 index 위치에 있는 값을 리턴한다.

```javascript
value = Atomics.load(typedArray, index);
```

**or 메서드**는 typedArray의 index위치에 있는 값과 value 값에 대해 OR 연산을 수행한다. 역시 기존 값을 리턴

```javascript
old = Atomics.or(typedArray, index, value);
```

**store 메서드**는 typeArray의 index 위치에 value 값을 대입한다. 이후 value 값을 반환한다.

```javascript
value = Atomics.store(typedArray, index, value);
```

**sub 메서드**는 typedArray의 index 위치에 있는 값에서 value 값을 뺀다. 역시 기존 값을 리턴한다.

```javascript
old = Atomics.sub(typedArray, index, value);
```

**xor 메서드**는 typedArray의 index 위치에 있는 값과 value 값에 대해 XOR 연산을 수행한다. 역시 기존 값 리턴

```javascript
old = Atomics.xor(typedArray, index, value);
```

## 원자성에 대한 논의

위에서 언급한 메서드는 모두 원자성을 보장하여 수행한다. 예시 코드를 작성해보자.

```javascript
const typedArray = new Uint8Array();

typedArray[0] = 7;

let old1 = Atomics.compareExchange(typedArray, 0, 7, 1);
let old2 = Atomics.compareExchange(typedArray, 0, 7, 2);
```

위 두 개의 메서드는 어떤 순서로 호출되는지 누구도 알 수 없다. 동시에 실행될 수도 있다. 하지만, Atomic 객체가 원자성을 보장하는 덕분에, 2개 중 1개의 스레드만 초기값인 7을 반환받고, 다른 스레드는 업데이트된 값인 1 혹은 2를 반환받는다.

![스크린샷 2023-12-14 오후 5 19 11](https://github.com/currenjin/currenjin.github.io/assets/60500649/be7d2f6d-4602-43dc-80da-4e1b7dfd9e4c)

반면 비원자성 코드로 바꾸어보면, 잘못된 값이 대입되는 이슈가 생길 수 있다.

```javascript
const old = typedArray[0];
if (old === 7) {
  typedArray[0] = 1;
}
```

해당 코드에서 여러 개의 스레드가 동일한 데이터를 공유하면서 이 데이터에 접근을 시도한다. 코드가 정상적으로 동작하기 위해서는, 하나의 스레드가 데이터를 사용하고 있을 때 다른 스레드가 해당 데이터에 접근하지 못하도록 해야 한다. 즉, 하나의 스레드에만 공유 자원에 대한 독점적인 접근을 허용해야 한다. 이것을 임계 구역(Critical Section)이라고 한다. (독립성)

![스크린샷 2023-12-14 오후 5 33 16](https://github.com/currenjin/currenjin.github.io/assets/60500649/1970eb53-0c40-439b-a788-d5d96d45b4d5)

2개의 스레드 모두 값을 변경했고, 에러가 발생하지 않았다. 하지만 실제 동작이 성공한 스레드는 Thread #2 뿐이다. 이러한 상황을 경쟁 상태(race condition)이라고 한다. 말 그대로 2개 이상의 스레드가 동일한 동작을 놓고 경쟁하는 상태를 말한다.

버퍼를 다루면서 Atomics 객체를 통해 원자성을 보장하고 싶다면, 버퍼에 직접 접근할 때 Atomics 객체의 메서드를 적절히 활용해야 한다. 만약 동일한 버퍼에 대해 스레드 하나는 Atomics 객체로 접근하고, 또다른 스레드는 직접 읽고 쓴다면 어떨까? 데이터에 비정상적인 값이 대입될 수 있고, 예상치 못한 문제가 발생할 것이다. Atomics 객체를 통해 접근한다면, 암시적 잠금(implictic lock)을 걸어 원자성을 보장해준다.

## 데이터 직렬화

버퍼에는 다양한 값이 들어갈 수 있다. 그 타입에는 숫자, 문자열, 객체 등을 사용할 수도 있다. 이 경우 데이터를 버퍼에 쓰기 전에 직렬화를, 읽어들일 때는 역직렬화를 거쳐야 한다.

다양한 직렬화 도구들이 존재한다. 다만, 데이터의 크기와 직렬화 성능 간에 트레이드 오프가 발생하는 것이 공통적인 특징이다.

### Boolean

Boolean 타입에 담을 수 있는 값의 최소 단위는 1비트이다. 버퍼에 Boolean 값을 저장하기 위해서는 Uint8Array와 같은 최소 단위의 뷰를 생성하고, 1바이트짜리 ArrayBuffer와 연결하면 된다. 그렇게되면 1바이트에 최대 8개의 불 값을 저장할 수 있다. 또한, 대량의 불 값을 처리할 경우, 불 인스턴스를 1개씩 만드는 것보다 버퍼에 한꺼번에 저장하는 편이 성능 오버헤드 측면에서 더 낫다.

```javascript
Buffer : [0][0][1][0][1][1][0][1]
```

위와 같이 각 비트에 불 값을 저장하는데, 맨 오른쪽부터 한 칸씩 왼쪽으로 이동하며 저장하는 것이 좋다. 저장해야 할 불 값이 클수록, 버퍼의 사이즈도 커져야 하며, 또 값이 저장된 기존 비트 영역은 그대로 유지되어야 하기 때문이다. 버퍼의 사이즈는 오른쪽으로 늘어나니까 말이다.

만약 값을 저장하는 버퍼의 크기가 1바이트였다가, 2바이트로 늘어난다고 가정해보자. 맨 오른쪽 비트만 사용했을 경우, 0과 1만 사용할 수 있다. 하지만 맨 왼쪽 비트를 사용하면, 버퍼의 크기가 1바이트일 때에는 0 혹은 128이며, 2바이트가 되면 0 혹은 32,768로 늘어난다. 이렇게되면 앱 버전이 달라지는 과정에서 버퍼의 기존 값을 유지하기 어려워진다.

```javascript
const buffer = new ArrayBuffer(1);
const view = new Uint8Array(buffer);

const setBool = (slot, value) => {
  view[0] = (view[0] & ~(1 << slot)) | ((value | 0) << slot);
};

const getBool = (slot) => {
  return !((view[0] & (1 << slot)) === 0);
};
```

위 코드에서는 1바이트짜리 버퍼를 생성한 뒤, 뷰를 생성한다. 이제 버퍼의 맨 오른쪽 비트부터 시작하는데, 1로 설정하기 위해서는 `setBool(0, true)`를 실행하면 된다. 비트를 0으로 설정하기 위해서는 `setBool(1, false)`를 실행한다. 그 다음 비트값을 읽어들인다면 `getBool(2)`를 실행하면 된다.

setBool()

1. 인자로 넘어온 불 값 value를 정수로 변환한다(value | 0은 false → 0, true → 1로 변환한다).
2. 값을 왼쪽으로 시프트하기 위해 오른편에 저장할 위치 slot의 개수만큼 0을 붙인다.
3. ~연산자를 통해 비트를 반전시키고, 이 값을 기존 값과 비트 AND 연산을 수행한다.
4. 이렇게 나온 값은 맨 오른편 연산값과 OR 연산을 수행한다.

getBool()

1. 1이라는 숫자를 slot의 개수만큼 왼쪽으로 시프트한다.
2. & 연산자를 통해 기존의 view[0] 값과 비교한다.
3. 시프트된 값과 기존 값에 대해 AND 연산을 수행한다. slot 위치의 값이나 0이 온다.
4. 나온 값이 0과 동일한지 확인하고 ! 연산자를 통해 반댓값으로 반환한다.

상용화할 때에는 slot의 위치가 8번째 비트를 넘는 시점에 대한 처리를 해줘야 한다. 이런 경우에는 경계 검사(bounds chechking)를 수행하는 것이 낫다.

### 문자열

ASCII 코드 기반의 간단한 문자열의 경우, 문자는 1개의 1바이트로 표현이 가능하다. 하지만, 우리는 문명 시대에 살고 있으면서 모든 문자를 1바이트 범위 내로 표현하는 것이 불가능하다. 대신 몇 개의 바이트를 통해 문자를 숫자로 표현하는 인코딩 시스템을 사용해야 한다. 인코딩 형식 중 하나는 UTF-16인데, 2-4바이트를 사용해 문자를 표현하고, 최대 4바이트를 통해 이모지를 표현한다. 조금 더 보편적인 건 UTF-8. 문자는 1-4바이트 범위 내에서 표현하며, 1바이트 범위에는 ASCII 코드와도 호환된다.

```javascript
const stringToArrayBuffer = (string) => {
  const buffer = new ArrayBuffer(string.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < string.length; i++) view[i] = string.charCodeAt(i);

  return view;
};

console.log(stringToArrayBuffer('foo'));
console.log(stringToArrayBuffer('€'));

// OUTPUT
Uint8Array(3) [ 102, 111, 111 ]
Uint8Array(1) [ 172 ]
```

foo라는 단순한 문자열은 성공했지만, 유로 기호는 이상한 값이 나온다(숫자로는 8,364이다).

최신 자바스크립트에서 제공되는 API를 통해 직접 인코딩/디코딩이 가능하다. 전역 객체인 `TextEncoder`, `TextDecoder`이다. 둘 다 생성자 함수를 통해 만들 수 있고, 브라우저와 Node.js 모두 사용 가능하다. (UTF-8을 사용한다)

```javascript
const enc = new TextEncoder();
const dec = new TextDecoder();

const buffer1 = new ArrayBuffer(3);
const view1 = new Uint8Array(buffer1);

view1[0] = 226; view1[1] = 130; view1[2] = 172;

console.log(enc.encode('€'));
console.log(dec.decode(buffer1));
console.log(dec.decode(view1));

// OUTPUT
Uint8Array(3) [ 226, 130, 172 ]
€
€
```

여기서 알아둬야 할 점은, `decode()` 함수의 인자로 `Uint8Array` 뷰를 넘길 수도 있고, 해당 뷰가 가리키는 `ArrayBuffer` 자체를 넘길 수도 있다는 것이다. 버퍼에 뷰를 연결할 필요도 없이, 네트워크로부터 전송된 데이터를 바로 디코딩할 수 있다는 장점이 있다.

### 객체 타입

객체 역시 TextEncoder API를 활용해 JSON으로 변환한 뒤, 버퍼에 쓰는 것이 가능하다.

```javascript
const enc = new TextEncoder();
const dec = new TextDecoder();

const obj = { 'name': 'currenjin', 'age': 24 };

const encodedObj = enc.encode(JSON.stringify(obj));
const decodedObj = dec.decode(encodedObj);

console.log(encodedObj);
console.log(decodedObj);

// OUTPUT
Uint8Array(29) [
  123,  34, 110,  97, 109, 101,  34,
   58,  34,  99, 117, 114, 114, 101,
  110, 106, 105, 110,  34,  44,  34,
   97, 103, 101,  34,  58,  50,  52,
  125
]
{"name":"currenjin","age":24}
```

JSON 객체는 obj 객체를 받아 문자열로 변환한다. 하지만 결과를 보면 불필요한 공백이 포함되어 있다. 이러한 페이로드를 줄이려면 MessagePack 같은 모듈을 사용하면 된다. 객체 메타데이터를 바이너리화하여, 직렬화된 객체의 크기를 줄여주는 역할을 한다.

### 마무리

스레드 통신의 성능을 좌우하는 요소에 있어서, 전송되는 페이로드의 크기보다는 페이로드를 직렬화/역직렬화하는 부분에서 성능의 차이가 크게 발생한다. 따라서 데이터를 좀 더 단순화시켜 스레드에 전송하는 것이 좋다. 심지어 스레드에 객체를 전송할 때도, 직렬화된 객체를 버퍼에 쓰는 것보다는 구조화된 복제 알고리즘에 기반한 `.onmessage`와 `.postMessage` 메서드를 사용하는 것이 속도 및 보안성 측면에서 더 낫다.

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