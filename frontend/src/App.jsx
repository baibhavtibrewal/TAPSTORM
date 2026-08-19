import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { useTheme } from "./hooks/useTheme.js";
import AuthPage from "./pages/AuthPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { Spinner } from "./components/ui/index.jsx";

/* ─── Nav items ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    key: "game",
    label: "Play",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 12h4M8 10v4M15 12h.01M17 11h.01M5.5 7h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
          stroke={active ? "#A78BFA" : "#94A3B8"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "leaderboard",
    label: "Ranks",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 12v5M12 8v9M16 5v12M4 20h16"
          stroke={active ? "#A78BFA" : "#94A3B8"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3l1.5 2.5H17l-2.25 2L15.5 10 12 8.25 8.5 10l.75-2.5L7 5h3.5L12 3z"
          fill={active ? "#FBBF24" : "none"}
          stroke={active ? "#FBBF24" : "#94A3B8"}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "Profile",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="3.5"
          stroke={active ? "#A78BFA" : "#94A3B8"}
          strokeWidth="1.8"
        />
        <path
          d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
          stroke={active ? "#A78BFA" : "#94A3B8"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

/* ─── Sun icon ──────────────────────────────────────────────────────────────── */
function SunIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Moon icon ─────────────────────────────────────────────────────────────── */
function MoonIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Top bar ───────────────────────────────────────────────────────────────── */
function TopBar({ user, theme, onLogout, onToggleTheme }) {
  const initial = (user?.displayName || user?.email || "?")[0].toUpperCase();
  const isDark  = theme === "dark";

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: 56,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 clamp(12px, 4vw, 24px)",
      background: "var(--nav-bg)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 30, height: 30,
          background: "linear-gradient(135deg, #8B5CF6, #22D3EE)",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(139,92,246,0.5)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
              fill="#F8FAFC" stroke="#F8FAFC" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{
          fontWeight: 800,
          fontSize: "clamp(15px, 3vw, 18px)",
          letterSpacing: "-0.3px",
          background: "linear-gradient(90deg, #A78BFA, #22D3EE)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          TAPSTORM
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* ── Theme toggle with icon + label ── */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border-strong)",
            background: "var(--surface-1)",
            color: isDark ? "#FBBF24" : "#8B5CF6",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s, box-shadow 0.2s",
            letterSpacing: 0.2,
            flexShrink: 0,
          }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          {/* label hidden on very small screens */}
          <span className="theme-toggle-label">
            {isDark ? "Light" : "Dark"}
          </span>
        </motion.button>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onLogout}
          title="Logout"
          aria-label="Logout"
          style={{
            width: 34, height: 34,
            borderRadius: 10,
            background: "rgba(251,75,107,0.12)",
            border: "1px solid rgba(251,75,107,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#FB4B6B",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>

      <style>{`
        @media (max-width: 360px) {
          .theme-toggle-label { display: none !important; }
        }
      `}</style>
    </header>
  );
}

/* ─── Bottom Nav ────────────────────────────────────────────────────────────── */
function BottomNav({ page, onNavigate }) {
  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 64,
      zIndex: 100,
      display: "flex",
      alignItems: "stretch",
      background: "rgba(9,10,18,0.95)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(139,92,246,0.18)",
      padding: "0 8px",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {NAV_ITEMS.map((item) => {
        const active = page === item.key;
        return (
          <motion.button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            whileTap={{ scale: 0.9 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              padding: "8px 4px",
            }}
          >
            {active && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%", right: "20%",
                  height: 2,
                  borderRadius: "0 0 4px 4px",
                  background: "linear-gradient(90deg, #8B5CF6, #22D3EE)",
                  boxShadow: "0 0 8px rgba(139,92,246,0.8)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {active && (
              <div style={{
                position: "absolute",
                inset: "6px 12px",
                borderRadius: 12,
                background: "rgba(139,92,246,0.10)",
                pointerEvents: "none",
              }} />
            )}
            {item.icon(active)}
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              color: active ? "#A78BFA" : "#94A3B8",
              letterSpacing: 0.3,
              lineHeight: 1,
            }}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}

/* ─── Main shell ────────────────────────────────────────────────────────────── */
function AppShell() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle }         = useTheme();
  const [page, setPage]           = useState("game");

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#090A12",
        gap: 16,
      }}>
        <div style={{
          width: 56, height: 56,
          background: "linear-gradient(135deg, #8B5CF6, #22D3EE)",
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 32px rgba(139,92,246,0.5)",
          animation: "glow-pulse 2s ease-in-out infinite",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
              fill="#F8FAFC" strokeLinejoin="round"/>
          </svg>
        </div>
        <Spinner size={28} color="#8B5CF6" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage theme={theme} onToggleTheme={toggle} />;
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--page-bg)",
      fontFamily: "var(--font-sans)",
      color: "var(--text-primary)",
    }}>
      <TopBar user={user} theme={theme} onLogout={logout} onToggleTheme={toggle} />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        paddingTop: 56,
        paddingBottom: 64,
        width: "100%",
        maxWidth: "100%",
      }}>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "clamp(320px, 100%, 680px)",
          margin: "0 auto",
          padding: "clamp(12px, 3vw, 24px) clamp(12px, 4vw, 20px)",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {page === "game"        && <GamePage        user={user} />}
              {page === "leaderboard" && <LeaderboardPage user={user} />}
              {page === "profile"     && <ProfilePage     user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav page={page} onNavigate={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}