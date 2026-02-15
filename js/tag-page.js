(function() {
    function showInitTag() {
        var url = window.location.href;
        var req = /#([^\s]+)$/.exec(url);
        if (Array.isArray(req)) {
            var tagName = decodeURI(req.pop());
            showTag(tagName);
        }
    }

    function renderTagList(tags) {
        var template = '';
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            template += '' +
                '<li class="tag-item">' +
                '<a href="#' + tag.name + '" data-tag-name="' + tag.name + '">' +
                tag.name + '<sup>' + tag.size + '</sup>' +
                '</a>' +
                '</li>';
        }

        var tagList = document.getElementById('tag-list');
        tagList.innerHTML = template;
        tagList.addEventListener('click', function(e) {
            var link = e.target.closest('a[data-tag-name]');
            if (!link) {
                return;
            }
            e.preventDefault();
            var tagName = link.getAttribute('data-tag-name');
            window.location.hash = tagName;
            showTag(tagName);
        });
    }

    function showTag(tagName) {
        axios.get('/data/tag/' + tagName + '.json', {})
            .then(function(resp) {
                createLinks(resp, tagName);
            });
    }

    function createLinks(resp, tagName) {
        if (resp == null || resp.data == null) {
            return;
        }

        var documents = Array.isArray(resp.data) ? resp.data : [];
        var tagCollection = document.getElementById('tag-collection');
        if (documents.length === 0) {
            tagCollection.innerHTML = '<h3>' + tagName + '</h3><p>문서가 없습니다.</p>';
            return;
        }

        var listItems = documents.map(function(d) {
            var href = (typeof d.url === 'string' && d.url.length > 0) ? d.url : '#';
            var title = d.title || '(제목 없음)';
            var updated = d.updated || '';
            var updatedDate = d.updatedDate || '';
            var summaryText = (d.summary == null || /^\s*$/.test(d.summary))
                ? ''
                : '-' + d.summary;
            var childrenCount = Number(d.childrenCount || 0);
            var subDocument = childrenCount > 0
                ? '- 서브 문서: ' + childrenCount + ' 개'
                : '';

            return '' +
                '<li>' +
                    '<a class="post-link" href="' + href + '">' +
                        '<span>' + title + '</span>' +
                        '<div class="post-meta float-right" title="' + updated + '">' + updatedDate + '</div>' +
                        '<div class="post-excerpt">' + summaryText + '</div>' +
                        '<div class="post-sub-document">' + subDocument + '</div>' +
                    '</a>' +
                '</li>';
        }).join('');

        tagCollection.innerHTML = '<h3>' + tagName + '</h3><ul class="post-list">' + listItems + '</ul>';
    }

    axios.get('/data/tag_count.json', {})
        .then(function(resp) {
            if (resp == null || resp.data == null) {
                return;
            }
            renderTagList(resp.data);
            showInitTag();
        });
})();
