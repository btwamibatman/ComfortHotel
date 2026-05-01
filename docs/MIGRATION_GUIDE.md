# ComfortHotel вЂ” Migration Guide (Monolith to Microservices)

## 0. РљРѕРЅС‚РµРєСЃС‚ РїСЂРѕРµРєС‚Р°

**РўРµРєСѓС‰Р°СЏ Р°СЂС…РёС‚РµРєС‚СѓСЂР°:** РјРѕРЅРѕР»РёС‚ РЅР° Express + EJS (SSR) + PostgreSQL + Nginx Gateway.

**Р¦РµР»РµРІР°СЏ Р°СЂС…РёС‚РµРєС‚СѓСЂР°:** РјРёРєСЂРѕСЃРµСЂРІРёСЃС‹ + Web UI (РѕСЃС‚Р°РІС€РёР№СЃСЏ РјРѕРЅРѕР»РёС‚ РєР°Рє frontend-РєР»РёРµРЅС‚) + Nginx API Gateway.

Р’ С‚РµРєСѓС‰РµРј СЂРµРїРѕР·РёС‚РѕСЂРёРё РїР°РїРєРё `services/` РїРѕРєР° РЅРµС‚. `product-service`, `order-service`, `chat-service` Рё `auth-service` РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ СЃРѕР·РґР°РЅС‹ РІ РїСЂРѕС†РµСЃСЃРµ РјРёРіСЂР°С†РёРё.

### РЎС…РµРјР° Р‘Р” (PostgreSQL)

Р’СЃРµ РјРёРєСЂРѕСЃРµСЂРІРёСЃС‹ РЅР° РїРµСЂРІРѕРј СЌС‚Р°РїРµ РјРёРіСЂР°С†РёРё РёСЃРїРѕР»СЊР·СѓСЋС‚ РµРґРёРЅСѓСЋ PostgreSQL Р‘Р”. РЎС…РµРјР° Р»РµР¶РёС‚ РІ `database/init.sql`.

- `users`: `id`, `username`, `password`, `role` (`admin`, `manager`, `user`), `email`, `full_name`, `created_at`, `updated_at`
- `rooms`: `id`, `type`, `name`, `price`, `count`, `created_at`, `updated_at`
- `bookings`: `id`, `room_name`, `room_type`, `guest_name`, `guest_email`, `guest_phone`, `check_in_date`, `check_out_date`, `duration`, `number_of_guests`, `total_price`, `special_requests`, `status` (`pending`, `confirmed`, `checked-in`, `completed`, `cancelled`), `created_at`, `created_by`, `updated_at`, `updated_by`
- `contacts`: `id`, `name`, `email`, `message`, `source`, `created_at`, `created_by`, `updated_at`, `updated_by`
- `sessions`: `sid`, `sess`, `expire`

РРЅРґРµРєСЃС‹:

- `bookings_room_type_dates_idx`
- `bookings_status_idx`
- `sessions_expire_idx`

### РџРѕСЂС‚С‹ Рё РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР°

РўРµРєСѓС‰РёРµ РїРѕСЂС‚С‹ РёР· `docker-compose.yml`:

- Gateway (Nginx): host `80`, container `80`
- App (Web UI / Monolith): internal/exposed `3000`
- PostgreSQL: `5432`
- Prometheus: `9090`
- Grafana: host `3001`, container `3000`

### Auth Рё sessions

РЎРµР№С‡Р°СЃ auth СЂР°Р±РѕС‚Р°РµС‚ С‡РµСЂРµР· `express-session` Рё `connect-pg-simple`.

- Session table: `sessions`
- Cookie name: `sessionId`
- Cookie options: `httpOnly`, `secure` РІ production С‡РµСЂРµР· `auto`, `sameSite: lax`, `maxAge` РёР· `SESSION_TTL_SECONDS`
- РўРµРєСѓС‰РёР№ Nginx Gateway РЅРµ РёСЃРїРѕР»СЊР·СѓРµС‚ `auth_request`; РѕРЅ С‚РѕР»СЊРєРѕ РїСЂРѕРєСЃРёСЂСѓРµС‚ Р·Р°РїСЂРѕСЃС‹ РІ `app:3000`

## 1. РџРѕРґРіРѕС‚РѕРІРєР° Р±Р°Р·РѕРІРѕРіРѕ С€Р°Р±Р»РѕРЅР° (`services/_template`)

РЎРѕР·РґР°С‚СЊ РїР°РїРєСѓ `services` РІ РєРѕСЂРЅРµ РїСЂРѕРµРєС‚Р°. Р’СЃРµ РјРёРєСЂРѕСЃРµСЂРІРёСЃС‹ РґРѕР»Р¶РЅС‹ Р»РµР¶Р°С‚СЊ РІРЅСѓС‚СЂРё РЅРµРµ.

РЎРѕР·РґР°С‚СЊ `services/_template`, РєРѕС‚РѕСЂС‹Р№ Р·Р°С‚РµРј РєРѕРїРёСЂСѓРµС‚СЃСЏ РґР»СЏ РєР°Р¶РґРѕРіРѕ РЅРѕРІРѕРіРѕ СЃРµСЂРІРёСЃР°.

Р’РЅСѓС‚СЂРё `services/_template`:

- `package.json` СЃ Р·Р°РІРёСЃРёРјРѕСЃС‚СЏРјРё: `express`, `pg`, `dotenv`, `prom-client`, `winston`
- `Dockerfile` РЅР° Node.js Alpine
- `server.js` СЃ РїРѕРґРєР»СЋС‡РµРЅРёРµРј Рє Р‘Р” Рё Р·Р°РїСѓСЃРєРѕРј HTTP server
- `app.js` СЃ Express app, Р±Р°Р·РѕРІС‹РјРё middleware, `/health` Рё `/metrics`
- РїР°РїРєРё `config`, `controllers`, `services`, `repositories`, `utils`
- РѕР±С‰РёРµ С„Р°Р№Р»С‹, РїРµСЂРµРЅРµСЃРµРЅРЅС‹Рµ РёР· РјРѕРЅРѕР»РёС‚Р°: `logger.js`, `postgres.js`, `query.js`, `sqlHelpers.js`

## 2. Р’С‹РґРµР»РµРЅРёРµ Product Service (`rooms`)

**Р”РѕРјРµРЅ:** СѓРїСЂР°РІР»РµРЅРёРµ РЅРѕРјРµСЂРЅС‹Рј С„РѕРЅРґРѕРј, С‚Р°Р±Р»РёС†Р° `rooms`.

РЎРѕР·РґР°С‚СЊ `services/product-service` РёР· `services/_template`.

РџРµСЂРµРЅРµСЃС‚Рё РёР· РјРѕРЅРѕР»РёС‚Р°:

- `roomsRepository.js`
- `roomsService.js`
- `roomsController.js`
- `api/roomsRoutes.js`

РџРѕСЃР»Рµ РїРµСЂРµРЅРѕСЃР°:

- СѓР±СЂР°С‚СЊ Р·Р°РІРёСЃРёРјРѕСЃС‚СЊ РѕС‚ РјРѕРЅРѕР»РёС‚РЅРѕРіРѕ `isAdmin`;
- Р·Р°РјРµРЅРёС‚СЊ РїСЂРѕРІРµСЂРєСѓ РїСЂР°РІ РЅР° С‡С‚РµРЅРёРµ Р·Р°РіРѕР»РѕРІРєРѕРІ РѕС‚ Gateway;
- РґРѕР±Р°РІРёС‚СЊ С†РµР»РµРІРѕР№ РІРЅСѓС‚СЂРµРЅРЅРёР№ endpoint `GET /api/rooms/type/:type`;
- endpoint `GET /api/rooms/type/:type` РґРѕР»Р¶РµРЅ РІРѕР·РІСЂР°С‰Р°С‚СЊ `{ name, price, count }`;
- Web UI РґРѕР»Р¶РµРЅ РїРѕР»СѓС‡Р°С‚СЊ РєРѕРјРЅР°С‚С‹ С‡РµСЂРµР· HTTP-Р·Р°РїСЂРѕСЃ Рє `http://product-service:3000/api/rooms`;
- РїСЂСЏРјС‹Рµ РІС‹Р·РѕРІС‹ `roomsService` РёР· Web UI СѓРґР°Р»РёС‚СЊ РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕР№ РёРЅС‚РµРіСЂР°С†РёРё.

РўРµРєСѓС‰РёР№ РјРѕРЅРѕР»РёС‚РЅС‹Р№ `roomsService.getRoomByType(type)` РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ `bookingsService`; РїРѕСЃР»Рµ РјРёРіСЂР°С†РёРё СЌС‚Сѓ Р·Р°РІРёСЃРёРјРѕСЃС‚СЊ РґРѕР»Р¶РµРЅ Р·Р°РјРµРЅРёС‚СЊ HTTP-РІС‹Р·РѕРІ РІ `product-service`.

## 3. Р’С‹РґРµР»РµРЅРёРµ Order Service (`bookings`)

**Р”РѕРјРµРЅ:** СѓРїСЂР°РІР»РµРЅРёРµ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏРјРё, С‚Р°Р±Р»РёС†Р° `bookings`.

РЎРѕР·РґР°С‚СЊ `services/order-service` РёР· `services/_template`.

РџРµСЂРµРЅРµСЃС‚Рё РёР· РјРѕРЅРѕР»РёС‚Р°:

- `bookingsRepository.js`
- `bookingsService.js`
- `bookingsController.js`
- `api/bookingsRoutes.js`
- `utils/validators.js`

РџРѕСЃР»Рµ РїРµСЂРµРЅРѕСЃР°:

- Р·Р°РјРµРЅРёС‚СЊ РІС‹Р·РѕРІС‹ `roomsService.getRoomByType(type)` РЅР° HTTP-Р·Р°РїСЂРѕСЃС‹ Рє Product Service;
- РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ `PRODUCT_SERVICE_URL=http://product-service:3000`;
- С†РµР»РµРІРѕР№ Р·Р°РїСЂРѕСЃ: `GET ${PRODUCT_SERVICE_URL}/api/rooms/type/:type`;
- РѕР¶РёРґР°С‚СЊ РѕС‚РІРµС‚ `{ name, price, count }`;
- СЃС‚Р°СЂС‹Р№ РєРѕРґ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёР№ РёР· РјРѕРЅРѕР»РёС‚Р° СѓРґР°Р»РёС‚СЊ РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ РїРµСЂРµРєР»СЋС‡РµРЅРёСЏ РјР°СЂС€СЂСѓС‚РѕРІ РЅР° `order-service`.

## 4. Р’С‹РґРµР»РµРЅРёРµ Chat Service (`contacts`)

**Р”РѕРјРµРЅ:** СЃРѕРѕР±С‰РµРЅРёСЏ РёР· С„РѕСЂРјС‹ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё, С‚Р°Р±Р»РёС†Р° `contacts`.

РЎРѕР·РґР°С‚СЊ `services/chat-service` РёР· `services/_template`.

РџРµСЂРµРЅРµСЃС‚Рё РёР· РјРѕРЅРѕР»РёС‚Р°:

- `contactsRepository.js`
- `contactsService.js`
- `contactsController.js`
- `api/contactsRoutes.js`

РџРѕСЃР»Рµ РїРµСЂРµРЅРѕСЃР°:

- РІ Web UI Р·Р°РјРµРЅРёС‚СЊ РїСЂСЏРјРѕР№ РІС‹Р·РѕРІ `contactsController.submitPublicContact` РЅР° HTTP-Р·Р°РїСЂРѕСЃ РІ `chat-service`;
- С†РµР»РµРІРѕР№ endpoint РґР»СЏ С„РѕСЂРјС‹ СЃРІСЏР·Рё: `POST /api/contacts`;
- СЃС‚Р°СЂС‹Р№ РєРѕРґ contacts РёР· РјРѕРЅРѕР»РёС‚Р° СѓРґР°Р»РёС‚СЊ РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ РїРµСЂРµРєР»СЋС‡РµРЅРёСЏ РјР°СЂС€СЂСѓС‚РѕРІ.

## 5. Auth Service (`users`, `sessions`, auth/status)

**Р”РѕРјРµРЅ:** РїРѕР»СЊР·РѕРІР°С‚РµР»Рё, СЃРµСЃСЃРёРё, Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ, Р°РІС‚РѕСЂРёР·Р°С†РёСЏ.

РЎРѕР·РґР°С‚СЊ `services/auth-service`.

РџРµСЂРµРЅРµСЃС‚Рё РёР· РјРѕРЅРѕР»РёС‚Р°:

- `userRepository.js`
- `authService.js`
- `authController.js`
- `authRoutes.js`
- `config/session.js`

РЎС‚СЂР°С‚РµРіРёСЏ РјРёРіСЂР°С†РёРё СЃРµСЃСЃРёР№:

- СЃРЅР°С‡Р°Р»Р° РїРѕРґРЅСЏС‚СЊ `auth-service` РїР°СЂР°Р»Р»РµР»СЊРЅРѕ РјРѕРЅРѕР»РёС‚Сѓ;
- РЅРµ РјРµРЅСЏС‚СЊ С„РѕСЂРјР°С‚ session cookie РЅР° РїРµСЂРІРѕРј С€Р°РіРµ;
- РѕСЃС‚Р°РІРёС‚СЊ cookie name `sessionId`;
- РѕСЃС‚Р°РІРёС‚СЊ PostgreSQL-backed sessions С‡РµСЂРµР· С‚Р°Р±Р»РёС†Сѓ `sessions`;
- РїРѕСЃР»Рµ СЌС‚РѕРіРѕ РЅР°СЃС‚СЂРѕРёС‚СЊ Nginx `auth_request`;
- Nginx РґРѕР»Р¶РµРЅ РІР°Р»РёРґРёСЂРѕРІР°С‚СЊ СЃРµСЃСЃРёСЋ С‡РµСЂРµР· `auth-service`;
- РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕР№ РїСЂРѕРІРµСЂРєРё Nginx РґРѕР»Р¶РµРЅ РїСЂРѕРєРёРґС‹РІР°С‚СЊ РІ СЃРµСЂРІРёСЃС‹ Р·Р°РіРѕР»РѕРІРєРё `X-User-Id` Рё `X-User-Role`;
- middleware РІ РјРёРєСЂРѕСЃРµСЂРІРёСЃР°С… РґРѕР»Р¶РµРЅ С‡РёС‚Р°С‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РёР· HTTP-Р·Р°РіРѕР»РѕРІРєРѕРІ, Р° РЅРµ РёР· `req.session.user`.

Р¦РµР»РµРІРѕР№ endpoint РґР»СЏ Gateway:

- `GET /api/auth/status`
- РїСЂРё РІР°Р»РёРґРЅРѕР№ СЃРµСЃСЃРёРё РІРѕР·РІСЂР°С‰Р°РµС‚ `200 OK`
- РІ РѕС‚РІРµС‚Рµ РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ headers: `X-User-Id`, `X-User-Role`

## 6. РћР±РЅРѕРІР»РµРЅРёРµ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂС‹

### Nginx Gateway

РўРµРєСѓС‰РёР№ `nginx/default.conf` РїСЂРѕРєСЃРёСЂСѓРµС‚ РІРµСЃСЊ С‚СЂР°С„РёРє РІ `app:3000`. РџРѕСЃР»Рµ РјРёРіСЂР°С†РёРё Gateway РґРѕР»Р¶РµРЅ РјР°СЂС€СЂСѓС‚РёР·РёСЂРѕРІР°С‚СЊ API РїРѕ СЃРµСЂРІРёСЃР°Рј.

Р¦РµР»РµРІС‹Рµ upstreams:

```nginx
upstream web_ui { server app:3000; }
upstream product_svc { server product-service:3000; }
upstream order_svc { server order-service:3000; }
upstream chat_svc { server chat-service:3000; }
upstream auth_svc { server auth-service:3000; }
```

Р¦РµР»РµРІС‹Рµ РјР°СЂС€СЂСѓС‚С‹:

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

РџРѕСЃР»Рµ СЃРѕР·РґР°РЅРёСЏ СЃРµСЂРІРёСЃРѕРІ РѕР±РЅРѕРІРёС‚СЊ `docker-compose.yml`.

Р¦РµР»РµРІС‹Рµ СЃРµСЂРІРёСЃС‹:

- `postgres`
- `app` РєР°Рє Web UI / Р±С‹РІС€РёР№ РјРѕРЅРѕР»РёС‚
- `gateway`
- `product-service`
- `order-service`
- `chat-service`
- `auth-service`
- `prometheus`
- `grafana`

Р”Р»СЏ `order-service` РґРѕР±Р°РІРёС‚СЊ:

```yaml
environment:
  PRODUCT_SERVICE_URL: http://product-service:3000
```

## 7. РњРµР¶СЃРµСЂРІРёСЃРЅС‹Рµ РєРѕРЅС‚СЂР°РєС‚С‹

| РРЅРёС†РёР°С‚РѕСЂ | Р¦РµР»РµРІРѕР№ СЃРµСЂРІРёСЃ | РњРµС‚РѕРґ Рё endpoint | РћР¶РёРґР°РµРјС‹Р№ РѕС‚РІРµС‚ | РќР°Р·РЅР°С‡РµРЅРёРµ |
|---|---|---|---|---|
| Web UI | `product-service` | `GET /api/rooms` | `[{ _id, type, name, price, count, created_at, updated_at }]` | Р РµРЅРґРµСЂ СЃРїРёСЃРєР° РєРѕРјРЅР°С‚ |
| Web UI | `chat-service` | `POST /api/contacts` | `{ success: true, id }` | РћС‚РїСЂР°РІРєР° С„РѕСЂРјС‹ СЃРІСЏР·Рё |
| `order-service` | `product-service` | `GET /api/rooms/type/:type` | `{ name, price, count }` | РџРѕР»СѓС‡РµРЅРёРµ С†РµРЅС‹ Рё РґР°РЅРЅС‹С… РєРѕРјРЅР°С‚С‹ РґР»СЏ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ |
| Nginx Gateway | `auth-service` | `GET /api/auth/status` | `200 OK`, headers: `X-User-Id`, `X-User-Role` | Р’Р°Р»РёРґР°С†РёСЏ session cookie С‡РµСЂРµР· `auth_request` |

## 8. РљСЂРёС‚РµСЂРёРё РіРѕС‚РѕРІРѕ

РџРѕСЃР»Рµ РєР°Р¶РґРѕРіРѕ СЌС‚Р°РїР° РјРёРіСЂР°С†РёРё РїСЂРѕРІРµСЂСЏС‚СЊ С‚РѕР»СЊРєРѕ РёР·РјРµРЅРµРЅРЅС‹Р№ СѓС‡Р°СЃС‚РѕРє Рё Р±Р°Р·РѕРІСѓСЋ СЂР°Р±РѕС‚РѕСЃРїРѕСЃРѕР±РЅРѕСЃС‚СЊ СЃРёСЃС‚РµРјС‹.

РћР±С‰РёР№ checklist:

- `npm install` РїСЂРѕС…РѕРґРёС‚ СѓСЃРїРµС€РЅРѕ РґР»СЏ РёР·РјРµРЅРµРЅРЅС‹С… Node.js packages;
- `docker compose up --build -d` РїСЂРѕС…РѕРґРёС‚ СѓСЃРїРµС€РЅРѕ;
- РІСЃРµ РєРѕРЅС‚РµР№РЅРµСЂС‹ РЅР°С…РѕРґСЏС‚СЃСЏ РІ СЃС‚Р°С‚СѓСЃРµ `healthy` РёР»Рё `running`;
- Web UI РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РЅР° `http://localhost`;
- `/admin/login` СЂР°Р±РѕС‚Р°РµС‚;
- `/staff/login` СЂР°Р±РѕС‚Р°РµС‚;
- СЃРїРёСЃРѕРє РєРѕРјРЅР°С‚ РѕС‚РѕР±СЂР°Р¶Р°РµС‚СЃСЏ;
- СЃРѕР·РґР°РЅРёРµ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ СЂР°Р±РѕС‚Р°РµС‚;
- РѕС‚РїСЂР°РІРєР° СЃРѕРѕР±С‰РµРЅРёСЏ РёР· С„РѕСЂРјС‹ СЃРІСЏР·Рё СЂР°Р±РѕС‚Р°РµС‚;
- Prometheus targets РЅР°С…РѕРґСЏС‚СЃСЏ РІ СЃС‚Р°С‚СѓСЃРµ `UP`;
- Grafana dashboard РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РЅР° `http://localhost:3001`;
- incident simulation РґР»СЏ `order-service` С„РёРєСЃРёСЂСѓРµС‚СЃСЏ РІ logs, Prometheus Рё Grafana;
- РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ РїРѕСЃР»Рµ incident РІРѕР·РІСЂР°С‰Р°РµС‚ СЃРѕР·РґР°РЅРёРµ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёР№ РІ СЂР°Р±РѕС‡РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ.

Incident simulation:

```bash
docker compose -f docker-compose.yml -f docker-compose.incident.yml up -d order-service
```

Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ:

```bash
docker compose up -d order-service
```

## 9. Р’Р°Р¶РЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ

- РќР° РїРµСЂРІРѕРј СЌС‚Р°РїРµ РјРёРєСЂРѕСЃРµСЂРІРёСЃС‹ РёСЃРїРѕР»СЊР·СѓСЋС‚ РѕРґРЅСѓ PostgreSQL Р‘Р”.
- РќРµ РїРµСЂРµС…РѕРґРёС‚СЊ РЅР° JWT РІ СЌС‚РѕРј guide; С‚РµРєСѓС‰Р°СЏ СЃС‚СЂР°С‚РµРіРёСЏ РѕСЃРЅРѕРІР°РЅР° РЅР° `express-session`, `connect-pg-simple` Рё cookie `sessionId`.
- РќРµ СѓРґР°Р»СЏС‚СЊ РєРѕРґ РёР· РјРѕРЅРѕР»РёС‚Р° РґРѕ РїСЂРѕРІРµСЂРєРё СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РµРіРѕ РЅРѕРІРѕРіРѕ СЃРµСЂРІРёСЃР°.
- РќРµ РґРѕР±Р°РІР»СЏС‚СЊ `auth_request` РґРѕ С‚РѕРіРѕ, РєР°Рє `auth-service` СЃС‚Р°Р±РёР»СЊРЅРѕ РѕС‚РІРµС‡Р°РµС‚ РЅР° `GET /api/auth/status`.
- Р’СЃРµ РЅРѕРІС‹Рµ РјРµР¶СЃРµСЂРІРёСЃРЅС‹Рµ HTTP-РІС‹Р·РѕРІС‹ РґРѕР»Р¶РЅС‹ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅРЅС‹Рµ РєРѕРЅС‚СЂР°РєС‚С‹ РёР· СЂР°Р·РґРµР»Р° 7.
