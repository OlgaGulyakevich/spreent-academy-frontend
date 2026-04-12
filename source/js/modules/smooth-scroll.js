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
 * переносится на целевую секцию (или первое поле формы) для
 * клавиатурной навигации.
 *
 * A11y / UX поведение:
 * - При `prefers-reduced-motion: reduce` — моментальный скролл без анимации
 * - Ручной скролл (wheel / touchmove) во время анимации — отменяет её
 * - Новый клик во время активной анимации — отменяет предыдущую
 * - Если уже на цели (distance === 0) — сразу фокус без rAF
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
 * Монотонный счётчик активных анимаций. Каждый вызов `animateScroll`
 * инкрементирует его и сохраняет свой токен; если в процессе rAF
 * токен перестал совпадать с глобальным — значит, поверх запустили
 * новую анимацию, текущую нужно отменить.
 */
let currentAnimationToken = 0;

/**
 * Проверяет, выставлен ли у пользователя системный флаг
 * «уменьшить движение» (prefers-reduced-motion: reduce).
 *
 * @returns {boolean}
 */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
 * Поддерживает отмену при ручном скролле пользователя (wheel/touchmove)
 * и при запуске новой анимации поверх текущей. Вызывает `onComplete`
 * только при успешном завершении (не при отмене).
 *
 * @param {number} targetY — целевая позиция скролла в пикселях
 * @param {Function} [onComplete] — колбэк, вызываемый по завершении анимации
 */
const animateScroll = (targetY, onComplete) => {
  const startY = window.scrollY;
  const diff = targetY - startY;

  // #6 Short-circuit: уже на цели
  if (diff === 0) {
    if (onComplete) {
      onComplete();
    }
    return;
  }

  // #5 Отменяем предыдущую анимацию, инкрементируя глобальный токен
  currentAnimationToken += 1;
  const myToken = currentAnimationToken;

  const duration = getDuration(diff);
  const startTime = performance.now();

  // #4 Отмена при ручном скролле
  let cancelledByUser = false;
  const handleManualScroll = () => {
    cancelledByUser = true;
  };
  window.addEventListener('wheel', handleManualScroll, { passive: true, once: true });
  window.addEventListener('touchmove', handleManualScroll, { passive: true, once: true });

  const cleanup = () => {
    window.removeEventListener('wheel', handleManualScroll);
    window.removeEventListener('touchmove', handleManualScroll);
  };

  const step = (currentTime) => {
    // Проверка на отмену: либо новая анимация поверх, либо ручной скролл
    if (myToken !== currentAnimationToken || cancelledByUser) {
      cleanup();
      return;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuart(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    cleanup();
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
 * Выполняет скролл к целевой позиции с учётом пользовательских настроек.
 * При `prefers-reduced-motion: reduce` — моментальный скролл без анимации,
 * иначе — плавный через `animateScroll`.
 *
 * @param {number} targetY — целевая Y-позиция в пикселях
 * @param {HTMLElement} target — элемент для переноса фокуса после скролла
 */
const scrollToTarget = (targetY, target) => {
  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    focusTarget(target);
    return;
  }

  animateScroll(targetY, () => focusTarget(target));
};

/**
 * Обработчик клика по якорным ссылкам. Вычисляет целевую Y с учётом
 * высоты хедера, задерживает старт если открыто мобильное меню,
 * затем запускает скролл (с анимацией или моментально в зависимости
 * от reduced-motion).
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

  setTimeout(() => scrollToTarget(targetY, target), delay);
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
