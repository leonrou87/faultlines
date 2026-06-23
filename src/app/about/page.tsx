export const metadata = { title: "Methodology — Fault Lines" };

export default function About() {
  return (
    <>
      <header className="app">
        <div className="bar"><a href="/" className="wordmark">Fault<span className="seam" />Lines</a></div>
      </header>
      <article className="doc">
        <h1>How Fault Lines works</h1>
        <p><em>We don&apos;t tell you what to think — we show you where the country splits, and why.</em></p>

        <h3>What we publish</h3>
        <p>The stories anyone needs, ranked across Top, Politics, Business, Tech, World and Sports, plus local
        editions for major cities. Every article is <strong>our own original prose</strong> summarizing the facts —
        we never republish or reproduce anyone else&apos;s text.</p>

        <h3>How a story is made</h3>
        <p>A newsroom pipeline reads a broad range of reporting from across the political spectrum, clusters all
        coverage of one real-world event into a single story, ranks by breadth of coverage and recency, then writes a
        neutral summary using only facts corroborated across multiple independent reports.</p>

        <h3>&ldquo;The Split&rdquo;</h3>
        <p>For genuinely political stories with coverage on both sides, we add a steelmanned <strong>Left View</strong>
        and <strong>Right View</strong> — each in its strongest good-faith form, labeled &ldquo;how this side frames
        it,&rdquo; never as our own opinion — plus what both sides agree on, where they split, and a 0–100 tension
        score. A split is only shown when the system is confident it is real and symmetric; otherwise we publish
        neutral-only. An automated fairness check audits every split before it can publish.</p>

        <h3>Originality</h3>
        <p>Before publishing, a deterministic gate checks the body for verbatim runs and close paraphrase against the
        underlying reporting. If prose is too close it is rewritten, then if needed rebuilt from corroborated facts
        alone, so nothing traceable reaches readers.</p>

        <h3>The spectrum</h3>
        <div className="legend">
          <span><i className="dot left" style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--left)", display: "inline-block" }} /> Left</span>
          <span><i className="dot center" style={{ width: 10, height: 10, borderRadius: "50%", background: "#8a93a0", display: "inline-block" }} /> Center</span>
          <span><i className="dot right" style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--right)", display: "inline-block" }} /> Right</span>
        </div>
        <p>The coverage bar on each story shows how the political spectrum — left, center and right — is covering it,
        in aggregate. It reflects the balance of perspectives, not the accuracy of any single report. We never
        identify individual outlets.</p>

        <p style={{ marginTop: 30 }}><a href="/" style={{ color: "var(--accent)" }}>← Back to the feed</a></p>
      </article>
    </>
  );
}
