#!/usr/bin/env python3
"""Generate two concept figures without changing existing attached originals.

The first separates connector task configuration from the record path.
The second separates WAL durability/page writeback from logical decoding.
Both are conceptual placements, not an executable deployment topology.
"""
import argparse
from pathlib import Path
import tempfile
import kafka_integration_diagrams as drawing

ROOT = Path(__file__).resolve().parents[2]


def connector_roles():
    f = drawing.Figure(
        'fig-14-connector-task-worker.svg', 776,
        'Connector와 Task는 Worker 안에서 실행된다',
        '가능한 source 배치의 예시다. Worker A 안의 connector가 task 설정을 만든다. '
        'Connect가 이 설정을 Worker B의 Debezium source task에 전달한다. '
        '점선은 task 설정이며 레코드 경로가 아니다. Worker B 안에서 source task가 '
        'DB 변경을 읽고 converter와 producer를 거쳐 Kafka에 발행한다. '
        'Connector와 task는 같은 worker에 배치될 수도 있다.')
    f.text(180, 32, 'Connector · Task · Worker', 18, True)
    f.text(180, 56, '실선: 레코드 · 점선: task 설정', 14)
    f.box(20, 88, 320, 160, [], boundary=True)
    f.text(40, 112, 'Worker A · JVM 프로세스', 15, True, anchor='start')
    f.box(40, 128, 280, 96, ['Connector', 'hangeul-orders-source', 'task 설정 생성'])
    f.arrow([(180, 224), (180, 348)], dashed=True)
    f.text(196, 276, 'task 설정', 14, anchor='start')
    f.text(196, 300, 'Connect가 전달', 14, anchor='start')
    f.box(20, 312, 320, 256, [], boundary=True)
    f.text(40, 336, 'Worker B · JVM 프로세스', 15, True, anchor='start')
    f.box(40, 348, 280, 80, ['Debezium Source task 0', 'DB 변경 → Connect 레코드'])
    f.box(40, 476, 280, 64, ['converter · producer', '바이트로 변환하고 발행'])
    f.arrow([(180, 428), (180, 476)])
    f.text(196, 456, '레코드', 14, anchor='start')
    f.arrow([(180, 540), (180, 632)])
    f.text(196, 604, 'Kafka 발행', 14, anchor='start')
    f.box(40, 632, 280, 64, ['Kafka 브로커', '업무 토픽에 저장'])
    f.text(180, 728, 'Connector는 레코드 복사 경로에 없다.', 14, True)
    f.text(180, 752, '같은 worker에 함께 배치할 수도 있다.', 14)
    f.save()


def wal_path():
    f = drawing.Figure(
        'fig-15-wal-debezium-path.svg', 936,
        'WAL의 복구 경로와 Debezium의 변경 전달 경로',
        '일반적인 동기 커밋과 초기 snapshot이 완료된 streaming을 가정한다. '
        'PostgreSQL에서 주문 104의 상태를 PAID로 변경하고 필요한 WAL과 commit 기록을 영구 저장한다. '
        '해당 WAL이 영구 저장된 뒤 데이터 페이지를 파일에 반영할 수 있다. '
        '별도의 logical decoding과 pgoutput 경로는 복제 프로토콜로 변경을 worker의 Debezium task에 제공한다. '
        'Task는 Connect 레코드를 만들고 worker의 converter와 producer가 Kafka에 발행한다. '
        '데이터 페이지 쓰기가 먼저 완료되어야 CDC를 시작하는 직렬 경로는 아니다.')
    f.text(180, 32, 'WAL에서 Kafka까지', 18, True)
    f.text(180, 56, '동기 커밋 · snapshot 이후 streaming 예시', 14)
    f.box(20, 84, 320, 372, [], boundary=True)
    f.text(40, 108, 'PostgreSQL 서버', 15, True, anchor='start')
    f.box(40, 128, 280, 64, ['① 주문 104 변경', 'CREATED → PAID'])
    f.box(40, 232, 280, 64, ['② WAL + commit 기록 영구 저장', '데이터 페이지 쓰기에 앞서는 로그'])
    f.arrow([(180, 192), (180, 232)])
    f.arrow([(180, 296), (180, 324), (104, 324), (104, 352)], dashed=True)
    f.arrow([(180, 296), (180, 324), (256, 324), (256, 352)])
    f.box(40, 352, 128, 64, ['데이터 파일', '페이지 반영'])
    f.box(192, 352, 128, 64, ['logical decoding', 'pgoutput'])
    f.text(104, 440, '점선: 나중에 반영', 13)
    f.text(256, 440, '실선: 변경 전달', 13)
    f.arrow([(256, 416), (256, 480), (180, 480), (180, 536)])
    f.text(196, 476, '복제 프로토콜', 14, anchor='start')
    f.box(20, 496, 320, 232, [], boundary=True)
    f.text(40, 520, 'Connect worker · JVM', 15, True, anchor='start')
    f.box(40, 536, 280, 72, ['③ Debezium task', '행 변경 → Connect 레코드'])
    f.box(40, 640, 280, 64, ['converter · producer', '형식 변환 · Kafka 발행'])
    f.arrow([(180, 608), (180, 640)])
    f.arrow([(180, 704), (180, 784)])
    f.text(196, 760, 'Kafka로 발행', 14, anchor='start')
    f.box(40, 784, 280, 72, ['④ Kafka 토픽', '키 id=104 · after.status=PAID'])
    f.text(180, 888, '데이터 파일 쓰기와 CDC는 다른 경로다.', 14, True)
    f.text(180, 912, 'Worker가 원본 WAL 파일을 마운트하지 않는다.', 14)
    f.save()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path,
                        default=Path(tempfile.gettempdir()) / 'kafka-concept-diagrams')
    args = parser.parse_args()
    output = args.output.resolve()
    if output == ROOT or ROOT in output.parents:
        parser.error('output must be outside the repository; publish via actual Issue attachments')
    drawing.OUT = output
    connector_roles()
    wal_path()


if __name__ == '__main__':
    main()
