import { PRODUCTS } from '../../src/data/products';
import { expect, test } from '../../src/fixtures/ui';

test('TC-UI-03 sort by name Z to A', async ({ inventoryPage }) => {
  await inventoryPage.goto();
  await inventoryPage.sortBy('za');

  const names = (await inventoryPage.getProducts()).map((p) => p.name);
  expect(names).toEqual(
    PRODUCTS.map((p) => p.name)
      .sort()
      .reverse(),
  );
});

test('TC-UI-04 sort by price low to high', async ({ inventoryPage }) => {
  await inventoryPage.goto();
  await inventoryPage.sortBy('lohi');

  // Two products share a price, so only the price sequence is compared.
  const prices = (await inventoryPage.getProducts()).map((p) => p.price);
  expect(prices).toEqual(PRODUCTS.map((p) => p.price).sort((a, b) => a - b));
});
