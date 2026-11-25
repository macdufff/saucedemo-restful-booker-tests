import { test, expect, USERS } from '../fixtures/auth';

test.describe('Login', () => {
  test('standard_user reaches the product catalog', { tag: ['@smoke'] }, async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('rejects an incorrect password', { tag: ['@negative'] }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.invalid.username, USERS.invalid.password);
    await loginPage.expectErrorContains('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('rejects submit with empty credentials', { tag: ['@negative'] }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();
    await loginPage.expectErrorContains('Username is required');
    await expect(page).not.toHaveURL(/inventory/);
  });
});
