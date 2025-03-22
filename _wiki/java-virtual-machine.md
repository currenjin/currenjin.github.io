---
layout  : wiki
title   : JVM(Java Virtual Machine)
summary :
date    : 2025-03-22 17:00:00 +0900
updated : 2025-03-22 17:00:00 +0900
tag     : java
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
  {:toc}

# JVM

## Class file

### 구조
> MVCATSIFMA

- `Magic number` : `0xCAFEBABE`라는 매직넘버로 클래스 파일임을 나타냄(4바이트)
- `Version` : 메이저/마이너 버전 숫자(4바이트)
  - 버전 숫자가 일치하지 않으면 런타임에 UnsupportedClassVersionError 예외 발생
- `Constant pool` : 상숫값(클래스명, 인터페이스명, 필드명 등)을 모아놓음
  - JVM은 런타임에 배치된 메모리 대신 해당 상수 테이블을 찾아 필요 값을 참조
- `Access flag` : 클래스에 적용한 수정자 결정(public, final, interface, abstract, enum, annotation)
- `This` : 현재 클래스명 
- `Superclass` : 슈퍼클래스(부모클래스)명
- `Interface` : 클래슥 구현한 모든 인터페이스명
- `Field` : 클래스 내 모든 필드
- `Method` : 클래스 내 모든 메서드
- `Attribute` : 클래스가 지닌 모든 속성(소스 파일명 등)

### Compile

#### Example code

```java
public class Post {

    private Long id;
    private String title;
    private String content;
    private Date date;
    private String status;

    public Long getId() {
        return id;
    }

    public String getTitle() {

        return title;
    }

    public String getContent() {
        return content;
    }

    public Date getDate() {
        return date;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
```


#### javap -c

```shell
$ javap -c Post
```

```shell   
Warning: File ./Post.class does not contain class Post
Compiled from "Post.java"
public class com.memory.diary.domain.Post {
  public com.memory.diary.domain.Post();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public java.lang.Long getId();
    Code:
       0: aload_0
       1: getfield      #7                  // Field id:Ljava/lang/Long;
       4: areturn

  public java.lang.String getTitle();
    Code:
       0: aload_0
       1: getfield      #13                 // Field title:Ljava/lang/String;
       4: areturn

  public java.lang.String getContent();
    Code:
       0: aload_0
       1: getfield      #17                 // Field content:Ljava/lang/String;
       4: areturn

  public java.util.Date getDate();
    Code:
       0: aload_0
       1: getfield      #20                 // Field date:Ljava/util/Date;
       4: areturn

  public java.lang.String getStatus();
    Code:
       0: aload_0
       1: getfield      #24                 // Field status:Ljava/lang/String;
       4: areturn

  public void setId(java.lang.Long);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #7                  // Field id:Ljava/lang/Long;
       5: return

  public void setTitle(java.lang.String);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #13                 // Field title:Ljava/lang/String;
       5: return

  public void setContent(java.lang.String);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #17                 // Field content:Ljava/lang/String;
       5: return

  public void setDate(java.util.Date);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #20                 // Field date:Ljava/util/Date;
       5: return

  public void setStatus(java.lang.String);
    Code:
       0: aload_0
       1: aload_1
       2: putfield      #24                 // Field status:Ljava/lang/String;
```

#### javap -v

```shell
$ javap -v Post
```

```shell
Warning: File ./Post.class does not contain class Post
Classfile /Users/currenjin/Documents/repositories/mem-ory/diary/src/main/java/com/memory/diary/domain/Post.class
  Last modified 2025. 3. 22.; size 1090 bytes
  SHA-256 checksum 6c42e3507a00885fc32a9f3fce277df92b66b6c3ef1cafde7c97df2086d5d66f
  Compiled from "Post.java"
public class com.memory.diary.domain.Post
  minor version: 0
  major version: 65
  flags: (0x0021) ACC_PUBLIC, ACC_SUPER
  this_class: #8                          // com/memory/diary/domain/Post
  super_class: #2                         // java/lang/Object
  interfaces: 0, fields: 5, methods: 11, attributes: 1
Constant pool:
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #2 = Class              #4             // java/lang/Object
   #3 = NameAndType        #5:#6          // "<init>":()V
   #4 = Utf8               java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = Fieldref           #8.#9          // com/memory/diary/domain/Post.id:Ljava/lang/Long;
   #8 = Class              #10            // com/memory/diary/domain/Post
   #9 = NameAndType        #11:#12        // id:Ljava/lang/Long;
  #10 = Utf8               com/memory/diary/domain/Post
  #11 = Utf8               id
  #12 = Utf8               Ljava/lang/Long;
  #13 = Fieldref           #8.#14         // com/memory/diary/domain/Post.title:Ljava/lang/String;
  #14 = NameAndType        #15:#16        // title:Ljava/lang/String;
  #15 = Utf8               title
  #16 = Utf8               Ljava/lang/String;
  #17 = Fieldref           #8.#18         // com/memory/diary/domain/Post.content:Ljava/lang/String;
  #18 = NameAndType        #19:#16        // content:Ljava/lang/String;
  #19 = Utf8               content
  #20 = Fieldref           #8.#21         // com/memory/diary/domain/Post.date:Ljava/util/Date;
  #21 = NameAndType        #22:#23        // date:Ljava/util/Date;
  #22 = Utf8               date
  #23 = Utf8               Ljava/util/Date;
  #24 = Fieldref           #8.#25         // com/memory/diary/domain/Post.status:Ljava/lang/String;
  #25 = NameAndType        #26:#16        // status:Ljava/lang/String;
  #26 = Utf8               status
  #27 = Utf8               Code
  #28 = Utf8               LineNumberTable
  #29 = Utf8               getId
  #30 = Utf8               ()Ljava/lang/Long;
  #31 = Utf8               getTitle
  #32 = Utf8               ()Ljava/lang/String;
  #33 = Utf8               getContent
  #34 = Utf8               getDate
  #35 = Utf8               ()Ljava/util/Date;
  #36 = Utf8               getStatus
  #37 = Utf8               setId
  #38 = Utf8               (Ljava/lang/Long;)V
  #39 = Utf8               setTitle
  #40 = Utf8               (Ljava/lang/String;)V
  #41 = Utf8               setContent
  #42 = Utf8               setDate
  #43 = Utf8               (Ljava/util/Date;)V
  #44 = Utf8               setStatus
  #45 = Utf8               SourceFile
  #46 = Utf8               Post.java
{
  public com.memory.diary.domain.Post();
    descriptor: ()V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 5: 0

  public java.lang.Long getId();
    descriptor: ()Ljava/lang/Long;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #7                  // Field id:Ljava/lang/Long;
         4: areturn
      LineNumberTable:
        line 14: 0

  public java.lang.String getTitle();
    descriptor: ()Ljava/lang/String;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #13                 // Field title:Ljava/lang/String;
         4: areturn
      LineNumberTable:
        line 19: 0

  public java.lang.String getContent();
    descriptor: ()Ljava/lang/String;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #17                 // Field content:Ljava/lang/String;
         4: areturn
      LineNumberTable:
        line 23: 0

  public java.util.Date getDate();
    descriptor: ()Ljava/util/Date;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #20                 // Field date:Ljava/util/Date;
         4: areturn
      LineNumberTable:
        line 27: 0

  public java.lang.String getStatus();
    descriptor: ()Ljava/lang/String;
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: getfield      #24                 // Field status:Ljava/lang/String;
         4: areturn
      LineNumberTable:
        line 31: 0

  public void setId(java.lang.Long);
    descriptor: (Ljava/lang/Long;)V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: putfield      #7                  // Field id:Ljava/lang/Long;
         5: return
      LineNumberTable:
        line 35: 0
        line 36: 5

  public void setTitle(java.lang.String);
    descriptor: (Ljava/lang/String;)V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: putfield      #13                 // Field title:Ljava/lang/String;
         5: return
      LineNumberTable:
        line 39: 0
        line 40: 5

  public void setContent(java.lang.String);
    descriptor: (Ljava/lang/String;)V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: putfield      #17                 // Field content:Ljava/lang/String;
         5: return
      LineNumberTable:
        line 43: 0
        line 44: 5

  public void setDate(java.util.Date);
    descriptor: (Ljava/util/Date;)V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: putfield      #20                 // Field date:Ljava/util/Date;
         5: return
      LineNumberTable:
        line 47: 0
        line 48: 5

  public void setStatus(java.lang.String);
    descriptor: (Ljava/lang/String;)V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=2, locals=2, args_size=2
         0: aload_0
         1: aload_1
         2: putfield      #24                 // Field status:Ljava/lang/String;
         5: return
      LineNumberTable:
        line 51: 0
        line 52: 5
}
SourceFile: "Post.java"
```
