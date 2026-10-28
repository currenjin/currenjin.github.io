(() => {
  'use strict'
  const intro = document.querySelector('.personal-intro')
  const notes = document.querySelector('.home-notes')
  if (!intro || !notes) return
  const narrow = matchMedia('(max-width:1000px)')
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
  let active = null
  let pinned = false
  let timer
  let switchTimer
  let pending = null
  function cancelSwitch() { clearTimeout(switchTimer); pending = null }
  let restore = false
  const panelFor = trigger => document.getElementById(trigger.getAttribute('aria-controls'))
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
    panel.addEventListener('pointerenter', () => { clearTimeout(timer); cancelSwitch() })
    panel.addEventListener('pointerleave', scheduleClose)
    panel.addEventListener('focusin', () => { pinned = true; clearTimeout(timer) })
  })
  notes.dataset.enhanced = ''
  function dismiss(returnFocus = false) {
    clearTimeout(timer)
    cancelSwitch()
    if (!active) return
    const previous = active
    panels.forEach(panel => { panel.hidden = true })
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'))
    active = null
    pinned = false
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
    if (narrow.matches) { svg.style.display = 'none'; return }
    const art = document.querySelector('.cosmic-masthead').getBoundingClientRect()
    const column = intro.getBoundingClientRect()
    panel.style.width = `${Math.min(300, art.width)}px`
    panel.style.left = `${art.right - panel.offsetWidth}px`
    const wordmark = document.querySelector('.cosmic-type').getBoundingClientRect()
    const top = Math.max(16, Math.min(wordmark.bottom + 8, innerHeight - 160))
    const ledgerTop = document.querySelector('.ledger-head').getBoundingClientRect().top
    const bottom = Math.min(innerHeight - 16, ledgerTop > top + 120 ? ledgerTop - 12 : innerHeight - 16)
    panel.style.maxHeight = `${bottom - top}px`
    panel.style.top = `${top}px`
    const target = panel.getBoundingClientRect()
    const fragment = [...active.getClientRects()].reduce((a, b) => a.left < b.left ? a : b)
    const x = fragment.left
    const y = fragment.bottom - 1
    const gutter = column.left - 14
    const endY = Math.max(target.top + 18, Math.min(y, target.bottom - 18))
    path.setAttribute('d', `M ${x} ${y} H ${gutter} V ${endY} H ${target.right}`)
    svg.style.display = y < 0 || y > innerHeight ? 'none' : ''
  }
  function open(trigger, pin = false) {
    clearTimeout(timer)
    cancelSwitch()
    if (active !== trigger) {
      panels.forEach(panel => { panel.hidden = panel !== panelFor(trigger) })
      triggers.forEach(item => item.setAttribute('aria-expanded', String(item === trigger)))
      active = trigger
    }
    pinned = pin
    place()
    if (pin && narrow.matches) {
      trigger.scrollIntoView({ block:'start', behavior:'instant' })
      requestAnimationFrame(() => {
        const rect = trigger.getBoundingClientRect()
        const top = panelFor(trigger).getBoundingClientRect().top
        if (rect.bottom > top - 16) window.scrollBy(0, rect.bottom - top + 24)
      })
    }
  }
  function scheduleClose() {
    clearTimeout(timer)
    if (!pinned) timer = setTimeout(() => dismiss(), 700)
  }
  function distance(rect, x, y) {
    return Math.max(rect.left - x, 0, x - rect.right) ** 2 + Math.max(rect.top - y, 0, y - rect.bottom) ** 2
  }
  intro.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || narrow.matches || pinned) return
    const paragraph = event.target.closest('p')
    const candidates = paragraph ? [...paragraph.querySelectorAll('[data-home-note]')] : []
    if (!candidates.length) { scheduleClose(); return }
    const nearest = candidates.reduce((best, item) => {
      const score = Math.min(...[...item.getClientRects()].map(rect => distance(rect, event.clientX, event.clientY)))
      return !best || score < best.score ? { item, score } : best
    }, null)
    if (!active || nearest.item === active) { open(nearest.item); return }
    if (pending !== nearest.item) {
      cancelSwitch()
      pending = nearest.item
      switchTimer = setTimeout(() => open(nearest.item), 220)
    }
  })
  intro.addEventListener('pointerleave', () => { cancelSwitch(); scheduleClose() })
  intro.addEventListener('focusin', event => {
    if (!restore && event.target.matches('[data-home-note]')) open(event.target, true)
  })
  triggers.forEach(trigger => {
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        trigger.click()
      }
    })
    trigger.addEventListener('click', () => {
      open(trigger, true)
      panelFor(trigger).querySelector('.home-note-close').focus({ preventScroll:true })
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
  window.addEventListener('scroll', place, { passive:true })
  window.addEventListener('resize', place)
  new ResizeObserver(place).observe(notes)
  panels.forEach(panel => new ResizeObserver(place).observe(panel))
  const initial = triggers.find(trigger => `#${trigger.getAttribute('aria-controls')}` === location.hash)
  if (initial) open(initial, true)
})()
