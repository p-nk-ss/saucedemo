import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../data/checkout';

export class CheckoutInfoPage {
  readonly errorMessage: Locator;

  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    const root = page.getByTestId('checkout-info-container');
    this.firstNameInput = root.getByTestId('firstName');
    this.lastNameInput = root.getByTestId('lastName');
    this.postalCodeInput = root.getByTestId('postalCode');
    this.continueButton = root.getByTestId('continue');
    this.errorMessage = root.getByTestId('error');
  }

  /** Fills only the fields that are given; the rest keep their current value. */
  async fillForm(customer: Partial<Customer>): Promise<void> {
    if (customer.firstName !== undefined) await this.firstNameInput.fill(customer.firstName);
    if (customer.lastName !== undefined) await this.lastNameInput.fill(customer.lastName);
    if (customer.postalCode !== undefined) await this.postalCodeInput.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }
}
