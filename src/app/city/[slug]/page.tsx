import { getCityStories } from "@/lib/stories";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 120;

const CITIES: Record<string, string> = { seattle: "Seattle", sf: "San Francisco" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = CITIES[slug];
  if (!name) return { title: "City not found" };
  return { title: `${name} — Fault Lines`, description: `Local ${name} news, summarized neutrally.` };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = CITIES[slug];
  if (!name) notFound();
  const stories = await getCityStories(slug);

  return (
    <>
      <header className="app">
        <div className="topline" />
        <div className="bar">
          <a href="/" className="wordmark">Fault<span className="seam" />Lines</a>
          <span className="dateline" style={{ marginLeft: "auto" }}>{name.toUpperCase()} EDITION</span>
        </div>
      </header>

      <main>
        <h1 style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 26, letterSpacing: "-.5px", margin: "6px 0 4px" }}>{name}</h1>
        <p style={{ color: "var(--ink-faint)", fontSize: 13, margin: "0 0 18px" }}>
          Local news from {name}, summarized neutrally from local outlets.{" "}
          <a href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>National →</a>
        </p>

        {stories.length ? (
          <div className="grid">
            {stories.map((s) => (
              <a key={s.id} className="tile" href={`/s/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="tile-imgwrap">
                  {s.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tile-img" src={s.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="tile-fallback"><span className="seam" /></div>
                  )}
                  <div className="tile-badges">
                    <span className="pill-topic">{s.topic}</span>
                    {s.has_split && <span className="pill-split">Split</span>}
                  </div>
                </div>
                <div className="tile-body">
                  <h3>{s.neutral_title}</h3>
                  <p className="tile-teaser">{s.neutral_body.slice(0, 150)}{s.neutral_body.length > 150 ? "…" : ""}</p>
                  <div className="tile-meta"><span>{s.sources.length} sources</span></div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty">No {name} stories yet — the local edition fills as the newsroom runs. Check back soon.</div>
        )}
      </main>

      <footer className="app">
        <div>Editions: <a href="/city/seattle">Seattle</a> · <a href="/city/sf">San Francisco</a> · <a href="/">National</a></div>
      </footer>
    </>
  );
}
