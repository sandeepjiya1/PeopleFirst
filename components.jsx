/* global React */
// PeopleFirst — JDS 3.1 primitives for the Leader homepage.
// Pure cosmetic recreation built on Jio Design System tokens.

const { useState } = React;

// ─────────────────────────────────────────────────────────────
// Icon — inlines the monochrome SVG so `fill="currentColor"` inherits `color`.
// Robust across real browsers, html-to-image, and PDF/PPTX export.
// ─────────────────────────────────────────────────────────────
const __iconCache = {};
function __iconInit(name) {
  if (__iconCache[name]) return __iconCache[name];
  // Prefer the inlined registry (works offline / through public links).
  if (typeof window !== "undefined" && window.__ICONS && window.__ICONS[name]) {
    __iconCache[name] = window.__ICONS[name];
    return __iconCache[name];
  }
  return "";
}
function Icon({ name, size = 24, color = "currentColor", style }) {
  const [svg, setSvg] = useState(() => __iconInit(name));
  React.useEffect(() => {
    const reg = __iconInit(name);
    if (reg) { setSvg(reg); return; }
    let live = true;
    fetch(`assets/icons/ic_${name}.svg`)
      .then((r) => r.ok ? r.text() : "")
      .then((txt) => { if (!/^\s*<svg/.test(txt)) return; __iconCache[name] = txt; if (live) setSvg(txt); })
      .catch(() => {});
    return () => { live = false; };
  }, [name]);
  return (
    <span
      className="jds-icon"
      role="img"
      aria-hidden="true"
      style={{
        display: "inline-flex", width: size, height: size, flexShrink: 0,
        color, lineHeight: 0, ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Multi-color icon (e.g. ic_success_colored) — inlined from the registry so it
// renders offline / through public links; falls back to a file request.
function ColorIcon({ name, size = 24, style }) {
  const reg = typeof window !== "undefined" && window.__ICONS && window.__ICONS[name];
  if (reg) {
    return <span className="jds-icon" aria-hidden="true" style={{ display: "inline-flex", width: size, height: size, lineHeight: 0, ...style }} dangerouslySetInnerHTML={{ __html: reg }} />;
  }
  return <img src={`assets/icons/ic_${name}.svg`} width={size} height={size} style={{ display: "block", ...style }} alt="" />;
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
function Button({ children, variant = "primary", size = "m", icon, iconRight, onClick, full, disabled, style }) {
  const sizes = {
    xs: { h: 28, px: 12, fs: 12 },
    s:  { h: 34, px: 16, fs: 13 },
    m:  { h: 42, px: 20, fs: 14 },
    l:  { h: 48, px: 24, fs: 15 },
  };
  const s = sizes[size];
  const variants = {
    primary:   { background: "var(--reliance-base)", color: "#fff", border: "1px solid transparent" },
    sky:       { background: "var(--sky)", color: "#fff", border: "1px solid transparent" },
    secondary: { background: "var(--surface-minimal)", color: "var(--content-heavy)", border: "1px solid var(--stroke-heavy)" },
    ghost:     { background: "transparent", color: "var(--reliance-base)", border: "1px solid transparent" },
    skyghost:  { background: "var(--sky-light)", color: "var(--sky-ink)", border: "1px solid transparent" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: s.h, padding: `0 ${s.px}px`, borderRadius: 999, fontSize: s.fs,
      fontWeight: 700, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
      width: full ? "100%" : undefined, letterSpacing: "-.01em", whiteSpace: "nowrap",
      opacity: disabled ? 0.45 : 1,
      transition: "filter var(--motion-discreet) var(--motion-easing-standard)",
      ...variants[variant], ...style,
    }}>
      {icon && <Icon name={icon} size={s.fs + 4} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.fs + 4} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Card / surface
// ─────────────────────────────────────────────────────────────
function Card({ children, surface = "elev", style, onClick, pad = 16 }) {
  const surfaces = {
    out:  { background: "var(--surface-minimal)", border: "1px solid var(--stroke-minimal)" },
    elev: { background: "var(--surface-minimal)", boxShadow: "var(--shadow-elevated-low)", border: "1px solid var(--stroke-minimal)" },
    subtle: { background: "var(--surface-subtle)", border: "1px solid transparent" },
  };
  return (
    <div onClick={onClick} style={{
      borderRadius: 16, padding: pad, ...surfaces[surface],
      cursor: onClick ? "pointer" : "default", ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Signal pill — health status: healthy / at-risk / off-track
// ─────────────────────────────────────────────────────────────
const SIGNALS = {
  healthy: { fg: "var(--positive)", bg: "var(--positive-light)", label: "Healthy" },
  risk:    { fg: "var(--warning)",  bg: "var(--warning-light)",  label: "At risk" },
  off:     { fg: "var(--negative)", bg: "var(--negative-light)", label: "Off track" },
  info:    { fg: "var(--sky-ink)",  bg: "var(--sky-light)",      label: "Info" },
};

function Signal({ tone = "healthy", children, dot = true }) {
  const t = SIGNALS[tone];
  return (
    <span style={{
      height: 22, padding: dot ? "0 9px 0 7px" : "0 9px", borderRadius: 999,
      background: t.bg, color: t.fg, fontSize: 12, fontWeight: 700, letterSpacing: "-.01em",
      display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} />}
      {children || t.label}
    </span>
  );
}

// A bare status dot (no pill)
function Dot({ tone = "healthy", size = 8 }) {
  const t = SIGNALS[tone];
  return <span style={{ width: size, height: size, borderRadius: "50%", background: t.fg, flexShrink: 0, display: "inline-block" }} />;
}

// ─────────────────────────────────────────────────────────────
// Widget shell — every homepage widget shares this frame
// ─────────────────────────────────────────────────────────────
let __wIdx = 0;
function Widget({ icon, title, action, onAction, children, accent = "var(--content-minimal)", right }) {
  const idxRef = React.useRef(null);
  if (idxRef.current === null) idxRef.current = __wIdx++;
  const delay = `${0.05 + idxRef.current * 0.08}s`;
  return (
    <section style={{ marginTop: 14, animation: `slideUp .45s cubic-bezier(.2,0,0,1) ${delay} both` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px 9px" }}>
        <h2 style={{
          margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase",
          color: "var(--content-moderate)",
        }}>{title}</h2>
        <div style={{ flex: 1 }} />
        {right}
        {action && (
          <button onClick={onAction} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 700, color: "var(--reliance-base)", display: "inline-flex", alignItems: "center", gap: 2,
          }}>{action}</button>
        )}
      </div>
      {children}
    </section>
  );
}

// Big tabular number
function Stat({ value, sub, color = "var(--content-heavy)", size = 30 }) {
  return (
    <div>
      <div style={{ fontSize: size, fontWeight: 900, lineHeight: 1, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--content-minimal)", marginTop: 5, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// Trend chip with arrow
function Trend({ dir = "up", children, good = true }) {
  const color = good ? "var(--positive)" : "var(--negative)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
      <Icon name={dir === "up" ? "arrow_up" : "arrow_down"} size={14} color={color} />
      {children}
    </span>
  );
}

Object.assign(window, {
  Icon, ColorIcon, Button, Card, Signal, Dot, Widget, Stat, Trend, SIGNALS,
});
