/**
 * @fileoverview Shimmer CTA — a one-time highlight sweep across the form submit
 * button. Fires only once the button is fully in view AND the user has dwelled on
 * the form (settled, considering) — a gentle nudge toward the decision, not a
 * reaction to the scroll. Cancelled if the user scrolls away before it fires, or
 * if they start filling the form (someone already engaging needs no nudge).
 * Progressive enhancement: without JS the button works fully, just without the
 * glint. Respects prefers-reduced-motion.
 * @module shimmer-cta
 */

import { prefersReducedMotion } from '../utils/prefers-reduced-motion.js';

const BUTTON_SELECTOR = '.footer__form-btn';
const SHIMMER_CLASS = 'is-shimmer';
const DWELL_DELAY_MS = 2000; // wait until the user has settled on the form and is deciding
const OBSERVER_OPTIONS = { threshold: 1 };

/**
 * Plays a single shimmer sweep on the submit button once it is fully in view and
 * the user has dwelled without engaging. No-op under reduced-motion or if the
 * button is absent.
 */
const initShimmerCta = (): void => {
  if (prefersReducedMotion()) {
    return;
  }

  const button = document.querySelector(BUTTON_SELECTOR);

  if (!button) {
    return;
  }

  let dwellTimer = 0; // window.setTimeout id (browser → number); 0 is a safe no-op sentinel
  let done = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (done) {
        return;
      }

      if (entry.isIntersecting) {
        // Fully in view — start the dwell timer; the sweep fires only if the user stays.
        dwellTimer = window.setTimeout(() => {
          button.classList.add(SHIMMER_CLASS);
          done = true;
          observer.disconnect();
        }, DWELL_DELAY_MS);
        return;
      }

      // Scrolled away before dwelling → cancel; a later re-entry starts fresh.
      window.clearTimeout(dwellTimer);
    });
  }, OBSERVER_OPTIONS);

  observer.observe(button);

  // Cancel-on-engage: someone who starts filling the form is already acting and
  // needs no nudge — stop before the sweep can fire.
  const form = button.closest('form');

  if (form) {
    form.addEventListener(
      'focusin',
      () => {
        if (done) {
          return;
        }

        done = true;
        window.clearTimeout(dwellTimer);
        observer.disconnect();
      },
      { once: true },
    );
  }
};

export { initShimmerCta };
