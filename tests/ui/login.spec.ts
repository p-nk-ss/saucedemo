import { PRODUCTS } from '../../src/data/products';
import { STANDARD_USER, WRONG_PASSWORD } from '../../src/data/users';
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
  await expect(inventoryPage.names).toHaveCount(PRODUCTS.length);
});

test('TC-UI-08 login with a wrong password shows an error', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(STANDARD_USER.username, WRONG_PASSWORD);

  await expect(loginPage.errorMessage).toHaveText(
    'Epic sadface: Username and password do not match any user in this service',
  );
  await expect(page).toHaveURL('/');
});
