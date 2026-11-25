# Sauce Demo + Restful Booker — Playwright suite

Production-style UI and API automation for a QA technical assessment.

- **UI:** [saucedemo.com](https://www.saucedemo.com) (`standard_user` / `secret_sauce`)
- **API:** [Restful Booker](https://restful-booker.herokuapp.com/apidoc)
- **Stack:** Playwright Test, TypeScript (strict), Node.js 22, GitHub Actions

## Architecture

```
setup (login once) ──► ui (inventory / cart / checkout, storageState)
                    ──► ui-login (fresh context, no stored session)
                    ──► api (APIRequestContext, own baseURL)
```

- Page objects in `pages/` hold locators and user actions.
- `tests/fixtures/auth.ts` injects page objects into UI tests.
- `tests/api/booking.client.ts` wraps HTTP calls; `booking.schema.ts` validates JSON with Zod.
- `config.ts` holds URLs, users, and product names. Override URLs with env vars.

Login tests use a clean browser. Catalog, cart and checkout reuse an authenticated `storageState` so they do not re-type credentials. Cart data lives in session storage, so each test still starts with an empty cart.

## Folder structure

```
config.ts                 env, users, product names
pages/                    Login, Inventory, Cart, Checkout
tests/setup/              storageState bootstrap
tests/ui/                 UI specs
tests/api/                API client, schemas, specs
tests/fixtures/           Playwright fixtures
tests/helpers/            small pure helpers
.github/workflows/        CI
bonus/                    optional test-case → spec generator (not in npm test)
```

## Install

```bash
npm ci
npx playwright install chromium
```

Copy `.env.example` to `.env` only if you need to override defaults. Demo credentials are public and already in `config.ts`.

## Run tests

```bash
npm test                 # UI + API
npm run test:ui
npm run test:api
npm run test:headed
npm run lint
npm run typecheck
npm run test:report      # HTML report after a run
```

## CI/CD

`.github/workflows/tests.yml` runs on `push` and `pull_request`:

1. `npm ci`
2. lint + typecheck
3. Playwright Chromium
4. `npm test`
5. Upload `playwright-report` (HTML + JUnit) even when tests fail

Retries (`2`) apply only when `CI=true`.

## Coverage

| # | Scenario | Type | Expected |
|---|----------|------|----------|
| 1 | Login as `standard_user` | UI positive | Inventory URL, 6 products |
| 2 | Wrong password | UI negative | Error, stay on login |
| 3 | Empty credentials | UI negative | “Username is required” |
| 4 | Inventory contents | UI positive | Six named, priced items |
| 5 | Sort name A→Z | UI positive | Names ascending |
| 6 | Sort price low→high | UI positive | Prices ascending |
| 7 | Add two items | UI positive | Badge `2`, both names in cart |
| 8 | Remove one item | UI positive | Remaining item, badge `1` |
| 9 | Checkout happy path | UI positive | Overview total + thank-you page |
| 10 | Checkout without first name | UI negative | “First Name is required” |
| 11 | Auth → create → get → update → delete → 404 | API positive | Token, schema, updated fields, 404 after delete |
| 12 | Auth with bad password | API negative | `{ reason: Bad credentials }` |
| 13 | GET missing id | API negative | 404 |
| 14 | POST empty booking | API negative | HTTP 500 (see BUG-1) |

Setup project adds one bootstrap “test” that writes `storageState`.

## Intentionally out of scope

- Firefox, WebKit, mobile viewports
- Other Sauce Demo users (`problem_user`, `visual_user`, …)
- Visual / a11y / performance
- `PATCH /booking`, booking filters
- Default run of the optional generator in `bonus/`

## Known application / contract issues

Only defects that were reproduced against the live services.

### BUG-1 — POST `/booking` with `{}` returns 500

- **Environment:** `https://restful-booker.herokuapp.com`, 2026-11-25
- **Preconditions:** none
- **Steps:** `POST /booking` with `Content-Type: application/json` and body `{}`
- **Expected:** `400` (or similar 4xx) with a validation message
- **Actual:** `500 Internal Server Error`
- **Severity:** Medium (demo API; clients cannot distinguish bad input from server failure)

No functional bugs were reproduced on Sauce Demo for `standard_user` on login, catalog, sort, cart, or checkout.

## Optional bonus

Markdown test case → Playwright spec (`bonus/generate-test.ts`). Not part of `npm test`. Requires `OPENAI_API_KEY` for LLM mode; otherwise uses a local rules engine.

```bash
npx tsx bonus/generate-test.ts --run bonus/examples/login.valid.md
```
