import { initAboutParallax } from './modules/about-parallax.js';
import { initAboutRotate } from './modules/about-rotate.js';
import { initCounter } from './modules/counter.js';
import { initFormSubmit } from './modules/form-submit.js';
import { initFormValidation } from './modules/form-validation.js';
import { initHeaderScroll } from './modules/header-scroll.js';
import { initHeroParallax } from './modules/hero-parallax.js';
import { initMagneticButton } from './modules/magnetic-button.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';

// Enable :active pseudo-class on iOS Safari
// Without this listener, Safari may not trigger :active reliably after the first tap
document.addEventListener('touchstart', () => {}, true);

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
  initFormValidation();
  initFormSubmit();
  initHeaderScroll();
  initHeroParallax();
  initMagneticButton();
  initMobileMenu();
  initScrollProgress();
  initScrollReveal();
  initSmoothScroll();
});
