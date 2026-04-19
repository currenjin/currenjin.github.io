(function () {
    const PALETTE_ID = 'command-palette';
    const MAX_RESULTS = 12;
    const QUICK_ACTIONS = [
        { title: 'Random wiki page', kind: 'action', url: '/wiki/index/#random', hint: 'shuffle' },
        { title: 'Go to Wiki index', kind: 'action', url: '/wiki/index/', hint: 'index' },
        { title: 'Go to Books', kind: 'action', url: '/books/', hint: 'books' },
        { title: 'Go to Recent updates', kind: 'action', url: '/recent/', hint: 'recent' },
        { title: 'Go to Tags', kind: 'action', url: '/tag/', hint: 'tags' },
    ];

    let root, input, listEl, statusEl;
    let entries = [];
    let results = [];
    let activeIdx = 0;
    let loaded = false;
    let loading = false;

    function ensureDom() {
        if (root) return;
        root = document.createElement('div');
        root.id = PALETTE_ID;
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-label', 'Command Palette');
        root.setAttribute('aria-modal', 'true');
        root.hidden = true;
        root.innerHTML = [
            '<div class="cp-backdrop" data-cp-close></div>',
            '<div class="cp-panel" role="document">',
            '  <div class="cp-input-row">',
            '    <span class="cp-glyph" aria-hidden="true">\u2726</span>',
            '    <input class="cp-input" type="text" autocomplete="off" spellcheck="false" placeholder="Search wiki, tags, pages..." aria-label="Search">',
            '    <kbd class="cp-esc">ESC</kbd>',
            '  </div>',
            '  <ul class="cp-list" role="listbox"></ul>',
            '  <div class="cp-foot">',
            '    <span class="cp-status"></span>',
            '    <span class="cp-hints"><kbd>\u2191\u2193</kbd> navigate  <kbd>\u21b5</kbd> open  <kbd>\u2318K</kbd> close</span>',
            '  </div>',
            '</div>',
        ].join('');
        document.body.appendChild(root);
        input = root.querySelector('.cp-input');
        listEl = root.querySelector('.cp-list');
        statusEl = root.querySelector('.cp-status');

        input.addEventListener('input', render);
        input.addEventListener('keydown', onKeydown);
        root.addEventListener('click', function (e) {
            if (e.target.closest('[data-cp-close]')) close();
            const li = e.target.closest('li[data-idx]');
            if (li) {
                activeIdx = Number(li.dataset.idx);
                openActive();
            }
        });
    }

    function loadIndex() {
        if (loaded || loading) return;
        loading = true;
        statusEl.textContent = 'Loading...';
        fetch('/search-index.json', { cache: 'force-cache' })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                entries = Array.isArray(data) ? data : [];
                loaded = true;
                loading = false;
                render();
            })
            .catch(function () {
                loading = false;
                statusEl.textContent = 'Failed to load index.';
            });
    }

    function open() {
        ensureDom();
        root.hidden = false;
        document.documentElement.classList.add('cp-open');
        loadIndex();
        setTimeout(function () { input.focus(); input.select(); }, 0);
        render();
    }

    function close() {
        if (!root) return;
        root.hidden = true;
        document.documentElement.classList.remove('cp-open');
    }

    function tagString(entry) {
        if (Array.isArray(entry.tags)) return entry.tags.join(', ');
        return entry.tags || '';
    }

    function score(entry, q) {
        if (!q) return 1;
        const title = (entry.title || '').toLowerCase();
        const tags = tagString(entry).toLowerCase();
        if (title === q) return 1000;
        if (title.startsWith(q)) return 500;
        if (title.includes(q)) return 300;
        if (tags.includes(q)) return 120;
        return fuzzy(title, q) ? 60 : 0;
    }

    function fuzzy(text, q) {
        let i = 0;
        for (let j = 0; j < text.length && i < q.length; j++) {
            if (text[j] === q[i]) i++;
        }
        return i === q.length;
    }

    function computeResults() {
        const q = input.value.trim().toLowerCase();
        const actionMatches = QUICK_ACTIONS
            .map(function (a) { return { item: a, s: score(a, q) }; })
            .filter(function (x) { return x.s > 0; })
            .sort(function (a, b) { return b.s - a.s; })
            .map(function (x) { return x.item; });

        if (!q) {
            const recent = entries
                .filter(function (e) { return e.type === 'wiki'; })
                .slice()
                .sort(function (a, b) { return (b.updated || '').localeCompare(a.updated || ''); })
                .slice(0, 8);
            return actionMatches.concat(recent);
        }

        const entryMatches = entries
            .map(function (e) { return { item: e, s: score(e, q) }; })
            .filter(function (x) { return x.s > 0; })
            .sort(function (a, b) { return b.s - a.s; })
            .slice(0, MAX_RESULTS)
            .map(function (x) { return x.item; });

        return actionMatches.concat(entryMatches);
    }

    function render() {
        if (!listEl) return;
        results = computeResults();
        activeIdx = Math.min(activeIdx, Math.max(0, results.length - 1));
        if (results.length === 0) {
            listEl.innerHTML = '<li class="cp-empty">No matches</li>';
            statusEl.textContent = loaded ? '0 results' : statusEl.textContent;
            return;
        }
        const q = input.value.trim().toLowerCase();
        listEl.innerHTML = results.map(function (r, i) {
            const active = i === activeIdx ? ' is-active' : '';
            const kindTag = r.kind === 'action'
                ? '<span class="cp-kind cp-kind--action">action</span>'
                : '<span class="cp-kind cp-kind--' + r.type + '">' + r.type + '</span>';
            const tagText = tagString(r);
            const meta = r.type === 'wiki' && tagText ? '<span class="cp-meta">' + escapeHtml(tagText) + '</span>' : '';
            return '<li class="cp-item' + active + '" data-idx="' + i + '" role="option">'
                + kindTag
                + '<span class="cp-title">' + highlight(r.title, q) + '</span>'
                + meta
                + '</li>';
        }).join('');
        statusEl.textContent = loaded ? results.length + ' results' : statusEl.textContent;
        scrollActive();
    }

    function scrollActive() {
        const el = listEl.querySelector('.is-active');
        if (el) el.scrollIntoView({ block: 'nearest' });
    }

    function onKeydown(e) {
        if (e.key === 'Escape') { close(); e.preventDefault(); return; }
        if (e.key === 'ArrowDown') {
            activeIdx = Math.min(activeIdx + 1, results.length - 1);
            render(); e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            activeIdx = Math.max(activeIdx - 1, 0);
            render(); e.preventDefault();
        } else if (e.key === 'Enter') {
            openActive(); e.preventDefault();
        }
    }

    function openActive() {
        const r = results[activeIdx];
        if (!r) return;
        close();
        if (r.url.startsWith('http')) {
            window.open(r.url, '_blank', 'noopener');
        } else {
            window.location.href = r.url;
        }
    }

    function highlight(text, q) {
        const safe = escapeHtml(text || '');
        if (!q) return safe;
        const idx = safe.toLowerCase().indexOf(q);
        if (idx < 0) return safe;
        return safe.slice(0, idx) + '<mark>' + safe.slice(idx, idx + q.length) + '</mark>' + safe.slice(idx + q.length);
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function isTypingInField(e) {
        const t = e.target;
        if (!t) return false;
        const tag = (t.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || t.isContentEditable;
    }

    document.addEventListener('keydown', function (e) {
        const key = e.key ? e.key.toLowerCase() : '';
        if ((e.metaKey || e.ctrlKey) && key === 'k') {
            e.preventDefault();
            if (root && !root.hidden) close(); else open();
        } else if (key === '/' && !isTypingInField(e) && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            open();
        }
    });
})();
