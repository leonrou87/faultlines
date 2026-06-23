"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/track";

// One-time first-run explainer. New visitors (including those landing from a shared link) need to
// instantly grasp the product: one neutral story + how each side frames it + you judge fairness.
const KEY = "fl_intro_v1";

export default function Onboarding() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) { setShow(true); track("intro_shown"); } } catch { /* noop */ }
  }, []);
  function dismiss(how: string) {
    try { localStorage.setItem(KEY, "1"); } catch { /* noop */ }
    track("intro_done", how);
    setShow(false);
  }
  if (!show) return null;
  return (
    <div className="intro-overlay" onClick={() => dismiss("backdrop")}>
      <div className="intro" onClick={(e) => e.stopPropagation()}>
        <div className="intro-top" />
        <div className="intro-body">
          <div className="intro-mark">Fault<span className="seam" />Lines</div>
          <h2>See every side of the story.</h2>
          <p className="intro-sub">We write <b>one neutral account</b> of each story — then show you exactly how the <b className="ll">left</b> and <b className="rr">right</b> frame it. You decide who&apos;s being fair.</p>
          <div className="intro-steps">
            <div className="intro-step"><span className="is-ic">◎</span><div><b>One neutral core</b><span>Just the corroborated facts, original prose.</span></div></div>
            <div className="intro-step"><span className="is-ic">⇄</span><div><b>Both sides, steelmanned</b><span>The strongest case from each side, labeled.</span></div></div>
            <div className="intro-step"><span className="is-ic">★</span><div><b>You be the judge</b><span>Vote on which framing is fair. Share the debate.</span></div></div>
          </div>
          <button className="intro-cta" onClick={() => dismiss("start")}>Start reading</button>
          <div className="intro-foot">Independent · unbiased · free</div>
        </div>
      </div>
    </div>
  );
}
