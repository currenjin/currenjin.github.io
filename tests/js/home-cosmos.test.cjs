const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const read = file => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : ''
const paragraphs = [
  '머릿속에서 일어나는 일을 이해하려면 깊이 생각해야 한다. 나는 그 과정을 좋아한다. 공통파트에서 소프트웨어 엔지니어로 일하며, 광활한 공상에 푹 빠져 무언가를 만들어내는 일도 즐긴다. 음악과 같은 여러 영감을 주는 창작물에서는 생각할 거리를 남기는 가사, 구절, 장면 그리고 펀치라인에 매료되어 한 동안 빠져나오지 못하기도 한다.',
  '그렇게 좋아하고 오래 생각한 것들을 나중에도 들여다보고 싶어 글로 남긴다. 이 공간에서는 내가 배우고 생각하고 느낀 흔적을 모으며, 쓰는 동안 막연했던 생각을 조금씩 정리한다.',
  '내가 가사에서 생각할 거리를 얻듯, 이곳의 기록도 누군가에게 생각할 거리가 되면 좋겠다.',
]

test('Home contains the exact approved paragraphs with optional inline annotation markup', () => {
  const home = read('index.html')
  const intro = home.match(/<section class="personal-intro"[\s\S]*?<\/section>/)[0]
  const actual = [...intro.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(match => match[1].replace(/<[^>]+>/g, ''))
  assert.deepEqual(actual, paragraphs)
  assert.doesNotMatch(home, /구조 살펴보기|신앙|이웃을 돕/)
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

test('approved A keeps layout and wordmark, with no substitute before a rendered frame', () => {
  const css = read('css/home-cosmos.css')
  assert.match(css, /\.cosmic-masthead\s*\{[^}]*grid-column:\s*1/)
  assert.match(css, /\.personal-intro\s*\{[^}]*grid-column:\s*2/)
  assert.match(css, /@media\s*\(max-width:\s*1000px\)/)
  const home = read('index.html')
  assert.doesNotMatch(home, /cosmic-fallback/)
  assert.match(css, /\.cosmic-canvas\s*\{[^}]*visibility:hidden/)
  assert.match(css, /\[data-cosmic-ready="true"\] \.cosmic-canvas \{visibility:visible\}/)
  assert.match(read('_includes/head.html'), /home-cosmos\.css\?v=20261028-no-flash-1/)
  assert.match(read('js/home-cosmos.js'), /renderer\.render\(scene,camera\);state\.frames\+\+;[^}]*hero\.dataset\.cosmicReady='true'/)
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
