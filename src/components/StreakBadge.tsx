"use client";
import { useEffect, useState } from "react";
import { tickStreak } from "@/lib/streak";
import { track } from "@/lib/track";

// Subtle flame badge in the masthead; celebrates briefly when the streak advances to a new day.
export default function StreakBadge() {
  const [count, setCount] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const s = tickStreak();
    setCount(s.count);
    if (s.bumped && s.count >= 2) {
      setCelebrate(true);
      track("streak", String(s.count));
      const t = setTimeout(() => setCelebrate(false), 2600);
      return () => clearTimeout(t);
    }
  }, []);

  if (count < 2) return null; // a "1-day streak" isn't worth showing
  return (
    <span className={`streak${celebrate ? " pop" : ""}`} title={`${count}-day reading streak`}>
      <span className="streak-flame">🔥</span>{count}
      {celebrate && <span className="streak-toast">🔥 {count}-day streak — keeping up with both sides!</span>}
    </span>
  );
}
