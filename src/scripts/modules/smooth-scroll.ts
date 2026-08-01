/**
 * @fileoverview Custom smooth scroll to anchors.
 *
 * Intercepts clicks on `a[href^="#"]` (except `href="#"`), cancels native
 * scroll and animates via `requestAnimationFrame` with `easeInOutQuart`
 * curve — soft start, cruise, soft arrival (feels like Lenis / native
 * browser smooth scroll). Duration scales with distance so short jumps
 * don't drag and long ones don't feel abrupt. If mobile menu is open
 * (`scroll-lock` on body) — scroll start is delayed to let menu close
 * animation play out. After scroll completes, focus moves to target
 * section (or first form field) for keyboard navigation.
 *
 * A11y / UX behavior:
 * - `prefers-reduced-motion: reduce` → instant scroll, no animation
 * - Manual scroll (wheel / touchmove) during animation → cancels it
 * - New click during active animation → cancels previous
 * - Already at target (distance === 0) → focus immediately, no rAF
 */

import { prefersReducedMotion } from "../utils/prefers-reduced-motion.js";

const MIN_DURATION = 900;
const MAX_DURATION = 1800;
const PX_PER_MS = 2.0;
const MOBILE_MENU_DELAY = 350;
const HEADER_OFFSET = 70;
const SCROLL_LOCK_CLASS = "scroll-lock";
const FOCUSABLE_SELECTOR =
  "a[href], button, input, select, textarea, [tabindex]";
const FIRST_FIELD_SELECTOR = 'input:not([type="hidden"]), textarea, select';

/**
 * Monotonic counter for active animations. Each `animateScroll` call
 * increments it and saves its own token; if during rAF the token
 * no longer matches the global one — a newer animation was started,
 * current one should cancel.
 */
let currentAnimationToken = 0;

/**
 * easeInOutQuart — smooth acceleration and deceleration.
 * Softer than cubic; feels close to native browser smooth scroll.
 * @param t - progress from 0 to 1
 * @returns eased progress
 */
const easeInOutQuart = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

/**
 * Calculates animation duration based on scroll distance, clamped to [MIN, MAX].
 * @param distance - absolute scroll distance in pixels
 * @returns duration in ms
 */
const getDuration = (distance: number): number =>
  Math.min(
    MAX_DURATION,
    Math.max(MIN_DURATION, Math.abs(distance) / PX_PER_MS),
  );

/**
 * Animates window scroll from current position to target Y.
 * Supports cancellation on manual user scroll (wheel/touchmove)
 * and when a new animation is started on top. Calls `onComplete`
 * only on successful finish (not on cancel).
 * @param targetY - target scroll position in pixels
 * @param onComplete - callback invoked on animation end
 */
const animateScroll = (targetY: number, onComplete?: () => void): void => {
  const startY = window.scrollY;
  const diff = targetY - startY;

  if (diff === 0) {
    if (onComplete) {
      onComplete();
    }
    return;
  }

  // Cancel previous animation by incrementing global token
  currentAnimationToken += 1;
  const myToken = currentAnimationToken;

  const duration = getDuration(diff);
  const startTime = performance.now();

  // Cancel on manual scroll
  let cancelledByUser = false;
  const handleManualScroll = (): void => {
    cancelledByUser = true;
  };
  window.addEventListener("wheel", handleManualScroll, {
    passive: true,
    once: true,
  });
  window.addEventListener("touchmove", handleManualScroll, {
    passive: true,
    once: true,
  });

  const cleanup = (): void => {
    window.removeEventListener("wheel", handleManualScroll);
    window.removeEventListener("touchmove", handleManualScroll);
  };

  const step = (currentTime: number): void => {
    if (myToken !== currentAnimationToken || cancelledByUser) {
      cleanup();
      return;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuart(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    cleanup();
    if (onComplete) {
      onComplete();
    }
  };

  requestAnimationFrame(step);
};

/**
 * Moves focus to target element after scroll for keyboard
 * navigation (WCAG 2.4.3 Focus Order).
 *
 * Focus target logic:
 * 1. If target is a form or contains `<form>` → focus first input field.
 * 2. Otherwise → focus target itself. If not natively focusable,
 *    temporarily adds `tabindex="-1"` and removes it on blur.
 * @param target - element scrolled to
 */
const focusTarget = (target: HTMLElement): void => {
  const form =
    target.tagName === "FORM" ? target : target.querySelector("form");
  const firstField =
    form && form.querySelector<HTMLElement>(FIRST_FIELD_SELECTOR);

  if (firstField) {
    firstField.focus({ preventScroll: true });
    return;
  }

  const isFocusable = target.matches(FOCUSABLE_SELECTOR);

  if (!isFocusable) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("tabindex");
      },
      { once: true },
    );
  }

  target.focus({ preventScroll: true });
};

/**
 * Scrolls to target position respecting user preferences.
 * With `prefers-reduced-motion: reduce` — instant scroll,
 * otherwise — animated via `animateScroll`.
 * @param targetY - target Y position in pixels
 * @param target - element to focus after scroll
 */
const scrollToTarget = (targetY: number, target: HTMLElement): void => {
  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    focusTarget(target);
    return;
  }

  animateScroll(targetY, () => focusTarget(target));
};

/**
 * Anchor click handler. Calculates target Y accounting for header
 * height, delays start if mobile menu is open, then triggers scroll
 * (animated or instant depending on reduced-motion).
 * @param evt - the click event
 */
const handleAnchorClick = (evt: MouseEvent): void => {
  // evt.target is `EventTarget | null` (very broad); narrow to Element to use `.closest()`.
  if (!(evt.target instanceof Element)) {
    return;
  }

  const link = evt.target.closest('a[href^="#"]:not([href="#"])');
  if (!link) {
    return;
  }

  const href = link.getAttribute("href"); // getAttribute → `string | null`
  if (!href) {
    return;
  }

  const targetId = href.slice(1);
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  evt.preventDefault();

  const targetY =
    target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  const wasMenuOpen = document.body.classList.contains(SCROLL_LOCK_CLASS);
  const delay = wasMenuOpen ? MOBILE_MENU_DELAY : 0;

  setTimeout(() => scrollToTarget(targetY, target), delay);
};

/**
 * Initializes smooth scroll. Attaches a single listener on `document`
 * in capture phase (delegation). Capture phase is needed to read
 * `scroll-lock` on body BEFORE `mobile-menu.ts` removes it in
 * bubble phase — otherwise `wasMenuOpen` would always be `false`
 * on `.header__cta` click from open menu, and `MOBILE_MENU_DELAY`
 * wouldn't apply.
 *
 * Delegation: one handler instead of N per link — follows CTS-JS-Б26
 * (minimal handlers), plus works with dynamically added links.
 *
 * @example initSmoothScroll();
 */
const initSmoothScroll = (): void => {
  document.addEventListener("click", handleAnchorClick, true);
};

export { initSmoothScroll };
