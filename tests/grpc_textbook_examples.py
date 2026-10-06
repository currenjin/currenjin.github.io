#!/usr/bin/env python3
"""Run the gRPC textbook's chapter 5 example exactly as written in _wiki/grpc.md.

Requires the pinned versions stated in the chapter (grpcio, grpcio-tools,
protobuf) in the current interpreter. Not a semantic review of the prose.
"""
from pathlib import Path
from importlib.metadata import version
import json
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
SOURCE = (ROOT / "_wiki/grpc.md").read_text()
errors = []

chapter = SOURCE.split('<a id="chapter-5"></a>', 1)[1].split('<a id="chapter-6"></a>', 1)[0]


def block_after(marker, lang):
    match = re.search(re.escape(marker) + r".*?```" + lang + r"\n(.*?)```", chapter, re.S)
    if not match:
        errors.append(f"Missing {lang} block after: {marker}")
        return ""
    return match.group(1)

pins = dict(re.findall(r"(grpcio|grpcio-tools|protobuf)==([\d.]+)", block_after("### 환경과 코드 생성", "sh")))
proto = block_after("`inventory.proto`로 저장한다", "proto")
server = block_after("`server.py`로 저장한다", "python")
client = block_after("`client.py`로 저장한다", "python")
expected = block_after("정상 실행의 예상 출력", "text")

installed = {}
for name in ["grpcio", "grpcio-tools", "protobuf"]:
    try:
        installed[name] = version(name)
    except Exception:
        installed[name] = None
if installed != {k: pins.get(k) for k in installed}:
    errors.append(f"Installed {installed} differs from chapter pins {pins}")

# Every JSON example in the textbook must parse.
for snippet in re.findall(r"```json\n(.*?)```", SOURCE, re.S):
    try:
        json.loads(snippet)
    except ValueError as exc:
        errors.append(f"Invalid JSON example: {exc}")

output = ""
if not errors:
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        (work / "inventory.proto").write_text(proto)
        (work / "server.py").write_text(server)
        (work / "client.py").write_text(client)
        gen = subprocess.run([sys.executable, "-m", "grpc_tools.protoc", "-I.", "--python_out=.",
                              "--grpc_python_out=.", "inventory.proto"], cwd=work,
                             capture_output=True, text=True)
        if gen.returncode:
            errors.append("protoc failed: " + gen.stderr)
        else:
            proc = subprocess.Popen([sys.executable, "server.py"], cwd=work,
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            try:
                if "listening" not in proc.stdout.readline():
                    errors.append("Server did not start")
                run = subprocess.run([sys.executable, "client.py"], cwd=work,
                                     capture_output=True, text=True, timeout=30)
                output = run.stdout
                if run.returncode or output != expected:
                    errors.append("Client output differs:\n" + output + run.stderr)
            finally:
                proc.terminate()
                proc.wait(timeout=5)

print(json.dumps({"result": "FAIL" if errors else "PASS", "python": sys.version.split()[0],
                  "pins": pins, "installed": installed, "client_output": output.splitlines(),
                  "errors": errors}, ensure_ascii=False, indent=2))
sys.exit(bool(errors))
