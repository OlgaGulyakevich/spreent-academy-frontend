/**
 * @fileoverview Header scroll progress bar.
 * Calculates document scroll ratio (0–1) and writes it to CSS variable
 * `--scroll-progress` on `.header`, so CSS scales the bar via
 * `transform: scaleX(var(--scroll-progress))` (GPU, no layout).
 */

/**
 * Initializes scroll progress bar. Attaches a single passive listener
 * on `window.scroll` wrapped in `requestAnimationFrame` for 60fps,
 * and updates state immediately on load.
 *
 * @example initScrollProgress();
 */
const initScrollProgress = (): void => {
  const header = document.querySelector<HTMLElement>(".header");
  if (!header) {
    return;
  }

  /**
   * Calculates scroll ratio (0-1) and updates CSS variable
   * `--scroll-progress` on header. Clamp prevents negative values
   * and exceeding 1 on overscroll (iOS bounce); guards a non-scrollable
   * page (scrollHeight 0 → avoids NaN).
   */
  const updateProgress = (): void => {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    const progress = Math.min(1, Math.max(0, ratio));

    header.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  window.addEventListener(
    "scroll",
    () => {
      requestAnimationFrame(updateProgress);
    },
    {
      passive: true,
    },
  );

  // Initial state — in case page is loaded already scrolled
  updateProgress();
};

export { initScrollProgress };
