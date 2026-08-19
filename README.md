# TapStorm — Production Architecture

A competitive click-speed game with real-time global leaderboard, persistent accounts, and server-side score validation.

```
tapstorm/
├── backend/          Express + PostgreSQL + WebSocket API
│   └── src/
│       ├── db/           pool.js, migrate.js
│       ├── routes/       auth.js, scores.js
│       ├── services/     authService.js, scoreService.js
│       ├── middleware/   auth.js (JWT)
│       ├── utils/        jwt.js
│       ├── websocket/    broadcaster.js
│       └── index.js      Entry point
└── frontend/         React + Vite + Framer Motion
    └── src/
        ├── components/   Nav.jsx, ui/ (primitives)
        ├── pages/        AuthPage, GamePage, LeaderboardPage, ProfilePage
        ├── hooks/        useAuth, useTheme, useLeaderboardSocket
        ├── services/     api.js (all HTTP calls)
        ├── utils/        constants.js
        └── styles/       globals.css (design tokens)
```

---

## Local Development

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 14+ (local or [Neon](https://neon.tech) / [Supabase](https://supabase.com) free tier)

### 2. Database
```bash
# Create the database
createdb tapstorm

# Or with a connection string:
# DATABASE_URL=postgresql://localhost/tapstorm
```

### 3. Backend
```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET at minimum

# Run migrations (creates tables)
npm run migrate

# Start dev server (hot-reload)
npm run dev
# → http://localhost:4000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api` to the backend automatically, so no CORS issues during development.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_SECRET` | Long random string for signing JWTs | required |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) | `7d` |
| `PORT` | API server port | `4000` |
| `CLIENT_ORIGIN` | Frontend origin for CORS | `http://localhost:5173` |
| `NODE_ENV` | `development` or `production` | `development` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `/api` (proxied via Vite) |
| `VITE_WS_URL` | WebSocket URL | auto-detected from `window.location` |

---

## Production Deployment

### Recommended stack (free-tier friendly)
- **Database**: [Neon](https://neon.tech) — serverless PostgreSQL, generous free tier
- **Backend**: [Railway](https://railway.app) or [Render](https://render.com) — Node.js hosting
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — static hosting

### Steps
1. Create a Neon project → copy `DATABASE_URL`
2. Deploy backend to Railway/Render:
   - Set all env vars from `.env.example`
   - Run `npm run migrate` once as a one-off command
   - Set `CLIENT_ORIGIN` to your frontend URL
3. Deploy frontend to Vercel:
   - Set `VITE_API_URL` to your backend URL (e.g. `https://tapstorm-api.railway.app/api`)
   - Set `VITE_WS_URL` to `wss://tapstorm-api.railway.app/ws`

---

## Architecture decisions

| Concern | Decision |
|---|---|
| Auth | JWT (Bearer token), stored in `localStorage`, hashed with argon2id |
| Real-time | WebSocket (`ws` library), broadcast on each score submit |
| Score anti-cheat | Server rejects impossible scores (>20 CPS), validates timing |
| Gameplay | Runs entirely in browser; only the final score is sent to server |
| Browser close mid-game | Unfinished game is discarded — only submitted scores are persisted |
| Theme | `data-theme` attribute on `<html>`, persisted to `localStorage` |
| Passwords | argon2id (never plain-text, never in localStorage) |
