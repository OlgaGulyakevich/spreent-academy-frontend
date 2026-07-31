/**
 * @fileoverview Form Validation — international phone input, email placeholder swap, inline errors.
 * Phone: intl-tel-input (flag dropdown, per-country format + validation via libphonenumber).
 * The whole iti bundle (core + ~150 KB libphonenumber) is dynamically imported only when the
 * footer form nears the viewport — it sits at the very bottom, so this keeps it out of the
 * initial critical path (big mobile TBT win). Default country Switzerland; utils/flags
 * self-hosted (bundled) → works under strict CSP.
 * Email: placeholder changes to example@domain.com on focus, back to "Email" on blur.
 * Errors: red border via .is-invalid + text message under each invalid field on blur.
 * @module form-validation
 */

const PHONE_SELECTOR = '#form-phone';
const EMAIL_SELECTOR = '#form-email';
const NAME_SELECTOR = '#form-name';
const ERROR_CLASS = 'footer__form-error';
const ERROR_VISIBLE_CLASS = 'is-visible';
const INVALID_CLASS = 'is-invalid';
const RESET_EVENT = 'form:reset';
// Start loading iti this far before the form scrolls into view, so it's ready on arrival.
const PHONE_LAZY_ROOT_MARGIN = '400px';
const EMAIL_PLACEHOLDER_DEFAULT = 'Email';
const EMAIL_PLACEHOLDER_FOCUS = 'example@domain.com';
const PHONE_INIT_OPTIONS = {
  initialCountry: 'ch',
  // Surface Switzerland + EU neighbours first in the country dropdown.
  countryOrder: ['ch', 'de', 'fr', 'it', 'at', 'gb'],
  // Restrict typing to a valid number for the selected country.
  strictMode: true,
  // AGGRESSIVE = iti fills the placeholder with a country example number and updates
  // it on country change; initPhone masks those digits to "_" for a per-country
  // template like "__ ___ __ __". The "+41" dial code shows separately next to the flag.
  placeholderNumberPolicy: 'AGGRESSIVE',
  separateDialCode: true,
  // Always use the inline dropdown. Default 'AUTO' switches to a detached/fixed popup
  // below 500px, which overshot the input width on the stacked mobile layout.
  countrySelectorMode: 'DROPDOWN',
  // Don't let iti set an inline dropdown width (it measured ≈400px vs the 388px input).
  // With this off, our CSS `width: 100%` controls it — matching the fluid input exactly.
  matchDropdownWidth: false,
  // Lazy-load libphonenumber (validation/formatting) from the bundle — self-hosted,
  // so a strict script-src 'self' CSP allows it (no CDN request).
  loadUtils: () => import('intl-tel-input/utils'),
};

const ERROR_MESSAGES = {
  name: {
    valueMissing: 'Enter your name',
    tooShort: 'Name must be at least 2 characters long',
  },
  phone: {
    valueMissing: 'Enter your phone number',
    tooShort: 'Enter your full phone number',
    invalid: 'Enter a valid phone number',
    tooLong: 'Phone number is too long',
  },
  email: {
    valueMissing: 'Enter your email address',
    typeMismatch: 'Enter a valid email address',
    patternMismatch: 'Enter a valid email address',
  },
};

/**
 * Finds the error span sibling for a given input.
 * @param {HTMLInputElement} input
 * @returns {HTMLElement|null}
 */
const getErrorElement = (input) =>
  input.closest('.footer__form-field')?.querySelector(`.${ERROR_CLASS}`);

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
  // Trim stray leading/trailing whitespace (autofill/paste) — the strict email
  // pattern rejects it otherwise, wrongly flagging a valid address as invalid.
  const trimmed = input.value.trim();
  if (trimmed !== input.value) {
    input.value = trimmed;
  }

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
 * Picks a specific phone error message from intl-tel-input's validation result
 * (e.g. an incomplete number → "not enough digits" rather than a generic error).
 * @param {Object} iti - intl-tel-input instance
 * @returns {string}
 */
const getPhoneErrorMessage = (iti) => {
  // isValidNumber() is the lenient "possible length" check. If the length is possible but the
  // number still isn't precisely valid, it's the right length yet the wrong number (e.g. an
  // unassigned area code) → ask for a valid number. If the length isn't even possible, it's
  // either too long or — more often — incomplete.
  if (iti.isValidNumber()) {
    return ERROR_MESSAGES.phone.invalid;
  }

  const error = iti.getValidationError();
  return error === 'TOO_LONG' || error === 3
    ? ERROR_MESSAGES.phone.tooLong
    : ERROR_MESSAGES.phone.tooShort;
};

/**
 * Validates phone input via intl-tel-input (libphonenumber under the hood).
 * @param {HTMLInputElement} input
 * @param {Object} iti - intl-tel-input instance
 */
const validatePhone = (input, iti) => {
  if (!input.value.trim()) {
    hideError(input);
    return;
  }

  // isValidNumber() returns null until the utils bundle has loaded — only a
  // definite false (invalid for the selected country) is treated as an error.
  if (iti.isValidNumberPrecise() === false) {
    showError(input, getPhoneErrorMessage(iti));
    return;
  }

  hideError(input);
};

/**
 * Initializes the international phone input via intl-tel-input.
 * @param {HTMLInputElement} input
 * @param {Function} intlTelInput - the dynamically imported iti factory
 * @returns {Object} intl-tel-input instance
 */
const initPhone = (input, intlTelInput) => {
  const iti = intlTelInput(input, PHONE_INIT_OPTIONS);

  // iti (AGGRESSIVE policy) fills the placeholder with a country example number and updates
  // it on country change. Convert those digits to "_" for a per-country template like
  // "__ ___ __ __". A MutationObserver catches EVERY placeholder change — including the
  // initial country (the old promise/countrychange race let Switzerland slip through as
  // digits). The digit guard stops it re-triggering on the underscores it just wrote.
  const maskPlaceholder = () => {
    const current = input.getAttribute('placeholder');
    if (current && /\d/.test(current)) {
      input.setAttribute('placeholder', current.replace(/\d/g, '_'));
    }
  };

  new MutationObserver(maskPlaceholder).observe(input, {
    attributes: true,
    attributeFilter: ['placeholder'],
  });

  input.addEventListener('blur', () => validatePhone(input, iti));

  input.addEventListener('input', () => {
    // Clear the error as soon as the number becomes valid while typing.
    if (input.value && iti.isValidNumberPrecise()) {
      hideError(input);
    }
  });

  return iti;
};

/**
 * Dynamically imports intl-tel-input and initializes the phone field once the footer form
 * approaches the viewport (IntersectionObserver). Keeps iti core + libphonenumber out of the
 * initial bundle — the form is at the very bottom, so nothing loads until the user scrolls near.
 * @param {HTMLInputElement} input
 * @param {(iti: Object) => void} onReady - called with the iti instance once initialized
 */
const lazyInitPhone = (input, onReady) => {
  const load = async () => {
    const { default: intlTelInput } = await import('intl-tel-input');
    onReady(initPhone(input, intlTelInput));
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        obs.disconnect();
        load();
      }
    },
    { rootMargin: PHONE_LAZY_ROOT_MARGIN },
  );

  observer.observe(input);
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
 * @param {Object|null} phoneData - { input, iti } or null
 */
const initSubmitValidation = (form, phoneData) => {
  form.setAttribute('novalidate', '');

  form.addEventListener('submit', (evt) => {
    let firstInvalid = null;

    const nameInput = form.querySelector(NAME_SELECTOR);
    const emailInput = form.querySelector(EMAIL_SELECTOR);

    // Trim whitespace before the native validity checks (see validateField).
    [nameInput, emailInput].forEach((field) => {
      if (field) {
        field.value = field.value.trim();
      }
    });

    if (nameInput && !nameInput.checkValidity()) {
      const msg = nameInput.value ? getErrorMessage(nameInput, 'name') : ERROR_MESSAGES.name.valueMissing;
      showError(nameInput, msg);
      firstInvalid = firstInvalid || nameInput;
    }

    if (phoneData) {
      const { input, iti } = phoneData;

      if (!input.value.trim()) {
        showError(input, ERROR_MESSAGES.phone.valueMissing);
        firstInvalid = firstInvalid || input;
      } else if (iti && iti.isValidNumberPrecise() === false) {
        showError(input, getPhoneErrorMessage(iti));
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
  let phoneData = null;

  if (phoneInput) {
    // iti loads lazily — phoneData.iti stays null until the form nears the viewport, then the
    // submit/reset handlers (which read it by reference) pick up the instance. The form can't be
    // reached without scrolling it into view, so iti is always ready before a real submit.
    phoneData = { input: phoneInput, iti: null };
    lazyInitPhone(phoneInput, (iti) => {
      phoneData.iti = iti;
    });
  }

  if (emailInput) {
    initEmailPlaceholder(emailInput);
    initFieldValidation(emailInput, 'email');
  }

  if (nameInput) {
    initFieldValidation(nameInput, 'name');
  }

  if (form) {
    initSubmitValidation(form, phoneData);

    form.addEventListener(RESET_EVENT, () => {
      const inputs = form.querySelectorAll('input');
      inputs.forEach((input) => hideError(input));

      if (phoneData) {
        phoneData.iti?.setNumber('');
      }
    });
  }
};

export { initFormValidation };
