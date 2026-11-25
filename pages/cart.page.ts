import { type Locator, type Page, expect } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkout: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    // Cart rows have no data-test / accessible name unique per line; class is the public DOM contract.
    this.items = page.locator('.cart_item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkout = page.getByRole('button', { name: 'Checkout' });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async removeByName(name: string) {
    const item = this.items.filter({ hasText: name });
    await item.getByRole('button', { name: 'Remove' }).click();
  }
}
