"use client";
import { useEffect, useState } from "react";

// Thin scroll-progress bar pinned to the top — a small modern touch on the long-form story page,
// which is also where visitors arriving from a shared link land.
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return <div className="readprog" style={{ width: `${pct}%` }} aria-hidden />;
}
