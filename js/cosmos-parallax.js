(function () {
  var root = document.body;
  if (!root) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  var isMobile = window.matchMedia("(max-width: 780px)").matches;
  if (isMobile) return;

  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var rafId = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateByPointer(clientX, clientY) {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    var nx = (clientX / w - 0.5) * 2;
    var ny = (clientY / h - 0.5) * 2;
    targetX = clamp(nx * 22, -22, 22);
    targetY = clamp(ny * 16, -16, 16);
  }

  function updateByScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    targetY = clamp(-(y * 0.05), -26, 26);
  }

  function apply() {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;

    root.style.setProperty("--cosmos-shift-x", currentX.toFixed(2) + "px");
    root.style.setProperty("--cosmos-shift-y", currentY.toFixed(2) + "px");
    root.style.setProperty("--cosmos-near-x", (currentX * 1.12).toFixed(2) + "px");
    root.style.setProperty("--cosmos-near-y", (currentY * 1.28).toFixed(2) + "px");
    root.style.setProperty("--cosmos-bg-x", (currentX * 1.55).toFixed(2) + "px");
    root.style.setProperty("--cosmos-bg-y", (currentY * 1.2).toFixed(2) + "px");

    rafId = window.requestAnimationFrame(apply);
  }

  window.addEventListener("pointermove", function (e) {
    updateByPointer(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("scroll", updateByScroll, { passive: true });

  rafId = window.requestAnimationFrame(apply);

  window.addEventListener("beforeunload", function () {
    if (rafId) window.cancelAnimationFrame(rafId);
  });
})();
