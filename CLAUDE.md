# Agent instructions (QA automation)

You are helping maintain Playwright tests for:

- UI: https://www.saucedemo.com (`standard_user` / `secret_sauce`)
- API: https://restful-booker.herokuapp.com

## Rules

- TypeScript only. Page Object Model lives in `pages/`. Tests go to `tests/ui` and `tests/api`.
- Prefer `[data-test="..."]` locators on Sauce Demo. Do not use brittle XPath or CSS tied to class hashes.
- Do not hard-wait (`page.waitForTimeout`). Use Playwright auto-waiting and `expect`.
- Do not store secrets. Sauce Demo and Restful Booker credentials are public demo values.
- Keep tests independent except the documented serial booking lifecycle in `tests/api/booking-flow.spec.ts`.
- After changing tests, run `npx playwright test` (or the affected file).
- If a third-party API returns a non-REST status (e.g. 500 on empty POST), assert the **observed** contract and mention it in README as a bug, do not silently “fix” the assertion to 200.

## Commands

```bash
npm ci
npx playwright install chromium
npx playwright test
```

## Out of scope unless asked

- Visual / pixel tests, performance, mobile browsers, other Sauce Demo users except negative locked_out_user.
- Bonus generator (`bonus/`) unless the task is about generating tests from text.
