# QA Automation test assignment

[![Tests](https://github.com/p-nk-ss/saucedemo/actions/workflows/tests.yml/badge.svg)](https://github.com/p-nk-ss/saucedemo/actions/workflows/tests.yml)

UI tests for [saucedemo.com](https://www.saucedemo.com) and API tests for
[restful-booker](https://restful-booker.herokuapp.com/apidoc), written with Playwright and
TypeScript together with an AI agent. The task itself is in
[`QA Automation Engineer (Middle).md`](<QA Automation Engineer (Middle).md>).

- Test cases: [`docs/test-cases/ui.md`](docs/test-cases/ui.md), [`docs/test-cases/api.md`](docs/test-cases/api.md)
- How the agent was used and where it went wrong: [`AI_WORKLOG.md`](AI_WORKLOG.md)

## How to run

Requires Node.js 22 or newer.

```bash
npm ci
npx playwright install chromium

npm test            # everything
npm run test:ui     # saucedemo only
npm run test:api    # restful-booker only
npm run report      # open the HTML report of the last run
```

Other checks: `npm run typecheck`, `npm run lint`, `npm run format:check`.

No configuration is needed. Both services publish their demo credentials, and these are the
defaults. To point the tests elsewhere, copy `.env.example` to `.env` and change the values:

| Variable                        | Default                                |
| ------------------------------- | -------------------------------------- |
| `UI_BASE_URL`                   | `https://www.saucedemo.com`            |
| `UI_USERNAME` / `UI_PASSWORD`   | `standard_user` / `secret_sauce`       |
| `API_BASE_URL`                  | `https://restful-booker.herokuapp.com` |
| `API_USERNAME` / `API_PASSWORD` | `admin` / `password123`                |

## CI

[`.github/workflows/tests.yml`](.github/workflows/tests.yml) runs on every push and pull request,
and can be started by hand. It type-checks, lints, checks formatting and runs all tests in
Chromium. The Playwright HTML report is uploaded as the **`playwright-report`** artifact of each
run, also when tests fail: open a run in the
[Actions tab](https://github.com/p-nk-ss/saucedemo/actions) and scroll to "Artifacts".

## How the project is organised

```
docs/test-cases/   written test cases; each test is built from one
src/pages/         page objects — the only place with locators
src/api/           BookingClient for restful-booker
src/fixtures/      page objects, API client and test data cleanup as fixtures
src/data/          expected catalog, users, booking payload factory
tests/ui/          UI specs       tests/api/   API specs
```

- The UI logs in once in a `setup` project and reuses the saved session; the login tests start
  logged out.
- API tests create their own bookings with unique names and delete them in a fixture, also when
  a test fails. The service is shared and resets every 10 minutes, so nothing relies on existing
  data.
- A test for a known product bug asserts the **correct** behaviour and is marked `test.fail()`.
  The run stays green, the report shows the test as an expected failure, and the test turns red
  on its own the day the bug is fixed.

## What is covered

15 results in a run: 1 login setup + 10 UI + 4 API.

### UI — saucedemo, `standard_user`

| Case     | What it checks                                                   | Spec               | Status              |
| -------- | ---------------------------------------------------------------- | ------------------ | ------------------- |
| TC-UI-01 | Login with valid credentials opens the catalog                   | `login.spec.ts`    | pass                |
| TC-UI-02 | Catalog lists all six products; product page shows the same data | `catalog.spec.ts`  | pass                |
| TC-UI-03 | Sort by name Z to A                                              | `sorting.spec.ts`  | pass                |
| TC-UI-04 | Sort by price low to high                                        | `sorting.spec.ts`  | pass                |
| TC-UI-05 | Add two products to the cart, remove one; badge and cart follow  | `cart.spec.ts`     | pass                |
| TC-UI-06 | Complete an order; item total and total add up; cart is emptied  | `checkout.spec.ts` | pass                |
| TC-UI-07 | Cancel checkout on the overview; no order, cart kept             | `checkout.spec.ts` | pass                |
| TC-UI-08 | Negative: wrong password shows an error                          | `login.spec.ts`    | pass                |
| TC-UI-09 | Negative: each empty required checkout field has its own error   | `checkout.spec.ts` | pass                |
| TC-UI-10 | Boundary: checkout with an empty cart is blocked                 | `checkout.spec.ts` | known bug BUG-UI-01 |

### API — restful-booker

| Case      | What it checks                                                            | Spec                       | Status               |
| --------- | ------------------------------------------------------------------------- | -------------------------- | -------------------- |
| TC-API-01 | Flow: authorize → create → read → update → read → delete → 404            | `booking-flow.spec.ts`     | pass                 |
| TC-API-02 | Negative: update without a token is rejected with 403 and changes nothing | `booking-negative.spec.ts` | pass                 |
| TC-API-03 | Negative: a wrong password gives no token                                 | `booking-negative.spec.ts` | pass                 |
| TC-API-04 | Negative: creating a booking without required fields is rejected with 400 | `booking-negative.spec.ts` | known bug BUG-API-01 |

## What is deliberately not covered

The brief sets a size (5–7 main and 2–3 negative UI tests, one API flow and 2–3 negatives), so
the suite stops there on purpose. Left out, in order of what I would add next:

- **The other two sort orders** (A to Z, price high to low): same mechanism as the two covered.
- **Logout and the burger menu**, including "Reset App State": not among the scenarios the
  brief names. The reset bug was found by hand and is reported below.
- **The other saucedemo users** (`locked_out_user`, `problem_user`, `visual_user`, ...): the
  brief names `standard_user`.
- **Firefox, WebKit and mobile viewports:** Chromium only, to keep the run short.
- **Visual and accessibility checks.**
- **API: `PATCH`, filters on `GET /booking`, basic auth, response schema validation.**
- **Load and performance.**

## Bugs found

All were reproduced by hand on 2026-11-24 with `standard_user` in Chromium, or with `curl`.

### BUG-UI-01 An order can be placed with an empty cart

- **Severity:** major
- **Covered by:** TC-UI-10 (expected failure)
- **Steps:**
  1. Log in as `standard_user`. Make sure the cart is empty.
  2. Click the cart icon.
  3. Click Checkout.
  4. Enter first name "John", last name "Doe", postal code "12345" and click Continue.
  5. Click Finish.
- **Expected:** Checkout is unavailable while the cart is empty, or step 3 explains that the
  cart is empty.
- **Actual:** the checkout opens, the overview shows "Total: $0.00", and Finish shows "Thank
  you for your order!" — an order with no items is confirmed.

### BUG-UI-02 Checkout accepts whitespace-only customer data

- **Severity:** major
- **Steps:**
  1. Log in, add "Sauce Labs Backpack" to the cart, open the cart and click Checkout.
  2. Type a single space into First Name, Last Name and Postal Code.
  3. Click Continue.
- **Expected:** the same "… is required" error as for empty fields; the user stays on the
  information step.
- **Actual:** no error; the overview step opens and the order can be finished with a blank
  name and postal code. The form also accepts any other content, for example `abc!@#` as a
  postal code and a 300-character last name.

### BUG-UI-03 "Reset App State" leaves product buttons in the "Remove" state

- **Severity:** minor
- **Steps:**
  1. Log in and click "Add to cart" on "Sauce Labs Backpack". The button changes to "Remove"
     and the cart badge shows 1.
  2. Open the burger menu and click "Reset App State".
- **Expected:** the cart is emptied and the button is "Add to cart" again.
- **Actual:** the cart badge disappears, but the button still says "Remove". The product cannot
  be added again until the page is reloaded; after a reload the button is "Add to cart".

### BUG-API-01 Creating a booking without required fields returns 500

- **Severity:** major
- **Covered by:** TC-API-04 (expected failure)
- **Steps:**
  1. `POST /booking` with headers `Content-Type: application/json`, `Accept: application/json`
     and the body `{"firstname":"OnlyFirstName"}`.
- **Expected:** `400 Bad Request` with a message naming the missing fields.
- **Actual:** `500 Internal Server Error` with the plain-text body "Internal Server Error". The
  same happens when fields have wrong types, for example `"totalprice":"abc"`.

### BUG-API-02 Wrong status codes on delete and on missing bookings

- **Severity:** minor
- **Steps:**
  1. Get a token: `POST /auth` with `{"username":"admin","password":"password123"}`.
  2. Create a booking and note its `bookingid`.
  3. `DELETE /booking/{id}` with the header `Cookie: token=<token>`.
  4. Send the same `DELETE` again.
  5. `PUT /booking/999999999` with the token and a valid body.
- **Expected:** step 3 — `200 OK` or `204 No Content`; steps 4 and 5 — `404 Not Found`.
- **Actual:** step 3 — `201 Created`; steps 4 and 5 — `405 Method Not Allowed`. Because of step
  3, the flow test TC-API-01 only asserts that the delete succeeded, not its exact code.

### BUG-API-03 Failed authentication returns 200

- **Severity:** minor
- **Steps:**
  1. `POST /auth` with `{"username":"admin","password":"wrong_password"}`.
- **Expected:** `401 Unauthorized`.
- **Actual:** `200 OK` with the body `{"reason":"Bad credentials"}`. A client that checks only
  the status code treats the login as successful. TC-API-03 therefore asserts that no token is
  issued instead of asserting the status.

### BUG-API-04 A booking with impossible dates and a negative price is accepted

- **Severity:** major
- **Steps:**
  1. `POST /booking` with the body
     `{"firstname":"A","lastname":"B","totalprice":-5.75,"depositpaid":true,"bookingdates":{"checkin":"2027-02-10","checkout":"2027-02-01"}}`.
- **Expected:** `400 Bad Request`: the checkout date is before the checkin date and the price
  is negative.
- **Actual:** `200 OK`, the booking is created. The price is also stored as `-5`: the
  fractional part is silently dropped.

## Time spent

About 1 hour 15 minutes of wall-clock time for the mandatory part, measured from file and
commit timestamps: roughly 35 minutes of exploring both targets and agreeing the design with
the agent, and 40 minutes of building, including my three reviews. The brief allows up to 4
hours; most of the difference is the agent's typing speed, not skipped work — see
[`AI_WORKLOG.md`](AI_WORKLOG.md) for what it cost in mistakes.
