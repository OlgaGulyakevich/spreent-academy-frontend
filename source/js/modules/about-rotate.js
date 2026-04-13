/**
 * @fileoverview About Circle Rotate — rotates spreent logo in sync with scroll.
 * Scroll down → clockwise, scroll up → counter-clockwise.
 * Uses requestAnimationFrame for throttling.
 * @module about-rotate
 */

const SELECTOR = '.about__card-logo img';
const ROTATION_SPEED = 0.15;

/**
 * Initializes scroll-driven rotation on the about section circle logo.
 */
const initAboutRotate = () => {
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
      image.style.transform = `rotate(${currentRotation}deg)`;

      ticking = false;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};

export { initAboutRotate };
