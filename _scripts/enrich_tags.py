#!/usr/bin/env python3
"""Enrich tags for wiki and book files."""
import re, os

BASE = os.path.join(os.path.dirname(__file__), "..")
WIKI  = os.path.join(BASE, "_wiki")
BOOKS = os.path.join(BASE, "_books")

# ── Wiki: add tags to existing arrays ─────────────────────────
WIKI_ADD = {
    "skywalking.md":                    None,  # handled separately (format fix)
    "annotation.md":                    ["spring", "programming"],
    "augmented-coding.md":              ["ai-agent", "productivity"],
    "building-microservices.md":        ["design", "devops", "engineering"],
    "CDD.md":                           ["design", "engineering"],
    "claude-code.md":                   ["ai", "productivity", "engineering"],
    "concurrent-linked-queue.md":       ["concurrency"],
    "designing-data-intensive-applications.md": ["engineering", "design"],
    "docker-compose.md":                ["devops"],
    "docker-swarm.md":                  ["devops"],
    "docker.md":                        ["devops"],
    "dockerfile.md":                    ["devops"],
    "elasticsearch.md":                 ["observability"],
    "ERD.md":                           ["sql"],
    "fibonacci.md":                     ["programming", "data-structure"],
    "fitnesse.md":                      ["tdd", "java"],
    "fixture-monkey-with-jpa.md":       ["java", "tdd"],
    "git.md":                           ["devops", "engineering"],
    "grafana-loki-tempo.md":            ["devops", "sre"],
    "graphql.md":                       ["javascript"],
    "implementation-patterns.md":       ["java", "engineering"],
    "java-to-kotlin.md":                ["programming"],
    "jpa-deep-dive-by-currenjin.md":    ["java", "spring"],
    "junit.md":                         ["tdd"],
    "kotlin-vs-java-tradeoff.md":       ["programming"],
    "lambda-with-api-gateway.md":       ["devops", "api"],
    "layered-architecture.md":          ["design", "pattern"],
    "Mockito.md":                       ["tdd"],
    "modern-software-engineering.md":   ["tdd", "devops", "design"],
    "multithreaded-javascript.md":      ["programming"],
    "n+1.md":                           ["java", "graphql", "spring"],
    "oop.md":                           ["java", "programming"],
    "openclaw.md":                      ["ai", "productivity"],
    "opencode.md":                      ["ai", "productivity"],
    "openstack.md":                     ["devops"],
    "osi-7-layer.md":                   ["architecture"],
    "polymorphism.md":                  ["java", "programming"],
    "programming-language.md":          ["design"],
    "refactoring.md":                   ["engineering", "tdd"],
    "s3.md":                            ["cloud"],
    "sleuth-sqs.md":                    ["spring", "devops"],
    "specification-pattern.md":         ["java", "tdd"],
    "spring-bean.md":                   ["architecture"],
    "sre-google.md":                    ["engineering", "observability"],
    "street-coder.md":                  ["programming", "productivity"],
    "svg.md":                           ["javascript", "programming"],
    "TDD.md":                           ["engineering"],
    "test.md":                          ["tdd", "engineering"],
    "the-well-grounded-java-developer.md": ["jvm", "engineering"],
    "tidy-first.md":                    ["engineering", "tdd"],
    "toss-slash-24.md":                 ["devops", "observability"],
    "typescript-compile.md":            ["javascript", "programming"],
    "unit-test.md":                     ["tdd", "engineering"],
    "user-stories-applied.md":          ["engineering", "design"],
    "vaadin.md":                        ["spring"],
    "web-mvc.md":                       ["java", "design"],
}

# skywalking.md: non-array format → fix and replace with proper tags
SKYWALKING_TAGS = ["observability", "java", "devops", "sre"]

# ── Books: add tags ────────────────────────────────────────────
BOOKS_ADD = {
    "오픈스택-관리-바이블.md":                          ["devops"],
    "Release의-모든-것.md":                             ["architecture", "engineering"],
    "Nodejs-하이-퍼포먼스.md":                          ["programming"],
    "이펙티브-자바.md":                                 ["engineering", "programming"],
    "구글-엔지니어는-이렇게-일한다.md":                  ["test", "design"],
    "리액트-웹앱-제작-총론.md":                          ["frontend"],
    "이벤트-소싱과-마이크로서비스-아키텍처.md":           ["design", "engineering"],
    "The-Joy-of-Kotlin.md":                             ["java", "programming"],
    "카프카-데이터-플랫폼의-최강자.md":                   ["devops"],
    "JUnit-in-Action.md":                               ["java", "tdd"],
    "전략적-모놀리스와-마이크로서비스.md":                ["design", "engineering"],
    "마이크로서비스-아키텍처.md":                        ["design", "engineering"],
    "실용주의-프로그래머.md":                            ["programming", "design"],
    "풀스택-테스트-10가지-테스트-기술.md":               ["engineering"],
    "데이터-중심-애플리케이션-설계.md":                   ["architecture", "design"],
    "단위-테스트.md":                                    ["tdd", "engineering"],
    "Effective-Unit-Testing.md":                        ["tdd", "java"],
    "러닝-자바스크립트.md":                              ["programming"],
    "클린-코더.md":                                     ["programming", "design"],
    "스트리트-코더.md":                                  ["programming"],
    "아마존-웹-서비스-AWS-패턴별-구축운용-가이드.md":     ["devops", "cloud"],
    "소프트웨어-개발자-테스팅.md":                       ["engineering", "tdd"],
    "마이크로서비스-아키텍처-구축.md":                   ["design", "engineering", "devops"],
    "이것이-우분투-리눅스다.md":                         ["cloud"],
    "사용자-스토리.md":                                  ["design", "agile"],
    "코틀린-인-액션.md":                                 ["java", "programming"],
    "밑바닥부터-만드는-컴퓨팅-시스템-2판.md":            ["engineering"],
}


def parse_tags(line):
    val = line.split(':', 1)[1].strip()
    if val.startswith('[') and val.endswith(']'):
        inner = val[1:-1]
        return [t.strip().strip("'\"") for t in inner.split(',') if t.strip()]
    return [t.strip().strip("'\"") for t in re.split(r'[\s,]+', val) if t.strip()]


def fmt_wiki(tags):
    return "[" + ", ".join(tags) + "]"


def fmt_book(tags):
    return "[" + ", ".join(f"'{t}'" for t in tags) + "]"


def update_file(path, new_tags, formatter, replace=False):
    with open(path, encoding='utf-8') as f:
        lines = f.read().split('\n')

    in_fm = False
    idx = -1
    for i, line in enumerate(lines):
        if i == 0 and line.strip() == '---':
            in_fm = True; continue
        if in_fm and line.strip() == '---':
            break
        if in_fm and re.match(r'\s*tags\s*:', line):
            idx = i

    if idx == -1:
        print(f"  NO TAGS LINE: {os.path.basename(path)}"); return

    existing = [] if replace else parse_tags(lines[idx])
    combined = list(existing)
    for t in new_tags:
        if t not in combined:
            combined.append(t)

    if combined == existing:
        return

    m = re.match(r'^(\s*tags\s*:)\s*', lines[idx])
    prefix = m.group(1) if m else 'tags    :'
    lines[idx] = prefix + ' ' + formatter(combined)

    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"  {os.path.basename(path)}: {existing} → {combined}")


# ── Run ────────────────────────────────────────────────────────
print("=== Wiki ===")
sky = os.path.join(WIKI, "skywalking.md")
update_file(sky, SKYWALKING_TAGS, fmt_wiki, replace=True)

for fname, tags in WIKI_ADD.items():
    if tags is None: continue
    p = os.path.join(WIKI, fname)
    if not os.path.exists(p):
        print(f"  NOT FOUND: {fname}"); continue
    update_file(p, tags, fmt_wiki)

print("\n=== Books ===")
for fname, tags in BOOKS_ADD.items():
    p = os.path.join(BOOKS, fname)
    if not os.path.exists(p):
        print(f"  NOT FOUND: {fname}"); continue
    update_file(p, tags, fmt_book)

print("\nDone.")
