import { expect, type Locator } from '@playwright/test';

import { BasePage } from './BasePage';

/**
 * Form field names based on requirements.
 * According to requirements: zip, email, and phone fields are required.
 */
export type FormFieldName = 'zip' | 'email' | 'phone';

/**
 * Data structure for form field values.
 * All fields are optional to support partial form filling during testing.
 */
export interface FormData {
  zip?: string;
  email?: string;
  phone?: string;
}

/**
 * Page Object for form pages.
 * Implements tests based on REQUIREMENTS, not current implementation.
 * Tests will fail if implementation doesn't match requirements (indicating defects).
 */
export class FormPage extends BasePage {
  // Form container selector (handles multiple forms on page)
  readonly formContainer: Locator = this.page.locator('.formWrap_quiz').first();

  // Form field locators (flexible selectors to find fields regardless of step)
  readonly zipInput: Locator = this.formContainer
    .locator('input[data-zip-code-input]')
    .first();
  readonly emailInput: Locator = this.formContainer
    .locator('input[name="email"][placeholder="Email Address"]')
    .first();
  readonly phoneInput: Locator = this.formContainer
    .locator('input[data-phone-input], input[name="phone"]')
    .first();
  readonly nextButton: Locator = this.formContainer
    .locator('button:has-text("Next")')
    .first();

  // Submit button (only visible)
  readonly submitButton: Locator = this.formContainer.getByRole('button', {
    name: /submit/i,
  });

  // Error message locators (flexible to find errors anywhere in form)
  readonly errorMessages: Locator =
    this.formContainer.locator('[data-error-block]');

  /**
   * Maps field names to their corresponding input locators.
   */
  private readonly fieldMap: Record<FormFieldName, Locator> = {
    zip: this.zipInput,
    email: this.emailInput,
    phone: this.phoneInput,
  };

  /**
   * Maps field names to their expected error messages.
   * Each field has two possible messages: empty field vs invalid format.
   */
  private readonly errorMessageMap: {
    zip: { invalid: string; empty: string };
    email: { invalid: string; empty: string };
    phone: { invalid: string; empty: string };
  } = {
    zip: {
      invalid: 'Wrong ZIP code.',
      empty: 'Enter your ZIP code.',
    },
    email: {
      invalid: 'Wrong email.',
      empty: 'Enter your email address.',
    },
    phone: {
      invalid: 'Wrong phone number.',
      empty: 'Enter your phone number.',
    },
  };

  // ============================================
  // Form Actions - Fill, Clear, Submit
  // ============================================

  /**
   * Fills form fields with provided data.
   * Navigates through form steps as needed to fill all fields.
   */
  async fillForm(data: FormData): Promise<void> {
    // Fill ZIP first (usually step 1)
    if (data.zip !== undefined) {
      await this.zipInput.waitFor({ state: 'visible' });
      await this.zipInput.fill(data.zip);

      await this.nextButton.click();
    }

    // Fill email (might be in step 4 or sorry step)
    if (data.email !== undefined) {
      await this.emailInput.waitFor({ state: 'visible' });
      await this.emailInput.fill(data.email);

      //await this.nextButton.click();
      await this.submitButton.click();
    }

    // Fill phone (usually last step)
    if (data.phone !== undefined) {
      await this.phoneInput.waitFor({ state: 'visible' });
      await this.phoneInput.fill(data.phone);
    }
  }

  /**
   * Submits the form by clicking the submit button.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(/thank/i, { timeout: 10000 });
  }

  /**
   * Fills the form and submits it in one action.
   */
  async fillAndSubmit(data: FormData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  /**
   * Asserts that a specific form field shows a validation error.
   * REQUIREMENT: All fields must be required and show validation errors when invalid.
   */
  async expectValidationError(fieldName: FormFieldName): Promise<void> {
    // Get error messages for the field (both invalid and empty cases)
    const fieldErrors = this.errorMessageMap[fieldName];
    const expectedErrorMessages = [fieldErrors.invalid, fieldErrors.empty];

    // Create a combined case-insensitive regex that matches any of the expected messages
    const combinedRegex = new RegExp(
      expectedErrorMessages
        .map((msg: string) => msg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'i',
    );

    // Check for div with data-error-block attribute that contains any of the expected messages
    const errorBlock = this.errorMessages.filter({ hasText: combinedRegex });

    // Assert that the error block is visible
    await expect(errorBlock).toBeVisible();
  }

  /**
   * Asserts that form submission was successful.
   * REQUIREMENT: After successful submission, user must be redirected to "Thank you" page.
   */
  async expectThankYouRedirect(): Promise<void> {
    await this.page.waitForURL(/thank/i, { timeout: 10000 });
    await expect(this.page).toHaveURL(/thank/i);
  }
}
