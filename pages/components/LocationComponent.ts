import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Reusable Location Component.
 * Can be used on any page that displays location information.
 */
export class LocationComponent {
  private readonly page: Page;
  private readonly locationContainer: Locator;
  private readonly locationCity: Locator;

  /**
   * Creates a new LocationComponent instance.
   * @param page The Playwright page instance
   * @param containerSelector Optional container selector. If not provided, uses default location selector.
   */
  constructor(page: Page, containerSelector: string = '.location__city') {
    this.page = page;
    this.locationContainer = page.locator(containerSelector).first();
    this.locationCity = this.locationContainer
      .locator('span[data-location-city-and-state].locationCityAndState')
      .first();
  }

  /**
   * Gets the detected city name from the location selector.
   * @returns The city name displayed on the page
   */
  async getDetectedCity(): Promise<string> {
    await this.locationCity.waitFor({ state: 'visible' });
    const cityText = await this.locationCity.textContent();
    return cityText?.trim() || '';
  }

  /**
   * Asserts that the location element is visible and displays the correct city.
   */
  async expectLocationDisplayed(cityName: string): Promise<void> {
    await expect(this.locationContainer).toBeVisible();
    await expect(this.locationContainer).toContainText('Available in');
    await expect(this.locationCity).toBeVisible();
    await expect(this.locationCity).toHaveText(cityName.trim());
  }

  /**
   * Asserts that the location element is visible and displays a detected city.
   * This method detects the city dynamically from the page and verifies it's displayed.
   */
  async expectLocationDetectedAndDisplayed(): Promise<string> {
    // Assert - Location container should be visible
    await expect(this.locationContainer).toBeVisible();
    await expect(this.locationContainer).toContainText('Available in');

    // Assert - City name element should be visible
    await expect(this.locationCity).toBeVisible();

    // Detect the city name
    const detectedCity = await this.getDetectedCity();

    // Assert that the detected city is actually displayed in the element
    await expect(this.locationCity).toHaveText(detectedCity);

    return detectedCity;
  }

  // Expose locators for tests
  get locationContainerLocator(): Locator {
    return this.locationContainer;
  }
  get locationCityLocator(): Locator {
    return this.locationCity;
  }
}
