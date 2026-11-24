### PL-UI-02 Add to cart and remove from the product page

- Behaviour: positive
- Priority: medium
- Preconditions: the user is logged in as `standard_user` and the cart is empty.

| #   | Action                                    | Expected result                                                             |
| --- | ----------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Open the catalog                          |                                                                             |
| 2   | Click the name of "Sauce Labs Bike Light" | The product page shows the name "Sauce Labs Bike Light".                    |
| 3   | Click "Add to cart" on the product page   | The cart badge shows 1. The button on the product page reads "Remove".      |
| 4   | Click "Remove" on the product page        | The cart badge is gone. The button on the product page reads "Add to cart". |
