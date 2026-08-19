<div align="center">

# ⚡ TapStorm

**A competitive click-speed game with real-time leaderboards, persistent accounts, and server-side score validation.**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Report a Bug](https://github.com/baibhavtibrewal/TAPSTORM/issues) · [Request a Feature](https://github.com/baibhavtibrewal/TAPSTORM/issues)

</div>

---

## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Real-Time Leaderboard](#real-time-leaderboard)
- [Gameplay & Persistence](#gameplay--persistence)
- [Deployment](#deployment)
- [Useful Commands](#useful-commands)

---

## About

TapStorm is a browser-based click-speed game where players compete across three game modes — **Sprint**, **Classic**, and **Marathon**. It features:

- 🔐 Persistent accounts with JWT authentication and Argon2id password hashing
- 🏆 Real-time leaderboards over WebSocket
- 📊 Per-mode score history and statistics
- ✅ Server-side score validation before persistence
- 🌙 Light / dark theme with localStorage persistence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL 14+ |
| Auth | JWT, Argon2id |
| Real-time | WebSocket (`ws`) |
| Frontend Hosting | Netlify |
| Backend / DB Hosting | Render |

---

## Project Structure

```
tapstorm/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js
│   │   │   └── migrate.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── scores.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── scoreService.js
│   │   ├── utils/
│   │   │   └── jwt.js
│   │   ├── websocket/
│   │   │   └── broadcaster.js
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Nav.jsx
    │   │   └── ui/
    │   │       └── index.jsx
    │   ├── hooks/
    │   │   ├── useAuth.jsx
    │   │   ├── useLeaderboardSocket.js
    │   │   └── useTheme.js
    │   ├── pages/
    │   │   ├── AuthPage.jsx
    │   │   ├── GamePage.jsx
    │   │   ├── LeaderboardPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── globals.css
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm
- [PostgreSQL](https://www.postgresql.org/) 14+

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/baibhavtibrewal/TAPSTORM.git
cd TAPSTORM
```

**2. Create the PostgreSQL database**

```bash
createdb tapstorm
```

**3. Configure and start the backend**

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your values (see [Environment Variables](#environment-variables)), then run the migration and start the dev server:

```bash
npm run migrate
npm run dev
```

The backend runs at `http://localhost:4000`.

> **Note:** `GET /` returns `Cannot GET /` — this is expected. The root route is not defined. Use `GET /api/health` to verify the API is running:
>
> ```json
> { "ok": true, "ts": 1234567890000 }
> ```

**4. Configure and start the frontend**

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

## Environment Variables

> ⚠️ Never commit `.env` files. The repository includes `.env.example` files for reference.

### Backend — `backend/.env`

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | **Required** |
| `JWT_SECRET` | Secret used to sign JWTs | **Required** |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `PORT` | Backend API port | `4000` |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `NODE_ENV` | Application environment | `development` |

### Frontend — `frontend/.env`

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `/api` |

For the deployed frontend, set the full backend URL:

```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

---

## Database Schema

The schema is managed by `backend/src/db/migrate.js`.

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` |
| `username` | `TEXT` | `UNIQUE NOT NULL` |
| `password_hash` | `TEXT` | `NOT NULL` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` |

### `scores`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` |
| `user_id` | `INTEGER` | `NOT NULL`, FK → `users(id)` `ON DELETE CASCADE` |
| `username` | `TEXT` | `NOT NULL` |
| `score` | `INTEGER` | `NOT NULL`, `CHECK (score >= 0)` |
| `mode` | `TEXT` | `NOT NULL` — one of `sprint`, `classic`, `marathon` |
| `cps` | `NUMERIC(6,2)` | `NOT NULL` |
| `duration` | `INTEGER` | `NOT NULL` |
| `started_at` | `TIMESTAMPTZ` | Nullable |
| `submitted_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` |
| `elapsed_ms` | `INTEGER` | Nullable |
| `timestamp` | `BIGINT` | `NOT NULL` (epoch ms) |

### Indexes

```
scores_mode_score  →  (mode, score DESC)
scores_user_id     →  (user_id)
scores_timestamp   →  (timestamp)
```

---

## API Reference

Base URL (local): `http://localhost:4000`

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns API status and server timestamp |

### Authentication

Authenticated requests require:
```
Authorization: Bearer <JWT>
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | Get the currently authenticated user |

### Scores

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scores/submit` | Submit a completed game score |
| `GET` | `/api/scores/leaderboard` | Get leaderboard data |
| `GET` | `/api/scores/stats` | Get score statistics |
| `GET` | `/api/scores/history` | Get personal score history |

#### Query Parameters

| Endpoint | Parameter | Example |
|---|---|---|
| `/api/scores/leaderboard` | `mode`, `period` | `?mode=classic&period=all` |
| `/api/scores/stats` | `mode` | `?mode=sprint` |
| `/api/scores/history` | `limit`, `mode` | `?limit=20&mode=marathon` |

#### Score Submission Payload

```json
{
  "score": 100,
  "mode": "classic",
  "startedAt": "2024-01-01T00:00:00.000Z",
  "elapsedMs": 10000
}
```

---

## Real-Time Leaderboard

TapStorm uses the `ws` WebSocket library for live leaderboard updates. When a score is submitted and validated, the backend broadcasts the update to all connected clients.

| Component | Path |
|---|---|
| Backend broadcaster | `backend/src/websocket/broadcaster.js` |
| Frontend hook | `frontend/src/hooks/useLeaderboardSocket.js` |

---

## Gameplay & Persistence

- All gameplay runs in the browser.
- On game completion, the score is sent to the backend for **server-side validation** before being stored.
- Unfinished games (e.g., closed browser tab) are discarded — only completed, submitted games are persisted.
- The database stores the score, mode, CPS, duration, and all timing metadata.

---

## Deployment

TapStorm uses the following production architecture:

```
GitHub
  ├── Frontend → Netlify
  └── Backend  → Render
                   └── PostgreSQL (Render managed)
```

### Frontend — Netlify

| Setting | Value |
|---|---|
| Base Directory | `frontend` |
| Build Command | `npm run build` |
| Publish Directory | `dist` |

Set the environment variable:
```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Backend — Render

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npm run migrate` |
| Start Command | `npm start` |

Configure the following environment variables in the Render dashboard:

```
DATABASE_URL=<Render PostgreSQL connection string>
JWT_SECRET=<production secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-netlify-site.netlify.app
```

---

## Useful Commands

### Backend

```bash
cd backend
npm install        # Install dependencies
npm run migrate    # Run database migrations
npm run dev        # Start development server (with hot reload)
npm start          # Start production server
```

### Frontend

```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
```

---

## Security

- Passwords hashed with **Argon2id** — never stored in plaintext.
- Auth via **JWT bearer tokens** with configurable expiry.
- **Express rate limiting** enabled on all routes.
- **CORS** restricted to `CLIENT_ORIGIN`.
- Scores validated **server-side** before persistence.
- Production secrets managed via hosting-provider environment variables — never committed to the repository.

---

<div align="center">

Made with ⚡ by [Baibhav Tibrewal](https://github.com/baibhavtibrewal)

</div>
