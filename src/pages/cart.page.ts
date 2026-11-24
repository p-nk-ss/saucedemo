import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly itemNames: Locator;

  constructor(private readonly page: Page) {
    this.itemNames = page.getByTestId('inventory-item-name');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async remove(productName: string): Promise<void> {
    await this.page
      .getByTestId('inventory-item')
      .filter({ has: this.itemNames.getByText(productName, { exact: true }) })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async checkout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
  }
}
