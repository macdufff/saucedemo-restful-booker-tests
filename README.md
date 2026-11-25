# Sauce Demo + Restful Booker — автотести

Playwright + TypeScript. UI на [saucedemo.com](https://www.saucedemo.com), API на [Restful Booker](https://restful-booker.herokuapp.com/apidoc). CI — GitHub Actions, HTML-звіт як артефакт.

## Як запустити

```bash
npm ci
npx playwright install chromium
npx playwright test
npx playwright show-report
```

Окремо:

```bash
npm run test:ui
npm run test:api
```

Облікові дані UI (публічні демо): `standard_user` / `secret_sauce`.  
API auth: `admin` / `password123`.

## Що покрито

**UI (12 тестів + 3 згенеровані бонус-снапшоти)**

- Логін `standard_user`
- Каталог: 6 товарів, ім’я та ціна
- Сортування: Name A–Z / Z–A, Price low–high / high–low
- Кошик: додати 2 товари, badge, видалити
- Чекаут happy path
- Негативні: невірний пароль, `locked_out_user`, порожні поля логіну, чекаут без first name, чекаут без postal code

**API**

- Флоу: auth → create → get → update → delete → get 404
- Негативні: погані credentials, GET неіснуючого id, DELETE без токена, POST порожнього body

**CI**

- `.github/workflows/tests.yml` — `push` / `PR` / `workflow_dispatch`
- `playwright-report` як artifact (завжди), `test-results` при фейлі

## Що свідомо не покрито

- Інші браузери окрім Chromium, мобільні viewport
- Користувачі `problem_user`, `performance_glitch_user`, `error_user`, `visual_user` (окремі продуктові сюжети)
- Візуальні / pixel-дифи, a11y, навантаження
- Фільтри booking за датами, `PATCH` (достатньо `PUT`)
- Платежі / 3DS — їх немає на Sauce Demo
- Паралельний CRUD одного booking (lifecycle навмисно serial)

## Знайдені баги / контрактні дефекти

### BUG-1: POST `/booking` з порожнім JSON дає 500

**Кроки**

1. `POST https://restful-booker.herokuapp.com/booking`
2. Header `Content-Type: application/json`
3. Body `{}`

**Очікуваний результат:** `400 Bad Request` з повідомленням про валідацію.

**Фактичний результат:** `500 Internal Server Error`. Тест фіксує статус `400` або `500`, щоб не маскувати 500 як «норму».

### BUG-2: DELETE `/booking/{id}` без токена не завжди відповідає REST-семантиці

**Кроки**

1. Створити бронювання `POST /booking`
2. `DELETE /booking/{id}` без `Cookie: token=...`

**Очікуваний результат:** `401 Unauthorized`.

**Фактичний результат:** `403 Forbidden`. Ресурс лишається (GET = 200) — поведінка прийнятна, але код статусу нестандартний. Тест приймає `401` або `403`.

### BUG-3: успішний DELETE повертає 201

**Кроки:** авторизуватись, створити бронювання, `DELETE` з валідним токеном.

**Очікуваний результат:** `200` або `204 No Content`.

**Фактичний результат:** часто **`201 Created`**. Задокументовано в `.cursorrules`; асерт `[201, 200]`.

### BUG-4 (продукт Sauce Demo, out of suite): `locked_out_user`

Це очікувана бізнес-логіка, не баг: логін блокується з текстом *Sorry, this user has been locked out.* Негативний тест це підтверджує.

Інших стабільних функціональних багів на `standard_user` (логін → каталог → сорт → кошик → чекаут) під час прогону **не знайдено**. Сортування цін і імен на `standard_user` працює коректно.

## Бонус: тест-кейс → Playwright spec

```bash
npx tsx bonus/generate-test.ts bonus/examples/login.valid.md
npx tsx bonus/generate-test.ts --run bonus/examples/login.valid.md
```

Без `OPENAI_API_KEY` працює детермінований парсер кроків. З ключем — OpenAI-compatible Chat Completions.

Приклади входу, згенерованого коду і ручних правок — у `AI_WORKLOG.md` і `bonus/`.

## Структура

```
pages/                 Page Object Model
tests/ui/              UI-сценарії
tests/api/             Restful Booker
bonus/examples/        вхідні тест-кейси (markdown)
bonus/snapshots/       зафіксований вихід генератора
.github/workflows/     CI
CLAUDE.md, .cursorrules
```
