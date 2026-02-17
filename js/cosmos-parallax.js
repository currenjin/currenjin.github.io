(function () {
  var root = document.body;
  if (!root) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  var isMobile = window.matchMedia("(max-width: 780px)").matches;
  if (isMobile) return;

  var IMAGE_WIDTH = 2000;
  var IMAGE_HEIGHT = 1158;
  var BG_X_MULTIPLIER = 1.55;
  var BG_Y_MULTIPLIER = 1.2;
  var OVERSCAN = 1.12;
  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var rafId = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getSafeRange() {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    var scale = Math.max(w / IMAGE_WIDTH, h / IMAGE_HEIGHT) * OVERSCAN;
    var renderedW = IMAGE_WIDTH * scale;
    var renderedH = IMAGE_HEIGHT * scale;
    var spareX = Math.max(0, (renderedW - w) * 0.5 - 2);
    var spareY = Math.max(0, (renderedH - h) * 0.5 - 2);

    return {
      w: renderedW,
      h: renderedH,
      x: spareX / BG_X_MULTIPLIER,
      y: spareY / BG_Y_MULTIPLIER
    };
  }

  function updateByPointer(clientX, clientY) {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    var safe = getSafeRange();
    var nx = (clientX / w - 0.5) * 2;
    var ny = (clientY / h - 0.5) * 2;
    var maxX = Math.min(22, safe.x);

    targetX = clamp(nx * 22, -maxX, maxX);
    targetY = clamp(ny * 16, -16, 16);
  }

  function updateByScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    targetY = clamp(-(y * 0.05), -26, 26);
  }

  function apply() {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    var safe = getSafeRange();
    var bgY = clamp(currentY * BG_Y_MULTIPLIER, -safe.y * BG_Y_MULTIPLIER, safe.y * BG_Y_MULTIPLIER);
    var bgX = clamp(currentX * BG_X_MULTIPLIER, -safe.x * BG_X_MULTIPLIER, safe.x * BG_X_MULTIPLIER);

    root.style.setProperty("--cosmos-bg-size", safe.w.toFixed(2) + "px " + safe.h.toFixed(2) + "px");

    root.style.setProperty("--cosmos-shift-x", currentX.toFixed(2) + "px");
    root.style.setProperty("--cosmos-shift-y", currentY.toFixed(2) + "px");
    root.style.setProperty("--cosmos-near-x", (currentX * 1.12).toFixed(2) + "px");
    root.style.setProperty("--cosmos-near-y", (currentY * 1.28).toFixed(2) + "px");
    root.style.setProperty("--cosmos-bg-x", bgX.toFixed(2) + "px");
    root.style.setProperty("--cosmos-bg-y", bgY.toFixed(2) + "px");

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
