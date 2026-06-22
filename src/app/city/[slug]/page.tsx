import { getCityStories } from "@/lib/stories";
import { getWeather, getIssues, CITIES } from "@/lib/city";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditionsMenu from "@/components/EditionsMenu";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES[slug];
  if (!c) return { title: "City not found" };
  return { title: `${c.name} — Fault Lines`, description: `Local ${c.name} news, issues, weather and what to do — summarized neutrally.` };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CITIES[slug];
  if (!c) notFound();
  const [stories, weather, issues] = await Promise.all([getCityStories(slug), getWeather(c), getIssues(slug)]);

  return (
    <>
      <header className="app">
        <div className="topline" style={{ background: c.accent }} />
        <div className="bar">
          <a href="/" className="wordmark">Fault<span className="seam" />Lines</a>
          <div className="mast-actions">
            <EditionsMenu current={slug} />
            {weather && <span className="wx">{weather.icon} {weather.temp}° <span className="wx-l">{weather.label}</span></span>}
          </div>
        </div>
      </header>

      <main>
        <section className="city-hero" style={{ borderColor: c.accent }}>
          <div className="city-edition" style={{ color: c.accent }}>{c.name.toUpperCase()} EDITION</div>
          <h1 className="city-name">{c.name}</h1>
          <div className="city-tag">{c.tagline}</div>
          <p className="city-impact">{c.impact}</p>
        </section>

        {issues.length > 0 && (
          <section className="city-sec">
            <h2 className="city-h" style={{ borderColor: c.accent }}>The Issues <span>go deep + weigh in</span></h2>
            <div className="issue-grid">
              {issues.map((it) => (
                <a key={it.slug} className="issue-card" href={`/city/${slug}/issue/${it.slug}`} style={{ borderTopColor: c.accent }}>
                  <h3>{it.title}</h3>
                  <p>{it.dek}</p>
                  <span className="issue-cta" style={{ color: c.accent }}>Read &amp; vote →</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="city-sec">
          <h2 className="city-h" style={{ borderColor: c.accent }}>Local News <span>{stories.length} stories</span></h2>
          {stories.length ? (
            <div className="grid">
              {stories.map((s) => (
                <a key={s.id} className="tile" href={`/s/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="tile-imgwrap">
                    {s.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="tile-img" src={s.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    ) : <div className="tile-fallback"><span className="seam" /></div>}
                    <div className="tile-badges"><span className="pill-topic">{s.topic}</span>{s.has_split && <span className="pill-split">Split</span>}</div>
                  </div>
                  <div className="tile-body">
                    <h3>{s.neutral_title}</h3>
                    <p className="tile-teaser">{s.neutral_body.slice(0, 140)}{s.neutral_body.length > 140 ? "…" : ""}</p>
                    <div className="tile-meta"><span>{s.sources.length} sources</span></div>
                  </div>
                </a>
              ))}
            </div>
          ) : <div className="empty">Local stories fill in as the newsroom runs.</div>}
        </section>

        {c.thingsToDo && (
        <section className="city-sec">
          <h2 className="city-h" style={{ borderColor: c.accent }}>Things to Do <span>local picks</span></h2>
          <div className="ttd-grid">
            {c.thingsToDo.map((g) => (
              <div className="ttd-col" key={g.group}>
                <h4 style={{ color: c.accent }}>{g.group}</h4>
                {g.items.map((it) => (
                  <div className="ttd-item" key={it.name}><b>{it.name}</b><span>{it.note}</span></div>
                ))}
              </div>
            ))}
          </div>
        </section>
        )}
      </main>

      <footer className="app">
        <div><strong style={{ color: "var(--ink-dim)" }}>Editions:</strong> <a href="/city/seattle">Seattle</a> · <a href="/city/sf">San Francisco</a> · <a href="/">National</a></div>
      </footer>
    </>
  );
}
