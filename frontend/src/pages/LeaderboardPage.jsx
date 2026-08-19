import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_MODES, LEADERBOARD_PERIODS, RANK_ICONS } from "../utils/constants.js";
import { SegmentedControl, Badge, EmptyState, Spinner } from "../components/ui/index.jsx";
import { scores as scoresApi } from "../services/api.js";
import { useLeaderboardSocket } from "../hooks/useLeaderboardSocket.js";

export default function LeaderboardPage({ user }) {
  const [period, setPeriod]   = useState("global");
  const [mode, setMode]       = useState("classic");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const modeConfig = GAME_MODES[mode];

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { entries } = await scoresApi.leaderboard(mode, period);
      setEntries(entries);
    } catch {
      // silently fail; show stale data
    } finally {
      setLoading(false);
    }
  }, [mode, period]);

  useEffect(() => { refresh(); }, [refresh]);

  // Real-time WebSocket updates (global period only — daily/weekly refresh on demand)
  useLeaderboardSocket({
    mode,
    period: "global",
    onUpdate: (newEntries) => {
      if (period === "global") setEntries(newEntries);
    },
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
          Leaderboard
        </h2>
        <motion.button
          onClick={refresh}
          whileTap={{ scale: 0.92 }}
          style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            padding: "7px 13px", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-1)", cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <i className="ti ti-refresh" style={{ fontSize: 15 }} />
          Refresh
        </motion.button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <SegmentedControl
          options={LEADERBOARD_PERIODS}
          value={period}
          onChange={setPeriod}
        />
        <SegmentedControl
          options={Object.values(GAME_MODES).map(m => ({ key: m.key, label: m.label }))}
          value={mode}
          onChange={setMode}
          colorFn={k => GAME_MODES[k].accent}
        />
      </div>

      {/* Live indicator */}
      {period === "global" && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 11, color: "var(--text-muted)",
          marginBottom: "1rem",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 0 3px color-mix(in srgb, #10b981 25%, transparent)",
            animation: "pulse-ring 2s infinite",
          }} />
          Live updates
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Spinner size={28} color={modeConfig.accent} />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="ti-trophy-off"
          title="No scores yet"
          body="Be the first to set a score in this period."
        />
      ) : (
        <AnimatePresence>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {entries.map((entry, i) => {
              const isMe = entry.username === user?.username;
              return (
                <motion.div
                  key={entry.username}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: "var(--radius-lg)",
                    background: isMe
                      ? `color-mix(in srgb, ${modeConfig.accent} 8%, var(--surface-0))`
                      : "var(--surface-0)",
                    border: isMe
                      ? `1.5px solid color-mix(in srgb, ${modeConfig.accent} 40%, var(--border))`
                      : "1px solid var(--border)",
                    transition: "background 0.2s",
                  }}
                >
                  {/* Rank */}
                  <div style={{ width: 30, textAlign: "center", flexShrink: 0 }}>
                    {i < 3
                      ? <span style={{ fontSize: 20 }}>{RANK_ICONS[i]}</span>
                      : <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {i + 1}
                        </span>
                    }
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: isMe
                      ? `linear-gradient(135deg, ${modeConfig.accent}, color-mix(in srgb, ${modeConfig.accent} 60%, #8b5cf6))`
                      : "var(--ctrl-bg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                    color: isMe ? "#fff" : "var(--text-secondary)",
                  }}>
                    {entry.username[0].toUpperCase()}
                  </div>

                  {/* Name + "you" badge */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontWeight: isMe ? 700 : 500, fontSize: 15,
                      color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {entry.username}
                    </span>
                    {isMe && (
                      <Badge
                        color={modeConfig.accent}
                        bg={`color-mix(in srgb, ${modeConfig.accent} 15%, transparent)`}
                      >
                        you
                      </Badge>
                    )}
                  </div>

                  {/* CPS */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", flexShrink: 0, minWidth: 44, textAlign: "right" }}>
                    {Number(entry.cps).toFixed(1)} cps
                  </div>

                  {/* Score */}
                  <div style={{
                    fontWeight: 800, fontSize: 19, color: modeConfig.accent,
                    flexShrink: 0, fontFamily: "var(--font-mono)", minWidth: 40, textAlign: "right",
                  }}>
                    {entry.score}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
