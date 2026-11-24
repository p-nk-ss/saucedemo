# Pipeline: test case text → runnable Playwright test

Bonus part of the assignment. The input is a test case written as text (steps and expected
results); the output is a Playwright test that runs.

```bash
npm run pipeline -- pipeline/cases/PL-UI-01.md                 # one case
npm run pipeline -- pipeline/cases/PL-UI-01.md pipeline/cases/PL-API-01.md
npm run pipeline -- --verify-only pipeline/cases/PL-UI-01.md   # re-check, no agent call
npm run test:generated                                         # run what was generated
```

Requires the [Claude Code](https://claude.com/claude-code) CLI, logged in. Generated tests live
in `tests/generated/` and are not part of `npm test` or of CI: they call a paid model to
produce, and the main suite has a fixed size.

## How it works

```
case.md ──► prompt.md + case ──► headless agent ──► tests/generated/<kind>/<id>.spec.ts
                 ▲                (read + write only)        │
                 │                                           ▼
                 └──── failure output ◄──── format → type check → lint → run the test
                        (up to 3 attempts)                   │
                                                             ▼
                                              rule checks → results/<id>.json
```

1. [`generate.mjs`](generate.mjs) fills [`prompt.md`](prompt.md) with the case and the target
   file name.
2. It starts Claude Code headless (`claude --print`) in this repository. The agent may only
   read files and write files: no shell, no network, no browser. It reads `CLAUDE.md` and the
   existing specs, page objects and fixtures, then writes the test. If a page object or the API
   client lacks something, it extends them.
3. The pipeline, not the agent, checks the result: Prettier, `tsc`, ESLint, then the test
   itself.
4. If anything fails, the output goes back to the agent as feedback, up to three attempts in
   total.
5. Independent of pass or fail, the pipeline checks the rules of the project on the file: the
   title starts with the case id, exactly one test, no raw locators or sleeps, imports from the
   project fixtures, no files changed outside `tests/generated/` and `src/`.
6. Everything is recorded in [`results/`](results): each attempt's source, test output, the
   agent's own reply, time and cost.

The agent is told to finish with three lines: the files it touched, what it had to guess, and
the assertion it trusts least. That reply is the fastest way to review a generated test.

## Results

Three cases, in the same format as [`docs/test-cases/`](../docs/test-cases), none of them
covered by the hand-written suite. Run on 2026-11-24.

| Case                                                                         | Generated                                                       | Passed       | Agent time | Cost  | Changed in `src/`                                           |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------ | ---------- | ----- | ----------------------------------------------------------- |
| [PL-UI-01](cases/PL-UI-01.md) Sort by price high to low                      | [`PL-UI-01.spec.ts`](../tests/generated/ui/PL-UI-01.spec.ts)    | on attempt 1 | 17 s       | $0.35 | `InventoryPage.prices` locator                              |
| [PL-UI-02](cases/PL-UI-02.md) Add to cart and remove from the product page   | [`PL-UI-02.spec.ts`](../tests/generated/ui/PL-UI-02.spec.ts)    | on attempt 1 | 22 s       | $0.34 | `ProductPage.cartButton`, `addToCart()`, `removeFromCart()` |
| [PL-API-01](cases/PL-API-01.md) Partial update changes only the given fields | [`PL-API-01.spec.ts`](../tests/generated/api/PL-API-01.spec.ts) | on attempt 1 | 15 s       | $0.29 | `BookingClient.partialUpdate()`                             |

The generated files are committed exactly as the agent wrote them
(commit "test(generated): pipeline output for three cases, unedited").

### What had to be fixed by hand

- **One line of formatting.** While adding a `BIKE_LIGHT` constant for PL-UI-02 the agent
  re-typed the neighbouring line and dropped a space (`ONESIE ='…'`). The test passed, but
  `prettier --check` would have failed CI. Fixed by hand in the next commit — and then fixed for
  good: the pipeline now formats every file the agent touched and runs the type check and the
  linter before the test.
- **Nothing in the test logic.** All three passed on the first attempt and stayed green over
  three repeats.

### What I checked before trusting them

A generated test that passes proves little by itself, so each one was checked the same way as
the hand-written tests:

- **It can fail.** One expected value was broken on purpose in each test (`hilo` → `lohi`,
  badge `1` → `2`, the patched fields removed from the expected body); each failed on that
  assertion.
- **It matches its case.** Every step and every expected result of the case is in the test,
  and nothing extra.
- **It follows the project rules.** No locators in the spec; new locators went into the page
  objects.

### Observations

- PL-UI-01 uses a retrying assertion on a locator (`toHaveText([...])`) where my own sort tests
  read the list once. The prompt asks for that explicitly; it is the better pattern.
- PL-UI-02 had to guess a selector: the agent cannot open the site, so it located the product
  page button by role and name (`Add to cart` / `Remove`) instead of a `data-test` id. It said
  so in its reply ("assumptions"), which is exactly where a reviewer should look first.
- PL-API-01 gets the admin token inside the test without asserting on that call. Acceptable:
  the token is a precondition of the case, not what it verifies.

## Limits — what this does not prove

- **The retry loop has not been exercised by a real failure.** All three cases passed first
  time. The feedback path was checked only by breaking a generated test on purpose and seeing
  the type check stop it with a usable message.
- **Three cases, all of average difficulty** and all close to code that already exists. A case
  on a page with no page object, or one that needs a selector that cannot be guessed, would be
  a harder test of the pipeline.
- **The agent cannot see the application.** Giving it the `playwright-cli` skill would remove
  the guessing at the price of time, cost and a much wider set of permissions.
- **A wrong case produces a wrong test.** The pipeline checks that the test matches the case
  and runs; whether the case describes correct behaviour is still a human decision.
- **Cost:** about $0.30 per case here; it grows with the size of the repository the agent has
  to read.
