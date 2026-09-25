/* 라이트/다크 테마 컨트롤러.
 *
 * 규칙
 *   1. localStorage 에 명시적 선택이 있으면 그것이 최우선이다.
 *   2. 없으면 prefers-color-scheme 를 따르고, 시스템이 바뀌면 같이 따라간다.
 *   3. 사용자가 토글하면 그 선택이 저장되고 시스템 설정을 덮어쓴다.
 *
 * 순수 함수(resolveTheme/nextTheme)는 node:test 에서 직접 불러 검증한다.
 * 첫 페인트 전 적용은 _includes/theme-boot.html 의 인라인 스크립트가 맡는다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else {
    root.SiteTheme = api;
    api.mount();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEY = "theme";
  const DARK_QUERY = "(prefers-color-scheme: dark)";
  const EVENT = "themechange";
  const MARK = { light: "○", dark: "●" };
  const TITLE = { light: "다크 모드 켜기", dark: "다크 모드 끄기" };
  // <meta name="theme-color"> — 모바일 브라우저 크롬. css 토큰 --paper 와 같은 값.
  const THEME_COLOR = { light: "#f2ebdf", dark: "#14171c" };

  function isTheme(value) {
    return value === "light" || value === "dark";
  }

  /** 저장된 선택이 있으면 그것, 없으면 시스템 설정. theme-boot.html 과 동일한 규칙. */
  function resolveTheme(stored, prefersDark) {
    if (isTheme(stored)) return stored;
    return prefersDark ? "dark" : "light";
  }

  function nextTheme(current) {
    return current === "dark" ? "light" : "dark";
  }

  function readStored(storage) {
    try {
      const value = storage && storage.getItem(STORAGE_KEY);
      return isTheme(value) ? value : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(storage, theme) {
    try {
      if (storage) storage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* 프라이빗 모드 등 — 저장 실패해도 현재 세션 동작은 유지한다. */
    }
  }

  /** 버튼·문서 속성을 현재 테마에 맞춘다. 이름("dark")은 고정, 상태는 aria-pressed. */
  function syncControls(doc, theme) {
    const dark = theme === "dark";
    const buttons = doc.querySelectorAll("[data-theme-toggle]");
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("title", TITLE[theme]);
      const mark = button.querySelector("[data-theme-toggle-mark]");
      if (mark) mark.textContent = MARK[theme];
    }
    const meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
  }

  function applyTheme(doc, theme) {
    const element = doc.documentElement;
    element.setAttribute("data-theme", theme);
    element.style.colorScheme = theme;
    syncControls(doc, theme);
    doc.dispatchEvent(new CustomEvent(EVENT, { detail: { theme: theme } }));
  }

  function currentTheme(doc) {
    const value = doc.documentElement.getAttribute("data-theme");
    return isTheme(value) ? value : "light";
  }

  function mount(doc, win) {
    doc = doc || document;
    win = win || window;

    const storage = (function () {
      try { return win.localStorage; } catch (e) { return null; }
    })();
    const media = win.matchMedia ? win.matchMedia(DARK_QUERY) : null;

    applyTheme(doc, resolveTheme(readStored(storage), media ? media.matches : false));

    doc.addEventListener("click", function (event) {
      const button = event.target.closest && event.target.closest("[data-theme-toggle]");
      if (!button) return;
      const theme = nextTheme(currentTheme(doc));
      writeStored(storage, theme);
      applyTheme(doc, theme);
    });

    // 명시적 선택이 없는 동안에만 시스템 설정을 따라간다.
    if (media && media.addEventListener) {
      media.addEventListener("change", function (event) {
        if (readStored(storage)) return;
        applyTheme(doc, event.matches ? "dark" : "light");
      });
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    EVENT: EVENT,
    THEME_COLOR: THEME_COLOR,
    isTheme: isTheme,
    resolveTheme: resolveTheme,
    nextTheme: nextTheme,
    mount: mount,
  };
});
