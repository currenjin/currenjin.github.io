(function () {
  // ── 설정 (매직 넘버 모음) ───────────────────────────
  const CFG = {
    nodeRadiusBase: 2.4,
    edgeWeightDefault: 2,
    edgeWidthCap: 2,
    edgeHoverWidthCap: 3.5,
    labelMaxLen: 20,
    fontStack: "Pretendard, 'Segoe UI', sans-serif",
    forceCharge: -500,
    forceLinkDist: 140,
    forceLinkStrength: 0.25,
    minZoom: 0.05,
    maxZoom: 12,
    velocityDecay: 0.4,
    alphaMin: 0.001,
    coolFull: 300,
    coolLocal: 120,
    alphaDecayFull: 0.03,
    alphaDecayLocal: 0.045,
    focusSettleMs: 800,
    zoomFitPadding: 60,
    focusFullZoom: 2,
  };

  const COLOR = {
    wiki:     "#91d478",
    book:     "#60a5fa",
    wikiFade: "rgba(145,212,120,0.1)",
    bookFade: "rgba(96,165,250,0.1)",
    edge: {
      "wiki-wiki": "rgba(145,212,120,0.38)",
      "wiki-book": "rgba(147,197,253,0.42)",
      "book-book": "rgba(96,165,250,0.28)",
    },
    edgeFade: "rgba(100,116,139,0.04)",
    labelHot:  "#ffffff",
    labelWiki: "#d1fac0",
    labelBook: "#bfdbfe",
    tagHot:    "rgba(203,213,225,0.85)",
    tagWiki:   "rgba(145,212,120,0.5)",
    tagBook:   "rgba(96,165,250,0.5)",
    focusRing: "rgba(145,212,120,0.55)",
    hoverRing: "rgba(255,255,255,0.22)",
  };

  // ── URL 파라미터 ─────────────────────────────────────
  const params = new URLSearchParams(location.search);
  const isEmbed = params.get("embed") === "1";
  const focusUrl = params.get("focus");
  let isLocal = false; // 데이터 로드 후 결정

  // ── 상태 ────────────────────────────────────────────
  const filters = { "wiki-wiki": true, "wiki-book": false, "book-book": true };
  let minWeight  = CFG.edgeWeightDefault;
  let showLabels = false;
  let showTags   = false;
  let hoveredNode = null;
  let neighborSet = new Set();
  let focusedNode = null;
  let focusedNeighborSet = new Set();
  let activeTagFilter = null;
  let tagMatchSet = new Set();
  let allLinks = [];
  let G;

  // ── 헬퍼 ────────────────────────────────────────────
  // d3 시뮬레이션이 source/target을 객체로 바꿔둘 수도 있어 안전하게 id 추출
  const linkEnds = l => [l.source?.id ?? l.source, l.target?.id ?? l.target];

  const linkTouches = (l, id) => {
    const [s, t] = linkEnds(l);
    return s === id || t === id;
  };

  function normalizeTags(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
    return String(raw).split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
  }

  function sharedTags(a, b) {
    return a._tags.filter(t => b._tags.includes(t));
  }

  // ── 엣지 빌드 ────────────────────────────────────────
  function buildLinks(nodes) {
    const wikis = nodes.filter(n => n.type === "wiki");
    const books = nodes.filter(n => n.type === "book");
    const links = [];

    const pushIfShared = (a, b, kind) => {
      const s = sharedTags(a, b);
      if (s.length) links.push({ source: a.id, target: b.id, kind, weight: s.length, shared: s });
    };

    for (let i = 0; i < wikis.length; i++)
      for (let j = i + 1; j < wikis.length; j++)
        pushIfShared(wikis[i], wikis[j], "wiki-wiki");

    for (const w of wikis)
      for (const b of books)
        pushIfShared(w, b, "wiki-book");

    for (let i = 0; i < books.length; i++)
      for (let j = i + 1; j < books.length; j++)
        pushIfShared(books[i], books[j], "book-book");

    return links;
  }

  function activeLinks() {
    return allLinks.filter(l => filters[l.kind] && l.weight >= minWeight);
  }

  // ── 이웃 계산 ────────────────────────────────────────
  function computeNeighborsFrom(links, node) {
    const set = new Set();
    if (!node) return set;
    links.forEach(l => {
      const [s, t] = linkEnds(l);
      if (s === node.id) set.add(t);
      if (t === node.id) set.add(s);
    });
    return set;
  }
  const computeNeighbors        = node => { neighborSet        = computeNeighborsFrom(G.graphData().links, node); };
  const computeFocusedNeighbors = ()   => { focusedNeighborSet = computeNeighborsFrom(activeLinks(),       focusedNode); };

  function applyTagFilter(tag) {
    activeTagFilter = tag;
    tagMatchSet = new Set();
    if (!tag) return;
    G.graphData().nodes.forEach(n => {
      if (n._tags.includes(tag)) tagMatchSet.add(n.id);
    });
  }

  // ── 노드 렌더링 ──────────────────────────────────────
  function nodeFillColor(node, { dim, isHot }) {
    if (dim)   return node.type === "wiki" ? COLOR.wikiFade : COLOR.bookFade;
    if (isHot) return COLOR.labelHot;
    return node.type === "wiki" ? COLOR.wiki : COLOR.book;
  }

  function drawNode(node, ctx, gs) {
    const r = (node._val || 1) * CFG.nodeRadiusBase;
    const isH = hoveredNode?.id === node.id;
    const isF = focusedNode?.id === node.id;
    const isHot = isH || isF;
    const isN  = !isHot && hoveredNode && neighborSet.has(node.id);
    const isFN = !isHot && !isN && focusedNode && focusedNeighborSet.has(node.id);
    const tagMiss = activeTagFilter && !tagMatchSet.has(node.id);
    const anyHot = hoveredNode || focusedNode;
    const dim = tagMiss || (!tagMiss && anyHot && !isHot && !isN && !isFN);

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = nodeFillColor(node, { dim, isHot });
    ctx.fill();

    if (isHot) {
      const focusOnly = isF && !isH;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + (focusOnly ? 5 : 3), 0, Math.PI * 2);
      ctx.strokeStyle = focusOnly ? COLOR.focusRing : COLOR.hoverRing;
      ctx.lineWidth = focusOnly ? 2 : 1.5;
      ctx.stroke();
    }

    if (!((showLabels || isHot || isN || isFN || gs > 2.0) && !dim)) return;

    const fs = Math.max(7.5, 11 / gs);
    ctx.font = `600 ${fs}px ${CFG.fontStack}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isHot ? COLOR.labelHot : (node.type === "wiki" ? COLOR.labelWiki : COLOR.labelBook);
    const label = node.title.length > CFG.labelMaxLen
      ? node.title.slice(0, CFG.labelMaxLen - 1) + "…"
      : node.title;
    ctx.fillText(label, node.x, node.y + r + fs * 0.9);

    if (!((showTags || isHot) && node._tags.length)) return;
    const tfs = Math.max(6, 9 / gs);
    ctx.font = `${tfs}px ${CFG.fontStack}`;
    ctx.fillStyle = isHot ? COLOR.tagHot : (node.type === "wiki" ? COLOR.tagWiki : COLOR.tagBook);
    ctx.fillText(node._tags.map(t => "#" + t).join(" "), node.x, node.y + r + fs * 0.9 + tfs * 1.4);
  }

  // ── 패널/통계 ────────────────────────────────────────
  function updateStats() {
    const active = activeLinks();
    const counts = { "wiki-wiki": 0, "wiki-book": 0, "book-book": 0 };
    active.forEach(l => { counts[l.kind]++; });
    document.getElementById("stats").innerHTML =
      `Wiki↔Wiki: ${counts["wiki-wiki"]}<br>` +
      `Wiki↔Book: ${counts["wiki-book"]}<br>` +
      `Book↔Book: ${counts["book-book"]}`;
  }

  function buildTagPanel(nodes) {
    const freq = {};
    nodes.forEach(n => n._tags.forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    const list = document.getElementById("tag-list");
    list.innerHTML = "";
    Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      const cnt = document.createElement("span");
      cnt.style.opacity = "0.45";
      cnt.textContent = count;
      chip.appendChild(document.createTextNode("#" + tag + " "));
      chip.appendChild(cnt);
      chip.addEventListener("click", () => {
        const isActive = activeTagFilter === tag;
        document.querySelectorAll(".tag-chip").forEach(c => c.classList.remove("on"));
        applyTagFilter(isActive ? null : tag);
        if (!isActive) chip.classList.add("on");
      });
      list.appendChild(chip);
    });
  }

  // ── 토글 (DRY) ───────────────────────────────────────
  function rebuildAfterFilter() {
    const { nodes } = G.graphData();
    G.graphData({ nodes, links: activeLinks() });
    hoveredNode = null;
    neighborSet = new Set();
    computeFocusedNeighbors();
    G.d3ReheatSimulation();
    updateStats();
  }

  window.toggleKind = function (kind, btn) {
    filters[kind] = !filters[kind];
    btn.classList.toggle("on", filters[kind]);
    rebuildAfterFilter();
  };

  window.toggleMinWeight = function (btn) {
    minWeight = minWeight === CFG.edgeWeightDefault ? 1 : CFG.edgeWeightDefault;
    btn.classList.toggle("on", minWeight === CFG.edgeWeightDefault);
    rebuildAfterFilter();
  };

  function makeVisualToggle(getRef, setRef) {
    return function (btn) {
      setRef(!getRef());
      btn.classList.toggle("on", getRef());
      G.refresh();
    };
  }
  window.toggleLabels = makeVisualToggle(() => showLabels, v => { showLabels = v; });
  window.toggleTags   = makeVisualToggle(() => showTags,   v => { showTags   = v; });

  // ── 툴팁 ─────────────────────────────────────────────
  const tooltip = document.getElementById("tooltip");
  document.addEventListener("mousemove", e => {
    tooltip.style.left = (e.clientX + 14) + "px";
    tooltip.style.top  = (e.clientY - 10) + "px";
  });

  function showTooltip(html) { tooltip.innerHTML = html; tooltip.style.display = "block"; }
  function hideTooltip()     { tooltip.style.display = "none"; }

  function linkTooltip(link) {
    const [s, t] = linkEnds(link);
    const ns = G.graphData().nodes;
    const sNode = ns.find(n => n.id === s);
    const tNode = ns.find(n => n.id === t);
    return `
      <div class="tt-type" style="color:#94a3b8">공유 태그 ${link.shared.length}개</div>
      <div class="tt-title" style="font-size:11px;line-height:1.5">${sNode?.title} ↔ ${tNode?.title}</div>
      <div class="tt-meta"># ${link.shared.join(" · ")}</div>`;
  }

  function nodeTooltip(node) {
    const typeLabel = node.type === "wiki" ? "Wiki" : "Book";
    const author = node.type === "book" && node.author ? `<div class="tt-meta">${node.author}</div>` : "";
    const tags = node._tags.length ? `<div class="tt-meta"># ${node._tags.join(" · ")}</div>` : "";
    return `
      <div class="tt-type col-${node.type}">${typeLabel}</div>
      <div class="tt-title">${node.title}</div>
      ${tags}${author}`;
  }

  function showNodeInfo(node) {
    const panel = document.getElementById("node-info");
    const typeColor = node.type === "wiki" ? COLOR.wiki : COLOR.book;
    document.getElementById("ni-type").textContent  = node.type === "wiki" ? "Wiki" : "Book";
    document.getElementById("ni-type").style.color  = typeColor;
    document.getElementById("ni-title").textContent = node.title;
    document.getElementById("ni-tags").textContent  = node._tags.length ? "# " + node._tags.join(" · ") : "";
    document.getElementById("ni-meta").textContent  = node.author || node.updated || "";
    document.getElementById("ni-link").href         = node.url;
    panel.style.display = "block";
  }

  // ── 초기화 ───────────────────────────────────────────
  fetch("/graph-data.json")
    .then(r => r.json())
    .then(raw => {
      let nodes = raw
        .filter(n => n.id && n.title)
        .map(n => ({ ...n, _tags: normalizeTags(n.tags), _val: 1 }));

      // 임베드 + focus 일치 노드 → 로컬(1-hop) 모드
      if (isEmbed && focusUrl) {
        const center = nodes.find(n => n.url === focusUrl);
        if (center) {
          isLocal = true;
          const keep = new Set([center.id]);
          nodes.forEach(other => {
            if (other.id !== center.id && other._tags.some(t => center._tags.includes(t))) {
              keep.add(other.id);
            }
          });
          nodes = nodes.filter(n => keep.has(n.id));
        }
      }

      allLinks = buildLinks(nodes);

      // 노드 크기 = 1 + sqrt(연결도) * 0.7
      const degree = {};
      allLinks.forEach(l => {
        degree[l.source] = (degree[l.source] || 0) + 1;
        degree[l.target] = (degree[l.target] || 0) + 1;
      });
      nodes.forEach(n => { n._val = 1 + Math.sqrt(degree[n.id] || 0) * 0.7; });

      buildTagPanel(nodes);

      const edgeAnchorVisible = link => {
        const [s, t] = linkEnds(link);
        if (activeTagFilter && !tagMatchSet.has(s) && !tagMatchSet.has(t)) return null; // 태그 미스
        const anchor = hoveredNode || focusedNode;
        if (!anchor) return "all";
        return linkTouches(link, anchor.id) ? "anchored" : "other";
      };

      G = ForceGraph()(document.getElementById("graph-canvas"))
        .backgroundColor("#0f1117")
        .graphData({ nodes, links: activeLinks() })
        .nodeId("id")
        .nodeLabel(() => "")
        .nodeVal(n => n._val)
        .nodeCanvasObject(drawNode)
        .nodePointerAreaPaint((node, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, (node._val || 1) * CFG.nodeRadiusBase + 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        })
        .linkColor(link => {
          const state = edgeAnchorVisible(link);
          if (state === null || state === "other") return COLOR.edgeFade;
          return COLOR.edge[link.kind] || COLOR.edgeFade;
        })
        .linkWidth(link => {
          const state = edgeAnchorVisible(link);
          if (state === null || state === "other") return 0.25;
          if (state === "all") return Math.min(link.weight * 0.55, CFG.edgeWidthCap);
          return Math.min(link.weight + 1, CFG.edgeHoverWidthCap);
        })
        .onLinkHover(link => {
          if (link && !hoveredNode) showTooltip(linkTooltip(link));
          else if (!hoveredNode)    hideTooltip();
        })
        .onNodeHover(node => {
          hoveredNode = node || null;
          computeNeighbors(node);
          if (node) showTooltip(nodeTooltip(node));
          else      hideTooltip();
        })
        .onNodeClick(showNodeInfo)
        .enableZoomInteraction(true)
        .enablePanInteraction(true)
        .minZoom(CFG.minZoom)
        .maxZoom(CFG.maxZoom)
        .d3AlphaDecay(isLocal ? CFG.alphaDecayLocal : CFG.alphaDecayFull)
        .d3VelocityDecay(CFG.velocityDecay)
        .d3AlphaMin(CFG.alphaMin)
        // 시뮬레이션을 유한 틱으로 → 안정화 후 idle 상태로 들어가 모바일 발열/렉 해소
        .cooldownTicks(isLocal ? CFG.coolLocal : CFG.coolFull);

      G.d3Force("charge").strength(CFG.forceCharge);
      G.d3Force("link").distance(CFG.forceLinkDist).strength(CFG.forceLinkStrength);

      updateStats();

      if (!focusUrl) return;
      const target = nodes.find(n => n.url === focusUrl);
      if (!target) return;

      // focus 노드를 원점에 고정 → 시뮬레이션이 그 주변으로 안정화
      target.fx = 0;
      target.fy = 0;
      focusedNode = target;
      computeFocusedNeighbors();
      G.d3ReheatSimulation();
      setTimeout(() => {
        if (isLocal) {
          // 활성 필터에서 실제 엣지로 focus와 연결된 노드만 fit 대상에 포함
          const visible = computeNeighborsFrom(G.graphData().links, target);
          visible.add(target.id);
          G.zoomToFit(CFG.focusSettleMs, CFG.zoomFitPadding, n => visible.has(n.id));
        } else {
          G.centerAt(0, 0, CFG.focusSettleMs);
          G.zoom(CFG.focusFullZoom, CFG.focusSettleMs);
        }
        G.refresh();
      }, CFG.focusSettleMs);
    })
    .catch(err => console.error("graph-data.json load failed:", err));
})();
