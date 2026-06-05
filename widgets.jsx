/* global React, Icon, ColorIcon, Button, Card, Signal, Dot, Widget, Stat, Trend */
const { useState } = React;

// ── Shared hook: expand when fully visible, collapse when nearly gone ──
function useStackReveal() {
  const [expanded, setExpanded] = React.useState(false);
  const ref = React.useRef(null);
  const timer = React.useRef(null);
  const expandedRef = React.useRef(false); // ref mirror so closure stays accurate

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      clearTimeout(timer.current);
      const ratio = e.intersectionRatio;
      if (ratio >= 0.88 && !expandedRef.current) {
        // 100% in frame (collapsed card is small, 88% ≈ fully visible) → expand
        timer.current = setTimeout(() => {
          setExpanded(true);
          expandedRef.current = true;
        }, 220);
      } else if (ratio < 0.15 && expandedRef.current) {
        // Almost out of frame and was expanded → collapse
        setExpanded(false);
        expandedRef.current = false;
      }
    }, { threshold: [0, 0.15, 0.5, 0.88, 1.0] });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer.current); };
  }, []);

  return { expanded, ref };
}

function useCountUp(target, { suffix = '', prefix = '', decimals = 0, duration = 1000, delay = 0 } = {}) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now() + delay;
      const step = (now) => {
        const elapsed = Math.max(0, now - start);
        const pct = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - pct, 3);
        setVal(Math.round(target * eased * Math.pow(10, decimals)) / Math.pow(10, decimals));
        if (pct < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, delay]);
  return { ref, display: `${prefix}${val.toLocaleString('en-IN')}${suffix}` };
}

// ═══════════════════════════════════════════════════════════════
// 1 · AI MORNING BRIEFING — cinematic reveal on landing
// ═══════════════════════════════════════════════════════════════
function AIBriefing({ expanded, onToggle, decisions, onResolve, onOpenAssistant }) {
  const handled = [
  { cat: "Approvals", n: 14, note: "auto-approved within policy" },
  { cat: "Calendar", n: 6, note: "conflicts resolved, 2 declined" }];

  const handledTotal = handled.reduce((s, h) => s + h.n, 0);

  // ── Reveal state machine ──────────────────────────────────────
  // phase 0: card slides in, only header visible (content collapsed)
  // phase 1: content expands (decisions + auto-approve row)
  // phase 2: each decision fades in staggered
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    // Step 1: card entrance → 600ms → expand body
    const t1 = setTimeout(() => setPhase(1), 600);
    // Step 2: body open → 200ms → stagger decisions in
    const t2 = setTimeout(() => setPhase(2), 820);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const bodyOpen = phase >= 1;
  const decisionsIn = phase >= 2;

  return (
    <div style={{
      borderRadius: 20, overflow: "hidden",
      border: "1px solid var(--sky-border)",
      boxShadow: "0 1px 3px rgba(15,23,42,.05), 0 8px 24px -12px var(--sky-shadow)",
      background: "var(--surface-minimal)",
      animation: "fadeInScale .5s cubic-bezier(.2,0,0,1) .1s both"
    }}>

      {/* ── Sky header band — always visible ── */}
      <div style={{
        background: "linear-gradient(180deg, var(--sky-light) 0%, color-mix(in oklch, var(--sky-light) 55%, white) 100%)",
        padding: "15px 16px 14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="ai-sparkle" style={{
            width: 30, height: 30, borderRadius: 9, background: "var(--sky)", display: "flex",
            alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px -1px var(--sky-shadow)"
          }}>
            <Icon name="ai_sparkle" size={19} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--sky-ink)", letterSpacing: "-.01em" }}>PeopleFirst AI</div>
            <div style={{ fontSize: 11.5, color: "var(--sky-ink)", opacity: .7, fontWeight: 500, marginTop: -1 }}>Morning summary · updated 8:47am</div>
          </div>
        </div>
        <p style={{ margin: "13px 2px 2px", fontSize: 17, fontWeight: 700, lineHeight: 1.32, color: "var(--content-heavy)", letterSpacing: "-.01em", textWrap: "pretty" }}>
          <span style={{ color: "var(--sky-ink)" }}>{decisions.length} critical {decisions.length === 1 ? "item" : "items"}</span> for today
        </p>
      </div>

      {/* ── Expanding body — grid-template-rows trick for pixel-perfect smooth expand ── */}
      <div style={{
        display: "grid",
        gridTemplateRows: bodyOpen ? "1fr" : "0fr",
        transition: "grid-template-rows .6s cubic-bezier(.4,0,.2,1)",
      }}>
      <div style={{ minHeight: 0, overflow: "hidden" }}>

        {/* Decisions */}
        <div style={{ padding: "6px 12px 12px", background: "var(--surface-minimal)" }}>
          {decisions.map((d, i) =>
          <div key={d.id} style={{
            display: "flex", gap: 11, padding: "13px 6px 14px",
            borderTop: i ? "1px solid var(--stroke-minimal)" : "none",
            opacity: decisionsIn ? 1 : 0,
            transform: decisionsIn ? "translateY(0)" : "translateY(12px)",
            transition: `opacity .4s ease ${i * 120}ms, transform .4s cubic-bezier(.2,0,0,1) ${i * 120}ms`
          }}>
              <span style={{ marginTop: 2, flexShrink: 0 }}><Dot tone={d.tone} size={9} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", lineHeight: 1.3, letterSpacing: "-.01em" }}>{d.title}</div>
                <div style={{ fontSize: 13, color: "var(--content-moderate)", lineHeight: 1.42, marginTop: 3, textWrap: "pretty", whiteSpace: "pre-line" }}>{d.detail}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                  <Button size="s" variant={d.cta.variant || "primary"} onClick={() => onResolve(d.id, "primary")}>{d.cta.label}</Button>
                  <Button size="s" variant="secondary" onClick={() => onResolve(d.id, "review")}>{d.secondary || "Review"}</Button>
                </div>
              </div>
            </div>
          )}
          {decisions.length === 0 &&
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 8px", opacity: decisionsIn ? 1 : 0, transition: "opacity .4s ease" }}>
              <ColorIcon name="success_colored" size={26} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)" }}>You're clear for the review.</div>
                <div style={{ fontSize: 13, color: "var(--content-moderate)", marginTop: 1 }}>Nothing else needs you before 10am.</div>
              </div>
            </div>
          }
        </div>

        {/* Auto-approve row — slides in last */}
        <div style={{
          opacity: decisionsIn ? 1 : 0,
          transform: decisionsIn ? "translateY(0)" : "translateY(8px)",
          transition: `opacity .4s ease ${decisions.length * 120 + 80}ms, transform .4s cubic-bezier(.2,0,0,1) ${decisions.length * 120 + 80}ms`
        }}>
          <button onClick={onToggle} style={{
            width: "100%", border: "none", borderTop: "1px solid var(--stroke-minimal)",
            background: "var(--surface-subtle)", padding: "12px 16px", cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <Icon name="check" size={16} color="var(--positive)" />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-heavy)", flex: 1, textAlign: "left" }}>Auto approved request · {handledTotal}</span>
            <Icon name={expanded ? "chevron_up" : "chevron_down"} size={18} color="var(--content-minimal)" />
          </button>
          {expanded &&
          <div style={{ background: "var(--surface-subtle)", padding: "0 16px 14px" }}>
              {handled.map((h) =>
            <div key={h.cat} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "8px 0", borderTop: "1px solid var(--stroke-minimal)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-heavy)", width: 78, flexShrink: 0 }}>{h.cat}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--sky-ink)", fontVariantNumeric: "tabular-nums" }}>{h.n}</span>
                  <span style={{ fontSize: 12.5, color: "var(--content-moderate)", flex: 1, textWrap: "pretty" }}>{h.note}</span>
                </div>
              )}
            </div>
          }
        </div>

      </div>{/* end inner overflow wrapper */}
      </div>{/* end grid expanding body */}
    </div>);
}

// ═══════════════════════════════════════════════════════════════
// 2 · CRITICAL PROJECTS — all delayed, sticky summary, peek carousel
// ═══════════════════════════════════════════════════════════════
function Performance({ onOpen }) {
  // All critical — every card is Delayed (instruction 6)
  const PROJECTS = [
    {
      name: "MyJio App", statusLabel: "Delayed",
      metric: "Sprint velocity", period: "last quarter",
      pct: 56, trend: -12,
      bars: [95, 88, 80, 72, 64, 56],
      months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
      ai: "3 sprints behind on payments rewrite. Moving one engineer from Growth recovers the delivery date."
    },
    {
      name: "MyJio 3.1 revamp", statusLabel: "Delayed",
      metric: "On-time delivery", period: "last 6 months",
      pct: 76, trend: -8,
      bars: [86, 84, 81, 79, 77, 76],
      months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
      ai: "On-time delivery slipped 10pts since Feb. Team workload at 113% risks further delay this quarter."
    },
    {
      name: "Jio Translate", statusLabel: "Delayed",
      metric: "Feature completion", period: "Q2 2026",
      pct: 58, trend: -5,
      bars: [68, 66, 63, 61, 59, 58],
      months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
      ai: "Feature completion at 58%, 27pts below target. Scope creep in ML pipeline is the main blocker."
    }
  ];

  const summary = { total: 74, onTime: 47, delayed: 19, onHold: 8 };
  const [active, setActive] = React.useState(0);
  const [summaryOpacity, setSummaryOpacity] = React.useState(1); // sticky fade

  const cuTotal   = useCountUp(summary.total,   { duration: 900 });
  const cuOnTime  = useCountUp(summary.onTime,  { duration: 900, delay: 150 });
  const cuDelayed = useCountUp(summary.delayed, { duration: 900, delay: 250 });
  const cuOnHold  = useCountUp(summary.onHold,  { duration: 900, delay: 350 });

  const [sumBarsIn, setSumBarsIn] = React.useState(false);
  const outerRef = React.useRef(null);

  React.useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setSumBarsIn(true), 300); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Layout constants
  const SUMMARY_W = 144;
  const GAP       = 8;    // gap between cards only
  const PAD       = 20;
  const CARD_W    = 210;
  const FIRST_CARD_ML = 16; // extra space between summary and first card only

  const scrollRef = React.useRef(null);

  // Scroll handler — cards slide OVER summary → fade summary beneath them
  const handleScroll = (e) => {
    const sl = e.target.scrollLeft;
    const fadeEnd = SUMMARY_W;
    const opacity = Math.max(0, 1 - Math.max(0, sl) / fadeEnd);
    setSummaryOpacity(opacity);
  };

  const Sparkline = ({ bars, months }) => {
    const w = 220, h = 72, padX = 2, padY = 8;
    const lo = Math.min(...bars) - 2, hi = Math.max(...bars) + 2, span = hi - lo || 1;
    const x = (i) => padX + i * ((w - padX * 2) / (bars.length - 1));
    const y = (v) => h - padY - (v - lo) / span * (h - padY * 2);
    const pts = bars.map((v, i) => [x(i), y(v)]);
    const line = "M" + pts.map(p => p.join(",")).join(" L ");
    const area = line + ` L ${x(bars.length - 1)},${h} L ${x(0)},${h} Z`;
    const last = pts[pts.length - 1];
    return (
      <div style={{ marginTop: 9 }}>
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id="projFill2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--reliance-base)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--reliance-base)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#projFill2)" />
          <path d={line} fill="none" stroke="var(--reliance-base)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkline-line" />
          <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--reliance-base)" stroke="white" strokeWidth="2" className="sparkline-dot" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          {months.map(m => <span key={m} style={{ fontSize: 10, color: "var(--content-minimal)", fontWeight: 500 }}>{m}</span>)}
        </div>
      </div>
    );
  };

  return (
    <Widget icon="analytics" title="Critical projects" action="See all" onAction={onOpen}>

      {/*
        ── KEY TECHNIQUE ──
        Summary is a sticky flex child (position: sticky; left: 0).
        At scrollLeft=0 it sits at the left — ALWAYS VISIBLE on load.
        Cards are normal flex children to its right.
        As user scrolls: cards slide LEFT, physically overlaying the summary.
        Cards have z-index:2, summary z-index:1 → cards paint on top.
        summaryOpacity fades from 1→0 as scrollLeft increases.
        Outer has NO overflow:hidden (that breaks sticky) — clipPath handles rounding.
      */}
      {/* No overflow:hidden on outer — that breaks position:sticky. Border-radius handles visual rounding. */}
      <div ref={outerRef} style={{ background: "#EEF2FF", borderRadius: 18 }}>
        <div
          style={{
            display: "flex", gap: GAP,
            overflowX: "auto", overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            padding: PAD,
            // No scroll snap — it forces scrollLeft on mount and hides the sticky summary
          }}
          ref={scrollRef}
          onScroll={handleScroll}>

          {/* ── Summary — sticky to left, fades as cards scroll over it ── */}
          <div style={{
            position: "sticky", left: 0,     // stays at left edge while cards scroll
            flexShrink: 0, width: SUMMARY_W,
            zIndex: 1,                        // behind cards
            opacity: summaryOpacity,
            transition: "opacity .1s linear",
            pointerEvents: summaryOpacity < 0.3 ? "none" : "auto",
            display: "flex", flexDirection: "column", justifyContent: "center",
            background: "#EEF2FF",           // solid bg so cards slide over cleanly
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--content-minimal)", textTransform: "uppercase", letterSpacing: ".04em" }}>Projects</div>
            <div ref={cuTotal.ref} style={{ fontSize: 38, fontWeight: 900, color: "var(--content-heavy)", letterSpacing: "-.04em", lineHeight: 1, marginTop: 3, fontVariantNumeric: "tabular-nums", animation: "summaryNumPop .5s cubic-bezier(.2,0,0,1) .1s both" }}>
              {cuTotal.display}
            </div>

            {/* Segmented bar */}
            <div style={{ height: 7, borderRadius: 999, overflow: "hidden", background: "rgba(0,0,0,.08)", margin: "11px 0 11px" }}>
              <div style={{ display: "flex", height: "100%", width: sumBarsIn ? "100%" : "0%", transition: "width .9s cubic-bezier(.4,0,.2,1) .3s", overflow: "hidden", borderRadius: 999 }}>
                <div style={{ flex: summary.onTime, background: "var(--positive)" }} />
                <div style={{ flex: summary.delayed, background: "var(--negative)", marginLeft: 2 }} />
                <div style={{ flex: summary.onHold, background: "#B0B8C4", marginLeft: 2 }} />
              </div>
            </div>

            {/* Stat rows with left coloured bar */}
            {[
              { label: "On time", cu: cuOnTime, color: "var(--positive)" },
              { label: "Delayed", cu: cuDelayed, color: "var(--negative)" },
              { label: "On Hold", cu: cuOnHold, color: "#B0B8C4" }
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 9, position: "relative", marginBottom: i < 2 ? 8 : 0, animation: `fadeIn .4s ease ${.3 + i * .1}s both` }}>
                <span style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: 3, borderRadius: 999, background: s.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--content-moderate)", flex: 1 }}>{s.label}</span>
                <span ref={s.cu.ref} style={{ fontSize: 17, fontWeight: 900, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>{s.cu.display}</span>
              </div>
            ))}
          </div>

          {/* ── Project cards — z-index:2 so they paint above the sticky summary ── */}
          {PROJECTS.map((p, idx) => (
            <div key={p.name} style={{
              flex: `0 0 ${CARD_W}px`, flexShrink: 0,
              marginLeft: idx === 0 ? FIRST_CARD_ML : 0,
              position: "relative", zIndex: 2,
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 14px rgba(15,23,42,.10)",
              padding: "13px 13px 11px",
              display: "flex", flexDirection: "column"  // column so bottom section can be pushed down
            }}>
              {/* Top content */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--content-heavy)", letterSpacing: "-.01em", lineHeight: 1.2, flex: 1 }}>{p.name}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--negative)", background: "var(--negative-light)", borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{p.statusLabel}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--content-minimal)", fontWeight: 500, marginTop: 2 }}>{p.metric} · {p.period}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 8 }}>
                <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-.03em", color: "var(--content-heavy)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{p.pct}%</span>
                <Trend dir="down" good={false}>{p.trend} pts</Trend>
              </div>

              {/* Spacer — pushes sparkline + AI to the bottom */}
              <div style={{ flex: 1 }} />

              {/* Bottom-aligned: sparkline + AI comment */}
              <Sparkline bars={p.bars} months={p.months} />
              <div style={{ marginTop: 9, padding: "8px 10px", borderRadius: 10, background: "var(--sky-light)", display: "flex", gap: 7, alignItems: "flex-start" }}>
                <Icon name="ai_sparkle" size={13} color="var(--sky)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--sky-ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.ai}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>);
}

// ═══════════════════════════════════════════════════════════════
// 2b · CRITICAL PROJECTS (Summary + Cards variant)
//      Top: compact stats strip · Bottom: business-focused project cards
// ═══════════════════════════════════════════════════════════════
function CriticalProjectsCards({ onOpen }) {
  const summary = { total: 74, onTime: 47, delayed: 19, onHold: 8 };

  // Enriched project data — what a leader actually needs
  const PROJECTS = [
    {
      name: "MyJio App",
      status: "critical",   // critical / delayed / at_risk
      owner: "Platform · Karan Mehta",
      progress: 56, target: 95,
      trend: -12,
      dueIn: "Due Jul 15",
      urgency: "high",
      blocker: "3 sprints behind on payments rewrite",
      action: "Move 1 engineer from Growth — recovers date"
    },
    {
      name: "MyJio 3.1 revamp",
      status: "delayed",
      owner: "Design · Priya Sharma",
      progress: 76, target: 90,
      trend: -8,
      dueIn: "Due Aug 1",
      urgency: "medium",
      blocker: "On-time delivery slipped 10pts since Feb",
      action: "Reduce team workload — currently at 113%"
    },
    {
      name: "Jio Translate",
      status: "delayed",
      owner: "ML · Arjun Nair",
      progress: 58, target: 85,
      trend: -5,
      dueIn: "Due Jun 30",
      urgency: "high",
      blocker: "Scope creep in ML pipeline module",
      action: "Freeze new feature requests until Q3"
    },
    {
      name: "JioFiber B2B",
      status: "at_risk",
      owner: "Sales · Meena Joshi",
      progress: 82, target: 90,
      trend: -3,
      dueIn: "Due Jul 20",
      urgency: "low",
      blocker: "Legal sign-off pending for enterprise contracts",
      action: "Escalate to legal — 3 deals blocked"
    }
  ];

  const statusColor = (s) => s === "critical" ? "var(--negative)" : s === "delayed" ? "#FB923C" : "var(--warning)";
  const statusBg   = (s) => s === "critical" ? "var(--negative-light)" : s === "delayed" ? "#FFF0E5" : "var(--warning-light)";
  const statusLabel = (s) => s === "critical" ? "Critical" : s === "delayed" ? "Delayed" : "At risk";
  const urgencyColor = { high: "var(--negative)", medium: "#FB923C", low: "var(--warning)" };

  const scrollRef = React.useRef(null);

  return (
    <Widget icon="analytics" title="Critical projects" action="See all" onAction={onOpen}>

      {/* ── Top: Compact summary strip ── */}
      <div style={{
        background: "var(--surface-minimal)",
        borderRadius: 14,
        border: "1px solid var(--stroke-minimal)",
        boxShadow: "0 1px 4px rgba(15,23,42,.05)",
        padding: "14px 16px",
        marginBottom: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--content-minimal)", textTransform: "uppercase", letterSpacing: ".04em" }}>Total projects</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--content-heavy)", letterSpacing: "-.04em", lineHeight: 1, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{summary.total}</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "On time", val: summary.onTime, color: "var(--positive)" },
              { label: "Delayed", val: summary.delayed, color: "var(--negative)" },
              { label: "On hold", val: summary.onHold, color: "var(--content-minimal)" }
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--content-minimal)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Segmented progress bar */}
        <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", gap: 2, marginTop: 12 }}>
          <div style={{ flex: summary.onTime, background: "var(--positive)" }} />
          <div style={{ flex: summary.delayed, background: "var(--negative)" }} />
          <div style={{ flex: summary.onHold, background: "#CBD5E1" }} />
        </div>
      </div>

      {/* ── Bottom: Horizontal project cards ── */}
      <div ref={scrollRef}
        style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 0 4px", WebkitOverflowScrolling: "touch" }}>

        {PROJECTS.map((p) => (
          <div key={p.name} style={{
            flex: "0 0 228px", flexShrink: 0,
            background: "var(--surface-minimal)",
            borderRadius: 14,
            border: "1px solid var(--stroke-minimal)",
            boxShadow: "0 2px 10px rgba(15,23,42,.07)",
            padding: "14px",
            display: "flex", flexDirection: "column", gap: 10
          }}>

            {/* Row 1: name + status */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--content-heavy)", letterSpacing: "-.01em", lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--content-minimal)", fontWeight: 500, marginTop: 2 }}>{p.owner}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor(p.status), background: statusBg(p.status), borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{statusLabel(p.status)}</span>
            </div>

            {/* Row 2: Big % + trend + due date */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-.04em", color: "var(--content-heavy)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{p.progress}%</span>
                <Trend dir="down" good={false}>{p.trend} pts</Trend>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: urgencyColor[p.urgency], display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: urgencyColor[p.urgency], flexShrink: 0 }} />
                {p.dueIn}
              </span>
            </div>

            {/* Row 3: Progress bar vs target */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--content-minimal)" }}>Progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--content-moderate)" }}>Target {p.target}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "var(--surface-subtle)", overflow: "hidden", position: "relative" }}>
                {/* Target marker */}
                <div style={{ position: "absolute", left: `${p.target}%`, top: 0, bottom: 0, width: 2, background: "var(--stroke-heavy)", zIndex: 1 }} />
                {/* Progress fill */}
                <div style={{ height: "100%", width: `${p.progress}%`, borderRadius: 999, background: statusColor(p.status) }} />
              </div>
            </div>

            {/* Row 4: Blocker + Action — what leader needs */}
            <div style={{ background: "var(--sky-light)", borderRadius: 10, padding: "9px 10px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--negative)", textTransform: "uppercase", letterSpacing: ".03em", flexShrink: 0 }}>⚑</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-heavy)", lineHeight: 1.35 }}>{p.blocker}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <Icon name="ai_sparkle" size={12} color="var(--sky)" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--sky-ink)", lineHeight: 1.35 }}>{p.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Widget>);
}

// ═══════════════════════════════════════════════════════════════
// 3 · ACTION ITEMS — approvals, with AI bulk-approve
// ═══════════════════════════════════════════════════════════════
function ActionItems({ state, onBulkApprove, onOpen }) {
  // state: { total, lowRisk, approved }
  const types = [
  { label: "Leave", n: 12, icon: "calendar", filter: "Leave" },
  { label: "Travel", n: 6, icon: "location", crit: true, filter: "Travel" },
  { label: "Expense", n: 3, icon: "card", filter: "Expense" },
  { label: "Sign-offs", n: 2, icon: "document", filter: "Sign-off" }];

  const remaining = state.total - state.approved;
  const cuRemaining = useCountUp(remaining, { duration: 700 });
  return (
    <Widget icon="confirm" title="Approvals" action="See all" onAction={() => onOpen()}>
      <Card surface="elev" pad={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--content-minimal)", textTransform: "uppercase", letterSpacing: ".04em" }}>Pending approval</div>
            <span ref={cuRemaining.ref} style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.03em", color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", lineHeight: 1, display: "block", marginTop: 4 }}>{cuRemaining.display}</span>
          </div>
          <div style={{ flex: 1 }} />
          {/* 2 Critical badge */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--negative)", background: "var(--negative-light)", borderRadius: 999, padding: "4px 10px", border: "1px solid rgba(220,38,38,.15)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--negative)", flexShrink: 0 }} />
            2 Critical
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
          {types.map((t) =>
          <button key={t.label} onClick={() => onOpen(t.filter)} style={{ position: "relative", background: "var(--surface-subtle)", borderRadius: 12, border: "none", padding: "12px 4px", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              {/* Red dot — inside the tile, top-right corner */}
              {t.crit &&
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: "var(--negative)" }} />
            }
              <Icon name={t.icon} size={22} color="var(--sky)" />
              <div style={{ fontSize: 19, fontWeight: 900, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{t.n}</div>
              <div style={{ fontSize: 11.5, color: "var(--content-moderate)", fontWeight: 600 }}>{t.label}</div>
            </button>
          )}
        </div>

        {/* Critical item — AI comment style matching other widgets */}
        <button onClick={() => onOpen("Travel")} style={{ width: "100%", textAlign: "left", marginTop: 14, padding: "8px 10px", borderRadius: 10, background: "var(--sky-light)", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "flex-start", gap: 7 }}>
          <Icon name="ai_sparkle" size={13} color="var(--sky)" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--sky-ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>Rohan Das travels to Bengaluru tomorrow. Review and approve ₹38,500.</span>
        </button>

        {/* Low-risk handled automatically */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11, padding: "0 2px" }}>
          <Icon name="ai_sparkle" size={15} color="var(--sky)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "var(--content-moderate)", fontWeight: 600, lineHeight: 1.35 }}>{state.lowRisk} low-risk approvals handled automatically</span>
        </div>
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// 4 · TEAM SNAPSHOT — four numbers
// ═══════════════════════════════════════════════════════════════
function TeamSnapshot({ onOpen }) {
  const total = 250, present = 204, leave = 20, notIn = 10, woph = 16;
  const cuTotal   = useCountUp(250, { duration: 900 });
  const cuPresent = useCountUp(204, { duration: 900, delay: 100 });
  const cuLeave   = useCountUp(20,  { duration: 900, delay: 150 });
  const cuNotIn   = useCountUp(10,  { duration: 900, delay: 200 });
  const cuWoph    = useCountUp(16,  { duration: 900, delay: 250 });
  const cellCountUps = [cuPresent, cuLeave, cuNotIn, cuWoph];

  // Each cell routes to team page with a filter
  const cells = [
    { label: "Present",  value: present, tone: "healthy", filter: "present" },
    { label: "On leave", value: leave,   tone: "info",    filter: "on_leave" },
    { label: "Not in",   value: notIn,   tone: "risk",    filter: "not_in" },
    { label: "WO/PH",   value: woph,    tone: "off",     filter: "woph" }
  ];

  const toneColor = { healthy: "var(--positive)", info: "var(--sky)", risk: "var(--warning)", off: "var(--content-minimal)" };

  // Shared clickable style
  const clickStyle = { cursor: "pointer", WebkitTapHighlightColor: "transparent" };

  return (
    <Widget icon="group" title="Team summary" action="Team" onAction={onOpen}>
      <Card surface="elev" pad={16}>

        {/* Headcount row — clickable, goes to full team view */}
        <button onClick={onOpen} style={{ width: "100%", background: "none", border: "none", padding: 0, fontFamily: "inherit", textAlign: "left", ...clickStyle }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--content-minimal)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Headcount</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--positive)", fontVariantNumeric: "tabular-nums" }}>{Math.round(present / total * 100)}% present</span>
          </div>
          <div ref={cuTotal.ref} style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.02em", color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", lineHeight: 1, marginTop: 5 }}>{cuTotal.display}</div>
        </button>

        {/* Presence bar — each segment clickable to its filter */}
        <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", gap: 2, margin: "12px 0 14px", cursor: "pointer" }}>
          <span className="presence-seg" onClick={() => onOpen("present")}  style={{ flex: present, background: "var(--positive)", cursor: "pointer" }} />
          <span className="presence-seg" onClick={() => onOpen("on_leave")} style={{ flex: leave,   background: "var(--sky)",      cursor: "pointer" }} />
          <span className="presence-seg" onClick={() => onOpen("not_in")}   style={{ flex: notIn,   background: "var(--warning)",  cursor: "pointer" }} />
          <span className="presence-seg" onClick={() => onOpen("woph")}     style={{ flex: woph,    background: "var(--content-minimal)", cursor: "pointer" }} />
        </div>

        {/* Stat cells — each clickable with filter */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {cells.map((c, i) =>
          <button key={c.label} onClick={() => onOpen(c.filter)} style={{
            textAlign: "center", borderLeft: i ? "1px solid var(--stroke-minimal)" : "none",
            background: "none", border: "none", borderLeft: i ? "1px solid var(--stroke-minimal)" : "none",
            padding: "4px 0", fontFamily: "inherit", ...clickStyle
          }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: toneColor[c.tone], fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>
                <span ref={cellCountUps[i].ref}>{cellCountUps[i].display}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--content-moderate)", fontWeight: 600, marginTop: 5 }}>{c.label}</div>
            </button>
          )}
        </div>
      </Card>
    </Widget>);
}

// Simple mount-based count (no IntersectionObserver conflict)
function useMountCount(target, delay = 0) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => {
      const dur = 950;
      const start = performance.now();
      const step = (now) => {
        const pct = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - pct, 3);
        setVal(Math.round(target * eased));
        if (pct < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target]);
  return val;
}

// ═══════════════════════════════════════════════════════════════
// 4b · TEAMS — shared data + 2 independent widgets
// TeamsGauge = semicircle gauge + 2x2 grid
// TeamsHeadcount = large number + avatars + stat row
// ═══════════════════════════════════════════════════════════════

// Shared Teams data hook
function useTeamsData(onOpen) {
  const total = 250, present = 204, leave = 20, notIn = 10, woph = 16;
  const vTotal   = useMountCount(total,   200);
  const vPresent = useMountCount(present, 300);
  const vLeave   = useMountCount(leave,   400);
  const vNotIn   = useMountCount(notIn,   500);
  const vWoph    = useMountCount(woph,    600);
  const stats = [
    { label: "Present",  val: vPresent, color: "#22C55E", filter: "present" },
    { label: "On leave", val: vLeave,   color: "#38BDF8", filter: "on_leave" },
    { label: "Not in",   val: vNotIn,   color: "#FB923C", filter: "not_in" },
    { label: "WO/PH",   val: vWoph,    color: "#94A3B8", filter: "woph" }
  ];
  const cx = 100, cy = 110, r = 86;
  const fullCirc = 2 * Math.PI * r, halfCirc = fullCirc / 2, GAP = 4;
  const segs = [
    { value: present, color: "#22C55E" }, { value: leave, color: "#38BDF8" },
    { value: notIn, color: "#FB923C" }, { value: woph, color: "#CBD5E1" }
  ];
  let acc = 0;
  const arcs = segs.map(s => { const len=(s.value/total)*halfCirc; const a={...s,len:Math.max(len-GAP,4),offset:acc}; acc+=len; return a; });
  const avatars = ["https://i.pravatar.cc/40?img=11","https://i.pravatar.cc/40?img=25","https://i.pravatar.cc/40?img=32","https://i.pravatar.cc/40?img=47","https://i.pravatar.cc/40?img=53"];
  return { total, present, leave, notIn, woph, vTotal, stats, arcs, fullCirc, halfCirc, cx, cy, r, avatars };
}

// ── View A: Gauge + 2×2 grid ──
function TeamsGauge({ onOpen }) {
  const { total, present, vTotal, stats, arcs, fullCirc, halfCirc, cx, cy, r } = useTeamsData(onOpen);
  const StatRow = () => (
    <div style={{ display: "flex", borderTop: "1px solid var(--stroke-minimal)" }}>
      {stats.map((s, i) => (
        <button key={s.label} onClick={() => onOpen(s.filter)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, padding: "14px 4px",
          background: "none", border: "none",
          borderLeft: i ? "1px solid var(--stroke-minimal)" : "none",
          cursor: "pointer", fontFamily: "inherit"
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{s.val}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--content-moderate)", whiteSpace: "nowrap" }}>{s.label}</span>
          <span style={{ width: 20, height: 3, borderRadius: 999, background: s.color, marginTop: 1 }} />
        </button>
      ))}
    </div>
  );

  // ── Gauge + 2×2 grid (no header toggle)
  return (
    <Widget icon="group" title="Teams" action="Team" onAction={onOpen}>
      <Card surface="elev" pad={0} style={{ overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 0" }}>
            <div style={{ flex: "0 0 48%", position: "relative" }}>
              <svg viewBox="0 0 200 118" style={{ width: "100%", display: "block" }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={20}
                  strokeDasharray={`${halfCirc} ${fullCirc}`} strokeDashoffset={0}
                  transform={`rotate(180 ${cx} ${cy})`} strokeLinecap="round" />
                {arcs.map((arc, i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={arc.color} strokeWidth={20}
                    strokeDasharray={`${arc.len} ${fullCirc - arc.len}`}
                    strokeDashoffset={-arc.offset}
                    transform={`rotate(180 ${cx} ${cy})`}
                    strokeLinecap={i === 0 || i === arcs.length - 1 ? "round" : "butt"}
                    style={{ transition: `stroke-dasharray .8s cubic-bezier(.4,0,.2,1) ${i * 80}ms` }}
                  />
                ))}
              </svg>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: "var(--content-heavy)", letterSpacing: "-.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{vTotal}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--content-minimal)", marginTop: 3 }}>Headcount</div>
              </div>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingLeft: 12 }}>
              {stats.map(s => (
                <button key={s.label} onClick={() => onOpen(s.filter)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--content-moderate)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1.1 }}>{s.val}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 16 }} />
        </div>
      </Card>
    </Widget>);
}

// ── View B: Headcount + avatars + stat row ──
function TeamsHeadcount({ onOpen }) {
  const { total, present, vTotal, stats, avatars } = useTeamsData(onOpen);
  return (
    <Widget icon="group" title="Teams" action="Team" onAction={onOpen}>
      <Card surface="elev" pad={0} style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--content-minimal)", textTransform: "uppercase", letterSpacing: ".04em" }}>Headcount</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "var(--content-heavy)", letterSpacing: "-.05em", lineHeight: 1, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{vTotal}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", marginBottom: 8 }}>{Math.round(present / total * 100)}% present</div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {avatars.map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 34, height: 34, borderRadius: 999, objectFit: "cover", border: "2px solid white", marginLeft: i === 0 ? 0 : -10, display: "block", flexShrink: 0, position: "relative", zIndex: avatars.length - i }} />
                ))}
                <div style={{ height: 34, minWidth: 34, borderRadius: 999, padding: "0 7px", background: "var(--surface-subtle)", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--content-moderate)", marginLeft: -10, flexShrink: 0, position: "relative", zIndex: 0, whiteSpace: "nowrap" }}>+245</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid var(--stroke-minimal)" }}>
          {stats.map((s, i) => (
            <button key={s.label} onClick={() => onOpen(s.filter)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "14px 4px", background: "none", border: "none", borderLeft: i ? "1px solid var(--stroke-minimal)" : "none", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--content-moderate)", whiteSpace: "nowrap" }}>{s.label}</span>
              <span style={{ width: 20, height: 3, borderRadius: 999, background: s.color, marginTop: 1 }} />
            </button>
          ))}
        </div>
      </Card>
    </Widget>);
}

// Keep Teams as alias for TeamsGauge (backward compat)
const Teams = TeamsGauge;

// ═══════════════════════════════════════════════════════════════
// 5 · RECRUITMENT — pipeline health
// ═══════════════════════════════════════════════════════════════
function Recruitment({ onOpen }) {
  // Change 4: Sr. Backend Engineer → At risk, 8 open, 92 applications
  const roles = [
  { title: "Product Designer",           open: 2, apps: 0,   tone: "off",  ai: "Try hiring remotely and increasing the salary range to attract more applicants." },
  { title: "Engineering Manager, Platform", open: 1, apps: 18,  tone: "risk" },
  { title: "Sr. Backend Engineer",        open: 8, apps: 92,  tone: "risk" }];  // Change 4

  // Change 5: show 379 with "20 Openings" — no "of 400"
  const cvs = 379, openings = 20;
  const cvPct = Math.round(cvs / (cvs + 21) * 100); // proportional bar
  const cuCvs = useCountUp(379, { duration: 1000 });

  const { expanded, ref: sectionRef } = useStackReveal();

  // Change 3: Remove "AI:" prefix — just show the comment text
  const RoleRow = ({ r, divider }) => (
    <div style={{ padding: "12px 0", borderTop: divider ? "1px solid var(--stroke-minimal)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
          <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{r.open} open · {r.apps} {r.apps === 1 ? "application" : "applications"}</div>
        </div>
        <Signal tone={r.tone} />
      </div>
      {r.ai &&
      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 9, padding: "8px 10px", borderRadius: 10, background: "var(--sky-light)" }}>
          <Icon name="ai_sparkle" size={13} color="var(--sky)" style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--sky-ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.ai}</span>
        </div>
      }
    </div>
  );

  return (
    <Widget
      icon="id" title="Recruitment" action="View all" onAction={onOpen}>{/* Change 1: removed "1 urgent"; Change 6: "View all" */}

      <div ref={sectionRef} style={{ position: "relative", paddingBottom: expanded ? 0 : 18, transition: "padding-bottom .5s cubic-bezier(.4,0,.2,1)" }}>

        {/* Peek — back */}
        <div style={{ position: "absolute", bottom: 0, left: 12, right: 12, height: 22, background: "var(--surface-subtle)", borderRadius: 16, border: "1px solid var(--stroke-minimal)", opacity: expanded ? 0 : 1, transform: `scaleX(${expanded ? 0.9 : 1})`, transition: expanded ? "opacity .25s ease, transform .35s ease" : "opacity .35s ease 280ms, transform .4s ease 280ms", pointerEvents: "none", zIndex: 1 }} />
        {/* Peek — middle */}
        <div style={{ position: "absolute", bottom: 9, left: 6, right: 6, height: 22, background: "var(--surface-minimal)", borderRadius: 16, border: "1px solid var(--stroke-minimal)", boxShadow: "0 1px 4px rgba(15,23,42,.06)", opacity: expanded ? 0 : 1, transform: `scaleX(${expanded ? 0.95 : 1})`, transition: expanded ? "opacity .25s ease, transform .35s ease" : "opacity .35s ease 200ms, transform .4s ease 200ms", pointerEvents: "none", zIndex: 2 }} />

        {/* Foreground card */}
        <div style={{ position: "relative", zIndex: 3, background: "var(--surface-minimal)", borderRadius: 16, border: "1px solid var(--stroke-minimal)", boxShadow: "0 2px 10px rgba(15,23,42,.08)", overflow: "hidden", padding: 16 }}>

          {/* CVs header — 379 applications · 20 Openings chip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--content-minimal)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Applications received</span>
            <Trend dir="up">12%</Trend>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 5 }}>
            <span ref={cuCvs.ref} style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.02em", color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{cuCvs.display}</span>
            {/* Change 5: "20 Openings" badge instead of "of 400" */}
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--content-moderate)", background: "var(--surface-subtle)", borderRadius: 999, padding: "2px 9px", letterSpacing: "-.01em" }}>{openings} openings</span>
          </div>
          <div style={{ height: 1, background: "var(--stroke-minimal)", marginTop: 14 }} />

          {/* All 3 roles — expand on scroll (Change 2: Product Designer also animates) */}
          {roles.map((r, i) => (
            <div key={r.title} style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", transition: expanded ? `grid-template-rows .48s cubic-bezier(.4,0,.2,1) ${i * 70}ms` : `grid-template-rows .38s cubic-bezier(.4,0,1,1) ${(2 - i) * 50}ms` }}>
              <div style={{ minHeight: 0 }}>
                <div style={{ opacity: expanded ? 1 : 0, transform: expanded ? "translateY(0)" : "translateY(-8px)", transition: expanded ? `opacity .38s ease ${i * 70 + 120}ms, transform .42s cubic-bezier(.4,0,.2,1) ${i * 70 + 80}ms` : "opacity .22s ease 0ms, transform .28s ease 0ms" }}>
                  <RoleRow r={r} divider={i > 0} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>);
}

// ═══════════════════════════════════════════════════════════════
// 6 · UPCOMING BOOKINGS — next 2 weighty events
// ═══════════════════════════════════════════════════════════════
function Bookings({ onOpen }) {
  const events = [
  { time: "10:00", ampm: "AM", type: "Meeting", icon: "analytics", tone: "var(--reliance-base)", title: "Q2 Leadership Review", sub: "You present · 6 attendees", soon: "in 1h 8m" },
  { time: "2:30",  ampm: "PM", type: "Meeting", icon: "group", tone: "var(--content-moderate)", title: "1:1 with Karan Mehta", sub: "Platform team · 30 min", soon: null },
  { time: "6:30",  ampm: "PM", type: "Gym",     icon: "time",      tone: "var(--positive)", title: "Gym slot booked", sub: "Level 2 · 45 min", soon: null }];

  // ── Bidirectional scroll animation ──
  const { expanded, ref: sectionRef } = useStackReveal();

  const EventRow = ({ e, i }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 13px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none", background: "var(--surface-minimal)" }}>
      <div style={{ width: 54, flexShrink: 0, textAlign: "center", padding: "8px 0", borderRadius: 11, background: i === 0 ? "var(--reliance-base)" : "var(--surface-subtle)", color: i === 0 ? "#fff" : "var(--content-heavy)" }}>
        <div style={{ fontSize: 16, fontWeight: 900, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>{e.time}</div>
        <div style={{ fontSize: 10.5, fontWeight: 700, opacity: i === 0 ? .85 : .6, marginTop: 1 }}>{e.ampm}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: e.tone, textTransform: "uppercase", letterSpacing: ".03em" }}>
          <Icon name={e.icon} size={13} color={e.tone} />{e.type}
        </span>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", letterSpacing: "-.01em", marginTop: 3 }}>{e.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2 }}>{e.sub}</div>
      </div>
      {e.soon && <Signal tone="info" dot={false}>{e.soon}</Signal>}
    </div>
  );

  return (
    <Widget icon="calendar" title="Upcoming" action="Calendar" onAction={onOpen}>

      <div ref={sectionRef} style={{ position: "relative", paddingBottom: expanded ? 0 : 18, transition: "padding-bottom .5s cubic-bezier(.4,0,.2,1)" }}>

        {/* Peek — back */}
        <div style={{ position: "absolute", bottom: 0, left: 12, right: 12, height: 22, background: "var(--surface-subtle)", borderRadius: 16, border: "1px solid var(--stroke-minimal)", opacity: expanded ? 0 : 1, transform: `scaleX(${expanded ? 0.9 : 1})`, transition: expanded ? "opacity .25s ease, transform .35s ease" : "opacity .35s ease 280ms, transform .4s ease 280ms", pointerEvents: "none", zIndex: 1 }} />
        {/* Peek — middle */}
        <div style={{ position: "absolute", bottom: 9, left: 6, right: 6, height: 22, background: "var(--surface-minimal)", borderRadius: 16, border: "1px solid var(--stroke-minimal)", boxShadow: "0 1px 4px rgba(15,23,42,.06)", opacity: expanded ? 0 : 1, transform: `scaleX(${expanded ? 0.95 : 1})`, transition: expanded ? "opacity .25s ease, transform .35s ease" : "opacity .35s ease 200ms, transform .4s ease 200ms", pointerEvents: "none", zIndex: 2 }} />

        {/* Foreground card */}
        <div style={{ position: "relative", zIndex: 3, background: "var(--surface-minimal)", borderRadius: 16, border: "1px solid var(--stroke-minimal)", boxShadow: "0 2px 10px rgba(15,23,42,.08)", overflow: "hidden" }}>

          {/* Event 1 — always visible */}
          <EventRow e={events[0]} i={0} />

          {/* Events 2+3 — expand on scroll */}
          {events.slice(1).map((e, i) => (
            <div key={e.title} style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", transition: expanded ? `grid-template-rows .48s cubic-bezier(.4,0,.2,1) ${i * 70}ms` : `grid-template-rows .38s cubic-bezier(.4,0,1,1) ${(1 - i) * 50}ms` }}>
              <div style={{ minHeight: 0 }}>
                <div style={{ opacity: expanded ? 1 : 0, transform: expanded ? "translateY(0)" : "translateY(-8px)", transition: expanded ? `opacity .38s ease ${i * 70 + 160}ms, transform .42s cubic-bezier(.4,0,.2,1) ${i * 70 + 110}ms` : "opacity .22s ease 0ms, transform .28s ease 0ms" }}>
                  <EventRow e={e} i={i + 1} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>);
}

// ═══════════════════════════════════════════════════════════════
// 7 · NEWS & UPDATES — a trusted colleague's morning note
// ═══════════════════════════════════════════════════════════════
function News({ onOpen, onWish }) {
  // ── Bidirectional scroll animation ──
  const { expanded, ref: sectionRef } = useStackReveal();
  const [showCeleb, setShowCeleb] = React.useState(false);

  const items = [
  { tag: "Policy", tone: "var(--warning)", title: "Hybrid work policy starts Monday", body: "2 of your remote teams need a desk plan." },
  { tag: "People", tone: "var(--sky)", title: "Sana is back from leave today", body: "She rejoins the Design team after 4 months." }];

  const celebs = [
  { name: "Karan Mehta", note: "Platform · Birthday", initials: "KM" },
  { name: "Aanya Verma", note: "Design · 5 years at Reliance Jio", initials: "AV" },
  { name: "Devansh Roy", note: "QA · Birthday", initials: "DR" },
  { name: "Priya Nair", note: "Backend · 3 years at Reliance Jio", initials: "PN" },
  { name: "Imran Khan", note: "Data · Birthday", initials: "IK" }];

  const wish = (n) => onWish ? onWish(n) : null;

  const NewsRow = ({ n, divider }) => (
    <div style={{ display: "flex", gap: 11, padding: "14px 14px", borderTop: divider ? "1px solid var(--stroke-minimal)" : "none", background: "var(--surface-minimal)" }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: n.tone, flexShrink: 0, marginTop: 5 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: n.tone, textTransform: "uppercase", letterSpacing: ".04em" }}>{n.tag}</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", marginTop: 2, letterSpacing: "-.01em", lineHeight: 1.3 }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2, lineHeight: 1.4, textWrap: "pretty" }}>{n.body}</div>
      </div>
    </div>
  );

  return (
    <Widget icon="flag" title="News & updates" action="All updates" onAction={onOpen}>

      {/* ── Stacked card: peek behind → auto-expands on scroll ── */}
      <div ref={sectionRef} style={{
        position: "relative",
        paddingBottom: expanded ? 0 : 18,
        transition: "padding-bottom .5s cubic-bezier(.4,0,.2,1)"
      }}>

        {/* Back peek card — furthest */}
        <div style={{
          position: "absolute", bottom: 0, left: 12, right: 12, height: 22,
          background: "var(--surface-subtle)", borderRadius: 16,
          border: "1px solid var(--stroke-minimal)",
          opacity: expanded ? 0 : 1,
          transform: `scaleX(${expanded ? 0.9 : 1})`,
          transition: expanded
            ? "opacity .25s ease 0ms, transform .35s ease 0ms"
            : "opacity .35s ease 280ms, transform .4s ease 280ms",
          pointerEvents: "none", zIndex: 1
        }} />

        {/* Middle peek card */}
        <div style={{
          position: "absolute", bottom: 9, left: 6, right: 6, height: 22,
          background: "var(--surface-minimal)", borderRadius: 16,
          border: "1px solid var(--stroke-minimal)",
          boxShadow: "0 1px 4px rgba(15,23,42,.06)",
          opacity: expanded ? 0 : 1,
          transform: `scaleX(${expanded ? 0.95 : 1})`,
          transition: expanded
            ? "opacity .25s ease 0ms, transform .35s ease 0ms"
            : "opacity .35s ease 200ms, transform .4s ease 200ms",
          pointerEvents: "none", zIndex: 2
        }} />

        {/* Foreground card — always on top */}
        <div style={{
          position: "relative", zIndex: 3,
          background: "var(--surface-minimal)",
          borderRadius: 16,
          border: "1px solid var(--stroke-minimal)",
          boxShadow: "0 2px 10px rgba(15,23,42,.08)",
          overflow: "hidden",
        }}>

          {/* Item 1 — always visible */}
          <NewsRow n={items[0]} divider={false} />

          {/* Item 2 — expands on scroll-in, collapses on scroll-out */}
          <div style={{
            display: "grid",
            gridTemplateRows: expanded ? "1fr" : "0fr",
            transition: expanded
              ? "grid-template-rows .48s cubic-bezier(.4,0,.2,1) 0ms"
              : "grid-template-rows .38s cubic-bezier(.4,0,1,1) 60ms",
          }}>
            <div style={{ minHeight: 0 }}>
              <div style={{
                opacity: expanded ? 1 : 0,
                transform: expanded ? "translateY(0)" : "translateY(-8px)",
                transition: expanded
                  ? "opacity .38s ease 160ms, transform .42s cubic-bezier(.4,0,.2,1) 110ms"
                  : "opacity .25s ease 0ms, transform .3s ease 0ms",
              }}>
                <NewsRow n={items[1]} divider={true} />
              </div>
            </div>
          </div>

          {/* Celebrations row — expands after item 2, collapses first */}
          <div style={{
            display: "grid",
            gridTemplateRows: expanded ? "1fr" : "0fr",
            transition: expanded
              ? "grid-template-rows .48s cubic-bezier(.4,0,.2,1) 80ms"
              : "grid-template-rows .38s cubic-bezier(.4,0,1,1) 0ms",
          }}>
            <div style={{ minHeight: 0 }}>
              <div style={{
                opacity: expanded ? 1 : 0,
                transform: expanded ? "translateY(0)" : "translateY(-8px)",
                transition: expanded
                  ? "opacity .38s ease 250ms, transform .42s cubic-bezier(.4,0,.2,1) 200ms"
                  : "opacity .22s ease 0ms, transform .28s ease 0ms",
              }}>
                <button onClick={() => setShowCeleb((v) => !v)} style={{ width: "100%", display: "flex", gap: 11, padding: "14px 14px", borderTop: "1px solid var(--stroke-minimal)", background: "none", border: "none", borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--stroke-minimal)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--sky)", flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--sky)", textTransform: "uppercase", letterSpacing: ".04em" }}>Celebrations</div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", marginTop: 2, letterSpacing: "-.01em", lineHeight: 1.3 }}>5 birthdays & anniversaries today</div>
                    <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2, lineHeight: 1.4 }}>Tap to see who and send a wish</div>
                  </div>
                  <Icon name={showCeleb ? "chevron_up" : "chevron_down"} size={18} color="var(--content-minimal)" style={{ marginTop: 2 }} />
                </button>
                {showCeleb && celebs.map((b) =>
                <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderTop: "1px solid var(--stroke-minimal)", background: "var(--surface-subtle)" }}>
                    <span style={{ width: 36, height: 36, borderRadius: 999, background: "var(--sky-light)", color: "var(--sky-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{b.initials}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--content-heavy)" }}>{b.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 1 }}>{b.note}</div>
                    </div>
                    <Button size="s" variant="skyghost" icon="gift" onClick={() => wish(b.name)}>Wish</Button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Widget>);
}

// ═══════════════════════════════════════════════════════════════
// EXPENSE & BUDGET (leader only) — real-time spend vs plan
// All figures reconcile: categories sum to total; travel split sums to travel.
// ═══════════════════════════════════════════════════════════════
function ExpenseBudget({ onOpen }) {
  const pct = 83,pace = 79; // spent ₹86L of ₹104L plan; expected pace 79%
  // Travel ₹35L → Domestic ₹17.1L (49%) + International ₹17.9L (51%) = ₹35.0L
  const domPct = 49,intlPct = 51;
  const cats = [
  { label: "Team travel", value: "₹35L", tone: "risk", note: "+8% vs plan" },
  { label: "Contractors", value: "₹24L", tone: "healthy", note: "Under plan" },
  { label: "Tooling & SaaS", value: "₹17L", tone: "healthy", note: "On plan" },
  { label: "Training & events", value: "₹10L", tone: "off", note: "+15% vs plan" }];

  // Critical (off) first, then at-risk, then healthy
  const toneRank = { off: 0, risk: 1, healthy: 2 };
  cats.sort((a, b) => toneRank[a.tone] - toneRank[b.tone]);

  const noteColor = (t) => t === "healthy" ? "var(--positive)" : t === "risk" ? "var(--warning)" : "var(--negative)";

  return (
    <Widget title="Expense & budget" action="Breakdown" onAction={onOpen}>
      <Card surface="elev" pad={16}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--content-minimal)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Q2 spend vs plan</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 900, lineHeight: .9, letterSpacing: "-.03em", color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums" }}>₹86L</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--content-minimal)" }}>of ₹1.04 Cr</span>
            </div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--surface-subtle)", marginTop: 13, overflow: "hidden" }}>
          <div className="anim-bar" style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "var(--reliance-base)" }} />
        </div>

        {/* AI recommendation — light sky */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "var(--sky-light)" }}>
          <Icon name="ai_sparkle" size={16} color="var(--sky)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-heavy)", lineHeight: 1.35 }}>
            {pct - pace}% over plan · <span style={{ color: "var(--sky-ink)" }}>team travel is the main driver</span>
          </span>
        </div>

        <div style={{ marginTop: 4 }}>
          {cats.map((c) =>
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0 0" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--content-heavy)", flex: 1 }}>{c.label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-moderate)", fontVariantNumeric: "tabular-nums" }}>{c.value}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: noteColor(c.tone), width: 92, textAlign: "right" }}>{c.note}</span>
            </div>
          )}
        </div>
      </Card>
    </Widget>);

}

Object.assign(window, {
  AIBriefing, Performance, CriticalProjectsCards, ExpenseBudget, ExpenseBudgetBars, ActionItems, TeamSnapshot, Teams, TeamsGauge, TeamsHeadcount, Recruitment, Bookings, News
});

// ═══════════════════════════════════════════════════════════════
// EXPENSE & BUDGET (bar-graph variant) — same data, vertical bars
// ═══════════════════════════════════════════════════════════════
function ExpenseBudgetBars({ onOpen }) {
  const cuSpent = useCountUp(86, { prefix: '₹', suffix: 'L', duration: 1000 });
  const pct = 83, pace = 79, spent = 86, plan = 104;
  // Ordered: most critical first (Travel red, Training orange, then healthy)
  const cats = [
  { label: "Travel", value: 35, display: "₹35L", tone: "off", note: "+11% over" },
  { label: "Training", value: 10, display: "₹10L", tone: "off", note: "+8% over", fullBar: true },
  { label: "Contractors", value: 24, display: "₹24L", tone: "healthy", note: "On track" },
  { label: "Tooling", value: 17, display: "₹17L", tone: "healthy", note: "On track" }];

  const barColor = (t) => t === "healthy" ? "var(--positive)" : t === "risk" ? "var(--warning)" : "var(--negative)";
  const noteColor = (t) => t === "healthy" ? "var(--content-minimal)" : t === "risk" ? "var(--warning)" : "var(--negative)";
  const max = Math.max(...cats.map((c) => c.value));
  const total = cats.reduce((s, c) => s + c.value, 0);

  // IntersectionObserver-driven bar animation (smooth CSS transition, not keyframe)
  const [barsIn, setBarsIn] = React.useState(false);
  const barsRef = React.useRef(null);
  React.useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setBarsIn(true); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Widget title="Expense & Budget" action="Breakdown" onAction={onOpen}>
      <Card surface="elev" pad={18}>
        {/* Header: spend vs plan with a small composition pie */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--content-minimal)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".03em" }}>Q2 spend</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 7 }}>
              <span ref={cuSpent.ref} style={{ fontSize: 32, fontWeight: 900, lineHeight: .9, letterSpacing: "-.03em", color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums" }}>{cuSpent.display}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--content-minimal)" }}>of ₹1.04 Cr</span>
            </div>
          </div>
          {/* Pie: 2 colours — Blue (₹86L spent) + Grey (₹18L remaining) */}
          {(() => {
            const spentPct = (86 / 104 * 100).toFixed(1);
            return <span style={{
              width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
              background: `conic-gradient(var(--reliance-base) 0% ${spentPct}%, #D1D5DB ${spentPct}% 100%)`,
              WebkitMaskImage: "radial-gradient(circle, transparent 40%, #000 41%)",
              maskImage: "radial-gradient(circle, transparent 40%, #000 41%)"
            }} />;
          })()}
        </div>

        {/* Horizontal bar list */}
        <div ref={barsRef} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {cats.map((c, i) =>
          <div key={c.label}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: barColor(c.tone), flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-heavy)", flex: 1, letterSpacing: "-.01em" }}>{c.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: noteColor(c.tone), whiteSpace: "nowrap" }}>{c.note}</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", minWidth: 42, textAlign: "right" }}>{c.display}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--surface-subtle)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 999, background: barColor(c.tone),
                  width: barsIn ? (c.fullBar ? "100%" : `${c.value / max * 100}%`) : "0%",
                  transition: `width .75s cubic-bezier(.4,0,.2,1) ${i * 90}ms`
                }} />
              </div>
            </div>
          )}
        </div>

        {/* AI comment — at the bottom, below Tooling */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 16, padding: "8px 10px", borderRadius: 10, background: "var(--sky-light)" }}>
          <Icon name="ai_sparkle" size={13} color="var(--sky)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--sky-ink)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            International travel driving 51% of overspend. Cap cross-border approvals in Q3.
          </span>
        </div>
      </Card>
    </Widget>);

}

Object.assign(window, { ExpenseBudgetBars });

// ═══════════════════════════════════════════════════════════════
// EXPENSE & BUDGET (donut variant) — composition of spend
// ═══════════════════════════════════════════════════════════════
function ExpenseBudgetDonut({ onOpen }) {
  const pct = 83, pace = 79;
  const cats = [
  { label: "Travel", value: 35, display: "₹35L", tone: "risk", note: "+8%" },
  { label: "Contractors", value: 24, display: "₹24L", tone: "healthy", note: "On track" },
  { label: "Tooling", value: 17, display: "₹17L", tone: "healthy", note: "On track" },
  { label: "Training", value: 10, display: "₹10L", tone: "off", note: "+15%" }];

  const toneRank = { off: 0, risk: 1, healthy: 2 };
  cats.sort((a, b) => toneRank[a.tone] - toneRank[b.tone]);
  const color = (t) => t === "healthy" ? "var(--positive)" : t === "risk" ? "var(--warning)" : "var(--negative)";
  const noteColor = (t) => t === "healthy" ? "var(--content-minimal)" : t === "risk" ? "var(--warning)" : "var(--negative)";
  const total = cats.reduce((s, c) => s + c.value, 0);

  // donut geometry
  const size = 108, stroke = 16, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = cats.map((c) => {
    const len = c.value / total * circ;
    const seg = { c, len, dashoffset: -offset };
    offset += len;
    return seg;
  });

  return (
    <Widget title="Expense by category" action="Breakdown" onAction={onOpen}>
      <Card surface="elev" pad={18}>
        {/* AI recommendation — light sky */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 12, background: "var(--sky-light)" }}>
          <Icon name="ai_sparkle" size={16} color="var(--sky)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-heavy)", lineHeight: 1.35 }}>
            {pct - pace}% over plan · <span style={{ color: "var(--sky-ink)" }}>team travel is the main driver</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16 }}>
          {/* donut */}
          <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
              {segs.map((s, i) =>
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color(s.c.tone)} strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, s.len - 2)} ${circ - Math.max(0, s.len - 2)}`}
                strokeDashoffset={s.dashoffset} />
              )}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "var(--content-heavy)", letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>₹86L</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--content-minimal)", marginTop: 2 }}>of ₹1.04 Cr</span>
            </div>
          </div>
          {/* legend */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {cats.map((c) =>
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: color(c.tone), flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-heavy)", flex: 1, letterSpacing: "-.01em" }}>{c.label}</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: noteColor(c.tone), whiteSpace: "nowrap" }}>{c.note}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", minWidth: 40, textAlign: "right" }}>{c.display}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Widget>);

}

Object.assign(window, { ExpenseBudgetDonut });