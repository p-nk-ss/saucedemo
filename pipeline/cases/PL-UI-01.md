### PL-UI-01 Sort by price high to low

- Behaviour: positive
- Priority: medium
- Preconditions: the user is logged in as `standard_user`.

| #   | Action                                            | Expected result                                                                  |
| --- | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Open the catalog                                  |                                                                                  |
| 2   | Select "Price (high to low)" in the sort dropdown | Prices go in non-increasing order: $49.99, $29.99, $15.99, $15.99, $9.99, $7.99. |
