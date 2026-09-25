(function () {
  "use strict";

  const root = document.querySelector(".knowledge-graph");
  const canvas = document.getElementById("graph-canvas");
  const status = document.getElementById("graph-status");
  if (!root || !canvas) return;

  const CFG = {
    nodeRadiusBase: 2.35,
    edgeWeightDefault: 2,
    edgeWidthCap: 2,
    edgeHoverWidthCap: 3.5,
    labelMaxLen: 22,
    forceCharge: -500,
    forceLinkDist: 140,
    forceLinkStrength: 0.25,
    minZoom: 0.08,
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
    fontStack: 'Georgia, "Times New Roman", "Apple SD Gothic Neo", serif',
    sansStack: 'Arial, "Apple SD Gothic Neo", sans-serif',
  };

  // 캔버스 색은 _layouts/graph.html 의 --g-* 토큰에서 읽는다. 테마가 바뀌면
  // 같은 객체를 제자리에서 갱신하므로 아래 draw 콜백들은 그대로 두면 된다.
  // 폴백 값은 라이트(Parchment / Umber) 팔레트.
  const COLOR = {
    paper: "#f2ebdf",
    ink: "#23190f",
    muted: "#6b5741",
    accent: "#8a4b2a",
    wiki: "#8a4b2a",
    review: "#23190f",
    wikiFade: "rgba(138,75,42,.14)",
    reviewFade: "rgba(35,25,15,.10)",
    edge: {
      "wiki-wiki": "rgba(138,75,42,.42)",
      "wiki-review": "rgba(138,75,42,.28)",
      "review-review": "rgba(35,25,15,.20)",
    },
    edgeFade: "rgba(107,87,65,.06)",
  };

  const COLOR_TOKENS = {
    paper: "--g-paper",
    ink: "--g-ink",
    muted: "--g-muted",
    accent: "--g-wiki",
    wiki: "--g-wiki",
    review: "--g-review",
    wikiFade: "--g-wiki-fade",
    reviewFade: "--g-review-fade",
    edgeFade: "--g-edge-fade",
  };
  const EDGE_TOKENS = {
    "wiki-wiki": "--g-edge-ww",
    "wiki-review": "--g-edge-wr",
    "review-review": "--g-edge-rr",
  };

  function readPalette() {
    const styles = getComputedStyle(document.documentElement);
    const token = name => styles.getPropertyValue(name).trim();
    for (const key of Object.keys(COLOR_TOKENS)) {
      const value = token(COLOR_TOKENS[key]);
      if (value) COLOR[key] = value;
    }
    for (const kind of Object.keys(EDGE_TOKENS)) {
      const value = token(EDGE_TOKENS[kind]);
      if (value) COLOR.edge[kind] = value;
    }
  }

  readPalette();

  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get("embed") === "1";
  const focusUrl = params.get("focus");
  const filters = { "wiki-wiki": true, "wiki-review": false, "review-review": true };

  let isLocal = false;
  let minWeight = CFG.edgeWeightDefault;
  let showLabels = false;
  let showTags = false;
  let hoveredNode = null;
  let selectedNode = null;
  let focusedNode = null;
  let neighborSet = new Set();
  let activeTag = null;
  let tagMatches = new Set();
  let nodes = [];
  let allLinks = [];
  let graph;

  // 테마 토글 → 캔버스도 따라간다. DOM 쪽은 CSS 토큰이 알아서 처리한다.
  document.addEventListener("themechange", () => {
    readPalette();
    if (!graph) return;
    graph.backgroundColor(COLOR.paper);
    refreshGraph();
  });

  const tooltip = document.getElementById("tooltip");
  const info = document.getElementById("node-info");
  const tagList = document.getElementById("tag-list");
  const linkEnds = link => [link.source?.id ?? link.source, link.target?.id ?? link.target];

  function normalizeTags(value) {
    if (Array.isArray(value)) return value.map(tag => String(tag).trim()).filter(Boolean);
    return String(value || "").split(/[\s,]+/).map(tag => tag.trim()).filter(Boolean);
  }

  function sharedTags(a, b) {
    return a._tags.filter(tag => b._tags.includes(tag));
  }

  function buildLinks(graphNodes) {
    const wikis = graphNodes.filter(node => node.type === "wiki");
    const reviews = graphNodes.filter(node => node.type === "review");
    const links = [];
    const add = (a, b, kind) => {
      const shared = sharedTags(a, b);
      if (shared.length) links.push({ source: a.id, target: b.id, kind, weight: shared.length, shared });
    };

    for (let i = 0; i < wikis.length; i += 1) {
      for (let j = i + 1; j < wikis.length; j += 1) add(wikis[i], wikis[j], "wiki-wiki");
    }
    for (const wiki of wikis) {
      for (const review of reviews) add(wiki, review, "wiki-review");
    }
    for (let i = 0; i < reviews.length; i += 1) {
      for (let j = i + 1; j < reviews.length; j += 1) add(reviews[i], reviews[j], "review-review");
    }
    return links;
  }

  function activeLinks() {
    return allLinks.filter(link => filters[link.kind] && link.weight >= minWeight);
  }

  function neighborsOf(node, links) {
    const result = new Set();
    if (!node) return result;
    for (const link of links || graph.graphData().links) {
      const [source, target] = linkEnds(link);
      if (source === node.id) result.add(target);
      if (target === node.id) result.add(source);
    }
    return result;
  }

  function currentAnchor() {
    return hoveredNode || selectedNode || focusedNode;
  }

  function refreshGraph() {
    if (graph) graph.nodeCanvasObject(drawNode);
  }

  function nodeColor(node, dim, hot) {
    if (dim) return node.type === "wiki" ? COLOR.wikiFade : COLOR.reviewFade;
    if (hot) return COLOR.paper;
    return node.type === "wiki" ? COLOR.wiki : COLOR.review;
  }

  function drawNode(node, context, scale) {
    const radius = (node._val || 1) * CFG.nodeRadiusBase;
    const anchor = currentAnchor();
    const hot = anchor?.id === node.id;
    const neighbor = !hot && anchor && neighborSet.has(node.id);
    const tagMiss = activeTag && !tagMatches.has(node.id);
    const dim = tagMiss || (anchor && !hot && !neighbor);

    context.beginPath();
    context.arc(node.x, node.y, radius, 0, Math.PI * 2);
    context.fillStyle = nodeColor(node, dim, hot);
    context.fill();

    if (hot) {
      context.beginPath();
      context.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
      context.strokeStyle = node.type === "wiki" ? COLOR.accent : COLOR.ink;
      context.lineWidth = 1.4;
      context.stroke();
    }

    if (!((showLabels || hot || neighbor || scale > 2) && !dim)) return;
    const fontSize = Math.max(7.5, 11 / scale);
    context.font = `${hot ? "600" : "400"} ${fontSize}px ${CFG.fontStack}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = COLOR.ink;
    const label = node.title.length > CFG.labelMaxLen
      ? `${node.title.slice(0, CFG.labelMaxLen - 1)}…`
      : node.title;
    context.fillText(label, node.x, node.y + radius + fontSize);

    if (!((showTags || hot) && node._tags.length)) return;
    const tagSize = Math.max(6, 9 / scale);
    context.font = `${tagSize}px ${CFG.sansStack}`;
    context.fillStyle = COLOR.muted;
    context.fillText(
      node._tags.map(tag => `#${tag}`).join(" "),
      node.x,
      node.y + radius + fontSize + tagSize * 1.45
    );
  }

  function edgeState(link) {
    const [source, target] = linkEnds(link);
    if (activeTag && !tagMatches.has(source) && !tagMatches.has(target)) return "hidden";
    const anchor = currentAnchor();
    if (!anchor) return "all";
    return source === anchor.id || target === anchor.id ? "hot" : "dim";
  }

  function hideTooltip() {
    tooltip.hidden = true;
    tooltip.replaceChildren();
  }

  function appendTooltip(kindText, kindClass, titleText, metaText) {
    tooltip.replaceChildren();
    const kind = document.createElement("span");
    kind.className = `tooltip-kind${kindClass ? ` ${kindClass}` : ""}`;
    kind.textContent = kindText;
    const title = document.createElement("strong");
    title.textContent = titleText;
    tooltip.append(kind, title);
    if (metaText) {
      const meta = document.createElement("small");
      meta.textContent = metaText;
      tooltip.append(meta);
    }
    tooltip.hidden = false;
  }

  function showNodeTooltip(node) {
    const meta = [
      node._tags.length ? `# ${node._tags.join(" · ")}` : "",
      node.author || node.updated || "",
    ].filter(Boolean).join(" · ");
    appendTooltip(node.type, node.type, node.title, meta);
  }

  function showLinkTooltip(link) {
    const [sourceId, targetId] = linkEnds(link);
    const source = nodes.find(node => node.id === sourceId);
    const target = nodes.find(node => node.id === targetId);
    appendTooltip(
      `공유 태그 ${link.shared.length}개`,
      "",
      `${source?.title || ""} ↔ ${target?.title || ""}`,
      `# ${link.shared.join(" · ")}`
    );
  }

  function showNodeInfo(node) {
    selectedNode = node;
    focusedNode = null;
    neighborSet = neighborsOf(node);
    document.getElementById("ni-type").textContent = node.type;
    document.getElementById("ni-title").textContent = node.title;
    document.getElementById("ni-tags").textContent = node._tags.length ? `# ${node._tags.join(" · ")}` : "";
    document.getElementById("ni-meta").textContent = [node.author, node.genre, node.updated].filter(Boolean).join(" · ");
    document.getElementById("ni-link").href = node.url;
    info.hidden = false;
    refreshGraph();
  }

  function clearNodeInfo() {
    info.hidden = true;
    selectedNode = null;
    if (focusedNode) neighborSet = neighborsOf(focusedNode);
    else neighborSet = new Set();
    refreshGraph();
  }

  function updateStats() {
    const links = activeLinks();
    const counts = { "wiki-wiki": 0, "wiki-review": 0, "review-review": 0 };
    links.forEach(link => { counts[link.kind] += 1; });
    const stats = document.getElementById("stats");
    stats.textContent = `${nodes.length} nodes · ${links.length} links`;
    stats.title = `wiki↔wiki ${counts["wiki-wiki"]} · wiki↔review ${counts["wiki-review"]} · review↔review ${counts["review-review"]}`;
  }

  function rebuildGraph() {
    graph.graphData({ nodes, links: activeLinks() });
    hoveredNode = null;
    neighborSet = neighborsOf(selectedNode || focusedNode);
    hideTooltip();
    graph.d3ReheatSimulation();
    updateStats();
  }

  function buildTagPanel() {
    const frequencies = {};
    nodes.forEach(node => node._tags.forEach(tag => { frequencies[tag] = (frequencies[tag] || 0) + 1; }));
    tagList.replaceChildren();
    Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .forEach(([tag, count]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tag-chip";
        button.textContent = `#${tag} ${count}`;
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
          const turningOff = activeTag === tag;
          activeTag = turningOff ? null : tag;
          tagMatches = new Set(
            activeTag ? nodes.filter(node => node._tags.includes(activeTag)).map(node => node.id) : []
          );
          tagList.querySelectorAll(".tag-chip").forEach(chip => {
            const active = !turningOff && chip === button;
            chip.classList.toggle("on", active);
            chip.setAttribute("aria-pressed", String(active));
          });
          refreshGraph();
        });
        tagList.append(button);
      });
  }

  function bindControls() {
    document.querySelectorAll("[data-link-kind]").forEach(button => {
      button.addEventListener("click", () => {
        const kind = button.dataset.linkKind;
        filters[kind] = !filters[kind];
        button.classList.toggle("on", filters[kind]);
        button.setAttribute("aria-pressed", String(filters[kind]));
        rebuildGraph();
      });
    });

    document.getElementById("btn-weight").addEventListener("click", event => {
      minWeight = minWeight === CFG.edgeWeightDefault ? 1 : CFG.edgeWeightDefault;
      const strict = minWeight === CFG.edgeWeightDefault;
      event.currentTarget.classList.toggle("on", strict);
      event.currentTarget.setAttribute("aria-pressed", String(strict));
      event.currentTarget.textContent = strict ? "공유 태그 2개 이상" : "공유 태그 1개 이상";
      rebuildGraph();
    });

    document.getElementById("btn-labels").addEventListener("click", event => {
      showLabels = !showLabels;
      event.currentTarget.classList.toggle("on", showLabels);
      event.currentTarget.setAttribute("aria-pressed", String(showLabels));
      refreshGraph();
    });

    document.getElementById("btn-tags").addEventListener("click", event => {
      showTags = !showTags;
      event.currentTarget.classList.toggle("on", showTags);
      event.currentTarget.setAttribute("aria-pressed", String(showTags));
      refreshGraph();
    });

    const toggle = document.getElementById("panel-toggle");
    const setPanel = open => {
      document.documentElement.classList.toggle("graph-panel-collapsed", !open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setPanel(document.documentElement.classList.contains("graph-panel-collapsed")));
    document.getElementById("panel-collapse").addEventListener("click", () => setPanel(false));
    setPanel(!document.documentElement.classList.contains("graph-panel-collapsed"));

    document.getElementById("ni-close").addEventListener("click", clearNodeInfo);
    document.querySelectorAll("[data-zoom]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.zoom;
        if (action === "in") graph.zoom(graph.zoom() * 1.5, 250);
        else if (action === "out") graph.zoom(graph.zoom() / 1.5, 250);
        else graph.zoomToFit(450, 55);
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        hideTooltip();
        clearNodeInfo();
      }
    });
  }

  function initialize(raw) {
    nodes = raw
      .filter(node => node.id && node.title)
      .map(node => ({ ...node, _tags: normalizeTags(node.tags), _val: 1 }));

    if (isEmbed && focusUrl) {
      const center = nodes.find(node => node.url === focusUrl);
      if (center) {
        isLocal = true;
        const keep = new Set([center.id]);
        nodes.forEach(other => {
          if (other.id !== center.id && other._tags.some(tag => center._tags.includes(tag))) keep.add(other.id);
        });
        nodes = nodes.filter(node => keep.has(node.id));
      }
    }

    allLinks = buildLinks(nodes);
    const degree = {};
    allLinks.forEach(link => {
      const [source, target] = linkEnds(link);
      degree[source] = (degree[source] || 0) + 1;
      degree[target] = (degree[target] || 0) + 1;
    });
    nodes.forEach(node => { node._val = 1 + Math.sqrt(degree[node.id] || 0) * 0.7; });

    buildTagPanel();
    graph = ForceGraph()(canvas)
      .width(canvas.clientWidth)
      .height(canvas.clientHeight)
      .backgroundColor(COLOR.paper)
      .graphData({ nodes, links: activeLinks() })
      .nodeId("id")
      .nodeLabel(() => "")
      .nodeVal(node => node._val)
      .nodeCanvasObject(drawNode)
      .nodePointerAreaPaint((node, color, context) => {
        context.beginPath();
        context.arc(node.x, node.y, (node._val || 1) * CFG.nodeRadiusBase + 7, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
      })
      .linkColor(link => {
        const state = edgeState(link);
        return state === "hidden" || state === "dim" ? COLOR.edgeFade : COLOR.edge[link.kind];
      })
      .linkWidth(link => {
        const state = edgeState(link);
        if (state === "hidden" || state === "dim") return 0.2;
        return Math.min(
          link.weight * (state === "hot" ? 1 : 0.5),
          state === "hot" ? CFG.edgeHoverWidthCap : CFG.edgeWidthCap
        );
      })
      .onLinkHover(link => {
        if (link && !hoveredNode) showLinkTooltip(link);
        else if (!hoveredNode) hideTooltip();
      })
      .onNodeHover(node => {
        hoveredNode = node || null;
        neighborSet = neighborsOf(hoveredNode || selectedNode || focusedNode);
        if (node) showNodeTooltip(node);
        else hideTooltip();
        refreshGraph();
      })
      .onNodeClick(showNodeInfo)
      .enableZoomInteraction(true)
      .enablePanInteraction(true)
      .minZoom(CFG.minZoom)
      .maxZoom(CFG.maxZoom)
      .d3AlphaDecay(isLocal ? CFG.alphaDecayLocal : CFG.alphaDecayFull)
      .d3VelocityDecay(CFG.velocityDecay)
      .d3AlphaMin(CFG.alphaMin)
      .cooldownTicks(isLocal ? CFG.coolLocal : CFG.coolFull);

    graph.d3Force("charge").strength(CFG.forceCharge);
    graph.d3Force("link").distance(CFG.forceLinkDist).strength(CFG.forceLinkStrength);
    const dragHandlers = GraphForce.createDragHandlers(graph, node => node === selectedNode || node === focusedNode);
    graph.onNodeDrag(dragHandlers.onNodeDrag).onNodeDragEnd(dragHandlers.onNodeDragEnd);

    bindControls();
    updateStats();
    status.hidden = true;

    root.addEventListener("mousemove", event => {
      if (tooltip.hidden) return;
      const bounds = root.getBoundingClientRect();
      const width = Math.min(240, bounds.width - 24);
      tooltip.style.left = `${Math.max(10, Math.min(event.clientX - bounds.left + 14, bounds.width - width - 10))}px`;
      tooltip.style.top = `${Math.max(10, Math.min(event.clientY - bounds.top - 12, bounds.height - tooltip.offsetHeight - 10))}px`;
    });

    const resize = () => {
      if (canvas.clientWidth && canvas.clientHeight) graph.width(canvas.clientWidth).height(canvas.clientHeight);
    };
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    const target = focusUrl ? nodes.find(node => node.url === focusUrl) : null;
    if (target) {
      target.fx = 0;
      target.fy = 0;
      focusedNode = target;
      neighborSet = neighborsOf(target, activeLinks());
      graph.d3ReheatSimulation();
      window.setTimeout(() => {
        if (isLocal) {
          const visible = neighborsOf(target, graph.graphData().links);
          visible.add(target.id);
          graph.zoomToFit(CFG.focusSettleMs, CFG.zoomFitPadding, node => visible.has(node.id));
        } else {
          graph.centerAt(0, 0, CFG.focusSettleMs);
          graph.zoom(CFG.focusFullZoom, CFG.focusSettleMs);
        }
        refreshGraph();
      }, CFG.focusSettleMs);
    } else {
      window.setTimeout(() => graph.zoomToFit(600, CFG.zoomFitPadding), 650);
    }
  }

  if (typeof window.ForceGraph !== "function" || !window.GraphForce) {
    status.textContent = "그래프 엔진을 불러오지 못했습니다.";
    return;
  }

  fetch(canvas.dataset.source || "/graph-data.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(raw => {
      if (!Array.isArray(raw)) throw new Error("Invalid graph data");
      initialize(raw);
    })
    .catch(error => {
      status.textContent = "그래프 데이터를 불러오지 못했습니다.";
      console.error("graph-data.json load failed:", error);
    });
})();
