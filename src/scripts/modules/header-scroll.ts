/**
 * @fileoverview Header scroll effect — toggles `.header--scrolled` class
 * when page is scrolled past `SCROLL_THRESHOLD` px.
 * CSS handles `background-color` and `backdrop-filter: blur()` transition
 * via this class.
 */

const SCROLL_THRESHOLD = 40;
const HEADER_SCROLLED_CLASS = "header--scrolled";

/**
 * Initializes the header scroll effect. Attaches a single passive listener
 * on `window.scroll` and checks initial state (page may already be scrolled
 * after reload or anchor navigation).
 *
 * @example initHeaderScroll();
 */
const initHeaderScroll = (): void => {
  // Only .classList is used here → a bare Element is enough (no <HTMLElement> generic needed).
  const header = document.querySelector(".header");

  if (!header) {
    return;
  }

  /** Toggles `.header--scrolled` based on current `window.scrollY`. */
  const handleScroll = (): void => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add(HEADER_SCROLLED_CLASS);
      return;
    }
    header.classList.remove(HEADER_SCROLLED_CLASS);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Initial state — in case the page is loaded already scrolled
  handleScroll();
};

export { initHeaderScroll };
