---
layout  : post
title   : [Consider - The Clean Coder] 테스트 주도 개발
summary : consider, clean coder, TDD
date    : 2024-06-23 13:00:00 +0900
tag     : consider clean-coder tdd
resource: 2A/73EE4A-1FD5-4EC0-8FA1-73F624DF978F
toc     : true
comment : true
public  : true
---
* TOC
  {:toc}

# 테스트 주도 개발

## 밥 아저씨가 생각하는 테스트 주도 개발

### TDD의 세 가지 법칙

1. 실패한 단위 테스트를 만들기 전에는 제품 코드를 만들지 않는다.
2. 컴파일이 안 되거나 실패한 단위 테스트가 있으면 더 이상의 단위 테스트를 만들지 않는다.
3. 실패한 단위 테스트를 통과하는 이상의 제품 코드는 만들지 않는다.

### 확신

FitNesse의 코드는 6만 4천 줄인데, 그중 2만 8천 줄은 테스트 코드다.

어떤 부분이라도 바꾸게 되면 별 생각 없이 단위 테스트 코드를 돌리는데, 통과하면 내가 만든 변경이 다른 부분을 망가뜨리지 않았다고 거의 확신할 수 있다.

### 용기

믿음직한 테스트 묶음이 있으면 변경에 대한 두려움이 모두 사라진다. 나쁜 코드가 보이면 그저 그 자리를 깨끗이 치우면 된다.

### 문서화

세 가지 법칙에 따라 만든 각 단위 테스트는 코드로 만든 에제이며 시스템을 어떻게 사용해야 하는지 알려준다.

단위 테스트는 문서다. 시스템의 가장 낮은 단계의 설계를 알려준다. 낮은 단계에 대한 문서 중 가장 훌륭한 형태다.

### 설계

테스트를 먼저 만드는 일은 의존성이 낮은 좋은 설계를 만드는 힘이 된다.

"나는 테스트를 나중에 만들 수 있어요."라는 말은 틀렸다. 사실이 아니며 만들 수 없다. 일이 벌어진 후에 만드는 테스트는 수비다. 먼저 만드는 테스트는 공격이다.

## 내가 생각하는 테스트 주도 개발

나는 테스트 주도 개발을 좋아한다. 아니, 좋아하다 못해 사랑한다. TDD가 추구하는 방향은 내가 추구하는 방향과 많은 의미에서 맞닿아 있다.

**첫 번째로, 고객(유저) 중심적으로 생각할 수 있다는 점이다.** TDD는 결과물을 먼저 테스트 코드로 작성하고 이를 충족하기 위해 로직을 채운다. 로직은 딱 테스트를 충족시킬 만큼만 채운다. 다시 테스트를 추가하고 이를 충족시키는 로직을 채우며 사이클을 반복한다.

나는 사용자에게 빠르면서 핵심적인 가치를 전달하고 싶다. 이를 위해서는 정말 필요한 일들만 하는 훈련이 필요하다. TDD는 나에게 이런 훈련을 위한 도구가 된다.

**두 번째로, 안정성을 느낄 수 있다는 점이다.** 내가 만드는 결과물이 성장해 나가는 과정에서 스텝마다의 테스트를 통해 확신을 갖고 나아간다. 이 확신은 내가 가치를 전달함에 있어서 안정성을 느끼게 해준다.

**세 번째로, 커뮤니케이션 리소스가 줄어든다.** 효율적으로 커뮤니케이션할 수 있다는 게 더 명확한 것 같다. 테스트 코드를 남겨놓으면 이 테스트 코드는 다른 사람들이 보고 이해할 수 있는 핵심적인 문서가 될 것이다.

중학생이 보고도 이해가 가는 코드를 짜는 것이 목표인 나에게는 테스트 코드라는 문서를 어떻게 하면 가독성을 좋게 만들 수 있을지 고민하게 하며 나를 성장시킨다.
