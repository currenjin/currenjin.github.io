const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const read = name => fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name), 'utf8') : ''

test('two Home notes retain their approved payloads without the withdrawn hackathon note', () => {
  const home = read('index.html').replace(/<span class="intro-word-start">([^<]*)<\/span>/g, '$1')
  for (const [id, phrase] of [['song', '가사'], ['cosmos', '구절']]) {
    assert.ok(home.includes(`href="#home-note-${id}" data-home-note="${id}">${phrase}</a>`))
    assert.ok(home.includes(`id="home-note-${id}"`))
  }
  assert.doesNotMatch(home, /home-note-hackathon|data-home-note="hackathon"|daffcadc-bceb-4c0a-83e3-521971858844|2026-10-daytona-hack-sprint/)
  assert.equal([...home.matchAll(/data-home-note="/g)].length, 2)
  assert.match(home, /한 동안 빠져나오지 못하기도 한다/)
  const song = home.match(/<section id="home-note-song"[\s\S]*?<\/section>/)[0]
  assert.match(song, /Kendrick Lamar \/ How Much a Dollar Cost/)
  const lyric = 'How much a dollar really cost?'
  const url = 'https://music.apple.com/us/song/how-much-a-dollar-cost-feat-james-fauntleroy-ronald-isley/1440871891'
  assert.ok(song.includes(`<blockquote><a href="${url}">${lyric}</a></blockquote>`))
  assert.doesNotMatch(song, /<p>|1달러의 진짜 값은/)
  assert.equal([...song.matchAll(/<a /g)].length, 1)
  assert.ok(lyric.split(/\s+/).length <= 10)
  assert.doesNotMatch(song, /Count Me Out|뮤직비디오|가사 출처|We may not know/ )
  assert.match(home, /칼 세이건/)
  assert.match(home, /<blockquote>코스모스는 과거에도 있었고 현재에도 있으며 미래에도 있을 그 모든 것이다.<\/blockquote>/)
  assert.doesNotMatch(home, /home-note-socrates|소크라테스|카뮈|부조리/)
})

test('notes assets are root-only and separate from article and scene code', () => {
  assert.match(read('_includes/head.html'), /{% if page.url == '\/' %}[\s\S]*?\/css\/home-notes.css[\s\S]*?\/js\/home-notes.js[\s\S]*?{% endif %}/)
  const js = read('js/home-notes.js')
  for (const contract of ['getClientRects', 'pointermove', 'focusin', 'Escape', 'aria-expanded', 'scrollIntoView', 'pointerType']) assert.ok(js.includes(contract), contract)
  assert.match(read('css/home-notes.css'), /overflow-y:\s*auto/)
  for (const file of ['_layouts/wiki.html', '_layouts/review.html', '_layouts/post.html']) assert.doesNotMatch(read(file), /home-notes|data-home-note/)
  assert.doesNotMatch(js, /cursor-follow|\.animate\(|Math\.exp|translate3d|lastPaint/)
})

test('Home inspiration credits retain the approved English names and destinations', () => {
  const home = read('index.html')
  assert.match(home, /Inspired by/)
  for (const [name,url] of [['Phi Institute of Design','https://www.phi.design/'],['Apple','https://www.apple.com/'],['pgLang','https://pg-lang.com/'],['John Grib','https://johngrib.github.io/'],['Bionic Reading','https://bionic-reading.com/']]) {
    assert.ok(home.includes(`<a href="${url}">${name}</a>`))
  }
})
