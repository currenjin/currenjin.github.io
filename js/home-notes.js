(() => {
  'use strict'
  const intro = document.querySelector('.personal-intro')
  const notes = document.querySelector('.home-notes')
  if (!intro || !notes) return
  const narrow = matchMedia('(max-width:1000px)')
  const triggers = [...intro.querySelectorAll('[data-home-note]')]
  const panels = [...notes.querySelectorAll('.home-note')]
  const panelFor = trigger => document.getElementById(trigger.getAttribute('aria-controls'))
  const clamp = (value,min,max) => Math.max(min,Math.min(value,max))
  triggers.forEach(anchor => {
    anchor.setAttribute('aria-controls',anchor.hash.slice(1))
    anchor.setAttribute('role','button')
    anchor.setAttribute('tabindex','0')
    anchor.setAttribute('aria-expanded','false')
    anchor.setAttribute('aria-haspopup','dialog')
    anchor.removeAttribute('href')
  })
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  const path = document.createElementNS(svg.namespaceURI,'path')
  svg.classList.add('home-note-leader')
  svg.setAttribute('aria-hidden','true')
  svg.append(path)
  svg.style.display = 'none'
  document.body.append(svg)
  let active = null
  let pinned = false
  let frame = 0
  let switchTimer
  let pending = null
  let restore = false
  function cancelSwitch() { clearTimeout(switchTimer); pending = null }
  function pin() { pinned = true; cancelSwitch() }
  function schedulePlace() {
    if (frame) return
    frame = requestAnimationFrame(() => { frame = 0; place() })
  }
  function place() {
    if (!active) return
    if (narrow.matches) { svg.style.display = 'none'; return }
    const panel = panelFor(active)
    const column = intro.getBoundingClientRect()
    const paragraph = active.closest('p').getBoundingClientRect()
    panel.style.width = '300px'
    panel.style.maxHeight = `${Math.min(420,innerHeight-24)}px`
    const {width,height} = panel.getBoundingClientRect()
    const left = column.left-width-24
    const top = clamp(paragraph.top,12,innerHeight-height-12)
    panel.style.left = `${left}px`
    panel.style.top = `${top}px`
    panel.dataset.placement = 'margin-static'
    const source = [...active.getClientRects()].find(rect => rect.width && rect.height)
    if (!source || source.bottom < 0 || source.bottom+3 > innerHeight) { svg.style.display = 'none'; return }
    // Run beneath the source's text row, then vertically in the empty gutter.
    const y = source.bottom+3, gutter = column.left-12, endY = top+height/2
    path.setAttribute('d',`M ${source.left} ${y} H ${gutter} V ${endY} H ${left+width}`)
    svg.style.display = ''
  }
  function dismiss(returnFocus = false) {
    cancelSwitch()
    if (!active) return
    const previous = active
    panels.forEach(panel => { panel.hidden = true })
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded','false'))
    active = null
    pinned = false
    svg.style.display = 'none'
    if (returnFocus) {
      restore = true
      previous.focus({preventScroll:true})
      restore = false
    }
  }
  panels.forEach(panel => {
    panel.hidden = true
    panel.setAttribute('role','dialog')
    panel.tabIndex = -1
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'home-note-close'
    close.textContent = '닫기'
    close.addEventListener('click',() => dismiss(true))
    panel.prepend(close)
    panel.addEventListener('pointerenter',pin)
    panel.addEventListener('focusin',pin)
  })
  notes.dataset.enhanced = ''
  function open(trigger,selected = false) {
    cancelSwitch()
    panels.forEach(panel => { panel.hidden = panel !== panelFor(trigger) })
    triggers.forEach(item => item.setAttribute('aria-expanded',String(item === trigger)))
    active = trigger
    pinned = selected
    place()
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
  intro.addEventListener('pointermove',event => {
    if (event.pointerType !== 'mouse' || narrow.matches || pinned) return
    const paragraph = event.target.closest('p')
    const candidates = paragraph ? [...paragraph.querySelectorAll('[data-home-note]')] : []
    if (!candidates.length) { cancelSwitch(); return }
    const nearest = candidates.reduce((best,item) => {
      const score = Math.min(...[...item.getClientRects()].map(r => distance(r,event.clientX,event.clientY)))
      return !best || score < best.score ? {item,score} : best
    },null)
    if (!active) { open(nearest.item); return }
    if (nearest.item === active) { cancelSwitch(); return }
    if (pending !== nearest.item) {
      cancelSwitch()
      pending = nearest.item
      switchTimer = setTimeout(() => open(nearest.item),180)
    }
  })
  intro.addEventListener('pointerleave',cancelSwitch)
  intro.addEventListener('focusin',event => {
    if (!restore && event.target.matches('[data-home-note]')) open(event.target,true)
  })
  triggers.forEach(trigger => {
    trigger.addEventListener('keydown',event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); trigger.click() }
    })
    trigger.addEventListener('click',() => {
      open(trigger,true)
      panelFor(trigger).querySelector('.home-note-close').focus({preventScroll:true})
    })
  })
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && active) { event.preventDefault(); dismiss(true) }
  })
  document.addEventListener('pointerdown',event => {
    if (active && !event.target.closest('.home-note, [data-home-note]')) dismiss()
  })
  document.addEventListener('focusin',event => {
    if (active && !event.target.closest('.home-note, [data-home-note]')) dismiss()
  })
  window.addEventListener('scroll',schedulePlace,{passive:true})
  window.addEventListener('resize',schedulePlace)
  new ResizeObserver(schedulePlace).observe(intro)
  panels.forEach(panel => new ResizeObserver(schedulePlace).observe(panel))
  const initial = triggers.find(trigger => `#${trigger.getAttribute('aria-controls')}` === location.hash)
  if (initial) open(initial,true)
})()
