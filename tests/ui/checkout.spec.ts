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
  await checkoutInfoPage.fill(CUSTOMER);
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
  await checkoutInfoPage.fill(CUSTOMER);
  await checkoutInfoPage.continue();
  await checkoutOverviewPage.cancel();

  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(header.cartBadge).toHaveText('2');
  await header.openCart();
  await expect(cartPage.itemNames).toHaveText([BACKPACK, ONESIE]);
});
