(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GraphForce = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createDragHandlers(graph, isPinned) {
    const keepPinned = isPinned || function () { return false; };

    return {
      onNodeDrag: function () {
        graph.d3ReheatSimulation();
      },
      onNodeDragEnd: function (node) {
        if (!keepPinned(node)) {
          delete node.fx;
          delete node.fy;
        }
        graph.d3ReheatSimulation();
      },
    };
  }

  return { createDragHandlers: createDragHandlers };
});
