/**
 * @fileoverview Magnetic Button — CTA pulls toward cursor when nearby.
 * Desktop only (hover: hover). Activates within ATTRACT_RADIUS;
 * pull peaks at half the radius (~12px with PULL_FACTOR 0.4) and
 * fades to 0 both at the button center and at the radius edge.
 * JS writes the offset to CSS custom
 * properties `--magnetic-x` / `--magnetic-y`; the `translate` itself
 * lives in hero.scss (data/presentation split, composes with
 * `transform: scale()` on :active).
 * @module magnetic-button
 */

import { lerp } from '../utils/lerp.js';
import { prefersReducedMotion } from '../utils/prefers-reduced-motion.js';

const BUTTON_SELECTOR = '.hero__btn';
const ATTRACT_RADIUS = 120;
const PULL_FACTOR = 0.4;
const LERP_FACTOR = 0.15;

/**
 * Initializes magnetic button effect on hero CTA.
 */
const initMagneticButton = () => {
  const hasHover = window.matchMedia('(hover: hover)').matches;

  if (prefersReducedMotion() || !hasHover) {
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
      button.style.setProperty('--magnetic-x', `${currentX}px`);
      button.style.setProperty('--magnetic-y', `${currentY}px`);
      requestAnimationFrame(animate);
    } else if (targetX === 0 && targetY === 0) {
      button.style.removeProperty('--magnetic-x');
      button.style.removeProperty('--magnetic-y');
      ticking = false;
    } else {
      button.style.setProperty('--magnetic-x', `${targetX}px`);
      button.style.setProperty('--magnetic-y', `${targetY}px`);
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

      targetX = distX * strength * PULL_FACTOR;
      targetY = distY * strength * PULL_FACTOR;
    } else {
      targetX = 0;
      targetY = 0;
    }

    startAnimation();
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
};

export { initMagneticButton };
