const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const file = path.join(__dirname, '../../js/content-images.js')
const api = fs.existsSync(file) ? require(file) : null

class Element {
  constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this.parentElement = null; this.attrs = {}; this.events = {}; this.className = '' }
  setAttribute(k,v) { this.attrs[k] = String(v) }
  getAttribute(k) { return this.attrs[k] ?? null }
  appendChild(child) { if(child.parentElement) child.parentElement.children.splice(child.parentElement.children.indexOf(child),1); this.children.push(child); child.parentElement=this; return child }
  replaceChild(next,old) { const i=this.children.indexOf(old); assert.ok(i>=0);this.children[i]=next;old.parentElement=null;next.parentElement=this;return old }
  insertBefore(next,reference) { if(!reference)return this.appendChild(next);const i=this.children.indexOf(reference);assert.ok(i>=0);this.children.splice(i,0,next);next.parentElement=this;return next }
  get nextSibling() { if(!this.parentElement)return null;const a=this.parentElement.children;return a[a.indexOf(this)+1] || null }
  closest(selector) { const tags=selector.split(',').map(x=>x.trim().toUpperCase());for(let e=this;e;e=e.parentElement)if(tags.includes(e.tagName))return e;return null }
  addEventListener(name,fn) { (this.events[name] ||= []).push(fn) }
  fire(name) { for(const fn of this.events[name] || [])fn() }
}
function fixture(options={}) {
  const images=[]
  const doc={baseURI:'https://example.test/wiki/topic/',readyState:'complete',createElement:tag=>new Element(tag,doc),querySelectorAll(selector){assert.equal(selector,'.prose img');return images}}
  const parent=doc.createElement(options.picture?'picture':'p')
  const container=doc.createElement(options.linked?'a':'article');container.appendChild(parent)
  const img=doc.createElement('img');Object.assign(img,{src:'https://github.com/user-attachments/assets/original',currentSrc:'',complete:true,naturalWidth:760,naturalHeight:520},options)
  img.setAttribute('alt','원본 그림 설명');parent.appendChild(img);images.push(img)
  return {doc,img,parent,container}
}
function moduleAPI(){assert.ok(api,'shared content image enhancement must exist');return api}

test('loaded prose images get an original link and a visible new-tab action without changing image attributes',()=>{
  const {doc,img,parent}=fixture();const before={...img.attrs};moduleAPI().mount(doc)
  const wrapper=parent.children[0],action=parent.children[1]
  assert.equal(wrapper.tagName,'A');assert.equal(wrapper.className,'diagram-image');assert.equal(wrapper.children[0],img)
  assert.equal(wrapper.href,img.src);assert.equal(action.href,img.src);assert.equal(action.className,'diagram-open')
  assert.equal(wrapper.target,'_blank');assert.equal(action.target,'_blank');assert.match(action.rel,/noopener/)
  assert.equal(action.textContent,'원본 크기로 보기 ↗');assert.match(wrapper.getAttribute('aria-label'),/새 탭/)
  assert.match(wrapper.getAttribute('aria-label'),/원본 그림 설명/)
  assert.match(action.getAttribute('aria-label'),/원본 그림 설명/)
  assert.deepEqual(img.attrs,before)
})

test('mount is idempotent and authored image links are preserved',()=>{
  const f=fixture();moduleAPI().mount(f.doc);moduleAPI().mount(f.doc);assert.equal(f.parent.children.length,2)
  const linked=fixture({linked:true});moduleAPI().mount(linked.doc);assert.equal(linked.img.parentElement,linked.parent);assert.equal(linked.parent.children.length,1)
})

test('lazy images are enhanced only after a successful load',()=>{
  const f=fixture({complete:false,naturalWidth:0,naturalHeight:0});moduleAPI().mount(f.doc);assert.equal(f.parent.children.length,1)
  f.img.naturalWidth=760;f.img.naturalHeight=520;f.img.complete=true;f.img.fire('load');assert.equal(f.parent.children.length,2)
})

test('tracking pixels, broken images and unsafe or embedded URLs stay untouched',()=>{
  for(const options of [{naturalWidth:1,naturalHeight:1},{naturalWidth:0,naturalHeight:0},{src:'javascript:alert(1)'},{src:'data:image/svg+xml,test'}]){
    const f=fixture(options);moduleAPI().mount(f.doc);assert.equal(f.img.parentElement,f.parent);assert.equal(f.parent.children.length,1)
  }
})

test('picture elements are wrapped around the picture rather than breaking its image structure',()=>{
  const f=fixture({picture:true});moduleAPI().mount(f.doc)
  assert.equal(f.img.parentElement,f.parent);assert.equal(f.container.children[0].children[0],f.parent)
  assert.equal(f.container.children[1].className,'diagram-open')
})
