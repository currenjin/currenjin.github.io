(function() {
    const TOC_ID = '#markdown-toc';
    const ACTIVE_CLASS = 'active-toc';
    const tocRoot = document.querySelector(TOC_ID);
    const postContent = document.querySelector(".post-content");

    if (!tocRoot || !postContent) {
        return;
    }

    /**
     * toc 엘리먼트 맵 캐시.
     */
    const tocMap = {};
    tocRoot.querySelectorAll('a')
        .forEach(n => {
            const idStr = n.id.replace(/^markdown-toc-/, '')
            tocMap[idStr] = n
        });

    /**
     * 본문의 헤딩 엘리먼트 배열 캐시.
     */
    const headings = postContent.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (!headings || headings.length === 0) {
        return;
    }

    /**
     * 활성화된 모든 toc 엘리먼트를 비활성화한다.
     */
    const deActivate = () => {
        const activated = document.querySelectorAll(`${TOC_ID} .${ACTIVE_CLASS}`)
        for (let i = 0; i < activated.length; i++) {
            activated[i].classList.remove(ACTIVE_CLASS)
        }
    }

    /**
     * 주어진 toc 엘리먼트를 활성화한다.
     */
    const activate = (target) => {
        if (target == null) {
            return;
        }
        target.classList.add(ACTIVE_CLASS)
    }

    /**
     * 현재 읽고 있는 toc 헤딩을 찾아 리턴한다.
     */
    const findCurrentHeading = (headings) => {
        let currentHeading = headings[0];
        for (let i = 0; i < headings.length; i++) {
            const y = headings[i].getBoundingClientRect().top - 35;

            if (y > 0) {
                break;
            }
            if (y <= 0 && y > currentHeading.getBoundingClientRect().top) {
                currentHeading = headings[i];
            }
        }
        return currentHeading;
    }

    let activeHeadingId = null;
    document.addEventListener('scroll', function() {
        const currentHeading = findCurrentHeading(headings);

        if (currentHeading.id == activeHeadingId) {
            return;
        }
        deActivate();
        activate(tocMap[currentHeading.id]);
        activeHeadingId = currentHeading.id;
    });
})();
