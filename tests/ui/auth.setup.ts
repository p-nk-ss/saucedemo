import { STORAGE_STATE } from '../../src/config/env';
import { STANDARD_USER } from '../../src/data/users';
import { expect, test as setup } from '../../src/fixtures/ui';

setup('log in as the standard user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(STANDARD_USER.username, STANDARD_USER.password);
  await expect(page).toHaveURL(/\/inventory\.html$/);

  await page.context().storageState({ path: STORAGE_STATE });
});
