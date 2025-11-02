import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Reusable Reviews Component.
 * Handles the reviews section with show more/less functionality.
 */
export class ReviewsComponent {
  private readonly page: Page;
  private readonly reviewsContainer: Locator;
  private readonly reviewFull: Locator;
  private readonly showMoreLessButton: Locator;
  private readonly showMoreLessText: Locator;

  /**
   * Creates a new ReviewsComponent instance.
   * @param page The Playwright page instance
   * @param containerSelector Optional container selector. If not provided, uses default reviews selector.
   */
  constructor(
    page: Page,
    containerSelector: string = '.reviewWrap.reviewWrap_type3',
  ) {
    this.page = page;
    this.reviewsContainer = page.locator(containerSelector).first();
    this.reviewFull = this.reviewsContainer.locator('.reviewFull').first();
    this.showMoreLessButton = this.reviewsContainer
      .locator('.moreless')
      .first();
    this.showMoreLessText = this.showMoreLessButton
      .locator('.moreless__txt')
      .first();
  }

  /**
   * Checks if the reviews section is expanded.
   * @returns True if expanded (has reviewWrap_opened class), false otherwise
   */
  async isExpanded(): Promise<boolean> {
    const classes = await this.reviewsContainer.getAttribute('class');
    return classes?.includes('reviewWrap_opened') || false;
  }

  /**
   * Gets the current text of the show more/less button.
   * @returns The button text ("Show more" or "Show less")
   */
  async getButtonText(): Promise<string> {
    await this.showMoreLessText.waitFor({ state: 'visible' });
    const text = await this.showMoreLessText.textContent();
    return text?.trim() || '';
  }

  /**
   * Clicks the show more/less button.
   */
  async toggleShowMoreLess(): Promise<void> {
    await this.showMoreLessButton.waitFor({ state: 'visible' });
    const isCurrentlyExpanded = await this.isExpanded();
    await this.showMoreLessButton.click();
    // Wait for state to change (collapsed to expanded or vice versa)
    await this.page.waitForFunction(
      (expectedExpanded: boolean) => {
        const container = document.querySelector(
          '.reviewWrap.reviewWrap_type3',
        );
        if (!container) return false;
        const hasOpenedClass =
          container.classList.contains('reviewWrap_opened');
        return hasOpenedClass === expectedExpanded;
      },
      !isCurrentlyExpanded,
      { timeout: 1000 },
    );
  }

  /**
   * Asserts that the reviews section is in collapsed state.
   * Verifies "Show more" button is visible and reviewFull is hidden.
   */
  async expectCollapsed(): Promise<void> {
    await expect(this.reviewsContainer).not.toHaveClass(/reviewWrap_opened/);
    await expect(this.showMoreLessText).toHaveText('Show more');
    // Wait for reviewFull to be hidden (display: none)
    await expect(this.reviewFull).toBeHidden();
  }

  /**
   * Asserts that the reviews section is in expanded state.
   * Verifies "Show less" button is visible and reviewFull is visible.
   */
  async expectExpanded(): Promise<void> {
    await expect(this.reviewsContainer).toHaveClass(/reviewWrap_opened/);
    await expect(this.showMoreLessText).toHaveText('Show less');
    // Verify reviewFull is visible
    await expect(this.reviewFull).toBeVisible();
  }

  /**
   * Asserts that the reviews container is visible.
   */
  async expectReviewsVisible(): Promise<void> {
    await expect(this.reviewsContainer).toBeVisible();
    await expect(this.showMoreLessButton).toBeVisible();
  }

  // Expose locators for tests
  get reviewsContainerLocator(): Locator {
    return this.reviewsContainer;
  }
  get reviewFullLocator(): Locator {
    return this.reviewFull;
  }
  get showMoreLessButtonLocator(): Locator {
    return this.showMoreLessButton;
  }
  get showMoreLessTextLocator(): Locator {
    return this.showMoreLessText;
  }
}
