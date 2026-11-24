import type { Locator, Page } from '@playwright/test';

export class CheckoutOverviewPage {
  /** Names of the products in the order, in order. */
  readonly itemNames: Locator;

  private readonly itemTotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    const root = page.getByTestId('checkout-summary-container');
    this.itemNames = root.getByTestId('inventory-item-name');
    this.itemTotalLabel = root.getByTestId('subtotal-label');
    this.taxLabel = root.getByTestId('tax-label');
    this.totalLabel = root.getByTestId('total-label');
    this.finishButton = root.getByTestId('finish');
    this.cancelButton = root.getByTestId('cancel');
  }

  async getItemTotal(): Promise<number> {
    return amountIn(this.itemTotalLabel);
  }

  async getTax(): Promise<number> {
    return amountIn(this.taxLabel);
  }

  async getTotal(): Promise<number> {
    return amountIn(this.totalLabel);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

/** Reads the amount from a summary line such as "Item total: $37.98". */
async function amountIn(label: Locator): Promise<number> {
  const text = await label.innerText();
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No amount found in "${text}"`);
  return Number(match[1]);
}
