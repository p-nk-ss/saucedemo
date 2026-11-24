import type { Locator, Page } from '@playwright/test';
import type { Product, SortOption } from '../data/products';

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

  async sortBy(option: SortOption): Promise<void> {
    await this.page.getByTestId('product-sort-container').selectOption(option);
  }

  async addToCart(productName: string): Promise<void> {
    await this.card(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.card(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async openProduct(productName: string): Promise<void> {
    await this.card(productName).getByTestId('inventory-item-name').click();
  }

  private card(productName: string): Locator {
    return this.cards.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(productName, { exact: true }),
    });
  }
}
