# API test cases — restful-booker

API: https://restful-booker.herokuapp.com (documentation: `/apidoc`).
Admin credentials: `admin` / `password123`.

The service is public and shared, and it resets its data about every 10 minutes. Every case
creates the bookings it needs and deletes them afterwards. Requests send
`Content-Type: application/json` and `Accept: application/json`. The token is sent in the
`Cookie: token=<value>` header.

"Valid booking payload" means: `firstname`, `lastname`, `totalprice` (integer), `depositpaid`,
`bookingdates.checkin`, `bookingdates.checkout` (`YYYY-MM-DD`), `additionalneeds`.

---

### TC-API-01 Booking lifecycle

- Behaviour: positive
- Priority: high

| # | Action | Expected result |
|---|---|---|
| 1 | `POST /auth` with the admin credentials | Status 200. The body has a non-empty `token`. |
| 2 | `POST /booking` with a valid payload | Status 200. The body has a numeric `bookingid` and a `booking` equal to the payload. |
| 3 | `GET /booking/{id}` | Status 200. The body equals the payload. |
| 4 | `PUT /booking/{id}` with the token and a payload with a changed `totalprice` and `additionalneeds` | Status 200. The body equals the updated payload. |
| 5 | `GET /booking/{id}` | The body equals the updated payload. |
| 6 | `DELETE /booking/{id}` with the token | The request succeeds (2xx). |
| 7 | `GET /booking/{id}` | Status 404. |

### TC-API-02 Update without a token is rejected

- Behaviour: negative
- Priority: high
- Preconditions: a booking exists.

| # | Action | Expected result |
|---|---|---|
| 1 | `PUT /booking/{id}` with a valid payload and no token | Status 403. |
| 2 | `GET /booking/{id}` | The body equals the original payload: nothing was changed. |

### TC-API-03 Wrong password gives no token

- Behaviour: negative
- Priority: high

| # | Action | Expected result |
|---|---|---|
| 1 | `POST /auth` with `admin` and a wrong password | The body has no `token`. |

### TC-API-04 Create without required fields is rejected

- Behaviour: negative
- Priority: medium
- Known bug: BUG-API-01 — the service answers 500 Internal Server Error.

| # | Action | Expected result |
|---|---|---|
| 1 | `POST /booking` with only `firstname` in the payload | Status 400. No booking is created. |
