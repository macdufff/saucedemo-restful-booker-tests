import { test, expect, CREDENTIALS, loginAsStandard } from '../fixtures/auth';

test.describe('Login', () => {
  test('standard_user logs in and lands on catalog', async ({ loginPage, inventoryPage }) => {
    await loginAsStandard(loginPage, inventoryPage);
    await expect(inventoryPage.title).toBeVisible();
  });

  test('invalid password shows error and stays on login', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.invalid.user, CREDENTIALS.invalid.pass);
    await loginPage.expectErrorContains('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('locked_out_user cannot enter the store', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.locked.user, CREDENTIALS.locked.pass);
    await loginPage.expectErrorContains('Sorry, this user has been locked out');
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('empty credentials are rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();
    await loginPage.expectErrorContains('Username is required');
  });
});
