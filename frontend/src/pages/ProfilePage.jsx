import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GAME_MODES } from "../utils/constants.js";
import { SegmentedControl, StatCard, Badge, EmptyState, Spinner } from "../components/ui/index.jsx";
import { scores as scoresApi } from "../services/api.js";

/* ─── Helper: format timestamp into two lines ───────────────────────────────── */
function parseTimestamp(ts) {
  if (ts === null || ts === undefined || ts === "") return null;

  const value = typeof ts === "string" && /^\d+$/.test(ts.trim())
    ? Number(ts)
    : ts;
  const milliseconds = typeof value === "number" && value < 1e12
    ? value * 1000
    : value;
  const date = new Date(milliseconds);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimestamp(ts) {
  const d = parseTimestamp(ts) ?? new Date();
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

/* ─── Helper: deduplicate history entries ────────────────────────────────────── */
function deduplicateHistory(history) {
  const seen = new Set();

  return history.filter((score) => {
    const timestamp = score.timestamp ?? score.createdAt ?? score.created_at ?? score.date;
    const parsedTimestamp = parseTimestamp(timestamp);
    const normalizedTimestamp = parsedTimestamp === null
      ? String(timestamp ?? "")
      : Math.floor(parsedTimestamp.getTime() / 60_000);
    const key = [
      score.mode ?? "",
      score.score ?? "",
      Number(score.cps ?? 0).toFixed(4),
      normalizedTimestamp,
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ─── Mode chip ─────────────────────────────────────────────────────────────── */
function ModeChip({ modeKey }) {
  const cfg   = GAME_MODES[modeKey] ?? {};
  const label = cfg.label ?? modeKey;
  const color = cfg.accent ?? "#94A3B8";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 6,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      color,
      background: `color-mix(in srgb, ${color} 14%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

export default function ProfilePage({ user }) {
  const [mode, setMode]             = useState("classic");
  const [stats, setStats]           = useState(null);
  const [rank, setRank]             = useState(null);
  const [history, setHistory]       = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading]       = useState(true);

  const modeConfig = GAME_MODES[mode];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [modeData, globalData, histData] = await Promise.all([
        scoresApi.stats(mode),
        scoresApi.stats(null),
        scoresApi.history(mode, 20),
      ]);
      setStats(modeData.stats);
      setRank(modeData.rank);
      setGlobalStats(globalData.stats);
      setHistory(deduplicateHistory(histData.history ?? []));
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { loadData(); }, [loadData]);

  const personalBest = history.length ? Math.max(...history.map(s => s.score)) : 0;

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : null;

  return (
    <div>
      {/* ── Profile header ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: "2rem",
          padding: "1.25rem 1.5rem",
          background: "var(--surface-0)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 56, height: 56,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #8B5CF6, #22D3EE)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 900, color: "#fff",
          boxShadow: "0 0 16px rgba(139,92,246,0.35)",
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
            {user?.username}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>
            {globalStats
              ? `${globalStats.totalGames} games · ${globalStats.totalClicks.toLocaleString()} total clicks`
              : "Loading stats…"}
            {joinedDate && ` · Joined ${joinedDate}`}
          </div>
        </div>
      </motion.div>

      {/* ── Mode selector ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <SegmentedControl
          options={Object.values(GAME_MODES).map(m => ({ key: m.key, label: m.label }))}
          value={mode}
          onChange={setMode}
          colorFn={k => GAME_MODES[k].accent}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Spinner size={28} color={modeConfig.accent} />
        </div>
      ) : (
        <>
          {/* ── Stats grid ────────────────────────────────────────────────── */}
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
              marginBottom: "1.75rem",
            }}
          >
            <StatCard label="Personal best" value={stats?.bestScore || "—"} accent={modeConfig.accent} />
            <StatCard label="Avg score"     value={stats?.avgScore  || "—"} />
            <StatCard label="Games played"  value={stats?.totalGames ?? 0}  />
            <StatCard label="Global rank"   value={rank ? `#${rank}` : "—"} />
          </div>

          {/* ── History list ──────────────────────────────────────────────── */}
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            margin: "0 0 12px",
            color: "var(--text-primary)",
          }}>
            Recent games — {modeConfig.label}
          </h3>

          {history.length === 0 ? (
            <EmptyState
              icon="ti-history"
              title={`No ${modeConfig.label} games yet`}
              body="Play a game in this mode to see your history here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((s, i) => {
                const { date, time } = formatTimestamp(s.timestamp ?? s.createdAt ?? s.created_at ?? s.date);
                const isPB           = s.score === personalBest;
                /* use the score's own mode if available, else fall back to current filter */
                const scoreMode      = s.mode ?? mode;

                return (
                  <motion.div
                    key={s.id ?? i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "11px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-1)",
                      border: isPB
                        ? `1px solid color-mix(in srgb, ${modeConfig.accent} 35%, transparent)`
                        : "1px solid var(--border)",
                    }}
                  >
                    {/* ── Date / time col ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {date}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 1,
                      }}>
                        {time}
                      </div>
                    </div>

                    {/* ── Mode chip ── */}
                    <ModeChip modeKey={scoreMode} />

                    {/* ── PB badge ── */}
                    {isPB && (
                      <Badge
                        color={modeConfig.accent}
                        bg={`color-mix(in srgb, ${modeConfig.accent} 15%, transparent)`}
                      >
                        PB
                      </Badge>
                    )}

                    {/* ── Score (single display) ── */}
                    <div style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: modeConfig.accent,
                      fontFamily: "var(--font-mono)",
                      flexShrink: 0,
                      minWidth: 40,
                      textAlign: "right",
                    }}>
                      {s.score}
                    </div>

                    {/* ── CPS ── */}
                    <div style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      minWidth: 44,
                      textAlign: "right",
                      flexShrink: 0,
                    }}>
                      {Number(s.cps).toFixed(1)} cps
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      <style>{`
        @media (min-width: 520px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}