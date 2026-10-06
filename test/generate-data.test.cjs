const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const generator = path.resolve(__dirname, '../generateData.js');

function inScratch(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archive-generator-'));
  try { run(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('importing the generator does not scan or write the current directory', () => {
  inScratch(dir => {
    const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(generator)})`], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.deepEqual(fs.readdirSync(dir), []);
  });
});

test('CLI still writes tag and parent metadata from public wiki records', () => {
  inScratch(dir => {
    fs.mkdirSync(path.join(dir, '_wiki/nested'), { recursive: true });
    const write = (name, fields) => fs.writeFileSync(path.join(dir, '_wiki', name), `---\n${fields}\n---\nBody\n`);
    write('index.md', 'title: Index\ntags: [test]\nupdated: 2026-01-01\npublic: true');
    write('nested/child.md', 'title: Child\nparent: "[[index]]"\ntags: [test]\nupdated: 2026-01-02\npublic: true');
    write('private.md', 'title: Private\ntags: [test]\npublic: false');
    const result = spawnSync(process.execPath, [generator], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const read = name => JSON.parse(fs.readFileSync(path.join(dir, 'data', name), 'utf8'));
    assert.deepEqual(read('tag/test.json').map(row => row.id), ['nested/child', 'index']);
    assert.equal(read('metadata/nested/child.json').parent, 'index');
    assert.equal(read('metadata/nested/child.json').url, '/wiki/nested/child');
    assert.deepEqual(read('tag_count.json'), [{ name: 'test', size: 2 }]);
    assert.equal(fs.existsSync(path.join(dir, 'data/metadata/private.json')), false);
  });
});
