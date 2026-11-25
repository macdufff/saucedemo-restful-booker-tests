import { type Locator, type Page, expect } from '@playwright/test';

export class CartPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkout: Locator;
  readonly continueShopping: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('.cart_item');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkout = page.locator('[data-test="checkout"]');
    this.continueShopping = page.locator('[data-test="continue-shopping"]');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
  }

  async names(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async removeByName(name: string) {
    const item = this.page
      .locator('.cart_item')
      .filter({ has: this.page.locator('[data-test="inventory-item-name"]', { hasText: name }) });
    await item.getByRole('button', { name: 'Remove' }).click();
  }
}
