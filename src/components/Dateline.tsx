"use client";
import { useEffect, useState } from "react";

export default function Dateline() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="dateline" suppressHydrationWarning>
      <span className="livedot" /> LIVE · {now}
    </span>
  );
}
