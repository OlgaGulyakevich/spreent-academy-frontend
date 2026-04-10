/**
 * @fileoverview Мобильное меню — переключение оверлея по клику на бургер.
 *
 * Использует `aria-expanded` на `.burger` как единственный источник истины
 * состояния; CSS `:has()` рисует визуальное состояние по этому атрибуту.
 * Управляет классом `.scroll-lock` на `<body>` для блокировки фоновой
 * прокрутки пока меню открыто. Закрывается по ESC, клику на nav-ссылку,
 * клику на header CTA и клику по оверлею (вне области хедера).
 */

const SCROLL_LOCK_CLASS = 'scroll-lock';
const LABEL_BURGER_OPEN = 'Открыть меню';
const LABEL_BURGER_CLOSE = 'Закрыть меню';
const MENU_LINKS_SELECTOR = '.main-nav__link, .header__cta';

/**
 * Инициализирует мобильное меню. Вешает слушатели на бургер, document
 * (ESC, оверлей-клик) и header (закрытие по клику на nav-ссылку / CTA).
 * Все обработчики добавляются один раз — соответствует CTS-JS-Б26.
 *
 * @example initMobileMenu();
 */
const initMobileMenu = () => {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.header__nav');

  if (!header || !burger || !nav) {
    return;
  }

  /**
   * Проверяет, открыто ли меню в данный момент.
   *
   * @returns {boolean} `true` если `aria-expanded="true"` на бургере
   */
  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';

  /**
   * Открывает меню: обновляет ARIA-атрибуты на бургере и блокирует
   * фоновый скролл через класс `.scroll-lock` на body.
   */
  const openMenu = () => {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', LABEL_BURGER_CLOSE);
    document.body.classList.add(SCROLL_LOCK_CLASS);
  };

  /**
   * Закрывает меню: сбрасывает ARIA-атрибуты и снимает `.scroll-lock`.
   */
  const closeMenu = () => {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', LABEL_BURGER_OPEN);
    document.body.classList.remove(SCROLL_LOCK_CLASS);
  };

  /**
   * Обработчик клика по бургеру — переключает состояние меню.
   */
  const handleBurgerClick = () => {
    if (isOpen()) {
      closeMenu();
      return;
    }
    openMenu();
  };

  /**
   * Обработчик клавиатуры — закрывает меню по ESC и возвращает фокус
   * на бургер для клавиатурной навигации (WCAG 2.1.2).
   *
   * @param {KeyboardEvent} evt
   */
  const handleKeyDown = (evt) => {
    if (evt.key === 'Escape' && isOpen()) {
      closeMenu();
      burger.focus();
    }
  };

  /**
   * Обработчик клика по ссылкам внутри хедера. Закрывает меню при клике
   * на nav-ссылку или CTA-кнопку, чтобы пользователь увидел целевую
   * секцию после якорного перехода.
   *
   * @param {MouseEvent} evt
   */
  const handleHeaderLinkClick = (evt) => {
    const link = evt.target.closest(MENU_LINKS_SELECTOR);
    if (link && isOpen()) {
      closeMenu();
    }
  };

  /**
   * Обработчик клика по оверлею. Закрывает меню, если клик был
   * за пределами хедера (т.е. по затемнённой области оверлея).
   *
   * @param {MouseEvent} evt
   */
  const handleOverlayClick = (evt) => {
    if (!evt.target.closest('.header') && isOpen()) {
      closeMenu();
    }
  };

  burger.addEventListener('click', handleBurgerClick);
  document.addEventListener('keydown', handleKeyDown);
  header.addEventListener('click', handleHeaderLinkClick);
  document.addEventListener('click', handleOverlayClick);
};

export { initMobileMenu };
