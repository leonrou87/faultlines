"use client";
import { useRef, useState } from "react";
import type { Story, Vote } from "@/lib/stories";

const TOPICS = ["all", "top", "politics", "business", "tech", "world", "sports"] as const;
const LABEL: Record<string, string> = { all: "All", top: "Top", politics: "Politics", business: "Business", tech: "Tech", world: "World", sports: "Sports" };
const approval = (v: Vote) => (v.up + v.down ? Math.round((100 * v.up) / (v.up + v.down)) : null);

function SourceChips({ sources }: { sources: Story["sources"] }) {
  const shown = sources.slice(0, 5);
  const extra = sources.length - shown.length;
  return (
    <div className="sources">
      {shown.map((s, i) => (
        <a key={i} className="chip" href={s.url} target="_blank" rel="noopener nofollow">
          <span className={`dot ${s.lean}`} />{s.name}
        </a>
      ))}
      {extra > 0 && <span className="more-src">+{extra} more</span>}
    </div>
  );
}

function Split({ story, onToast }: { story: Story; onToast: (m: string) => void }) {
  const [pos, setPos] = useState(1);
  const [votes, setVotes] = useState(story.votes);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, startX: 0, dx: 0, w: 1 });

  const apply = (p: number, animate = true) => {
    const np = Math.max(0, Math.min(2, p));
    setPos(np);
    const t = trackRef.current;
    if (t) { t.classList.toggle("dragging", !animate); t.style.transform = `translateX(${-np * 33.3333}%)`; }
  };
  const down = (x: number) => { drag.current = { on: true, startX: x, dx: 0, w: stageRef.current?.clientWidth || 1 }; trackRef.current?.classList.add("dragging"); };
  const move = (x: number) => {
    const d = drag.current; if (!d.on) return;
    d.dx = x - d.startX;
    const base = -pos * 33.3333;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${base + (d.dx / d.w) * 33.3333}%)`;
  };
  const up = () => { const d = drag.current; if (!d.on) return; d.on = false; const m = d.dx / d.w; if (m < -0.18) apply(pos + 1); else if (m > 0.18) apply(pos - 1); else apply(pos); };

  async function vote(side: "left" | "right", dir: "up" | "down") {
    try {
      const r = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ story_id: story.id, side, dir }) });
      const v = await r.json();
      if (v && typeof v.up === "number") { setVotes((prev) => ({ ...prev, [side]: { up: v.up, down: v.down } })); onToast("Vote counted"); }
      else onToast("Could not vote");
    } catch { onToast("Could not vote"); }
  }

  const tip = Math.max(0, Math.min(100, story.tension_score ?? 0));
  return (
    <div className="split">
      <div className="split-head">
        <h4>The Split</h4>
        <div className="seg">
          <button className={`l ${pos === 0 ? "on" : ""}`} onClick={() => apply(0)}>Left</button>
          <button className={`n ${pos === 1 ? "on" : ""}`} onClick={() => apply(1)}>Seam</button>
          <button className={`r ${pos === 2 ? "on" : ""}`} onClick={() => apply(2)}>Right</button>
        </div>
      </div>
      <div
        className="stage" ref={stageRef}
        onTouchStart={(e) => down(e.touches[0].clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchEnd={up}
        onMouseDown={(e) => down(e.clientX)}
        onMouseMove={(e) => drag.current.on && move(e.clientX)}
        onMouseUp={up}
        onMouseLeave={up}
      >
        <div className="seam-line" />
        <div className="track" ref={trackRef} style={{ transform: "translateX(-33.3333%)" }}>
          <div className="panel left"><h5>How the left frames it</h5><p>{story.left_view}</p></div>
          <div className="panel neutral"><div className="hint">Both sides accept the same facts. Drag to see how each frames them.</div><div className="arrows">‹ ›</div></div>
          <div className="panel right"><h5>How the right frames it</h5><p>{story.right_view}</p></div>
        </div>
      </div>

      <div className="votes">
        {(["left", "right"] as const).map((side) => {
          const v = votes[side]; const a = approval(v);
          return (
            <div className={`vote-card ${side}`} key={side}>
              <div className="lbl"><b>{side === "left" ? "Left view" : "Right view"}</b><span>{v.up + v.down} votes</span></div>
              <div className="approval">{a == null ? "—" : a + "%"} <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>fair</span></div>
              <div className="vbtns"><button onClick={() => vote(side, "up")}>👍</button><button onClick={() => vote(side, "down")}>👎</button></div>
            </div>
          );
        })}
      </div>

      <div className="tension">
        <div className="t-top"><span>TENSION</span><span>{tip}/100</span></div>
        <div className="t-bar"><div className="marker" style={{ left: `${tip}%` }} /></div>
        {story.tension_rationale && <div className="t-rationale">{story.tension_rationale}</div>}
      </div>

      {(story.agree_points.length > 0 || story.split_points.length > 0) && (
        <div className="cols">
          <div className="col agree"><h6>✓ Both sides agree</h6><ul>{story.agree_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
          <div className="col split"><h6>⟍ Where they split</h6><ul>{story.split_points.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
        </div>
      )}
    </div>
  );
}

function StoryCard({ story, onToast }: { story: Story; onToast: (m: string) => void }) {
  return (
    <article className="card">
      <div className="meta-row">
        <span className={`tag${story.has_split ? " split" : ""}`}>{story.topic}</span>
        {story.has_split && <span className="tag split">⟍ Split</span>}
        <span style={{ marginLeft: "auto" }}>{story.sources.length} sources</span>
      </div>
      <h2 className="headline">{story.neutral_title}</h2>
      <div className="body">{story.neutral_body}</div>
      <SourceChips sources={story.sources} />
      {story.has_split && <Split story={story} onToast={onToast} />}
    </article>
  );
}

export default function Feed({ initial }: { initial: Story[] }) {
  const [topic, setTopic] = useState<string>("all");
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };
  const list = topic === "all" ? initial : initial.filter((s) => s.topic === topic);

  return (
    <>
      <nav className="topics" role="tablist">
        {TOPICS.map((t) => (
          <button key={t} className="topic-pill" role="tab" aria-selected={t === topic} onClick={() => setTopic(t)}>{LABEL[t]}</button>
        ))}
      </nav>
      <main>
        {list.length ? (
          list.map((s) => <StoryCard key={s.id} story={s} onToast={showToast} />)
        ) : (
          <div className="empty">{initial.length ? `No stories in “${LABEL[topic]}” yet.` : "The newsroom is publishing the first edition — check back shortly."}</div>
        )}
      </main>
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
