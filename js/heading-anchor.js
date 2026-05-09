(function () {
    const RESET_MS = 1300;

    function init() {
        const root = document.querySelector('article.post-content');
        if (!root) return;
        root.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').forEach(function (h) {
            if (h.querySelector('.heading-anchor')) return;
            const a = document.createElement('a');
            a.className = 'heading-anchor';
            a.href = '#' + h.id;
            a.setAttribute('aria-label', 'Copy link to section');
            a.textContent = '#';
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const url = window.location.origin + window.location.pathname + '#' + h.id;
                const done = function () {
                    history.replaceState(null, '', '#' + h.id);
                    a.classList.add('is-copied');
                    setTimeout(function () { a.classList.remove('is-copied'); }, RESET_MS);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(done, done);
                } else {
                    done();
                }
            });
            h.classList.add('has-anchor');
            h.appendChild(a);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
