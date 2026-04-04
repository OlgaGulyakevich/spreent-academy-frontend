import { initHeaderScroll } from './modules/header-scroll.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollProgress } from './modules/scroll-progress.js';

/**
 * Main window load handler—initializes all required modules.
 */
window.addEventListener('load', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollProgress();
});
