import type { Locator, Page } from '@playwright/test';
import type { Product } from '../data/products';

export class InventoryPage {
  readonly title: Locator;
  private readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cards = page.getByTestId('inventory-item');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** Products in the order they are shown on the page. */
  async getProducts(): Promise<Product[]> {
    await this.cards.first().waitFor();
    const products: Product[] = [];
    for (const card of await this.cards.all()) {
      const name = await card.getByTestId('inventory-item-name').innerText();
      const price = await card.getByTestId('inventory-item-price').innerText();
      products.push({ name, price: Number(price.replace('$', '')) });
    }
    return products;
  }
}
