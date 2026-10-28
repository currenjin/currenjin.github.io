const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const read = name => fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name), 'utf8') : ''

test('two Home notes retain their approved payloads without the withdrawn hackathon note', () => {
  const home = read('index.html')
  for (const [id, phrase] of [['song', '생각할 거리를 남기는 가사'], ['camus', '나는 어떤 존재인지, 왜 살아가는지']]) {
    assert.ok(home.includes(`href="#home-note-${id}" data-home-note="${id}">${phrase}</a>`))
    assert.ok(home.includes(`id="home-note-${id}"`))
  }
  assert.doesNotMatch(home, /home-note-hackathon|data-home-note="hackathon"|daffcadc-bceb-4c0a-83e3-521971858844|2026-10-daytona-hack-sprint/)
  assert.equal([...home.matchAll(/data-home-note="/g)].length, 2)
  assert.match(home, /저는, 그 선택에 푹 빠져 만들고 싶었던/)
  assert.match(home, /Kendrick Lamar \/ Count Me Out/)
  const lyric = home.match(/<blockquote>([^<]+)<\/blockquote>/)[1]
  assert.equal(lyric, 'We may not know which way to go')
  assert.ok(lyric.split(/\s+/).length <= 10)
  assert.match(home, /https:\/\/www.youtube.com\/watch\?v=5GhhVHpPR_M/)
  assert.match(home, /https:\/\/music.apple.com\/us\/song\/count-me-out\/1623855685/)
  assert.match(home, /카뮈는 의미를 찾는 인간과 그 물음에 답하지 않는 세계 사이의 간극을 ‘부조리’로 설명한다. 삶의 이유를 묻는 질문을 살펴보는 하나의 관점이다./)
  assert.match(home, /https:\/\/plato.stanford.edu\/entries\/camus\//)
})

test('notes assets are root-only and separate from article and scene code', () => {
  assert.match(read('_includes/head.html'), /{% if page.url == '\/' %}[\s\S]*?\/css\/home-notes.css[\s\S]*?\/js\/home-notes.js[\s\S]*?{% endif %}/)
  const js = read('js/home-notes.js')
  for (const contract of ['getClientRects', 'pointermove', 'focusin', 'Escape', 'aria-expanded', 'scrollIntoView', 'pointerType']) assert.ok(js.includes(contract), contract)
  assert.match(read('css/home-notes.css'), /overflow-y:\s*auto/)
  for (const file of ['_layouts/wiki.html', '_layouts/review.html', '_layouts/post.html']) assert.doesNotMatch(read(file), /home-notes|data-home-note/)
})
