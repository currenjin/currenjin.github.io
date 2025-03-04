---
layout  : wiki
title   : JPA Deep Dive(by currenjin)
summary :
date    : 2025-03-05 07:00:00 +0900
updated : 2025-03-05 07:00:00 +0900
tag     : jpa
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# 1. JPA의 엔티티 관리

## Spring Data JPA save()

### save() 내부 구현

```java
@Transactional
public <S extends T> S save(S entity) {
    Assert.notNull(entity, "Entity must not be null.");
    // 새로운 엔티티인지 판단한다
    if (this.entityInformation.isNew(entity)) {
        this.em.persist(entity);
        return entity;
    } else {
        return this.em.merge(entity);
    }
}
```

두 가 지를 알 수 있다.

1. 새로운 엔티티라면 persist를 호출
2. 이미 존재하는 엔티티라면 merge를 호출

새로운 엔티티?

- ID 값이 없으면 새로운 Entity라고 판단한다.

```java
@Transient
public boolean isNew() {
    return null == this.getId();
}
```

### Test code

```java
@SpringBootTest
class SaveTest {
    PostRepository repository;

    @SpyBean
    EntityManager entityManager;

    @BeforeEach
    void setUp() {
        JpaRepositoryFactory factory = new JpaRepositoryFactory(entityManager);
        repository = factory.getRepository(PostRepository.class);
    }

    @Test
    @Transactional
    void save_메소드는_ID가_없으면_persist를_호출한다() {
        Post post = new Post();
        post.setTitle("제목1");

        repository.save(post);

        verify(entityManager).persist(post);
        verify(entityManager, never()).merge(post);
    }

    @Test
    @Transactional
    void save_메소드는_ID가_있으면_merge를_호출한다() {
        Post post = new Post();
        post.setId(2L);

        repository.save(post);

        verify(entityManager, never()).persist(post);
        verify(entityManager).merge(post);
    }
}
```

### persist and merge

persist

- 새로운 엔티티를 영속화
- INSERT 쿼리만 발생
- 동일 인스턴스 반환

merge

- 준영속/비영속 엔티티를 영속화
- SELECT 후 INSERT or UPDATE
- 새로운 인스턴스 반환

test

```java
// 인스턴스 동일 여부 테스트

@Test
@Transactional
void persist에서_반환한_인스턴스는_동일하다() {
    Post post = new Post();

    Post savedPost = repository.save(post);

    verify(entityManager).persist(post);
    assertEquals(post, savedPost);
}

@Test
@Transactional
void merge에서_반환한_인스턴스는_다르다() {
    Post post = new Post();
    post.setId(1L);

    Post savedPost = repository.save(post);

    verify(entityManager).merge(post);
    assertNotEquals(post, savedPost);
}
```

persistance

> 엔티티를 영속성 컨텍스트에서 관리하는 상태
> - 1차 캐시 
> - 동일성 보장 
> - 트랜잭션을 지원하는 쓰기 지연 
> - 변경 감지(Dirty Checking) 
> - 지연 로딩(Lazy Loading)

### save 시 주의사항

```java
@Service
@Transactional
public class PostService {
	private final PostRepository repository;

	public PostService(PostRepository repository) {
		this.repository = repository;
	}

	public void updatePost(PostDto dto) {
		Post post = new Post();
		post.setId(dto.getId());
		post.setTitle(dto.getTitle());

		repository.save(post);
	}

	public void updateFoundPost(PostDto dto) {
		Post post = repository.findById(dto.getId()).orElseThrow();

		post.setTitle(dto.getTitle());

		repository.save(post);
	}

	public void saveWithId(Long id) {
		Post post = new Post();
		post.setId(id);

		repository.save(post);
	}

	public void saveWithoutId() {
		Post post = new Post();

		repository.save(post);
	}
}
```

```java
// Case 1: 준영속 엔티티를 수정할 때
// 1. ID 수정 이후 Save를 하면, Merge 호출!
// 2. 모든 필드가 새로운 Entity 값으로 교체!
@Test
@Transactional
void case_1() {
    Post savedPost = savePostById(ID);
    PostDto postDto = createPostDtoByIdAndTitle(savedPost.getId(), TITLE);

    sut.updatePost(postDto);

    verify(entityManager, atLeastOnce()).merge(any(Post.class));
}

// Case 2: 엔티티 값이 없을 때
// 1. ID 값이 없으면 새로 생성
@Test
@Transactional
void case_2_persist() {
    Post savedPost = savePostById(ID);
    long beforeCount = repository.count();
    PostDto newPostDto = new PostDto(savedPost.getId() + 1L, TITLE);

    sut.updatePost(newPostDto);

    assertEquals(beforeCount + 1L, repository.count());
    verify(entityManager, atLeastOnce()).merge(any(Post.class));
}

// Case 1, 2 Solution: 의도치 않은 생성 또는 필드 교체 방지
// 1. 조회 후 Save 또는 더티체킹으로 UPDATE!
// 2. 트랜잭션 종료 시 Title만 변경!
@Test
@Transactional
void case_1_2_solution() {
    Post savedPost = savePostById(ID);
    PostDto postDto = createPostDtoByIdAndTitle(savedPost.getId(), TITLE);

    sut.updateFoundPost(postDto);

    verify(entityManager, atLeastOnce()).merge(any(Post.class));
}

// Case 1, 2 Solution: 의도치 않은 생성 또는 필드 교체 방지
// 1. ID 값이 없는 경우 Throw
@Test
@Transactional
void case_1_2_solution_throw() {
    PostDto notFoundPostDto = createPostDtoByIdAndTitle(ID, TITLE);

    assertThrows(RuntimeException.class, () -> sut.updateFoundPost(notFoundPostDto));
}
```

```java
// Case 3: 저장 시 ID값 직접 설정할 때
// 1. Merge가 호출되면서 불필요한 SELECT 쿼리가 날아감
@Test
@Transactional
void case_3_save_with_id_is_merge() {
    sut.saveWithId(1L);

    verify(entityManager, atLeastOnce()).merge(any(Post.class));
}

// Case 3 Solution: 불필요 쿼리 호출 제거
// 1. ID 생성은 DB에게 위임
// 2. persist 메소드를 통해 insert 쿼리 한 번만 호출
@Test
@Transactional
void case_3_solution() {
    sut.saveWithoutId();

    verify(entityManager, never()).merge(any(Post.class));
    verify(entityManager, atLeastOnce()).persist(any(Post.class));
}
```

## 영속성 컨텍스트 내부 구현 분석

영속성 컨텍스트는 엔티티를 저장하고 관리하는 공간이다.

### 영속성 컨텍스트 기본 동작

```java
@SpringBootTest
public class PersistenceContextTest {
	@PersistenceContext
	private EntityManager entityManager;

	@Test
	@Transactional
	void 영속성_컨텍스트_기본_동작() {
		Post post = new Post();
		assertThat(entityManager.contains(post)).isFalse();

		entityManager.persist(post);
		assertThat(entityManager.contains(post)).isTrue();

		entityManager.flush();
	}
}
```

1. 엔티티를 생성한다. (비영속)
2. 엔티티를 영속화한다.
3. 영속성 컨텍스트의 변경 내용을 반영한다.

위 코드를 보면 우리가 흔히 아는 EntityManager와 PersistenceContext는 연관 관계가 있는 것으로 보인다.

![Image](https://github.com/user-attachments/assets/4b7bc594-bb07-406e-94a5-a021e6aade50)

EntityManager Interface의 구현체 중 SessionImpl을 확인해보면, persistenceContext 필드가 정의되어있다. EntityManager는 PersistenceContext를 사용한다는 뜻이다.

![Image](https://github.com/user-attachments/assets/eda6f41a-88fb-4794-95f1-e38b33b695b2)

그리고 한 Transaction에서 여러 EntityManager는 하나의 PersistenceContext를 사용한다.

EntityManager : PersistenceContext = N : 1

### 영속성 컨텍스트 특성

기본적으로 아래와 같은 특성을 갖는다.

1. 1차 캐시
2. 쓰기 지연
3. 변경 감지(Dirty Checking)
4. 지연 로딩(Lazy Loading)

1차 캐시 테스트

- ID 어떻게 판단하고 가져오느냐(한 번에 가져와서 저장해놓는다)
- 그리고 ID를 어떻게 들고 있는가?

```java
@Test
@Transactional
void 일차_캐시_테스트() {
	// 1. 엔티티 저장 시 1차 캐시에 저장됨
	Post post = new Post();
	entityManager.persist(post);

	// 2. 조회 시 1차 캐시에서 조회
	Post cachedPost = entityManager.find(Post.class, post.getId());  // SELECT 쿼리 발생 안함
	assertEquals(post, cachedPost);

	// 3. 1차 캐시에 없는 엔티티는 DB에서 조회
	Post dbPost = entityManager.find(Post.class, 999L);  // SELECT 쿼리 발생
	assertNull(dbPost);

	// 4. 1차 캐시 초기화
	entityManager.clear();
	Post reloadedPost = entityManager.find(Post.class, post.getId());  // SELECT 쿼리 발생
	assertNotEquals(reloadedPost, post);
}
```

쓰기 지연

```java
@Test
@Transactional
void 쓰기_지연_테스트() {
	Post post1 = new Post();
	Post post2 = new Post();

	entityManager.persist(post1);
	entityManager.persist(post2);

	// 1. persist 호출 후에는 DB에 데이터가 없어야 함
	Session session = entityManager.unwrap(Session.class);
	assertEqualsCountWithSession(session, 0);

	// 2. flush 후에는 DB에 데이터가 있어야 함
	entityManager.flush();
	assertEqualsCountWithSession(session, 2);
}

private void assertEqualsCountWithSession(Session session, int firstExpected) {
	session.doWork(connection -> {
		try (PreparedStatement ps = connection.prepareStatement("SELECT COUNT(*) FROM post")) {
			long count = getCount(ps);
			assertEquals(firstExpected, count);
		}
	});
}

private long getCount(PreparedStatement ps) throws SQLException {
	ResultSet resultSet = ps.executeQuery();
	resultSet.next();
	return resultSet.getLong(1);
}
```

변경 감지

```java
@Test
@Transactional
void 변경_감지_테스트() {
	String firstTitle = "제목1";
	String secondTitle = "제목2";
	Post post = new Post();
	post.setTitle(firstTitle);
	
	entityManager.persist(post);
	entityManager.flush();

	// 1. DB에서 현재 데이터 확인
	Session session = entityManager.unwrap(Session.class);
	assertEqualsTitleByIdWithSession(session, post.getId(), firstTitle);

	// 2. 엔티티 수정
	post.setTitle(secondTitle);
	entityManager.flush();

	// 3. DB에서 변경된 데이터 확인
	assertEqualsTitleByIdWithSession(session, post.getId(), secondTitle);
}

private static void assertEqualsTitleByIdWithSession(Session session, Long id, String title) {
	session.doWork(connection -> {
		try (PreparedStatement ps = connection.prepareStatement("SELECT title FROM post WHERE id = ?")) {
			String selectedTitle = selectTitle(id, ps);
			assertEquals(title, selectedTitle);
		}
	});
}

private static String selectTitle(Long id, PreparedStatement ps) throws SQLException {
	ps.setLong(1, id);
	ResultSet resultSet = ps.executeQuery();
	resultSet.next();
	return resultSet.getString("title");
}
```

지연 로딩

```java
@Test
@Transactional
void 지연_로딩_테스트() {
	PersistenceUnitUtil persistenceUnitUtil = entityManager.getEntityManagerFactory().getPersistenceUnitUtil();

	Post post = new Post();
	entityManager.persist(post);

	Comment comment1 = new Comment();
	comment1.setPost(post);
	entityManager.persist(comment1);

	Comment comment2 = new Comment();
	comment2.setPost(post);
	entityManager.persist(comment2);

	entityManager.flush();
	entityManager.clear();

	Post foundPost = entityManager.find(Post.class, post.getId());  // SELECT post만 실행

	// comments는 아직 초기화되지 않음
	assertFalse(persistenceUnitUtil.isLoaded(foundPost, "comments"));

	// comments 실제 호출 & 초기화 완료
	assertEquals(2, foundPost.getComments().size());
	assertTrue(persistenceUnitUtil.isLoaded(foundPost, "comments"));
}
```

### 영속성 컨텍스트 라이프 사이클

```java
@SpringBootTest
public class PersistenceContextLifeCycleTest {
	@PersistenceContext
	private EntityManager entityManager;

	@Test
	@Transactional
	void 엔티티_생명주기_테스트() {
		String firstTitle = "제목1";

		// 1. 비영속 (new/transient)
		Post post = new Post();
		post.setTitle(firstTitle);
		assertFalse(entityManager.contains(post));
		assertNull(post.getId());

		// 2. 영속 (managed)
		entityManager.persist(post);
		assertTrue(entityManager.contains(post));
		assertNotNull(post.getId());

		// DB 저장 확인
		entityManager.flush();
		entityManager.clear();

		Post managedPost = entityManager.find(Post.class, post.getId());
		assertNotNull(managedPost);

		// 3. 준영속 (detached)
		entityManager.detach(managedPost);
		assertFalse(entityManager.contains(managedPost));

		// 준영속 상태에서는 변경 감지가 동작하지 않음
		String updatedTitle = "변경된 제목";
		managedPost.setTitle(updatedTitle);
		entityManager.flush();

		Post foundPost = entityManager.find(Post.class, managedPost.getId());
		assertNotEquals(updatedTitle, foundPost.getTitle());

		// 4. 삭제 (removed)
		entityManager.remove(foundPost);
		assertFalse(entityManager.contains(foundPost));

		// DB에서도 삭제되었는지 확인
		entityManager.flush();
		assertNull(entityManager.find(Post.class, foundPost.getId()));
	}
}
```

### 영속성 컨텍스트를 제대로 이해하지 못한다면?

```java
@SpringBootTest
class PersistenceContextProblemTest {
    @PersistenceContext
    EntityManager entityManager;

    @BeforeEach
    @Transactional
    void setUp() {
        Post post1 = new Post();
        entityManager.persist(post1);

        Comment comment1 = new Comment();
        comment1.setPost(post1);
        entityManager.persist(comment1);

        Comment comment2 = new Comment();
        comment2.setPost(post1);
        entityManager.persist(comment2);

        post1.getComments().add(comment1);
        post1.getComments().add(comment2);

        Post post2 = new Post();
        entityManager.persist(post2);

        Comment comment3 = new Comment();
        comment3.setPost(post2);
        entityManager.persist(comment3);

        Comment comment4 = new Comment();
        comment4.setPost(post2);
        entityManager.persist(comment4);

        post2.getComments().add(comment3);
        post2.getComments().add(comment4);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @Transactional
    void N플러스1_문제_발생_테스트() {
        List<String> sqlLogs = new ArrayList<>();

        List<Post> posts = entityManager.createQuery("select p from Post p", Post.class)
                .getResultList();

        logCapture(() -> {
            for (Post post : posts) {
                post.getComments().size();
            }
        }, sqlLogs);

        List<String> selectQueries = getSelectQueries(sqlLogs);

        assertEquals(2, selectQueries.size());
    }

    @Test
    @Transactional
    void 페치_조인으로_해결() {
        List<String> sqlLogs = new ArrayList<>();

        List<Post> posts = entityManager
                .createQuery("select distinct p from Post p join fetch p.comments", Post.class)
                .getResultList();

        logCapture(() -> {
            for (Post post : posts) {
                post.getComments().size();
            }
        }, sqlLogs);

        List<String> selectQueries = getSelectQueries(sqlLogs);

        assertEquals(0, selectQueries.size());
    }

    @Test
    @Transactional
    void EntityGraph로_해결() {
        List<String> sqlLogs = new ArrayList<>();

        List<Post> posts = entityManager.createQuery("select p from Post p", Post.class)
                .setHint("javax.persistence.fetchgraph", entityManager.getEntityGraph("Post.withComments"))
                .getResultList();

        logCapture(() -> {
            for (Post post : posts) {
                post.getComments().size();
            }
        }, sqlLogs);

        List<String> selectQueries = getSelectQueries(sqlLogs);

        assertEquals(0, selectQueries.size());
    }

    private List<String> getSelectQueries(List<String> sqlLogs) {
        return sqlLogs.stream()
                .filter(sql -> sql.trim().toUpperCase().startsWith("SELECT"))
                .toList();
    }

    private void logCapture(Runnable runnable, List<String> sqlLogs) {
        Logger logger = (Logger) LoggerFactory.getLogger("org.hibernate.SQL");
        ListAppender<ILoggingEvent> listAppender = new ListAppender<>();
        listAppender.start();
        logger.addAppender(listAppender);

        try {
            runnable.run();
            sqlLogs.addAll(listAppender.list.stream()
                    .map(ILoggingEvent::getMessage)
                    .toList());
        } finally {
            logger.detachAppender(listAppender);
        }
    }
}
```

## 보강 내용

- persist 호출 시 ID를 갖고있는 곳
   - IDENTITY : persist 시 INSERT를 바로 실행(쓰기지연 불가)
   - SEQUENCE : DB 시퀀스
- [persist 호출 시 ID 생성 전략에 따른 쿼리](https://github.com/currenjin/alexandria-playground/commit/fb89e299a0937dd2e3c0d02e31460f9eeb84856c)
- Eager와 함께 사용하는 BatchSize

# 2. 트랜잭션과 락

## 알아볼 것

- ACID
- Lock

## **트랜잭션(Transaction)이란?**

- 데이터베이스에서 **하나의 논리적 작업 단위**
- 여러 개의 작업을 하나의 단위로 묶어 **모두 성공하거나, 모두 실패(롤백)** 해야 한다.
- JPA에서는 `@Transactional`을 통해 트랜잭션을 적용할 수 있다.

## **ACID 원칙**

트랜잭션이 **데이터 정합성을 유지**하기 위해 따라야 할 네 가지 속성

| 원칙 | 설명 |
| --- | --- |
| **원자성 (Atomicity)** | 트랜잭션 내 모든 작업이 **완전히 수행되거나 전혀 수행되지 않아야 함** |
| 일관성 (Consistency) | 트랜잭션 수행 전후에 **데이터 무결성이 유지되어야 함** |
| **격리성 (Isolation)** | 여러 트랜잭션이 동시에 실행될 때, 서로의 작업이 영향을 미치지 않아야 함 |
| 지속성 (Durability) | 트랜잭션이 성공적으로 완료되면, **결과가 영구적으로 저장되어야 함** |

## Atomicity Test

### `w/o @transactional`

```java
public void withoutTransaction() {
     Post post = new Post();
     post.setTitle("트랜잭션 테스트");

     Comment comment1 = new Comment();
     comment1.setContent("첫 번째 댓글");
     comment1.setPost(post);

     Comment comment2 = new Comment();
     comment2.setContent("두 번째 댓글");
     comment2.setPost(post);

     postRepository.save(post);
     commentRepository.save(comment1);

     throw new RuntimeException("예외 발생!");

     commentRepository.save(comment2);
}
```

test code

```java
@Test
void 트랜잭션이_없으면_데이터_정합성이_깨진다() {
      assertThrows(RuntimeException.class, () -> transactionService.withoutTransaction());
      
      assertEquals(1, postRepository.count());
      assertEquals(1, commentRepository.count());
}
```


### `w/ @transactional`

```java
@Transactional
public void withTransaction() {
		Post post = new Post();
		post.setTitle("트랜잭션 테스트");

		Comment comment1 = new Comment();
		comment1.setContent("첫 번째 댓글");
		comment1.setPost(post);

		Comment comment2 = new Comment();
		comment2.setContent("두 번째 댓글");
		comment2.setPost(post);

		postRepository.save(post);
		commentRepository.save(comment1);

		throw new RuntimeException("예외 발생!");

		commentRepository.save(comment2);
}
```

test code

```java
@Test
void 트랜잭션이_있으면_데이터_정합성이_유지된다() {
   assertThrows(RuntimeException.class, () -> transactionService.withTransaction());
   
   assertEquals(0, postRepository.count());
}
```


### AbstractPlatformTransactionManager

```java
// 트랜잭션 매니저 - 실제 트랜잭션을 관리하는 핵심 클래스
public abstract class AbstractPlatformTransactionManager implements PlatformTransactionManager {
    
    @Override
    public final TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException {
        // 현재 트랜잭션이 존재하는지 확인
        Object transaction = doGetTransaction();
        
        if (definition == null) {
            definition = new DefaultTransactionDefinition();
        }

        // 이미 트랜잭션이 존재하는 경우
        if (isExistingTransaction(transaction)) {
            return handleExistingTransaction(definition, transaction);
        }

        // 타임아웃 설정 확인
        if (definition.getTimeout() < TransactionDefinition.TIMEOUT_DEFAULT) {
            throw new InvalidTimeoutException("Invalid transaction timeout", definition.getTimeout());
        }

        // 새 트랜잭션 필요한 경우
        if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_MANDATORY) {
            throw new IllegalTransactionStateException("No existing transaction found for transaction marked with propagation 'mandatory'");
        }
        else if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED ||
                definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW ||
                definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
            
            // 새로운 트랜잭션 생성
            DefaultTransactionStatus status = newTransactionStatus(definition, transaction, true);
            doBegin(transaction, definition);
            prepareSynchronization(status, definition);
            return status;
        }
        else {
            // 트랜잭션 없이 실행
            boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
            return prepareTransactionStatus(definition, null, true, newSynchronization, debugEnabled);
        }
    }

    // 트랜잭션 커밋
    @Override
    public final void commit(TransactionStatus status) throws TransactionException {
        if (status.isCompleted()) {
            throw new IllegalTransactionStateException("Transaction is already completed");
        }

        DefaultTransactionStatus defStatus = (DefaultTransactionStatus) status;
        if (defStatus.isLocalRollbackOnly()) {
            processRollback(defStatus);
            return;
        }

        if (!shouldCommitOnGlobalRollbackOnly() && defStatus.isGlobalRollbackOnly()) {
            processRollback(defStatus);
            return;
        }

        processCommit(defStatus);
    }
}
```

## Isolation level Test

트랜잭션의 격리 수준이 다르면 **동시에 실행되는 트랜잭션 간의 영향도**가 달라진다.

`ex) @Transactional(isolation = Isolation.XXX)`

### **격리 수준 비교**

| 격리 수준 | 특징 | 문제 발생 가능성 |
| --- | --- | --- |
| **READ UNCOMMITTED** | 커밋되지 않은 데이터를 읽을 수 있음 | DIRTY READ |
| **READ COMMITTED** (기본값) | 커밋된 데이터만 읽을 수 있음 | NON-REPEATABLE READ |
| **REPEATABLE READ** | 트랜잭션 내 동일한 조회 결과 보장 | PHANTOM READ |
| **SERIALIZABLE** | 가장 강력한 격리 수준 (동시성 낮음) | 없음 |

### Isolation

```java
public enum Isolation {
    DEFAULT(-1),
    READ_UNCOMMITTED(1),
    READ_COMMITTED(2),
    REPEATABLE_READ(4),
    SERIALIZABLE(8);

    private final int value;

    private Isolation(int value) {
        this.value = value;
    }

    public int value() {
        return this.value;
    }
}
```

### Connection

```java
public interface Connection  extends Wrapper, AutoCloseable {
    int TRANSACTION_NONE             = 0;
    int TRANSACTION_READ_UNCOMMITTED = 1;
    int TRANSACTION_READ_COMMITTED   = 2;
    int TRANSACTION_REPEATABLE_READ  = 4;
    int TRANSACTION_SERIALIZABLE     = 8;
}
```

### TransactionInterceptor

```java
public class TransactionInterceptor extends TransactionAspectSupport implements MethodInterceptor {
    @Override
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        // TransactionAttribute에는 isolation level 정보가 포함되어 있음
        TransactionAttribute txAttr = getTransactionAttributeSource()
            .getTransactionAttribute(invocation.getMethod(), targetClass);
        ...
}
```

### DataSourceTransactionManager

```java
public class DataSourceTransactionManager extends AbstractPlatformTransactionManager
		implements ResourceTransactionManager, InitializingBean {
	@Override
	protected void doBegin(Object transaction, TransactionDefinition definition) {
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
		Connection con = null;
	
		try {
			if (!txObject.hasConnectionHolder() ||
					txObject.getConnectionHolder().isSynchronizedWithTransaction()) {
				Connection newCon = obtainDataSource().getConnection();
				if (logger.isDebugEnabled()) {
					logger.debug("Acquired Connection [" + newCon + "] for JDBC transaction");
				}
				txObject.setConnectionHolder(new ConnectionHolder(newCon), true);
			}
	
			txObject.getConnectionHolder().setSynchronizedWithTransaction(true);
			con = txObject.getConnectionHolder().getConnection();
	
			**Integer previousIsolationLevel = DataSourceUtils.prepareConnectionForTransaction(con, definition);
			txObject.setPreviousIsolationLevel(previousIsolationLevel);
			txObject.setReadOnly(definition.isReadOnly());**
			
			if (con.getAutoCommit()) {
				txObject.setMustRestoreAutoCommit(true);
				if (logger.isDebugEnabled()) {
					logger.debug("Switching JDBC Connection [" + con + "] to manual commit");
				}
				con.setAutoCommit(false);
			}
	
			prepareTransactionalConnection(con, definition);
			txObject.getConnectionHolder().setTransactionActive(true);
	
			int timeout = determineTimeout(definition);
			if (timeout != TransactionDefinition.TIMEOUT_DEFAULT) {
				txObject.getConnectionHolder().setTimeoutInSeconds(timeout);
			}
	
			if (txObject.isNewConnectionHolder()) {
				TransactionSynchronizationManager.bindResource(obtainDataSource(), txObject.getConnectionHolder());
			}
		}
	
		catch (Throwable ex) {
			if (txObject.isNewConnectionHolder()) {
				DataSourceUtils.releaseConnection(con, obtainDataSource());
				txObject.setConnectionHolder(null, false);
			}
			throw new CannotCreateTransactionException("Could not open JDBC Connection for transaction", ex);
		}
	}
}
```

### DB Vendor level

```c
// MySQL 소스 코드 (sql/handler.cc)
int ha_innobase::external_lock(THD *thd, int lock_type) {
    switch (thd_tx_isolation(thd)) {
    case ISO_READ_UNCOMMITTED:
        // 락 없이 읽기 허용
        break;
        
    case ISO_READ_COMMITTED:
        if (lock_type == F_RDLCK) {
            // 일관된 읽기를 위한 스냅샷 생성
            innobase_register_trx(ht, thd, trx);
        }
        break;
        
    case ISO_REPEATABLE_READ:
        if (!trx->read_view) {
            // 읽기 뷰가 없으면 새로 생성
            trx->read_view = read_view_open_now(trx, cursor);
        }
        break;
        
    case ISO_SERIALIZABLE:
        if (lock_type == F_RDLCK) {
            // 공유 락 획득
            row_lock_s_lock_table(prebuilt->table);
        }
        break;
    }
}
```

### READ COMMITTED

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void readCommittedTransaction() throws InterruptedException {
	Post post = postRepository.findById(1L).orElseThrow();
	System.out.println("조회된 Post 제목: " + post.getTitle());

	sleep(3000);
	entityManager.clear();

	Post foundPost = postRepository.findById(1L).orElseThrow();
	System.out.println("다시 조회된 Post 제목: " + foundPost.getTitle());
}

public void updatePostTitle() throws InterruptedException {
	sleep(1000);

	Post post = postRepository.findAll().get(0);
	post.setTitle("B");
	postRepository.save(post);

	System.out.println("Thread B - 제목 변경 후 커밋 완료");
}
```

```java
@Test
void readCommittedTest() throws InterruptedException {
	Post post = new Post();
	post.setTitle("A");
	postRepository.save(post);

	Thread threadA = new Thread(this::readCommittedTransaction);
	Thread threadB = new Thread(this::updatePostTitle);

	threadA.start();
	threadB.start();

	threadA.join();
	threadB.join();
}
```

```java
Thread A - 조회된 Post 제목: ?
Thread B - 제목 변경 후 커밋 완료
Thread A - 다시 조회된 Post 제목: ?
```

결과

```java
Thread A - 조회된 Post 제목: A
Thread B - 제목 변경 후 커밋 완료
Thread A - 다시 조회된 Post 제목: B
```


### REPEATABLE READ

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void repeatableReadTransaction() throws InterruptedException {
	Post post = postRepository.findById(1L).orElseThrow();
	System.out.println("조회된 Post 제목: " + post.getTitle());

	sleep(3000);

	Post foundPost = postRepository.findById(1L).orElseThrow();
	System.out.println("다시 조회된 Post 제목: " + foundPost.getTitle());
}

public void updatePostTitle() throws InterruptedException {
	sleep(1000);

	Post post = postRepository.findAll().get(0);
	post.setTitle("B");
	postRepository.save(post);

	System.out.println("Thread B - 제목 변경 후 커밋 완료");
}
```

```java
@Test
void repeatableReadTest() throws InterruptedException {
	Post post = new Post();
	post.setTitle("A");
	postRepository.save(post);

	Thread threadA = new Thread(this::repeatableReadTransaction);
	Thread threadB = new Thread(this::updatePostTitle);

	threadA.start();
	threadB.start();

	threadA.join();
	threadB.join();
}
```

```java
Thread A - 조회된 Post 제목: ?
Thread B - 제목 변경 후 커밋 완료
Thread A - 다시 조회된 Post 제목: ?
```

결과

```java
Thread A - 조회된 Post 제목: A
Thread B - 제목 변경 후 커밋 완료
Thread A - 다시 조회된 Post 제목: A
```


## Optimistic Locking

트랜잭션이 충돌할 가능성이 적다고 가정(낙관적)하고, 충돌이 발생할 때만 예외 처리

- 일반적으로 `@Version` 을 사용해 엔티티 저장 시 버전 번호를 자동으로 증가
- DB에 락을 걸지 않음
- 트랜잭션 커밋 시 버전 번호 비교해 충돌이 발생했는지 체크
   - 충돌이 발생하면 `OptimisticLockException` 발생

### Test

```java
@Entity
public class PostWithVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String title;

    @Version
    private int version;
    
    // Getter & Setter
}
```

PostWithVersion 엔티티 내 Version Annotation 적용

*기존 Post Entity에 무작정 version을 추가하게 되면, 지난 세션을 위해 준비한 대부분의 테스트 코드가 실패함*

```java
@Service
public class PostWithVersionService {
	@Autowired
	private PostWithVersionRepository repository;

	@Transactional
	public void optimisticLockTest(Long postId) {
		PostWithVersion post = repository.findById(postId).orElseThrow();
		System.out.println("[Thread A] 조회된 Post 제목: " + post.getTitle());

		sleep(3000);

		post.setTitle("낙관적 락 테스트 - 변경된 제목");
		repository.save(post);
		System.out.println("[Thread A] 변경 후 저장 완료");
	}

	@Transactional
	public void optimisticLockConflictTest(Long postId) {
		sleep(1000);

		PostWithVersion post = repository.findById(postId).orElseThrow();
		System.out.println("[Thread B] 조회된 Post 제목: " + post.getTitle());

		sleep(3000);

		post.setTitle("낙관적 락 테스트 - 충돌 발생");
		try {
			repository.save(post);
			System.out.println("[Thread B] 변경 후 저장 완료");
		} catch (OptimisticLockException e) {
			System.out.println("[Thread B] 낙관적 락 충돌 발생!");
		}
	}

	private void sleep(long millis) {
		try {
			Thread.sleep(millis);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
}
```

해당 메서드는

1. id에 해당하는 Post를 조회하고,
2. 일정 시간을 기다린 후,
3. 타이틀을 수정한다.

```java
@Test
void 낙관적_락_테스트() throws InterruptedException {
	PostWithVersion post = new PostWithVersion();
	post.setTitle("초기 제목");
	repository.save(post);

	Thread threadA = new Thread(() -> service.optimisticLockTest(post.getId()));
	Thread threadB = new Thread(() -> service.optimisticLockConflictTest(post.getId()));

	threadA.start();
	threadB.start();

	threadA.join();
	threadB.join();
}
```

해당 테스트 코드는

1. Post 데이터를 저장해놓고,
2. 두 스레드를 만들어,
3. 각 스레드에서 먼저 구현한 메서드를 호출한다.

결과

```java
Thread A - 조회된 Post 제목: 초기 제목
Thread B - 조회된 Post 제목: 초기 제목
Thread A - 변경 후 저장 완료
Thread B - 변경 후 저장 완료

// 그 후... Exception 발생
binding parameter [1] as [VARCHAR] - [낙관적 락 테스트 - 충돌 발생]
"Thread-5" org.springframework.orm.ObjectOptimisticLockingFailureException
```


### 구현체

```java
@Transactional
@Interceptor
class TransactionalInterceptor {

	@Inject
	@Any
	private EntityManager entityManager;

	@AroundInvoke
	public Object runInTransaction(InvocationContext ctx) throws Exception {
		...
		try {
			if (isNew) {
				entityTransaction.begin();
			}
			Object result = ctx.proceed();
			if (isNew) {
				entityTransaction.commit();
			
			...
	}
	...
}
```

```java
public class JdbcResourceLocalTransactionCoordinatorImpl implements TransactionCoordinator {
	@Override
		public void commit() {
			try {
				...
				JdbcResourceLocalTransactionCoordinatorImpl.this.beforeCompletionCallback();
				...
}
```

```java
public class EntityVerifyVersionProcess implements BeforeTransactionCompletionProcess {

	private final Object object;

	public EntityVerifyVersionProcess(Object object) {
		this.object = object;
	}

	@Override
	public void doBeforeTransactionCompletion(SessionImplementor session) {
		final EntityEntry entry = session.getPersistenceContext().getEntry( object );

		if ( entry != null ) {
			final Object latestVersion = entry.getPersister().getCurrentVersion( entry.getId(), session );
			if ( !entry.getVersion().equals( latestVersion ) ) {
				throw new OptimisticEntityLockException(
						object,
						"Newer version ["
								+ latestVersion
								+ "] of entity ["
								+ MessageHelper.infoString( entry.getEntityName(), entry.getId() )
								+ "] found in database"
				);
			}
		}
	}
}
```

## Pessimistic Locking

트랜잭션이 충돌한다 가정(비관적)하고, 데이터 수정 시 접근하지 못하도록 락을 걺

- 일반적으로 DB의 `SELECT FOR UPDATE` 쿼리를 통해 락을 걺
- 읽기 작업 중에 락을 걸면 다른 트랜잭션들이 읽을 수 없게 됨
- 락을 걸고 있으면, 다른 트랜잭션은 락이 풀릴 때까지 대기

### Test

```java
public interface PostRepository extends JpaRepository<Post, Long> {
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT p FROM Post p WHERE p.id = :id")
	Optional<Post> findByIdWithLock(@Param("id") Long id);
}
```

비관적 락 적용(PESSIMISTIC_WRITE)

```java
@Service
public class PessimisticPostService {
	@Autowired
	private PostRepository repository;

	@Transactional
	public void pessimisticLockTest(Long postId) {
		Post post = repository.findByIdWithLock(postId).orElseThrow();
		System.out.println("Thread A - 조회된 Post 제목: " + post.getTitle());

		sleep(5000);

		post.setTitle("비관적 락 테스트 - 변경된 제목");
		repository.save(post);
		System.out.println("Thread A - 변경 후 저장 완료");
	}

	@Transactional
	public void pessimisticLockBlockingTest(Long postId) {
		sleep(1000);

		Post post = repository.findByIdWithLock(postId).orElseThrow();
		System.out.println("Thread B - 조회된 Post 제목: " + post.getTitle());

		post.setTitle("비관적 락 테스트 - 충돌 발생");
		repository.save(post);
		System.out.println("Thread B - 변경 후 저장 완료");
	}

	private void sleep(long millis) {
		try {
			Thread.sleep(millis);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
}
```

```java
@Test
void 비관적_락_테스트() throws InterruptedException {
	Post post = new Post();
	post.setTitle("초기 제목");
	postRepository.save(post);

	Thread threadA = new Thread(() -> pessimisticPostService.pessimisticLockTest(post.getId()));
	Thread threadB = new Thread(() -> pessimisticPostService.pessimisticLockBlockingTest(post.getId()));

	threadA.start();
	threadB.start();

	threadA.join();
	threadB.join();
}
```

- 결과

    ```java
    Thread A - 조회된 Post 제목: 초기 제목
    Thread A - 변경 후 저장 완료
    
    // 그 후... Exception 발생
    org.springframework.dao.PessimisticLockingFailureException
    ```


### 구현체

```java
public class PessimisticReadUpdateLockingStrategy implements LockingStrategy {
	@Override
	public void lock(Object id, Object version, Object object, int timeout, EventSource session) {
		if ( !lockable.isVersioned() ) {
			throw new HibernateException( "write locks via update not supported for non-versioned entities [" + lockable.getEntityName() + "]" );
		}

		final SessionFactoryImplementor factory = session.getFactory();
		try {
			try {
				final JdbcCoordinator jdbcCoordinator = session.getJdbcCoordinator();
				final PreparedStatement st = jdbcCoordinator.getStatementPreparer().prepareStatement( sql );
				try {
					lockable.getVersionType().nullSafeSet( st, version, 1, session );
					int offset = 2;

					lockable.getIdentifierType().nullSafeSet( st, id, offset, session );
					offset += lockable.getIdentifierType().getColumnSpan( factory );

					if ( lockable.isVersioned() ) {
						lockable.getVersionType().nullSafeSet( st, version, offset, session );
					}

					final int affected = jdbcCoordinator.getResultSetReturn().executeUpdate( st, sql );
					// todo:  should this instead check for exactly one row modified?
					if ( affected < 0 ) {
						final StatisticsImplementor statistics = factory.getStatistics();
						if ( statistics.isStatisticsEnabled() ) {
							statistics.optimisticFailure( lockable.getEntityName() );
						}
						throw new StaleObjectStateException( lockable.getEntityName(), id );
					}

				}
				finally {
					jdbcCoordinator.getLogicalConnection().getResourceRegistry().release( st );
					jdbcCoordinator.afterStatementExecution();
				}

			}
			catch ( SQLException e ) {
				throw session.getJdbcServices().getSqlExceptionHelper().convert(
						e,
						"could not lock: " + MessageHelper.infoString( lockable, id, session.getFactory() ),
						sql
				);
			}
		}
		**catch (JDBCException e) {
			throw new PessimisticEntityLockException( object, "could not obtain pessimistic lock", e );
		}**
	}
}
	
```

```java
public class PessimisticWriteUpdateLockingStrategy implements LockingStrategy {
	@Override
	public void lock(Object id, Object version, Object object, int timeout, EventSource session) {
		if ( !lockable.isVersioned() ) {
			throw new HibernateException( "write locks via update not supported for non-versioned entities [" + lockable.getEntityName() + "]" );
		}

		final SessionFactoryImplementor factory = session.getFactory();
		try {
			try {
				final JdbcCoordinator jdbcCoordinator = session.getJdbcCoordinator();
				final PreparedStatement st = jdbcCoordinator.getStatementPreparer().prepareStatement( sql );
				try {
					lockable.getVersionType().nullSafeSet( st, version, 1, session );
					int offset = 2;

					lockable.getIdentifierType().nullSafeSet( st, id, offset, session );
					offset += lockable.getIdentifierType().getColumnSpan( factory );

					if ( lockable.isVersioned() ) {
						lockable.getVersionType().nullSafeSet( st, version, offset, session );
					}

					final int affected = jdbcCoordinator.getResultSetReturn().executeUpdate( st, sql );
					// todo:  should this instead check for exactly one row modified?
					if ( affected < 0 ) {
						final StatisticsImplementor statistics = factory.getStatistics();
						if ( statistics.isStatisticsEnabled() ) {
							statistics.optimisticFailure( lockable.getEntityName() );
						}
						throw new StaleObjectStateException( lockable.getEntityName(), id );
					}

				}
				finally {
					jdbcCoordinator.getLogicalConnection().getResourceRegistry().release( st );
					jdbcCoordinator.afterStatementExecution();
				}
			}
			catch ( SQLException e ) {
				throw session.getJdbcServices().getSqlExceptionHelper().convert(
						e,
						"could not lock: " + MessageHelper.infoString( lockable, id, session.getFactory() ),
						sql
				);
			}
		}
		**catch (JDBCException e) {
			throw new PessimisticEntityLockException( object, "could not obtain pessimistic lock", e );
		}**
	}
}
```

## 이야깃거리

### **Isolation Level**

> 각 Isolation level의 특징에 따라 각각 어떤 상황에 어떤 격리 수준을 사용하는 것이 좋은가.
>
- `READ UNCOMMITED` 는 Dirty Read가 발생할 수 있는데 사용할 만한 상황이 있는가.
   - Comment
      - 사례 : 성능이 중요한 상황에서만 사용해야 한다. 데이터의 일관성보다 속도가 중요한 경우, 예를 들어, 실시간 로그 분석과 같은 상황에서는 사용될 수 있다. 하지만 일반적인 트랜잭션에서는 잘 사용되지 않는다.
      - 문제 ****: 이 격리 수준을 사용하면 트랜잭션이 아직 커밋되지 않은 데이터를 읽을 수 있기 때문에, 다른 트랜잭션의 변경이 실제로 커밋되기 전에 조회된 데이터를 읽을 수 있다. 이로 인해 데이터 일관성 문제가 발생할 수 있다.
- `READ COMMITED` 는 데이터 일관성을 보장하지만 어떤 경우에 성능의 문제가 생기는가.
   - Comment
      - 사례 : 데이터 일관성이 중요한 일반적인 경우에 사용된다. 예를 들어, 은행 등에서 거래 내역을 조회할 때 사용될 수 있다.
      - 문제
         - `Non-repeatable Read`는 트랜잭션이 동일한 데이터를 여러 번 조회할 때, 다른 트랜잭션에 의해 데이터가 수정될 수 있다.
         - 트랜잭션이 커밋된 데이터만 조회할 수 있기 때문에, 다른 트랜잭션이 데이터를 수정할 때마다 잠금을 걸게 되므로 성능이 저하될 수 있다.
- `READ COMMITTED` 에서 트랜잭션 A가 데이터를 읽고 트랜잭션 B가 데이터를 수정하는 상황을 어떻게 해결할 수 있는가.
   - Comment
      - Lock
         - 트랜잭션 A가 데이터를 읽고 수정하려면, **낙관적 락**(Optimistic Locking) 또는 **비관적 락**(Pessimistic Locking)을 사용하여 트랜잭션 B가 데이터를 수정하지 못하게 해야한다.
         - `PESSIMISTIC_READ` 또는 `PESSIMISTIC_WRITE`를 사용하여 데이터를 잠그고, 트랜잭션 A가 수정이 완료될 때까지 트랜잭션 B가 변경을 못하도록 막을 수 있다.
         - `@Version`을 사용하여 트랜잭션 A가 데이터를 조회한 후, 트랜잭션 B가 변경하는 경우 트랜잭션 A가 데이터를 저장할 때 `OptimisticLockException`을 던져서 충돌을 처리할 수 있다.
      - Re-try
         - 트랜잭션 A에서 데이터를 조회한 후, 트랜잭션 B가 수정할 때 트랜잭션 A가 해당 데이터를 다시 읽고 비교하는 방식으로, `REPEATABLE READ`나 `SERIALIZABLE`을 적용해 트랜잭션 A가 항상 같은 데이터를 읽도록 보장할 수 있다.
         - 충돌이 발생할 경우, 트랜잭션 A가 다시 데이터를 조회하고 수정하는 재시도 로직을 구현할 수 있다.
- `REPEATABLE READ`는 Phantom Read 문제가 발생할 수 있는데 어떻게 이 상황을 피할 수 있는가.
   - Comment
      - 사용 사례 : 데이터의 일관성을 보장하면서 동시에 데이터를 변경하려는 경우에 적합하다. 예를 들어, 은행 시스템에서 계좌 잔액을 조회하고 수정하는 경우에 유용하다.
      - 문제 : `Phantom Read`가 발생할 수 있는데, 이는 트랜잭션이 실행되는 동안 다른 트랜잭션이 데이터의 개수나 범위를 수정할 수 있다는 뜻이다.
- `SERIALIZABLE` 는 격리 수준이 가장 높지만 실제 서비스에서 사용하는 것이 옳은가.
   - Comment
      - 사용 사례
         - 데이터의 일관성이 가장 중요하고, 동시성 처리보다는 정확성을 우선시하는 시스템에서 사용된다. 은행의 결제 시스템이나 거래 시스템 등에서는 `SERIALIZABLE`을 사용할 수 있다.
         - 고성능을 요구하는 실시간 시스템에서는 적합하지 않을 수 있다. 대신, 트랜잭션의 정확성을 우선시하는 특정 상황에서만 사용해야 한다.
      - 문제 : 성능 저하가 발생할 수 있다. 모든 트랜잭션이 순차적으로 처리되므로 동시성 처리에 큰 영향을 미친다. 트랜잭션들이 대기하고, 시스템의 성능이 크게 저하될 수 있다.

### Optimistic/Pessimistic Locking

- **`Optimistic Locking`** 충돌이 발생했을 때 예외 처리 전략은 무엇이 좋은가.
   - Comment

     충돌이 발생하면 `OptimisticLockException`을 처리하는 예외 처리 전략이 필요하다. 예외가 발생했을 때 **트랜잭션을 롤백**하고, **재시도 로직**을 추가하거나, **충돌된 데이터를 사용자에게 알리기** 위한 방법을 고려할 수 있다. 예를 들어, 충돌이 발생했을 때 사용자에게 "데이터가 변경되었습니다. 다시 시도해 주세요"와 같은 메시지를 제공하고, 재시도할 수 있는 기회를 주는 방식이 좋다.

- **`Locking`** 충돌이 발생했을 때 다시 시도하는 방식은 무엇이 좋은가.
   - Comment

     충돌 발생 시 재시도하는 방식은 **재시도 횟수**를 제한하는 것이 좋다. 예를 들어, 최대 3번까지 재시도하고, 그 이후에는 사용자에게 충돌 메시지를 표시하여 더 이상 재시도하지 않도록 한다. 재시도 간 **짧은 대기 시간**을 두어 무한 루프를 방지하고, 시스템 자원 낭비를 줄이는 것이 중요하다.

- **`Locking`** 충돌이 발생했을 때 사용자는 어떤 식으로 인지하는 것이 좋은가.
   - Comment

     사용자에게 충돌을 알릴 때는 **간단하고 명확한 메시지**를 제공하는 것이 좋다. 예를 들어, "다른 사용자가 데이터를 수정하였습니다. 변경 사항을 다시 확인해주세요"와 같은 메시지를 통해 사용자가 충돌 상황을 인지할 수 있게 해야 한다. **사용자 경험**을 고려해, 충돌 발생 후 수정된 데이터를 다시 로드할 수 있도록 유도하는 방법이 유효하다.

- **`Pessimistic Locking` 사용 시** 동시성 처리에서 성능 저하가 발생한다면 어떻게 해결하는가.
   - Comment

     동시성 처리에서 성능 저하가 발생할 경우, **락의 범위**를 최소화하거나 **락 타임아웃**을 설정하여 대기 시간을 줄이는 방법을 고려한다. 또한, **분석을 통해 불필요한 락을 제거**하고, 락을 걸지 않아도 되는 부분은 비즈니스 로직을 수정하여 성능을 개선할 수 있다. 성능 저하가 문제라면 **비관적 락을 최소화하고** 낙관적 락을 사용하는 방식으로 전환할 수도 있다.

- **`Pessimistic Locking`** 을 사용할 때 트랜잭션 대기가 길어지지 않는 방법이 있는가.
   - Comment

     트랜잭션 대기가 길어지는 것을 방지하기 위해 **락 타임아웃**을 설정하고, 락을 걸기 전에 **최대 대기 시간을 지정**하는 것이 효과적이다. 예를 들어, 락을 획득하지 못한 경우 **몇 초 후에 롤백하거나 재시도**하도록 처리하는 방식이다. 또한, 락을 걸어야 하는 범위나 시점을 최소화하여 대기 시간이 길어지지 않도록 해야 한다.


## 보강내용

- Isolation level Application/DB 간 우선순위

  DB가 더 높다. Application에서 `@Transactional(isolation = ...)`을 설정해도, DB가 허용하는 격리 수준을 초과할 수는 없다.

  격리 수준은 `READ UNCOMMITED` → .. → `SERIALIZABLE` 순서로 높다고 정의하겠다.

   1. 격리 수준이 Application보다 DB가 높은 경우
      1. Application은 `READ_COMMITED` 이다.
      2. DB는 `SERIALIZABLE` 이다.
      3. 이 경우 `SERIALIZABLE` 로 동작한다.

         DB가 더 높은 격리 수준을 허용한다.

   2. 격리 수준이 DB보다 Application이 높은 경우
      1. Application은 `SERIALIZABLE` 이다.
      2. DB는 `READ COMMITED` 이다.
      3. 이 경우 `READ COMMITED` 로 동작한다.

         DB의 허용 범위 내에서만 적용된다.

   3. 결국 DB에 의해 좌우된다.

      Application에서 설정한다 해도, DB에서 허용하는 범위에서 적용이 가능하다.

       ```sql
       SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
       ```

# 3. 더티체킹

## save()와 더티체킹의 차이는 무엇인가

```java
@Service
public class DirtyCheckingService {
	@Autowired
	PostRepository postRepository;

	@Transactional
	public void updateTitleWithSave(Long postId, String newTitle) {
		Post post = postRepository.findById(postId)
			.orElseThrow(() -> new IllegalArgumentException("Post not found"));

		post.setTitle(newTitle);

		postRepository.save(post);
	}

	@Transactional
	public void updateTitleWithoutSave(Long postId, String newTitle) {
		Post post = postRepository.findById(postId)
			.orElseThrow(() -> new IllegalArgumentException("Post not found"));

		post.setTitle(newTitle);
	}
}
```

```java
@SpringBootTest
public class DirtyCheckingBasicTest {
    public static final String OLD_TITLE = "원본 제목";
    public static final String NEW_TITLE = "변경된 제목";
    
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private DirtyCheckingService sut;

    private Long testPostId;

    @BeforeEach
    public void setUp() {
        postRepository.deleteAll();

        Post post = new Post();
        post.setTitle(OLD_TITLE);
        Post savedPost = postRepository.save(post);
        testPostId = savedPost.getId();
    }

    @Test
    void 더티체킹_없이_수정한다() {
        sut.updateTitleWithSave(testPostId, NEW_TITLE);

        Post actual = postRepository.findById(testPostId).get();

        assertEquals(NEW_TITLE, actual.getTitle());
    }

    @Test
    void 더티체킹으로_수정한다() {
        sut.updateTitleWithoutSave(testPostId, NEW_TITLE);

        Post actual = postRepository.findById(testPostId).get();

        assertEquals(NEW_TITLE, actual.getTitle());
    }
}
```

어느 것이 더 좋다기 보다는 프로젝트의 특성에 따라 적용

- save()는 의도를 명확하게 표현함 (명시적)
- dirty checking은 객체 중심 설계를 지킴 (객체지향)

### **ex) 더티체킹이 유용한 상황**

```java
@Transactional
public void processOrder(Long orderId) {
    // 복잡한 객체 그래프 변경 예시
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.confirm();  // 상태 변경

    // 연관 엔티티들 변경
    for (OrderItem item : order.getItems()) {
        Product product = item.getProduct();
        product.decreaseStock(item.getQuantity());

        // 여러 엔티티가 연쇄적으로 변경되는 상황
        if (product.isLowStock()) {
            product.requestRestock();
        }
    }

    // 명시적 save()를 사용한다면 모든 변경된 엔티티마다 save() 호출 필요
}

```

## JPA의 더티 체킹은 왜 만들어졌는가?

### 개발 생산성 향상

**Before) JDBC only**

```java
// JDBC 방식
Person person = findPerson(id);
person.setName("새이름");
person.setAge(30);

// UPDATE 쿼리 직접 작성
String sql = "UPDATE Person SET name = ?, age = ? WHERE id = ?";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, person.getName());
stmt.setInt(2, person.getAge());
stmt.setLong(3, person.getId());
stmt.executeUpdate();
```

![Image](https://github.com/user-attachments/assets/cb7f80bd-e641-4bfe-b204-ed29019ae991)

- 가장 직접적인 이유는 개발자가 반복적으로 작성해야 하는 코드를 줄이기 위함
- JDBC를 직접 사용할 때는 객체 변경 후 매번 UPDATE 쿼리를 명시적으로 작성해야함

**After) JPA with DirtyChecking**

```java
Person person = findPerson(id);
person.setName("새이름");
person.setAge(30);
```

### 트랜잭션 일관성

- 더티체킹은 트랜잭션 내에서 변경된 모든 객체를 자동으로 추적하고 일관되게 처리함
- 복잡한 비즈니스 트랜잭션에서 데이터 일관성을 유지하는 데 도움이 됨

```java
@Transactional
public void transferMoney(Account from, Account to, BigDecimal amount) {
    from.withdraw(amount);
    to.deposit(amount);
}

```

- 두 계좌의 변경사항이 자동으로 감지되어 하나의 트랜잭션으로 처리됨
- 명시적 save() 호출을 잊는 실수를 방지

### 객체 중심 개발 👍🏾

- 언급

  ![Image](https://github.com/user-attachments/assets/ca450530-9457-4e20-af86-15936aafcd52)

  Gavin King “Hibernate in Action”

  Eric Evans “Domain-Driven Design”

  Vaughn Vernon “Implementing Domain-Driven Design”


```java
// 객체 세계: 자연스러운 상태 변경
person.setName("새이름");

// JDBC 세계: 명시적 업데이트 필요
preparedStatement.executeUpdate("UPDATE person SET name = ? WHERE id = ?");

// JPA 세계: 객체 변경만으로 충분 (더티체킹)
person.setName("새이름");  // 트랜잭션 종료 시 자동 반영

```

- 객체 세계에서는 객체 상태 변경이 자연스러움
- But, 디비 세계에서는 명시적인 UPDATE가 필요
- 결국 객체 지향과 디비 사이의 인식 불일치를 해결하기 위함임

```java
// 도메인 로직에 집중
@Transactional
public void approveOrder(Order order) {
    order.approve();  // 도메인 로직
    order.getItems().forEach(item -> {
        item.allocateInventory();  // 연관 객체 도메인 로직
    });
    // 데이터베이스 작업 신경 쓸 필요 없음
}
```

- JPA는 도메인 주도 설계(DDD)와 같은 객체 중심 개발 방법론을 지원하기 위해 설계됨
- 개발자가 데이터베이스 작업보다 도메인 로직에 집중할 수 있게함

## 구현체를 본 적 있는가

### **스냅샷 생성 과정**

```java
@Test
@Transactional
void 스냅샷_생성_분석() {
    // [디버깅] - 엔티티 로드 시점에 중단점 설정
    Product product = entityManager.find(Product.class, testProductId);

    // EntityEntry 객체와 loadedState 배열 확인 (디버거 화면)
    // Session -> persistenceContext -> entitiesByKey -> EntityEntry -> loadedState

    // 상태 변경
    product.setName("새 이름");
    product.setPrice(new BigDecimal("99.99"));

    // [디버깅] - flush 시점에 중단점 설정
    entityManager.flush();

    // dirtyCheck 메서드 호출 과정 추적
    // DefaultFlushEntityEventListener -> dirtyCheck -> findDirty
}

```

### DefaultFlushEntityEventListener.dirtyCheck()

```java
// DefaultFlushEntityEventListener 클래스의 핵심 메서드입니다.
// 이 메서드는 엔티티의 변경 사항을 감지하는 실제 로직을 담고 있습니다.
protected void dirtyCheck(final FlushEntityEvent event) throws HibernateException {
    // 1. 필요한 정보 추출
    final Object entity = event.getEntity();              // 실제 엔티티 객체
    final Object[] values = event.getPropertyValues();    // 현재 프로퍼티 값
    final SessionImplementor session = event.getSession();
    final EntityEntry entry = event.getEntityEntry();     // 엔티티 관련 메타데이터
    final Object[] loadedState = entry.getLoadedState();  // 저장된 스냅샷

    // 2. 인터셉터를 통한 변경 감지 시도
    int[] dirtyProperties = session.getInterceptor().findDirty(
            entity,
            entry.getId(),
            values,
            loadedState,
            persister.getPropertyNames(),
            persister.getPropertyTypes()
    );

    // 3. 인터셉터로 감지 실패 시 다른 방법 시도
    if (dirtyProperties == null) {
        // 바이트코드 향상된 엔티티 처리(SelfDirtinessTracker)
        if (entity instanceof SelfDirtinessTracker) {
            // 생략...
        }
        else {
            // 커스텀 전략 처리
            // 생략...
        }
    }

    // 4. 여전히 감지 실패 시 기본 비교 로직 사용
    if (dirtyProperties == null) {
        // 기본 비교 알고리즘으로 변경 사항 감지
        dirtyProperties = persister.findDirty(values, loadedState, entity, session);
    }

    // 5. 변경 사항이 있으면 dirtyProperties에 저장됨
    event.setDirtyProperties(dirtyProperties);
}

```

### TypeHelper.findDirty()

실제 비교 로직은 `TypeHelper.findDirty()` 메서드에 구현되어 있음

```java
// TypeHelper 클래스의 findDirty 메서드
public static int[] findDirty(
        Property[] properties,
        Object[] currentState,
        Object[] previousState,
        boolean[] propertyColumnUpdateable,
        SharedSessionContractImplementor session) {

    int[] results = null;
    int count = 0;
    int span = properties.length;

    // 모든 프로퍼티를 순회하며 비교
    for (int i = 0; i < span; i++) {
        // 1. 빠른 참조 비교 (== 연산자)
        // 2. 타입별 심층 비교
        final boolean dirty = currentState[i] != previousState[i] &&
                (
                    previousState[i] == null ||
                    currentState[i] == null ||
                    propertyColumnUpdateable[i] &&
                    !properties[i].getType().isSame(
                        currentState[i],
                        previousState[i],
                        session.getFactory()
                    )
                );

        if (dirty) {
            if (results == null) {
                results = new int[span];
            }
            results[count++] = i;  // 변경된 프로퍼티 인덱스 저장
        }
    }

    // 변경된 프로퍼티가 없으면 null 반환
    if (count == 0) {
        return null;
    }
    else {
        // 배열 크기 조정 후 반환
        int[] trimmed = new int[count];
        System.arraycopy(results, 0, trimmed, 0, count);
        return trimmed;
    }
}

```

해당 코드는 실제로 각 프로퍼티의 변경 여부를 판단하는 비교 로직

1. **빠른 참조 비교 먼저 수행** (`currentState[i] != previousState[i]`)
2. **null 값 처리** (`previousState[i] == null || currentState[i] == null`)
3. **타입별 심층 비교** (`properties[i].getType().isSame()`)

### isSame()

각 프로퍼티 타입은 자신만의 비교 로직을 갖고 있음

**`StringType` 예시**

```java
public boolean isSame(Object x, Object y) {
    return x == y || (x != null && y != null && x.equals(y));
}
```

## **더티체킹은 실제로 얼마나 효율적인가**

### **메모리 사용량 측정**

```java
java
Copy
// 1만 건 엔티티 처리 시 메모리 사용량 비교
List<Product> products = loadProducts(10000);

// 더티체킹 사용: 모든 엔티티를 영속성 컨텍스트에 유지
long dirtyCheckingMemory = measureMemoryUsage(() -> {
    for (Product product : products) {
        product.setPrice(product.getPrice().multiply(new BigDecimal("1.1")));
    }
    entityManager.flush();
});

// 최적화된 배치 처리: 100건마다 컨텍스트 정리
long optimizedMemory = measureMemoryUsage(() -> {
    int batchSize = 100;
    for (int i = 0; i < products.size(); i++) {
        products.get(i).setPrice(products.get(i).getPrice().multiply(new BigDecimal("1.1")));
        if (i % batchSize == 0) {
            entityManager.flush();
            entityManager.clear();
        }
    }
});

// 각 방식 메모리 사용량: 그래프로 시각화
// dirtyCheckingMemory vs optimizedMemory

```

### **SQL 생성 효율성**:

```java
// @DynamicUpdate 효과 측정: 50개 필드 중 1개만 변경
Product product = entityManager.find(Product.class, 1L);
List<String> generatedSql = captureSql(() -> {
    product.setName("변경된 이름");
    entityManager.flush();
});

// SQL 크기 분석: @DynamicUpdate 적용 전/후 비교
System.out.println("SQL 크기: " + generatedSql.get(0).length() + " 바이트");

```

## 실무에서의 딜레마와 해법

**더티체킹을 사용하지 말아야 하는 상황은?**

### **대용량 데이터 처리**

```java
// 문제 상황: OOM 발생 위험
@Transactional
public void updateAllPrices() {
    List<Product> allProducts = productRepository.findAll(); // 수백만 건
    allProducts.forEach(p -> p.increasePrice(0.1));
}

// 해결책: 페이징 + 배치 처리
@Transactional
public void updateAllPricesSafely() {
    int pageSize = 1000;
    int page = 0;
    long total;

    do {
        List<Product> products = productRepository.findAllPaged(page, pageSize);
        total = products.size();

        for (int i = 0; i < total; i++) {
            products.get(i).increasePrice(0.1);
            if (i % 100 == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }

        page++;
    } while (total == pageSize);
}

```

### **단순 대량 업데이트**

```java
// 더티체킹보다 효율적인 벌크 연산
@Transactional
public int updateCategoryPrices(String category, BigDecimal increase) {
    return entityManager.createQuery(
            "UPDATE Product p SET p.price = p.price * :factor " +
            "WHERE p.category = :category")
            .setParameter("factor", new BigDecimal("1.1"))
            .setParameter("category", category)
            .executeUpdate();
}

```

## 디버거로 보는 실제 동작 과정

라이브 디버깅 세션에서 다음을 중점적으로 확인

1. **엔티티 로드 시**:
   - `AbstractEntityPersister.hydrate()` - 엔티티 데이터 로딩
   - `DefaultLoadEventListener.postLoad()` - 스냅샷 생성
   - `StatefulPersistenceContext.addEntity()` - 영속성 컨텍스트에 등록
2. **플러시 시**:
   - `AbstractFlushingEventListener.flushEntities()` - 엔티티 순회
   - `DefaultFlushEntityEventListener.onFlushEntity()` - 각 엔티티 처리
   - `DefaultFlushEntityEventListener.dirtyCheck()` - 변경 감지
   - `TypeHelper.findDirty()` - 필드별 비교
   - `AbstractEntityPersister.updateOrInsert()` - SQL 생성

## 결론

- 더티체킹은 JPA가 객체 지향 프로그래밍을 자연스럽게 지원하기 위한 핵심 메커니즘
- 내부 구현을 이해하고 상황에 맞게 활용하거나 대안을 선택함으로써, 객체 지향의 장점을 살리면서도 성능 문제를 피할 수 있음
- 가장 중요한 것은 JPA 내부 동작 원리에 대한 이해를 바탕으로, 우리 프로젝트의 특성과 팀의 상황에 맞게 선택