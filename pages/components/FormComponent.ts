import { expect, type Locator, type Page } from '@playwright/test';

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
 * Reusable Form Component.
 * Can be used on any page that contains a form with the specified structure.
 * Implements tests based on REQUIREMENTS, not current implementation.
 */
export class FormComponent {
  private readonly page: Page;
  private readonly formContainer: Locator;

  /**
   * Creates a new FormComponent instance.
   * @param page The Playwright page instance
   * @param containerSelector Optional container selector. If not provided, uses default form selector.
   */
  constructor(page: Page, containerSelector: string = '.formWrap_quiz') {
    this.page = page;
    this.formContainer = page.locator(containerSelector).first();
  }

  // Form field locators (flexible selectors to find fields regardless of step)
  private get zipInput(): Locator {
    return this.formContainer.locator('input[data-zip-code-input]').first();
  }
  private get emailInput(): Locator {
    return this.formContainer
      .locator('input[name="email"][placeholder="Email Address"]')
      .first();
  }
  private get phoneInput(): Locator {
    return this.formContainer
      .locator('input[data-phone-input], input[name="phone"]')
      .first();
  }
  private get nextButton(): Locator {
    return this.formContainer.locator('button:has-text("Next")').first();
  }

  // Submit button (only visible)
  private get submitButton(): Locator {
    return this.formContainer.getByRole('button', {
      name: /submit/i,
    });
  }

  // Error message locators (flexible to find errors anywhere in form)
  private get errorMessages(): Locator {
    return this.formContainer.locator('[data-error-block]');
  }

  /**
   * Maps field names to their corresponding input locators.
   */
  private readonly fieldMap: Record<FormFieldName, () => Locator> = {
    zip: () => this.zipInput,
    email: () => this.emailInput,
    phone: () => this.phoneInput,
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
      // Wait for email input to be visible (form transitioned)
      await this.emailInput.waitFor({ state: 'visible' });
      await this.emailInput.fill(data.email);

      await this.submitButton.click();
    }

    // Fill phone (usually last step)
    if (data.phone !== undefined) {
      // Wait for phone input to be visible
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

  // Expose readonly access to form elements for tests that need them
  get zipInputLocator(): Locator {
    return this.zipInput;
  }
  get emailInputLocator(): Locator {
    return this.emailInput;
  }
  get phoneInputLocator(): Locator {
    return this.phoneInput;
  }

  // Expose error messages locator for tests
  get errorMessagesLocator(): Locator {
    return this.errorMessages;
  }
}
