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

  // Image gallery locators
  private get lightGalleryContainer(): Locator {
    return this.reviewsContainer.locator('[data-light-gallery]').first();
  }
  private get lightGalleryImages(): Locator {
    return this.lightGalleryContainer.locator('.review__img');
  }
  private get lightbox(): Locator {
    return this.page.locator('.lg-outer.lg-visible');
  }
  private get lightboxCloseButton(): Locator {
    return this.lightbox.locator('.lg-close');
  }
  private get lightboxCounter(): Locator {
    return this.lightbox.locator('#lg-counter');
  }

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

  // ============================================
  // Image Gallery Methods
  // ============================================

  /**
   * Gets the count of review images in the first gallery.
   * @returns Number of images in the gallery
   */
  async getReviewImageCount(): Promise<number> {
    await this.lightGalleryContainer.waitFor({ state: 'visible' });
    return await this.lightGalleryImages.count();
  }

  /**
   * Clicks on a review image gallery to open the lightbox.
   * @param imageIndex Optional index of the image to click (defaults to first)
   */
  async clickReviewImage(imageIndex: number = 0): Promise<void> {
    await this.lightGalleryImages.nth(imageIndex).waitFor({
      state: 'visible',
    });
    await this.lightGalleryImages.nth(imageIndex).click();
    // Wait for lightbox to appear
    await this.lightbox.waitFor({ state: 'visible', timeout: 2000 });
  }

  /**
   * Asserts that the lightbox/gallery is open and visible.
   */
  async expectLightboxVisible(): Promise<void> {
    await expect(this.lightbox).toBeVisible();
    await expect(this.lightbox).toHaveClass(/lg-visible/);
  }

  /**
   * Gets the current image index from the lightbox counter.
   * @returns Current image number (1-based)
   */
  async getCurrentImageIndex(): Promise<number> {
    const counterText = await this.lightboxCounter.textContent();
    const match = counterText?.match(/(\d+)\s*\/\s*\d+/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Gets the total image count from the lightbox counter.
   * @returns Total number of images
   */
  async getTotalImageCount(): Promise<number> {
    const counterText = await this.lightboxCounter.textContent();
    const match = counterText?.match(/\d+\s*\/\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Closes the lightbox/gallery.
   */
  async closeLightbox(): Promise<void> {
    await this.lightboxCloseButton.waitFor({ state: 'visible' });
    await this.lightboxCloseButton.click();
    // Wait for lightbox to close
    await this.lightbox
      .waitFor({ state: 'hidden', timeout: 1000 })
      .catch(() => {
        // Lightbox might use display: none, check via waitForFunction
      });
    await this.page.waitForFunction(
      () => {
        const lightbox = document.querySelector('.lg-outer.lg-visible');
        return !lightbox || lightbox.classList.contains('lg-visible') === false;
      },
      { timeout: 1000 },
    );
  }

  /**
   * Asserts that the lightbox shows the expected image index.
   * @param expectedIndex Expected image index (1-based)
   */
  async expectCurrentImageIndex(expectedIndex: number): Promise<void> {
    const currentIndex = await this.getCurrentImageIndex();
    expect(currentIndex).toBe(expectedIndex);
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
  get lightGalleryContainerLocator(): Locator {
    return this.lightGalleryContainer;
  }
  get lightGalleryImagesLocator(): Locator {
    return this.lightGalleryImages;
  }
  get lightboxLocator(): Locator {
    return this.lightbox;
  }
}
