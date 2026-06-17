"use client";
import { Fragment, useMemo, useState } from "react";
import type { Story, Vote } from "@/lib/stories";
import AdSlot from "@/components/AdSlot";

const TOPICS = ["all", "top", "politics", "business", "tech", "world", "sports"] as const;
const LABEL: Record<string, string> = { all: "All", top: "Top", politics: "Politics", business: "Business", tech: "Tech", world: "World", sports: "Sports" };
const AD_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED;
const AD_EVERY = 6;

const approval = (v: Vote) => (v.up + v.down ? Math.round((100 * v.up) / (v.up + v.down)) : null);
const firstSentence = (t: string | null) => (t || "").split(/(?<=[.!?])\s/)[0] || "";
const leftSpin = (s: Story) => s.left_summary || firstSentence(s.left_view);
const rightSpin = (s: Story) => s.right_summary || firstSentence(s.right_view);

function TileImage({ s, fl }: { s: Story; fl: boolean }) {
  const [err, setErr] = useState(false);
  return (
    <div className="tile-imgwrap">
      {s.image_url && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tile-img" src={s.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setErr(true)} />
      ) : (
        <div className="tile-fallback"><span className="seam" /></div>
      )}
      <div className="tile-imgshade" />
      <div className="tile-badges">
        {fl ? <span className="pill-fl">⚡ Fault Line</span> : <span className="pill-topic">{s.topic}</span>}
        <span className="trend">🔥 {s.trending}</span>
      </div>
    </div>
  );
}

function Tile({ s, onOpen }: { s: Story; onOpen: (s: Story) => void }) {
  const fl = s.has_split;
  return (
    <article className="tile" onClick={() => onOpen(s)}>
      <TileImage s={s} fl={fl} />
      <div className="tile-body">
        <h3>{s.neutral_title}</h3>
        {fl ? (
          <>
            <div className="mini">
              <div className="ml"><b>🔵 Left</b>{leftSpin(s)}</div>
              <div className="mr"><b>Right 🔴</b>{rightSpin(s)}</div>
            </div>
            <div className="tile-meta"><span className="tile-cta">Tap to weigh in →</span><span style={{ marginLeft: "auto" }}>{s.sources.length} sources</span></div>
          </>
        ) : (
          <>
            <p className="tile-teaser">{s.neutral_body.slice(0, 140)}{s.neutral_body.length > 140 ? "…" : ""}</p>
            <div className="tile-meta"><span>{s.topic}</span><span style={{ marginLeft: "auto" }}>{s.sources.length} sources</span></div>
          </>
        )}
      </div>
    </article>
  );
}

function Modal({ s, onClose, onToast }: { s: Story; onClose: () => void; onToast: (m: string) => void }) {
  const [votes, setVotes] = useState(s.votes);
  const [imgErr, setImgErr] = useState(false);
  const la = approval(votes.left), ra = approval(votes.right);
  const lFair = votes.left.up, rFair = votes.right.up, fairTotal = lFair + rFair;
  const lPct = fairTotal ? Math.round((100 * lFair) / fairTotal) : 50, rPct = 100 - lPct;
  const hasVotes = votes.left.up + votes.left.down + votes.right.up + votes.right.down > 0;

  async function vote(side: "left" | "right", dir: "up" | "down") {
    try {
      const r = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ story_id: s.id, side, dir }) });
      const v = await r.json();
      if (v && typeof v.up === "number") { setVotes((p) => ({ ...p, [side]: { up: v.up, down: v.down } })); onToast("Vote counted"); }
    } catch { onToast("Could not vote"); }
  }
  function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "https://faultlines.kytepush.com";
    const text = `🔵 vs 🔴 ${s.neutral_title} — how the left and right each frame it`;
    if (navigator.share) navigator.share({ title: "Fault Lines", text, url }).catch(() => {});
    else { navigator.clipboard?.writeText(`${text} ${url}`); onToast("Link copied"); }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {s.image_url && !imgErr && /* eslint-disable-next-line @next/next/no-img-element */ <img className="modal-img" src={s.image_url} alt="" referrerPolicy="no-referrer" onError={() => setImgErr(true)} />}
        <div className="modal-inner">
          <div className="fl-top">
            {s.has_split ? <span className="fl-badge">⚡ Fault Line</span> : <span className="tag">{s.topic}</span>}
            <span className="fl-topic">{s.topic} · 🔥 {s.trending} trending</span>
          </div>
          <h2>{s.neutral_title}</h2>
          <p className="lede">{s.neutral_body}</p>

          {s.has_split && (
            <>
              <div className="vs-label">How each side frames it</div>
              <div className="arena">
                <div className="side left">
                  <div className="who">🔵 The Left</div>
                  <div className="frame">{s.left_view}</div>
                  <div className="vote-row">
                    <button className="vbtn" onClick={() => vote("left", "up")}>👍 Fair</button>
                    <button className="vbtn" onClick={() => vote("left", "down")}>👎</button>
                    <span className="score">{la == null ? "—" : `${la}%`}<small>{votes.left.up + votes.left.down} votes</small></span>
                  </div>
                </div>
                <div className="side right">
                  <div className="who">The Right 🔴</div>
                  <div className="frame">{s.right_view}</div>
                  <div className="vote-row">
                    <span className="score">{ra == null ? "—" : `${ra}%`}<small>{votes.right.up + votes.right.down} votes</small></span>
                    <button className="vbtn" onClick={() => vote("right", "up")}>👍 Fair</button>
                    <button className="vbtn" onClick={() => vote("right", "down")}>👎</button>
                  </div>
                </div>
              </div>
              <div className="tug">
                <div className="tug-bar"><div className="tug-l" style={{ width: `${lPct}%` }} /><div className="tug-r" style={{ width: `${rPct}%` }} /></div>
                <div className="tug-meta"><span>🔵 {lPct}%</span><span>{rPct}% 🔴</span></div>
                <div className="tug-verdict"><span className="hot">{!hasVotes ? "Be the first to weigh in 👆" : la != null && ra != null && la !== ra ? `The crowd finds the ${la > ra ? "LEFT" : "RIGHT"} framing fairer` : "The crowd is dead split"}</span></div>
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
            </>
          )}

          <div className="fl-sources">
            {s.sources.slice(0, 8).map((src, i) => (
              <a key={i} className="chip" href={src.url} target="_blank" rel="noopener nofollow"><span className={`dot ${src.lean}`} />{src.name}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feed({ initial }: { initial: Story[] }) {
  const [mode, setMode] = useState<"faultlines" | "wire">("faultlines");
  const [topic, setTopic] = useState<string>("all");
  const [open, setOpen] = useState<Story | null>(null);
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  const splits = useMemo(() => initial.filter((s) => s.has_split).sort((a, b) => b.trending - a.trending), [initial]);
  const wire = useMemo(() => initial.filter((s) => !s.has_split).sort((a, b) => b.trending - a.trending), [initial]);
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
          <div className="grid">
            {list.map((s, i) => (
              <Fragment key={s.id}>
                <Tile s={s} onOpen={setOpen} />
                {i > 0 && (i + 1) % AD_EVERY === 0 && i < list.length - 1 && <AdSlot slot={AD_INFEED} />}
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="empty">
            {mode === "faultlines"
              ? (splits.length ? `No fault lines in “${LABEL[topic]}” right now.` : "No earned splits at the moment — we only show a split when left and right genuinely diverge. Check The Wire.")
              : `No stories in “${LABEL[topic]}” yet.`}
          </div>
        )}
      </main>

      {open && <Modal s={open} onClose={() => setOpen(null)} onToast={showToast} />}
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
