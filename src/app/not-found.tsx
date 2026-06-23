export const metadata = { title: "Not found — Fault Lines" };

export default function NotFound() {
  return (
    <>
      <header className="app">
        <div className="topline" />
        <div className="bar"><a href="/" className="wordmark">Fault<span className="seam" />Lines</a></div>
      </header>
      <div className="empty" style={{ paddingTop: 90 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 40, color: "var(--ink)", marginBottom: 8 }}>404</div>
        <p>That story has rolled off the feed.</p>
        <p style={{ marginTop: 16 }}><a href="/" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>← Back to Fault Lines</a></p>
      </div>
    </>
  );
}
