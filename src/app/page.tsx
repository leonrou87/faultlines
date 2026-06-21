import { getStories, getCityStories } from "@/lib/stories";
import { getWeather, CITIES } from "@/lib/city";
import Feed from "@/components/Feed";
import Dateline from "@/components/Dateline";
import EditionsMenu from "@/components/EditionsMenu";

export const revalidate = 60;

export default async function Home() {
  const [stories, seattle, sf, wx] = await Promise.all([
    getStories(),
    getCityStories("seattle"),
    getCityStories("sf"),
    getWeather(CITIES.seattle),
  ]);
  const local = [
    ...seattle.map((s) => ({ ...s, _city: "seattle", _cityName: "Seattle" })),
    ...sf.map((s) => ({ ...s, _city: "sf", _cityName: "San Francisco" })),
  ];

  return (
    <>
      <header className="app">
        <div className="topline" />
        <div className="bar">
          <a href="/" className="wordmark">Fault<span className="seam" />Lines</a>
          <div className="mast-actions">
            <EditionsMenu current="national" />
            <Dateline />
          </div>
        </div>
      </header>

      <a className="localbanner" href="/city/seattle">
        <span className="lb-pin">📍</span>
        <span className="lb-txt"><b>Local editions are live.</b> Seattle{wx ? ` ${wx.icon} ${wx.temp}°` : ""} &amp; San Francisco — dive into your city.</span>
        <span className="lb-go">Go local →</span>
      </a>

      <Feed initial={stories} local={local} />

      <footer className="app">
        <div>We don&apos;t tell you what to think — we show you where the country splits, and why.</div>
        <div style={{ marginTop: 8 }}>
          <strong style={{ color: "var(--ink-dim)" }}>Editions:</strong> <a href="/city/seattle">Seattle</a> · <a href="/city/sf">San Francisco</a>
        </div>
        <div style={{ marginTop: 8 }}>
          <a href="/about">Methodology</a> · <a href="/privacy">Privacy</a>
        </div>
      </footer>
    </>
  );
}
