import type { Locator, Page } from '@playwright/test';

/** The header shown on every page after login. */
export class HeaderComponent {
  /** Absent from the DOM when the cart is empty. */
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
  }
}
