/* Review-only progressive enhancement. The Jekyll cards remain the source of truth. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.document.querySelectorAll('[data-review-gallery]').forEach(page => api.mount(page, root));
})(typeof window === 'undefined' ? globalThis : window, () => {
  'use strict';
  const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('ko').trim();

  function createState(records) {
    const active = {kind: 'all', status: 'all', query: ''};
    const state = {visible: records, featured: [], index: 0,
      get current() { return state.featured[state.index]; },
      select(index) {
        const length = state.featured.length;
        state.index = length ? ((index % length) + length) % length : 0;
      },
      move(delta) { state.select(state.index + delta); },
      filter(key, value) { active[key] = value; apply(); }
    };
    function apply() {
      const query = normalize(active.query);
      state.visible = records.filter(record =>
        (active.kind === 'all' || record.kind === active.kind) &&
        (active.status === 'all' || record.status === active.status) &&
        (!query || normalize(`${record.title} ${record.author}`).includes(query)));
      state.featured = state.visible.filter(record => record.image).slice(0, 6);
      state.index = 0;
    }
    apply();
    return state;
  }

  function coverTransform(offset, progress, mobile, reduced) {
    const p = reduced ? 0 : Math.max(0, Math.min(1, progress));
    const spread = (mobile ? 107 : 155) * (1 + p * .9);
    const scale = (offset ? .78 : 1) * (1 - p * .15);
    return {
      transform: `translate(-50%,-50%) translateX(${offset * spread}px) translateY(${(offset ? 12 : 0) + p * 25}px) rotateY(${offset * -18 * (1 - p)}deg) rotateZ(${offset * 8 * (1 - p)}deg) scale(${scale})`,
      opacity: offset ? .57 + p * .15 : 1
    };
  }

  function mount(page, env) {
    const doc = env.document;
    const find = selector => page.querySelector(selector);
    const text = (card, selector) => card.querySelector(selector)?.textContent.trim() || '';
    const cards = [...page.querySelectorAll('[data-filter-item]')];
    const records = cards.map(card => {
      const title = card.querySelector('.review-archive-title');
      const image = card.querySelector('img.review-archive-cover');
      return {card, title: (title?.firstChild?.textContent || title?.textContent || '').trim(),
        author: text(card, '.review-archive-meta'), kind: card.dataset.kind, status: card.dataset.status,
        image: image?.getAttribute('src') || image?.src || '',
        url: card.querySelector('.review-archive-link').href,
        note: text(card, '.review-archive-note'), meta: text(card, '.review-archive-kind'),
        rating: text(card, '.review-archive-rating')};
    });
    const state = createState(records);
    const stage = find('[data-review-stage]'), inner = find('[data-review-stage-inner]');
    const copy = find('[data-review-copy]'), artwork = find('[data-review-artwork]');
    const dots = find('[data-review-selectors]'), prev = find('[data-review-prev]'), next = find('[data-review-next]');
    const count = find('[data-review-count]'), empty = find('[data-empty]');
    const strip = find('[data-review-strip]'), head = doc.querySelector('.site-head');
    const media = env.matchMedia('(prefers-reduced-motion: reduce)');
    let covers = [], selectors = [], scheduled = false, sceneShown = false, animations = [];
    const make = (tag, className, content) => {
      const node = doc.createElement(tag);
      node.className = className;
      if (content) node.textContent = content;
      return node;
    };
    function handleImage(image, parent) {
      const fallback = make('span', 'review-image-fallback', '표지 없음');
      fallback.hidden = true;
      parent.append(fallback);
      const fail = () => { image.hidden = true; fallback.hidden = false; };
      image.addEventListener('error', fail);
      if (image.complete && image.naturalWidth === 0) fail();
    }
    cards.forEach(card => {
      const image = card.querySelector('img.review-archive-cover');
      if (image) handleImage(image, image.parentElement);
    });
    function paint() {
      scheduled = false;
      if (media.matches) { animations.forEach(animation => animation.cancel()); animations = []; }
      const headHeight = head?.getBoundingClientRect().height || 0;
      const stripHeight = strip.getBoundingClientRect().height;
      page.style.setProperty('--review-head-height', `${headHeight}px`);
      page.style.setProperty('--review-filter-height', `${stripHeight}px`);
      const distance = stage.offsetHeight - inner.offsetHeight;
      const progress = distance > 0 ? (headHeight + stripHeight - stage.getBoundingClientRect().top) / distance : 0;
      covers.forEach(cover => {
        const result = coverTransform(Number(cover.dataset.offset), progress, env.innerWidth <= 760, media.matches);
        cover.style.transform = result.transform;
        cover.style.opacity = String(result.opacity);
      });
    }
    function schedule() {
      if (!scheduled) { scheduled = true; env.requestAnimationFrame(paint); }
    }
    function showScene() {
      const record = state.current;
      const transition = sceneShown && !!record;
      sceneShown = !!record;
      animations.forEach(animation => animation.cancel()); animations = [];
      stage.hidden = !record;
      copy.replaceChildren(); artwork.replaceChildren(); covers = [];
      if (!record) return;
      const title = make('h2', 'review-scene-title', record.title);
      const metadata = make('p', 'review-scene-meta', record.author);
      const labels = {book: '책', music: '음악', video: '영상', webtoon: '웹툰', other: '기타'};
      const writing = record.card.dataset.writing === 'true';
      copy.append(make('p', 'review-scene-kicker', `${labels[record.kind] || labels.other} / ${writing ? '감상문' : '기록'}`), title, metadata);
      if (record.note) copy.append(make('p', 'review-scene-note', record.note));
      const link = make('a', 'review-scene-read', writing ? '감상 읽기 ↗' : '기록 보기 ↗');
      link.href = record.url;
      copy.append(link);
      // Do not render the same work twice in a one/two-item selection.
      const offsets = state.featured.length > 2 ? [-1, 1, 0] : state.featured.length === 2 ? [1, 0] : [0];
      offsets.forEach(offset => {
        const item = state.featured[(state.index + offset + state.featured.length) % state.featured.length];
        const cover = make('div', 'review-scene-cover');
        cover.dataset.offset = String(offset);
        cover.setAttribute('aria-hidden', 'true');
        cover.style.zIndex = offset ? '1' : '5';
        const image = make('img', '');
        image.src = item.image; image.alt = '';
        cover.append(image); handleImage(image, cover);
        artwork.append(cover); covers.push(cover);
      });
      selectors.forEach((button, index) => button.setAttribute('aria-pressed', String(index === state.index)));
      prev.disabled = next.disabled = state.featured.length < 2;
      paint();
      if (transition && !media.matches && copy.animate && artwork.animate) {
        animations = [
          copy.animate([{opacity: 0, transform: 'translateY(9px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 420, easing: 'ease-out'}),
          artwork.animate([{opacity: .35, transform: 'translateX(36px)'}, {opacity: 1, transform: 'translateX(0)'}], {duration: 650, easing: 'cubic-bezier(.2,.65,.2,1)'})
        ];
      }
    }
    function render() {
      const visible = new Set(state.visible);
      records.forEach(record => { record.card.hidden = !visible.has(record); });
      count.textContent = `${state.visible.length}/${records.length}`;
      empty.dataset.visible = String(state.visible.length === 0);
      selectors = state.featured.map((record, index) => {
        const button = make('button', 'review-selector');
        button.type = 'button';
        button.setAttribute('aria-label', `${record.title} 보기`);
        button.addEventListener('click', () => { state.select(index); showScene(); });
        return button;
      });
      dots.replaceChildren(...selectors);
      showScene();
    }
    page.querySelectorAll('[data-review-filter-group]').forEach(group => {
      const buttons = [...group.querySelectorAll('[data-review-filter]')];
      buttons.forEach(button => button.addEventListener('click', () => {
        state.filter(group.dataset.reviewFilterGroup, button.dataset.reviewFilter);
        buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        render();
      }));
    });
    const search = find('[data-review-search]');
    search.addEventListener('input', () => { state.filter('query', search.value); render(); });
    prev.addEventListener('click', () => { state.move(-1); showScene(); });
    next.addEventListener('click', () => { state.move(1); showScene(); });
    env.addEventListener('scroll', schedule, {passive: true});
    env.addEventListener('resize', schedule);
    if (media.addEventListener) media.addEventListener('change', paint);
    else if (media.addListener) media.addListener(paint);
    if (env.ResizeObserver) {
      const observer = new env.ResizeObserver(schedule);
      if (head) observer.observe(head);
      observer.observe(strip); observer.observe(inner);
    }
    render();
    page.classList.add('review-gallery-ready');
    return state;
  }
  return {createState, coverTransform, mount};
});
