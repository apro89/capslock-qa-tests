# Running Playwright Tests in Cursor

## Installation

### 1. Install Dependencies
First, install all project dependencies:
```bash
npm install
```

### 2. Install Playwright Browsers
After installing dependencies, install Playwright browsers:
```bash
npx playwright install
```

Or install with system dependencies (recommended for Linux):
```bash
npx playwright install --with-deps
```

## Quick Start

### Run Tests

**Option A: Using the Command Palette**
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac)
2. Type "Playwright: Run Tests"
3. Select the test file or test you want to run

**Option B: Using Terminal**
```bash
# Run all tests
npm test
# or
npx playwright test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/form.spec.ts

# Run specific test
npx playwright test tests/form.spec.ts -g "should successfully submit"
```

**HTML Report:**
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug Tests

**In UI Mode:**
```bash
npm run test:ui
```
- Step through tests interactively
- Time travel debugging
- Watch test execution

### Troubleshooting

**If browsers aren't installed:**
```bash
npx playwright install chromium
```

## Project Structure

This project uses a **Component-Based Page Object Model (POM)** approach for organizing test code.

```
capslock-qa-tests/
├── pages/                      # Page Objects and Components
│   ├── BasePage.ts            # Base class for all pages
│   ├── HomePage.ts            # Page object that composes components
│   └── components/            # Reusable component classes
│       ├── FormComponent.ts   # Form interaction logic
│       ├── LocationComponent.ts
│       ├── ReviewsComponent.ts
│       └── SliderComponent.ts
├── tests/                     # Test specifications
│   ├── form.spec.ts
│   ├── home-page.spec.ts
│   └── slider.spec.ts
├── utils/                     # Test utilities
│   └── testData.ts           # Test data and fixtures
├── docs/                      # Documentation
│   └── README.md
└── playwright.config.ts       # Playwright configuration
```

### Testing Approach: Component-Based POM

This project implements **Page Object Model** with a **composition pattern**, where:

1. **Pages** represent full pages and compose **Components**
   - Example: `HomePage` contains `slider`, `form`, `location`, and `reviews` components

2. **Components** are reusable, self-contained classes that:
   - Encapsulate locators (private)
   - Provide actions (public methods like `clickNext()`, `fillForm()`)
   - Include assertions (methods like `expectVisible()`, `expectSynchronized()`)

3. **Inheritance**: All pages extend `BasePage` for common functionality

4. **Usage in Tests**:
   ```typescript
   // Tests interact with pages and components
   homePage = new HomePage(page);
   await homePage.slider.clickNext();
   await homePage.form.fillAndSubmit(data);
   await homePage.reviews.expectCollapsed();
   ```

### Benefits

- ✅ **Reusability**: Components can be used across multiple pages
- ✅ **Maintainability**: Changes to UI elements are isolated to specific components
- ✅ **Readability**: Tests use high-level, domain-specific methods
- ✅ **Scalability**: Easy to add new pages or components without affecting existing code

## Test Scenarios - Why These Were Selected

I chose these test scenarios because they cover the most important user flows and critical business logic:

1. **Form Validation** - Forms collect user data. I test all validation rules (zip, email, phone) because wrong data breaks the business flow. These tests verify the app catches bad input before it causes problems.

2. **Slider Component** - The slider is a key visual element. I test navigation, image loading, and synchronization because broken sliders create bad user experience. Users need smooth navigation and matching images.

3. **Integration Flows** - I test full user journeys (like viewing slider then submitting form) because real users don't use one feature at a time. These tests catch bugs when components interact.

4. **Reviews Section** - Reviews build trust. I test expand/collapse and image gallery because users need to read reviews easily and view images without issues.

5. **Location Detection** - The app shows location-specific content. I test detection and display because wrong location means wrong information to users.

## Improvements for Scalability & Maintainability

Here's what could make this test project easier to grow and maintain:

1. **Test Data Management** - Move all test data to separate JSON/YAML files. Right now test data is in TypeScript files. Using data files makes it easier to update test cases without touching code.

2. **API Helpers** - Add API calls for setup and cleanup. Instead of only using the UI to prepare test data, use backend APIs when possible. This makes tests faster and more reliable.

3. **Test Configuration** - Create environment-specific configs (dev, staging, prod). Hardcoding URLs makes it hard to switch environments. A config file per environment solves this.

4. **Reusable Test Helpers** - Add a helpers folder with common utilities (wait strategies, retry logic, screenshot helpers). Many tests repeat the same logic - helpers reduce duplication.

5. **Better Error Messages** - Make assertion errors more helpful. When a test fails, it should tell you exactly what went wrong and where. Custom error messages save debugging time.

6. **Test Tags/Grouping** - Use Playwright tags to group tests (smoke, regression, slow). This lets you run only critical tests during CI/CD without running everything.

## Additional Valuable Improvements

Other improvements that would add real value:

1. **Visual Regression Testing** - Add screenshot comparisons for UI components. Catch visual bugs that functional tests miss. Tools like Percy or Playwright's screenshot features work well.

2. **Performance Testing** - Add basic performance checks (page load time, image load speed). Slow pages hurt user experience. Simple timing checks catch performance issues early.

3. **Accessibility Testing** - Add basic a11y checks using Playwright's accessibility features. Ensure the site is usable by everyone, including screen reader users.

4. **Cross-Browser Testing** - Currently only testing Chrome. Add Firefox and Safari configs. Different browsers behave differently, especially for CSS and JavaScript.

5. **CI/CD Integration** - Document how to run tests in GitHub Actions or similar. Automated test runs catch bugs before they reach production.

6. **Test Reports** - Improve HTML reports with screenshots, videos, and better grouping. Good reports make it faster to understand what broke.

7. **Page Load Waits** - Standardize how tests wait for pages to load. Some tests use different strategies. A consistent approach in BasePage would prevent flaky tests.

8. **Mocking/Stubbing** - For forms that redirect to external services, add ability to mock responses. This prevents tests from depending on external systems that might be down.

