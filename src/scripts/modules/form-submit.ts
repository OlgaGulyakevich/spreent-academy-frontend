/**
 * @fileoverview Form Submit — fetch-based form submission with notifications.
 * Sends FormData via fetch to form.action, shows success/error notification.
 * Auto-hides notification after 5 seconds. Resets form + dispatches form:reset on success.
 * @module form-submit
 */

const FORM_SELECTOR = ".footer__form-container form";
const SUCCESS_SELECTOR = ".footer__notification--success";
const ERROR_SELECTOR = ".footer__notification--error";
const INVALID_CLASS = "is-invalid";
const VISIBLE_CLASS = "is-visible";
const RESET_EVENT = "form:reset";
const AUTO_HIDE_DELAY = 5000;

// window.setTimeout id (browser → number). @types/node would type a bare setTimeout
// as NodeJS.Timeout, so call it on window to get the DOM overload.
let hideTimeout: number | null = null;
let isSubmitting = false;

/**
 * Shows a notification element with animation.
 * @param notification - the notification to reveal
 */
const showNotification = (notification: Element): void => {
  notification.classList.add(VISIBLE_CLASS);
  notification.setAttribute("aria-hidden", "false");
};

/**
 * Hides a notification element with animation.
 * @param notification - the notification to hide
 */
const hideNotification = (notification: Element): void => {
  notification.classList.remove(VISIBLE_CLASS);
  notification.setAttribute("aria-hidden", "true");
};

/**
 * Shows the target notification, hides the other, sets auto-hide timer.
 * @param target - notification to show
 * @param other - notification to hide
 */
const displayNotification = (target: Element, other: Element): void => {
  hideNotification(other);
  showNotification(target);

  if (hideTimeout) {
    window.clearTimeout(hideTimeout);
  }

  hideTimeout = window.setTimeout(() => {
    hideNotification(target);
    hideTimeout = null;
  }, AUTO_HIDE_DELAY);
};

/**
 * Handles form submission via fetch.
 * @param evt - the submit event
 * @param form - the form being submitted
 * @param successEl - success notification element
 * @param errorEl - error notification element
 */
const handleSubmit = async (
  evt: SubmitEvent,
  form: HTMLFormElement,
  successEl: Element,
  errorEl: Element,
): Promise<void> => {
  evt.preventDefault();

  if (isSubmitting) {
    return;
  }

  isSubmitting = true;

  const submitBtn = form.querySelector<HTMLButtonElement>('[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
    });

    if (response.ok) {
      displayNotification(successEl, errorEl);
      form.reset();
      form.dispatchEvent(new CustomEvent(RESET_EVENT));
    } else {
      displayNotification(errorEl, successEl);
    }
  } catch {
    displayNotification(errorEl, successEl);
  } finally {
    isSubmitting = false;

    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }
};

/**
 * Initializes form submission handler.
 */
const initFormSubmit = (): void => {
  const form = document.querySelector<HTMLFormElement>(FORM_SELECTOR);
  const successEl = document.querySelector(SUCCESS_SELECTOR);
  const errorEl = document.querySelector(ERROR_SELECTOR);

  if (!form || !successEl || !errorEl) {
    return;
  }

  form.addEventListener("submit", (evt) => {
    const hasInvalid = form.querySelector(`.${INVALID_CLASS}`);

    if (hasInvalid || evt.defaultPrevented) {
      return;
    }

    handleSubmit(evt, form, successEl, errorEl);
  });
};

export { initFormSubmit };
