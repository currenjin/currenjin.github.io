---
layout  : wiki
title   : Kubernetes
summary :
date    : 2022-01-31 13:30:00 +0900
updated : 2022-01-31 13:30:00 +0900
tag     : container
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Kubernetes

## Kubernetes Cluster Architecture

![image](https://user-images.githubusercontent.com/60500649/151738561-5e8606fc-0c1a-47f4-835e-d36ab4282596.png)


**Kubernetes 클러스터**는 물리적, 가상 온프레미스 또는 클라우드에서 컨테이너 형태로 애플리케이션을 호스팅 해요. 필요에 따라 애플리케이션 인스턴스를 쉽게 배포하고 통신하죠.

이 포스팅에서 다루는 내용은 이렇습니다!

-   **Master Node**  
    etcd, controller manager, kube-apiserver, kube-scheduler
-   **Worker Node**  
    kubelet, kube-proxy, container runtime engine(docker 등)

---

### Architecture

![image](https://user-images.githubusercontent.com/60500649/151738570-9c89ac41-bf38-4cbf-a0e6-5b3fabb77959.png)

**Master Node**: Kubernetes 전체를 관리하는 책임, 노드의 정보 저장, 구성요소(메모리, 용량 등) 관리  
마스터 노드는 'etcd, Controller Manager, kube-apiserver, kube-scheduler'으로 이루어져 있어요.

**Worker Node**: 컨테이너를 로드, 모니터링 정보 저장, 로딩 프로세스 관리  
워커 노드는 kubelet, kube-proxy, Container Runtime Engine'으로 이루어져 있어요.

---

#### Master Node

> **etcd**

정보를 key-value 형식으로 저장하는 데이터베이스, 간편/빠름, 분산 신뢰가 가능한 키-밸류 스토어예요.  
우리가 kubectl get 명령 입력으로 표시되는 모든 정보는 etcd에서 가져온다는 사실!

ex) 쿠버네티스에 포함된 기능 버전을 업데이트했을 때 etcd에서 변경되면 업데이트 완료되었다고 인식해요.

> **kube-apiserver**

kubernetes의 모든 작업을 오케스트레이션, API의 외부 노출, 노드 간 통신을 담당하죠.  
kubectl 명령 실행 시 kubectl 유틸리티는 사실 kube-apiserver에 도달합니다. 명령을 수행하기 위해서요!

![image](https://user-images.githubusercontent.com/60500649/151738586-6634f693-67c3-4357-9a7f-4c4d723214e5.png)

**1) Authentication**  
먼저 사용자에게 명령을 받으면 kube-apiserver는 사용자에 대한 정보를 인증하는 과정을 거쳐요!

**2) Validate Request**  
api-server에서는 사용자 요청에 대한 유효성을 검증해요!

**3) Retrieve Data**  
검증된 요청은 etcd의 정보를 통해 응답해요!

이 때문에 kube-apiserver는 데이터 저장소(etcd)와 직접 상호작용하는 유일한 구성요소라고 하죠.

> **Controller Manager**

컨트롤러는 시스템 내 다양한 구성요소의 상태를 지속적으로 모니터링하는 프로세스예요.  
이를 통해 전체 시스템을 원하는 작동 상태로 가져오는데 효과적이랍니다.

**[Node Controller]**  
노드 상태를 모니터링하고 필요한 경우 애플리케이션을 계속 실행합니다!

-   node monitor period = default/5s  
    5초마다 노드의 상태를 확인해요.
-   node monitor grace period = default/40s  
    연결할 수 없는 것으로 표시되고, 연결의 제한이 걸리기까지의 시간이에요.
-   pod eviction timeout = default/5m  
    연결할 수 없는 것으로 표시되지 않으면 해당 시간 안에 다시 백업이 가능

노드 상태를 지속적으로 모니터링합니다. 기본적으로는 5초 간격으로 상태를 확인하죠.  
모든 노드 상태가 정상일 때, kubectl get nodes 명령을 입력한다면 모든 노드는 Ready 상태로 표시됩니다.

![image](https://user-images.githubusercontent.com/60500649/151738604-d65bfb60-257e-42d2-998d-69188cf4d785.png)


중간에 일부 노드가 사용 불가 상태가 된다면, kubectl get nodes 명령 입력 시 해당 노드는 Not Ready 상태로 표시됩니다.

![image](https://user-images.githubusercontent.com/60500649/151738610-dd03233e-e132-4372-ba89-4276bfbf8653.png)


**[Replication Controller]**  
ReplcaSet 상태를 모니터링하고 원하는 수의 Pod를 보장할 책임을 가지고 있어요!

![image](https://user-images.githubusercontent.com/60500649/151738616-5537db4e-5cf9-4ef9-82de-2bfe84835dbf.png)


만약 실행 중인 포드가 죽는다면 Replication Controller는 새로운 POD를 생성할 의무가 있어요.

![image](https://user-images.githubusercontent.com/60500649/151738626-0f92513c-e3bb-4d04-9add-4aab235c44c2.png)


**외에도 다양한 컨트롤러들이 많이 있답니다. 이들을 단일 프로세스로 표현한 게 Controller Manager. :)**

> **kube-scheduler**

어떤 노드에서 어떤 포드와 작업이 진행되는지 결정만 하는 친구예요.(작업은 Kubelet가 진행)  
어떤 포드가 어떤 노드로 가는지.. 올바른 컨테이너가 올바른 노드에서 작동하는지...

예를 들어, CPU 10이 필요한 Container를 실행시키고자한다면! kube-scheduler는 두 단계를 거쳐 적절한 노드를 찾아내요.

![image](https://user-images.githubusercontent.com/60500649/151738634-d58da139-a22b-47a9-a97d-cddcef0180d3.png)


**1. Filter Nodes**:처음 스케줄러는 메모리가 충분하지 않은 메모리를 걸러냅니다.

![image](https://user-images.githubusercontent.com/60500649/151738641-b0d58305-dc8c-435b-8c97-1682dfc9593f.png)


컨테이너는 CPU가 10만큼 필요하지만 4개밖에 없는 노드를 제외하니 2개의 노드가 남았네요.

**2. Rank Nodes**: 스케줄러가 해당 노드에 대한 순위를 랭크시킵니다.

예를들어, 스케줄러는 컨테이너를 배치 후 사용 가능한 리소스 양을 계산합니다. 이 상황에선 왼쪽의 노드는 2, 오른쪽의 노드는 6만큼 더 사용이 가능하군요.

![image](https://user-images.githubusercontent.com/60500649/151738650-714a4838-65e0-4539-9ac2-42cb4e1136b3.png)


**물론 이 작업에서는 사용자가 상황에 따라 임의로 랭크시킬 수 있답니다. 스케줄러를 잘 사용하면 매우 효율적인 컴포넌트를 만들 수 있죠.**

---

#### Worker Node

> Kubelet

마스터 노드와의 유일한 접점이라고 할 수 있어요. 노드 상태와 포드의 상태를 지속적으로 보고하는 역할을 하죠.

**1. Register Node**: kubelet은 kubernetes 클러스터로 노드를 등록합니다!

**2. Create PODs**: 노드에 컨테이너 또는 POD를 로드하는 명령을 받으면 컨테이너 실행을 요청합니다!

![image](https://user-images.githubusercontent.com/60500649/151738663-799cf28c-b267-4ff6-8263-a896bbf4fbf4.png)


이후 kubelet은 해당 컨테이너 또는 POD를 지속해서 모니터링하고 kube-apiserver에게 보고하는 책임을 갖고 있죠.

> kube-proxy

kubernetes 클러스터의 각 노드에서 실행되는 프로세스에요.  
아래 POD Network에 대한 설명을 통해 어째서 kube-proxy가 존재해야 하는지 알아보죠!

**일단 클러스터 내의 모든 포드는 다른 포드에 도달할 수 있어요. 이는 POD 네트워킹 솔루션을 클러스터에 배포해 수행이 됩니다.**

![image](https://user-images.githubusercontent.com/60500649/151738668-2f7607da-8345-4915-bb25-57176fbc4f23.png)


POD 네트워크는 모든 POD가 연결하는 클러스터의 모든 노드에 걸친 가상 네트워크에요. 이를 통해 서로 통신할 수 있는 것이죠.

예를 들어, 첫 번째 노드에 웹 어플리케이션을, 두 번째 노드에 데이터 베이스를 배포했을 때 웹 어플리케이션은 데이터베이스 POD의 IP를 이용해 데이터베이스에 도달할 수 있습니다. 하지만 데이터베이스의 IP가 항상 동일하게 유지되는 보장은 안되죠.

이 경우 우리는 서비스를 사용하면 좋아요!

![image](https://user-images.githubusercontent.com/60500649/151738675-160b1a0f-56ab-47a2-883d-f5393f788aec.png)


클러스터 전체에 (서비스의)데이터베이스 어플리케이션을 노출하면 웹 어플리케이션이 서비스 db의 이름을 사용해 데이터베이스로 액세스할 수 있습니다. 또, 포드를 사용해 서비스에 도달하려 할 때마다 서비스가 할당된 IP를 가져오는 점이 큰 장점이죠.

하지만 서비스는 POD Network에 포함될 수 없어요. 서비스가 클러스터 전체에 액세스해야 한다는 내용을 보면 참 놓기 힘든 결점일 수 있습니다.

**이때, 우리는 해결 방법으로 kube-proxy를 사용합니다.**

![image](https://user-images.githubusercontent.com/60500649/151738682-89bdbae5-667f-44eb-848a-fc84952058c2.png)


kube-proxy의 임무는 새로운 서비스를 찾으러 다니는 것이에요. 새 서비스가 생성될 때마다 적절한 서비스를 만들죠.

각 노드는 백엔드 POD로 서비스에게 트래픽을 전달합니다. 이때, IPTABLES를 활용할 수 있는데 깊은 내용이기에 더 세세한 설명은 나중에 따로 포스팅하겠습니다.

---
