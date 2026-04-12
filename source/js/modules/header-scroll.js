/**
 * @fileoverview Header scroll effect — добавляет класс `.header--scrolled`
 * на хедер, когда страница прокручена более чем на `SCROLL_THRESHOLD` px.
 * CSS обрабатывает переход `background-color` и `backdrop-filter: blur()`
 * через этот класс.
 */

const SCROLL_THRESHOLD = 40;
const HEADER_SCROLLED_CLASS = 'header--scrolled';

/**
 * Инициализирует эффект хедера при скролле. Вешает один passive-слушатель
 * на `window.scroll` и сразу проверяет начальное состояние (страница может
 * быть загружена уже прокрученной — например, после F5 или перехода по якорю).
 *
 * @example initHeaderScroll();
 */
const initHeaderScroll = () => {
  const header = document.querySelector('.header');

  if (!header) {
    return;
  }

  /**
   * Обработчик скролла. Переключает класс `.header--scrolled` в зависимости
   * от текущего `window.scrollY`.
   */
  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add(HEADER_SCROLLED_CLASS);
      return;
    }
    header.classList.remove(HEADER_SCROLLED_CLASS);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Начальное состояние — на случай, если страница загружена уже прокрученной
  handleScroll();
};

export { initHeaderScroll };
