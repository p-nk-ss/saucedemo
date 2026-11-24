import type { Locator, Page } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly price: Locator;

  /** The single cart button; its label toggles between "Add to cart" and "Remove". */
  readonly cartButton: Locator;

  constructor(page: Page) {
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.cartButton = page.getByRole('button', { name: /^(Add to cart|Remove)$/ });
  }

  async addToCart(): Promise<void> {
    await this.cartButton.filter({ hasText: 'Add to cart' }).click();
  }

  async removeFromCart(): Promise<void> {
    await this.cartButton.filter({ hasText: 'Remove' }).click();
  }
}
