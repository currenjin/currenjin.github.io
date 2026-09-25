(function () {
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
        primaryTextColor: token('--ink', '#23190f'),
        primaryBorderColor: token('--ink', '#23190f'),
        lineColor: token('--ink', '#23190f'),
        tertiaryColor: 'transparent',
        clusterBkg: 'transparent',
        clusterBorder: token('--line-strong', '#b9a686'),
        edgeLabelBackground: token('--paper', '#f2ebdf'),
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      },
      flowchart: {
        curve: 'linear',
        useMaxWidth: true
      }
    });

    window.mermaid.run({
      querySelector: '.mermaid'
    });
  }

  function renderMermaid() {
    collect();
    render();
  }

  document.addEventListener('themechange', function () {
    var diagrams = document.querySelectorAll('[data-mermaid-src]');
    if (!diagrams.length) return;
    diagrams.forEach(function (el) {
      el.removeAttribute('data-processed');
      el.textContent = el.dataset.mermaidSrc;
    });
    render();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
})();
