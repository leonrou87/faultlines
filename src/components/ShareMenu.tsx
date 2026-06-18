"use client";
import { useEffect, useRef, useState } from "react";

export default function ShareMenu({ title, path, onToast }: { title: string; path: string; onToast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://faultlines.kytepush.com";
  const url = origin + path;
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  const links: [string, string][] = [
    ["X / Twitter", `https://twitter.com/intent/tweet?text=${t}&url=${u}&via=FaultLines`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ["Reddit", `https://www.reddit.com/submit?url=${u}&title=${t}`],
  ];

  async function nativeOrCopy() {
    if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(url); onToast("Link copied"); } catch { onToast("Copy failed"); }
    setOpen(false);
  }

  return (
    <div className="sharewrap" ref={ref}>
      <button className="share" onClick={() => setOpen((o) => !o)}>Share</button>
      {open && (
        <div className="sharemenu">
          {links.map(([label, href]) => (
            <button key={label} onClick={() => { window.open(href, "_blank", "noopener,width=620,height=560"); setOpen(false); }}>{label}</button>
          ))}
          <button onClick={nativeOrCopy}>Copy link</button>
          <button onClick={() => { window.open(`/s/${path.split("/").pop()}/instagram`, "_blank"); setOpen(false); }}>Save card for Instagram</button>
        </div>
      )}
    </div>
  );
}
