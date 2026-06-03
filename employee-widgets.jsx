/* global React, Icon, ColorIcon, Button, Card, Signal, Dot, Widget */
const { useState: useStateEmp, useEffect: useEffectEmp } = React;

const fmtTime = (d) => {
  let h = d.getHours(),m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
};

// ═══════════════════════════════════════════════════════════════
// 1 · AI MORNING BRIEF (employee) — warm, personal, curated
// ═══════════════════════════════════════════════════════════════
function EmpBrief({ items, onItem, onOpenAssistant }) {
  return (
    <div style={{
      borderRadius: 20, overflow: "hidden", border: "1px solid var(--sky-border)",
      boxShadow: "0 1px 3px rgba(15,23,42,.05), 0 8px 24px -12px var(--sky-shadow)", background: "var(--surface-minimal)"
    }}>
      <div style={{ background: "linear-gradient(180deg, var(--sky-light) 0%, color-mix(in oklch, var(--sky-light) 55%, white) 100%)", padding: "15px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--sky)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px -1px var(--sky-shadow)" }}>
            <Icon name="ai_sparkle" size={19} color="#fff" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--sky-ink)", letterSpacing: "-.01em" }}>Your morning brief</div>
            <div style={{ fontSize: 11.5, color: "var(--sky-ink)", opacity: .7, fontWeight: 500, marginTop: -1 }}>Put together for you · 8:52am</div>
          </div>
          <button onClick={onOpenAssistant} aria-label="Ask AI" style={{ width: 32, height: 32, borderRadius: 999, border: "1px solid var(--sky-border)", background: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="send_message" size={16} color="var(--sky)" />
          </button>
        </div>
        <p style={{ margin: "13px 2px 2px", fontSize: 16.5, fontWeight: 700, lineHeight: 1.34, color: "var(--content-heavy)", letterSpacing: "-.01em", textWrap: "pretty" }}>
          3 things to keep an eye on today. <span style={{ color: "var(--sky-ink)" }}>Nothing's on fire.</span>
        </p>
      </div>
      <div style={{ padding: "4px 8px 8px" }}>
        {items.map((it, i) =>
        <button key={it.id} onClick={() => onItem(it)} style={{
          width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 12, padding: "13px 8px",
          borderTop: i ? "1px solid var(--stroke-minimal)" : "none"
        }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: it.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={it.icon} size={19} color={it.fg} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--content-heavy)", letterSpacing: "-.01em", lineHeight: 1.3 }}>{it.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2, textWrap: "pretty", lineHeight: 1.35 }}>{it.detail}</div>
            </div>
            <Icon name="chevron_right" size={18} color="var(--content-minimal)" />
          </button>
        )}
      </div>
    </div>);

}

// ═══════════════════════════════════════════════════════════════
// 2 · MARK IN / MARK OUT / DURATION — the daily ritual
// ═══════════════════════════════════════════════════════════════
function Attendance({ att, onMark, onOpen }) {
  const [, tick] = useStateEmp(0);
  useEffectEmp(() => {
    if (att.status !== "in") return;
    const id = setInterval(() => tick((x) => x + 1), 20000);
    return () => clearInterval(id);
  }, [att.status]);

  // Display the actual marked in/out timestamps; tick duration live while in.
  const elapsedMin = (to) => Math.max(0, Math.floor(((to || Date.now()) - att.inAt) / 60000));
  const fmtDur = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;

  const durMin = att.inAt ? elapsedMin(att.outAt) : 0;

  const inVal = att.status === "out" ?
  { txt: "Mark in", color: "var(--positive)", tap: () => onMark("in") } :
  { txt: fmtTime(new Date(att.inAt)), color: "var(--content-heavy)" };
  const outVal = att.status === "done" ?
  { txt: fmtTime(new Date(att.outAt)), color: "var(--content-heavy)" } :
  att.status === "in" ?
  { txt: "Mark out", color: "var(--reliance-base)", tap: () => onMark("out") } :
  { txt: "—", color: "var(--content-minimal)" };
  const durTxt = att.status === "out" ? "—" : fmtDur(durMin);

  const Col = ({ label, value }) =>
  <button onClick={value.tap} disabled={!value.tap} style={{
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0,
    padding: "2px 2px", background: "none", border: "none", fontFamily: "inherit",
    cursor: value.tap ? "pointer" : "default", textAlign: "left"
  }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-moderate)", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 900, color: value.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-.01em", marginTop: 4, whiteSpace: "nowrap" }}>{value.txt}</span>
    </button>;

  const VDiv = () => <span style={{ width: 1, alignSelf: "stretch", background: "var(--stroke-minimal)", margin: "2px 2px" }} />;

  return (
    <Widget icon="time" title="Attendance" action="History" onAction={onOpen}>
      <Card surface="elev" pad={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, animation: "fadeIn .4s ease .1s both" }}><Col label="Mark In" value={inVal} /></div>
          <VDiv />
          <div style={{ flex: 1, animation: "fadeIn .4s ease .2s both" }}><Col label="Mark out" value={outVal} /></div>
          <VDiv />
          <div style={{ flex: 1, animation: "fadeIn .4s ease .3s both" }}><Col label="Duration" value={{ txt: durTxt, color: "var(--content-heavy)" }} /></div>
        </div>
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// QUICK LINKS — six everyday destinations
// ═══════════════════════════════════════════════════════════════
function QuickLinks({ onGo }) {
  const links = [
  { label: "Reimbursement", icon: "rupee_coin", fg: "var(--positive)", bg: "var(--positive-light)", to: "pay" },
  { label: "Benefits", icon: "gift", fg: "var(--warning)", bg: "var(--warning-light)", to: "benefits" },
  { label: "Recruitment", icon: "search", fg: "var(--reliance-base)", bg: "var(--reliance-50)", to: "recruitment" },
  { label: "Virtual ID card", icon: "id", fg: "var(--reliance-base)", bg: "var(--reliance-50)", to: "vid" },
  { label: "Medibuddy", icon: "support", fg: "var(--sky)", bg: "var(--sky-light)", to: "medibuddy" },
  { label: "PME", icon: "id_check", fg: "var(--positive)", bg: "var(--positive-light)", to: "pme" }];

  return (
    <Widget title="Quick links">
      <Card surface="elev" pad={6}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {links.map((l, i) =>
          <button key={l.label} onClick={() => onGo(l.to, l.label)} style={{
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
            padding: "16px 6px 15px",
            borderTop: i >= 3 ? "1px solid var(--stroke-minimal)" : "none",
            borderLeft: i % 3 ? "1px solid var(--stroke-minimal)" : "none",
            animation: `fadeInScale .35s ease ${i * 0.06}s both`
          }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, background: l.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={l.icon} size={23} color={l.fg} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-heavy)", letterSpacing: "-.01em", lineHeight: 1.25, textAlign: "center", textWrap: "balance" }}>{l.label}</span>
            </button>
          )}
        </div>
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// UPCOMING BOOKINGS (employee) — horizontal, AI-curated
// ═══════════════════════════════════════════════════════════════
function BookingsEmp({ onViewAll }) {
  const items = [
  { tag: "Next · Gym", fg: "var(--positive)", title: "Tonight · 8:00 PM", sub: "Building 4A · Ground Floor", foot: "Today · 2 hrs away" },
  { tag: "Tue · Team meet", fg: "var(--reliance-base)", title: "Tomorrow · 10:00 AM", sub: "Conference Room B3", foot: "Tomorrow · in 21 hrs" },
  { tag: "Wed · 1:1 with manager", fg: "var(--sky)", title: "Wed · 3:30 PM", sub: "Huddle Room 2 · 30 min", foot: "In 2 days" }];

  return (
    <section style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px 9px" }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: ".02em", textTransform: "uppercase", color: "var(--content-moderate)" }}>Upcoming bookings</h2>
        <div style={{ flex: 1 }} />
        <button onClick={onViewAll} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--reliance-base)", display: "inline-flex", alignItems: "center", gap: 2 }}>
          View all (4)
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 0 6px", scrollSnapType: "x mandatory", textAlign: "left" }}>
        {items.map((b, i) =>
        <div key={b.tag} style={{
          flex: "0 0 auto", width: 252, scrollSnapAlign: "start",
          background: "var(--surface-minimal)", border: "1px solid var(--stroke-minimal)", borderRadius: 16,
          boxShadow: "var(--shadow-elevated-low)", padding: 15,
          animation: `slideUp .4s cubic-bezier(.2,0,0,1) ${i * 0.1}s both`
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: b.fg, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: b.fg, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.tag}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--content-heavy)", letterSpacing: "-.02em", marginTop: 10 }}>{b.title}</div>
            <div style={{ fontSize: 13, color: "var(--content-moderate)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.sub}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-minimal)", marginTop: 12 }}>{b.foot}</div>
          </div>
        )}
      </div>
    </section>);

}

// ═══════════════════════════════════════════════════════════════
// 3 · TASKS (Azure DevOps) — priority order
// ═══════════════════════════════════════════════════════════════
const PRIO = {
  high: { fg: "var(--negative)", bg: "var(--negative-light)", label: "High" },
  med: { fg: "var(--warning)", bg: "var(--warning-light)", label: "Medium" },
  low: { fg: "var(--content-moderate)", bg: "var(--surface-subtle)", label: "Low" }
};

function TaskRow({ t, onToggle, divider }) {
  const p = PRIO[t.priority];
  return (
    <div style={{ display: "flex", gap: 11, padding: "12px 12px", borderTop: divider ? "1px solid var(--stroke-minimal)" : "none", alignItems: "flex-start" }}>
      <button onClick={() => onToggle(t.id)} aria-label="Toggle task" style={{
        width: 22, height: 22, marginTop: 1, flexShrink: 0, borderRadius: 7, cursor: "pointer", padding: 0,
        border: t.done ? "none" : "2px solid var(--stroke-heavy)",
        background: t.done ? "var(--positive)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {t.done && <Icon name="check" size={14} color="#fff" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.3, color: t.done ? "var(--content-minimal)" : "var(--content-heavy)", textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: p.fg, background: p.bg, padding: "2px 8px", borderRadius: 999 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />{p.label}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: "var(--content-moderate)" }}>
            <Icon name={t.source === "Azure" ? "cloud" : "profile"} size={13} color="var(--content-minimal)" />{t.source === "Azure" ? "Azure DevOps" : "Self-assigned"}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: t.due === "Today" ? "var(--negative)" : "var(--content-moderate)" }}>· {t.due}</span>
        </div>
      </div>
    </div>);

}

function Tasks({ tasks, onToggle, onNew, onOpen }) {
  const today = tasks.filter((t) => t.due === "Today");
  const open = today.filter((t) => !t.done);
  const show = today.slice(0, 4);
  return (
    <Widget icon="list" title="Tasks today" action="All tasks" onAction={onOpen}
    right={<span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--content-moderate)", marginRight: 10, fontVariantNumeric: "tabular-nums" }}>{open.length} open</span>}>
      <Card surface="elev" pad={4}>
        {show.map((t, i) =>
          <div key={t.id} style={{ animation: `slideUp .35s ease ${i * 0.07}s both` }}>
            <TaskRow t={t} onToggle={onToggle} divider={i > 0} />
          </div>
        )}
        <button onClick={onNew} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "12px", borderTop: "1px solid var(--stroke-minimal)", background: "none", border: "none",
          borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: "var(--stroke-minimal)",
          cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "var(--reliance-base)"
        }}>
          <Icon name="add" size={17} color="var(--reliance-base)" />New task
        </button>
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// 4 · LEAVE BALANCE — personal entitlement tracker
// ═══════════════════════════════════════════════════════════════
function LeaveBalance({ onApply }) {
  const cats = [
  { label: "Casual", left: 6, total: 12, fg: "var(--sky)" },
  { label: "Earned", left: 14, total: 18, fg: "var(--positive)" },
  { label: "Sick", left: 5, total: 8, fg: "var(--warning)" }];

  return (
    <Widget icon="calendar" title="Leave balance" action="History" onAction={onApply}>
      <Card surface="elev" pad={16}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {cats.map((c) =>
          <div key={c.label} style={{ background: "var(--surface-subtle)", borderRadius: 13, padding: "13px 10px 12px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: c.fg, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em", lineHeight: 1 }}>{c.left}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--content-minimal)" }}>/{c.total}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--content-moderate)", marginTop: 6 }}>{c.label}</div>
              <div style={{ height: 4, borderRadius: 999, background: "var(--neutral-1700, var(--stroke-minimal))", marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${c.left / c.total * 100}%`, background: c.fg, borderRadius: 999 }} />
              </div>
            </div>
          )}
        </div>
        <Button variant="secondary" size="m" full style={{ marginTop: 13 }} icon="calendar" onClick={onApply}>Apply for leave</Button>
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// 5 · PAY & BENEFITS
// ═══════════════════════════════════════════════════════════════
function PayBenefits({ onOpen }) {
  const flags = [
  { icon: "card", title: "Reimbursement pending", detail: "Travel claim · ₹3,200", tone: "info" },
  { icon: "document", title: "Tax declaration due", detail: "Submit by 15 Jun", tone: "risk" }];

  const toneFg = { info: "var(--sky)", risk: "var(--warning)" };
  const toneBg = { info: "var(--sky-light)", risk: "var(--warning-light)" };
  return (
    <Widget icon="rupee" title="Pay & benefits" action="Payslips" onAction={onOpen}>
      <Card surface="elev" pad={4}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 13px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--positive-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="confirm" size={21} color="var(--positive)" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--content-heavy)", letterSpacing: "-.01em" }}>May payslip is ready</div>
            <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2 }}>Net <span style={{ fontWeight: 700, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums" }}>₹1,42,380</span> · credited 30 May</div>
          </div>
          <button onClick={onOpen} aria-label="Download payslip" style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid var(--stroke-minimal)", background: "var(--surface-minimal)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Icon name="download" size={18} color="var(--reliance-base)" />
          </button>
        </div>
        {flags.map((f) =>
        <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", borderTop: "1px solid var(--stroke-minimal)" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: toneBg[f.tone], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={f.icon} size={17} color={toneFg[f.tone]} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--content-heavy)" }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "var(--content-moderate)", marginTop: 1 }}>{f.detail}</div>
            </div>
            <Icon name="chevron_right" size={17} color="var(--content-minimal)" />
          </div>
        )}
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// 6 · NEWS & UPDATES — Announcements / Birthdays tabs
// ═══════════════════════════════════════════════════════════════
function EmpNews({ onOpen }) {
  const [tab, setTab] = useStateEmp("ann");
  const ann = [
  { tag: "Policy", tone: "var(--warning)", title: "Hybrid policy update from Monday", body: "3 office days a week for the Design team." },
  { tag: "Win", tone: "var(--positive)", title: "Design won the Q2 craft award", body: "Your checkout work was called out by name." }];

  const bdays = [
  { name: "Rohit Sharma", team: "Engineering", initials: "RS", today: true },
  { name: "Ananya Gupta", team: "Product", initials: "AG", today: false, when: "Tomorrow" }];

  return (
    <Widget icon="flag" title="News & updates" action="All updates" onAction={onOpen}>
      <Card surface="elev" pad={4}>
        <div style={{ display: "flex", gap: 6, padding: "10px 10px 6px" }}>
          {[["ann", "Announcements"], ["bday", "Birthdays"]].map(([id, label]) =>
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, height: 34, borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
            border: "1px solid " + (tab === id ? "transparent" : "var(--stroke-minimal)"),
            background: tab === id ? "var(--reliance-base)" : "var(--surface-minimal)",
            color: tab === id ? "#fff" : "var(--content-moderate)"
          }}>{label}</button>
          )}
        </div>
        {tab === "ann" ? ann.map((n, i) =>
        <div key={n.title} style={{ display: "flex", gap: 11, padding: "13px 13px", borderTop: "1px solid var(--stroke-minimal)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: n.tone, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: n.tone, textTransform: "uppercase", letterSpacing: ".04em" }}>{n.tag}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--content-heavy)", marginTop: 2, letterSpacing: "-.01em", lineHeight: 1.3 }}>{n.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 2, lineHeight: 1.4, textWrap: "pretty" }}>{n.body}</div>
            </div>
          </div>
        ) : bdays.map((b) =>
        <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 13px", borderTop: "1px solid var(--stroke-minimal)" }}>
            <span style={{ width: 40, height: 40, borderRadius: 999, background: "var(--sky-light)", color: "var(--sky-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{b.initials}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--content-heavy)" }}>{b.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--content-moderate)", marginTop: 1 }}>{b.team} · {b.today ? "Today" : b.when}</div>
            </div>
            <Button size="s" variant={b.today ? "skyghost" : "secondary"} icon="gift" onClick={() => {}}>Wish</Button>
          </div>
        )}
      </Card>
    </Widget>);

}

// ═══════════════════════════════════════════════════════════════
// CALL REFERS — emergency help card
// ═══════════════════════════════════════════════════════════════
function RefersCard({ onCall }) {
  return (
    <section style={{ marginTop: 14 }}>
      <Card surface="elev" pad={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Icon name="call_emergency" size={21} color="var(--positive)" />
              <span style={{ fontSize: 17, fontWeight: 900, color: "var(--content-heavy)", letterSpacing: "-.01em" }}>Call REFERS</span>
            </div>
            <div style={{ fontSize: 13.5, color: "var(--content-moderate)", marginTop: 9, fontWeight: 500 }}>We have your family covered 24x7.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", marginTop: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--content-heavy)", fontVariantNumeric: "tabular-nums", letterSpacing: ".01em" }}>1800 8899 009</span>
              <span style={{ fontSize: 13.5, color: "var(--content-moderate)", fontWeight: 500 }}>50009 (from any Jio SIM)</span>
            </div>
          </div>
          <button onClick={onCall} aria-label="Call REFERS" style={{
            width: 52, height: 52, borderRadius: 999, flexShrink: 0,
            border: "1px solid var(--stroke-moderate)", background: "var(--surface-minimal)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <Icon name="call" size={23} color="var(--reliance-base)" />
          </button>
        </div>
      </Card>
    </section>
  );
}

Object.assign(window, { EmpBrief, Attendance, QuickLinks, BookingsEmp, Tasks, TaskRow, LeaveBalance, PayBenefits, EmpNews, RefersCard, PRIO, fmtTime });