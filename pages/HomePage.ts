import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { FormComponent } from './components/FormComponent';
import { LocationComponent } from './components/LocationComponent';
import { SliderComponent } from './components/SliderComponent';

/**
 * Home Page Object that uses reusable components.
 * Demonstrates composition pattern for component-based POM.
 */
export class HomePage extends BasePage {
  // Compose components that appear on the home page
  readonly slider: SliderComponent;
  readonly form: FormComponent;
  readonly location: LocationComponent;

  constructor(page: Page) {
    super(page);
    // Initialize components for this page
    this.slider = new SliderComponent(page);
    this.form = new FormComponent(page);
    this.location = new LocationComponent(page);
  }

  // Other page-specific elements and methods would go here
  // For example:
  // readonly header = this.page.locator('header');
  // readonly footer = this.page.locator('footer');
}
