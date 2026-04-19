(function () {
    const SHOW_THRESHOLD_PX = 240;
    let bar, fill, ticking = false;

    function ensureBar() {
        if (bar) return;
        bar = document.createElement('div');
        bar.id = 'reading-progress';
        bar.setAttribute('aria-hidden', 'true');
        fill = document.createElement('div');
        fill.className = 'reading-progress-fill';
        bar.appendChild(fill);
        document.body.appendChild(bar);
    }

    function update() {
        ticking = false;
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const scrollable = Math.max(0, doc.scrollHeight - window.innerHeight);
        if (scrollable < SHOW_THRESHOLD_PX) {
            bar.classList.remove('is-visible');
            fill.style.setProperty('--progress', 0);
            return;
        }
        const ratio = Math.max(0, Math.min(1, scrollTop / scrollable));
        fill.style.setProperty('--progress', ratio);
        bar.classList.add('is-visible');
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }

    function init() {
        ensureBar();
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
