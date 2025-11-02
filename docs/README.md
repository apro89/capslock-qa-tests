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



