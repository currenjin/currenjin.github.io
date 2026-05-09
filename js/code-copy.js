(function () {
    const COPY_LABEL = 'copy';
    const COPIED_LABEL = '✓ copied';
    const RESET_MS = 1400;

    function attach(pre) {
        if (pre.querySelector('.code-copy-btn')) return;
        const code = pre.querySelector('code');
        if (!code) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy-btn';
        btn.setAttribute('aria-label', 'Copy code');
        btn.innerHTML = '<span class="code-copy-default">' + COPY_LABEL + '</span>'
            + '<span class="code-copy-success">' + COPIED_LABEL + '</span>';
        btn.addEventListener('click', function () {
            const text = code.textContent || '';
            const done = function () {
                btn.classList.add('is-copied');
                setTimeout(function () { btn.classList.remove('is-copied'); }, RESET_MS);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, fallback);
            } else {
                fallback();
            }
            function fallback() {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } finally { ta.remove(); }
            }
        });
        pre.classList.add('has-copy-btn');
        pre.appendChild(btn);
    }

    function init() {
        const blocks = document.querySelectorAll('pre.highlight, .highlighter-rouge pre, article.post-content pre');
        blocks.forEach(function (pre) {
            if (pre.classList.contains('mermaid')) return;
            if (pre.closest('.mermaid')) return;
            attach(pre);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
