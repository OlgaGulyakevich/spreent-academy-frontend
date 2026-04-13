/**
 * @fileoverview Header scroll progress bar.
 * Calculates document scroll percentage and writes it to CSS variable
 * `--scroll-progress` on `.header` element, so CSS can render
 * a visual indicator (bar width, gradient, etc.).
 */

/**
 * Initializes scroll progress bar. Attaches a single passive listener
 * on `window.scroll` wrapped in `requestAnimationFrame` for 60fps,
 * and updates state immediately on load.
 *
 * @example initScrollProgress();
 */
const initScrollProgress = () => {
  const header = document.querySelector('.header');
  if (!header) {
    return;
  }

  /**
   * Calculates scroll percentage (0-100) and updates CSS variable
   * `--scroll-progress` on header. Clamp prevents negative values
   * and exceeding 100% on overscroll (iOS bounce).
   */
  const updateProgress = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));

    header.style.setProperty('--scroll-progress', `${progress.toFixed(2)}%`);
  };

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateProgress);
  }, {
    passive: true,
  });

  // Initial state — in case page is loaded already scrolled
  updateProgress();
};

export { initScrollProgress };
