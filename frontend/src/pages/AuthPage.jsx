import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth.jsx";
import { APP_NAME, APP_TAGLINE } from "../utils/constants.js";
import { Button, Alert, Spinner } from "../components/ui/index.jsx";

/* ─── Sun icon ──────────────────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Moon icon ─────────────────────────────────────────────────────────────── */
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Theme toggle ──────────────────────────────────────────────────────────── */
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        border: "1px solid var(--border-strong)",
        borderRadius: 10,
        background: "var(--surface-1)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: isDark ? "#FBBF24" : "#8B5CF6",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        zIndex: 200,
        letterSpacing: 0.3,
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </motion.button>
  );
}

/* ─── AuthPage ──────────────────────────────────────────────────────────────── */
export default function AuthPage({ theme, onToggleTheme }) {
  const { login, register } = useAuth();
  const [tab, setTab]       = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = tab === "login";

  return (
    <div style={{
      minHeight: "100vh",
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      background: "var(--page-bg)",
      /* radial purple bloom behind the card */
      backgroundImage: `
        radial-gradient(ellipse 70% 55% at 50% 35%, rgba(139,92,246,0.22) 0%, transparent 65%),
        linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "100% 100%, 40px 40px, 40px 40px",
    }}>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ textAlign: "center", marginBottom: "2.25rem" }}
      >
        {/* Logo mark */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 0 0 1px rgba(139,92,246,0.3), 0 0 32px rgba(139,92,246,0.5), 0 0 64px rgba(139,92,246,0.2)",
          animation: "glow-pulse 3s ease-in-out infinite",
        }}>
          {/* Lightning bolt */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
              fill="#F8FAFC"
              stroke="#F8FAFC"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 7vw, 44px)",
          fontWeight: 900,
          letterSpacing: "-1.5px",
          lineHeight: 1.05,
          background: "linear-gradient(135deg, #A78BFA 0%, #22D3EE 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {APP_NAME}
        </h1>

        <p style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginTop: 8,
          letterSpacing: 0.2,
        }}>
          {APP_TAGLINE}
        </p>
      </motion.div>

      {/* ── Card ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(17,19,35,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 24,
          padding: "clamp(1.5rem, 5vw, 2.25rem)",
          boxShadow:
            "0 0 0 1px rgba(139,92,246,0.08), 0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.08)",
        }}
      >
        {/* Tab switcher */}
        <div style={{
          display: "flex",
          background: "rgba(9,10,18,0.7)",
          borderRadius: 12,
          padding: 4,
          marginBottom: "1.75rem",
          border: "1px solid rgba(139,92,246,0.12)",
        }}>
          {[
            { key: "login",    label: "Sign in"  },
            { key: "register", label: "Sign up"  },
          ].map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(""); }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  border: "none",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 400,
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.18s",
                  background: active
                    ? "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(34,211,238,0.18))"
                    : "transparent",
                  color: active ? "#F8FAFC" : "#94A3B8",
                  boxShadow: active
                    ? "0 0 12px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "none",
                  border: active ? "1px solid rgba(139,92,246,0.30)" : "1px solid transparent",
                  letterSpacing: 0.2,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Username */}
          <div>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#94A3B8",
              marginBottom: 7,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}>
              Username
            </label>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="your_username"
              autoComplete="username"
              maxLength={20}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(9,10,18,0.6)",
                border: "1px solid rgba(139,92,246,0.20)",
                borderRadius: 10,
                color: "#F8FAFC",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                outline: "none",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(139,92,246,0.6)";
                e.target.style.boxShadow   = "0 0 0 3px rgba(139,92,246,0.12)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(139,92,246,0.20)";
                e.target.style.boxShadow   = "none";
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#94A3B8",
              marginBottom: 7,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(9,10,18,0.6)",
                border: "1px solid rgba(139,92,246,0.20)",
                borderRadius: 10,
                color: "#F8FAFC",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                outline: "none",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(139,92,246,0.6)";
                e.target.style.boxShadow   = "0 0 0 3px rgba(139,92,246,0.12)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(139,92,246,0.20)";
                e.target.style.boxShadow   = "none";
              }}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  padding: "10px 13px",
                  background: "rgba(251,75,107,0.10)",
                  border: "1px solid rgba(251,75,107,0.30)",
                  borderRadius: 9,
                  color: "#FB4B6B",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="#FB4B6B" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#FB4B6B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading || !username.trim() || !password}
            style={{
              width: "100%",
              padding: "13px 0",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              border: "none",
              borderRadius: 12,
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: loading || !username.trim() || !password ? "not-allowed" : "pointer",
              opacity: loading || !username.trim() || !password ? 0.55 : 1,
              background: "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)",
              color: "#fff",
              boxShadow: loading || !username.trim() || !password
                ? "none"
                : "0 0 20px rgba(139,92,246,0.45), 0 4px 12px rgba(0,0,0,0.3)",
              transition: "opacity 0.18s, box-shadow 0.18s",
            }}
          >
            {loading ? (
              <Spinner size={18} color="#fff" />
            ) : (
              <>
                {/* Icon changes with context */}
                {isLogin ? (
                  /* Key icon for Sign in */
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <circle cx="8" cy="12" r="4" stroke="#fff" strokeWidth="2"/>
                    <path d="M12 12h8M18 10v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  /* Plus-person icon for Create account */
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <circle cx="10" cy="8" r="3" stroke="#fff" strokeWidth="2"/>
                    <path d="M3 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 8v6M22 11h-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                {isLogin ? "Sign in" : "Create account"}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Footer note */}
      <p style={{
        fontSize: 12,
        color: "rgba(148,163,184,0.55)",
        marginTop: "1.5rem",
        textAlign: "center",
        letterSpacing: 0.2,
      }}>
        Scores are stored globally and visible to all players.
      </p>
    </div>
  );
}