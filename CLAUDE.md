# Agent instructions

Playwright + TypeScript suite for Sauce Demo (UI) and Restful Booker (API).

## Rules

- POM in `pages/`. UI specs in `tests/ui`. API specs in `tests/api`. Shared data in `config.ts`.
- Locators: `getByRole`, `getByPlaceholder`, `getByTestId`. No XPath. Cart rows are `.cart_item` (no test id).
- No `page.waitForTimeout`. No skipped tests. No empty catch blocks.
- Restful Booker mutating calls use `Cookie: token=...`, not Bearer.
- Successful DELETE is often HTTP 201. Empty POST `/booking` has been observed as HTTP 500.
- Login specs must not use `storageState`. Catalog/cart/checkout reuse `playwright/.auth/standard.json` from the `setup` project.
- After changing tests, run `npm run typecheck`, `npm run lint`, and the affected Playwright project.

## Commands

```bash
npm ci
npx playwright install chromium
npm test
```

## Out of scope unless asked

Visual tests, extra browsers, other Sauce Demo users, the optional generator in `bonus/`.
