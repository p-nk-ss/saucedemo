import { PRODUCTS } from '../../src/data/products';
import { STANDARD_USER } from '../../src/data/users';
import { expect, test } from '../../src/fixtures/ui';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC-UI-01 login with valid credentials opens the catalog', async ({
  page,
  loginPage,
  inventoryPage,
}) => {
  await loginPage.goto();
  await loginPage.login(STANDARD_USER.username, STANDARD_USER.password);

  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(inventoryPage.title).toHaveText('Products');
  expect(await inventoryPage.getProducts()).toHaveLength(PRODUCTS.length);
});
