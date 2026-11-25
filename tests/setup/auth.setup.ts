import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { AUTH_FILE, USERS } from '../../config';

setup('authenticate as standard_user', async ({ page }) => {
  mkdirSync(dirname(AUTH_FILE), { recursive: true });
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(USERS.standard.username);
  await page.getByPlaceholder('Password').fill(USERS.standard.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: AUTH_FILE });
});
