import { type Locator, type Page, expect } from '@playwright/test';

export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly error: Locator;
  readonly finish: Locator;
  readonly completeHeader: Locator;
  readonly summaryTotal: Locator;
  readonly overviewTitle: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.error = page.getByTestId('error');
    this.finish = page.getByRole('button', { name: 'Finish' });
    this.completeHeader = page.getByTestId('complete-header');
    this.summaryTotal = page.getByTestId('total-label');
    this.overviewTitle = page.getByTestId('title');
  }

  async fillInfo(first: string, last: string, zip: string) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(zip);
    await this.continueButton.click();
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
