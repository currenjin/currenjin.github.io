(function() {
    window.random = function() {
        var list = document.querySelectorAll('.wiki-list a');
        if (!list || list.length === 0) {
            return;
        }
        var randomIndex = Math.floor((Math.random() * list.length));
        var url = list[randomIndex].href;
        window.location.href = url;
    };

    function init() {
        if (/#random$/.test(window.location.href)) {
            return window.random();
        }
        var postMain = document.querySelector('div.post-main');
        if (postMain) {
            postMain.classList.remove('hide');
        }
    }

    if (document.readyState === 'complete' || document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
