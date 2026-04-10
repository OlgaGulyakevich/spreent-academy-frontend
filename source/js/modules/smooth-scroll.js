/**
 * Smooth scroll to anchor targets with custom duration and easing.
 *
 * Intercepts clicks on anchor links (`a[href^="#"]` except `href="#"`),
 * cancels native scroll and animates via requestAnimationFrame using
 * easeInOutQuart — soft acceleration, cruise, soft deceleration (feels
 * like Lenis / native browser smooth scroll). Duration scales with
 * distance so short jumps don't drag and long ones don't feel thrown.
 * If mobile menu is open (`scroll-lock` on body), delays scroll start
 * so the menu close animation can finish visually.
 *
 * @example initSmoothScroll();
 */

const MIN_DURATION = 900;
const MAX_DURATION = 1800;
const PX_PER_MS = 2.0;
const MOBILE_MENU_DELAY = 350;
const HEADER_OFFSET = 70;
const SCROLL_LOCK_CLASS = 'scroll-lock';

/**
 * easeInOutQuart — gentle acceleration and deceleration.
 * Softer start than cubic; matches the feel of native browser smooth scroll.
 *
 * @param {number} t — progress from 0 to 1
 * @returns {number} eased progress
 */
const easeInOutQuart = (t) =>
  (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

/**
 * Calculates duration based on scroll distance, clamped to [MIN, MAX].
 *
 * @param {number} distance — absolute scroll distance in pixels
 * @returns {number} duration in ms
 */
const getDuration = (distance) =>
  Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(distance) / PX_PER_MS));

/**
 * Animates window scroll from current position to target Y.
 *
 * @param {number} targetY — target scroll position in pixels
 */
const animateScroll = (targetY) => {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const duration = getDuration(diff);
  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuart(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

/**
 * Click handler for anchor links. Calculates target Y with header offset,
 * delays if mobile menu is open, then runs the animated scroll.
 *
 * @param {MouseEvent} evt
 */
const handleAnchorClick = (evt) => {
  const link = evt.target.closest('a[href^="#"]:not([href="#"])');
  if (!link) {
    return;
  }

  const targetId = link.getAttribute('href').slice(1);
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  evt.preventDefault();

  const targetY = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  const wasMenuOpen = document.body.classList.contains(SCROLL_LOCK_CLASS);
  const delay = wasMenuOpen ? MOBILE_MENU_DELAY : 0;

  setTimeout(() => animateScroll(targetY), delay);
};

const initSmoothScroll = () => {
  // Capture phase: нужно прочитать scroll-lock на body ДО того, как mobile-menu.js
  // успеет снять класс в bubble-фазе. Иначе wasMenuOpen всегда будет false на
  // клике по .header__cta из открытого мобильного меню, и задержка 350ms
  // (MOBILE_MENU_DELAY) не применится — скролл стартует раньше, чем отыграет
  // анимация закрытия меню.
  document.addEventListener('click', handleAnchorClick, true);
};

export { initSmoothScroll };
