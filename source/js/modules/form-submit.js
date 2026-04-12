/**
 * Form Submit — fetch-based form submission with notifications.
 * Sends FormData via fetch to form.action, shows success/error notification.
 * Auto-hides notification after 5 seconds. Resets form on success.
 * @module form-submit
 */

const FORM_SELECTOR = '.footer__form-container form';
const SUCCESS_SELECTOR = '.footer__notification--success';
const ERROR_SELECTOR = '.footer__notification--error';
const INVALID_CLASS = 'is-invalid';
const VISIBLE_CLASS = 'is-visible';
const AUTO_HIDE_DELAY = 5000;

let hideTimeout = null;

/**
 * Shows a notification element with animation.
 * @param {HTMLElement} notification
 */
const showNotification = (notification) => {
  notification.classList.add(VISIBLE_CLASS);
  notification.setAttribute('aria-hidden', 'false');
};

/**
 * Hides a notification element with animation.
 * @param {HTMLElement} notification
 */
const hideNotification = (notification) => {
  notification.classList.remove(VISIBLE_CLASS);
  notification.setAttribute('aria-hidden', 'true');
};


/**
 * Shows the target notification, hides the other, sets auto-hide timer.
 * @param {HTMLElement} target - notification to show
 * @param {HTMLElement} other - notification to hide
 */
const displayNotification = (target, other) => {
  hideNotification(other);
  showNotification(target);

  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  hideTimeout = setTimeout(() => {
    hideNotification(target);
    hideTimeout = null;
  }, AUTO_HIDE_DELAY);
};

/**
 * Handles form submission via fetch.
 * @param {SubmitEvent} evt
 * @param {HTMLFormElement} form
 * @param {HTMLElement} successEl
 * @param {HTMLElement} errorEl
 */
const handleSubmit = async (evt, form, successEl, errorEl) => {
  evt.preventDefault();

  const submitBtn = form.querySelector('[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
    });

    if (response.ok) {
      displayNotification(successEl, errorEl);
      form.reset();
    } else {
      displayNotification(errorEl, successEl);
    }
  } catch {
    displayNotification(errorEl, successEl);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
};

/**
 * Initializes form submission handler.
 */
const initFormSubmit = () => {
  const form = document.querySelector(FORM_SELECTOR);
  const successEl = document.querySelector(SUCCESS_SELECTOR);
  const errorEl = document.querySelector(ERROR_SELECTOR);

  if (!form || !successEl || !errorEl) {
    return;
  }

  form.addEventListener('submit', (evt) => {
    const hasInvalid = form.querySelector(`.${INVALID_CLASS}`);

    if (hasInvalid || evt.defaultPrevented) {
      return;
    }

    handleSubmit(evt, form, successEl, errorEl);
  });
};

export { initFormSubmit };
