# saucedemo-qa-assignment — agent instructions

Test assignment for a QA Automation Engineer position: Playwright + TypeScript UI tests for
https://www.saucedemo.com and API tests for https://restful-booker.herokuapp.com.
Requirements: `QA Automation Engineer (Middle).md`. Design and plan: `docs/superpowers/`.

## Stack

Node LTS, npm, TypeScript, `@playwright/test`. Chromium only.

## Layout

- `docs/test-cases/` — written test cases. They come first; a test is written from its case.
- `src/pages/` — page objects, one per page, plus the header component.
- `src/api/` — `BookingClient` and types for restful-booker.
- `src/fixtures/` — `ui.ts` and `api.ts`; tests import `test` and `expect` from here.
- `src/data/` — test data and the expected catalog.
- `tests/ui/`, `tests/api/` — spec files.

## Rules

- Everything is in English: code, comments, docs, commit messages.
- Scope is fixed: 7 positive + 3 negative UI tests, 1 API flow + 3 API negatives. Do not add
  tests without being asked.
- Every test title starts with its case id (`TC-UI-05 ...`). Changing what a test checks means
  changing its case in `docs/test-cases/` first.
- Locators live only in page objects and use `data-test` via `getByTestId`. Spec files contain
  no `locator(`, `getBy...`, `waitForTimeout`.
- The burger menu is opened with `getByRole('button', { name: 'Open Menu' })`. The
  `data-test="open-menu"` attribute sits on an image under the button and cannot be clicked.
- Expected values come from `src/data/`, not from literals repeated in tests. Expected order in
  sort tests is computed from `PRODUCTS`.
- Compare money in cents, never floats with `===`.
- API tests create their own bookings and delete them. Never rely on data that already exists
  on the shared service.
- No retries for UI tests. A flaky UI test is fixed, not retried.
- Comments are rare: only a non-obvious "why".

## Known product bugs

A test for a known bug asserts the correct behaviour and is marked
`test.fail(true, '<BUG-ID>: <summary>')` with the annotation
`{ type: 'bug', description: '<BUG-ID>' }`. The bug is described in README. Never weaken an
assertion to make such a test pass.

## Before reporting a task as done

1. `grep -rnE "locator\(|getBy|waitForTimeout" tests/` prints nothing.
2. `npm run typecheck` is clean.
3. `npx playwright test` is green.
4. Each new test was seen failing once with a deliberately wrong expected value.

## Mistakes

When you make a mistake and it is noticed (by you or by the reviewer), add it to the
"Running log" in `AI_WORKLOG.md` right away: what happened, who noticed and how, the fix.
Never invent or embellish an entry.
