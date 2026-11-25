import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { InventoryPage } from '../../pages/inventory.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';

export const CREDENTIALS = {
  standard: { user: 'standard_user', pass: 'secret_sauce' },
  locked: { user: 'locked_out_user', pass: 'secret_sauce' },
  invalid: { user: 'standard_user', pass: 'wrong_password' },
};

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';

export async function loginAsStandard(
  loginPage: LoginPage,
  inventoryPage: InventoryPage,
) {
  await loginPage.goto();
  await loginPage.login(CREDENTIALS.standard.user, CREDENTIALS.standard.pass);
  await inventoryPage.expectLoaded();
}
