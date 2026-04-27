# FrontForStatistic

Admin panel for the KFD Activity Tracker — view user activity statistics.

## Stack

- Vite + React (JSX)
- Plain CSS, no UI libraries
- Fetch API for HTTP requests

## Setup

```bash
npm install
npm run dev   # Dev server on http://localhost:5173
```

The server must be running on port 8765. Vite proxies `/api` and `/auth` to it automatically.

## Pages

- **Login** — authenticates via `POST /auth/login`, saves JWT to `localStorage`
- **Users** — lists all users from `GET /api/users/all`
- **User Detail** — shows statistics and actions for a selected user (tabs)

## Project Structure

```
src/
  App.jsx           # Root: page state, userId state, navigation logic
  LoginPage.jsx     # Login form
  UsersPage.jsx     # User list
  UserDetailPage.jsx # User detail with tabs (Statistics / Actions)
```

## API

All requests require `Authorization: Bearer <token>` header (except login).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login, returns JWT |
| GET | /api/users/all | List all users |
| GET | /api/actions/from/{userId} | User's actions |
| GET | /api/statistics/from/{userId} | User's statistics |