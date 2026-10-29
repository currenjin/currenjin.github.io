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
  let cursor = null
  let hover = null
  let frame = 0
  function schedulePlace() {
    if (frame) return
    frame = requestAnimationFrame(() => { frame = 0; place() })
  }

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
    panel.addEventListener('pointerenter', () => { pinned = true; cancelSwitch() })
    panel.addEventListener('focusin', () => { pinned = true; cancelSwitch() })
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
    svg.style.display = 'none'
    if (returnFocus) {
      restore = true
      previous.focus({ preventScroll:true })
      restore = false
    }
  }
  let previousChoice = null
  // A candidate is S -> actual client cursor -> E, with E on an incoming panel
  // edge. Never clamp E independently: that would silently break collinearity.
  // Solve the allowed distance beyond the cursor against viewport constraints,
  // then prefer a panel disjoint from the active paragraph. Other prose can be
  // crossed by a straight ray; a quiet stroke is preferable to a disguised bend.
  function fit(interval, base, rate, min, max) {
    if (Math.abs(rate) < 1e-7) return base >= min && base <= max ? interval : null
    const a = (min - base) / rate
    const b = (max - base) / rate
    const result = [Math.max(interval[0], Math.min(a, b)), Math.min(interval[1], Math.max(a, b))]
    return result[0] <= result[1] ? result : null
  }
  function placement(rects, pointer, width, height, paragraph) {
    const candidates = []
    const otherReferences = triggers.filter(trigger => trigger !== active).flatMap(trigger => [...trigger.getClientRects()])
    rects.forEach((rect, fragment) => {
      // Every source lies on a real fragment edge, including wrapped annotations.
      const sources = [[rect.left, rect.top], [rect.right, rect.top],
        [rect.left, rect.bottom], [rect.right, rect.bottom],
        [rect.left, (rect.top + rect.bottom) / 2], [rect.right, (rect.top + rect.bottom) / 2],
        [(rect.left + rect.right) / 2, rect.top], [(rect.left + rect.right) / 2, rect.bottom]]
      sources.forEach(([x, y], source) => {
        const distance = Math.hypot(pointer.x - x, pointer.y - y)
        if (distance < 1) return
        const ux = (pointer.x - x) / distance
        const uy = (pointer.y - y) / distance
        for (const axis of ['x', 'y']) {
          if (Math.abs(axis === 'x' ? ux : uy) < 1e-7) continue
          for (const fraction of [0, .25, .5, .75, 1]) {
            const ox = axis === 'x' ? (ux > 0 ? 0 : -width) : -width * fraction
            const oy = axis === 'y' ? (uy > 0 ? 0 : -height) : -height * fraction
            const bx = pointer.x + ox
            const by = pointer.y + oy
            let interval = fit([24, Math.hypot(innerWidth, innerHeight)], bx, ux, 12, innerWidth - 12 - width)
            if (interval) interval = fit(interval, by, uy, 12, innerHeight - 12 - height)
            if (!interval) continue
            let clear = []
            for (const margin of [8, 0]) {
              clear = [
                fit(interval, bx, ux, -Infinity, paragraph.left - width - margin),
                fit(interval, bx, ux, paragraph.right + margin, Infinity),
                fit(interval, by, uy, -Infinity, paragraph.top - height - margin),
                fit(interval, by, uy, paragraph.bottom + margin, Infinity)
              ].filter(Boolean)
              if (clear.length) break
            }
            const gap = clear.length ? Math.min(...clear.map(item => item[0])) : interval[0]
            const left = bx + ux * gap
            const top = by + uy * gap
            const overlap = Math.max(0, Math.min(left + width, paragraph.right) - Math.max(left, paragraph.left)) *
              Math.max(0, Math.min(top + height, paragraph.bottom) - Math.max(top, paragraph.top))
            const referenceOverlap = otherReferences.reduce((sum, rect) => sum +
              Math.max(0, Math.min(left + width, rect.right) - Math.max(left, rect.left)) *
              Math.max(0, Math.min(top + height, rect.bottom) - Math.max(top, rect.top)), 0)
            const key = `${fragment}:${source}:${axis}:${axis === 'x' ? Math.sign(ux) : Math.sign(uy)}:${fraction}`
            const travel = previousChoice ? Math.hypot(left - previousChoice.left, top - previousChoice.top) : 0
            candidates.push({ key, left, top, start:{ x, y },
              end:{ x:pointer.x + ux * gap, y:pointer.y + uy * gap },
              score:overlap * 20 + referenceOverlap * 100 + gap + 2000 / distance + travel * 2 +
                64 * (1 - Math.abs(axis === 'x' ? ux : uy)), overlap, referenceOverlap })
          }
        }
      })
    })
    candidates.sort((a, b) => a.score - b.score)
    const best = candidates[0]
    // Keep a viable branch through tiny movements instead of corner-flipping.
    const previous = candidates.find(item => item.key === previousChoice?.key)
    const chosen = previous && best && previous.score <= best.score + 48 &&
      (previous.referenceOverlap < 1 || best.referenceOverlap >= 1) &&
      (previous.overlap < 1 || best.overlap >= 1) ? previous : best
    previousChoice = chosen || null
    return chosen
  }
  function place() {
    if (!active) return
    const panel = panelFor(active)
    if (narrow.matches) { svg.style.display = 'none'; return }
    const paragraph = active.closest('p').getBoundingClientRect()
    panel.style.width = '300px'
    const upperBand = paragraph.top - 20
    panel.style.maxHeight = `${Math.min(420, innerHeight - 24, upperBand >= 112 ? upperBand : 420)}px`
    const rects = [...active.getClientRects()].filter(rect => rect.width && rect.height)
    const fragment = rects[0]
    // Keyboard/hash activation has no pointer obligation and uses a readable
    // leftward source ray. Pinning retains an already-open pointer placement.
    const pointer = cursor || { x:paragraph.left - 28, y:(fragment.top + fragment.bottom) / 2 }
    const chosen = placement(rects, pointer, panel.offsetWidth, panel.offsetHeight, paragraph)
    if (!chosen) {
      // At extreme rays a panel cannot fit beyond the actual pointer with
      // 24px clearance. Keep it usable, mark the fallback, and hide the line.
      panel.dataset.placement = 'edge-fallback'
      panel.style.left = `${Math.max(12, Math.min(paragraph.left - panel.offsetWidth - 16, innerWidth - panel.offsetWidth - 12))}px`
      panel.style.top = `${Math.max(12, Math.min(fragment.bottom + 16, innerHeight - panel.offsetHeight - 12))}px`
      svg.style.display = 'none'
      return
    }
    panel.dataset.placement = chosen.overlap < 1 ? 'collinear' : 'collinear-overlap'
    panel.style.left = `${chosen.left}px`
    panel.style.top = `${chosen.top}px`
    path.setAttribute('d', `M ${chosen.start.x} ${chosen.start.y} L ${chosen.end.x} ${chosen.end.y}`)
    svg.style.display = chosen.start.y < 0 || chosen.start.y > innerHeight ? 'none' : ''
  }
  function open(trigger, pin = false) {
    cancelSwitch()
    if (active !== trigger) {
      cursor = !pin && hover?.paragraph === trigger.closest('p') ? hover : null
      previousChoice = null
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

  function distance(rect, x, y) {
    return Math.max(rect.left - x, 0, x - rect.right) ** 2 + Math.max(rect.top - y, 0, y - rect.bottom) ** 2
  }
  intro.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || narrow.matches || pinned) return
    const paragraph = event.target.closest('p')
    const candidates = paragraph ? [...paragraph.querySelectorAll('[data-home-note]')] : []
    if (!candidates.length) { cancelSwitch(); return }
    hover = { paragraph, x:event.clientX, y:event.clientY }
    const nearest = candidates.reduce((best, item) => {
      const score = Math.min(...[...item.getClientRects()].map(rect => distance(rect, event.clientX, event.clientY)))
      return !best || score < best.score ? { item, score } : best
    }, null)
    if (!active) { open(nearest.item); return }
    if (nearest.item === active) {
      cancelSwitch()
      cursor = hover
      schedulePlace()
      return
    }
    if (pending !== nearest.item) {
      cancelSwitch()
      pending = nearest.item
      switchTimer = setTimeout(() => open(nearest.item), 500)
    }
  })
  intro.addEventListener('pointerleave', cancelSwitch)
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
  window.addEventListener('scroll', schedulePlace, { passive:true })
  window.addEventListener('resize', schedulePlace)
  new ResizeObserver(schedulePlace).observe(notes)
  panels.forEach(panel => new ResizeObserver(schedulePlace).observe(panel))
  const initial = triggers.find(trigger => `#${trigger.getAttribute('aria-controls')}` === location.hash)
  if (initial) open(initial, true)
})()
