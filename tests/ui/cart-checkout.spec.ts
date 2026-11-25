import { test, expect } from '../fixtures/auth';
import { PRODUCTS } from '../../config';

test.describe('Cart and checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('adds two products and shows them in the cart', { tag: ['@smoke'] }, async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    expect(await cartPage.names()).toEqual([PRODUCTS.backpack, PRODUCTS.bikeLight]);
    await expect(cartPage.items).toHaveCount(2);
  });

  test('removing a product updates the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await inventoryPage.openCart();
    await cartPage.removeByName(PRODUCTS.backpack);
    expect(await cartPage.names()).toEqual([PRODUCTS.bikeLight]);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('completes checkout and shows order confirmation', { tag: ['@smoke'] }, async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout.click();
    await checkoutPage.fillInfo('Ada', 'Lovelace', '10100');
    await checkoutPage.expectOverview();
    await expect(checkoutPage.summaryTotal).toContainText('Total: $');
    await checkoutPage.complete();
  });

  test('blocks checkout when first name is missing', { tag: ['@negative'] }, async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addToCartByName(PRODUCTS.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout.click();
    await checkoutPage.fillInfo('', 'Lovelace', '10100');
    await expect(checkoutPage.error).toContainText('First Name is required');
  });
});
