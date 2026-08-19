import pool from "../db/pool.js";

const GAME_MODES = {
  sprint:   { duration: 15,  maxCPS: 20 },
  classic:  { duration: 60,  maxCPS: 20 },
  marathon: { duration: 120, maxCPS: 20 },
};

// Absolute maximum score per mode (maxCPS * duration)
// Any score above this is physically impossible.
const MAX_SCORES = Object.fromEntries(
  Object.entries(GAME_MODES).map(([k, v]) => [k, Math.ceil(v.maxCPS * v.duration)])
);

/**
 * Validate and persist a completed game score.
 * Returns the saved score record.
 */
export async function submitScore({ userId, username, score, mode, startedAt, elapsedMs }) {
  const modeConfig = GAME_MODES[mode];
  if (!modeConfig) {
    throw Object.assign(new Error("Unknown game mode."), { status: 400 });
  }

  // Server-side anti-cheat: score must be non-negative integer
  if (!Number.isInteger(score) || score < 0) {
    throw Object.assign(new Error("Invalid score value."), { status: 400 });
  }

  // Score cannot exceed physical limit
  if (score > MAX_SCORES[mode]) {
    throw Object.assign(new Error(`Score exceeds maximum possible for ${mode} mode.`), { status: 400 });
  }

  // Elapsed time must be plausible (within 5 seconds of expected)
  if (elapsedMs !== undefined) {
    const expectedMs = modeConfig.duration * 1000;
    const delta = Math.abs(elapsedMs - expectedMs);
    if (delta > 10000) {
      throw Object.assign(new Error("Game session timing is invalid."), { status: 400 });
    }
  }

  if (startedAt) {
    const existing = await pool.query(
      `SELECT id, username, score, mode, cps, duration, timestamp
       FROM scores
       WHERE user_id = $1 AND mode = $2 AND started_at = $3
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [userId, mode, startedAt]
    );

    if (existing.rows[0]) return existing.rows[0];
  }

  const cps = parseFloat((score / modeConfig.duration).toFixed(2));
  const timestamp = Date.now();

  const result = await pool.query(
    `INSERT INTO scores (user_id, username, score, mode, cps, duration, started_at, submitted_at, elapsed_ms, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)
     RETURNING id, username, score, mode, cps, duration, timestamp`,
    [userId, username, score, mode, cps, modeConfig.duration, startedAt || null, elapsedMs || null, timestamp]
  );

  return result.rows[0];
}

/**
 * Fetch leaderboard for a mode and time period.
 * Returns top-N per-user best scores.
 */
export async function getLeaderboard({ mode, period = "global", limit = 25 }) {
  const modeConfig = GAME_MODES[mode];
  if (!modeConfig) throw Object.assign(new Error("Unknown game mode."), { status: 400 });

  let cutoffClause = "";
  let params = [mode, limit];

  if (period === "weekly") {
    cutoffClause = "AND timestamp >= $3";
    params.push(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "daily") {
    cutoffClause = "AND timestamp >= $3";
    params.push(Date.now() - 24 * 60 * 60 * 1000);
  }

  const sql = `
    WITH best AS (
      SELECT DISTINCT ON (username)
        username, score, cps, timestamp
      FROM scores
      WHERE mode = $1
      ${cutoffClause}
      ORDER BY username, score DESC
    )
    SELECT ROW_NUMBER() OVER (ORDER BY score DESC) AS rank,
           username, score, cps, timestamp
    FROM best
    ORDER BY score DESC
    LIMIT $2
  `;

  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Get a user's rank in a specific mode (1-indexed, or null if not ranked).
 */
export async function getUserRank({ userId, mode }) {
  const result = await pool.query(
    `WITH best AS (
      SELECT DISTINCT ON (username)
        user_id, score
      FROM scores
      WHERE mode = $1
      ORDER BY username, score DESC
    ),
    ranked AS (
      SELECT user_id, ROW_NUMBER() OVER (ORDER BY score DESC) AS rank
      FROM best
    )
    SELECT rank FROM ranked WHERE user_id = $2`,
    [mode, userId]
  );
  return result.rows[0]?.rank ?? null;
}

/**
 * Get aggregate stats for a user, optionally filtered by mode.
 */
export async function getUserStats({ userId, mode = null }) {
  const params = [userId];
  const modeClause = mode ? "AND mode = $2" : "";
  if (mode) params.push(mode);

  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS "totalGames",
       COALESCE(SUM(score)::int, 0) AS "totalClicks",
       COALESCE(MAX(score), 0)::int AS "bestScore",
       COALESCE(ROUND(AVG(score))::int, 0) AS "avgScore"
     FROM scores
     WHERE user_id = $1 ${modeClause}`,
    params
  );

  return result.rows[0] ?? { totalGames: 0, totalClicks: 0, bestScore: 0, avgScore: 0 };
}

/**
 * Get the last N scores for a user, newest first, optionally filtered by mode.
 */
export async function getUserHistory({ userId, mode = null, limit = 20 }) {
  const params = [userId, limit];
  const modeClause = mode ? "AND mode = $3" : "";
  if (mode) params.push(mode);

  const result = await pool.query(
    `SELECT id, username, score, mode, cps, duration, timestamp
     FROM scores
     WHERE user_id = $1 ${modeClause}
     ORDER BY timestamp DESC
     LIMIT $2`,
    params
  );

  return result.rows;
}
