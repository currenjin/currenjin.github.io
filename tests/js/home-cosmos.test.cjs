const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const read = file => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : ''
const paragraphs = [
  '공통파트에서 일하는 소프트웨어 엔지니어입니다. 무언가에 푹 빠져 제 의도를 구현하는 순간을 좋아하며, 요즘은 해커톤에서 만들고 싶은 아이디어를 실제로 만들어내는 데 몰입합니다. 음악에서는 묵직한 베이스도 좋지만, 생각할 거리를 남기는 가사가 라임과 펀치라인까지 갖췄을 때 특히 좋습니다.',
  '문득문득 나는 어떤 존재인지, 왜 살아가는지, 무엇을 위한 삶인지 묻습니다. 아직 답을 찾지는 못했습니다. 질문이 떠오르면 한동안 그 생각을 하며 저 자신을 들여다봅니다.',
  '나중에 다시 찾아볼 지식은 위키에, 제 생각과 감상은 포스트와 리뷰에 남깁니다. 기록하는 동안 생각이 정리되거나 무언가를 깨닫기도 하지만, 기록 자체가 제게서 나온 흔적이기도 합니다. 누군가 이곳에서 제 생각을 발견하고 영감을 얻거나, 미래의 제가 돌아와 예전의 생각을 다시 만나면 좋겠습니다.',
]

test('Home contains the exact approved paragraphs, without inline explanatory UI', () => {
  const home = read('index.html')
  for (const paragraph of paragraphs) assert.ok(home.includes(`<p>${paragraph}</p>`))
  assert.doesNotMatch(home, /intro-note|intro-popover|note-leader|구조 살펴보기|신앙|이웃을 돕/)
})

test('Home retains the canonical dynamic archive and its navigation controls', () => {
  const home = read('index.html')
  for (const collection of ['site.activity_log', 'public_wiki', 'site.reviews', 'site.archive_books', 'site.archive_articles']) {
    assert.ok(home.includes(`in ${collection}`), collection)
  }
  for (const attribute of ['data-sort-ledger', 'data-filter-group', 'data-preview-toggle', 'data-book-toc-toggle']) assert.ok(home.includes(attribute))
  assert.doesNotMatch(home, /https:\/\/currenjin.github.io\/(wiki|reviews|posts)/)
})

test('cosmic assets load only on the root Home, not other home-layout pages', () => {
  const head = read('_includes/head.html')
  assert.match(head, /{% if page.url == '\/' %}[\s\S]*?\/css\/home-cosmos.css[\s\S]*?type="module"[\s\S]*?\/js\/home-cosmos.js[\s\S]*?{% endif %}/)
})

test('approved A puts the cosmos left and introduction right, with static fallback', () => {
  const css = read('css/home-cosmos.css')
  assert.match(css, /\.cosmic-masthead\s*\{[^}]*grid-column:\s*1/)
  assert.match(css, /\.personal-intro\s*\{[^}]*grid-column:\s*2/)
  assert.match(css, /@media\s*\(max-width:\s*1000px\)/)
  const home = read('index.html')
  assert.match(home, /class="cosmic-fallback"[^>]*src="{{ '\/resource\/icon\/favicon.svg'/)
  assert.match(home, /<canvas[^>]*role="button"[^>]*tabindex="0"/)
  assert.match(home, /<h1 class="cosmic-type">currenjin<\/h1>/)
})

test('cosmic module has no deferred explanatory subsystem and handles lifecycle', () => {
  const source = read('js/home-cosmos.js')
  assert.ok(source.includes("from './vendor/three.module.js'"))
  assert.doesNotMatch(source, /intro-note|intro-popover|noteLeader|drawLeader|placeNote|study-/)
  for (const contract of ['IntersectionObserver', 'visibilitychange', 'prefers-reduced-motion', 'webglcontextlost', 'webglcontextrestored', "e.key==='Enter'", "e.key===' '"]) assert.ok(source.includes(contract), contract)
  assert.doesNotMatch(source, /preserveDrawingBuffer:true/)
})

test('blackhole favicon replaces old identity and has raster and manifest fallbacks', () => {
  const svg = read('resource/icon/favicon.svg')
  assert.ok(svg.includes('M.5 34C17 35.6 47 35.6 63.5 34'))
  assert.ok(svg.includes('r="12"'))
  const head = read('_includes/head.html')
  assert.match(head, /favicon-32x32.png/)
  assert.match(head, /favicon.ico/)
  assert.match(head, /manifest.json/)
  const manifest = JSON.parse(read('resource/icon/manifest.json'))
  assert.equal(manifest.name, 'currenjin')
  for (const icon of manifest.icons) assert.ok(!icon.src.startsWith('/'), icon.src)
  for (const size of [16, 32, 64]) assert.ok(fs.existsSync(path.join(root, `resource/icon/favicon-${size}x${size}.png`)))
  assert.ok(read('js/vendor/three.LICENSE').includes('MIT License'))
})
