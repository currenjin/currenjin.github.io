(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FocusTrap = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SELECTOR = 'a[href],button,input,select,textarea,[tabindex]';

  // 지금 화면에 보이고 Tab으로 닿을 수 있는 컨트롤만 순서대로 돌려준다.
  function focusables(container) {
    return Array.prototype.filter.call(container.querySelectorAll(SELECTOR), function (el) {
      return !el.disabled && el.getAttribute("tabindex") !== "-1" &&
        !el.closest("[hidden],[inert]") && el.getClientRects().length > 0;
    });
  }

  // Tab/Shift+Tab 이 컨테이너 끝에서 밖으로 나가려 할 때 감아 돌 대상.
  // null 이면 브라우저 기본 이동에 맡긴다(아직 컨테이너 안쪽이라는 뜻).
  function wrapTarget(items, active, backwards) {
    if (!items.length) return null;
    const index = items.indexOf(active);
    if (backwards) return index <= 0 ? items[items.length - 1] : null;
    return index === -1 || index === items.length - 1 ? items[0] : null;
  }

  // keydown 핸들러에서 호출. 처리했으면 true.
  function handleTab(container, event, fallback) {
    if (event.key !== "Tab") return false;
    const items = focusables(container);
    if (!items.length) {
      event.preventDefault();
      if (fallback) fallback.focus();
      return true;
    }
    const target = wrapTarget(items, event.target, event.shiftKey);
    if (!target) return false;
    event.preventDefault();
    target.focus();
    return true;
  }

  return { focusables: focusables, wrapTarget: wrapTarget, handleTab: handleTab };
});
