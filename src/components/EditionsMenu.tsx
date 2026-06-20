"use client";
import { useEffect, useRef, useState } from "react";

const EDITIONS = [
  { key: "national", label: "National", href: "/" },
  { key: "seattle", label: "Seattle", href: "/city/seattle" },
  { key: "sf", label: "San Francisco", href: "/city/sf" },
];

export default function EditionsMenu({ current = "national" }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = EDITIONS.find((e) => e.key === current) || EDITIONS[0];
  return (
    <div className="ed-menu" ref={ref}>
      <button className="ed-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        <span className="ed-dot" /> {cur.label} <span className="ed-caret">▾</span>
      </button>
      {open && (
        <div className="ed-pop">
          <div className="ed-pop-h">Editions</div>
          {EDITIONS.map((e) => (
            <a key={e.key} href={e.href} className={`ed-item${e.key === current ? " on" : ""}`}>{e.label}</a>
          ))}
        </div>
      )}
    </div>
  );
}
