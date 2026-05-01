# ComfortHotel — Migration Guide (Monolith to Microservices)

## 0. Контекст проекта

**Текущая архитектура:** монолит на Express + EJS (SSR) + PostgreSQL + Nginx Gateway.

**Целевая архитектура:** микросервисы + Web UI (оставшийся монолит как frontend-клиент) + Nginx API Gateway.

В текущем репозитории папки `services/` пока нет. `product-service`, `order-service`, `chat-service` и `auth-service` должны быть созданы в процессе миграции.

### Схема БД (PostgreSQL)

Все микросервисы на первом этапе миграции используют единую PostgreSQL БД. Схема лежит в `database/init.sql`.

- `users`: `id`, `username`, `password`, `role` (`admin`, `manager`, `user`), `email`, `full_name`, `created_at`, `updated_at`
- `rooms`: `id`, `type`, `name`, `price`, `count`, `created_at`, `updated_at`
- `bookings`: `id`, `room_name`, `room_type`, `guest_name`, `guest_email`, `guest_phone`, `check_in_date`, `check_out_date`, `duration`, `number_of_guests`, `total_price`, `special_requests`, `status` (`pending`, `confirmed`, `checked-in`, `completed`, `cancelled`), `created_at`, `created_by`, `updated_at`, `updated_by`
- `contacts`: `id`, `name`, `email`, `message`, `source`, `created_at`, `created_by`, `updated_at`, `updated_by`
- `sessions`: `sid`, `sess`, `expire`

Индексы:

- `bookings_room_type_dates_idx`
- `bookings_status_idx`
- `sessions_expire_idx`

### Порты и инфраструктура

Текущие порты из `docker-compose.yml`:

- Gateway (Nginx): host `80`, container `80`
- App (Web UI / Monolith): internal/exposed `3000`
- PostgreSQL: `5432`
- Prometheus: `9090`
- Grafana: host `3001`, container `3000`

### Auth и sessions

Сейчас auth работает через `express-session` и `connect-pg-simple`.

- Session table: `sessions`
- Cookie name: `sessionId`
- Cookie options: `httpOnly`, `secure` в production через `auto`, `sameSite: lax`, `maxAge` из `SESSION_TTL_SECONDS`
- Текущий Nginx Gateway не использует `auth_request`; он только проксирует запросы в `app:3000`

## 1. Подготовка базового шаблона (`services/_template`)

Создать папку `services` в корне проекта. Все микросервисы должны лежать внутри нее.

Создать `services/_template`, который затем копируется для каждого нового сервиса.

Внутри `services/_template`:

- `package.json` с зависимостями: `express`, `pg`, `dotenv`, `prom-client`, `winston`
- `Dockerfile` на Node.js Alpine
- `server.js` с подключением к БД и запуском HTTP server
- `app.js` с Express app, базовыми middleware, `/health` и `/metrics`
- папки `config`, `controllers`, `services`, `repositories`, `utils`
- общие файлы, перенесенные из монолита: `logger.js`, `postgres.js`, `query.js`, `sqlHelpers.js`

## 2. Выделение Product Service (`rooms`)

**Домен:** управление номерным фондом, таблица `rooms`.

Создать `services/product-service` из `services/_template`.

Перенести из монолита:

- `roomsRepository.js`
- `roomsService.js`
- `roomsController.js`
- `api/roomsRoutes.js`

После переноса:

- убрать зависимость от монолитного `isAdmin`;
- заменить проверку прав на чтение заголовков от Gateway;
- добавить целевой внутренний endpoint `GET /api/rooms/type/:type`;
- endpoint `GET /api/rooms/type/:type` должен возвращать `{ name, price, count }`;
- Web UI должен получать комнаты через HTTP-запрос к `http://product-service:3000/api/rooms`;
- прямые вызовы `roomsService` из Web UI удалить после успешной интеграции.

Текущий монолитный `roomsService.getRoomByType(type)` используется `bookingsService`; после миграции эту зависимость должен заменить HTTP-вызов в `product-service`.

## 3. Выделение Order Service (`bookings`)

**Домен:** управление бронированиями, таблица `bookings`.

Создать `services/order-service` из `services/_template`.

Перенести из монолита:

- `bookingsRepository.js`
- `bookingsService.js`
- `bookingsController.js`
- `api/bookingsRoutes.js`
- `utils/validators.js`

После переноса:

- заменить вызовы `roomsService.getRoomByType(type)` на HTTP-запросы к Product Service;
- использовать `PRODUCT_SERVICE_URL=http://product-service:3000`;
- целевой запрос: `GET ${PRODUCT_SERVICE_URL}/api/rooms/type/:type`;
- ожидать ответ `{ name, price, count }`;
- старый код бронирований из монолита удалить после успешного переключения маршрутов на `order-service`.

## 4. Выделение Chat Service (`contacts`)

**Домен:** сообщения из формы обратной связи, таблица `contacts`.

Создать `services/chat-service` из `services/_template`.

Перенести из монолита:

- `contactsRepository.js`
- `contactsService.js`
- `contactsController.js`
- `api/contactsRoutes.js`

После переноса:

- в Web UI заменить прямой вызов `contactsController.submitPublicContact` на HTTP-запрос в `chat-service`;
- целевой endpoint для формы связи: `POST /api/contacts`;
- старый код contacts из монолита удалить после успешного переключения маршрутов.

## 5. Auth Service (`users`, `sessions`, auth/status)

**Домен:** пользователи, сессии, аутентификация, авторизация.

Создать `services/auth-service`.

Перенести из монолита:

- `userRepository.js`
- `authService.js`
- `authController.js`
- `authRoutes.js`
- `config/session.js`

Стратегия миграции сессий:

- сначала поднять `auth-service` параллельно монолиту;
- не менять формат session cookie на первом шаге;
- оставить cookie name `sessionId`;
- оставить PostgreSQL-backed sessions через таблицу `sessions`;
- после этого настроить Nginx `auth_request`;
- Nginx должен валидировать сессию через `auth-service`;
- после успешной проверки Nginx должен прокидывать в сервисы заголовки `X-User-Id` и `X-User-Role`;
- middleware в микросервисах должен читать пользователя из HTTP-заголовков, а не из `req.session.user`.

Целевой endpoint для Gateway:

- `GET /api/auth/status`
- при валидной сессии возвращает `200 OK`
- в ответе должны быть headers: `X-User-Id`, `X-User-Role`

## 6. Обновление инфраструктуры

### Nginx Gateway

Текущий `nginx/default.conf` проксирует весь трафик в `app:3000`. После миграции Gateway должен маршрутизировать API по сервисам.

Целевые upstreams:

```nginx
upstream web_ui { server app:3000; }
upstream product_svc { server product-service:3000; }
upstream order_svc { server order-service:3000; }
upstream chat_svc { server chat-service:3000; }
upstream auth_svc { server auth-service:3000; }
```

Целевые маршруты:

```nginx
location = /auth/status {
  internal;
  proxy_pass http://auth_svc/api/auth/status;
  proxy_pass_request_body off;
  proxy_set_header Content-Length "";
  proxy_set_header X-Original-URI $request_uri;
}

location /api/bookings/ {
  auth_request /auth/status;
  auth_request_set $auth_user_id $upstream_http_x_user_id;
  auth_request_set $auth_user_role $upstream_http_x_user_role;
  proxy_set_header X-User-Id $auth_user_id;
  proxy_set_header X-User-Role $auth_user_role;
  proxy_pass http://order_svc;
}

location /api/rooms/ { proxy_pass http://product_svc; }
location /api/contacts/ { proxy_pass http://chat_svc; }
location /auth/ { proxy_pass http://auth_svc; }
location / { proxy_pass http://web_ui; }
```

### Docker Compose

После создания сервисов обновить `docker-compose.yml`.

Целевые сервисы:

- `postgres`
- `app` как Web UI / бывший монолит
- `gateway`
- `product-service`
- `order-service`
- `chat-service`
- `auth-service`
- `prometheus`
- `grafana`

Для `order-service` добавить:

```yaml
environment:
  PRODUCT_SERVICE_URL: http://product-service:3000
```

## 7. Межсервисные контракты

| Инициатор | Целевой сервис | Метод и endpoint | Ожидаемый ответ | Назначение |
|---|---|---|---|---|
| Web UI | `product-service` | `GET /api/rooms` | `[{ _id, type, name, price, count, created_at, updated_at }]` | Рендер списка комнат |
| Web UI | `chat-service` | `POST /api/contacts` | `{ success: true, id }` | Отправка формы связи |
| `order-service` | `product-service` | `GET /api/rooms/type/:type` | `{ name, price, count }` | Получение цены и данных комнаты для бронирования |
| Nginx Gateway | `auth-service` | `GET /api/auth/status` | `200 OK`, headers: `X-User-Id`, `X-User-Role` | Валидация session cookie через `auth_request` |

## 8. Критерии готово

После каждого этапа миграции проверять только измененный участок и базовую работоспособность системы.

Общий checklist:

- `npm install` проходит успешно для измененных Node.js packages;
- `docker compose up --build -d` проходит успешно;
- все контейнеры находятся в статусе `healthy` или `running`;
- Web UI открывается на `http://localhost`;
- `/admin/login` работает;
- `/staff/login` работает;
- список комнат отображается;
- создание бронирования работает;
- отправка сообщения из формы связи работает;
- Prometheus targets находятся в статусе `UP`;
- Grafana dashboard открывается на `http://localhost:3001`;
- incident simulation для `order-service` фиксируется в logs, Prometheus и Grafana;
- восстановление после incident возвращает создание бронирований в рабочее состояние.

Incident simulation:

```bash
docker compose -f docker-compose.yml -f docker-compose.incident.yml up -d order-service
```

Восстановление:

```bash
docker compose up -d order-service
```

## 9. Важные ограничения

- На первом этапе микросервисы используют одну PostgreSQL БД.
- Не переходить на JWT в этом guide; текущая стратегия основана на `express-session`, `connect-pg-simple` и cookie `sessionId`.
- Не удалять код из монолита до проверки соответствующего нового сервиса.
- Не добавлять `auth_request` до того, как `auth-service` стабильно отвечает на `GET /api/auth/status`.
- Все новые межсервисные HTTP-вызовы должны использовать зафиксированные контракты из раздела 7.
