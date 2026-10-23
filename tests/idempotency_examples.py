#!/usr/bin/env python3
"""Run the exact Python block in the idempotency textbook.

No packages, network, external service, or user DB is used. All DBs live in
TemporaryDirectory (TMPDIR is respected). --evidence writes a machine receipt.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest
from typing import Any, Dict

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '_wiki/idempotency.md'
TEXT = SOURCE.read_text()
BLOCKS = re.findall(r'<!-- executable: idempotency_demo.py -->\n```python\n(.*?)\n```', TEXT, re.S)
assert len(BLOCKS) == 1, 'expected exactly one canonical executable example'
CODE = BLOCKS[0] + '\n'
NS: Dict[str, Any] = {'__name__': 'textbook_example'}
exec(compile(CODE, 'idempotency_demo.py', 'exec'), NS)
reserve = NS['reserve']
initialize = NS['initialize']
OBSERVATIONS = []


class Examples(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='idempotency-')
        self.addCleanup(self.temp.cleanup)
        self.path = str(Path(self.temp.name) / 'example.db')
        initialize(self.path)

    def state(self, tenant='shop-a'):
        with closing(sqlite3.connect(self.path)) as db:
            stock = db.execute('SELECT stock FROM inventory WHERE tenant=?', (tenant,)).fetchone()[0]
            reservations = db.execute('SELECT count(*) FROM reservations WHERE tenant=?', (tenant,)).fetchone()[0]
            receipts = db.execute('SELECT count(*) FROM receipts WHERE tenant=?', (tenant,)).fetchone()[0]
            incomplete = db.execute('SELECT count(*) FROM receipts WHERE status IS NULL OR response IS NULL').fetchone()[0]
        return dict(stock=stock, reservations=reservations, receipts=receipts, incomplete=incomplete)

    def check_state(self, stock, reservations, receipts, tenant='shop-a'):
        state = self.state(tenant)
        self.assertEqual(state, dict(stock=stock, reservations=reservations, receipts=receipts, incomplete=0))
        return state

    def record(self, **values):
        OBSERVATIONS.append(dict(test=self.id().split('.')[-1], **values))

    def test_normal_replay(self):
        first = reserve(self.path, 'shop-a', 'request-7', 'book', 1)
        second = reserve(self.path, 'shop-a', 'request-7', 'book', 1)
        self.assertEqual(first, second)
        self.assertEqual(first[0], 201)
        self.record(same_response=True, state=self.check_state(4, 1, 1))

    def test_distinct_keys_same_payload(self):
        a = reserve(self.path, 'shop-a', 'a', 'book', 1)
        b = reserve(self.path, 'shop-a', 'b', 'book', 1)
        self.assertNotEqual(a[1]['reservation_id'], b[1]['reservation_id'])
        self.record(state=self.check_state(3, 2, 2))

    def test_key_payload_conflict(self):
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        with self.assertRaisesRegex(ValueError, 'different input'):
            reserve(self.path, 'shop-a', 'a', 'book', 2)
        self.record(state=self.check_state(4, 1, 1))

    def test_tenant_scoping(self):
        a = reserve(self.path, 'shop-a', 'same-key', 'book', 1)
        b = reserve(self.path, 'shop-b', 'same-key', 'book', 1)
        self.assertNotEqual(a, b)
        self.record(a=self.check_state(4, 1, 1), b=self.check_state(4, 1, 1, 'shop-b'))

    def test_invalid_input_does_not_claim(self):
        for quantity in [True, 0, -1, 1.5, '1', 1001]:
            with self.subTest(quantity=quantity), self.assertRaises(ValueError):
                reserve(self.path, 'shop-a', 'a', 'book', quantity)
        self.check_state(5, 0, 0)
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(state=self.check_state(4, 1, 1))

    def test_before_commit_rollbacks(self):
        for phase in ['after_claim', 'before_commit']:
            with self.subTest(phase=phase), self.assertRaises(RuntimeError):
                reserve(self.path, 'shop-a', 'a', 'book', 1, fault=phase)
            self.check_state(5, 0, 0)
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(phases=['after_claim', 'before_commit'], state=self.check_state(4, 1, 1))

    def test_after_commit_response_loss(self):
        with self.assertRaises(TimeoutError):
            reserve(self.path, 'shop-a', 'a', 'book', 1, fault='after_commit')
        before = self.check_state(4, 1, 1)
        retry = reserve(self.path, 'shop-a', 'a', 'book', 1)
        with closing(sqlite3.connect(self.path)) as db:
            actual = db.execute('SELECT id FROM reservations').fetchone()[0]
        self.assertEqual(retry[1]['reservation_id'], actual)
        self.record(before_retry=before, after_retry=self.check_state(4, 1, 1))

    def test_simultaneous_duplicates(self):
        workers = 8
        start = threading.Barrier(workers)
        def call(_):
            start.wait(timeout=10)
            return reserve(self.path, 'shop-a', 'a', 'book', 1)
        with ThreadPoolExecutor(max_workers=workers) as pool:
            results = list(pool.map(call, range(workers)))
        self.assertTrue(all(r == results[0] for r in results))
        self.record(connections=workers, identical_responses=True, state=self.check_state(4, 1, 1))

    def test_distinct_concurrent_requests_do_not_oversell(self):
        start = threading.Barrier(8)
        def call(i):
            start.wait(timeout=10)
            return reserve(self.path, 'shop-a', str(i), 'book', 1)
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(call, range(8)))
        statuses = [r[0] for r in results]
        self.assertEqual(statuses.count(201), 5)
        self.assertEqual(statuses.count(409), 3)
        self.record(success=5, rejected=3, state=self.check_state(0, 5, 8))

    def test_business_rejection_is_replayed(self):
        first = reserve(self.path, 'shop-a', 'a', 'book', 6)
        self.assertEqual(first, (409, {'error': 'unavailable'}))
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("UPDATE inventory SET stock=10 WHERE tenant='shop-a'")
        self.assertEqual(reserve(self.path, 'shop-a', 'a', 'book', 6), first)
        self.check_state(10, 0, 1)
        self.assertEqual(reserve(self.path, 'shop-a', 'b', 'book', 6)[0], 201)
        self.record(state=self.check_state(4, 1, 2))

    def test_busy_is_not_duplicate_success(self):
        with closing(sqlite3.connect(self.path, isolation_level=None)) as holder:
            holder.execute('BEGIN IMMEDIATE')
            with self.assertRaisesRegex(sqlite3.OperationalError, 'locked'):
                reserve(self.path, 'shop-a', 'a', 'book', 1)
            holder.execute('ROLLBACK')
        self.check_state(5, 0, 0)
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(state=self.check_state(4, 1, 1))

    def test_commit_busy_rolls_back_not_false_success(self):
        with closing(sqlite3.connect(self.path, isolation_level=None)) as reader:
            reader.execute('BEGIN')
            reader.execute('SELECT * FROM inventory').fetchall()
            with self.assertRaisesRegex(sqlite3.OperationalError, 'locked'):
                reserve(self.path, 'shop-a', 'a', 'book', 1)
            reader.execute('ROLLBACK')
        self.check_state(5, 0, 0)
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(state=self.check_state(4, 1, 1))

    def test_simultaneous_conflicting_inputs(self):
        start = threading.Barrier(2)
        def call(qty):
            start.wait(timeout=10)
            try:
                return reserve(self.path, 'shop-a', 'a', 'book', qty)
            except ValueError as error:
                return str(error)
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(call, [1, 2]))
        success = [r for r in results if isinstance(r, tuple)]
        self.assertEqual(len(success), 1)
        self.assertIn('key reused with different input', results)
        qty = success[0][1]['qty']
        self.record(winning_quantity=qty, state=self.check_state(5-qty, 1, 1))

    def test_process_crash_before_and_after_commit(self):
        example = Path(self.temp.name) / 'idempotency_demo.py'
        example.write_text(CODE)
        wrapper = '''import os, runpy, sqlite3, sys
namespace = runpy.run_path(sys.argv[1], run_name="textbook_example")
original = sqlite3.connect
phase = sys.argv[3]
class CrashConnection(sqlite3.Connection):
    def execute(self, sql, *args):
        if sql == "COMMIT" and phase == "before":
            os._exit(73)
        result = super().execute(sql, *args)
        if sql == "COMMIT" and phase == "after":
            os._exit(74)
        return result
def connect(*args, **kwargs):
    kwargs["factory"] = CrashConnection
    return original(*args, **kwargs)
sqlite3.connect = connect
namespace["reserve"](sys.argv[2], "shop-a", "a", "book", 1)
'''
        pre = subprocess.run([sys.executable, '-c', wrapper, str(example), self.path, 'before'], timeout=15)
        self.assertEqual(pre.returncode, 73)
        self.check_state(5, 0, 0)
        post = subprocess.run([sys.executable, '-c', wrapper, str(example), self.path, 'after'], timeout=15)
        self.assertEqual(post.returncode, 74)
        self.check_state(4, 1, 1)
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(exit_codes=[73, 74], state=self.check_state(4, 1, 1))

    def test_counterexample_marker_committed_first(self):
        payload = json.dumps({'product': 'book', 'qty': 1}, sort_keys=True)
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute('INSERT INTO receipts VALUES (?, ?, ?, ?, ?, ?)',
                       ('shop-a', 'reserve-v1', 'a', payload, 201, '{"reservation_id":"not-created","qty":1}'))
        replay = reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.assertEqual(replay[0], 201)
        self.record(counterexample=True, false_success=True, state=self.check_state(5, 0, 1))

    def test_counterexample_effect_committed_first(self):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("UPDATE inventory SET stock=stock-1 WHERE tenant='shop-a'")
            db.execute("INSERT INTO reservations VALUES ('first', 'shop-a', 'book', 1)")
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(counterexample=True, state=self.check_state(3, 2, 1))

    def test_counterexample_receipt_deletion(self):
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute('DELETE FROM receipts')
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        self.record(counterexample=True, state=self.check_state(3, 2, 1))

    def test_counterexample_order_and_version_guard(self):
        with closing(sqlite3.connect(':memory:')) as db:
            db.execute('CREATE TABLE address (city TEXT, version INTEGER)')
            db.execute("INSERT INTO address VALUES ('서울', 0)")
            for city, version in [('부산', 2), ('서울', 1)]:
                db.execute('UPDATE address SET city=?, version=?', (city, version))
            naive = db.execute('SELECT * FROM address').fetchone()
            self.assertEqual(naive, ('서울', 1))
            db.execute("UPDATE address SET city='서울', version=0")
            for city, version in [('부산', 2), ('서울', 1)]:
                db.execute('UPDATE address SET city=?, version=? WHERE version<?', (city, version, version))
            guarded = db.execute('SELECT * FROM address').fetchone()
            self.assertEqual(guarded, ('부산', 2))
        self.record(counterexample=True, naive=naive, guarded=guarded)

    def test_primary_key_and_not_null_constraints(self):
        reserve(self.path, 'shop-a', 'a', 'book', 1)
        with closing(sqlite3.connect(self.path)) as db:
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("INSERT INTO receipts SELECT * FROM receipts")
            db.rollback()
            with self.assertRaises(sqlite3.IntegrityError):
                db.execute("INSERT INTO receipts VALUES (NULL, 'reserve-v1', 'b', '{}', 201, '{}')")
            db.rollback()
        self.record(state=self.check_state(4, 1, 1))

    def test_exact_standalone_example(self):
        example = Path(self.temp.name) / 'idempotency_demo.py'
        example.write_text(CODE)
        process = subprocess.run([sys.executable, str(example)], text=True, capture_output=True, timeout=15)
        self.assertEqual(process.returncode, 0, process.stderr)
        self.assertEqual(process.stdout, 'same_response: True\nstock: 4\nreservations: 1\n')
        self.record(stdout=process.stdout)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--evidence', type=Path)
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(Examples)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    with tempfile.TemporaryDirectory(prefix='idempotency-settings-') as settings_dir:
        with closing(sqlite3.connect(str(Path(settings_dir) / 'settings.db'))) as db:
            settings = {key: db.execute('PRAGMA ' + key).fetchone()[0]
                        for key in ['journal_mode', 'synchronous', 'fullfsync', 'read_uncommitted']}
    evidence = dict(python=platform.python_version(), sqlite=sqlite3.sqlite_version,
                    source_sha256=hashlib.sha256(TEXT.encode()).hexdigest(),
                    code_sha256=hashlib.sha256(CODE.encode()).hexdigest(),
                    tests=result.testsRun, failures=len(result.failures), errors=len(result.errors),
                    settings=settings, observations=OBSERVATIONS,
                    limits=['local SQLite only', 'timeout simulated after commit', 'no power loss',
                            'no HTTP, Stripe, broker, multi-host, or load test'])
    if args.evidence:
        args.evidence.parent.mkdir(parents=True, exist_ok=True)
        args.evidence.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: evidence[k] for k in ['python', 'sqlite', 'tests', 'failures', 'errors']}, ensure_ascii=False))
    sys.exit(not result.wasSuccessful())
