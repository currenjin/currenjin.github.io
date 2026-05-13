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

  const params = new URLSearchParams(location.search);
  const isEmbed = params.get("embed") === "1";
  const focusUrl = params.get("focus");
  // 임베드 + focus 노드가 graph-data에 실제로 존재하는 경우에만 로컬 모드(데이터 로드 후 결정)
  let isLocal = false;

  const filters = { "wiki-wiki": true, "wiki-book": false, "book-book": true };
  let minWeight  = 2;
  let showLabels = false;
  let showTags   = false;
  let hoveredNode = null;
  let hoveredLink = null;
  let neighborSet = new Set();
  let focusedNode = null;
  let focusedNeighborSet = new Set();
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
    return allLinks.filter(l => filters[l.kind] && l.weight >= minWeight);
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

  // focus 노드의 "보이는 엣지로 연결된 이웃"만 갱신 — 필터(minWeight, kind) 변경 시 호출
  function computeFocusedNeighbors() {
    focusedNeighborSet = new Set();
    if (!focusedNode) return;
    activeLinks().forEach(l => {
      const s = l.source?.id ?? l.source;
      const t = l.target?.id ?? l.target;
      if (s === focusedNode.id) focusedNeighborSet.add(t);
      if (t === focusedNode.id) focusedNeighborSet.add(s);
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
    const isF = focusedNode?.id === node.id;
    const isHot = isH || isF;
    const isN  = !isHot && hoveredNode && neighborSet.has(node.id);
    const isFN = !isHot && !isN && focusedNode && focusedNeighborSet.has(node.id);
    const tagMiss = activeTagFilter && !tagMatchSet.has(node.id);
    const anyHot = hoveredNode || focusedNode;
    const dim = tagMiss || (!tagMiss && anyHot && !isHot && !isN && !isFN);

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = dim
      ? (node.type === "wiki" ? COLOR.wikiFade : COLOR.bookFade)
      : isHot ? "#ffffff"
      : (node.type === "wiki" ? COLOR.wiki : COLOR.book);
    ctx.fill();

    if (isHot) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + (isF && !isH ? 5 : 3), 0, Math.PI * 2);
      ctx.strokeStyle = isF && !isH ? "rgba(145,212,120,0.55)" : "rgba(255,255,255,0.22)";
      ctx.lineWidth = isF && !isH ? 2 : 1.5;
      ctx.stroke();
    }

    if ((showLabels || isHot || isN || isFN || gs > 2.0) && !dim) {
      const fs = Math.max(7.5, 11 / gs);
      ctx.font = `600 ${fs}px Pretendard, 'Segoe UI', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isHot ? "#fff" : (node.type === "wiki" ? "#d1fac0" : "#bfdbfe");
      const label = node.title.length > 20 ? node.title.slice(0, 19) + "…" : node.title;
      ctx.fillText(label, node.x, node.y + r + fs * 0.9);

      if ((showTags || isHot) && node._tags.length) {
        const tfs = Math.max(6, 9 / gs);
        ctx.font = `${tfs}px Pretendard, 'Segoe UI', sans-serif`;
        ctx.fillStyle = isHot
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
    computeFocusedNeighbors();
    G.d3ReheatSimulation();
    updateStats();
  };

  window.toggleMinWeight = function (btn) {
    minWeight = minWeight === 2 ? 1 : 2;
    btn.classList.toggle("on", minWeight === 2);
    const { nodes } = G.graphData();
    G.graphData({ nodes, links: activeLinks() });
    hoveredNode = null;
    neighborSet = new Set();
    computeFocusedNeighbors();
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
      let nodes = raw
        .filter(n => n.id && n.title)
        .map(n => {
          const tags = normalizeTags(n.tags);
          return { ...n, _tags: tags, _val: 1 };
        });

      // 임베드(도크) + focus: 현재 노드 + 태그를 1개라도 공유하는 이웃만 남겨 로컬 그래프로.
      // 필터/minWeight는 표준 디폴트(Wiki↔Wiki on, Book↔Book on, 공유 태그 2개 이상) 그대로 사용.
      // focus가 graph-data에 없는 페이지(/books, /tags 등)에선 로컬화 스킵 → 풀 그래프로 표시.
      if (isEmbed && focusUrl) {
        const center = nodes.find(n => n.url === focusUrl);
        if (center) {
          isLocal = true;
          const keep = new Set([center.id]);
          nodes.forEach(other => {
            if (other.id === center.id) return;
            if (other._tags.some(t => center._tags.includes(t))) keep.add(other.id);
          });
          nodes = nodes.filter(n => keep.has(n.id));
        }
      }

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
          const anchor = hoveredNode || focusedNode;
          if (!anchor) return COLOR.edge[link.kind] || COLOR.edgeFade;
          return (s === anchor.id || t === anchor.id)
            ? (COLOR.edge[link.kind] || "rgba(255,255,255,0.5)")
            : COLOR.edgeFade;
        })
        .linkWidth(link => {
          const s = link.source?.id ?? link.source, t = link.target?.id ?? link.target;
          if (activeTagFilter && !tagMatchSet.has(s) && !tagMatchSet.has(t)) return 0.25;
          const anchor = hoveredNode || focusedNode;
          if (!anchor) return Math.min(link.weight * 0.55, 2);
          return (s === anchor.id || t === anchor.id) ? Math.min(link.weight + 1, 3.5) : 0.25;
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
        .d3AlphaDecay(isLocal ? 0.045 : 0.03)
        .d3VelocityDecay(0.4)
        .d3AlphaMin(0.001)
        // 시뮬레이션을 영구가 아닌 유한 틱으로 → 안정화 후 캔버스가 idle 상태가 되어 모바일 발열/렉 해소
        .cooldownTicks(isLocal ? 120 : 300);

      // 노드 간격 조정: 반발력 강화 + 링크 거리 확장
      G.d3Force("charge").strength(-500);
      G.d3Force("link").distance(140).strength(0.25);

      updateStats();

      // ?focus=<url> 로 진입한 경우: 노드를 원점에 고정해 안정화시킨 뒤 센터링/줌
      if (focusUrl) {
        const target = nodes.find(n => n.url === focusUrl);
        if (target) {
          target.fx = 0;
          target.fy = 0;
          focusedNode = target;
          computeFocusedNeighbors();
          G.d3ReheatSimulation();
          setTimeout(() => {
            if (isLocal) {
              // 현재 활성화된 필터(minWeight, kind)에서 실제 엣지로 focus와 연결된 노드만 fit 대상으로.
              // 그래야 weight=1짜리 고립 노드까지 잡아 화면이 과하게 넓어지지 않음.
              const visible = new Set([target.id]);
              G.graphData().links.forEach(l => {
                const s = l.source?.id ?? l.source;
                const t = l.target?.id ?? l.target;
                if (s === target.id) visible.add(t);
                if (t === target.id) visible.add(s);
              });
              G.zoomToFit(800, 60, n => visible.has(n.id));
            } else {
              // 풀 그래프에서 특정 노드 focus: 중앙 + 적당한 줌
              G.centerAt(0, 0, 800);
              G.zoom(2, 800);
            }
            G.refresh();
          }, 800);
        }
      }
    })
    .catch(err => console.error("graph-data.json load failed:", err));
})();
