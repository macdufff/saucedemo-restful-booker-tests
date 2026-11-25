# AI worklog

Тести писались у Cursor (агент). Інструкції для наступних прогонів: `CLAUDE.md` і `.cursorrules`.

## Інструкції агенту

- `CLAUDE.md` — продукт, команди, scope, заборона `waitForTimeout`, правило фіксувати реальний HTTP-контракт.
- `.cursorrules` — локатори Sauce Demo, Cookie-токен Restful Booker, DELETE=201, кошик = `.cart_item`.

## Ключові промпти (скорочено)

1. «Зроби тестове: Playwright TS, Sauce Demo standard_user, 5–7 позитивних і 2–3 негативні, POM, data-test локатори.»
2. «API Restful Booker: auth → create → update → delete → 404. Негативні кейси окремим файлом. Не використовуй Bearer.»
3. «GitHub Actions: chromium, html report artifact always().»
4. «Бонус: скрипт, на вході markdown (Steps / Expected), на виході spec.ts, опційно LLM.»
5. Після першого фейлу: «Не реюзай `{ request }` з `beforeAll` у тестах Playwright — бери `request` у кожному тесті, стан (token, id) тримай у змінних describe.»

## Де агент помилився (і як це помітив)

### 1. Локатор кошика як у каталозі

Агент поставив у `CartPage` `[data-test="inventory-item"]`. На cart.html рядки — `.cart_item`.  
**Як помітив:** знання DOM Sauce Demo; інакше `toHaveCount` / `names()` були б порожні після add to cart. Виправлено до запуску, потім прогін 21 passed підтвердив.

### 2. `request` з `beforeAll` у serial API-флоу

Перша версія тримала `BookingClient` на фікстурі `request` з `beforeAll`. Playwright: *Fixture { request } from beforeAll cannot be reused in a test.*  
**Як помітив:** червоний прогін, 13-й тест, stack в `booking.client.ts`. Виправлення: `test.describe.configure({ mode: 'serial' })` + новий `request` на тест, `token`/`bookingId` у closure.

### 3. Очікування DELETE 204 / 200

Типовий REST-інстинкт агента — `204`. Restful Booker відповідає **201**.  
**Як помітив:** документація API + правило в `.cursorrules`; асерт зроблено `[201, 200]` до того, як зелений прогін це підтвердив.

### 4. Auth header як Bearer

Чернетка клієнта мала `Authorization: Bearer ${token}`. Restful Booker хоче `Cookie: token=...`.  
**Як помітив:** apidoc (PUT/DELETE). Без цього update/delete були б 403. Зафіксовано в `.cursorrules`.

### 5. Архітектура браузера (x64 vs arm64)

Перший UI-прогін: *Executable doesn't exist … chrome-headless-shell-mac-arm64* після того, як інсталятор у sandbox стягнув **mac-x64**.  
**Як помітив:** текст помилки Playwright. Не баг тестів. Для локальної машини — `npx playwright install chromium` на arm64. У GitHub Actions образ ubuntu, проблема не відтворюється.

## Бонус-конвеєр: 3 приклади

Генератор: `bonus/generate-test.ts`. Режим без API-ключа (правила). `--run` не підхопив файли поза `testDir` — **ручна правка процесу:** снапшоти лежать у `bonus/snapshots/` і окремий Playwright project `bonus-generated`.

| Вхід | Згенерувалось | Пройшло | Руками |
|------|----------------|---------|--------|
| `bonus/examples/login.valid.md` | `goto` + fill + login + URL inventory | так (після додавання project) | не правив код тесту |
| `bonus/examples/login.invalid.md` | error `do not match` | так | не правив код тесту |
| `bonus/examples/add-to-cart.md` | add backpack + cart + ім’я в кошику | так | не правив код тесту; процес: скопіювати в `snapshots/` і підключити `testDir` |

Що генератор **не** вміє без дописування правил / LLM: довільний чекаут з first/last/zip, сортування, складні гілки. Це свідомий MVP.

## Результат прогону (локально)

`21 passed` на UI+API; плюс 3 snapshot-тести в окремому project після підключення.
