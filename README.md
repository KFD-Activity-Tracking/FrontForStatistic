# KFD Activity Tracker — FrontForStatistic

Административная панель для просмотра статистики активности пользователей.

## Запуск

```bash
npm install
npm run dev    # Dev-сервер на http://localhost:5173
npm run build  # Продакшн-сборка
```

Сервер должен быть запущен на порту 8765. Vite автоматически проксирует `/api` и `/auth` на него.

## Навигация по ролям

| Роль | Что видит после логина |
|------|------------------------|
| ADMIN | Список менеджеров → клик → список подчинённых менеджера |
| MANAGER | Список своих пользователей |
| USER | Сразу своя статистика |

Автологаут по неактивности — 10 минут.

## Страницы и компоненты

```
src/
  App.jsx                — навигация, состояние ролей, auto-logout таймер
  LoginPage.jsx          — форма входа, POST /auth/login
  UsersPage.jsx          — список пользователей + модал добавления
  UserStatsListPage.jsx  — список сессий, ActivityCalendar (год активности), архив
  UserDetailPage.jsx     — детали сессии: метрики, HeatMap, AI-анализ, CPU/RAM/GPU
  ActivityCalendar.jsx   — GitHub-style тепловая карта активности за год
  HeatMap.jsx            — тепловая карта кликов мыши
```

## Отображение времени

- Время хранится на сервере в UTC (`LocalDateTime` без timezone)
- Фронт добавляет `Z` при парсинге → `toLocaleTimeString` переводит в timezone браузера
- На странице детали сессии отображается IANA-имя timezone (например, `Europe/Moscow`)

## API

Все запросы (кроме логина) требуют заголовок `Authorization: Bearer <token>`.

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /auth/login | Логин → JWT |
| GET | /api/users/owninfo | Текущий пользователь (роль, id) |
| GET | /api/users/all | Список пользователей (по роли caller'а) |
| POST | /api/users/add | Создать пользователя |
| GET | /api/statistics/from/{userId} | Сессии пользователя (`?archived=true`) |
