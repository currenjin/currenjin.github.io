(function () {
    function init() {
        const imgs = document.querySelectorAll('article.post-content img, .post img, .home-content img');
        imgs.forEach(function (img) {
            if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
            if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
