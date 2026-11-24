import { PRODUCTS, formatPrice } from '../../../src/data/products';
import { expect, test } from '../../../src/fixtures/ui';

test('PL-UI-01 sort by price high to low', async ({ inventoryPage }) => {
  await inventoryPage.goto();
  await inventoryPage.sortBy('hilo');

  // Two products share a price, so only the price sequence is compared.
  await expect(inventoryPage.prices).toHaveText(
    PRODUCTS.map((p) => p.price)
      .sort((a, b) => b - a)
      .map(formatPrice),
  );
});
