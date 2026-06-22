"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { Story, Vote } from "@/lib/stories";
import AdSlot from "@/components/AdSlot";
import ShareMenu from "@/components/ShareMenu";
import SignInWall from "@/components/SignInWall";
import { canRead, recordRead } from "@/lib/gate";
import { supabase } from "@/lib/supabase-browser";

const TOPICS = ["all", "top", "politics", "business", "tech", "world", "sports"] as const;
const LABEL: Record<string, string> = { all: "All", top: "Top", politics: "Politics", business: "Business", tech: "Tech", world: "World", sports: "Sports" };
const AD_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED;
const AD_EVERY = 6;

const approval = (v: Vote) => (v.up + v.down ? Math.round((100 * v.up) / (v.up + v.down)) : null);
const firstSentence = (t: string | null) => (t || "").split(/(?<=[.!?])\s/)[0] || "";
const leftSpin = (s: Story) => s.left_summary || firstSentence(s.left_view);
const rightSpin = (s: Story) => s.right_summary || firstSentence(s.right_view);

function leanCounts(sources: Story["sources"]) {
  const c = { l: 0, c: 0, r: 0 };
  for (const s of sources) { if (s.lean === "left") c.l++; else if (s.lean === "right") c.r++; else c.c++; }
  return c;
}

// Source-coverage-by-lean bar (the signal a bias product should lead with).
function LeanBar({ sources, full = false }: { sources: Story["sources"]; full?: boolean }) {
  const { l, c, r } = leanCounts(sources);
  const t = l + c + r || 1;
  const pct = (n: number) => `${(100 * n) / t}%`;
  return (
    <div className={`leanbar${full ? " full" : ""}`} title={`${l} left · ${c} center · ${r} right`}>
      <div className="lb-track">
        <i className="lb-l" style={{ width: pct(l) }} />
        <i className="lb-c" style={{ width: pct(c) }} />
        <i className="lb-r" style={{ width: pct(r) }} />
      </div>
      {full && <div className="lb-counts"><span className="ll">{l} left</span><span>{c} center</span><span className="rr">{r} right</span></div>}
    </div>
  );
}

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
      <div className="tile-badges">
        {s._cityName ? <span className="pill-local">📍 {s._cityName}</span> : <span className="pill-topic">{s.topic}</span>}
        {fl && <span className="pill-split">Split</span>}
      </div>
    </div>
  );
}

function Tile({ s, onOpen, hero = false }: { s: Story; onOpen: (s: Story) => void; hero?: boolean }) {
  const fl = s.has_split;
  return (
    <article className={`tile${hero ? " hero" : ""}`} onClick={() => onOpen(s)}>
      <TileImage s={s} fl={fl} />
      <div className="tile-body">
        <h3>{s.neutral_title}</h3>
        {fl ? (
          <>
            <div className="mini">
              <div className="ml"><b>Left</b><span>{leftSpin(s)}</span></div>
              <div className="mr"><b>Right</b><span>{rightSpin(s)}</span></div>
            </div>
            <div className="tile-meta"><LeanBar sources={s.sources} /><span>{s.sources.length} sources</span><span className="tile-cta">Read the split</span></div>
          </>
        ) : (
          <>
            <p className="tile-teaser">{s.neutral_body.slice(0, 150)}{s.neutral_body.length > 150 ? "…" : ""}</p>
            <div className="tile-meta"><LeanBar sources={s.sources} /><span>{s.sources.length} sources</span>{s.trending >= 55 && <span>Trending</span>}</div>
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
      if (v && typeof v.up === "number") { setVotes((p) => ({ ...p, [side]: { up: v.up, down: v.down } })); onToast("Rating recorded"); }
      else onToast("Could not record rating");
    } catch { onToast("Could not record rating"); }
  }
  const verdict = !hasVotes
    ? "No reader ratings yet — rate each side's framing above."
    : la != null && ra != null && la !== ra
      ? `Readers rate the ${la > ra ? "left" : "right"} framing fairer.`
      : "Readers are evenly split on fairness.";

  return (
    <div className="overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {s.image_url && !imgErr && /* eslint-disable-next-line @next/next/no-img-element */ <img className="modal-img" src={s.image_url} alt="" referrerPolicy="no-referrer" onError={() => setImgErr(true)} />}
        <div className="modal-inner">
          <div className="kicker">{s.topic}{s.has_split && <span className="ksplit">Split</span>}{s.has_split && (s.tension_score || 0) >= 60 && <span className="khot">🔥 Hotly contested</span>}<span className="muted">{s.sources.length} sources</span></div>
          <h2>{s.neutral_title}</h2>
          <p className="lede">{s.neutral_body}</p>

          <div className="coverage">
            <div className="lab">Source coverage</div>
            <LeanBar sources={s.sources} full />
          </div>

          {s.has_split && (
            <>
              <div className="vs-label">How each side frames it — whose side are you on?</div>
              <div className="arena">
                <div className="side left">
                  <div className="who">The Left</div>
                  <div className="frame">{s.left_view}</div>
                  <div className="vote-row">
                    <button className="vbtn" onClick={() => vote("left", "up")}>Fair</button>
                    <button className="vbtn" onClick={() => vote("left", "down")}>Unfair</button>
                    <span className="score">{la == null ? "—" : `${la}%`} <small>fair</small></span>
                  </div>
                </div>
                <div className="side right">
                  <div className="who">The Right</div>
                  <div className="frame">{s.right_view}</div>
                  <div className="vote-row">
                    <button className="vbtn" onClick={() => vote("right", "up")}>Fair</button>
                    <button className="vbtn" onClick={() => vote("right", "down")}>Unfair</button>
                    <span className="score">{ra == null ? "—" : `${ra}%`} <small>fair</small></span>
                  </div>
                </div>
              </div>

              <div className="rating">
                <div className="lab">Reader fairness rating</div>
                <div className="fbar"><div className="l" style={{ width: `${lPct}%` }} /><div className="r" style={{ width: `${rPct}%` }} /></div>
                <div className="bar-meta"><span className="ll">Left {lPct}%</span><span className="rr">{rPct}% Right</span></div>
                <div className="verdict">{verdict}</div>
              </div>

              {(s.agree_points.length > 0 || s.split_points.length > 0) && (
                <div className="cols">
                  <div className="col"><h6>What both sides accept</h6><ul>{s.agree_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                  <div className="col"><h6>Where they diverge</h6><ul>{s.split_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                </div>
              )}

            </>
          )}

          <div className="fl-foot">
            {s.has_split && s.tension_score != null && <span>Divergence {s.tension_score}/100</span>}
            <ShareMenu title={s.neutral_title} path={`/s/${s.id}`} onToast={onToast} />
          </div>

          <div className="fl-sources">
            {s.sources.slice(0, 10).map((src, i) => (
              <a key={i} className="chip" href={src.url} target="_blank" rel="noopener nofollow"><span className={`dot ${src.lean}`} />{src.name}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feed({ initial, local = [] }: { initial: Story[]; local?: Story[] }) {
  const [mode, setMode] = useState<"faultlines" | "wire" | "local">("faultlines");
  const [topic, setTopic] = useState<string>("all");
  const [open, setOpen] = useState<Story | null>(null);
  const [wall, setWall] = useState(false);
  const [authed, setAuthed] = useState(true); // assume allowed until session checked (no flash for members)
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  useEffect(() => {
    const sb = supabase(); if (!sb) { setAuthed(false); return; }
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Deep-link the open story (shareable URL). After 3 free reads, non-members hit the free sign-in wall.
  const openStory = (s: Story) => {
    if (!authed && !canRead(s.id)) { setWall(true); return; }
    recordRead(s.id);
    setOpen(s);
    try { history.pushState({ flStory: s.id }, "", `/s/${s.id}`); } catch { /* noop */ }
  };
  const closeModal = () => { if (typeof history !== "undefined" && history.state?.flStory) history.back(); else setOpen(null); };
  useEffect(() => {
    const onPop = () => setOpen(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Debate score: tension + how much the crowd is fighting about it → drives "Most Debated".
  const debate = (s: Story) => (s.tension_score || 0) + (s.votes.left.up + s.votes.left.down + s.votes.right.up + s.votes.right.down) * 4;
  const splits = useMemo(() => initial.filter((s) => s.has_split).sort((a, b) => debate(b) - debate(a)), [initial]);
  const wire = useMemo(() => initial.filter((s) => !s.has_split).sort((a, b) => b.trending - a.trending), [initial]);

  const base = mode === "local" ? local : mode === "faultlines" ? splits : wire;
  const filtered = topic === "all" ? base : base.filter((s) => s.topic === topic);
  // Always mix a little local into the national views so the homepage is national + local.
  const list = useMemo(() => {
    if (mode === "local" || topic !== "all" || !local.length) return filtered;
    const out: Story[] = []; let li = 0;
    filtered.forEach((s, i) => {
      out.push(s);
      if (i > 0 && (i + 1) % 7 === 0 && li < local.length) out.push(local[li++]);
    });
    return out;
  }, [filtered, local, mode, topic]);

  return (
    <>
      <div className="subnav">
        <div className="subnav-inner">
          <div className="modeswitch">
            <button className="mode" aria-selected={mode === "faultlines"} onClick={() => setMode("faultlines")}>
              <span className="mt">🔥 Most Debated<span className="count">{splits.length}</span></span>
            </button>
            <button className="mode" aria-selected={mode === "wire"} onClick={() => setMode("wire")}>
              <span className="mt">The Wire<span className="count">{wire.length}</span></span>
            </button>
            {local.length > 0 && (
              <button className="mode" aria-selected={mode === "local"} onClick={() => setMode("local")}>
                <span className="mt">📍 Local<span className="count">{local.length}</span></span>
              </button>
            )}
          </div>
          <nav className="topics" role="tablist">
            {TOPICS.map((t) => (
              <button key={t} className="topic-pill" role="tab" aria-selected={t === topic} onClick={() => setTopic(t)}>{LABEL[t]}</button>
            ))}
          </nav>
        </div>
      </div>

      <main>
        {list.length ? (
          <div className="grid">
            {list.map((s, i) => (
              <Fragment key={s.id}>
                <Tile s={s} onOpen={openStory} hero={i === 0} />
                {i > 0 && (i + 1) % AD_EVERY === 0 && i < list.length - 1 && <AdSlot slot={AD_INFEED} />}
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="empty">
            {mode === "faultlines"
              ? (splits.length ? `No fault lines in ${LABEL[topic]} right now.` : "No earned splits at the moment — we only show a split when left and right genuinely diverge. See The Wire.")
              : mode === "local"
                ? "Local stories fill in as the newsroom runs — check the Seattle & SF editions."
                : `No stories in ${LABEL[topic]} yet.`}
          </div>
        )}
      </main>

      {open && <Modal s={open} onClose={closeModal} onToast={showToast} />}
      {wall && <SignInWall onClose={() => setWall(false)} />}

      <nav className="bottomnav">
        <button aria-selected={mode === "faultlines"} onClick={() => { setMode("faultlines"); window.scrollTo(0, 0); }}>
          <span className="bn-ic">F</span>Fault Lines
        </button>
        <button aria-selected={mode === "wire"} onClick={() => { setMode("wire"); window.scrollTo(0, 0); }}>
          <span className="bn-ic">W</span>The Wire
        </button>
        <button aria-selected={mode === "local"} onClick={() => { setMode("local"); window.scrollTo(0, 0); }}>
          <span className="bn-ic">◎</span>Local
        </button>
      </nav>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
