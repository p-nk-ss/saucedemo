import { FLEECE_JACKET, formatPrice, priceOf, PRODUCTS } from '../../src/data/products';
import { expect, test } from '../../src/fixtures/ui';

test('TC-UI-02 catalog and product page show the same data', async ({
  inventoryPage,
  productPage,
}) => {
  await inventoryPage.goto();
  await expect(inventoryPage.names).toHaveText(PRODUCTS.map((p) => p.name));
  await expect(inventoryPage.prices).toHaveText(PRODUCTS.map((p) => formatPrice(p.price)));

  await inventoryPage.openProduct(FLEECE_JACKET);
  await expect(productPage.name).toHaveText(FLEECE_JACKET);
  await expect(productPage.price).toHaveText(formatPrice(priceOf(FLEECE_JACKET)));
});
