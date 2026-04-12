import { initAboutRotate } from './modules/about-rotate.js';
import { initCounter } from './modules/counter.js';
import { initHeaderScroll } from './modules/header-scroll.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';

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
  initAboutRotate();
  initCounter();
  initHeaderScroll();
  initMobileMenu();
  initScrollProgress();
  initScrollReveal();
  initSmoothScroll();
});
