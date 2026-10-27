/* Progressive enhancement for authored body images only.
 * Keep image bytes, attributes and existing authored links unchanged.
 */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  } else api.mount(document);
})(function () {
  'use strict';

  function originalURL(img, doc) {
    try {
      const url = new URL(img.currentSrc || img.src, doc.baseURI);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function enhance(img, doc) {
    if (!img.parentElement || img.closest('a, button, summary')) return;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) return;
    const href = originalURL(img, doc);
    if (!href) return;

    const picture = img.closest('picture');
    const image = picture || img;
    const parent = image.parentElement;
    if (!parent) return;
    const description = (img.getAttribute('alt') || '').trim();
    const label = (description ? description + ' — ' : '') + '그림 원본 크기로 열기 (새 탭)';

    const wrapper = doc.createElement('a');
    wrapper.className = 'diagram-image';
    wrapper.href = href;
    wrapper.target = '_blank';
    wrapper.rel = 'noopener noreferrer';
    wrapper.setAttribute('aria-label', label);
    parent.replaceChild(wrapper, image);
    wrapper.appendChild(image);

    const action = doc.createElement('a');
    action.className = 'diagram-open';
    action.href = href;
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
    action.setAttribute('aria-label', label);
    action.textContent = '원본 크기로 보기 ↗';
    parent.insertBefore(action, wrapper.nextSibling);
  }

  function mount(doc) {
    for (const img of doc.querySelectorAll('.prose img')) {
      if (img.complete) enhance(img, doc);
      else img.addEventListener('load', function () { enhance(img, doc); }, { once: true });
    }
  }

  return { mount: mount };
});
