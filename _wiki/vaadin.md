---
layout  : wiki
title   : Vaadin
summary :
date    : 2022-05-13 14:30:00 +0900
updated : 2022-05-13 14:30:00 +0900
tag     : view
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Vaadin

자바에서 웹 뷰를 만들 수 있게 도와주는 프레임워크

[Documents](https://vaadin.com/docs/latest/)

다양한 UI Components 를 갖다 쓰면 된다. **_Code or Drag & Drop_**

### Example

#### Drag & Drop(with. vaadin designer)

[Vaadin Designer](https://vaadin.com/designer)

Install Vaadin Designer plugin on IntelliJ


#### Code
```java
private Component createH2() {
        H2 appName = new H2("NEW");
        appName.addClassNames("app-name");
        
        return appName;
}
```

