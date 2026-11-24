import type { Locator, Page } from '@playwright/test';
import type { SortOption } from '../data/products';

export class InventoryPage {
  readonly title: Locator;
  /** Product names in the order they are shown. */
  readonly names: Locator;
  /** Product prices in the order they are shown, as text: "$29.99". */
  readonly prices: Locator;

  // The product page, the cart and the checkout overview reuse the catalog's test ids,
  // so everything here is looked up inside the catalog's own list.
  private readonly list: Locator;
  private readonly cards: Locator;
  private readonly sortDropdown: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.list = page.getByTestId('inventory-list');
    this.cards = this.list.getByTestId('inventory-item');
    this.names = this.list.getByTestId('inventory-item-name');
    this.prices = this.list.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async addToCart(productName: string): Promise<void> {
    await this.card(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.card(productName).getByRole('button', { name: 'Remove' }).click();
  }

  /** Opens the product page and returns once it has replaced the catalog. */
  async openProduct(productName: string): Promise<void> {
    await this.card(productName).getByTestId('inventory-item-name').click();
    // The URL changes before the page re-renders, so wait for the catalog to go away.
    await this.list.waitFor({ state: 'detached' });
  }

  private card(productName: string): Locator {
    return this.cards.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(productName, { exact: true }),
    });
  }
}
