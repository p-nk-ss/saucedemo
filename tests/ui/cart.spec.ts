import { BACKPACK, ONESIE } from '../../src/data/products';
import { expect, test } from '../../src/fixtures/ui';

test('TC-UI-05 add to cart and remove from cart', async ({ inventoryPage, header, cartPage }) => {
  await inventoryPage.goto();
  await inventoryPage.addToCart(BACKPACK);
  await inventoryPage.addToCart(ONESIE);
  await expect(header.cartBadge).toHaveText('2');

  await header.openCart();
  await expect(cartPage.itemNames).toHaveText([BACKPACK, ONESIE]);

  await cartPage.remove(ONESIE);
  await expect(cartPage.itemNames).toHaveText([BACKPACK]);
  await expect(header.cartBadge).toHaveText('1');
});
