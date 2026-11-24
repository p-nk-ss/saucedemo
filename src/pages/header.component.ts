import type { Locator, Page } from '@playwright/test';

/** The header shown on every page after login. */
export class HeaderComponent {
  /** Absent from the DOM when the cart is empty. */
  readonly cartBadge: Locator;

  private readonly cartLink: Locator;

  constructor(page: Page) {
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
