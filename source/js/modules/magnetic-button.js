/**
 * @fileoverview Magnetic Button — CTA pulls toward cursor when nearby.
 * Desktop only (hover: hover). Activates within ATTRACT_RADIUS,
 * shifts up to MAX_OFFSET px. Uses CSS `translate` to avoid
 * conflicts with existing `transform` on .hero__btn.
 * @module magnetic-button
 */

const BUTTON_SELECTOR = '.hero__btn';
const ATTRACT_RADIUS = 100;
const MAX_OFFSET = 15;
const LERP_FACTOR = 0.15;

/**
 * Linear interpolation.
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Smoothing (0–1)
 * @returns {number}
 */
const lerp = (current, target, factor) => current + (target - current) * factor;

/**
 * Initializes magnetic button effect on hero CTA.
 */
const initMagneticButton = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  if (prefersReducedMotion || !hasHover) {
    return;
  }

  const button = document.querySelector(BUTTON_SELECTOR);

  if (!button) {
    return;
  }

  button.addEventListener('animationend', () => {
    button.style.animation = 'none';
  }, { once: true });

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let ticking = false;

  const animate = () => {
    currentX = lerp(currentX, targetX, LERP_FACTOR);
    currentY = lerp(currentY, targetY, LERP_FACTOR);

    if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
      button.style.translate = `${currentX}px ${currentY}px`;
      requestAnimationFrame(animate);
    } else {
      button.style.translate = targetX === 0 && targetY === 0 ? '' : `${targetX}px ${targetY}px`;
      ticking = false;
    }
  };

  const startAnimation = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  };

  const handleMouseMove = (e) => {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < ATTRACT_RADIUS) {
      const strength = 1 - distance / ATTRACT_RADIUS;

      targetX = distX * strength * (MAX_OFFSET / ATTRACT_RADIUS);
      targetY = distY * strength * (MAX_OFFSET / ATTRACT_RADIUS);
    } else {
      targetX = 0;
      targetY = 0;
    }

    startAnimation();
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
};

export { initMagneticButton };
