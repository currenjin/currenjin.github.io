# Kafka Connect 시각 설명 보강

## 요청과 구성 판단

기준 커밋은 `68df211`이다. 앞선 보강이 글 위주라는 피드백에 따라 14·15장의 실행 구조와 상태 변화를 시각적으로 설명한다. 이전 `connect-enrichment.md`의 새 그림 미추가 판단은 그 시점의 기록이며, 이번 피드백에 따라 필요한 관계 두 개를 새로 그린다.

- Source·Sink의 방향과 Kafka 클라이언트 관계를 비교표로 바꾼다.
- Connector 관리와 Task의 레코드 복사를 구분하는 그림을 역할 정의 바로 뒤에 둔다. 기존 배치표가 반복하던 관계는 새 그림으로 대체한다.
- 기존 실행 경계·레코드 경로 그림은 보존한다. 새 그림은 설정 전달과 레코드 전달을 다른 선으로 보여 주므로 기존 그림과 목적이 다르다.
- WAL의 데이터 파일 반영 경로와 logical decoding·Debezium·Kafka 전달 경로가 나뉘는 그림을 추가한다. 데이터 파일 반영 뒤 CDC를 시작하는 직렬 절차로 그리지 않는다.
- Source 체크포인트·Kafka offset·검색 반영·sink 커밋은 정상 단계별 상태표로 비교한다. Source 재발행과 sink 재소비의 실패 조건은 표 아래 본문에 남긴다.
- 정의·설계 이유·보장 전제·실패 조건·기존 코드·출처는 보존한다. UI와 문서 전역 구조는 변경하지 않는다.

## 근거와 실제 첨부

기술 근거는 기존 14·15장의 Kafka 4.3 Connect 개발 가이드, PostgreSQL 17 WAL·logical decoding, Debezium 3.3.0.Final Architecture·PostgreSQL connector다. 새로운 기능이나 운영 보장을 추가하지 않고 기존 본문의 관계를 그림으로 나타낸다.

원본 SVG는 `scripts/generation/kafka_concept_diagrams.py`로 재현하며 저장소 밖 출력만 허용한다. 이전 네 그림의 생성기와 원본 바이트는 변경하지 않는다. 실제 업로드 URL·SHA-256·길이·Issue 연결은 `docs/kafka-diagram-attachments.json`의 새 두 항목에 기록한다.

Issue: <https://github.com/currenjin/currenjin.github.io/issues/30#issuecomment-6620962945>

## 검증 계획

- [x] 새 생성기·그림 부재로 회귀 검사가 실패하는 RED 확인.
- [x] SVG 실제 렌더링에서 선·라벨·경계와 읽기 크기 확인.
- [x] HTTP 201 업로드와 Issue 댓글 readback 확인. 연결 직후 404는 제한된 재시도 뒤 HTTP 200으로 해소.
- [x] 비인증 HTTP 200·SVG MIME·원본 SHA-256 일치 확인.
- [x] 기존 20개 이미지와 새 2개 이미지의 본문·manifest 일치, 생성기 재현·XML·접근성·대비·출판 경계 확인.
- [x] 최종 빌드와 렌더 검사, 모바일·데스크톱 및 양 테마의 실제 이미지 decode 확인.
- [x] 변경된 본문·도식 의미의 독립 검토와 검토 원고 일치 확인.

실제 검사 결과: 생성기·첨부 회귀 7 tests PASS, archive 10 tests/67 assertions 및 TOC 7 tests/32 assertions PASS, Jekyll 빌드 성공, Kafka 렌더 검사 16장/내부 링크 522개/이미지 22개/해설 25개 PASS, archive·SEO PASS. 기존 코드 블록 14개·authored ID 153개·번호형 출처 참조 300개와 원래 이미지 20개는 보존했다.

실제 빌드를 제공하는 HTTP 응답의 바이트 일치를 확인하고 Chrome에서 1440px·390px와 light·dark 조합을 검사했다. 새 두 이미지가 모두 decode되고 본문 폭 안에 들어오며, SVG는 두 테마 모두 불투명한 밝은 도판이다.

독립 읽기 전용 검토는 14·15장·새 그림 두 장·생성기·표를 대조했고 차단 지적은 없었다. 검토 기준 원고 해시는 `e03cd8e61b4d31dbb67470247a1852709f49454a4bd75a299c8fb0848763db3f`다. 비차단 제안 두 개는 작성자가 반영했다. 정상 페이지 쓰기는 “복구”가 아닌 “반영”으로 표현하고, sink가 source 체크포인트 저장을 기다리지 않는다는 문장을 상태표 앞에 명시했다. 이후 변경 범위는 이 두 문장과 검증 기록이며, 최종 빌드·문서 검사로 재검증한다.

게시 후 해당 커밋의 Pages 성공, 공개 본문과 이미지 바이트를 따로 확인한다. 이 파일은 게시 전 검증 기록이며 실제 DB·connector 실행이나 학습 효과를 입증하지 않는다.
