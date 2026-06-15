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
        <p>Only the Top 50 stories anyone needs, ranked across Top, Politics, Business, Tech, World and Sports.
        Every article is <strong>our own original prose</strong> summarizing facts reported by many outlets —
        we never republish source text. Each story links out to every original report.</p>

        <h3>How a story is made</h3>
        <p>A newsroom pipeline ingests headlines and short snippets from feeds across the spectrum, clusters all
        coverage of one real-world event into a single story, ranks by corroboration and recency, then writes a
        neutral summary using only facts corroborated by at least two independent sources.</p>

        <h3>&ldquo;The Split&rdquo;</h3>
        <p>For genuinely political stories with coverage on both sides, we add a steelmanned <strong>Left View</strong>
        and <strong>Right View</strong> — each in its strongest good-faith form, labeled &ldquo;how this side frames
        it,&rdquo; never as our own opinion — plus what both sides agree on, where they split, and a 0–100 tension
        score. A split is only shown when the system is confident it is real and symmetric; otherwise we publish
        neutral-only. An automated fairness check audits every split before it can publish.</p>

        <h3>Originality</h3>
        <p>Before publishing, a deterministic gate checks the body against source snippets for verbatim runs and close
        paraphrase. If prose is too close it is rewritten, then if needed rebuilt from corroborated facts alone, so
        nothing traceable to a source reaches readers.</p>

        <h3>Source lean labels</h3>
        <div className="legend">
          <span><i className="dot left" style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--left)", display: "inline-block" }} /> Left</span>
          <span><i className="dot center" style={{ width: 10, height: 10, borderRadius: "50%", background: "#8a93a0", display: "inline-block" }} /> Center</span>
          <span><i className="dot right" style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--right)", display: "inline-block" }} /> Right</span>
          <span><i className="dot wire" style={{ width: 10, height: 10, borderRadius: "50%", background: "#b9912e", display: "inline-block" }} /> Wire</span>
        </div>
        <p>Lean labels describe an outlet&apos;s typical editorial posture, not the accuracy of any single report.
        They are reviewed and disclosed, never hidden.</p>

        <p style={{ marginTop: 30 }}><a href="/" style={{ color: "var(--accent)" }}>← Back to the feed</a></p>
      </article>
    </>
  );
}
