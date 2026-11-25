import { test, expect, loginAsStandard } from '../fixtures/auth';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE = 'Sauce Labs Bike Light';

test.describe('Cart and checkout', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAsStandard(loginPage, inventoryPage);
  });

  test('add two items, cart badge and cart contents match', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCartByName(BACKPACK);
    await inventoryPage.addToCartByName(BIKE);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    expect(await cartPage.names()).toEqual([BACKPACK, BIKE]);
  });

  test('remove item from cart updates the list', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCartByName(BACKPACK);
    await inventoryPage.addToCartByName(BIKE);
    await inventoryPage.openCart();
    await cartPage.removeByName(BACKPACK);
    expect(await cartPage.names()).toEqual([BIKE]);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('happy-path checkout completes the order', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCartByName(BACKPACK);
    await inventoryPage.openCart();
    await cartPage.checkout.click();
    await checkoutPage.fillInfo('Ada', 'Lovelace', '10100');
    await checkoutPage.expectOverview();
    await expect(checkoutPage.summaryTotal).toContainText('Total: $');
    await checkoutPage.complete();
  });

  test('checkout without first name is blocked', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCartByName(BACKPACK);
    await inventoryPage.openCart();
    await cartPage.checkout.click();
    await checkoutPage.fillInfo('', 'Lovelace', '10100');
    await expect(checkoutPage.error).toContainText('First Name is required');
  });

  test('checkout with empty postal code is blocked', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCartByName(BACKPACK);
    await inventoryPage.openCart();
    await cartPage.checkout.click();
    await checkoutPage.fillInfo('Ada', 'Lovelace', '');
    await expect(checkoutPage.error).toContainText('Postal Code is required');
  });
});
