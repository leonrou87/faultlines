"use client";
import { useState } from "react";
import type { Poll } from "@/lib/city";

export default function PollWidget({ poll }: { poll: Poll }) {
  const [votes, setVotes] = useState<number[]>(poll.votes);
  const [voted, setVoted] = useState(false);
  const total = votes.reduce((a, b) => a + b, 0);

  async function vote(i: number) {
    if (voted) return;
    setVotes((v) => v.map((n, idx) => (idx === i ? n + 1 : n))); // optimistic
    setVoted(true);
    try {
      await fetch("/api/poll", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ poll_id: poll.id, option_idx: i }) });
    } catch { /* keep optimistic */ }
  }

  return (
    <div className="poll">
      <div className="poll-q">{poll.question}</div>
      <div className="poll-opts">
        {poll.options.map((opt, i) => {
          const pct = total ? Math.round((100 * votes[i]) / total) : 0;
          return (
            <button key={i} className={`poll-opt${voted ? " done" : ""}`} onClick={() => vote(i)} disabled={voted}>
              {voted && <span className="poll-fill" style={{ width: `${pct}%` }} />}
              <span className="poll-label">{opt}</span>
              {voted && <span className="poll-pct">{pct}%</span>}
            </button>
          );
        })}
      </div>
      <div className="poll-total">{voted ? `${total} vote${total === 1 ? "" : "s"}` : "Tap to vote — see how the city leans"}</div>
    </div>
  );
}
