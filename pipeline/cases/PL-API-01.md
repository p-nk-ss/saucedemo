### PL-API-01 Partial update changes only the given fields

- Behaviour: positive
- Priority: medium
- Preconditions: a booking exists; an admin token is available.

| #   | Action                                                                                            | Expected result                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | `PATCH /booking/{id}` with the token and the body `{"totalprice":999,"additionalneeds":"Dinner"}` | Status 200. In the body `totalprice` is 999 and `additionalneeds` is "Dinner"; every other field equals the original booking. |
| 2   | `GET /booking/{id}`                                                                               | Status 200. The body equals the original booking with `totalprice` 999 and `additionalneeds` "Dinner".                        |
