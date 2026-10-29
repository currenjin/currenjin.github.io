(function () {
  if (window.__wikiMermaidInitialized) return;
  window.__wikiMermaidInitialized = true;
  var pending = false;
  var running = false;

  function loadMermaid() {
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (!window.__wikiMermaidLoader) {
      window.__wikiMermaidLoader = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.async = true;
        script.onload = function () {
          if (window.mermaid) resolve(window.mermaid);
          else reject(new Error('Mermaid did not initialize'));
        };
        script.onerror = function () { reject(new Error('Mermaid could not load')); };
        document.head.appendChild(script);
      });
    }
    return window.__wikiMermaidLoader;
  }

  function restore(readable) {
    document.querySelectorAll('[data-mermaid-src]').forEach(function (el) {
      el.removeAttribute('data-processed');
      el.textContent = el.dataset.mermaidSrc;
      el.style.whiteSpace = readable ? 'pre-wrap' : (el.dataset.mermaidWhiteSpace || '');
    });
  }
  // Mermaid는 테마 색을 초기화 시점에 굳히므로, css/main.css 토큰을 읽어 넘기고
  // 테마가 바뀌면 원본 소스로 되돌린 뒤 다시 렌더한다.
  function token(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function collect() {
    // 마크다운 코드펜스(<pre><code class="language-mermaid">)를 mermaid 컨테이너로 바꾼다.
    var blocks = document.querySelectorAll('pre > code.language-mermaid, pre > code.mermaid');
    blocks.forEach(function (code) {
      var pre = code.parentElement;
      var container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = code.textContent;
      container.dataset.mermaidSrc = code.textContent;
      pre.parentNode.replaceChild(container, pre);
    });
    // 수기로 작성된 .mermaid 블록도 다시 렌더할 수 있도록 원본을 기억해 둔다.
    document.querySelectorAll('.mermaid').forEach(function (el) {
      if (!el.dataset.mermaidSrc) el.dataset.mermaidSrc = el.textContent;
      if (el.dataset.mermaidWhiteSpace === undefined) el.dataset.mermaidWhiteSpace = el.style.whiteSpace || '';
    });
  }

  function render() {
    if (!window.mermaid) return;

    window.mermaid.initialize({
      startOnLoad: false,

      securityLevel: 'loose',
      theme: 'base',
      themeVariables: {
        primaryColor: 'transparent',
        primaryTextColor: token('--ink', '#292723'),
        primaryBorderColor: token('--ink', '#292723'),
        lineColor: token('--ink', '#292723'),
        tertiaryColor: 'transparent',
        clusterBkg: 'transparent',
        clusterBorder: token('--line-strong', '#c4baab'),
        edgeLabelBackground: token('--paper', '#faf8f3'),
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      },
      flowchart: {
        curve: 'linear',
        useMaxWidth: true
      }
    });

    return window.mermaid.run({
      querySelector: '.mermaid'
    });
  }

  async function renderMermaid() {
    pending = true;
    if (running) return;
    running = true;
    try {
      collect();
      if (!document.querySelectorAll('.mermaid').length) return;
      await loadMermaid();
      while (pending) {
        pending = false;
        restore();
        await render();
      }
    } catch (error) {
      // CDN or parsing failures must leave the authored source readable.
      pending = false;
      restore(true);
    } finally {
      running = false;
    }
  }

  document.addEventListener('themechange', renderMermaid);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
})();
