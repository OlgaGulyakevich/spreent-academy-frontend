/**
 * @fileoverview Кастомный плавный скролл к якорям.
 *
 * Перехватывает клики на `a[href^="#"]` (кроме `href="#"`), отменяет
 * нативный скролл и анимирует через `requestAnimationFrame` с кривой
 * `easeInOutQuart` — мягкий старт, cruise, мягкое прибытие (по ощущению
 * как Lenis / нативный браузерный smooth scroll). Длительность
 * масштабируется от дистанции, чтобы короткие переходы не затягивались,
 * а длинные не «швыряли». Если открыто мобильное меню (`scroll-lock`
 * на body) — старт скролла задерживается, чтобы анимация закрытия
 * меню успела отыграть визуально. После завершения скролла фокус
 * переносится на целевую секцию для клавиатурной навигации (A11y).
 */

const MIN_DURATION = 900;
const MAX_DURATION = 1800;
const PX_PER_MS = 2.0;
const MOBILE_MENU_DELAY = 350;
const HEADER_OFFSET = 70;
const SCROLL_LOCK_CLASS = 'scroll-lock';
const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';
const FIRST_FIELD_SELECTOR = 'input:not([type="hidden"]), textarea, select';

/**
 * easeInOutQuart — плавное ускорение и замедление.
 * Мягче чем cubic; по ощущению близко к нативному браузерному smooth scroll.
 *
 * @param {number} t — прогресс от 0 до 1
 * @returns {number} сглаженный прогресс
 */
const easeInOutQuart = (t) =>
  (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

/**
 * Считает длительность анимации на основе дистанции скролла, с клэмпом [MIN, MAX].
 *
 * @param {number} distance — абсолютная дистанция скролла в пикселях
 * @returns {number} длительность в мс
 */
const getDuration = (distance) =>
  Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(distance) / PX_PER_MS));

/**
 * Анимирует скролл окна от текущей позиции к целевой Y.
 * Вызывает `onComplete` после завершения анимации (если передан).
 *
 * @param {number} targetY — целевая позиция скролла в пикселях
 * @param {Function} [onComplete] — колбэк, вызываемый по завершении анимации
 */
const animateScroll = (targetY, onComplete) => {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const duration = getDuration(diff);
  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuart(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    if (onComplete) {
      onComplete();
    }
  };

  requestAnimationFrame(step);
};

/**
 * Переносит фокус на целевой элемент после скролла для клавиатурной
 * навигации (WCAG 2.4.3 Focus Order).
 *
 * Логика выбора элемента для фокуса:
 * 1. Если целевой элемент — форма или содержит `<form>` → фокусим первое
 *    поле ввода этой формы (пользователь сразу может начать заполнять).
 * 2. Иначе — фокусим сам target. Если он не фокусабелен по умолчанию,
 *    временно добавляем `tabindex="-1"` и снимаем по `blur`, чтобы не
 *    мусорить DOM и не ломать Tab-навигацию.
 *
 * @param {HTMLElement} target — элемент, до которого был скролл
 */
const focusTarget = (target) => {
  const form = target.tagName === 'FORM' ? target : target.querySelector('form');
  const firstField = form && form.querySelector(FIRST_FIELD_SELECTOR);

  if (firstField) {
    firstField.focus({ preventScroll: true });
    return;
  }

  const isFocusable = target.matches(FOCUSABLE_SELECTOR);

  if (!isFocusable) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => {
      target.removeAttribute('tabindex');
    }, { once: true });
  }

  target.focus({ preventScroll: true });
};

/**
 * Обработчик клика по якорным ссылкам. Вычисляет целевую Y с учётом
 * высоты хедера, задерживает старт если открыто мобильное меню,
 * затем запускает анимированный скролл с фокусом по завершении.
 *
 * @param {MouseEvent} evt
 */
const handleAnchorClick = (evt) => {
  const link = evt.target.closest('a[href^="#"]:not([href="#"])');
  if (!link) {
    return;
  }

  const targetId = link.getAttribute('href').slice(1);
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  evt.preventDefault();

  const targetY = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  const wasMenuOpen = document.body.classList.contains(SCROLL_LOCK_CLASS);
  const delay = wasMenuOpen ? MOBILE_MENU_DELAY : 0;

  setTimeout(() => {
    animateScroll(targetY, () => focusTarget(target));
  }, delay);
};

/**
 * Инициализирует плавный скролл. Вешает один слушатель на `document`
 * в capture phase (делегирование). Capture phase нужна, чтобы
 * прочитать `scroll-lock` на body ДО того, как `mobile-menu.js`
 * успеет снять класс в bubble-фазе — иначе `wasMenuOpen` всегда
 * будет `false` на клике по `.header__cta` из открытого меню,
 * и задержка `MOBILE_MENU_DELAY` не применится.
 *
 * Делегирование: один обработчик вместо N на каждой ссылке —
 * соблюдение CTS-JS-Б26 (минимум обработчиков), плюс работает
 * с динамически добавленными ссылками.
 *
 * @example initSmoothScroll();
 */
const initSmoothScroll = () => {
  document.addEventListener('click', handleAnchorClick, true);
};

export { initSmoothScroll };
