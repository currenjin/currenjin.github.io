(function () {
  var hero = document.querySelector(".blog-face");
  if (!hero) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  if (prefersReduced || !canHover) return;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function onMove(clientX, clientY) {
    var rect = hero.getBoundingClientRect();
    var x = (clientX - rect.left) / rect.width;
    var y = (clientY - rect.top) / rect.height;
    var dx = (x - 0.5) * 2;
    var dy = (y - 0.5) * 2;

    var tiltY = clamp(dx * 4, -4, 4);
    var tiltX = clamp(-dy * 3.2, -3.2, 3.2);
    hero.style.setProperty("--tilt-y", tiltY.toFixed(2) + "deg");
    hero.style.setProperty("--tilt-x", tiltX.toFixed(2) + "deg");
    hero.style.setProperty("--glow-x", (x * 100).toFixed(1) + "%");
    hero.style.setProperty("--glow-y", (y * 100).toFixed(1) + "%");
  }

  hero.addEventListener("pointermove", function (e) {
    onMove(e.clientX, e.clientY);
  });

  hero.addEventListener("pointerleave", function () {
    hero.style.setProperty("--tilt-x", "0deg");
    hero.style.setProperty("--tilt-y", "0deg");
    hero.style.setProperty("--glow-x", "50%");
    hero.style.setProperty("--glow-y", "35%");
  });
})();
