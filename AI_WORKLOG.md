# AI worklog

How this repository was built with an AI agent: what the agent was given to work from, the
prompts for each stage, and where the agent went wrong.

## Setup

- **Agent:** Claude Code (CLI), model Claude Fable 5.2.
- **Standing instructions:** [`CLAUDE.md`](CLAUDE.md) — stack, layout, the rules every test
  must follow, the known-bugs policy, and a self-check the agent runs before it may report a
  task as done.
- **Skills** — reusable instructions the agent loads for a specific kind of work:

  | Skill                                                                          | Origin                                                                                      | Used for                                                                                             |
  | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
  | [`playwright-cli`](.claude/skills/playwright-cli/SKILL.md)                     | Playwright's official skill; the same one I use for hands-on testing with an agent at work  | Driving a real browser from the terminal: exploring the shop, reproducing every bug before reporting |
  | [`test-case-writer`](.claude/skills/test-case-writer/SKILL.md)                 | My own skill from a production project, adapted: the test-management integration is removed | The rules the test cases are written by: one case = one behaviour, a flow instead of an inspection   |
  | `brainstorming`, `writing-plans`, `executing-plans` (the `superpowers` plugin) | Public plugin, installed in my Claude Code; not part of this repository                     | Turning the brief into a reviewed design, the design into a step-by-step plan, and running the plan  |

- **Process:** explore → design → test cases → plan → build → verify bugs → independent review,
  with my own review at three fixed points: after the test cases, after the UI tests, after the
  API tests.

## Prompts

The work was a dialogue, not a single prompt, and it was not held in English. Each block below
is the consolidated prompt for one stage: what the agent was asked to do there, with the
constraints and corrections that applied, in the form I would reuse on the next project.

### 1. Explore — before any code

Skill: `playwright-cli`.

```text
Goal: understand the assignment and both targets before anything is designed or written.

Read `QA Automation Engineer (Middle).md` first.
Then explore:
- https://www.saucedemo.com as standard_user, in a real browser through playwright-cli:
  login, catalog, sorting, cart, checkout, and the edges of each (empty input, empty cart,
  going back, reloading).
- https://restful-booker.herokuapp.com: the whole booking lifecycle and what happens
  without a token, with bad input, and on a booking that does not exist.

Report:
- how each target keeps state (session, cart, auth token) — tests will depend on it;
- which stable selectors exist, and any that cannot be used as they look;
- every behaviour that looks like a defect, with the exact steps and the observed result.

Constraints: create no files in the repository. Delete any data you create on the shared API.
```

Result: the element ids, the session cookie and `localStorage` cart, the token header, one
selector trap (`data-test="open-menu"` sits on an image under the real button), and nine
candidate bugs — all before a line of test code.

### 2. Design — the brief turned into a specification

Skill: `brainstorming`.

```text
Goal: a written design I can approve before any code exists.

Inputs: the assignment, the exploration report, and the conventions of the skills from my
current project (page objects, one test case per behaviour).

Rules for the design:
- The ranges in the brief are hard limits, not targets to beat: 5–7 main and 2–3 negative
  UI tests, one API flow and 2–3 negative cases, 3–5 worklog entries.
- Only the scenarios the brief names. Check the final list against its wording line by line.
- Show two or three ways to structure the project with what each costs; recommend one.
- Say what is deliberately out of scope.
- Mark every decision you made yourself, so that I can check those first.
- Everything in the repository is in English.

Have the design read by a second agent with no context, as someone who must build from it;
bring me only the questions that agent could not answer.
```

Result: three options, of which I chose one Playwright project with `ui` and `api` config
projects, page objects and fixtures; a fixed list of 10 UI and 4 API tests; and a policy for
known bugs (assert the correct behaviour, mark the test `test.fail()`).

### 3. Test cases — before the tests

Skill: `test-case-writer`.

```text
Goal: written test cases that define "correct" independently of the code.

For every test in the approved list write a case in docs/test-cases/:
id, behaviour (positive or negative), priority, preconditions, steps with expected results.

Rules:
- One case = one behaviour. Positive and negative never share a case.
- A case is a user flow — prepare, act, verify where the change shows up — not "open the
  page and look".
- Expected results are observable and exact: the text, the count, the URL, the status code.
- Where the product is known to misbehave, the expected result still describes the correct
  behaviour and the case names the bug.

Stop when the cases are written. I review them before any test is automated.
```

Result: [`docs/test-cases/ui.md`](docs/test-cases/ui.md) and
[`docs/test-cases/api.md`](docs/test-cases/api.md). Every test title starts with its case id.

### 4. Plan and build

Skills: `writing-plans`, `executing-plans`.

```text
Goal: build the approved design in small, checkable steps.

Write a plan first. Each task names its files, the interfaces it exposes to other tasks,
the assertions of every test, and the command whose output proves the task is done.

While building:
- Write each test from its case, then the page object or client code it needs.
- After a test passes, break one expected value on purpose, see the test fail for that
  reason, restore it. A test that was never seen failing proves nothing.
- Commit per step. Push as soon as the skeleton and the first test exist, to prove the
  CI workflow and the report artifact early rather than at the end.
- Stop for my review after the test cases, after the UI tests and after the API tests.
- Report every mistake in the summary where it was noticed. Do not bury it under a green run.
```

Result: the code in this repository. CI was green from the first push, with one red run later
on — see mistake 4.

### 5. Bug reports — exploratory findings re-verified

Skill: `playwright-cli`.

```text
Goal: bug reports another engineer can reproduce without asking questions.

Take every defect candidate from the exploration. Reproduce each one again from a clean
state — the shop in the browser, the API with curl — and write down the exact steps and
what you observed. Report only what reproduced.

Format: id, title, severity, steps, expected result, actual result, and the test that
covers it, if there is one.
```

Result: seven reports in the [README](README.md#bugs-found); two of them are also covered by
tests marked as expected failures.

### 6. Independent review

```text
Goal: find what the author of the code cannot see.

Start a second agent with no context from this session. Give it the assignment and the
repository, and the role of the engineer who will assess this submission.

It checks: every numbered item of the assignment; tests that can pass without proving
anything; tests weaker than their written case; whether README and this worklog say
anything the code or the git history contradicts.

It changes nothing. It reports findings ranked by severity; I decide what is fixed.
```

Result: no critical findings, six important ones. The most useful: both known-bug tests marked
the whole test as an expected failure, so they would have stayed green with the service down.
Now only the final assertion is expected to fail.

## Where the agent went wrong

### 1. Designed a test suite with no test cases

- **What the agent did:** its first design went straight from the brief to a list of automated
  tests. Nothing said what each test was supposed to verify, step by step, independently of
  the code.
- **How I noticed:** reading the design before approving it. I looked for the place where the
  test cases would live and there was none, so I asked.
- **Fix:** written cases in [`docs/test-cases/`](docs/test-cases), one behaviour per case.
  Cases are written and reviewed first, each test is built from its case, and the test title
  starts with the case id. This became stage 3 above.
- **Why it matters:** without the cases, the only definition of "correct" is the test the agent
  wrote, so the agent would be checking its own work against itself.

### 2. Added a scenario the brief does not ask for

- **What the agent did:** its list of seven main UI tests included a logout test. The brief
  names the scenarios: login, catalog, sorting, cart, checkout.
- **How I noticed:** the agent's summary said "7 + 3, the top of the range", which sounded
  right. I went back to the brief and restated its wording to the agent instead of accepting
  the count. Checked against it line by line, the logout test was the one row with no matching
  scenario.
- **Fix:** replaced by a checkout scenario (cancelling on the overview step keeps the cart).
  Logout is listed in the README under "deliberately not covered". The line-by-line check is
  now part of the design prompt.
- **Why it matters:** the agent optimised for a plausible-looking suite, not for the stated
  requirements. The count was right and the content was not.

### 3. Put cleanup logic inside the test body

- **What the agent did:** in the API lifecycle test it wrapped all seven steps in `try/finally`
  with mutable `let token` and `let bookingId`, so that the booking would be deleted if the
  test failed halfway. It worked and CI was green.
- **How I noticed:** code review of the spec file. The first thing visible in the test was the
  `try/finally`, not the scenario. The project already had fixtures for exactly this kind of
  setup and teardown, and the UI tests used them.
- **Fix:** a `cleanupBookingIds` fixture deletes registered bookings after the test, pass or
  fail. The test is now seven plain steps. To verify the fix, the test was made to fail before
  its delete step, and the service was checked for leftover bookings: none.
- **Why it matters:** a green run says nothing about whether a test can be read and maintained.
  This one is only caught by reading the code.

### 4. Wrote a test with a race, and waved the warning away

- **What the agent did:** in TC-UI-02 the test clicks a product and immediately asserts the
  name on the product page. The product page reuses the catalog's `data-test` ids, so for a
  few milliseconds after the click the locator still matches the six names of the catalog.
  Playwright does not retry a strict-mode violation: it fails at once. The independent
  reviewer had pointed at this line; the agent filed it under "minor, deferred".
- **How it was noticed:** CI. After ten green runs, a commit that touched only
  documentation went red. The trace from the report artifact showed the assertion failing 11
  ms after the click, with the catalog still on screen.
- **Fix:** opening a product now returns only when the catalog has left the page, and every
  page object looks its elements up inside its own container instead of page-wide. The
  agent's first fix — waiting for the URL — was wrong too: the URL changes before
  the page re-renders. That was caught only because the race was first reproduced on purpose,
  by slowing the browser's CPU (5 failures out of 5), and the fix was run against the same
  reproduction. The switch is kept: `CPU_THROTTLE=6 npm run test:ui`.
- **Why it matters:** forty local repeats under load were all green. A test that passes locally
  and in ten CI runs can still be wrong; a flaky test needs a reproduction, not a retry.

### 5. Reported a number it had not measured

- **What the agent did:** in a status summary it stated the time spent so far as "about 2 h 10
  min of 4". It had added up the estimates from its own plan.
- **How it was noticed:** when the time was needed for the README, it was taken from
  timestamps instead: the assignment file was saved at 19:08 and the clock showed 20:11, about
  one hour. The agent flagged the mismatch and withdrew its earlier figure.
- **Fix:** the README states the time from timestamps only, and `CLAUDE.md` now requires a
  checkable source for every number the agent reports.
- **Why it matters:** an estimate and a measurement look the same in an agent's summary. Any
  number it reports needs a source that can be checked.

## What I take from this

- The mistakes that mattered most (1–3) were not bugs. Every check was green in all three
  cases. They were found by reading the design against the brief and by reading the code.
- Mistakes 4 and 5 were caught by evidence rather than by reading: a CI trace, and timestamps
  instead of the agent's own figure. Smaller ones of the same kind did not make this list, for
  example GitHub Actions pinned to versions three majors old, from the agent's memory.
- An agent's summary of its own work is the least reliable artifact it produces. Review points
  and a second agent with no context are worth more than a longer prompt.
