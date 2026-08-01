/**
 * @fileoverview Counter — count-up animation for community factoid numbers.
 * Observes .community__factoids (threshold 0.5); on first intersection,
 * animates "78%" and "89%" from 0 with 250ms stagger between them.
 * Initial "0%" set at init time to avoid flash on reload.
 * Respects prefers-reduced-motion — skips the count-up, leaves final values.
 * @module counter
 */

import { prefersReducedMotion } from "../utils/prefers-reduced-motion.js";

const FACTOIDS_SELECTOR = ".community__factoids";
const NUMBER_SELECTOR = ".community__factoid-number";
const DURATION_MS = 1200;
const STAGGER_MS = 250;
const OBSERVER_THRESHOLD = 0.5;

/** A parsed factoid target: the number and its trailing suffix (e.g. "%"). */
type ParsedTarget = {
  value: number;
  suffix: string;
};

/**
 * Easing function — ease-out cubic for a decelerating count.
 * @param t - Progress 0..1
 * @returns Eased value 0..1
 */
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/**
 * Parses target value and suffix from text content.
 * @param text - e.g. "78%" or "89%"
 * @returns the value + suffix, or null if it doesn't start with a number
 */
const parseTarget = (text: string): ParsedTarget | null => {
  const match = text.trim().match(/^(\d+)(.*)$/);

  if (!match) {
    return null;
  }

  // Under noUncheckedIndexedAccess match[1]/[2] are `string | undefined`; the regex
  // guarantees both groups when it matched, so `?? ''` just satisfies the compiler.
  return { value: parseInt(match[1] ?? "", 10), suffix: match[2] ?? "" };
};

/**
 * Animates a single counter element from 0 to its target value.
 * Reads the target from the data attributes set during init.
 * @param el - Element carrying data-counter-value and data-counter-suffix
 */
const animateCounter = (el: HTMLElement): void => {
  const raw = el.dataset.counterValue; // DOMStringMap → `string | undefined`
  const suffix = el.dataset.counterSuffix ?? "";

  if (!raw) {
    return;
  }

  const value = parseInt(raw, 10);

  if (!value) {
    return;
  }

  const startTime = performance.now();

  const tick = (now: number): void => {
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
 * on first intersection, animates factoid numbers with a stagger.
 */
const initCounter = (): void => {
  if (prefersReducedMotion()) {
    return;
  }

  const factoids = document.querySelector(FACTOIDS_SELECTOR);

  if (!factoids) {
    return;
  }

  // Generic on querySelectorAll → NodeListOf<HTMLElement> (so .dataset / .textContent are typed).
  const numbers = factoids.querySelectorAll<HTMLElement>(NUMBER_SELECTOR);

  if (!numbers.length) {
    return;
  }

  numbers.forEach((el) => {
    const parsed = parseTarget(el.textContent ?? ""); // textContent is `string | null`

    if (parsed) {
      const zeroed = `0${parsed.suffix}`;
      el.textContent = zeroed;
      el.dataset.counterTarget = zeroed;
      el.dataset.counterValue = String(parsed.value);
      el.dataset.counterSuffix = parsed.suffix;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        numbers.forEach((el, index) => {
          setTimeout(() => animateCounter(el), index * STAGGER_MS);
        });

        observer.unobserve(factoids);
      });
    },
    { threshold: OBSERVER_THRESHOLD },
  );

  observer.observe(factoids);
};

export { initCounter };
