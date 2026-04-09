import { initHeaderScroll } from './modules/header-scroll.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollProgress } from './modules/scroll-progress.js';

/**
 * Main window load handler—initializes all required modules.
 */
// Prevent scroll-to-top on placeholder links
document.addEventListener('click', (e) => {
  if (e.target.closest('a[href="#"]')) {
    e.preventDefault();
  }
});

window.addEventListener('load', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollProgress();
});
