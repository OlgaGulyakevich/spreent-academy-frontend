/**
 * Scroll Reveal — shows elements on scroll via IntersectionObserver.
 *
 * Two modes:
 * 1. Standalone: each [data-reveal="true"] is observed individually.
 * 2. Group cascade: parent with [data-reveal-stagger="N"] is observed once,
 *    all children [data-reveal="true"] inside reveal together with stagger delays.
 *
 * Animation variants (via data-reveal-type):
 * - default: translateY(20px→0) + opacity(0→1)
 * - "scale": scale(0→1) + opacity(0→1)
 *
 * Progressive enhancement: without JS elements stay visible.
 * @module scroll-reveal
 */

const SELECTORS = {
  REVEAL: '[data-reveal="true"]',
  STAGGER: '[data-reveal-stagger]',
};

const CLASSES = {
  INIT: 'reveal-init',
  REVEALED: 'is-revealed',
};

const OBSERVER_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
};

const DEFAULT_STAGGER_MS = 120;
const MOBILE_BREAKPOINT = 1024;

/**
 * Reveals a single element — applies delay and adds revealed class.
 * @param {Element} el - Element to reveal
 */
const revealElement = (el) => {
  const delay = parseInt(el.dataset.revealDelay, 10) || 0;

  if (delay > 0) {
    el.style.transitionDelay = `${delay}ms`;
  }

  el.classList.add(CLASSES.REVEALED);
};

/**
 * Sets up group cascade reveals. Parent [data-reveal-stagger] is observed;
 * when it enters viewport, all children reveal with stagger delays.
 * Children are marked so they skip individual observation.
 * @param {IntersectionObserver} _unused - Not used, groups create own observers
 */
const initGroupReveals = () => {
  const parents = document.querySelectorAll(SELECTORS.STAGGER);

  parents.forEach((parent) => {
    const children = parent.querySelectorAll(SELECTORS.REVEAL);

    if (!children.length) {
      return;
    }

    const step = parseInt(parent.dataset.revealStagger, 10) || DEFAULT_STAGGER_MS;

    children.forEach((child, index) => {
      if (!child.dataset.revealDelay) {
        child.dataset.revealDelay = String(index * step);
      }
      child.dataset.revealGroup = 'true';
      child.classList.add(CLASSES.INIT);
    });

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const mobileThreshold = parseFloat(parent.dataset.revealThresholdMobile);
    const desktopThreshold = parseFloat(parent.dataset.revealThreshold);
    const threshold = (isMobile && mobileThreshold) || desktopThreshold || OBSERVER_OPTIONS.threshold;

    const groupObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        children.forEach(revealElement);
        groupObserver.unobserve(parent);
      });
    }, { ...OBSERVER_OPTIONS, threshold });

    groupObserver.observe(parent);
  });
};

/**
 * Handles intersection for standalone (non-group) elements.
 * @param {IntersectionObserverEntry[]} entries
 * @param {IntersectionObserver} observer
 */
const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    revealElement(entry.target);
    observer.unobserve(entry.target);
  });
};

/**
 * Initializes scroll reveal for all [data-reveal="true"] elements.
 * Respects prefers-reduced-motion — skips animation entirely.
 */
const initScrollReveal = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  initGroupReveals();

  const elements = document.querySelectorAll(SELECTORS.REVEAL);

  if (!elements.length) {
    return;
  }

  const observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

  elements.forEach((el) => {
    if (el.dataset.revealGroup) {
      return;
    }

    el.classList.add(CLASSES.INIT);
    observer.observe(el);
  });
};

export { initScrollReveal };
