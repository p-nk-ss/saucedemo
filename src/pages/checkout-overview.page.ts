import type { Locator, Page } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly itemNames: Locator;

  constructor(private readonly page: Page) {
    this.itemNames = page.getByTestId('inventory-item-name');
  }

  async getItemTotal(): Promise<number> {
    return this.amountIn('subtotal-label');
  }

  async getTax(): Promise<number> {
    return this.amountIn('tax-label');
  }

  async getTotal(): Promise<number> {
    return this.amountIn('total-label');
  }

  async finish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }

  async cancel(): Promise<void> {
    await this.page.getByTestId('cancel').click();
  }

  /** Reads the amount from a summary line such as "Item total: $37.98". */
  private async amountIn(testId: string): Promise<number> {
    const text = await this.page.getByTestId(testId).innerText();
    const match = text.match(/\$(\d+(?:\.\d+)?)/);
    if (!match) throw new Error(`No amount found in "${text}"`);
    return Number(match[1]);
  }
}
