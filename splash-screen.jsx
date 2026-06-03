/* global React, lottie */

// ── 1 · SPLASH — Lottie animation (PeopleFirst - Splash - v2.json) ──
function SplashScreen() {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    // Use lottie-web if available, else fall back to static image
    if (typeof lottie !== "undefined") {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "assets/splash-v2.json",
      });
      return () => anim.destroy();
    }
  }, []);

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      background: "#0078AC",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn .2s ease"
    }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      />
    </div>
  );
}

// ── Skeleton primitives ──
const Bar = ({ w = "100%", h = 12, r = 7, style }) =>
<div className="skln" style={{ width: w, height: h, borderRadius: r, ...style }} />;

function SkCard({ children, style }) {
  return <div style={{ background: "var(--surface-minimal)", border: "1px solid var(--stroke-minimal)", borderRadius: 16, padding: 16, ...style }}>{children}</div>;
}
function SkSection({ children }) {
  return (
    <div>
      <Bar w={104} h={11} style={{ margin: "0 2px 10px" }} />
      {children}
    </div>);

}

// Big AI briefing card — both personas lead with this
function SkAiBrief() {
  return (
    <SkCard style={{ padding: 0, overflow: "hidden", borderRadius: 20 }}>
      <div style={{ background: "var(--sky-light)", padding: "15px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bar w={30} h={30} r={9} />
          <div style={{ flex: 1 }}><Bar w={120} h={13} /><Bar w={86} h={10} style={{ marginTop: 6 }} /></div>
          <Bar w={32} h={32} r={999} />
        </div>
        <Bar w="94%" h={15} style={{ marginTop: 14 }} />
        <Bar w="60%" h={15} style={{ marginTop: 8 }} />
      </div>
      <div style={{ padding: "14px 16px" }}>
        {[0, 1].map((i) =>
        <div key={i} style={{ display: "flex", gap: 11, paddingTop: i ? 13 : 0, marginTop: i ? 13 : 0, borderTop: i ? "1px solid var(--stroke-minimal)" : "none" }}>
            <Bar w={9} h={9} r={999} style={{ marginTop: 4 }} />
            <div style={{ flex: 1 }}>
              <Bar w="78%" h={13} /><Bar w="92%" h={11} style={{ marginTop: 7 }} />
              {i === 0 && <div style={{ display: "flex", gap: 8, marginTop: 12 }}><Bar w={118} h={32} r={999} /><Bar w={84} h={32} r={999} /></div>}
            </div>
          </div>
        )}
      </div>
    </SkCard>);

}

// Metric card — Performance / Expense (big number + chart + rows)
function SkMetric() {
  return (
    <SkSection>
      <SkCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div><Bar w={120} h={11} /><Bar w={74} h={30} style={{ marginTop: 10 }} /></div>
          <Bar w={104} h={44} r={10} />
        </div>
        <div style={{ borderTop: "1px solid var(--stroke-minimal)", marginTop: 16, paddingTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}><Bar w={130} h={12} /><div style={{ flex: 1 }} /><Bar w={46} h={12} /><Bar w={60} h={20} r={999} /></div>)}
        </div>
      </SkCard>
    </SkSection>);

}

// 4-tile grid — Approvals
function SkGrid4() {
  return (
    <SkSection>
      <SkCard>
        <Bar w={120} h={26} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 7, marginTop: 14 }}>
          {[0, 1, 2, 3].map((i) => <Bar key={i} h={62} r={12} />)}
        </div>
        <Bar h={42} r={999} style={{ marginTop: 13 }} />
      </SkCard>
    </SkSection>);

}

// 4-stat row — Team summary
function SkStats4() {
  return (
    <SkSection>
      <SkCard>
        <Bar h={8} r={999} style={{ marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[0, 1, 2, 3].map((i) =>
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}><Bar w={34} h={22} /><Bar w={42} h={10} /></div>
          )}
        </div>
      </SkCard>
    </SkSection>);

}

// Attendance tri-stat — employee
function SkAttendance() {
  return (
    <SkSection>
      <SkCard>
        <div style={{ display: "flex", border: "1px solid var(--stroke-minimal)", borderRadius: 13, overflow: "hidden" }}>
          {[0, 1, 2].map((i) =>
          <div key={i} style={{ flex: 1, padding: "11px 13px", borderLeft: i ? "1px solid var(--stroke-minimal)" : "none" }}><Bar w={50} h={10} /><Bar w={64} h={17} style={{ marginTop: 8 }} /></div>
          )}
        </div>
      </SkCard>
    </SkSection>);

}

// Quick links grid — employee
function SkQuickLinks() {
  return (
    <SkSection>
      <SkCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[0, 1, 2, 3, 4, 5].map((i) =>
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}><Bar w={44} h={44} r={13} /><Bar w={52} h={10} /></div>
          )}
        </div>
      </SkCard>
    </SkSection>);

}

// List card — Tasks / Recruitment rows
function SkList({ rows = 3 }) {
  return (
    <SkSection>
      <SkCard style={{ padding: 4 }}>
        {Array.from({ length: rows }).map((_, i) =>
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 12px", borderTop: i ? "1px solid var(--stroke-minimal)" : "none" }}>
            <Bar w={22} h={22} r={7} />
            <div style={{ flex: 1 }}><Bar w="70%" h={13} /><Bar w="44%" h={10} style={{ marginTop: 7 }} /></div>
            <Bar w={56} h={20} r={999} />
          </div>
        )}
      </SkCard>
    </SkSection>);

}

// ── 2 · HOME SKELETON — mirrors the real widgets per persona ──
function HomeSkeleton({ persona = "leader" }) {
  const blocks = persona === "leader" ?
  [<SkAiBrief key="ai" />, <SkMetric key="perf" />, <SkMetric key="exp" />, <SkGrid4 key="appr" />, <SkStats4 key="team" />] :
  [<SkAiBrief key="ai" />, <SkAttendance key="att" />, <SkQuickLinks key="ql" />, <SkList key="tasks" rows={3} />];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--surface-subtle)", animation: "fadeIn .25s ease" }}>
      {/* header */}
      <div style={{ padding: "12px 16px 14px", background: "var(--surface-minimal)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Bar w={130} h={20} />
            <Bar w={70} h={12} style={{ marginTop: 8 }} />
          </div>
          <Bar w={40} h={40} r={999} />
          <Bar w={40} h={40} r={999} />
          <Bar w={42} h={42} r={999} />
        </div>
      </div>
      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {blocks}
      </div>
    </div>);

}

Object.assign(window, { SplashScreen, HomeSkeleton });
