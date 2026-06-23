"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { Story, Vote, Coverage } from "@/lib/stories";
import AdSlot from "@/components/AdSlot";
import ShareMenu from "@/components/ShareMenu";
import SignInWall from "@/components/SignInWall";
import { canRead, recordRead } from "@/lib/gate";
import { supabase } from "@/lib/supabase-browser";
import { track } from "@/lib/track";

const TOPICS = ["all", "top", "politics", "business", "tech", "world", "sports"] as const;
const LABEL: Record<string, string> = { all: "All", top: "Top", politics: "Politics", business: "Business", tech: "Tech", world: "World", sports: "Sports" };
const AD_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED;
const AD_EVERY = 6;

const approval = (v: Vote) => (v.up + v.down ? Math.round((100 * v.up) / (v.up + v.down)) : null);
const firstSentence = (t: string | null) => (t || "").split(/(?<=[.!?])\s/)[0] || "";
const leftSpin = (s: Story) => s.left_summary || firstSentence(s.left_view);
const rightSpin = (s: Story) => s.right_summary || firstSentence(s.right_view);

const ageMin = (iso: string | null) => (iso ? (Date.now() - Date.parse(iso)) / 60000 : Infinity);
function timeAgo(iso: string | null): string {
  const m = ageMin(iso);
  if (!isFinite(m)) return "";
  if (m < 1) return "just now";
  if (m < 60) return `${Math.round(m)}m ago`;
  const h = m / 60;
  if (h < 24) return `${Math.round(h)}h ago`;
  const d = h / 24;
  return d < 7 ? `${Math.round(d)}d ago` : `${Math.round(d / 7)}w ago`;
}
const isBreaking = (s: Story) => ageMin(s.published_at) < 90 && s.trending >= 50;

// Coverage-by-lean bar (the signal a bias product should lead with). Anonymized — shows how the
// political spectrum is covering a story, never which outlets.
function LeanBar({ coverage, full = false }: { coverage: Coverage; full?: boolean }) {
  const { l, c, r } = coverage;
  const t = l + c + r || 1;
  const pct = (n: number) => `${(100 * n) / t}%`;
  return (
    <div className={`leanbar${full ? " full" : ""}`} title="Coverage across the political spectrum">
      <div className="lb-track">
        <i className="lb-l" style={{ width: pct(l) }} />
        <i className="lb-c" style={{ width: pct(c) }} />
        <i className="lb-r" style={{ width: pct(r) }} />
      </div>
      {full && <div className="lb-counts"><span className="ll">Left</span><span>Center</span><span className="rr">Right</span></div>}
    </div>
  );
}

function TileImage({ s, fl }: { s: Story; fl: boolean }) {
  const [err, setErr] = useState(false);
  const showImg = s.image_url && !err;
  return (
    <div className="tile-imgwrap">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tile-img" src={s.image_url!} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setErr(true)} />
      ) : (
        // Designed cover when there's no usable photo — looks intentional, not broken.
        <div className="tile-fallback" data-topic={s._cityName ? "local" : s.topic}>
          <span className="tf-mark">Fault<i className="seam" />Lines</span>
          <span className="tf-topic">{s._cityName || s.topic}</span>
        </div>
      )}
      <div className="tile-badges">
        {isBreaking(s) ? <span className="pill-breaking">● Breaking</span> : s._cityName ? <span className="pill-local">📍 {s._cityName}</span> : <span className="pill-topic">{s.topic}</span>}
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
            <div className="tile-meta"><LeanBar coverage={s.coverage} />{s.published_at && <span className="tile-time">{timeAgo(s.published_at)}</span>}<span className="tile-cta">Read the split →</span></div>
          </>
        ) : (
          <>
            <p className="tile-teaser">{s.neutral_body.slice(0, 150)}{s.neutral_body.length > 150 ? "…" : ""}</p>
            <div className="tile-meta"><LeanBar coverage={s.coverage} />{s.published_at && <span className="tile-time">{timeAgo(s.published_at)}</span>}{s.trending >= 55 && <span className="tile-hot">🔥 Trending</span>}</div>
          </>
        )}
      </div>
    </article>
  );
}

function Modal({ s, onClose, onToast }: { s: Story; onClose: () => void; onToast: (m: string) => void }) {
  const [votes, setVotes] = useState(s.votes);
  const [imgErr, setImgErr] = useState(false);
  const [myTake, setMyTake] = useState<null | "left" | "right">(null);

  function shareTake(how: "x" | "copy") {
    const url = `https://faultlines.kytepush.com/s/${s.id}`;
    const side = myTake === "left" ? "the Left" : "the Right";
    const text = `I think ${side}'s framing is fairer on "${s.neutral_title}". Whose side are you on?`;
    track("share_take", `${myTake}:${how}`);
    if (how === "x") { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "noopener"); return; }
    navigator.clipboard?.writeText(`${text} ${url}`).then(() => onToast("Link copied — go spark the debate")).catch(() => onToast("Could not copy"));
  }
  const la = approval(votes.left), ra = approval(votes.right);
  const lFair = votes.left.up, rFair = votes.right.up, fairTotal = lFair + rFair;
  const lPct = fairTotal ? Math.round((100 * lFair) / fairTotal) : 50, rPct = 100 - lPct;
  const hasVotes = votes.left.up + votes.left.down + votes.right.up + votes.right.down > 0;

  async function vote(side: "left" | "right", dir: "up" | "down") {
    try {
      const r = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ story_id: s.id, side, dir }) });
      const v = await r.json();
      if (v && typeof v.up === "number") { setVotes((p) => ({ ...p, [side]: { up: v.up, down: v.down } })); onToast("Rating recorded"); track("vote", `${side}:${dir}`); if (dir === "up") setMyTake(side); }
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
          <div className="kicker">{s.topic}{s.has_split && <span className="ksplit">Split</span>}{s.has_split && (s.tension_score || 0) >= 60 && <span className="khot">🔥 Hotly contested</span>}</div>
          <h2>{s.neutral_title}</h2>
          <p className="lede">{s.neutral_body}</p>

          <div className="coverage">
            <div className="lab">Across the spectrum</div>
            <LeanBar coverage={s.coverage} full />
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

              {myTake && (
                <div className="take-share">
                  <div className="ts-msg">You side with the <b className={myTake === "left" ? "ll" : "rr"}>{myTake === "left" ? "Left" : "Right"}</b> framing. Now make your friends pick.</div>
                  <div className="ts-actions">
                    <button className="ts-x" onClick={() => shareTake("x")}>Share on X</button>
                    <button className="ts-copy" onClick={() => shareTake("copy")}>Copy link</button>
                  </div>
                </div>
              )}

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
  const [query, setQuery] = useState("");
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
    if (!authed && !canRead(s.id)) { setWall(true); track("wall"); return; }
    recordRead(s.id);
    track("read", s._cityName || s.city || s.topic);
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

  const q = query.trim().toLowerCase();
  // When searching, look across everything (all splits + wire + local), not just the active tab.
  const searchPool = useMemo(() => (q ? [...splits, ...wire, ...local] : []), [q, splits, wire, local]);
  const base = q ? searchPool : mode === "local" ? local : mode === "faultlines" ? splits : wire;
  const searched = q ? base.filter((s) => `${s.neutral_title} ${s.neutral_body}`.toLowerCase().includes(q)) : base;
  const filtered = topic === "all" ? searched : searched.filter((s) => s.topic === topic);
  // Always mix a little local into the national views so the homepage is national + local.
  const list = useMemo(() => {
    let base2 = filtered;
    if (!(q || mode === "local" || topic !== "all" || !local.length)) {
      const out: Story[] = []; let li = 0;
      filtered.forEach((s, i) => {
        out.push(s);
        if (i > 0 && (i + 1) % 7 === 0 && li < local.length) out.push(local[li++]);
      });
      base2 = out;
    }
    // Promote the first story that has a real photo into the hero slot (no placeholder hero).
    if (base2.length > 1 && !base2[0].image_url) {
      const hi = base2.findIndex((s) => !!s.image_url);
      if (hi > 0) base2 = [base2[hi], ...base2.slice(0, hi), ...base2.slice(hi + 1)];
    }
    return base2;
  }, [filtered, local, mode, topic, q]);

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
          <div className="subnav-row">
            <nav className="topics" role="tablist">
              {TOPICS.map((t) => (
                <button key={t} className="topic-pill" role="tab" aria-selected={t === topic} onClick={() => setTopic(t)}>{LABEL[t]}</button>
              ))}
            </nav>
            <div className="searchwrap">
              <span className="search-ic" aria-hidden>⌕</span>
              <input className="search-input" type="search" placeholder="Search stories" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search stories" />
              {query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">✕</button>}
            </div>
          </div>
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
            {q
              ? `No stories match “${query}”.`
              : mode === "faultlines"
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
