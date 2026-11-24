import type { Locator, Page } from '@playwright/test';

export class CartPage {
  /** Names of the products in the cart, in order. */
  readonly itemNames: Locator;

  private readonly root: Locator;
  private readonly items: Locator;
  private readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId('cart-contents-container');
    this.items = this.root.getByTestId('inventory-item');
    this.itemNames = this.root.getByTestId('inventory-item-name');
    this.checkoutButton = this.root.getByTestId('checkout');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async remove(productName: string): Promise<void> {
    await this.items
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
