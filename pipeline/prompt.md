You are adding one automated test to an existing Playwright + TypeScript project. You work
alone: nobody will answer questions, so decide and proceed.

## Task

Turn the test case below into a Playwright test that runs and passes.

- Write the test to `{{OUT_FILE}}`. Create exactly one test in it.
- The test title starts with the case id: `{{CASE_ID}} …`.
- Every step of the case appears in the test, in order, and every expected result is asserted.
  Do not assert less than the case says, and do not add checks the case does not ask for.

## How this project is built — read before writing

1. Read `CLAUDE.md`. Its rules apply to you.
2. Read an existing spec of the same kind to copy the style:
   `tests/ui/cart.spec.ts` for UI, `tests/api/booking-negative.spec.ts` for API.
3. Read the fixtures and helpers you will use: `src/fixtures/`, `src/pages/`, `src/api/`,
   `src/data/`.

## Rules

- Import `test` and `expect` from `src/fixtures/ui` (UI) or `src/fixtures/api` (API), never from
  `@playwright/test`.
- A spec file contains no locators: no `page.locator(`, no `getBy…`, no `waitForTimeout`. If a
  page object or the API client lacks what the case needs, **add a method or a locator
  property to it** in `src/pages/` or `src/api/`, in the style of the code already there.
  Do not change or remove anything that exists: other tests depend on it.
- Selectors use `data-test` attributes through `getByTestId`. You cannot open the site, so
  derive ids from the page objects that already exist; where you must guess, prefer a role
  and an accessible name (`getByRole('button', { name: 'Add to cart' })`).
- Expected values come from `src/data/` where they exist (`PRODUCTS`, `priceOf`, `formatPrice`,
  `buildBooking`). Compute an expected order from `PRODUCTS`; do not hard-code a list.
- After an action that changes the page, assert with a retrying assertion
  (`await expect(locator).toHaveText(…)`), not with a value read once.
- API tests create their own booking through the `booking` fixture; it is deleted for you.
- English only. No comments unless they explain a non-obvious "why".

## Boundaries

- Allowed to create: `{{OUT_FILE}}`.
- Allowed to extend: files in `src/pages/`, `src/api/`, `src/fixtures/`, `src/data/`.
- Do not touch anything else: no other tests, no test cases, no config, no docs, no git.
- You cannot run commands. The pipeline runs the test for you and, if it fails, calls you
  again with the output.

## Test case

{{CASE}}

{{FEEDBACK}}

## When you are done

Reply with three short lines and nothing else:

1. `files:` the files you created or changed.
2. `assumptions:` anything you had to guess (selectors, endpoints, texts), or `none`.
3. `risk:` the assertion you are least sure will pass, or `none`.
