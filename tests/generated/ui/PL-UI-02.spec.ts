import { BIKE_LIGHT } from '../../../src/data/products';
import { expect, test } from '../../../src/fixtures/ui';

test('PL-UI-02 add to cart and remove from the product page', async ({
  inventoryPage,
  productPage,
  header,
}) => {
  await inventoryPage.goto();

  await inventoryPage.openProduct(BIKE_LIGHT);
  await expect(productPage.name).toHaveText(BIKE_LIGHT);

  await productPage.addToCart();
  await expect(header.cartBadge).toHaveText('1');
  await expect(productPage.cartButton).toHaveText('Remove');

  await productPage.removeFromCart();
  await expect(header.cartBadge).toBeHidden();
  await expect(productPage.cartButton).toHaveText('Add to cart');
});
