import { type Locator, type Page, expect } from '@playwright/test';

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continue: Locator;
  readonly cancel: Locator;
  readonly error: Locator;
  readonly finish: Locator;
  readonly completeHeader: Locator;
  readonly summaryTotal: Locator;
  readonly overviewTitle: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continue = page.locator('[data-test="continue"]');
    this.cancel = page.locator('[data-test="cancel"]');
    this.error = page.locator('[data-test="error"]');
    this.finish = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.summaryTotal = page.locator('[data-test="total-label"]');
    this.overviewTitle = page.locator('[data-test="title"]');
  }

  async fillInfo(first: string, last: string, zip: string) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(zip);
    await this.continue.click();
  }

  async expectOverview() {
    await expect(this.page).toHaveURL(/checkout-step-two/);
    await expect(this.overviewTitle).toHaveText('Checkout: Overview');
  }

  async complete() {
    await this.finish.click();
    await expect(this.page).toHaveURL(/checkout-complete/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
