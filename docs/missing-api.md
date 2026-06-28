# Missing API endpoints

Разрыв между тем, что нужно клиенту, и тем, что реализовано в `landly-server`.  
Анализ основан на прочтении всех `config.rs`, `presenters.rs`, `requests.rs` сервера и всех `src/services/*.ts` клиента (июнь 2026).

---

## Карта разрывов

| # | Что нужно клиенту | Статус сервера | Затронутые страницы |
|---|---|---|---|
| 1 | GET /api/user/me | ❌ отсутствует | AccountPage, AuthStore hydration |
| 2 | PUT /api/user/me | ❌ отсутствует | /profile |
| 3 | DELETE /api/user/me | ❌ отсутствует | /profile |
| 4 | GET /api/user/me/organisations | ❌ отсутствует + схема БД | AccountPage (My Orgs tab) |
| 5 | GET /api/common/languages | ❌ отсутствует | /profile (language picker) |
| 6 | GET /api/common/countries/:id/languages | ❌ отсутствует | CountriesPage, OrgDetail |
| 7 | Messages API (5 endpoints) | ❌ не существует | /messages, /messages/:id |
| 8 | Saved/Bookmarks API (3 endpoints) | ❌ не существует | /saved |
| 9 | from_country_id на CountryConnection | ❌ нет поля в схеме | CountriesPage, corridor filter |
| 10 | GET /api/images/fetch/:id | ✅ есть на сервере | imageApi — метод не написан |

---

## 1. GET /api/user/me

**Зачем:** При перезагрузке страницы `authStore` восстанавливает `token` из `localStorage`, но не может заново получить актуальные данные пользователя (username, email). Сейчас хранится snapshot на момент логина/регистрации — он не обновляется.

**Запрос:**
```
GET /api/user/me
Authorization: Bearer <token>
```

**Ответ** (200):
```jsonc
{
  "id": "uuid",
  "username": "anna",
  "email": "anna@example.com",
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2026-06-01T12:00:00"
}
```

**Реализация на сервере:** Извлечь user_id из JWT middleware (уже реализован в `auth.rs`) → `user_repository.find_by_id(user_id)` → вернуть через существующий `UserPresenter`.

---

## 2. PUT /api/user/me

**Зачем:** Страница `/profile` должна позволять менять username, email и пароль.

**Запрос:**
```
PUT /api/user/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_name",       // опционально
  "email": "new@example.com",  // опционально
  "current_password": "...",   // обязательно при смене email/пароля
  "new_password": "..."        // опционально
}
```

**Ответ** (200): тот же формат, что GET /api/user/me.

**Замечания:**
- `current_password` обязателен при смене `email` или `new_password` (защита от захвата аккаунта)
- Username-уникальность должна проверяться на сервере (409 Conflict при дубле)

---

## 3. DELETE /api/user/me

**Зачем:** Удаление аккаунта — стандартное требование GDPR.

**Запрос:**
```
DELETE /api/user/me
Authorization: Bearer <token>
Content-Type: application/json

{ "password": "..." }  // подтверждение
```

**Ответ** (200): `{ "message": "Account deleted" }`

**Замечания:** Каскадное удаление `user_providers`, `users_to_languages`, созданных организаций (или перевод в `orphaned` статус).

---

## 4. GET /api/user/me/organisations

**Зачем:** Вкладка «Мои места» в `AccountPage` показывает организации текущего пользователя.

**Проблема схемы БД:** Таблица `organisations` не имеет поля `owner_user_id` / `created_by`. Без него невозможно определить принадлежность.

**Необходимые изменения на сервере:**
1. Миграция: добавить `created_by_user_id UUID REFERENCES users(id)` в таблицу `organisations`.
2. Заполнять это поле из JWT middleware при `POST /api/organisation/create`.
3. Реализовать эндпоинт:

```
GET /api/user/me/organisations
Authorization: Bearer <token>

Query: ?status=pending|live|rejected  // опционально
```

**Ответ** (200):
```jsonc
{
  "items": [
    {
      "id": "uuid",
      "name": "Babushka Bakery",
      "organisationTypeId": "uuid",
      "locationCountryId": "uuid",
      "status": "pending",      // новое поле — статус модерации
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1
}
```

**Замечания:** Поле `status` (`pending | live | rejected`) тоже отсутствует в текущей схеме — нужна отдельная миграция или таблица `organisation_moderation`.

---

## 5. GET /api/common/languages

**Зачем:** Таблица `languages (id, name, symbol)` существует в БД. Эндпоинты `POST /api/user/languages` и `DELETE /api/user/languages` принимают `language_id: UUID`, но клиенту неоткуда взять доступные ID — нет справочника.

**Запрос:**
```
GET /api/common/languages
```

**Ответ** (200):
```jsonc
[
  { "id": "uuid", "name": "Russian", "symbol": "ru" },
  { "id": "uuid", "name": "German",  "symbol": "de" },
  { "id": "uuid", "name": "English", "symbol": "en" }
]
```

**Реализация:** По аналогии с `GET /api/common/countries` — репозиторий `SELECT * FROM languages`, кэш Redis 1 час.

---

## 6. GET /api/common/countries/:id/languages

**Зачем:** Таблица `countries_to_languages` связывает страны с языками, но нет эндпоинта для её чтения. Нужно для отображения языков страны на странице страны и в OrgDetail.

**Запрос:**
```
GET /api/common/countries/:id/languages
```

**Ответ** (200): массив `Language[]` (тот же формат, что §5).

---

## 7. Messages API

**Зачем:** Страницы `/messages` (список переписок) и `/messages/:id` (тред) сейчас рендерят захардкоженные mock-данные. Нужна полноценная система личных сообщений.

**Важное уточнение:** Таблица `chats` в БД — это НЕ мессенджер. Это ссылки на внешние чаты (Telegram/WhatsApp групп), привязанные к `country_connection`. Для P2P-сообщений нужны новые таблицы.

### Необходимые таблицы (миграция):

```sql
-- Переписка между двумя пользователями
CREATE TABLE conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a_id UUID NOT NULL REFERENCES users(id),
  participant_b_id UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMP NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (participant_a_id, participant_b_id)
);

-- Сообщения в переписке
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  text            TEXT NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  read_at         TIMESTAMP
);
```

### Эндпоинты:

**GET /api/messages** — список переписок текущего пользователя
```
Authorization: Bearer <token>

Response 200:
{
  "items": [
    {
      "id": "uuid",
      "participantIds": ["uuid-a", "uuid-b"],
      "lastMessage": { "text": "...", "senderId": "uuid", "createdAt": "..." },
      "unreadCount": 2,
      "updatedAt": "..."
    }
  ],
  "total": 4
}
```

**GET /api/messages/:id** — тред
```
Authorization: Bearer <token>
Query: ?limit=50&offset=0

Response 200:
{
  "conversation": { "id": "uuid", "participantIds": [...] },
  "messages": [
    { "id": "uuid", "senderId": "uuid", "text": "...", "createdAt": "...", "readAt": null }
  ],
  "total": 12
}
```

**POST /api/messages** — начать новую переписку или отправить первое сообщение
```
Authorization: Bearer <token>
Body: { "recipientId": "uuid", "text": "Привет!" }

Response 201:
{
  "conversationId": "uuid",
  "message": { "id": "uuid", "senderId": "uuid", "text": "Привет!", "createdAt": "..." }
}
```

**POST /api/messages/:id** — ответить в существующем треде
```
Authorization: Bearer <token>
Body: { "text": "Sure — book via service.berlin.de" }

Response 201: { "id": "uuid", "senderId": "uuid", "text": "...", "createdAt": "..." }
```

**PUT /api/messages/:id/read** — пометить тред как прочитанный
```
Authorization: Bearer <token>
Response 200: { "unreadCount": 0 }
```

---

## 8. Saved / Bookmarks API

**Зачем:** `savedStore` хранит закладки только в `localStorage`. При смене устройства или очистке браузера они теряются. Нужна серверная персистентность.

### Необходимая таблица (миграция):

```sql
CREATE TABLE saved_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       VARCHAR(32) NOT NULL,  -- 'organisation' | 'country' | 'person' | 'corridor'
  target_id  UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, target_id)
);
```

### Эндпоинты:

**GET /api/saved** — список закладок текущего пользователя
```
Authorization: Bearer <token>
Query: ?kind=organisation|country|person|corridor  // фильтр по типу

Response 200:
{
  "items": [
    { "id": "uuid", "kind": "organisation", "targetId": "uuid", "createdAt": "..." }
  ],
  "total": 7
}
```

**POST /api/saved** — добавить закладку
```
Authorization: Bearer <token>
Body: { "kind": "organisation", "targetId": "uuid" }

Response 201: { "id": "uuid", "kind": "organisation", "targetId": "uuid", "createdAt": "..." }
```

**DELETE /api/saved/:id** — удалить закладку
```
Authorization: Bearer <token>
Response 200: { "message": "Removed" }
```

---

## 9. from_country_id на CountryConnection (схема)

**Зачем:** Таблица `countries_connections` содержит только `location_country_id` (страна назначения). Для коридорной логики (откуда → куда) нужно знать страну происхождения.

Сейчас клиент может фильтровать связи по `location_country_id`, но не по обеим сторонам коридора одновременно. Если пользователь выбрал коридор RU → DE, клиент получает все коннекции с `location_country_id = DE`, хотя некоторые из них могут не иметь отношения к россиянам.

**Необходимое изменение схемы:**
```sql
ALTER TABLE countries_connections
  ADD COLUMN founder_country_id UUID REFERENCES countries(id);
```

**Обновление запроса `/api/country-connection/list`:**  
Добавить `founder_country_id` в `CountryConnectionsListQueryParams` и в репозиторный фильтр.

---

## 10. GET /api/images/fetch/:id (только клиент)

Единственный случай, когда сервер реализовал эндпоинт, а клиент его не вызывает.

**На сервере:** `GET /api/images/fetch/{id}` → возвращает `ImageContent` с публичным URL.  
**На клиенте:** в `src/services/image.service.ts` отсутствует метод `fetchImage`.

**Исправление (только клиент):**
```typescript
// src/services/image.service.ts
fetchImage: async (id: string): Promise<OrgImage> => {
  const response = await apiClient.get(`/api/images/fetch/${id}`)
  return response.data
},
```

---

## Приоритеты реализации

| Приоритет | Пункт | Блокирует |
|---|---|---|
| 🔴 Критично | §1 GET /api/user/me | AuthStore hydration после reload |
| 🔴 Критично | §4 owner на organisations + GET /api/user/me/organisations | AccountPage My Orgs |
| 🟠 Высокий | §7 Messages API | Весь раздел /messages |
| 🟠 Высокий | §5 GET /api/common/languages | Языковой профиль пользователя |
| 🟡 Средний | §2 PUT /api/user/me | /profile редактирование |
| 🟡 Средний | §8 Saved API | Кросс-устройственные закладки |
| 🟡 Средний | §9 from_country_id | Точная коридорная фильтрация |
| 🟢 Низкий | §6 countries/:id/languages | Детали страны |
| 🟢 Низкий | §3 DELETE /api/user/me | GDPR compliance |
| 🟢 Низкий | §10 imageApi.fetchImage | Разовый просмотр одного фото |
