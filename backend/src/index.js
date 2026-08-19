import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import scoreRoutes from "./routes/scores.js";
import { initWebSocket } from "./websocket/broadcaster.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.set("trust proxy", 1);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "50kb" }));

// Global rate limit
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`TapStorm API running on http://localhost:${PORT}`);
});
