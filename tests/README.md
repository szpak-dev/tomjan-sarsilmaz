# Playwright Tests

Test suite for validating frontpage and product pages functionality.

## Setup

Install Playwright:
```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run specific test file
```bash
npx playwright test tests/frontpage.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

## Tests Included

### Frontpage Tests (`tests/frontpage.spec.ts`)
- ✅ Frontpage displays successfully
- ✅ Owner story section is visible
- ✅ Products match repository data
- ✅ Category sections display with products
- ✅ Manufacturer socials visible below owner story

### Product Page Tests (`tests/product-page.spec.ts`)
- ✅ Product page displays with name
- ✅ Product picture is visible
- ✅ At least one attribute group displayed
- ✅ Category name displayed
- ✅ Description section visible
- ✅ Proper layout structure maintained
- ✅ Attribute details in specification section
