/**
 * @fileoverview Прогресс-бар скролла в хедере.
 * Считает процент прокрутки документа и пишет его в CSS-переменную
 * `--scroll-progress` на элементе `.header`, чтобы CSS мог отрисовать
 * визуальный индикатор (ширина полосы, градиент и т.д.).
 */

/**
 * Инициализирует прогресс-бар скролла. Вешает один passive-слушатель
 * на `window.scroll` с обёрткой в `requestAnimationFrame` для 60fps,
 * и сразу обновляет состояние при загрузке.
 *
 * @example initScrollProgress();
 */
const initScrollProgress = () => {
  const header = document.querySelector('.header');
  if (!header) {
    return;
  }

  /**
   * Считает процент прокрутки (0-100) и обновляет CSS-переменную
   * `--scroll-progress` на хедере. Клэмп предотвращает отрицательные
   * значения и превышение 100% при overscroll (iOS bounce).
   */
  const updateProgress = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));

    header.style.setProperty('--scroll-progress', `${progress.toFixed(2)}%`);
  };

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateProgress);
  }, {
    passive: true,
  });

  // Начальное состояние — на случай, если страница загружена уже прокрученной
  updateProgress();
};

export { initScrollProgress };
