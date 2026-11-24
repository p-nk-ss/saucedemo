# UI test cases — saucedemo.com

Application: https://www.saucedemo.com. User: `standard_user` / `secret_sauce`.

Unless a case says otherwise, the precondition is: the user is logged in as `standard_user`
and the cart is empty. A step with an empty expected result only moves the user forward.

Catalog used in the cases:

| Product | Price |
|---|---|
| Sauce Labs Backpack | $29.99 |
| Sauce Labs Bike Light | $9.99 |
| Sauce Labs Bolt T-Shirt | $15.99 |
| Sauce Labs Fleece Jacket | $49.99 |
| Sauce Labs Onesie | $7.99 |
| Test.allTheThings() T-Shirt (Red) | $15.99 |

---

### TC-UI-01 Login with valid credentials

- Behaviour: positive
- Priority: high
- Preconditions: the user is logged out.

| # | Action | Expected result |
|---|---|---|
| 1 | Open the login page | |
| 2 | Enter `standard_user` and `secret_sauce` | |
| 3 | Click Login | The URL ends with `/inventory.html`. The page title is "Products". Six products are listed. |

### TC-UI-02 Catalog and product page show the same data

- Behaviour: positive
- Priority: high

| # | Action | Expected result |
|---|---|---|
| 1 | Open the catalog | Six products are listed in A to Z order with the names and prices from the catalog table. |
| 2 | Click the name of "Sauce Labs Fleece Jacket" | The product page shows the name "Sauce Labs Fleece Jacket" and the price "$49.99". |

### TC-UI-03 Sort by name Z to A

- Behaviour: positive
- Priority: medium

| # | Action | Expected result |
|---|---|---|
| 1 | Open the catalog | |
| 2 | Select "Name (Z to A)" in the sort dropdown | All six products are listed in reverse alphabetical order by name, from "Test.allTheThings() T-Shirt (Red)" to "Sauce Labs Backpack". |

### TC-UI-04 Sort by price low to high

- Behaviour: positive
- Priority: medium

| # | Action | Expected result |
|---|---|---|
| 1 | Open the catalog | |
| 2 | Select "Price (low to high)" in the sort dropdown | Prices go in non-decreasing order: $7.99, $9.99, $15.99, $15.99, $29.99, $49.99. |

### TC-UI-05 Add to cart and remove from cart

- Behaviour: positive
- Priority: high

| # | Action | Expected result |
|---|---|---|
| 1 | Open the catalog | |
| 2 | Click "Add to cart" on "Sauce Labs Backpack" and on "Sauce Labs Onesie" | The cart badge shows 2. |
| 3 | Click the cart icon | The cart lists "Sauce Labs Backpack" and "Sauce Labs Onesie", in that order. |
| 4 | Click "Remove" on "Sauce Labs Onesie" | The cart lists only "Sauce Labs Backpack". The cart badge shows 1. |

### TC-UI-06 Complete an order

- Behaviour: positive
- Priority: high
- Preconditions: "Sauce Labs Backpack" and "Sauce Labs Onesie" are in the cart.

| # | Action | Expected result |
|---|---|---|
| 1 | Open the cart and click Checkout | |
| 2 | Enter first name "John", last name "Doe", postal code "12345" and click Continue | The overview lists "Sauce Labs Backpack" and "Sauce Labs Onesie". Item total is $37.98 (the sum of both prices). Total equals item total plus tax. |
| 3 | Click Finish | The message "Thank you for your order!" is shown. The cart badge is gone. |

### TC-UI-07 Cancel checkout on the overview step

- Behaviour: positive
- Priority: medium
- Preconditions: "Sauce Labs Backpack" and "Sauce Labs Onesie" are in the cart.

| # | Action | Expected result |
|---|---|---|
| 1 | Open the cart and click Checkout | |
| 2 | Enter first name "John", last name "Doe", postal code "12345" and click Continue | |
| 3 | Click Cancel on the overview | The URL ends with `/inventory.html`. No order confirmation is shown. The cart badge still shows 2. |
| 4 | Click the cart icon | The cart still lists "Sauce Labs Backpack" and "Sauce Labs Onesie". |

### TC-UI-08 Login with a wrong password

- Behaviour: negative
- Priority: high
- Preconditions: the user is logged out.

| # | Action | Expected result |
|---|---|---|
| 1 | Open the login page | |
| 2 | Enter `standard_user` and the password `wrong_password` | |
| 3 | Click Login | The error "Epic sadface: Username and password do not match any user in this service" is shown. The user stays on the login page. |

### TC-UI-09 Checkout information requires every field

- Behaviour: negative
- Priority: medium
- Preconditions: "Sauce Labs Backpack" is in the cart.

| # | Action | Expected result |
|---|---|---|
| 1 | Open the cart and click Checkout | |
| 2 | Leave all fields empty and click Continue | The error "Error: First Name is required" is shown. |
| 3 | Enter first name "John" and click Continue | The error "Error: Last Name is required" is shown. |
| 4 | Enter last name "Doe" and click Continue | The error "Error: Postal Code is required" is shown. The URL still ends with `/checkout-step-one.html`. |

### TC-UI-10 Checkout with an empty cart is blocked

- Behaviour: negative (boundary: zero items)
- Priority: medium
- Known bug: BUG-UI-01 — the checkout opens and an order for $0 can be completed.

| # | Action | Expected result |
|---|---|---|
| 1 | Open the cart | The cart is empty and there is no cart badge. |
| 2 | Click Checkout | The checkout information page (`/checkout-step-one.html`) does not open. |
