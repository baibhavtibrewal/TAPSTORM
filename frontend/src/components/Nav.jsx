import { motion } from "framer-motion";
import { APP_NAME, NAV_TABS } from "../utils/constants.js";

function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 36, height: 36,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--surface-1)",
        color: "var(--text-secondary)",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      <i
        className={theme === "dark" ? "ti ti-sun" : "ti ti-moon"}
        style={{ fontSize: 17 }}
        aria-hidden="true"
      />
    </motion.button>
  );
}

export default function Nav({ user, page, onNavigate, onLogout, theme, onToggleTheme }) {
  return (
    <nav style={{
      background: "var(--nav-bg)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}>
      <div style={{
        maxWidth: 860, margin: "0 auto",
        display: "flex", alignItems: "center",
        padding: "0 16px", height: 58, gap: 6,
      }}>
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto", cursor: "pointer" }}
          onClick={() => onNavigate("game")}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
            flexShrink: 0,
          }}>
            <i className="ti ti-bolt" style={{ fontSize: 17, color: "#fff" }} aria-hidden="true" />
          </div>
          <span style={{
            fontSize: 17, fontWeight: 900, letterSpacing: -0.5,
            color: "var(--text-primary)",
            display: "none",
          }}
            className="nav-logo-text"
          >
            {APP_NAME}
          </span>
        </div>

        {/* Navigation tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {NAV_TABS.map(tab => {
            const active = page === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                whileTap={{ scale: 0.94 }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 11px",
                  borderRadius: "var(--radius-sm)",
                  background: active ? "var(--surface-1)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 400, fontSize: 13.5,
                  transition: "all 0.15s",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  boxShadow: active ? "var(--shadow-sm)" : "none",
                }}
              >
                <i className={`ti ${tab.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                <span style={{ display: "none" }} className="nav-tab-label">{tab.label}</span>
                <span style={{ display: "block" }} className="nav-tab-label-mobile">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* User pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "4px 10px 4px 5px",
            border: "1px solid var(--border)",
            borderRadius: 20, background: "var(--surface-1)",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
              {user?.username}
            </span>
          </div>

          {/* Logout */}
          <motion.button
            onClick={onLogout}
            whileTap={{ scale: 0.88 }}
            title="Sign out"
            style={{
              width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
              background: "transparent", color: "var(--text-muted)",
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      <style>{`
        @media (min-width: 480px) {
          .nav-logo-text { display: block !important; }
          .nav-tab-label { display: block !important; }
          .nav-tab-label-mobile { display: none !important; }
        }
        @media (max-width: 479px) {
          .nav-tab-label-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
