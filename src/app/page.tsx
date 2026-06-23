import { headers } from "next/headers";
import { getStories, getCityStories } from "@/lib/stories";
import { getWeather, CITIES } from "@/lib/city";
import Feed from "@/components/Feed";
import Dateline from "@/components/Dateline";
import EditionsMenu from "@/components/EditionsMenu";
import AuthButton from "@/components/AuthButton";
import StreakBadge from "@/components/StreakBadge";

// Map a Vercel-detected city name to one of our editions.
const GEO: Record<string, string> = {
  "seattle": "seattle", "san francisco": "sf", "new york": "nyc",
  "los angeles": "la", "chicago": "chicago", "washington": "dc",
};

export default async function Home() {
  const h = await headers();
  const geoCity = (h.get("x-vercel-ip-city") || "").toLowerCase();
  const mySlug = GEO[geoCity] || null;

  const [stories] = await Promise.all([getStories()]);
  // Prefer the visitor's city for the local mix; otherwise blend Seattle + SF so there's always local.
  const localSlugs = mySlug ? [mySlug] : ["seattle", "sf"];
  const localSets = await Promise.all(localSlugs.map((s) => getCityStories(s)));
  const local = localSlugs.flatMap((slug, i) =>
    localSets[i].map((s) => ({ ...s, _city: slug, _cityName: CITIES[slug]?.name || slug }))
  );
  const wx = mySlug && CITIES[mySlug] ? await getWeather(CITIES[mySlug]) : await getWeather(CITIES.seattle);
  const banner = mySlug
    ? { name: CITIES[mySlug].name, slug: mySlug, text: `You're in ${CITIES[mySlug].name} — local stories are mixed into your feed.` }
    : { name: "Seattle", slug: "seattle", text: "Local editions are live — Seattle, SF, New York, LA, Chicago & D.C." };

  return (
    <>
      <header className="app">
        <div className="topline" />
        <div className="bar">
          <a href="/" className="wordmark">Fault<span className="seam" />Lines</a>
          <div className="mast-actions">
            <StreakBadge />
            <Dateline />
            <EditionsMenu current="national" />
            <AuthButton />
          </div>
        </div>
      </header>

      <a className="localbanner" href={`/city/${banner.slug}`}>
        <span className="lb-pin">📍</span>
        <span className="lb-txt"><b>{banner.text.split(" — ")[0]}</b>{wx ? ` ${wx.icon} ${wx.temp}°` : ""} {banner.text.includes(" — ") ? "— " + banner.text.split(" — ")[1] : ""}</span>
        <span className="lb-go">{banner.name} edition →</span>
      </a>

      <Feed initial={stories} local={local} />

      <footer className="app">
        <div>We don&apos;t tell you what to think — we show you where the country splits, and why.</div>
        <div style={{ marginTop: 8 }}>
          <strong style={{ color: "var(--ink-dim)" }}>Editions:</strong>{" "}
          <a href="/city/seattle">Seattle</a> · <a href="/city/sf">SF</a> · <a href="/city/nyc">New York</a> · <a href="/city/la">LA</a> · <a href="/city/chicago">Chicago</a> · <a href="/city/dc">D.C.</a>
        </div>
        <div style={{ marginTop: 8 }}>
          <a href="/about">Methodology</a> · <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </>
  );
}
