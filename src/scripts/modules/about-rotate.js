/**
 * @fileoverview About Circle Rotate — rotates spreent logo in sync with scroll.
 * Scroll down → clockwise, scroll up → counter-clockwise.
 * Uses requestAnimationFrame for throttling.
 * JS writes the angle to the CSS custom property `--rotation`;
 * the transform itself lives in about.scss (data/presentation split).
 * Respects prefers-reduced-motion — skips the scroll loop entirely
 * (about.scss also neutralizes the transform under reduce).
 * @module about-rotate
 */

const SELECTOR = '.about__card-logo img';
const ROTATION_SPEED = 0.15;

/**
 * Initializes scroll-driven rotation on the about section circle logo.
 */
const initAboutRotate = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  const image = document.querySelector(SELECTOR);

  if (!image) {
    return;
  }

  let currentRotation = 0;
  let lastScrollY = window.scrollY;
  let ticking = false;

  const handleScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    requestAnimationFrame(() => {
      const delta = window.scrollY - lastScrollY;

      currentRotation += delta * ROTATION_SPEED;
      lastScrollY = window.scrollY;
      image.style.setProperty('--rotation', `${currentRotation}deg`);

      ticking = false;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};

export { initAboutRotate };
