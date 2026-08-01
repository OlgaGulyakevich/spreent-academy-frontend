/**
 * @fileoverview Behaviour tests for the footer form validation (name + email).
 * Tests through the public `initFormValidation` entry — we simulate real user
 * events (blur/input/submit) and assert what the user sees (error text, is-invalid
 * state), never the internal helpers. The phone field is intentionally omitted from
 * the DOM: its validation is intl-tel-input's job (covered by Playwright e2e with a
 * real browser + libphonenumber), not ours to unit-test.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { initFormValidation } from "./form-validation";

const EMAIL_INVALID_MESSAGE = "Enter a valid email address";
const NAME_MISSING_MESSAGE = "Enter your name";

/** Builds the minimal footer-form DOM (name + email, no phone) and returns nothing. */
const setupForm = (): void => {
  document.body.innerHTML = `
    <div class="footer__form-container">
      <form action="https://echo.htmlacademy.ru" method="POST">
        <fieldset>
          <div class="footer__form-field">
            <label class="visually-hidden" for="form-name">Name</label>
            <input id="form-name" type="text" name="name" required minlength="2" />
            <span class="footer__form-error" aria-live="polite"></span>
          </div>
          <div class="footer__form-field">
            <label class="visually-hidden" for="form-email">Email</label>
            <input
              id="form-email"
              type="email"
              name="email"
              required
              pattern="[^@\\s]+@[^@\\s]+\\.[^@\\s]+"
            />
            <span class="footer__form-error" aria-live="polite"></span>
          </div>
        </fieldset>
        <button type="submit">Send Request</button>
      </form>
    </div>
  `;
};

/**
 * Returns the input by id, throwing if absent — keeps tests free of `!` while
 * still giving TS a non-null HTMLInputElement.
 */
const getInput = (id: string): HTMLInputElement => {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) {
    throw new Error(`Missing input #${id}`);
  }
  return input;
};

/**
 * Returns the error text the user actually sees — empty when the error isn't visible.
 * hideError() only toggles the `.is-visible` class (CSS hides it); it doesn't clear the
 * span's textContent, so we key off visibility, not the raw text.
 */
const getErrorText = (id: string): string => {
  const errorEl = getInput(id)
    .closest(".footer__form-field")
    ?.querySelector(".footer__form-error");
  if (!errorEl?.classList.contains("is-visible")) {
    return "";
  }
  return errorEl.textContent ?? "";
};

/** Returns the form element, throwing if absent. */
const getForm = (): HTMLFormElement => {
  const form = document.querySelector("form");
  if (!form) {
    throw new Error("Missing form");
  }
  return form;
};

describe("footer form validation", () => {
  beforeEach(() => {
    setupForm();
    initFormValidation();
  });

  it("shows an error when the email is invalid on blur", () => {
    const email = getInput("form-email");
    email.value = "notanemail";
    email.dispatchEvent(new Event("blur"));

    expect(getErrorText("form-email")).toBe(EMAIL_INVALID_MESSAGE);
    expect(email.classList.contains("is-invalid")).toBe(true);
  });

  it("clears the error once the email becomes valid while typing", () => {
    const email = getInput("form-email");
    email.value = "notanemail";
    email.dispatchEvent(new Event("blur"));
    expect(email.classList.contains("is-invalid")).toBe(true);

    email.value = "user@example.com";
    email.dispatchEvent(new Event("input"));

    expect(email.classList.contains("is-invalid")).toBe(false);
    expect(getErrorText("form-email")).toBe("");
  });

  it("trims surrounding whitespace and accepts the address", () => {
    const email = getInput("form-email");
    email.value = "  user@example.com  ";
    email.dispatchEvent(new Event("blur"));

    expect(email.value).toBe("user@example.com");
    expect(email.classList.contains("is-invalid")).toBe(false);
  });

  it("blocks submit and reports the first empty field", () => {
    const submitEvent = new Event("submit", { cancelable: true });
    getForm().dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(getErrorText("form-name")).toBe(NAME_MISSING_MESSAGE);
  });

  it("allows submit when every field is valid", () => {
    getInput("form-name").value = "John Doe";
    getInput("form-email").value = "john@example.com";

    const submitEvent = new Event("submit", { cancelable: true });
    getForm().dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(false);
  });
});
