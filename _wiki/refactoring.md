---
layout  : wiki
title   : Refactoring
summary :
date    : 2022-07-30 14:00:00 +0900
updated : 2022-07-30 14:00:00 +0900
tags     : refactor
toc     : true
public  : true
parent  : [[index]]
latex   : true
---
* TOC
{:toc}

# Refactoring

## 메소드 옮기기

메소드를 원래 있어야 할 장소로 옮기려면 어떻게 해야할까요?<br>
어울리는 클래스에 메소드를 추가해 주고, 그것을 호출하게 합니다.<br>
<br>

### 방법

1. 메소드를 복사합니다.
2. 원하는 클래스에 붙이고 이름을 적절히 지어줍니다.
3. 객체가 메소드 내부를 참조한다면, 객체를 새 메소드의 매개 변수로 추가합니다. 필드들이 참조되고 있다면 그것들도 매개 변수로 추가합니다.
4. 기존 메소드의 내부를 지우고, 그곳에 새 메소드를 호출하는 코드를 넣습니다.

켄트 벡이 좋아하는 컨설팅 리팩토링 중 하나입니다. 예상 하지 못한 부분을 발견하는 데에 탁월한 방법이기 때문입니다.<br>
<br>

Shape 는 면적을 계산하는 책임을 갖고 있습니다.<br>
<br>

**Shape**

```java
int width = bounds.right() - bounds.left();
int height = bounds.bottom() - bounds.top();
int area = width * height;
```

한 메소드에서 다른 객체에 하나 이상의 메시지를 보내는 것은 의심할 만한 사항입니다. 이 경우 bounds(Rectangle instance)로 네 개의 메시지가 보내지고 있습니다.<br>
해당 부분을 옮겨 봅시다.<br>
<br>

**Rectangle**

```java
public int area() {
        int width = this.right() - this.left();
        int height = this.bottom() - this.top();
        
        return width * height;
}
```

<br>

**Shape**

```java
int area = bounds.area();
```

메소드 옮기기는 이런 특징을 갖고 있습니다.

- 코드에 대한 깊은 이해가 없어도 언제 이 리팩토링이 필요한 지 쉽게 알 수 있습니다. 그저 다른 객체에 대한 두 개 이상의 메시지를 보내는 코드를 볼 때마다 메소드를 옮겨주면 됩니다.
- 리팩토링 절차가 빠르고 안전합니다.
- 가끔은 새로운 소식을 알려줍니다. "이렇게 하면 Rectangle 이 아무 계산도 하지 않네? 이렇게 하는게 더 좋겠네."

<br>

#### 참조

참조
