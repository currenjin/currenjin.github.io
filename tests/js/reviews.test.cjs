const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
function gallery() {
  assert.ok(fs.existsSync(path.join(root, 'js/reviews.js')), 'review gallery controller must exist');
  return require('../../js/reviews.js');
}
const records = Array.from({length: 8}, (_, i) => ({title: `작품 ${i}`, author: i === 2 ? 'ＡＵＴＨＯＲ' : '저자', kind: i % 2 ? 'book' : 'music', status: i < 4 ? 'finished' : 'want', image: i === 7 ? '' : `https://example.test/${i}.jpg`, url: `/reviews/${i}/`, rating: '4.0', note: '원문 감상'}));

test('gallery uses real collection cards and loads assets only for the reviews layout', () => {
  const layout = read('_layouts/reviews.html'), head = read('_includes/head.html');
  assert.match(layout, /data-review-gallery/);
  assert.match(layout, /data-review-stage[^>]*hidden/);
  assert.match(layout, /data-review-search/);
  assert.match(layout, /include review-card.html review=review/);
  assert.match(head, /if page.layout == 'reviews'[\s\S]*css\/reviews.css[\s\S]*js\/reviews.js[\s\S]*endif/);
  assert.doesNotMatch(layout, /base64|DESIGN STUDY|head-note/);
  assert.match(read('js/ledger.js'), /if\(controls.hasAttribute\('data-review-gallery'\)\)return/);
});

test('gallery selects at most six covered reviews, never a copied snapshot', () => {
  const state = gallery().createState(records);
  assert.equal(state.visible.length, 8);
  assert.equal(state.featured.length, 6);
  assert.equal(state.current, records[0]);
  assert.equal(state.current.rating, '4.0');
});

test('next, previous and selectors wrap without automatic rotation', () => {
  const state = gallery().createState(records);
  state.select(-1); assert.equal(state.current, records[5]);
  state.move(1); assert.equal(state.current, records[0]);
  state.select(3); assert.equal(state.current, records[3]);
  assert.doesNotMatch(read('js/reviews.js'), /setInterval|scrollIntoView|scrollTo\(|localStorage|innerHTML/);
});

test('media, status and normalized title/author search intersect and reset selection', () => {
  const state = gallery().createState(records);
  state.select(4);
  state.filter('kind', 'music');
  state.filter('status', 'finished');
  state.filter('query', '  author ');
  assert.deepEqual(state.visible, [records[2]]);
  assert.deepEqual(state.featured, [records[2]]);
  assert.equal(state.index, 0);
  state.filter('query', '작품 0'); assert.deepEqual(state.visible, [records[0]]);
});

test('empty, single-item and missing-cover lists remain valid without duplicate artwork', () => {
  for (const rows of [[], [records[0]], [records[7]]]) {
    const state = gallery().createState(rows);
    state.move(-1); state.move(1);
    assert.equal(state.visible.length, rows.length);
    assert.equal(state.featured.length, rows[0]?.image ? 1 : 0);
    assert.equal(state.index, 0);
  }
});

test('scroll spreads covers, clamps progress, and reduced motion restores static transforms', () => {
  const {coverTransform} = gallery();
  const first = coverTransform(1, 0, false, false);
  const spread = coverTransform(1, 1, false, false);
  assert.notEqual(first.transform, spread.transform);
  assert.equal(first.opacity, 0.57);
  assert.equal(coverTransform(1, 2, false, false).transform, spread.transform);
  assert.equal(coverTransform(1, 1, false, true).transform, first.transform);
  assert.notEqual(coverTransform(1, 0, true, false).transform, first.transform);
  assert.equal(coverTransform(0, 1, false, false).opacity, 1);
});

// A tiny DOM fixture (like the existing ledger tests) exercises the real mount,
// event listeners and readback, without adding a runtime/test dependency.
function element(text = '') {
  return {textContent: text, hidden: false, dataset: {}, attrs: {}, children: [], listeners: {}, style: {setProperty(k,v){this[k]=v;}}, classList: {add(){}},
    setAttribute(k,v){this.attrs[k]=String(v);}, getAttribute(k){return this.attrs[k];},
    append(...els){this.children.push(...els);}, replaceChildren(...els){this.children=els;},
    addEventListener(k,fn){(this.listeners[k] ||= []).push(fn);}, emit(k){for(const fn of this.listeners[k]||[])fn({target:this});},
    querySelector(s){return this.map?.[s]||null;}, querySelectorAll(s){return this.all?.[s]||[];},
    getBoundingClientRect(){return {top: 140, height: 54};}, offsetHeight: 560};
}
function fixture(rows = records) {
  const page=element(), stage=element(), inner=element(), copy=element(), artwork=element(), dots=element(), prev=element(), next=element(), count=element(), empty=element(), search=element(), head=element(), strip=element();
  stage.hidden=true; stage.offsetHeight=880;
  const cards=rows.map(r=>{const card=element();card.dataset={kind:r.kind,status:r.status,writing:String(!!r.note)}; const title=element(r.title),author=element(r.author), link=element();link.href=r.url;const image=element();image.parentElement=element();image.src=r.image;image.alt=r.title+' 표지';const note=element(r.note), rating=element(r.rating);card.map={'.review-archive-title': title, '.review-archive-meta': author, '.review-archive-link':link, 'img.review-archive-cover':r.image?image:null, '.review-archive-note':note, '.review-archive-kind':element(r.kind), '.review-archive-rating':rating}; return card;});
  const kind=element(), status=element();kind.dataset.reviewFilterGroup='kind';status.dataset.reviewFilterGroup='status';
  const music=element();music.dataset.reviewFilter='music';const finished=element();finished.dataset.reviewFilter='finished';
  kind.all={'[data-review-filter]':[music]};status.all={'[data-review-filter]':[finished]};
  page.map={'[data-review-stage]':stage,'[data-review-stage-inner]':inner,'[data-review-copy]':copy,'[data-review-artwork]':artwork,'[data-review-selectors]':dots,'[data-review-prev]':prev,'[data-review-next]':next,'[data-review-count]':count,'[data-empty]':empty,'[data-review-search]':search,'[data-review-strip]':strip};
  page.all={'[data-filter-item]':cards,'[data-review-filter-group]':[kind,status]};
  const media={matches:false,addEventListener(k,fn){this.change=fn;}}, events={};
  const env={document:{createElement:tag=>Object.assign(element(),{tagName:tag.toUpperCase()}),querySelector:()=>head},innerWidth:1440,matchMedia:()=>media,addEventListener(k,fn){events[k]=fn;},requestAnimationFrame:fn=>fn(), getComputedStyle:()=>({})};
  return {page,stage,copy,artwork,dots,prev,next,count,empty,search,cards,music,finished,media,events,env};
}

test('real mount wires filtering, counts, selection and accessible pressed states', () => {
  const f=fixture(); gallery().mount(f.page,f.env);
  assert.equal(f.copy.children.find(c=>c.className==='review-scene-kicker').textContent,'음악 / 감상문');
  assert.equal(f.stage.hidden,false);assert.equal(f.count.textContent,'8/8');
  assert.equal(f.dots.children.length,6);assert.equal(f.dots.children[0].attrs['aria-pressed'],'true');
  f.next.emit('click');assert.equal(f.dots.children[1].attrs['aria-pressed'],'true');
  f.music.emit('click');f.finished.emit('click');f.search.value='author';f.search.emit('input');
  assert.equal(f.count.textContent,'1/8'); assert.equal(f.cards.filter(c=>!c.hidden).length,1);
  assert.equal(f.next.disabled,true);assert.equal(f.dots.children.length,1);assert.equal(f.artwork.children.length,1);
  assert.equal(f.music.attrs['aria-pressed'],'true');
  f.search.value='없는 제목';f.search.emit('input');
  assert.equal(f.stage.hidden,true);assert.equal(f.empty.dataset.visible,'true');assert.equal(f.count.textContent,'0/8');
});

test('failed images have visible textual fallback and reduced-motion changes repaint immediately', () => {
  const f=fixture(); gallery().mount(f.page,f.env);
  const cover=f.artwork.children.find(c=>c.dataset.offset==='0');
  const image=cover.children.find(c=>c.tagName==='IMG');
  assert.ok(image, 'artwork contains an actual image');image.emit('error');
  assert.equal(image.hidden,true);assert.ok(cover.children.some(c=>c.textContent==='표지 없음'&&!c.hidden));
  f.stage.getBoundingClientRect=()=>({top:-100,height:880});f.events.scroll();
  const moving=cover.style.transform;f.media.matches=true;f.media.change();
  assert.notEqual(cover.style.transform,moving);
  assert.equal(cover.style.opacity,'1');
});

test('selectors retain keyboard focus identity when the selected review changes', () => {
  const f=fixture();gallery().mount(f.page,f.env);
  const button=f.dots.children[3];button.emit('click');
  assert.equal(f.dots.children[3],button);
  assert.equal(button.attrs['aria-pressed'],'true');
  assert.equal(f.copy.children.find(c=>c.tagName==='H2').textContent,'작품 3');
  assert.equal(f.copy.children.find(c=>c.className==='review-scene-note').textContent,'원문 감상');
});

test('empty and uncovered mounts keep the original list usable without feature controls', () => {
  for(const rows of [[],[records[7]]]) {
    const f=fixture(rows);gallery().mount(f.page,f.env);
    assert.equal(f.stage.hidden,true);
    assert.equal(f.count.textContent,`${rows.length}/${rows.length}`);
    assert.equal(f.cards.filter(c=>!c.hidden).length,rows.length);
  }
});

test('selection animates the approved cover transition, and switching to reduced motion cancels it', () => {
  const f=fixture(), animations=[];
  for(const node of [f.copy,f.artwork]) node.animate=(frames,options)=>{
    const animation={cancelled:false,cancel(){this.cancelled=true;}};
    animations.push({frames,options,animation});return animation;
  };
  gallery().mount(f.page,f.env);
  assert.equal(animations.length,0,'initial scene stays visible without a transition');
  f.next.emit('click');
  assert.equal(animations.length,2,'selection animates both copy and cover artwork');
  assert.equal(animations[1].options.duration,650);
  f.media.matches=true;f.media.change();
  assert.ok(animations.every(a=>a.animation.cancelled),'in-flight animations stop under reduced motion');
  f.next.emit('click');assert.equal(animations.length,2,'no new animations under reduced motion');
});

test('mobile selectors never shrink below the required 44px target', () => {
  const css=read('css/reviews.css');
  assert.doesNotMatch(css,/\.review-selector\s*\{[^}]*min-width:0/);
  assert.match(css,/\.review-selectors\s*\{[^}]*flex-wrap:wrap/);
});

test('no JS leaves cards linkable, while new style rules stay review-scoped and targets accessible', () => {
  gallery();
  const css=read('css/reviews.css');
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/min-width:44px/);
  assert.match(css,/min-height:44px/);
  assert.doesNotMatch(css,/opacity:\s*0[;}]|\.site-head\s*\{|:root\s*\{/);
  const selectors=[...css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{/g)].map(m=>m[1].trim()).filter(s=>!s.startsWith('@'));
  for(const selectorsGroup of selectors) for(const selector of selectorsGroup.split(',')) assert.ok(selector.trim().startsWith('.reviews-page'),selector);
});
