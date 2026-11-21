# Playwright Automation Portfolio

End-to-end and UI test automation built with **Playwright** and **TypeScript**, written against the [LambdaTest Ecommerce Playground](https://ecommerce-playground.lambdatest.io/), a public practice site for test automation.

[![Playwright Tests](https://github.com/Doms-G/YOUR-REPO-NAME/actions/workflows/playwright.yml/badge.svg)](https://github.com/Doms-G/YOUR-REPO-NAME/actions/workflows/playwright.yml)

## About

This repository showcases my work in test automation, including:

- End-to-end user journeys for an ecommerce website
- UI content and element checks
- Continuous integration with GitHub Actions

> All tests run against a public practice site and were written for learning and portfolio purposes.

## Tech Stack

- [Playwright](https://playwright.dev/) for browser automation and assertions
- TypeScript
- Node.js
- GitHub Actions for CI

## What's Covered

| Area | Description |
| --- | --- |
| Landing page | Verifies page content, text, and key elements |
| Buttons | Checks button behavior and states |
| Ecommerce E2E | Covers user journeys such as browsing, cart, and checkout |

<!-- Edit this table to match your actual tests. -->

## Project Structure

```
.
├── .github/workflows/
│   └── playwright.yml          # CI pipeline
├── tests/
│   └── lambdatest-ecommerce-playground/
│       ├── landing-page.spec.ts
│       ├── buttons.spec.ts
│       └── ecommerce-e2e.spec.ts
├── playwright.config.ts        # Playwright configuration
├── package.json
└── README.md
```

<!-- Update this tree to match your real folders and files. -->

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/Doms-G/playwright-qa-automation.git
cd YOUR-REPO-NAME
npm install
npx playwright install
```

## Running the Tests

Run all tests:

```bash
npx playwright test
```

Run a single file:

```bash
npx playwright test tests/lambdatest-ecommerce-playground/landing-page.spec.ts
```

Run in a specific browser:

```bash
npx playwright test --project=chromium
```

Run in headed mode (see the browser):

```bash
npx playwright test --headed
```

Open the interactive UI mode:

```bash
npx playwright test --ui
```

## Viewing the Report

After a test run, open the HTML report:

```bash
npx playwright show-report
```

## Continuous Integration

Tests run automatically on GitHub Actions on every push and pull request. See [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) for the workflow, and check the **Actions** tab for results.

## Notes

- Tests target a public demo site, so occasional failures can happen if the site is slow or changes.
- Generated folders like `node_modules/`, `test-results/`, and `playwright-report/` are excluded through `.gitignore`.

## Credits

- Practice site: [LambdaTest Ecommerce Playground](https://ecommerce-playground.lambdatest.io/)
- Built with [Playwright](https://playwright.dev/)

## Contact

**Doms-G** · [GitHub profile](https://github.com/Doms-G)

<!-- Add your LinkedIn or portfolio link here if you'd like. -->