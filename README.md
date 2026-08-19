TapStorm

A competitive click-speed game with persistent accounts, multiple game modes, score history, real-time leaderboards, and server-side score validation.

Tech Stack

Frontend: React, Vite, Framer Motion

Backend: Node.js, Express

Database: PostgreSQL

Authentication: JWT + Argon2id

Real-time: WebSocket (ws)

Deployment: Netlify (Frontend), Render (Backend + PostgreSQL)

Project Structure

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
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Nav.jsx
│   │   │   └── ui/
│   │   │       └── index.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx
│   │   │   ├── useLeaderboardSocket.js
│   │   │   └── useTheme.js
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── GamePage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

Local Development

Prerequisites

Node.js 20+

npm

PostgreSQL 14+

1. Clone

git clone https://github.com/baibhavtibrewal/TAPSTORM.git
cd TAPSTORM

2. Create Database

createdb tapstorm

3. Backend

cd backend
npm install
cp .env.example .env

Set at minimum:

DATABASE_URL=postgresql://username:password@localhost:5432/tapstorm
JWT_SECRET=your-long-random-secret

Run migrations:

npm run migrate

Start the backend:

npm run dev

Backend:

http://localhost:4000

Health Check

The backend does not define GET /, so:

http://localhost:4000/

returns:

Cannot GET /

This is expected.

Use:

http://localhost:4000/api/health

Expected response:

{
  "ok": true,
  "ts": 1234567890000
}

4. Frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

Environment Variables

Backend — backend/.env

Variable

Description

Default

DATABASE_URL

PostgreSQL connection string

Required

JWT_SECRET

JWT signing secret

Required

JWT_EXPIRES_IN

JWT expiration

7d

PORT

API server port

4000

CLIENT_ORIGIN

Allowed frontend origin

http://localhost:5173

NODE_ENV

Environment

development

Frontend — frontend/.env

Variable

Description

Default

VITE_API_URL

Backend API base URL

/api

Production example:

VITE_API_URL=https://your-render-backend.onrender.com/api

Never commit .env files or secrets. Only .env.example files are committed.

Database Schema

The schema is created by backend/src/db/migrate.js.

users

Column

Type

Constraints

id

SERIAL

PRIMARY KEY

username

TEXT

UNIQUE NOT NULL

password_hash

TEXT

NOT NULL

created_at

TIMESTAMPTZ

DEFAULT NOW()

scores

Column

Type

Constraints

id

SERIAL

PRIMARY KEY

user_id

INTEGER

NOT NULL, FK → users(id), ON DELETE CASCADE

username

TEXT

NOT NULL

score

INTEGER

NOT NULL, CHECK (score >= 0)

mode

TEXT

NOT NULL, sprint, classic, marathon

cps

NUMERIC(6,2)

NOT NULL

duration

INTEGER

NOT NULL

started_at

TIMESTAMPTZ

Nullable

submitted_at

TIMESTAMPTZ

DEFAULT NOW()

elapsed_ms

INTEGER

Nullable

timestamp

BIGINT

NOT NULL, epoch milliseconds

Indexes

scores_mode_score  → (mode, score DESC)
scores_user_id     → (user_id)
scores_timestamp   → (timestamp)

API Endpoints

Base URL:

http://localhost:4000

Production:

https://your-render-backend.onrender.com

Health

Method

Endpoint

Description

GET

/api/health

API health check

Authentication

Method

Endpoint

Description

POST

/api/auth/register

Register a user

POST

/api/auth/login

Authenticate a user

GET

/api/auth/me

Get authenticated user

Authentication uses:

Authorization: Bearer <JWT>

Scores

Method

Endpoint

Description

POST

/api/scores/submit

Submit a game score

GET

/api/scores/leaderboard

Get leaderboard

GET

/api/scores/stats

Get score statistics

GET

/api/scores/history

Get score history

Leaderboard Query Parameters

mode
period

Example:

/api/scores/leaderboard?mode=classic&period=all

Statistics Query Parameter

mode

Example:

/api/scores/stats?mode=classic

History Query Parameters

limit
mode

Example:

/api/scores/history?limit=20&mode=classic

Score Submission

{
  "score": 100,
  "mode": "classic",
  "startedAt": "...",
  "elapsedMs": 10000
}

Architecture

                    GitHub
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
          Netlify              Render
         Frontend              Backend
                                 │
                                 ▼
                         Render PostgreSQL

Gameplay runs in the browser.

Completed scores are submitted to the backend.

Backend validates and persists scores.

JWT is used for authentication.

Passwords are hashed with Argon2id.

WebSockets provide real-time leaderboard updates.

Theme preference is persisted in localStorage.

Unsubmitted games are not persisted.

Production Deployment

Frontend — Netlify

Base Directory: frontend
Build Command: npm run build
Publish Directory: dist

Environment variable:

VITE_API_URL=https://your-render-backend.onrender.com/api

Backend — Render

Root Directory: backend
Build Command: npm install && npm run migrate
Start Command: npm start

Environment variables:

DATABASE_URL=<Render PostgreSQL connection>
JWT_SECRET=<production secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-netlify-site.netlify.app

The production PostgreSQL database is managed by Render.

Security

Passwords are never stored in plain text.

Passwords are hashed using Argon2id.

JWT is used for authenticated requests.

Production secrets are stored as hosting-provider environment variables.

.env files are excluded from Git.

CORS is restricted using CLIENT_ORIGIN.

Express rate limiting is enabled.

Scores undergo server-side validation before persistence.

Useful Commands

Backend

cd backend
npm install
npm run migrate
npm run dev
npm start

Frontend

cd frontend
npm install
npm run dev
npm run build

Repository

https://github.com/baibhavtibrewal/TAPSTORM