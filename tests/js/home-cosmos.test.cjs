const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.join(__dirname, '../..')
const read = file => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : ''
const paragraphs = [
  '머릿속의 의도를 실제로 구현하려면 수많은 선택을 해야 합니다. 공통파트에서 일하는 소프트웨어 엔지니어인 저는, 그 선택에 푹 빠져 만들고 싶었던 모습을 구현하는 순간을 좋아합니다. 음악에서도 묵직한 베이스를 좋아하지만, 생각할 거리를 남기는 가사에 라임과 펀치라인까지 갖춰졌을 때, 무엇을 말하는지와 어떻게 표현하는지를 함께 즐깁니다.',
  '하지만 무엇을 만들고 싶은지와 무엇을 위해 살아가는지는 서로 다른 질문입니다. 의도를 구현하는 데 몰입하다가도, 문득 나는 어떤 존재인지, 왜 살아가는지 묻게 됩니다. 아직 답을 찾지는 못했고, 질문이 떠오르면 한동안 그 생각을 합니다.',
  '답을 찾기 전의 생각에도 남겨둘 이유는 있습니다. 다시 찾아볼 지식은 위키에, 제가 생각하고 느낀 흔적은 포스트와 리뷰에 남기며, 쓰는 동안 생각을 정리하거나 무언가를 깨닫기도 합니다. 누군가에게는 이 기록이 새로운 생각의 계기가 되고, 미래의 저에게는 과거의 제가 무엇을 묻고 있었는지 보여주면 좋겠습니다.',
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
