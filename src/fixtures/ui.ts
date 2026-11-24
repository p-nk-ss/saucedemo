import { test as base } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import { CheckoutInfoPage } from '../pages/checkout-info.page';
import { CheckoutOverviewPage } from '../pages/checkout-overview.page';
import { HeaderComponent } from '../pages/header.component';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';

export interface UiFixtures {
  loginPage: LoginPage;
  header: HeaderComponent;
  inventoryPage: InventoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
}

export const test = base.extend<UiFixtures & { cpuThrottle: void }>({
  // Flake hunting: `CPU_THROTTLE=20 npm run test:ui` slows the page down so that
  // assertions racing a re-render fail on a fast machine too.
  cpuThrottle: [
    async ({ page }, use) => {
      const rate = Number(process.env.CPU_THROTTLE ?? 1);
      if (rate > 1) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate });
      }
      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
});

export { expect } from '@playwright/test';
