/**
 * Initializes the header scroll progress bar.
 * Calculates the total document scroll percentage and sets it as
 * the --scroll-progress CSS variable on the header element.
 *
 * @example initScrollProgress();
 */
export const initScrollProgress = () => {
  const header = document.querySelector('.header');
  if (!header) {
    return;
  }

  /**
   * Updates the scroll progress percentage.
   * Runs within requestAnimationFrame for optimal 60fps performance.
   */
  const updateProgress = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));

    header.style.setProperty('--scroll-progress', `${progress.toFixed(2)}%`);
  };

  // Passive listener for optimized scroll performance
  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateProgress);
  }, {
    passive: true,
  });

  // Initial call to set state on load
  updateProgress();
};
