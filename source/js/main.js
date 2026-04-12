import { initAboutParallax } from './modules/about-parallax.js';
import { initAboutRotate } from './modules/about-rotate.js';
import { initCounter } from './modules/counter.js';
import { initHeaderScroll } from './modules/header-scroll.js';
import { initHeroParallax } from './modules/hero-parallax.js';
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
  initAboutParallax();
  initAboutRotate();
  initCounter();
  initHeaderScroll();
  initHeroParallax();
  initMobileMenu();
  initScrollProgress();
  initScrollReveal();
  initSmoothScroll();
});
