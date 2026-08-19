
import { motion } from "framer-motion";

// ─── SegmentedControl ─────────────────────────────────────────────────────────

export function SegmentedControl({ options, value, onChange, colorFn }) {
  return (
    <div style={{
      display: "inline-flex",
      background: "var(--clr-surface2)",
      borderRadius: "var(--radius-md)",
      padding: 4,
      gap: 2,
      border: "1px solid var(--border)",
    }}>
      {options.map((opt) => {
        const active = value === opt.key;
        const color  = colorFn ? colorFn(opt.key) : "var(--clr-primary-lt)";
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            style={{
              padding: "7px 16px",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              transition: "all 0.15s",
              background: active
                ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.12))"
                : "transparent",
              color: active ? color : "var(--clr-muted)",
              boxShadow: active ? "0 0 12px rgba(139,92,246,0.2)" : "none",
              border: active ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              letterSpacing: 0.2,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, accent }) {
  const accentColor = accent || "var(--clr-primary-lt)";
  return (
    <div style={{
      background: "var(--clr-surface2)",
      borderRadius: "var(--radius-md)",
      padding: "18px 14px",
      textAlign: "center",
      border: `1px solid rgba(139,92,246,0.18)`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle top glow line */}
      <div style={{
        position: "absolute",
        top: 0, left: "20%", right: "20%",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: 0.6,
      }} />

      <div style={{
        fontSize: "clamp(20px, 5vw, 26px)",
        fontWeight: 800,
        color: accentColor,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        fontFamily: "var(--font-mono)",
        textShadow: `0 0 20px ${accentColor}60`,
      }}>
        {value}
      </div>

      {sub && (
        <div style={{
          fontSize: 11,
          color: "var(--clr-cyan)",
          fontWeight: 600,
          marginTop: 4,
          letterSpacing: 0.5,
        }}>
          {sub}
        </div>
      )}

      <div style={{
        fontSize: 11,
        color: "var(--clr-muted)",
        marginTop: 5,
        fontWeight: 500,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ children, color = "var(--clr-primary-lt)", bg = "rgba(139,92,246,0.15)" }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 9px",
      borderRadius: 20,
      background: bg,
      color,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      border: `1px solid ${color}30`,
    }}>
      {children}
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, body }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "clamp(2rem, 10vw, 4rem) 1rem",
      color: "var(--clr-muted)",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "rgba(139,92,246,0.10)",
        border: "1px solid rgba(139,92,246,0.20)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <i
          className={`ti ${icon}`}
          style={{ fontSize: 32, color: "var(--clr-primary)", opacity: 0.7 }}
          aria-hidden="true"
        />
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: "clamp(15px, 4vw, 18px)",
        color: "var(--clr-white)",
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: "clamp(13px, 3vw, 14px)",
        maxWidth: 260,
        lineHeight: 1.6,
      }}>
        {body}
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 20, color = "var(--clr-primary)" }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2.5px solid rgba(139,92,246,0.15)`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.65s linear infinite",
      display: "inline-block",
      flexShrink: 0,
    }} />
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  variant   = "primary",
  accent    = "#8B5CF6",
  disabled,
  style     = {},
  icon,
}) {
  const base = {
    padding: "12px 28px",
    borderRadius: "var(--radius-md)",
    fontWeight: 700,
    fontSize: "clamp(13px, 3.5vw, 15px)",
    transition: "all 0.15s",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    letterSpacing: 0.3,
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${accent}, #22D3EE)`,
      color: "#fff",
      boxShadow: `0 0 24px ${accent}55, 0 4px 12px rgba(0,0,0,0.3)`,
    },
    secondary: {
      background: "var(--clr-surface2)",
      color: "var(--clr-white)",
      border: "1px solid rgba(139,92,246,0.25)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    },
    ghost: {
      background: "transparent",
      color: "var(--clr-muted)",
      border: "1px solid rgba(139,92,246,0.18)",
    },
    danger: {
      background: "linear-gradient(135deg, #FB4B6B, #c0392b)",
      color: "#fff",
      boxShadow: "0 0 20px rgba(251,75,107,0.4)",
    },
  };

  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      whileHover={!disabled ? { opacity: 0.88, y: -1 } : {}}
      style={{ ...base, ...variants[variant] }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </motion.button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style = {}, accent, glow }) {
  return (
    <div style={{
      background: "var(--clr-surface)",
      border: accent
        ? `1px solid ${accent}45`
        : "1px solid rgba(139,92,246,0.14)",
      borderRadius: "var(--radius-lg)",
      padding: "clamp(14px, 4vw, 20px)",
      boxShadow: glow
        ? `var(--shadow-md), 0 0 30px ${accent || "#8B5CF6"}20`
        : "var(--shadow-sm)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {/* Top shimmer line */}
      {accent && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
        }} />
      )}
      {children}
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export function Alert({ type = "error", children }) {
  const styles = {
    error: {
      color:  "var(--clr-danger)",
      bg:     "rgba(251,75,107,0.08)",
      border: "rgba(251,75,107,0.28)",
      icon:   "⚠",
    },
    success: {
      color:  "var(--clr-success)",
      bg:     "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.28)",
      icon:   "✓",
    },
  };
  const s = styles[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        fontSize: "clamp(12px, 3vw, 13px)",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
      {children}
    </motion.div>
  );
}

// ─── ModeCard — game mode selection card ─────────────────────────────────────

export function ModeCard({ icon, title, desc, accent, onClick, active }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ x: 3 }}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "clamp(14px, 3vw, 18px) clamp(14px, 3vw, 18px)",
        borderRadius: "var(--radius-lg)",
        background: active
          ? `linear-gradient(135deg, ${accent}22, ${accent}08)`
          : "var(--clr-surface2)",
        border: `1px solid ${active ? accent + "55" : "rgba(139,92,246,0.12)"}`,
        cursor: "pointer",
        textAlign: "left",
        boxShadow: active ? `0 0 20px ${accent}25` : "none",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* Icon circle */}
      <div style={{
        width: "clamp(44px, 11vw, 52px)",
        height: "clamp(44px, 11vw, 52px)",
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${accent}55, ${accent}22)`,
        border: `1.5px solid ${accent}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "clamp(20px, 5vw, 24px)",
        flexShrink: 0,
        boxShadow: `0 0 16px ${accent}30`,
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: "clamp(14px, 3.5vw, 16px)",
          color: accent,
          marginBottom: 3,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: "clamp(11px, 2.8vw, 13px)",
          color: "var(--clr-muted)",
          lineHeight: 1.4,
        }}>
          {desc}
        </div>
      </div>

      {/* Arrow */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
        <path d="M9 18l6-6-6-6" stroke={accent} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}