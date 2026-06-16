"use client";
import { useEffect, useRef } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // ca-pub-XXXXXXXXXXXXXXXX

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

/**
 * One responsive in-feed ad. Renders a real Google AdSense unit once
 * NEXT_PUBLIC_ADSENSE_CLIENT (+ a slot id) are set; otherwise shows a labeled
 * placeholder so ad placement is visible before the account is approved.
 */
export default function AdSlot({ slot, label = "Advertisement" }: { slot?: string; label?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const live = Boolean(CLIENT && slot);

  useEffect(() => {
    if (!live) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* ignore */ }
  }, [live]);

  return (
    <div className="adwrap">
      <div className="adlabel">{label}</div>
      {live ? (
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="adplaceholder">Ad space — your sponsor here</div>
      )}
    </div>
  );
}
