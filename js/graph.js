(function () {
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
  };

  const filters = { "wiki-wiki": true, "wiki-book": true, "book-book": true };
  let showLabels = false;
  let showTags   = false;
  let hoveredNode = null;
  let hoveredLink = null;
  let neighborSet = new Set();
  let activeTagFilter = null;
  let tagMatchSet = new Set();
  let allLinks = [];
  let G;

  // ── 태그 정규화 ──────────────────────────────────────
  function normalizeTags(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
    return String(raw).split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
  }

  // ── 엣지 빌드 ────────────────────────────────────────
  function sharedTags(a, b) {
    return a._tags.filter(t => b._tags.includes(t));
  }

  function buildLinks(nodes) {
    const wikis = nodes.filter(n => n.type === "wiki");
    const books = nodes.filter(n => n.type === "book");
    const links = [];

    for (let i = 0; i < wikis.length; i++)
      for (let j = i + 1; j < wikis.length; j++) {
        const s = sharedTags(wikis[i], wikis[j]);
        if (s.length) links.push({ source: wikis[i].id, target: wikis[j].id, kind: "wiki-wiki", weight: s.length, shared: s });
      }

    for (const w of wikis)
      for (const b of books) {
        const s = sharedTags(w, b);
        if (s.length) links.push({ source: w.id, target: b.id, kind: "wiki-book", weight: s.length, shared: s });
      }

    for (let i = 0; i < books.length; i++)
      for (let j = i + 1; j < books.length; j++) {
        const s = sharedTags(books[i], books[j]);
        if (s.length) links.push({ source: books[i].id, target: books[j].id, kind: "book-book", weight: s.length, shared: s });
      }

    return links;
  }

  function activeLinks() {
    return allLinks.filter(l => filters[l.kind]);
  }

  // 호버 시 이웃 노드 Set을 미리 계산 — drawNode에서 O(1) 조회
  function computeNeighbors(node) {
    neighborSet = new Set();
    if (!node) return;
    G.graphData().links.forEach(l => {
      const s = l.source?.id ?? l.source;
      const t = l.target?.id ?? l.target;
      if (s === node.id) neighborSet.add(t);
      if (t === node.id) neighborSet.add(s);
    });
  }

  function applyTagFilter(tag) {
    activeTagFilter = tag;
    tagMatchSet = new Set();
    if (tag) {
      G.graphData().nodes.forEach(n => {
        if (n._tags.includes(tag)) tagMatchSet.add(n.id);
      });
    }
  }

  // ── 노드 렌더링 ──────────────────────────────────────
  function drawNode(node, ctx, gs) {
    const r = (node._val || 1) * 2.4;
    const isH = hoveredNode?.id === node.id;
    const isN = !isH && hoveredNode && neighborSet.has(node.id);
    const tagMiss = activeTagFilter && !tagMatchSet.has(node.id);
    const dim = tagMiss || (!tagMiss && hoveredNode && !isH && !isN);

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = dim
      ? (node.type === "wiki" ? COLOR.wikiFade : COLOR.bookFade)
      : isH ? "#ffffff"
      : (node.type === "wiki" ? COLOR.wiki : COLOR.book);
    ctx.fill();

    if (isH) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if ((showLabels || isH || isN || gs > 2.0) && !dim) {
      const fs = Math.max(7.5, 11 / gs);
      ctx.font = `600 ${fs}px Pretendard, 'Segoe UI', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isH ? "#fff" : (node.type === "wiki" ? "#d1fac0" : "#bfdbfe");
      const label = node.title.length > 20 ? node.title.slice(0, 19) + "…" : node.title;
      ctx.fillText(label, node.x, node.y + r + fs * 0.9);

      if ((showTags || isH) && node._tags.length) {
        const tfs = Math.max(6, 9 / gs);
        ctx.font = `${tfs}px Pretendard, 'Segoe UI', sans-serif`;
        ctx.fillStyle = isH
          ? "rgba(203,213,225,0.85)"
          : (node.type === "wiki" ? "rgba(145,212,120,0.5)" : "rgba(96,165,250,0.5)");
        ctx.fillText(node._tags.map(t => "#" + t).join(" "), node.x, node.y + r + fs * 0.9 + tfs * 1.4);
      }
    }
  }

  function updateStats() {
    const active = activeLinks();
    const ww = active.filter(l => l.kind === "wiki-wiki").length;
    const wb = active.filter(l => l.kind === "wiki-book").length;
    const bb = active.filter(l => l.kind === "book-book").length;
    document.getElementById("stats").innerHTML =
      `Wiki↔Wiki: ${ww}<br>Wiki↔Book: ${wb}<br>Book↔Book: ${bb}`;
  }

  function buildTagPanel(nodes) {
    const freq = {};
    nodes.forEach(n => n._tags.forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    const tags = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const list = document.getElementById("tag-list");
    list.innerHTML = "";
    tags.forEach(([tag, count]) => {
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

  // ── 토글 ─────────────────────────────────────────────
  window.toggleKind = function (kind, btn) {
    filters[kind] = !filters[kind];
    btn.classList.toggle("on", filters[kind]);
    const { nodes } = G.graphData();
    G.graphData({ nodes, links: activeLinks() });
    hoveredNode = null;
    neighborSet = new Set();
    G.d3ReheatSimulation();
    updateStats();
  };

  window.toggleLabels = function (btn) {
    showLabels = !showLabels;
    btn.classList.toggle("on", showLabels);
    G.refresh();
  };

  window.toggleTags = function (btn) {
    showTags = !showTags;
    btn.classList.toggle("on", showTags);
    G.refresh();
  };

  // ── 툴팁 ─────────────────────────────────────────────
  const tooltip = document.getElementById("tooltip");
  document.addEventListener("mousemove", e => {
    tooltip.style.left = (e.clientX + 14) + "px";
    tooltip.style.top  = (e.clientY - 10) + "px";
  });

  // ── 초기화 ───────────────────────────────────────────
  fetch("/graph-data.json")
    .then(r => r.json())
    .then(raw => {
      const nodes = raw
        .filter(n => n.id && n.title)
        .map(n => {
          const tags = normalizeTags(n.tags);
          return { ...n, _tags: tags, _val: 1 };
        });

      allLinks = buildLinks(nodes);

      const degree = {};
      allLinks.forEach(l => {
        degree[l.source] = (degree[l.source] || 0) + 1;
        degree[l.target] = (degree[l.target] || 0) + 1;
      });
      nodes.forEach(n => { n._val = 1 + Math.sqrt(degree[n.id] || 0) * 0.7; });

      buildTagPanel(nodes);

      G = ForceGraph()(document.getElementById("graph-canvas"))
        .backgroundColor("#0f1117")
        .graphData({ nodes, links: activeLinks() })
        .nodeId("id")
        .nodeLabel(() => "")
        .nodeVal(n => n._val)
        .nodeCanvasObject(drawNode)
        .nodePointerAreaPaint((node, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, (node._val || 1) * 2.4 + 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        })
        .linkColor(link => {
          const s = link.source?.id ?? link.source, t = link.target?.id ?? link.target;
          if (activeTagFilter && !tagMatchSet.has(s) && !tagMatchSet.has(t)) return COLOR.edgeFade;
          if (!hoveredNode) return COLOR.edge[link.kind] || COLOR.edgeFade;
          return (s === hoveredNode.id || t === hoveredNode.id)
            ? (COLOR.edge[link.kind] || "rgba(255,255,255,0.5)")
            : COLOR.edgeFade;
        })
        .linkWidth(link => {
          const s = link.source?.id ?? link.source, t = link.target?.id ?? link.target;
          if (activeTagFilter && !tagMatchSet.has(s) && !tagMatchSet.has(t)) return 0.25;
          if (!hoveredNode) return Math.min(link.weight * 0.55, 2);
          return (s === hoveredNode.id || t === hoveredNode.id) ? Math.min(link.weight + 1, 3.5) : 0.25;
        })
        .onLinkHover(link => {
          hoveredLink = link || null;
          if (link && !hoveredNode) {
            const s = link.source?.id ?? link.source;
            const t = link.target?.id ?? link.target;
            const sNode = G.graphData().nodes.find(n => n.id === s);
            const tNode = G.graphData().nodes.find(n => n.id === t);
            tooltip.innerHTML = `
              <div class="tt-type" style="color:#94a3b8">공유 태그 ${link.shared.length}개</div>
              <div class="tt-title" style="font-size:11px;line-height:1.5">${sNode?.title} ↔ ${tNode?.title}</div>
              <div class="tt-meta"># ${link.shared.join(" · ")}</div>
            `;
            tooltip.style.display = "block";
          } else if (!hoveredNode) {
            tooltip.style.display = "none";
          }
        })
        .onNodeHover(node => {
          hoveredNode = node || null;
          computeNeighbors(node);
          if (node) {
            const cls = "col-" + node.type;
            const typeLabel = node.type === "wiki" ? "Wiki" : "Book";
            const authorLine = node.type === "book" && node.author
              ? `<div class="tt-meta">${node.author}</div>` : "";
            tooltip.innerHTML = `
              <div class="tt-type ${cls}">${typeLabel}</div>
              <div class="tt-title">${node.title}</div>
              ${node._tags.length ? `<div class="tt-meta"># ${node._tags.join(" · ")}</div>` : ""}
              ${authorLine}
            `;
            tooltip.style.display = "block";
          } else {
            tooltip.style.display = "none";
          }
        })
        .onNodeClick(node => {
          const panel = document.getElementById("node-info");
          const typeColor = node.type === "wiki" ? "#91d478" : "#60a5fa";
          document.getElementById("ni-type").textContent  = node.type === "wiki" ? "Wiki" : "Book";
          document.getElementById("ni-type").style.color  = typeColor;
          document.getElementById("ni-title").textContent = node.title;
          document.getElementById("ni-tags").textContent  = node._tags.length ? "# " + node._tags.join(" · ") : "";
          document.getElementById("ni-meta").textContent  = node.author || node.updated || "";
          document.getElementById("ni-link").href         = node.url;
          panel.style.display = "block";
        })
        .enableZoomInteraction(true)
        .enablePanInteraction(true)
        .minZoom(0.05)
        .maxZoom(12)
        .d3AlphaDecay(0.03)
        .d3VelocityDecay(0.4)
        .d3AlphaMin(0)
        .cooldownTicks(Infinity);

      // 노드 간격 조정: 반발력 강화 + 링크 거리 확장
      G.d3Force("charge").strength(-500);
      G.d3Force("link").distance(140).strength(0.25);

      updateStats();
    })
    .catch(err => console.error("graph-data.json load failed:", err));
})();
