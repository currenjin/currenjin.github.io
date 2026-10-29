const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const read = name => fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name), 'utf8') : ''

test('two Home notes retain their approved payloads without the withdrawn hackathon note', () => {
  const home = read('index.html')
  for (const [id, phrase] of [['song', '생각할 거리를 남기는 가사'], ['socrates', '나는 어떤 존재인지, 왜 살아가는지']]) {
    assert.ok(home.includes(`href="#home-note-${id}" data-home-note="${id}">${phrase}</a>`))
    assert.ok(home.includes(`id="home-note-${id}"`))
  }
  assert.doesNotMatch(home, /home-note-hackathon|data-home-note="hackathon"|daffcadc-bceb-4c0a-83e3-521971858844|2026-10-daytona-hack-sprint/)
  assert.equal([...home.matchAll(/data-home-note="/g)].length, 2)
  assert.match(home, /저는, 그 선택에 푹 빠져 만들고 싶었던/)
  const song = home.match(/<section id="home-note-song"[\s\S]*?<\/section>/)[0]
  assert.match(song, /Kendrick Lamar \/ How Much a Dollar Cost/)
  const lyric = 'How much a dollar really cost?'
  const url = 'https://music.apple.com/us/song/how-much-a-dollar-cost-feat-james-fauntleroy-ronald-isley/1440871891'
  assert.ok(song.includes(`<blockquote><a href="${url}">${lyric}</a></blockquote>`))
  assert.doesNotMatch(song, /<p>|1달러의 진짜 값은/)
  assert.equal([...song.matchAll(/<a /g)].length, 1)
  assert.ok(lyric.split(/\s+/).length <= 10)
  assert.doesNotMatch(song, /Count Me Out|뮤직비디오|가사 출처|We may not know/ )
  assert.match(home, /소크라테스/ )
  assert.match(home, /<blockquote>성찰하지 않는 삶은 살 가치가 없다.<\/blockquote>/)
  assert.ok(home.includes('https://classics.mit.edu/Plato/apology.html'))
  assert.doesNotMatch(home, /카뮈|부조리|plato.stanford.edu\/entries\/camus/)
})

test('notes assets are root-only and separate from article and scene code', () => {
  assert.match(read('_includes/head.html'), /{% if page.url == '\/' %}[\s\S]*?\/css\/home-notes.css[\s\S]*?\/js\/home-notes.js[\s\S]*?{% endif %}/)
  const js = read('js/home-notes.js')
  for (const contract of ['getClientRects', 'pointermove', 'focusin', 'Escape', 'aria-expanded', 'scrollIntoView', 'pointerType']) assert.ok(js.includes(contract), contract)
  assert.match(read('css/home-notes.css'), /overflow-y:\s*auto/)
  for (const file of ['_layouts/wiki.html', '_layouts/review.html', '_layouts/post.html']) assert.doesNotMatch(read(file), /home-notes|data-home-note/)
})
