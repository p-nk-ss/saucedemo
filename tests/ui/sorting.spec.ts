import { formatPrice, PRODUCTS } from '../../src/data/products';
import { expect, test } from '../../src/fixtures/ui';

test('TC-UI-03 sort by name Z to A', async ({ inventoryPage }) => {
  await inventoryPage.goto();
  await inventoryPage.sortBy('za');

  await expect(inventoryPage.names).toHaveText(
    PRODUCTS.map((p) => p.name)
      .sort()
      .reverse(),
  );
});

test('TC-UI-04 sort by price low to high', async ({ inventoryPage }) => {
  await inventoryPage.goto();
  await inventoryPage.sortBy('lohi');

  // Two products share a price, so only the price sequence is compared.
  await expect(inventoryPage.prices).toHaveText(
    PRODUCTS.map((p) => p.price)
      .sort((a, b) => a - b)
      .map(formatPrice),
  );
});
