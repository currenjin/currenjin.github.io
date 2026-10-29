(() => {
  'use strict'
  const intro = document.querySelector('.personal-intro')
  const notes = document.querySelector('.home-notes')
  if (!intro || !notes) return
  const narrow = matchMedia('(max-width:1000px)')
  const reduced = matchMedia('(prefers-reduced-motion:reduce)')
  const triggers = [...intro.querySelectorAll('[data-home-note]')]
  triggers.forEach(anchor => {
    anchor.setAttribute('aria-controls', anchor.hash.slice(1))
    anchor.setAttribute('role', 'button')
    anchor.setAttribute('tabindex', '0')
    anchor.setAttribute('aria-expanded', 'false')
    anchor.setAttribute('aria-haspopup', 'dialog')
    anchor.removeAttribute('href')
  })
  const panels = [...notes.querySelectorAll('.home-note')]
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const path = document.createElementNS(svg.namespaceURI, 'path')
  svg.classList.add('home-note-leader')
  svg.setAttribute('aria-hidden', 'true')
  svg.append(path)
  svg.style.display = 'none'
  document.body.append(svg)
  const panelFor = trigger => document.getElementById(trigger.getAttribute('aria-controls'))
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max))
  let active = null
  let pinned = false
  let cursor = null
  let hover = null
  let preferredSide = null
  let frame = 0
  let dirty = false
  let target = null
  let pose = null
  let lastPaint = 0
  let lastFragment = -1
  let switchTimer
  let pending = null
  let restore = false
  function cancelSwitch() { clearTimeout(switchTimer); pending = null }
  function requestFrame() {
    if (!frame) frame = requestAnimationFrame(time => {
      frame = 0
      if (dirty) { dirty = false; place() }
      if (render(time)) requestFrame()
    })
  }
  function schedulePlace() { dirty = true; requestFrame() }
  function stopMotion() {
    cancelAnimationFrame(frame)
    frame = 0
    dirty = false
    target = null
  }
  function pin() {
    pinned = true
    cancelSwitch()
    stopMotion()
    if (active) panelFor(active).style.pointerEvents = ''
  }
  panels.forEach(panel => {
    panel.hidden = true
    panel.setAttribute('role', 'dialog')
    panel.tabIndex = -1
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'home-note-close'
    close.textContent = '닫기'
    close.addEventListener('click', () => dismiss(true))
    panel.prepend(close)
    panel.addEventListener('pointerenter', cancelSwitch)
    panel.addEventListener('focusin', pin)
  })
  notes.dataset.enhanced = ''
  function dismiss(returnFocus = false) {
    cancelSwitch()
    if (!active) return
    const previous = active
    panels.forEach(panel => { panel.hidden = true })
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'))
    active = null
    pinned = false
    stopMotion()
    pose = null
    lastFragment = -1
    svg.style.display = 'none'
    if (returnFocus) {
      restore = true
      previous.focus({ preventScroll:true })
      restore = false
    }
  }
  function place() {
    if (!active) return
    const panel = panelFor(active)
    if (narrow.matches) {
      target = null
      pose = null
      panel.style.removeProperty('transform')
      panel.style.pointerEvents = ''
      svg.style.display = 'none'
      return
    }
    panel.style.width = '300px'
    panel.style.maxHeight = `${Math.min(420, innerHeight-24)}px`
    const {width,height} = panel.getBoundingClientRect()
    const rects = [...active.getClientRects()].filter(rect => rect.width && rect.height)
    if (!rects.length) return
    const pointer = cursor || {x:rects[0].left,y:rects[0].bottom}
    const maxLeft = innerWidth-width-12, maxTop = innerHeight-height-12
    preferredSide ||= pointer.x > innerWidth/2 ? 'left' : 'right'
    if (preferredSide === 'left' && pointer.x-width-16 < 12 && pointer.x+width+16 <= innerWidth-12) preferredSide = 'right'
    else if (preferredSide === 'right' && pointer.x+width+16 > innerWidth-12 && pointer.x-width-16 >= 12) preferredSide = 'left'
    let left = clamp(preferredSide === 'left' ? pointer.x-width-16 : pointer.x+16,12,maxLeft)
    let top = clamp(pointer.y+16,12,maxTop)
    if (pinned && pose) {
      left = clamp(pose.left,12,maxLeft)
      top = clamp(pose.top,12,maxTop)
    } else {
      // Keep every reference accessible; slide in a continuous vertical band.
      let bands = [[12,maxTop]]
      for (const r of triggers.flatMap(trigger => [...trigger.getClientRects()])) {
        if (left+width <= r.left-8 || left >= r.right+8) continue
        const low = r.top-height-8, high = r.bottom+8
        bands = bands.flatMap(([a,b]) => high <= a || low >= b ? [[a,b]] :
          [...(low > a ? [[a,low]] : []), ...(high < b ? [[high,b]] : [])])
      }
      if (bands.length) top = bands.map(([a,b]) => clamp(top,a,b)).sort((a,b) => Math.abs(a-top)-Math.abs(b-top))[0]
    }
    panel.dataset.placement = 'cursor-follow'
    target = {left,top,width,height,rects,pointer}
  }
  function drawLeader() {
    const box = {left:pose.left,top:pose.top,right:pose.left+target.width,bottom:pose.top+target.height}
    const choices = target.rects.map((r,index) => {
      let bx = clamp((r.left+r.right)/2,box.left,box.right)
      let by = clamp((r.top+r.bottom)/2,box.top,box.bottom)
      const ax = clamp(bx,r.left,r.right), ay = clamp(by,r.top,r.bottom)
      bx = clamp(ax,box.left,box.right)
      by = clamp(ay,box.top,box.bottom)
      return {ax,ay,bx,by,index,distance:Math.hypot(bx-ax,by-ay)}
    }).filter(line => line.distance >= 1 && line.ay >= 0 && line.ay <= innerHeight)
    choices.sort((a,b) => a.distance-b.distance)
    const previous = choices.find(line => line.index === lastFragment)
    const line = previous && choices[0] && previous.distance <= choices[0].distance+16 ? previous : choices[0]
    if (!line || line.distance < 1) { svg.style.display = 'none'; return }
    lastFragment = line.index
    path.setAttribute('d', `M ${line.ax} ${line.ay} L ${line.bx} ${line.by}`)
    svg.style.display = ''
  }
  function render(time, immediate = false) {
    if (!active || !target || narrow.matches) return false
    const dx = target.left-(pose?.left ?? target.left), dy = target.top-(pose?.top ?? target.top)
    const distance = Math.hypot(dx,dy)
    const elapsed = clamp(time-lastPaint,1,32)
    const amount = immediate || reduced.matches || !pose || distance < .1 ? 1 :
      Math.min(1-Math.exp(-elapsed/35),24/distance)
    pose = {left:(pose?.left ?? target.left)+dx*amount,top:(pose?.top ?? target.top)+dy*amount}
    pose.left = clamp(pose.left,12,innerWidth-target.width-12)
    pose.top = clamp(pose.top,12,innerHeight-target.height-12)
    lastPaint = time
    const panel = panelFor(active)
    panel.style.left = '0px'
    panel.style.top = '0px'
    panel.style.transform = `translate3d(${pose.left}px,${pose.top}px,0)`
    panel.style.pointerEvents = amount < 1 && target.pointer.x >= pose.left && target.pointer.x <= pose.left+target.width &&
      target.pointer.y >= pose.top && target.pointer.y <= pose.top+target.height ? 'none' : ''
    drawLeader()
    return amount < 1
  }
  function open(trigger, selected = false) {
    cancelSwitch()
    if (active !== trigger) {
      cursor = !selected && hover?.paragraph === trigger.closest('p') ? hover : null
      preferredSide = null
      lastFragment = -1
      if (selected) pose = null
      panels.forEach(panel => { panel.hidden = panel !== panelFor(trigger) })
      triggers.forEach(item => item.setAttribute('aria-expanded',String(item === trigger)))
      active = trigger
      if (!selected && !reduced.matches) {
        const panel = panelFor(trigger)
        const content = pose ? [...panel.querySelectorAll('h2, blockquote, p')] : [panel]
        content.forEach(element => element.animate([{opacity:0},{opacity:1}],{duration:160,easing:'ease-out'}))
      }
    }
    pinned = selected
    if (selected || reduced.matches) { place(); render(performance.now(),true) }
    else schedulePlace()
    if (selected && narrow.matches) {
      trigger.scrollIntoView({block:'start',behavior:'instant'})
      requestAnimationFrame(() => {
        const r = trigger.getBoundingClientRect(), top = panelFor(trigger).getBoundingClientRect().top
        if (r.bottom > top-16) window.scrollBy(0,r.bottom-top+24)
      })
    }
  }
  function distance(rect,x,y) {
    return Math.max(rect.left-x,0,x-rect.right)**2+Math.max(rect.top-y,0,y-rect.bottom)**2
  }
  intro.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || narrow.matches || pinned) return
    const paragraph = event.target.closest('p')
    const candidates = paragraph ? [...paragraph.querySelectorAll('[data-home-note]')] : []
    if (active && (!paragraph || candidates.length)) {
      cursor = {paragraph,x:event.clientX,y:event.clientY}
      schedulePlace()
    }
    if (!candidates.length) { cancelSwitch(); return }
    hover = {paragraph,x:event.clientX,y:event.clientY}
    const nearest = candidates.reduce((best,item) => {
      const score = Math.min(...[...item.getClientRects()].map(r => distance(r,event.clientX,event.clientY)))
      return !best || score < best.score ? {item,score} : best
    },null)
    if (!active) { open(nearest.item); return }
    if (nearest.item === active) { cancelSwitch(); cursor = hover; schedulePlace(); return }
    if (pending !== nearest.item) {
      cancelSwitch()
      pending = nearest.item
      switchTimer = setTimeout(() => open(nearest.item),180)
    }
  })
  intro.addEventListener('pointerleave',cancelSwitch)
  let previousPointer = null
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return
    const panel = event.target.closest('.home-note')
    if (active && panel === panelFor(active) && previousPointer) {
      const r = panel.getBoundingClientRect()
      if (previousPointer.x < r.left || previousPointer.x > r.right || previousPointer.y < r.top || previousPointer.y > r.bottom) pin()
    }
    previousPointer = {x:event.clientX,y:event.clientY}
  },{capture:true,passive:true})
  intro.addEventListener('focusin', event => {
    if (!restore && event.target.matches('[data-home-note]')) open(event.target,true)
  })
  triggers.forEach(trigger => {
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); trigger.click() }
    })
    trigger.addEventListener('click', () => {
      open(trigger,true)
      panelFor(trigger).querySelector('.home-note-close').focus({preventScroll:true})
    })
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active) { event.preventDefault(); dismiss(true) }
  })
  document.addEventListener('pointerdown', event => {
    if (active && !event.target.closest('.home-note, [data-home-note]')) dismiss()
  })
  document.addEventListener('focusin', event => {
    if (active && !event.target.closest('.home-note, [data-home-note]')) dismiss()
  })
  window.addEventListener('scroll',schedulePlace,{passive:true})
  window.addEventListener('resize',schedulePlace)
  new ResizeObserver(schedulePlace).observe(notes)
  panels.forEach(panel => new ResizeObserver(schedulePlace).observe(panel))
  const initial = triggers.find(trigger => `#${trigger.getAttribute('aria-controls')}` === location.hash)
  if (initial) open(initial,true)
})()
