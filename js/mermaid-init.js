(function () {
  function renderMermaid() {
    if (!window.mermaid) return;

    // Convert markdown fenced mermaid blocks (<pre><code class="language-mermaid">)
    // into Mermaid containers (<div class="mermaid">)
    var blocks = document.querySelectorAll('pre > code.language-mermaid, pre > code.mermaid');
    blocks.forEach(function (code) {
      var pre = code.parentElement;
      var container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = code.textContent;
      pre.parentNode.replaceChild(container, pre);
    });

    window.mermaid.initialize({
      startOnLoad: false,
      look: 'handDrawn',
      securityLevel: 'loose',
      theme: 'base',
      themeVariables: {
        primaryColor: 'transparent',
        primaryTextColor: '#111827',
        primaryBorderColor: '#111827',
        lineColor: '#111827',
        tertiaryColor: 'transparent',
        clusterBkg: 'transparent',
        clusterBorder: '#111827',
        edgeLabelBackground: '#ffffff',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      },
      flowchart: {
        curve: 'linear',
        useMaxWidth: true
      }
    });

    // v11이 SVG 및 내부 요소에 tabindex="0"을 자동 추가 → Chrome 트랙패드 스크롤 버그 유발
    // 렌더 완료 후 mermaid 컨테이너 내 모든 tabindex 제거
    window.mermaid.run({
      querySelector: '.mermaid'
    }).then(function () {
      document.querySelectorAll('.mermaid [tabindex]').forEach(function (el) {
        el.removeAttribute('tabindex');
      });
      document.querySelectorAll('.mermaid svg').forEach(function (svg) {
        svg.setAttribute('focusable', 'false');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
})();
