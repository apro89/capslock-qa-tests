import { test, expect } from '@playwright/test';

import { FormPage } from '../pages/FormPage';
import {
  validFormData,
  invalidEmailFormats,
  invalidZipCodes,
  invalidPhoneNumbers,
} from '../utils/testData';

/**
 * Form Validation Tests - Based on REQUIREMENTS
 *
 * These tests are implemented according to the requirements, NOT the current
 * behavior of the page. If tests fail, it indicates a defect where the
 * implementation doesn't match the requirements.
 *
 * REQUIREMENTS:
 * 1. All fields are required - validation errors should be shown for all fields when empty
 * 2. Zip code: must contain exactly 5 digits
 * 3. Email: must match a valid email pattern (e.g., user@example.com)
 * 4. Phone number: must contain exactly 10 digits
 * 5. After successful submission, user must be redirected to "Thank you" page
 */
test.describe('Form Validation - Requirement-Based Tests', () => {
  let form: FormPage;

  test.beforeEach(async ({ page }) => {
    form = new FormPage(page);
    await form.goto('/');
  });

  // ============================================
  // Requirement 1: All fields are required
  // ============================================

  // ============================================
  // Requirement 2: Zip code must contain exactly 5 digits
  // ============================================
  test.describe('Zip Code Validation - Must Contain Exactly 5 Digits', () => {
    invalidZipCodes.forEach((invalidZip) => {
      const testName = `should reject zip code: ${invalidZip || 'empty'}`;
      test(testName, async () => {
        // REQUIREMENT: Zip code must contain exactly 5 digits
        // Arrange
        const invalidFormData = {
          zip: invalidZip,
        };

        // Act
        await form.fillForm(invalidFormData);

        // Assert - Should show validation error
        await form.expectValidationError('zip');
        await expect(form.emailInput).toBeHidden();
      });
    });

    test('should accept zip code with exactly 5 digits', async () => {
      // REQUIREMENT: Zip code with exactly 5 digits should be valid
      // Arrange - Valid 5-digit zip
      const validZipData = {
        zip: validFormData.zip,
      };

      // Act
      await form.fillForm(validZipData);
      await form.emailInput.waitFor({ state: 'visible' });

      // Assert - Should not show zip validation error
      const hasZipError = await form.errorMessages
        .filter({ hasText: /zip|wrong/i })
        .isVisible()
        .catch(() => false);
      expect(hasZipError).toBeFalsy();

      // Explicit assertion for Playwright static analysis
      await expect(form.emailInput).toBeVisible();
    });
  });

  // ============================================
  // Requirement 3: Email must match valid email pattern
  // ============================================
  test.describe('Email Format Validation - Must Match Valid Email Pattern', () => {
    invalidEmailFormats.forEach((invalidEmail) => {
      const testName = `should reject invalid email format: ${invalidEmail || 'empty'}`;
      test(testName, async () => {
        // REQUIREMENT: Email must match valid email pattern
        // Arrange
        const invalidFormData = {
          zip: validFormData.zip,
          email: invalidEmail,
        };

        // Act
        await form.fillForm(invalidFormData);

        // Assert - Should show validation error
        await form.expectValidationError('email');
        await expect(form.phoneInput).toBeHidden();
      });
    });

    test('should accept valid email format', async () => {
      // REQUIREMENT: Valid email format should be accepted
      // Arrange - Valid email
      const validEmailData = {
        zip: validFormData.zip,
        email: 'user@example.com',
      };

      // Act
      await form.fillForm(validEmailData);

      // Assert - Should not show email validation error
      const hasError = await form.errorMessages
        .filter({ hasText: /email|wrong/i })
        .isVisible()
        .catch(() => false);
      expect(hasError).toBeFalsy();

      // Explicit assertion for Playwright static analysis
      //await expect(form.phoneInput).toBeVisible();
    });
  });

  // ============================================
  // Requirement 4: Phone number must contain exactly 10 digits
  // ============================================
  test.describe('Phone Number Validation - Must Contain Exactly 10 Digits', () => {
    invalidPhoneNumbers.forEach((invalidPhone) => {
      const testName = `should reject phone number: ${invalidPhone || 'empty'}`;
      test(testName, async ({ page }) => {
        // REQUIREMENT: Phone number must contain exactly 10 digits
        // Arrange
        const invalidFormData = {
          ...validFormData,
          phone: invalidPhone,
        };

        // Act
        await form.fillAndSubmit(invalidFormData);

        // Assert - Should show validation error
        await form.expectValidationError('phone');
        // Explicit assertion for Playwright static analysis
        await expect(page).not.toHaveURL(/thank/i);
      });
    });

    test('should accept phone number with exactly 10 digits', async () => {
      // REQUIREMENT: Phone number with exactly 10 digits should be valid
      // Arrange - Valid 10-digit phone
      const validPhoneData = {
        ...validFormData,
        phone: '1234567890',
      };

      // Act
      await form.fillAndSubmit(validPhoneData);

      // Assert - Should not show phone validation error
      const hasError = await form.errorMessages
        .filter({ hasText: /phone/i })
        .isVisible()
        .catch(() => false);
      expect(hasError).toBeFalsy();

      await form.expectThankYouRedirect();
    });
  });

  // ============================================
  // Requirement 5: Successful submission redirects to "Thank you" page
  // ============================================
  test.describe('Successful Submission - Redirect to Thank You Page', () => {
    test('should redirect to thank you page after successful submission with all valid data', async ({
      page,
    }) => {
      // REQUIREMENT: After successful submission, user must be redirected to "Thank you" page
      // Arrange - All valid required fields
      const validData = {
        zip: validFormData.zip,
        email: validFormData.email,
        phone: validFormData.phone,
      };

      // Act
      await form.fillAndSubmit(validData);

      // Assert - Must redirect to thank you page
      await form.expectThankYouRedirect();
      // Explicit assertion for Playwright static analysis
      await expect(page).toHaveURL(/thank/i);
    });
  });
});
