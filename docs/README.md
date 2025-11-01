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

```
/pages — page objects

/tests — test suites

/utils — test data, helpers

/docs — documentation
```

## Useful Commands

```bash
# List all browsers
npx playwright install --list

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with trace viewer
npx playwright test --trace on

# Show last test report
npx playwright show-report
```

## Test Scenario Selection and Improvements

### Why These Scenarios Were Selected

The test scenarios were carefully selected based on the specified requirements for form validation, focusing on critical user-facing functionality and boundary conditions:

1. **ZIP Code Validation (Exactly 5 Digits)**: This scenario tests a specific business rule where ZIP codes must be exactly 5 digits. The tests cover both valid cases and multiple invalid edge cases (too few digits, too many digits, non-numeric characters, empty values) to ensure robust validation.

2. **Email Format Validation**: Email validation is critical for data quality and user communication. The tests validate proper email format patterns and reject common invalid formats, ensuring only valid email addresses are accepted.

3. **Phone Number Validation (Exactly 10 Digits)**: Similar to ZIP code, this tests a precise business rule requiring exactly 10 digits. This prevents data entry errors and ensures consistent data format for downstream processing.

4. **Successful Submission Flow**: Testing the complete happy path ensures that when all validation passes, the user is properly redirected to a confirmation page, completing the user journey successfully.

These scenarios use **requirement-based testing** - the tests are written against the requirements rather than the current implementation. This approach helps identify defects where the implementation doesn't match the specified requirements, making the tests more valuable as specification documentation.

### Improvements for Scalability and Maintainability

To make this test project more scalable and maintainable, consider the following improvements:

1. **Test Data Management**
   - Move test data to external files (JSON, CSV) or a test data factory pattern for easier updates
   - Implement data-driven testing with fixtures for reusable test scenarios
   - Add support for test data generation for large-scale testing

2. **Configuration Management**
   - Extract environment-specific configurations (base URLs, timeouts, browser settings) to configuration files
   - Support multiple environments (dev, staging, production) through environment variables
   - Centralize test configuration in a config module

3. **Test Organization**
   - Implement test tagging/grouping for better test selection (smoke, regression, e2e)
   - Separate unit-style component tests from integration tests
   - Add test suites organized by feature or user journey

4. **Reporting and CI/CD Integration**
   - Integrate with CI/CD pipelines (GitHub Actions, Jenkins, etc.)
   - Add test result reporting to external tools (TestRail, Allure, etc.)
   - Implement screenshot/video capture on failures for better debugging
   - Add test metrics and trending (pass rates, flakiness detection)

5. **Page Object Model Enhancements**
   - Create base page classes with common functionality to reduce duplication
   - Implement component objects for reusable UI elements (buttons, inputs, modals)
   - Add wait strategies and retry mechanisms for flaky elements

6. **Test Utilities and Helpers**
   - Create helper functions for common operations (API calls, database cleanup)
   - Add utility functions for test data generation and manipulation
   - Implement custom assertions for domain-specific validations

### Additional Valuable Improvements

1. **API Testing Integration**: Add API-level tests to validate backend functionality independently of UI, providing faster feedback and better test coverage.

2. **Cross-Browser and Cross-Platform Testing**: Expand browser coverage (Firefox, Safari, Edge) and test on different operating systems to ensure compatibility.

3. **Performance Testing**: Add tests for form load times, submission response times, and overall page performance metrics.

4. **Accessibility Testing**: Integrate accessibility checks (WCAG compliance) to ensure the form is usable by all users, including those with disabilities.

5. **Visual Regression Testing**: Add screenshot comparison tests to catch unintended UI changes across releases.

6. **Parallel Execution**: Configure Playwright for parallel test execution to reduce overall test suite runtime.

7. **Test Retry Strategy**: Implement intelligent retry mechanisms for flaky tests while maintaining fast feedback for genuine failures.

8. **Test Documentation**: Enhance inline documentation in test files, add test case descriptions, and maintain a test matrix showing coverage.

9. **Mocking and Stubbing**: Add capability to mock external services or APIs for more reliable and faster tests in isolated environments.

10. **Test Maintenance**: Implement regular test review processes to identify and remove obsolete tests, update selectors when UI changes, and refactor tests for better maintainability.

