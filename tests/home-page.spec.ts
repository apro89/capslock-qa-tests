import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { validFormData } from '../utils/testData';

/**
 * Home Page E2E Integration Tests
 *
 * These tests verify the integration of components on the home page
 * and test complete user flows using the HomePage object.
 * Demonstrates the composition pattern for component-based POM.
 */
test.describe('Home Page - E2E Integration Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto('/');
  });

  // ============================================
  // Page Initialization Tests
  // ============================================

  test('should load home page successfully', async () => {
    // Assert - Page loaded with all components visible
    await expect(homePage.location.locationContainerLocator).toBeVisible();
    await homePage.slider.expectSliderVisible();
  });

  // ============================================
  // Location Component Tests
  // ============================================

  test('should display location container with "Available in" text', async () => {
    // Arrange & Act - Page is already loaded in beforeEach
    // Assert - Location container should be visible
    await expect(homePage.location.locationContainerLocator).toBeVisible();
    await expect(homePage.location.locationContainerLocator).toContainText(
      'Available in',
    );
  });

  test('should detect and display the city name dynamically', async () => {
    // Arrange & Act - Page is already loaded in beforeEach
    // Act - Dynamically detect the city name from the page
    const detectedCity =
      await homePage.location.expectLocationDetectedAndDisplayed();

    // Assert - City name should be detected and not empty
    expect(detectedCity).toBeTruthy();
    expect(detectedCity.trim().length).toBeGreaterThan(0);

    // Log the detected city for visibility in test output
    console.log(`Detected city: ${detectedCity}`);
  });

  test('should verify detected city is correctly displayed in location selector', async () => {
    // Arrange & Act - Page is already loaded in beforeEach
    // Detect the city name from the page
    const detectedCity = await homePage.location.getDetectedCity();

    // Assert - City should be detected and displayed correctly
    expect(detectedCity).toBeTruthy();
    await expect(homePage.location.locationCityLocator).toHaveText(
      detectedCity,
    );

    // Verify the city appears in the full location container text
    const containerText =
      await homePage.location.locationContainerLocator.textContent();
    expect(containerText).toContain('Available in');
    expect(containerText).toContain(detectedCity);
  });

  test('should have correct location structure with data attributes', async () => {
    // Arrange & Act - Page is already loaded in beforeEach
    // Assert - Location city should have the correct data attribute and class
    await expect(homePage.location.locationCityLocator).toBeVisible();
    await expect(homePage.location.locationCityLocator).toHaveAttribute(
      'data-location-city-and-state',
      '',
    );
    await expect(homePage.location.locationCityLocator).toHaveClass(
      /locationCityAndState/,
    );

    // Verify that the detected city is displayed in the element with correct structure
    const detectedCity = await homePage.location.getDetectedCity();
    expect(detectedCity).toBeTruthy();
  });

  // ============================================
  // Component Integration Tests
  // ============================================

  test('should allow concurrent interactions with slider and location', async () => {
    // Act - Interact with slider
    await homePage.slider.clickNext();
    await homePage.slider.expectSlidersSynchronized();

    // Act - Interact with location
    const detectedCity = await homePage.location.getDetectedCity();

    // Assert - Both components remain functional after concurrent use
    expect(detectedCity).toBeTruthy();
    await homePage.slider.expectActiveImagesMatch();
  });

  // ============================================
  // Complete User Flow Tests
  // ============================================

  test('should complete full user journey: view slider and submit form', async ({
    page,
  }) => {
    // Arrange - Page loaded with components
    await homePage.slider.expectSliderVisible();
    await homePage.location.locationContainerLocator.waitFor({
      state: 'visible',
    });

    // Act - User interacts with slider
    await homePage.slider.clickNext();
    await homePage.slider.expectSlidersSynchronized();

    // Act - User fills and submits form
    await homePage.form.fillAndSubmit(validFormData);

    // Assert - Form submission successful
    await homePage.form.expectThankYouRedirect();
    await expect(page).toHaveURL(/thank/i);
  });

  test('should navigate slider multiple times and then fill form', async () => {
    // Act - Navigate slider multiple times
    await homePage.slider.clickNext();
    await homePage.slider.clickNext();
    await homePage.slider.clickPrevious();

    // Assert - Slider navigation successful
    await homePage.slider.expectSlidersSynchronized();
    await homePage.slider.expectActiveImagesMatch();

    // Act - Fill form (partial fill to verify form is still accessible)
    await homePage.form.fillForm({ zip: validFormData.zip });

    // Assert - Form interaction successful
    await expect(homePage.form.emailInputLocator).toBeVisible();
  });
});
