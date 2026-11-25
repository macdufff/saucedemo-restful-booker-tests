import { test, expect } from '../fixtures/auth';
import { isSortedAsc } from '../helpers/sort';

test.describe('Catalog and sorting', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.open();
  });

  test('inventory lists six products with name and price', { tag: ['@smoke'] }, async ({
    inventoryPage,
  }) => {
    const names = await inventoryPage.names();
    const prices = await inventoryPage.prices();
    expect(names).toHaveLength(6);
    expect(names.every((n) => n.trim().length > 0)).toBe(true);
    expect(prices.every((p) => Number.isFinite(p) && p > 0)).toBe(true);
  });

  test('sorts products by name A to Z', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    expect(isSortedAsc(await inventoryPage.names())).toBe(true);
  });

  test('sorts products by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    expect(isSortedAsc(await inventoryPage.prices())).toBe(true);
  });
});
