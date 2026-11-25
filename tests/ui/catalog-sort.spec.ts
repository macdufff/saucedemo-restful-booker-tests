import { test, expect, loginAsStandard } from '../fixtures/auth';

function isSortedAsc(values: string[] | number[]) {
  const copy = [...values];
  copy.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return values.every((v, i) => v === copy[i]);
}

function isSortedDesc(values: string[] | number[]) {
  const copy = [...values];
  copy.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return values.every((v, i) => v === copy[i]);
}

test.describe('Catalog and sorting', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAsStandard(loginPage, inventoryPage);
  });

  test('catalog shows 6 products with name and price', async ({ inventoryPage }) => {
    const names = await inventoryPage.names();
    const prices = await inventoryPage.prices();
    expect(names).toHaveLength(6);
    expect(names.every((n) => n.trim().length > 0)).toBeTruthy();
    expect(prices.every((p) => p > 0)).toBeTruthy();
  });

  test('sort Name (A to Z) and Name (Z to A)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    expect(isSortedAsc(await inventoryPage.names())).toBeTruthy();

    await inventoryPage.sortBy('za');
    expect(isSortedDesc(await inventoryPage.names())).toBeTruthy();
  });

  test('sort Price (low to high) and Price (high to low)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    expect(isSortedAsc(await inventoryPage.prices())).toBeTruthy();

    await inventoryPage.sortBy('hilo');
    expect(isSortedDesc(await inventoryPage.prices())).toBeTruthy();
  });
});
