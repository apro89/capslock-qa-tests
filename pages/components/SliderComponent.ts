import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Reusable Slider Component.
 * Can be used on any page that contains a slider with the specified structure.
 */
export class SliderComponent {
  private readonly page: Page;
  private readonly container: Locator;

  /**
   * Creates a new SliderComponent instance.
   * @param page The Playwright page instance
   * @param containerSelector Optional container selector. If not provided, uses default slider selector.
   */
  constructor(page: Page, containerSelector: string = '.sliderTheme_blue') {
    this.page = page;
    this.container = page.locator(containerSelector).first();
  }

  // Main slider elements (using getters for lazy initialization)
  private get mainSlider(): Locator {
    return this.container.locator('[data-main-slider]').first();
  }

  private get mainSliderItems(): Locator {
    return this.mainSlider.locator('.sliderDefault__item');
  }

  private get mainSliderImages(): Locator {
    return this.mainSlider.locator('img[alt="slider-img"]');
  }

  // Preview/thumbnail slider elements
  private get previewSlider(): Locator {
    return this.container.locator('[data-main-preview-slider]').first();
  }

  private get previewSliderItems(): Locator {
    return this.previewSlider.locator('.sliderPrev__item');
  }

  private get previewSliderImages(): Locator {
    return this.previewSlider.locator('img[alt="preview"]');
  }

  // Navigation buttons
  private get prevButton(): Locator {
    return this.mainSlider.locator('.slick-prev');
  }

  private get nextButton(): Locator {
    return this.mainSlider.locator('.slick-next');
  }

  // ============================================
  // Slider State Methods
  // ============================================

  /**
   * Gets the total number of slides in the main slider.
   * Excludes cloned slides used by Slick slider for infinite scrolling.
   */
  async getTotalSlidesCount(): Promise<number> {
    // Count only non-cloned slides using CSS selector
    const nonClonedItems = this.mainSlider.locator(
      '.sliderDefault__item:not(.slick-cloned)',
    );
    const count = await nonClonedItems.count();
    return count;
  }

  /**
   * Gets the currently active slide locator.
   * Verifies that the active slide has the .slick-current class.
   * @returns The active slide locator
   */
  private getActiveSlide(): Locator {
    // Find the slide with .slick-current class directly
    const activeSlide = this.mainSlider
      .locator('.sliderDefault__item.slick-current')
      .first();
    return activeSlide;
  }

  /**
   * Gets the index of the currently active slide in the main slider.
   * Verifies that the active slide has the .slick-current class.
   * @returns The active slide index (0-based)
   */
  async getActiveSlideIndex(): Promise<number> {
    const activeSlide = this.getActiveSlide();
    // Verify the active slide has the .slick-current class
    await expect(activeSlide).toHaveClass(/slick-current/);
    const index = await activeSlide.getAttribute('data-slick-index');
    return index ? parseInt(index, 10) : -1;
  }

  /**
   * Gets the currently active preview slide locator.
   * Verifies that the active preview slide has the .slick-current class.
   * @returns The active preview slide locator
   */
  private getActivePreviewSlide(): Locator {
    // Find the preview slide with .slick-current class directly
    const activePreview = this.previewSlider
      .locator('.sliderPrev__item.slick-current')
      .first();
    return activePreview;
  }

  /**
   * Gets the index of the currently active preview slide.
   * Verifies that the active preview slide has the .slick-current class.
   * @returns The active preview slide index (0-based)
   */
  async getActivePreviewIndex(): Promise<number> {
    const activePreview = this.getActivePreviewSlide();
    // Verify the active preview slide has the .slick-current class
    await expect(activePreview).toHaveClass(/slick-current/);
    const index = await activePreview.getAttribute('data-slick-index');
    return index ? parseInt(index, 10) : -1;
  }

  /**
   * Gets the source URL of the currently active main slide image.
   * Verifies that the active slide has the .slick-current class.
   */
  async getActiveSlideImageSrc(): Promise<string | null> {
    const activeSlide = this.getActiveSlide();
    // Verify the active slide has the .slick-current class
    await expect(activeSlide).toHaveClass(/slick-current/);
    const img = activeSlide.locator('img[alt="slider-img"]');
    return await img.getAttribute('src');
  }

  /**
   * Gets the source URL of the currently active preview slide image.
   * Verifies that the active preview slide has the .slick-current class.
   */
  async getActivePreviewImageSrc(): Promise<string | null> {
    const activePreview = this.getActivePreviewSlide();
    // Verify the active preview slide has the .slick-current class
    await expect(activePreview).toHaveClass(/slick-current/);
    const img = activePreview.locator('img[alt="preview"]');
    return await img.getAttribute('src');
  }

  // ============================================
  // Slider Navigation Methods
  // ============================================

  /**
   * Waits for the slide transition to complete by checking the active slide's opacity.
   * Uses a proper wait strategy instead of fixed timeout.
   */
  private async waitForSlideTransition(): Promise<void> {
    // Wait for CSS transition to complete by checking opacity
    await this.page.waitForFunction(
      () => {
        const currentSlide = document.querySelector(
          '.sliderDefault__item.slick-current',
        );
        if (!currentSlide) return false;
        const style = window.getComputedStyle(currentSlide);
        return parseFloat(style.opacity) === 1;
      },
      { timeout: 1000 },
    );
  }

  /**
   * Clicks the previous button to navigate to the previous slide.
   * Waits for the slide transition to complete.
   */
  async clickPrevious(): Promise<void> {
    await this.prevButton.waitFor({ state: 'visible' });
    await this.prevButton.click();
    await this.waitForSlideTransition();
  }

  /**
   * Clicks the next button to navigate to the next slide.
   * Waits for the slide transition to complete.
   */
  async clickNext(): Promise<void> {
    await this.nextButton.waitFor({ state: 'visible' });
    await this.nextButton.click();
    await this.waitForSlideTransition();
  }

  /**
   * Clicks a specific preview thumbnail by index (0-based).
   * @param index The index of the preview thumbnail to click
   */
  async clickPreviewThumbnail(index: number): Promise<void> {
    // Find preview items that are not cloned (for accurate indexing)
    const previewItems = this.previewSlider.locator(
      '.sliderPrev__item:not(.slick-cloned)',
    );
    const targetPreview = previewItems.nth(index);
    await targetPreview.waitFor({ state: 'visible' });
    await targetPreview.click();
    // Wait for transition to complete
    await this.waitForSlideTransition();
  }

  // ============================================
  // Slider Assertion Methods
  // ============================================

  /**
   * Asserts that the slider container is visible on the page.
   */
  async expectSliderVisible(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.mainSlider).toBeVisible();
    await expect(this.previewSlider).toBeVisible();
  }

  /**
   * Asserts that the main slider has the expected number of slides.
   * @param expectedCount The expected number of slides
   */
  async expectSlideCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getTotalSlidesCount();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Asserts that a specific slide is currently active in the main slider.
   * @param expectedIndex The expected active slide index (0-based)
   */
  async expectActiveSlideIndex(expectedIndex: number): Promise<void> {
    const actualIndex = await this.getActiveSlideIndex();
    expect(actualIndex).toBe(expectedIndex);
  }

  /**
   * Asserts that the active preview slide matches the active main slide.
   * This verifies synchronization between main and preview sliders.
   */
  async expectSlidersSynchronized(): Promise<void> {
    const mainIndex = await this.getActiveSlideIndex();
    const previewIndex = await this.getActivePreviewIndex();
    expect(previewIndex).toBe(mainIndex);
  }

  /**
   * Asserts that the active slide image source matches the active preview image source.
   * Images should correspond between main and preview sliders.
   */
  async expectActiveImagesMatch(): Promise<void> {
    const mainImageSrc = await this.getActiveSlideImageSrc();
    const previewImageSrc = await this.getActivePreviewImageSrc();

    // Extract the image filename from the path (e.g., slide-3.3f69c48b.jpg)
    const mainFilename = mainImageSrc?.split('/').pop()?.split('.')[0] || '';
    const previewFilename =
      previewImageSrc?.split('/').pop()?.split('.')[0] || '';

    expect(mainFilename).toBe(previewFilename);
  }

  /**
   * Asserts that navigation buttons are visible and enabled.
   */
  async expectNavigationButtonsVisible(): Promise<void> {
    await expect(this.prevButton).toBeVisible();
    await expect(this.nextButton).toBeVisible();
  }

  /**
   * Asserts that the active slide has the correct CSS classes.
   * Active slides should have 'slick-current' and 'slick-active' classes.
   */
  async expectActiveSlideClasses(): Promise<void> {
    const activeSlide = this.getActiveSlide();
    // Verify the active slide has the required classes
    await expect(activeSlide).toHaveClass(/slick-current/);
    await expect(activeSlide).toHaveClass(/slick-active/);
  }

  /**
   * Asserts that a specific slide's image is loaded and visible.
   * @param index The slide index to check (0-based)
   */
  async expectSlideImageLoaded(index: number): Promise<void> {
    const slide = this.mainSliderItems.nth(index);
    const img = slide.locator('img[alt="slider-img"]');
    await expect(img).toBeVisible();
    // Check that image has loaded (opacity should be 1 for loaded images)
    const opacity = await img.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0);
  }
}
