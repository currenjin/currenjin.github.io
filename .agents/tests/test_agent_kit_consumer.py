"""Public consumer bootstrap contract; private loader lives in agent-kit."""
from pathlib import Path
import json
import os
import re
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class ConsumerReferences(unittest.TestCase):
    def test_diagram_delegates_and_links_setup(self):
        text = (ROOT / '.agents/skills/diagram/SKILL.md').read_text()
        self.assertIn('../../agent-kit.md', text)
        self.assertIn('skills/diagram/SKILL.md', text)
        self.assertIn('KIT_ROOT', text)
        self.assertIn('원격', text)
        self.assertNotIn('~/.agents/', text)
        self.assertNotIn('/Users/', text)

    def test_type_safe_selection_and_discovery_contract(self):
        guide = (ROOT / '.agents/agent-kit.md').read_text()
        for token in ('--rule writing', '--rule tidy-first', '--skill report', '--list',
                      'writing`과 `tidy-first`는 스킬이 아니라 규칙',
                      'RESOURCE_NOT_FOUND', '후보는 제안일 뿐',
                      '다운로드·아카이브 실패', '같은 SHA',
                      'skills/<rule>/SKILL.md', '추측하지 않습니다'):
            self.assertIn(token, guide)
        paths = list((ROOT / '.agents').rglob('*.md')) + [ROOT / 'README.md']
        for path in paths:
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertNotRegex(path.read_text(), r'--path (?:skills/[^/\s]+/SKILL\.md|rules/[^/\s]+\.md)')

    def test_setup_records_private_access_requirement(self):
        text = (ROOT / '.agents/agent-kit.md').read_text()
        for expected in ['currenjin/agent-kit', 'private', 'CONSUMERS.md',
                         'KIT_ROOT', 'rules/writing.md', 'rules/tidy-first.md']:
            self.assertIn(expected, text)
        self.assertNotIn('~/.agents/', text)
        self.assertNotIn('/Users/', text)

    def test_local_publication_contract_is_preserved(self):
        text = (ROOT / '.agents/skills/diagram/SKILL.md').read_text()
        for expected in ['GitHub Issue', 'Jekyll', '실제 렌더된 문서', 'SHA-256',
                         '라이트·다크', '비인증 HTTP 200', '기존 본문을 유지',
                         '승인 범위', '사이트 UI·CSS는 별도 승인 없이 바꾸지 않는다',
                         '공개 저장소에는 비공개 업무 사례']:
            self.assertIn(expected, text)
        config = (ROOT / '_config.yml').read_text()
        self.assertIn('  - .agents', config)

    def test_site_use_is_independent_of_private_access(self):
        text = (ROOT / 'README.md').read_text()
        self.assertIn('.agents/agent-kit.md', text)
        self.assertIn('사이트 열람·빌드에는 private 스킬 접근 권한이 필요하지 않습니다', text)
        self.assertNotIn('다른 기기 설정', text)

    def test_guide_requires_complete_fresh_reads_and_fail_closed(self):
        text = (ROOT / '.agents/agent-kit.md').read_text()
        for expected in ['전체', '상대 경로', '같은 SHA', '새 임시', '중단',
                         '오래된', '설치하지', '인증된', 'docs/CONSUMERS.md']:
            self.assertIn(expected, text)


class BootstrapExecution(unittest.TestCase):
    """Exercise the documented shell, not a substitute private loader.

    The fake gh returns only a recording probe as script contents. These tests
    verify transport, argv and shell failure propagation, not materialization.
    """

    def bootstrap(self):
        text = (ROOT / '.agents/agent-kit.md').read_text()
        blocks = re.findall(r'```bash\n(.*?)\n```', text, flags=re.S)
        self.assertEqual(len(blocks), 1, 'Provide one runnable bash bootstrap')
        return blocks[0]

    def run_bootstrap(self, directory, failure=''):
        directory = Path(directory)
        log = directory / 'calls.jsonl'
        gh = directory / 'gh'
        gh.write_text('''#!/usr/bin/env python3
import json
import os
import sys
args = sys.argv[1:]
with open(os.environ['CALL_LOG'], 'a') as log:
    log.write(json.dumps(args) + '\\n')
if 'repos/currenjin/agent-kit/commits/main' in args:
    if os.environ.get('FAIL_STAGE') == 'revision':
        sys.exit(41)
    print('b' * 40 if os.environ.get('FAIL_STAGE') != 'invalid' else 'not-a-sha')
elif any('/contents/scripts/read_remote.py?ref=' in arg for arg in args):
    if os.environ.get('FAIL_STAGE') == 'script':
        sys.exit(42)
    print("import json, sys; print('LOADER_ARGS=' + json.dumps(sys.argv[1:]))")
else:
    sys.exit(43)
''')
        gh.chmod(0o700)
        env = dict(os.environ, PATH=str(directory) + os.pathsep + os.environ['PATH'],
                   CALL_LOG=str(log), FAIL_STAGE=failure)
        result = subprocess.run(['bash', '-c', self.bootstrap()], cwd=directory,
                                env=env, text=True, capture_output=True)
        calls = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
        return result, calls

    def test_resolves_main_once_and_pins_raw_loader_and_requested_path(self):
        with tempfile.TemporaryDirectory() as directory:
            result, calls = self.run_bootstrap(directory)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0], ['api', 'repos/currenjin/agent-kit/commits/main', '--jq', '.sha'])
        self.assertIn('repos/currenjin/agent-kit/contents/scripts/read_remote.py?ref=' + 'b' * 40,
                      calls[1])
        self.assertIn('Accept: application/vnd.github.raw+json', calls[1])
        args = json.loads(result.stdout.split('LOADER_ARGS=', 1)[1])
        self.assertEqual(args, ['--revision', 'b' * 40, '--skill', 'diagram'])

    def test_remote_failure_stops_instead_of_using_local_rules(self):
        for failure in ['revision', 'invalid', 'script']:
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                result, calls = self.run_bootstrap(directory, failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn('LOADER_ARGS=', result.stdout)
                self.assertEqual(len(calls), 2 if failure == 'script' else 1)


if __name__ == '__main__':
    unittest.main()
