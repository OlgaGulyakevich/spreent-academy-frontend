/**
 * @fileoverview About Parallax — scroll-driven depth effect on about cards.
 * Teachers (lime) drifts down slowly, skills/knowledge rise at different speeds.
 * Desktop only (disabled below 1024px). Starts when section enters viewport.
 * Uses CSS `translate` property (not `transform`) to avoid conflicts.
 * @module about-parallax
 */

import { lerp } from "../utils/lerp.js";
import { prefersReducedMotion } from "../utils/prefers-reduced-motion.js";

const CARD_SELECTORS = [
  { selector: ".about__card--teachers", speed: 0.15 },
  { selector: ".about__card--skills", speed: 0.04 },
  { selector: ".about__card--knowledge", speed: 0.02 },
];

const SECTION_SELECTOR = ".about";
const MOBILE_BREAKPOINT = 1024;
const LERP_FACTOR = 0.08;

/** One parallax card: its element, drift speed, and animated Y position. */
type Card = {
  el: HTMLElement;
  speed: number;
  currentY: number;
  targetY: number;
};

/**
 * Initializes about cards parallax effect.
 */
const initAboutParallax = (): void => {
  if (prefersReducedMotion()) {
    return;
  }

  const section = document.querySelector(SECTION_SELECTOR);

  if (!section) {
    return;
  }

  // .filter(Boolean) does NOT narrow out null in TS — a type predicate (`card is Card`) does.
  const cards: Card[] = CARD_SELECTORS.map(({ selector, speed }) => {
    const el = document.querySelector<HTMLElement>(selector);

    return el ? { el, speed, currentY: 0, targetY: 0 } : null;
  }).filter((card): card is Card => card !== null);

  if (!cards.length) {
    return;
  }

  let ticking = false;

  const animate = (): void => {
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

  const startAnimation = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  };

  const resetCards = (): void => {
    cards.forEach((card) => {
      card.currentY = 0;
      card.targetY = 0;
      card.el.style.translate = "";
    });
    ticking = false;
  };

  const handleScroll = (): void => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      resetCards();
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrolled = Math.max(0, window.innerHeight - rect.top);

    cards.forEach((card) => {
      card.targetY = scrolled * card.speed;
    });

    startAnimation();
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
};

export { initAboutParallax };
