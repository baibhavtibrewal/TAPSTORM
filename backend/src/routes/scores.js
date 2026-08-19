import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import * as scoreService from "../services/scoreService.js";
import { broadcast } from "../websocket/broadcaster.js";

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many score submissions. Slow down!" },
});

// Submit a game score
router.post("/submit", requireAuth, submitLimiter, async (req, res) => {
  try {
    const { score, mode, startedAt, elapsedMs } = req.body;
    const record = await scoreService.submitScore({
      userId: req.user.userId,
      username: req.user.username,
      score,
      mode,
      startedAt,
      elapsedMs,
    });

    // Broadcast leaderboard update to all connected WS clients
    const leaderboard = await scoreService.getLeaderboard({ mode, period: "global" });
    broadcast({ type: "leaderboard_update", mode, period: "global", entries: leaderboard });

    res.status(201).json({ record });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { mode = "classic", period = "global" } = req.query;
    const entries = await scoreService.getLeaderboard({ mode, period });
    res.json({ entries });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// User stats
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { mode } = req.query;
    const stats = await scoreService.getUserStats({ userId: req.user.userId, mode: mode || null });
    const rank = mode ? await scoreService.getUserRank({ userId: req.user.userId, mode }) : null;
    res.json({ stats, rank });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// User history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const { mode, limit } = req.query;
    const history = await scoreService.getUserHistory({
      userId: req.user.userId,
      mode: mode || null,
      limit: Math.min(parseInt(limit) || 20, 50),
    });
    res.json({ history });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
