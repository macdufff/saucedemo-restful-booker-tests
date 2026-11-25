export const UI_ORIGIN = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
export const API_ORIGIN = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';

export const AUTH_FILE = 'playwright/.auth/standard.json';

export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  invalid: { username: 'standard_user', password: 'wrong_password' },
} as const;

export const API_AUTH = {
  username: process.env.API_USERNAME ?? 'admin',
  password: process.env.API_PASSWORD ?? 'password123',
} as const;

export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
} as const;
