// Lightweight event beacon — piggybacks on the KYTEPUSH fleet analytics endpoint (same one track.js
// uses for pageviews). Events are sent as a pixel to /api/track with an event namespace in the path,
// so they show up alongside pageviews without needing a new vendor. Fire-and-forget, never throws.
export function track(event: string, detail?: string) {
  if (typeof window === "undefined") return;
  try {
    const q = new URLSearchParams({
      s: "faultlines",
      p: "/_e/" + event + (detail ? "/" + detail : ""),
      e: event,
      r: location.pathname,
      t: String(Date.now()),
    });
    if (detail) q.set("d", detail);
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = "https://kytepush.com/api/track?" + q.toString();
  } catch {
    /* analytics must never break the app */
  }
}
