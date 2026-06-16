"use client";
import { Fragment, useMemo, useState } from "react";
import type { Story, Vote } from "@/lib/stories";
import AdSlot from "@/components/AdSlot";

// In-feed ad slot ids (set once your AdSense units exist). Falls back to a placeholder.
const AD_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED;
const AD_EVERY = 5; // show an ad after every N stories

const TOPICS = ["all", "top", "politics", "business", "tech", "world", "sports"] as const;
const LABEL: Record<string, string> = { all: "All", top: "Top", politics: "Politics", business: "Business", tech: "Tech", world: "World", sports: "Sports" };
const approval = (v: Vote) => (v.up + v.down ? Math.round((100 * v.up) / (v.up + v.down)) : null);

/* ---------- The Wire (neutral) ---------- */
function WireCard({ s }: { s: Story }) {
  const shown = s.sources.slice(0, 5);
  return (
    <article className="card">
      <div className="meta-row">
        <span className="tag">{s.topic}</span>
        <span style={{ marginLeft: "auto" }}>{s.sources.length} sources</span>
      </div>
      <h2 className="headline">{s.neutral_title}</h2>
      <div className="body">{s.neutral_body}</div>
      <div className="sources">
        {shown.map((src, i) => (
          <a key={i} className="chip" href={src.url} target="_blank" rel="noopener nofollow"><span className={`dot ${src.lean}`} />{src.name}</a>
        ))}
        {s.sources.length > shown.length && <span className="more-src">+{s.sources.length - shown.length} more</span>}
      </div>
    </article>
  );
}

/* ---------- The Fault Lines (left vs right battle) ---------- */
function FaultLineCard({ s, onToast }: { s: Story; onToast: (m: string) => void }) {
  const [votes, setVotes] = useState(s.votes);
  const [voted, setVoted] = useState<{ left?: boolean; right?: boolean }>({});

  const la = approval(votes.left), ra = approval(votes.right);
  const lTotal = votes.left.up + votes.left.down, rTotal = votes.right.up + votes.right.down;
  const hasVotes = lTotal + rTotal > 0;
  // tug-of-war: share of "fair" approval between the two sides
  const lFair = votes.left.up, rFair = votes.right.up, fairTotal = lFair + rFair;
  const lPct = fairTotal ? Math.round((100 * lFair) / fairTotal) : 50;
  const rPct = 100 - lPct;

  async function vote(side: "left" | "right", dir: "up" | "down") {
    try {
      const r = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ story_id: s.id, side, dir }) });
      const v = await r.json();
      if (v && typeof v.up === "number") {
        setVotes((p) => ({ ...p, [side]: { up: v.up, down: v.down } }));
        setVoted((p) => ({ ...p, [side]: true }));
        onToast(dir === "up" ? `Marked the ${side} framing fair` : `Marked the ${side} framing unfair`);
      } else onToast("Could not vote");
    } catch { onToast("Could not vote"); }
  }

  function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "https://faultlines.kytepush.com";
    const text = `🔵 vs 🔴 ${s.neutral_title} — see how the left and right each frame it on Fault Lines`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Fault Lines", text, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`); onToast("Link copied");
    }
  }

  const verdict = !hasVotes
    ? "Be the first to weigh in 👇"
    : la != null && ra != null && la !== ra
      ? `The crowd finds the ${la > ra ? "LEFT" : "RIGHT"} framing fairer`
      : "The crowd is dead split";

  return (
    <article className="fl">
      <div className="fl-top">
        <span className="fl-badge">⚡ Fault Line</span>
        <span className="fl-topic">{s.topic}</span>
      </div>
      <h2>{s.neutral_title}</h2>
      <div className="fl-sub">{s.neutral_body}</div>

      <div className="vs-label">How each side frames it</div>
      <div className="arena">
        <div className="side left">
          <div className="who">🔵 The Left</div>
          <div className="frame">{s.left_view}</div>
          <div className="vote-row">
            <button className="vbtn" onClick={() => vote("left", "up")}>👍 Fair</button>
            <button className="vbtn" onClick={() => vote("left", "down")}>👎</button>
            <span className="score">{la == null ? "—" : `${la}%`}<small>{lTotal} votes</small></span>
          </div>
        </div>
        <div className="side right">
          <div className="who">The Right 🔴</div>
          <div className="frame">{s.right_view}</div>
          <div className="vote-row">
            <span className="score">{ra == null ? "—" : `${ra}%`}<small>{rTotal} votes</small></span>
            <button className="vbtn" onClick={() => vote("right", "up")}>👍 Fair</button>
            <button className="vbtn" onClick={() => vote("right", "down")}>👎</button>
          </div>
        </div>
      </div>

      <div className="tug">
        <div className="tug-bar"><div className="tug-l" style={{ width: `${lPct}%` }} /><div className="tug-r" style={{ width: `${rPct}%` }} /></div>
        <div className="tug-meta"><span>🔵 {lPct}%</span><span>{rPct}% 🔴</span></div>
        <div className="tug-verdict"><span className="hot">{verdict}</span></div>
      </div>

      {(s.agree_points.length > 0 || s.split_points.length > 0) && (
        <div className="cols">
          <div className="col agree"><h6>✓ Both sides agree</h6><ul>{s.agree_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
          <div className="col split"><h6>⚡ Where they split</h6><ul>{s.split_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
        </div>
      )}

      <div className="fl-foot">
        {s.tension_score != null && <span className="tension-badge">🌡 Tension {s.tension_score}/100</span>}
        <button className="share" onClick={share}>↗ Share the split</button>
      </div>

      <div className="fl-sources">
        {s.sources.slice(0, 6).map((src, i) => (
          <a key={i} className="chip" href={src.url} target="_blank" rel="noopener nofollow"><span className={`dot ${src.lean}`} />{src.name}</a>
        ))}
        {s.sources.length > 6 && <span className="more-src">+{s.sources.length - 6}</span>}
      </div>
    </article>
  );
}

export default function Feed({ initial }: { initial: Story[] }) {
  const [mode, setMode] = useState<"faultlines" | "wire">("faultlines");
  const [topic, setTopic] = useState<string>("all");
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  const splits = useMemo(() => initial.filter((s) => s.has_split), [initial]);
  const wire = useMemo(() => initial.filter((s) => !s.has_split), [initial]);
  const source = mode === "faultlines" ? splits : wire;
  const list = topic === "all" ? source : source.filter((s) => s.topic === topic);

  return (
    <>
      <div className="modeswitch">
        <button className="mode faultlines" aria-selected={mode === "faultlines"} onClick={() => setMode("faultlines")}>
          <span className="mc">{splits.length}</span>
          <div className="mt">⚡ The Fault Lines</div>
          <div className="md">Where left &amp; right collide</div>
        </button>
        <button className="mode wire" aria-selected={mode === "wire"} onClick={() => setMode("wire")}>
          <span className="mc">{wire.length}</span>
          <div className="mt">📰 The Wire</div>
          <div className="md">Straight, neutral news</div>
        </button>
      </div>

      <nav className="topics" role="tablist">
        {TOPICS.map((t) => (
          <button key={t} className="topic-pill" role="tab" aria-selected={t === topic} onClick={() => setTopic(t)}>{LABEL[t]}</button>
        ))}
      </nav>

      <main>
        {list.length ? (
          list.map((s, i) => (
            <Fragment key={s.id}>
              {mode === "faultlines" ? <FaultLineCard s={s} onToast={showToast} /> : <WireCard s={s} />}
              {i > 0 && (i + 1) % AD_EVERY === 0 && i < list.length - 1 && <AdSlot slot={AD_INFEED} />}
            </Fragment>
          ))
        ) : (
          <div className="empty">
            {mode === "faultlines"
              ? (splits.length ? `No fault lines in “${LABEL[topic]}” right now.` : "No earned splits at the moment — the newsroom only shows a split when left and right genuinely diverge. Check The Wire.")
              : `No stories in “${LABEL[topic]}” yet.`}
          </div>
        )}
      </main>
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
