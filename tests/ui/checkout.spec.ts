import { CUSTOMER } from '../../src/data/checkout';
import { BACKPACK, ONESIE, priceOf, toCents } from '../../src/data/products';
import { expect, test, type UiFixtures } from '../../src/fixtures/ui';

type CheckoutPages = Pick<UiFixtures, 'inventoryPage' | 'header' | 'cartPage'>;

async function openCheckoutWith(
  { inventoryPage, header, cartPage }: CheckoutPages,
  productNames: string[],
): Promise<void> {
  await inventoryPage.goto();
  for (const name of productNames) {
    await inventoryPage.addToCart(name);
  }
  await header.openCart();
  await cartPage.checkout();
}

test('TC-UI-06 complete an order', async ({
  inventoryPage,
  header,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
  checkoutCompletePage,
}) => {
  await openCheckoutWith({ inventoryPage, header, cartPage }, [BACKPACK, ONESIE]);
  await checkoutInfoPage.fillForm(CUSTOMER);
  await checkoutInfoPage.continue();

  await expect(checkoutOverviewPage.itemNames).toHaveText([BACKPACK, ONESIE]);
  const itemTotal = await checkoutOverviewPage.getItemTotal();
  const tax = await checkoutOverviewPage.getTax();
  expect(toCents(itemTotal)).toBe(toCents(priceOf(BACKPACK)) + toCents(priceOf(ONESIE)));
  expect(toCents(await checkoutOverviewPage.getTotal())).toBe(toCents(itemTotal) + toCents(tax));

  await checkoutOverviewPage.finish();
  await expect(checkoutCompletePage.header).toHaveText('Thank you for your order!');
  await expect(header.cartBadge).toBeHidden();
});

test('TC-UI-07 cancel checkout on the overview step keeps the cart', async ({
  page,
  inventoryPage,
  header,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
}) => {
  await openCheckoutWith({ inventoryPage, header, cartPage }, [BACKPACK, ONESIE]);
  await checkoutInfoPage.fillForm(CUSTOMER);
  await checkoutInfoPage.continue();
  await checkoutOverviewPage.cancel();

  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(header.cartBadge).toHaveText('2');
  await header.openCart();
  await expect(cartPage.itemNames).toHaveText([BACKPACK, ONESIE]);
});

test('TC-UI-09 checkout information requires every field', async ({
  page,
  inventoryPage,
  header,
  cartPage,
  checkoutInfoPage,
}) => {
  await openCheckoutWith({ inventoryPage, header, cartPage }, [BACKPACK]);

  await test.step('all fields empty', async () => {
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toHaveText('Error: First Name is required');
  });

  await test.step('only first name filled', async () => {
    await checkoutInfoPage.fillForm({ firstName: CUSTOMER.firstName });
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toHaveText('Error: Last Name is required');
  });

  await test.step('postal code missing', async () => {
    await checkoutInfoPage.fillForm({ lastName: CUSTOMER.lastName });
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toHaveText('Error: Postal Code is required');
  });

  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});

test(
  'TC-UI-10 checkout with an empty cart is blocked',
  { annotation: { type: 'bug', description: 'BUG-UI-01' } },
  async ({ page, header, cartPage }) => {
    test.fail(true, 'BUG-UI-01: checkout is available with an empty cart');

    await cartPage.goto();
    await expect(header.cartBadge).toBeHidden();
    await cartPage.checkout();

    await expect(page).not.toHaveURL(/\/checkout-step-one\.html$/);
  },
);
