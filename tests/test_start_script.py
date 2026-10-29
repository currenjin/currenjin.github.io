"""Exercise the actual start script without installing gems or serving pages."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StartScriptTest(unittest.TestCase):
    def invoke(self, mode=None, **overrides):
        with tempfile.TemporaryDirectory(prefix='start-script-') as temp:
            root = Path(temp)
            commands = root / 'bin'
            commands.mkdir()
            log = root / 'commands.jsonl'
            fake = '''#!{python}
import json, os, sys
from pathlib import Path
name = Path(sys.argv[0]).name
with open(os.environ['COMMAND_LOG'], 'a') as log:
    log.write(json.dumps([name, sys.argv[1:], os.environ.get('BUNDLE_FROZEN')]) + '\\n')
key = 'CHECK_STATUS' if sys.argv[1:2] == ['check'] else 'INSTALL_STATUS' if sys.argv[1:2] == ['install'] else 'NODE_STATUS' if name == 'node' else 'SERVE_STATUS'
sys.exit(int(os.environ.get(key, '0')))
'''.format(python=sys.executable)
            for name in ['bundle', 'node', 'docker-compose']:
                path = commands / name
                path.write_text(fake)
                path.chmod(0o755)
            lock = root / 'Gemfile.lock'
            lock.write_bytes((ROOT / 'Gemfile.lock').read_bytes())
            before = lock.read_bytes()
            env = {**os.environ, 'PATH': str(commands) + os.pathsep + os.environ['PATH'],
                   'COMMAND_LOG': str(log), **{key: str(value) for key, value in overrides.items()}}
            result = subprocess.run(['bash', str(ROOT / 'start.sh')] + ([] if mode is None else [mode]),
                                    cwd=root, env=env, capture_output=True, text=True)
            self.assertEqual(before, lock.read_bytes())
            calls = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
            return result.returncode, calls

    def test_satisfied_lock_checks_without_update_or_install(self):
        status, calls = self.invoke()
        self.assertEqual(0, status)
        self.assertEqual([['bundle', ['check']], ['node', ['scripts/generation/generate-data.js']]],
                         [call[:2] for call in calls])
        self.assertEqual('true', calls[0][2])

    def test_missing_dependencies_install_frozen_lock_then_generate(self):
        status, calls = self.invoke(CHECK_STATUS=1)
        self.assertEqual(0, status)
        self.assertEqual([['bundle', ['check']], ['bundle', ['install']],
                          ['node', ['scripts/generation/generate-data.js']]], [call[:2] for call in calls])
        self.assertEqual('true', calls[1][2])

    def test_install_failure_stops_generator_and_server(self):
        status, calls = self.invoke('watch', CHECK_STATUS=1, INSTALL_STATUS=23)
        self.assertEqual(23, status)
        self.assertEqual([['bundle', ['check']], ['bundle', ['install']]], [call[:2] for call in calls])

    def test_generator_failure_stops_server(self):
        status, calls = self.invoke('docker', NODE_STATUS=29)
        self.assertEqual(29, status)
        self.assertEqual('node', calls[-1][0])

    def test_existing_modes_preserve_commands(self):
        for mode, command in [('docker', ['docker-compose', ['up']]),
                              ('watch', ['bundle', ['exec', 'jekyll', 'server', '--watch']]),
                              ('inc', ['bundle', ['exec', 'jekyll', 'server', '--incremental', '--trace']])]:
            with self.subTest(mode=mode):
                status, calls = self.invoke(mode)
                self.assertEqual(0, status)
                self.assertEqual(command, calls[-1][:2])
                self.assertEqual(['node', ['scripts/generation/generate-data.js']], calls[-2][:2])

    def test_unknown_mode_still_only_prepares(self):
        status, calls = self.invoke('unknown')
        self.assertEqual(0, status)
        self.assertEqual('node', calls[-1][0])

    def test_server_failure_propagates(self):
        status, _ = self.invoke('inc', SERVE_STATUS=31)
        self.assertEqual(31, status)


if __name__ == '__main__':
    unittest.main()
