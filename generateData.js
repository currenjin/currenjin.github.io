#!/usr/bin/env node

const YAML = require('yamljs');
const fs = require('fs');
const list = [];
const tagMap = {};
const pageMap = {};

getFiles('./_wiki', 'wiki', list);
getFiles('./_posts', 'blog', list);

const dataList = list.map(file => collectData(file))
    .filter((row) => row != null)
    .filter((row) => row.public !== false && row.public !== 'false')
    .sort(lexicalOrderingBy('fileName'))


dataList.forEach(function collectTagMap(data) {
    const tags = data.tags;
    if (!tags) {
        return;
    }

    tags.forEach(tag => {
        if (!tagMap[tag]) {
            tagMap[tag] = [];
        }
        tagMap[tag].push({
            fileName: data.fileName,
            // updated: data.updated || data.date,
        });
    });
});

for (const tag in tagMap) {
    tagMap[tag].sort(lexicalOrderingBy('fileName'));
}

dataList.sort(lexicalOrderingBy('fileName'))
    .forEach((page) => {
        pageMap[page.fileName] =
            {
                type: page.type,
                title: page.title,
                summary: page.summary,
                parent: page.parent,
                url: page.url,
                updated: page.updated || page.date,
                tags: page.tags || [],
                children: [],
            };
    });

dataList.forEach(page => {
    if (page.parent && page.parent != 'index') {

        const parent = pageMap[page.parent];

        if (parent && parent.children) {
            parent.children.push(page.fileName);
        }
    }
});

saveTagFiles(tagMap, pageMap);
saveTagCount(tagMap);
saveMetaDataFiles(pageMap);

function lexicalOrderingBy(property) {
    return (a, b) => a[property].toLowerCase()
        .localeCompare(b[property].toLowerCase())
}

/**
 * tag 하나의 정보 파일을 만든다.
 * 각 태그 하나는 하나의 json 파일을 갖게 된다.
 * 예를 들어 math 라는 태그가 있다면 ./data/tag/math.json 파일이 만들어진다.
 * json 파일의 내용은 fileName과 collection으로 구성된다.
 * 다음은 GNU.json 파일의 예이다.
 *
{
  "fileName": "agile",
  "collection": {
    "agile": {
      "type": "wiki",
      "title": "애자일(agile)에 대한 토막글 모음",
      "summary": "",
      "parent": "software-engineering",
      "url": "/wiki/agile",
      "updated": "2020-01-20 21:57:44 +0900",
      "children": []
    },
    "Tompson-s-rule-for-first-time-telescope-makers": {
      "type": "wiki",
      "title": "망원경 규칙 (Telescope Rule)",
      "summary": "4인치 반사경을 만든 다음에 6인치 반사경을 만드는 것이, 6인치 반사경 하나 만드는 것보다 더 빠르다",
      "parent": "proverb",
      "url": "/wiki/Tompson-s-rule-for-first-time-telescope-makers",
      "updated": "2019-11-24 09:36:53 +0900",
      "children": []
    }
  }
}
*/

function saveTagFiles(tagMap, pageMap) {
    fs.mkdirSync('./data/tag', { recursive: true }, (err) => {
        if (err) {
            return console.log(err);
        }
    })

    const completedTags = {};

    for (const tag in tagMap) {
        if (completedTags[tag.toLowerCase()]) {
            console.log("중복 태그가 있습니다.", tag);
            break;
        }
        completedTags[tag.toLowerCase()] = true;

        const collection = [];
        const tagDatas = tagMap[tag];

        for (const index in tagDatas) {
            const tagData = tagDatas[index];
            const data = pageMap[tagData.fileName];

            if (!data) {
                continue;
            }

            const documentId = (data.type === 'wiki')
                ? tagData.fileName
                : data.url;
            const updated = data.updated || '';

            collection.push({
                id: documentId,
                type: data.type,
                title: data.title || '',
                url: data.url || '',
                updated,
                updatedDate: toDate(updated),
                summary: data.summary || '',
                childrenCount: Array.isArray(data.children) ? data.children.length : 0,
            });
        }

        collection.sort(compareByUpdatedDescThenTitleAsc);

        fs.writeFile(`./data/tag/${tag}.json`, JSON.stringify(collection), err => {
            if (err) {
                return console.log(err);
            }
        });
    }
}

/**
 * 파일 하나의 정보 파일을 만든다.
 * 각 파일 하나는 자신만의 정보를 갖는 json 파일을 갖게 된다.
 * 예를 들어 math.md 라는 파일이 있다면 ./data/metadata/math.json 파일이 만들어진다.
 * json 파일의 내용은 자신의 metadata와 자식 문서들의 목록이 된다.
 */
function saveMetaDataFiles(pageMap) {
    for (const page in pageMap) {
        const data = pageMap[page];
        const fileName = data.url.replace(/^[/]wiki[/]/, '');
        const dirName = `./data/metadata/${fileName}`
            .replace(/(\/\/)/g, '/')
            .replace(/[/][^/]*$/, '');

        fs.mkdirSync(dirName, { recursive: true }, (err) => {
            if (err) {
                return console.log(err);
            }
        })

        fs.writeFile(`./data/metadata/${fileName}.json`, JSON.stringify(data), err => {
            if (err) {
                return console.log(err);
            }
        })
    }
}

/**
 * 태그 하나가 갖는 자식 문서의 수를 파일로 저장한다.
 */
function saveTagCount(tagMap) {
    const list = [];
    for (const tag in tagMap) {
        list.push({
            name: tag,
            size: tagMap[tag].length
        });
    }
    const sortedList = list.sort((lexicalOrderingBy('name')));

    fs.writeFile("./data/tag_count.json", JSON.stringify(sortedList, null, 1), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("tag_count.json saved.");
    });
}

function parseInfo(file, metadata) {
    if (metadata == null) {
        return undefined;
    }

    const obj = {
        fileName: getFileName(file),
        type: file.type,
        url: '',
        modified: fs.statSync(file.path).mtime
    };

    const sanitizedMetadata = sanitizeMetadata(metadata);
    Object.assign(obj, sanitizedMetadata);

    if (file.type === 'blog') {
        const datePath = toBlogDatePath(obj.date);
        const slug = toBlogSlug(file.name);
        obj.url = `/blog/${datePath}/${slug}`;

    } else if (file.type === 'wiki') {
        obj.url = file.path
            .replace(/^\.\/_wiki/, '/wiki')
            .replace(/\.md$/, '');
    }

    const normalizedTags = normalizeTags(obj.tags);
    if (normalizedTags.length > 0) {
        obj.tags = normalizedTags;
    }
    return obj;
}

function normalizeTags(value) {
    if (value == null) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(Boolean);
    }

    return String(value)
        .split(/[,\s]+/)
        .map(v => v.trim())
        .filter(Boolean);
}

function getFileName(file) {
    if (file.type === 'wiki') {
        return file.path.replace(/^\.\/_wiki\/(.+)?\.md$/, '$1');
    }
    if (file.type === 'blog') {
        return file.path
            .replace(/^\.\/_posts\//, '')
            .replace(/\.md$/, '');
    }
    return file.path.replace(/^\.\//, '').replace(/\.md$/, '');
}

function toBlogDatePath(dateText) {
    const found = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateText || '');
    if (!Array.isArray(found)) {
        return '1970/01/01';
    }
    return `${found[1]}/${found[2]}/${found[3]}`;
}

function toBlogSlug(fileName) {
    return (fileName || '')
        .replace(/\.md$/, '')
        .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function toDate(value) {
    const found = /^(\d{4}-\d{2}-\d{2})/.exec(value || '');
    return Array.isArray(found) ? found[1] : '';
}

function compareByUpdatedDescThenTitleAsc(a, b) {
    const aTime = Date.parse(a.updated || '') || 0;
    const bTime = Date.parse(b.updated || '') || 0;
    if (aTime !== bTime) {
        return bTime - aTime;
    }
    return (a.title || '').localeCompare((b.title || ''));
}

function isDirectory(path) {
    return fs.lstatSync(path).isDirectory();
}

function isMarkdown(fileName) {
    return /\.md$/.test(fileName);
}

function getFiles(path, type, array, testFileList = null) {

    fs.readdirSync(path).forEach(fileName => {

        const subPath = `${path}/${fileName}`;

        if (isDirectory(subPath)) {
            return getFiles(subPath, type, array, testFileList);
        }
        if (isMarkdown(fileName)) {
            if(testFileList && !testFileList.includes(fileName)) {
                return;
            }

            const obj = {
                'path': `${path}/${fileName}`,
                'type': type,
                'name': fileName,
                'children': [],
            };
            return array.push(obj);
        }
    });
}

function collectData(file) {
    const data = fs.readFileSync(file.path, 'utf8');
    return parseInfo(file, parseFrontMatter(data));
}

function parseFrontMatter(rawData) {
    const frontMatterMatch = /^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/.exec(rawData);
    if (!Array.isArray(frontMatterMatch)) {
        return null;
    }
    const frontMatter = frontMatterMatch[1];

    try {
        return YAML.parse(frontMatter);
    } catch (err) {
        return parseLegacyFrontMatter(frontMatter);
    }
}

function parseLegacyFrontMatter(frontMatter) {
    const metadata = {};
    const rawData = frontMatter.split('\n');
    rawData.forEach(str => {
        const result = /^\s*([^:]+):\s*(.+)\s*$/.exec(str);
        if (result == null) {
            return;
        }
        const key = result[1].trim();
        const val = result[2].trim();
        metadata[key] = val;
    });
    return metadata;
}

function sanitizeMetadata(metadata) {
    const sanitized = {};
    for (const key in metadata) {
        sanitized[key] = sanitizeMetadataValue(metadata[key]);
    }
    return sanitized;
}

function sanitizeMetadataValue(value) {
    if (value == null) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeMetadataValue);
    }
    if (typeof value === 'object') {
        const copied = {};
        for (const k in value) {
            copied[k] = sanitizeMetadataValue(value[k]);
        }
        return copied;
    }
    if (typeof value === 'string') {
        return value.replace(/\[{2}\/?|\]{2}/g, '');
    }
    return value;
}
