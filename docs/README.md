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

