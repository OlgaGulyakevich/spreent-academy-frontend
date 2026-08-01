/**
 * @fileoverview Mobile menu — toggles overlay on burger click.
 *
 * Uses `aria-expanded` on `.burger` as single source of truth;
 * CSS `:has()` renders visual state from this attribute.
 * Manages `.scroll-lock` on `<body>` to prevent background scroll
 * while menu is open. Closes on ESC, nav link click, header CTA click,
 * and overlay click (outside header area).
 */

const SCROLL_LOCK_CLASS = "scroll-lock";
const LABEL_BURGER_OPEN = "Open menu";
const LABEL_BURGER_CLOSE = "Close menu";
const MENU_LINKS_SELECTOR = ".main-nav__link, .header__cta";
const FOCUSABLE_IN_HEADER_SELECTOR = "a[href], button";

/**
 * Initializes mobile menu. Attaches listeners on burger, document
 * (ESC, overlay click) and header (close on nav link / CTA click).
 * All handlers are added once (CTS-JS-Б26).
 *
 * @example initMobileMenu();
 */
const initMobileMenu = (): void => {
  // HTMLElement: burger needs .focus(), header receives a typed 'click' listener.
  const header = document.querySelector<HTMLElement>(".header");
  const burger = document.querySelector<HTMLElement>(".burger");
  const nav = document.querySelector(".header__nav");

  if (!header || !burger || !nav) {
    return;
  }

  /**
   * Checks whether the menu is currently open.
   * @returns `true` if `aria-expanded="true"` on burger
   */
  const isOpen = (): boolean => burger.getAttribute("aria-expanded") === "true";

  /**
   * Opens menu: updates ARIA attributes on burger, locks background
   * scroll via `.scroll-lock` on body.
   */
  const openMenu = (): void => {
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", LABEL_BURGER_CLOSE);
    document.body.classList.add(SCROLL_LOCK_CLASS);
  };

  /**
   * Closes menu: resets ARIA attributes and removes `.scroll-lock`.
   */
  const closeMenu = (): void => {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", LABEL_BURGER_OPEN);
    document.body.classList.remove(SCROLL_LOCK_CLASS);
  };

  /** Burger click handler — toggles menu state. */
  const handleBurgerClick = (): void => {
    if (isOpen()) {
      closeMenu();
      return;
    }
    openMenu();
  };

  /**
   * Keyboard handler for open menu:
   * - ESC → closes menu and returns focus to burger (WCAG 2.1.2)
   * - Tab → focus trap: cycles focus among focusable elements
   *   inside `.header` (logo, nav links, CTA, burger).
   *   Prevents focus from reaching hidden elements under overlay.
   *   WCAG 2.4.3 Focus Order.
   * @param evt - the keydown event
   */
  const handleKeyDown = (evt: KeyboardEvent): void => {
    if (!isOpen()) {
      return;
    }

    if (evt.key === "Escape") {
      closeMenu();
      burger.focus();
      return;
    }

    if (evt.key !== "Tab") {
      return;
    }

    const focusables = header.querySelectorAll<HTMLElement>(
      FOCUSABLE_IN_HEADER_SELECTOR,
    );
    if (!focusables.length) {
      return;
    }

    // noUncheckedIndexedAccess: focusables[i] is `HTMLElement | undefined` even after the
    // length check — guard both ends before .focus().
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) {
      return;
    }

    if (evt.shiftKey && document.activeElement === first) {
      evt.preventDefault();
      last.focus();
      return;
    }

    if (!evt.shiftKey && document.activeElement === last) {
      evt.preventDefault();
      first.focus();
    }
  };

  /**
   * Header link click handler. Closes menu on nav link or CTA click
   * so the user sees the target section after anchor navigation.
   * @param evt - the click event
   */
  const handleHeaderLinkClick = (evt: MouseEvent): void => {
    if (!(evt.target instanceof Element)) {
      return;
    }

    const link = evt.target.closest(MENU_LINKS_SELECTOR);
    if (link && isOpen()) {
      closeMenu();
    }
  };

  /**
   * Overlay click handler. Closes menu if click was outside
   * header area (i.e. on the dimmed overlay region).
   * @param evt - the click event
   */
  const handleOverlayClick = (evt: MouseEvent): void => {
    if (!(evt.target instanceof Element)) {
      return;
    }

    if (!evt.target.closest(".header") && isOpen()) {
      closeMenu();
    }
  };

  burger.addEventListener("click", handleBurgerClick);
  document.addEventListener("keydown", handleKeyDown);
  header.addEventListener("click", handleHeaderLinkClick);
  document.addEventListener("click", handleOverlayClick);
};

export { initMobileMenu };
