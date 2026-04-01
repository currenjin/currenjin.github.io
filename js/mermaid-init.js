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
        primaryColor: '#EFF6FF',
        primaryTextColor: '#1e3a5f',
        primaryBorderColor: '#93C5FD',
        secondaryColor: '#F0FDF4',
        secondaryTextColor: '#14532d',
        secondaryBorderColor: '#86EFAC',
        tertiaryColor: '#FFFBEB',
        tertiaryTextColor: '#78350f',
        tertiaryBorderColor: '#FCD34D',
        lineColor: '#6B7280',
        edgeLabelBackground: '#F9FAFB',
        clusterBkg: '#F8FAFC',
        clusterBorder: '#CBD5E1',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        fontSize: '14px'
      },
      flowchart: {
        curve: 'basis',
        padding: 16
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
