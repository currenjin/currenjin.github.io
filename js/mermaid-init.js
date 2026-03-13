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
        edgeLabelBackground: 'transparent',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      },
      flowchart: {
        curve: 'linear'
      }
    });

    window.mermaid.run({
      querySelector: '.mermaid'
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid);
  } else {
    renderMermaid();
  }
})();
