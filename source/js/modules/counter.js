/**
 * Counter — count-up animation for community factoid numbers.
 * Triggers once when .community section enters viewport.
 * "Более 100" stays static; "78%" and "89%" animate from 0.
 * @module counter
 */

const FACTOIDS_SELECTOR = '.community__factoids';
const NUMBER_SELECTOR = '.community__factoid-number';
const DURATION_MS = 1200;
const STAGGER_MS = 250;
const OBSERVER_THRESHOLD = 0.5;

/**
 * Easing function — ease-out cubic for decelerating count.
 * @param {number} t - Progress 0..1
 * @returns {number} Eased value 0..1
 */
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/**
 * Parses target value and suffix from text content.
 * @param {string} text - e.g. "78%" or "89%"
 * @returns {{ value: number, suffix: string } | null}
 */
const parseTarget = (text) => {
  const match = text.trim().match(/^(\d+)(.*)$/);

  if (!match) {
    return null;
  }

  return { value: parseInt(match[1], 10), suffix: match[2] };
};

/**
 * Animates a single counter element from 0 to target value.
 * Reads target from data attributes set during init.
 * @param {Element} el - Element with data-counter-value and data-counter-suffix
 */
const animateCounter = (el) => {
  const value = parseInt(el.dataset.counterValue, 10);
  const suffix = el.dataset.counterSuffix;

  if (!value) {
    return;
  }

  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1);
    const easedProgress = easeOutCubic(progress);
    const current = Math.round(easedProgress * value);

    el.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

/**
 * Initializes counter animation. Observes .community__factoids;
 * on first intersection, animates factoid numbers with stagger.
 */
const initCounter = () => {
  const factoids = document.querySelector(FACTOIDS_SELECTOR);

  if (!factoids) {
    return;
  }

  const numbers = factoids.querySelectorAll(NUMBER_SELECTOR);

  if (!numbers.length) {
    return;
  }

  numbers.forEach((el) => {
    const parsed = parseTarget(el.textContent);

    if (parsed) {
      el.textContent = `0${parsed.suffix}`;
      el.dataset.counterTarget = el.textContent;
      el.dataset.counterValue = String(parsed.value);
      el.dataset.counterSuffix = parsed.suffix;
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      numbers.forEach((el, index) => {
        setTimeout(() => animateCounter(el), index * STAGGER_MS);
      });

      observer.unobserve(factoids);
    });
  }, { threshold: OBSERVER_THRESHOLD });

  observer.observe(factoids);
};

export { initCounter };
