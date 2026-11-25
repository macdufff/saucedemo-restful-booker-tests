# AI worklog

**Agent:** Cursor (Grok 4.6) in pair-programming mode with a human reviewer.

**How it was used:** scaffolding Playwright config, POM, API client, CI YAML, and first-pass specs. The human (and later reruns) executed tests, rejected serial API coupling, and trimmed scope to the assessment limits.

## Prompts (compressed)

1. Build Playwright TS UI tests for Sauce Demo (`standard_user`) covering login, catalog, sort, cart, checkout, plus negatives.
2. Restful Booker: auth → create → get → update → delete → 404, plus negatives. Cookie token, not Bearer.
3. GitHub Actions on push/PR, HTML report artifact always.
4. After failures: do not reuse `{ request }` from `beforeAll`; keep token/id in test scope; cleanup bookings in `finally`.

## Architecture the agent proposed (kept)

- Separate Playwright projects: `setup`, `ui`, `ui-login`, `api`.
- `storageState` for authenticated UI so login is not copied into every spec.
- API client + Zod schemas for response shape.
- `testIdAttribute: 'data-test'` for Sauce Demo.

## Human review

Every claim in README was either executed locally (`npm test`, `lint`, `typecheck`) or marked as not run (GitHub Actions job result).

## Real agent mistakes

### 1. Cart locators copied from inventory

**Generated:** `CartPage` used `[data-test="inventory-item"]`.  
**Why wrong:** cart.html rows are `.cart_item`.  
**Found:** DOM knowledge + would yield empty names after add-to-cart.  
**Fix:** `.cart_item` + `getByRole('button', { name: 'Remove' })`.  
**Validated:** cart specs passed on Chromium.

### 2. Reusing Playwright `request` from `beforeAll`

**Generated:** `BookingClient` stored the `beforeAll` `request` fixture and serial tests reused it.  
**Why wrong:** Playwright forbids reusing `{ request }` from `beforeAll` inside tests.  
**Found:** first API run, error *Fixture { request } from beforeAll cannot be reused in a test.*  
**Fix:** one lifecycle test with `test.step`, local `request`, `finally` cleanup.  
**Validated:** API project passed after the change.

### 3. DELETE expected 204 / Bearer auth

**Generated:** `expect(204)` and `Authorization: Bearer`.  
**Why wrong:** Restful Booker documents Cookie `token=` and returns **201** on delete.  
**Found:** apidoc + would 403 on PUT/DELETE.  
**Fix:** Cookie header; assert `[201, 200]`.  
**Validated:** lifecycle test passed including delete + GET 404.

### 4. Default suite included generated bonus specs

**Generated:** Playwright project `bonus-snapshots` inside `npm test`.  
**Why wrong:** assessment default run must be the mandatory suite; snapshots duplicate login/cart coverage.  
**Found:** code review against the written requirements (“bonus only after mandatory”).  
**Fix:** removed that project from `playwright.config.ts`. Generator stays optional.

### 5. Empty POST treated as 400-or-500 (soft assertion)

**Generated:** `expect([400, 500])` to “be nice” to the API.  
**Why wrong:** hides the real contract (500). The assessment forbids weakening assertions to stay green.  
**Found:** `curl` against POST `/booking` with `{}` returned 500.  
**Fix:** assert `500` and document BUG-1.  
**Validated:** negative API test aligned with the live response.

## What was not invented

No Sauce Demo product bugs were recorded. Browser install x64-vs-arm64 was an environment issue in Cursor sandbox, not a product defect, so it is not listed as an application bug.
