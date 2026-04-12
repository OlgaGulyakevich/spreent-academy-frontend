/**
 * About Parallax — scroll-driven depth effect on about cards.
 * Teachers (lime) drifts down slowly, skills/knowledge rise at different speeds.
 * Desktop only (disabled below 1024px). Starts when section enters viewport.
 * Uses CSS `translate` property (not `transform`) to avoid conflicts.
 * @module about-parallax
 */

const CARD_SELECTORS = [
  { selector: '.about__card--teachers', speed: 0.03 },
  { selector: '.about__card--skills', speed: -0.04 },
  { selector: '.about__card--knowledge', speed: -0.06 },
];

const SECTION_SELECTOR = '.about';
const MOBILE_BREAKPOINT = 1024;
const LERP_FACTOR = 0.08;

/**
 * Linear interpolation.
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Smoothing (0–1)
 * @returns {number}
 */
const lerp = (current, target, factor) => current + (target - current) * factor;

/**
 * Initializes about cards parallax effect.
 */
const initAboutParallax = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  const section = document.querySelector(SECTION_SELECTOR);

  if (!section) {
    return;
  }

  const cards = CARD_SELECTORS.map(({ selector, speed }) => {
    const el = document.querySelector(selector);

    return el ? { el, speed, currentY: 0, targetY: 0 } : null;
  }).filter(Boolean);

  if (!cards.length) {
    return;
  }

  let ticking = false;

  const animate = () => {
    let needsUpdate = false;

    cards.forEach((card) => {
      if (card.speed === 0) {
        return;
      }

      card.currentY = lerp(card.currentY, card.targetY, LERP_FACTOR);

      if (Math.abs(card.currentY - card.targetY) > 0.1) {
        needsUpdate = true;
      }

      card.el.style.translate = `0 ${card.currentY}px`;
    });

    if (needsUpdate) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  };

  const startAnimation = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  };

  const handleScroll = () => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrolled = window.innerHeight - rect.top;

    if (scrolled < 0) {
      return;
    }

    cards.forEach((card) => {
      card.targetY = scrolled * card.speed;
    });

    startAnimation();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};

export { initAboutParallax };
