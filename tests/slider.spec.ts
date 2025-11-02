import { test, expect } from '@playwright/test';

import { SliderComponent } from '../pages/components/SliderComponent';

/**
 * Slider Component Tests
 *
 * Tests for the product slider component, including:
 * - Slider initialization and visibility
 * - Navigation via prev/next buttons
 * - Navigation via thumbnail clicks
 * - Synchronization between main and preview sliders
 * - Slide transitions and image loading
 */
test.describe('Slider Component', () => {
  let slider: SliderComponent;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    slider = new SliderComponent(page);
  });

  // ============================================
  // Slider Initialization Tests
  // ============================================

  test.describe('Slider Initialization', () => {
    test('should display slider container on page load', async () => {
      // Assert - Slider container should be visible
      await slider.expectSliderVisible();
    });

    test('should display navigation buttons', async () => {
      // Assert - Navigation buttons should be visible
      await slider.expectNavigationButtonsVisible();
    });

    test('should initialize with at least one slide', async () => {
      // Assert - Should have at least one slide
      const slideCount = await slider.getTotalSlidesCount();
      expect(slideCount).toBeGreaterThan(0);
    });

    test('should have active slide on initialization', async () => {
      // Assert - Should have an active slide
      const activeIndex = await slider.getActiveSlideIndex();
      expect(activeIndex).toBeGreaterThanOrEqual(0);
    });

    test('should have main and preview sliders synchronized on load', async () => {
      // Assert - Main and preview sliders should be synchronized
      await slider.expectSlidersSynchronized();
    });

    test('should display matching images in active main and preview slides', async () => {
      // Assert - Active images should match between main and preview
      await slider.expectActiveImagesMatch();
    });

    test('should load images for visible slides', async () => {
      // Assert - Active slide image should be loaded
      const activeIndex = await slider.getActiveSlideIndex();
      await slider.expectSlideImageLoaded(activeIndex);
    });
  });

  // ============================================
  // Navigation via Buttons Tests
  // ============================================

  test.describe('Navigation via Previous/Next Buttons', () => {
    test('should navigate to next slide when clicking next button', async () => {
      // Arrange - Get initial active slide index
      const initialIndex = await slider.getActiveSlideIndex();
      const totalSlides = await slider.getTotalSlidesCount();
      const expectedNextIndex = (initialIndex + 1) % totalSlides;

      // Act - Click next button
      await slider.clickNext();

      // Assert - Should navigate to next slide
      await slider.expectActiveSlideIndex(expectedNextIndex);
    });

    test('should navigate to previous slide when clicking previous button', async () => {
      // Arrange - Get initial active slide index
      const initialIndex = await slider.getActiveSlideIndex();
      const totalSlides = await slider.getTotalSlidesCount();
      // Calculate expected previous index with wrap-around using modulo
      const expectedPrevIndex = (initialIndex - 1 + totalSlides) % totalSlides;

      // Act - Click previous button
      await slider.clickPrevious();

      // Assert - Should navigate to previous slide
      await slider.expectActiveSlideIndex(expectedPrevIndex);
    });

    test('should wrap around to first slide when clicking next on last slide', async () => {
      // Arrange - Navigate to last slide
      const totalSlides = await slider.getTotalSlidesCount();
      const lastSlideIndex = totalSlides - 1;

      // Navigate to last slide
      for (let i = 0; i < lastSlideIndex; i++) {
        await slider.clickNext();
      }

      // Act - Click next on last slide
      await slider.clickNext();

      // Assert - Should wrap to first slide (index 0)
      await slider.expectActiveSlideIndex(0);
    });

    test('should wrap around to last slide when clicking previous on first slide', async () => {
      // Arrange - Ensure we're on first slide
      const totalSlides = await slider.getTotalSlidesCount();
      await slider.expectActiveSlideIndex(0);

      // Act - Click previous on first slide
      await slider.clickPrevious();

      // Assert - Should wrap to last slide
      const expectedLastIndex = totalSlides - 1;
      await slider.expectActiveSlideIndex(expectedLastIndex);
    });

    test('should keep sliders synchronized after navigation', async () => {
      // Act - Navigate using next button
      await slider.clickNext();

      // Assert - Sliders should remain synchronized
      await slider.expectSlidersSynchronized();
      await slider.expectActiveImagesMatch();
    });

    test('should update active slide classes after navigation', async () => {
      // Act - Navigate to next slide
      await slider.clickNext();

      // Assert - Active slide should have correct classes
      await slider.expectActiveSlideClasses();
    });
  });

  // ============================================
  // Navigation via Thumbnail Clicks Tests
  // ============================================

  test.describe('Navigation via Preview Thumbnails', () => {
    test('should navigate to specific slide when clicking preview thumbnail', async () => {
      // Arrange - Get initial slide and target slide
      const initialIndex = await slider.getActiveSlideIndex();
      const targetIndex =
        (initialIndex + 2) % (await slider.getTotalSlidesCount());

      // Act - Click on target preview thumbnail
      await slider.clickPreviewThumbnail(targetIndex);

      // Assert - Should navigate to the clicked slide
      await slider.expectActiveSlideIndex(targetIndex);
    });

    test('should synchronize main slider when clicking preview thumbnail', async () => {
      // Arrange - Calculate target index
      const initialIndex = await slider.getActiveSlideIndex();
      const totalSlides = await slider.getTotalSlidesCount();
      const targetIndex = (initialIndex + 1) % totalSlides;

      // Act - Click preview thumbnail
      await slider.clickPreviewThumbnail(targetIndex);

      // Assert - Main and preview sliders should be synchronized
      await slider.expectSlidersSynchronized();
      await slider.expectActiveImagesMatch();
    });

    test('should navigate to first slide when clicking first thumbnail', async () => {
      // Arrange - Navigate away from first slide
      await slider.clickNext();

      // Act - Click first thumbnail
      await slider.clickPreviewThumbnail(0);

      // Assert - Should navigate to first slide
      await slider.expectActiveSlideIndex(0);
    });

    test('should navigate to last slide when clicking last thumbnail', async () => {
      // Arrange - Get total slides count
      const totalSlides = await slider.getTotalSlidesCount();
      const lastIndex = totalSlides - 1;

      // Act - Click last thumbnail
      await slider.clickPreviewThumbnail(lastIndex);

      // Assert - Should navigate to last slide
      await slider.expectActiveSlideIndex(lastIndex);
    });

    test('should update preview slider when navigating via thumbnails', async () => {
      // Arrange - Get target index
      const totalSlides = await slider.getTotalSlidesCount();
      const targetIndex = Math.floor(totalSlides / 2);

      // Act - Click middle thumbnail
      await slider.clickPreviewThumbnail(targetIndex);

      // Assert - Preview should show active state
      const activePreviewIndex = await slider.getActivePreviewIndex();
      expect(activePreviewIndex).toBe(targetIndex);
    });
  });

  // ============================================
  // Multiple Navigation Tests
  // ============================================

  test.describe('Multiple Navigation Actions', () => {
    test('should navigate through all slides sequentially', async () => {
      // Arrange - Get total slides count
      const totalSlides = await slider.getTotalSlidesCount();

      // Assert - Start at first slide
      await slider.expectActiveSlideIndex(0);

      // Act & Assert - Navigate through remaining slides
      for (let i = 1; i < totalSlides; i++) {
        await slider.clickNext();
        await slider.expectActiveSlideIndex(i);
      }
    });

    test('should maintain synchronization during multiple navigations', async () => {
      // Act - Perform multiple navigations
      await slider.clickNext();
      await slider.clickNext();
      await slider.clickPrevious();
      await slider.clickPreviewThumbnail(0);

      // Assert - Sliders should remain synchronized
      await slider.expectSlidersSynchronized();
      await slider.expectActiveImagesMatch();
    });

    test('should correctly handle rapid navigation', async () => {
      // Act - Rapidly click next multiple times
      for (let i = 0; i < 3; i++) {
        await slider.clickNext();
      }

      // Assert - Should be on correct slide after rapid navigation
      const activeIndex = await slider.getActiveSlideIndex();
      expect(activeIndex).toBe(3);
      await slider.expectSlidersSynchronized();
    });
  });

  // ============================================
  // Image Loading Tests
  // ============================================

  test.describe('Image Loading', () => {
    test('should load images for all slides', async () => {
      // Arrange - Get total slides count
      const totalSlides = await slider.getTotalSlidesCount();

      // Assert - First slide image is loaded
      await slider.expectSlideImageLoaded(0);

      // Act & Assert - Navigate and check remaining slides
      for (let i = 1; i < totalSlides; i++) {
        await slider.clickNext();
        await slider.expectSlideImageLoaded(i);
      }
    });

    test('should have valid image sources for all slides', async () => {
      // Arrange - Get total slides count
      const totalSlides = await slider.getTotalSlidesCount();

      // Assert - First slide has valid image source
      let imageSrc = await slider.getActiveSlideImageSrc();
      expect(imageSrc).toBeTruthy();
      expect(imageSrc).toContain('.jpg');

      // Act & Assert - Navigate and check remaining slides
      for (let i = 1; i < totalSlides; i++) {
        await slider.clickNext();
        imageSrc = await slider.getActiveSlideImageSrc();
        expect(imageSrc).toBeTruthy();
        expect(imageSrc).toContain('.jpg');
      }
    });
  });
});
