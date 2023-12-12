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