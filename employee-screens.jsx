/* global React, Icon, ColorIcon, Button, Card, Signal, Dot, ScreenHeader, TaskRow, PRIO, fmtTime */
const { useState: useStateES } = React;

// ═══════════════════════════════════════════════════════════════
// TASKS SCREEN
// ═══════════════════════════════════════════════════════════════
function TasksScreen({ onBack, tasks, onToggle, onNew }) {
  const order = { high: 0, med: 1, low: 2 };
  const open = [...tasks.filter((t) => !t.done)].sort((a, b) => order[a.priority] - order[b.priority]);
  const done = tasks.filter((t) => t.done);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-subtle)" }}>
      <ScreenHeader title="Tasks" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 28px" }}>
        <Button variant="primary" size="m" full icon="add" onClick={onNew} style={{ marginBottom: 16 }}>New task</Button>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>To do · {open.length}</div>
        <Card surface="elev" pad={4}>
          {open.map((t, i) => <TaskRow key={t.id} t={t} onToggle={onToggle} divider={i > 0} />)}
          {open.length === 0 && <div style={{ padding: "20px", textAlign: "center", fontSize: 13.5, color: "var(--content-moderate)", fontWeight: 600 }}>All clear. Nice work.</div>}
        </Card>
        {done.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>Done · {done.length}</div>
            <Card surface="elev" pad={4}>
              {done.map((t, i) => <TaskRow key={t.id} t={t} onToggle={onToggle} divider={i > 0} />)}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LEAVE SCREEN
// ═══════════════════════════════════════════════════════════════
function LeaveScreen({ onBack }) {
  const cats = [
    { label: "Casual", left: 6, total: 12, fg: "var(--sky)" },
    { label: "Earned", left: 14, total: 18, fg: "var(--positive)" },
    { label: "Sick", left: 5, total: 8, fg: "var(--warning)" },
  ];
  const history = [
    { range: "12–13 Jun", type: "Casual · 2 days", status: "approved" },
    { range: "24 May", type: "Sick · 1 day", status: "approved" },
    { range: "2–6 Jul", type: "Earned · 5 days", status: "pending" },
  ];
  const stat = { approved: { fg: "var(--positive)", bg: "var(--positive-light)", t: "Approved" }, pending: { fg: "var(--warning)", bg: "var(--warning-light)", t: "Pending" } };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-subtle)" }}>
      <ScreenHeader title="Leave" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 28px" }}>
        <Card surface="elev" pad={16}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {cats.map((c) => (
              <div key={c.label} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
                  <span style={{ fontSize: 30, fontWeight: 900, color: c.fg, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{c.left}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--content-minimal)" }}>/{c.total}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-moderate)", marginTop: 6 }}>{c.label}</div>
              </div>
            ))}
          </div>
          <Button variant="primary" size="m" full style={{ marginTop: 15 }} icon="calendar">Apply for leave</Button>
        </Card>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>Recent applications</div>
          <Card surface="elev" pad={4}>
            {history.map((h, i) => (
              <div key={h.range} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 13px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="calendar" size={18} color="var(--content-moderate)" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)" }}>{h.range}</div>
                  <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 1 }}>{h.type}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: stat[h.status].fg, background: stat[h.status].bg, padding: "3px 10px", borderRadius: 999 }}>{stat[h.status].t}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAY SCREEN
// ═══════════════════════════════════════════════════════════════
function PayScreen({ onBack }) {
  const slips = [
    { m: "May 2026", net: "₹1,42,380", ready: true },
    { m: "April 2026", net: "₹1,42,380", ready: false },
    { m: "March 2026", net: "₹1,40,110", ready: false },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-subtle)" }}>
      <ScreenHeader title="Pay & benefits" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 28px" }}>
        <Card surface="elev" pad={18}>
          <div style={{ fontSize: 12.5, color: "var(--content-moderate)", fontWeight: 600 }}>Latest net pay · May 2026</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", marginTop: 5 }}>₹1,42,380</div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Button variant="primary" size="m" full icon="download">Download payslip</Button>
            <Button variant="secondary" size="m" icon="document">Breakdown</Button>
          </div>
        </Card>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>Needs attention</div>
          <Card surface="elev" pad={4}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 13px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--sky-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="card" size={17} color="var(--sky)" /></span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-heavy)" }}>Reimbursement pending</div><div style={{ fontSize: 12, color: "var(--content-moderate)", marginTop: 1 }}>Travel claim · ₹3,200</div></div>
              <Icon name="chevron_right" size={17} color="var(--content-minimal)" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", borderTop: "1px solid var(--stroke-minimal)" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--warning-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="document" size={17} color="var(--warning)" /></span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-heavy)" }}>Tax declaration due</div><div style={{ fontSize: 12, color: "var(--content-moderate)", marginTop: 1 }}>Submit by 15 Jun</div></div>
              <Icon name="chevron_right" size={17} color="var(--content-minimal)" />
            </div>
          </Card>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>Payslips</div>
          <Card surface="elev" pad={4}>
            {slips.map((s, i) => (
              <div key={s.m} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 13px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="document" size={18} color="var(--content-moderate)" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)" }}>{s.m}</div>
                  <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 1, fontVariantNumeric: "tabular-nums" }}>Net {s.net}</div>
                </div>
                <button aria-label="Download" style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--stroke-minimal)", background: "var(--surface-minimal)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><Icon name="download" size={17} color="var(--reliance-base)" /></button>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE SCREEN
// ═══════════════════════════════════════════════════════════════
function AttendanceScreen({ onBack, att }) {
  const fmt = (ms) => { const d = new Date(ms); let h = d.getHours(), m = d.getMinutes(); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${String(m).padStart(2, "0")} ${ap}`; };
  const durMin = att.inAt ? Math.max(0, Math.floor(((att.outAt || Date.now()) - att.inAt) / 60000)) : 0;
  const todayStatus = att.status === "out" ? "Not marked in" : att.status === "in" ? `In since ${fmt(att.inAt)}` : `${fmt(att.inAt)} – ${fmt(att.outAt)}`;
  const history = [
    { day: "Thu 30 May", in: "9:18 AM", out: "6:40 PM", dur: "9h 22m", tone: "ok" },
    { day: "Wed 29 May", in: "9:05 AM", out: "7:02 PM", dur: "9h 57m", tone: "ok" },
    { day: "Tue 28 May", in: "9:31 AM", out: "6:12 PM", dur: "8h 41m", tone: "ok" },
    { day: "Mon 27 May", in: "—", out: "—", dur: "On leave", tone: "leave" },
    { day: "Fri 24 May", in: "9:12 AM", out: "6:30 PM", dur: "9h 18m", tone: "ok" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-subtle)" }}>
      <ScreenHeader title="Attendance" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 28px" }}>
        <Card surface="elev" pad={16}>
          <div style={{ display: "flex", gap: 10 }}>
            {[["Present", "21", "var(--positive)"], ["Avg hours", "9h 14m", "var(--content-heavy)"], ["Late", "2", "var(--warning)"]].map(([l, v, c], i) => (
              <div key={l} style={{ flex: 1, textAlign: "center", borderLeft: i ? "1px solid var(--stroke-minimal)" : "none" }}>
                <div style={{ fontSize: 21, fontWeight: 900, color: c, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11.5, color: "var(--content-moderate)", fontWeight: 600, marginTop: 5 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: 12, background: "var(--sky-light)", display: "flex", alignItems: "center", gap: 9 }}>
            <Icon name="time" size={17} color="var(--sky-ink)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--sky-ink)" }}>Today · {todayStatus}</span>
          </div>
        </Card>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>This month</div>
          <Card surface="elev" pad={4}>
            {history.map((h, i) => (
              <div key={h.day} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 13px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)" }}>{h.day}</div>
                  <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{h.tone === "leave" ? "—" : `${h.in} – ${h.out}`}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: h.tone === "leave" ? "var(--sky-ink)" : "var(--content-heavy)", fontVariantNumeric: "tabular-nums", background: h.tone === "leave" ? "var(--sky-light)" : "transparent", padding: h.tone === "leave" ? "3px 10px" : 0, borderRadius: 999 }}>{h.dur}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PERSONA SWITCHER + UNIFIED MORE / PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════
const PROFILES = {
  leader:   { name: "Vikram Menon", role: "VP, Engineering & Delivery", initials: "VM", tag: "Leader" },
  employee: { name: "Priya Sharma", role: "Senior Designer · Design", initials: "PS", tag: "Employee" },
};

function PersonaSwitcher({ persona, onSwitch }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="swap" size={15} color="var(--content-moderate)" />Viewing as
      </div>
      <Card surface="elev" pad={4}>
        {Object.entries(PROFILES).map(([key, p], i) => {
          const on = persona === key;
          return (
            <button key={key} onClick={() => onSwitch(key)} style={{
              width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 12, padding: "13px 13px",
              border: "none", borderTop: i ? "1px solid var(--stroke-minimal)" : "none",
              background: on ? "var(--sky-light)" : "transparent",
            }}>
              <span style={{ width: 42, height: 42, borderRadius: 999, background: on ? "var(--sky)" : "var(--reliance-base)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{p.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", letterSpacing: "-.01em" }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 1 }}>{p.tag} · {p.role}</div>
              </div>
              {on
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--sky-ink)" }}><Icon name="confirm" size={15} color="var(--sky-ink)" />Active</span>
                : <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--reliance-base)" }}>Switch</span>}
            </button>
          );
        })}
      </Card>
      <div style={{ fontSize: 12, color: "var(--content-minimal)", padding: "9px 4px 0", lineHeight: 1.4 }}>Demo control — switch between the Leader and Employee home experiences.</div>
    </div>
  );
}

// ── Widgets section with expandable rows ──
function WidgetsSection({ leaderWidgets, isOn, toggle, Icon, Card, Toggle }) {
  const [expanded, setExpanded] = React.useState({});
  const toggleExpand = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 10px" }}>Dashboard widgets</div>
      <Card surface="elev" pad={4}>
        {leaderWidgets.map((w, i) => (
          <div key={w.key}>
            {/* Main row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none" }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: w.children ? "var(--reliance-50)" : (isOn(w.key) ? "var(--reliance-50)" : "var(--surface-subtle)"),
                display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s ease"
              }}>
                <Icon name={w.icon} size={18} color={w.children ? "var(--reliance-base)" : (isOn(w.key) ? "var(--reliance-base)" : "var(--content-minimal)")} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--content-heavy)", letterSpacing: "-.01em" }}>{w.label}</div>
                <div style={{ fontSize: 12, color: "var(--content-minimal)", marginTop: 1 }}>{w.desc}</div>
              </div>
              {w.children ? (
                /* Expandable — show chevron */
                <button onClick={() => toggleExpand(w.key)} style={{ width: 32, height: 32, borderRadius: 999, border: "none", background: "var(--surface-subtle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={expanded[w.key] ? "chevron_up" : "chevron_down"} size={16} color="var(--content-moderate)" />
                </button>
              ) : (
                <Toggle on={isOn(w.key)} onToggle={() => toggle(w.key)} />
              )}
            </div>

            {/* Sub-options (expanded) */}
            {w.children && expanded[w.key] && (
              <div style={{ background: "var(--surface-subtle)", borderTop: "1px solid var(--stroke-minimal)" }}>
                {w.children.map((child, ci) => (
                  <div key={child.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px 11px 62px", borderTop: ci ? "1px solid var(--stroke-minimal)" : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: isOn(child.key, child.def) ? "var(--content-heavy)" : "var(--content-moderate)", letterSpacing: "-.01em" }}>{child.label}</div>
                      <div style={{ fontSize: 11.5, color: "var(--content-minimal)", marginTop: 1 }}>{child.desc}</div>
                    </div>
                    <Toggle on={isOn(child.key, child.def)} onToggle={() => toggle(child.key)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

function MoreScreen({ onBack, persona, onSwitch, onRow, wCfg = {}, updateWCfg, wOn }) {
  const isOn = (key, def = true) => wOn ? wOn(key, def) : (wCfg[key] === undefined ? def : wCfg[key]);
  const toggle = (key) => updateWCfg && updateWCfg(key, !isOn(key));

  // Toggle pill switch component
  const Toggle = ({ on, onToggle }) => (
    React.createElement('button', {
      onClick: onToggle,
      style: {
        width: 42, height: 24, borderRadius: 999, padding: "2px",
        background: on ? "var(--reliance-base)" : "var(--stroke-heavy)",
        border: "none", cursor: "pointer", flexShrink: 0,
        transition: "background .2s ease",
        display: "flex", alignItems: "center",
        justifyContent: on ? "flex-end" : "flex-start"
      }
    }, React.createElement('span', {
      style: {
        width: 20, height: 20, borderRadius: 999, background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        transition: "all .2s ease", display: "block"
      }
    }))
  );

  // Leader widgets list — items with `children` are expandable
  const leaderWidgets = [
    {
      key: "projects_group", icon: "analytics", label: "Critical Projects", desc: "Project pipeline overview",
      children: [
        { key: "projects_carousel", label: "Carousel view",       desc: "Sticky summary + swipeable cards", def: true },
        { key: "projects_cards",    label: "Summary + Cards",     desc: "Stats strip + business-focused cards", def: false },
      ]
    },
    { key: "expense",     icon: "card",      label: "Expense & Budget",   desc: "Category bars + pie chart" },
    { key: "approvals",   icon: "confirm",   label: "Approvals",          desc: "Pending approval queue" },
    {
      key: "teams_group", icon: "group", label: "Teams", desc: "Attendance breakdown",
      children: [
        { key: "teams_gauge",     label: "Gauge view",     desc: "Semicircle + 2×2 grid", def: true },
        { key: "teams_headcount", label: "Headcount view", desc: "Large number + avatars", def: false },
      ]
    },
    { key: "recruitment", icon: "id",        label: "Recruitment",        desc: "Pipeline health by role" },
    { key: "upcoming",    icon: "calendar",  label: "Upcoming",           desc: "Next meetings & events" },
    { key: "news",        icon: "flag",      label: "News & Updates",     desc: "Policy, people, celebrations" },
  ];

  const p = PROFILES[persona];
  const routes = { "My profile": "profile", "Attendance history": "attendance", "My tasks": "tasks", "Pay & benefits": "pay" };
  const goRow = (label) => onRow && routes[label] && onRow(routes[label]);
  const sections = persona === "leader" ? [
    { head: "You", rows: [["businessman", "Profile & delegation"], ["confirm", "Approval rules"], ["notification", "Notifications"]] },
    { head: "Organisation", rows: [["group", "Org chart"], ["analytics", "Reports & exports"], ["id", "Hiring pipeline"]] },
    { head: "App", rows: [["settings", "Settings"], ["help", "Help & support"], ["logout", "Sign out"]] },
  ] : [
    { head: "You", rows: [["profile", "My profile"], ["calendar", "Attendance history"], ["notification", "Notifications"]] },
    { head: "Work", rows: [["list", "My tasks"], ["rupee", "Pay & benefits"], ["id", "Documents"]] },
    { head: "App", rows: [["settings", "Settings"], ["help", "Help & support"], ["logout", "Sign out"]] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-subtle)" }}>
      <ScreenHeader title="More" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 28px" }}>

        {/* Profile card */}
        <Card surface="elev" pad={16} onClick={() => goRow("My profile")} style={{ display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
          <span style={{ width: 52, height: 52, borderRadius: 999, background: "var(--reliance-base)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, flexShrink: 0 }}>{p.initials}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--content-heavy)", letterSpacing: "-.01em" }}>{p.name}</div>
            <div style={{ fontSize: 13, color: "var(--content-moderate)", marginTop: 1 }}>{p.role}</div>
          </div>
          {persona === "employee" && <Icon name="chevron_right" size={18} color="var(--content-minimal)" />}
        </Card>

        {/* Persona switcher */}
        <div style={{ marginTop: 18 }}>
          <PersonaSwitcher persona={persona} onSwitch={onSwitch} />
        </div>

        {/* ── WIDGETS section (Leader only) ── */}
        {persona === "leader" && React.createElement(WidgetsSection, { leaderWidgets, isOn, toggle, Icon, Card, Toggle })}


        {/* Other sections */}
        {sections.map((s) => (
          <div key={s.head} style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em", color: "var(--content-moderate)", padding: "0 2px 9px" }}>{s.head}</div>
            <Card surface="elev" pad={4}>
              {s.rows.map(([ic, label], i) => (
                <div key={label} onClick={() => goRow(label)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 12px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none", cursor: "pointer" }}>
                  <Icon name={ic} size={20} color={label === "Sign out" ? "var(--negative)" : "var(--content-moderate)"} />
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: label === "Sign out" ? "var(--negative)" : "var(--content-heavy)" }}>{label}</span>
                  {label !== "Sign out" && <Icon name="chevron_right" size={18} color="var(--content-minimal)" />}
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TasksScreen, LeaveScreen, PayScreen, AttendanceScreen, MoreScreen, PersonaSwitcher, PROFILES });
