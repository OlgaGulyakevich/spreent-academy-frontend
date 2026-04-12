/**
 * Form Validation — phone mask, email placeholder swap, inline error messages.
 * Phone: imask with +7 (000) 000-00-00 pattern.
 * Email: placeholder changes to example@domain.com on focus, back to «Почта» on blur.
 * Errors: red border via .is-invalid + text message under each invalid field on blur.
 * @module form-validation
 */

import IMask from 'imask';

const PHONE_SELECTOR = '#form-phone';
const EMAIL_SELECTOR = '#form-email';
const NAME_SELECTOR = '#form-name';
const ERROR_CLASS = 'footer__form-error';
const ERROR_VISIBLE_CLASS = 'is-visible';
const INVALID_CLASS = 'is-invalid';
const RESET_EVENT = 'form:reset';
const EMAIL_PLACEHOLDER_DEFAULT = 'Почта';
const EMAIL_PLACEHOLDER_FOCUS = 'example@domain.com';
const PHONE_MASK_OPTIONS = {
  mask: '+0 (000) 000-00-00',
  lazy: true,
};
const PHONE_DEFAULT_VALUE = '+7 ';
const PHONE_CURSOR_POS = 4;
const PHONE_DIGITS_REQUIRED = 11;

const ERROR_MESSAGES = {
  name: {
    valueMissing: 'Введите ваше имя',
    tooShort: 'Имя должно содержать минимум 2 символа',
  },
  phone: {
    valueMissing: 'Введите номер телефона',
    tooShort: 'Введите полный номер телефона',
  },
  email: {
    valueMissing: 'Введите адрес электронной почты',
    typeMismatch: 'Введите корректный адрес электронной почты',
    patternMismatch: 'Введите корректный адрес электронной почты',
  },
};

/**
 * Finds the error span sibling for a given input.
 * @param {HTMLInputElement} input
 * @returns {HTMLElement|null}
 */
const getErrorElement = (input) => input.parentElement.querySelector(`.${ERROR_CLASS}`);

/**
 * Shows an error message under the input and adds red border.
 * @param {HTMLInputElement} input
 * @param {string} message
 */
const showError = (input, message) => {
  const errorEl = getErrorElement(input);

  if (!errorEl) {
    return;
  }

  input.classList.add(INVALID_CLASS);
  errorEl.textContent = message;
  errorEl.classList.add(ERROR_VISIBLE_CLASS);
};

/**
 * Hides the error message and removes red border.
 * @param {HTMLInputElement} input
 */
const hideError = (input) => {
  const errorEl = getErrorElement(input);

  if (!errorEl) {
    return;
  }

  input.classList.remove(INVALID_CLASS);
  errorEl.classList.remove(ERROR_VISIBLE_CLASS);
};

/**
 * Returns the appropriate error message for a given input's validity state.
 * @param {HTMLInputElement} input
 * @param {string} fieldName - key in ERROR_MESSAGES
 * @returns {string} error message or empty string if valid
 */
const getErrorMessage = (input, fieldName) => {
  const { validity } = input;
  const messages = ERROR_MESSAGES[fieldName];

  if (!messages) {
    return '';
  }

  if (validity.valueMissing) {
    return messages.valueMissing || '';
  }

  if (validity.tooShort) {
    return messages.tooShort || '';
  }

  if (validity.typeMismatch) {
    return messages.typeMismatch || '';
  }

  if (validity.patternMismatch) {
    return messages.patternMismatch || '';
  }

  return '';
};

/**
 * Validates a standard text/email input and shows/hides error.
 * @param {HTMLInputElement} input
 * @param {string} fieldName
 */
const validateField = (input, fieldName) => {
  if (!input.value) {
    hideError(input);
    return;
  }

  if (input.checkValidity()) {
    hideError(input);
    return;
  }

  const message = getErrorMessage(input, fieldName);

  if (message) {
    showError(input, message);
  }
};

/**
 * Validates phone input using imask unmasked value.
 * @param {HTMLInputElement} input
 * @param {Object} mask - imask instance
 */
const validatePhone = (input, mask) => {
  const digits = mask.unmaskedValue;

  if (!digits || digits === '7') {
    hideError(input);
    return;
  }

  if (digits.length < PHONE_DIGITS_REQUIRED) {
    showError(input, ERROR_MESSAGES.phone.tooShort);
    return;
  }

  hideError(input);
};

/**
 * Initializes phone mask via imask.
 * @param {HTMLInputElement} input
 * @returns {Object} imask instance
 */
const initPhoneMask = (input) => {
  const mask = IMask(input, PHONE_MASK_OPTIONS);

  input.addEventListener('focus', () => {
    mask.updateOptions({ lazy: false });

    if (!mask.unmaskedValue) {
      mask.value = PHONE_DEFAULT_VALUE;
    }

    requestAnimationFrame(() => {
      if (mask.unmaskedValue === '7') {
        input.setSelectionRange(PHONE_CURSOR_POS, PHONE_CURSOR_POS);
      }
    });
  });

  input.addEventListener('blur', () => {
    if (!mask.unmaskedValue || mask.unmaskedValue === '7') {
      mask.updateOptions({ lazy: true });
      mask.value = '';
      hideError(input);
      return;
    }

    validatePhone(input, mask);
  });

  mask.on('accept', () => {
    if (mask.unmaskedValue.length >= PHONE_DIGITS_REQUIRED) {
      hideError(input);
    }
  });

  return mask;
};

/**
 * Initializes email placeholder swap on focus/blur.
 * @param {HTMLInputElement} input
 */
const initEmailPlaceholder = (input) => {
  input.addEventListener('focus', () => {
    if (!input.value) {
      input.placeholder = EMAIL_PLACEHOLDER_FOCUS;
    }
  });

  input.addEventListener('blur', () => {
    input.placeholder = EMAIL_PLACEHOLDER_DEFAULT;
  });
};

/**
 * Attaches blur/input validation to a standard field.
 * @param {HTMLInputElement} input
 * @param {string} fieldName
 */
const initFieldValidation = (input, fieldName) => {
  input.addEventListener('blur', () => {
    validateField(input, fieldName);
  });

  input.addEventListener('input', () => {
    if (!input.value) {
      hideError(input);
      return;
    }

    if (input.checkValidity()) {
      hideError(input);
    }
  });
};

/**
 * Handles form submit — validates all fields, shows errors, prevents submit if invalid.
 * @param {HTMLFormElement} form
 * @param {Object|null} phoneMaskData - { input, mask } or null
 */
const initSubmitValidation = (form, phoneMaskData) => {
  form.setAttribute('novalidate', '');

  form.addEventListener('submit', (evt) => {
    let firstInvalid = null;

    const nameInput = form.querySelector(NAME_SELECTOR);
    const emailInput = form.querySelector(EMAIL_SELECTOR);

    if (nameInput && !nameInput.checkValidity()) {
      const msg = nameInput.value ? getErrorMessage(nameInput, 'name') : ERROR_MESSAGES.name.valueMissing;
      showError(nameInput, msg);
      firstInvalid = firstInvalid || nameInput;
    }

    if (phoneMaskData) {
      const { input, mask } = phoneMaskData;
      const digits = mask.unmaskedValue;

      if (!digits || digits === '7') {
        showError(input, ERROR_MESSAGES.phone.valueMissing);
        firstInvalid = firstInvalid || input;
      } else if (digits.length < PHONE_DIGITS_REQUIRED) {
        showError(input, ERROR_MESSAGES.phone.tooShort);
        firstInvalid = firstInvalid || input;
      }
    }

    if (emailInput && !emailInput.checkValidity()) {
      const msg = emailInput.value ? getErrorMessage(emailInput, 'email') : ERROR_MESSAGES.email.valueMissing;
      showError(emailInput, msg);
      firstInvalid = firstInvalid || emailInput;
    }

    if (firstInvalid) {
      evt.preventDefault();
      firstInvalid.focus();
    }
  });
};

/**
 * Initializes form validation features.
 */
const initFormValidation = () => {
  const phoneInput = document.querySelector(PHONE_SELECTOR);
  const emailInput = document.querySelector(EMAIL_SELECTOR);
  const nameInput = document.querySelector(NAME_SELECTOR);
  const form = document.querySelector('.footer__form-container form');
  let phoneMaskData = null;

  if (phoneInput) {
    const mask = initPhoneMask(phoneInput);
    phoneMaskData = { input: phoneInput, mask };
  }

  if (emailInput) {
    initEmailPlaceholder(emailInput);
    initFieldValidation(emailInput, 'email');
  }

  if (nameInput) {
    initFieldValidation(nameInput, 'name');
  }

  if (form) {
    initSubmitValidation(form, phoneMaskData);

    form.addEventListener(RESET_EVENT, () => {
      const inputs = form.querySelectorAll('input');
      inputs.forEach((input) => hideError(input));

      if (phoneMaskData) {
        phoneMaskData.mask.updateOptions({ lazy: true });
        phoneMaskData.mask.value = '';
      }
    });
  }
};

export { initFormValidation };
