/**
 * Header scroll effect — adds .header--scrolled class on scroll.
 * CSS handles backdrop-filter: blur() + background-color transition.
 *
 * @example initHeaderScroll();
 */

const SCROLL_THRESHOLD = 40;
const HEADER_SCROLLED_CLASS = 'header--scrolled';

const initHeaderScroll = () => {
  const header = document.querySelector('.header');

  if (!header) {
    return;
  }

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add(HEADER_SCROLLED_CLASS);
    } else {
      header.classList.remove(HEADER_SCROLLED_CLASS);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Check initial state (page might be loaded already scrolled)
  handleScroll();
};

export { initHeaderScroll };
