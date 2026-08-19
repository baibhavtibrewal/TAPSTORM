import pool from "./pool.js";

const SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Game scores / sessions
CREATE TABLE IF NOT EXISTS scores (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  score       INTEGER NOT NULL CHECK (score >= 0),
  mode        TEXT NOT NULL CHECK (mode IN ('sprint','classic','marathon')),
  cps         NUMERIC(6,2) NOT NULL,
  duration    INTEGER NOT NULL,
  -- server-side timing fields for basic anti-cheat
  started_at  TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  elapsed_ms  INTEGER,          -- actual elapsed according to client
  timestamp   BIGINT NOT NULL   -- epoch ms, kept for compat
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS scores_mode_score ON scores (mode, score DESC);
CREATE INDEX IF NOT EXISTS scores_user_id    ON scores (user_id);
CREATE INDEX IF NOT EXISTS scores_timestamp  ON scores (timestamp);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log("✅ Migration complete");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
