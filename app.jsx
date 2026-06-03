/* global React, IOSDevice, Icon, ColorIcon, Button, Card, Signal, Dot,
   AIBriefing, Performance, ExpenseBudget, ExpenseBudgetBars, ExpenseBudgetDonut, ActionItems, TeamSnapshot, Recruitment, Bookings, News,
   ApprovalsScreen, TeamScreen, ReportsScreen, MoreScreen, PROFILES, ProfileScreen, ChatScreen,
   SplashScreen, HomeSkeleton,
   EmpBrief, Attendance, QuickLinks, BookingsEmp, Tasks, LeaveBalance, PayBenefits, EmpNews, RefersCard,
   TasksScreen, LeaveScreen, PayScreen, AttendanceScreen,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle */
const { useState, useEffect } = React;

// ── Accent palettes for the AI layer (Sky = JioCloud default) ──
const ACCENTS = {
  sky: { "--sky": "oklch(62% 0.145 236)", "--sky-ink": "oklch(36% 0.105 236)", "--sky-light": "oklch(95.5% 0.032 236)", "--sky-border": "oklch(88% 0.052 236)", "--sky-shadow": "oklch(62% 0.145 236 / 0.45)" },
  sparkle: { "--sky": "oklch(54% 0.235 295)", "--sky-ink": "oklch(42% 0.16 295)", "--sky-light": "oklch(95% 0.05 295)", "--sky-border": "oklch(89% 0.06 295)", "--sky-shadow": "oklch(54% 0.235 295 / 0.4)" },
  reliance: { "--sky": "var(--reliance-base)", "--sky-ink": "var(--reliance-base)", "--sky-light": "var(--reliance-50)", "--sky-border": "var(--reliance-100)", "--sky-shadow": "oklch(40.1% 0.218 264 / 0.4)" }
};

// ─────────────────────────────────────────────────────────────
// Header — greeting + date + avatar (shared)
// ─────────────────────────────────────────────────────────────
function Header({ name, initials, onBell, onSearch, onProfile, badge }) {
  const ghostBtn = { width: 40, height: 40, borderRadius: 999, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
  return (
    <div style={{ padding: "10px 12px 14px 16px", background: "var(--surface-minimal)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: "-.025em", color: "var(--content-heavy)", lineHeight: 1.1 }}>Good morning</h1>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--content-moderate)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        </div>
        <button onClick={onSearch} aria-label="Search" style={ghostBtn}>
          <Icon name="search" size={22} color="var(--content-heavy)" />
        </button>
        <button onClick={onBell} aria-label="Notifications" style={{ ...ghostBtn, position: "relative" }}>
          <Icon name="notification" size={22} color="var(--content-heavy)" />
          {badge > 0 && <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: 999, background: "var(--negative)", border: "1.5px solid var(--surface-minimal)" }} />}
        </button>
        <button onClick={onProfile} aria-label="Profile" style={{ width: 42, height: 42, borderRadius: 999, background: "var(--reliance-base)", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0, letterSpacing: ".02em", cursor: "pointer", fontFamily: "inherit", marginLeft: 4 }}>{initials}</button>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Bottom navigation (shared, items per persona)
// ─────────────────────────────────────────────────────────────
function BottomNav({ items, active, onChange }) {
  return (
    <div style={{ background: "var(--surface-minimal)", borderTop: "1px solid var(--stroke-minimal)", display: "flex", padding: "8px 4px 26px", flexShrink: 0 }}>
      {items.map((it) => {
        const on = active === it.id;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0",
            color: on ? "var(--reliance-base)" : "var(--content-minimal)"
          }}>
            <span style={{ position: "relative" }}>
              <Icon name={it.icon} size={23} color={on ? "var(--reliance-base)" : "var(--content-minimal)"} />
              {it.badge > 0 &&
              <span className="nav-badge" style={{ position: "absolute", top: -5, right: -9, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999, background: "var(--negative)", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--surface-minimal)", fontVariantNumeric: "tabular-nums" }}>{it.badge}</span>
              }
            </span>
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600 }}>{it.label}</span>
          </button>);

      })}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 96, zIndex: 40,
      background: "var(--neutral-200)", color: "#fff", borderRadius: 14, padding: "13px 15px",
      display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--shadow-elevated-high)",
      animation: "toastIn .25s var(--motion-easing-enter)"
    }}>
      <Icon name="confirm" size={18} color="var(--positive)" />
      <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{toast}</span>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Assistant bottom sheet
// ─────────────────────────────────────────────────────────────
function AssistantSheet({ onClose, onPick, prompts, sub }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 45, background: "rgba(15,23,42,.4)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", animation: "fadeIn .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "var(--surface-minimal)", borderRadius: "22px 22px 0 0", padding: "16px 18px 30px", animation: "sheetIn .28s var(--motion-easing-enter)" }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: "var(--neutral-1400)", margin: "0 auto 16px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--sky)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="ai_sparkle" size={20} color="#fff" /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--content-heavy)", letterSpacing: "-.01em" }}>Ask PeopleFirst AI</div>
            <div style={{ fontSize: 12.5, color: "var(--content-moderate)" }}>{sub}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 999, border: "none", background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="close" size={17} color="var(--content-moderate)" /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {prompts.map((p) =>
          <button key={p} onClick={() => onPick(p)} style={{ textAlign: "left", padding: "13px 14px", borderRadius: 13, border: "1px solid var(--stroke-minimal)", background: "var(--surface-subtle)", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "var(--content-heavy)", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="ai_sparkle" size={16} color="var(--sky)" />{p}
            </button>
          )}
        </div>
        <button onClick={() => onPick(null)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "0 4px 0 16px", height: 48, borderRadius: 999, border: "1px solid var(--stroke-heavy)", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ flex: 1, textAlign: "left", fontSize: 14, color: "var(--content-minimal)" }}>Ask anything…</span>
          <span style={{ width: 38, height: 38, borderRadius: 999, background: "var(--sky)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="send_message" size={18} color="#fff" /></span>
        </button>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Search overlay (top sheet)
// ─────────────────────────────────────────────────────────────
function SearchSheet({ onClose, suggestions, onPick }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 45, background: "rgba(15,23,42,.4)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", flexDirection: "column", animation: "fadeIn .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-minimal)", padding: "12px 16px 18px", animation: "sheetDown .26s var(--motion-easing-enter)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 48, borderRadius: 999, border: "1px solid var(--stroke-heavy)", padding: "0 8px 0 16px" }}>
          <Icon name="search" size={20} color="var(--content-minimal)" />
          <input autoFocus placeholder="Search people, approvals, reports…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14.5, color: "var(--content-heavy)" }} />
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="close" size={17} color="var(--content-moderate)" /></button>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--content-minimal)", margin: "16px 2px 8px" }}>Jump to</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map((s) =>
          <button key={s.label} onClick={() => onPick(s)} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 14px", borderRadius: 999, border: "1px solid var(--stroke-minimal)", background: "var(--surface-subtle)", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--content-heavy)" }}>
              <Icon name={s.icon} size={16} color="var(--content-moderate)" />{s.label}
            </button>
          )}
        </div>
      </div>
    </div>);

}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "persona": "leader",
  "accent": "sky",
  "density": "calm",
  "autoExpandHandled": false
} /*EDITMODE-END*/;

const EMP_TASKS = [
{ id: 1, title: "Review “Checkout redesign” PR", source: "Azure", priority: "high", due: "Today", done: false },
{ id: 2, title: "Ship empty-states for Tasks widget", source: "Azure", priority: "high", due: "Today", done: false },
{ id: 3, title: "Prep handoff notes for dev", source: "Self", priority: "med", due: "Today", done: false },
{ id: 4, title: "Update design tokens doc", source: "Azure", priority: "med", due: "Tomorrow", done: false },
{ id: 5, title: "Book usability sessions", source: "Self", priority: "low", due: "Fri", done: false }];


function App() {
  __wIdx = 0;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const persona = t.persona || "leader";
  const [screen, setScreen] = useState("home");
  const [assistant, setAssistant] = useState(false);
  const [chat, setChat] = useState(false);
  const [chatSeed, setChatSeed] = useState(null);
  const [search, setSearch] = useState(false);
  const [apprFilter, setApprFilter] = useState("All");
  const [toast, setToast] = useState(null);
  // Boot sequence: splash → skeleton → ready
  const [phase, setPhase] = useState("splash");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("skeleton"), 1800);
    const t2 = setTimeout(() => setPhase("ready"), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // leader state
  const [expanded, setExpanded] = useState(false);
  const [approve, setApprove] = useState({ total: 23, lowRisk: 14, approved: 0 });
  const [decisions, setDecisions] = useState([
  { id: "d1", tone: "off", title: "High-Impact Retention Decision", detail: "Rajeev Sharma, part of the PeopleFirst team under Sanjiv Tuli, has received an external offer. HR has recommended an off-cycle salary increment of ₹5 lakh, which is within the approved range.", cta: { label: "Review", variant: "sky" }, secondary: "Dashboard" },
  { id: "d2", tone: "risk", title: "OFFICE365 renewal expires in 7 days", detail: "Annual cost of ₹14L approved by Finance and Legal. Awaiting your final approval.", cta: { label: "Renew", variant: "sky" }, secondary: "Review contract" }]
  );

  // employee state — already marked in at 9:30 and out at 5:45 today
  const [att, setAtt] = useState(() => {
    const d = (h, m) => {const x = new Date();x.setHours(h, m, 0, 0);return x.getTime();};
    return { status: "done", inAt: d(9, 30), outAt: d(17, 45) };
  });
  const [tasks, setTasks] = useState(EMP_TASKS);

  useEffect(() => {setExpanded(t.autoExpandHandled);}, [t.autoExpandHandled]);
  useEffect(() => {setScreen("home");setAssistant(false);setSearch(false);setChat(false);}, [persona]);

  const openChat = (seed) => { setAssistant(false); setChatSeed(seed || null); setChat(true); };

  const flash = (msg) => {setToast(msg);clearTimeout(window.__tt);window.__tt = setTimeout(() => setToast(null), 2600);};
  const go = (s) => setScreen(s);

  // leader handlers
  const leaderBadge = approve.total - approve.approved;
  const resolveDecision = (id, kind) => {
    setDecisions((ds) => ds.filter((d) => d.id !== id));
    flash(kind === "primary" ? id === "d1" ? "₹45L increment approved for Rajeev Sharma" : "Renewal approved" : "Opened for your review");
  };
  const bulkApprove = () => {setApprove((s) => ({ ...s, approved: s.lowRisk }));flash(`${approve.lowRisk} low-risk approvals cleared`);};

  // employee handlers
  const empBadge = tasks.filter((x) => !x.done && x.due === "Today").length;
  const markAtt = (kind) => {
    if (kind === "in") {setAtt({ status: "in", inAt: Date.now(), outAt: null });flash("Marked in. Have a good one.");} else
    {setAtt((a) => ({ ...a, status: "done", outAt: Date.now() }));flash("Marked out. Day recorded.");}
  };
  const toggleTask = (id) => setTasks((xs) => xs.map((x) => x.id === id ? { ...x, done: !x.done } : x));
  const newTask = () => {setTasks((xs) => [{ id: Date.now(), title: "New task", source: "Self", priority: "med", due: "Today", done: false }, ...xs]);flash("Task added to today");};
  const quickGo = (to, label) => {
    if (to === "leave" || to === "pay" || to === "attendance") go(to);else
    flash(`Opening ${label}`);
  };
  const empItems = [
  { id: "t", icon: "list", bg: "var(--negative-light)", fg: "var(--negative)", title: "“Checkout redesign” review due 11:00", detail: "2 hours away · High priority", target: "tasks" },
  { id: "l", icon: "calendar", bg: "var(--warning-light)", fg: "var(--warning)", title: "Today is your last day to apply for leave", detail: "June planned leave closes at 6pm", target: "leave" },
  { id: "g", icon: "star", bg: "var(--sky-light)", fg: "var(--sky)", title: "Goals & objectives filing has started", detail: "Set your H2 goals · due 15 Jun", target: "profile" }];


  const accentVars = ACCENTS[t.accent] || ACCENTS.sky;
  const gap = t.density === "compact" ? 10 : 14;
  const profile = PROFILES[persona];

  // ── nav items ──
  const navItems = persona === "leader" ? [
  { id: "home", icon: "home", label: "Home" },
  { id: "team", icon: "group", label: "Team" },
  { id: "approvals", icon: "confirm", label: "Approvals", badge: leaderBadge },
  { id: "reports", icon: "analytics", label: "Reports" },
  { id: "more", icon: "more_horizontal", label: "More" }] :
  [
  { id: "home", icon: "home", label: "Home" },
  { id: "tasks", icon: "list", label: "Tasks", badge: empBadge },
  { id: "attendance", icon: "time", label: "Attendance" },
  { id: "pay", icon: "rupee", label: "Pay" },
  { id: "more", icon: "more_horizontal", label: "More" }];

  const headerBadge = persona === "leader" ? leaderBadge : empBadge;

  // ── body ──
  let body;
  if (persona === "leader") {
    if (screen === "home") body =
    <div style={{ flex: 1, overflow: "auto", background: "var(--surface-subtle)" }}>
        <Header name="Vikram" initials="VM" onBell={() => setAssistant(true)} onSearch={() => setSearch(true)} onProfile={() => go("more")} badge={headerBadge} />
        <div style={{ padding: "20px 16px 28px", display: "flex", flexDirection: "column", gap }}>
          <AIBriefing expanded={expanded} onToggle={() => setExpanded((x) => !x)} decisions={decisions} onResolve={resolveDecision} onOpenAssistant={() => setAssistant(true)} />
          <Performance onOpen={() => go("reports")} />
          <ExpenseBudgetBars onOpen={() => go("reports")} />
          <ActionItems state={approve} onBulkApprove={bulkApprove} onOpen={(f) => { setApprFilter(f || "All"); go("approvals"); }} />
          <TeamSnapshot onOpen={() => go("team")} />
          <Recruitment onOpen={() => go("more")} />
          <Bookings onOpen={() => flash("Opening calendar")} />
          <News onOpen={() => flash("Opening all updates")} onWish={(n) => flash("Wish sent to " + n)} />
        </div>
      </div>;else

    if (screen === "approvals") body = <ApprovalsScreen onBack={() => go("home")} initialFilter={apprFilter} bulkApproved={approve.approved > 0} onBulkApprove={() => setApprove((s) => ({ ...s, approved: s.lowRisk }))} />;else
    if (screen === "team") body = <TeamScreen onBack={() => go("home")} />;else
    if (screen === "reports") body = <ReportsScreen onBack={() => go("home")} />;else
    if (screen === "more") body = <MoreScreen onBack={() => go("home")} persona={persona} onSwitch={(p) => setTweak("persona", p)} />;
  } else {
    if (screen === "home") body =
    <div style={{ flex: 1, overflow: "auto", background: "var(--surface-subtle)" }}>
        <Header name="Priya" initials="PS" onBell={() => setAssistant(true)} onSearch={() => setSearch(true)} onProfile={() => go("more")} badge={headerBadge} />
        <div style={{ padding: "20px 16px 28px", display: "flex", flexDirection: "column", gap, textAlign: "left" }}>
          <EmpBrief items={empItems} onItem={(it) => go(it.target)} onOpenAssistant={() => setAssistant(true)} />
          <Attendance att={att} onMark={markAtt} onOpen={() => go("attendance")} />
          <QuickLinks onGo={quickGo} />
          <Tasks tasks={tasks} onToggle={toggleTask} onNew={newTask} onOpen={() => go("tasks")} />
          <BookingsEmp onViewAll={() => flash("All bookings")} />
          <EmpNews onOpen={() => flash("Opening all updates")} />
          <RefersCard onCall={() => flash("Calling REFERS · 1800 8899 009")} />
        </div>
      </div>;else

    if (screen === "tasks") body = <TasksScreen onBack={() => go("home")} tasks={tasks} onToggle={toggleTask} onNew={newTask} />;else
    if (screen === "attendance") body = <AttendanceScreen onBack={() => go("home")} att={att} />;else
    if (screen === "leave") body = <LeaveScreen onBack={() => go("home")} />;else
    if (screen === "pay") body = <PayScreen onBack={() => go("home")} />;else
    if (screen === "profile") body = <ProfileScreen onBack={() => go("more")} onToast={flash} />;else
    if (screen === "more") body = <MoreScreen onBack={() => go("home")} persona={persona} onSwitch={(p) => setTweak("persona", p)} onRow={go} />;
  }

  const prompts = persona === "leader" ?
  ["What changed since yesterday?", "Who's blocked this week?", "Draft the review summary", "What can I safely delegate?"] :
  ["What's due today?", "How much leave do I have left?", "When is my next payslip?", "Draft my leave request"];
  const assistantSub = persona === "leader" ? "Across pipeline, people, approvals" : "Across your tasks, leave & pay";

  const searchSuggestions = persona === "leader" ?
  [{ label: "Approvals", icon: "confirm", to: "approvals" }, { label: "Reports", icon: "analytics", to: "reports" }, { label: "Team", icon: "group", to: "team" }, { label: "Recruitment", icon: "id", to: "more" }, { label: "Budget", icon: "card", to: "reports" }] :
  [{ label: "My tasks", icon: "list", to: "tasks" }, { label: "Attendance", icon: "time", to: "attendance" }, { label: "Pay & benefits", icon: "rupee", to: "pay" }, { label: "Apply leave", icon: "calendar", to: "leave" }];

  // Frameless on real phones (and via ?bare=1) — no device mockup; framed on desktop.
  const bare = typeof window !== "undefined" && (/[?&]bare=1/.test(window.location.search) || window.matchMedia("(max-width: 640px)").matches);

  const appInner = (
    <div style={{ ...accentVars, display: "flex", flexDirection: "column", height: "100%", position: "relative", background: "var(--surface-subtle)", paddingTop: bare ? "env(safe-area-inset-top, 0px)" : 50 }}>
      {phase === "splash" && <SplashScreen />}
      {phase === "skeleton" && <HomeSkeleton persona={persona} />}
      {phase === "ready" &&
      <React.Fragment>
        <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>{body}</div>
        <Toast toast={toast} />
        {assistant && <AssistantSheet onClose={() => setAssistant(false)} onPick={openChat} prompts={prompts} sub={assistantSub} />}
        {chat && <ChatScreen persona={persona} seed={chatSeed} onClose={() => setChat(false)} />}
        {search && <SearchSheet onClose={() => setSearch(false)} suggestions={searchSuggestions} onPick={(s) => { setSearch(false); go(s.to); }} />}
        <BottomNav items={navItems} active={screen} onChange={go} />
      </React.Fragment>
      }
    </div>);


  return (
    <React.Fragment>
      {bare ?
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "var(--surface-subtle)" }}>{appInner}</div> :

      <IOSDevice width={402} height={874}>{appInner}</IOSDevice>
      }

      <TweaksPanel>
        <TweakSection label="Persona" />
        <TweakRadio label="Home for" value={persona} options={["leader", "employee"]} onChange={(v) => setTweak("persona", v)} />
        <TweakSection label="AI layer" />
        <TweakRadio label="Accent" value={t.accent} options={["sky", "sparkle", "reliance"]} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["calm", "compact"]} onChange={(v) => setTweak("density", v)} />
        {persona === "leader" && <TweakToggle label="Expand “what AI handled”" value={t.autoExpandHandled} onChange={(v) => setTweak("autoExpandHandled", v)} />}
      </TweaksPanel>
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);