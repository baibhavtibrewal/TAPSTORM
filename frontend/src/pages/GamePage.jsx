import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GAME_MODES, GAME_PHASE } from "../utils/constants.js";
import { StatCard, Button, Badge, Card } from "../components/ui/index.jsx";
import { scores as scoresApi } from "../services/api.js";

export default function GamePage({ user }) {
  const [selectedMode, setSelectedMode] = useState("classic");
  const [phase, setPhase]               = useState(GAME_PHASE.IDLE);
  const [countdown, setCountdown]       = useState(3);
  const [timeLeft, setTimeLeft]         = useState(0);
  const [clicks, setClicks]             = useState(0);
  const [ripples, setRipples]           = useState([]);
  const [result, setResult]             = useState(null);
  const [personalBest, setPersonalBest] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef    = useRef(null);
  const rippleRef   = useRef(0);
  const btnRef      = useRef(null);
  const startedAtRef = useRef(null);
  const clicksRef   = useRef(0);
  const hasEndedRef = useRef(false);
  const timeLeftRef = useRef(0);
  const mode        = GAME_MODES[selectedMode];

  // Keep clicksRef in sync for the endGame closure
  useEffect(() => { clicksRef.current = clicks; }, [clicks]);

  // Load personal best
  const loadPersonalBest = useCallback(async () => {
    try {
      const { stats } = await scoresApi.stats(selectedMode);
      setPersonalBest(stats.bestScore || null);
    } catch { /* not signed in yet or first game */ }
  }, [selectedMode]);

  useEffect(() => { loadPersonalBest(); }, [loadPersonalBest]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  function startTimer() {
    clearTimer();
    timerRef.current = setInterval(() => {
      const nextTimeLeft = Math.max(timeLeftRef.current - 1, 0);
      timeLeftRef.current = nextTimeLeft;
      setTimeLeft(nextTimeLeft);

      if (nextTimeLeft === 0) {
        clearTimer();
        endGame();
      }
    }, 1000);
  }

  function startCountdown() {
    hasEndedRef.current = false;
    setPhase(GAME_PHASE.COUNTDOWN);
    setClicks(0); clicksRef.current = 0;
    setRipples([]); setResult(null); setSubmitError(null);
    let c = 3;
    setCountdown(c);
    const iv = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(iv); beginGame(); }
      else setCountdown(c);
    }, 1000);
  }

  function beginGame() {
    startedAtRef.current = new Date().toISOString();
    setPhase(GAME_PHASE.PLAYING);
    timeLeftRef.current = mode.duration;
    setTimeLeft(mode.duration);
    startTimer();
  }

  async function endGame() {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    const finalClicks = clicksRef.current;
    const elapsedMs   = mode.duration * 1000;
    setPhase(GAME_PHASE.DONE);

    if (finalClicks === 0) {
      setResult({ score: 0, cps: "0.0", isNewPB: false });
      return;
    }

    setSubmitting(true);
    try {
      await scoresApi.submit({
        score: finalClicks,
        mode: selectedMode,
        startedAt: startedAtRef.current,
        elapsedMs,
      });
      // Reload PB
      const { stats } = await scoresApi.stats(selectedMode);
      const newPB = stats.bestScore;
      setResult({
        score: finalClicks,
        cps: (finalClicks / mode.duration).toFixed(1),
        isNewPB: finalClicks >= (personalBest || 0) && finalClicks > 0,
      });
      setPersonalBest(newPB);
    } catch (err) {
      setSubmitError(err.message);
      setResult({
        score: finalClicks,
        cps: (finalClicks / mode.duration).toFixed(1),
        isNewPB: false,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleClickTarget(e) {
    if (phase !== GAME_PHASE.PLAYING) return;
    setClicks(c => c + 1);

    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const id = ++rippleRef.current;
      const clientX = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
      const clientY = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setRipples(r => [...r.slice(-14), { id, x, y }]);
      setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 500);
    }
  }

  function resetToIdle() {
    clearTimer();
    timeLeftRef.current = 0;
    setPhase(GAME_PHASE.IDLE);
    setClicks(0); clicksRef.current = 0;
    setResult(null); setSubmitError(null);
    setShowExitConfirm(false);
  }

  function handleExitRequest() {
    // Pause the timer by clearing interval (timeLeft state is preserved)
    clearTimer();
    setShowExitConfirm(true);
  }

  function handleExitConfirm() {
    resetToIdle();
  }

  function handleExitCancel() {
    setShowExitConfirm(false);
    startTimer();
  }

  const progress   = phase === GAME_PHASE.PLAYING ? timeLeft / mode.duration : 1;
  const urgency    = phase === GAME_PHASE.PLAYING && timeLeft <= 5;
  const elapsedSec = mode.duration - timeLeft;
  const liveCPS    = elapsedSec > 0 ? (clicks / elapsedSec).toFixed(1) : "0.0";

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 1.5rem", color: "var(--text-primary)" }}>
        Play
      </h2>

      {/* Mode selector — visible when idle or done */}
      <AnimatePresence>
        {(phase === GAME_PHASE.IDLE || phase === GAME_PHASE.DONE) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10, marginBottom: "1.5rem",
            }}
          >
            {Object.values(GAME_MODES).map(m => {
              const active = selectedMode === m.key;
              return (
                <motion.button
                  key={m.key}
                  onClick={() => { setSelectedMode(m.key); resetToIdle(); }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: "14px 10px", textAlign: "left", cursor: "pointer",
                    border: active ? `2px solid ${m.accent}` : "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    background: active
                      ? `color-mix(in srgb, ${m.accent} 10%, var(--surface-0))`
                      : "var(--surface-1)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <i className={`ti ${m.icon}`} style={{ fontSize: 18, color: m.accent }} aria-hidden="true" />
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: active ? m.accent : "var(--text-primary)" }}>
                      {m.label}
                    </span>
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 700,
                      color: m.accent,
                      background: `color-mix(in srgb, ${m.accent} 15%, transparent)`,
                      padding: "2px 6px", borderRadius: 5,
                    }}>
                      {m.duration}s
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {m.subtitle}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal best banner */}
      <AnimatePresence>
        {phase === GAME_PHASE.IDLE && personalBest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: "1.5rem", padding: "10px 14px", borderRadius: "var(--radius-md)",
              background: `color-mix(in srgb, ${mode.accent} 7%, var(--surface-1))`,
              border: `1px solid color-mix(in srgb, ${mode.accent} 25%, var(--border))`,
            }}>
              <i className="ti ti-award" style={{ fontSize: 18, color: mode.accent }} aria-hidden="true" />
              <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                Your best · <strong style={{ color: "var(--text-primary)" }}>{mode.label}</strong>
              </span>
              <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 17, color: mode.accent, fontFamily: "var(--font-mono)" }}>
                {personalBest}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown */}
      <AnimatePresence>
        {phase === GAME_PHASE.COUNTDOWN && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "3rem 0 4rem" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  fontSize: "clamp(80px, 20vw, 130px)", fontWeight: 900, lineHeight: 1,
                  color: mode.accent, fontFamily: "var(--font-mono)",
                  textShadow: `0 0 60px color-mix(in srgb, ${mode.accent} 40%, transparent)`,
                }}
              >
                {countdown}
              </motion.div>
            </AnimatePresence>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 20 }}>
              Get ready to tap!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active game and result */}
      {(phase === GAME_PHASE.PLAYING || phase === GAME_PHASE.DONE) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Live stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10, marginBottom: "1.25rem",
          }}>
            <StatCard label="Clicks" value={clicks} accent={mode.accent} />
            <StatCard
              label="Time left"
              value={phase === GAME_PHASE.DONE ? "0s" : `${timeLeft}s`}
              sub={urgency ? "⚡ Hurry!" : null}
            />
            <StatCard
              label="CPS"
              value={phase === GAME_PHASE.DONE ? (result?.cps ?? "—") : liveCPS}
            />
          </div>

          {/* Exit button — only during active play */}
          {phase === GAME_PHASE.PLAYING && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleExitRequest}
                title="Exit game (score will be lost)"
                aria-label="Exit game"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(251,75,107,0.35)",
                  background: "rgba(251,75,107,0.10)",
                  color: "#FB4B6B",
                  fontSize: 12, fontWeight: 700,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Exit
              </motion.button>
            </div>
          )}

          {/* Timer bar */}
          <div style={{
            height: 6, borderRadius: 3,
            background: "var(--surface-2)",
            marginBottom: "1.5rem", overflow: "hidden",
          }}>
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
              style={{
                height: "100%", borderRadius: 3,
                background: urgency ? "#ef4444" : mode.accent,
                transition: "background 0.3s",
              }}
            />
          </div>

          {/* Exit confirmation modal */}
          <AnimatePresence>
            {showExitConfirm && (
              <motion.div
                key="exit-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed", inset: 0, zIndex: 999,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  padding: "0 20px",
                }}
              >
                <motion.div
                  initial={{ scale: 0.88, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.88, opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  style={{
                    background: "var(--surface-0)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-xl)",
                    padding: "2rem 1.75rem",
                    maxWidth: 360, width: "100%",
                    boxShadow: "var(--shadow-lg)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 42, marginBottom: 12 }}>⚠️</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10 }}>
                    Leave the game?
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                    If you leave now, your current score will be <strong style={{ color: "#FB4B6B" }}>lost</strong> and won't be saved.
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExitCancel}
                      style={{
                        flex: 1, padding: "11px 0",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-strong)",
                        background: "var(--surface-1)",
                        color: "var(--text-primary)",
                        fontSize: 14, fontWeight: 700,
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                      }}
                    >
                      Continue
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExitConfirm}
                      style={{
                        flex: 1, padding: "11px 0",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid rgba(251,75,107,0.35)",
                        background: "rgba(251,75,107,0.12)",
                        color: "#FB4B6B",
                        fontSize: 14, fontWeight: 700,
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                      }}
                    >
                      Leave
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Click target */}
          {phase === GAME_PHASE.PLAYING && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 16, marginBottom: "1.5rem",
            }}>
              <div style={{ position: "relative" }}>
                {/* Pulse ring */}
                <div style={{
                  position: "absolute", inset: -16,
                  borderRadius: "50%",
                  background: `color-mix(in srgb, ${mode.accent} 20%, transparent)`,
                  animation: "pulse-ring 1.5s ease-in-out infinite",
                }} />
                <motion.button
                  ref={btnRef}
                  onPointerDown={handleClickTarget}
                  whileTap={{ scale: 0.91 }}
                  style={{
                    width: "clamp(180px, 45vw, 220px)",
                    height: "clamp(180px, 45vw, 220px)",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, color-mix(in srgb, ${mode.accent} 75%, white), ${mode.accent})`,
                    border: "none", cursor: "pointer",
                    boxShadow: `0 0 0 10px color-mix(in srgb, ${mode.accent} 15%, transparent), 0 16px 50px color-mix(in srgb, ${mode.accent} 40%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden",
                    userSelect: "none", touchAction: "none",
                    WebkitUserSelect: "none", WebkitTouchCallout: "none",
                  }}
                >
                  <i
                    className={`ti ${mode.icon}`}
                    style={{ fontSize: "clamp(42px, 10vw, 58px)", color: "rgba(255,255,255,0.92)", pointerEvents: "none" }}
                    aria-hidden="true"
                  />
                  {ripples.map(r => (
                    <span
                      key={r.id}
                      style={{
                        position: "absolute", left: r.x, top: r.y,
                        width: 0, height: 0, borderRadius: "50%",
                        background: "rgba(255,255,255,0.55)",
                        transform: "translate(-50%,-50%)",
                        animation: "tsRipple 0.5s ease-out forwards",
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </motion.button>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Tap as fast as you can!</p>
            </div>
          )}

          {/* Result panel */}
          {phase === GAME_PHASE.DONE && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>
                  {result.isNewPB ? "🏆" : "✅"}
                </div>
                <div style={{
                  fontSize: "clamp(46px, 12vw, 62px)", fontWeight: 900,
                  color: mode.accent, lineHeight: 1,
                  fontFamily: "var(--font-mono)",
                }}>
                  {result.score}
                </div>
                <div style={{ fontSize: 15, color: "var(--text-secondary)", margin: "8px 0 6px" }}>
                  clicks in {mode.duration}s · {result.cps} per second
                </div>
                {result.isNewPB && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge
                      color={mode.accent}
                      bg={`color-mix(in srgb, ${mode.accent} 15%, transparent)`}
                    >
                      🎉 New personal best!
                    </Badge>
                  </motion.div>
                )}
                {submitting && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>
                    Saving score…
                  </div>
                )}
                {submitError && (
                  <div style={{ fontSize: 12, color: "var(--error-text)", marginTop: 8 }}>
                    Score not saved: {submitError}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
                  <Button variant="secondary" onClick={resetToIdle}>
                    Change mode
                  </Button>
                  <Button variant="primary" accent={mode.accent} onClick={startCountdown}>
                    <i className="ti ti-refresh" style={{ fontSize: 16 }} />
                    Play again
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Start button */}
      {phase === GAME_PHASE.IDLE && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", marginTop: "0.75rem" }}
        >
          <Button
            onClick={startCountdown}
            accent={mode.accent}
            style={{
              padding: "14px 54px", fontSize: 17, fontWeight: 800,
              letterSpacing: 0.2,
            }}
          >
            Start game
          </Button>
        </motion.div>
      )}
    </div>
  );
}
