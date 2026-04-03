/**
 * Mobile menu toggle via burger button.
 * Uses aria-expanded on .burger — CSS :has() handles visual state.
 * Manages scroll-lock on body, closes on ESC, nav link click, and overlay click.
 *
 * @example initMobileMenu();
 */

const SCROLL_LOCK_CLASS = 'scroll-lock';

const initMobileMenu = () => {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.header__nav');

  if (!header || !burger || !nav) {
    return;
  }

  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';

  const openMenu = () => {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    document.body.classList.add(SCROLL_LOCK_CLASS);
  };

  const closeMenu = () => {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove(SCROLL_LOCK_CLASS);
  };

  const handleBurgerClick = () => {
    if (isOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleKeyDown = (evt) => {
    if (evt.key === 'Escape' && isOpen()) {
      closeMenu();
      burger.focus();
    }
  };

  const handleNavClick = (evt) => {
    if (evt.target.closest('.main-nav__link') && isOpen()) {
      closeMenu();
    }
  };

  const handleOverlayClick = (evt) => {
    if (!evt.target.closest('.header__container') && isOpen()) {
      closeMenu();
    }
  };

  burger.addEventListener('click', handleBurgerClick);
  document.addEventListener('keydown', handleKeyDown);
  nav.addEventListener('click', handleNavClick);
  header.addEventListener('click', handleOverlayClick);
};

export { initMobileMenu };
