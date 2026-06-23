"use client";
import { useState } from "react";
import type { Story } from "@/lib/stories";
import { track } from "@/lib/track";

// Interactive split voting for the standalone story page, so shared-link visitors can engage
// (vote + see the reader fairness verdict + share their take), not just read.
export default function SplitVote({ s }: { s: Story }) {
  const [votes, setVotes] = useState(s.votes);
  const [myTake, setMyTake] = useState<null | "left" | "right">(null);
  const [toast, setToast] = useState("");
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };

  const approval = (v: { up: number; down: number }) => (v.up + v.down ? Math.round((100 * v.up) / (v.up + v.down)) : null);
  const la = approval(votes.left), ra = approval(votes.right);
  const fairTotal = votes.left.up + votes.right.up;
  const lPct = fairTotal ? Math.round((100 * votes.left.up) / fairTotal) : 50, rPct = 100 - lPct;
  const hasVotes = votes.left.up + votes.left.down + votes.right.up + votes.right.down > 0;

  async function vote(side: "left" | "right", dir: "up" | "down") {
    try {
      const r = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ story_id: s.id, side, dir }) });
      const v = await r.json();
      if (v && typeof v.up === "number") { setVotes((p) => ({ ...p, [side]: { up: v.up, down: v.down } })); show("Rating recorded"); track("vote", `${side}:${dir}`); if (dir === "up") setMyTake(side); }
      else show("Could not record rating");
    } catch { show("Could not record rating"); }
  }
  function shareTake(how: "x" | "copy") {
    const url = `https://faultlines.kytepush.com/s/${s.id}`;
    const text = `I think the ${myTake === "left" ? "Left" : "Right"}'s framing is fairer on "${s.neutral_title}". Whose side are you on?`;
    track("share_take", `${myTake}:${how}`);
    if (how === "x") { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "noopener"); return; }
    navigator.clipboard?.writeText(`${text} ${url}`).then(() => show("Link copied — go spark the debate")).catch(() => show("Could not copy"));
  }
  const verdict = !hasVotes ? "No reader ratings yet — rate each side's framing above."
    : la != null && ra != null && la !== ra ? `Readers rate the ${la > ra ? "left" : "right"} framing fairer.`
    : "Readers are evenly split on fairness.";

  return (
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
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
