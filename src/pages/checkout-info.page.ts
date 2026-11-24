import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../data/checkout';

export class CheckoutInfoPage {
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.errorMessage = page.getByTestId('error');
  }

  /** Fills only the fields that are given; the rest keep their current value. */
  async fill(customer: Partial<Customer>): Promise<void> {
    if (customer.firstName !== undefined) {
      await this.page.getByTestId('firstName').fill(customer.firstName);
    }
    if (customer.lastName !== undefined) {
      await this.page.getByTestId('lastName').fill(customer.lastName);
    }
    if (customer.postalCode !== undefined) {
      await this.page.getByTestId('postalCode').fill(customer.postalCode);
    }
  }

  async continue(): Promise<void> {
    await this.page.getByTestId('continue').click();
  }
}
