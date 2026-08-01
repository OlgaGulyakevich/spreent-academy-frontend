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

import type { IntlTelInputInterface, Iti, SomeOptions } from "intl-tel-input";

const PHONE_SELECTOR = "#form-phone";
const EMAIL_SELECTOR = "#form-email";
const NAME_SELECTOR = "#form-name";
const ERROR_CLASS = "footer__form-error";
const ERROR_VISIBLE_CLASS = "is-visible";
const INVALID_CLASS = "is-invalid";
const RESET_EVENT = "form:reset";
// Start loading iti this far before the form scrolls into view, so it's ready on arrival.
const PHONE_LAZY_ROOT_MARGIN = "400px";
const EMAIL_PLACEHOLDER_DEFAULT = "Email";
const EMAIL_PLACEHOLDER_FOCUS = "example@domain.com";

// `satisfies SomeOptions` validates every option against iti's own types (e.g. 'ch' is a valid
// Iso2, 'AGGRESSIVE' a valid policy) while keeping the object's narrow literal types.
const PHONE_INIT_OPTIONS = {
  initialCountry: "ch",
  // Surface Switzerland + EU neighbours first in the country dropdown.
  countryOrder: ["ch", "de", "fr", "it", "at", "gb"],
  // Restrict typing to a valid number for the selected country.
  strictMode: true,
  // AGGRESSIVE = iti fills the placeholder with a country example number and updates
  // it on country change; initPhone masks those digits to "_" for a per-country
  // template like "__ ___ __ __". The "+41" dial code shows separately next to the flag.
  placeholderNumberPolicy: "AGGRESSIVE",
  separateDialCode: true,
  // Always use the inline dropdown. Default 'AUTO' switches to a detached/fixed popup
  // below 500px, which overshot the input width on the stacked mobile layout.
  countrySelectorMode: "DROPDOWN",
  // Don't let iti set an inline dropdown width (it measured ≈400px vs the 388px input).
  // With this off, our CSS `width: 100%` controls it — matching the fluid input exactly.
  matchDropdownWidth: false,
  // Lazy-load libphonenumber (validation/formatting) from the bundle — self-hosted,
  // so a strict script-src 'self' CSP allows it (no CDN request).
  loadUtils: () => import("intl-tel-input/utils"),
} satisfies SomeOptions;

/** Field name — the key selecting a message set from ERROR_MESSAGES. */
type FieldName = "name" | "phone" | "email";

/**
 * Per-field validation messages. `valueMissing` is always present (empty-field fallback);
 * the rest are field-specific and optional (native validity keys + iti's phone-only keys).
 */
type FieldMessages = {
  valueMissing: string;
  tooShort?: string;
  typeMismatch?: string;
  patternMismatch?: string;
  invalid?: string;
  tooLong?: string;
};

/** Phone field + its (lazily loaded) intl-tel-input instance, shared by submit/reset. */
type PhoneData = {
  input: HTMLInputElement;
  iti: Iti | null;
};

const ERROR_MESSAGES: Record<FieldName, FieldMessages> = {
  name: {
    valueMissing: "Enter your name",
    tooShort: "Name must be at least 2 characters long",
  },
  phone: {
    valueMissing: "Enter your phone number",
    tooShort: "Enter your full phone number",
    invalid: "Enter a valid phone number",
    tooLong: "Phone number is too long",
  },
  email: {
    valueMissing: "Enter your email address",
    typeMismatch: "Enter a valid email address",
    patternMismatch: "Enter a valid email address",
  },
};

/**
 * Finds the error span sibling for a given input.
 * @param input - the field whose error element to find
 * @returns the error element, or null if absent
 */
const getErrorElement = (input: HTMLInputElement): Element | null =>
  input.closest(".footer__form-field")?.querySelector(`.${ERROR_CLASS}`) ??
  null;

/**
 * Shows an error message under the input and adds red border.
 * @param input - the invalid field
 * @param message - the error text to display
 */
const showError = (input: HTMLInputElement, message: string): void => {
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
 * @param input - the field to clear
 */
const hideError = (input: HTMLInputElement): void => {
  const errorEl = getErrorElement(input);

  if (!errorEl) {
    return;
  }

  input.classList.remove(INVALID_CLASS);
  errorEl.classList.remove(ERROR_VISIBLE_CLASS);
};

/**
 * Returns the appropriate error message for a given input's validity state.
 * @param input - the field to inspect
 * @param fieldName - key in ERROR_MESSAGES
 * @returns error message, or empty string if valid
 */
const getErrorMessage = (
  input: HTMLInputElement,
  fieldName: FieldName,
): string => {
  const { validity } = input;
  const messages = ERROR_MESSAGES[fieldName];

  if (validity.valueMissing) {
    return messages.valueMissing || "";
  }

  if (validity.tooShort) {
    return messages.tooShort || "";
  }

  if (validity.typeMismatch) {
    return messages.typeMismatch || "";
  }

  if (validity.patternMismatch) {
    return messages.patternMismatch || "";
  }

  return "";
};

/**
 * Validates a standard text/email input and shows/hides error.
 * @param input - the field to validate
 * @param fieldName - key in ERROR_MESSAGES
 */
const validateField = (input: HTMLInputElement, fieldName: FieldName): void => {
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
 * @param iti - intl-tel-input instance
 * @returns the phone error message
 */
const getPhoneErrorMessage = (iti: Iti): string => {
  const { phone } = ERROR_MESSAGES;

  // isValidNumber() is the lenient "possible length" check. If the length is possible but the
  // number still isn't precisely valid, it's the right length yet the wrong number (e.g. an
  // unassigned area code) → ask for a valid number. If the length isn't even possible, it's
  // either too long or — more often — incomplete.
  if (iti.isValidNumber()) {
    return phone.invalid ?? "";
  }

  // v29 getValidationError() returns a string union ("TOO_LONG" | "TOO_SHORT" | …); older
  // numeric codes are gone, so no `=== 3` fallback is needed (TS would reject it — no overlap).
  const error = iti.getValidationError();
  return (error === "TOO_LONG" ? phone.tooLong : phone.tooShort) ?? "";
};

/**
 * Validates phone input via intl-tel-input (libphonenumber under the hood).
 * @param input - the phone field
 * @param iti - intl-tel-input instance
 */
const validatePhone = (input: HTMLInputElement, iti: Iti): void => {
  if (!input.value.trim()) {
    hideError(input);
    return;
  }

  // isValidNumberPrecise() returns null until the utils bundle has loaded — only a
  // definite false (invalid for the selected country) is treated as an error.
  if (iti.isValidNumberPrecise() === false) {
    showError(input, getPhoneErrorMessage(iti));
    return;
  }

  hideError(input);
};

/**
 * Initializes the international phone input via intl-tel-input.
 * @param input - the phone field
 * @param intlTelInput - the dynamically imported iti factory
 * @returns the intl-tel-input instance
 */
const initPhone = (
  input: HTMLInputElement,
  intlTelInput: IntlTelInputInterface,
): Iti => {
  const iti = intlTelInput(input, PHONE_INIT_OPTIONS);

  // iti (AGGRESSIVE policy) fills the placeholder with a country example number and updates
  // it on country change. Convert those digits to "_" for a per-country template like
  // "__ ___ __ __". A MutationObserver catches EVERY placeholder change — including the
  // initial country (the old promise/countrychange race let Switzerland slip through as
  // digits). The digit guard stops it re-triggering on the underscores it just wrote.
  const maskPlaceholder = (): void => {
    const current = input.getAttribute("placeholder");
    if (current && /\d/.test(current)) {
      input.setAttribute("placeholder", current.replace(/\d/g, "_"));
    }
  };

  new MutationObserver(maskPlaceholder).observe(input, {
    attributes: true,
    attributeFilter: ["placeholder"],
  });

  input.addEventListener("blur", () => validatePhone(input, iti));

  input.addEventListener("input", () => {
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
 * @param input - the phone field
 * @param onReady - called with the iti instance once initialized
 */
const lazyInitPhone = (
  input: HTMLInputElement,
  onReady: (iti: Iti) => void,
): void => {
  const load = async (): Promise<void> => {
    const { default: intlTelInput } = await import("intl-tel-input");
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
 * @param input - the email field
 */
const initEmailPlaceholder = (input: HTMLInputElement): void => {
  input.addEventListener("focus", () => {
    if (!input.value) {
      input.placeholder = EMAIL_PLACEHOLDER_FOCUS;
    }
  });

  input.addEventListener("blur", () => {
    input.placeholder = EMAIL_PLACEHOLDER_DEFAULT;
  });
};

/**
 * Attaches blur/input validation to a standard field.
 * @param input - the field to wire up
 * @param fieldName - key in ERROR_MESSAGES
 */
const initFieldValidation = (
  input: HTMLInputElement,
  fieldName: FieldName,
): void => {
  input.addEventListener("blur", () => {
    validateField(input, fieldName);
  });

  input.addEventListener("input", () => {
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
 * @param form - the footer form
 * @param phoneData - phone field + iti instance, or null if no phone field
 */
const initSubmitValidation = (
  form: HTMLFormElement,
  phoneData: PhoneData | null,
): void => {
  form.setAttribute("novalidate", "");

  form.addEventListener("submit", (evt) => {
    let firstInvalid: HTMLElement | null = null;

    const nameInput = form.querySelector<HTMLInputElement>(NAME_SELECTOR);
    const emailInput = form.querySelector<HTMLInputElement>(EMAIL_SELECTOR);

    // Trim whitespace before the native validity checks (see validateField).
    [nameInput, emailInput].forEach((field) => {
      if (field) {
        field.value = field.value.trim();
      }
    });

    if (nameInput && !nameInput.checkValidity()) {
      const msg = nameInput.value
        ? getErrorMessage(nameInput, "name")
        : ERROR_MESSAGES.name.valueMissing;
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
      const msg = emailInput.value
        ? getErrorMessage(emailInput, "email")
        : ERROR_MESSAGES.email.valueMissing;
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
const initFormValidation = (): void => {
  const phoneInput = document.querySelector<HTMLInputElement>(PHONE_SELECTOR);
  const emailInput = document.querySelector<HTMLInputElement>(EMAIL_SELECTOR);
  const nameInput = document.querySelector<HTMLInputElement>(NAME_SELECTOR);
  const form = document.querySelector<HTMLFormElement>(
    ".footer__form-container form",
  );
  let phoneData: PhoneData | null = null;

  if (phoneInput) {
    // iti loads lazily — data.iti stays null until the form nears the viewport, then the
    // submit/reset handlers (which read it by reference) pick up the instance. The form can't be
    // reached without scrolling it into view, so iti is always ready before a real submit.
    // Capture into a `const` of type PhoneData: a closure doesn't preserve the control-flow
    // narrowing of the `let phoneData`, so mutating `data.iti` here needs a non-null binding.
    const data: PhoneData = { input: phoneInput, iti: null };
    phoneData = data;
    lazyInitPhone(phoneInput, (iti) => {
      data.iti = iti;
    });
  }

  if (emailInput) {
    initEmailPlaceholder(emailInput);
    initFieldValidation(emailInput, "email");
  }

  if (nameInput) {
    initFieldValidation(nameInput, "name");
  }

  if (form) {
    initSubmitValidation(form, phoneData);

    form.addEventListener(RESET_EVENT, () => {
      const inputs = form.querySelectorAll("input");
      inputs.forEach((input) => hideError(input));

      if (phoneData) {
        phoneData.iti?.setNumber("");
      }
    });
  }
};

export { initFormValidation };
